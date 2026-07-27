'use client';

import React from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { cn } from '@/lib/utils';

interface SavingsBadgeSystemProps {
  compact?: boolean;
}

export default function SavingsBadgeSystem({ compact = false }: SavingsBadgeSystemProps) {
  const { badges } = useGamificationStore();

  if (compact) {
    return (
      <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-hide">
        {badges.map(b => (
          <div
            key={b.id}
            title={`${b.name}: ${b.description}`}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm border transition-all cursor-help",
              b.unlockedAt 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-100 ring-1 ring-emerald-500/20"
                : "bg-card/50 border-border/40 opacity-40 grayscale"
            )}
          >
            {b.unlockedAt ? b.emoji : '🔒'}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {badges.map(b => (
        <div 
          key={b.id} 
          className={cn(
            "relative p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-300",
            b.unlockedAt 
              ? "bg-card/60 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:scale-105"
              : "bg-card/20 border-border/40 grayscale opacity-60"
          )}
        >
          <div className="text-4xl mb-2 relative">
            {b.emoji}
            {!b.unlockedAt && (
              <div className="absolute -bottom-1 -right-1 text-sm bg-background rounded-full p-0.5">
                🔒
              </div>
            )}
          </div>
          <h4 className={cn("font-bold text-sm mb-1", b.unlockedAt ? "text-emerald-400" : "text-foreground")}>
            {b.name}
          </h4>
          <p className="text-xs text-muted-foreground">{b.description}</p>
          {b.unlockedAt && (
            <p className="text-[10px] text-emerald-500/60 mt-2 font-medium">
              {new Date(b.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
