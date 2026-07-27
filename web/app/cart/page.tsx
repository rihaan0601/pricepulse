'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '@/store/useCartStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { ArrowLeft, ShoppingBag, Minus, Plus, ExternalLink, Sparkles, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Zap, Tag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import DarkStoreRadar from '../components/DarkStoreRadar';
import SavingsBreakdownChart from '../components/SavingsBreakdownChart';
import PlatformOfferBadge from '../components/PlatformOfferBadge';
import { OptimizationResult, PlatformCartResult } from '@/lib/types';

export default function CartPage() {
  const router = useRouter();
  const { cart, location, updateQuantity, removeFromCart, getCartCount } = useCartStore();
  const analytics = useAnalyticsStore();
  const gamification = useGamificationStore();
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [strategyMode, setStrategyMode] = useState<'cheapest' | 'fastest' | 'bank_offers' | '3way_split'>('cheapest');

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const cartItems = cart.map(item => ({
        masterProductId: item.product.id,
        quantity: item.quantity,
      }));

      // Pass the mode down; the backend (api/optimize) should just forward it to our optimizer function.
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, pincode: location.pincode || '110001', mode: strategyMode }),
      });

      if (!res.ok) throw new Error('Optimization failed');
      return res.json() as Promise<OptimizationResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.savingsAmount > 0) {
        const winnerPlatform = data.bestStrategy === 'single' ? data.singleBest.platform : 'split';
        analytics.addSavings(data.savingsAmount, winnerPlatform);
      }
      gamification.recordCartOptimization(data.savingsAmount, strategyMode === 'fastest');
      if (data.bestStrategy !== 'single') {
        gamification.recordSplitOrder();
      }
    },
  });

  const getPlatformColors = (name: string) => {
    switch (name) {
      case 'zepto': return { border: 'border-purple-500/40', bg: 'bg-purple-500/5', text: 'text-purple-400', accent: 'bg-purple-500' };
      case 'blinkit': return { border: 'border-yellow-500/40', bg: 'bg-yellow-500/5', text: 'text-yellow-400', accent: 'bg-yellow-500' };
      case 'instamart': return { border: 'border-orange-500/40', bg: 'bg-orange-500/5', text: 'text-orange-400', accent: 'bg-orange-500' };
      case 'flipkart_minutes': return { border: 'border-blue-500/40', bg: 'bg-blue-500/5', text: 'text-blue-400', accent: 'bg-blue-500' };
      case 'amazon_now': return { border: 'border-cyan-500/40', bg: 'bg-cyan-500/5', text: 'text-cyan-400', accent: 'bg-cyan-500' };
      default: return { border: 'border-border', bg: 'bg-card', text: 'text-foreground', accent: 'bg-muted' };
    }
  };

  const formatPlatformName = (name: string) => {
    const names: Record<string, string> = {
      zepto: 'Zepto', blinkit: 'Blinkit', instamart: 'Instamart',
      flipkart_minutes: 'Flipkart Minutes', amazon_now: 'Amazon Fresh',
    };
    return names[name] || name;
  };

  if (getCartCount() === 0 && !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add items from our catalog to compare prices across all platforms.</p>
        <button onClick={() => router.push('/search')} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
          Start Shopping
        </button>
      </div>
    );
  }

  const renderPlatformCard = (platform: PlatformCartResult, isRecommended = false) => {
    const colors = getPlatformColors(platform.platform);
    return (
      <div key={platform.platform} className={cn(
        "border rounded-2xl p-5 flex flex-col space-y-4 transition-all",
        colors.border, colors.bg,
        isRecommended && "ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
      )}>
        {isRecommended && (
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Recommended Winner</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn("w-2.5 h-2.5 rounded-full", colors.accent)} />
            <h4 className={cn("text-lg font-bold", colors.text)}>{formatPlatformName(platform.platform)}</h4>
          </div>
          <span className="text-xs font-medium bg-background/50 px-2 py-1 rounded-md border border-border/50 flex space-x-2">
            <span>{platform.items.length} items</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-3 text-xs text-muted-foreground font-medium">
          <div className="flex items-center space-x-1">
            <span className="text-[10px]">⏱</span>
            <span>~{platform.deliveryTimeMinutes || 15} mins</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px]">🪙</span>
            <span>~{platform.loyaltyPoints || Math.floor(platform.grandTotal / 10)} pts</span>
          </div>
        </div>

        {!platform.allInStock && (
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Out of Stock Items Auto-Substituted</span>
          </div>
        )}

        <div className="space-y-2 flex-1">
          {platform.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-foreground/80 truncate mr-2">{item.qty}× {item.title}</span>
              <span className="font-medium text-foreground whitespace-nowrap">₹{item.subtotal.toFixed(0)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border/30 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{platform.itemsTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery</span>
            <span className={platform.deliveryFee === 0 ? 'text-emerald-400 font-medium' : ''}>
              {platform.deliveryFee === 0 ? 'FREE' : `₹${platform.deliveryFee}`}
            </span>
          </div>
          {platform.handlingFee > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Handling</span>
              <span>₹{platform.handlingFee}</span>
            </div>
          )}
          {platform.surgeFee > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>⚡ Surge</span>
              <span>+₹{platform.surgeFee}</span>
            </div>
          )}
          {platform.appliedOffers && platform.appliedOffers.map((offer, idx) => (
            <div key={idx} className="flex justify-between items-center py-1">
              <PlatformOfferBadge 
                code={offer.code}
                paymentMethod={offer.paymentMethod}
                discountLabel={offer.discountLabel}
                platform={offer.platform}
              />
              <span className="text-emerald-400 font-medium">−₹{offer.amount}</span>
            </div>
          ))}
          {(!platform.appliedOffers || platform.appliedOffers.length === 0) && platform.discount > 0 && (
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>🎫 Discount</span>
              <span>−₹{platform.discount}</span>
            </div>
          )}
        </div>

        <div className="border-t border-border/30 pt-3 flex items-center justify-between">
          <span className="font-bold text-foreground">Grand Total</span>
          <span className="font-black text-xl text-foreground">₹{platform.grandTotal.toFixed(0)}</span>
        </div>

        <button className={cn(
          "w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold border transition-colors mt-1",
          "bg-background/50 text-foreground border-border/50 hover:bg-secondary"
        )}>
          <span>Open {formatPlatformName(platform.platform)}</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4 flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Cart Optimization V3</span>
        </h1>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Dark Store Radar Component */}
        <DarkStoreRadar pincode={location.pincode || '110001'} />

        {/* Strategy Selector Tabs */}
        <div className="bg-card/40 border border-border/50 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <button
            onClick={() => setStrategyMode('cheapest')}
            className={cn(
              "flex-1 min-w-[120px] py-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all",
              strategyMode === 'cheapest' ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card/30 text-muted-foreground border-transparent hover:bg-secondary"
            )}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Cheapest</span>
          </button>
          <button
            onClick={() => setStrategyMode('fastest')}
            className={cn(
              "flex-1 min-w-[120px] py-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all",
              strategyMode === 'fastest' ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card/30 text-muted-foreground border-transparent hover:bg-secondary"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fastest</span>
          </button>
          <button
            onClick={() => setStrategyMode('bank_offers')}
            className={cn(
              "flex-1 min-w-[120px] py-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all",
              strategyMode === 'bank_offers' ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card/30 text-muted-foreground border-transparent hover:bg-secondary"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Bank Offers Max</span>
          </button>
          <button
            onClick={() => setStrategyMode('3way_split')}
            className={cn(
              "flex-1 min-w-[120px] py-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all",
              strategyMode === '3way_split' ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card/30 text-muted-foreground border-transparent hover:bg-secondary"
            )}
          >
            <span className="text-sm">⚡</span>
            <span>3-Way Split</span>
          </button>
        </div>

        {/* Cart Items Review */}
        {!result && !optimizeMutation.isPending && (
          <>
            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center justify-between">
                <span>Review Items ({getCartCount()})</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Comparing across 5 platforms
                </span>
              </h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="font-medium truncate">{item.product.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.product.brand} • {item.product.unit}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center bg-secondary/50 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => optimizeMutation.mutate()}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-5 h-5" />
              <span>Optimize My Cart</span>
            </button>
          </>
        )}

        {/* Loading State */}
        {optimizeMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative">
              <div className="w-28 h-28 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                💸
              </div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold animate-pulse">Crunching prices across 5 platforms...</h3>
              <p className="text-muted-foreground max-w-sm">Analyzing delivery fees, surge pricing, coupons from HDFC, UPI, CRED & more.</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {optimizeMutation.isError && (
          <div className="text-center py-16 space-y-4">
            <p className="text-red-400">Optimization failed. Please try again.</p>
            <button onClick={() => optimizeMutation.mutate()} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            {/* Best Strategy Hero Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-3xl p-6 sm:p-8">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <CheckCircle2 className="w-36 h-36 text-emerald-500" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-bold border border-emerald-500/30">
                  <Sparkles className="w-4 h-4" />
                  <span>{result.bestStrategy === 'split' ? '🔀 2-Way Split Win' : result.bestStrategy === 'split3way' ? '⚡ 3-Way Split Win' : '🏪 Single Store Win'}</span>
                </div>
                {result.savingsAmount > 0 && (
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-5xl font-black text-emerald-400">₹{result.savingsAmount.toFixed(0)}</h2>
                    <span className="text-xl text-emerald-400/80 font-medium">Saved</span>
                  </div>
                )}
                <p className="text-base font-medium text-foreground/90 max-w-lg leading-relaxed">
                  {result.bestStrategy === 'split'
                    ? `Splitting your order saves you ₹${result.savingsAmount.toFixed(0)} compared to the best single-store option.`
                    : result.bestStrategy === 'split3way'
                    ? `Our advanced 3-way split saves you ₹${result.savingsAmount.toFixed(0)}!`
                    : `${formatPlatformName(result.singleBest.platform)} offers the best total price for your entire cart, including delivery and applicable discounts.`}
                </p>
              </div>
            </div>

            {/* Recommended Orders */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <span>✨ Your Optimized Plan</span>
              </h3>
              <div className={cn(
                "grid gap-4",
                result.bestStrategy === 'split3way' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
              )}>
                {result.bestStrategy === 'split3way' && result.splitOrders3Way
                  ? result.splitOrders3Way.map(o => renderPlatformCard(o, true))
                  : result.bestStrategy === 'split' && result.splitOrders
                  ? result.splitOrders.map(o => renderPlatformCard(o, true))
                  : renderPlatformCard(result.singleBest, true)}
              </div>
            </div>

            {/* Savings Breakdown Chart */}
            {result.savingsAmount > 0 && result.bestStrategy !== 'single' && (
              <SavingsBreakdownChart items={[
                { title: 'Optimized Delivery & Items', savings: result.savingsAmount, platform: 'split' }
              ]} />
            )}

            {/* All Platform Comparison */}
            <div className="border-t border-border/30 pt-8">
              <button
                onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <span>All Platform Comparison ({result.allPlatforms.length})</span>
                {showAllPlatforms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAllPlatforms && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-in slide-in-from-top-4 duration-300">
                  {result.allPlatforms
                    .sort((a, b) => a.grandTotal - b.grandTotal)
                    .map(platform => renderPlatformCard(platform))}
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button onClick={() => setResult(null)} className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors">
                ← Recalculate or Edit Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
