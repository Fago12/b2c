import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cmsPage.findMany();
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { slug },
    });
    if (!page) throw new NotFoundException(`Page with slug ${slug} not found`);
    return page;
  }

  async create(data: { slug: string; title: string; content: string; isActive?: boolean }) {
    return this.prisma.cmsPage.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.cmsPage.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.cmsPage.delete({
      where: { id },
    });
  }
}
