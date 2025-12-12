import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentService, PaymentOrderInput, PaymentProcessorWebhookPayload } from './payment.service';

interface CheckoutPaymentDto {
  amount: number;
  currency: string;
  cardToken: string;
}

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout/:orderId/pay')
  async payForOrder(
    @Param('orderId') orderId: string,
    @Body() payload: CheckoutPaymentDto,
  ) {
    const order: PaymentOrderInput = {
      id: orderId,
      amount: payload.amount,
      currency: payload.currency,
      cardToken: payload.cardToken,
    };

    return this.paymentService.createCharge(order);
  }

  @Post('webhooks/payments')
  handlePaymentWebhook(@Body() payload: PaymentProcessorWebhookPayload) {
    return this.paymentService.handleWebhook(payload);
  }
}
