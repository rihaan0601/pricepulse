import asyncio
import os
import sys
import json
import logging

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("HarvestImagesCLI")

from harvester.assets.manager import AssetHarvestManager

DEMO_PRODUCTS = [
    {
        "product_id": "sku_101",
        "brand": "Amul",
        "title": "Amul Taaza Toned Fresh Milk 1 L",
        "gtin_barcode": "8901262010052",
        "platform_images": [
            {
                "platform": "Blinkit",
                "url": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop"
            },
            {
                "platform": "Zepto",
                "url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=250&q=70"
            },
            {
                "platform": "Instamart",
                "url": "https://images.unsplash.com/photo-1563636619-e9143da7973b?tr=w-300,h-300"
            }
        ]
    },
    {
        "product_id": "sku_102",
        "brand": "Aashirvaad",
        "title": "Aashirvaad Shudh Chakki Atta 5 kg",
        "gtin_barcode": "8901058852327",
        "platform_images": [
            {
                "platform": "Flipkart Minutes",
                "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&q=60"
            },
            {
                "platform": "Amazon Fresh",
                "url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&fit=crop"
            }
        ]
    }
]

async def run():
    logger.info("==========================================================================")
    logger.info("  HIGH-RESOLUTION PRODUCT IMAGE HARVESTER & ASSET MANAGER CLI")
    logger.info("==========================================================================")

    manager = AssetHarvestManager(base_download_dir="downloads")

    for prod in DEMO_PRODUCTS:
        metadata = await manager.process_product(
            product_id=prod["product_id"],
            brand=prod["brand"],
            title=prod["title"],
            platform_images=prod["platform_images"],
            gtin_barcode=prod["gtin_barcode"]
        )

        print("\n--- GENERATED SIDECAR METADATA JSON ---")
        print(json.dumps(metadata, indent=2))
        print("----------------------------------------\n")

if __name__ == "__main__":
    asyncio.run(run())
