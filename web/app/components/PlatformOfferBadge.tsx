import React from 'react';

interface PlatformOfferBadgeProps {
  code: string;
  paymentMethod: string;
  discountLabel: string;
  platform: string;
}

const platformColors: Record<string, string> = {
  zepto: 'bg-purple-500',
  blinkit: 'bg-yellow-500',
  instamart: 'bg-orange-500',
  flipkart_minutes: 'bg-blue-500',
  amazon_now: 'bg-cyan-500'
};

export default function PlatformOfferBadge({ code, paymentMethod, discountLabel, platform }: PlatformOfferBadgeProps) {
  const dotColor = platformColors[platform] || 'bg-emerald-500';

  return (
    <div className="inline-flex items-center space-x-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="font-mono uppercase tracking-wider">{code}</span>
      <span className="opacity-60 text-[9px]">•</span>
      <span>{paymentMethod}</span>
      <span className="opacity-60 text-[9px]">•</span>
      <span className="font-bold">{discountLabel}</span>
    </div>
  );
}
