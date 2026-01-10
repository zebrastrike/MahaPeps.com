import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { KycService } from './kyc.service';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('status')
  async getStatus(@Req() request: any) {
    if (!request?.user?.id) {
      throw new BadRequestException('User not available');
    }
    return this.kycService.getStatus(request.user.id);
  }

  @Post('submit')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'businessLicense', maxCount: 1 },
      { name: 'taxId', maxCount: 1 },
      { name: 'officerId', maxCount: 1 },
      { name: 'facilityLicense', maxCount: 1 },
      { name: 'addressProof', maxCount: 1 },
    ]),
  )
  async submitKyc(@Req() request: any, @Body() _body: any) {
    if (!request?.user?.id) {
      throw new BadRequestException('User not available');
    }

    const files = request.files || {};
    return this.kycService.submitKyc(request.user.id, files);
  }
}
