import asyncio
import logging
import json
import random
import uuid
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from harvester.db.database import CatalogDatabase

try:
    from harvester.core.matcher import PlatformListing, CanonicalProduct, CrossPlatformMatcher
    from harvester.core.price_engine import PriceComparisonEngine
    from harvester.core.basket_splitter import BasketSplitter
    from harvester.core.deeplink_generator import DeepLinkGenerator
    CORE_AVAILABLE = True
except ImportError:
    CORE_AVAILABLE = False
    logging.warning("Core modules not available. Using fallback mock implementations.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Quick Commerce AI Engine API",
    description="API for multi-platform price comparison, basket splitting, and catalog search.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = CatalogDatabase('pricepulse_catalog.db')

class BasketItem(BaseModel):
    query: str
    qty: int

class CompareBasketRequest(BaseModel):
    items: List[BasketItem]
    pincode: Optional[str] = None

class OptimizeCartRequest(BaseModel):
    items: List[BasketItem]
    mode: str = "cheapest"
    pincode: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    """Initialize DB and load demo data."""
    logger.info("Initializing database...")
    await db.initialize()
    logger.info("Loading demo catalog...")
    await _load_demo_catalog()

@app.get("/")
async def root():
    """Welcome message."""
    return {"message": "Welcome to the Quick Commerce AI Engine API. See /docs for API documentation."}

@app.get("/api/v1/search")
async def search_products(q: str, pincode: Optional[str] = None):
    """Search products."""
    products = await db.search_products(q)
    return {"results": products}

@app.get("/api/v1/product/{canonical_product_id}")
async def get_product(canonical_product_id: str):
    """Get full product details."""
    product = await db.get_product(canonical_product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    history = await db.get_price_history(canonical_product_id)
    product["price_history"] = history
    return product

@app.post("/api/v1/compare-basket")
async def compare_basket(request: CompareBasketRequest):
    """Compare basket across platforms."""
    if not CORE_AVAILABLE:
        return {
            "status": "success",
            "message": "Mock basket comparison",
            "items": [item.dict() for item in request.items],
            "platforms": {
                "blinkit": {"total": 500},
                "swiggy": {"total": 520},
                "zepto": {"total": 510}
            }
        }
    
    # Place integration with real core modules here
    return {"status": "success", "message": "Core modules integrated", "items": [item.dict() for item in request.items]}

@app.post("/api/v1/optimize-cart")
async def optimize_cart(request: OptimizeCartRequest):
    """Optimize cart by mode (cheapest/fastest)."""
    if not CORE_AVAILABLE:
        return {
            "status": "success",
            "message": "Mock cart optimization",
            "mode": request.mode,
            "split": []
        }
    
    # Place integration with real core modules here
    return {"status": "success", "message": "Core modules integrated"}

@app.get("/api/v1/stats")
async def get_stats():
    """Get catalog statistics."""
    stats = await db.get_stats()
    return stats

@app.get("/api/v1/platforms")
async def get_platforms():
    """List of supported platforms."""
    return {
        "platforms": [
            {"id": "blinkit", "name": "Blinkit", "active": True},
            {"id": "swiggy", "name": "Swiggy Instamart", "active": True},
            {"id": "zepto", "name": "Zepto", "active": True},
            {"id": "bbnow", "name": "BB Now", "active": True}
        ]
    }

async def _load_demo_catalog():
    """Load demo products into DB."""
    demo_products = [
        {"title": "Amul Taaza Milk", "unit_size": "500ml", "brand": "Amul", "mrp": 27},
        {"title": "Amul Butter", "unit_size": "500g", "brand": "Amul", "mrp": 285},
        {"title": "Tata Salt", "unit_size": "1kg", "brand": "Tata", "mrp": 28},
        {"title": "Aashirvaad Atta", "unit_size": "5kg", "brand": "Aashirvaad", "mrp": 240},
        {"title": "Fortune Sunlite Oil", "unit_size": "1L", "brand": "Fortune", "mrp": 140},
        {"title": "Maggi Noodles 4-pack", "unit_size": "280g", "brand": "Maggi", "mrp": 56},
        {"title": "Cadbury Dairy Milk", "unit_size": "110g", "brand": "Cadbury", "mrp": 100},
        {"title": "Surf Excel Matic", "unit_size": "2kg", "brand": "Surf Excel", "mrp": 450},
        {"title": "Colgate MaxFresh", "unit_size": "150g", "brand": "Colgate", "mrp": 120},
        {"title": "Red Label Tea", "unit_size": "500g", "brand": "Brooke Bond", "mrp": 280},
        {"title": "Bisleri Water", "unit_size": "1L", "brand": "Bisleri", "mrp": 20},
        {"title": "Haldiram Bhujia", "unit_size": "400g", "brand": "Haldiram", "mrp": 110},
        {"title": "Good Day Butter Cookies", "unit_size": "600g", "brand": "Britannia", "mrp": 130},
        {"title": "Nestle Everyday Dairy Whitener", "unit_size": "400g", "brand": "Nestle", "mrp": 220},
        {"title": "Lays Classic Salted", "unit_size": "52g", "brand": "Lays", "mrp": 20},
        {"title": "Mother Dairy Dahi", "unit_size": "400g", "brand": "Mother Dairy", "mrp": 35},
        {"title": "Kissan Tomato Ketchup", "unit_size": "500g", "brand": "Kissan", "mrp": 135},
        {"title": "Parle-G Gold", "unit_size": "1kg", "brand": "Parle", "mrp": 90},
        {"title": "Nescafe Classic", "unit_size": "100g", "brand": "Nescafe", "mrp": 320},
        {"title": "Dettol Soap", "unit_size": "125g", "brand": "Dettol", "mrp": 55},
        {"title": "MTR Gulab Jamun Mix", "unit_size": "200g", "brand": "MTR", "mrp": 115},
        {"title": "Gowardhan Ghee", "unit_size": "1L", "brand": "Gowardhan", "mrp": 650},
        {"title": "Harpic Toilet Cleaner", "unit_size": "1L", "brand": "Harpic", "mrp": 199},
        {"title": "Lizol Surface Cleaner", "unit_size": "1L", "brand": "Lizol", "mrp": 215},
        {"title": "Lifebuoy Soap", "unit_size": "4x125g", "brand": "Lifebuoy", "mrp": 140},
        {"title": "Dove Shampoo", "unit_size": "340ml", "brand": "Dove", "mrp": 310},
        {"title": "Head & Shoulders", "unit_size": "340ml", "brand": "H&S", "mrp": 340},
        {"title": "Vim Dishwash Gel", "unit_size": "500ml", "brand": "Vim", "mrp": 115},
        {"title": "Exo Scrubber", "unit_size": "pack of 3", "brand": "Exo", "mrp": 45},
        {"title": "Godrej Aer Pocket", "unit_size": "10g", "brand": "Godrej", "mrp": 55},
        {"title": "Gatorade Blue Bolt", "unit_size": "500ml", "brand": "Gatorade", "mrp": 50},
        {"title": "Paper Boat Aamras", "unit_size": "250ml", "brand": "Paper Boat", "mrp": 35},
        {"title": "B Natural Mixed Fruit", "unit_size": "1L", "brand": "B Natural", "mrp": 110},
        {"title": "Real Fruit Juice", "unit_size": "1L", "brand": "Real", "mrp": 120},
        {"title": "Tang Orange", "unit_size": "500g", "brand": "Tang", "mrp": 160},
        {"title": "Glucon-D", "unit_size": "400g", "brand": "Glucon-D", "mrp": 145},
        {"title": "Horlicks", "unit_size": "500g", "brand": "Horlicks", "mrp": 260},
        {"title": "Bournvita", "unit_size": "500g", "brand": "Bournvita", "mrp": 240},
        {"title": "Oreo Biscuits", "unit_size": "120g", "brand": "Oreo", "mrp": 40},
        {"title": "Dark Fantasy Choco Fills", "unit_size": "75g", "brand": "Sunfeast", "mrp": 50},
        {"title": "Nutella", "unit_size": "350g", "brand": "Ferrero", "mrp": 380},
        {"title": "Patanjali Honey", "unit_size": "500g", "brand": "Patanjali", "mrp": 175},
        {"title": "Dabur Honey", "unit_size": "400g", "brand": "Dabur", "mrp": 210},
        {"title": "Kosh Oats", "unit_size": "500g", "brand": "Kosh", "mrp": 99},
        {"title": "Quaker Oats", "unit_size": "1kg", "brand": "Quaker", "mrp": 190},
        {"title": "Saffola Gold", "unit_size": "1L", "brand": "Saffola", "mrp": 160},
        {"title": "India Gate Basmati", "unit_size": "1kg", "brand": "India Gate", "mrp": 210},
        {"title": "Daawat Rozana", "unit_size": "1kg", "brand": "Daawat", "mrp": 95},
        {"title": "Aashirvaad Atta Multi Grain", "unit_size": "5kg", "brand": "Aashirvaad", "mrp": 290},
        {"title": "Madhur Sugar", "unit_size": "1kg", "brand": "Madhur", "mrp": 55}
    ]
    
    platforms = ["blinkit", "swiggy", "zepto"]
    
    # Check if data already exists to avoid duplicate work on every restart
    stats = await db.get_stats()
    if stats["products_count"] >= 50:
        return
        
    for p in demo_products:
        canonical_id = f"CP-{uuid.uuid4().hex[:8].upper()}"
        norm_title = p['title'].lower().replace(" ", "-")
        await db.upsert_canonical_product({
            "canonical_product_id": canonical_id,
            "brand": p['brand'],
            "title": p['title'],
            "normalized_title": norm_title,
            "unit_size": p['unit_size'],
            "category_path": json.dumps(["Grocery", p['brand']])
        })
        
        for plat in platforms:
            discount = random.uniform(0, 0.15)
            sp = round(p['mrp'] * (1 - discount), 2)
            await db.upsert_platform_listing({
                "canonical_product_id": canonical_id,
                "platform": plat,
                "platform_sku_id": f"{plat}-sku-{random.randint(1000, 9999)}",
                "mrp": p['mrp'],
                "selling_price": sp,
                "discount_percentage": round(discount * 100, 1),
                "in_stock": 1,
                "estimated_delivery_minutes": random.randint(10, 25),
                "pincode": "560038"
            })
            await db.record_price_history(
                canonical_id, plat, "560038", sp, p['mrp'], 1
            )
