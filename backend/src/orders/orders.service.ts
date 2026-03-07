import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { OrderStatus } from './types';
import { LockService } from '../common/services/lock.service';
import { PricingService } from '../common/pricing.service';
import { ShippingService } from '../commerce/shipping/shipping.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrencyService } from '../commerce/currency/currency.service';
import { RegionService } from '../commerce/region/region.service';
import { MailService } from '../mail/mail.service';
import { QueueService } from '../queues/queue.service';
import { CouponsService } from '../coupons/coupons.service';
import DecimalJS from 'decimal.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private lockService: LockService,
    private pricingService: PricingService,
    private shippingService: ShippingService,
    private currencyService: CurrencyService,
    private regionService: RegionService,
    private mailService: MailService,
    private queueService: QueueService,
    private couponsService: CouponsService,
  ) {}

  async create(data: CreateOrderDto) {
    const { items, email, shippingAddress, userId, isCustomOrder, customerPhone, couponCode } = data;

    // Acquire locks for all products in the order
    const productIds = items.map((item) => item.productId);
    const lockKey = `order:${productIds.sort().join(',')}`;

    this.logger.debug(`[CREATE ORDER] Acquiring lock for key: ${lockKey}`);
    try {
      const lockStartTime = Date.now();
      return await this.lockService.withLock(
        lockKey,
        async () => {
          this.logger.debug(`[CREATE ORDER] Lock acquired in ${Date.now() - lockStartTime}ms`);
          this.logger.debug(`[CREATE ORDER] Step 1: Verifying products... Keys: ${lockKey}`);
          const products = (await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stock: true, basePriceUSD_cents: true, customizationOptions: true, hasVariants: true, variants: { include: { color: true, pattern: true } } } as any,
          })) as any[];
          this.logger.debug(`[CREATE ORDER] Found ${products.length} products.`);

          for (const item of items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
              throw new HttpException(`Product ${item.productId} not found`, HttpStatus.NOT_FOUND);
            }
            
            let availableStock = product.stock;
            const hasVariants = (product as any).hasVariants || false;

            if (item.variantId && (product as any).variants) {
              const variant = ((product as any).variants as any[]).find(v => v.id === item.variantId || v.sku === item.variantId);
              if (variant) {
                availableStock = variant.stock;
              } else {
                throw new HttpException(`Variant ${item.variantId} not found for ${product.name}`, HttpStatus.BAD_REQUEST);
              }
            } else if (hasVariants) {
              throw new HttpException(`Selection requires a variant for ${product.name}`, HttpStatus.BAD_REQUEST);
            }

            if (availableStock < item.quantity) {
              throw new HttpException(
                `Insufficient stock for ${product.name}${item.variantId ? ` (${item.variantId})` : ''}`,
                HttpStatus.BAD_REQUEST,
              );
            }
          }

          // 2. Canonical Calculations (Integer cents)
          const regionCode = data.regionCode || (shippingAddress as any)?.country || 'US';
          const region = await this.regionService.getRegion(regionCode);
          if (!region) throw new HttpException(`Region ${regionCode} not found`, HttpStatus.NOT_FOUND);

          const frozenRate = await this.currencyService.getRate(region.currency);
          const rateDec = new DecimalJS(frozenRate);

          // Calculate total weight for shipping
          this.logger.debug(`[CREATE ORDER] Step 2: Calculations for region ${regionCode}...`);
          let totalWeightKg = 0;
          for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              totalWeightKg += (product.weightKG || 0) * item.quantity;
            }
          }

          // Shipping (USD cents -> Regional cents)
          const baseShippingUSD_cents = await this.shippingService.calculateShipping(
            shippingAddress.country,
            totalWeightKg,
          );
          const shippingCostRegional_cents = new DecimalJS(baseShippingUSD_cents)
            .mul(rateDec)
            .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
            .toNumber();
          
          let subtotalUSD_cents = 0;
          const orderItemsData: any[] = [];

          for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) continue;
            
            // Base price in regional cents via PricingService
            const unitPriceRegional_cents = await this.pricingService.calculateProductPrice(item.productId, item.customization, item.variantId);
            
            // Track USD canonical for charge fallback
            const unitPriceUSD_cents = product.basePriceUSD_cents;
            const extraUSD_cents = item.customization ? unitPriceRegional_cents - unitPriceUSD_cents : 0;
            
            // Wait, PricingService calculateProductPrice returns USD cents currently
            // Let's rely on that for now as the canonical USD source
            const itemPriceUSD_cents = unitPriceRegional_cents;

            orderItemsData.push({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceUSD: itemPriceUSD_cents,
              exchangeRateUsed: frozenRate,
              unitPriceFinal: new DecimalJS(itemPriceUSD_cents).mul(rateDec).toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP).toNumber(),
              weightKG: product.weightKG || 0,
              price: new DecimalJS(itemPriceUSD_cents).mul(rateDec).toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP).mul(item.quantity).toNumber(),
              customization: item.customization || {},
            });

            subtotalUSD_cents += itemPriceUSD_cents * item.quantity;
          }

          // 3. USD Canonical Base
          const canonicalTotalUSD_cents = subtotalUSD_cents + baseShippingUSD_cents;

          // 4. Regional Subtotal (Before Discount & Shipping)
          const displaySubtotalRegional_cents = new DecimalJS(subtotalUSD_cents)
            .mul(rateDec)
            .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
            .toNumber();

          const shippingRegional_cents = new DecimalJS(baseShippingUSD_cents)
            .mul(rateDec)
            .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
            .toNumber();

          let discountRegional_cents = 0;
          let displayTotalRegional_cents = displaySubtotalRegional_cents + shippingRegional_cents;
          let appliedCouponId: string | null = null;

          if (couponCode) {
            const validation = await this.couponsService.validateCoupon(couponCode, displaySubtotalRegional_cents);
            if (!validation.valid || !validation.coupon) {
              throw new HttpException(validation.error || 'Invalid coupon', HttpStatus.BAD_REQUEST);
            }
            discountRegional_cents = validation.discount!;
            displayTotalRegional_cents = displaySubtotalRegional_cents - discountRegional_cents + shippingRegional_cents;
            appliedCouponId = (validation.coupon as any).id;
          }

          // 5. Charge Strategy
          const isSupported = this.currencyService.isStripeSupported(region.currency);
          const chargeCurrency = isSupported ? region.currency : 'USD';
          
          // Calculate canonical USD total after discount
          const discountUSD_cents = couponCode ? new DecimalJS(discountRegional_cents)
            .div(rateDec)
            .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
            .toNumber() : 0;
          
          const totalUSD_cents = canonicalTotalUSD_cents - discountUSD_cents;

          let chargeTotal_cents = 0;
          if (isSupported) {
            chargeTotal_cents = displayTotalRegional_cents;
          } else {
            chargeTotal_cents = totalUSD_cents;
          }

          // Process in transaction
          this.logger.debug(`[CREATE ORDER] Step 6: Starting transaction...`);
          return this.prisma.$transaction(async (tx) => {
            this.logger.debug(`[CREATE ORDER] Inside transaction...`);
            // Decrement stock
            for (const item of items) {
              const product = (await tx.product.findUnique({
                where: { id: item.productId },
                select: { id: true, stock: true, variants: true, hasVariants: true } as any
              })) as any;

              if (!product) continue;

              if (item.variantId && (product as any).hasVariants) {
                // Find the specific variant to get its MongoDB ID if SKU was used
                const variant = ((product as any).variants as any[]).find(v => v.id === item.variantId || v.sku === item.variantId);
                
                if (variant) {
                  this.logger.debug(`[CREATE ORDER] Decrementing variant stock: ${variant.id || variant._id}`);
                  // Update ONLY variant stock directly
                  await tx.variant.update({
                    where: { id: variant.id || variant._id },
                    data: { stock: { decrement: item.quantity } },
                  });
                }
              } else {
                // Regular product stock decrement
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity } },
                });
              }

              // Increment coupon usage if applied
              if (appliedCouponId) {
                await tx.coupon.update({
                  where: { id: appliedCouponId },
                  data: { usedCount: { increment: 1 } },
                });
              }
            }

            // User linking
            let finalUserId = userId;
            if (!finalUserId && email) {
              const user = await tx.user.findUnique({ where: { email } });
              if (user) finalUserId = user.id;
            }

            // Create Order
            const order = await tx.order.create({
              data: {
                status: OrderStatus.PENDING,
                email,
                customerPhone: customerPhone || (shippingAddress as any)?.phone || null,
                
                // Persist names in address for easier extraction if not provided in top level
                shippingAddress: {
                  ...(typeof shippingAddress === 'object' ? shippingAddress : {}),
                  firstName: data.firstName || (shippingAddress as any)?.firstName,
                  lastName: data.lastName || (shippingAddress as any)?.lastName,
                },
                
                // Snapshot Fields
                displayCurrency: region.currency,
                displayTotal: displayTotalRegional_cents,
                chargeCurrency,
                chargeTotal: chargeTotal_cents,
                totalUSD: totalUSD_cents,

                // Legacy compatibility
                total: displayTotalRegional_cents,
                currency: region.currency,

                shippingCost: shippingCostRegional_cents,
                exchangeRateUsed: frozenRate,
                regionCode: regionCode,
                couponCode: couponCode || null,
                discountAmount: discountRegional_cents,
                items: {
                  create: orderItemsData.map((oid, idx) => ({
                    ...oid,
                    variantId: items[idx].variantId // Ensure variantId is persisted
                  })),
                },
              },
              include: { items: true },
            });

            this.logger.log(`Created order: ${order.id} (${chargeTotal_cents} ${chargeCurrency})`);
            this.logger.debug(`[CREATE ORDER] Transaction complete.`);
            return order;
          });
        },
        { duration: 5000 },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Order creation failed:', error);
      throw new HttpException('Order processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return this.prisma.order.findMany({
        include: { items: true, user: true }
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
        where: { id },
        include: { 
            items: { include: { product: true } }, 
            user: true,
            region: true
        }
    });

    if (!order) return null;

    const rate = parseFloat(order.exchangeRateUsed) || 1;
    const totalUSD = order.totalUSD || Math.round(order.total / rate);
    
    return {
      ...order,
      totalUSD,
      items: order.items.map(item => ({
        ...item,
        totalUSD: Math.round(item.price / rate)
      }))
    };
  }

  async attachGuestOrders(email: string, userId: string) {
    return this.prisma.order.updateMany({
      where: { email, userId: null },
      data: { userId },
    });
  }

  async findByUserId(userId: string, email?: string) {
    if (email) {
      // Just-in-time linking: attach any guest orders with this email to this user
      await this.attachGuestOrders(email, userId);
    }
    
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== ADMIN METHODS ====================

  async findAllAdmin(params: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
      ];

      if (isObjectId) {
        where.OR.push({ id: search });
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { 
          items: { 
            include: { 
              product: {
                include: { variants: true }
              } 
            } 
          }, 
          user: true 
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map(order => {
        const rate = parseFloat(order.exchangeRateUsed) || 1;
        const totalUSD = order.totalUSD || Math.round(order.total / rate);
        
        return {
          ...order,
          totalUSD,
          items: order.items.map(item => ({
            ...item,
            totalUSD: Math.round(item.price / rate)
          }))
        };
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: OrderStatus, metadata?: { carrier?: string; trackingNumber?: string }) {
    return this.updateOrderStatus(id, status, metadata);
  }

  /**
   * Centralized Order Status Update Logic
   * Handles timestamps, email triggers, and validation.
   */
  async updateOrderStatus(id: string, newStatus: OrderStatus, metadata?: { carrier?: string; trackingNumber?: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true },
    });

    if (!order) throw new HttpException('Order not found', HttpStatus.NOT_FOUND);

    const updateData: any = { status: newStatus };

    // 1. Set Timestamps and Metadata
    if (newStatus === OrderStatus.PAID) {
      updateData.paidAt = new Date();
    } else if (newStatus === OrderStatus.SHIPPED) {
      if (!metadata?.carrier || !metadata?.trackingNumber) {
        throw new HttpException('Carrier and Tracking Number are required for SHIPPED status.', HttpStatus.BAD_REQUEST);
      }
      updateData.shippedAt = new Date();
      updateData.carrier = metadata.carrier;
      updateData.trackingNumber = metadata.trackingNumber;
    } else if (newStatus === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { 
        items: { 
          include: { 
            product: {
              include: { variants: true }
            } 
          } 
        }, 
        user: true 
      },
    });

    // 2. Trigger Emails
    try {
      if (newStatus === OrderStatus.PAID) {
        const subtotal = updatedOrder.displayTotal - updatedOrder.shippingCost + (updatedOrder.discountAmount || 0);
        
        const addr = updatedOrder.shippingAddress as any;
        const firstName = addr.firstName || (updatedOrder.user as any)?.firstName || (updatedOrder as any).customerName?.split(' ')[0] || '';
        const lastName = addr.lastName || (updatedOrder.user as any)?.lastName || (updatedOrder as any).customerName?.split(' ').slice(1).join(' ') || '';

        await this.queueService.sendPurchaseReceipt(
          updatedOrder.email,
          updatedOrder.id,
          updatedOrder.displayTotal,
          updatedOrder.items.map(item => {
            const variant = (item.product as any).variants?.find(v => v.id === item.variantId || v.sku === item.variantId);
            const variantDetails = variant?.options ? 
              Object.entries(variant.options).map(([k, v]) => `${k}: ${v}`).join(', ') : 
              undefined;

            return {
              name: (item.product as any).name,
              quantity: item.quantity,
              price: item.unitPriceFinal,
              variantDetails,
              customization: item.customization
            };
          }),
          subtotal,
          updatedOrder.shippingCost,
          updatedOrder.discountAmount || 0,
          updatedOrder.displayCurrency,
          {
            firstName,
            lastName,
            phone: updatedOrder.customerPhone || addr.phone || addr.customerPhone || 'Not available',
            date: updatedOrder.createdAt.toLocaleDateString(),
            shippingAddress: {
              line1: addr.line1 || addr.address || '',
              city: addr.city || '',
              state: addr.state || '',
              country: addr.country || ''
            }
          }
        );
      } else if (newStatus === OrderStatus.SHIPPED) {
        await this.queueService.sendShippingNotification(updatedOrder);
      } else if (newStatus === OrderStatus.DELIVERED) {
        await this.queueService.sendDeliveryConfirmation(updatedOrder);
      }
    } catch (error) {
      this.logger.error(`Failed to send email for order ${id} status ${newStatus}:`, error);
      // Don't fail the transaction if email fails, but log it
    }

    return updatedOrder;
  }

  async getOrderStats() {
    const [total, pending, paid, shipped, delivered, cancelled] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.PAID } }),
      this.prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);

    const revenue = await this.prisma.order.aggregate({
      where: { status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } },
      _sum: { totalUSD: true },
    });

    return {
      total,
      byStatus: { pending, paid, shipped, delivered, cancelled },
      totalRevenue: revenue._sum.totalUSD || 0,
    };
  }
}
