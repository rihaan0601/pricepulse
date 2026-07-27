"""
Quick Commerce AI Engine — Main Demo Script
============================================
Demonstrates the complete product lifecycle:
1. Generate demo catalog (or load from Open Food Facts)
2. Cross-platform product matching (GTIN + fuzzy)
3. Price comparison across platforms
4. Basket optimization (cheapest / fastest split)
5. Deep link generation for user handoff
6. High-res image harvesting

Usage:
    python -m harvester.demo            # Run full pipeline demo
    python -m harvester.demo --api      # Start the FastAPI server
    python -m harvester.demo --search "amul butter"  # Quick search demo
"""

import asyncio
import argparse
import json
import sys
import os
import logging

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("QCommerceEngine")


def print_banner():
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║           🚀 QUICK COMMERCE AI ENGINE — PricePulse v2.0            ║
║                                                                    ║
║   Modules:  Catalog Matcher • Price Engine • Basket Splitter       ║
║             Deep Link Generator • Image Harvester • FastAPI        ║
║                                                                    ║
║   Platforms: Blinkit • Zepto • Swiggy Instamart                    ║
║              Flipkart Minutes • Amazon Fresh                       ║
║                                                                    ║
║   Data Sources: Open Food Facts (Open Data)                        ║
║                 Amazon PA-API / Flipkart Affiliate (Official)      ║
╚══════════════════════════════════════════════════════════════════════╝
""")


async def demo_pipeline():
    """Run the complete demo pipeline."""
    from harvester.connectors.demo_connector import DemoDataConnector
    from harvester.core.price_engine import PriceComparisonEngine
    from harvester.core.basket_splitter import BasketSplitter
    from harvester.core.deeplink_generator import DeepLinkGenerator

    print_banner()

    # ──────────────────────────────────────────────
    # STEP 1: Generate Demo Catalog
    # ──────────────────────────────────────────────
    logger.info("━" * 60)
    logger.info("STEP 1: Generating demo catalog (50+ Indian FMCG products)")
    logger.info("━" * 60)

    catalog = DemoDataConnector.generate_full_catalog(pincode="560038")
    logger.info(f"✅ Generated {len(catalog)} canonical products")
    total_listings = sum(len(p["platform_listings"]) for p in catalog)
    logger.info(f"   → {total_listings} platform listings across 5 platforms")

    # ──────────────────────────────────────────────
    # STEP 2: Price Comparison Engine Demo
    # ──────────────────────────────────────────────
    logger.info("")
    logger.info("━" * 60)
    logger.info("STEP 2: Price Comparison Engine — Search & Compare")
    logger.info("━" * 60)

    engine = PriceComparisonEngine(catalog)

    # Search demo
    queries = ["amul butter", "maggi noodles", "tata salt", "colgate"]
    for query in queries:
        results = engine.search(query)
        if results:
            top = results[0]
            listings = top.get("platform_listings", [])
            in_stock = [l for l in listings if l.get("in_stock")]
            if in_stock:
                cheapest = min(in_stock, key=lambda x: x["selling_price"])
                costliest = max(in_stock, key=lambda x: x["selling_price"])
                savings = round(costliest["selling_price"] - cheapest["selling_price"], 2)
                print(f"\n  🔍 \"{query}\" → {top['title']}")
                print(f"     Cheapest: ₹{cheapest['selling_price']} on {cheapest['platform']}")
                print(f"     Costliest: ₹{costliest['selling_price']} on {costliest['platform']}")
                print(f"     💰 Potential saving: ₹{savings}")
            else:
                print(f"\n  🔍 \"{query}\" → {top['title']} (all out of stock)")
        else:
            print(f"\n  🔍 \"{query}\" → No results found")

    # ──────────────────────────────────────────────
    # STEP 3: Basket Optimization Demo
    # ──────────────────────────────────────────────
    logger.info("")
    logger.info("━" * 60)
    logger.info("STEP 3: Multi-Platform Basket Optimization")
    logger.info("━" * 60)

    shopping_list = [
        {"query": "amul butter 500g", "qty": 1},
        {"query": "tata salt", "qty": 2},
        {"query": "maggi noodles", "qty": 1},
        {"query": "colgate", "qty": 1},
        {"query": "bisleri water", "qty": 3},
        {"query": "cadbury dairy milk", "qty": 2},
        {"query": "surf excel", "qty": 1},
        {"query": "red label tea", "qty": 1},
    ]

    print(f"\n  🛒 Shopping List ({len(shopping_list)} items):")
    for item in shopping_list:
        print(f"     • {item['query']} × {item['qty']}")

    # Compare full basket costs
    basket_result = engine.compare_basket(shopping_list)

    if "single_platform_costs" in basket_result:
        print(f"\n  📊 Single-Platform Basket Costs:")
        for platform, cost in sorted(basket_result["single_platform_costs"].items(), key=lambda x: x[1]):
            items_found = basket_result.get("platform_item_counts", {}).get(platform, "?")
            print(f"     {platform}: ₹{cost:.2f} ({items_found} items available)")

        if "best_single_platform" in basket_result:
            best = basket_result["best_single_platform"]
            print(f"\n  🏆 Best Single Platform: {best['platform']} — ₹{best['total']:.2f}")

    # Optimized split basket
    splitter = BasketSplitter()

    # Find matching products for basket items
    basket_products = []
    for item in shopping_list:
        results = engine.search(item["query"])
        if results:
            basket_products.append(results[0])

    if basket_products:
        split_result = splitter.split_basket(basket_products, mode="cheapest")
        print(f"\n  ⚡ Optimized Split Basket (Cheapest Mode):")
        for platform_order in split_result.get("platforms", []):
            platform = platform_order["platform"]
            subtotal = platform_order["subtotal"]
            items = platform_order.get("items", [])
            delivery = platform_order.get("delivery_time_minutes", "?")
            print(f"     📦 {platform} (⏱ ~{delivery} min): ₹{subtotal:.2f}")
            for item in items:
                print(f"        • {item.get('title', item.get('query', '?'))}: ₹{item.get('price', 0):.2f}")

        grand = split_result.get("grand_total", 0)
        savings = split_result.get("savings_vs_single", 0)
        print(f"\n     💰 Grand Total: ₹{grand:.2f}")
        if savings > 0:
            print(f"     🎉 You save ₹{savings:.2f} vs best single platform!")

    # ──────────────────────────────────────────────
    # STEP 4: Deep Link Generation
    # ──────────────────────────────────────────────
    logger.info("")
    logger.info("━" * 60)
    logger.info("STEP 4: Platform Deep Link Generation")
    logger.info("━" * 60)

    linker = DeepLinkGenerator()
    platforms = ["Blinkit", "Zepto", "Swiggy Instamart", "Flipkart Minutes", "Amazon Fresh"]
    print(f"\n  🔗 Search links for 'amul butter':")
    for platform in platforms:
        link = linker.generate_search_link(platform, "amul butter")
        print(f"     {platform}: {link}")

    # ──────────────────────────────────────────────
    # STEP 5: Open Food Facts Lookup Demo
    # ──────────────────────────────────────────────
    logger.info("")
    logger.info("━" * 60)
    logger.info("STEP 5: Open Food Facts GTIN Barcode Lookup")
    logger.info("━" * 60)

    from harvester.connectors.open_food_facts import OpenFoodFactsConnector

    # Search for Indian products
    off_results = await OpenFoodFactsConnector.search_products("amul butter", page_size=3)
    if off_results:
        print(f"\n  🌍 Open Food Facts — Found {len(off_results)} results for 'amul butter':")
        for r in off_results:
            print(f"     • {r['brand']} — {r['title']} ({r.get('quantity', '?')})")
            print(f"       Barcode: {r['barcode']}")
            images = r.get("images", {})
            if images:
                print(f"       Images: {', '.join(images.keys())}")
    else:
        print(f"\n  🌍 Open Food Facts — No results (network may be unavailable)")

    # ──────────────────────────────────────────────
    # SUMMARY
    # ──────────────────────────────────────────────
    print(f"""
