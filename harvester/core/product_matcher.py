import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ProductMatcher:
    """
    Matches products using exact GTIN matching and fuzzy string matching.
    """
    
    @staticmethod
    def _jaro_winkler_similarity(s1: str, s2: str) -> float:
        """
        Computes the Jaro-Winkler similarity between two strings.
        
        Args:
            s1: First string.
            s2: Second string.
            
        Returns:
            Similarity score between 0.0 and 1.0.
        """
        if s1 == s2:
            return 1.0
            
        len1, len2 = len(s1), len(s2)
        if len1 == 0 or len2 == 0:
            return 0.0
            
        max_dist = max(len1, len2) // 2 - 1
        
        match = 0
        hash_s1 = [0] * len1
        hash_s2 = [0] * len2
        
        for i in range(len1):
            for j in range(max(0, i - max_dist), min(len2, i + max_dist + 1)):
                if s1[i] == s2[j] and hash_s2[j] == 0:
                    hash_s1[i] = 1
                    hash_s2[j] = 1
                    match += 1
                    break
                    
        if match == 0:
            return 0.0
            
        t = 0
        point = 0
        for i in range(len1):
            if hash_s1[i]:
                while hash_s2[point] == 0:
                    point += 1
                if s1[i] != s2[point]:
                    t += 1
                point += 1
        t /= 2
        
        jaro = (match / len1 + match / len2 + (match - t) / match) / 3.0
        
        prefix = 0
        for i in range(min(4, min(len1, len2))):
            if s1[i] == s2[i]:
                prefix += 1
            else:
                break
                
        return jaro + (prefix * 0.1 * (1 - jaro))

    @staticmethod
    def _levenshtein_distance(s1: str, s2: str) -> float:
        """
        Computes the Levenshtein distance between two strings.
        
        Args:
            s1: First string.
            s2: Second string.
            
        Returns:
            The raw Levenshtein distance.
        """
        if len(s1) < len(s2):
            return ProductMatcher._levenshtein_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]

    @staticmethod
    def normalize_title(title: str, brand: str = "", unit: str = "") -> str:
        """
        Normalizes a product title by lowercasing and standardizing spacing.
        
        Args:
            title: Raw title.
            brand: Brand to potentially inject/format.
            unit: Unit to standardise.
            
        Returns:
            Normalized string.
        """
        title = title.lower().strip()
        brand = brand.lower().strip()
        unit = unit.lower().strip()
        return " ".join(filter(None, [brand, title, unit]))
        
    def match_catalog_items(self, raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicates and merges catalog items using GTIN and fuzzy matching.
        
        Args:
            raw_items: List of raw product items.
            
        Returns:
            List of canonical merged products.
        """
        canonical_products = []
        
        for item in raw_items:
            matched = False
            for canon in canonical_products:
                # 1. Exact GTIN match
                gtin1 = item.get("gtin_barcode")
                gtin2 = canon.get("gtin_barcode")
                
                if gtin1 and gtin2 and gtin1 == gtin2:
                    self._merge_listings(canon, item)
                    matched = True
                    break
                    
                # 2. Fuzzy Match
                brand_score = self._jaro_winkler_similarity(
                    item.get("brand", "").lower(), canon.get("brand", "").lower()
                )
                title_score = self._jaro_winkler_similarity(
                    item.get("title", "").lower(), canon.get("title", "").lower()
                )
                unit_score = self._jaro_winkler_similarity(
                    item.get("unit", "").lower(), canon.get("unit", "").lower()
                )
                category_score = self._jaro_winkler_similarity(
                    item.get("category", "").lower(), canon.get("category", "").lower()
                )
                
                total_score = (0.35 * brand_score) + (0.35 * title_score) + (0.20 * unit_score) + (0.10 * category_score)
                
                if total_score >= 0.80:
                    self._merge_listings(canon, item)
                    matched = True
                    break
                    
            if not matched:
                new_canon = item.copy()
                new_canon["listings"] = [item]
                canonical_products.append(new_canon)
                
        return canonical_products
        
    def _merge_listings(self, canon: Dict[str, Any], item: Dict[str, Any]) -> None:
        """
        Helper to merge a new listing into an existing canonical product.
        """
        if "listings" not in canon:
            canon["listings"] = []
        canon["listings"].append(item)
