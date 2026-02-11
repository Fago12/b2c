import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 1. Revenue
    const totalRevenue = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } }, // Assuming we count pending/paid
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

    // 2. Orders
    const totalOrders = await this.prisma.order.count();
    const todayOrders = await this.prisma.order.count({
        where: { createdAt: { gte: today } }
    });
    const yesterdayOrders = await this.prisma.order.count({
        where: { createdAt: { gte: yesterday, lt: today } }
    });

    // 3. Customers
    const totalCustomers = await this.prisma.user.count({
        where: { role: 'CUSTOMER' }
    });
    
    // Calculate percentage changes
    const revenueChange = this.calculatePercentageChange(
        todayRevenue._sum.total || 0, 
        yesterdayRevenue._sum.total || 0
    );
    
    const ordersChange = this.calculatePercentageChange(
        todayOrders,
        yesterdayOrders
    );

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
            change: 0 // simplifying for now
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

    // Group by date
    const grouped = new Map<string, number>();
    
    // Initialize all days with 0
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

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }
}
