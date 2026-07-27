import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  targetPrice: number;
  currentMinPrice: number;
  createdAt: string;
}

interface PriceAlertState {
  alerts: PriceAlert[];
  addAlert: (productId: string, productTitle: string, targetPrice: number, currentMinPrice: number) => void;
  removeAlert: (id: string) => void;
  isAlertSet: (productId: string) => boolean;
}

export const usePriceAlertStore = create<PriceAlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      addAlert: (productId, productTitle, targetPrice, currentMinPrice) => {
        const id = `alert_${productId}_${Date.now()}`;
        const newAlert: PriceAlert = {
          id,
          productId,
          productTitle,
          targetPrice,
          currentMinPrice,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          alerts: [...state.alerts.filter((a) => a.productId !== productId), newAlert],
        }));
      },
      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }));
      },
      isAlertSet: (productId) => {
        return get().alerts.some((a) => a.productId === productId);
      },
    }),
    {
      name: 'pricepulse-price-alerts',
    }
  )
);
