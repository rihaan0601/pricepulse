import uuid
import re
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timezone
import logging

try:
    from harvester.engine.normalizer import CanonicalSKU
except ImportError:
    # Fallback for typing if not present
    class CanonicalSKU(BaseModel):
        canonical_id: str
        normalized_title: str
        brand: str
        category: str
        subcategory: str
        unit_quantity: float
        base_unit: str
        base_amount: float
        ean_gtin: Optional[str] = None
        platform_id: str
        platform_raw_id: str
        mrp: float
        price: float
        discount_pct: float
        price_per_base_unit: float
        in_stock: bool
        image_url: str
        pincode: str
        lat: float
        lng: float

logger = logging.getLogger(__name__)

class PlatformListing(BaseModel):
    platform: str
    platform_sku_id: str
    mrp: float
    selling_price: float
    discount_percentage: float
    in_stock: bool
    estimated_delivery_minutes: int = 15
    pincode: str
    image_url: str = ''
    deep_link: str = ''

class CanonicalProduct(BaseModel):
    canonical_product_id: str
    gtin_barcode: Optional[str] = None
    brand: str
    title: str
    normalized_title: str
    unit_size: str
    category_path: List[str] = []
    high_res_images: List[Dict[str, str]] = []
    platform_listings: List[PlatformListing] = []
    last_updated_utc: str = ''

