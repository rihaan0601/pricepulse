import { LocationContext, RawPlatformResponse } from '../types';

export abstract class BaseConnector {
  abstract readonly platformName: string;

  /**
   * Standardized async method exposed by every platform connector
   */
  abstract fetchProductData(
    query: string,
    location: LocationContext
  ): Promise<RawPlatformResponse>;
}
