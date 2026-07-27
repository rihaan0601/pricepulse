import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class ONDCBapConnector:
    """
    ONDC Beckn Protocol (BAP) Connector for Quick Commerce.
    Implements standard Beckn lifecycle for q-commerce search and order processing.
    """

    def __init__(self, dev_mode: bool = True):
        self.dev_mode = dev_mode
        self.bap_id = "pricepulse-bap.in"
        self.bap_uri = "https://api.pricepulse.in/bap"
        
    def _create_context(self, action: str, pincode: str = "560038", domain: str = "nic2004:52110") -> Dict[str, Any]:
        """Generates a valid Beckn context for ONDC requests."""
        return {
            "domain": domain,
            "country": "IND",
            "city": f"std:{pincode[:3]}" if pincode else "std:080",
            "action": action,
            "core_version": "1.2.0",
            "bap_id": self.bap_id,
            "bap_uri": self.bap_uri,
            "transaction_id": str(uuid.uuid4()),
            "message_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ttl": "PT30S"
        }

    async def search(self, query: str, lat: float, lng: float, pincode: str) -> Dict[str, Any]:
        """Builds ONDC /search Beckn request and simulates on_search response."""
        context = self._create_context(action="search", pincode=pincode)
        message = {
            "intent": {
                "item": {"descriptor": {"name": query}},
                "fulfillment": {
                    "end": {
                        "location": {
                            "gps": f"{lat},{lng}",
                            "address": {"area_code": pincode}
                        }
                    }
                }
            }
        }
        
        payload = {"context": context, "message": message}
        logger.info(f"ONDC search payload generated for query: {query}")
        
        if self.dev_mode:
            await asyncio.sleep(0.5)  # Simulate network delay
            return self._mock_on_search_response(context["transaction_id"], query)
            
        return payload

    def _mock_on_search_response(self, transaction_id: str, query: str) -> Dict[str, Any]:
        """Mocks /on_search response from ONDC seller nodes."""
        return {
            "context": {
                "transaction_id": transaction_id,
                "action": "on_search"
            },
            "message": {
                "catalog": {
                    "bpp/providers": [
                        {
                            "provider_id": "provider-1",
                            "provider_name": "Zepto",
                            "items": [
                                {
                                    "item_id": "item-101",
                                    "item_name": f"{query} - 500g",
                                    "brand": "Farm Fresh",
                                    "gtin": "1234567890123",
                                    "mrp": 180.0,
                                    "selling_price": 150.0,
                                    "in_stock": True,
                                    "fulfillment_time_mins": 10,
                                    "image_url": "https://example.com/item.jpg"
                                }
                            ]
                        }
                    ]
                }
            }
        }

    async def select_item(self, provider_id: str, items: List[Dict[str, Any]], pincode: str, lat: float, lng: float) -> Dict[str, Any]:
        """Generates Beckn /select payload to validate availability and pricing."""
        context = self._create_context(action="select", pincode=pincode)
        message = {
            "order": {
                "provider": {"id": provider_id},
                "items": [{"id": item.get("item_id", item.get("id")), "quantity": {"count": item.get("quantity", 1)}} for item in items],
                "fulfillments": [
                    {
                        "end": {
                            "location": {
                                "gps": f"{lat},{lng}",
                                "address": {"area_code": pincode}
                            }
                        }
                    }
                ]
            }
        }
        
        logger.info(f"ONDC select payload generated for provider: {provider_id}")
        
        if self.dev_mode:
            await asyncio.sleep(0.5)
            return {
                "context": context,
                "message": {
                    "order": {
                        "provider": {"id": provider_id},
                        "items": items,
                        "quote": {
                            "price": {"value": "170.0", "currency": "INR"},
                            "breakup": [
                                {"title": "item", "price": {"value": "150.0", "currency": "INR"}},
                                {"title": "delivery", "price": {"value": "20.0", "currency": "INR"}}
                            ]
                        }
                    }
                }
            }
            
        return {"context": context, "message": message}

    async def init_checkout(self, provider_id: str, items: List[Dict[str, Any]], billing: Dict[str, Any], delivery_address: Dict[str, Any]) -> Dict[str, Any]:
        """Generates Beckn /init payload to initialize cart session."""
        context = self._create_context(action="init")
        message = {
            "order": {
                "provider": {"id": provider_id},
                "items": items,
                "billing": billing,
                "fulfillments": [
                    {
                        "end": {
                            "location": delivery_address,
                            "contact": billing.get("phone", "")
                        }
                    }
                ]
            }
        }
        
        logger.info(f"ONDC init payload generated for provider: {provider_id}")
        
        if self.dev_mode:
            await asyncio.sleep(0.5)
            return {
                "context": context,
                "message": {
                    "order": {
                        "id": str(uuid.uuid4()),
                        "provider": {"id": provider_id},
                        "items": items,
                        "payment": {
                            "type": "ON-FULFILLMENT",
                            "status": "NOT-PAID"
                        }
                    }
                }
            }
            
        return {"context": context, "message": message}

    async def confirm_order(self, order_id: str, provider_id: str, items: List[Dict[str, Any]], payment_transaction_id: str) -> Dict[str, Any]:
        """Generates Beckn /confirm payload to submit order."""
        context = self._create_context(action="confirm")
        message = {
            "order": {
                "id": order_id,
                "provider": {"id": provider_id},
                "items": items,
                "payment": {
                    "params": {
                        "transaction_id": payment_transaction_id
                    },
                    "status": "PAID"
                }
            }
        }
        
        logger.info(f"ONDC confirm payload generated for order: {order_id}")
        
        if self.dev_mode:
            await asyncio.sleep(0.5)
            return {
                "context": context,
                "message": {
                    "order": {
                        "id": order_id,
                        "state": "Accepted",
                        "provider": {"id": provider_id},
                        "items": items
                    }
                }
            }
            
        return {"context": context, "message": message}
