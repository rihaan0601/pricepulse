import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory push subscription store (in production, use Supabase/DB)
const subscriptions = new Map<string, PushSubscriptionJSON>();

// VAPID public key (demo key — in production generate real VAPID pair)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBLk4H8M8YsYkdXwKgWs';

export async function GET() {
  return NextResponse.json({ vapidPublicKey: VAPID_PUBLIC_KEY });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subscription, userId } = body as {
      subscription: PushSubscriptionJSON;
      userId?: string;
    };

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const key = userId || subscription.endpoint.slice(-20);
    subscriptions.set(key, subscription);

    return NextResponse.json({ success: true, message: 'Push subscription registered' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register subscription' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();
    if (userId) {
      subscriptions.delete(userId);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
