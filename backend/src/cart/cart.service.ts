import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { CommercePricingService } from '../commerce/pricing/pricing.service';
import { ShippingService } from '../commerce/shipping/shipping.service';
import { CustomizationService } from '../commerce/customization/customization.service';
import { CurrencyService } from '../commerce/currency/currency.service';
import { RegionService } from '../commerce/region/region.service';
import { CouponsService } from '../coupons/coupons.service';
import DecimalJS from 'decimal.js';

export interface CartItem {
  productId: string;
  variantId?: string;
  selectedOptions?: any;
  quantity: number;
  unitPriceUSD: number; // cents (Frozen base price at addition)
  unitSalePriceUSD?: number; // cents (Frozen sale price at addition)
  exchangeRateUsed: string;
  unitPriceFinal: number; // cents (Regionalized, includes sale if applicable)
  unitBasePriceFinal?: number; // cents (Regionalized, always base price before sale)
  price: number; // cents (Total for line)
  weightKG: number; // Snapshot at addition
  customization: any;
  name?: string;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  regionCode: string;
  
  // Display Values (User-facing cents)
  displayCurrency: string;
  displaySubtotal: number; // cents
  displayTotal: number; // cents
  
  // Charge Values (Stripe-facing cents)
  chargeCurrency: string;
  chargeTotal: number; // cents
  
  exchangeRateUsed: string;
  shippingCost: number; // cents
  
  couponCode?: string;
  discountAmount?: number; // cents (Regionalized)
  
  updatedAt: Date;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly CART_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

  constructor(
    private redisService: RedisService,
    private prisma: PrismaService,
    private pricingService: CommercePricingService,
    private shippingService: ShippingService,
    private customizationService: CustomizationService,
    private currencyService: CurrencyService,
    private readonly regionService: RegionService,
    private readonly couponsService: CouponsService,
  ) {}

  /**
   * Get cart for a session
   */
  async getCart(sessionId: string, regionCode: string = 'US'): Promise<Cart> {
    this.logger.debug(`[getCart] Fetching cart for session ${sessionId}, region: ${regionCode}`);
    const data = await this.redisService.getCart(sessionId);
    if (!data) {
      return { 
        items: [], 
        regionCode: regionCode, 
        displayCurrency: 'USD', 
        displaySubtotal: 0,
        displayTotal: 0,
        chargeCurrency: 'USD',
        chargeTotal: 0,
        exchangeRateUsed: '1', 
        shippingCost: 0, 
        updatedAt: new Date() 
      };
    }

    // HEALER: If cart has items but totals are missing/0, force recalculate
    const needsHeal = data.items.length > 0 && (!data.displaySubtotal || isNaN(data.displaySubtotal) || data.displayTotal === 0);
    if (needsHeal) {
      this.logger.warn(`Cart ${sessionId} appears poisoned or stale. Healing...`);
      return this.recalculateCart(sessionId, data);
    }

    return data;
  }

