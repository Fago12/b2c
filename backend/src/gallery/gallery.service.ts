import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GalleryItemType } from '@prisma/client';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async findAll(tag?: string) {
    return this.prisma.galleryItem.findMany({
      where: {
        isActive: true,
        tag: tag || undefined,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async create(data: { type: GalleryItemType; url: string; tag?: string; displayOrder?: number }) {
    return this.prisma.galleryItem.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.galleryItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.galleryItem.delete({ where: { id } });
  }
}
