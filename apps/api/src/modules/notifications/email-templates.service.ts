import { Injectable } from '@nestjs/common';

/**
 * Compliance-safe email templates
 * All templates MUST include required disclaimers from GUARDRAILS.md
 */
@Injectable()
export class EmailTemplatesService {
  /**
   * Footer with required disclaimers (EXACT TEXT from GUARDRAILS.md)
   */
  private getComplianceFooter(): string {
    return `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; line-height: 1.6;">
        <p style="margin-bottom: 12px;">
          <strong>RESEARCH USE ONLY</strong><br>
          All products sold on this platform are intended solely for lawful laboratory research and analytical use.
          Not for human or veterinary consumption.
        </p>

        <p style="margin-bottom: 12px;">
          <strong>FDA DISCLAIMER</strong><br>
          All statements on this website have not been evaluated by the Food and Drug Administration (FDA).
          All products are sold strictly for research, laboratory, or analytical purposes only.
          Products are not intended to diagnose, treat, cure, or prevent any disease.
        </p>

        <p style="margin-bottom: 12px;">
          <strong>NON-PHARMACY DISCLAIMER</strong><br>
          This site operates solely as a chemical and research materials supplier.
          We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act.
          We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act.
        </p>

        <p style="margin-bottom: 12px;">
          <strong>LIABILITY & RESPONSIBILITY</strong><br>
          The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products.
          The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws.
        </p>

        <p>
          <strong>NO MEDICAL ADVICE</strong><br>
          Nothing on this website constitutes medical, clinical, or healthcare advice.
          All information provided is for educational and research discussion purposes only.
        </p>
      </div>
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
    const paymentUrl = `${process.env.FRONTEND_URL}/payment/${params.paymentToken}`;

    const itemsHtml = params.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unitPrice}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.lineTotal}</td>
        </tr>
      `,
      )
      .join('');

    const subject = `Order Confirmation #${params.orderId} - Payment Instructions`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <h1 style="color: #111827; margin-bottom: 8px;">Order Confirmation</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">Order #${params.orderId}</p>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #92400e;">
              ⚠️ Payment Required
            </p>
            <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
              Your order is confirmed but awaiting payment. Please complete payment within 72 hours using the instructions below.
            </p>
          </div>

          <h2 style="color: #111827; font-size: 18px; margin-top: 32px; margin-bottom: 16px;">Payment Instructions</h2>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">Total Amount Due: <span style="color: #059669; font-size: 24px;">$${params.orderTotal}</span></p>

            <p style="margin: 16px 0 8px 0; font-weight: 600; color: #111827;">Payment Methods:</p>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li><strong>Zelle:</strong> Send to <code>payments@mahapeps.com</code></li>
              <li><strong>CashApp:</strong> Send to <code>$MahaPeps</code></li>
              <li><strong>Wire Transfer:</strong> Contact support for wire instructions</li>
            </ul>

            <div style="margin-top: 20px; padding: 16px; background-color: #ffffff; border-radius: 4px; border: 1px solid #d1d5db;">
              <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">After Payment:</p>
              <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
                <li>Take a screenshot of your payment confirmation</li>
                <li>Visit your payment link: <a href="${paymentUrl}" style="color: #2563eb;">${paymentUrl}</a></li>
                <li>Upload your payment proof</li>
                <li>We'll verify and process your order within 24-48 hours</li>
              </ol>
            </div>
          </div>

          <h2 style="color: #111827; font-size: 18px; margin-top: 32px; margin-bottom: 16px;">Order Summary</h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Product</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;">$${params.subtotal}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600;">Shipping:</td>
                <td style="padding: 12px; text-align: right;">$${params.shipping}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; font-weight: 600;">Tax:</td>
                <td style="padding: 12px; text-align: right;">$${params.tax}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; font-weight: 700; font-size: 16px; border-top: 2px solid #111827;">Total:</td>
                <td style="padding: 12px; text-align: right; font-weight: 700; font-size: 16px; border-top: 2px solid #111827;">$${params.orderTotal}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 24px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Questions?</strong> Reply to this email or contact support@mahapeps.com
            </p>
          </div>

