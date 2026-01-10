import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { FileStorageService } from './file-storage.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
  ) {}

  /**
   * Serve uploaded files (COAs, MSDSs, etc.)
   * GET /files/uploads/:folder/:filename
   */
  @Get('uploads/:folder/:filename')
  async serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const storageKey = `${folder}/${filename}`;
    const file = await this.prisma.file.findFirst({
      where: { storageKey },
      select: { id: true },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const url = await this.fileStorage.getSignedDownloadUrl(file.id, 86400);
    return res.redirect(url);
  }

  /**
   * Get a signed download URL by file id
   * GET /files/:fileId
   */
  @Get(':fileId')
  async getFile(@Param('fileId') fileId: string) {
    const url = await this.fileStorage.getSignedDownloadUrl(fileId, 86400);
    return { url };
  }
}
