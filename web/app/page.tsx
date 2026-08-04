'use client';

import React, { useState } from 'react';
import { 
  Search, Mic, MapPin, Zap, ShoppingCart, Sparkles, Filter, Check, 
  Award, Bell, Share2, ExternalLink, ShieldCheck, ArrowRight, RefreshCw,
  Plus, Minus, Trash2, Cpu, Copy, CheckCircle2, AlertTriangle, Layers, Split, Clock,
  ChevronDown, Heart, Baby, Headphones, Gift, Tag, Percent, ThumbsUp, X
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
import { getRealisticProductImage } from '@/lib/productImageLibrary';

// Real items matching the exact photos
const PHOTO_DEALS = [
  {
    id: "d1",
    discount: "9% OFF",
    brandTag: "AMUL • 500G",
    title: "Amul Pasteurised Butter",
    platformTag: "ONDC NETWORK",
    price: 260,
    mrp: 285,
    imageUrl: "/products/amul_butter.jpg",
    catalogId: "sku-001"
  },
  {
    id: "d2",
    discount: "19% OFF",
    brandTag: "AASHIRVAAD • 5KG",
    title: "Aashirvaad Superior MP Sharbati Whole Wheat Atta",
    platformTag: "ONDC NETWORK",
    price: 275,
    mrp: 340,
    imageUrl: "/products/aashirvaad_atta.jpg",
    catalogId: "sku-002"
  },
  {
    id: "d3",
    discount: "26% OFF",
    brandTag: "FORTUNE • 1L POUCH",
    title: "Fortune Sunlite Refined Sunflower Oil",
    platformTag: "ONDC NETWORK",
    price: 122,
    mrp: 165,
    imageUrl: "/products/fortune_oil.jpg",
    catalogId: "sku-004"
  },
  {
    id: "d4",
    discount: "7% OFF",
    brandTag: "MOTHER DAIRY • 1L POLY PACK",
    title: "Mother Dairy Toned Milk",
    platformTag: "ONDC NETWORK",
    price: 52,
    mrp: 56,
    imageUrl: "/products/mother_dairy_milk.jpg",
    catalogId: "sku-008"
  },
  {
    id: "d5",
    discount: "25% OFF",
    brandTag: "TATA TEA • 500G PACK",
    title: "Tata Tea Gold Premium Black Tea",
    platformTag: "ONDC NETWORK",
    price: 280,
    mrp: 375,
    imageUrl: "/products/tata_tea_gold.jpg",
    catalogId: "sku-003"
  },
  {
    id: "d6",
    discount: "18% OFF",
    brandTag: "NESCAFÉ • 100G GLASS JAR",
    title: "Nescafe Classic Instant Coffee Powder",
    platformTag: "ONDC NETWORK",
    price: 315,
    mrp: 385,
    imageUrl: "/products/nescafe_classic.jpg",
    catalogId: "sku-006"
  }
];

const PHOTO_COMPARISONS = [
  {
    id: "c1",
    brand: "FORTUNE",
    gtin: "8906007280014",
    title: "Fortune Sunlite Refined Sunflower Oil",
    unitTag: "1L Pouch",
    description: "Light and clear edible sunflower oil rich in Vitamin E for healthy cooking.",
    imageUrl: "/products/fortune_oil.jpg",
    bestDealPrice: 122,
    bestDealPlatform: "ONDC Network",
    savingsVsMRP: 43,
    mrp: 165,
    matrix: [
      { name: "Zepto", price: 135, sla: "7m", mrp: 165 },
      { name: "Blinkit", price: 128, sla: "8m", mrp: 165 },
      { name: "Swiggy Instamart", price: 139, sla: "12m", mrp: 165 },
      { name: "Flipkart Minutes", price: 129, sla: "11m", mrp: 165 },
      { name: "Amazon Fresh", price: 125, sla: "60m", mrp: 165 },
      { name: "ONDC Network", price: 122, sla: "15m", mrp: 165, isWinner: true },
    ],
    catalogItem: CANONICAL_CATALOG[3]
  },
  {
    id: "c2",
    brand: "CADBURY",
    gtin: "8901233001002",
    title: "Cadbury Dairy Milk Silk Chocolate",
    unitTag: "150g Bar",
    description: "Rich, smooth and creamy chocolate made from fine cocoa beans.",
    imageUrl: "/products/amul_butter.jpg",
    bestDealPrice: 148,
    bestDealPlatform: "ONDC Network",
    savingsVsMRP: 37,
    mrp: 185,
    matrix: [
      { name: "Zepto", price: 160, sla: "7m", mrp: 185 },
      { name: "Blinkit", price: 155, sla: "8m", mrp: 185 },
      { name: "Swiggy Instamart", price: 162, sla: "12m", mrp: 185 },
      { name: "Flipkart Minutes", price: 152, sla: "11m", mrp: 185 },
      { name: "Amazon Fresh", price: 150, sla: "60m", mrp: 185 },
      { name: "ONDC Network", price: 148, sla: "15m", mrp: 185, isWinner: true },
    ],
    catalogItem: CANONICAL_CATALOG[0]
  },
  {
    id: "c3",
    brand: "NESTLÉ",
    gtin: "8901058852312",
    title: "Maggi 2-Minute Masala Instant Noodles",
    unitTag: "12 Packs (840g)",
    description: "Iconic 2-minute instant noodles enriched with roasted spices and goodness of wheat.",
    imageUrl: "/products/maggi_noodles.jpg",
    bestDealPrice: 155,
    bestDealPlatform: "ONDC Network",
    savingsVsMRP: 25,
    mrp: 180,
    matrix: [
      { name: "Zepto", price: 165, sla: "7m", mrp: 180 },
      { name: "Blinkit", price: 160, sla: "8m", mrp: 180 },
      { name: "Swiggy Instamart", price: 168, sla: "12m", mrp: 180 },
      { name: "Flipkart Minutes", price: 158, sla: "11m", mrp: 180 },
      { name: "Amazon Fresh", price: 156, sla: "60m", mrp: 180 },
      { name: "ONDC Network", price: 155, sla: "15m", mrp: 180, isWinner: true },
    ],
    catalogItem: CANONICAL_CATALOG[4]
  },
  {
    id: "c4",
    brand: "DETTOL",
    gtin: "8901396112003",
    title: "Dettol Original Germ Protection Bathing Soap",
    unitTag: "125g (Pack of 4)",
    description: "Provides 100% better germ protection compared to ordinary soaps.",
    imageUrl: "/products/dettol_soap.jpg",
    bestDealPrice: 175,
    bestDealPlatform: "ONDC Network",
    savingsVsMRP: 65,
    mrp: 240,
    matrix: [
      { name: "Zepto", price: 195, sla: "7m", mrp: 240 },
      { name: "Blinkit", price: 188, sla: "8m", mrp: 240 },
      { name: "Swiggy Instamart", price: 198, sla: "12m", mrp: 240 },
      { name: "Flipkart Minutes", price: 185, sla: "11m", mrp: 240 },
      { name: "Amazon Fresh", price: 180, sla: "60m", mrp: 240 },
      { name: "ONDC Network", price: 175, sla: "15m", mrp: 240, isWinner: true },
    ],
    catalogItem: CANONICAL_CATALOG[6]
  }
];

export default function ExactMatchMasterApp() {
  const { toast } = useToast();
  const { location, selectLocationPreset, cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { recordCartOptimization } = useGamificationStore();
  const { addSavings } = useAnalyticsStore();

  const [activeTab, setActiveTab] = useState<'feed' | 'compare' | 'alerts'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStrategy, setSelectedStrategy] = useState<'single' | 'split2' | 'split3' | 'fastest'>('split2');
  const [isListening, setIsListening] = useState(false);
  const [showSmartCartDrawer, setShowSmartCartDrawer] = useState(false);

  // Price Drop Alerts State matching Photo 1
  const [alerts, setAlerts] = useState([
    {
      id: "a1",
      title: "Amul Pasteurised Butter (500g)",
      date: "2026-07-25",
      platform: "ONDC Network",
      currentBest: 260,
      targetAlert: 250,
      imageUrl: "/products/amul_butter.jpg"
    },
    {
      id: "a2",
      title: "boAt Airdopes 141 True Wireless Earbuds",
      date: "2026-07-28",
      platform: "ONDC Network",
      currentBest: 999,
      targetAlert: 899,
      imageUrl: "/products/amul_butter.jpg"
    }
  ]);

  const [newMonitorModal, setNewMonitorModal] = useState(false);
  const [ondcPayloadModal, setOndcPayloadModal] = useState<string | null>(null);
  const [injectorLogsModal, setInjectorLogsModal] = useState<string[] | null>(null);

  // Speech Recognition
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice dictation not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.start();
    setIsListening(true);
    toast.info('Listening... Speak now');

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setSearchQuery(text);
      setIsListening(false);
      toast.success(`Recognized: "${text}"`);
    };
    recognition.onerror = () => setIsListening(false);
  };

  // Cart Optimizer Logic
  const cartInputItems = cart.map((item) => {
    const catalogSKU = CANONICAL_CATALOG.find((sku) => sku.id === item.product.id) || {
      id: item.product.id,
      title: item.product.title,
      brand: item.product.brand,
      unit: item.product.unit,
      category: item.product.category,
      gtin: item.product.gtin || "8901262010055",
      mrp: item.product.mrp || 275,
      imageUrl: item.product.imageUrl || "/products/amul_butter.jpg",
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

  const handleTriggerCheckout = (mode: 'ondc' | 'amazon' | 'injector') => {
    if (!optimizationResult || cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    addSavings(optimizationResult.totalNetSavings, 'PricePulse Engine');
    recordCartOptimization(optimizationResult.totalNetSavings);

    if (mode === 'ondc') {
      const payloadStr = generateONDCBecknPayload(optimizationResult.vendorSplits, location.pincode);
      setOndcPayloadModal(payloadStr);
      toast.success('ONDC Beckn Payload Generated!');
    } else if (mode === 'amazon') {
      const link = generateAmazonMultiASINLink(optimizationResult.vendorSplits);
      window.open(link, '_blank');
      toast.success('Opening Amazon Multi-ASIN Cart Link...');
    } else if (mode === 'injector') {
      const firstSplit = optimizationResult.vendorSplits[0];
      if (firstSplit) {
        const logs = simulateCartInjector(firstSplit);
        setInjectorLogsModal(logs);
        toast.success('Cart Injector Script Executed! Halting safely at 2FA Payment Gate.');
      }
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success('Price drop monitor removed.');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased pb-24">
      
      {/* ===================================================================== */}
      {/* HEADER BAR (EXACT DESIGN MATCH FROM ALL 4 PHOTOS)                      */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Location */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5">
              <div className="bg-indigo-600 text-white font-black text-xs px-2 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>PP</span>
              </div>
              <div>
                <span className="font-black text-slate-900 text-sm tracking-tight block leading-none">PRICEPULSE</span>
                <span className="text-[9px] font-bold text-indigo-600 tracking-wider">AI ENGINE</span>
              </div>
            </div>

            {/* Pincode Location Button */}
            <div className="relative">
              <select
                value={location.pincode}
                onChange={(e) => selectLocationPreset(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-full px-3 py-1 outline-none cursor-pointer flex items-center appearance-none pr-6"
              >
                {LOCATION_PRESETS.map((preset) => (
                  <option key={preset.pincode} value={preset.pincode}>
                    📍 {preset.name} ({preset.pincode})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Center Nav Capsule Tabs */}
          <div className="hidden md:flex items-center bg-slate-200/80 p-1 rounded-full text-xs font-black">
            {[
              { id: 'feed', label: 'FEED' },
              { id: 'compare', label: 'COMPARE' },
              { id: 'alerts', label: 'ALERTS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-1 rounded-full transition-all tracking-wider ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Cart & Profile */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowSmartCartDrawer(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>SMART CART</span>
              <span className="bg-white text-indigo-700 text-[10px] font-black rounded-full px-1.5 py-0.2">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </button>

            {/* Profile Avatar Pill */}
            <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-300 rounded-full px-2 py-1">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                alt="User" 
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-slate-800">Rahul</span>
              <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-black px-1.5 rounded-full">
                Lv.3
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE TABS (IF SMALL SCREEN) */}
      <div className="md:hidden flex justify-center bg-slate-200 p-1 border-b border-slate-300 text-xs font-black">
        {['feed', 'compare', 'alerts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-1.5 rounded-full uppercase tracking-wider ${
              activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="max-w-[1600px] mx-auto px-4 py-4 space-y-6">

        {/* =================================================================== */}
        {/* TAB 1: FEED VIEW (EXACT MATCH FOR PHOTO 3 & PHOTO 4)               */}
        {/* =================================================================== */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            
            {/* HERO GREEN BANNER CARD (PHOTO 4) */}
            <div className="bg-[#0f3d38] text-white rounded-[28px] p-6 shadow-xl relative overflow-hidden space-y-4 border border-emerald-900">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5" />
                <span>AI Quick-Commerce Price Engine for India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl leading-tight">
                Stop Overpaying on Groceries &amp; Quick Orders.
              </h1>

              <p className="text-sm text-emerald-200/90 max-w-2xl">
                PricePulse aggregates 4,900+ real-time listings across <strong className="text-white">Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, Amazon Fresh, and ONDC</strong>.
              </p>

              {/* Natural Language Search Input */}
              <div className="bg-white rounded-2xl p-1.5 shadow-lg flex items-center max-w-3xl">
                <Sparkles className="w-5 h-5 text-indigo-500 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder='Try "Find 500g Amul butter and 5kg Atta under ₹400"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
                />
                <button
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-xl text-slate-500 hover:text-indigo-600 transition ${isListening ? 'bg-rose-500 text-white animate-pulse' : ''}`}
                  title="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('compare')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-1 shrink-0 transition"
                >
                  <span>SEARCH</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Prompt Tags */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                <span className="font-extrabold text-emerald-300 tracking-wider">POPULAR:</span>
                {[
                  { label: '🧈 AMUL BUTTER 500G', q: 'Amul Butter' },
                  { label: '🌾 AASHIRVAAD ATTA 5KG', q: 'Aashirvaad Atta' },
                  { label: '🥛 MOTHER DAIRY MILK', q: 'Mother Dairy Milk' },
                  { label: '☕ TATA TEA & COFFEE', q: 'Tata Tea' },
                  { label: '🍜 MAGGI MASALA 12P', q: 'Maggi' },
                  { label: '🧼 DETTOL SOAPS', q: 'Dettol Soap' },
                ].map((tag) => (
                  <button
                    key={tag.q}
                    onClick={() => {
                      setSearchQuery(tag.q);
                      setActiveTab('compare');
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold px-2.5 py-1 rounded-full transition"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DARK STORE LIVE RADAR BAR (PHOTO 4) */}
            <div className="bg-[#121824] text-white rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">DARK STORE LIVE RADAR</h2>
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded">PINCODE 560038</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">⏱ Ping: 12ms</span>
              </div>

              {/* 6 Platform SLA Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { name: "ZEPTO", badge: "bg-purple-500/20 text-purple-300 border-purple-500/40", sla: "~7 MINS", fee: "Fee: ₹15" },
                  { name: "BLINKIT", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40", sla: "~8 MINS", fee: "Fee: ₹16 + ₹15 surge" },
                  { name: "SWIGGY INSTAMART", badge: "bg-orange-500/20 text-orange-300 border-orange-500/40", sla: "~12 MINS", fee: "Fee: ₹20" },
                  { name: "FLIPKART MINUTES", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40", sla: "~10 MINS", fee: "Fee: ₹15" },
                  { name: "AMAZON FRESH", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", sla: "~45 MINS", fee: "Fee: ₹30" },
                  { name: "ONDC NETWORK", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", sla: "~15 MINS", fee: "Fee: ₹10" },
                ].map((v) => (
                  <div key={v.name} className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1">
                    <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded border ${v.badge}`}>
                      {v.name}
                    </span>
                    <div className="text-xs font-mono font-black text-white">{v.sla}</div>
                    <div className="text-[9px] text-slate-400">{v.fee}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* TRENDING PRICE DROPS SECTION (PHOTO 3) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">🔥 TRENDING PRICE DROPS</h2>
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">LIVE DEALS</span>
                </div>
                <button onClick={() => setActiveTab('compare')} className="text-xs font-bold text-indigo-600 hover:underline">VIEW ALL ➔</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {PHOTO_DEALS.map((deal) => (
                  <div key={deal.id} className="bg-white border border-slate-200 rounded-2xl p-2.5 space-y-2 relative shadow-sm hover:shadow-md transition">
                    <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow">
                      {deal.discount}
                    </span>

                    <img src={deal.imageUrl} alt={deal.title} className="w-full h-28 object-cover rounded-xl bg-slate-100" />

                    <div>
                      <span className="text-[9px] font-black text-slate-400 block tracking-wide uppercase">{deal.brandTag}</span>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 h-8">{deal.title}</h3>
                    </div>

                    <div className="bg-emerald-50 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-200 inline-block">
                      {deal.platformTag}
                    </div>

                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-sm font-black text-slate-900">₹{deal.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{deal.mrp}</span>
                    </div>

                    <button
                      onClick={() => {
                        const item = CANONICAL_CATALOG.find(s => s.id === deal.catalogId) || CANONICAL_CATALOG[0];
                        addToCart(item as any);
                        toast.success(`Added ${deal.title} to Basket!`);
                      }}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>ADD</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* MASTER CATEGORY EXPLORER (PHOTO 3) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">🌐 MASTER CATEGORY EXPLORER</h2>
                <span className="text-xs text-slate-500 font-semibold">1,250+ SKUs Aggregated</span>
              </div>

              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs font-bold">
                {[
                  { name: "ALL PRODUCTS", active: true },
                  { name: "DAIRY &...", icon: "🥛" },
                  { name: "STAPLES & ATTA", icon: "🌾" },
                  { name: "SNACKS &...", icon: "🍿" },
                  { name: "BEVERAGES & TEA", icon: "☕" },
                  { name: "HOUSEHOLD &...", icon: "🧼" },
                  { name: "PERSONAL CARE", icon: "🧴" },
                  { name: "BABY CARE", icon: "👶" },
                  { name: "ELECTRONICS &...", icon: "🎧" },
                ].map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab('compare')}
                    className={`shrink-0 px-4 py-2 rounded-xl border flex items-center space-x-1.5 transition ${
                      cat.active 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3 FEATURE HIGHLIGHT CARDS (PHOTO 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">ONDC Direct Merchant Prices</h3>
                  <p className="text-xs text-slate-500 mt-1">Bypass high commission markups by buying directly from neighbourhood kirana networks.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">3-Way Combinatorial Split</h3>
                  <p className="text-xs text-slate-500 mt-1">Our AI evaluates 10+ platform combinations to split your cart items for maximum savings.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Bank &amp; UPI Offer Stacking</h3>
                  <p className="text-xs text-slate-500 mt-1">Automatically stacks HDFC, CRED Pay, and instant UPI discounts onto your basket total.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: COMPARE VIEW (EXACT MATCH FOR PHOTO 2)                      */}
        {/* =================================================================== */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">⚡ LIVE PRODUCT COMPARISON MATRIX</h2>
              <span className="text-xs text-slate-500 font-semibold">Showing 4 Featured SKUs</span>
            </div>

            {/* 2-COLUMN GRID OF COMPARISON CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {PHOTO_COMPARISONS.map((card) => (
                <div key={card.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  {/* Top Product Header */}
                  <div className="flex items-start space-x-3">
                    <div className="relative shrink-0">
                      <img src={card.imageUrl} alt={card.title} className="w-20 h-20 object-cover rounded-xl bg-slate-100 border border-slate-200" />
                      <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded">
                        {card.unitTag}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wide">{card.brand}</span>
                        <span className="font-mono text-slate-400">GTIN {card.gtin}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{card.title}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{card.description}</p>
                      
                      {/* Green Best Deal Badge */}
                      <div className="flex items-center space-x-2 text-[10px] pt-0.5">
                        <span className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                          Best Deal: ₹{card.bestDealPrice} on {card.bestDealPlatform}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          ⭐ Save ₹{card.savingsVsMRP} vs MRP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 6-PLATFORM COMPARISON TABLE */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1 text-xs">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
                      <span>PLATFORM COMPARISON</span>
                      <span>PRICE &amp; SLA</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      {card.matrix.map((p) => (
                        <div 
                          key={p.name}
                          className={`p-1.5 rounded-lg border ${
                            p.isWinner 
                              ? 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-[10px] truncate">{p.name}</span>
                            <span className="font-mono font-black text-slate-900">₹{p.price}</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-0.5">
                            <span>⏱ {p.sla}</span>
                            <span className="line-through">₹{p.mrp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        addToCart(card.catalogItem as any);
                        toast.success(`Added ${card.title} to Basket!`);
                      }}
                      className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>ADD TO BASKET</span>
                    </button>

                    <button
                      onClick={() => {
                        toast.info(`Redirecting directly to ${card.bestDealPlatform}...`);
                      }}
                      className="py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <span>BUY ON {card.bestDealPlatform.toUpperCase()}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: ALERTS VIEW (EXACT MATCH FOR PHOTO 1)                        */}
        {/* =================================================================== */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            
            {/* Top Banner Card (Photo 1) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Price Drop Monitors ({alerts.length})</h2>
                  <p className="text-xs text-slate-500">Background PWA worker pings dark-store APIs to catch sudden flash discounts</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toast.success('⚡ PWA Push Notification Test: Amul Butter dropped to ₹250 on ONDC!')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  ⚡ Test PWA Push Alert
                </button>

                <button
                  onClick={() => setNewMonitorModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  + New Monitor
                </button>
              </div>
            </div>

            {/* Grid of Alert Cards (Photo 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm relative">
                  <div className="flex items-center space-x-3">
                    <img src={alert.imageUrl} alt={alert.title} className="w-16 h-16 object-cover rounded-xl bg-slate-100 border border-slate-200" />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                          {alert.platform}
                        </span>
                        <span className="text-[10px] text-slate-400">Set {alert.date}</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900">{alert.title}</h3>
                      <div className="flex items-center space-x-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">CURRENT BEST</span>
                          <span className="font-extrabold text-slate-900">₹{alert.currentBest}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-500 font-bold block uppercase">TARGET ALERT</span>
                          <span className="font-extrabold text-rose-600">₹{alert.targetAlert}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition"
                    title="Remove Monitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ===================================================================== */}
      {/* FLOATING SAVINGS METER WIDGET (PRESENT ON ALL 4 PHOTOS AT BOTTOM LEFT)  */}
      {/* ===================================================================== */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-slate-900 border border-slate-800 text-white rounded-full px-4 py-2 shadow-2xl flex items-center space-x-3 border-emerald-500/30">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin absolute"></span>
            <Zap className="w-3 h-3 text-emerald-400" />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">SAVINGS METER ⚡</div>
            <div className="text-xs font-black text-emerald-400 font-mono">₹1240 / ₹1500</div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SMART CART DRAWER / MODAL                                             */}
      {/* ===================================================================== */}
      {showSmartCartDrawer && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white max-w-md w-full h-full shadow-2xl p-5 overflow-y-auto space-y-4 text-slate-900 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Smart Cart Optimizer</h2>
                </div>
                <button onClick={() => setShowSmartCartDrawer(false)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">✕</button>
              </div>

              {/* Strategy Selector */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                {[
                  { id: 'single', label: '🏆 Single' },
                  { id: 'split2', label: '🔀 2-Split' },
                  { id: 'split3', label: '⚡ 3-Split' },
                  { id: 'fastest', label: '⏱ SLA' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStrategy(s.id as any)}
                    className={`py-1.5 rounded-lg text-center ${
                      selectedStrategy === s.id ? 'bg-indigo-600 text-white font-black' : 'text-slate-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Items List */}
              {cart.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Your cart is empty!</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{item.product.title}</div>
                        <div className="text-[10px] text-slate-500">₹{item.product.mrp} MRP</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-5 h-5 bg-slate-200 rounded font-bold">-</button>
                        <span className="font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-5 h-5 bg-slate-200 rounded font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Optimization Result */}
              {optimizationResult && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Net Savings</span>
                      <div className="text-xl font-black text-emerald-700">₹{optimizationResult.totalNetSavings}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div>Pay Total: <span className="font-bold">₹{optimizationResult.grandTotalCost}</span></div>
                    </div>
                  </div>

                  <SavingsBreakdownChart 
                    items={optimizationResult.itemSavingsBreakdown.map((i) => ({
                      title: i.productTitle,
                      savings: i.itemSavings,
                      platform: i.winningVendor
                    }))} 
                  />

                  {/* Checkout Handoff Options */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleTriggerCheckout('ondc')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5"
                    >
                      <span>🟢 ONDC Beckn Protocol JSON Payload</span>
                    </button>

                    <button
                      onClick={() => handleTriggerCheckout('amazon')}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5"
                    >
                      <span>🟧 Amazon Multi-ASIN Cart Link</span>
                    </button>

                    <button
                      onClick={() => handleTriggerCheckout('injector')}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>⚡ cart_injector.js Handoff</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ONDC MODAL */}
      {ondcPayloadModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-lg w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-emerald-700 uppercase tracking-wider">🟢 ONDC Beckn Protocol JSON Payload</h3>
              <button onClick={() => setOndcPayloadModal(null)} className="text-slate-400 hover:text-slate-900 text-xs font-bold">✕</button>
            </div>
            <pre className="bg-slate-900 p-3 rounded-xl text-[10px] font-mono text-emerald-400 max-h-64 overflow-y-auto">
              {ondcPayloadModal}
            </pre>
            <div className="flex justify-end space-x-2">
              <button onClick={() => { navigator.clipboard.writeText(ondcPayloadModal); toast.success('Copied!'); }} className="px-3 py-1.5 bg-slate-200 text-xs font-bold rounded-lg">Copy</button>
              <button onClick={() => setOndcPayloadModal(null)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* INJECTOR LOGS MODAL */}
      {injectorLogsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-lg w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-indigo-700 uppercase tracking-wider">⚡ cart_injector.js Logs</h3>
              <button onClick={() => setInjectorLogsModal(null)} className="text-slate-400 hover:text-slate-900 text-xs font-bold">✕</button>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl text-[10px] font-mono text-indigo-300 space-y-1 max-h-64 overflow-y-auto">
              {injectorLogsModal.map((log, i) => (
                <div key={i}>&gt; {log}</div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setInjectorLogsModal(null)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
