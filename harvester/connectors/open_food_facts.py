"""
Open Food Facts Connector
Official open-source product database with GTIN/EAN barcodes, product metadata, and images.
API: https://world.openfoodfacts.org/api/v2/
License: Open Database License (ODbL)
"""

import logging
import httpx
from typing import Dict, Any, Optional, List

logger = logging.getLogger("OpenFoodFactsConnector")


class OpenFoodFactsConnector:
    """
    Queries the Open Food Facts REST API for product data by barcode or search.
    This is a fully legitimate, open-source, community-maintained database.
    """

    BASE_URL = "https://world.openfoodfacts.org"
    SEARCH_URL = f"{BASE_URL}/cgi/search.pl"
    PRODUCT_URL = f"{BASE_URL}/api/v2/product"
    HEADERS = {
        "User-Agent": "PricePulseEngine/2.0 (contact@pricepulse.in - Indian Quick Commerce Price Comparison)"
    }

    @classmethod
    async def get_product_by_barcode(cls, barcode: str) -> Optional[Dict[str, Any]]:
        """
        Fetches product data from Open Food Facts by GTIN/EAN barcode.
        Returns normalized product dict or None if not found.
        """
        if not barcode or not str(barcode).strip():
            return None

        url = f"{cls.PRODUCT_URL}/{barcode.strip()}.json"

        try:
            async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
                response = await client.get(url, headers=cls.HEADERS)

                if response.status_code != 200:
                    logger.debug(f"OFF returned {response.status_code} for barcode {barcode}")
                    return None

                data = response.json()
                if data.get("status") != 1 or "product" not in data:
                    return None

                product = data["product"]
                return cls._normalize_off_product(product, barcode)

        except Exception as e:
            logger.error(f"Error fetching barcode {barcode} from Open Food Facts: {e}")
            return None

    @classmethod
    async def search_products(cls, query: str, page: int = 1, page_size: int = 20) -> List[Dict[str, Any]]:
        """
        Searches Open Food Facts by product name/brand.
        Returns list of normalized product dicts.
        """
        try:
            params = {
                "search_terms": query,
                "search_simple": 1,
                "action": "process",
                "json": 1,
                "page": page,
                "page_size": page_size,
                "countries_tags_en": "india",
                "sort_by": "unique_scans_n",
            }

            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                response = await client.get(cls.SEARCH_URL, params=params, headers=cls.HEADERS)

                if response.status_code != 200:
                    logger.warning(f"OFF search returned {response.status_code} for query '{query}'")
                    return []

                data = response.json()
                products = data.get("products", [])

                results = []
                for p in products:
                    barcode = p.get("code", "")
                    normalized = cls._normalize_off_product(p, barcode)
                    if normalized:
                        results.append(normalized)

                logger.info(f"OFF search '{query}': found {len(results)} products")
                return results

        except Exception as e:
            logger.error(f"Error searching Open Food Facts for '{query}': {e}")
            return []

    @classmethod
    def _normalize_off_product(cls, product: Dict, barcode: str) -> Optional[Dict[str, Any]]:
        """Normalizes raw Open Food Facts product JSON into a standard dict."""
        title = (
            product.get("product_name") or
            product.get("product_name_en") or
            product.get("product_name_hi") or
            ""
        ).strip()

        if not title:
            return None

        brand = (
            product.get("brands") or
            product.get("brand_owner") or
            "Unknown"
        ).strip()

        # Extract category path
        categories_raw = product.get("categories_hierarchy", [])
        category_path = [
            c.replace("en:", "").replace("-", " ").title()
            for c in categories_raw[:4]
        ]

        # Extract images
        images = {}
        for key in ["image_front_url", "image_url", "image_ingredients_url", "image_nutrition_url"]:
            url = product.get(key)
            if url:
                images[key.replace("image_", "").replace("_url", "")] = url

        # Extract quantity/unit
        quantity = product.get("quantity", "") or product.get("product_quantity", "") or ""

        return {
            "source": "OpenFoodFacts",
            "barcode": barcode,
            "brand": brand,
            "title": title,
            "quantity": str(quantity),
            "category_path": category_path,
            "images": images,
            "nutriscore_grade": product.get("nutriscore_grade"),
            "nova_group": product.get("nova_group"),
            "ingredients_text": product.get("ingredients_text", ""),
            "allergens": product.get("allergens", ""),
            "countries": product.get("countries", ""),
        }
