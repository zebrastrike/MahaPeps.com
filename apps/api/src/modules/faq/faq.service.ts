import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new FAQ
   */
  async create(createFaqDto: CreateFaqDto) {
    this.logger.log(`Creating new FAQ: ${createFaqDto.question.substring(0, 50)}...`);

    return this.prisma.faq.create({
      data: {
        question: createFaqDto.question,
        answer: createFaqDto.answer,
        order: createFaqDto.order ?? 0,
        isPublished: createFaqDto.isPublished ?? false,
      },
    });
  }

  /**
   * Get all FAQs (admin)
   */
  async findAll() {
    return this.prisma.faq.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get published FAQs only (public)
   */
  async findPublished() {
    return this.prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        question: true,
        answer: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get single FAQ by ID
   */
  async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    return faq;
  }

  /**
   * Update FAQ
   */
  async update(id: string, updateFaqDto: UpdateFaqDto) {
    // Check if FAQ exists
    await this.findOne(id);

    this.logger.log(`Updating FAQ ${id}`);

    return this.prisma.faq.update({
      where: { id },
      data: updateFaqDto,
    });
  }

  /**
   * Toggle published status
   */
  async togglePublished(id: string) {
    const faq = await this.findOne(id);

    this.logger.log(`Toggling published status for FAQ ${id}: ${!faq.isPublished}`);

    return this.prisma.faq.update({
      where: { id },
      data: { isPublished: !faq.isPublished },
    });
  }

  /**
   * Reorder FAQs
   */
  async reorder(reorderData: { id: string; order: number }[]) {
    this.logger.log(`Reordering ${reorderData.length} FAQs`);

    // Use transaction to update all orders atomically
    await this.prisma.$transaction(
      reorderData.map(({ id, order }) =>
        this.prisma.faq.update({
          where: { id },
          data: { order },
        })
      )
    );

    return { success: true, message: 'FAQs reordered successfully' };
  }

  /**
   * Delete FAQ
   */
  async remove(id: string) {
    // Check if FAQ exists
    await this.findOne(id);

    this.logger.log(`Deleting FAQ ${id}`);

    await this.prisma.faq.delete({
      where: { id },
    });

    return { success: true, message: 'FAQ deleted successfully' };
  }
}
