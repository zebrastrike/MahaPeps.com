import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StacksService } from './stacks.service';
import { CreateStackDto, UpdateStackDto, AddStackItemDto } from './dto/create-stack.dto';

@Controller('admin/stacks')
export class AdminStacksController {
  constructor(private readonly stacksService: StacksService) {}

  @Get()
  findAll() {
    return this.stacksService.findAllAdmin();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.stacksService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStackDto) {
    return this.stacksService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStackDto) {
    return this.stacksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.stacksService.delete(id);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  addItem(@Param('id') id: string, @Body() dto: AddStackItemDto) {
    return this.stacksService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() data: { role?: string; sortOrder?: number },
  ) {
    return this.stacksService.updateItem(id, itemId, data);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.stacksService.removeItem(id, itemId);
  }
}
