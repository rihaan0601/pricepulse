import { LocationInput, LocationContext } from './types';

export class LocationManager {
  /**
   * Accepts latitude, longitude, pincode, address_text and produces
   * standardized LocationContext object with injected platform headers.
   */
  public static createLocationContext(input: LocationInput): LocationContext {
    const lat = input.latitude || 28.6139; // Default Delhi coordinates
    const lng = input.longitude || 77.2090;
    const pincode = input.pincode || '110001';
    const address = input.address_text || `Pincode ${pincode}, New Delhi, India`;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      'X-Pincode': pincode,
      'X-Latitude': lat.toString(),
      'X-Longitude': lng.toString(),
      'X-Client-Platform': 'web',
      'X-App-Version': '12.4.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    return {
      pincode,
      lat,
      lng,
      address_text: address,
      dark_store_id: `ds_${pincode}_01`,
      headers,
    };
  }
}
