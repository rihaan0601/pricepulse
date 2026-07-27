export interface MasterProduct {
  id: string;
  title: string;
  brand: string;
  category: string;
  unit_quantity: string;
  barcode: string;
  embedding: number[];
  created_at: string;
}

export interface PlatformProduct {
  id: string;
  master_product_id: string;
  platform_name: string;
  external_sku_id: string;
  raw_title: string;
  product_url: string;
  image_url: string;
  updated_at: string;
}

export interface LivePrice {
  id: string;
  platform_product_id: string;
  pincode: string;
  lat: number;
  lng: number;
  mrp: number;
  selling_price: number;
  in_stock: boolean;
  max_per_order: number;
  fetched_at: string;
}

export interface PlatformFeeRule {
  id?: string;
  platform_name: string;
  pincode: string;
  min_order_free_delivery: number;
  base_delivery_fee: number;
  handling_fee: number;
  surge_fee: number;
  updated_at?: string;
}

export interface PlatformOffer {
  id?: string;
  platform_name: string;
  code: string;
  min_cart_value: number;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  max_discount: number;
  payment_method: string;
  expires_at?: string;
}

export type PlatformName = 'zepto' | 'blinkit' | 'flipkart_minutes' | 'instamart' | 'amazon_now';

export interface CartItem {
  masterProductId: string;
  quantity: number;
}

export interface AppliedOffer {
  code: string;
  paymentMethod: string;
  discountLabel: string;
  platform: string;
  amount: number;
}

export interface PlatformCartResult {
  platform: PlatformName;
  items: {
    title: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }[];
  itemsTotal: number;
  deliveryFee: number;
  handlingFee: number;
  surgeFee: number;
  discount: number;
  discountLabel: string;
  grandTotal: number;
  allInStock: boolean;
  deliveryTimeMinutes: number;
  loyaltyPoints: number;
  appliedOffers?: AppliedOffer[];
}

export interface OptimizationResult {
  bestStrategy: 'single' | 'split' | 'split3way';
  savingsAmount: number;
  singleBest: PlatformCartResult;
  splitOrders?: PlatformCartResult[];
  splitOrders3Way?: PlatformCartResult[];
  allPlatforms: PlatformCartResult[];
}

export interface LivePriceEntry {
  sellingPrice: number;
  inStock: boolean;
  title: string;
}
