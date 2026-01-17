import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { ShippoService } from '../orders/shippo.service';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly shippo: ShippoService,
  ) {}

  /**
   * Get shipping rates for address
   * POST /checkout/shipping-rates
   */
  @Post('shipping-rates')
  @UseGuards(JwtAuthGuard)
  async getShippingRates(
    @Body()
    body: {
      toAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
    },
  ) {
    return this.shippo.getShippingRates({
      toAddress: body.toAddress,
    });
  }

  /**
   * Checkout (convert cart to order with compliance)
   * POST /checkout
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async checkout(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      phone?: string;
      shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
      billingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
      shippingTier: 'standard' | 'priority' | 'express';
      shippingCost: number;
      orderInsurance?: boolean;
      processingType?: 'STANDARD' | 'EXPEDITED' | 'RUSH';
      compliance: {
        researchPurposeOnly: boolean;
        responsibilityAccepted: boolean;
        noMedicalAdvice: boolean;
        ageConfirmation: boolean;
        termsAccepted: boolean;
      };
    },
    @Req() request: Request,
  ) {
    const user = (request as any).user;
    const ipAddress =
      (request.headers['x-forwarded-for'] as string) || request.ip;
    const userAgent = request.headers['user-agent'];

    return this.checkoutService.checkout(user.id, body, ipAddress, userAgent);
  }

  /**
   * Get order by payment link token (public endpoint)
   * GET /checkout/payment/:token
   */
  @Get('payment/:token')
  async getPaymentOrder(@Param('token') token: string) {
    return this.checkoutService.getOrderByPaymentToken(token);
  }
}
