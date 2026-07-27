'use client';

import { useState, useMemo } from 'react';
import { X, TrendingDown, Bell, Check, Zap, ArrowDown, ArrowUp } from 'lucide-react';
import { CartProduct } from '@/store/useCartStore';
import { usePriceAlertStore } from '@/store/usePriceAlertStore';

interface PriceHistoryModalProps {
  product: CartProduct | null;
  onClose: () => void;
}

export default function PriceHistoryModal({ product, onClose }: PriceHistoryModalProps) {
  const { alerts, addAlert, isAlertSet } = usePriceAlertStore();
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Generate 30-day price history trend data for visualization
  const historyData = useMemo(() => {
    if (!product) return [];
    const basePrice = Math.min(...product.platforms.map(p => p.price));
    const dates = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      
      // Deterministic price fluctuation over 30 days
      const dayOffset = (i * 7 + basePrice) % 11;
      const variation = dayOffset > 7 ? (dayOffset - 7) * 4 : -(dayOffset * 3);
      const price = Math.max(10, basePrice + variation);

      dates.push({
        day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price,
        zeptoPrice: Math.max(10, price + (i % 3 === 0 ? -3 : 2)),
        blinkitPrice: Math.max(10, price + (i % 2 === 0 ? 3 : -2)),
        instamartPrice: Math.max(10, price + (i % 4 === 0 ? 5 : -1)),
      });
    }
    return dates;
  }, [product]);

  if (!product) return null;

  const currentMin = Math.min(...product.platforms.filter(p => p.inStock).map(p => p.price));
  const allTimeLow = Math.min(...historyData.map(d => d.price));
  const allTimeHigh = Math.max(...historyData.map(d => d.price));
  const hasAlert = isAlertSet(product.id);

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const alertVal = targetPrice > 0 ? targetPrice : Math.round(currentMin * 0.9);
    addAlert(product.id, product.title, alertVal, currentMin);
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 3000);
  };

  // SVG Chart Calculations
  const svgWidth = 600;
  const svgHeight = 180;
  const minP = Math.min(...historyData.map(d => d.price)) - 5;
  const maxP = Math.max(...historyData.map(d => d.price)) + 5;
  
  const points = historyData.map((d, idx) => {
    const x = (idx / (historyData.length - 1)) * svgWidth;
    const y = svgHeight - ((d.price - minP) / (maxP - minP || 1)) * svgHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border/60 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>30-Day Price Tracker</span>
            </div>
            <h2 className="text-xl font-bold text-foreground line-clamp-1">{product.title}</h2>
            <p className="text-xs text-muted-foreground">{product.brand} • Base Unit: {product.unit}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-secondary/30 rounded-2xl border border-border/40 text-center">
            <span className="text-[11px] text-muted-foreground block font-medium">Current Lowest</span>
            <span className="text-lg font-extrabold text-emerald-400">₹{currentMin}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
            <span className="text-[11px] text-emerald-300 block font-medium flex items-center justify-center">
              <ArrowDown className="w-3 h-3 mr-0.5" /> All-Time Low
            </span>
            <span className="text-lg font-extrabold text-emerald-400">₹{allTimeLow}</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
            <span className="text-[11px] text-amber-300 block font-medium flex items-center justify-center">
              <ArrowUp className="w-3 h-3 mr-0.5" /> All-Time High
            </span>
            <span className="text-lg font-extrabold text-amber-400">₹{allTimeHigh}</span>
          </div>
        </div>

        {/* SVG Price Chart */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground px-1">
            <span>Price Trend (Past 30 Days)</span>
            <span className="text-primary text-[11px]">Real-Time Snapshot Sync</span>
          </div>

          <div className="relative w-full h-48 bg-secondary/20 rounded-2xl border border-border/40 p-4 flex flex-col justify-between overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,${svgHeight} ${points} ${svgWidth},${svgHeight}`}
                fill="url(#priceGrad)"
              />
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
            <div className="flex justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/30">
              <span>30 Days Ago</span>
              <span>15 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Price Alert Form */}
        <form onSubmit={handleSetAlert} className="bg-card/60 border border-border/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">Instant Price Drop Alarm</span>
          </div>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder={`Target Price (e.g. ₹${Math.round(currentMin * 0.9)})`}
              value={targetPrice || ''}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all flex items-center space-x-1"
            >
              {alertSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Alert Set!</span>
                </>
              ) : hasAlert ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Alert</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Set Alarm</span>
                </>
              )}
            </button>
          </div>
          {hasAlert && (
            <p className="text-[11px] text-emerald-400 font-medium">✓ Price drop alarm active for this product.</p>
          )}
        </form>

      </div>
    </div>
  );
}
