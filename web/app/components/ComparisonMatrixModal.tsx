'use client';

import { X, CheckCircle2, XCircle, Clock, ShieldCheck, Tag } from 'lucide-react';
import { CartProduct } from '@/store/useCartStore';

interface ComparisonMatrixModalProps {
  product: CartProduct | null;
  onClose: () => void;
}

export default function ComparisonMatrixModal({ product, onClose }: ComparisonMatrixModalProps) {
  if (!product) return null;

  const minPrice = Math.min(...product.platforms.filter(p => p.inStock).map(p => p.price) || [0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-card border border-border/60 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
              <Tag className="w-3.5 h-3.5" />
              <span>Side-by-Side Platform Matrix</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{product.title}</h2>
            <p className="text-xs text-muted-foreground">{product.brand} • Base Unit: {product.unit}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-secondary/20">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-card/60">
                <th className="p-3.5 font-semibold text-muted-foreground">Platform</th>
                <th className="p-3.5 font-semibold text-muted-foreground">Price (MRP)</th>
                <th className="p-3.5 font-semibold text-muted-foreground">Delivery Speed</th>
                <th className="p-3.5 font-semibold text-muted-foreground">Stock Status</th>
                <th className="p-3.5 font-semibold text-muted-foreground">Est. Platform Fee</th>
                <th className="p-3.5 font-semibold text-muted-foreground">Best Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {product.platforms.map((p) => {
                const isWinner = p.inStock && p.price === minPrice;
                const platformName = p.platform.split('_')[0].toUpperCase();
                
                return (
                  <tr key={p.platform} className={isWinner ? "bg-emerald-500/10 font-medium" : "hover:bg-card/40"}>
                    <td className="p-3.5 flex items-center space-x-2 font-bold text-foreground">
                      <span className="text-base">
                        {p.platform.includes('blinkit') ? '🟡' : p.platform.includes('zepto') ? '🟣' : p.platform.includes('instamart') ? '🟠' : p.platform.includes('flipkart') ? '🔵' : '🛒'}
                      </span>
                      <span>{platformName}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-sm font-bold text-foreground">₹{p.price}</span>
                      {p.mrp > p.price && (
                        <span className="text-[11px] text-muted-foreground line-through ml-1.5">₹{p.mrp}</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{p.deliveryTime || '10-15 mins'}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {p.inStock ? (
                        <span className="inline-flex items-center text-emerald-400 font-semibold space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>In Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-400 space-x-1 line-through opacity-70">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Out of Stock</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      <span>₹{p.price > 200 ? '0 (Free)' : '₹15'}</span>
                    </td>
                    <td className="p-3.5">
                      {isWinner ? (
                        <span className="inline-flex items-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          🏆 CHEAPEST WINNER
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">+₹{p.price - minPrice} diff</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-card/40 rounded-2xl border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Real-time price verification backed by PricePulse Connector Network</span>
          </div>
          <button onClick={onClose} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-medium hover:bg-secondary/80">
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
}
