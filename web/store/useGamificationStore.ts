import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: string | null;
}

export interface GamificationState {
  xp: number;
  level: number;
  badges: Badge[];
  cartOptimizationCount: number;
  totalSavingsAmount: number;
  splitOrderCount: number;
  alertCount: number;
  fastestModeCount: number;
  addXP: (amount: number) => void;
  recordCartOptimization: (savingsAmount: number, isFastestMode?: boolean) => void;
  recordSplitOrder: () => void;
  recordAlert: () => void;
  checkAndUnlockBadges: () => void;
}

const DEFAULT_BADGES: Badge[] = [
  { id: 'first_save', name: 'First Optimization', description: 'Your first cart optimized', emoji: '🛒', unlockedAt: null },
  { id: 'power_saver', name: 'Power Saver', description: 'Total savings ≥ ₹500', emoji: '💎', unlockedAt: null },
  { id: 'alert_master', name: 'Alert Master', description: '5+ alerts set', emoji: '🔔', unlockedAt: null },
  { id: 'split_champion', name: 'Split Champion', description: '10+ split orders', emoji: '🔀', unlockedAt: null },
  { id: 'deal_hunter', name: 'Deal Hunter', description: '25+ cart optimizations', emoji: '🏆', unlockedAt: null },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Used fastest mode 5 times', emoji: '⚡', unlockedAt: null },
];

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      badges: DEFAULT_BADGES,
      cartOptimizationCount: 0,
      totalSavingsAmount: 0,
      splitOrderCount: 0,
      alertCount: 0,
      fastestModeCount: 0,

      addXP: (amount) => {
        set((state) => {
          const newXp = state.xp + amount;
          return { xp: newXp, level: 1 + Math.floor(newXp / 500) };
        });
      },

      recordCartOptimization: (savingsAmount, isFastestMode) => {
        set((state) => ({
          cartOptimizationCount: state.cartOptimizationCount + 1,
          totalSavingsAmount: state.totalSavingsAmount + savingsAmount,
          fastestModeCount: isFastestMode ? state.fastestModeCount + 1 : state.fastestModeCount
        }));
        get().addXP(50);
        get().checkAndUnlockBadges();
      },

      recordSplitOrder: () => {
        set((state) => ({ splitOrderCount: state.splitOrderCount + 1 }));
        get().addXP(100);
        get().checkAndUnlockBadges();
      },

      recordAlert: () => {
        set((state) => ({ alertCount: state.alertCount + 1 }));
        get().addXP(20);
        get().checkAndUnlockBadges();
      },

      checkAndUnlockBadges: () => {
        const state = get();
        const now = new Date().toISOString();
        
        set((s) => {
          const newBadges = s.badges.map(b => {
            if (b.unlockedAt) return b;
            
            let shouldUnlock = false;
            switch (b.id) {
              case 'first_save': shouldUnlock = s.cartOptimizationCount >= 1; break;
              case 'power_saver': shouldUnlock = s.totalSavingsAmount >= 500; break;
              case 'alert_master': shouldUnlock = s.alertCount >= 5; break;
              case 'split_champion': shouldUnlock = s.splitOrderCount >= 10; break;
              case 'deal_hunter': shouldUnlock = s.cartOptimizationCount >= 25; break;
              case 'speed_demon': shouldUnlock = s.fastestModeCount >= 5; break;
            }
            
            if (shouldUnlock) {
              // Can add toast notification here if needed
              return { ...b, unlockedAt: now };
            }
            return b;
          });
          
          return { badges: newBadges };
        });
      }
    }),
    {
      name: 'pricepulse-gamification',
    }
  )
);
