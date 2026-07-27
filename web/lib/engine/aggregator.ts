import { LocationManager } from './location_manager';
import { SchemaNormalizer } from './normalizer';
import { LocationInput, CanonicalResponse } from './types';
import { BlinkitConnector } from './connectors/blinkit_connector';
import { ZeptoConnector } from './connectors/zepto_connector';
import { InstamartConnector } from './connectors/instamart_connector';
import { FlipkartMinutesConnector } from './connectors/flipkart_minutes_connector';

export class QuickCommerceEngine {
  private connectors = [
    new ZeptoConnector(),
    new BlinkitConnector(),
    new InstamartConnector(),
    new FlipkartMinutesConnector(),
  ];

  /**
   * Main entrypoint: Fetches, normalizes, and aggregates live item pricing and availability
   * across all platforms for a given pincode/GPS location.
   */
  public async searchAndNormalize(
    query: string,
    locationInput: LocationInput
  ): Promise<CanonicalResponse> {
    // 1. Create LocationContext via Hyperlocal Context Engine
    const locationContext = LocationManager.createLocationContext(locationInput);

    // 2. Concurrently execute all platform connectors
    const connectorPromises = this.connectors.map(connector =>
      connector.fetchProductData(query, locationContext)
    );

    const rawResults = await Promise.allSettled(connectorPromises);

    const successfulResponses = rawResults
      .filter((res): res is PromiseFulfilledResult<any> => res.status === 'fulfilled')
      .map(res => res.value);

    // 3. Normalize into canonical JSON schema
    return SchemaNormalizer.normalize(query, locationContext, successfulResponses);
  }
}
