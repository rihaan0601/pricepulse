'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { MapPin, Target, Zap, PiggyBank, Search, ShoppingCart, LayoutDashboard, Bell, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import UserHeaderAvatar from './components/UserHeaderAvatar';
import TrendingDeals from './components/TrendingDeals';
import SavingsMeter from './components/SavingsMeter';

export default function Home() {
  const [pincode, setPincode] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const router = useRouter();
  const setLocation = useCartStore((state) => state.setLocation);
  const cartCount = useCartStore((state) => state.getCartCount());

  const handleUseLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude, isSet: true, pincode: 'Detecting...' });
          router.push('/search');
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length >= 6) {
      setLocation({ pincode, isSet: true });
      router.push('/search');
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full min-h-[90vh] animate-in fade-in duration-700">
      {/* Top Header with Auth */}
      <header className="w-full max-w-7xl mx-auto py-4 px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-indigo-400">
          PricePulse
        </h1>
        <UserHeaderAvatar />
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center w-full my-auto space-y-12 py-8">
        <div className="text-center space-y-6 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full text-sm font-medium text-primary mb-4 border border-primary/20 shadow-sm backdrop-blur-md">
            <Zap className="w-4 h-4" />
            <span>India&apos;s #1 Quick-Commerce Comparison</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary/80 animate-pulse">
              PricePulse
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
            Stop overpaying on quick-commerce. We compare Blinkit, Zepto, Instamart &amp; Amazon in real-time.
          </p>
        </div>

        <div className="flex justify-center space-x-6 py-4">
          {[
            { emoji: '🟡', name: 'Blinkit' },
            { emoji: '🟣', name: 'Zepto' },
            { emoji: '🟠', name: 'Instamart' },
            { emoji: '🔵', name: 'Amazon' }
          ].map((platform, i) => (
            <div 
              key={platform.name}
              className="flex flex-col items-center p-4 bg-background/50 border border-border/50 rounded-2xl shadow-lg backdrop-blur-md hover:scale-110 transition-transform duration-300 hover:border-primary/50"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-4xl mb-2">{platform.emoji}</span>
              <span className="text-xs font-semibold text-muted-foreground">{platform.name}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-md p-8 bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Where do you need delivery?</h2>
            <p className="text-sm text-muted-foreground">Set your location to see accurate prices</p>
          </div>

          <button 
            onClick={handleUseLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] disabled:opacity-70"
          >
            {isLocating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handlePincodeSubmit} className="flex space-x-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter Pincode"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              maxLength={6}
            />
            <button 
              type="submit"
              className="bg-secondary text-secondary-foreground px-4 py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
            >
              Go
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-12">
          {[
            { icon: Search, title: '50K+ Products' },
            { icon: Target, title: '4 Platforms' },
            { icon: Zap, title: 'Real-time Prices' },
            { icon: PiggyBank, title: 'Save ₹500/month' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl bg-card/30 border border-border/40 backdrop-blur-sm">
              <stat.icon className="w-6 h-6 text-primary mb-2 opacity-80" />
              <span className="font-semibold text-sm">{stat.title}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="w-full max-w-4xl mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          <Link href="/search" className="flex flex-col items-center justify-center p-6 bg-card/40 border border-border/50 rounded-2xl hover:bg-card/60 transition-all backdrop-blur-sm group">
            <Search className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Smart Search</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center justify-center p-6 bg-card/40 border border-border/50 rounded-2xl hover:bg-card/60 transition-all backdrop-blur-sm group relative">
            <div className="relative">
              <ShoppingCart className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-semibold">My Cart</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center justify-center p-6 bg-card/40 border border-border/50 rounded-2xl hover:bg-card/60 transition-all backdrop-blur-sm group">
            <LayoutDashboard className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Dashboard</span>
          </Link>
          <Link href="/alerts" className="flex flex-col items-center justify-center p-6 bg-card/40 border border-border/50 rounded-2xl hover:bg-card/60 transition-all backdrop-blur-sm group">
            <Bell className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Alerts</span>
          </Link>
        </div>

        {/* Trending Deals */}
        <div className="w-full max-w-6xl mt-16 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" /> Trending Deals
            </h3>
            <Link href="/compare" className="text-sm text-primary hover:underline font-medium">Compare more →</Link>
          </div>
          <TrendingDeals />
        </div>

        {/* How It Works */}
        <div className="w-full max-w-4xl mt-16 px-4 mb-20">
          <h3 className="text-2xl font-bold text-center mb-10">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -z-10 -translate-y-1/2"></div>
            
            <div className="flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-2xl border border-border/50">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <h4 className="font-bold text-lg">Search</h4>
              <p className="text-sm text-muted-foreground">Compare prices across 5 major platforms instantly.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-2xl border border-border/50">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <h4 className="font-bold text-lg">Optimize</h4>
              <p className="text-sm text-muted-foreground">AI finds the absolute cheapest cart split for your list.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-2xl border border-border/50">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <h4 className="font-bold text-lg">Save</h4>
              <p className="text-sm text-muted-foreground">Checkout via deep links or ONDC directly to save big.</p>
            </div>
          </div>
        </div>

        {/* Floating Savings Meter */}
        <SavingsMeter />
      </div>
    </div>
  );
}
