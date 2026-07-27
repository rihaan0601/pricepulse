"""
Compliant Q-Commerce Aggregator, ONDC Buyer Node, & Smart Cart Engine — FastAPI Server
========================================================================================
Full legally compliant FastAPI backend using:
1. ONDC Beckn Protocol (BAP) for hyperlocal quick-commerce catalog discovery & native checkout.
2. Official Marketplace APIs (Amazon Creators API / Flipkart Affiliate) for general e-commerce.
3. GTIN/Barcode databases (Open Food Facts) for cross-platform product matching.
4. Smart Basket Partitioning with ONDC Native Checkout and Universal Deep Links.

Endpoints:
- POST /api/v1/search                    : Search ONDC BAP + Amazon + Flipkart simultaneously
- POST /api/v1/basket/split-and-route    : Partition basket into ONDC Native, Amazon Multi-ASIN, & Deep Links
- POST /api/v1/ondc/select               : ONDC Beckn /select payload generator
- POST /api/v1/ondc/init                 : ONDC Beckn /init payload generator
- POST /api/v1/ondc/confirm              : ONDC Beckn /confirm payload generator
- GET  /api/v1/gtin/{barcode}            : GTIN lookup via Open Food Facts
"""

import asyncio
import logging
import sys
import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uvicorn
from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from harvester.db.database import CatalogDatabase
from harvester.workers.price_alert_worker import PriceAlertWorker, PriceAlertConfig
from harvester.cache.redis_cache import RedisCacheLayer

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from harvester.connectors.ondc_bap import ONDCBapConnector
from harvester.connectors.official_apis import AmazonConnector, FlipkartConnector
from harvester.core.gtin_resolver import GTINResolver
from harvester.core.product_matcher import ProductMatcher
from harvester.core.basket_engine import SmartBasketEngine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("CompliantQCommerceEngine")

# Global Services
db = CatalogDatabase()
cache = RedisCacheLayer(redis_url=os.getenv('REDIS_URL', 'redis://localhost:6379/0'))
alert_worker = PriceAlertWorker(db=db)
worker_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global worker_task
    # Startup
    await db.initialize()
    await cache.connect()
    worker_task = asyncio.create_task(alert_worker.run_loop())
    yield
    # Shutdown
    if worker_task:
        worker_task.cancel()
    await cache.close()

