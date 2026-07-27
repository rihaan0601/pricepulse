'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, User as UserIcon, LogOut, Bell, Bookmark, MapPin, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import AuthModal from './AuthModal';
import XPProgressBar from './XPProgressBar';
import SavingsBadgeSystem from './SavingsBadgeSystem';

export default function UserHeaderAvatar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {isAuthenticated && user ? (
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 bg-secondary/50 hover:bg-secondary border border-border/50 px-3 py-1.5 rounded-full transition-all"
          >
            <img
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
              alt={user.name}
              className="w-6 h-6 rounded-full border border-primary/40 bg-card"
            />
            <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">{user.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-card border border-border/60 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
              <div className="px-3 py-2 border-b border-border/40 space-y-0.5">
                <p className="text-xs font-bold text-foreground">{user.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>

              <div className="px-3 py-2 space-y-2 border-b border-border/30">
                <XPProgressBar />
                <div className="pt-1">
                  <SavingsBadgeSystem compact={true} />
                </div>
              </div>

              <button
                onClick={() => { setIsMenuOpen(false); router.push('/dashboard'); }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <span>📊</span>
                <span>Savings Dashboard</span>
              </button>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-primary" />
                <span>Saved Carts & Lists</span>
              </button>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <Bell className="w-4 h-4 text-primary" />
                <span>My Price Drop Alerts</span>
              </button>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span>Saved Delivery Addresses</span>
              </button>

              <div className="border-t border-border/30 pt-1">
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center space-x-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Register</span>
        </button>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
