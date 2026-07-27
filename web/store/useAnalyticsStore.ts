import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AnalyticsEvent {
  type: 'search' | 'cart_optimized' | 'alert_set' | 'split_used' | 'product_viewed';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsState {
  events: AnalyticsEvent[];
  totalSavings: number;
  cartOptimizationCount: number;
  platformWins: Record<string, number>;
  trackEvent: (type: AnalyticsEvent['type'], metadata?: Record<string, any>) => void;
  addSavings: (amount: number, winnerPlatform: string) => void;
  getMonthlySavings: () => number;
  getTopPlatform: () => string;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      events: [],
      totalSavings: 0,
      cartOptimizationCount: 0,
      platformWins: {},

      trackEvent: (type, metadata) => {
        set((state) => ({
          events: [
            { type, timestamp: new Date().toISOString(), metadata },
            ...state.events
          ].slice(0, 100), // keep last 100
        }));
      },

      addSavings: (amount, winnerPlatform) => {
        set((state) => {
          const newPlatformWins = { ...state.platformWins };
          newPlatformWins[winnerPlatform] = (newPlatformWins[winnerPlatform] || 0) + 1;
          
          return {
            totalSavings: state.totalSavings + amount,
            cartOptimizationCount: state.cartOptimizationCount + 1,
            platformWins: newPlatformWins,
          };
        });
      },

      getMonthlySavings: () => {
        const events = get().events;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return events
          .filter(e => e.type === 'cart_optimized' && new Date(e.timestamp) > thirtyDaysAgo)
          .reduce((sum, e) => sum + (e.metadata?.savings || 0), 0);
      },

      getTopPlatform: () => {
        const wins = get().platformWins;
        if (Object.keys(wins).length === 0) return 'None';
        return Object.keys(wins).reduce((a, b) => wins[a] > wins[b] ? a : b);
      },

      reset: () => set({ events: [], totalSavings: 0, cartOptimizationCount: 0, platformWins: {} }),
    }),
    {
      name: 'pricepulse-analytics',
    }
  )
);
