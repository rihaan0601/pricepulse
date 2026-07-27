import uuid
from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

# ==============================================================================
# SQLMODEL DATABASE SCHEMA (PostgreSQL & SQLite Compatible)
# ==============================================================================

class Brand(SQLModel, table=True):
    __tablename__ = "brands"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True, unique=True, nullable=False)
    logo_url: Optional[str] = Field(default=None)

    products: List["CanonicalProduct"] = Relationship(back_populates="brand")


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(nullable=False)
    parent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="categories.id")
    slug: str = Field(index=True, unique=True, nullable=False)

    products: List["CanonicalProduct"] = Relationship(back_populates="category")


class CanonicalProduct(SQLModel, table=True):
    __tablename__ = "canonical_products"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    gtin_barcode: Optional[str] = Field(default=None, index=True, unique=True)
    brand_id: Optional[uuid.UUID] = Field(default=None, foreign_key="brands.id")
    title: str = Field(index=True, nullable=False)
    normalized_title: Optional[str] = Field(default=None, index=True)
    unit_size: Optional[str] = Field(default=None)
    category_id: Optional[uuid.UUID] = Field(default=None, foreign_key="categories.id")
    description: Optional[str] = Field(default=None)
    high_res_image_url: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    brand: Optional[Brand] = Relationship(back_populates="products")
    category: Optional[Category] = Relationship(back_populates="products")
    listings: List["PlatformListing"] = Relationship(back_populates="canonical_product")


class PlatformListing(SQLModel, table=True):
    __tablename__ = "platform_listings"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    canonical_product_id: uuid.UUID = Field(foreign_key="canonical_products.id", index=True)
    platform_name: str = Field(index=True, nullable=False)  # "ONDC_Seller_Node", "Amazon", "Flipkart", "Blinkit", "Zepto"
    seller_item_id: str = Field(nullable=False)
    pincode: str = Field(index=True, nullable=False)
    mrp: float = Field(nullable=False)
    selling_price: float = Field(nullable=False)
    in_stock: bool = Field(default=True)
    estimated_delivery_minutes: Optional[int] = Field(default=15)
    product_url: Optional[str] = Field(default=None)
    last_synced_at: datetime = Field(default_factory=datetime.utcnow)

    canonical_product: Optional[CanonicalProduct] = Relationship(back_populates="listings")


class PriceHistory(SQLModel, table=True):
    __tablename__ = "price_history"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    canonical_product_id: uuid.UUID = Field(foreign_key="canonical_products.id", index=True)
    platform_name: str = Field(index=True, nullable=False)
    pincode: Optional[str] = Field(default=None)
    selling_price: float = Field(nullable=False)
    mrp: float = Field(nullable=False)
    in_stock: bool = Field(default=True)
    recorded_at: datetime = Field(default_factory=datetime.utcnow)


class PriceAlert(SQLModel, table=True):
    __tablename__ = "price_alerts"

    alert_id: str = Field(primary_key=True)
    canonical_product_id: uuid.UUID = Field(foreign_key="canonical_products.id", index=True)
    platform: str = Field(nullable=False)
    target_price: Optional[float] = Field(default=None)
    alert_type: str = Field(default="below")
    drop_threshold_pct: float = Field(default=10.0)
    pincode: Optional[str] = Field(default=None)
    user_id: str = Field(index=True, nullable=False)
    webhook_url: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    triggered_at: Optional[datetime] = Field(default=None)


class AlertNotification(SQLModel, table=True):
    __tablename__ = "alert_notifications"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    alert_id: str = Field(foreign_key="price_alerts.alert_id")
    triggered_price: float = Field(nullable=False)
    target_price: float = Field(nullable=False)
    savings_amount: float = Field(default=0.0)
    notified_at: datetime = Field(default_factory=datetime.utcnow)
