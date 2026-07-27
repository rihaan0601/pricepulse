import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  defaultPincode?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, phone?: string) => void;
  signup: (name: string, email: string, pincode?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email, name, phone) => {
        const user: User = {
          id: `usr_${Date.now()}`,
          name: name || email.split('@')[0] || 'PricePulse User',
          email: email.toLowerCase(),
          phone: phone || '+91 9876543210',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          defaultPincode: '110001',
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true });
      },
      signup: (name, email, pincode) => {
        const user: User = {
          id: `usr_${Date.now()}`,
          name,
          email: email.toLowerCase(),
          phone: '+91 9876543210',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          defaultPincode: pincode || '110001',
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'pricepulse-user-auth',
    }
  )
);
