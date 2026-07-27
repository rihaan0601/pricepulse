export interface LocationInput {
  latitude?: number;
  longitude?: number;
  pincode?: string;
  address_text?: string;
}

export interface LocationContext {
  pincode: string;
  lat: number;
  lng: number;
  address_text: string;
  dark_store_id?: string | null;
  headers: Record<string, string>;
}

export interface CanonicalResultItem {
  platform: 'Zepto' | 'Blinkit' | 'Instamart' | 'Flipkart Minutes' | 'Amazon Fresh';
  platform_product_id: string;
  title: string;
  variant_weight: string;
  mrp: number;
  selling_price: number;
  discount_amount: number;
  discount_percentage: number;
  in_stock: boolean;
  estimated_delivery_minutes: number;
  product_url: string;
  image_url: string;
  dark_store_id: string | null;
}

export interface CanonicalResponse {
  canonical_product_id: string;
  search_query: string;
  timestamp: string; // ISO-8601 UTC
  location: {
    pincode: string;
    lat: number;
    lng: number;
  };
  results: CanonicalResultItem[];
}

export interface RawPlatformResponse {
  platform: string;
  query: string;
  raw_items: any[];
  fetched_at: string;
  error?: string;
}
