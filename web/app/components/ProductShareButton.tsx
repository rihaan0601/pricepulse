'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import { useToast } from './ToastNotification';

interface Product {
  title: string;
  platforms: Array<{
    platform: string;
    price: number;
    inStock: boolean;
  }>;
}

export const ProductShareButton = ({ product }: { product: Product }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    // Find min price and its platform
    const availablePlatforms = product.platforms.filter((p) => p.inStock);
    if (availablePlatforms.length === 0) return;

    const minPricePlatform = availablePlatforms.reduce((prev, curr) => 
      prev.price < curr.price ? prev : curr
    );

    const shareText = `🔥 Found ${product.title} for ₹${minPricePlatform.price} on ${minPricePlatform.platform} via PricePulse! Compare prices: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `PricePulse: ${product.title}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Link Copied! 📋');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
      aria-label="Share product"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
};

export default ProductShareButton;
