import asyncio
import logging
from typing import List, Optional, Literal, Dict
from pydantic import BaseModel
from datetime import datetime

from harvester.db.database import CatalogDatabase

logger = logging.getLogger(__name__)

class PriceAlertConfig(BaseModel):
    alert_id: str
    canonical_product_id: str
    platform: str
    target_price: Optional[float] = None
    alert_type: Literal['below', 'drop_pct'] = 'below'
    drop_threshold_pct: float = 10.0
    pincode: Optional[str] = None
    user_id: str
    webhook_url: Optional[str] = None
    is_active: bool = True
    created_at: str = ""

    def __init__(self, **data):
        if not data.get("created_at"):
            data["created_at"] = datetime.now().isoformat()
        super().__init__(**data)

class PriceAlertWorker:
    def __init__(self, db: CatalogDatabase, check_interval_seconds: int = 300):
        self.db = db
        self.check_interval_seconds = check_interval_seconds
        self.active_alerts: Dict[str, PriceAlertConfig] = {}

    async def add_alert(self, config: PriceAlertConfig):
        self.active_alerts[config.alert_id] = config
        await self.db.upsert_price_alert(config.model_dump())
        logger.info(f"Added alert {config.alert_id} for user {config.user_id}")

    async def remove_alert(self, alert_id: str):
        if alert_id in self.active_alerts:
            del self.active_alerts[alert_id]
        await self.db.deactivate_alert(alert_id)
        logger.info(f"Removed alert {alert_id}")

    def get_active_alerts(self) -> List[PriceAlertConfig]:
        return list(self.active_alerts.values())

    async def load_active_alerts(self):
        alerts = await self.db.get_active_alerts()
        for alert_dict in alerts:
            alert_dict["is_active"] = bool(alert_dict["is_active"])
            config = PriceAlertConfig(**alert_dict)
            self.active_alerts[config.alert_id] = config
        logger.info(f"Loaded {len(self.active_alerts)} active alerts")

    async def check_alerts(self) -> List[dict]:
        triggered_alerts = []
        for alert in self.active_alerts.values():
            if not alert.is_active:
                continue

            product = await self.db.get_product(alert.canonical_product_id)
            if not product or not product.get('listings'):
                continue
                
            listings = product['listings']
            platform_listing = next((l for l in listings if l['platform'] == alert.platform), None)
            
            if not platform_listing:
                continue

            current_price = platform_listing['selling_price']
            mrp = platform_listing['mrp']
            triggered = False
            savings = 0.0
            
            if alert.alert_type == 'below' and alert.target_price is not None:
                if current_price <= alert.target_price:
                    triggered = True
                    savings = alert.target_price - current_price
            elif alert.alert_type == 'drop_pct':
                drop_pct = ((mrp - current_price) / mrp * 100) if mrp > 0 else 0
                if drop_pct >= alert.drop_threshold_pct:
                    triggered = True
                    target = mrp * (1 - alert.drop_threshold_pct / 100)
                    savings = target - current_price
                    
            if triggered:
                target_val = alert.target_price if alert.alert_type == 'below' else (mrp * (1 - alert.drop_threshold_pct / 100))
                
                triggered_info = {
                    "alert_id": alert.alert_id,
                    "user_id": alert.user_id,
                    "canonical_product_id": alert.canonical_product_id,
                    "platform": alert.platform,
                    "current_price": current_price,
                    "target_price": target_val,
                    "savings": savings,
                    "webhook_url": alert.webhook_url
                }
                triggered_alerts.append(triggered_info)
                
                await self.db.record_alert_notification(
                    alert.alert_id, current_price, target_val, savings
                )
                
        return triggered_alerts

    async def run_loop(self):
        await self.load_active_alerts()
        while True:
            try:
                triggered = await self.check_alerts()
                if triggered:
                    logger.info(f"Triggered {len(triggered)} alerts")
                    for alert in triggered:
                        logger.info(f"Alert {alert['alert_id']} triggered: Price {alert['current_price']} <= Target {alert['target_price']}")
                        # In a real system, would trigger webhook here
            except Exception as e:
                logger.error(f"Error checking alerts: {e}")
            await asyncio.sleep(self.check_interval_seconds)
