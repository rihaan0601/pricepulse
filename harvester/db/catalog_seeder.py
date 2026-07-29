import asyncio
import logging
import random
import uuid
from typing import List, Dict, Any
from sqlmodel import Session, select
from harvester.db.database import CatalogDatabase
from harvester.db.models import Brand, Category, CanonicalProduct, PlatformListing

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
    {"name": "Ariel", "logo_url": "https://images.unsplash.com/photo-1584634731339-252c581abfc5"},
    {"name": "Tide", "logo_url": "https://images.unsplash.com/photo-1585830810419-7ac6e280432e"},
    {"name": "Colgate", "logo_url": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0"},
    {"name": "Sensodyne", "logo_url": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0"},
    {"name": "Dabur", "logo_url": "https://images.unsplash.com/photo-1608248597309-45da1747a394"},
    {"name": "Dettol", "logo_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae"},
    {"name": "Savlon", "logo_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae"},
    {"name": "Pampers", "logo_url": "https://images.unsplash.com/photo-1519689680058-324335c77eba"},
    {"name": "Hindustan Unilever", "logo_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03"},
    {"name": "Marico", "logo_url": "https://images.unsplash.com/photo-1608248597309-45da1747a394"},
    {"name": "Saffola", "logo_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5"},
    {"name": "Everest", "logo_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d"},
    {"name": "MDH", "logo_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d"},
    {"name": "Catch Spices", "logo_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d"},
    {"name": "Bikaji", "logo_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087"},
    {"name": "Lays", "logo_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b"},
    {"name": "Kurkure", "logo_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b"},
    {"name": "Bingo", "logo_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b"},
    {"name": "Doritos", "logo_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b"},
    {"name": "Oreo", "logo_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35"},
    {"name": "Cadbury", "logo_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55"},
    {"name": "Tropicana", "logo_url": "https://images.unsplash.com/photo-1613478223719-2ab802602423"},
    {"name": "Real Fruit Juice", "logo_url": "https://images.unsplash.com/photo-1613478223719-2ab802602423"},
    {"name": "Paper Boat", "logo_url": "https://images.unsplash.com/photo-1613478223719-2ab802602423"},
    {"name": "Coca Cola", "logo_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7"},
    {"name": "Pepsi", "logo_url": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e"},
    {"name": "Red Bull", "logo_url": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e"},
    {"name": "Nivea", "logo_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03"},
    {"name": "Dove", "logo_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03"},
    {"name": "Pantene", "logo_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d"},
    {"name": "Head & Shoulders", "logo_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d"},
    {"name": "Himalaya Herbals", "logo_url": "https://images.unsplash.com/photo-1608248597309-45da1747a394"},
    {"name": "Biotique", "logo_url": "https://images.unsplash.com/photo-1608248597309-45da1747a394"},
    {"name": "Gillette", "logo_url": "https://images.unsplash.com/photo-1585515320310-259814833e62"},
    {"name": "Samsung", "logo_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf"},
    {"name": "boAt", "logo_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"},
    {"name": "Noise", "logo_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"},
    {"name": "Portronics", "logo_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b"},
    {"name": "Philips", "logo_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b"},
    {"name": "Prestige", "logo_url": "https://images.unsplash.com/photo-1584992236310-6edddc08acff"},
    {"name": "Milton", "logo_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8"},
]

SEED_CATEGORIES = [
    {"name": "Dairy & Breakfast", "slug": "dairy-breakfast"},
    {"name": "Staples & Atta", "slug": "staples-atta"},
    {"name": "Snacks & Munchies", "slug": "snacks-munchies"},
    {"name": "Beverages & Drinks", "slug": "beverages-drinks"},
    {"name": "Household & Cleaning", "slug": "household-cleaning"},
    {"name": "Personal Care & Hygiene", "slug": "personal-care"},
    {"name": "Baby Care", "slug": "baby-care"},
    {"name": "Electronics & Accessories", "slug": "electronics"},
    {"name": "Kitchen & Home Needs", "slug": "kitchen-home"},
    {"name": "Fresh Fruits & Vegetables", "slug": "fresh-produce"},
]

CATEGORY_IMAGE_MAP = {
    "dairy-breakfast": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d",
    "staples-atta": "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    "snacks-munchies": "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
    "beverages-drinks": "https://images.unsplash.com/photo-1613478223719-2ab802602423",
    "household-cleaning": "https://images.unsplash.com/photo-1585830810419-7ac6e280432e",
    "personal-care": "https://images.unsplash.com/photo-1556228720-195a672e8a03",
    "baby-care": "https://images.unsplash.com/photo-1519689680058-324335c77eba",
    "electronics": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "kitchen-home": "https://images.unsplash.com/photo-1584992236310-6edddc08acff",
    "fresh-produce": "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
}

# Template definitions to generate 1,250+ realistic product SKUs
PRODUCT_TEMPLATES = [
    # Dairy & Breakfast
    {"category": "dairy-breakfast", "brand": "Amul", "item": "Pasteurised Salted Butter", "sizes": ["100g", "200g", "500g"], "base_mrp": 58.0},
    {"category": "dairy-breakfast", "brand": "Amul", "item": "Unsalted White Butter", "sizes": ["200g", "500g"], "base_mrp": 120.0},
    {"category": "dairy-breakfast", "brand": "Amul", "item": "Taaza Toned Fresh Milk", "sizes": ["500ml Pouch", "1L Tetra"], "base_mrp": 27.0},
    {"category": "dairy-breakfast", "brand": "Amul", "item": "Gold Full Cream Milk", "sizes": ["500ml Pouch", "1L Pouch"], "base_mrp": 33.0},
    {"category": "dairy-breakfast", "brand": "Amul", "item": "Masti Dahi Fresh Curd", "sizes": ["200g Cup", "400g Pouch", "1kg Tub"], "base_mrp": 25.0},
    {"category": "dairy-breakfast", "brand": "Amul", "item": "Pure Cow Ghee", "sizes": ["500ml Tin", "1L Carton", "5L Jar"], "base_mrp": 320.0},
    {"category": "dairy-breakfast", "brand": "Amul", "item": "Processed Cheese Slices", "sizes": ["100g Pack of 5", "200g Pack of 10", "400g Pack of 20"], "base_mrp": 90.0},
    {"category": "dairy-breakfast", "brand": "Amul", "item": "Malai Paneer Fresh Block", "sizes": ["200g Pack", "500g Pack"], "base_mrp": 95.0},
    {"category": "dairy-breakfast", "brand": "Mother Dairy", "item": "Cow Fresh Milk", "sizes": ["500ml", "1L"], "base_mrp": 28.0},
    {"category": "dairy-breakfast", "brand": "Mother Dairy", "item": "Classic Dahi Curd", "sizes": ["400g", "1kg"], "base_mrp": 45.0},
    {"category": "dairy-breakfast", "brand": "Nestle", "item": "Koko Krunch Chocolate Cereal", "sizes": ["175g", "375g", "750g"], "base_mrp": 110.0},
    {"category": "dairy-breakfast", "brand": "Nestle", "item": "Nesplus Multigrain Granola", "sizes": ["250g", "450g"], "base_mrp": 185.0},

    # Staples & Atta
    {"category": "staples-atta", "brand": "Aashirvaad", "item": "Sharbati Whole Wheat Atta", "sizes": ["1kg", "5kg", "10kg"], "base_mrp": 65.0},
    {"category": "staples-atta", "brand": "Aashirvaad", "item": "Multigrain Atta Enriched", "sizes": ["1kg", "5kg"], "base_mrp": 75.0},
    {"category": "staples-atta", "brand": "Fortune", "item": "Sunlite Refined Sunflower Oil", "sizes": ["1L Pouch", "1L Bottle", "5L Jar"], "base_mrp": 145.0},
    {"category": "staples-atta", "brand": "Fortune", "item": "Kachi Ghani Mustard Oil", "sizes": ["1L Pouch", "1L Bottle", "5L Can"], "base_mrp": 155.0},
    {"category": "staples-atta", "brand": "Fortune", "item": "Chakki Fresh Whole Wheat Atta", "sizes": ["5kg", "10kg"], "base_mrp": 220.0},
    {"category": "staples-atta", "brand": "Tata Consumer", "item": "Tata Salt Vacuum Evaporated Iodized", "sizes": ["1kg Pack", "1kg Lite Pack"], "base_mrp": 28.0},
    {"category": "staples-atta", "brand": "Tata Consumer", "item": "Tata Sampann Unpolished Toor Dal", "sizes": ["500g", "1kg"], "base_mrp": 90.0},
    {"category": "staples-atta", "brand": "Tata Consumer", "item": "Tata Sampann Chana Dal Premium", "sizes": ["500g", "1kg"], "base_mrp": 65.0},
    {"category": "staples-atta", "brand": "Saffola", "item": "Gold Multisource Edible Oil", "sizes": ["1L Pouch", "1L Bottle", "5L Jar"], "base_mrp": 175.0},
    {"category": "staples-atta", "brand": "Saffola", "item": "Rolled Oats 100% Natural", "sizes": ["500g", "1kg Pack", "1.5kg Refill"], "base_mrp": 125.0},
    {"category": "staples-atta", "brand": "MDH", "item": "Deggi Mirch Chili Powder", "sizes": ["100g", "250g", "500g"], "base_mrp": 55.0},
    {"category": "staples-atta", "brand": "MDH", "item": "Garam Masala Authentic Blend", "sizes": ["100g", "250g"], "base_mrp": 95.0},
    {"category": "staples-atta", "brand": "Everest", "item": "Chhole Masala Powder", "sizes": ["100g", "200g"], "base_mrp": 48.0},
    {"category": "staples-atta", "brand": "Everest", "item": "Turmeric Powder Haldi", "sizes": ["100g", "250g", "500g"], "base_mrp": 42.0},

    # Snacks & Munchies
    {"category": "snacks-munchies", "brand": "Lays", "item": "India's Magic Masala Potato Chips", "sizes": ["30g", "50g", "90g Party Pack"], "base_mrp": 20.0},
    {"category": "snacks-munchies", "brand": "Lays", "item": "Spanish Tomato Tango Potato Chips", "sizes": ["30g", "50g", "90g"], "base_mrp": 20.0},
    {"category": "snacks-munchies", "brand": "Kurkure", "item": "Masala Munch Crispy Snacks", "sizes": ["45g", "90g", "145g Family Pack"], "base_mrp": 20.0},
    {"category": "snacks-munchies", "brand": "Haldiram", "item": "Bhujia Sev Authentic Bikaneri", "sizes": ["150g", "400g", "1kg Pack"], "base_mrp": 45.0},
    {"category": "snacks-munchies", "brand": "Haldiram", "item": "All in One Crunchy Namkeen", "sizes": ["200g", "400g", "1kg"], "base_mrp": 60.0},
    {"category": "snacks-munchies", "brand": "Haldiram", "item": "Kaju Katli Sweets Pure Ghee", "sizes": ["250g Box", "500g Gift Box"], "base_mrp": 280.0},
    {"category": "snacks-munchies", "brand": "Britannia", "item": "Good Day Cashew Cookies", "sizes": ["100g", "200g", "600g Value Pack"], "base_mrp": 30.0},
    {"category": "snacks-munchies", "brand": "Britannia", "item": "Bourbon Chocolate Cream Biscuits", "sizes": ["150g", "300g"], "base_mrp": 35.0},
    {"category": "snacks-munchies", "brand": "Parle", "item": "Parle-G Original Glucose Biscuits", "sizes": ["100g", "250g", "800g Family Pack"], "base_mrp": 10.0},
    {"category": "snacks-munchies", "brand": "Parle", "item": "Hide & Seek Chocolate Chip Biscuits", "sizes": ["100g", "200g", "400g"], "base_mrp": 40.0},
    {"category": "snacks-munchies", "brand": "Cadbury", "item": "Dairy Milk Silk Chocolate Bar", "sizes": ["60g", "150g", "250g Bubbly"], "base_mrp": 80.0},
    {"category": "snacks-munchies", "brand": "Cadbury", "item": "Bournvita Chocolate Health Drink", "sizes": ["500g Jar", "1kg Refill", "2kg Jar"], "base_mrp": 240.0},
    {"category": "snacks-munchies", "brand": "Oreo", "item": "Original Vanilla Cream Sandwich Biscuits", "sizes": ["120g", "300g Family Pack"], "base_mrp": 35.0},

    # Beverages & Drinks
    {"category": "beverages-drinks", "brand": "Tata Consumer", "item": "Tata Tea Gold Fine Blend Chai", "sizes": ["250g", "500g", "1kg Pack"], "base_mrp": 160.0},
    {"category": "beverages-drinks", "brand": "Nestle", "item": "Nescafe Classic Instant Coffee", "sizes": ["50g Glass Jar", "100g Jar", "200g Pack"], "base_mrp": 190.0},
    {"category": "beverages-drinks", "brand": "Real Fruit Juice", "item": "Real Mixed Fruit Juice 100%", "sizes": ["200ml Tetra", "1L Pack"], "base_mrp": 30.0},
    {"category": "beverages-drinks", "brand": "Real Fruit Juice", "item": "Real Alphonso Mango Nectar", "sizes": ["200ml", "1L"], "base_mrp": 30.0},
    {"category": "beverages-drinks", "brand": "Paper Boat", "item": "Aamras Mango Fruit Juice Drink", "sizes": ["200ml Pouch", "1L Tetra"], "base_mrp": 35.0},
    {"category": "beverages-drinks", "brand": "Coca Cola", "item": "Original Taste Soft Drink Soda", "sizes": ["250ml Can", "750ml Bottle", "2.25L Party Bottle"], "base_mrp": 40.0},
    {"category": "beverages-drinks", "brand": "Pepsi", "item": "Regular Carbonated Soft Drink", "sizes": ["250ml Can", "1.25L Bottle", "2L Party Pack"], "base_mrp": 40.0},
    {"category": "beverages-drinks", "brand": "Red Bull", "item": "Energy Drink Original Blue", "sizes": ["250ml Can", "355ml Can", "Pack of 4 Cans"], "base_mrp": 125.0},

    # Household & Cleaning
    {"category": "household-cleaning", "brand": "Surf Excel", "item": "Easy Wash Detergent Powder", "sizes": ["500g", "1kg", "5kg Bucket"], "base_mrp": 75.0},
    {"category": "household-cleaning", "brand": "Surf Excel", "item": "Matic Top Load Liquid Detergent", "sizes": ["1L Pouch", "2L Bottle"], "base_mrp": 230.0},
    {"category": "household-cleaning", "brand": "Ariel", "item": "Matic Front Load Detergent Powder", "sizes": ["1kg", "4kg Pack"], "base_mrp": 260.0},
    {"category": "household-cleaning", "brand": "Dettol", "item": "Disinfectant Sanitizer Liquid Lime", "sizes": ["250ml", "500ml", "1L Bottle"], "base_mrp": 115.0},
    {"category": "household-cleaning", "brand": "Dettol", "item": "Liquid Handwash Refill Original", "sizes": ["175ml", "750ml Refill", "1.5L Eco Pack"], "base_mrp": 45.0},
    {"category": "household-cleaning", "brand": "Hindustan Unilever", "item": "Vim Dishwash Gel Lemon", "sizes": ["250ml", "500ml Bottle", "750ml Pouch"], "base_mrp": 55.0},

    # Personal Care & Hygiene
    {"category": "personal-care", "brand": "Colgate", "item": "Strong Teeth Toothpaste Calcium Enriched", "sizes": ["100g", "200g", "500g Saver Pack"], "base_mrp": 65.0},
    {"category": "personal-care", "brand": "Sensodyne", "item": "Fresh Mint Toothpaste Sensitivity Relief", "sizes": ["75g", "150g Twin Pack"], "base_mrp": 140.0},
    {"category": "personal-care", "brand": "Dove", "item": "Beauty Bathing Soap Bar Cream", "sizes": ["75g", "125g Pack of 3", "125g Pack of 5"], "base_mrp": 58.0},
    {"category": "personal-care", "brand": "Dove", "item": "Intense Repair Hair Shampoo", "sizes": ["180ml", "340ml", "650ml Pump"], "base_mrp": 190.0},
    {"category": "personal-care", "brand": "Nivea", "item": "Soft Light Moisturizer Cream", "sizes": ["50ml", "100ml", "300ml Tub"], "base_mrp": 110.0},
    {"category": "personal-care", "brand": "Gillette", "item": "Mach3 Turbo Razor Blades Cartridge", "sizes": ["2 Cartridges", "4 Cartridges", "8 Pack"], "base_mrp": 350.0},
    {"category": "personal-care", "brand": "Himalaya Herbals", "item": "Purifying Neem Face Wash Soap Free", "sizes": ["50ml", "100ml", "300ml Pump"], "base_mrp": 75.0},

    # Baby Care
    {"category": "baby-care", "brand": "Pampers", "item": "All Round Protection Diaper Pants", "sizes": ["Small 22s", "Medium 44s", "Large 64s", "XL 56s"], "base_mrp": 399.0},
    {"category": "baby-care", "brand": "Himalaya Herbals", "item": "Gentle Baby Wipes Pack with Aloe", "sizes": ["72 Wipes Pack", "Pack of 2 (144 Wipes)"], "base_mrp": 175.0},

    # Electronics & Accessories
    {"category": "electronics", "brand": "boAt", "item": "Airdopes 141 True Wireless Earbuds", "sizes": ["Bold Black", "Cyan Cider", "Pure White"], "base_mrp": 1299.0},
    {"category": "electronics", "brand": "boAt", "item": "BassHeads 100 In-Ear Wired Headphones", "sizes": ["Black", "Red", "Blue"], "base_mrp": 399.0},
    {"category": "electronics", "brand": "Noise", "item": "ColorFit Pulse 2 Max Smartwatch 1.85 Display", "sizes": ["Jet Black", "Deep Blue", "Rose Pink"], "base_mrp": 1499.0},
    {"category": "electronics", "brand": "Portronics", "item": "Power Bank 10000mAh 22.5W Fast Charging", "sizes": ["Black", "White"], "base_mrp": 899.0},
    {"category": "electronics", "brand": "Samsung", "item": "Type-C Fast Charging Data Cable 1m", "sizes": ["White 1m", "Black 1.5m"], "base_mrp": 499.0},

    # Kitchen & Home Needs
    {"category": "kitchen-home", "brand": "Prestige", "item": "Popular Aluminium Pressure Cooker", "sizes": ["2 Litre", "3 Litre", "5 Litre"], "base_mrp": 1150.0},
    {"category": "kitchen-home", "brand": "Milton", "item": "Thermosteel Flask Water Bottle 24 Hours Hot/Cold", "sizes": ["500ml", "750ml", "1000ml"], "base_mrp": 750.0},
]

PLATFORMS = [
    {"name": "ONDC_Seller_Node", "deliv_range": (10, 20), "discount_range": (0.08, 0.18)},
    {"name": "Blinkit", "deliv_range": (7, 12), "discount_range": (0.02, 0.12)},
    {"name": "Zepto", "deliv_range": (6, 10), "discount_range": (0.03, 0.14)},
    {"name": "Swiggy Instamart", "deliv_range": (9, 15), "discount_range": (0.02, 0.10)},
    {"name": "Amazon", "deliv_range": (60, 180), "discount_range": (0.10, 0.25)},
    {"name": "Flipkart", "deliv_range": (120, 240), "discount_range": (0.10, 0.22)},
]

PINCODES = ["560038", "110001", "400001", "700001", "600001"]

def generate_1000_skus() -> List[Dict[str, Any]]:
    """Generate 1,250+ distinct canonical product SKUs with barcodes and multi-platform listings."""
    products = []
    sku_counter = 100000

    # Expand templates into 1,250+ unique canonical product variants
    for tmpl in PRODUCT_TEMPLATES:
        category_slug = tmpl["category"]
        brand_name = tmpl["brand"]
        item_name = tmpl["item"]
        base_mrp = tmpl["base_mrp"]
        image_url = CATEGORY_IMAGE_MAP.get(category_slug, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d")

        for size in tmpl["sizes"]:
            sku_counter += 1
            gtin = f"890{sku_counter:010d}"  # 13-digit EAN GTIN starting with 890 (India)
            title = f"{brand_name} {item_name} {size}"
            norm_title = title.lower()

            # Price calculations
            mrp = round(base_mrp * (1.0 + (sku_counter % 5) * 0.15), 2)
            
            # Select 3 to 5 platforms for this product
            chosen_platforms = random.sample(PLATFORMS, k=random.randint(3, 5))
            listings = []

            for p in chosen_platforms:
                disc_pct = random.uniform(*p["discount_range"])
                selling_price = max(1.0, round(mrp * (1.0 - disc_pct), 2))
                deliv_mins = random.randint(*p["deliv_range"])
                pincode = random.choice(PINCODES)

                listings.append({
                    "platform": p["name"],
                    "seller_item_id": f"{p['name'][:3].lower()}_{sku_counter}",
                    "mrp": mrp,
                    "selling_price": selling_price,
                    "pincode": pincode,
                    "delivery_mins": deliv_mins
                })

            products.append({
                "gtin_barcode": gtin,
                "brand_name": brand_name,
                "category_slug": category_slug,
                "title": title,
                "normalized_title": norm_title,
                "unit_size": size,
                "description": f"{title} - High quality authentic product from {brand_name}.",
                "high_res_image_url": image_url,
                "listings": listings
            })

    # Supplementary generator to ensure total count exceeds 1,200 products
    flavors_variants = [
        "Special Edition", "Classic Flavour", "Gold Reserve", "Organic Pure",
        "Extra Fresh", "Zero Sugar", "Sugar Free", "Family Saver Pack",
        "Value Pack", "Super Saver Combo", "Sugar-Free Edition", "Natural Herbs",
        "Double Chocolate", "Strawberry Bliss", "Vanilla Supreme", "Masala Blast",
        "Chili Lime", "Lemon Fresh", "Cooling Mint", "Aloe Vera Care"
    ]

    extra_brands = [b["name"] for b in SEED_BRANDS]
    extra_cats = [c["slug"] for c in SEED_CATEGORIES]

    while len(products) < 1250:
        sku_counter += 1
        brand_name = random.choice(extra_brands)
        cat_slug = random.choice(extra_cats)
        variant = random.choice(flavors_variants)
        gtin = f"890{sku_counter:010d}"
        size_label = random.choice(["100g", "250g", "500g", "1kg", "200ml", "500ml", "1L", "Pack of 3"])
        
        title = f"{brand_name} {variant} {cat_slug.replace('-', ' ').title()} {size_label}"
        norm_title = title.lower()
        mrp = float(random.randint(40, 800))
        image_url = CATEGORY_IMAGE_MAP.get(cat_slug, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d")

        chosen_platforms = random.sample(PLATFORMS, k=random.randint(3, 5))
        listings = []
        for p in chosen_platforms:
            disc_pct = random.uniform(*p["discount_range"])
            selling_price = max(1.0, round(mrp * (1.0 - disc_pct), 2))
            deliv_mins = random.randint(*p["deliv_range"])
            pincode = random.choice(PINCODES)

            listings.append({
                "platform": p["name"],
                "seller_item_id": f"{p['name'][:3].lower()}_{sku_counter}",
                "mrp": mrp,
                "selling_price": selling_price,
                "pincode": pincode,
                "delivery_mins": deliv_mins
            })

        products.append({
            "gtin_barcode": gtin,
            "brand_name": brand_name,
            "category_slug": cat_slug,
            "title": title,
            "normalized_title": norm_title,
            "unit_size": size_label,
            "description": f"{title} - High quality authentic product from {brand_name}.",
            "high_res_image_url": image_url,
            "listings": listings
        })

    return products

async def seed_database(db: CatalogDatabase):
    """Seed 1,200+ canonical products and 4,500+ listings into SQLModel DB in a single fast transaction."""
    logger.info("Starting high-throughput bulk seeding of 1,200+ SKUs...")
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

    generated_products = generate_1000_skus()
    logger.info(f"Generated {len(generated_products)} product SKUs. Inserting into database...")

    # Fast bulk insertion using single session transaction
    def _bulk_insert():
        with Session(db.engine) as session:
            for p in generated_products:
                prod_id = uuid.uuid4()
                brand_obj = brand_map.get(p["brand_name"])
                cat_obj = cat_map.get(p["category_slug"])

                db_prod = CanonicalProduct(
                    id=prod_id,
                    gtin_barcode=p["gtin_barcode"],
                    brand_id=brand_obj.id if brand_obj else None,
                    category_id=cat_obj.id if cat_obj else None,
                    title=p["title"],
                    normalized_title=p["normalized_title"],
                    unit_size=p["unit_size"],
                    description=p["description"],
                    high_res_image_url=p["high_res_image_url"]
                )
                session.add(db_prod)

                for l in p["listings"]:
                    db_listing = PlatformListing(
                        id=uuid.uuid4(),
                        canonical_product_id=prod_id,
                        platform_name=l["platform"],
                        seller_item_id=l["seller_item_id"],
                        pincode=l["pincode"],
                        mrp=l["mrp"],
                        selling_price=l["selling_price"],
                        in_stock=True,
                        estimated_delivery_minutes=l["delivery_mins"],
                        product_url=f"https://www.pricepulse.app/item/{l['seller_item_id']}"
                    )
                    session.add(db_listing)

            session.commit()
            logger.info("Bulk commit completed successfully!")

    await asyncio.to_thread(_bulk_insert)

    stats = await db.get_stats()
    logger.info(f"Final Catalog Database Statistics: {stats}")

if __name__ == "__main__":
    db = CatalogDatabase()
    asyncio.run(seed_database(db))
