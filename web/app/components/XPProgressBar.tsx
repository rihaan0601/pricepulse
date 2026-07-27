'use client';

import React, { useEffect, useState } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';

export default function XPProgressBar() {
  const { xp, level } = useGamificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLevelLabel = (lvl: number) => {
    if (lvl === 1) return 'Newbie';
    if (lvl === 2) return 'Saver';
    if (lvl === 3) return 'Smart Shopper';
    if (lvl === 4) return 'Deal Hunter';
    return 'Price Master';
  };

  const progress = (xp % 500) / 500;
  const xpCurrent = xp % 500;

  return (
    <div className="flex items-center w-full max-w-[220px] space-x-3 text-sm">
      <div className="flex flex-col items-center justify-center bg-primary/10 border border-primary/20 rounded-lg px-2 py-1 shrink-0">
        <span className="text-[10px] uppercase font-bold text-primary/80 leading-none">Lv.{level}</span>
        <span className="text-xs font-black text-primary leading-tight">{getLevelLabel(level)}</span>
      </div>
      <div className="flex-1 flex flex-col justify-center space-y-1">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-muted-foreground">XP</span>
          <span className="text-[10px] font-bold text-foreground">{xpCurrent} / 500</span>
        </div>
        <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: mounted ? `${progress * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}
