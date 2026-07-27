'use client';

import { CartProduct } from '@/store/useCartStore';
import { Repeat2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { cn } from '@/lib/utils';

interface SmartSubstituteSuggesterProps {
  oosProduct: CartProduct;
  allProducts: CartProduct[];
  targetPlatform: string;
  onDismiss?: () => void;
}

function computeSimilarity(a: CartProduct, b: CartProduct): number {
  let score = 0;
  if (a.category === b.category) score += 40;
  if (a.brand === b.brand) score += 30;
  // Price proximity (within 30% of target price)
  const aPrice = Math.min(...a.platforms.map(p => p.price));
  const bPrice = Math.min(...b.platforms.map(p => p.price));
  if (bPrice > 0 && Math.abs(aPrice - bPrice) / aPrice < 0.3) score += 20;
  // Name word overlap
  const aWords = new Set(a.title.toLowerCase().split(' '));
  const bWords = b.title.toLowerCase().split(' ');
  const overlapCount = bWords.filter(w => w.length > 3 && aWords.has(w)).length;
  score += Math.min(overlapCount * 5, 10);
  return score;
}

const PLATFORM_EMOJIS: Record<string, string> = {
  blinkit: '🟡', zepto: '🟣', instamart: '🟠', flipkart_minutes: '🔵', amazon_now: '🛒',
};

export default function SmartSubstituteSuggester({
  oosProduct,
  allProducts,
  targetPlatform,
  onDismiss,
}: SmartSubstituteSuggesterProps) {
  const { addToCart, cart, updateQuantity } = useCartStore();

  // Find top 3 substitutes: same category, in stock on targetPlatform, not the same product
  const substitutes = allProducts
    .filter(p =>
      p.id !== oosProduct.id &&
      p.category === oosProduct.category &&
      p.platforms.some(pl => pl.platform === targetPlatform && pl.inStock)
    )
    .map(p => ({ product: p, score: computeSimilarity(oosProduct, p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (substitutes.length === 0) return null;

  const getQty = (id: string) => cart.find(c => c.product.id === id)?.quantity || 0;

  return (
    <div className="mt-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-300">
          <Repeat2 className="w-3.5 h-3.5" />
          <span>Smart Substitutes — OOS on {targetPlatform.split('_')[0]}</span>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-[10px] text-muted-foreground hover:text-foreground">dismiss</button>
        )}
      </div>

      <div className="space-y-2">
        {substitutes.map(({ product, score }) => {
          const platformData = product.platforms.find(p => p.platform === targetPlatform && p.inStock);
          const minPrice = Math.min(...product.platforms.filter(p => p.inStock).map(p => p.price));
          const qty = getQty(product.id);

          return (
            <div key={product.id} className="flex items-center justify-between bg-card/50 border border-border/40 rounded-xl p-2.5">
              <div className="flex items-center space-x-2 flex-1 min-w-0 mr-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/40 flex items-center justify-center text-base flex-shrink-0">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                    : '📦'
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{product.title}</p>
                  <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground">
                    <span>{product.brand}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-bold">₹{minPrice}</span>
                    <span>·</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">{score}% match</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {qty === 0 ? (
                  <button
                    onClick={() => addToCart(product)}
                    className="text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/30 transition-colors"
                  >
                    + Add
                  </button>
                ) : (
                  <div className="flex items-center space-x-1">
                    <button onClick={() => updateQuantity(product.id, qty - 1)} className="p-1 hover:bg-secondary rounded">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{qty}</span>
                    <button onClick={() => updateQuantity(product.id, qty + 1)} className="p-1 hover:bg-secondary rounded">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
