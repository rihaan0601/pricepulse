import logging
import asyncio
from typing import List, Dict, Any
from harvester.connectors.official_apis import AmazonConnector, FlipkartConnector
from harvester.connectors.ondc_bap import ONDCBapConnector

logger = logging.getLogger("SmartBasketEngine")

class SmartBasketEngine:
    """
    Engine to partition basket items and route to multiple providers
    like ONDC, Amazon, or Flipkart.
    """
    
    def __init__(self):
        self.amazon_api = AmazonConnector()
        self.flipkart_api = FlipkartConnector()
        self.ondc_bap = ONDCBapConnector()

    async def split_and_route_basket(
        self, items: List[Dict[str, Any]], pincode: str, lat: float, lng: float
    ) -> Dict[str, Any]:
        """
        Partitions items into vendor buckets for optimal checkout:
        1. ONDC Beckn Native Checkout Payload
        2. Amazon Multi-ASIN Cart Link
        3. Flipkart Deep Links
        """
        ondc_items = []
        amazon_items = []
        flipkart_items = []
        
        grand_total = 0.0
        total_savings = 0.0

        for item in items:
            query = item.get("query", item.get("title", ""))
            qty = int(item.get("quantity", item.get("qty", 1)))
            platform_hint = (item.get("platform_hint") or "").upper()

            # Default routing rule: assign grocery / fresh to ONDC native, general items to Amazon/Flipkart
            if platform_hint == "AMAZON" or "amazon" in query.lower():
                asin = f"B0{abs(hash(query)) % 100000000:08d}"
                amazon_items.append({
                    "asin": asin,
                    "title": query.title(),
                    "quantity": qty,
                    "price": 120.0 * qty,
                    "mrp": 140.0 * qty
                })
            elif platform_hint == "FLIPKART" or "flipkart" in query.lower():
                pid = f"ITM{abs(hash(query)) % 100000000:08d}"
                flipkart_items.append({
                    "product_id": pid,
                    "title": query.title(),
                    "quantity": qty,
                    "price": 110.0 * qty,
                    "mrp": 130.0 * qty
                })
            else:
                ondc_items.append({
                    "item_id": f"item_{abs(hash(query)) % 10000:04d}",
                    "title": query.title(),
                    "quantity": qty,
                    "price": 60.0 * qty,
                    "mrp": 65.0 * qty
                })

        partitions = []

        # 1. ONDC Native Checkout Session Payload
        if ondc_items:
            subtotal = sum(i["price"] for i in ondc_items)
            mrp_total = sum(i["mrp"] for i in ondc_items)
            grand_total += subtotal
            total_savings += (mrp_total - subtotal)

            select_payload = await self.ondc_bap.select_item(
                provider_id="provider_ondc_kirana_01",
                items=ondc_items,
                pincode=pincode,
                lat=lat,
                lng=lng
            )

            partitions.append({
                "channel": "ONDC_NATIVE",
                "provider_name": "ONDC QuickStore (Dunzo/Kirana)",
                "fulfillment_time": "10 mins",
                "subtotal": round(subtotal, 2),
                "items": ondc_items,
                "checkout_payload": select_payload
            })

        # 2. Amazon Multi-ASIN Cart Link
        if amazon_items:
            subtotal = sum(i["price"] for i in amazon_items)
            mrp_total = sum(i["mrp"] for i in amazon_items)
            grand_total += subtotal
            total_savings += (mrp_total - subtotal)

            cart_url = self.amazon_api.generate_multi_asin_cart_url(amazon_items)

            partitions.append({
                "channel": "AMAZON_MULTI_ASIN",
                "provider_name": "Amazon Fresh",
                "subtotal": round(subtotal, 2),
                "items": amazon_items,
                "multi_asin_cart_url": cart_url
            })

        # 3. Flipkart Affiliate Deep Links
        if flipkart_items:
            subtotal = sum(i["price"] for i in flipkart_items)
            mrp_total = sum(i["mrp"] for i in flipkart_items)
            grand_total += subtotal
            total_savings += (mrp_total - subtotal)

            deep_links = []
            for fi in flipkart_items:
                link = self.flipkart_api.generate_deep_link(fi["product_id"])
                deep_links.append({
                    "title": fi["title"],
                    "link": link
                })

            partitions.append({
                "channel": "FLIPKART_DEEP_LINK",
                "provider_name": "Flipkart",
                "subtotal": round(subtotal, 2),
                "items": flipkart_items,
                "deep_links": deep_links
            })

        return {
            "pincode": pincode,
            "location": {"latitude": lat, "longitude": lng},
            "grand_total": round(grand_total, 2),
            "total_savings": round(total_savings, 2),
            "partitions": partitions
        }
