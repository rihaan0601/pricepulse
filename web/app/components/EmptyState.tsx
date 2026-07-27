'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  type: 'no_results' | 'error' | 'no_location';
  query?: string;
  onRetry?: () => void;
  onSearch?: (q: string) => void;
}

export const EmptyState = ({ type, query, onRetry, onSearch }: EmptyStateProps) => {
  const router = useRouter();

  if (type === 'no_results') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 animate-in fade-in duration-500 text-center">
        <div className="text-6xl animate-bounce">🔍</div>
        <h3 className="text-2xl font-bold text-foreground">No results for "{query}"</h3>
        <p className="text-muted-foreground">Try a different search or browse categories</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['Milk', 'Atta', 'Chips', 'Shampoo', 'Eggs'].map((item) => (
            <button
              key={item}
              onClick={() => onSearch?.(item)}
              className="px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-sm transition-colors border border-border/50"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 animate-in fade-in duration-500 text-center">
        <div className="text-6xl animate-[shake_0.5s_ease-in-out_infinite]">😵</div>
        <h3 className="text-2xl font-bold text-foreground">Something went wrong</h3>
        <p className="text-muted-foreground">Failed to load products</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (type === 'no_location') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 animate-in fade-in duration-500 text-center">
        <div className="text-6xl animate-pulse">📍</div>
        <h3 className="text-2xl font-bold text-foreground">Set your location first</h3>
        <p className="text-muted-foreground">We need your pincode or GPS to show accurate prices</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          Set Location
        </button>
      </div>
    );
  }

  return null;
};

export default EmptyState;
