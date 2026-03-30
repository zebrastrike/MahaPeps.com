import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { StacksController } from './stacks.controller';
import { AdminStacksController } from './admin-stacks.controller';
import { StacksService } from './stacks.service';

@Module({
  imports: [PrismaModule],
  controllers: [StacksController, AdminStacksController],
  providers: [StacksService],
  exports: [StacksService],
})
export class StacksModule {}
