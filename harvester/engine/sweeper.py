import asyncio
import logging
from typing import List, Dict, Any, Callable, Optional
import httpx

logger = logging.getLogger("SweeperEngine")


from harvester.adapters.base import BaseHarvesterAdapter, RawProductItem
from harvester.adapters.blinkit import BlinkitAdapter
from harvester.adapters.zepto import ZeptoAdapter
from harvester.adapters.instamart import InstamartAdapter
from harvester.adapters.flipkart_minutes import FlipkartMinutesAdapter
from harvester.adapters.amazon_fresh import AmazonFreshAdapter
from harvester.config import METRO_PINCODES, SEARCH_DICTIONARY, MAX_CONCURRENT_REQUESTS, USER_AGENT
from harvester.engine.normalizer import CatalogNormalizer, CanonicalSKU

class HarvesterSweeperEngine:
    """High-throughput multi-platform geographically distributed harvest engine."""

    def __init__(self, item_callback: Optional[Callable[[CanonicalSKU], None]] = None):
        self.adapters: List[BaseHarvesterAdapter] = [
            BlinkitAdapter(),
            ZeptoAdapter(),
            InstamartAdapter(),
            FlipkartMinutesAdapter(),
            AmazonFreshAdapter(),
        ]
        self.item_callback = item_callback
        self.semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    async def _sweep_platform_location_keyword(
        self,
        adapter: BaseHarvesterAdapter,
        location: Dict[str, Any],
        keyword: str,
        client: httpx.AsyncClient,
    ) -> List[CanonicalSKU]:
        async with self.semaphore:
            loc_ctx = await adapter.resolve_location_context(
                pincode=location["pincode"], lat=location["lat"], lng=location["lng"]
            )
            raw_items: List[RawProductItem] = await adapter.harvest_by_keyword(
                keyword=keyword, location_ctx=loc_ctx, client=client
            )
            
            canonical_skus: List[CanonicalSKU] = []
            for raw in raw_items:
                skus = CatalogNormalizer.process_raw_item(raw)
                canonical_skus.append(skus)
                if self.item_callback:
                    self.item_callback(skus)
                    
            return canonical_skus

    async def run_full_sweep(self, max_keywords: int = 20) -> List[CanonicalSKU]:
        """Executes full distributed sweep across all metro pincodes, platforms, and search dictionary."""
        logger.info(f"Starting Multi-Platform Harvester Sweep: {len(self.adapters)} Adapters across {len(METRO_PINCODES)} Metro Pincodes.")
        
        keywords_to_sweep = SEARCH_DICTIONARY[:max_keywords]
        total_tasks = len(self.adapters) * len(METRO_PINCODES) * len(keywords_to_sweep)
        logger.info(f"Total Sweep Tasks Scheduled: {total_tasks}")

        all_skus: List[CanonicalSKU] = []
        limits = httpx.Limits(max_keepalive_connections=50, max_connections=100)
        async with httpx.AsyncClient(limits=limits, headers={"User-Agent": USER_AGENT}) as client:
            tasks = []
            for adapter in self.adapters:
                for loc in METRO_PINCODES:
                    for kw in keywords_to_sweep:
                        tasks.append(
                            self._sweep_platform_location_keyword(adapter, loc, kw, client)
                        )
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, list):
                    all_skus.extend(res)

        logger.info(f"Sweep Completed Successfully. Harvested {len(all_skus)} canonical SKU records.")
        return all_skus
