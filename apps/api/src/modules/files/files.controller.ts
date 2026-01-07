import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';

@Controller('files')
export class FilesController {
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
    try {
      const filePath = path.join(process.cwd(), 'uploads', folder, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new NotFoundException('File not found');
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

      // Stream the file
      res.sendFile(filePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
