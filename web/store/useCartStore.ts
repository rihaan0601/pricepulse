import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlatformName = 'zepto' | 'blinkit' | 'flipkart_minutes' | 'instamart' | 'amazon_now';

export interface CartProduct {
  id: string;
  title: string;
  brand: string;
  unit: string;
  category: string;
  imageUrl?: string;
  platforms: Array<{ platform: PlatformName; price: number; inStock: boolean }>;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface LocationContext {
  lat: number | null;
  lng: number | null;
  pincode: string | null;
  city: string | null;
  isSet: boolean;
}

interface CartStore {
  location: LocationContext;
  cart: CartItem[];
  setLocation: (loc: Partial<LocationContext>) => void;
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
        lat: null,
        lng: null,
        pincode: null,
        city: null,
        isSet: false,
      },
      cart: [],
      setLocation: (loc) =>
        set((state) => ({
          location: { ...state.location, ...loc, isSet: true },
        })),
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
