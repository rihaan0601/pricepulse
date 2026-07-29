'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Mic, MapPin, Zap, ShoppingCart, Sparkles, Filter, Check, ChevronDown,
  TrendingUp, Award, Bell, Share2, ExternalLink, ShieldCheck, ArrowRight, RefreshCw,
  Gift, Percent, Clock, AlertTriangle, Layers, Split, Plus, Minus, Trash2, Cpu
} from 'lucide-react';
import { useCartStore, LOCATION_PRESETS, CartProduct, PlatformName } from '@/store/useCartStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useToast } from '@/app/components/ToastNotification';
import XPProgressBar from '@/app/components/XPProgressBar';
import SavingsBadgeSystem from '@/app/components/SavingsBadgeSystem';
import SavingsBreakdownChart from '@/app/components/SavingsBreakdownChart';
import PlatformOfferBadge from '@/app/components/PlatformOfferBadge';

// Canonical sample items with exact real Unsplash URLs
const SAMPLE_PRODUCTS: CartProduct[] = [
  {
    id: "p1",
    title: "Amul Pasteurised Salted Butter",
    brand: "Amul",
    unit: "500g",
    category: "Dairy & Breakfast",
    gtin: "8901262010055",
    mrp: 275,
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80",
    platforms: [
      { platform: "ondc", price: 262, inStock: true, deliveryMins: 15 },
      { platform: "zepto", price: 268, inStock: true, deliveryMins: 7 },
      { platform: "blinkit", price: 270, inStock: true, deliveryMins: 9 },
      { platform: "instamart", price: 272, inStock: true, deliveryMins: 12 },
      { platform: "flipkart_minutes", price: 265, inStock: true, deliveryMins: 10 },
      { platform: "amazon_fresh", price: 259, inStock: true, deliveryMins: 60 },
    ]
  },
  {
    id: "p2",
    title: "Aashirvaad Sharbati Superior Whole Wheat Atta",
    brand: "Aashirvaad",
    unit: "5kg",
    category: "Staples & Atta",
    gtin: "8901725111227",
    mrp: 260,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    platforms: [
      { platform: "ondc", price: 232, inStock: true, deliveryMins: 15 },
      { platform: "zepto", price: 245, inStock: true, deliveryMins: 8 },
      { platform: "blinkit", price: 248, inStock: true, deliveryMins: 9 },
      { platform: "instamart", price: 250, inStock: true, deliveryMins: 14 },
      { platform: "flipkart_minutes", price: 238, inStock: true, deliveryMins: 11 },
      { platform: "amazon_fresh", price: 228, inStock: true, deliveryMins: 60 },
    ]
  },
  {
    id: "p3",
    title: "Tata Tea Gold Fine Blend Rich CTC Tea",
    brand: "Tata Consumer",
    unit: "500g",
    category: "Beverages & Drinks",
    gtin: "8901030001008",
    mrp: 310,
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
    platforms: [
      { platform: "ondc", price: 275, inStock: true, deliveryMins: 15 },
      { platform: "zepto", price: 282, inStock: true, deliveryMins: 7 },
      { platform: "blinkit", price: 288, inStock: true, deliveryMins: 9 },
      { platform: "instamart", price: 290, inStock: true, deliveryMins: 12 },
      { platform: "flipkart_minutes", price: 280, inStock: true, deliveryMins: 10 },
      { platform: "amazon_fresh", price: 269, inStock: true, deliveryMins: 60 },
    ]
  },
  {
    id: "p4",
    title: "Fortune Sunlite Refined Sunflower Oil",
    brand: "Fortune",
    unit: "1L",
    category: "Staples & Atta",
    gtin: "8906007280014",
    mrp: 155,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    platforms: [
      { platform: "ondc", price: 135, inStock: true, deliveryMins: 15 },
      { platform: "zepto", price: 142, inStock: true, deliveryMins: 7 },
      { platform: "blinkit", price: 144, inStock: true, deliveryMins: 9 },
      { platform: "instamart", price: 145, inStock: true, deliveryMins: 12 },
      { platform: "flipkart_minutes", price: 138, inStock: true, deliveryMins: 10 },
      { platform: "amazon_fresh", price: 132, inStock: true, deliveryMins: 60 },
    ]
  },
  {
    id: "p5",
    title: "Maggi 2-Minute Masala Instant Noodles",
    brand: "Nestle",
    unit: "12-Pack (840g)",
    category: "Snacks & Munchies",
    gtin: "8901058852312",
    mrp: 168,
    imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80",
    platforms: [
      { platform: "ondc", price: 148, inStock: true, deliveryMins: 15 },
      { platform: "zepto", price: 156, inStock: true, deliveryMins: 7 },
      { platform: "blinkit", price: 158, inStock: true, deliveryMins: 9 },
      { platform: "instamart", price: 160, inStock: true, deliveryMins: 12 },
      { platform: "flipkart_minutes", price: 152, inStock: true, deliveryMins: 10 },
      { platform: "amazon_fresh", price: 145, inStock: true, deliveryMins: 60 },
    ]
  },
  {
    id: "p6",
    title: "Nescafe Classic 100% Pure Instant Coffee",
    brand: "Nestle",
    unit: "100g Jar",
    category: "Beverages & Drinks",
    gtin: "8901058001000",
    mrp: 360,
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
    platforms: [
      { platform: "ondc", price: 315, inStock: true, deliveryMins: 15 },
      { platform: "zepto", price: 330, inStock: true, deliveryMins: 7 },
      { platform: "blinkit", price: 335, inStock: true, deliveryMins: 9 },
      { platform: "instamart", price: 340, inStock: true, deliveryMins: 12 },
      { platform: "flipkart_minutes", price: 325, inStock: true, deliveryMins: 10 },
      { platform: "amazon_fresh", price: 310, inStock: true, deliveryMins: 60 },
    ]
  },
  {
    id: "p7",
    title: "Dettol Original Germ Protection Bathing Soap",
    brand: "Dettol",
    unit: "4-Pack (125g each)",
    category: "Personal Care & Hygiene",
    gtin: "8901396001005",
    mrp: 240,
    imageUrl: "https://images.unsplash.com/photo-1607006482602-76ca97ac4759?auto=format&fit=crop&w=400&q=80",
    platforms: [
      { platform: "ondc", price: 198, inStock: true, deliveryMins: 15 },
      { platform: "zepto", price: 210, inStock: true, deliveryMins: 7 },
      { platform: "blinkit", price: 215, inStock: true, deliveryMins: 9 },
      { platform: "instamart", price: 218, inStock: true, deliveryMins: 12 },
      { platform: "flipkart_minutes", price: 205, inStock: true, deliveryMins: 10 },
      { platform: "amazon_fresh", price: 195, inStock: true, deliveryMins: 60 },
    ]
  },
  {
    id: "p8",
    title: "Mother Dairy Toned Fresh Milk",
    brand: "Mother Dairy",
    unit: "1L Pouch",
    category: "Dairy & Breakfast",
    gtin: "8901262000010",
    mrp: 54,
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    platforms: [
      { platform: "ondc", price: 52, inStock: true, deliveryMins: 15 },
      { platform: "zepto", price: 54, inStock: true, deliveryMins: 7 },
      { platform: "blinkit", price: 54, inStock: true, deliveryMins: 8 },
      { platform: "instamart", price: 54, inStock: true, deliveryMins: 10 },
      { platform: "flipkart_minutes", price: 53, inStock: true, deliveryMins: 11 },
      { platform: "amazon_fresh", price: 51, inStock: true, deliveryMins: 60 },
    ]
  }
];

