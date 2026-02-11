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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const totalRevenue = await this.prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { not: 'CANCELLED' } },
        });
        const todayRevenue = await this.prisma.order.aggregate({
            _sum: { total: true },
            where: {
                status: { not: 'CANCELLED' },
                createdAt: { gte: today }
            },
        });
        const yesterdayRevenue = await this.prisma.order.aggregate({
            _sum: { total: true },
            where: {
                status: { not: 'CANCELLED' },
                createdAt: { gte: yesterday, lt: today }
            },
        });
        const totalOrders = await this.prisma.order.count();
        const todayOrders = await this.prisma.order.count({
            where: { createdAt: { gte: today } }
        });
        const yesterdayOrders = await this.prisma.order.count({
            where: { createdAt: { gte: yesterday, lt: today } }
        });
        const totalCustomers = await this.prisma.user.count({
            where: { role: 'CUSTOMER' }
        });
        const revenueChange = this.calculatePercentageChange(todayRevenue._sum.total || 0, yesterdayRevenue._sum.total || 0);
        const ordersChange = this.calculatePercentageChange(todayOrders, yesterdayOrders);
        return {
            revenue: {
                total: totalRevenue._sum.total || 0,
                today: todayRevenue._sum.total || 0,
                change: revenueChange
            },
            orders: {
                total: totalOrders,
                today: todayOrders,
                change: ordersChange
            },
            customers: {
                total: totalCustomers,
                change: 0
            }
        };
    }
    async getSalesChart(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: { gte: startDate },
                status: { not: 'CANCELLED' }
            },
            select: {
                createdAt: true,
                total: true
            }
        });
        const grouped = new Map();
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            grouped.set(dateStr, 0);
        }
        orders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            const current = grouped.get(dateStr) || 0;
            grouped.set(dateStr, current + order.total);
        });
        return Array.from(grouped.entries()).map(([date, amount]) => ({
            date,
            amount
        }));
    }
    calculatePercentageChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map