'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, ShoppingCart, Bell, Calendar, Trophy, Activity, Award } from 'lucide-react';
import UserHeaderAvatar from '../components/UserHeaderAvatar';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import XPProgressBar from '../components/XPProgressBar';
import SavingsBadgeSystem from '../components/SavingsBadgeSystem';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const analytics = useAnalyticsStore();
  const gamification = useGamificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const platformWinsData = Object.entries(analytics.platformWins).map(([platform, wins]) => ({ platform, wins }));
  const maxWins = Math.max(...platformWinsData.map(d => d.wins), 1);
  const topPlatform = analytics.getTopPlatform();

  // Simple 7-day data mock (derived from events)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const weeklyStats = last7Days.map(date => {
    const dayEvents = analytics.events.filter(e => e.timestamp.startsWith(date) && e.type === 'cart_optimized');
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: dayEvents.length
    };
  });
  const maxDailyOps = Math.max(...weeklyStats.map(d => d.count), 1);

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>My Savings Dashboard</span>
          </h1>
        </div>
        <UserHeaderAvatar />
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card/40 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center space-x-3 text-emerald-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold">Total Savings</h3>
            </div>
            <div className="text-4xl font-black text-foreground">
              ₹{analytics.totalSavings.toFixed(0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">All time money saved</p>
          </div>

          <div className="bg-card/40 border border-border/50 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 text-primary mb-2">
              <ShoppingCart className="w-5 h-5" />
              <h3 className="font-semibold">Optimizations</h3>
            </div>
            <div className="text-4xl font-black text-foreground">
              {analytics.cartOptimizationCount}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Carts analyzed</p>
          </div>

          <div className="bg-card/40 border border-border/50 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 text-blue-400 mb-2">
              <Bell className="w-5 h-5" />
              <h3 className="font-semibold">Active Alerts</h3>
            </div>
            <div className="text-4xl font-black text-foreground">
              {gamification.alertCount}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Price drops tracked</p>
          </div>
        </section>

        {/* Gamification Section */}
        <section className="bg-card/40 border border-border/50 rounded-3xl p-6 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Your Level & Badges</span>
            </h2>
          </div>
          
          <div className="bg-background/50 border border-border/50 rounded-2xl p-4 flex justify-center shadow-inner">
            <XPProgressBar />
          </div>

          <SavingsBadgeSystem />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Platform Wins Chart */}
          <section className="bg-card/40 border border-border/50 rounded-3xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold flex items-center space-x-2 mb-6">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Platform Leaderboard</span>
            </h2>
            
            {platformWinsData.length > 0 ? (
              <div className="space-y-4">
                {platformWinsData.sort((a, b) => b.wins - a.wins).map(d => (
                  <div key={d.platform} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="capitalize">{d.platform.replace('_', ' ')}</span>
                      <span>{d.wins} wins</span>
                    </div>
                    <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${(d.wins / maxWins) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No platforms have won yet.</p>
                <p className="text-sm mt-1">Optimize a cart to see who wins!</p>
              </div>
            )}
          </section>

          {/* Monthly Activity */}
          <section className="bg-card/40 border border-border/50 rounded-3xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold flex items-center space-x-2 mb-6">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Weekly Activity</span>
            </h2>

            {weeklyStats.some(s => s.count > 0) ? (
              <div className="flex items-end justify-between h-40 pt-4 border-b border-border/30 pb-2">
                {weeklyStats.map((stat, i) => {
                  const height = (stat.count / maxDailyOps) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center group w-full px-1">
                      <div className="relative w-full h-full flex items-end justify-center">
                        <div 
                          className="w-full max-w-[2rem] bg-blue-500/20 group-hover:bg-blue-500/40 rounded-t-sm transition-all"
                          style={{ height: `${height}%`, minHeight: stat.count > 0 ? '4px' : '0' }}
                        />
                        {stat.count > 0 && (
                          <span className="absolute -top-6 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {stat.count}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-2">{stat.date}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 space-y-3 bg-secondary/20 rounded-xl border border-dashed border-border/60">
                <Activity className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">Start comparing to see your stats!</p>
              </div>
            )}
          </section>
        </div>

        {/* Recent Events */}
        <section className="bg-card/40 border border-border/50 rounded-3xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
          
          {analytics.events.length > 0 ? (
            <div className="space-y-4">
              {analytics.events.slice(0, 5).map((event, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 hover:bg-secondary/40 rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                    {event.type === 'cart_optimized' ? '🛒' : event.type === 'alert_set' ? '🔔' : event.type === 'split_used' ? '🔀' : '👀'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    {event.metadata?.savings && (
                      <p className="text-xs text-emerald-400">Saved ₹{event.metadata.savings}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
          )}
        </section>
      </div>
    </div>
  );
}
