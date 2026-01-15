import { Injectable, Logger } from '@nestjs/common';

/**
 * MAHA Peptides Branded Email Templates
 * All templates include required compliance disclaimers
 */
@Injectable()
export class EmailTemplatesService {
  private readonly logger = new Logger(EmailTemplatesService.name);

  // Brand colors matching the website
  private readonly brandColors = {
    primary: '#dc2626',      // Red accent
    primaryDark: '#991b1b',
    secondary: '#1e3a5f',    // Deep blue
    charcoal: '#1a1a2e',     // Dark background
    charcoalLight: '#2d2d44',
    white: '#ffffff',
    gray: '#9ca3af',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  /**
   * Branded email header with logo
   */
  private getBrandedHeader(): string {
    return `
      <div style="background: linear-gradient(135deg, ${this.brandColors.charcoal} 0%, ${this.brandColors.charcoalLight} 100%); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <div style="margin-bottom: 16px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 2px;">
            <span style="color: ${this.brandColors.white};">MAHA</span>
            <span style="color: ${this.brandColors.primary};"> PEPTIDES</span>
          </h1>
        </div>
        <p style="margin: 0; color: ${this.brandColors.gray}; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
          American-Made Research Peptides • 99%+ Purity
        </p>
      </div>
    `;
  }

  /**
   * Footer with required compliance disclaimers
   */
  private getComplianceFooter(): string {
    return `
      <div style="margin-top: 40px; padding: 24px; background-color: ${this.brandColors.charcoal}; border-radius: 0 0 8px 8px;">
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid ${this.brandColors.charcoalLight};">
          <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">
            <span style="color: ${this.brandColors.white};">MAHA</span>
            <span style="color: ${this.brandColors.primary};"> PEPTIDES</span>
          </h2>
          <p style="margin: 0; color: ${this.brandColors.gray}; font-size: 12px;">
            Premium Research Materials | Made in America
          </p>
        </div>

        <div style="font-size: 11px; color: ${this.brandColors.gray}; line-height: 1.6;">
          <p style="margin-bottom: 12px; padding: 12px; background-color: ${this.brandColors.charcoalLight}; border-radius: 4px; border-left: 3px solid ${this.brandColors.primary};">
            <strong style="color: ${this.brandColors.white};">⚗️ RESEARCH USE ONLY</strong><br>
            All products sold on this platform are intended solely for lawful laboratory research and analytical use. Not for human or veterinary consumption.
          </p>

          <p style="margin-bottom: 12px; padding: 12px; background-color: ${this.brandColors.charcoalLight}; border-radius: 4px;">
            <strong style="color: ${this.brandColors.white};">FDA DISCLAIMER:</strong> All statements on this website have not been evaluated by the Food and Drug Administration (FDA). All products are sold strictly for research, laboratory, or analytical purposes only. Products are not intended to diagnose, treat, cure, or prevent any disease.
          </p>

          <p style="margin-bottom: 12px; padding: 12px; background-color: ${this.brandColors.charcoalLight}; border-radius: 4px;">
            <strong style="color: ${this.brandColors.white};">NON-PHARMACY DISCLAIMER:</strong> This site operates solely as a chemical and research materials supplier. We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act.
          </p>

          <p style="margin-bottom: 12px; padding: 12px; background-color: ${this.brandColors.charcoalLight}; border-radius: 4px;">
            <strong style="color: ${this.brandColors.white};">LIABILITY & RESPONSIBILITY:</strong> The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products. The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws.
          </p>

          <p style="padding: 12px; background-color: ${this.brandColors.charcoalLight}; border-radius: 4px;">
            <strong style="color: ${this.brandColors.white};">NO MEDICAL ADVICE:</strong> Nothing on this website constitutes medical, clinical, or healthcare advice. All information provided is for educational and research discussion purposes only.
          </p>
        </div>

        <div style="margin-top: 24px; text-align: center; padding-top: 20px; border-top: 1px solid ${this.brandColors.charcoalLight};">
          <p style="margin: 0; color: ${this.brandColors.gray}; font-size: 11px;">
            © ${new Date().getFullYear()} MAHA Peptides. All rights reserved.<br>
            <a href="https://mahapeps.com" style="color: ${this.brandColors.primary}; text-decoration: none;">mahapeps.com</a> |
            <a href="mailto:support@mahapeps.com" style="color: ${this.brandColors.primary}; text-decoration: none;">support@mahapeps.com</a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Base email wrapper with dark theme
   */
  private wrapEmail(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MAHA Peptides</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f1a;">
        <div style="max-width: 640px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${this.brandColors.charcoalLight}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);">
            ${this.getBrandedHeader()}
            <div style="padding: 32px 24px; background-color: #ffffff;">
              ${content}
            </div>
            ${this.getComplianceFooter()}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Order confirmation with payment instructions
   */
  getPaymentInstructionsEmail(params: {
    orderId: string;
    customerEmail: string;
    customerName?: string;
    orderTotal: string;
    paymentToken: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: string;
      lineTotal: string;
    }>;
    subtotal: string;
    shipping: string;
    tax: string;
  }): { subject: string; html: string } {
    const paymentUrl = `${process.env.FRONTEND_URL || 'https://mahapeps.com'}/payment/${params.paymentToken}`;
    const zelleId = process.env.ZELLE_ID || 'payments@mahapeps.com';
    const cashAppTag = process.env.CASHAPP_TAG || '$MahaPeps';

    const itemsHtml = params.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-weight: 600;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">$${item.unitPrice}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: 600;">$${item.lineTotal}</td>
        </tr>
      `,
      )
      .join('');

    const subject = `🧪 Order Confirmed #${params.orderId} - Payment Instructions | MAHA Peptides`;

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.success} 0%, #059669 100%); border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 28px; color: white;">
          ✓
        </div>
        <h1 style="color: #111827; margin: 16px 0 8px 0; font-size: 24px;">Order Confirmed!</h1>
        <p style="color: #6b7280; margin: 0;">Order #<span style="font-family: monospace; color: ${this.brandColors.primary}; font-weight: 700;">${params.orderId}</span></p>
      </div>

