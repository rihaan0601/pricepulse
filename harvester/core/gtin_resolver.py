import logging
from typing import Optional, Dict, Any
import httpx

logger = logging.getLogger(__name__)

class GTINResolver:
    """
    Resolver for querying product information by GTIN/barcode.
    Uses Open Food Facts API and a simple local cache.
    """
    
    def __init__(self) -> None:
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.base_url = "https://world.openfoodfacts.org/api/v2/product/{}.json"
        
    async def resolve_gtin(self, gtin_barcode: str) -> Optional[Dict[str, Any]]:
        """
        Queries Open Food Facts API or local cache for product details.
        
        Args:
            gtin_barcode: The GTIN or barcode of the product.
            
        Returns:
            Extracted product information or None if not found/error.
        """
        if gtin_barcode in self.cache:
            logger.debug(f"Cache hit for GTIN: {gtin_barcode}")
            return self.cache[gtin_barcode]
            
        url = self.base_url.format(gtin_barcode)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                if response.status_code != 200:
                    logger.warning(f"Failed to fetch GTIN {gtin_barcode}: {response.status_code}")
                    return None
                    
                data = response.json()
                
                if data.get("status") != 1:
                    logger.info(f"Product not found for GTIN: {gtin_barcode}")
                    return None
                    
                product = data.get("product", {})
                
                result = {
                    "gtin_barcode": gtin_barcode,
                    "brand": product.get("brands", ""),
                    "title": product.get("product_name", ""),
                    "category_path": product.get("categories", ""),
                    "front_image_url": product.get("image_front_url", ""),
                    "ingredients_image_url": product.get("image_ingredients_url", ""),
                    "nutrition_image_url": product.get("image_nutrition_url", ""),
                    "nutriscore": product.get("nutriscore_grade", ""),
                    "allergens": product.get("allergens", "")
                }
                
                self.cache[gtin_barcode] = result
                return result
                
        except Exception as e:
            logger.error(f"Error resolving GTIN {gtin_barcode}: {e}")
            return None
