import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'dispute_opened';

export interface PaymentOrderInput {
  id: string;
  amount: number;
  currency: string;
  cardToken: string;
}

export interface PaymentProcessorWebhookPayload {
  event: 'payment_succeeded' | 'payment_failed' | 'dispute_opened';
  data: {
    payment_id: string;
    status?: PaymentStatus;
    risk_score?: number;
    order_id?: string;
  };
}

export interface PaymentResult {
  paymentId: string;
  status: PaymentStatus;
  riskScore?: number;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  /**
   * Creates a payment charge with the high-risk processor using only tokenized card data.
   * Real credentials should be provided through environment variables such as:
   * - HIGH_RISK_PAYMENTS_API_KEY
   * - HIGH_RISK_PAYMENTS_API_SECRET
   */
  async createCharge(order: PaymentOrderInput): Promise<PaymentResult> {
    const payload = {
      amount: order.amount,
      currency: order.currency,
      card_token: order.cardToken,
      order_id: order.id,
    };

    this.logger.debug('Dispatching payment payload to processor', {
      orderId: order.id,
      payload: { ...payload, card_token: '[REDACTED]' },
    });

    // In a real implementation, you would call the processor SDK/HTTP API here,
    // authenticating with HIGH_RISK_PAYMENTS_API_KEY and HIGH_RISK_PAYMENTS_API_SECRET.
    // The stub below simulates a processor response without persisting card data.
    const processorResponse = {
      payment_id: `pay_${randomUUID()}`,
      status: 'pending' as PaymentStatus,
      risk_score: undefined as number | undefined,
    };

    return {
      paymentId: processorResponse.payment_id,
      status: processorResponse.status,
      riskScore: processorResponse.risk_score,
    };
  }

  /**
   * Normalizes processor webhooks so the application can react to payment lifecycle events.
   */
  handleWebhook(payload: PaymentProcessorWebhookPayload): PaymentResult {
    const { event, data } = payload;
    const statusByEvent: Record<PaymentProcessorWebhookPayload['event'], PaymentStatus> = {
      payment_failed: 'failed',
      payment_succeeded: 'succeeded',
      dispute_opened: 'dispute_opened',
    };

    const status = statusByEvent[event];

    this.logger.log(`Received payment webhook: ${event}`, {
      paymentId: data.payment_id,
      orderId: data.order_id,
      status,
      riskScore: data.risk_score,
    });

    return {
      paymentId: data.payment_id,
      status,
      riskScore: data.risk_score,
    };
  }
}
