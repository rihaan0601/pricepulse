import { generateFullCatalog } from './catalog_generator';

export interface PlatformDetails {
  platformId: string;
  price: number;
  mrp: number;
  inStock: boolean;
  url?: string;
  deliveryTime?: string;
}

export interface Product {
  id: string;
  ean: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  weight: string;
  platforms: PlatformDetails[];
}

export const EXPANDED_PRODUCT_CATALOG: Product[] = generateFullCatalog();

export function getCategories(): string[] {
  const categories = new Set<string>();
  EXPANDED_PRODUCT_CATALOG.forEach(p => categories.add(p.category));
  return Array.from(categories);
}

export function searchCatalog(query: string, category: string, inStockOnly: boolean): Product[] {
  let results = EXPANDED_PRODUCT_CATALOG;

  if (category && category !== 'All') {
    results = results.filter(p => p.category === category);
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.brand.toLowerCase().includes(lowerQuery) ||
      p.subCategory.toLowerCase().includes(lowerQuery)
    );
  }

  if (inStockOnly) {
    results = results.filter(p => p.platforms.some(pl => pl.inStock));
  }

  return results;
}