      ${params.customerName ? `<p style="color: #374151; margin-bottom: 24px;">Hello <strong>${params.customerName}</strong>,</p>` : ''}

      <p style="color: #374151; margin-bottom: 24px;">
        Thank you for your order! Your research materials have been reserved. Please complete payment within <strong>72 hours</strong> to secure your order.
      </p>

      <!-- Payment Required Alert -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid ${this.brandColors.warning}; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-weight: 700; color: #92400e; font-size: 16px;">
          ⚠️ Payment Required to Process Order
        </p>
        <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px;">
          Your order will be processed within 24-48 hours of receiving payment.
        </p>
      </div>

      <!-- Order Total Box -->
      <div style="background: linear-gradient(135deg, ${this.brandColors.charcoal} 0%, ${this.brandColors.charcoalLight} 100%); padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 8px 0; color: ${this.brandColors.gray}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
        <p style="margin: 0; color: ${this.brandColors.white}; font-size: 42px; font-weight: 800;">$${params.orderTotal}</p>
        <p style="margin: 12px 0 0 0; color: ${this.brandColors.gray}; font-size: 13px;">
          Reference: <span style="color: ${this.brandColors.primary}; font-family: monospace; font-weight: 700;">#${params.orderId}</span>
        </p>
      </div>

      <!-- Important Notice -->
      <div style="background-color: #fee2e2; border: 2px solid ${this.brandColors.error}; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0; font-weight: 700; color: #991b1b; font-size: 15px;">
          ⚠️ IMPORTANT: Include Order Number in Payment
        </p>
        <p style="margin: 8px 0 0 0; color: #991b1b; font-size: 14px;">
          When sending payment, you <strong>MUST</strong> include <strong style="font-family: monospace; background: #fff; padding: 2px 6px; border-radius: 4px;">#${params.orderId}</strong> in the payment note/memo. This ensures fast processing of your order.
        </p>
      </div>

      <!-- Payment Methods -->
      <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
        💳 Payment Methods
      </h2>

      <div style="display: grid; gap: 16px; margin-bottom: 24px;">
        <!-- Zelle -->
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
          <p style="margin: 0 0 8px 0; font-weight: 700; color: #111827; font-size: 16px;">
            <span style="color: #6366f1;">●</span> Zelle
          </p>
          <p style="margin: 0; color: #374151;">
            Send to: <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${zelleId}</code>
          </p>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">
            Include <strong>#${params.orderId}</strong> in the note field
          </p>
        </div>

        <!-- CashApp -->
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #00D632;">
          <p style="margin: 0 0 8px 0; font-weight: 700; color: #111827; font-size: 16px;">
            <span style="color: #00D632;">●</span> CashApp
          </p>
          <p style="margin: 0; color: #374151;">
            Send to: <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${cashAppTag}</code>
          </p>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">
            Include <strong>#${params.orderId}</strong> in the note field
          </p>
        </div>

