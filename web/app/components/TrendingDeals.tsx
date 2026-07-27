'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const DEMO_DEALS = [
  { id: 'd1', title: 'Farmley Premium Cashews 500g', mrp: 799, price: 499, discount: 37, emoji: '🥜', platformName: 'Blinkit', platformEmoji: '🟡' },
  { id: 'd2', title: 'Amul Taaza Toned Milk 1L', mrp: 74, price: 68, discount: 8, emoji: '🥛', platformName: 'Zepto', platformEmoji: '🟣' },
  { id: 'd3', title: 'Maggi 2-Minute Noodles 140g', mrp: 28, price: 25, discount: 10, emoji: '🍜', platformName: 'Instamart', platformEmoji: '🟠' },
  { id: 'd4', title: 'Tata Salt Vacuum Evaporated 1kg', mrp: 28, price: 24, discount: 14, emoji: '🧂', platformName: 'Amazon', platformEmoji: '🔵' },
  { id: 'd5', title: 'Surf Excel Easy Wash Detergent Powder 1.5kg', mrp: 210, price: 175, discount: 16, emoji: '🧼', platformName: 'Blinkit', platformEmoji: '🟡' },
  { id: 'd6', title: 'Aashirvaad Select Premium Sharbati Atta 5kg', mrp: 310, price: 275, discount: 11, emoji: '🌾', platformName: 'Zepto', platformEmoji: '🟣' },
];

export default function TrendingDeals({ limit = 6 }: { limit?: number }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
      <div className="flex gap-4 px-4 w-max">
        {DEMO_DEALS.slice(0, limit).map((deal) => (
          <div key={deal.id} className="w-48 flex-shrink-0 bg-card/40 border border-border/50 rounded-2xl overflow-hidden relative flex flex-col backdrop-blur-sm" style={{ scrollSnapAlign: 'start' }}>
            <div className="h-28 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center text-4xl relative">
              {deal.emoji}
              <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-md">
                -{deal.discount}%
              </div>
            </div>
            
            <div className="p-3 flex flex-col flex-1">
              <h3 className="text-sm font-medium line-clamp-2 mb-2 leading-tight flex-1">{deal.title}</h3>
              
              <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col">
                  <span className="line-through text-muted-foreground text-xs">₹{deal.mrp}</span>
                  <span className="text-lg font-bold text-emerald-400">₹{deal.price}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-1 bg-background/50 px-2 py-1 rounded-full text-xs">
                  <span>{deal.platformEmoji}</span>
                  <span className="text-muted-foreground">{deal.platformName}</span>
                </div>
                <button 
                  onClick={() => addToCart({
                    id: deal.id,
                    title: deal.title,
                    brand: 'Brand',
                    unit: '1 unit',
                    category: 'Trending',
                    platforms: [{ platform: 'zepto', price: deal.price, inStock: true }]
                  } as any)}
                  className="bg-primary text-primary-foreground p-1.5 rounded-full hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
