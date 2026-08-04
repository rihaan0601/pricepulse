// Unique, distinct realistic product images for every single product & pack variant

const DAIRY_IMAGES = [
  "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", // Milk bottle
  "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", // Milk glass bottle
  "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80", // Cheese
  "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80", // Dahi/Yogurt
  "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80", // Butter
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80", // Paneer
  "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=400&q=80", // Eggs
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80", // Bread
  "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80", // Milk carton
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80", // Butter slice
];

const STAPLES_IMAGES = [
  "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80", // Atta/Wheat
  "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80", // Oil
  "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", // Basmati Rice
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80", // Pulses/Dal
  "https://images.unsplash.com/photo-1626197031507-c170a04564a1?auto=format&fit=crop&w=400&q=80", // Salt
  "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80", // Turmeric Spices
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80", // Masala
  "https://images.unsplash.com/photo-1620706857397-e170df26e0c5?auto=format&fit=crop&w=400&q=80", // Cooking Oil bottle
  "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80", // Rice bag
  "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80", // Grain bowl
];

const BEVERAGES_IMAGES = [
  "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80", // Tea pack
  "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80", // Nescafe Coffee jar
  "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80", // Cold Drink
  "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80", // Fruit Juice
  "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80", // Soda bottle
  "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80", // Soft Drink
  "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=400&q=80", // Energy Drink
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80", // Coffee cup
];

const SNACKS_IMAGES = [
  "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80", // Maggi Noodles
  "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80", // Lays Chips
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80", // Cookies
  "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80", // Chocolate
  "https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=400&q=80", // Namkeen/Snack
  "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80", // Pringles
  "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80", // Nachos
  "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80", // Chocolate box
];

const PERSONAL_CARE_IMAGES = [
  "https://images.unsplash.com/photo-1607006482602-76ca97ac4759?auto=format&fit=crop&w=400&q=80", // Dettol Soap
  "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80", // Shampoo
  "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=400&q=80", // Toothpaste
  "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80", // Handwash
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80", // Cream
  "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=400&q=80", // Grooming
];

const TECH_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80", // Earbuds
  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80", // TWS
  "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=400&q=80", // Wireless earbuds
  "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80", // Charger
  "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80", // Cable
  "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80", // Smartwatch
];

// Hash function to pick deterministic unique image index per title/variant
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getRealisticProductImage(title: string, brand: string = '', category: string = ''): string {
  const fullText = `${title} ${brand} ${category}`.toLowerCase();
  const hash = hashString(title);

  // Exact product checks first
  if (fullText.includes('butter') && !fullText.includes('peanut')) {
    return '/products/amul_butter.jpg';
  }
  if (fullText.includes('aashirvaad') || (fullText.includes('atta') && fullText.includes('5kg'))) {
    return '/products/aashirvaad_atta.jpg';
  }
  if (fullText.includes('fortune') && fullText.includes('oil')) {
    return '/products/fortune_oil.jpg';
  }
  if (fullText.includes('tata tea')) {
    return '/products/tata_tea_gold.jpg';
  }
  if (fullText.includes('nescafe')) {
    return '/products/nescafe_classic.jpg';
  }
  if (fullText.includes('maggi')) {
    return '/products/maggi_noodles.jpg';
  }
  if (fullText.includes('dettol')) {
    return '/products/dettol_soap.jpg';
  }
  if (fullText.includes('mother dairy') && fullText.includes('milk')) {
    return '/products/mother_dairy_milk.jpg';
  }

  // Category & variant specific hash picking for unique images
  if (fullText.includes('milk') || fullText.includes('dairy') || fullText.includes('curd') || fullText.includes('dahi') || fullText.includes('paneer') || fullText.includes('cheese')) {
    return DAIRY_IMAGES[hash % DAIRY_IMAGES.length];
  }
  if (fullText.includes('atta') || fullText.includes('rice') || fullText.includes('dal') || fullText.includes('oil') || fullText.includes('flour') || fullText.includes('staple')) {
    return STAPLES_IMAGES[hash % STAPLES_IMAGES.length];
  }
  if (fullText.includes('tea') || fullText.includes('coffee') || fullText.includes('drink') || fullText.includes('juice') || fullText.includes('beverage')) {
    return BEVERAGES_IMAGES[hash % BEVERAGES_IMAGES.length];
  }
  if (fullText.includes('snack') || fullText.includes('chips') || fullText.includes('noodle') || fullText.includes('chocolate') || fullText.includes('biscuit')) {
    return SNACKS_IMAGES[hash % SNACKS_IMAGES.length];
  }
  if (fullText.includes('soap') || fullText.includes('shampoo') || fullText.includes('wash') || fullText.includes('care') || fullText.includes('hygiene')) {
    return PERSONAL_CARE_IMAGES[hash % PERSONAL_CARE_IMAGES.length];
  }
  if (fullText.includes('earbud') || fullText.includes('headphone') || fullText.includes('boat') || fullText.includes('tech') || fullText.includes('electronic')) {
    return TECH_IMAGES[hash % TECH_IMAGES.length];
  }

  // Fallback deterministic pool across all pools
  const ALL_POOLS = [...DAIRY_IMAGES, ...STAPLES_IMAGES, ...BEVERAGES_IMAGES, ...SNACKS_IMAGES, ...PERSONAL_CARE_IMAGES, ...TECH_IMAGES];
  return ALL_POOLS[hash % ALL_POOLS.length];
}
