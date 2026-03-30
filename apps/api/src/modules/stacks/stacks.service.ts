import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStackDto, UpdateStackDto, AddStackItemDto } from './dto/create-stack.dto';

@Injectable()
export class StacksService {
  private readonly logger = new Logger(StacksService.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly includeItems = {
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            imageUrl: true,
            category: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' as const },
    },
  };

  async findAll() {
    return this.prisma.stack.findMany({
      where: { isActive: true },
      include: this.includeItems,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAllAdmin() {
    return this.prisma.stack.findMany({
      include: {
        ...this.includeItems,
        _count: { select: { items: true } },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findBySlug(slug: string) {
    const stack = await this.prisma.stack.findUnique({
      where: { slug },
      include: this.includeItems,
    });
    if (!stack) throw new NotFoundException(`Stack "${slug}" not found`);
    return stack;
  }

  async findById(id: string) {
    const stack = await this.prisma.stack.findUnique({
      where: { id },
      include: this.includeItems,
    });
    if (!stack) throw new NotFoundException(`Stack not found`);
    return stack;
  }

  async create(dto: CreateStackDto) {
    const existing = await this.prisma.stack.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Stack with slug "${dto.slug}" already exists`);

    const stack = await this.prisma.stack.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        tagline: dto.tagline,
        description: dto.description,
        focus: dto.focus,
        imageUrl: dto.imageUrl,
        priceCents: dto.priceCents,
        savingsPercent: dto.savingsPercent ?? 10,
        isActive: dto.isActive ?? true,
        isPopular: dto.isPopular ?? false,
        displayOrder: dto.displayOrder ?? 0,
      },
      include: this.includeItems,
    });

    this.logger.log(`Created stack: ${stack.name} (${stack.id})`);
    return stack;
  }

  async update(id: string, dto: UpdateStackDto) {
    await this.findById(id);

    if (dto.slug) {
      const existing = await this.prisma.stack.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existing) throw new ConflictException(`Slug "${dto.slug}" is already in use`);
    }

    const stack = await this.prisma.stack.update({
      where: { id },
      data: dto,
      include: this.includeItems,
    });

    this.logger.log(`Updated stack: ${stack.name} (${stack.id})`);
    return stack;
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.stack.delete({ where: { id } });
    this.logger.log(`Deleted stack: ${id}`);
    return { success: true };
  }

  async addItem(stackId: string, dto: AddStackItemDto) {
    await this.findById(stackId);

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product not found`);

    const existing = await this.prisma.stackItem.findUnique({
      where: { stackId_productId: { stackId, productId: dto.productId } },
    });
    if (existing) throw new ConflictException(`Product already in this stack`);

    await this.prisma.stackItem.create({
      data: {
        stackId,
        productId: dto.productId,
        role: dto.role,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    this.logger.log(`Added product ${product.name} to stack ${stackId}`);
    return this.findById(stackId);
  }

  async removeItem(stackId: string, itemId: string) {
    const item = await this.prisma.stackItem.findFirst({
      where: { id: itemId, stackId },
    });
    if (!item) throw new NotFoundException(`Stack item not found`);

    await this.prisma.stackItem.delete({ where: { id: itemId } });
    this.logger.log(`Removed item ${itemId} from stack ${stackId}`);
    return this.findById(stackId);
  }

  async updateItem(stackId: string, itemId: string, data: { role?: string; sortOrder?: number }) {
    const item = await this.prisma.stackItem.findFirst({
      where: { id: itemId, stackId },
    });
    if (!item) throw new NotFoundException(`Stack item not found`);

    await this.prisma.stackItem.update({
      where: { id: itemId },
      data,
    });

    return this.findById(stackId);
  }
}
