import asyncio
import logging
import uuid
from typing import List, Dict, Any
from harvester.db.database import CatalogDatabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CatalogSeeder")

SEED_BRANDS = [
    {"name": "Amul", "logo_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150"},
    {"name": "Mother Dairy", "logo_url": "https://images.unsplash.com/photo-1528751014936-863e6e7a319c"},
    {"name": "Aashirvaad", "logo_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c"},
    {"name": "Fortune", "logo_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5"},
    {"name": "Tata Consumer", "logo_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3"},
    {"name": "Nestle", "logo_url": "https://images.unsplash.com/photo-1582293041079-7814c2f12063"},
    {"name": "Haldiram", "logo_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087"},
    {"name": "Britannia", "logo_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35"},
    {"name": "Parle", "logo_url": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e"},
    {"name": "Surf Excel", "logo_url": "https://images.unsplash.com/photo-1585830810419-7ac6e280432e"},
]

SEED_CATEGORIES = [
    {"name": "Dairy & Breakfast", "slug": "dairy-breakfast"},
    {"name": "Staples & Atta", "slug": "staples-atta"},
    {"name": "Snacks & Munchies", "slug": "snacks-munchies"},
    {"name": "Beverages & Drinks", "slug": "beverages-drinks"},
    {"name": "Household & Cleaning", "slug": "household-cleaning"},
]

SEED_PRODUCTS = [
    {
        "gtin_barcode": "8901262010055",
        "brand_name": "Amul",
        "category_slug": "dairy-breakfast",
        "title": "Amul Pasteurised Salted Butter 500g",
        "normalized_title": "amul pasteurised salted butter 500g",
        "unit_size": "500 g",
        "description": "Amul Butter is made from wholesome fresh milk fat and contains no added preservatives.",
        "high_res_image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d",
        "listings": [
            {"platform": "ONDC_Seller_Node", "seller_item_id": "ondc_amul_butter_500g", "mrp": 275.0, "selling_price": 265.0, "pincode": "560038", "delivery_mins": 10},
            {"platform": "Blinkit", "seller_item_id": "bl_amul_butter_500g", "mrp": 275.0, "selling_price": 270.0, "pincode": "560038", "delivery_mins": 8},
            {"platform": "Zepto", "seller_item_id": "zp_amul_butter_500g", "mrp": 275.0, "selling_price": 268.0, "pincode": "560038", "delivery_mins": 7},
            {"platform": "Amazon", "seller_item_id": "B00N0W03R4", "mrp": 275.0, "selling_price": 260.0, "pincode": "560038", "delivery_mins": 120},
        ]
    },
    {
        "gtin_barcode": "8901725111227",
        "brand_name": "Aashirvaad",
        "category_slug": "staples-atta",
        "title": "Aashirvaad Whole Wheat Atta 5kg",
        "normalized_title": "aashirvaad whole wheat atta 5kg",
        "unit_size": "5 kg",
        "description": "Aashirvaad Whole Wheat Atta is made from superior 100% MP Sharbati wheat grains.",
        "high_res_image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c",
        "listings": [
            {"platform": "ONDC_Seller_Node", "seller_item_id": "ondc_aashirvaad_atta_5kg", "mrp": 260.0, "selling_price": 235.0, "pincode": "560038", "delivery_mins": 15},
            {"platform": "Zepto", "seller_item_id": "zp_aashirvaad_atta_5kg", "mrp": 260.0, "selling_price": 242.0, "pincode": "560038", "delivery_mins": 9},
            {"platform": "Amazon", "seller_item_id": "B01H52U264", "mrp": 260.0, "selling_price": 229.0, "pincode": "560038", "delivery_mins": 60},
        ]
    },
    {
        "gtin_barcode": "8901058852312",
        "brand_name": "Nestle",
        "category_slug": "snacks-munchies",
        "title": "Maggi 2-Minute Instant Masala Noodles 420g Pack of 6",
        "normalized_title": "maggi 2 minute instant masala noodles 420g",
        "unit_size": "420 g",
        "description": "Maggi 2-Minute Masala Noodles enriched with iron.",
        "high_res_image_url": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841",
        "listings": [
            {"platform": "ONDC_Seller_Node", "seller_item_id": "ondc_maggi_420g", "mrp": 96.0, "selling_price": 88.0, "pincode": "560038", "delivery_mins": 12},
            {"platform": "Blinkit", "seller_item_id": "bl_maggi_420g", "mrp": 96.0, "selling_price": 92.0, "pincode": "560038", "delivery_mins": 10},
            {"platform": "Flipkart", "seller_item_id": "FK_MAGGI_420G", "mrp": 96.0, "selling_price": 85.0, "pincode": "560038", "delivery_mins": 180},
        ]
    },
    {
        "gtin_barcode": "8901030001008",
        "brand_name": "Tata Consumer",
        "category_slug": "beverages-drinks",
        "title": "Tata Tea Premium Desh Ki Chai 500g",
        "normalized_title": "tata tea premium desh ki chai 500g",
        "unit_size": "500 g",
        "description": "Tata Tea Premium crafted with fine blend of tea leaves.",
        "high_res_image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3",
        "listings": [
            {"platform": "ONDC_Seller_Node", "seller_item_id": "ondc_tata_tea_500g", "mrp": 310.0, "selling_price": 275.0, "pincode": "560038", "delivery_mins": 15},
            {"platform": "Zepto", "seller_item_id": "zp_tata_tea_500g", "mrp": 310.0, "selling_price": 280.0, "pincode": "560038", "delivery_mins": 8},
        ]
    }
]

async def seed_database(db: CatalogDatabase):
    """Seed brands, categories, products, and listings into SQLModel DB."""
    logger.info("Starting database catalog seeding...")
    await db.initialize()

    # Seed Brands
    brand_map = {}
    for b in SEED_BRANDS:
        brand_obj = await db.get_or_create_brand(b["name"], b["logo_url"])
        brand_map[b["name"]] = brand_obj

    # Seed Categories
    cat_map = {}
    for c in SEED_CATEGORIES:
        cat_obj = await db.get_or_create_category(c["name"], c["slug"])
        cat_map[c["slug"]] = cat_obj

    # Seed Products & Listings
    for p in SEED_PRODUCTS:
        brand_obj = brand_map.get(p["brand_name"])
        cat_obj = cat_map.get(p["category_slug"])

        product_payload = {
            "gtin_barcode": p["gtin_barcode"],
            "title": p["title"],
            "normalized_title": p["normalized_title"],
            "unit_size": p["unit_size"],
            "description": p["description"],
            "high_res_image_url": p["high_res_image_url"]
        }

        created_prod = await db.upsert_canonical_product(product_payload)
        prod_id = created_prod["canonical_product_id"]

        for l in p["listings"]:
            listing_payload = {
                "canonical_product_id": prod_id,
                "platform": l["platform"],
                "platform_sku_id": l["seller_item_id"],
                "pincode": l["pincode"],
                "mrp": l["mrp"],
                "selling_price": l["selling_price"],
                "in_stock": 1,
                "estimated_delivery_minutes": l["delivery_mins"]
            }
            await db.upsert_platform_listing(listing_payload)

    stats = await db.get_stats()
    logger.info(f"Seeding completed successfully: {stats}")

if __name__ == "__main__":
    db = CatalogDatabase()
    asyncio.run(seed_database(db))
