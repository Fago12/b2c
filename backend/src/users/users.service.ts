import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    console.log('UsersService.create called with:', data.email);
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(data.password || '', salt);
        
        // Filter out unknown fields (like firstName, lastName) that are not in the schema
        const { email, role, avatar, verificationToken } = data as any;

        const user = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role,
            avatar,
            verificationToken,
            isVerified: false, 
          },
        });
        console.log('UsersService.create success:', user.id);
        return user;
    } catch (error) {
        console.error('UsersService.create error:', error);
        throw error;
    }
  }

  async verifyUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true, verificationToken: null },
    });
  }

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async setResetToken(email: string, token: string, expires: Date) {
    return this.prisma.user.update({
        where: { email },
        data: { resetToken: token, resetTokenExpires: expires },
    });
  }

  async updatePassword(id: string, password: string) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update User table
    const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword, resetToken: null, resetTokenExpires: null },
    });

    // Also sync password to Better Auth Account table
    await this.prisma.account.updateMany({
        where: { userId: id, providerId: 'credential' },
        data: { password: hashedPassword },
    });

    return updatedUser;
}
  // ==================== ADMIN METHODS ====================

  async findAllAdmin(params: {
    search?: string;
    role?: Role;
    page?: number;
    limit?: number;
  }) {
    const { search, role, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: true },
        },
      },
    });
  }

  async updateRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  }

  async getTeamMembers() {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCustomerStats() {
    const [total, admins, customers, verified, unverified] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { isVerified: true } }),
      this.prisma.user.count({ where: { isVerified: false } }),
    ]);

    return { total, admins, customers, verified, unverified };
  }
}

