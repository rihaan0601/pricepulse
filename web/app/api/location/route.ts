import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lat, lng, pincode } = await req.json();

    return NextResponse.json({
      pincode: pincode || '110001',
      city: 'New Delhi',
      state: 'Delhi',
      serviceable: true,
      platforms: ['zepto', 'blinkit', 'instamart', 'amazon_now']
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to resolve location' }, { status: 500 });
  }
}
