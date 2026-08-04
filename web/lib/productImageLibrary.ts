export function getRealisticProductImage(title: string, brand: string = '', category: string = ''): string {
  const query = `${title} ${brand} ${category}`.toLowerCase();

  // 1. Butter products
  if (query.includes('butter') && !query.includes('peanut')) {
    return '/products/amul_butter.jpg';
  }

  // 2. Milk products (Amul Taaza Milk, Mother Dairy Milk, Cow Milk, Toned Milk)
  if (query.includes('milk') || query.includes('taaza') || query.includes('toned')) {
    return '/products/mother_dairy_milk.jpg';
  }

  // 3. Dahi / Curd products (Amul Masti Dahi, Yogurt)
  if (query.includes('dahi') || query.includes('curd') || query.includes('yogurt') || query.includes('masti')) {
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80';
  }

  // 4. Cheese products (Amul Cheese, Cheese Slices)
  if (query.includes('cheese')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80';
  }

  // 5. Paneer / Cottage Cheese
  if (query.includes('paneer')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80';
  }

  // 6. Ghee
  if (query.includes('ghee')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80';
  }

  // 7. Atta / Wheat Flour
  if (query.includes('atta') || query.includes('flour') || query.includes('wheat') || query.includes('aashirvaad')) {
    return '/products/aashirvaad_atta.jpg';
  }

  // 8. Edible Oils (Sunflower, Mustard, Oil)
  if (query.includes('oil') || query.includes('sunflower') || query.includes('sunlite') || query.includes('mustard') || query.includes('fortune')) {
    return '/products/fortune_oil.jpg';
  }

  // 9. Tea
  if (query.includes('tea') || query.includes('tata tea') || query.includes('red label') || query.includes('chai')) {
    return '/products/tata_tea_gold.jpg';
  }

  // 10. Coffee
  if (query.includes('coffee') || query.includes('nescafe') || query.includes('bru')) {
    return '/products/nescafe_classic.jpg';
  }

  // 11. Noodles / Maggi / Instant Food
  if (query.includes('noodle') || query.includes('noodles') || query.includes('maggi') || query.includes('pasta')) {
    return '/products/maggi_noodles.jpg';
  }

  // 12. Bathing Soap / Body Wash
  if (query.includes('soap') || query.includes('dettol') || query.includes('lux') || query.includes('dove soap')) {
    return '/products/dettol_soap.jpg';
  }

  // 13. Chocolates (Cadbury, Silk, Kitkat)
  if (query.includes('chocolate') || query.includes('silk') || query.includes('cadbury') || query.includes('kitkat')) {
    return 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80';
  }

  // 14. Rice / Basmati
  if (query.includes('rice') || query.includes('basmati') || query.includes('india gate')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80';
  }

  // 15. Pulses / Dal
  if (query.includes('dal') || query.includes('toor') || query.includes('chana') || query.includes('pulses')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
  }

  // 16. Earbuds / Headphones / Tech
  if (query.includes('earbud') || query.includes('earbuds') || query.includes('airdopes') || query.includes('boat') || query.includes('headphone')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';
  }

  // 17. Cold Drinks / Soda
  if (query.includes('coke') || query.includes('coca') || query.includes('sprite') || query.includes('drink') || query.includes('juice')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80';
  }

  // 18. Chips / Namkeen
  if (query.includes('chips') || query.includes('lays') || query.includes('kurkure') || query.includes('bhujia') || query.includes('namkeen')) {
    return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80';
  }

  // Default fallbacks by category
  if (category.toLowerCase().includes('dairy') || category.toLowerCase().includes('breakfast')) {
    return '/products/mother_dairy_milk.jpg';
  }
  if (category.toLowerCase().includes('staple') || category.toLowerCase().includes('atta')) {
    return '/products/aashirvaad_atta.jpg';
  }
  if (category.toLowerCase().includes('snack') || category.toLowerCase().includes('munchies')) {
    return '/products/maggi_noodles.jpg';
  }
  if (category.toLowerCase().includes('beverage') || category.toLowerCase().includes('drink')) {
    return '/products/tata_tea_gold.jpg';
  }
  if (category.toLowerCase().includes('personal') || category.toLowerCase().includes('care')) {
    return '/products/dettol_soap.jpg';
  }

  return '/products/mother_dairy_milk.jpg';
}
