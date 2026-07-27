import { NextResponse } from 'next/server';
import { QuickCommerceEngine } from '@/lib/engine/aggregator';

const engine = new QuickCommerceEngine();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query = '', latitude, longitude, pincode = '110001', address_text } = body;

    const canonicalData = await engine.searchAndNormalize(query, {
      latitude,
      longitude,
      pincode,
      address_text,
    });

    return NextResponse.json(canonicalData);
  } catch (error: any) {
    console.error('Canonical Search API Error:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate quick commerce pricing', message: error.message },
      { status: 500 }
    );
  }
}
