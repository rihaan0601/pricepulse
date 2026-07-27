import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Parse natural language queries into structured search parameters
function parseNaturalLanguageQuery(query: string): {
  searchTerms: string[];
  category: string | null;
  maxPrice: number | null;
  brand: string | null;
  unit: string | null;
  intent: string;
} {
  const lower = query.toLowerCase();

  // Price extraction: "under ₹150", "below 200", "less than 100"
  const priceMatch = lower.match(/(?:under|below|less than|cheaper than|max)\s*[₹rs\s]*(\d+)/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;

  // Category inference
  const categoryMap: Record<string, string> = {
    'milk|dahi|curd|paneer|cheese|butter|ghee|cream': 'Grocery & Fresh',
    'atta|flour|rice|dal|lentil|pulse|oil|sugar|salt|masala|spice|namkeen': 'Grocery & Fresh',
    'chips|biscuit|chocolate|candy|snack|drink|juice|cola|water|coffee|tea': 'Snacks & Beverages',
    'shampoo|soap|face|skin|lotion|cream|hair|toothpaste|deodorant|sanitizer': 'Personal Care & Hygiene',
    'detergent|dish|cleaner|mop|broom|toilet|floor|wash': 'Household Essentials',
    'medicine|tablet|vitamin|supplement|health|painkiller|bandage': 'Pharmacy & Health',
    'phone|charger|earphone|cable|battery|electronic|laptop|tablet': 'Electronics & Tech',
    'dog|cat|pet|baby|diaper|formula': 'Pet Supplies & Baby Care',
  };

  let inferredCategory: string | null = null;
  for (const [keywords, cat] of Object.entries(categoryMap)) {
    if (new RegExp(keywords).test(lower)) {
      inferredCategory = cat;
      break;
    }
  }

  // Brand detection
  const brands = ['amul', 'nestle', 'tata', 'patanjali', 'britannia', 'dabur', 'lays', 'maggi',
    'nescafe', 'colgate', 'dove', 'lifebuoy', 'surf', 'ariel', 'himalaya', 'mamaearth'];
  const detectedBrand = brands.find(b => lower.includes(b)) || null;

  // Intent detection
  let intent = 'search';
  if (lower.includes('cheapest') || lower.includes('lowest') || lower.includes('best price')) {
    intent = 'find_cheapest';
  } else if (lower.includes('compare')) {
    intent = 'compare';
  } else if (lower.includes('organic') || lower.includes('natural')) {
    intent = 'find_organic';
  }

  // Clean search terms
  const stopWords = ['the', 'a', 'an', 'cheapest', 'best', 'price', 'for', 'under', 'below', 'above', 'buy', 'get', 'show', 'find', 'me'];
  const searchTerms = lower
    .replace(/[₹rs]/g, '')
    .replace(/\d+/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w));

  return { searchTerms, category: inferredCategory, maxPrice, brand: detectedBrand, unit: null, intent };
}

function generateAISummary(query: string, parsed: ReturnType<typeof parseNaturalLanguageQuery>): string {
  const parts: string[] = [];

  if (parsed.intent === 'find_cheapest') parts.push('Finding the best-priced options');
  else parts.push('Searching for');

  parts.push(`"${parsed.searchTerms.join(' ')}"`);

  if (parsed.category) parts.push(`in ${parsed.category}`);
  if (parsed.maxPrice) parts.push(`under ₹${parsed.maxPrice}`);
  if (parsed.brand) parts.push(`by ${parsed.brand.charAt(0).toUpperCase() + parsed.brand.slice(1)}`);

  parts.push('across all 5 platforms.');
  return parts.join(' ');
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json() as { query: string };

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const parsed = parseNaturalLanguageQuery(query);
    const aiSummary = generateAISummary(query, parsed);

    // Typo corrections (simple fuzzy matching)
    const corrections: Record<string, string> = {
      'mlik': 'milk', 'choclate': 'chocolate', 'shampo': 'shampoo', 'biscut': 'biscuit',
      'colgate': 'colgate', 'toothpast': 'toothpaste', 'aaata': 'atta', 'maggie': 'maggi',
    };
    const correctedTerms = parsed.searchTerms.map(t => corrections[t] || t);

    return NextResponse.json({
      originalQuery: query,
      parsedQuery: {
        searchTerms: correctedTerms,
        category: parsed.category,
        maxPrice: parsed.maxPrice,
        brand: parsed.brand,
        intent: parsed.intent,
      },
      aiSummary,
      searchQuery: correctedTerms.join(' '),
      suggestions: parsed.intent === 'find_cheapest' 
        ? ['Sort by: Price Low→High', 'Filter: In Stock Only']
        : [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'AI parse failed' }, { status: 500 });
  }
}