app = FastAPI(
    title="Compliant Q-Commerce Aggregator & ONDC Buyer Node API",
    description=(
        "Legally compliant FastAPI backend integrating ONDC Beckn Protocol (BAP), "
        "Official Amazon PA-API, Flipkart Affiliate API, Open Food Facts GTIN resolution, "
        "and Smart Multi-Platform Basket Routing."
    ),
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Services
ondc_bap = ONDCBapConnector()
amazon_api = AmazonConnector()
flipkart_api = FlipkartConnector()
gtin_resolver = GTINResolver()
matcher = ProductMatcher()
basket_engine = SmartBasketEngine()


# Request/Response Schemas
class SearchRequest(BaseModel):
    query: str = Field(..., example="amul butter")
    latitude: float = Field(default=12.9784, example=12.9784)
    longitude: float = Field(default=77.6408, example=77.6408)
    pincode: str = Field(default="560038", example="560038")


class BasketItemRequest(BaseModel):
    query: str = Field(..., example="amul butter 500g")
    quantity: int = Field(default=1, example=1)
    platform_hint: Optional[str] = Field(default=None, example="ONDC")


class SplitBasketRequest(BaseModel):
    items: List[BasketItemRequest]
    pincode: str = Field(default="560038", example="560038")
    latitude: float = Field(default=12.9784, example=12.9784)
    longitude: float = Field(default=77.6408, example=77.6408)


class OndcSelectRequest(BaseModel):
    provider_id: str = Field(..., example="provider_ondc_kirana_01")
    items: List[Dict[str, Any]]
    pincode: str = Field(default="560038")
    latitude: float = Field(default=12.9784)
    longitude: float = Field(default=77.6408)


class OndcInitRequest(BaseModel):
    provider_id: str = Field(..., example="provider_ondc_kirana_01")
    items: List[Dict[str, Any]]
    billing_info: Dict[str, Any]
    delivery_address: Dict[str, Any]


class OndcConfirmRequest(BaseModel):
    order_id: str = Field(..., example="order_ondc_123456")
    provider_id: str = Field(..., example="provider_ondc_kirana_01")
    items: List[Dict[str, Any]]
    payment_transaction_id: str = Field(..., example="tx_upi_987654321")


@app.get("/")
async def root():
    return {
        "status": "online",
        "engine": "Compliant Q-Commerce Aggregator & ONDC Buyer Node v3.0",
        "beckn_protocol": "v1.2.0 (Grocery/Q-Commerce nic2004:52110)",
        "api_docs": "/docs",
        "endpoints": [
            "POST /api/v1/search",
            "POST /api/v1/basket/split-and-route",
            "POST /api/v1/ondc/select",
            "POST /api/v1/ondc/init",
            "POST /api/v1/ondc/confirm",
            "GET  /api/v1/gtin/{barcode}"
        ]
    }


@app.post("/api/v1/search")
async def search_catalog(payload: SearchRequest):
    """
    Simultaneously queries ONDC Beckn Protocol BAP (/search), Amazon PA-API, and Flipkart Affiliate API.
    Resolves GTIN barcodes, normalizes items, and matches them into unified canonical products.
    """
    logger.info(f"Received search query: '{payload.query}' for pincode {payload.pincode}")

    # Query all 3 legitimate data channels concurrently
    ondc_task = ondc_bap.search(
        query=payload.query,
        lat=payload.latitude,
        lng=payload.longitude,
        pincode=payload.pincode
    )
    amazon_task = asyncio.to_thread(amazon_api.search_items, payload.query)
    flipkart_task = asyncio.to_thread(flipkart_api.search_items, payload.query)

    ondc_res, amazon_res, flipkart_res = await asyncio.gather(
        ondc_task, amazon_task, flipkart_task, return_exceptions=True
    )

    raw_items = []
    if isinstance(ondc_res, dict) and "items" in ondc_res:
        raw_items.extend(ondc_res["items"])
    if isinstance(amazon_res, list):
        raw_items.extend(amazon_res)
    if isinstance(flipkart_res, list):
        raw_items.extend(flipkart_res)

    # Perform canonical product matching
    canonical_products = matcher.match_catalog_items(raw_items)

    return {
        "query": payload.query,
        "location": {
            "pincode": payload.pincode,
            "latitude": payload.latitude,
            "longitude": payload.longitude
        },
        "channels_queried": ["ONDC_BECKN_BAP", "AMAZON_CREATORS_API", "FLIPKART_AFFILIATE_API"],
        "total_canonical_products": len(canonical_products),
        "total_raw_listings": len(raw_items),
        "products": canonical_products
    }


@app.post("/api/v1/basket/split-and-route")
async def split_and_route_basket(payload: SplitBasketRequest):
    """
    Partitions a multi-item recommended shopping list into optimal vendor buckets:
    1. ONDC Native Checkout Payload (for in-app completion via Beckn protocol)
    2. Multi-ASIN Amazon Cart Link (`https://www.amazon.in/gp/aws/cart/add.html?ASIN.1=...`)
    3. Universal Deep Links for Flipkart / external platforms.
    """
    logger.info(f"Processing basket routing for {len(payload.items)} items in pincode {payload.pincode}")

    items_list = [{"query": item.query, "quantity": item.quantity, "platform_hint": item.platform_hint} for item in payload.items]

    partitioned_result = await basket_engine.split_and_route_basket(
        items=items_list,
        pincode=payload.pincode,
        lat=payload.latitude,
        lng=payload.longitude
    )

    return partitioned_result


@app.post("/api/v1/ondc/select")
async def ondc_select(payload: OndcSelectRequest):
    """
    Triggers ONDC Beckn /select lifecycle step to confirm item availability and calculate delivery fees.
    """
    result = await ondc_bap.select_item(
        provider_id=payload.provider_id,
        items=payload.items,
        pincode=payload.pincode,
        lat=payload.latitude,
        lng=payload.longitude
    )
    return result


@app.post("/api/v1/ondc/init")
async def ondc_init(payload: OndcInitRequest):
    """
    Triggers ONDC Beckn /init lifecycle step to initialize customer billing/delivery session.
    """
    result = await ondc_bap.init_checkout(
        provider_id=payload.provider_id,
        items=payload.items,
        billing=payload.billing_info,
        delivery_address=payload.delivery_address
    )
    return result


@app.post("/api/v1/ondc/confirm")
async def ondc_confirm(payload: OndcConfirmRequest):
    """
    Triggers ONDC Beckn /confirm lifecycle step after payment verification to finalize order.
    """
    result = await ondc_bap.confirm_order(
        order_id=payload.order_id,
        provider_id=payload.provider_id,
        items=payload.items,
        payment_transaction_id=payload.payment_transaction_id
    )
    return result


@app.get("/api/v1/gtin/{gtin_barcode}")
async def resolve_gtin(gtin_barcode: str):
    """
    Queries Open Food Facts API to resolve barcode metadata and high-res imagery.
    """
    gtin_data = await gtin_resolver.resolve_gtin(gtin_barcode)
    if not gtin_data:
        raise HTTPException(status_code=404, detail=f"GTIN barcode '{gtin_barcode}' not found in Open Food Facts registry")
    return gtin_data

@app.get("/api/v1/price-history/{canonical_id}")
async def get_price_history(canonical_id: str, platform: str = None, days: int = 30):
    """Get price history for a canonical product."""
    history = await db.get_price_history(canonical_id, platform)
    return {"canonical_product_id": canonical_id, "history": history}

@app.get("/api/v1/stats")
async def get_catalog_stats():
    """Get overall catalog statistics: product count, listing count, platform breakdown."""
    stats = await db.get_stats()
    return stats

@app.post("/api/v1/alerts")
async def create_price_alert(alert: PriceAlertConfig):
    """Create a new price alert."""
    await alert_worker.add_alert(alert)
    return {"status": "success", "alert_id": alert.alert_id}

@app.get("/api/v1/alerts/{user_id}")
async def get_user_alerts(user_id: str):
    """Get all alerts for a user."""
    alerts = await db.get_user_alerts(user_id)
    return alerts

@app.delete("/api/v1/alerts/{alert_id}")
async def delete_alert(alert_id: str):
    """Delete/deactivate an alert."""
    await alert_worker.remove_alert(alert_id)
    return {"status": "success", "alert_id": alert_id}

@app.get("/api/v1/health")
async def health_check():
    """System health check with uptime, db status, cache status."""
    return {
        "status": "healthy",
        "cache_type": "redis" if cache.use_redis else "memory",
        "worker_running": worker_task is not None and not worker_task.done()
    }


if __name__ == "__main__":
    uvicorn.run("harvester.main:app", host="0.0.0.0", port=8000, reload=True)
