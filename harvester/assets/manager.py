import os
import json
import asyncio
import logging
from typing import Dict, Any, List, Optional

from harvester.assets.image_transformer import CDNImageTransformer
from harvester.assets.gtin_lookup import GTINImageLookup
from harvester.assets.image_downloader import AsyncImageDownloader

logger = logging.getLogger("AssetHarvestManager")

class AssetHarvestManager:
    """
    Asset Harvesting Orchestrator
    Transforms CDN URLs, performs GTIN fallback lookups, downloads high-res images asynchronously,
    and generates sidecar metadata JSON files matching the target schema.
    """

    def __init__(self, base_download_dir: str = "downloads"):
        self.base_download_dir = os.path.abspath(base_download_dir)
        self.downloader = AsyncImageDownloader(base_download_dir=self.base_download_dir)

    @staticmethod
    def _write_json(filepath: str, data: dict):
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    async def process_product(
        self,
        product_id: str,
        brand: str,
        title: str,
        platform_images: List[Dict[str, str]], # List of {"platform": "Blinkit", "url": "https://..."}
        gtin_barcode: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes a single product payload:
        1. Rewrites platform thumbnail CDN URLs to high-res URLs.
        2. Performs GTIN barcode lookup if available or platform images are lacking.
        3. Downloads all assets concurrently.
        4. Writes sidecar metadata JSON file.
        """
        logger.info(f"Processing product assets: [{product_id}] {brand} - {title}")

        download_tasks = []

        # 1. Transform platform CDN URLs and queue download tasks
        for idx, item in enumerate(platform_images, start=1):
            platform = item.get("platform", "QuickCommerce")
            raw_url = item.get("url")
            if not raw_url:
                continue

            high_res_url, cdn_provider = CDNImageTransformer.transform(raw_url)

            task = self._download_and_format(
                url=high_res_url,
                original_url=raw_url,
                brand=brand,
                sku_id=product_id,
                platform=platform,
                index=idx
            )
            download_tasks.append(task)

        # 2. GTIN Fallback Lookup if barcode provided
        gtin_data = None
        if gtin_barcode:
            gtin_data = await GTINImageLookup.fetch_product_images_by_gtin(gtin_barcode)
            if gtin_data and "images" in gtin_data:
                for image_type, gtin_url in gtin_data["images"].items():
                    high_res_gtin_url, _ = CDNImageTransformer.transform(gtin_url)
                    task = self._download_and_format(
                        url=high_res_gtin_url,
                        original_url=gtin_url,
                        brand=brand,
                        sku_id=product_id,
                        platform=f"OpenFoodFacts_{image_type}",
                        index=90
                    )
                    download_tasks.append(task)

        # 3. Execute all asset downloads concurrently
        download_results = await asyncio.gather(*download_tasks, return_exceptions=True)

        image_assets = []
        for result in download_results:
            if isinstance(result, dict) and result:
                image_assets.append(result)

        # 4. Construct Sidecar Metadata JSON Schema
        sidecar_metadata = {
            "product_id": product_id,
            "brand": brand,
            "title": title,
            "gtin_barcode": gtin_barcode,
            "image_assets": image_assets
        }

        # Write sidecar JSON file to disk
        brand_slug = AsyncImageDownloader._sanitize_name(brand)
        sku_slug = AsyncImageDownloader._sanitize_name(product_id)
        target_dir = os.path.join(self.base_download_dir, brand_slug, sku_slug)
        os.makedirs(target_dir, exist_ok=True)

        meta_file_path = os.path.join(target_dir, "metadata.json")
        await asyncio.to_thread(self._write_json, meta_file_path, sidecar_metadata)

        logger.info(f"Saved asset sidecar metadata ({len(image_assets)} assets) -> {meta_file_path}")
        return sidecar_metadata

    async def _download_and_format(
        self,
        url: str,
        original_url: str,
        brand: str,
        sku_id: str,
        platform: str,
        index: int
    ) -> Optional[Dict[str, Any]]:
        asset_info = await self.downloader.download_image(
            url=url,
            brand=brand,
            canonical_sku_id=sku_id,
            platform_name=platform,
            image_index=index
        )
        if not asset_info:
            # Fallback to original URL if transformed URL failed
            if original_url != url:
                logger.info(f"Retrying download with original URL for {platform}")
                asset_info = await self.downloader.download_image(
                    url=original_url,
                    brand=brand,
                    canonical_sku_id=sku_id,
                    platform_name=platform,
                    image_index=index
                )

        if not asset_info:
            return None

        return {
            "source_platform": platform,
            "original_cdn_url": original_url,
            "transformed_high_res_url": url,
            "local_file_path": asset_info["local_file_path"],
            "resolution": asset_info["resolution"],
            "file_size_bytes": asset_info["file_size_bytes"],
            "format": asset_info["format"]
        }
