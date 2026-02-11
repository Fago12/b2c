import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { LockService } from '../common/services/lock.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private lockService: LockService,
  ) {}

  async create(data: any) {
    const { items, total, email, shippingAddress, userId } = data;

    // Acquire locks for all products in the order
    // This prevents race conditions when multiple users order the same product
    const productIds = items.map((item: any) => item.productId);
    const lockKey = `order:${productIds.sort().join(',')}`;

    try {
      return await this.lockService.withLock(
        lockKey,
        async () => {
          // Verify stock availability within the lock
          const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stock: true },
          });

          for (const item of items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
              throw new HttpException(
                `Product ${item.productId} not found`,
                HttpStatus.NOT_FOUND,
              );
            }
            if (product.stock < item.quantity) {
              throw new HttpException(
                `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                HttpStatus.BAD_REQUEST,
              );
            }
          }

          // Decrement stock and create order in a transaction
          return this.prisma.$transaction(async (tx) => {
            // Decrement stock for each product
            for (const item of items) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              });
            }

            // Create the order
            const order = await tx.order.create({
              data: {
                total,
                email,
                shippingAddress: shippingAddress,
                status: 'PENDING',
                userId: userId || null,
                items: {
                  create: items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                },
              },
              include: {
                items: true,
              },
            });
            console.log('[OrdersService] Created order:', order);
            return order;
          });
        },
        { duration: 5000 }, // 5 second lock
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Order creation failed:', error);
      throw new HttpException(
        'Unable to process order. Please try again.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
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

  async findByUserId(userId: string) {
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
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
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
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'PAID' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
    ]);

    const revenue = await this.prisma.order.aggregate({
      where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
      _sum: { total: true },
    });

    return {
      total,
      byStatus: { pending, paid, shipped, delivered, cancelled },
      revenue: revenue._sum.total || 0,
    };
  }
}