class CrossPlatformMatcher:
    def __init__(self):
        pass

    @staticmethod
    def _normalize_for_matching(text: str) -> str:
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        # Normalize units
        text = re.sub(r'(\d+)\s*ml', r'\1ml', text)
        text = re.sub(r'(\d+)\s*l\b', r'\1l', text)
        text = re.sub(r'(\d+)\s*g\b', r'\1g', text)
        text = re.sub(r'(\d+)\s*kg\b', r'\1kg', text)
        # Handle 500ml = 0.5l mapping if needed, skipping for simple normalization
        return text

    @staticmethod
    def _levenshtein_ratio(s1: str, s2: str) -> float:
        if not s1 or not s2:
            return 0.0
        if s1 == s2:
            return 1.0
        
        m, n = len(s1), len(s2)
        d = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            d[i][0] = i
        for j in range(n + 1):
            d[0][j] = j
            
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                cost = 0 if s1[i - 1] == s2[j - 1] else 1
                d[i][j] = min(d[i - 1][j] + 1,      # deletion
                              d[i][j - 1] + 1,      # insertion
                              d[i - 1][j - 1] + cost) # substitution
                              
        max_len = max(m, n)
        return 1.0 - (d[m][n] / max_len)

    @staticmethod
    def _jaro_winkler_similarity(s1: str, s2: str) -> float:
        if not s1 or not s2:
            return 0.0
        if s1 == s2:
            return 1.0
        
        match_bound = max(len(s1), len(s2)) // 2 - 1
        matches = 0
        s1_matches = [False] * len(s1)
        s2_matches = [False] * len(s2)
        
        for i, c1 in enumerate(s1):
            start = max(0, i - match_bound)
            end = min(i + match_bound + 1, len(s2))
            for j in range(start, end):
                if s2_matches[j]:
                    continue
                if c1 == s2[j]:
                    s1_matches[i] = True
                    s2_matches[j] = True
                    matches += 1
                    break
        
        if matches == 0:
            return 0.0
            
        k = 0
        transpositions = 0
        for i, c1 in enumerate(s1):
            if not s1_matches[i]:
                continue
            while not s2_matches[k]:
                k += 1
            if c1 != s2[k]:
                transpositions += 1
            k += 1
            
        transpositions //= 2
        
        jaro = (matches / len(s1) + matches / len(s2) + (matches - transpositions) / matches) / 3.0
        
        prefix = 0
        for c1, c2 in zip(s1, s2):
            if c1 == c2:
                prefix += 1
                if prefix == 4:
                    break
            else:
                break
                
        p = 0.1
        jaro_winkler = jaro + prefix * p * (1 - jaro)
        return jaro_winkler

    def _compute_similarity(self, sku1: CanonicalSKU, sku2: CanonicalSKU) -> float:
        brand1 = self._normalize_for_matching(sku1.brand)
        brand2 = self._normalize_for_matching(sku2.brand)
        brand_match = 1.0 if brand1 and brand1 == brand2 else self._jaro_winkler_similarity(brand1, brand2)
        
        title1 = self._normalize_for_matching(sku1.normalized_title)
        title2 = self._normalize_for_matching(sku2.normalized_title)
        title_similarity = self._jaro_winkler_similarity(title1, title2)
        
        unit1 = f"{sku1.unit_quantity}{sku1.base_unit}"
        unit2 = f"{sku2.unit_quantity}{sku2.base_unit}"
        unit_match = 1.0 if self._normalize_for_matching(unit1) == self._normalize_for_matching(unit2) else 0.0
        
        cat1 = self._normalize_for_matching(sku1.category)
        cat2 = self._normalize_for_matching(sku2.category)
        category_match = 1.0 if cat1 and cat1 == cat2 else self._levenshtein_ratio(cat1, cat2)
        
        score = 0.35 * brand_match + 0.35 * title_similarity + 0.20 * unit_match + 0.10 * category_match
        return score

    def match_skus(self, skus: List[CanonicalSKU]) -> List[CanonicalProduct]:
        products: Dict[str, CanonicalProduct] = {}
        unmatched: List[CanonicalSKU] = []
        
        # 1. Exact match by GTIN
        for sku in skus:
            if sku.ean_gtin:
                if sku.ean_gtin not in products:
                    products[sku.ean_gtin] = CanonicalProduct(
                        canonical_product_id=str(uuid.uuid4()),
                        gtin_barcode=sku.ean_gtin,
                        brand=sku.brand,
                        title=sku.normalized_title,
                        normalized_title=self._normalize_for_matching(sku.normalized_title),
                        unit_size=f"{sku.unit_quantity} {sku.base_unit}",
                        category_path=[sku.category, sku.subcategory],
                        high_res_images=[{"url": sku.image_url}] if sku.image_url else [],
                        platform_listings=[],
                        last_updated_utc=datetime.now(timezone.utc).isoformat()
                    )
                
                listing = PlatformListing(
                    platform=sku.platform_id,
                    platform_sku_id=sku.platform_raw_id,
                    mrp=sku.mrp,
                    selling_price=sku.price,
                    discount_percentage=sku.discount_pct,
                    in_stock=sku.in_stock,
                    pincode=sku.pincode,
                    image_url=sku.image_url,
                    deep_link="" # Populate via deep link generator later or use raw
                )
                products[sku.ean_gtin].platform_listings.append(listing)
            else:
                unmatched.append(sku)
                
        canonical_list = list(products.values())
        
        # 2. Fuzzy match for non-GTIN SKUs
        for sku in unmatched:
            best_match = None
            best_score = 0.0
            
            # Find best match among existing canonical products
            for cp in canonical_list:
                # Create dummy sku to compare
                dummy_sku = CanonicalSKU(
                    canonical_id=cp.canonical_product_id,
                    normalized_title=cp.title,
                    brand=cp.brand,
                    category=cp.category_path[0] if cp.category_path else "",
                    subcategory=cp.category_path[1] if len(cp.category_path) > 1 else "",
                    unit_quantity=sku.unit_quantity, # approximation for matching
                    base_unit=sku.base_unit,
                    base_amount=sku.base_amount,
                    platform_id="", platform_raw_id="", mrp=0, price=0, discount_pct=0, price_per_base_unit=0,
                    in_stock=False, image_url="", pincode="", lat=0, lng=0
                )
                score = self._compute_similarity(sku, dummy_sku)
                if score > best_score:
                    best_score = score
                    best_match = cp
            
            # Additional logic could cluster unmatched items together
            # Here we just match to existing or create new
            if best_match and best_score >= 0.82:
                listing = PlatformListing(
                    platform=sku.platform_id,
                    platform_sku_id=sku.platform_raw_id,
                    mrp=sku.mrp,
                    selling_price=sku.price,
                    discount_percentage=sku.discount_pct,
                    in_stock=sku.in_stock,
                    pincode=sku.pincode,
                    image_url=sku.image_url,
                    deep_link=""
                )
                best_match.platform_listings.append(listing)
            else:
                new_cp = CanonicalProduct(
                    canonical_product_id=str(uuid.uuid4()),
                    gtin_barcode=None,
                    brand=sku.brand,
                    title=sku.normalized_title,
                    normalized_title=self._normalize_for_matching(sku.normalized_title),
                    unit_size=f"{sku.unit_quantity} {sku.base_unit}",
                    category_path=[sku.category, sku.subcategory],
                    high_res_images=[{"url": sku.image_url}] if sku.image_url else [],
                    platform_listings=[
                        PlatformListing(
                            platform=sku.platform_id,
                            platform_sku_id=sku.platform_raw_id,
                            mrp=sku.mrp,
                            selling_price=sku.price,
                            discount_percentage=sku.discount_pct,
                            in_stock=sku.in_stock,
                            pincode=sku.pincode,
                            image_url=sku.image_url,
                            deep_link=""
                        )
                    ],
                    last_updated_utc=datetime.now(timezone.utc).isoformat()
                )
                canonical_list.append(new_cp)
                
        return canonical_list
