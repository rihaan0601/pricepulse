'use client';

import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SavingsMeter() {
  const { totalSavings } = useAnalyticsStore();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || totalSavings === 0) return null;

  const goal = 1000;
  const progress = Math.min(totalSavings / goal, 1);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div 
      className="fixed bottom-24 left-4 z-40 animate-in slide-in-from-left-8 fade-in duration-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group cursor-pointer flex items-center bg-card/60 backdrop-blur-xl border border-emerald-500/30 rounded-full p-1 shadow-[0_4px_20px_rgba(16,185,129,0.2)] transition-all hover:bg-card/90">
        
        {/* Pulse effect on mount */}
        <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20 duration-1000" style={{ animationIterationCount: 3 }} />

        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 56 56">
            <circle
              cx="28" cy="28" r={radius}
              className="fill-none stroke-emerald-500/20"
              strokeWidth="4"
            />
            <circle
              cx="28" cy="28" r={radius}
              className="fill-none stroke-emerald-500 transition-all duration-1000 ease-out"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center justify-center z-10 leading-none">
            <span className="text-[10px] text-emerald-500/80 font-bold mb-0.5">₹</span>
            <span className="text-sm font-black text-emerald-400">{totalSavings.toFixed(0)}</span>
          </div>
        </div>

        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
          isHovered ? "w-24 opacity-100 ml-2 mr-3" : "w-0 opacity-0 m-0"
        )}>
          <div className="flex flex-col justify-center text-xs">
            <span className="font-bold text-foreground">Total Saved</span>
            <span className="text-[10px] text-emerald-500 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Goal: ₹{goal}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
