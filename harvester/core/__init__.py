"""
Core Intelligence Package
- CrossPlatformMatcher / ProductMatcher: GTIN barcode matching + Jaro-Winkler/Levenshtein fuzzy matching
- GTINResolver: Open Food Facts barcode & image resolution
- SmartBasketEngine: ONDC native Beckn routing & multi-ASIN cart URL generator
- PriceComparisonEngine: Search & cross-platform price aggregator
- BasketSplitter: Vendor basket optimizer
- DeepLinkGenerator: Universal app deep link generator
"""

from harvester.core.matcher import CrossPlatformMatcher, CanonicalProduct, PlatformListing
from harvester.core.product_matcher import ProductMatcher
from harvester.core.gtin_resolver import GTINResolver
from harvester.core.basket_engine import SmartBasketEngine
from harvester.core.price_engine import PriceComparisonEngine
from harvester.core.basket_splitter import BasketSplitter
from harvester.core.deeplink_generator import DeepLinkGenerator

__all__ = [
    "CrossPlatformMatcher",
    "CanonicalProduct",
    "PlatformListing",
    "ProductMatcher",
    "GTINResolver",
    "SmartBasketEngine",
    "PriceComparisonEngine",
    "BasketSplitter",
    "DeepLinkGenerator",
]
