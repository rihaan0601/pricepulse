import { BaseConnector } from './base_connector';
import { LocationContext, RawPlatformResponse } from '../types';
import { EXPANDED_PRODUCT_CATALOG } from '../../catalog_data';

export class FlipkartMinutesConnector extends BaseConnector {
  readonly platformName = 'Flipkart Minutes';

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
        const platformInfo = item.platforms.find(p => p.platformId === 'flipkart_minutes');
        return {
          flipkart_fsn: `FK_${item.id}`,
          title_text: item.name,
          weight_spec: item.weight,
          list_mrp: platformInfo?.mrp || 0,
          final_price: platformInfo?.price || 0,
          stock_available: platformInfo?.inStock ?? false,
          delivery_eta_mins: parseInt(platformInfo?.deliveryTime || '11'),
          pdp_link: `https://www.flipkart.com/minutes/p/${item.id}`,
          img_link: item.imageUrl,
          darkstore_id: location.dark_store_id || 'FK_DS_88',
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
        error: error.message || 'Flipkart Minutes connection failed',
      };
    }
  }
}
