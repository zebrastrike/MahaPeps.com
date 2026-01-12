import { Injectable, Logger } from '@nestjs/common';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { EmailTemplatesService } from './email-templates.service';

interface Order {
  id: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  user: {
    email: string;
    name?: string;
  };
  items: Array<{
    product: {
      name: string;
    };
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private mailgunClient: any;
  private readonly isProduction: boolean;

  constructor(private readonly emailTemplatesService: EmailTemplatesService) {
    this.isProduction = process.env.NODE_ENV === 'production';

    if (process.env.MAILGUN_API_KEY && this.isProduction) {
      const mailgun = new Mailgun(formData);
      this.mailgunClient = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
      });
    } else {
      this.logger.warn('Mailgun not configured - emails will be logged only');
    }
  }

  getHealth(): string {
    return 'notifications-ok';
  }

  async sendInvoiceEmail(order: Order): Promise<void> {
    const template = this.generateInvoiceTemplate(order);
    const subject = `Order Confirmation #${order.id} - Payment Instructions`;

    try {
      if (this.isProduction && this.mailgunClient) {
        await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN!, {
          from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
          to: [order.user.email],
          subject,
          html: template,
        });
        this.logger.log(`Invoice email sent to ${order.user.email} for order ${order.id}`);
      } else {
        this.logger.log(`[DEV] Would send invoice email to ${order.user.email}`);
        this.logger.debug(`Subject: ${subject}`);
        this.logger.debug(`Body: ${template.substring(0, 200)}...`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send invoice email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendPaymentConfirmationEmail(order: Order): Promise<void> {
    const template = this.generatePaymentConfirmationTemplate(order);
    const subject = `Payment Confirmed - Order #${order.id}`;

    try {
      if (this.isProduction && this.mailgunClient) {
        await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN!, {
          from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
          to: [order.user.email],
          subject,
          html: template,
        });
        this.logger.log(`Payment confirmation sent to ${order.user.email}`);
      } else {
        this.logger.log(`[DEV] Would send payment confirmation to ${order.user.email}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send payment confirmation: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendShippingNotificationEmail(
    order: Order,
    trackingNumber: string,
    carrier: string,
  ): Promise<void> {
    const template = this.generateShippingNotificationTemplate(
      order,
      trackingNumber,
      carrier,
    );
    const subject = `Order Shipped - Order #${order.id}`;

    try {
      if (this.isProduction && this.mailgunClient) {
        await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN!, {
          from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
          to: [order.user.email],
          subject,
          html: template,
        });
        this.logger.log(`Shipping notification sent to ${order.user.email}`);
      } else {
        this.logger.log(`[DEV] Would send shipping notification to ${order.user.email}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send shipping notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendBackInStockEmail(params: {
    to: string;
    productName: string;
    productUrl: string;
  }): Promise<void> {
    const subject = `${params.productName} is back in stock`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0d9488; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .cta { display: inline-block; margin-top: 16px; background: #0d9488; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px; }
    .footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">Back in Stock</h1>
  </div>
  <div class="content">
    <p><strong>${params.productName}</strong> is now available for research ordering.</p>
    <p>
      <a class="cta" href="${params.productUrl}">View Product</a>
    </p>
    <div class="footer">
      <p><strong>Research Use Only</strong> - Not for human or veterinary consumption.</p>
      <p>This email contains research material availability information only.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      if (this.isProduction && this.mailgunClient) {
        await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN!, {
          from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
          to: [params.to],
          subject,
          html,
        });
        this.logger.log(`Stock email sent to ${params.to}`);
      } else {
        this.logger.log(`[DEV] Would send back-in-stock email to ${params.to}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send stock email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send payment verified email using EmailTemplatesService
   */
  async sendPaymentVerifiedEmail(params: {
    orderId: string;
    customerEmail: string;
    orderTotal: string;
  }): Promise<void> {
    const { subject, html } = this.emailTemplatesService.getPaymentVerifiedEmail(params);
    await this.sendEmail({
      to: params.customerEmail,
      subject,
      html,
    });
  }

  /**
   * Generic email sending method (used with EmailTemplatesService)
   */
  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      if (this.isProduction && this.mailgunClient) {
        await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN!, {
          from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
          to: [params.to],
          subject: params.subject,
          html: params.html,
        });
        this.logger.log(`Email sent to ${params.to}: ${params.subject}`);
      } else {
        this.logger.log(`[DEV] Would send email to ${params.to}`);
        this.logger.debug(`Subject: ${params.subject}`);
        this.logger.debug(`Body preview: ${params.html.substring(0, 200)}...`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  private generateInvoiceTemplate(order: Order): string {
    const zelleId = process.env.ZELLE_ID || 'payments@mahapeptides.com';
    const cashAppTag = process.env.CASHAPP_TAG || '$MahaPeptides';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0d9488; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .section h2 { margin-top: 0; color: #0d9488; font-size: 18px; }
    .payment-option { background: #f0fdfa; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #0d9488; }
    .code { background: #1f2937; color: #10b981; padding: 8px 12px; border-radius: 4px; font-family: monospace; display: inline-block; }
    .important { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .order-summary { width: 100%; border-collapse: collapse; }
    .order-summary td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .order-summary .total { font-weight: bold; font-size: 18px; color: #0d9488; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">MAHA Peptides</h1>
    <p style="margin: 10px 0 0 0;">Order Confirmation</p>
  </div>

  <div class="content">
    <div class="section">
      <h2>Order #${order.id}</h2>
      <p>Thank you for your order. Your order has been received and is awaiting payment.</p>
    </div>

    <div class="section">
      <h2>Order Summary</h2>
      <table class="order-summary">
        ${order.items
          .map(
            (item) => `
          <tr>
            <td>${item.product.name} (x${item.quantity})</td>
            <td style="text-align: right;">$${item.lineTotal.toFixed(2)}</td>
          </tr>
        `,
          )
          .join('')}
        <tr>
          <td>Subtotal</td>
          <td style="text-align: right;">$${order.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Tax</td>
          <td style="text-align: right;">$${order.tax.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Shipping</td>
          <td style="text-align: right;">$${order.shipping.toFixed(2)}</td>
        </tr>
        <tr class="total">
          <td>Total</td>
          <td style="text-align: right;">$${order.total.toFixed(2)} USD</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <h2>Payment Instructions</h2>
      <p>Please send payment using one of the following methods:</p>

      <div class="payment-option">
        <h3 style="margin-top: 0; color: #0d9488;">Option 1: Zelle (Recommended)</h3>
        <p><strong>Zelle ID:</strong> <span class="code">${zelleId}</span></p>
        <p><strong>Amount:</strong> <span class="code">$${order.total.toFixed(2)}</span></p>
        <p><strong>Payment Note:</strong> <span class="code">Order #${order.id}</span></p>
      </div>

      <div class="payment-option">
        <h3 style="margin-top: 0; color: #0d9488;">Option 2: CashApp</h3>
        <p><strong>CashApp Tag:</strong> <span class="code">${cashAppTag}</span></p>
        <p><strong>Amount:</strong> <span class="code">$${order.total.toFixed(2)}</span></p>
        <p><strong>Payment Note:</strong> <span class="code">Order #${order.id}</span></p>
      </div>

      <div class="important">
        <p style="margin: 0;"><strong>Important:</strong></p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Include your order number (#${order.id}) in the payment note</li>
          <li>Payment must be received within 48 hours</li>
          <li>You'll receive a confirmation email once payment is verified</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p style="font-size: 11px; color: #9ca3af; line-height: 1.4;">
        <strong>Research Use Only</strong><br>
        All products are sold strictly for research, laboratory, or analytical purposes only.<br>
        Products are not intended for human or veterinary consumption.
      </p>
      <p style="margin-top: 15px;">
        Questions? Contact us at ${process.env.MAILGUN_FROM_EMAIL}
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private generatePaymentConfirmationTemplate(order: Order): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .success { background: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">Payment Confirmed</h1>
  </div>
  <div class="content">
    <div class="success">
      <h2 style="margin-top: 0; color: #059669;">Payment Received!</h2>
      <p>We've confirmed your payment of <strong>$${order.total.toFixed(2)}</strong> for Order #${order.id}.</p>
      <p>Your order is now being processed and will ship within 1-2 business days.</p>
    </div>
    <p>You'll receive another email with tracking information once your order ships.</p>
    <p style="margin-top: 30px; color: #6b7280;">Thank you for choosing MAHA Peptides!</p>
  </div>
</body>
</html>
    `.trim();
  }

  private generateShippingNotificationTemplate(
    order: Order,
    trackingNumber: string,
    carrier: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0d9488; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .tracking { background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .tracking-number { font-size: 24px; font-weight: bold; color: #0d9488; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">Order Shipped!</h1>
  </div>
  <div class="content">
    <p>Great news! Your order #${order.id} has shipped.</p>
    <div class="tracking">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Tracking Number:</p>
      <div class="tracking-number">${trackingNumber}</div>
      <p style="margin: 15px 0 0 0; color: #6b7280;">Carrier: ${carrier}</p>
    </div>
    <p>Your order should arrive within 3-5 business days.</p>
    <p style="margin-top: 30px; color: #6b7280;">Thank you for your business!</p>
  </div>
</body>
</html>
    `.trim();
  }
}
