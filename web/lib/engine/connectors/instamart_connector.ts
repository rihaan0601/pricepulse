import { BaseConnector } from './base_connector';
import { LocationContext, RawPlatformResponse } from '../types';
import { EXPANDED_PRODUCT_CATALOG } from '../../catalog_data';

export class InstamartConnector extends BaseConnector {
  readonly platformName = 'Instamart';

  async fetchProductData(
    query: string,
    location: LocationContext
  ): Promise<RawPlatformResponse> {
    const timestamp = new Date().toISOString();

    try {
      const filtered = EXPANDED_PRODUCT_CATALOG.filter(p =>
        !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase())
      );

      const rawItems = filtered.map(item => {
        const platformInfo = item.platforms.find(p => p.platformId === 'instamart');
        return {
          instamart_item_code: `insta_${item.id}`,
          item_display_name: item.name,
          variant_dimension: item.weight,
          maximum_price: platformInfo?.mrp || 0,
          store_price: platformInfo?.price || 0,
          in_stock_flag: platformInfo?.inStock ?? false,
          sla_minutes: parseInt(platformInfo?.deliveryTime || '15'),
          item_web_url: `https://www.swiggy.com/instamart/item/${item.id}`,
          thumbnail_url: item.imageUrl,
          node_id: location.dark_store_id || 'SWG_NODE_44',
        };
      });

      return {
        platform: this.platformName,
        query,
        raw_items: rawItems,
        fetched_at: timestamp,
      };
    } catch (error: any) {
      return {
        platform: this.platformName,
        query,
        raw_items: [],
        fetched_at: timestamp,
        error: error.message || 'Instamart connection failed',
      };
    }
  }
}
