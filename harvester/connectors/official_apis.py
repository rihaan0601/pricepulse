import asyncio
import logging
from typing import Dict, List, Any
import urllib.parse

logger = logging.getLogger(__name__)

class AmazonConnector:
    """Official Amazon E-commerce API Connector (Mocked PA-API 5.0)"""

    async def search_items(self, query: str) -> List[Dict[str, Any]]:
        """Simulates PA-API 5.0 / Creators API response."""
        logger.info(f"Searching Amazon for query: {query}")
        await asyncio.sleep(0.5)
        return [
            {
                "asin": "B08N5WRWNW",
                "title": f"Amazon Basics {query}",
                "brand": "Amazon Basics",
                "mrp": 999.0,
                "selling_price": 799.0,
                "image_url": "https://m.media-amazon.com/images/I/example.jpg",
                "availability": "IN_STOCK"
            }
        ]

    def generate_multi_asin_cart_url(self, items: List[Dict[str, Any]], affiliate_tag: str = "pricepulse-21") -> str:
        """Constructs official Amazon multi-item cart URL."""
        base_url = "https://www.amazon.in/gp/aws/cart/add.html?"
        params = []
        for i, item in enumerate(items, start=1):
            asin = item.get("asin")
            qty = item.get("quantity", 1)
            params.append(f"ASIN.{i}={asin}&Quantity.{i}={qty}")
        
        params.append(f"tag={affiliate_tag}")
        query_string = "&".join(params)
        return f"{base_url}{query_string}"

    def generate_deep_link(self, asin: str, affiliate_tag: str = "pricepulse-21") -> str:
        """Generates deep link for an Amazon ASIN."""
        return f"https://www.amazon.in/dp/{asin}?tag={affiliate_tag}"


class FlipkartConnector:
    """Official Flipkart E-commerce API Connector (Mocked Affiliate API)"""

    async def search_items(self, query: str) -> List[Dict[str, Any]]:
        """Simulates Flipkart Affiliate API response."""
        logger.info(f"Searching Flipkart for query: {query}")
        await asyncio.sleep(0.5)
        return [
            {
                "product_id": "MOBGZJ9G7XXZ2QZW",
                "title": f"Flipkart SmartBuy {query}",
                "brand": "Flipkart SmartBuy",
                "mrp": 1299.0,
                "selling_price": 999.0,
                "image_url": "https://rukminim2.flixcart.com/image/example.jpg",
                "stock_status": "IN_STOCK"
            }
        ]

    def generate_deep_link(self, product_id: str, affiliate_id: str = "pricepulse") -> str:
        """Generates deep link for a Flipkart product."""
        return f"https://www.flipkart.com/product/p/itm?pid={product_id}&affid={affiliate_id}"
