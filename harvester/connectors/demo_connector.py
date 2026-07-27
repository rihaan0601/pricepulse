"""
Demo Data Connector
Generates realistic mock product data for all 5 Indian quick-commerce platforms.
Used for testing the full pipeline (matcher, price engine, basket splitter, API)
without requiring live API access.
"""

import uuid
import random
import logging
from typing import List, Dict, Any
from datetime import datetime, timezone

logger = logging.getLogger("DemoDataConnector")

# Platform delivery time estimates (minutes)
PLATFORM_DELIVERY = {
    "Blinkit": 10,
    "Zepto": 8,
    "Swiggy Instamart": 15,
    "Flipkart Minutes": 12,
    "Amazon Fresh": 25,
}

# Realistic Indian FMCG product catalog
DEMO_CATALOG: List[Dict[str, Any]] = [
    # ---- Dairy & Breakfast ----
    {"brand": "Amul", "title": "Amul Taaza Toned Fresh Milk", "unit": "500 ml", "category": ["Dairy", "Milk"], "gtin": "8901262010052", "base_mrp": 31},
    {"brand": "Amul", "title": "Amul Taaza Toned Fresh Milk", "unit": "1 L", "category": ["Dairy", "Milk"], "gtin": "8901262011301", "base_mrp": 60},
    {"brand": "Amul", "title": "Amul Gold Full Cream Milk", "unit": "500 ml", "category": ["Dairy", "Milk"], "gtin": "8901262150286", "base_mrp": 35},
    {"brand": "Amul", "title": "Amul Butter", "unit": "500 g", "category": ["Dairy", "Butter"], "gtin": "8901262001014", "base_mrp": 280},
    {"brand": "Amul", "title": "Amul Cheese Slices", "unit": "200 g", "category": ["Dairy", "Cheese"], "gtin": "8901262152020", "base_mrp": 120},
    {"brand": "Mother Dairy", "title": "Mother Dairy Classic Curd", "unit": "400 g", "category": ["Dairy", "Curd"], "gtin": "8906002480011", "base_mrp": 35},
    {"brand": "Mother Dairy", "title": "Mother Dairy Full Cream Milk", "unit": "1 L", "category": ["Dairy", "Milk"], "gtin": "8906002480035", "base_mrp": 68},
    {"brand": "Amul", "title": "Amul Masti Dahi", "unit": "400 g", "category": ["Dairy", "Curd"], "gtin": "8901262155700", "base_mrp": 30},
    {"brand": "Britannia", "title": "Britannia Winkin Cow Cheese Slices", "unit": "200 g", "category": ["Dairy", "Cheese"], "gtin": "8901063090200", "base_mrp": 110},
    {"brand": "Nestle", "title": "Nestle Everyday Dairy Whitener", "unit": "400 g", "category": ["Dairy", "Whitener"], "gtin": "8901058855300", "base_mrp": 195},

    # ---- Staples ----
    {"brand": "Tata", "title": "Tata Salt", "unit": "1 kg", "category": ["Staples", "Salt"], "gtin": "8901725181000", "base_mrp": 28},
    {"brand": "Aashirvaad", "title": "Aashirvaad Shudh Chakki Atta", "unit": "5 kg", "category": ["Staples", "Atta"], "gtin": "8901058852327", "base_mrp": 290},
    {"brand": "Aashirvaad", "title": "Aashirvaad Multigrain Atta", "unit": "5 kg", "category": ["Staples", "Atta"], "gtin": "8901058853300", "base_mrp": 340},
    {"brand": "Fortune", "title": "Fortune Chakki Fresh Atta", "unit": "5 kg", "category": ["Staples", "Atta"], "gtin": "8901058001815", "base_mrp": 275},
    {"brand": "Fortune", "title": "Fortune Sunlite Refined Sunflower Oil", "unit": "1 L", "category": ["Staples", "Oil"], "gtin": "8901058001785", "base_mrp": 145},
    {"brand": "Fortune", "title": "Fortune Rice Bran Health Oil", "unit": "1 L", "category": ["Staples", "Oil"], "gtin": "8901058001792", "base_mrp": 165},
    {"brand": "India Gate", "title": "India Gate Basmati Rice Classic", "unit": "1 kg", "category": ["Staples", "Rice"], "gtin": "8901725181100", "base_mrp": 125},
    {"brand": "Tata", "title": "Tata Sampann Toor Dal", "unit": "1 kg", "category": ["Staples", "Dal"], "gtin": "8901725182100", "base_mrp": 160},
    {"brand": "Tata", "title": "Tata Sampann Moong Dal", "unit": "1 kg", "category": ["Staples", "Dal"], "gtin": "8901725183100", "base_mrp": 175},

    # ---- Snacks & Biscuits ----
    {"brand": "Lay's", "title": "Lay's Classic Salted Potato Chips", "unit": "52 g", "category": ["Snacks", "Chips"], "gtin": "8901491101950", "base_mrp": 20},
    {"brand": "Lay's", "title": "Lay's Magic Masala Chips", "unit": "52 g", "category": ["Snacks", "Chips"], "gtin": "8901491101967", "base_mrp": 20},
    {"brand": "Kurkure", "title": "Kurkure Masala Munch", "unit": "94 g", "category": ["Snacks", "Namkeen"], "gtin": "8901491102100", "base_mrp": 20},
    {"brand": "Haldiram's", "title": "Haldiram's Aloo Bhujia", "unit": "400 g", "category": ["Snacks", "Namkeen"], "gtin": "8904063200013", "base_mrp": 130},
    {"brand": "Haldiram's", "title": "Haldiram's Moong Dal", "unit": "200 g", "category": ["Snacks", "Namkeen"], "gtin": "8904063200020", "base_mrp": 65},
    {"brand": "Britannia", "title": "Britannia Good Day Butter Cookies", "unit": "600 g", "category": ["Snacks", "Biscuits"], "gtin": "8901063092600", "base_mrp": 115},
    {"brand": "Parle", "title": "Parle-G Gold Biscuits", "unit": "1 kg", "category": ["Snacks", "Biscuits"], "gtin": "8904063100013", "base_mrp": 120},
    {"brand": "Britannia", "title": "Britannia Marie Gold Biscuits", "unit": "600 g", "category": ["Snacks", "Biscuits"], "gtin": "8901063093600", "base_mrp": 95},
    {"brand": "Cadbury", "title": "Cadbury Dairy Milk Silk", "unit": "150 g", "category": ["Snacks", "Chocolate"], "gtin": "8901233028150", "base_mrp": 180},
    {"brand": "Cadbury", "title": "Cadbury Dairy Milk", "unit": "110 g", "category": ["Snacks", "Chocolate"], "gtin": "8901233020110", "base_mrp": 80},

    # ---- Beverages ----
    {"brand": "Bisleri", "title": "Bisleri Mineral Water", "unit": "1 L", "category": ["Beverages", "Water"], "gtin": "8901063171000", "base_mrp": 22},
    {"brand": "Red Label", "title": "Brooke Bond Red Label Tea", "unit": "500 g", "category": ["Beverages", "Tea"], "gtin": "8901030600500", "base_mrp": 260},
    {"brand": "Tata", "title": "Tata Tea Gold", "unit": "500 g", "category": ["Beverages", "Tea"], "gtin": "8901725183500", "base_mrp": 310},
    {"brand": "Nescafe", "title": "Nescafe Classic Instant Coffee", "unit": "100 g", "category": ["Beverages", "Coffee"], "gtin": "8901058855100", "base_mrp": 295},
    {"brand": "Bru", "title": "Bru Instant Coffee", "unit": "100 g", "category": ["Beverages", "Coffee"], "gtin": "8901030500100", "base_mrp": 260},
    {"brand": "Coca-Cola", "title": "Coca-Cola Original Taste", "unit": "750 ml", "category": ["Beverages", "Soft Drinks"], "gtin": "8901765010750", "base_mrp": 42},
    {"brand": "Thums Up", "title": "Thums Up Charged", "unit": "750 ml", "category": ["Beverages", "Soft Drinks"], "gtin": "8901765020750", "base_mrp": 42},
    {"brand": "Real", "title": "Real Fruit Power Mixed Fruit Juice", "unit": "1 L", "category": ["Beverages", "Juice"], "gtin": "8901396511000", "base_mrp": 110},
    {"brand": "Tropicana", "title": "Tropicana 100% Orange Juice", "unit": "1 L", "category": ["Beverages", "Juice"], "gtin": "8901396521000", "base_mrp": 120},

    # ---- Instant Food ----
    {"brand": "Maggi", "title": "Maggi 2-Minute Masala Noodles", "unit": "280 g (4-pack)", "category": ["Instant Food", "Noodles"], "gtin": "8901058810280", "base_mrp": 56},
    {"brand": "Yippee", "title": "Sunfeast Yippee Noodles Magic Masala", "unit": "280 g (4-pack)", "category": ["Instant Food", "Noodles"], "gtin": "8901063252280", "base_mrp": 52},
    {"brand": "Kissan", "title": "Kissan Fresh Tomato Ketchup", "unit": "500 g", "category": ["Instant Food", "Sauce"], "gtin": "8901030370500", "base_mrp": 115},
    {"brand": "MTR", "title": "MTR Ready To Eat Rajma Masala", "unit": "300 g", "category": ["Instant Food", "Ready to Eat"], "gtin": "8901042710300", "base_mrp": 90},

    # ---- Personal Care ----
    {"brand": "Colgate", "title": "Colgate MaxFresh Blue Gel Toothpaste", "unit": "150 g", "category": ["Personal Care", "Oral Care"], "gtin": "8901314301505", "base_mrp": 107},
    {"brand": "Dettol", "title": "Dettol Original Soap", "unit": "125 g", "category": ["Personal Care", "Soap"], "gtin": "8901396311250", "base_mrp": 50},
    {"brand": "Dove", "title": "Dove Cream Beauty Bathing Bar", "unit": "125 g", "category": ["Personal Care", "Soap"], "gtin": "8901030512125", "base_mrp": 62},
    {"brand": "Head & Shoulders", "title": "Head & Shoulders Cool Menthol Shampoo", "unit": "340 ml", "category": ["Personal Care", "Shampoo"], "gtin": "8001090609342", "base_mrp": 325},
    {"brand": "Himalaya", "title": "Himalaya Neem Face Wash", "unit": "200 ml", "category": ["Personal Care", "Face Wash"], "gtin": "8901138834200", "base_mrp": 215},

    # ---- Household ----
    {"brand": "Surf Excel", "title": "Surf Excel Matic Front Load Detergent", "unit": "2 kg", "category": ["Household", "Detergent"], "gtin": "8901030812000", "base_mrp": 530},
    {"brand": "Vim", "title": "Vim Dishwash Liquid Gel Lemon", "unit": "500 ml", "category": ["Household", "Dishwash"], "gtin": "8901030022500", "base_mrp": 119},
    {"brand": "Harpic", "title": "Harpic Powerplus Toilet Cleaner", "unit": "500 ml", "category": ["Household", "Cleaner"], "gtin": "8901396431500", "base_mrp": 99},
    {"brand": "Good Knight", "title": "Good Knight Gold Flash Liquid", "unit": "45 ml", "category": ["Household", "Insecticide"], "gtin": "8901396431045", "base_mrp": 79},
]


