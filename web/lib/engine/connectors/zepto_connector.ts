import { BaseConnector } from './base_connector';
import { LocationContext, RawPlatformResponse } from '../types';
import { EXPANDED_PRODUCT_CATALOG } from '../../catalog_data';

export class ZeptoConnector extends BaseConnector {
  readonly platformName = 'Zepto';

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
        const platformInfo = item.platforms.find(p => p.platformId === 'zepto');
        return {
          zepto_sku_id: `zep_${item.id}`,
          product_name: item.name,
          pack_size: item.weight,
          max_retail_price: platformInfo?.mrp || 0,
          discounted_selling_price: platformInfo?.price || 0,
          is_available: platformInfo?.inStock ?? false,
          delivery_duration_mins: parseInt(platformInfo?.deliveryTime || '10'),
          deep_link_url: `https://www.zeptonow.com/pn/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/pdp/${item.id}`,
          media_url: item.imageUrl,
          hub_id: location.dark_store_id || 'ZEP_HUB_101',
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
        error: error.message || 'Zepto connection failed',
      };
    }
  }
}
