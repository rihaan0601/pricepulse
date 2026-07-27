import urllib.parse
from typing import Dict, Any

class DeepLinkGenerator:
    """
    Generates deep links and web URLs for Quick-Commerce platforms.
    Hand-off gate yielding UI control to the user via official app/web deep links.
    """
    
    @staticmethod
    def generate_product_link(platform: str, sku_id: str, title: str = '') -> str:
        """
        Returns a URL that opens the product on the platform's web/app.
        """
        p = platform.lower()
        if 'blinkit' in p:
            return f"https://blinkit.com/prn/product/{sku_id}"
        elif 'zepto' in p:
            return f"https://www.zeptonow.com/product/{sku_id}"
        elif 'instamart' in p or 'swiggy' in p:
            return f"https://www.swiggy.com/instamart/item/{sku_id}"
        elif 'flipkart' in p:
            return f"https://www.flipkart.com/product/p/itm?pid={sku_id}"
        elif 'amazon' in p:
            return f"https://www.amazon.in/dp/{sku_id}"
        else:
            encoded_title = urllib.parse.quote(title or sku_id)
            return f"https://www.google.com/search?q={encoded_title}"

    @staticmethod
    def generate_search_link(platform: str, query: str) -> str:
        """
        Returns a search URL for the query on the target platform.
        """
        encoded_query = urllib.parse.quote(query)
        p = platform.lower()
        if 'blinkit' in p:
            return f"https://blinkit.com/s/?q={encoded_query}"
        elif 'zepto' in p:
            return f"https://www.zeptonow.com/search?q={encoded_query}"
        elif 'instamart' in p or 'swiggy' in p:
            return f"https://www.swiggy.com/instamart/search?q={encoded_query}"
        elif 'flipkart' in p:
            return f"https://www.flipkart.com/search?q={encoded_query}"
        elif 'amazon' in p:
            return f"https://www.amazon.in/s?k={encoded_query}"
        else:
            return f"https://www.google.com/search?q={encoded_query}"

    @staticmethod
    def generate_cart_links(basket_split: Dict[str, Any]) -> Dict[str, Any]:
        """
        For each platform in the split, generate product links for all assigned items.
        """
        links_map = {}
        platforms = basket_split.get("platforms", [])
        
        for p_data in platforms:
            platform = p_data.get("platform", "")
            items = p_data.get("items", [])
            item_links = []
            
            for item in items:
                sku_id = item.get("platform_sku_id") or item.get("product_id", "")
                title = item.get("title", "")
                link = DeepLinkGenerator.generate_product_link(platform, sku_id, title)
                item_links.append({
                    "title": title,
                    "link": link
                })
                
            links_map[platform] = item_links
            
        return links_map