╔══════════════════════════════════════════════════════════════════════╗
║                     ✅ DEMO PIPELINE COMPLETE                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  📦 Products in Catalog:    {len(catalog):>4}                                ║
║  🏪 Platform Listings:      {total_listings:>4}                                ║
║  🔍 Search Queries Tested:  {len(queries):>4}                                ║
║  🛒 Basket Items Optimized: {len(shopping_list):>4}                                ║
║  🔗 Deep Links Generated:   {len(platforms):>4}                                ║
║  🌍 OFF Barcode Lookups:    {len(off_results):>4}                                ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  To start the API server, run:                                     ║
║    uvicorn harvester.api.app:app --reload --port 8000              ║
║                                                                    ║
║  API Docs: http://localhost:8000/docs                              ║
╚══════════════════════════════════════════════════════════════════════╝
""")


async def search_demo(query: str):
    """Quick search demo for a single query."""
    from harvester.connectors.demo_connector import DemoDataConnector
    from harvester.core.price_engine import PriceComparisonEngine

    print_banner()
    catalog = DemoDataConnector.generate_full_catalog(pincode="560038")
    engine = PriceComparisonEngine(catalog)
    results = engine.search(query)

    if not results:
        print(f"  No results found for '{query}'")
        return

    print(f"  🔍 Search results for '{query}':\n")
    for i, product in enumerate(results[:5], 1):
        print(f"  {i}. {product['title']} ({product.get('unit_size', '')})")
        print(f"     Brand: {product['brand']} | GTIN: {product.get('gtin_barcode', 'N/A')}")
        listings = product.get("platform_listings", [])
        for listing in sorted(listings, key=lambda x: x["selling_price"]):
            stock = "✅" if listing["in_stock"] else "❌ OOS"
            discount = f" (-{listing['discount_percentage']}%)" if listing["discount_percentage"] > 0 else ""
            print(f"     {listing['platform']:>20}: ₹{listing['selling_price']:>7.2f}{discount}  {stock}  ⏱ ~{listing['estimated_delivery_minutes']} min")
        print()


def start_api_server():
    """Start the FastAPI server."""
    import uvicorn
    print_banner()
    logger.info("Starting Quick Commerce AI Engine API server...")
    logger.info("API Docs: http://localhost:8000/docs")
    logger.info("Health:   http://localhost:8000/")
    uvicorn.run("harvester.api.app:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Quick Commerce AI Engine — Demo & API Server")
    parser.add_argument("--api", action="store_true", help="Start the FastAPI server on port 8000")
    parser.add_argument("--search", type=str, default=None, help="Quick search for a product query")
    args = parser.parse_args()

    if args.api:
        start_api_server()
    elif args.search:
        asyncio.run(search_demo(args.search))
    else:
        asyncio.run(demo_pipeline())
