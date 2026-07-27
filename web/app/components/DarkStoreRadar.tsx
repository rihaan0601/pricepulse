'use client';

import { Zap, Radio, MapPin } from 'lucide-react';

interface DarkStoreRadarProps {
  pincode: string;
}

export default function DarkStoreRadar({ pincode }: DarkStoreRadarProps) {
  const stores = [
    { name: 'Blinkit Express', distance: '1.1 km', eta: '8 mins', status: 'Optimal', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { name: 'Zepto Hub', distance: '1.4 km', eta: '10 mins', status: 'Optimal', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    { name: 'Instamart DarkStore', distance: '2.1 km', eta: '14 mins', status: 'Busy', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    { name: 'Flipkart Minutes Hub', distance: '1.6 km', eta: '11 mins', status: 'Optimal', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  ];

  return (
    <div className="w-full bg-card/40 border border-border/50 rounded-2xl p-4 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-foreground">Hyperlocal Dark-Store Coverage Radar</span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full border border-border/40">
          <MapPin className="w-3 h-3 text-primary" />
          <span>Pincode {pincode || '110001'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
        {stores.map((s) => (
          <div key={s.name} className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${s.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold truncate">{s.name}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/40">{s.status}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium opacity-90">
              <span>{s.distance}</span>
              <span className="flex items-center font-bold"><Zap className="w-3 h-3 mr-0.5" />{s.eta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
