'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Clock, Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const PLATFORMS = [
  { id: 'blinkit', name: 'Blinkit', emoji: '🟡' },
  { id: 'zepto', name: 'Zepto', emoji: '🟣' },
  { id: 'instamart', name: 'Instamart', emoji: '🟠' },
  { id: 'flipkart', name: 'Minutes', emoji: '🔵' },
  { id: 'amazon', name: 'Amazon', emoji: '⚪' }
];

// Mock data
const mockResults = [
  { attr: 'Price', blinkit: 145, zepto: 140, instamart: 150, flipkart: null, amazon: 135 },
  { attr: 'MRP', blinkit: 160, zepto: 160, instamart: 160, flipkart: 160, amazon: 160 },
  { attr: 'Discount', blinkit: '9%', zepto: '12.5%', instamart: '6%', flipkart: '-', amazon: '15%' },
  { attr: 'Delivery Time', blinkit: '10 min', zepto: '8 min', instamart: '12 min', flipkart: 'Out of stock', amazon: 'Next day' },
  { attr: 'In Stock', blinkit: true, zepto: true, instamart: true, flipkart: false, amazon: true },
  { attr: 'Rating', blinkit: '4.5', zepto: '4.4', instamart: '4.6', flipkart: '-', amazon: '4.7' },
];

export default function ComparePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setHasSearched(true);
    }
  };

  const findCheapestPlatformId = () => {
    const priceRow = mockResults.find(r => r.attr === 'Price');
    if (!priceRow) return 'amazon';
    
    let minPrice = Infinity;
    let minPlatform = '';
    
    PLATFORMS.forEach(p => {
      const price = priceRow[p.id as keyof typeof priceRow] as number;
      if (price !== null && price < minPrice) {
        minPrice = price;
        minPlatform = p.id;
      }
    });
    
    return minPlatform;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center mb-4">
          <button onClick={() => router.back()} className="p-2 mr-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Compare Prices</h1>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search for a product to compare..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card/60 border border-border/80 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary backdrop-blur-sm"
          />
        </form>
      </header>

      <div className="p-4 max-w-5xl mx-auto overflow-hidden">
        {!hasSearched ? (
          <div className="text-center py-20 px-4 flex flex-col items-center opacity-50">
            <div className="flex -space-x-2 mb-4">
              {PLATFORMS.slice(0,4).map(p => (
                <div key={p.id} className="w-10 h-10 rounded-full bg-card border-2 border-background flex items-center justify-center text-lg z-10 shadow-sm">
                  {p.emoji}
                </div>
              ))}
            </div>
            <p className="text-lg font-medium text-muted-foreground">Search a product to see side-by-side comparison across all platforms.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Showing comparison for "{searchTerm}"</h2>
            </div>
            
            <div className="w-full overflow-x-auto hide-scrollbar rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md">
              <table className="w-full min-w-[700px] text-sm text-left">
                <thead className="bg-card/60 border-b border-border/50">
                  <tr>
                    <th className="p-4 font-semibold text-muted-foreground w-32 sticky left-0 bg-card/90 backdrop-blur-md">Attribute</th>
                    {PLATFORMS.map(p => (
                      <th key={p.id} className="p-4 text-center font-semibold min-w-[100px]">
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-xl">{p.emoji}</span>
                          <span>{p.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockResults.map((row, i) => (
                    <tr key={row.attr} className={`border-b border-border/20 ${i % 2 === 0 ? 'bg-background/20' : 'bg-transparent'}`}>
                      <td className="p-4 font-medium sticky left-0 bg-card/50 backdrop-blur-md">{row.attr}</td>
                      {PLATFORMS.map(p => {
                        const val = row[p.id as keyof typeof row];
                        const isCheapest = row.attr === 'Price' && p.id === findCheapestPlatformId();
                        const outOfStock = row.attr === 'In Stock' && val === false;
                        
                        return (
                          <td key={p.id} className="p-4 text-center">
                            {row.attr === 'Price' && val !== null ? (
                              <span className={`font-bold ${isCheapest ? 'text-emerald-400 text-lg' : ''}`}>₹{val as number}</span>
                            ) : outOfStock || val === null ? (
                              <span className="text-red-400 line-through opacity-70">OOS</span>
                            ) : row.attr === 'Delivery Time' ? (
                              <div className="flex items-center justify-center space-x-1">
                                {val !== 'Out of stock' && <Clock className="w-3 h-3 text-muted-foreground" />}
                                <span>{val as string}</span>
                              </div>
                            ) : row.attr === 'In Stock' && val === true ? (
                              <span className="text-emerald-400">Yes</span>
                            ) : (
                              <span>{val as string}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4 sticky left-0 bg-card/50 backdrop-blur-md"></td>
                    {PLATFORMS.map(p => (
                      <td key={p.id} className="p-4 text-center">
                        <button 
                          disabled={mockResults.find(r => r.attr === 'In Stock')![p.id as keyof typeof mockResults] === false}
                          onClick={() => {
                            const price = mockResults.find(r => r.attr === 'Price')![p.id as keyof typeof mockResults] as number;
                            if (price) {
                              addToCart({
                                id: `comp_${Date.now()}`, title: searchTerm, brand: '', unit: '1 pc', category: 'Search',
                                platforms: [{ platform: p.id as any, price, inStock: true }]
                              });
                            }
                          }}
                          className="mx-auto flex items-center justify-center space-x-1 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-2 rounded-xl font-medium disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
