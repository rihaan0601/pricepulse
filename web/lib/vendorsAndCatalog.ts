export type PlatformId = 'zepto' | 'blinkit' | 'instamart' | 'flipkart_minutes' | 'amazon_fresh' | 'ondc';

export interface VendorInfo {
  id: PlatformId;
  name: string;
  shortName: string;
  logoEmoji: string;
  brandColor: string;
  bgLight: string;
  borderColor: string;
  deliverySLA: string;
  averageMins: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  surgeFee: number;
  pingMs: number;
  rating: number;
}

export interface PlatformPriceEntry {
  platform: PlatformId;
  price: number;
  mrp: number;
  inStock: boolean;
  deliveryMins: number;
  sellerId: string;
}

export interface CanonicalSKU {
  id: string;
  title: string;
  brand: string;
  unit: string;
  category: string;
  gtin: string;
  mrp: number;
  imageUrl: string;
  description: string;
  platforms: PlatformPriceEntry[];
}

export const VENDORS: Record<PlatformId, VendorInfo> = {
  zepto: {
    id: 'zepto',
    name: 'Zepto Quick Grocery',
    shortName: 'Zepto',
    logoEmoji: '🟣',
    brandColor: 'text-purple-400',
    bgLight: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    deliverySLA: '~7 mins',
    averageMins: 7,
    baseDeliveryFee: 15,
    freeDeliveryThreshold: 199,
    surgeFee: 15,
    pingMs: 12,
    rating: 4.8,
  },
  blinkit: {
    id: 'blinkit',
    name: 'Blinkit Instant',
    shortName: 'Blinkit',
    logoEmoji: '🟡',
    brandColor: 'text-yellow-400',
    bgLight: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    deliverySLA: '~8 mins',
    averageMins: 8,
    baseDeliveryFee: 15,
    freeDeliveryThreshold: 199,
    surgeFee: 10,
    pingMs: 11,
    rating: 4.7,
  },
  instamart: {
    id: 'instamart',
    name: 'Swiggy Instamart',
    shortName: 'Instamart',
    logoEmoji: '🟠',
    brandColor: 'text-orange-400',
    bgLight: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    deliverySLA: '~12 mins',
    averageMins: 12,
    baseDeliveryFee: 20,
    freeDeliveryThreshold: 249,
    surgeFee: 0,
    pingMs: 14,
    rating: 4.6,
  },
  flipkart_minutes: {
    id: 'flipkart_minutes',
    name: 'Flipkart Minutes',
    shortName: 'FK Minutes',
    logoEmoji: '🔵',
    brandColor: 'text-blue-400',
    bgLight: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    deliverySLA: '~11 mins',
    averageMins: 11,
    baseDeliveryFee: 10,
    freeDeliveryThreshold: 149,
    surgeFee: 0,
    pingMs: 13,
    rating: 4.5,
  },
  amazon_fresh: {
    id: 'amazon_fresh',
    name: 'Amazon Fresh India',
    shortName: 'Amazon Fresh',
    logoEmoji: '🟧',
    brandColor: 'text-amber-500',
    bgLight: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    deliverySLA: '~60 mins',
    averageMins: 60,
    baseDeliveryFee: 29,
    freeDeliveryThreshold: 299,
    surgeFee: 0,
    pingMs: 18,
    rating: 4.9,
  },
  ondc: {
    id: 'ondc',
    name: 'ONDC Kirana Network',
    shortName: 'ONDC Kirana',
    logoEmoji: '🌐',
    brandColor: 'text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    deliverySLA: '~15 mins',
    averageMins: 15,
    baseDeliveryFee: 0,
    freeDeliveryThreshold: 99,
    surgeFee: 0,
    pingMs: 9,
    rating: 4.9,
  },
};

