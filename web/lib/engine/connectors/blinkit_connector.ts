import { BaseConnector } from './base_connector';
import { LocationContext, RawPlatformResponse } from '../types';
import { EXPANDED_PRODUCT_CATALOG } from '../../catalog_data';

export class BlinkitConnector extends BaseConnector {
  readonly platformName = 'Blinkit';

  async fetchProductData(
    query: string,
    location: LocationContext
  ): Promise<RawPlatformResponse> {
    const timestamp = new Date().toISOString();

    try {
      // Filter catalog items matching query and format into raw Blinkit payload structure
      const filtered = EXPANDED_PRODUCT_CATALOG.filter(p =>
        !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase())
      );

      const rawItems = filtered.map(item => {
        const platformInfo = item.platforms.find(p => p.platformId === 'blinkit');
        return {
          blinkit_item_id: `blk_${item.id}`,
          title: item.name,
          quantity_unit: item.weight,
          mrp: platformInfo?.mrp || 0,
          offer_price: platformInfo?.price || 0,
          inventory_status: platformInfo?.inStock ? 'AVAILABLE' : 'OUT_OF_STOCK',
          eta_minutes: parseInt(platformInfo?.deliveryTime || '12'),
          product_url: `https://blinkit.com/prn/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/prid/${item.id}`,
          image_url: item.imageUrl,
          dark_store_code: location.dark_store_id || 'BLK_DEL_01',
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
        error: error.message || 'Blinkit connection failed',
      };
    }
  }
}
