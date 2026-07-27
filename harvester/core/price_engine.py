from typing import List, Dict, Any, Optional
from .matcher import CanonicalProduct, CrossPlatformMatcher

class PriceComparisonEngine:
    def __init__(self, products: List[Any]):
        self.products = products
        self.matcher = CrossPlatformMatcher()

    def _get_val(self, obj: Any, key: str, default: Any = "") -> Any:
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    def _to_dict(self, obj: Any) -> Dict[str, Any]:
        if isinstance(obj, dict):
            return obj
        if hasattr(obj, "dict"):
            return obj.dict()
        return dict(obj)

    def search(self, query: str, pincode: str = '') -> List[Dict[str, Any]]:
        """
        Fuzzy search by query, returns matched products with all platform prices sorted by best deal.
        """
        normalized_query = self.matcher._normalize_for_matching(query)
        results = []
        for product in self.products:
            title = self._get_val(product, "title", "")
            norm_title = self._get_val(product, "normalized_title", title)
            brand = self._get_val(product, "brand", "")

            title_score = self.matcher._jaro_winkler_similarity(normalized_query, self.matcher._normalize_for_matching(norm_title))
            brand_score = self.matcher._jaro_winkler_similarity(normalized_query, self.matcher._normalize_for_matching(brand))
            
            score = max(title_score, brand_score)
            if score > 0.4:  # Threshold for search
                platform_listings = self._get_val(product, "platform_listings", [])
                valid_listings = []
                for pl in platform_listings:
                    pl_pincode = self._get_val(pl, "pincode", "")
                    if not pincode or pl_pincode == pincode:
                        valid_listings.append(pl)
                
                if valid_listings:
                    sorted_listings = sorted(valid_listings, key=lambda x: self._get_val(x, "selling_price", 0))
                    
                    prod_dict = self._to_dict(product).copy()
                    prod_dict.pop("platform_listings", None)
                    
                    results.append({
                        "product": prod_dict,
                        "canonical_product_id": self._get_val(product, "canonical_product_id"),
                        "title": title,
                        "brand": brand,
                        "unit_size": self._get_val(product, "unit_size", ""),
                        "score": score,
                        "platform_listings": [self._to_dict(l) for l in sorted_listings],
                        "listings": [self._to_dict(l) for l in sorted_listings]
                    })
                    
        return sorted(results, key=lambda x: x["score"], reverse=True)

    def compare_product(self, canonical_id: str) -> Dict[str, Any]:
        """
        Returns full price comparison for a single product across all platforms.
        """
        for product in self.products:
            if self._get_val(product, "canonical_product_id") == canonical_id:
                listings = self._get_val(product, "platform_listings", [])
                sorted_listings = sorted(listings, key=lambda x: self._get_val(x, "selling_price", 0))
                prod_dict = self._to_dict(product).copy()
                prod_dict.pop("platform_listings", None)
                return {
                    "product": prod_dict,
                    "comparison": [self._to_dict(l) for l in sorted_listings]
                }
        return {}

    def find_cheapest(self, canonical_id: str) -> Dict[str, Any]:
        """
        Returns the single cheapest platform listing for a product.
        """
        comparison = self.compare_product(canonical_id)
        if comparison and comparison.get("comparison"):
            cheapest_listing = comparison["comparison"][0]
            return {
                "product": comparison["product"],
                "cheapest_listing": cheapest_listing
            }
        return {}

    def compare_basket(self, items: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Takes [{"query": "amul butter", "qty": 1}], finds best product match for each, 
        and calculates total cost across different scenarios.
        """
        basket_products = []
        for item in items:
            search_results = self.search(item["query"])
            if search_results:
                best_match = search_results[0]
                qty = int(item.get("qty", 1))
                basket_products.append({
                    "matched_product": best_match["product"],
                    "listings": best_match["platform_listings"],
                    "qty": qty
                })

        platform_totals: Dict[str, float] = {}
        platform_item_counts: Dict[str, int] = {}

        for bp in basket_products:
            for listing in bp["listings"]:
                platform = listing["platform"]
                cost = listing["selling_price"] * bp["qty"]
                platform_totals[platform] = platform_totals.get(platform, 0.0) + cost
                platform_item_counts[platform] = platform_item_counts.get(platform, 0) + 1

        single_platform_costs: Dict[str, float] = {}
        for platform, total in platform_totals.items():
            fee = 0 if total > 199 else 25
            single_platform_costs[platform] = round(total + fee, 2)
            
        best_single = None
        if single_platform_costs:
            best_platform = min(single_platform_costs, key=single_platform_costs.get)
            best_single = {
                "platform": best_platform,
                "total": single_platform_costs[best_platform]
            }

        return {
            "single_platform_costs": single_platform_costs,
            "platform_item_counts": platform_item_counts,
            "best_single_platform": best_single,
            "basket_products": basket_products
        }
