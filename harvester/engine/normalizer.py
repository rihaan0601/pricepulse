import re
import hashlib
from typing import Optional
from pydantic import BaseModel
from harvester.adapters.base import RawProductItem

class CanonicalSKU(BaseModel):
    canonical_id: str
    normalized_title: str
    brand: str
    category: str
    subcategory: str
    unit_quantity: str
    base_unit: str  # e.g. "g", "ml", "pcs"
    base_amount: float  # e.g. 500.0
    ean_gtin: Optional[str] = None
    platform_id: str
    platform_raw_id: str
    mrp: float
    price: float
    discount_pct: float
    price_per_base_unit: float  # Price per g/ml/pc
    in_stock: bool
    image_url: str
    pincode: str
    lat: float
    lng: float

class CatalogNormalizer:
    """Normalizes raw platform product objects into clean canonical SKUs."""

    @staticmethod
    def normalize_title(title: str) -> str:
        """Cleans and standardizes raw product title string."""
        cleaned = re.sub(r'[^\w\s\-\.]', '', title, flags=re.UNICODE)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    @staticmethod
    def extract_unit_metrics(unit_str: str) -> tuple[str, float]:
        """Extracts base unit type (g/ml/pcs) and numeric value."""
        if not unit_str:
            return "pcs", 1.0
        
        s = unit_str.lower().strip()
        
        # Check Kilograms / Grams
        kg_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:kg|kilo)', s)
        if kg_match:
            val = float(kg_match.group(1)) * 1000.0
            return "g", val
        
        g_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:g|gm|gram)', s)
        if g_match:
            return "g", float(g_match.group(1))

        # Check Liters / ML
        l_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:l|ltr|liter)', s)
        if l_match:
            val = float(l_match.group(1)) * 1000.0
            return "ml", val
            
        ml_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:ml|milliliter)', s)
        if ml_match:
            return "ml", float(ml_match.group(1))

        # Default fallback to pieces
        pc_match = re.search(r'(\d+)', s)
        if pc_match:
            return "pcs", float(pc_match.group(1))

        return "pcs", 1.0

    @classmethod
    def process_raw_item(cls, raw: RawProductItem) -> CanonicalSKU:
        clean_title = cls.normalize_title(raw.title)
        brand = (raw.brand or "Generic").strip().title()
        category = (raw.category or "General").strip().title()
        subcategory = (raw.subcategory or "General").strip().title()
        unit_str = raw.unit_quantity or "1 unit"
        
        base_unit, base_amount = cls.extract_unit_metrics(unit_str)
        
        mrp = max(raw.mrp, raw.price)
        price = raw.price
        discount_pct = round(((mrp - price) / mrp) * 100.0, 1) if mrp > 0 else 0.0
        price_per_unit = round(price / base_amount, 4) if base_amount > 0 else price

        # Generate deterministic canonical hash ID based on Brand + Clean Title + Base Unit
        hash_seed = f"{brand.lower()}:{clean_title.lower()}:{base_amount}:{base_unit}"
        canonical_id = f"sku_{hashlib.md5(hash_seed.encode('utf-8')).hexdigest()[:12]}"

        return CanonicalSKU(
            canonical_id=canonical_id,
            normalized_title=clean_title,
            brand=brand,
            category=category,
            subcategory=subcategory,
            unit_quantity=unit_str,
            base_unit=base_unit,
            base_amount=base_amount,
            platform_id=raw.platform_id,
            platform_raw_id=raw.raw_id,
            mrp=mrp,
            price=price,
            discount_pct=discount_pct,
            price_per_base_unit=price_per_unit,
            in_stock=raw.in_stock,
            image_url=raw.image_url or "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
            pincode=raw.pincode,
            lat=raw.lat,
            lng=raw.lng,
        )
