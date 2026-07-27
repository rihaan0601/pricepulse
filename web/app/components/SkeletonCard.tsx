import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-xl">
      <div className="w-full h-44 rounded-xl bg-secondary/30 animate-shimmer mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-3/4 rounded bg-secondary/40 animate-shimmer"></div>
        <div className="h-4 w-1/2 rounded bg-secondary/40 animate-shimmer"></div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-6 rounded-full bg-secondary/40 animate-shimmer"></div>
        <div className="h-6 rounded-full bg-secondary/40 animate-shimmer"></div>
        <div className="h-6 rounded-full bg-secondary/40 animate-shimmer"></div>
        <div className="h-6 rounded-full bg-secondary/40 animate-shimmer"></div>
      </div>
      <div className="rounded-xl h-10 w-full bg-secondary/40 animate-shimmer"></div>
    </div>
  );
};

export const SkeletonGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
