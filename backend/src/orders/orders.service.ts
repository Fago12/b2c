import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { LockService } from '../common/services/lock.service';
import { PricingService } from '../common/pricing.service';
import { ShippingService } from '../commerce/shipping/shipping.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrencyService } from '../commerce/currency/currency.service';
import { RegionService } from '../commerce/region/region.service';
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
  ) {}

  async create(data: CreateOrderDto) {
    const { items, email, shippingAddress, userId, isCustomOrder, customerPhone } = data;

    // Acquire locks for all products in the order
    const productIds = items.map((item) => item.productId);
    const lockKey = `order:${productIds.sort().join(',')}`;

    try {
      return await this.lockService.withLock(
        lockKey,
        async () => {
          // 1. Verify availability and get base prices
          const products = (await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stock: true, basePriceUSD: true, customizationOptions: true, hasVariants: true, variants: true } as any,
          })) as any[];

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
          const regionCode = data.regionCode || 'US';
          const region = await this.regionService.getRegion(regionCode);
          if (!region) throw new HttpException(`Region ${regionCode} not found`, HttpStatus.NOT_FOUND);

          const frozenRate = await this.currencyService.getRate(region.currency);
          const rateDec = new DecimalJS(frozenRate);

          // Calculate total weight for shipping
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
            const unitPriceRegional_cents = await this.pricingService.calculateProductPrice(item.productId, item.customization);
            
            // Track USD canonical for charge fallback
            const unitPriceUSD_cents = product.basePriceUSD;
            const extraUSD_cents = item.customization ? unitPriceRegional_cents - unitPriceUSD_cents : 0; // Simple logic assuming regional pricing isn't used here yet (matching CartService)
            
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

          // 4. Display Totals (Regional cents)
          const displayTotalRegional_cents = new DecimalJS(canonicalTotalUSD_cents)
            .mul(rateDec)
            .toDecimalPlaces(0, DecimalJS.ROUND_HALF_UP)
            .toNumber();

          // 5. Charge Strategy
          const isSupported = this.currencyService.isStripeSupported(region.currency);
          const chargeCurrency = isSupported ? region.currency : 'USD';
          const chargeTotal_cents = isSupported ? displayTotalRegional_cents : canonicalTotalUSD_cents;

          // Process in transaction
          return this.prisma.$transaction(async (tx) => {
            // Decrement stock
            for (const item of items) {
              const product = (await tx.product.findUnique({
                where: { id: item.productId },
                select: { id: true, stock: true, variants: true, hasVariants: true } as any
              })) as any;

              if (!product) continue;

              if (item.variantId && product.variants && (product as any).hasVariants) {
                // Update ONLY variant stock
                const variants = (product.variants as any[]).map(v => {
                  if (v.id === item.variantId || v.sku === item.variantId) {
                    return { ...v, stock: Math.max(0, parseInt(v.stock?.toString() || '0') - item.quantity) };
                  }
                  return v;
                });

                await tx.product.update({
                  where: { id: item.productId },
                  data: { variants } as any,
                });
              } else {
                // Regular product stock decrement
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity } },
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
                shippingAddress,
                userId: finalUserId || null,
                isCustomOrder: isCustomOrder || false,
                customerPhone,
                
                // Snapshot Fields
                displayCurrency: region.currency,
                displayTotal: displayTotalRegional_cents,
                chargeCurrency,
                chargeTotal: chargeTotal_cents,

                // Legacy compatibility
                total: displayTotalRegional_cents,
                currency: region.currency,

                shippingCost: shippingCostRegional_cents,
                exchangeRateUsed: frozenRate,
                regionCode: regionCode,
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
    return this.prisma.order.findUnique({
        where: { id },
        include: { 
          items: { include: { product: true } }, 
          user: true 
        }
    });
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
          items: { include: { product: true } }, 
          user: true 
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { 
        items: { include: { product: true } }, 
        user: true 
      },
    });
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
      _sum: { total: true },
    });

    return {
      total,
      byStatus: { pending, paid, shipped, delivered, cancelled },
      revenue: revenue._sum.total || 0,
    };
  }
}