        <!-- Wire Transfer -->
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #374151;">
          <p style="margin: 0 0 8px 0; font-weight: 700; color: #111827; font-size: 16px;">
            <span style="color: #374151;">●</span> Wire Transfer
          </p>
          <p style="margin: 0; color: #374151;">
            Contact <a href="mailto:support@mahapeps.com" style="color: ${this.brandColors.primary};">support@mahapeps.com</a> for wire instructions
          </p>
        </div>
      </div>

      <!-- Processing Timeline -->
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #1e40af; font-size: 15px;">
          📦 Processing & Shipping Timeline
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
          <li><strong>Payment Verification:</strong> Within 24 hours of receiving payment</li>
          <li><strong>Orders paid before 10:00 AM MST:</strong> Same-day processing</li>
          <li><strong>Orders paid after 10:00 AM MST:</strong> Next business day</li>
          <li><strong>Weekend Orders:</strong> Processed on Monday</li>
        </ul>
      </div>

      <!-- After Payment Steps -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #111827; font-size: 15px;">
          ✅ After Sending Payment:
        </p>
        <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
          <li>Take a screenshot of your payment confirmation</li>
          <li>Visit your payment portal: <a href="${paymentUrl}" style="color: ${this.brandColors.primary}; font-weight: 600;">${paymentUrl}</a></li>
          <li>Upload your payment proof (optional but speeds up processing)</li>
          <li>We'll verify and ship within 24-48 hours</li>
        </ol>
      </div>

