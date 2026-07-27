import { NextResponse } from 'next/server';
import { optimizeCart } from '@/lib/optimizer';
import { CartItem, PlatformName, LivePriceEntry, PlatformFeeRule, PlatformOffer } from '@/lib/types';
import { EXPANDED_PRODUCT_CATALOG } from '@/lib/catalog_data';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cartItems, pincode } = body as { cartItems: CartItem[], pincode: string };

    // Build price map from the expanded catalog
    const prices = new Map<string, Map<PlatformName, LivePriceEntry>>();
    
    for (const item of cartItems) {
      const catalogProduct = EXPANDED_PRODUCT_CATALOG.find(p => p.id === item.masterProductId);
      if (catalogProduct) {
        const platformMap = new Map<PlatformName, LivePriceEntry>();
        for (const p of catalogProduct.platforms) {
          platformMap.set(p.platformId as PlatformName, {
            sellingPrice: p.price,
            inStock: p.inStock,
            title: catalogProduct.name,
          });
        }
        prices.set(item.masterProductId, platformMap);
      }
    }

    // Realistic fee rules per platform
    const feeRules = new Map<PlatformName, PlatformFeeRule>();
    feeRules.set('zepto', { platform_name: 'zepto', pincode, min_order_free_delivery: 199, base_delivery_fee: 25, handling_fee: 4, surge_fee: 0 });
    feeRules.set('blinkit', { platform_name: 'blinkit', pincode, min_order_free_delivery: 249, base_delivery_fee: 30, handling_fee: 6, surge_fee: 10 });
    feeRules.set('instamart', { platform_name: 'instamart', pincode, min_order_free_delivery: 149, base_delivery_fee: 20, handling_fee: 5, surge_fee: 0 });
    feeRules.set('flipkart_minutes', { platform_name: 'flipkart_minutes', pincode, min_order_free_delivery: 199, base_delivery_fee: 25, handling_fee: 3, surge_fee: 0 });
    feeRules.set('amazon_now', { platform_name: 'amazon_now', pincode, min_order_free_delivery: 499, base_delivery_fee: 40, handling_fee: 0, surge_fee: 0 });

    // Realistic offers
    const offers: PlatformOffer[] = [
      { platform_name: 'zepto', code: 'HDFC10', min_cart_value: 300, discount_type: 'percentage', discount_value: 10, max_discount: 100, payment_method: 'HDFC' },
      { platform_name: 'blinkit', code: 'UPI50', min_cart_value: 199, discount_type: 'flat', discount_value: 50, max_discount: 50, payment_method: 'UPI' },
      { platform_name: 'instamart', code: 'CRED15', min_cart_value: 250, discount_type: 'percentage', discount_value: 15, max_discount: 75, payment_method: 'CRED' },
      { platform_name: 'flipkart_minutes', code: 'FKAXIS', min_cart_value: 200, discount_type: 'percentage', discount_value: 10, max_discount: 80, payment_method: 'Axis' },
      { platform_name: 'amazon_now', code: 'ICICI20', min_cart_value: 500, discount_type: 'percentage', discount_value: 20, max_discount: 150, payment_method: 'ICICI' },
    ];

    const result = optimizeCart({ cartItems, prices, feeRules, offers });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Optimize API Error:', error);
    return NextResponse.json({ error: 'Failed to optimize cart' }, { status: 500 });
  }
}
