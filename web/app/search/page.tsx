'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCartStore, CartProduct } from '@/store/useCartStore';
import {
  MapPin, Plus, Minus, ShoppingBag, ArrowRight,
  Filter, AlertTriangle, ArrowUpDown, Tag, TrendingDown,
  Layers, ChevronUp, Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PriceHistoryModal from '../components/PriceHistoryModal';
import ComparisonMatrixModal from '../components/ComparisonMatrixModal';
import UserHeaderAvatar from '../components/UserHeaderAvatar';
import AISmartSearch from '../components/AISmartSearch';
import SmartSubstituteSuggester from '../components/SmartSubstituteSuggester';
import { SkeletonGrid } from '../components/SkeletonCard';
import ScrollReveal from '../components/ScrollReveal';
import ProductShareButton from '../components/ProductShareButton';
import EmptyState from '../components/EmptyState';
import { useLivePriceStream } from '@/hooks/useLivePriceStream';
import { getRealisticProductImage } from '@/lib/productImageLibrary';

const CATEGORY_EMOJIS: Record<string, string> = {
  'Grocery & Fresh': '🥦',
  'Snacks & Beverages': '🥤',
  'Electronics & Tech': '⚡',
  'Personal Care & Hygiene': '🧼',
  'Household Essentials': '🧹',
  'Pharmacy & Health': '💊',
  'Pet Supplies & Baby Care': '🐶',
  'All': '🛒',
};

const PLATFORM_EMOJIS: Record<string, string> = {
  blinkit: '🟡', zepto: '🟣', instamart: '🟠', flipkart_minutes: '🔵', amazon_now: '🛒',
};

// Track live price deltas: productId → platform → pct delta
type PriceDeltaMap = Record<string, Record<string, { price: number; delta: 'up' | 'down' | 'same' }>>;

function ImageWithFallback({ src, ean, alt, className }: { src: string; ean?: string; alt: string; className: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = async () => {
    if (hasError) return;
    setHasError(true);
    if (ean) {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${ean}.json`);
        if (res.ok) {
          const data = await res.json();
          const fallbackUrl = data?.product?.image_front_url || data?.product?.selected_images?.front?.display?.in;
          if (fallbackUrl) {
            setImgSrc(fallbackUrl);
            return;
          }
        }
      } catch (err) {
        console.error('Fallback fetch failed', err);
      }
    }
    // Final generic placeholder if OFF also fails
    setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&size=400`);
  };

  return (
    <img
      src={imgSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&size=400`}
      alt={alt}
      className={className}
      loading="lazy"
      onError={handleError}
    />
  );
}

export default function SearchPage() {
  const router = useRouter();
  const { location, cart, addToCart, updateQuantity, getCartCount } = useCartStore();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc'>('recommended');
  const [aiFilters, setAIFilters] = useState<{ maxPrice?: number | null; aiSummary?: string } | null>(null);

  const [selectedHistoryProduct, setSelectedHistoryProduct] = useState<CartProduct | null>(null);
  const [selectedMatrixProduct, setSelectedMatrixProduct] = useState<CartProduct | null>(null);
  const [showSubstituteFor, setShowSubstituteFor] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [livePriceDeltas, setLivePriceDeltas] = useState<PriceDeltaMap>({});
  const [flashingPrices, setFlashingPrices] = useState<Set<string>>(new Set());

  // Redirect if no location set
  useEffect(() => {
    if (!location.isSet) router.push('/');
  }, [location.isSet, router]);

  // Back-to-top listener
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['searchProducts', query, activeCategory, inStockOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (activeCategory !== 'All') params.set('category', activeCategory);
      if (inStockOnly) params.set('inStockOnly', 'true');
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json() as Promise<{ results: CartProduct[]; categories: string[]; total: number }>;
    },
    enabled: location.isSet,
  });

  // SSE live price stream
  const productIds = useMemo(() => data?.results?.map(p => p.id) || [], [data]);

  const handlePriceUpdate = useCallback((updates: PriceDeltaMap) => {
    setLivePriceDeltas(prev => ({ ...prev, ...updates }));
    // Flash updated product cards
    const updatedIds = Object.keys(updates).filter(id =>
      Object.values(updates[id]).some(u => u.delta !== 'same')
    );
    setFlashingPrices(new Set(updatedIds));
    setTimeout(() => setFlashingPrices(new Set()), 800);
  }, []);

  useLivePriceStream({
    productIds,
    onPriceUpdate: handlePriceUpdate,
    enabled: productIds.length > 0,
  });

  const availableBrands = useMemo(() => {
    if (!data?.results) return ['All'];
    const brands = new Set<string>();
    data.results.forEach(p => { if (p.brand) brands.add(p.brand); });
    return ['All', ...Array.from(brands).sort()];
  }, [data]);

  const filteredAndSortedResults = useMemo(() => {
    if (!data?.results) return [];
    let items = [...data.results];

    if (selectedBrand !== 'All') {
      items = items.filter(p => p.brand === selectedBrand);
    }
    if (aiFilters?.maxPrice) {
      items = items.filter(p => {
        const minP = Math.min(...p.platforms.filter(pl => pl.inStock).map(pl => pl.price));
        return minP <= (aiFilters.maxPrice as number);
      });
    }

    if (sortBy === 'price_asc') {
      items.sort((a, b) => {
        const minA = Math.min(...a.platforms.filter(p => p.inStock).map(p => p.price) || [Infinity]);
        const minB = Math.min(...b.platforms.filter(p => p.inStock).map(p => p.price) || [Infinity]);
        return minA - minB;
      });
    } else if (sortBy === 'price_desc') {
      items.sort((a, b) => {
        const minA = Math.min(...a.platforms.filter(p => p.inStock).map(p => p.price) || [0]);
        const minB = Math.min(...b.platforms.filter(p => p.inStock).map(p => p.price) || [0]);
        return minB - minA;
      });
    }

    return items;
  }, [data, selectedBrand, sortBy, aiFilters]);

  const handleAISearch = (searchQuery: string, parsed?: { category?: string | null; maxPrice?: number | null; aiSummary?: string }) => {
    setQuery(searchQuery);
    if (parsed?.category) setActiveCategory(parsed.category);
    if (parsed?.maxPrice) setAIFilters({ maxPrice: parsed.maxPrice, aiSummary: parsed.aiSummary });
    else setAIFilters(null);
  };

  const getPlatformBadge = (price: number, isMin: boolean, isMax: boolean, inStock: boolean) => {
    if (!inStock) return 'bg-red-500/10 text-red-400 border-red-500/20 line-through opacity-60';
    if (isMin) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold';
    if (isMax) return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    return 'bg-secondary/40 text-secondary-foreground border-border/40';
  };

  const getQuantity = (productId: string) => cart.find(c => c.product.id === productId)?.quantity || 0;

  const isProductLive = (id: string) => {
    const deltas = livePriceDeltas[id];
    return deltas && Object.values(deltas).some(d => d.delta !== 'same');
  };

  if (!location.isSet) return null;

  const categories = data?.categories || ['All', 'Grocery & Fresh', 'Snacks & Beverages', 'Electronics & Tech', 'Personal Care & Hygiene', 'Household Essentials'];

  return (
    <div className="flex flex-col w-full min-h-screen pb-32 animate-in fade-in duration-500">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4 flex items-center justify-between">
        <h1
          className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-indigo-400 cursor-pointer"
          onClick={() => router.push('/')}
        >
          PricePulse
        </h1>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center text-xs font-medium bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
            <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
            {location.pincode || 'Location Set'}
          </div>
          {/* Live indicator */}
          {productIds.length > 0 && (
            <div className="hidden sm:flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>LIVE</span>
            </div>
          )}
          <button
            onClick={() => router.push('/cart')}
            className="relative p-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {getCartCount()}
              </span>
            )}
          </button>
          <UserHeaderAvatar />
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        {/* AI Smart Search Bar */}
        <div className="max-w-3xl mx-auto space-y-4">
          <AISmartSearch onSearch={handleAISearch} initialQuery={query} />

          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setActiveCategory(cat); setSelectedBrand('All'); }}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center space-x-1',
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-md'
                    : 'bg-card/40 text-muted-foreground border-border/50 hover:bg-secondary/60'
                )}
              >
                <span>{CATEGORY_EMOJIS[cat] || '📦'}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/30">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={cn(
                  'px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all',
                  inStockOnly ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-card/40 text-muted-foreground border-border/50 hover:bg-secondary'
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>In Stock Only</span>
              </button>

              {aiFilters?.maxPrice && (
                <button
                  onClick={() => setAIFilters(null)}
                  className="px-3 py-1.5 rounded-xl border bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center space-x-1.5 text-xs"
                >
                  <span>Max ₹{aiFilters.maxPrice}</span>
                  <span>×</span>
                </button>
              )}

              {availableBrands.length > 2 && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-card border border-border/50 text-foreground text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="All">All Brands</option>
                    {availableBrands.filter(b => b !== 'All').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-card border border-border/50 text-foreground text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State — Skeleton Grid */}
        {isLoading && <SkeletonGrid />}

        {/* Error State */}
        {isError && (
          <EmptyState type="error" onRetry={() => refetch()} />
        )}

        {/* Results */}
        {data && !isLoading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-muted-foreground font-medium px-1">
              <span>Showing {filteredAndSortedResults.length} of {data.total} items across 5 platforms</span>
              <span className="text-primary font-semibold flex items-center space-x-1">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>⚡ Live Prices Active</span>
              </span>
            </div>

            {filteredAndSortedResults.length === 0 && (
              <EmptyState
                type="no_results"
                query={query}
                onSearch={(q) => handleAISearch(q)}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedResults.map((product, idx) => {
                const availablePlatforms = product.platforms.filter(p => p.inStock);
                const isAnyInStock = availablePlatforms.length > 0;
                const prices = availablePlatforms.map(p => p.price);
                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxPrice = prices.length ? Math.max(...prices) : 0;
                const qty = getQuantity(product.id);
                const isLive = isProductLive(product.id);
                const isFlashing = flashingPrices.has(product.id);

                return (
                  <ScrollReveal key={product.id} delay={Math.min(idx % 8, 4) * 60}>
                    <div className={cn(
                      'bg-card/40 border rounded-2xl p-4 flex flex-col backdrop-blur-sm transition-all duration-300 shadow-sm group relative overflow-hidden',
                      isAnyInStock ? 'border-border/50 hover:border-primary/40 hover:shadow-md' : 'border-red-500/20 opacity-75',
                      isFlashing && 'ring-1 ring-emerald-400/50',
                    )}>
                      {/* Live Badge */}
                      {isLive && (
                        <div className="absolute top-2 left-2 z-10 flex items-center space-x-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                          <Radio className="w-2.5 h-2.5 animate-pulse" />
                          <span>LIVE</span>
                        </div>
                      )}

                      {!isAnyInStock && (
                        <div className="absolute top-3 right-3 z-10 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>OOS Everywhere</span>
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative w-full h-44 mb-3 bg-secondary/30 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300">
                        <ImageWithFallback
                          src={product.imageUrl || ''}
                          ean={product.ean}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        {/* Pack Quantity / Weight Badge */}
                        <span className="absolute top-2 right-2 text-[10px] font-black text-white bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-indigo-400/30 shadow-md">
                          {product.unit || '1 Unit'}
                        </span>
                      </div>

                      <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] leading-snug">{product.title}</h3>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 font-medium">
                        <span>{product.brand} · <span className="text-primary/80">{product.category}</span></span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryProduct(product)}
                            className="p-1 rounded bg-secondary/50 hover:bg-secondary text-primary transition-colors"
                            title="30-Day Price History"
                          >
                            <TrendingDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedMatrixProduct(product)}
                            className="p-1 rounded bg-secondary/50 hover:bg-secondary text-primary transition-colors"
                            title="Compare Side-by-Side Matrix"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                          <ProductShareButton product={product} />
                          {!isAnyInStock && (
                            <button
                              type="button"
                              onClick={() => setShowSubstituteFor(showSubstituteFor === product.id ? null : product.id)}
                              className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors"
                              title="Find Substitutes"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Platform Price Grid */}
                      <div className="grid grid-cols-2 gap-1.5 mb-4">
                        {product.platforms.map(p => {
                          const delta = livePriceDeltas[product.id]?.[p.platform];
                          return (
                            <div
                              key={p.platform}
                              className={cn(
                                'text-[11px] flex justify-between items-center px-2 py-1 rounded-lg border transition-colors duration-300',
                                getPlatformBadge(p.price, p.inStock && p.price === minPrice, p.inStock && p.price === maxPrice, p.inStock),
                                delta?.delta === 'down' && 'animate-price-flash-green',
                                delta?.delta === 'up' && 'animate-price-flash-red',
                              )}
                            >
                              <span className="capitalize font-medium flex items-center space-x-0.5">
                                <span>{PLATFORM_EMOJIS[p.platform]}</span>
                                <span>{p.platform.split('_')[0]}</span>
                              </span>
                              <span className="font-bold">
                                {p.inStock ? `₹${p.price}` : 'OOS'}
                                {delta?.delta === 'down' && <span className="text-emerald-400 ml-0.5">↓</span>}
                                {delta?.delta === 'up' && <span className="text-red-400 ml-0.5">↑</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Smart Substitutes (OOS products) */}
                      {showSubstituteFor === product.id && !isAnyInStock && (
                        <SmartSubstituteSuggester
                          oosProduct={product}
                          allProducts={data?.results || []}
                          targetPlatform="blinkit"
                          onDismiss={() => setShowSubstituteFor(null)}
                        />
                      )}

                      {/* Add to Cart / Qty Stepper */}
                      <div className="mt-auto pt-1">
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(product)}
                            disabled={!isAnyInStock}
                            className="w-full flex items-center justify-center space-x-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-40 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{isAnyInStock ? 'Add to Cart' : 'Out of Stock'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-1">
                            <button onClick={() => updateQuantity(product.id, qty - 1)} className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-primary w-8 text-center text-sm">{qty}</span>
                            <button onClick={() => updateQuantity(product.id, qty + 1)} className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart CTA */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 flex justify-center px-4">
          <div
            className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.5)] flex items-center justify-between w-full max-w-md cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => router.push('/cart')}
          >
            <div className="flex flex-col">
              <span className="font-bold text-lg">{getCartCount()} items</span>
              <span className="text-primary-foreground/80 text-xs">Multi-cart comparison ready</span>
            </div>
            <div className="flex items-center space-x-2 font-semibold text-sm">
              <span>Optimize & Compare</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 md:bottom-20 right-4 z-40 p-3 bg-secondary border border-border/60 rounded-full shadow-lg hover:bg-secondary/80 hover:scale-110 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          title="Back to top"
        >
          <ChevronUp className="w-5 h-5 text-primary" />
        </button>
      )}

      {/* Modals */}
      {selectedHistoryProduct && (
        <PriceHistoryModal product={selectedHistoryProduct} onClose={() => setSelectedHistoryProduct(null)} />
      )}
      {selectedMatrixProduct && (
        <ComparisonMatrixModal product={selectedMatrixProduct} onClose={() => setSelectedMatrixProduct(null)} />
      )}
    </div>
  );
}
