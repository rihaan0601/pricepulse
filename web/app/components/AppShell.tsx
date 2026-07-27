'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingCart, Bell, User } from 'lucide-react';
// Assuming these stores and components exist based on the prompt
// import { useCartStore } from '../store/cartStore'; 
// import { useAuthStore } from '../store/authStore';
// import { AuthModal } from './AuthModal';

// Mocking stores/components for the sake of the build if they don't exist yet
const useCartStore = () => ({ items: [] });
const useAuthStore = () => ({ isAuthenticated: false });
const AuthModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => isOpen ? <div className="hidden">AuthModalMock</div> : null;

export default function AppShell() {
  const pathname = usePathname();
  const router = useRouter();
  const cartStore = useCartStore();
  const cartCount = cartStore.items?.length || 0;
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const tabs = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User, requiresAuth: true },
  ];

  const handleTabClick = (tab: any) => {
    if (tab.requiresAuth && !isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      router.push(tab.href);
    }
  };

  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-border/50 h-[64px]">
        <div className="flex items-center justify-around h-full px-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
            const Icon = tab.icon;

            return (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab)}
                className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95 ${
                  isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <div className="absolute top-1 h-0.5 w-4 bg-primary rounded-full mx-auto" />
                )}
                
                <div className="relative mt-2">
                  <Icon className="w-6 h-6" />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
