import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: Prisma.CategoryCreateInput) {
    try {
      return await this.prisma.category.create({ data: createCategoryDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Category with slug "${createCategoryDto.slug}" already exists`);
      }
      throw error;
    }
  }

  findAll(isActive?: boolean) {
    const where: Prisma.CategoryWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    return this.prisma.category.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async update(id: string, updateCategoryDto: Prisma.CategoryUpdateInput) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Category with slug "${updateCategoryDto.slug}" already exists`);
      }
      throw error;
    }
  }

  remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
