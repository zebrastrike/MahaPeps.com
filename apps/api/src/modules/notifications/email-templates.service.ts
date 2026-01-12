import { Injectable, Logger } from '@nestjs/common';

/**
 * Compliance-safe email templates
 * All templates MUST include required disclaimers from GUARDRAILS.md
 */
@Injectable()
export class EmailTemplatesService {
  private readonly logger = new Logger(EmailTemplatesService.name);
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
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">
              Order Number: <span style="color: #2563eb; font-size: 28px; font-family: monospace;">#{params.orderId}</span>
            </p>
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">Total Amount Due: <span style="color: #059669; font-size: 24px;">$${params.orderTotal}</span></p>

            <div style="background-color: #fee2e2; border: 2px solid #dc2626; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; font-weight: 700; color: #991b1b; font-size: 16px;">
                ⚠️ IMPORTANT: Include Order Number in Payment
              </p>
              <p style="margin: 8px 0 0 0; color: #991b1b;">
                When sending payment via Zelle or CashApp, <strong>MUST include "#${params.orderId}"</strong> in the payment note/memo field.
                This helps us match your payment to your order quickly.
              </p>
            </div>

            <p style="margin: 16px 0 8px 0; font-weight: 600; color: #111827;">Payment Methods:</p>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">
                <strong>Zelle:</strong> Send to <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">UPDATE_WITH_ACTUAL_ZELLE_EMAIL</code>
                <br><span style="font-size: 13px; color: #6b7280;">Include "#${params.orderId}" in note field</span>
              </li>
              <li style="margin-bottom: 8px;">
                <strong>CashApp:</strong> Send to <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">$UPDATE_WITH_ACTUAL_CASHAPP</code>
                <br><span style="font-size: 13px; color: #6b7280;">Include "#${params.orderId}" in note field</span>
              </li>
              <li><strong>Wire Transfer:</strong> Contact support@mahapeps.com for wire instructions</li>
            </ul>