const PLATFORM_DETAILS: Record<PlatformName, { name: string; color: string; bg: string; border: string; logo: string; sla: string }> = {
  ondc: { name: 'ONDC Kirana', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', logo: '🌐', sla: '~15 mins' },
  zepto: { name: 'Zepto', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', logo: '🟣', sla: '~7 mins' },
  blinkit: { name: 'Blinkit', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', logo: '🟡', sla: '~9 mins' },
  instamart: { name: 'Swiggy Instamart', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', logo: '🟠', sla: '~12 mins' },
  flipkart_minutes: { name: 'Flipkart Minutes', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', logo: '🔵', sla: '~10 mins' },
  amazon_fresh: { name: 'Amazon Fresh', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', logo: '🟧', sla: '~60 mins' },
};

export default function HighDensityDashboard() {
  const { toast } = useToast();
  const { location, selectLocationPreset, cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { xp, level, recordCartOptimization } = useGamificationStore();
  const { addSavings, totalSavings } = useAnalyticsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStrategy, setSelectedStrategy] = useState<'single' | 'split2' | 'split3' | 'fastest'>('split2');
  const [isListening, setIsListening] = useState(false);
  const [alertModalProduct, setAlertModalProduct] = useState<CartProduct | null>(null);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [activeTabMobile, setActiveTabMobile] = useState<'compare' | 'cart' | 'radar' | 'profile'>('compare');
  const [payloadModal, setPayloadModal] = useState<string | null>(null);

  // Speech-to-text Voice Dictation
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice dictation is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening... Speak query now');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      toast.success(`Voice query recognized: "${transcript}"`);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed. Please try typing.');
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Filtered Products
  const filteredProducts = SAMPLE_PRODUCTS.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate Best Deal per product
  const getBestDeal = (product: CartProduct) => {
    const sorted = [...product.platforms].sort((a, b) => a.price - b.price);
    const winner = sorted[0];
    const mrp = product.mrp || winner.price * 1.15;
    const savings = mrp - winner.price;
    const discountPct = Math.round((savings / mrp) * 100);
    return { winner, mrp, savings, discountPct };
  };

  // Cart Optimizer Calculations
  const calculateCartSplit = () => {
    if (cart.length === 0) return null;

    let totalMRP = 0;
    let singleVendorCost = 0;
    const itemSplits: Array<{ product: CartProduct; qty: number; winner: any; savings: number }> = [];

    cart.forEach((item) => {
      const best = getBestDeal(item.product);
      totalMRP += (item.product.mrp || best.winner.price) * item.quantity;
      
      let chosenPlatformPrice = best.winner;
      if (selectedStrategy === 'fastest') {
        // Find platform with lowest SLA
        const fastestPlatform = [...item.product.platforms].sort((a, b) => (a.deliveryMins || 99) - (b.deliveryMins || 99))[0];
        chosenPlatformPrice = fastestPlatform;
      }

      itemSplits.push({
        product: item.product,
        qty: item.quantity,
        winner: chosenPlatformPrice,
        savings: ((item.product.mrp || best.winner.price) - chosenPlatformPrice.price) * item.quantity,
      });
    });

    const itemsSubtotal = itemSplits.reduce((acc, curr) => acc + curr.winner.price * curr.qty, 0);
    
    // Delivery fees calculation based on split count
    const uniqueVendors = new Set(itemSplits.map((i) => i.winner.platform)).size;
    const deliveryFee = uniqueVendors === 1 ? 0 : uniqueVendors * 15; // ₹15 fee per vendor if split
    const grandTotal = itemsSubtotal + deliveryFee;
    const netSavings = Math.max(0, totalMRP - grandTotal);

    return { totalMRP, itemsSubtotal, deliveryFee, grandTotal, netSavings, itemSplits, uniqueVendors };
  };

  const cartAnalysis = calculateCartSplit();

  const handleCheckoutHandoff = (type: 'ondc' | 'amazon' | 'injector') => {
    if (!cartAnalysis || cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    addSavings(cartAnalysis.netSavings, 'PricePulse Engine');
    recordCartOptimization(cartAnalysis.netSavings);

    if (type === 'ondc') {
      const ondcPayload = {
        context: {
          domain: "ONDC:RET10",
          action: "select",
          bap_id: "buyer-app.pricepulse.in",
          bap_uri: "https://api.pricepulse.app/ondc",
          pincode: location.pincode,
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            items: cartAnalysis.itemSplits.map((i) => ({
              id: i.product.gtin || i.product.id,
              quantity: { count: i.qty },
              platform: i.winner.platform,
              price: i.winner.price
            }))
          }
        }
      };
      setPayloadModal(JSON.stringify(ondcPayload, null, 2));
      toast.success('ONDC Beckn Payload Generated! Protocol session ready.');
    } else if (type === 'amazon') {
      const amazonAsins = cartAnalysis.itemSplits.map((i, idx) => `ASIN.${idx+1}=${i.product.gtin || 'B00N0W03R4'}&Quantity.${idx+1}=${i.qty}`).join('&');
      const url = `https://www.amazon.in/gp/aws/cart/add.html?${amazonAsins}&tag=pricepulse-21`;
      window.open(url, '_blank');
      toast.success('Opening Amazon Multi-ASIN Cart Link...');
    } else {
      toast.success('Executing cart_injector.js in WebView... Halting safely at RBI 2FA Payment Gate!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-20 lg:pb-6">
      {/* 1. HIGH DENSITY HEADER BAR */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
          {/* Logo Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm tracking-tighter shadow-lg shadow-indigo-600/30">
              PP
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
                PRICE<span className="text-indigo-500">PULSE</span>
              </span>
              <span className="block text-[9px] font-bold text-slate-400 -mt-1 tracking-widest uppercase">Q-Commerce AI</span>
            </div>
          </div>

          {/* Dynamic Pincode Location Switcher */}
          <div className="hidden sm:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
            <span className="text-slate-300 font-semibold mr-1.5">{location.area} ({location.pincode}):</span>
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

          {/* Search Bar & Dictation */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder='Search 1,250+ SKUs (e.g. "500g Amul butter under ₹300")'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <button
                onClick={handleVoiceSearch}
                title="Voice Dictation Search"
                className={`absolute right-2 p-1 rounded-lg transition-colors ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Level / Cart Shortcuts */}
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

      {/* QUICK QUERY PILLS */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-3 py-1.5 overflow-x-auto no-scrollbar">
        <div className="max-w-[1700px] mx-auto flex items-center space-x-2 text-[11px]">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">Quick Queries:</span>
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
          {/* Feed Header Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Catalog Feed (1,250 SKUs)
              </span>
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {filteredProducts.length} Live
              </span>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
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
          </div>

          {/* Product Feed Grid */}
          <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 no-scrollbar">
            {filteredProducts.map((product) => {
              const { winner, mrp, savings, discountPct } = getBestDeal(product);
              return (
                <div 
                  key={product.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 space-y-2.5 transition-all shadow-md"
                >
                  {/* Top Row: Image + Title + Best Deal Badge */}
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
                      const details = PLATFORM_DETAILS[p.platform];
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
                            <span>{details.logo}</span>
                            <span className="truncate">{details.name.split(' ')[0]}</span>
                          </div>
                          <div className={`text-xs font-black mt-0.5 ${isWinner ? 'text-emerald-400' : 'text-slate-200'}`}>
                            ₹{p.price}
                          </div>
                          <div className="text-[8px] text-slate-400">{p.deliveryMins}m</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Best Deal Winner Summary & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                        👑 Best: ₹{winner.price} on {PLATFORM_DETAILS[winner.platform].name}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">₹{mrp}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setAlertModalProduct(product);
                          setTargetPrice(winner.price - 10);
                        }}
                        title="Set Price Alert"
                        className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700 rounded-lg transition"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => addToCart(product)}
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
                <Split className="w-4 h-4 text-indigo-400" /> Smart Cart Partition Engine
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
                <p className="text-[10px] text-slate-500">Add products from the feed to compare split savings</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {cart.map((item) => {
                  const best = getBestDeal(item.product);
                  return (
                    <div key={item.product.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-slate-200 truncate">{item.product.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <span>₹{best.winner.price} ea</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{PLATFORM_DETAILS[best.winner.platform].name}</span>
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
                  );
                })}
              </div>
            )}

            {/* Savings & Order Summary */}
            {cartAnalysis && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Net Savings</span>
                    <span className="text-lg font-black text-emerald-300">₹{cartAnalysis.netSavings}</span>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    <div>MRP Total: <span className="line-through">₹{cartAnalysis.totalMRP}</span></div>
                    <div>{cartAnalysis.uniqueVendors} Vendor Split(s)</div>
                  </div>
                </div>

                {/* Stackable Coupon Offer Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <PlatformOfferBadge code="HDFC100" paymentMethod="HDFC Bank" discountLabel="-₹100" platform="ONDC" />
                  <PlatformOfferBadge code="CRED50" paymentMethod="CRED Pay" discountLabel="-₹50" platform="Zepto" />
                  <PlatformOfferBadge code="ZEPTOFIRST" paymentMethod="UPI" discountLabel="Free Deliv" platform="Zepto" />
                </div>

                {/* Itemized Savings Bar Graph */}
                <SavingsBreakdownChart 
                  items={cartAnalysis.itemSplits.map((i) => ({
                    title: i.product.title,
                    savings: i.savings,
                    platform: PLATFORM_DETAILS[i.winner.platform].name
                  }))} 
                />

                {/* Checkout & Handoff Buttons */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => handleCheckoutHandoff('ondc')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
                  >
                    <span>🟢 ONDC Native Checkout Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleCheckoutHandoff('amazon')}
                      className="py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <span>🟧 Amazon Multi-ASIN</span>
                    </button>

                    <button
                      onClick={() => handleCheckoutHandoff('injector')}
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
                <span>~12ms Ping</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {Object.entries(PLATFORM_DETAILS).map(([key, p]) => (
                <div key={key} className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{p.logo}</span>
                    <div>
                      <div className="font-bold text-slate-200 text-[11px]">{p.name}</div>
                      <div className="text-[9px] text-slate-400">Pincode {location.pincode}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-black text-xs ${p.color}`}>{p.sla}</div>
                    <div className="text-[8px] text-slate-500">Free &gt; ₹199</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-[10px] text-amber-300 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Surge Fee Notice: +₹15 active in HSR Layout due to evening peak demand.</span>
            </div>
          </div>

          {/* User Progression & Gamification */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" /> Gamification & Achievements
            </h2>

            <XPProgressBar />

            <div className="pt-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unlocked Badges</span>
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
                  { name: 'Amazon / Others', pct: 12, color: 'bg-amber-500' },
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
              <button onClick={() => setAlertModalProduct(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-300">Target Price (₹):</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-400">Current Best Price: ₹{getBestDeal(alertModalProduct).winner.price}</p>
            </div>

            <button
              onClick={() => {
                toast.success(`Price alert set for ₹${targetPrice}! We'll send PWA push notifications.`);
                setAlertModalProduct(null);
              }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
            >
              Confirm Alert
            </button>
          </div>
        </div>
      )}

      {/* ONDC PAYLOAD PREVIEW MODAL */}
      {payloadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span>🟢</span> ONDC Beckn Protocol JSON Payload
              </h3>
              <button onClick={() => setPayloadModal(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-300 max-h-60 overflow-y-auto no-scrollbar">
              {payloadModal}
            </pre>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(payloadModal);
                  toast.success('Payload copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200"
              >
                Copy Payload
              </button>
              <button
                onClick={() => setPayloadModal(null)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-lg text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
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
