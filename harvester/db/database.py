import os
import asyncio
import logging
import uuid
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, create_engine, Session, select, func
from harvester.db.models import (
    Brand, Category, CanonicalProduct, PlatformListing, PriceHistory, PriceAlert, AlertNotification
)

logger = logging.getLogger(__name__)

class CatalogDatabase:
    """Production-Grade Database Interface using SQLModel & SQLAlchemy (PostgreSQL / SQLite)."""

    def __init__(self, db_url: Optional[str] = None, db_path: str = 'pricepulse_catalog.db'):
        if db_url:
            self.db_url = db_url
        else:
            env_url = os.getenv("DATABASE_URL")
            if env_url:
                self.db_url = env_url
            else:
                self.db_url = f"sqlite:///{db_path}"

        # Handle postgresql:// schema string for SQLAlchemy 1.4/2.0 compatibility
        if self.db_url.startswith("postgres://"):
            self.db_url = self.db_url.replace("postgres://", "postgresql://", 1)

        connect_args = {"check_same_thread": False} if "sqlite" in self.db_url else {}
        self.engine = create_engine(self.db_url, connect_args=connect_args, echo=False)

    async def initialize(self) -> None:
        """Create all tables if they do not exist."""
        def _init():
            SQLModel.metadata.create_all(self.engine)
        await asyncio.to_thread(_init)
        logger.info(f"Initialized Database tables at: {self.db_url}")

    # =========================================================================
    # BRANDS & CATEGORIES
    # =========================================================================

    async def get_or_create_brand(self, name: str, logo_url: Optional[str] = None) -> Brand:
        """Get existing brand by name or create a new one."""
        def _exec():
            with Session(self.engine) as session:
                statement = select(Brand).where(Brand.name == name)
                brand = session.exec(statement).first()
                if not brand:
                    brand = Brand(name=name, logo_url=logo_url)
                    session.add(brand)
                    session.commit()
                    session.refresh(brand)
                return brand
        return await asyncio.to_thread(_exec)

    async def get_or_create_category(self, name: str, slug: str, parent_id: Optional[uuid.UUID] = None) -> Category:
        """Get existing category by slug or create a new one."""
        def _exec():
            with Session(self.engine) as session:
                statement = select(Category).where(Category.slug == slug)
                cat = session.exec(statement).first()
                if not cat:
                    cat = Category(name=name, slug=slug, parent_id=parent_id)
                    session.add(cat)
                    session.commit()
                    session.refresh(cat)
                return cat
        return await asyncio.to_thread(_exec)

    # =========================================================================
    # CANONICAL PRODUCTS
    # =========================================================================

    async def upsert_canonical_product(self, product: dict) -> dict:
        """Insert or update a canonical product."""
        def _upsert():
            with Session(self.engine) as session:
                prod_id = product.get('canonical_product_id') or product.get('id')
                parsed_uuid = uuid.UUID(str(prod_id)) if prod_id and len(str(prod_id)) == 36 else None

                db_prod = None
                if parsed_uuid:
                    db_prod = session.get(CanonicalProduct, parsed_uuid)
                elif product.get('gtin_barcode'):
                    statement = select(CanonicalProduct).where(CanonicalProduct.gtin_barcode == product.get('gtin_barcode'))
                    db_prod = session.exec(statement).first()

                if not db_prod:
                    db_prod = CanonicalProduct(
                        id=parsed_uuid or uuid.uuid4(),
                        gtin_barcode=product.get('gtin_barcode'),
                        title=product.get('title', 'Unknown Product'),
                        normalized_title=product.get('normalized_title') or product.get('title', '').lower(),
                        unit_size=product.get('unit_size'),
                        description=product.get('description'),
                        high_res_image_url=product.get('high_res_image_url') or product.get('image_url')
                    )
                    session.add(db_prod)
                else:
                    if product.get('gtin_barcode'):
                        db_prod.gtin_barcode = product['gtin_barcode']
                    if product.get('title'):
                        db_prod.title = product['title']
                    if product.get('normalized_title'):
                        db_prod.normalized_title = product['normalized_title']
                    if product.get('unit_size'):
                        db_prod.unit_size = product['unit_size']
                    if product.get('high_res_image_url') or product.get('image_url'):
                        db_prod.high_res_image_url = product.get('high_res_image_url') or product.get('image_url')

                session.commit()
                session.refresh(db_prod)

                return {
                    "canonical_product_id": str(db_prod.id),
                    "gtin_barcode": db_prod.gtin_barcode,
                    "title": db_prod.title,
                    "normalized_title": db_prod.normalized_title,
                    "unit_size": db_prod.unit_size,
                    "high_res_image_url": db_prod.high_res_image_url
                }
        return await asyncio.to_thread(_upsert)

    # =========================================================================
    # PLATFORM LISTINGS
    # =========================================================================

    async def upsert_platform_listing(self, listing: dict) -> None:
        """Insert or update a platform listing."""
        def _upsert():
            with Session(self.engine) as session:
                prod_id_str = listing.get('canonical_product_id')
                try:
                    prod_uuid = uuid.UUID(str(prod_id_str))
                except (ValueError, TypeError):
                    return

                platform_name = listing.get('platform') or listing.get('platform_name') or 'Unknown'
                sku_id = listing.get('platform_sku_id') or listing.get('seller_item_id') or str(uuid.uuid4())
                pincode = listing.get('pincode') or '110001'

                statement = select(PlatformListing).where(
                    PlatformListing.canonical_product_id == prod_uuid,
                    PlatformListing.platform_name == platform_name,
                    PlatformListing.seller_item_id == sku_id
                )
                db_listing = session.exec(statement).first()

                mrp = float(listing.get('mrp', 0.0))
                selling_price = float(listing.get('selling_price', mrp))

                if not db_listing:
                    db_listing = PlatformListing(
                        canonical_product_id=prod_uuid,
                        platform_name=platform_name,
                        seller_item_id=sku_id,
                        pincode=pincode,
                        mrp=mrp,
                        selling_price=selling_price,
                        in_stock=bool(listing.get('in_stock', 1)),
                        estimated_delivery_minutes=int(listing.get('estimated_delivery_minutes', 15)),
                        product_url=listing.get('deep_link') or listing.get('product_url')
                    )
                    session.add(db_listing)
                else:
                    db_listing.mrp = mrp
                    db_listing.selling_price = selling_price
                    db_listing.in_stock = bool(listing.get('in_stock', 1))
                    db_listing.pincode = pincode
                    if listing.get('deep_link') or listing.get('product_url'):
                        db_listing.product_url = listing.get('deep_link') or listing.get('product_url')

                session.commit()
        await asyncio.to_thread(_upsert)

    async def record_price_history(self, canonical_id: str, platform: str, pincode: Optional[str], price: float, mrp: float, in_stock: int) -> None:
        """Record price history for a platform listing."""
        def _record():
            with Session(self.engine) as session:
                try:
                    prod_uuid = uuid.UUID(str(canonical_id))
                except (ValueError, TypeError):
                    return

                history = PriceHistory(
                    canonical_product_id=prod_uuid,
                    platform_name=platform,
                    pincode=pincode,
                    selling_price=price,
                    mrp=mrp,
                    in_stock=bool(in_stock)
                )
                session.add(history)
                session.commit()
        await asyncio.to_thread(_record)

    async def get_product(self, canonical_id: str) -> Optional[dict]:
        """Get product details along with its platform listings."""
        def _get():
            with Session(self.engine) as session:
                try:
                    prod_uuid = uuid.UUID(str(canonical_id))
                except (ValueError, TypeError):
                    return None

                prod = session.get(CanonicalProduct, prod_uuid)
                if not prod:
                    return None

                statement = select(PlatformListing).where(PlatformListing.canonical_product_id == prod_uuid)
                listings = session.exec(statement).all()

                return {
                    "canonical_product_id": str(prod.id),
                    "gtin_barcode": prod.gtin_barcode,
                    "title": prod.title,
                    "normalized_title": prod.normalized_title,
                    "unit_size": prod.unit_size,
                    "high_res_image_url": prod.high_res_image_url,
                    "listings": [
                        {
                            "id": str(l.id),
                            "platform": l.platform_name,
                            "platform_sku_id": l.seller_item_id,
                            "mrp": l.mrp,
                            "selling_price": l.selling_price,
                            "in_stock": int(l.in_stock),
                            "estimated_delivery_minutes": l.estimated_delivery_minutes,
                            "pincode": l.pincode,
                            "product_url": l.product_url
                        }
                        for l in listings
                    ]
                }
        return await asyncio.to_thread(_get)

    async def search_products(self, query: str, limit: int = 20) -> List[dict]:
        """Search products by title or normalized title."""
        def _search():
            with Session(self.engine) as session:
                term = f"%{query.lower()}%"
                statement = select(CanonicalProduct).where(
                    CanonicalProduct.title.ilike(term) | CanonicalProduct.normalized_title.ilike(term)
                ).limit(limit)
                results = session.exec(statement).all()
                return [
                    {
                        "canonical_product_id": str(p.id),
                        "gtin_barcode": p.gtin_barcode,
                        "title": p.title,
                        "normalized_title": p.normalized_title,
                        "unit_size": p.unit_size,
                        "high_res_image_url": p.high_res_image_url
                    }
                    for p in results
                ]
        return await asyncio.to_thread(_search)

    async def get_price_history(self, canonical_id: str, platform: str = None) -> List[dict]:
        """Retrieve price history for a product."""
        def _get():
            with Session(self.engine) as session:
                try:
                    prod_uuid = uuid.UUID(str(canonical_id))
                except (ValueError, TypeError):
                    return []

                statement = select(PriceHistory).where(PriceHistory.canonical_product_id == prod_uuid)
                if platform:
                    statement = statement.where(PriceHistory.platform_name == platform)
                statement = statement.order_by(PriceHistory.recorded_at.desc())

                results = session.exec(statement).all()
                return [
                    {
                        "id": str(r.id),
                        "canonical_product_id": str(r.canonical_product_id),
                        "platform": r.platform_name,
                        "pincode": r.pincode,
                        "selling_price": r.selling_price,
                        "mrp": r.mrp,
                        "in_stock": int(r.in_stock),
                        "recorded_at": r.recorded_at.isoformat()
                    }
                    for r in results
                ]
        return await asyncio.to_thread(_get)

    async def get_all_products(self, limit: int = 100) -> List[dict]:
        """Get all canonical products (limited)."""
        def _get_all():
            with Session(self.engine) as session:
                statement = select(CanonicalProduct).limit(limit)
                results = session.exec(statement).all()
                return [
                    {
                        "canonical_product_id": str(p.id),
                        "gtin_barcode": p.gtin_barcode,
                        "title": p.title,
                        "normalized_title": p.normalized_title,
                        "unit_size": p.unit_size
                    }
                    for p in results
                ]
        return await asyncio.to_thread(_get_all)

    async def get_stats(self) -> dict:
        """Get catalog statistics."""
        def _stats():
            with Session(self.engine) as session:
                products_count = session.exec(select(func.count(CanonicalProduct.id))).one()
                listings_count = session.exec(select(func.count(PlatformListing.id))).one()
                history_count = session.exec(select(func.count(PriceHistory.id))).one()
                brands_count = session.exec(select(func.count(Brand.id))).one()
                categories_count = session.exec(select(func.count(Category.id))).one()
                return {
                    "products_count": products_count,
                    "listings_count": listings_count,
                    "price_history_count": history_count,
                    "brands_count": brands_count,
                    "categories_count": categories_count
                }
        return await asyncio.to_thread(_stats)

    # =========================================================================
    # PRICE ALERTS
    # =========================================================================

    async def upsert_price_alert(self, alert: dict) -> None:
        """Upsert a price alert."""
        def _upsert():
            with Session(self.engine) as session:
                alert_id = alert['alert_id']
                db_alert = session.get(PriceAlert, alert_id)
                prod_id = alert['canonical_product_id']
                try:
                    prod_uuid = uuid.UUID(str(prod_id))
                except (ValueError, TypeError):
                    prod_uuid = uuid.uuid4()

                if not db_alert:
                    db_alert = PriceAlert(
                        alert_id=alert_id,
                        canonical_product_id=prod_uuid,
                        platform=alert['platform'],
                        target_price=alert.get('target_price'),
                        alert_type=alert.get('alert_type', 'below'),
                        drop_threshold_pct=alert.get('drop_threshold_pct', 10.0),
                        pincode=alert.get('pincode'),
                        user_id=alert['user_id'],
                        webhook_url=alert.get('webhook_url'),
                        is_active=bool(alert.get('is_active', True))
                    )
                    session.add(db_alert)
                else:
                    db_alert.target_price = alert.get('target_price')
                    db_alert.is_active = bool(alert.get('is_active', True))

                session.commit()
        await asyncio.to_thread(_upsert)

    async def get_user_alerts(self, user_id: str) -> List[dict]:
        """Get all alerts for a user."""
        def _get():
            with Session(self.engine) as session:
                statement = select(PriceAlert).where(PriceAlert.user_id == user_id)
                results = session.exec(statement).all()
                return [
                    {
                        "alert_id": a.alert_id,
                        "canonical_product_id": str(a.canonical_product_id),
                        "platform": a.platform,
                        "target_price": a.target_price,
                        "alert_type": a.alert_type,
                        "drop_threshold_pct": a.drop_threshold_pct,
                        "pincode": a.pincode,
                        "user_id": a.user_id,
                        "is_active": a.is_active,
                        "created_at": a.created_at.isoformat()
                    }
                    for a in results
                ]
        return await asyncio.to_thread(_get)

    async def get_active_alerts(self) -> List[dict]:
        """Get active price alerts."""
        def _get():
            with Session(self.engine) as session:
                statement = select(PriceAlert).where(PriceAlert.is_active == True)
                results = session.exec(statement).all()
                return [
                    {
                        "alert_id": a.alert_id,
                        "canonical_product_id": str(a.canonical_product_id),
                        "platform": a.platform,
                        "target_price": a.target_price,
                        "alert_type": a.alert_type,
                        "drop_threshold_pct": a.drop_threshold_pct,
                        "pincode": a.pincode,
                        "user_id": a.user_id,
                        "is_active": a.is_active
                    }
                    for a in results
                ]
        return await asyncio.to_thread(_get)

    async def deactivate_alert(self, alert_id: str) -> None:
        """Deactivate alert by ID."""
        def _deactivate():
            with Session(self.engine) as session:
                alert = session.get(PriceAlert, alert_id)
                if alert:
                    alert.is_active = False
                    session.commit()
        await asyncio.to_thread(_deactivate)

    async def record_alert_notification(self, alert_id: str, triggered_price: float, target_price: float, savings: float) -> None:
        """Record an alert notification."""
        def _record():
            with Session(self.engine) as session:
                notif = AlertNotification(
                    alert_id=alert_id,
                    triggered_price=triggered_price,
                    target_price=target_price,
                    savings_amount=savings
                )
                session.add(notif)
                session.commit()
        await asyncio.to_thread(_record)
