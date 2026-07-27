from typing import List, Dict, Any

class BasketSplitter:
    def __init__(self):
        self.delivery_estimates = {
            'zepto': 8,
            'blinkit': 10,
            'instamart': 15,
            'flipkart_minutes': 12,
            'amazon_fresh': 25
        }

    def _get_val(self, obj: Any, key: str, default: Any = None) -> Any:
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    def _get_delivery_time(self, platform: str) -> int:
        return self.delivery_estimates.get(platform.lower(), 15)

    def split_basket(self, items: List[Any], mode: str = 'cheapest') -> Dict[str, Any]:
        """
        Splits basket of CanonicalProducts or dicts to optimize for 'cheapest', 'fastest', or 'single_store'.
        """
        if not items:
            return {"error": "Empty basket"}

        if mode == 'fastest':
            return self._split_fastest(items)
        elif mode == 'single_store':
            return self._split_single_store(items)
        else:
            return self._split_cheapest(items)

    def _split_cheapest(self, items: List[Any]) -> Dict[str, Any]:
        platform_assignments: Dict[str, Dict[str, Any]] = {}
        
        for item in items:
            listings = self._get_val(item, "platform_listings", [])
            valid_listings = [l for l in listings if self._get_val(l, "in_stock", True)]
            if not valid_listings:
                continue
                
            cheapest = min(valid_listings, key=lambda x: self._get_val(x, "selling_price", 0))
            p = self._get_val(cheapest, "platform")
            price = self._get_val(cheapest, "selling_price", 0)
            
            if p not in platform_assignments:
                platform_assignments[p] = {
                    "platform": p,
                    "items": [],
                    "subtotal": 0.0,
                    "delivery_fee": 0.0,
                    "delivery_time_minutes": self._get_delivery_time(p)
                }
                
            platform_assignments[p]["items"].append({
                "product_id": self._get_val(item, "canonical_product_id"),
                "title": self._get_val(item, "title"),
                "price": price
            })
            platform_assignments[p]["subtotal"] += price

        grand_total = 0.0
        for p, data in platform_assignments.items():
            fee = 0.0 if data["subtotal"] > 199 else 25.0
            data["delivery_fee"] = fee
            grand_total += data["subtotal"] + fee
            
        single_store = self._split_single_store(items)
        savings = single_store.get("grand_total", grand_total) - grand_total
            
        return {
            "mode": "cheapest",
            "platforms": list(platform_assignments.values()),
            "grand_total": round(grand_total, 2),
            "savings_vs_single": round(max(0.0, savings), 2)
        }

    def _split_fastest(self, items: List[Any]) -> Dict[str, Any]:
        platform_assignments: Dict[str, Dict[str, Any]] = {}
        
        for item in items:
            listings = self._get_val(item, "platform_listings", [])
            valid_listings = [l for l in listings if self._get_val(l, "in_stock", True)]
            if not valid_listings:
                continue
                
            fastest = min(valid_listings, key=lambda x: self._get_delivery_time(self._get_val(x, "platform")))
            p = self._get_val(fastest, "platform")
            price = self._get_val(fastest, "selling_price", 0)
            
            if p not in platform_assignments:
                platform_assignments[p] = {
                    "platform": p,
                    "items": [],
                    "subtotal": 0.0,
                    "delivery_fee": 0.0,
                    "delivery_time_minutes": self._get_delivery_time(p)
                }
                
            platform_assignments[p]["items"].append({
                "product_id": self._get_val(item, "canonical_product_id"),
                "title": self._get_val(item, "title"),
                "price": price
            })
            platform_assignments[p]["subtotal"] += price

        grand_total = 0.0
        max_time = 0
        for p, data in platform_assignments.items():
            fee = 0.0 if data["subtotal"] > 199 else 25.0
            data["delivery_fee"] = fee
            grand_total += data["subtotal"] + fee
            max_time = max(max_time, data["delivery_time_minutes"])
            
        return {
            "mode": "fastest",
            "platforms": list(platform_assignments.values()),
            "grand_total": round(grand_total, 2),
            "max_delivery_time": max_time
        }

    def _split_single_store(self, items: List[Any]) -> Dict[str, Any]:
        platform_stats: Dict[str, Dict[str, Any]] = {}
        
        for item in items:
            listings = self._get_val(item, "platform_listings", [])
            for listing in listings:
                if not self._get_val(listing, "in_stock", True):
                    continue
                p = self._get_val(listing, "platform")
                price = self._get_val(listing, "selling_price", 0)

                if p not in platform_stats:
                    platform_stats[p] = {"count": 0, "subtotal": 0.0, "items": []}
                
                platform_stats[p]["count"] += 1
                platform_stats[p]["subtotal"] += price
                platform_stats[p]["items"].append({
                    "product_id": self._get_val(item, "canonical_product_id"),
                    "title": self._get_val(item, "title"),
                    "price": price
                })
                
        if not platform_stats:
            return {"error": "No items available"}
            
        best_platform = max(
            platform_stats.items(), 
            key=lambda x: (x[1]["count"], -x[1]["subtotal"])
        )
        
        p = best_platform[0]
        subtotal = best_platform[1]["subtotal"]
        fee = 0.0 if subtotal > 199 else 25.0
        
        return {
            "mode": "single_store",
            "platforms": [{
                "platform": p,
                "items": best_platform[1]["items"],
                "subtotal": round(subtotal, 2),
                "delivery_fee": fee,
                "delivery_time_minutes": self._get_delivery_time(p)
            }],
            "grand_total": round(subtotal + fee, 2)
        }
