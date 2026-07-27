'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SavingsItem {
  title: string;
  savings: number;
  platform: string;
}

interface SavingsBreakdownChartProps {
  items: SavingsItem[];
}

export default function SavingsBreakdownChart({ items }: SavingsBreakdownChartProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalSavings = items.reduce((sum, item) => sum + item.savings, 0);
  const maxSavings = Math.max(...items.map(item => item.savings), 1);

  if (items.length === 0) return null;

  return (
    <div className="bg-card/40 border border-border/50 rounded-2xl p-4 backdrop-blur-md">
      <h3 className="text-sm font-bold text-foreground mb-4">Item-level Savings Breakdown</h3>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const widthPercent = (item.savings / maxSavings) * 100;
          return (
            <div key={idx} className="flex items-center space-x-3 text-sm">
              <div className="w-24 shrink-0 truncate text-muted-foreground" title={item.title}>
                {item.title}
              </div>
              <div className="flex-1 h-6 bg-secondary/50 rounded-md overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: mounted ? `${widthPercent}%` : '0%' }}
                />
              </div>
              <div className="w-16 text-right font-bold text-emerald-400">
                ₹{item.savings.toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-sm font-bold">
        <span>Total Savings</span>
        <span className="text-emerald-400">₹{totalSavings.toFixed(0)}</span>
      </div>
    </div>
  );
}
