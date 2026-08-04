export interface ProductImageDef {
  keywords: string[];
  brand: string;
  category: string;
  url: string;
}

export const REALISTIC_PRODUCT_IMAGE_LIBRARY: ProductImageDef[] = [
  // DAIRY & BREAKFAST
  {
    keywords: ['amul', 'butter', 'salted'],
    brand: 'Amul',
    category: 'Dairy & Breakfast',
    url: '/products/amul_butter.jpg'
  },
  {
    keywords: ['mother dairy', 'milk', 'toned'],
    brand: 'Mother Dairy',
    category: 'Dairy & Breakfast',
    url: '/products/mother_dairy_milk.jpg'
  },
  {
    keywords: ['cheese', 'amul cheese', 'slice'],
    brand: 'Amul',
    category: 'Dairy & Breakfast',
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['curd', 'dahi', 'yogurt'],
    brand: 'Amul',
    category: 'Dairy & Breakfast',
    url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['paneer', 'cottage cheese'],
    brand: 'Amul',
    category: 'Dairy & Breakfast',
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['eggs', 'egg tray'],
    brand: 'Farm Fresh',
    category: 'Dairy & Breakfast',
    url: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['bread', 'sandwich bread', 'white bread'],
    brand: 'Britannia',
    category: 'Dairy & Breakfast',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['oats', 'kelloggs', 'corn flakes'],
    brand: 'Quaker',
    category: 'Dairy & Breakfast',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
  },

  // STAPLES & ATTA & OILS
  {
    keywords: ['aashirvaad', 'atta', 'wheat', 'flour'],
    brand: 'Aashirvaad',
    category: 'Staples & Atta',
    url: '/products/aashirvaad_atta.jpg'
  },
  {
    keywords: ['fortune', 'sunflower', 'oil', 'sunlite'],
    brand: 'Fortune',
    category: 'Staples & Atta',
    url: '/products/fortune_oil.jpg'
  },
  {
    keywords: ['basmati', 'rice', 'india gate'],
    brand: 'India Gate',
    category: 'Staples & Atta',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['dal', 'toor', 'chana', 'pulses', 'tata sampann'],
    brand: 'Tata Sampann',
    category: 'Staples & Atta',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['salt', 'tata salt'],
    brand: 'Tata',
    category: 'Staples & Atta',
    url: 'https://images.unsplash.com/photo-1626197031507-c170a04564a1?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['turmeric', 'masala', 'everest', 'catch'],
    brand: 'Everest',
    category: 'Staples & Atta',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80'
  },

  // BEVERAGES & TEA / COFFEE
  {
    keywords: ['tata tea', 'gold', 'black tea', 'tea'],
    brand: 'Tata Consumer',
    category: 'Beverages & Drinks',
    url: '/products/tata_tea_gold.jpg'
  },
  {
    keywords: ['nescafe', 'coffee', 'classic', 'instant'],
    brand: 'Nestle',
    category: 'Beverages & Drinks',
    url: '/products/nescafe_classic.jpg'
  },
  {
    keywords: ['coca-cola', 'coke', 'thums up', 'cold drink', 'soda'],
    brand: 'Coca-Cola',
    category: 'Beverages & Drinks',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['real', 'juice', 'tropicana', 'mango'],
    brand: 'Dabur Real',
    category: 'Beverages & Drinks',
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80'
  },

  // SNACKS & MUNCHIES
  {
    keywords: ['maggi', 'noodles', 'masala', 'instant noodles'],
    brand: 'Nestle',
    category: 'Snacks & Munchies',
    url: '/products/maggi_noodles.jpg'
  },
  {
    keywords: ['lays', 'chips', 'potato chips', 'kurkure'],
    brand: 'Lays',
    category: 'Snacks & Munchies',
    url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['biscuits', 'parle-g', 'oreo', 'cookies'],
    brand: 'Britannia',
    category: 'Snacks & Munchies',
    url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['cadbury', 'chocolate', 'silk', 'dairy milk'],
    brand: 'Cadbury',
    category: 'Snacks & Munchies',
    url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80'
  },

  // PERSONAL CARE & HYGIENE
  {
    keywords: ['dettol', 'soap', 'bathing soap'],
    brand: 'Dettol',
    category: 'Personal Care & Hygiene',
    url: '/products/dettol_soap.jpg'
  },
  {
    keywords: ['shampoo', 'dove', 'pantene', 'head & shoulders'],
    brand: 'Dove',
    category: 'Personal Care & Hygiene',
    url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['toothpaste', 'colgate', 'sensodyne', 'pepsodent'],
    brand: 'Colgate',
    category: 'Personal Care & Hygiene',
    url: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['handwash', 'lifebuoy', 'dettol handwash'],
    brand: 'Dettol',
    category: 'Personal Care & Hygiene',
    url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80'
  },

  // HOUSEHOLD & CLEANING
  {
    keywords: ['detergent', 'surf excel', 'ariel', 'tide'],
    brand: 'Surf Excel',
    category: 'Household & Cleaning',
    url: 'https://images.unsplash.com/photo-1585830810168-7050cf584d4a?auto=format&fit=crop&w=400&q=80'
  },
  {
    keywords: ['dishwash', 'vim', 'pril'],
    brand: 'Vim',
    category: 'Household & Cleaning',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
  },

  // ELECTRONICS & TECH
  {
    keywords: ['boat', 'airdopes', 'earbuds', 'headphones'],
    brand: 'boAt',
    category: 'Electronics & Tech',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'
  }
];

export function getRealisticProductImage(title: string, brand: string = '', category: string = ''): string {
  const query = `${title} ${brand} ${category}`.toLowerCase();

  for (const item of REALISTIC_PRODUCT_IMAGE_LIBRARY) {
    if (item.keywords.some((k) => query.includes(k))) {
      return item.url;
    }
  }

  // Fallback realistic product photos by category
  if (query.includes('dairy') || query.includes('milk') || query.includes('curd')) {
    return '/products/mother_dairy_milk.jpg';
  }
  if (query.includes('atta') || query.includes('flour') || query.includes('rice') || query.includes('staple')) {
    return '/products/aashirvaad_atta.jpg';
  }
  if (query.includes('oil') || query.includes('ghee')) {
    return '/products/fortune_oil.jpg';
  }
  if (query.includes('tea') || query.includes('coffee')) {
    return '/products/tata_tea_gold.jpg';
  }
  if (query.includes('snack') || query.includes('noodle') || query.includes('biscuits')) {
    return '/products/maggi_noodles.jpg';
  }
  if (query.includes('soap') || query.includes('wash') || query.includes('shampoo')) {
    return '/products/dettol_soap.jpg';
  }

  return '/products/amul_butter.jpg';
}