  /**
   * Add item to cart
   */
  async addItem(
    sessionId: string, 
    productId: string, 
    quantity: number, 
    customization?: any, 
    regionCode: string = 'US',
    variantId?: string
  ): Promise<Cart> {
    const product = (await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: { include: { images: true, color: true, pattern: true } } }
    })) as any;

    if (!product) {
      throw new Error('Product not found');
    }

    const hasVariants = (product as any).hasVariants || false;

    if (!hasVariants && product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available`);
    }

    const cart = await this.getCart(sessionId);
    cart.regionCode = regionCode;

    // 1. Find Specific Variant if requested
    let unitPriceUSD = product.basePriceUSD_cents;
    let selectedOptions = null;
    let variantImage = product.images?.[0];
    let variantStock = product.stock;
    let displayName = product.name;

    const variants = product.variants as any[] || [];
    
    if (variantId && variants.length > 0) {
      const variant = variants.find(v => v.id === variantId || v.sku === variantId);
      if (variant) {
        // PRIORITY CHAIN (Mirroring PricingService):
        // 1. Variant Sale Price > 2. Variant Price > 3. Product Sale Price > 4. Product Base Price
        const vBase = variant.priceUSD_cents || product.basePriceUSD_cents;
        const vSale = variant.salePriceUSD_cents || product.salePriceUSD_cents;
        
        unitPriceUSD = vBase;
        const unitSalePriceUSD = (vSale && vSale > 0) ? vSale : undefined;

        selectedOptions = variant.options;
        variantStock = variant.stock;
        if (variant.imageUrl) variantImage = variant.imageUrl;
        
        // Final price to use for subtotal calc during addition
        const effectivePrice = unitSalePriceUSD ?? unitPriceUSD;
        const weightKG = product.weightKG || 0;
        
        // Generate summary e.g. "Product Name — Color: Red, Pattern: Plain"
        const optionsStr = Object.entries(variant.options || {})
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ');
        if (optionsStr) {
          displayName = `${product.name} — ${optionsStr}`;
        }
      } else {
        throw new Error('Requested variant not found');
      }
    } else if (hasVariants) {
      // Core Rule: Base product is not purchasable if hasVariants is true
      throw new Error('Please select a specific variant');
    }

    // Identify effective price for initial addition
    const basePriceSnapshot = variantId ? (unitPriceUSD) : product.basePriceUSD;
    const salePriceSnapshot = variantId ? (unitPriceUSD === product.basePriceUSD ? product.salePriceUSD : undefined) : product.salePriceUSD;
    // Wait, the logic above for unitPriceUSD in variant block was complex. 
    // Let's simplify and be explicit.
    
    // 1. Identify Pricing Hierarchy (Variant overrides Product)
    let finalBaseUSD = product.basePriceUSD_cents;
    let finalSaleUSD = product.salePriceUSD_cents || undefined;

    if (variantId && product.variants) {
      const v = (product.variants as any[]).find(v => v.id === variantId || v.sku === variantId);
      if (v) {
        // Use variant-specific base price if it exists, otherwise use product base price
        if (v.priceUSD_cents !== undefined && v.priceUSD_cents !== null) {
          finalBaseUSD = v.priceUSD_cents;
        }
        
        // Use variant-specific sale price if it exists. 
        // If it's explicitly null/undefined on the variant, it inherits the product-level sale price.
        if (v.salePriceUSD_cents !== undefined && v.salePriceUSD_cents !== null) {
          finalSaleUSD = v.salePriceUSD_cents;
        }
      }
    }

    // 2. Identify Item uniquely by Product + Variant
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (existingItemIndex >= 0) {
      const totalRequested = cart.items[existingItemIndex].quantity + quantity;
      if (variantStock < totalRequested) {
        this.logger.warn(`[addItem] Stock check failed for existing item ${productId}/${variantId}. Requested: ${totalRequested}, Available: ${variantStock}`);
        throw new Error(`Cannot add more. Only ${variantStock} items available in total.`);
      }
      cart.items[existingItemIndex].quantity = totalRequested;
      cart.items[existingItemIndex].customization = customization || cart.items[existingItemIndex].customization;
      cart.items[existingItemIndex].name = displayName;
      this.logger.debug(`[addItem] Updated quantity for existing item ${productId}/${variantId} to ${totalRequested}`);
    } else {
      // Check stock for new items
      if (variantStock < quantity) {
        this.logger.warn(`[addItem] Stock check failed for new item ${productId}/${variantId}. Requested: ${quantity}, Available: ${variantStock}`);
        throw new Error(`Cannot add. Only ${variantStock} items available.`);
      }
      cart.items.push({
        productId,
        variantId,
        selectedOptions,
        quantity,
        unitPriceUSD: finalBaseUSD,
        unitSalePriceUSD: finalSaleUSD,
        weightKG: product.weightKG || 0,
        exchangeRateUsed: '1',
        unitPriceFinal: 0,
        price: 0,
        customization: customization || {},
        name: displayName,
        image: variantImage,
      });
      this.logger.debug(`[addItem] Added new item ${productId}/${variantId} with quantity ${quantity}`);
    }
    return this.recalculateCart(sessionId, cart);
  }

  /**
   * Update item quantity
   */
  async updateQuantity(sessionId: string, productId: string, quantity: number, regionCode: string = 'US', variantId?: string): Promise<Cart> {
    this.logger.debug(`[updateQuantity] Updating cart ${sessionId}: Product ${productId}, Variant ${variantId || 'N/A'}, New Quantity ${quantity}`);
    const cart = await this.getCart(sessionId, regionCode);
    
    // Find item precisely by product + variant
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (itemIndex < 0) {
      this.logger.warn(`[updateQuantity] Item not found in cart ${sessionId}: ${productId}/${variantId}`);
      throw new Error('Item not in cart');
    }

    if (quantity <= 0) {
      this.logger.debug(`[updateQuantity] Removing item ${productId}/${variantId} from cart ${sessionId} due to quantity <= 0.`);
      cart.items.splice(itemIndex, 1);
    } else {
      const product = (await this.prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true }
      })) as any;

      if (!product) {
        this.logger.warn(`[updateQuantity] Product not found for ID: ${productId}`);
        throw new Error('Product not found');
      }

      // Validate against relevant stock (variant or product)
      const hasVariants = (product as any).hasVariants || false;
      let availableStock = product.stock;
      
      if (variantId && (product as any).variants) {
        const variant = ((product as any).variants as any[]).find(v => v.id === variantId || v.sku === variantId);
        if (variant) availableStock = variant.stock;
      } else if (hasVariants) {
          // This should ideally not happen if cart is consistent, but for safety:
          this.logger.warn(`[updateQuantity] Attempted to update base product ${productId} which has variants without specifying a variant.`);
          throw new Error('Selection requires a variant');
      }

      if (quantity > availableStock) {
        this.logger.warn(`[updateQuantity] Stock check failed for ${productId}/${variantId}. Requested: ${quantity}, Available: ${availableStock}`);
        throw new Error(`Only ${availableStock} items available`);
      }

      cart.items[itemIndex].quantity = quantity;
      this.logger.debug(`[updateQuantity] Updated quantity for ${productId}/${variantId} to ${quantity}`);
    }

    return this.recalculateCart(sessionId, cart);
  }

  /**
   * Recalculates all cart totals, prices, and shipping based on the current region.
   * Implements the Charge Currency Strategy Layer.
   */
  async recalculateCart(sessionId: string, cart: Cart): Promise<Cart> {
    this.logger.log(`[RECALC] Beginning for session ${sessionId}, region: ${cart.regionCode}`);
    
    let region = await this.regionService.getRegion(cart.regionCode);
    if (!region) {
      this.logger.warn(`[RECALC] Region ${cart.regionCode} not found, falling back to US.`);
      cart.regionCode = 'US';
      region = await this.regionService.getRegion('US');
    }
    
    if (!region) {
        this.logger.error(`[RECALC] CRITICAL: US region also missing from DB!`);
        throw new Error('Fallback region missing');
    }

    this.logger.debug(`[RECALC] Using region ${region.code} (${region.currency})`);

    const frozenRate = await this.currencyService.getRate(region.currency);
    
    // FAIL FAST: Ensure exchange rate is valid
    if (!frozenRate || isNaN(Number(frozenRate))) {
      this.logger.error(`[RECALC] Invalid exchange rate for ${region.currency}: ${frozenRate}`);
      throw new Error(`Invalid exchange rate for ${region.currency}: ${frozenRate}`);
    }

    cart.displayCurrency = region.currency;
    cart.exchangeRateUsed = frozenRate;

    const rateDec = new DecimalJS(frozenRate);
    let subtotalUSD_cents = 0;
    let totalWeightKg = 0;
    let displaySubtotal_cents = 0;

    for (const item of cart.items) {
      // ... (existing productId check and product fetch)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(item.productId);
      if (!isObjectId) {
        this.logger.warn(`[RECALC] Skipping malformed productId in cart: ${item.productId}`);
        continue;
      }

      const product = (await this.prisma.product.findUnique({ where: { id: item.productId } })) as any;
      if (!product) {
        this.logger.warn(`[RECALC] Product not found for ID: ${item.productId}. Removing from cart.`);
        // Optionally remove item from cart if product no longer exists
        cart.items = cart.items.filter(i => i.productId !== item.productId);
        continue;
      }

      // Track weight using snapshot (fallback to product for legacy items)
      const weightKG = item.weightKG ?? product.weightKG ?? 0;
      totalWeightKg += (weightKG * item.quantity);

      // 1. Get Base Pricing in regional cents (Using SNAPSHOT price)
      // PRIORITY: Sale Price Snapshot > Base Price Snapshot
      const unitBaseUSD = item.unitPriceUSD || product.basePriceUSD_cents;
      const unitSaleUSD = item.unitSalePriceUSD || undefined;
      const frozenUSD = unitSaleUSD || unitBaseUSD;
      
      const unitPriceFinalRegional = new DecimalJS(frozenUSD)
        .mul(rateDec)
        .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
        .toNumber();

      const unitBasePriceFinalRegional = new DecimalJS(unitBaseUSD)
        .mul(rateDec)
        .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
        .toNumber();
      
      // 2. Customization (USD cents -> Regional cents)
      const extraUSD_cents = Number(this.customizationService.calculateExtraCostUSD(item.customization, product.customizationOptions) || 0);
      const extraRegional_cents = new DecimalJS(extraUSD_cents)
        .mul(rateDec)
        .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
        .toNumber();

      item.unitPriceFinal = unitPriceFinalRegional + extraRegional_cents;
      item.unitBasePriceFinal = unitBasePriceFinalRegional + extraRegional_cents;
      item.price = Number(item.unitPriceFinal) * Number(item.quantity || 1);

      // Aggregate Display Subtotal
      displaySubtotal_cents += item.price;

      // Track USD canonical subtotal (Pure Integer Addition from SNAPSHOT)
      const lineSubtotalUSD = (frozenUSD + extraUSD_cents) * item.quantity;
      if (isNaN(lineSubtotalUSD)) {
          this.logger.error(`[RECALC] Line total is NaN for product ${product.id}`);
          throw new Error(`Line total is NaN for product ${product.id}`);
      }
      subtotalUSD_cents += lineSubtotalUSD;
    }

    // 3. Shipping (USD cents -> Regional cents)
    const baseShippingUSD_cents = Number(await this.shippingService.calculateShipping(cart.regionCode, totalWeightKg) || 0);
    cart.shippingCost = new DecimalJS(baseShippingUSD_cents)
      .mul(rateDec)
      .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
      .toNumber();
    this.logger.debug(`[RECALC] Calculated shipping cost: ${cart.shippingCost} cents for ${totalWeightKg}kg`);

    // 4. Update Cart Totals
    cart.displaySubtotal = displaySubtotal_cents;

    let discountRegional_cents = 0;
    if (cart.couponCode) {
      this.logger.debug(`[RECALC] Applying coupon ${cart.couponCode} to subtotal ${cart.displaySubtotal}`);
      const validation = await this.couponsService.validateCoupon(cart.couponCode, cart.displaySubtotal);
      if (validation.valid) {
        discountRegional_cents = validation.discount!;
        cart.discountAmount = discountRegional_cents;
        this.logger.debug(`[RECALC] Coupon ${cart.couponCode} applied. Discount: ${discountRegional_cents}`);
      } else {
        // Coupon no longer valid (e.g. min amount not met after item changes)
        this.logger.warn(`[RECALC] Coupon ${cart.couponCode} no longer valid: ${validation.error}. Removing from cart.`);
        cart.couponCode = undefined;
        cart.discountAmount = 0;
      }
    } else {
      cart.discountAmount = 0;
    }

    // 5. Final Grand Total
    // FIX: Apply discount to subtotal, then add shipping
    cart.displayTotal = cart.displaySubtotal - discountRegional_cents + cart.shippingCost;

    // 5. USD Canonical Base (Total cents)
    let canonicalTotalUSD_cents = subtotalUSD_cents + baseShippingUSD_cents;
    if (discountRegional_cents > 0) {
      const discountUSD_cents = new DecimalJS(discountRegional_cents)
        .div(rateDec)
        .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
        .toNumber();
      canonicalTotalUSD_cents -= discountUSD_cents;
    }

    // FAIL SAFE: Final NaN check
    if (isNaN(cart.displayTotal) || isNaN(cart.displaySubtotal)) {
        this.logger.error(`[RECALC] Final calculation resulted in NaN. Session: ${sessionId}`);
        throw new Error(`Final calculation resulted in NaN. Session: ${sessionId}`);
    }

    // 6. Charge Strategy (Unambiguous)
    const isSupported = this.currencyService.isStripeSupported(region.currency);
    this.logger.debug(`[RECALC] isStripeSupported(${region.currency}) = ${isSupported}`);
    
    if (isSupported) {
      cart.chargeCurrency = region.currency;
      cart.chargeTotal = cart.displayTotal;
    } else {
      cart.chargeCurrency = 'USD';
      cart.chargeTotal = canonicalTotalUSD_cents;
      this.logger.log(`[RECALC] [STRATEGY] Currency ${region.currency} unsupported. Falling back to USD: ${cart.chargeTotal} cents.`);
    }

    cart.updatedAt = new Date();
    
    // Audit Log for pinpointing NaN sources
    this.logger.log({
      type: 'RECALC_SUCCESS',
      sessionId,
      subtotalUSD_cents,
      displaySubtotal_cents: cart.displaySubtotal,
      displayTotal_cents: cart.displayTotal,
      exchangeRateUsed: cart.exchangeRateUsed,
      chargeTotal_cents: cart.chargeTotal,
      chargeCurrency: cart.chargeCurrency,
      itemsCount: cart.items.length
    });

    await this.redisService.setCart(sessionId, cart, this.CART_TTL);
    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeItem(sessionId: string, productId: string, regionCode: string = 'US', variantId?: string): Promise<Cart> {
    this.logger.debug(`[removeItem] Removing item from cart ${sessionId}: Product ${productId}, Variant ${variantId || 'N/A'}`);
    const cart = await this.getCart(sessionId, regionCode);
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    if (cart.items.length < initialItemCount) {
      this.logger.debug(`[removeItem] Item ${productId}/${variantId} removed from cart ${sessionId}.`);
    } else {
      this.logger.warn(`[removeItem] Item ${productId}/${variantId} not found in cart ${sessionId} to remove.`);
    }
    return this.recalculateCart(sessionId, cart);
  }

  /**
   * Clear entire cart
   */
  async clearCart(sessionId: string): Promise<void> {
    this.logger.log(`[clearCart] Clearing cart for session ${sessionId}`);
    await this.redisService.deleteCart(sessionId);
  }

  /**
   * Merge guest cart into user cart
   */
  async mergeCart(fromSessionId: string, toSessionId: string, regionCode: string = 'US'): Promise<Cart> {
    this.logger.log(`[mergeCart] Merging guest cart ${fromSessionId} into user cart ${toSessionId}`);
    const [guestCart, userCart] = await Promise.all([
      this.getCart(fromSessionId, regionCode),
      this.getCart(toSessionId, regionCode),
    ]);

    for (const guestItem of guestCart.items) {
      const existingIndex = userCart.items.findIndex(
        (item) => item.productId === guestItem.productId && item.variantId === guestItem.variantId
      );

      if (existingIndex >= 0) {
        userCart.items[existingIndex].quantity += guestItem.quantity;
        this.logger.debug(`[mergeCart] Merged item ${guestItem.productId}/${guestItem.variantId}: updated quantity to ${userCart.items[existingIndex].quantity}`);
      } else {
        userCart.items.push(guestItem);
        this.logger.debug(`[mergeCart] Merged item ${guestItem.productId}/${guestItem.variantId}: added as new item.`);
      }
    }

    // Use current session's region for merged cart
    return this.recalculateCart(toSessionId, userCart);
  }

  /**
   * Apply a coupon to the cart
   */
  async applyCoupon(sessionId: string, code: string, regionCode: string = 'US'): Promise<Cart> {
    const cart = await this.getCart(sessionId, regionCode);
    
    const validation = await this.couponsService.validateCoupon(code, cart.displayTotal);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid coupon code');
    }

    cart.couponCode = code;
    return this.recalculateCart(sessionId, cart);
  }

  /**
   * Remove a coupon from the cart
   */
  async removeCoupon(sessionId: string, regionCode: string = 'US'): Promise<Cart> {
    const cart = await this.getCart(sessionId, regionCode);
    cart.couponCode = undefined;
    cart.discountAmount = 0;
    return this.recalculateCart(sessionId, cart);
  }

  /**
   * Explicitly set cart region and recalculate
   */
  async setRegion(sessionId: string, regionCode: string): Promise<Cart> {
    const cart = await this.getCart(sessionId, regionCode);
    cart.regionCode = regionCode;
    return this.recalculateCart(sessionId, cart);
  }

  /**
   * Get cart total (Legacy compatible but returns full object)
   */
  getCartTotal(cart: Cart) {
    const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
    return { 
      itemCount, 
      shippingCost: cart.shippingCost, 
      total: cart.displayTotal,
      currency: cart.displayCurrency,
      chargeTotal: cart.chargeTotal,
      chargeCurrency: cart.chargeCurrency
    };
  }
}
