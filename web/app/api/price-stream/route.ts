import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PLATFORM_NAMES = ['zepto', 'blinkit', 'instamart', 'flipkart_minutes', 'amazon_now'];

// Simulate real-time price deltas for products in the stream
function generatePriceUpdate(productIds: string[]) {
  const updates: Record<string, Record<string, { price: number; delta: 'up' | 'down' | 'same' }>> = {};
  
  for (const id of productIds.slice(0, 10)) { // Max 10 products streamed
    updates[id] = {};
    for (const platform of PLATFORM_NAMES) {
      // ~20% chance of price change per update cycle
      const rand = Math.random();
      if (rand < 0.10) {
        // Price drop 1-8%
        const dropPct = Math.random() * 0.08 + 0.01;
        updates[id][platform] = { price: -(dropPct), delta: 'down' };
      } else if (rand < 0.17) {
        // Price increase 1-5%
        const risePct = Math.random() * 0.05 + 0.01;
        updates[id][platform] = { price: risePct, delta: 'up' };
      } else {
        updates[id][platform] = { price: 0, delta: 'same' };
      }
    }
  }
  return updates;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productIds = searchParams.get('ids')?.split(',') || [];

  const stream = new ReadableStream({
    start(controller) {
      let isOpen = true;

      const sendUpdate = () => {
        if (!isOpen) return;
        try {
          const updates = generatePriceUpdate(productIds);
          const payload = JSON.stringify({
            type: 'price_update',
            timestamp: Date.now(),
            updates,
          });
          controller.enqueue(`data: ${payload}\n\n`);
        } catch {
          isOpen = false;
          controller.close();
        }
      };

      // Send initial ping
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

      // Send updates every 30 seconds
      const interval = setInterval(sendUpdate, 30000);

      // Send first update after 5 seconds
      const initialTimeout = setTimeout(sendUpdate, 5000);

      // Cleanup when client disconnects
      request.signal.addEventListener('abort', () => {
        isOpen = false;
        clearInterval(interval);
        clearTimeout(initialTimeout);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
