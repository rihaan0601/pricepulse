// Exact product packaging image library

export function getRealisticProductImage(title: string, brand: string = '', category: string = ''): string {
  const text = `${title} ${brand} ${category}`.toLowerCase();

  // 1. Butter products -> Amul Butter box photo
  if (text.includes('butter') && !text.includes('peanut')) {
    return '/products/amul_butter.jpg';
  }

  // 2. Milk products -> Milk pouch photo
  if (text.includes('milk') || text.includes('taaza') || text.includes('cow milk') || text.includes('toned')) {
    return '/products/mother_dairy_milk.jpg';
  }

  // 3. Dahi / Curd -> Dahi container photo
  if (text.includes('dahi') || text.includes('curd') || text.includes('masti') || text.includes('yogurt')) {
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80';
  }

  // 4. Cheese -> Cheese slice photo
  if (text.includes('cheese')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80';
  }

  // 5. Atta / Wheat Flour -> Atta bag photo
  if (text.includes('atta') || text.includes('flour') || text.includes('wheat') || text.includes('aashirvaad')) {
    return '/products/aashirvaad_atta.jpg';
  }

  // 6. Cooking Oil -> Oil pouch photo
  if (text.includes('oil') || text.includes('sunflower') || text.includes('mustard') || text.includes('fortune')) {
    return '/products/fortune_oil.jpg';
  }

  // 7. Tea -> Tea pack photo
  if (text.includes('tea') || text.includes('chai') || text.includes('tata tea')) {
    return '/products/tata_tea_gold.jpg';
  }

  // 8. Coffee -> Coffee jar photo
  if (text.includes('coffee') || text.includes('nescafe')) {
    return '/products/nescafe_classic.jpg';
  }

  // 9. Noodles -> Noodles pack photo
  if (text.includes('noodle') || text.includes('maggi') || text.includes('pasta')) {
    return '/products/maggi_noodles.jpg';
  }

  // 10. Soap -> Soap pack photo
  if (text.includes('soap') || text.includes('dettol')) {
    return '/products/dettol_soap.jpg';
  }

  // Fallback category checks
  if (category.toLowerCase().includes('dairy')) return '/products/mother_dairy_milk.jpg';
  if (category.toLowerCase().includes('staple')) return '/products/aashirvaad_atta.jpg';
  if (category.toLowerCase().includes('snack')) return '/products/maggi_noodles.jpg';
  if (category.toLowerCase().includes('beverage')) return '/products/tata_tea_gold.jpg';

  return '/products/mother_dairy_milk.jpg';
}
