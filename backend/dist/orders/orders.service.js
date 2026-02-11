"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const lock_service_1 = require("../common/services/lock.service");
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    lockService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, lockService) {
        this.prisma = prisma;
        this.lockService = lockService;
    }
    async create(data) {
        const { items, total, email, shippingAddress, userId } = data;
        const productIds = items.map((item) => item.productId);
        const lockKey = `order:${productIds.sort().join(',')}`;
        try {
            return await this.lockService.withLock(lockKey, async () => {
                const products = await this.prisma.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, name: true, stock: true },
                });
                for (const item of items) {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) {
                        throw new common_1.HttpException(`Product ${item.productId} not found`, common_1.HttpStatus.NOT_FOUND);
                    }
                    if (product.stock < item.quantity) {
                        throw new common_1.HttpException(`Insufficient stock for ${product.name}. Available: ${product.stock}`, common_1.HttpStatus.BAD_REQUEST);
                    }
                }
                return this.prisma.$transaction(async (tx) => {
                    for (const item of items) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: item.quantity } },
                        });
                    }
                    const order = await tx.order.create({
                        data: {
                            total,
                            email,
                            shippingAddress: shippingAddress,
                            status: 'PENDING',
                            userId: userId || null,
                            items: {
                                create: items.map((item) => ({
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
            }, { duration: 5000 });
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Order creation failed:', error);
            throw new common_1.HttpException('Unable to process order. Please try again.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async findAll() {
        return this.prisma.order.findMany({
            include: { items: true, user: true }
        });
    }
    async findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                user: true
            }
        });
    }
    async attachGuestOrders(email, userId) {
        return this.prisma.order.updateMany({
            where: { email, userId: null },
            data: { userId },
        });
    }
    async findByUserId(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllAdmin(params) {
        const { status, search, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {};
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
    async updateStatus(id, status) {
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        lock_service_1.LockService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map