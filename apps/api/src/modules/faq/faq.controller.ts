import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  /**
   * PUBLIC: Get all published FAQs
   */
  @Get()
  findPublished() {
    return this.faqService.findPublished();
  }
}

/**
 * ADMIN FAQ CONTROLLER
 * All routes require admin authentication (to be added with guards)
 */
@Controller('admin/faq')
export class AdminFaqController {
  constructor(private readonly faqService: FaqService) {}

  /**
   * Create new FAQ
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  /**
   * Get all FAQs (including unpublished)
   */
  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  /**
   * Get single FAQ by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  /**
   * Update FAQ
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(id, updateFaqDto);
  }

  /**
   * Toggle published status
   */
  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  togglePublished(@Param('id') id: string) {
    return this.faqService.togglePublished(id);
  }

  /**
   * Reorder FAQs
   */
  @Patch('reorder')
  @HttpCode(HttpStatus.OK)
  reorder(@Body() reorderData: { id: string; order: number }[]) {
    return this.faqService.reorder(reorderData);
  }

  /**
   * Delete FAQ
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}
