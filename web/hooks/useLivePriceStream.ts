'use client';

import { useEffect, useRef, useCallback } from 'react';
import { CartProduct } from '@/store/useCartStore';

type PriceUpdate = Record<string, Record<string, { price: number; delta: 'up' | 'down' | 'same' }>>;

interface LivePriceEvent {
  type: 'connected' | 'price_update';
  timestamp: number;
  updates?: PriceUpdate;
}

interface UseLivePriceStreamOptions {
  productIds: string[];
  onPriceUpdate: (updates: PriceUpdate) => void;
  enabled?: boolean;
}

export function useLivePriceStream({
  productIds,
  onPriceUpdate,
  enabled = true,
}: UseLivePriceStreamOptions) {
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<number>(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPriceUpdateRef = useRef(onPriceUpdate);
  onPriceUpdateRef.current = onPriceUpdate;

  const connect = useCallback(() => {
    if (!enabled || productIds.length === 0) return;

    const ids = productIds.join(',');
    const es = new EventSource(`/api/price-stream?ids=${encodeURIComponent(ids)}`);
    esRef.current = es;

    es.onopen = () => {
      retryRef.current = 0; // Reset backoff on successful connection
    };

    es.onmessage = (event) => {
      try {
        const data: LivePriceEvent = JSON.parse(event.data);
        if (data.type === 'price_update' && data.updates) {
          onPriceUpdateRef.current(data.updates);
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;

      // Exponential backoff reconnect: 2s, 4s, 8s, 16s, 30s max
      const delay = Math.min(2000 * Math.pow(2, retryRef.current), 30000);
      retryRef.current += 1;

      retryTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [enabled, productIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled || productIds.length === 0) return;

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [connect, enabled]);
}
