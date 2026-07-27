import { LocationContext, RawPlatformResponse, CanonicalResponse, CanonicalResultItem } from './types';

export class SchemaNormalizer {
  /**
   * Converts disparate raw platform JSON responses into the canonical schema.
   */
  public static normalize(
    query: string,
    location: LocationContext,
    platformResponses: RawPlatformResponse[]
  ): CanonicalResponse {
    const timestamp = new Date().toISOString();
    const results: CanonicalResultItem[] = [];

    for (const res of platformResponses) {
      if (res.error || !res.raw_items) continue;

      for (const item of res.raw_items) {
        let platformProductId = '';
        let title = '';
        let variantWeight = '';
        let mrp = 0;
        let sellingPrice = 0;
        let inStock = false;
        let estimatedDeliveryMinutes = 15;
        let productUrl = '';
        let imageUrl = '';
        let darkStoreId = location.dark_store_id || null;

        if (res.platform === 'Blinkit') {
          platformProductId = item.blinkit_item_id || '';
          title = item.title || '';
          variantWeight = item.quantity_unit || '';
          mrp = Number(item.mrp || 0);
          sellingPrice = Number(item.offer_price || 0);
          inStock = item.inventory_status === 'AVAILABLE';
          estimatedDeliveryMinutes = Number(item.eta_minutes || 12);
          productUrl = item.product_url || '';
          imageUrl = item.image_url || '';
          darkStoreId = item.dark_store_code || darkStoreId;
        } else if (res.platform === 'Zepto') {
          platformProductId = item.zepto_sku_id || '';
          title = item.product_name || '';
          variantWeight = item.pack_size || '';
          mrp = Number(item.max_retail_price || 0);
          sellingPrice = Number(item.discounted_selling_price || 0);
          inStock = Boolean(item.is_available);
          estimatedDeliveryMinutes = Number(item.delivery_duration_mins || 10);
          productUrl = item.deep_link_url || '';
          imageUrl = item.media_url || '';
          darkStoreId = item.hub_id || darkStoreId;
        } else if (res.platform === 'Instamart') {
          platformProductId = item.instamart_item_code || '';
          title = item.item_display_name || '';
          variantWeight = item.variant_dimension || '';
          mrp = Number(item.maximum_price || 0);
          sellingPrice = Number(item.store_price || 0);
          inStock = Boolean(item.in_stock_flag);
          estimatedDeliveryMinutes = Number(item.sla_minutes || 15);
          productUrl = item.item_web_url || '';
          imageUrl = item.thumbnail_url || '';
          darkStoreId = item.node_id || darkStoreId;
        } else if (res.platform === 'Flipkart Minutes') {
          platformProductId = item.flipkart_fsn || '';
          title = item.title_text || '';
          variantWeight = item.weight_spec || '';
          mrp = Number(item.list_mrp || 0);
          sellingPrice = Number(item.final_price || 0);
          inStock = Boolean(item.stock_available);
          estimatedDeliveryMinutes = Number(item.delivery_eta_mins || 11);
          productUrl = item.pdp_link || '';
          imageUrl = item.img_link || '';
          darkStoreId = item.darkstore_id || darkStoreId;
        }

        const discountAmount = Math.max(0, mrp - sellingPrice);
        const discountPercentage = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;

        results.push({
          platform: res.platform as any,
          platform_product_id: platformProductId,
          title,
          variant_weight: variantWeight,
          mrp,
          selling_price: sellingPrice,
          discount_amount: Math.round(discountAmount * 100) / 100,
          discount_percentage: discountPercentage,
          in_stock: inStock,
          estimated_delivery_minutes: estimatedDeliveryMinutes,
          product_url: productUrl,
          image_url: imageUrl,
          dark_store_id: darkStoreId,
        });
      }
    }

    return {
      canonical_product_id: `canon_${Date.now()}`,
      search_query: query,
      timestamp,
      location: {
        pincode: location.pincode,
        lat: location.lat,
        lng: location.lng,
      },
      results,
    };
  }
}