          ${this.getComplianceFooter()}

        </div>

      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Payment verification confirmation
   */
  getPaymentVerifiedEmail(params: {
    orderId: string;
    customerEmail: string;
    orderTotal: string;
  }): { subject: string; html: string } {
    const subject = `Payment Verified - Order #${params.orderId}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Verified</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #d1fae5; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">
              ✓
            </div>
          </div>

          <h1 style="color: #111827; text-align: center; margin-bottom: 8px;">Payment Verified!</h1>
          <p style="color: #6b7280; text-align: center; margin-bottom: 24px;">Order #${params.orderId}</p>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #065f46;">
              Payment of $${params.orderTotal} has been verified and approved.
            </p>
            <p style="margin: 8px 0 0 0; color: #065f46; font-size: 14px;">
              Your order is now being prepared for shipment. You'll receive a shipping confirmation with tracking information within 24-48 hours.
            </p>
          </div>

          <h2 style="color: #111827; font-size: 18px; margin-top: 32px; margin-bottom: 16px;">What's Next?</h2>

          <ol style="color: #374151; line-height: 1.8;">
            <li>Your order is being prepared at our facility</li>
            <li>You'll receive a shipping confirmation email with tracking details</li>
            <li>Estimated shipping time: 2-5 business days (depending on carrier)</li>
            <li>Track your shipment using the link in your shipping confirmation</li>
          </ol>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 24px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Questions?</strong> Reply to this email or contact support@mahapeps.com
            </p>
          </div>

          ${this.getComplianceFooter()}

        </div>

      </body>
      </html>
    `;

    return { subject, html };
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

    const subject = `Order Shipped - Tracking #${params.trackingNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Shipped</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <h1 style="color: #111827; margin-bottom: 8px;">Your Order Has Shipped!</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">Order #${params.orderId}</p>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">Tracking Number:</p>
            <p style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1e3a8a; font-family: monospace;">${params.trackingNumber}</p>

            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">Carrier:</p>
            <p style="margin: 0 0 16px 0; color: #1e40af;">${params.carrier}</p>

            ${params.estimatedDelivery ? `
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">Estimated Delivery:</p>
              <p style="margin: 0; color: #1e40af;">${params.estimatedDelivery}</p>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Track Your Shipment
            </a>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 24px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Important:</strong> All research materials must be handled according to proper laboratory safety protocols. Ensure proper storage and documentation upon receipt.
            </p>
          </div>

          ${this.getComplianceFooter()}

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
    const subject = `KYC Verification ${params.status === 'APPROVED' ? 'Approved' : 'Update Required'}`;

    if (params.status === 'APPROVED') {
      const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 32px;">
            <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #065f46;">
                ✓ Your KYC verification has been approved!
              </p>
              <p style="margin: 8px 0 0 0; color: #065f46; font-size: 14px;">
                You now have access to B2B wholesale pricing and research materials catalog.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
      return { subject, html };
    } else {
      const hoursRemaining = params.canResubmitAt
        ? Math.ceil((params.canResubmitAt.getTime() - Date.now()) / (1000 * 60 * 60))
        : 72;

      const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 32px;">
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #991b1b;">
                KYC Verification requires additional information
              </p>
              <p style="margin: 8px 0 0 0; color: #991b1b; font-size: 14px;">
                ${params.rejectionReason || 'Please review and resubmit your documents.'}
              </p>
            </div>
            <p style="color: #374151;">You may resubmit your KYC documents in <strong>${hoursRemaining} hours</strong>.</p>
          </div>
        </body>
        </html>
      `;
      return { subject, html };
    }
  }

  private getTrackingUrl(carrier: string, trackingNumber: string): string {
    const carrierUrls: Record<string, string> = {
      USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      FedEx: `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
    };

    return carrierUrls[carrier] || `https://www.google.com/search?q=${trackingNumber}+tracking`;
  }
}
