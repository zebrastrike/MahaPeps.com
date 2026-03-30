import { Controller, Get, Param } from '@nestjs/common';
import { StacksService } from './stacks.service';

@Controller('stacks')
export class StacksController {
  constructor(private readonly stacksService: StacksService) {}

  @Get()
  findAll() {
    return this.stacksService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.stacksService.findBySlug(slug);
  }
}
