import { NextResponse } from 'next/server';
import { searchCatalog, getCategories } from '@/lib/catalog_data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'All';
    const inStockOnlyStr = searchParams.get('inStockOnly');
    const inStockOnly = inStockOnlyStr === 'true';
    
    const rawResults = searchCatalog(query, category, inStockOnly);
    const categories = getCategories();

    // Transform catalog schema -> frontend CartProduct schema
    const results = rawResults.map(product => ({
      id: product.id,
      ean: product.ean,
      title: product.name,
      brand: product.brand,
      unit: product.weight,
      category: product.category,
      imageUrl: product.imageUrl,
      platforms: product.platforms.map(p => ({
        platform: p.platformId,
        price: p.price,
        mrp: p.mrp,
        inStock: p.inStock,
        deliveryTime: p.deliveryTime || undefined,
      }))
    }));

    return NextResponse.json({
      results,
      categories,
      total: results.length
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