class DemoDataConnector:
    """
    Generates realistic mock product listings across all 5 platforms.
    Simulates real-world pricing variance, stock availability, and delivery estimates.
    """

    PLATFORMS = ["Blinkit", "Zepto", "Swiggy Instamart", "Flipkart Minutes", "Amazon Fresh"]

    @classmethod
    def generate_full_catalog(cls, pincode: str = "560038") -> List[Dict[str, Any]]:
        """
        Generates realistic multi-platform product listings for the entire demo catalog.
        Each product gets listings on 3-5 platforms with realistic price variance.
        """
        all_products = []
        now = datetime.now(timezone.utc).isoformat()

        for item in DEMO_CATALOG:
            canonical_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{item['brand']}:{item['title']}:{item['unit']}"))

            # Decide how many platforms carry this product (3-5)
            num_platforms = random.randint(3, 5)
            platforms = random.sample(cls.PLATFORMS, num_platforms)

            listings = []
            for platform in platforms:
                mrp = item["base_mrp"]
                # Realistic discount variance: 0-18% off MRP, varies by platform
                discount_pct = round(random.uniform(0, 18), 1)
                selling_price = round(mrp * (1 - discount_pct / 100), 2)

                # Stock availability: ~90% chance in stock
                in_stock = random.random() < 0.90

                listings.append({
                    "platform": platform,
                    "platform_sku_id": f"{platform.lower().replace(' ', '_')}_{random.randint(100000, 999999)}",
                    "mrp": mrp,
                    "selling_price": selling_price,
                    "discount_percentage": discount_pct,
                    "in_stock": in_stock,
                    "estimated_delivery_minutes": PLATFORM_DELIVERY.get(platform, 15),
                    "pincode": pincode,
                    "image_url": f"https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
                    "deep_link": "",
                })

            product = {
                "canonical_product_id": canonical_id,
                "gtin_barcode": item.get("gtin"),
                "brand": item["brand"],
                "title": f"{item['title']} {item['unit']}",
                "normalized_title": f"{item['brand'].lower()} {item['title'].lower()} {item['unit'].lower()}",
                "unit_size": item["unit"],
                "category_path": item["category"],
                "high_res_images": [
                    {"source": "Demo", "url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800", "local_path": ""}
                ],
                "platform_listings": listings,
                "last_updated_utc": now,
            }

            all_products.append(product)

        logger.info(f"Generated {len(all_products)} demo products with {sum(len(p['platform_listings']) for p in all_products)} platform listings")
        return all_products

    @classmethod
    def get_product_by_barcode(cls, barcode: str) -> Dict[str, Any] | None:
        """Look up a demo product by its GTIN barcode."""
        for item in DEMO_CATALOG:
            if item.get("gtin") == barcode:
                products = cls.generate_full_catalog()
                for p in products:
                    if p["gtin_barcode"] == barcode:
                        return p
        return None
