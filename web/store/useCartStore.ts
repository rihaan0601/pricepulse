import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlatformName = 'ondc' | 'zepto' | 'blinkit' | 'instamart' | 'flipkart_minutes' | 'amazon_fresh';

export interface PlatformPrice {
  platform: PlatformName;
  price: number;
  mrp?: number;
  inStock: boolean;
  deliveryMins?: number;
}

export interface CartProduct {
  id: string;
  title: string;
  brand: string;
  unit: string;
  category: string;
  gtin?: string;
  mrp?: number;
  imageUrl?: string;
  platforms: PlatformPrice[];
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface LocationPreset {
  name: string;
  pincode: string;
  city: string;
  area: string;
}

export const LOCATION_PRESETS: LocationPreset[] = [
  { name: "HSR Layout", pincode: "560034", city: "Bengaluru", area: "Sector 3" },
  { name: "Indiranagar", pincode: "560038", city: "Bengaluru", area: "100ft Road" },
  { name: "Koramangala", pincode: "560095", city: "Bengaluru", area: "5th Block" },
  { name: "Connaught Place", pincode: "110001", city: "New Delhi", area: "Inner Circle" },
  { name: "Powai", pincode: "400076", city: "Mumbai", area: "Hiranandani" }
];

interface LocationContext {
  lat: number | null;
  lng: number | null;
  pincode: string;
  city: string;
  area: string;
  isSet: boolean;
}

interface CartStore {
  location: LocationContext;
  cart: CartItem[];
  setLocation: (loc: Partial<LocationContext>) => void;
  selectLocationPreset: (pincode: string) => void;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      location: {
        lat: 12.9141,
        lng: 77.6412,
        pincode: "560034",
        city: "Bengaluru",
        area: "HSR Layout",
        isSet: true,
      },
      cart: [],
      setLocation: (loc) =>
        set((state) => ({
          location: { ...state.location, ...loc, isSet: true },
        })),
      selectLocationPreset: (pincodeStr) => {
        const preset = LOCATION_PRESETS.find((p) => p.pincode === pincodeStr) || LOCATION_PRESETS[0];
        set({
          location: {
            lat: 12.9141,
            lng: 77.6412,
            pincode: preset.pincode,
            city: preset.city,
            area: preset.name,
            isSet: true,
          },
        });
      },
      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.product.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { product, quantity: 1 }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        })),
      updateQuantity: (productId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { cart: state.cart.filter((item) => item.product.id !== productId) };
          }
          return {
            cart: state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity: qty } : item
            ),
          };
        }),
      clearCart: () => set({ cart: [] }),
      getCartCount: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'pricepulse-cart',
    }
  )
);
