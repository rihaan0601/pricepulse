import {
  CartItem,
  PlatformName,
  PlatformFeeRule,
  PlatformOffer,
  PlatformCartResult,
  OptimizationResult,
  LivePriceEntry,
  AppliedOffer
} from './types';

const DELIVERY_TIMES: Record<PlatformName, number> = {
  zepto: 8,
  blinkit: 9,
  instamart: 14,
  flipkart_minutes: 11,
  amazon_now: 20
};

export function optimizeCart(params: {
  cartItems: CartItem[];
  prices: Map<string, Map<PlatformName, LivePriceEntry>>;
  feeRules: Map<PlatformName, PlatformFeeRule>;
  offers: PlatformOffer[];
  mode?: 'cheapest' | 'fastest' | 'bank_offers';
}): OptimizationResult {
  const { cartItems, prices, feeRules, offers, mode = 'cheapest' } = params;
  const platforms: PlatformName[] = ['zepto', 'blinkit', 'flipkart_minutes', 'instamart', 'amazon_now'];
  
  const platformResults: PlatformCartResult[] = [];

  const calculatePlatformCart = (
    platform: PlatformName, 
    items: CartItem[]
  ): PlatformCartResult => {
    let allInStock = true;
    let itemsTotal = 0;
    const itemsDetail: any[] = [];
    
    const rules = feeRules.get(platform) || { 
      platform_name: platform, pincode: '', min_order_free_delivery: 9999, base_delivery_fee: 50, handling_fee: 5, surge_fee: 0 
    };

    for (const item of items) {
      const productPrices = prices.get(item.masterProductId);
      if (!productPrices) {
        allInStock = false;
        continue;
      }
      
      const priceEntry = productPrices.get(platform);
      if (!priceEntry || !priceEntry.inStock) {
        allInStock = false;
      } else {
        const subtotal = priceEntry.sellingPrice * item.quantity;
        itemsDetail.push({
          title: priceEntry.title,
          qty: item.quantity,
          unitPrice: priceEntry.sellingPrice,
          subtotal
        });
        itemsTotal += subtotal;
      }
    }
    
    let deliveryFee = rules.base_delivery_fee;
    if (itemsTotal >= rules.min_order_free_delivery) {
      deliveryFee = 0;
    }
    
    const handlingFee = itemsTotal > 0 ? rules.handling_fee : 0;
    const surgeFee = itemsTotal > 0 ? rules.surge_fee : 0;
    
    let discount = 0;
    let discountLabel = '';
    const appliedOffers: AppliedOffer[] = [];
    
    if (itemsTotal > 0) {
      const platformOffers = offers.filter(o => o.platform_name === platform && itemsTotal >= o.min_cart_value);
      // Multi-coupon stacking: apply ALL qualifying offers
      for (const offer of platformOffers) {
        let currentDiscount = 0;
        if (offer.discount_type === 'flat') {
          currentDiscount = offer.discount_value;
        } else if (offer.discount_type === 'percentage') {
          currentDiscount = (itemsTotal * offer.discount_value) / 100;
          if (currentDiscount > offer.max_discount) {
            currentDiscount = offer.max_discount;
          }
        }
        discount += currentDiscount;
        appliedOffers.push({
          code: offer.code,
          paymentMethod: offer.payment_method || 'Bank',
          discountLabel: offer.discount_type === 'flat' ? `₹${offer.discount_value} Off` : `${offer.discount_value}% Off`,
          platform,
          amount: currentDiscount
        });
      }
      if (appliedOffers.length > 0) {
        discountLabel = appliedOffers.map(o => o.code).join(' + ');
      }
    }
    
    const grandTotal = itemsTotal > 0 ? Math.max(0, itemsTotal + deliveryFee + handlingFee + surgeFee - discount) : 0;
    const deliveryTimeMinutes = DELIVERY_TIMES[platform] || 15;
    const loyaltyPoints = Math.floor(grandTotal / 10);
    
    return {
      platform,
      items: itemsDetail,
      itemsTotal,
      deliveryFee,
      handlingFee,
      surgeFee,
      discount,
      discountLabel,
      grandTotal,
      allInStock,
      deliveryTimeMinutes,
      loyaltyPoints,
      appliedOffers
    };
  };

  for (const platform of platforms) {
    if (!feeRules.has(platform)) continue;
    const result = calculatePlatformCart(platform, cartItems);
    platformResults.push(result);
  }
  
  const validPlatforms = platformResults.filter(p => p.allInStock && p.itemsTotal > 0);
  
  const scoreResult = (r: PlatformCartResult) => {
    if (mode === 'fastest') return r.deliveryTimeMinutes * 1000 + r.grandTotal;
    if (mode === 'bank_offers') return -r.discount;
    return r.grandTotal;
  };

  const scoreResults = (rs: PlatformCartResult[]) => {
    const totalGrand = rs.reduce((sum, r) => sum + r.grandTotal, 0);
    const totalTime = Math.max(...rs.map(r => r.deliveryTimeMinutes));
    const totalDiscount = rs.reduce((sum, r) => sum + r.discount, 0);
    if (mode === 'fastest') return totalTime * 1000 + totalGrand;
    if (mode === 'bank_offers') return -totalDiscount;
    return totalGrand;
  };

  let singleBest = validPlatforms.length > 0 
    ? validPlatforms.reduce((prev, curr) => scoreResult(prev) < scoreResult(curr) ? prev : curr)
    : platformResults[0];

  let bestSplitCost = Infinity;
  let bestSplitScore = Infinity;
  let bestSplitOrders: PlatformCartResult[] | undefined;
  
  // 2-way split
  if (validPlatforms.length >= 2) {
    for (let i = 0; i < validPlatforms.length; i++) {
      for (let j = i + 1; j < validPlatforms.length; j++) {
        const p1 = validPlatforms[i].platform;
        const p2 = validPlatforms[j].platform;
        
        const cart1: CartItem[] = [];
        const cart2: CartItem[] = [];
        let canSplit = true;
        
        for (const item of cartItems) {
          const itemPrices = prices.get(item.masterProductId);
          const price1 = itemPrices?.get(p1);
          const price2 = itemPrices?.get(p2);
          
          if (price1?.inStock && (!price2?.inStock || price1.sellingPrice <= price2.sellingPrice)) {
            cart1.push(item);
          } else if (price2?.inStock) {
            cart2.push(item);
          } else {
            canSplit = false;
            break;
          }
        }
        
        if (canSplit && cart1.length > 0 && cart2.length > 0) {
          const res1 = calculatePlatformCart(p1, cart1);
          const res2 = calculatePlatformCart(p2, cart2);
          const score = scoreResults([res1, res2]);
          if (score < bestSplitScore) {
            bestSplitScore = score;
            bestSplitOrders = [res1, res2];
            bestSplitCost = res1.grandTotal + res2.grandTotal;
          }
        }
      }
    }
  }

  let best3WayCost = Infinity;
  let best3WayScore = Infinity;
  let bestSplitOrders3Way: PlatformCartResult[] | undefined;

  // 3-way split
  if (validPlatforms.length >= 3) {
    for (let i = 0; i < validPlatforms.length; i++) {
      for (let j = i + 1; j < validPlatforms.length; j++) {
        for (let k = j + 1; k < validPlatforms.length; k++) {
          const p1 = validPlatforms[i].platform;
          const p2 = validPlatforms[j].platform;
          const p3 = validPlatforms[k].platform;

          const cart1: CartItem[] = [];
          const cart2: CartItem[] = [];
          const cart3: CartItem[] = [];
          let canSplit = true;

          for (const item of cartItems) {
            const itemPrices = prices.get(item.masterProductId);
            const pr1 = itemPrices?.get(p1);
            const pr2 = itemPrices?.get(p2);
            const pr3 = itemPrices?.get(p3);

            const options = [];
            if (pr1?.inStock) options.push({ p: 1, price: pr1.sellingPrice });
            if (pr2?.inStock) options.push({ p: 2, price: pr2.sellingPrice });
            if (pr3?.inStock) options.push({ p: 3, price: pr3.sellingPrice });

            if (options.length === 0) {
              canSplit = false;
              break;
            }

            options.sort((a, b) => a.price - b.price);
            const bestP = options[0].p;
            if (bestP === 1) cart1.push(item);
            else if (bestP === 2) cart2.push(item);
            else if (bestP === 3) cart3.push(item);
          }

          if (canSplit && cart1.length > 0 && cart2.length > 0 && cart3.length > 0) {
            const res1 = calculatePlatformCart(p1, cart1);
            const res2 = calculatePlatformCart(p2, cart2);
            const res3 = calculatePlatformCart(p3, cart3);
            
            const score = scoreResults([res1, res2, res3]);
            if (score < best3WayScore) {
              best3WayScore = score;
              bestSplitOrders3Way = [res1, res2, res3];
              best3WayCost = res1.grandTotal + res2.grandTotal + res3.grandTotal;
            }
          }
        }
      }
    }
  }

  const singleScore = singleBest ? scoreResult(singleBest) : Infinity;
  let singleCost = singleBest ? singleBest.grandTotal : Infinity;

  let bestStrategy: 'single' | 'split' | 'split3way' = 'single';
  let minScore = singleScore;

  if (bestSplitOrders && bestSplitScore < minScore) {
    bestStrategy = 'split';
    minScore = bestSplitScore;
  }
  if (bestSplitOrders3Way && best3WayScore < minScore) {
    bestStrategy = 'split3way';
    minScore = best3WayScore;
  }

  let finalSavings = 0;
  if (bestStrategy === 'split' && bestSplitCost < singleCost) {
    finalSavings = singleCost - bestSplitCost;
  } else if (bestStrategy === 'split3way' && best3WayCost < singleCost) {
    finalSavings = singleCost - best3WayCost;
  }

  return {
    bestStrategy,
    savingsAmount: finalSavings,
    singleBest: singleBest || platformResults[0],
    splitOrders: bestSplitOrders,
    splitOrders3Way: bestSplitOrders3Way,
    allPlatforms: platformResults
  };
}
