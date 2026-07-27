# Multi-Platform Quick-Commerce Catalog & Price Harvester

High-throughput, resilient Python backend engine designed to discover, extract, normalize, and store maximum unique product SKUs and live pricing across major Indian Quick-Commerce platforms:
1. **Blinkit**
2. **Zepto**
3. **Swiggy Instamart**
4. **Flipkart Minutes**
5. **Amazon Fresh / Now**

---

## 🚀 Key Features

### 1. Adapter Pattern Architecture
Each quick-commerce platform operates as an isolated adapter inheriting from `BaseHarvesterAdapter` (`harvester/adapters/base.py`).

### 2. Geographically Distributed Pincode Matrix
Sweeps dark-store coverage across 12 key metro hubs (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad) using precise geo-coordinates (`lat`, `lng`) to bypass dark-store regional catalog limits.

### 3. Exhaustive Category & Search Dictionary Sweeper
Fuses category tree traversal with an exhaustive seed dictionary across 70+ FMCG, Grocery, Personal Care, and Pantry categories.

### 4. Canonical SKU Normalizer
Transforms raw vendor payloads into standardized `CanonicalSKU` objects:
- Title standardization & unit metric normalization (`g`, `ml`, `pcs`).
- Price-per-unit metric computation (`₹/g` or `₹/ml`).
- Brand extraction & deterministic md5 SKU hashing.

### 5. Multi-Target Persistence
Exports harvested data to `JSONL` files, Redis cache, and PostgreSQL database.

---

## 🛠️ Usage Instructions

### 1. Installation
```bash
pip install -r harvester/requirements.txt
```

### 2. Run Harvester Engine
```bash
# Run a quick harvest sweep across all platforms & metro pincodes
python harvester/main.py --keywords 10 --output output/
```

Output will be written to `output/harvested_catalog.jsonl`.
