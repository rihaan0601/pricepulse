import { Product, PlatformDetails } from './catalog_data';
import { getRealisticProductImage } from './productImageLibrary';

const PLATFORMS = ['zepto', 'blinkit', 'instamart', 'flipkart_minutes', 'amazon_now'];

interface SeedTemplate {
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  weight: string;
  basePrice: number;
  mrp: number;
  imageUrl: string;
  ean?: string;
}

const SEED_TEMPLATES: SeedTemplate[] = [
  // --- Grocery & Fresh (Staples, Dairy, Pulses, Oils, Spices) ---
  { name: "Amul Taaza Milk", brand: "Amul", category: "Grocery & Fresh", subCategory: "Dairy", weight: "1 L", basePrice: 70, mrp: 70, imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80" },
  { name: "Amul Masti Dahi", brand: "Amul", category: "Grocery & Fresh", subCategory: "Dairy", weight: "400 g", basePrice: 35, mrp: 35, imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80" },
  { name: "Amul Butter Salted", brand: "Amul", category: "Grocery & Fresh", subCategory: "Dairy", weight: "100 g", basePrice: 58, mrp: 60, imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80" },
  { name: "Amul Cheese Slices", brand: "Amul", category: "Grocery & Fresh", subCategory: "Dairy", weight: "200 g", basePrice: 140, mrp: 150, imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&auto=format&fit=crop&q=80" },
  { name: "Mother Dairy Cow Milk", brand: "Mother Dairy", category: "Grocery & Fresh", subCategory: "Dairy", weight: "500 ml", basePrice: 28, mrp: 28, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80" },
  { name: "Aashirvaad Shudh Chakki Atta", brand: "Aashirvaad", category: "Grocery & Fresh", subCategory: "Staples", weight: "5 kg", basePrice: 235, mrp: 275, imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80" },
  { name: "Fortune Chakki Fresh Atta", brand: "Fortune", category: "Grocery & Fresh", subCategory: "Staples", weight: "10 kg", basePrice: 420, mrp: 490, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80" },
  { name: "India Gate Basmati Rice Super", brand: "India Gate", category: "Grocery & Fresh", subCategory: "Staples", weight: "1 kg", basePrice: 155, mrp: 180, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80" },
  { name: "Daawat Rozana Gold Basmati Rice", brand: "Daawat", category: "Grocery & Fresh", subCategory: "Staples", weight: "5 kg", basePrice: 380, mrp: 450, imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&auto=format&fit=crop&q=80" },
  { name: "Tata Sampann Toor Dal", brand: "Tata Sampann", category: "Grocery & Fresh", subCategory: "Pulses", weight: "1 kg", basePrice: 165, mrp: 185, imageUrl: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&auto=format&fit=crop&q=80" },
  { name: "Tata Sampann Moong Dal", brand: "Tata Sampann", category: "Grocery & Fresh", subCategory: "Pulses", weight: "500 g", basePrice: 85, mrp: 95, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80" },
  { name: "Fortune Sunlite Sunflower Oil", brand: "Fortune", category: "Grocery & Fresh", subCategory: "Edible Oils", weight: "1 L", basePrice: 135, mrp: 155, imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80" },
  { name: "Saffola Gold Edible Oil", brand: "Saffola", category: "Grocery & Fresh", subCategory: "Edible Oils", weight: "1 L", basePrice: 165, mrp: 190, imageUrl: "https://images.unsplash.com/photo-1620706857397-e170df26e0c5?w=400&auto=format&fit=crop&q=80" },
  { name: "Dhara Mustard Oil", brand: "Dhara", category: "Grocery & Fresh", subCategory: "Edible Oils", weight: "1 L", basePrice: 145, mrp: 165, imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80" },
  { name: "Amul Pure Ghee", brand: "Amul", category: "Grocery & Fresh", subCategory: "Ghee", weight: "500 ml", basePrice: 310, mrp: 315, imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80" },
  { name: "Patanjali Cow Ghee", brand: "Patanjali", category: "Grocery & Fresh", subCategory: "Ghee", weight: "1 L", basePrice: 590, mrp: 620, imageUrl: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&auto=format&fit=crop&q=80" },
  { name: "Tata Salt Iodised", brand: "Tata", category: "Grocery & Fresh", subCategory: "Spices & Salt", weight: "1 kg", basePrice: 28, mrp: 28, imageUrl: "https://images.unsplash.com/photo-1518110168401-f284358f00d3?w=400&auto=format&fit=crop&q=80" },
  { name: "Madhur Pure Sugar", brand: "Madhur", category: "Grocery & Fresh", subCategory: "Sugar & Jaggery", weight: "1 kg", basePrice: 55, mrp: 65, imageUrl: "https://images.unsplash.com/photo-1622484210800-a4306c507c72?w=400&auto=format&fit=crop&q=80" },
  { name: "Everest Turmeric Powder", brand: "Everest", category: "Grocery & Fresh", subCategory: "Spices", weight: "100 g", basePrice: 38, mrp: 42, imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80" },
  { name: "MDH Garam Masala", brand: "MDH", category: "Grocery & Fresh", subCategory: "Spices", weight: "100 g", basePrice: 88, mrp: 95, imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80" },

  // --- Snacks & Beverages ---
  { name: "Coca-Cola Soft Drink", brand: "Coca-Cola", category: "Snacks & Beverages", subCategory: "Cold Drinks", weight: "750 ml", basePrice: 40, mrp: 40, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80" },
  { name: "Thums Up Cold Drink", brand: "Thums Up", category: "Snacks & Beverages", subCategory: "Cold Drinks", weight: "1.25 L", basePrice: 65, mrp: 65, imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80" },
  { name: "Sprite Lemon Drink", brand: "Sprite", category: "Snacks & Beverages", subCategory: "Cold Drinks", weight: "750 ml", basePrice: 40, mrp: 40, imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&auto=format&fit=crop&q=80" },
  { name: "Tropicana 100% Orange Juice", brand: "Tropicana", category: "Snacks & Beverages", subCategory: "Juices", weight: "1 L", basePrice: 110, mrp: 125, imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80" },
  { name: "Real Fruit Power Mixed Fruit Juice", brand: "Real", category: "Snacks & Beverages", subCategory: "Juices", weight: "1 L", basePrice: 105, mrp: 120, imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop&q=80" },
  { name: "Red Bull Energy Drink", brand: "Red Bull", category: "Snacks & Beverages", subCategory: "Energy Drinks", weight: "250 ml", basePrice: 125, mrp: 125, imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&auto=format&fit=crop&q=80" },
  { name: "Monster Energy Drink", brand: "Monster", category: "Snacks & Beverages", subCategory: "Energy Drinks", weight: "350 ml", basePrice: 120, mrp: 125, imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&auto=format&fit=crop&q=80" },
  { name: "Lay's India's Magic Masala Chips", brand: "Lay's", category: "Snacks & Beverages", subCategory: "Chips", weight: "50 g", basePrice: 20, mrp: 20, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80" },
  { name: "Kurkure Masala Munch", brand: "Kurkure", category: "Snacks & Beverages", subCategory: "Chips", weight: "85 g", basePrice: 20, mrp: 20, imageUrl: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&auto=format&fit=crop&q=80" },
  { name: "Pringles Sour Cream & Onion", brand: "Pringles", category: "Snacks & Beverages", subCategory: "Chips", weight: "107 g", basePrice: 105, mrp: 120, imageUrl: "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=400&auto=format&fit=crop&q=80" },
  { name: "Doritos Cheese Nachos", brand: "Doritos", category: "Snacks & Beverages", subCategory: "Chips", weight: "82 g", basePrice: 50, mrp: 50, imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&auto=format&fit=crop&q=80" },
  { name: "Cadbury Dairy Milk Silk", brand: "Cadbury", category: "Snacks & Beverages", subCategory: "Chocolates", weight: "60 g", basePrice: 85, mrp: 85, imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&auto=format&fit=crop&q=80" },
  { name: "Ferrero Rocher Chocolate Box", brand: "Ferrero Rocher", category: "Snacks & Beverages", subCategory: "Chocolates", weight: "16 pcs", basePrice: 525, mrp: 599, imageUrl: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&auto=format&fit=crop&q=80" },
  { name: "Nestle KitKat Share Bag", brand: "Nestle", category: "Snacks & Beverages", subCategory: "Chocolates", weight: "4 pcs", basePrice: 40, mrp: 40, imageUrl: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&auto=format&fit=crop&q=80" },
  { name: "Parle-G Gold Biscuits", brand: "Parle", category: "Snacks & Beverages", subCategory: "Biscuits", weight: "100 g", basePrice: 10, mrp: 10, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80" },
  { name: "Britannia Bourbon Biscuits", brand: "Britannia", category: "Snacks & Beverages", subCategory: "Biscuits", weight: "150 g", basePrice: 35, mrp: 40, imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=80" },
  { name: "Haldiram's Bhujia Sev", brand: "Haldiram's", category: "Snacks & Beverages", subCategory: "Namkeen", weight: "200 g", basePrice: 55, mrp: 60, imageUrl: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&auto=format&fit=crop&q=80" },
  { name: "Maggi 2-Minute Masala Noodles", brand: "Maggi", category: "Snacks & Beverages", subCategory: "Instant Food", weight: "140 g", basePrice: 28, mrp: 28, imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80" },
  { name: "Nescafe Classic Instant Coffee", brand: "Nescafe", category: "Snacks & Beverages", subCategory: "Coffee", weight: "50 g", basePrice: 155, mrp: 165, imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80" },
  { name: "Brooke Bond Red Label Tea", brand: "Brooke Bond", category: "Snacks & Beverages", subCategory: "Tea", weight: "250 g", basePrice: 125, mrp: 140, imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80" },

  // --- Electronics & Tech ---
  { name: "boAt Airdopes 141 TWS Earbuds", brand: "boAt", category: "Electronics & Tech", subCategory: "Audio", weight: "1 Unit", basePrice: 1299, mrp: 4490, imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80" },
  { name: "Boult Audio Z40 Earbuds", brand: "Boult", category: "Electronics & Tech", subCategory: "Audio", weight: "1 Unit", basePrice: 1199, mrp: 3999, imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&auto=format&fit=crop&q=80" },
  { name: "Apple 20W USB-C Power Adapter", brand: "Apple", category: "Electronics & Tech", subCategory: "Accessories", weight: "1 Unit", basePrice: 1749, mrp: 1900, imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80" },
  { name: "Samsung 25W USB-C Fast Charger", brand: "Samsung", category: "Electronics & Tech", subCategory: "Accessories", weight: "1 Unit", basePrice: 1299, mrp: 1699, imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80" },
  { name: "Portronics Type-C Cable", brand: "Portronics", category: "Electronics & Tech", subCategory: "Accessories", weight: "1 Unit", basePrice: 149, mrp: 399, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80" },
  { name: "Mi 10000mAh Power Bank 3i", brand: "Xiaomi", category: "Electronics & Tech", subCategory: "Power Banks", weight: "1 Unit", basePrice: 1149, mrp: 2199, imageUrl: "https://images.unsplash.com/photo-1609592424074-8bcff60fd873?w=400&auto=format&fit=crop&q=80" },
  { name: "Noise Pulse 2 Max Smartwatch", brand: "Noise", category: "Electronics & Tech", subCategory: "Wearables", weight: "1 Unit", basePrice: 1399, mrp: 5999, imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&auto=format&fit=crop&q=80" },
  { name: "Philips Beard Trimmer BT1232", brand: "Philips", category: "Electronics & Tech", subCategory: "Grooming Appliances", weight: "1 Unit", basePrice: 899, mrp: 1195, imageUrl: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&auto=format&fit=crop&q=80" },

  // --- Personal Care & Hygiene ---
  { name: "Dove Intense Repair Shampoo", brand: "Dove", category: "Personal Care & Hygiene", subCategory: "Hair Care", weight: "340 ml", basePrice: 225, mrp: 280, imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80" },
  { name: "Head & Shoulders Anti-Dandruff Shampoo", brand: "Head & Shoulders", category: "Personal Care & Hygiene", subCategory: "Hair Care", weight: "340 ml", basePrice: 245, mrp: 299, imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80" },
  { name: "Pears Pure & Gentle Soap", brand: "Pears", category: "Personal Care & Hygiene", subCategory: "Body Care", weight: "125 g", basePrice: 52, mrp: 65, imageUrl: "https://images.unsplash.com/photo-1607006482172-385012586737?w=400&auto=format&fit=crop&q=80" },
  { name: "Dettol Original Bathing Soap", brand: "Dettol", category: "Personal Care & Hygiene", subCategory: "Body Care", weight: "125 g x 3", basePrice: 145, mrp: 175, imageUrl: "https://images.unsplash.com/photo-1607006482172-385012586737?w=400&auto=format&fit=crop&q=80" },
  { name: "Nivea Soft Moisturising Cream", brand: "Nivea", category: "Personal Care & Hygiene", subCategory: "Skin Care", weight: "200 ml", basePrice: 260, mrp: 330, imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80" },
  { name: "Colgate MaxFresh Toothpaste", brand: "Colgate", category: "Personal Care & Hygiene", subCategory: "Oral Care", weight: "150 g", basePrice: 90, mrp: 115, imageUrl: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&auto=format&fit=crop&q=80" },
  { name: "Sensodyne Rapid Relief Toothpaste", brand: "Sensodyne", category: "Personal Care & Hygiene", subCategory: "Oral Care", weight: "80 g", basePrice: 175, mrp: 210, imageUrl: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&auto=format&fit=crop&q=80" },

  // --- Household Essentials ---
  { name: "Surf Excel Easy Wash Detergent", brand: "Surf Excel", category: "Household Essentials", subCategory: "Laundry", weight: "1 kg", basePrice: 115, mrp: 145, imageUrl: "https://images.unsplash.com/photo-1585830810419-7ac6e3681498?w=400&auto=format&fit=crop&q=80" },
  { name: "Ariel Matic Front Load Detergent", brand: "Ariel", category: "Household Essentials", subCategory: "Laundry", weight: "1 kg", basePrice: 215, mrp: 265, imageUrl: "https://images.unsplash.com/photo-1585830810419-7ac6e3681498?w=400&auto=format&fit=crop&q=80" },
  { name: "Comfort Fabric Conditioner", brand: "Comfort", category: "Household Essentials", subCategory: "Laundry", weight: "860 ml", basePrice: 210, mrp: 245, imageUrl: "https://images.unsplash.com/photo-1585830810419-7ac6e3681498?w=400&auto=format&fit=crop&q=80" },
  { name: "Vim Lemon Dishwash Gel", brand: "Vim", category: "Household Essentials", subCategory: "Cleaning", weight: "500 ml", basePrice: 85, mrp: 115, imageUrl: "https://images.unsplash.com/photo-1585830810419-7ac6e3681498?w=400&auto=format&fit=crop&q=80" },
  { name: "Harpic Power Plus Toilet Cleaner", brand: "Harpic", category: "Household Essentials", subCategory: "Cleaning", weight: "500 ml", basePrice: 90, mrp: 105, imageUrl: "https://images.unsplash.com/photo-1585830810419-7ac6e3681498?w=400&auto=format&fit=crop&q=80" },
  { name: "Lizol Floral Floor Cleaner", brand: "Lizol", category: "Household Essentials", subCategory: "Cleaning", weight: "500 ml", basePrice: 95, mrp: 125, imageUrl: "https://images.unsplash.com/photo-1585830810419-7ac6e3681498?w=400&auto=format&fit=crop&q=80" },
];

const VARIANT_SUFFIXES = [
  { suffix: "", weightMult: 1, priceMult: 1.0 },
  { suffix: "Small Pack", weightMult: 0.5, priceMult: 0.55 },
  { suffix: "Economy Pack", weightMult: 1.5, priceMult: 1.40 },
  { suffix: "Family Saver Pack", weightMult: 2.0, priceMult: 1.80 },
  { suffix: "Pack of 2 (Super Saver)", weightMult: 2.0, priceMult: 1.85 },
  { suffix: "Pack of 3 (Combo)", weightMult: 3.0, priceMult: 2.70 },
  { suffix: "Pack of 6 (Bulk Family)", weightMult: 6.0, priceMult: 5.00 },
  { suffix: "Twin Pack", weightMult: 2.0, priceMult: 1.82 },
  { suffix: "Buy 1 Get 1 Special", weightMult: 2.0, priceMult: 1.60 },
  { suffix: "Extra 20% Free Edition", weightMult: 1.2, priceMult: 1.05 },
];

export function generateFullCatalog(): Product[] {
  const catalog: Product[] = [];
  let globalCount = 0;

  for (let sIdx = 0; sIdx < SEED_TEMPLATES.length; sIdx++) {
    const tmpl = SEED_TEMPLATES[sIdx];

    for (let vIdx = 0; vIdx < VARIANT_SUFFIXES.length; vIdx++) {
      globalCount++;
      const v = VARIANT_SUFFIXES[vIdx];
      const id = `prod_${globalCount.toString().padStart(5, '0')}`;
      
      const variantName = v.suffix ? `${tmpl.name} (${v.suffix})` : tmpl.name;
      const basePrice = Math.round(tmpl.basePrice * v.priceMult);
      const mrp = Math.round(tmpl.mrp * v.priceMult);
      const weight = v.weightMult === 1 ? tmpl.weight : `${v.weightMult}x (${tmpl.weight})`;

      const platforms: PlatformDetails[] = [
        {
          platformId: 'zepto',
          price: basePrice,
          mrp: mrp,
          inStock: true,
          deliveryTime: '8-10 mins',
        },
        {
          platformId: 'blinkit',
          price: Math.max(1, basePrice + (globalCount % 3 === 0 ? -4 : globalCount % 3 === 1 ? 3 : 0)),
          mrp: mrp,
          inStock: true,
          deliveryTime: '10-12 mins',
        },
        {
          platformId: 'instamart',
          price: Math.max(1, basePrice + (globalCount % 2 === 0 ? 5 : -3)),
          mrp: mrp,
          inStock: globalCount % 17 !== 0,
          deliveryTime: '15-20 mins',
        },
        {
          platformId: 'flipkart_minutes',
          price: Math.max(1, basePrice - Math.floor(basePrice * 0.05)),
          mrp: mrp,
          inStock: globalCount % 23 !== 0,
          deliveryTime: '11 mins',
        },
        {
          platformId: 'amazon_now',
          price: Math.max(1, basePrice - Math.floor(basePrice * 0.08)),
          mrp: mrp,
          inStock: tmpl.category !== 'Fresh Produce',
          deliveryTime: '2 hours',
        },
      ];

      catalog.push({
        id,
        ean: tmpl.ean || `890${globalCount.toString().padStart(10, '0')}`,
        name: variantName,
        brand: tmpl.brand,
        category: tmpl.category,
        subCategory: tmpl.subCategory,
        imageUrl: tmpl.imageUrl,
        weight: weight,
        platforms,
      });
    }
  }

  return catalog;
}