            <!-- Processing Time Info -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 20px; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">Processing & Shipping Timeline:</p>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
                <li><strong>Payment Verification:</strong> Within 24 hours of receiving payment</li>
                <li><strong>Standard Processing:</strong> 2 business days after payment confirmation</li>
                <li><strong>Orders paid before 10:00 AM MST (Arizona Time):</strong> Same-day processing</li>
                <li><strong>Orders paid after 10:00 AM MST:</strong> Next business day processing</li>
                <li><strong>Weekend Orders:</strong> Processed on Monday</li>
              </ul>
            </div>

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
      STANDARD: 'Standard (2 business days) - FREE',
      EXPEDITED: 'Expedited (1 business day) - $25',
      RUSH: 'Rush (same day if before 10am MST) - $50',
    };

    const itemsHtml = params.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 700;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unitPrice}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.lineTotal}</td>
        </tr>
      `,
      )
      .join('');

    const subject = `🛒 New Order #${params.orderId} - $${params.orderTotal} (Awaiting Payment)`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Notification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid #2563eb;">

          <h1 style="color: #111827; margin-bottom: 8px; font-size: 24px;">🛒 New Order Received</h1>
          <p style="color: #6b7280; margin-bottom: 24px; font-size: 14px;">Order placed at ${new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix', hour12: true })}</p>

          <!-- Order Number Box -->
          <div style="background-color: #eff6ff; border: 2px solid #2563eb; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e40af; font-weight: 600;">ORDER NUMBER</p>
            <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1e3a8a; font-family: monospace;">#${params.orderId}</p>
          </div>

          <!-- Status Warning -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #92400e; font-size: 15px;">
              ⏳ Awaiting Payment Confirmation
            </p>
            <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
              Customer has been sent payment instructions. Check Zelle/CashApp for payment with order number <strong>#${params.orderId}</strong> in the note field.
            </p>
          </div>

          <!-- Processing Type Alert -->
          ${params.processingType !== 'STANDARD' ? `
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0; font-weight: 700; color: #991b1b; font-size: 15px;">
              🚀 ${params.processingType} PROCESSING REQUESTED
            </p>
            <p style="margin: 8px 0 0 0; color: #991b1b; font-size: 14px;">
              ${params.processingType === 'RUSH' ? 'Customer paid $50 for same-day processing (if confirmed before 10am MST)' : 'Customer paid $25 for 1 business day processing'}
            </p>
          </div>
          ` : ''}

          <!-- Customer Information -->
          <div style="margin-bottom: 24px;">
            <h2 style="color: #111827; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Customer Information</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; width: 120px;"><strong>Name:</strong></td>
                <td style="padding: 6px 0; color: #111827;">${params.customerName || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td>
                <td style="padding: 6px 0; color: #111827;"><a href="mailto:${params.customerEmail}" style="color: #2563eb;">${params.customerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td>
                <td style="padding: 6px 0; color: #111827;">${params.shippingAddress.phone}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="margin-bottom: 24px;">
            <h2 style="color: #111827; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📦 Ship To</h2>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <p style="margin: 0 0 4px 0; color: #111827; font-weight: 600;">${params.shippingAddress.fullName}</p>
              <p style="margin: 0 0 4px 0; color: #374151;">${params.shippingAddress.addressLine1}</p>
              ${params.shippingAddress.addressLine2 ? `<p style="margin: 0 0 4px 0; color: #374151;">${params.shippingAddress.addressLine2}</p>` : ''}
              <p style="margin: 0 0 4px 0; color: #374151;">${params.shippingAddress.city}, ${params.shippingAddress.state} ${params.shippingAddress.postalCode}</p>
              <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">Phone: ${params.shippingAddress.phone}</p>
            </div>
          </div>

          <!-- Packing List -->
          <div style="margin-bottom: 24px;">
            <h2 style="color: #111827; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📋 Packing List</h2>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 10px 8px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; font-size: 13px;">Product</th>
                  <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; font-size: 13px;">Qty</th>
                  <th style="padding: 10px 8px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; font-size: 13px;">Price</th>
                  <th style="padding: 10px 8px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; font-size: 13px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Order Summary -->
          <div style="margin-bottom: 24px;">
            <h2 style="color: #111827; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">💰 Order Summary</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Subtotal:</td>
                <td style="padding: 6px 0; text-align: right; color: #111827;">$${params.subtotal}</td>
              </tr>
              ${params.insuranceFee && parseFloat(params.insuranceFee) > 0 ? `
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Shipping Protection (2%):</td>
                <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 600;">$${params.insuranceFee}</td>
              </tr>
              ` : ''}
              ${params.processingFee && parseFloat(params.processingFee) > 0 ? `
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">${processingLabels[params.processingType]}:</td>
                <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 600;">$${params.processingFee}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Shipping:</td>
                <td style="padding: 6px 0; text-align: right; color: #111827;">$${params.shipping}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Tax:</td>
                <td style="padding: 6px 0; text-align: right; color: #111827;">$${params.tax}</td>
              </tr>
              <tr style="border-top: 2px solid #111827;">
                <td style="padding: 12px 0 6px 0; font-weight: 700; font-size: 16px; color: #111827;">Total:</td>
                <td style="padding: 12px 0 6px 0; text-align: right; font-weight: 700; font-size: 18px; color: #059669;">$${params.orderTotal}</td>
              </tr>
            </table>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #1e40af; font-size: 16px;">Next Steps:</p>
            <ol style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
              <li><strong>Wait for payment notification</strong> - Customer will send payment via Zelle or CashApp</li>
              <li><strong>Check payment includes order #${params.orderId}</strong> in the note/memo field</li>
              <li><strong>Log in to admin dashboard</strong> and mark order as PAID</li>
              <li><strong>System will auto-create Shippo order</strong> - you can then purchase the label</li>
              <li><strong>Customer receives tracking email</strong> automatically when label is purchased</li>
            </ol>
          </div>

          <!-- Processing Timeline Reminder -->
          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 16px; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e; font-size: 14px;">⏰ Processing Timeline Reminder:</p>
            <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px; line-height: 1.6;">
              <li><strong>Before 10:00 AM MST:</strong> Same-day processing</li>
              <li><strong>After 10:00 AM MST:</strong> Next business day</li>
              <li><strong>Weekend orders:</strong> Ship Monday</li>
            </ul>
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

  /**
   * Contact form notification to support team
   */
  async sendContactFormNotification(params: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const subject = `New Contact Form Submission: ${params.subject}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Form Submission</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #111827; margin-bottom: 24px;">New Contact Form Submission</h1>

          <div style="margin-bottom: 24px;">
            <p style="color: #6b7280; margin-bottom: 8px;"><strong>From:</strong> ${params.name}</p>
            <p style="color: #6b7280; margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:${params.email}">${params.email}</a></p>
            <p style="color: #6b7280; margin-bottom: 8px;"><strong>Phone:</strong> ${params.phone}</p>
            <p style="color: #6b7280; margin-bottom: 8px;"><strong>Subject:</strong> ${params.subject}</p>
          </div>

          <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px;">
            <p style="color: #111827; margin: 0; white-space: pre-wrap;">${params.message}</p>
          </div>

          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Reply to this inquiry at: <a href="mailto:${params.email}">${params.email}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // TODO: Implement actual email sending via Mailgun
    // For now, just log it
    this.logger.log(`Contact form notification sent: ${subject} to support@mahapeps.com`);
  }

  /**
   * Contact form confirmation to user
   */
  async sendContactConfirmation(params: {
    name: string;
    email: string;
  }): Promise<void> {
    const subject = 'Thank you for contacting MAHA Peptides';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #111827; margin-bottom: 16px;">Thank You for Contacting Us</h1>

          <p style="color: #6b7280; margin-bottom: 16px;">Hello ${params.name},</p>

          <p style="color: #6b7280; margin-bottom: 16px;">
            We have received your inquiry and our research support team will review your message shortly.
            You can expect a response within 1-2 business days.
          </p>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="color: #1e40af; margin: 0; font-weight: 600;">
              For urgent inquiries, please call us during business hours (Monday-Friday, 9AM-6PM EST).
            </p>
          </div>

          <p style="color: #6b7280; margin-bottom: 16px;">
            <strong>MAHA Peptides Research Support</strong><br>
            Email: support@mahapeps.com<br>
            Hours: Monday-Friday, 9AM-6PM EST
          </p>

          ${this.getComplianceFooter()}
        </div>
      </body>
      </html>
    `;

    // TODO: Implement actual email sending via Mailgun
    this.logger.log(`Contact confirmation sent: ${subject} to ${params.email}`);
  }
}
