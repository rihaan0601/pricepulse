from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RawProductItem(BaseModel):
    platform_id: str
    raw_id: str
    title: str
    brand: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    mrp: float
    price: float
    in_stock: bool
    unit_quantity: Optional[str] = None
    image_url: Optional[str] = None
    deep_link: Optional[str] = None
    pincode: str
    lat: float
    lng: float
    raw_payload: Dict[str, Any] = Field(default_factory=dict)

class BaseHarvesterAdapter(ABC):
    """Abstract Base Class for Quick-Commerce Platform Harvesters."""

    @property
    @abstractmethod
    def platform_id(self) -> str:
        """Unique identifier for the platform (e.g. 'blinkit', 'zepto')."""
        pass

    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Display name for the platform (e.g. 'Blinkit', 'Zepto')."""
        pass

    @abstractmethod
    async def resolve_location_context(self, pincode: str, lat: float, lng: float) -> Dict[str, Any]:
        """Resolves dark-store store_id, area, or session tokens for a specific geo location."""
        pass

    @abstractmethod
    async def harvest_by_keyword(
        self, keyword: str, location_ctx: Dict[str, Any], client: Any
    ) -> List[RawProductItem]:
        """Harvests raw SKU listings for a specific search keyword and location context."""
        pass

    @abstractmethod
    async def harvest_by_category(
        self, category_id: str, location_ctx: Dict[str, Any], client: Any
    ) -> List[RawProductItem]:
        """Harvests raw SKU listings for a specific category ID and location context."""
        pass
