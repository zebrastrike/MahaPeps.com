import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesController } from './files.controller';
import { FileStorageService } from './file-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FilesModule {}
