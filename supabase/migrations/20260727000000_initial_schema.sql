-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Master Products Catalogue
CREATE TABLE master_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    unit_quantity TEXT, -- e.g., "500ml", "1kg"
    barcode TEXT UNIQUE,
    embedding VECTOR(1536), -- for vector-based semantic product search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Platform Mappings (Maps raw platform items to Master Products)
CREATE TABLE platform_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_product_id UUID REFERENCES master_products(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL, -- 'zepto', 'blinkit', 'flipkart_minutes', 'instamart', 'amazon_now'
    external_sku_id TEXT NOT NULL,
    raw_title TEXT NOT NULL,
    product_url TEXT,
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform_name, external_sku_id)
);

-- 3. Live Price & Inventory Log
CREATE TABLE live_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_product_id UUID REFERENCES platform_products(id) ON DELETE CASCADE,
    pincode TEXT NOT NULL,
    lat NUMERIC(10, 8),
    lng NUMERIC(11, 8),
    mrp NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    max_per_order INTEGER DEFAULT 10,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Platform Delivery & Fee Rules
CREATE TABLE platform_fee_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name TEXT NOT NULL,
    pincode TEXT,
    min_order_free_delivery NUMERIC(10, 2),
    base_delivery_fee NUMERIC(10, 2) DEFAULT 0,
    handling_fee NUMERIC(10, 2) DEFAULT 0,
    surge_fee NUMERIC(10, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Offers & Promotions
CREATE TABLE platform_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name TEXT NOT NULL,
    code TEXT,
    min_cart_value NUMERIC(10, 2),
    discount_type TEXT CHECK (discount_type IN ('flat', 'percentage')),
    discount_value NUMERIC(10, 2),
    max_discount NUMERIC(10, 2),
    payment_method TEXT, -- 'HDFC', 'UPI', 'CRED', 'ALL'
    expires_at TIMESTAMP WITH TIME ZONE
);
