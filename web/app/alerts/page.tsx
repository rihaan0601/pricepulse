'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Trash2, Plus, Target } from 'lucide-react';
import { usePriceAlertStore } from '@/store/usePriceAlertStore';

const PLATFORMS = ['Blinkit', 'Zepto', 'Instamart', 'Amazon', 'Flipkart Minutes'];

export default function AlertsPage() {
  const router = useRouter();
  const { alerts, removeAlert, addAlert } = usePriceAlertStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newAlertTerm, setNewAlertTerm] = useState('');
  const [newAlertPlatform, setNewAlertPlatform] = useState(PLATFORMS[0]);
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertType, setNewAlertType] = useState('Below Price');

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAlertTerm && newAlertPrice) {
      addAlert(`prod_${Date.now()}`, newAlertTerm, Number(newAlertPrice), Number(newAlertPrice) + 50);
      setIsModalOpen(false);
      setNewAlertTerm('');
      setNewAlertPrice('');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 mr-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Price Alerts</h1>
        <Bell className="w-5 h-5 text-muted-foreground" />
      </header>

      <div className="p-4 space-y-6 max-w-xl mx-auto">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Active Alerts</h2>
          {alerts.length === 0 ? (
            <div className="text-center p-8 bg-card/20 rounded-2xl border border-border/30 border-dashed">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">No active alerts. Add one to start saving!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-card/40 border border-border/50 rounded-xl p-4 flex items-center justify-between backdrop-blur-sm">
                  <div>
                    <h3 className="font-bold">{alert.productTitle}</h3>
                    <div className="flex items-center space-x-2 mt-1 text-sm">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-muted-foreground">Target: ₹{alert.targetPrice}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                      <span className="text-xs text-yellow-500 font-medium">Watching</span>
                    </div>
                  </div>
                  <button onClick={() => removeAlert(alert.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Alert History</h2>
          <div className="text-center p-8 bg-card/20 rounded-2xl border border-border/30 border-dashed">
            <p className="text-muted-foreground text-sm">No past triggered alerts.</p>
          </div>
        </section>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)] hover:scale-105 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-lg">New Price Alert</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleAddAlert} className="p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Product Search</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Amul Butter 500g" 
                  value={newAlertTerm}
                  onChange={(e) => setNewAlertTerm(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Platform</label>
                <select 
                  value={newAlertPlatform}
                  onChange={(e) => setNewAlertPlatform(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary appearance-none"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Target Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="150" 
                    value={newAlertPrice}
                    onChange={(e) => setNewAlertPrice(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Alert Type</label>
                  <select 
                    value={newAlertType}
                    onChange={(e) => setNewAlertType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary appearance-none"
                  >
                    <option>Below Price</option>
                    <option>% Drop</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl mt-2 hover:bg-primary/90 transition-colors">
                Set Alert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
