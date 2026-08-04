import { PlatformId, CanonicalSKU, VENDORS, PlatformPriceEntry } from './vendorsAndCatalog';

export interface CartItemInput {
  product: CanonicalSKU;
  quantity: number;
}

export interface VendorCartSplit {
  vendorId: PlatformId;
  vendorName: string;
  logoEmoji: string;
  items: Array<{
    product: CanonicalSKU;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  surgeFee: number;
  couponDiscount: number;
  vendorTotal: number;
  deliverySLA: string;
}

export interface CartOptimizationResult {
  strategy: 'single' | 'split2' | 'split3' | 'fastest';
  totalMRP: number;
  netItemsSubtotal: number;
  totalDeliveryFees: number;
  totalSurgeFees: number;
  totalCouponsDiscount: number;
  grandTotalCost: number;
  totalNetSavings: number;
  savingsPercentage: number;
  vendorSplits: VendorCartSplit[];
  itemSavingsBreakdown: Array<{
    productTitle: string;
    mrp: number;
    bestPrice: number;
    winningVendor: string;
    itemSavings: number;
  }>;
}

export interface CouponOffer {
  code: string;
  paymentMethod: string;
  discountAmount: number;
  minOrderValue: number;
  vendorId: PlatformId;
}

export const APPLIED_COUPONS: CouponOffer[] = [
  { code: 'HDFC100', paymentMethod: 'HDFC Cards', discountAmount: 100, minOrderValue: 499, vendorId: 'ondc' },
  { code: 'CRED50', paymentMethod: 'CRED Pay', discountAmount: 50, minOrderValue: 299, vendorId: 'zepto' },
  { code: 'ZEPTOFIRST', paymentMethod: 'UPI', discountAmount: 30, minOrderValue: 199, vendorId: 'zepto' },
  { code: 'BLINKIT15', paymentMethod: 'UPI', discountAmount: 40, minOrderValue: 349, vendorId: 'blinkit' },
  { code: 'FRESHPROMO', paymentMethod: 'Amazon Pay', discountAmount: 75, minOrderValue: 599, vendorId: 'amazon_fresh' },
];

export function runCombinatorialOptimizer(
  cart: CartItemInput[],
  strategy: 'single' | 'split2' | 'split3' | 'fastest' = 'split2'
): CartOptimizationResult | null {
  if (cart.length === 0) return null;

  let totalMRP = 0;
  cart.forEach((i) => {
    totalMRP += i.product.mrp * i.quantity;
  });

  const vendorMap: Map<PlatformId, VendorCartSplit> = new Map();

  const itemSavingsBreakdown: Array<{
    productTitle: string;
    mrp: number;
    bestPrice: number;
    winningVendor: string;
    itemSavings: number;
  }> = [];

  cart.forEach((item) => {
    let chosenEntry: PlatformPriceEntry;

    if (strategy === 'fastest') {
      // Pick platform with lowest delivery minutes
      const sortedBySLA = [...item.product.platforms].sort((a, b) => a.deliveryMins - b.deliveryMins);
      chosenEntry = sortedBySLA[0];
    } else {
      // Pick cheapest platform
      const sortedByPrice = [...item.product.platforms].sort((a, b) => a.price - b.price);
      chosenEntry = sortedByPrice[0];
    }

    const vendorInfo = VENDORS[chosenEntry.platform];
    const subtotal = chosenEntry.price * item.quantity;
    const itemSavings = (item.product.mrp - chosenEntry.price) * item.quantity;

    itemSavingsBreakdown.push({
      productTitle: item.product.title,
      mrp: item.product.mrp,
      bestPrice: chosenEntry.price,
      winningVendor: vendorInfo.shortName,
      itemSavings,
    });

    if (!vendorMap.has(chosenEntry.platform)) {
      vendorMap.set(chosenEntry.platform, {
        vendorId: chosenEntry.platform,
        vendorName: vendorInfo.name,
        logoEmoji: vendorInfo.logoEmoji,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        surgeFee: vendorInfo.surgeFee,
        couponDiscount: 0,
        vendorTotal: 0,
        deliverySLA: vendorInfo.deliverySLA,
      });
    }

    const currentSplit = vendorMap.get(chosenEntry.platform)!;
    currentSplit.items.push({
      product: item.product,
      quantity: item.quantity,
      unitPrice: chosenEntry.price,
      subtotal,
    });
    currentSplit.subtotal += subtotal;
  });

  // Calculate fees & coupons for each vendor split
  let netItemsSubtotal = 0;
  let totalDeliveryFees = 0;
  let totalSurgeFees = 0;
  let totalCouponsDiscount = 0;

  vendorMap.forEach((split, vendorId) => {
    const vendorInfo = VENDORS[vendorId];
    netItemsSubtotal += split.subtotal;

    // Delivery fee logic
    split.deliveryFee = split.subtotal >= vendorInfo.freeDeliveryThreshold ? 0 : vendorInfo.baseDeliveryFee;
    totalDeliveryFees += split.deliveryFee;

    // Surge fee logic
    split.surgeFee = vendorInfo.surgeFee;
    totalSurgeFees += split.surgeFee;

    // Applicable coupon lookup
    const matchingCoupon = APPLIED_COUPONS.find(
      (c) => c.vendorId === vendorId && split.subtotal >= c.minOrderValue
    );
    if (matchingCoupon) {
      split.couponDiscount = matchingCoupon.discountAmount;
      totalCouponsDiscount += split.couponDiscount;
    }

    split.vendorTotal = Math.max(0, split.subtotal + split.deliveryFee + split.surgeFee - split.couponDiscount);
  });

  const vendorSplits = Array.from(vendorMap.values());
  const grandTotalCost = vendorSplits.reduce((acc, curr) => acc + curr.vendorTotal, 0);
  const totalNetSavings = Math.max(0, totalMRP - grandTotalCost);
  const savingsPercentage = Math.round((totalNetSavings / totalMRP) * 100);

  return {
    strategy,
    totalMRP,
    netItemsSubtotal,
    totalDeliveryFees,
    totalSurgeFees,
    totalCouponsDiscount,
    grandTotalCost,
    totalNetSavings,
    savingsPercentage,
    vendorSplits,
    itemSavingsBreakdown,
  };
}

// Generate ONDC Beckn Protocol JSON Payload
export function generateONDCBecknPayload(splits: VendorCartSplit[], pincode: string): string {
  const ondcSplits = splits.filter((s) => s.vendorId === 'ondc');
  const payload = {
    context: {
      domain: "ONDC:RET10",
      action: "select",
      version: "1.2.0",
      bap_id: "buyer-app.pricepulse.in",
      bap_uri: "https://api.pricepulse.app/ondc/bap",
      bpp_id: "kirana-seller-node.ondc.org",
      transaction_id: `tx_${Date.now()}`,
      message_id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      pincode: pincode,
    },
    message: {
      order: {
        provider: {
          id: "hyperlocal_kirana_001",
          locations: [{ id: `loc_${pincode}` }]
        },
        items: ondcSplits.flatMap((s) =>
          s.items.map((i) => ({
            id: i.product.gtin || i.product.id,
            quantity: { count: i.quantity },
            price: { currency: "INR", value: i.unitPrice.toString() }
          }))
        )
      }
    }
  };
  return JSON.stringify(payload, null, 2);
}

// Generate Amazon Multi-ASIN Cart Link
export function generateAmazonMultiASINLink(splits: VendorCartSplit[]): string {
  const amazonSplits = splits.filter((s) => s.vendorId === 'amazon_fresh');
  const items = amazonSplits.flatMap((s) => s.items);
  if (items.length === 0) return 'https://www.amazon.in/fresh';

  const asinParams = items
    .map((item, idx) => `ASIN.${idx + 1}=${item.product.gtin || 'B00N0W03R4'}&Quantity.${idx + 1}=${item.quantity}`)
    .join('&');

  return `https://www.amazon.in/gp/aws/cart/add.html?${asinParams}&associate-id=pricepulse-21`;
}

// Simulate DOM Cart Injector
export function simulateCartInjector(split: VendorCartSplit): string[] {
  return [
    `[Injector] Connecting to authenticated webview session for ${split.vendorName}...`,
    `[Injector] Bootstrapping CSRF token & session headers...`,
    ...split.items.map((i) => `[Injector] Injecting item GTIN ${i.product.gtin} (Qty: ${i.quantity}) into ${split.vendorName} cart`),
    `[Injector] Cart populated successfully. Subtotal: ₹${split.subtotal}`,
    `[Injector] Pausing execution at checkout screen. Handing off UI control for RBI 2FA PIN entry.`
  ];
}
