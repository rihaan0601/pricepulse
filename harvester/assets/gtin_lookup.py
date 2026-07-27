import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger("GTINImageLookup")

class GTINImageLookup:
    """
    Fallback GTIN / Barcode Image Lookup
    Queries Open Food Facts API (https://world.openfoodfacts.org/api/v2/product/{gtin_barcode}.json)
    """

    BASE_URL = "https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    HEADERS = {
        "User-Agent": "PricePulseAssetHarvester/1.0 (contact@pricepulse.in - High-Res Product Image Harvester)"
    }

    @classmethod
    async def fetch_product_images_by_gtin(cls, gtin_barcode: str) -> Optional[Dict[str, Any]]:
        """
        Fetches high-resolution product front, ingredients, and nutrition images from Open Food Facts API.
        """
        if not gtin_barcode or not str(gtin_barcode).strip():
            return None

        clean_gtin = str(gtin_barcode).strip()
        url = cls.BASE_URL.format(barcode=clean_gtin)

        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(url, headers=cls.HEADERS)
                if response.status_code != 200:
                    logger.warning(f"GTIN lookup returned status {response.status_code} for barcode {clean_gtin}")
                    return None

                data = response.json()
                if data.get("status") != 1 or "product" not in data:
                    logger.info(f"Product not found in Open Food Facts registry for GTIN {clean_gtin}")
                    return None

                product = data["product"]
                images = {}

                # 1. Front image
                front_url = (
                    product.get("image_front_url") or
                    product.get("image_url") or
                    product.get("image_front_small_url")
                )
                if front_url:
                    images["front"] = front_url

                # 2. Ingredients image
                ingredients_url = (
                    product.get("image_ingredients_url") or
                    product.get("image_ingredients_small_url")
                )
                if ingredients_url:
                    images["ingredients"] = ingredients_url

                # 3. Nutrition image
                nutrition_url = (
                    product.get("image_nutrition_url") or
                    product.get("image_nutrition_small_url")
                )
                if nutrition_url:
                    images["nutrition"] = nutrition_url

                if not images:
                    return None

                return {
                    "gtin_barcode": clean_gtin,
                    "product_name": product.get("product_name") or product.get("product_name_en"),
                    "brand": product.get("brands"),
                    "images": images
                }

        except Exception as e:
            logger.error(f"Error executing GTIN lookup for {clean_gtin}: {e}")
            return None