export const CANONICAL_CATALOG: CanonicalSKU[] = [
  {
    id: "sku-001",
    title: "Amul Pasteurised Salted Butter",
    brand: "Amul",
    unit: "500g",
    category: "Dairy & Breakfast",
    gtin: "8901262010055",
    mrp: 275,
    imageUrl: "/products/amul_butter.jpg",
    description: "Wholesome fresh butter made from pure milk fat with iconic taste.",
    platforms: [
      { platform: "ondc", price: 258, mrp: 275, inStock: true, deliveryMins: 15, sellerId: "ondc_amul_500" },
      { platform: "zepto", price: 265, mrp: 275, inStock: true, deliveryMins: 7, sellerId: "zp_amul_500" },
      { platform: "blinkit", price: 268, mrp: 275, inStock: true, deliveryMins: 8, sellerId: "bl_amul_500" },
      { platform: "instamart", price: 270, mrp: 275, inStock: true, deliveryMins: 12, sellerId: "im_amul_500" },
      { platform: "flipkart_minutes", price: 262, mrp: 275, inStock: true, deliveryMins: 11, sellerId: "fk_amul_500" },
      { platform: "amazon_fresh", price: 255, mrp: 275, inStock: true, deliveryMins: 60, sellerId: "B00N0W03R4" },
    ]
  },
  {
    id: "sku-002",
    title: "Aashirvaad Sharbati Superior Whole Wheat Atta",
    brand: "Aashirvaad",
    unit: "5kg",
    category: "Staples & Atta",
    gtin: "8901725111227",
    mrp: 260,
    imageUrl: "/products/aashirvaad_atta.jpg",
    description: "100% pure MP Sharbati wheat flour milled to perfection for soft rotis.",
    platforms: [
      { platform: "ondc", price: 228, mrp: 260, inStock: true, deliveryMins: 15, sellerId: "ondc_atta_5" },
      { platform: "zepto", price: 242, mrp: 260, inStock: true, deliveryMins: 7, sellerId: "zp_atta_5" },
      { platform: "blinkit", price: 245, mrp: 260, inStock: true, deliveryMins: 8, sellerId: "bl_atta_5" },
      { platform: "instamart", price: 248, mrp: 260, inStock: true, deliveryMins: 12, sellerId: "im_atta_5" },
      { platform: "flipkart_minutes", price: 235, mrp: 260, inStock: true, deliveryMins: 11, sellerId: "fk_atta_5" },
      { platform: "amazon_fresh", price: 225, mrp: 260, inStock: true, deliveryMins: 60, sellerId: "B01H52U264" },
    ]
  },
  {
    id: "sku-003",
    title: "Tata Tea Gold Fine Blend Rich CTC Tea",
    brand: "Tata Consumer",
    unit: "500g Pack",
    category: "Beverages & Drinks",
    gtin: "8901030001008",
    mrp: 310,
    imageUrl: "/products/tata_tea_gold.jpg",
    description: "Fine blend of Assam CTC tea leaves with long leaf aroma.",
    platforms: [
      { platform: "ondc", price: 272, mrp: 310, inStock: true, deliveryMins: 15, sellerId: "ondc_tata_500" },
      { platform: "zepto", price: 280, mrp: 310, inStock: true, deliveryMins: 7, sellerId: "zp_tata_500" },
      { platform: "blinkit", price: 285, mrp: 310, inStock: true, deliveryMins: 8, sellerId: "bl_tata_500" },
      { platform: "instamart", price: 288, mrp: 310, inStock: true, deliveryMins: 12, sellerId: "im_tata_500" },
      { platform: "flipkart_minutes", price: 278, mrp: 310, inStock: true, deliveryMins: 11, sellerId: "fk_tata_500" },
      { platform: "amazon_fresh", price: 265, mrp: 310, inStock: true, deliveryMins: 60, sellerId: "B00TTB8N4C" },
    ]
  },
  {
    id: "sku-004",
    title: "Fortune Sunlite Refined Sunflower Oil",
    brand: "Fortune",
    unit: "1L Pouch",
    category: "Staples & Atta",
    gtin: "8906007280014",
    mrp: 155,
    imageUrl: "/products/fortune_oil.jpg",
    description: "Light and healthy cooking oil enriched with Vitamin A & D.",
    platforms: [
      { platform: "ondc", price: 132, mrp: 155, inStock: true, deliveryMins: 15, sellerId: "ondc_fortune_1l" },
      { platform: "zepto", price: 140, mrp: 155, inStock: true, deliveryMins: 7, sellerId: "zp_fortune_1l" },
      { platform: "blinkit", price: 142, mrp: 155, inStock: true, deliveryMins: 8, sellerId: "bl_fortune_1l" },
      { platform: "instamart", price: 144, mrp: 155, inStock: true, deliveryMins: 12, sellerId: "im_fortune_1l" },
      { platform: "flipkart_minutes", price: 136, mrp: 155, inStock: true, deliveryMins: 11, sellerId: "fk_fortune_1l" },
      { platform: "amazon_fresh", price: 130, mrp: 155, inStock: true, deliveryMins: 60, sellerId: "B00N0W05FA" },
    ]
  },
  {
    id: "sku-005",
    title: "Maggi 2-Minute Masala Instant Noodles",
    brand: "Nestle",
    unit: "12-Pack (840g)",
    category: "Snacks & Munchies",
    gtin: "8901058852312",
    mrp: 168,
    imageUrl: "/products/maggi_noodles.jpg",
    description: "Iconic masala instant noodles enriched with iron.",
    platforms: [
      { platform: "ondc", price: 145, mrp: 168, inStock: true, deliveryMins: 15, sellerId: "ondc_maggi_12p" },
      { platform: "zepto", price: 154, mrp: 168, inStock: true, deliveryMins: 7, sellerId: "zp_maggi_12p" },
      { platform: "blinkit", price: 156, mrp: 168, inStock: true, deliveryMins: 8, sellerId: "bl_maggi_12p" },
      { platform: "instamart", price: 158, mrp: 168, inStock: true, deliveryMins: 12, sellerId: "im_maggi_12p" },
      { platform: "flipkart_minutes", price: 150, mrp: 168, inStock: true, deliveryMins: 11, sellerId: "fk_maggi_12p" },
      { platform: "amazon_fresh", price: 142, mrp: 168, inStock: true, deliveryMins: 60, sellerId: "B01H52U88M" },
    ]
  },
  {
    id: "sku-006",
    title: "Nescafe Classic 100% Pure Instant Coffee",
    brand: "Nestle",
    unit: "100g Jar",
    category: "Beverages & Drinks",
    gtin: "8901058001000",
    mrp: 360,
    imageUrl: "/products/nescafe_classic.jpg",
    description: "Rich aroma and signature bold flavor from premium coffee beans.",
    platforms: [
      { platform: "ondc", price: 310, mrp: 360, inStock: true, deliveryMins: 15, sellerId: "ondc_nescafe_100" },
      { platform: "zepto", price: 325, mrp: 360, inStock: true, deliveryMins: 7, sellerId: "zp_nescafe_100" },
      { platform: "blinkit", price: 330, mrp: 360, inStock: true, deliveryMins: 8, sellerId: "bl_nescafe_100" },
      { platform: "instamart", price: 335, mrp: 360, inStock: true, deliveryMins: 12, sellerId: "im_nescafe_100" },
      { platform: "flipkart_minutes", price: 320, mrp: 360, inStock: true, deliveryMins: 11, sellerId: "fk_nescafe_100" },
      { platform: "amazon_fresh", price: 305, mrp: 360, inStock: true, deliveryMins: 60, sellerId: "B00TTB8NES" },
    ]
  },
  {
    id: "sku-007",
    title: "Dettol Original Germ Protection Bathing Soap",
    brand: "Dettol",
    unit: "4-Pack (125g each)",
    category: "Personal Care & Hygiene",
    gtin: "8901396001005",
    mrp: 240,
    imageUrl: "/products/dettol_soap.jpg",
    description: "Trusted germ protection soap formula for daily hygiene.",
    platforms: [
      { platform: "ondc", price: 192, mrp: 240, inStock: true, deliveryMins: 15, sellerId: "ondc_dettol_4p" },
      { platform: "zepto", price: 205, mrp: 240, inStock: true, deliveryMins: 7, sellerId: "zp_dettol_4p" },
      { platform: "blinkit", price: 210, mrp: 240, inStock: true, deliveryMins: 8, sellerId: "bl_dettol_4p" },
      { platform: "instamart", price: 215, mrp: 240, inStock: true, deliveryMins: 12, sellerId: "im_dettol_4p" },
      { platform: "flipkart_minutes", price: 200, mrp: 240, inStock: true, deliveryMins: 11, sellerId: "fk_dettol_4p" },
      { platform: "amazon_fresh", price: 189, mrp: 240, inStock: true, deliveryMins: 60, sellerId: "B00N0W0DET" },
    ]
  },
  {
    id: "sku-008",
    title: "Mother Dairy Toned Fresh Milk",
    brand: "Mother Dairy",
    unit: "1L Pouch",
    category: "Dairy & Breakfast",
    gtin: "8901262000010",
    mrp: 54,
    imageUrl: "/products/mother_dairy_milk.jpg",
    description: "Pasteurised toned milk with wholesome nutritional goodness.",
    platforms: [
      { platform: "ondc", price: 51, mrp: 54, inStock: true, deliveryMins: 15, sellerId: "ondc_md_milk_1l" },
      { platform: "zepto", price: 54, mrp: 54, inStock: true, deliveryMins: 7, sellerId: "zp_md_milk_1l" },
      { platform: "blinkit", price: 54, mrp: 54, inStock: true, deliveryMins: 8, sellerId: "bl_md_milk_1l" },
      { platform: "instamart", price: 54, mrp: 54, inStock: true, deliveryMins: 12, sellerId: "im_md_milk_1l" },
      { platform: "flipkart_minutes", price: 53, mrp: 54, inStock: true, deliveryMins: 11, sellerId: "fk_md_milk_1l" },
      { platform: "amazon_fresh", price: 50, mrp: 54, inStock: true, deliveryMins: 60, sellerId: "B00N0W0MILK" },
    ]
  }
];
