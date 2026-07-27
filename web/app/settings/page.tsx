'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';

export default function SettingsPage() {
  const router = useRouter();
  const location = useCartStore((state) => state.location);
  const setLocation = useCartStore((state) => state.setLocation);
  const resetAnalytics = useAnalyticsStore((state) => state.reset);
  
  const [priceAlertsOn, setPriceAlertsOn] = useState(true);
  const [orderUpdatesOn, setOrderUpdatesOn] = useState(true);
  const [weeklyDigestOn, setWeeklyDigestOn] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [newPincode, setNewPincode] = useState('');

  const handleExportData = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricepulse_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 mr-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { label: 'Price Drop Alerts', state: priceAlertsOn, setter: setPriceAlertsOn },
              { label: 'Order Updates', state: orderUpdatesOn, setter: setOrderUpdatesOn },
              { label: 'Weekly Digest', state: weeklyDigestOn, setter: setWeeklyDigestOn },
            ].map((item) => (
              <div key={item.label} className="bg-card/40 border border-border/50 rounded-xl p-4 flex items-center justify-between backdrop-blur-sm">
                <span className="font-medium">{item.label}</span>
                <button
                  onClick={() => item.setter(!item.state)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${item.state ? 'bg-emerald-500' : 'bg-muted'}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${item.state ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Default Location</h2>
          <div className="bg-card/40 border border-border/50 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pincode</p>
                <p className="font-medium">{location.pincode || 'Not Set'}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPincodeModalOpen(true)}
              className="text-primary text-sm font-semibold px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20"
            >
              Change
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Theme</h2>
          <div className="bg-card/40 border border-border/50 rounded-2xl p-4 flex gap-4 backdrop-blur-sm">
            {['Dark', 'System', 'Light'].map((theme) => (
              <label key={theme} className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="theme" value={theme.toLowerCase()} checked={theme === 'Dark'} readOnly className="accent-primary w-4 h-4" />
                <span className={theme !== 'Dark' ? 'opacity-50' : ''}>{theme}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Data & Privacy</h2>
          <div className="space-y-3">
            <button onClick={handleExportData} className="w-full bg-card/40 border border-border/50 rounded-2xl p-4 text-left font-medium hover:bg-card/60 backdrop-blur-sm">
              Export My Data
            </button>
            <button onClick={() => { resetAnalytics(); alert('Analytics cleared'); }} className="w-full bg-card/40 border border-border/50 rounded-2xl p-4 text-left font-medium hover:bg-card/60 backdrop-blur-sm text-amber-500">
              Clear Analytics
            </button>
            <button onClick={handleClearData} className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-left font-medium hover:bg-red-500/20 backdrop-blur-sm text-red-500">
              Clear All Data
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">About</h2>
          <div className="bg-card/40 border border-border/50 rounded-2xl p-4 space-y-4 backdrop-blur-sm">
            <div className="flex justify-between items-center pb-3 border-b border-border/50">
              <span className="font-medium">Version</span>
              <span className="text-muted-foreground">PricePulse v3.0.0</span>
            </div>
            <div className="space-y-3">
              <a href="#" className="block text-primary hover:underline">Privacy Policy</a>
              <a href="#" className="block text-primary hover:underline">Terms of Service</a>
              <a href="#" className="block text-primary hover:underline">Open Source Licenses</a>
            </div>
          </div>
        </section>
      </div>

      {isPincodeModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <h3 className="text-lg font-bold mb-4">Change Pincode</h3>
            <input 
              type="text" 
              maxLength={6} 
              placeholder="Enter 6-digit pincode" 
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 mb-4 focus:outline-none focus:border-primary"
            />
            <div className="flex gap-3">
              <button onClick={() => setIsPincodeModalOpen(false)} className="flex-1 px-4 py-2 bg-muted rounded-xl">Cancel</button>
              <button 
                onClick={() => {
                  if (newPincode.length >= 6) {
                    setLocation({ pincode: newPincode });
                    setIsPincodeModalOpen(false);
                  }
                }} 
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
