'use client';

import React, { useState } from 'react';
import { 
  Search, Mic, MapPin, Zap, ShoppingCart, Sparkles, Filter, Check, 
  Award, Bell, Share2, ExternalLink, ShieldCheck, ArrowRight, RefreshCw,
  Plus, Minus, Trash2, Cpu, Copy, CheckCircle2, AlertTriangle, Layers, Split, Clock
} from 'lucide-react';
import { useCartStore, LOCATION_PRESETS } from '@/store/useCartStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useToast } from '@/app/components/ToastNotification';
import XPProgressBar from '@/app/components/XPProgressBar';
import SavingsBadgeSystem from '@/app/components/SavingsBadgeSystem';
import SavingsBreakdownChart from '@/app/components/SavingsBreakdownChart';
import PlatformOfferBadge from '@/app/components/PlatformOfferBadge';
import { VENDORS, CANONICAL_CATALOG, PlatformId, CanonicalSKU } from '@/lib/vendorsAndCatalog';
import { runCombinatorialOptimizer, generateONDCBecknPayload, generateAmazonMultiASINLink, simulateCartInjector, APPLIED_COUPONS } from '@/lib/cartOptimizer';

export default function HighDensityMasterApp() {
  const { toast } = useToast();
  const { location, selectLocationPreset, cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { recordCartOptimization } = useGamificationStore();
  const { addSavings } = useAnalyticsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStrategy, setSelectedStrategy] = useState<'single' | 'split2' | 'split3' | 'fastest'>('split2');
  const [isListening, setIsListening] = useState(false);
  const [alertModalProduct, setAlertModalProduct] = useState<CanonicalSKU | null>(null);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [activeTabMobile, setActiveTabMobile] = useState<'compare' | 'cart' | 'radar' | 'profile'>('compare');
  const [ondcPayloadModal, setOndcPayloadModal] = useState<string | null>(null);
  const [injectorLogsModal, setInjectorLogsModal] = useState<string[] | null>(null);

  // Web Speech API Dictation
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser environment.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening for spoken grocery query...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      toast.success(`Voice input recognized: "${transcript}"`);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice dictation failed. Try typing.');
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Filter Products
  const filteredProducts = CANONICAL_CATALOG.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Best Price per item
  const getBestVendor = (product: CanonicalSKU) => {
    const sorted = [...product.platforms].sort((a, b) => a.price - b.price);
    const winner = sorted[0];
    const savings = product.mrp - winner.price;
    const discountPct = Math.round((savings / product.mrp) * 100);
    return { winner, savings, discountPct };
  };

  // Cart Combinatorial Optimization
  const cartInputItems = cart.map((item) => {
    const catalogSKU = CANONICAL_CATALOG.find((sku) => sku.id === item.product.id) || {
      id: item.product.id,
      title: item.product.title,
      brand: item.product.brand,
      unit: item.product.unit,
      category: item.product.category,
      gtin: item.product.gtin || "8901262010055",
      mrp: item.product.mrp || 275,
      imageUrl: item.product.imageUrl || "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80",
      description: "Package item",
      platforms: item.product.platforms.map((p) => ({
        platform: p.platform as PlatformId,
        price: p.price,
        mrp: item.product.mrp || 275,
        inStock: p.inStock,
        deliveryMins: p.deliveryMins || 10,
        sellerId: `seller_${p.platform}`
      }))
    };
    return { product: catalogSKU, quantity: item.quantity };
  });

  const optimizationResult = runCombinatorialOptimizer(cartInputItems, selectedStrategy);

  // Trigger Checkout Handoffs
  const handleTriggerCheckout = (mode: 'ondc' | 'amazon' | 'injector') => {
    if (!optimizationResult || cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    addSavings(optimizationResult.totalNetSavings, 'PricePulse Combinatorial Engine');
    recordCartOptimization(optimizationResult.totalNetSavings);

    if (mode === 'ondc') {
      const payloadStr = generateONDCBecknPayload(optimizationResult.vendorSplits, location.pincode);
      setOndcPayloadModal(payloadStr);
      toast.success('ONDC Beckn Protocol Payload Generated!');
    } else if (mode === 'amazon') {
      const link = generateAmazonMultiASINLink(optimizationResult.vendorSplits);
      window.open(link, '_blank');
      toast.success('Launching Amazon Multi-ASIN Cart Link...');
    } else if (mode === 'injector') {
      const firstSplit = optimizationResult.vendorSplits[0];
      if (firstSplit) {
        const logs = simulateCartInjector(firstSplit);
        setInjectorLogsModal(logs);
        toast.success('Cart Injector Script Executed! Halting safely at RBI 2FA Payment Gate.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-20 lg:pb-6">
      
      {/* 1. HIGH DENSITY HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm tracking-tighter shadow-lg shadow-indigo-600/30">
              PP
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
                PRICE<span className="text-indigo-500">PULSE</span>
              </span>
              <span className="block text-[9px] font-bold text-slate-400 -mt-1 tracking-widest uppercase">Quick-Commerce AI</span>
            </div>
          </div>

          {/* Location Pincode Selector */}
          <div className="hidden sm:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
            <span className="text-slate-300 font-semibold mr-1 text-[11px]">{location.area} ({location.pincode}):</span>
            <select
              value={location.pincode}
              onChange={(e) => selectLocationPreset(e.target.value)}
              className="bg-transparent text-indigo-400 font-bold outline-none cursor-pointer text-xs"
            >
              {LOCATION_PRESETS.map((preset) => (
                <option key={preset.pincode} value={preset.pincode} className="bg-slate-900 text-slate-100">
                  {preset.name} ({preset.pincode})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input & Dictation */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder='Search 1,250+ SKUs (e.g. "Find 500g butter and 5kg Atta under ₹400")'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <button
                onClick={handleVoiceSearch}
                title="Voice Grocery List Dictation"
                className={`absolute right-2 p-1 rounded-lg transition-colors ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* XP Bar & Basket */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="hidden lg:block w-44">
              <XPProgressBar />
            </div>

            <button
              onClick={() => setActiveTabMobile('cart')}
              className="relative p-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-300 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline font-bold">Basket</span>
              {cart.length > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-black rounded-full px-1.5 py-0.2">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* QUICK PROMPT PILLS */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-3 py-1.5 overflow-x-auto no-scrollbar">
        <div className="max-w-[1700px] mx-auto flex items-center space-x-2 text-[11px]">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">Popular Prompts:</span>
          {[
            { label: '🧈 Amul Butter 500g', q: 'Amul Butter' },
            { label: '🌾 Aashirvaad Atta 5kg', q: 'Aashirvaad Atta' },
            { label: '🥛 Mother Dairy Milk 1L', q: 'Mother Dairy Milk' },
            { label: '☕ Tata Tea Gold', q: 'Tata Tea' },
            { label: '🍜 Maggi Masala 12P', q: 'Maggi' },
            { label: '🧼 Dettol Soap 4-Pack', q: 'Dettol Soap' },
          ].map((pill) => (
            <button
              key={pill.q}
              onClick={() => setSearchQuery(pill.q)}
              className="shrink-0 px-2.5 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 font-medium transition"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 3-COLUMN DESKTOP LAYOUT */}
      <main className="max-w-[1700px] mx-auto p-3 grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* =================================================================== */}
        {/* LEFT COLUMN: CATALOG COMPARISON FEED (5 COLS)                       */}
        {/* =================================================================== */}
        <section className={`lg:col-span-5 space-y-3 ${activeTabMobile === 'compare' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Catalog Feed (1,250 SKUs)
              </span>
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {filteredProducts.length} Live
              </span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none font-medium cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Dairy & Breakfast">Dairy & Breakfast</option>
              <option value="Staples & Atta">Staples & Atta</option>
              <option value="Snacks & Munchies">Snacks & Munchies</option>
              <option value="Beverages & Drinks">Beverages & Drinks</option>
              <option value="Personal Care & Hygiene">Personal Care</option>
            </select>
          </div>

          {/* Product Feed Cards */}
          <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 no-scrollbar">
            {filteredProducts.map((product) => {
              const { winner, savings, discountPct } = getBestVendor(product);
              return (
                <div 
                  key={product.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 space-y-2.5 transition-all shadow-md"
                >
                  <div className="flex items-start space-x-3">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title} 
                      className="w-16 h-16 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">{product.brand}</span>
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black px-1.5 py-0.2 rounded">
                          -{discountPct}% OFF
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-100 truncate">{product.title}</h3>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{product.unit}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">GTIN: {product.gtin}</span>
                      </div>
                    </div>
                  </div>

                  {/* 6-VENDOR PRICE COMPARISON MATRIX */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                    {product.platforms.map((p) => {
                      const v = VENDORS[p.platform as PlatformId];
                      const isWinner = p.platform === winner.platform;
                      return (
                        <div 
                          key={p.platform}
                          className={`p-1 rounded text-center border transition-all ${
                            isWinner 
                              ? 'bg-emerald-500/15 border-emerald-500/50 ring-1 ring-emerald-500/30' 
                              : 'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div className="text-[9px] font-semibold text-slate-400 truncate flex items-center justify-center gap-0.5">
                            <span>{v?.logoEmoji || '🛒'}</span>
                            <span className="truncate">{v?.shortName || p.platform}</span>
                          </div>
                          <div className={`text-xs font-black mt-0.5 ${isWinner ? 'text-emerald-400' : 'text-slate-200'}`}>
                            ₹{p.price}
                          </div>
                          <div className="text-[8px] text-slate-400">{p.deliveryMins}m</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Winner Summary & Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                        👑 Lowest: ₹{winner.price} on {VENDORS[winner.platform as PlatformId]?.shortName}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">₹{product.mrp}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setAlertModalProduct(product);
                          setTargetPrice(winner.price - 10);
                        }}
                        title="Set Price Alert Monitor"
                        className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700 rounded-lg transition"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => addToCart(product as any)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================== */}
        {/* CENTER COLUMN: SMART CART PARTITIONING ENGINE (4 COLS)              */}
        {/* =================================================================== */}
        <section className={`lg:col-span-4 space-y-3 ${activeTabMobile === 'cart' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Split className="w-4 h-4 text-indigo-400" /> Smart Cart Partitioning Engine
              </h2>
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="text-[10px] font-semibold text-rose-400 hover:underline flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* 4 Strategy Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-bold">
              {[
                { id: 'single', label: '🏆 Single' },
                { id: 'split2', label: '🔀 2-Split' },
                { id: 'split3', label: '⚡ 3-Split' },
                { id: 'fastest', label: '⏱ SLA' },
              ].map((strat) => (
                <button
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat.id as any)}
                  className={`py-1.5 rounded-lg text-center transition ${
                    selectedStrategy === strat.id 
                      ? 'bg-indigo-600 text-white shadow-sm font-black' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {strat.label}
                </button>
              ))}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-8 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">Your basket is empty</p>
                <p className="text-[10px] text-slate-500">Add products from the catalog feed to compare split savings</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                {cart.map((item) => (
                  <div key={item.product.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold text-slate-200 truncate">{item.product.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <span>₹{item.product.mrp} MRP</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-white px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Combinatorial Optimizer Summary */}
            {optimizationResult && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Net Savings</span>
                    <span className="text-lg font-black text-emerald-300">₹{optimizationResult.totalNetSavings} ({optimizationResult.savingsPercentage}%)</span>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    <div>MRP Total: <span className="line-through">₹{optimizationResult.totalMRP}</span></div>
                    <div>Pay: <span className="font-bold text-white">₹{optimizationResult.grandTotalCost}</span></div>
                  </div>
                </div>

                {/* Stackable Platform Coupon Offers */}
                <div className="flex flex-wrap gap-1">
                  {APPLIED_COUPONS.map((coupon) => (
                    <button
                      key={coupon.code}
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        toast.success(`Coupon code ${coupon.code} copied to clipboard!`);
                      }}
                      title="Click to copy coupon"
                    >
                      <PlatformOfferBadge 
                        code={coupon.code} 
                        paymentMethod={coupon.paymentMethod} 
                        discountLabel={`-₹${coupon.discountAmount}`} 
                        platform={VENDORS[coupon.vendorId].shortName} 
                      />
                    </button>
                  ))}
                </div>

                {/* Itemized Savings Breakdown Bar Chart */}
                <SavingsBreakdownChart 
                  items={optimizationResult.itemSavingsBreakdown.map((i) => ({
                    title: i.productTitle,
                    savings: i.itemSavings,
                    platform: i.winningVendor
                  }))} 
                />

                {/* Vendor Order Splits */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Partitioned Store Orders ({optimizationResult.vendorSplits.length}):</span>
                  {optimizationResult.vendorSplits.map((split) => (
                    <div key={split.vendorId} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200">{split.logoEmoji} {split.vendorName}</span>
                        <span className="block text-[9px] text-slate-400">{split.items.length} item(s) • {split.deliverySLA}</span>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-200">
                        ₹{split.vendorTotal}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Handoff Options */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => handleTriggerCheckout('ondc')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
                  >
                    <span>🟢 ONDC Beckn Transaction Schema</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTriggerCheckout('amazon')}
                      className="py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <span>🟧 Amazon Multi-ASIN</span>
                    </button>

                    <button
                      onClick={() => handleTriggerCheckout('injector')}
                      className="py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <Cpu className="w-3 h-3" />
                      <span>⚡ Injector Handoff</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: DARK STORE RADAR & GAMIFIED DASHBOARD (3 COLS)        */}
        {/* =================================================================== */}
        <section className={`lg:col-span-3 space-y-3 ${activeTabMobile === 'radar' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Dark Store Live Radar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" /> Dark Store Live Radar
              </h2>
              <span className="flex items-center space-x-1 text-[9px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>12ms Ping</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {Object.values(VENDORS).map((v) => (
                <div key={v.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{v.logoEmoji}</span>
                    <div>
                      <div className="font-bold text-slate-200 text-[11px]">{v.name}</div>
                      <div className="text-[9px] text-slate-400">{location.area} ({location.pincode})</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-black text-xs ${v.brandColor}`}>{v.deliverySLA}</div>
                    <div className="text-[8px] text-slate-500">Free &gt; ₹{v.freeDeliveryThreshold}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-[10px] text-amber-300 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Peak Demand Notice: +₹15 surge active in {location.area} due to high store load.</span>
            </div>
          </div>

          {/* Gamification & Progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" /> Gamification & Achievements
            </h2>

            <XPProgressBar />

            <div className="pt-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unlocked Trophies</span>
              <SavingsBadgeSystem compact={false} />
            </div>

            {/* Platform Win Ratio SVG Chart */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Win Ratio</span>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1">
                {[
                  { name: 'ONDC Kirana', pct: 45, color: 'bg-emerald-500' },
                  { name: 'Blinkit', pct: 25, color: 'bg-yellow-500' },
                  { name: 'Zepto', pct: 18, color: 'bg-purple-500' },
                  { name: 'Amazon / FK', pct: 12, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.name} className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>{item.name}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* PRICE ALERT MODAL */}
      {alertModalProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-slate-100">Set Price Drop Monitor</h3>
                <p className="text-xs text-slate-400">{alertModalProduct.title}</p>
              </div>
              <button onClick={() => setAlertModalProduct(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-300">Target Alert Price (₹):</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-400">Current Lowest: ₹{getBestVendor(alertModalProduct).winner.price}</p>
            </div>

            <button
              onClick={() => {
                toast.success(`Price drop monitor configured for ₹${targetPrice}! PWA Push Notification active.`);
                setAlertModalProduct(null);
              }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
            >
              Confirm Alert Monitor
            </button>
          </div>
        </div>
      )}

      {/* ONDC PAYLOAD MODAL */}
      {ondcPayloadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span>🟢</span> ONDC Beckn Protocol JSON Payload (/select & /init)
              </h3>
              <button onClick={() => setOndcPayloadModal(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-300 max-h-64 overflow-y-auto no-scrollbar">
              {ondcPayloadModal}
            </pre>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ondcPayloadModal);
                  toast.success('ONDC Beckn JSON copied!');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200"
              >
                Copy Payload
              </button>
              <button
                onClick={() => setOndcPayloadModal(null)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-lg text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INJECTOR LOGS MODAL */}
      {injectorLogsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-4 h-4" /> cart_injector.js WebView DOM Autofill Logs
              </h3>
              <button onClick={() => setInjectorLogsModal(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-indigo-300 space-y-1 max-h-64 overflow-y-auto no-scrollbar">
              {injectorLogsModal.map((log, i) => (
                <div key={i} className="flex items-start space-x-1.5">
                  <span className="text-slate-600">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInjectorLogsModal(null)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY MOBILE NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 flex justify-around items-center h-14 text-[10px] font-bold">
        <button
          onClick={() => setActiveTabMobile('compare')}
          className={`flex flex-col items-center space-y-1 ${activeTabMobile === 'compare' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <Layers className="w-4 h-4" />
          <span>Compare</span>
        </button>

        <button
          onClick={() => setActiveTabMobile('cart')}
          className={`flex flex-col items-center space-y-1 relative ${activeTabMobile === 'cart' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cart.length})</span>
        </button>

        <button
          onClick={() => setActiveTabMobile('radar')}
          className={`flex flex-col items-center space-y-1 ${activeTabMobile === 'radar' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <Zap className="w-4 h-4" />
          <span>Radar</span>
        </button>

        <button
          onClick={() => setActiveTabMobile('profile')}
          className={`flex flex-col items-center space-y-1 ${activeTabMobile === 'profile' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <Award className="w-4 h-4" />
          <span>Rewards</span>
        </button>
      </nav>
    </div>
  );
}