      <!-- Order Summary -->
      <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
        🧾 Order Summary
      </h2>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: ${this.brandColors.charcoal};">
            <th style="padding: 14px 12px; text-align: left; font-weight: 600; color: ${this.brandColors.white}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
            <th style="padding: 14px 12px; text-align: center; font-weight: 600; color: ${this.brandColors.white}; font-size: 13px; text-transform: uppercase;">Qty</th>
            <th style="padding: 14px 12px; text-align: right; font-weight: 600; color: ${this.brandColors.white}; font-size: 13px; text-transform: uppercase;">Price</th>
            <th style="padding: 14px 12px; text-align: right; font-weight: 600; color: ${this.brandColors.white}; font-size: 13px; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #f9fafb;">
            <td colspan="3" style="padding: 12px; text-align: right; font-weight: 500; color: #6b7280;">Subtotal:</td>
            <td style="padding: 12px; text-align: right; color: #374151;">$${params.subtotal}</td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td colspan="3" style="padding: 12px; text-align: right; font-weight: 500; color: #6b7280;">Shipping:</td>
            <td style="padding: 12px; text-align: right; color: #374151;">$${params.shipping}</td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td colspan="3" style="padding: 12px; text-align: right; font-weight: 500; color: #6b7280;">Tax:</td>
            <td style="padding: 12px; text-align: right; color: #374151;">$${params.tax}</td>
          </tr>
          <tr style="background-color: ${this.brandColors.charcoal};">
            <td colspan="3" style="padding: 16px 12px; text-align: right; font-weight: 700; font-size: 16px; color: ${this.brandColors.white};">Total Due:</td>
            <td style="padding: 16px 12px; text-align: right; font-weight: 800; font-size: 18px; color: ${this.brandColors.primary};">$${params.orderTotal}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Support -->
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>Questions?</strong> Reply to this email or contact us at <a href="mailto:support@mahapeps.com" style="color: ${this.brandColors.primary}; font-weight: 600;">support@mahapeps.com</a>
        </p>
      </div>
    `;

    return { subject, html: this.wrapEmail(content) };
  }

  /**
   * Payment verified confirmation
   */
  getPaymentVerifiedEmail(params: {
    orderId: string;
    customerEmail: string;
    orderTotal: string;
  }): { subject: string; html: string } {
    const subject = `✅ Payment Verified - Order #${params.orderId} | MAHA Peptides`;

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.success} 0%, #059669 100%); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 36px; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
          ✓
        </div>
        <h1 style="color: #111827; margin: 20px 0 8px 0; font-size: 28px;">Payment Verified!</h1>
        <p style="color: #6b7280; margin: 0;">Order #<span style="font-family: monospace; color: ${this.brandColors.primary}; font-weight: 700;">${params.orderId}</span></p>
      </div>

      <!-- Success Message -->
      <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid ${this.brandColors.success}; padding: 24px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-weight: 700; color: #065f46; font-size: 18px;">
          🎉 Payment of $${params.orderTotal} has been verified!
        </p>
        <p style="margin: 12px 0 0 0; color: #047857; font-size: 15px;">
          Your order is now being prepared for shipment at our facility.
        </p>
      </div>

      <!-- Order Status -->
      <div style="background-color: ${this.brandColors.charcoal}; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <span style="color: ${this.brandColors.gray}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Order Status</span>
          <span style="background: linear-gradient(135deg, ${this.brandColors.success} 0%, #059669 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">PROCESSING</span>
        </div>
        <div style="background-color: ${this.brandColors.charcoalLight}; border-radius: 8px; overflow: hidden;">
          <div style="height: 8px; background: linear-gradient(90deg, ${this.brandColors.success} 0%, ${this.brandColors.success} 50%, ${this.brandColors.charcoal} 50%);"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px;">
          <span style="color: ${this.brandColors.success};">✓ Confirmed</span>
          <span style="color: ${this.brandColors.success};">✓ Paid</span>
          <span style="color: ${this.brandColors.gray};">Shipping</span>
          <span style="color: ${this.brandColors.gray};">Delivered</span>
        </div>
      </div>

      <!-- What's Next -->
      <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
        📦 What's Next?
      </h2>

      <ol style="color: #374151; line-height: 2; margin: 0 0 24px 0; padding-left: 20px;">
        <li><strong>Order Preparation:</strong> Your research materials are being carefully packed</li>
        <li><strong>Quality Check:</strong> Final verification of all items and documentation</li>
        <li><strong>Shipping Confirmation:</strong> You'll receive tracking info within 24-48 hours</li>
        <li><strong>Delivery:</strong> Estimated 2-5 business days depending on location</li>
      </ol>

      <!-- Support -->
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>Questions?</strong> Reply to this email or contact us at <a href="mailto:support@mahapeps.com" style="color: ${this.brandColors.primary}; font-weight: 600;">support@mahapeps.com</a>
        </p>
      </div>
    `;

    return { subject, html: this.wrapEmail(content) };
  }

  /**
   * Shipping confirmation email
   */
  getShippingConfirmationEmail(params: {
    orderId: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery?: string;
  }): { subject: string; html: string } {
    const trackingUrl = this.getTrackingUrl(params.carrier, params.trackingNumber);

    const subject = `📦 Order Shipped - Tracking #${params.trackingNumber} | MAHA Peptides`;

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 36px; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
          📦
        </div>
        <h1 style="color: #111827; margin: 20px 0 8px 0; font-size: 28px;">Your Order Has Shipped!</h1>
        <p style="color: #6b7280; margin: 0;">Order #<span style="font-family: monospace; color: ${this.brandColors.primary}; font-weight: 700;">${params.orderId}</span></p>
      </div>

      <!-- Tracking Info Box -->
      <div style="background: linear-gradient(135deg, ${this.brandColors.charcoal} 0%, ${this.brandColors.charcoalLight} 100%); padding: 28px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 8px 0; color: ${this.brandColors.gray}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
        <p style="margin: 0 0 20px 0; color: ${this.brandColors.white}; font-size: 24px; font-weight: 700; font-family: monospace; letter-spacing: 2px;">${params.trackingNumber}</p>

        <p style="margin: 0 0 8px 0; color: ${this.brandColors.gray}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Carrier</p>
        <p style="margin: 0; color: ${this.brandColors.white}; font-size: 18px; font-weight: 600;">${params.carrier}</p>

        ${params.estimatedDelivery ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${this.brandColors.charcoal};">
            <p style="margin: 0 0 8px 0; color: ${this.brandColors.gray}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Estimated Delivery</p>
            <p style="margin: 0; color: ${this.brandColors.success}; font-size: 18px; font-weight: 600;">${params.estimatedDelivery}</p>
          </div>
        ` : ''}
      </div>

      <!-- Track Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.primaryDark} 100%); color: #ffffff; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
          Track Your Shipment →
        </a>
      </div>

      <!-- Order Status -->
      <div style="background-color: ${this.brandColors.charcoal}; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <span style="color: ${this.brandColors.gray}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Order Status</span>
          <span style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">IN TRANSIT</span>
        </div>
        <div style="background-color: ${this.brandColors.charcoalLight}; border-radius: 8px; overflow: hidden;">
          <div style="height: 8px; background: linear-gradient(90deg, ${this.brandColors.success} 0%, ${this.brandColors.success} 75%, ${this.brandColors.charcoal} 75%);"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px;">
          <span style="color: ${this.brandColors.success};">✓ Confirmed</span>
          <span style="color: ${this.brandColors.success};">✓ Paid</span>
          <span style="color: #3b82f6; font-weight: 600;">● In Transit</span>
          <span style="color: ${this.brandColors.gray};">Delivered</span>
        </div>
      </div>

      <!-- Handling Notice -->
      <div style="background-color: #fef3c7; border-left: 4px solid ${this.brandColors.warning}; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-weight: 700; color: #92400e; font-size: 15px;">
          ⚗️ Important: Research Material Handling
        </p>
        <p style="margin: 12px 0 0 0; color: #78350f; font-size: 14px;">
          Upon receipt, please store your peptides according to the included documentation. Most lyophilized peptides should be stored at -20°C (freezer) for maximum stability.
        </p>
      </div>

      <!-- Support -->
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>Questions about your shipment?</strong> Reply to this email or contact us at <a href="mailto:support@mahapeps.com" style="color: ${this.brandColors.primary}; font-weight: 600;">support@mahapeps.com</a>
        </p>
      </div>
    `;

    return { subject, html: this.wrapEmail(content) };
  }

  /**
   * Owner notification email for new orders
   */
  getNewOrderNotificationEmail(params: {
    orderId: string;
    customerName?: string;
    customerEmail: string;
    orderTotal: string;
    subtotal: string;
    shipping: string;
    tax: string;
    insuranceFee?: string;
    processingFee?: string;
    processingType: 'STANDARD' | 'EXPEDITED' | 'RUSH';
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      phone: string;
    };
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: string;
      lineTotal: string;
    }>;
  }): { subject: string; html: string } {
    const processingLabels = {
      STANDARD: '📦 Standard (2 business days)',
      EXPEDITED: '⚡ Expedited (1 business day) +$25',
      RUSH: '🚀 RUSH (same day before 10am MST) +$50',
    };

    const itemsHtml = params.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #374151; color: #d1d5db;">${item.productName}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #374151; text-align: center; color: #fbbf24; font-weight: 700; font-size: 16px;">${item.quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #374151; text-align: right; color: #d1d5db;">$${item.unitPrice}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #374151; text-align: right; color: #ffffff; font-weight: 600;">$${item.lineTotal}</td>
        </tr>
      `,
      )
      .join('');

    const subject = `🛒 NEW ORDER #${params.orderId} - $${params.orderTotal} ${params.processingType !== 'STANDARD' ? `[${params.processingType}]` : ''} | Awaiting Payment`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Notification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f1a;">
        <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${this.brandColors.charcoalLight}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.primaryDark} 100%); padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px;">🛒 NEW ORDER RECEIVED</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                ${new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix', hour12: true, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} MST
              </p>
            </div>

            <div style="padding: 24px;">
              <!-- Order Number Box -->
              <div style="background-color: ${this.brandColors.charcoal}; border: 2px solid ${this.brandColors.primary}; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: ${this.brandColors.gray}; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                <p style="margin: 0; font-size: 48px; font-weight: 800; color: ${this.brandColors.white}; font-family: monospace;">#${params.orderId}</p>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid ${this.brandColors.charcoalLight};">
                  <span style="background-color: ${this.brandColors.warning}; color: #000; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px;">⏳ AWAITING PAYMENT</span>
                </div>
              </div>

              <!-- Processing Type Alert -->
              ${params.processingType !== 'STANDARD' ? `
              <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px solid ${this.brandColors.error}; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-weight: 700; color: #991b1b; font-size: 18px;">
                  ${params.processingType === 'RUSH' ? '🚀 RUSH' : '⚡ EXPEDITED'} PROCESSING REQUESTED
                </p>
                <p style="margin: 8px 0 0 0; color: #b91c1c; font-size: 14px;">
                  ${params.processingType === 'RUSH' ? 'Customer paid $50 for same-day processing (if confirmed before 10am MST)' : 'Customer paid $25 for next business day processing'}
                </p>
              </div>
              ` : ''}

              <!-- Total Box -->
              <div style="background: linear-gradient(135deg, ${this.brandColors.success} 0%, #059669 100%); padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.8); font-size: 14px; text-transform: uppercase;">Order Total</p>
                <p style="margin: 0; color: white; font-size: 42px; font-weight: 800;">$${params.orderTotal}</p>
              </div>

              <!-- Customer Info -->
              <div style="background-color: ${this.brandColors.charcoal}; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; color: ${this.brandColors.white}; font-size: 16px; border-bottom: 1px solid ${this.brandColors.charcoalLight}; padding-bottom: 12px;">👤 Customer Information</h2>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: ${this.brandColors.gray}; width: 100px;">Name:</td>
                    <td style="padding: 6px 0; color: ${this.brandColors.white}; font-weight: 600;">${params.customerName || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: ${this.brandColors.gray};">Email:</td>
                    <td style="padding: 6px 0;"><a href="mailto:${params.customerEmail}" style="color: ${this.brandColors.primary}; font-weight: 600;">${params.customerEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: ${this.brandColors.gray};">Phone:</td>
                    <td style="padding: 6px 0; color: ${this.brandColors.white};">${params.shippingAddress.phone}</td>
                  </tr>
                </table>
              </div>

              <!-- Shipping Address -->
              <div style="background-color: ${this.brandColors.charcoal}; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; color: ${this.brandColors.white}; font-size: 16px; border-bottom: 1px solid ${this.brandColors.charcoalLight}; padding-bottom: 12px;">📦 Ship To</h2>
                <div style="color: ${this.brandColors.white}; line-height: 1.6;">
                  <p style="margin: 0; font-weight: 700;">${params.shippingAddress.fullName}</p>
                  <p style="margin: 4px 0 0 0; color: #d1d5db;">${params.shippingAddress.addressLine1}</p>
                  ${params.shippingAddress.addressLine2 ? `<p style="margin: 0; color: #d1d5db;">${params.shippingAddress.addressLine2}</p>` : ''}
                  <p style="margin: 0; color: #d1d5db;">${params.shippingAddress.city}, ${params.shippingAddress.state} ${params.shippingAddress.postalCode}</p>
                  <p style="margin: 8px 0 0 0; color: ${this.brandColors.gray}; font-size: 13px;">📱 ${params.shippingAddress.phone}</p>
                </div>
              </div>

              <!-- Packing List -->
              <div style="background-color: ${this.brandColors.charcoal}; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; color: ${this.brandColors.white}; font-size: 16px; border-bottom: 1px solid ${this.brandColors.charcoalLight}; padding-bottom: 12px;">📋 Packing List</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: ${this.brandColors.charcoalLight};">
                      <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: ${this.brandColors.gray}; font-size: 12px; text-transform: uppercase;">Product</th>
                      <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: ${this.brandColors.gray}; font-size: 12px; text-transform: uppercase;">Qty</th>
                      <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: ${this.brandColors.gray}; font-size: 12px; text-transform: uppercase;">Price</th>
                      <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: ${this.brandColors.gray}; font-size: 12px; text-transform: uppercase;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <!-- Order Summary -->
              <div style="background-color: ${this.brandColors.charcoal}; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; color: ${this.brandColors.white}; font-size: 16px; border-bottom: 1px solid ${this.brandColors.charcoalLight}; padding-bottom: 12px;">💰 Order Summary</h2>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: ${this.brandColors.gray};">Subtotal:</td>
                    <td style="padding: 8px 0; text-align: right; color: ${this.brandColors.white};">$${params.subtotal}</td>
                  </tr>
                  ${params.insuranceFee && parseFloat(params.insuranceFee) > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; color: ${this.brandColors.gray};">Shipping Protection:</td>
                    <td style="padding: 8px 0; text-align: right; color: ${this.brandColors.success};">$${params.insuranceFee}</td>
                  </tr>
                  ` : ''}
                  ${params.processingFee && parseFloat(params.processingFee) > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; color: ${this.brandColors.gray};">${processingLabels[params.processingType]}:</td>
                    <td style="padding: 8px 0; text-align: right; color: ${this.brandColors.success};">$${params.processingFee}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: ${this.brandColors.gray};">Shipping:</td>
                    <td style="padding: 8px 0; text-align: right; color: ${this.brandColors.white};">$${params.shipping}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: ${this.brandColors.gray};">Tax:</td>
                    <td style="padding: 8px 0; text-align: right; color: ${this.brandColors.white};">$${params.tax}</td>
                  </tr>
                  <tr style="border-top: 2px solid ${this.brandColors.primary};">
                    <td style="padding: 16px 0 8px 0; font-weight: 700; font-size: 18px; color: ${this.brandColors.white};">TOTAL:</td>
                    <td style="padding: 16px 0 8px 0; text-align: right; font-weight: 800; font-size: 24px; color: ${this.brandColors.success};">$${params.orderTotal}</td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps -->
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%); padding: 24px; border-radius: 8px;">
                <h3 style="margin: 0 0 16px 0; color: white; font-size: 16px;">📋 Next Steps:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #bfdbfe; font-size: 14px; line-height: 2;">
                  <li>Wait for payment notification (Zelle/CashApp)</li>
                  <li>Check payment includes order <strong style="color: white;">#${params.orderId}</strong></li>
                  <li>Mark order as PAID in admin dashboard</li>
                  <li>System auto-creates Shippo order</li>
                  <li>Purchase label & customer gets tracking email</li>
                </ol>
              </div>

            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * KYC status update email
   */
  getKycStatusEmail(params: {
    status: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    canResubmitAt?: Date;
  }): { subject: string; html: string } {
    if (params.status === 'APPROVED') {
      const subject = `✅ KYC Verification Approved | MAHA Peptides`;

      const content = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.success} 0%, #059669 100%); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 36px; color: white;">
            ✓
          </div>
          <h1 style="color: #111827; margin: 20px 0 8px 0; font-size: 28px;">KYC Approved!</h1>
        </div>

        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid ${this.brandColors.success}; padding: 24px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-weight: 700; color: #065f46; font-size: 18px;">
            🎉 Your verification has been approved!
          </p>
          <p style="margin: 12px 0 0 0; color: #047857; font-size: 15px;">
            You now have full access to wholesale pricing and our complete research materials catalog.
          </p>
        </div>

        <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0;">What's Available Now:</h2>
        <ul style="color: #374151; line-height: 2; margin: 0 0 24px 0; padding-left: 20px;">
          <li><strong>Wholesale Pricing:</strong> Access discounted B2B rates</li>
          <li><strong>Bulk Orders:</strong> No quantity limits on orders</li>
          <li><strong>Priority Support:</strong> Direct access to our research team</li>
          <li><strong>COA Access:</strong> Full documentation for all products</li>
        </ul>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://mahapeps.com'}/products" style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.primaryDark} 100%); color: #ffffff; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
            Browse Wholesale Catalog →
          </a>
        </div>
      `;

      return { subject, html: this.wrapEmail(content) };
    } else {
      const hoursRemaining = params.canResubmitAt
        ? Math.ceil((params.canResubmitAt.getTime() - Date.now()) / (1000 * 60 * 60))
        : 72;

      const subject = `⚠️ KYC Verification - Action Required | MAHA Peptides`;

      const content = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.warning} 0%, #d97706 100%); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 36px; color: white;">
            !
          </div>
          <h1 style="color: #111827; margin: 20px 0 8px 0; font-size: 28px;">Additional Information Required</h1>
        </div>

        <div style="background-color: #fee2e2; border-left: 4px solid ${this.brandColors.error}; padding: 24px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-weight: 700; color: #991b1b; font-size: 16px;">
            Your KYC verification requires additional information
          </p>
          <p style="margin: 12px 0 0 0; color: #b91c1c; font-size: 14px;">
            ${params.rejectionReason || 'Please review and resubmit your documents.'}
          </p>
        </div>

        <p style="color: #374151; margin-bottom: 24px;">
          You may resubmit your KYC documents in <strong>${hoursRemaining} hours</strong>.
        </p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #111827;">Common reasons for additional review:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
            <li>Document image quality (blurry or cropped)</li>
            <li>Expired identification documents</li>
            <li>Information mismatch between documents</li>
            <li>Missing required documentation</li>
          </ul>
        </div>

        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;">
            <strong>Need help?</strong> Contact us at <a href="mailto:support@mahapeps.com" style="color: ${this.brandColors.primary}; font-weight: 600;">support@mahapeps.com</a>
          </p>
        </div>
      `;

      return { subject, html: this.wrapEmail(content) };
    }
  }

  /**
   * Welcome email for new accounts
   */
  getWelcomeEmail(params: {
    customerName?: string;
    email: string;
  }): { subject: string; html: string } {
    const subject = `🧪 Welcome to MAHA Peptides | Your Research Journey Starts Here`;

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #111827; margin: 0 0 8px 0; font-size: 28px;">Welcome to MAHA Peptides!</h1>
        <p style="color: #6b7280; margin: 0; font-size: 16px;">Your trusted partner for premium research materials</p>
      </div>

      ${params.customerName ? `<p style="color: #374151; margin-bottom: 24px; font-size: 16px;">Hello <strong>${params.customerName}</strong>,</p>` : ''}

      <p style="color: #374151; margin-bottom: 24px; font-size: 15px; line-height: 1.7;">
        Thank you for creating an account with MAHA Peptides. We're committed to providing the highest quality research peptides manufactured right here in the USA with 99%+ purity verification.
      </p>

      <div style="background: linear-gradient(135deg, ${this.brandColors.charcoal} 0%, ${this.brandColors.charcoalLight} 100%); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px 0; color: ${this.brandColors.white}; font-size: 18px;">Why Researchers Choose MAHA:</h2>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="background-color: ${this.brandColors.primary}; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">✓</span>
            <span style="color: #d1d5db;"><strong style="color: white;">99%+ Purity</strong> - Third-party verified COA with every order</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="background-color: ${this.brandColors.primary}; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">✓</span>
            <span style="color: #d1d5db;"><strong style="color: white;">Made in America</strong> - GMP-compliant domestic manufacturing</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="background-color: ${this.brandColors.primary}; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">✓</span>
            <span style="color: #d1d5db;"><strong style="color: white;">Fast Shipping</strong> - Same-day processing on orders before 10am MST</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="background-color: ${this.brandColors.primary}; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">✓</span>
            <span style="color: #d1d5db;"><strong style="color: white;">Expert Support</strong> - Research team available for questions</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://mahapeps.com'}/products" style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.primaryDark} 100%); color: #ffffff; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
          Browse Research Catalog →
        </a>
      </div>

      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>Questions?</strong> Our research support team is here to help at <a href="mailto:support@mahapeps.com" style="color: ${this.brandColors.primary}; font-weight: 600;">support@mahapeps.com</a>
        </p>
      </div>
    `;

    return { subject, html: this.wrapEmail(content) };
  }

  /**
   * Contact form notification to support team
   */
  getContactFormNotificationEmail(params: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): { subject: string; html: string } {
    const emailSubject = `📬 Contact Form: ${params.subject}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Form Submission</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f1a;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${this.brandColors.charcoalLight}; border-radius: 8px; overflow: hidden;">

            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 20px;">📬 New Contact Form Submission</h1>
            </div>

            <div style="padding: 24px; background-color: #ffffff;">
              <table style="width: 100%; font-size: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 80px;"><strong>From:</strong></td>
                  <td style="padding: 8px 0; color: #111827;">${params.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;"><a href="mailto:${params.email}" style="color: ${this.brandColors.primary};">${params.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; color: #111827;">${params.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Subject:</strong></td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600;">${params.subject}</td>
                </tr>
              </table>

              <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">Message:</p>
                <p style="margin: 0; color: #111827; white-space: pre-wrap; line-height: 1.6;">${params.message}</p>
              </div>

              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <a href="mailto:${params.email}" style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.primaryDark} 100%); color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  Reply to ${params.name}
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject: emailSubject, html };
  }

  /**
   * Contact form confirmation to user
   */
  getContactConfirmationEmail(params: {
    name: string;
    email: string;
  }): { subject: string; html: string } {
    const subject = `✅ We've Received Your Message | MAHA Peptides`;

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.success} 0%, #059669 100%); border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 28px; color: white;">
          ✓
        </div>
        <h1 style="color: #111827; margin: 16px 0 8px 0; font-size: 24px;">Message Received!</h1>
      </div>

      <p style="color: #374151; margin-bottom: 24px;">Hello <strong>${params.name}</strong>,</p>

      <p style="color: #374151; margin-bottom: 24px; line-height: 1.7;">
        Thank you for contacting MAHA Peptides. We've received your inquiry and our research support team will review your message shortly.
      </p>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827;">📧 Expected Response Time:</p>
        <p style="margin: 0; color: #6b7280;">1-2 business days (Monday-Friday)</p>
      </div>

      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>Urgent inquiries?</strong> Email us directly at <a href="mailto:support@mahapeps.com" style="color: ${this.brandColors.primary}; font-weight: 600;">support@mahapeps.com</a>
        </p>
      </div>
    `;

    return { subject, html: this.wrapEmail(content) };
  }

  private getTrackingUrl(carrier: string, trackingNumber: string): string {
    const carrierUrls: Record<string, string> = {
      USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      FedEx: `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
      DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    };

    return carrierUrls[carrier] || `https://www.google.com/search?q=${trackingNumber}+tracking`;
  }
}
