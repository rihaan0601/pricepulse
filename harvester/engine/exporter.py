import json
import os
import logging
from typing import List
from harvester.engine.normalizer import CanonicalSKU

logger = logging.getLogger("ExporterModule")


class CatalogExporter:
    """Exports normalized catalog data to JSONL files, Redis, and Database targets."""

    def __init__(self, output_dir: str = "output"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def export_to_jsonl(self, skus: List[CanonicalSKU], filename: str = "harvested_catalog.jsonl") -> str:
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            for item in skus:
                f.write(json.dumps(item.model_dump(), ensure_ascii=False) + "\n")
        logger.info(f"Exported {len(skus)} SKUs to {filepath}")
        return filepath

    def export_summary(self, skus: List[CanonicalSKU]) -> dict:
        platform_counts = {}
        brand_counts = {}
        for s in skus:
            platform_counts[s.platform_id] = platform_counts.get(s.platform_id, 0) + 1
            brand_counts[s.brand] = brand_counts.get(s.brand, 0) + 1
            
        summary = {
            "total_harvested_skus": len(skus),
            "platform_breakdown": platform_counts,
            "top_brands": dict(sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
        }
        logger.info(f"Harvest Summary: {json.dumps(summary, indent=2)}")
        return summary
