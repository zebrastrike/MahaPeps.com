# Payment Strategy: Private Payment Links + High-Risk Processor

## Overview

**Primary Method:** Private payment links sent via SMS/Email
**Future Processor:** Epicor Propello or similar high-risk payment processor
**NO Stripe** - Ever.

This approach is **perfect for research chemical marketplace** because:
- ✅ Manual order vetting before payment
- ✅ Compliance screening before accepting money
- ✅ Flexibility to use different processors per order
- ✅ Reduced chargeback risk (pre-screened customers)
- ✅ Works with any payment processor backend
- ✅ Can mix payment methods (wire, ACH, crypto, card)

---

## Payment Flow

### Customer Experience

```
1. Customer adds products to cart
2. Customer proceeds to "Request Payment Link"
3. Customer fills out checkout form:
   - Shipping address
   - Phone number (for SMS)
   - Email
   - Research acknowledgment checkboxes
4. Order created with status: PENDING_REVIEW
5. Customer sees: "Your order has been received. We will send you a secure payment link within 1-4 hours."
```

**Then:**

```
Admin reviews order (compliance check)
    ↓
If approved:
    ↓
Admin generates private payment link (Epicor Propello or manual)
    ↓
Link sent via SMS + Email
    ↓
Customer clicks link → Secure payment page
    ↓
Customer pays
    ↓
Webhook confirms payment
    ↓
Order status: PAID → Admin fulfills
```

---

## Payment Link System

### Database Schema

```prisma
model Order {
  id                String       @id @default(cuid())
  orderNumber       String       @unique // e.g., "MP-2024-0001"
  userId            String
  status            OrderStatus  @default(PENDING_REVIEW)
  total             Float

  // Payment link tracking
  paymentLinkId     String?      @unique
  paymentLink       PaymentLink? @relation(fields: [paymentLinkId], references: [id])

  // Compliance
  complianceReviewed Boolean    @default(false)
  complianceApproved Boolean?
  complianceNotes    String?
  reviewedBy         String?     // Admin userId
  reviewedAt         DateTime?

  user              User         @relation(fields: [userId], references: [id])
  items             OrderItem[]
  payments          Payment[]

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

model PaymentLink {
  id                String       @id @default(cuid())
  orderId           String       @unique
  token             String       @unique // Secure random token

  // Link details
  amount            Float
  currency          String       @default("USD")
  expiresAt         DateTime     // 48 hours from creation

  // Status
  status            PaymentLinkStatus @default(PENDING)
  sentVia           String[]     // ["SMS", "EMAIL"]
  sentAt            DateTime?
  clickedAt         DateTime?
  paidAt            DateTime?

  // Payment processor details
  processorType     String?      // "EPICOR_PROPELLO", "WIRE", "CRYPTO", "MANUAL"
  processorLinkId   String?      // External payment link ID from processor
  processorUrl      String?      // Full URL from processor

  // Metadata
  customerPhone     String?
  customerEmail     String
  ipAddress         String?
  userAgent         String?

  order             Order        @relation(fields: [orderId], references: [id])

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([token])
  @@index([status])
  @@index([expiresAt])
}

enum PaymentLinkStatus {
  PENDING       // Link created, not sent yet
  SENT          // Link sent to customer
  CLICKED       // Customer clicked link
  PAID          // Payment completed
  EXPIRED       // Link expired (48h)
  CANCELED      // Admin canceled
  FAILED        // Payment failed
}

enum OrderStatus {
  PENDING_REVIEW     // Waiting for admin compliance review
  REVIEW_REJECTED    // Admin rejected (compliance issue)
  PENDING_PAYMENT    // Approved, payment link sent
  PAYMENT_FAILED     // Payment failed
  PAID               // Payment received
  FULFILLING         // Being prepared for shipment
  SHIPPED            // Shipped
  COMPLETED          // Delivered
  CANCELED           // Canceled
  REFUNDED           // Refunded
}

model Payment {
  id                String        @id @default(cuid())
  orderId           String
  amount            Float
  currency          String        @default("USD")
  status            PaymentStatus

  // Processor details
  processorType     String        // "EPICOR_PROPELLO", "WIRE", "CRYPTO", "MANUAL"
  processorTransactionId String?  // Transaction ID from processor

  // Wire transfer details (if applicable)
  wireReference     String?
  wireDate          DateTime?

  // Crypto details (if applicable)
  cryptoCurrency    String?       // "BTC", "ETH", "USDC"
  cryptoTxHash      String?
  cryptoAddress     String?

  // Metadata
  ipAddress         String?
  metadata          Json?

  order             Order         @relation(fields: [orderId], references: [id])

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([orderId])
  @@index([processorTransactionId])
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  COMPLETED
  FAILED
  REFUNDED
  DISPUTED
}
```

---

## Admin Workflow

### 1. Order Review Dashboard

**Location:** `/admin/orders/pending-review`

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ Pending Review Orders (3)                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Order #MP-2024-0001                                         │
│ Customer: John Smith (john@researchlab.edu)                │
│ Phone: +1 (555) 123-4567                                   │
│ Total: $1,245.00                                            │
│ Items: 3 products                                           │
│                                                             │
│ ✓ Age verified (21+)                                       │
│ ✓ Research acknowledgment accepted                         │
│ ✓ Compliance disclaimers accepted                          │
│ ⚠ New customer (first order)                               │
│                                                             │
│ Products:                                                   │
│ - BPC-157 (5mg, 98.2% purity) x2                           │
│ - TB-500 (10mg, 97.8% purity) x1                           │
│                                                             │
│ [View Full Details] [Approve & Send Payment Link] [Reject] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Review Checklist:**
- [ ] Customer age verified (21+)
- [ ] Shipping address valid (no PO boxes for certain items)
- [ ] Customer type appropriate for products ordered
- [ ] No red flags in order history
- [ ] All compliance checkboxes accepted
- [ ] Products available in stock

**Actions:**
- **Approve** → Generate payment link
- **Reject** → Send rejection email with reason
- **Request More Info** → Email customer for clarification

---

### 2. Payment Link Generation

**When admin clicks "Approve & Send Payment Link":**

```typescript
// apps/api/src/payments/payment-link.service.ts

@Injectable()
export class PaymentLinkService {
  async generatePaymentLink(orderId: string, adminId: string) {
    // 1. Get order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
    });

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // 3. Determine payment processor
    const processorType = this.selectProcessor(order);

    // 4. Create external payment link (if using processor)
    let processorUrl = null;
    let processorLinkId = null;

    if (processorType === 'EPICOR_PROPELLO') {
      // Epicor Propello API integration
      const propelloLink = await this.epicorPropello.createPaymentLink({
        amount: order.total,
        currency: 'USD',
        orderId: order.orderNumber,
        customerEmail: order.user.email,
        returnUrl: `${process.env.APP_URL}/orders/${order.id}/success`,
        cancelUrl: `${process.env.APP_URL}/orders/${order.id}/canceled`,
      });

      processorUrl = propelloLink.url;
      processorLinkId = propelloLink.id;
    }

    // 5. Create payment link record
    const paymentLink = await this.prisma.paymentLink.create({
      data: {
        orderId: order.id,
        token,
        amount: order.total,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        status: 'PENDING',
        customerEmail: order.user.email,
        customerPhone: order.user.phone,
        processorType,
        processorUrl,
        processorLinkId,
      },
    });

    // 6. Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PENDING_PAYMENT',
        complianceReviewed: true,
        complianceApproved: true,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        paymentLinkId: paymentLink.id,
      },
    });

    // 7. Send payment link via SMS + Email
    await this.sendPaymentLink(paymentLink, order);

    // 8. Log action
    await this.auditService.logAction(
      adminId,
      null,
      'PAYMENT_LINK_GENERATED',
      { orderId, paymentLinkId: paymentLink.id },
    );

    return paymentLink;
  }

  private selectProcessor(order: Order): string {
    // Logic to select payment processor based on:
    // - Order amount
    // - Customer type (B2B vs D2C)
    // - Customer location
    // - Product type
    // - Available processors

    // For now, prefer Epicor Propello if available
    if (process.env.EPICOR_PROPELLO_ENABLED === 'true') {
      return 'EPICOR_PROPELLO';
    }

    // Fallback to manual (wire transfer instructions)
    return 'WIRE';
  }

  private async sendPaymentLink(paymentLink: PaymentLink, order: Order) {
    const paymentUrl = `${process.env.APP_URL}/pay/${paymentLink.token}`;

    // Send via Email
    await this.emailService.send({
      to: paymentLink.customerEmail,
      subject: `Payment Link for Order ${order.orderNumber}`,
      template: 'payment-link',
      data: {
        orderNumber: order.orderNumber,
        amount: order.total,
        paymentUrl,
        expiresAt: paymentLink.expiresAt,
      },
    });

    // Send via SMS
    if (paymentLink.customerPhone) {
      await this.smsService.send({
        to: paymentLink.customerPhone,
        message: `Your MAHA Peptides payment link for order ${order.orderNumber} ($${order.total}): ${paymentUrl} (expires in 48h)`,
      });
    }

    // Update payment link
    await this.prisma.paymentLink.update({
      where: { id: paymentLink.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        sentVia: paymentLink.customerPhone ? ['EMAIL', 'SMS'] : ['EMAIL'],
      },
    });
  }
}
```

---

### 3. Customer Payment Page

**URL:** `https://mahapeps.com/pay/{token}`

**UI:**
```
┌──────────────────────────────────────────────────────────┐
│                    MAHA PEPTIDES                         │
│                  Secure Payment Link                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Order #MP-2024-0001                                     │
│  Amount Due: $1,245.00 USD                               │
│  Expires: January 15, 2025 at 3:45 PM                   │
│                                                          │
│  Order Summary:                                          │
│  • BPC-157 (5mg, 98.2% purity) x2 ........ $590.00      │
│  • TB-500 (10mg, 97.8% purity) x1 ........ $595.00      │
│  • Shipping ................................ $60.00      │
│                                          ─────────       │
│  Total ..................................... $1,245.00    │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  Payment Options:                                        │
│                                                          │
│  [Pay with Card] ← Powered by Epicor Propello           │
│  (Credit/Debit Card, 3.5% processing fee)                │
│                                                          │
│  [Pay with Wire Transfer]                                │
│  (No fee, 2-5 business days)                             │
│                                                          │
│  [Pay with Cryptocurrency]                               │
│  (Bitcoin, USDC - 0% fee, instant)                       │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  This is a secure, one-time payment link.                │
│  Do not share this link with anyone.                     │
│                                                          │
│  Questions? Contact support@mahapeps.com                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Security:**
- Token-based (32-byte random hex)
- Expires after 48 hours
- One-time use only
- IP tracking
- Rate limiting
- HTTPS only

---

## Payment Processor Integration

### Epicor Propello Setup

**When available/approved:**

```typescript
// apps/api/src/payments/processors/epicor-propello.service.ts

import axios from 'axios';

@Injectable()
export class EpicorPropelloService {
  private apiUrl = process.env.EPICOR_PROPELLO_API_URL;
  private apiKey = process.env.EPICOR_PROPELLO_API_KEY;
  private merchantId = process.env.EPICOR_PROPELLO_MERCHANT_ID;

  async createPaymentLink(params: {
    amount: number;
    currency: string;
    orderId: string;
    customerEmail: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    const response = await axios.post(
      `${this.apiUrl}/payment-links`,
      {
        merchant_id: this.merchantId,
        amount: params.amount * 100, // Convert to cents
        currency: params.currency,
        order_id: params.orderId,
        customer_email: params.customerEmail,
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      id: response.data.id,
      url: response.data.url,
      status: response.data.status,
    };
  }

  async getPaymentLinkStatus(linkId: string) {
    const response = await axios.get(
      `${this.apiUrl}/payment-links/${linkId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      },
    );

    return response.data;
  }

  async handleWebhook(payload: any, signature: string) {
    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Handle different event types
    switch (payload.event_type) {
      case 'payment.succeeded':
        await this.handlePaymentSuccess(payload.data);
        break;
      case 'payment.failed':
        await this.handlePaymentFailure(payload.data);
        break;
      case 'payment.refunded':
        await this.handleRefund(payload.data);
        break;
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const crypto = require('crypto');
    const secret = process.env.EPICOR_PROPELLO_WEBHOOK_SECRET;

    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  private async handlePaymentSuccess(data: any) {
    // Find order by processor link ID
    const paymentLink = await this.prisma.paymentLink.findFirst({
      where: { processorLinkId: data.payment_link_id },
      include: { order: true },
    });

    if (!paymentLink) {
      throw new Error('Payment link not found');
    }

    // Create payment record
    await this.prisma.payment.create({
      data: {
        orderId: paymentLink.orderId,
        amount: data.amount / 100,
        currency: data.currency,
        status: 'COMPLETED',
        processorType: 'EPICOR_PROPELLO',
        processorTransactionId: data.transaction_id,
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: paymentLink.orderId },
      data: { status: 'PAID' },
    });

    // Update payment link status
    await this.prisma.paymentLink.update({
      where: { id: paymentLink.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Send confirmation email
    await this.emailService.sendOrderConfirmation(paymentLink.order);

    // Log for audit
    await this.auditService.logAction(
      'SYSTEM',
      null,
      'PAYMENT_RECEIVED',
      {
        orderId: paymentLink.orderId,
        amount: data.amount / 100,
        processor: 'EPICOR_PROPELLO',
      },
    );
  }
}
```

---

### Alternative: Wire Transfer Instructions

**If no processor available or for B2B orders:**

```typescript
// apps/api/src/payments/processors/wire-transfer.service.ts

@Injectable()
export class WireTransferService {
  async generateWireInstructions(order: Order) {
    return {
      bankName: 'JP Morgan Chase',
      accountName: 'MAHA Peptides LLC',
      accountNumber: '****1234',
      routingNumber: '021000021',
      swiftCode: 'CHASUS33',
      referenceNumber: order.orderNumber,
      amount: order.total,
      currency: 'USD',
      notes: `Please include order number ${order.orderNumber} in wire reference`,
    };
  }

  async sendWireInstructions(paymentLink: PaymentLink, order: Order) {
    const instructions = await this.generateWireInstructions(order);

    await this.emailService.send({
      to: paymentLink.customerEmail,
      subject: `Wire Transfer Instructions - Order ${order.orderNumber}`,
      template: 'wire-instructions',
      data: {
        orderNumber: order.orderNumber,
        amount: order.total,
        ...instructions,
      },
    });
  }
}
```

**Payment confirmation:**
- Admin manually confirms wire received
- Or: Integrate with bank API to auto-detect incoming wires
- Match by reference number (order number)

---

## SMS Service Integration

### Twilio Setup

```typescript
// apps/api/src/notifications/sms.service.ts

import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async send(params: { to: string; message: string }) {
    try {
      const result = await this.client.messages.create({
        body: params.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: params.to,
      });

      // Log SMS sent
      await this.prisma.smsLog.create({
        data: {
          to: params.to,
          message: params.message,
          status: 'SENT',
          twilioSid: result.sid,
        },
      });

      return result;
    } catch (error) {
      // Log failed SMS
      await this.prisma.smsLog.create({
        data: {
          to: params.to,
          message: params.message,
          status: 'FAILED',
          error: error.message,
        },
      });

      throw error;
    }
  }
}
```

**SMS Templates:**

```
Payment Link:
"Your MAHA Peptides payment link for order {orderNumber} (${amount}): {paymentUrl} (expires in 48h)"

Payment Received:
"Payment received for order {orderNumber}. Your order will ship within 1-3 business days. Track: {trackingUrl}"

Order Shipped:
"Order {orderNumber} shipped via {carrier}. Tracking: {trackingNumber}. Estimated delivery: {deliveryDate}"
```

---

## Email Templates

### Payment Link Email

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Professional email styling */
  </style>
</head>
<body>
  <div class="container">
    <h1>Secure Payment Link</h1>

    <p>Hello {{customerName}},</p>

    <p>Your order <strong>{{orderNumber}}</strong> has been approved and is ready for payment.</p>

    <div class="order-summary">
      <h2>Order Summary</h2>
      <p><strong>Total:</strong> ${{total}} USD</p>
      <p><strong>Items:</strong> {{itemCount}}</p>
    </div>

    <div class="payment-button">
      <a href="{{paymentUrl}}" class="btn">Pay Now - ${{total}}</a>
    </div>

    <p><strong>This link expires in 48 hours.</strong></p>

    <div class="disclaimer">
      <p>All products are sold strictly for research, laboratory, or analytical purposes only.</p>
    </div>

    <p>Questions? Contact us at support@mahapeps.com</p>
  </div>
</body>
</html>
```

---

## Frontend Updates

### Checkout Page (No Card Processing)

**Location:** `apps/web/app/(public)/checkout/page.tsx`

```typescript
export default function CheckoutPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);

    // Create order (PENDING_REVIEW)
    const order = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.items,
        shippingAddress: formData.address,
        phone: formData.phone,
        complianceAccepted: true,
      }),
    });

    // Show confirmation
    router.push(`/orders/${order.id}/pending`);
  };

  return (
    <div className="checkout-container">
      <h1>Complete Your Order</h1>

      <form onSubmit={handleSubmit}>
        {/* Shipping Address */}
        <section>
          <h2>Shipping Information</h2>
          <input name="fullName" required />
          <input name="address" required />
          <input name="city" required />
          <input name="state" required />
          <input name="zip" required />
          <input name="phone" type="tel" required placeholder="For payment link SMS" />
        </section>

        {/* Compliance Checkboxes */}
        <section>
          <h2>Research Use Acknowledgment</h2>
          <label>
            <input type="checkbox" required />
            I acknowledge that all products are for research purposes only
          </label>
          <label>
            <input type="checkbox" required />
            I accept full responsibility for proper handling
          </label>
          <label>
            <input type="checkbox" required />
            I understand this is not medical advice
          </label>
          <label>
            <input type="checkbox" required />
            I am at least 21 years of age
          </label>
          <label>
            <input type="checkbox" required />
            I agree to Terms of Service
          </label>
        </section>

        {/* Submit */}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Request Payment Link'}
        </button>
      </form>

      {/* Info Box */}
      <div className="info-box">
        <h3>What happens next?</h3>
        <ol>
          <li>We review your order for compliance (1-4 hours)</li>
          <li>You receive a secure payment link via SMS and email</li>
          <li>Complete payment within 48 hours</li>
          <li>Your order ships within 1-3 business days</li>
        </ol>
      </div>
    </div>
  );
}
```

---

### Order Pending Page

**Location:** `apps/web/app/(public)/orders/[id]/pending/page.tsx`

```typescript
export default function OrderPendingPage({ params }) {
  const { order } = await fetchOrder(params.id);

  return (
    <div className="order-pending">
      <CheckCircle className="success-icon" size={64} />

      <h1>Order Received!</h1>
      <p className="order-number">Order #{order.orderNumber}</p>

      <div className="status-card">
        <h2>What's Next?</h2>

        <div className="timeline">
          <div className="step active">
            <div className="step-icon">✓</div>
            <div className="step-content">
              <strong>Order Submitted</strong>
              <p>We received your order</p>
            </div>
          </div>

          <div className="step pending">
            <div className="step-icon">2</div>
            <div className="step-content">
              <strong>Compliance Review</strong>
              <p>Our team is reviewing your order (1-4 hours)</p>
            </div>
          </div>

          <div className="step pending">
            <div className="step-icon">3</div>
            <div className="step-content">
              <strong>Payment Link</strong>
              <p>We'll send a secure payment link to:</p>
              <ul>
                <li>📧 {order.user.email}</li>
                <li>📱 {order.user.phone}</li>
              </ul>
            </div>
          </div>

          <div className="step pending">
            <div className="step-icon">4</div>
            <div className="step-content">
              <strong>Complete Payment</strong>
              <p>Pay within 48 hours to confirm your order</p>
            </div>
          </div>
        </div>
      </div>

      <div className="order-summary">
        <h3>Order Summary</h3>
        {order.items.map(item => (
          <div key={item.id}>
            {item.product.name} x{item.quantity} - ${item.total}
          </div>
        ))}
        <div className="total">Total: ${order.total}</div>
      </div>

      <p className="help-text">
        Questions? Email us at <a href="mailto:support@mahapeps.com">support@mahapeps.com</a>
      </p>
    </div>
  );
}
```

---

## Environment Variables

```bash
# .env (apps/api)

# Payment Processor (Epicor Propello)
EPICOR_PROPELLO_ENABLED=false  # Set to true when approved
EPICOR_PROPELLO_API_URL=https://api.epicorpropello.com/v1
EPICOR_PROPELLO_API_KEY=your_api_key_here
EPICOR_PROPELLO_MERCHANT_ID=your_merchant_id
EPICOR_PROPELLO_WEBHOOK_SECRET=your_webhook_secret

# Wire Transfer (Backup Payment Method)
WIRE_TRANSFER_ENABLED=true
WIRE_BANK_NAME="JP Morgan Chase"
WIRE_ACCOUNT_NAME="MAHA Peptides LLC"
WIRE_ACCOUNT_NUMBER=****1234
WIRE_ROUTING_NUMBER=021000021
WIRE_SWIFT_CODE=CHASUS33

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# Email (Mailgun)
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=mg.mahapeps.com

# App URLs
APP_URL=https://mahapeps.com
API_URL=https://mahapeps.com/api

# Payment Link Settings
PAYMENT_LINK_EXPIRY_HOURS=48
PAYMENT_LINK_TOKEN_LENGTH=32
```

---

## Admin Dashboard Features

### 1. Pending Review Queue

**Features:**
- Real-time notification when new order submitted
- Compliance checklist per order
- Quick approve/reject buttons
- Bulk actions (approve multiple orders)
- Search and filter
- Assignment to specific admin

### 2. Payment Link Manager

**Features:**
- View all payment links
- Status tracking (Sent, Clicked, Paid, Expired)
- Resend payment link
- Cancel/regenerate link
- Expiration management
- Analytics (click-through rate, payment rate)

### 3. Payment Reconciliation

**Features:**
- Manual payment confirmation (wire transfers)
- Match payments to orders
- Refund processing
- Payment history per customer
- Export to CSV for accounting

### 4. Processor Switching

**Admin can choose processor per order:**
- Epicor Propello (when available)
- Wire transfer (B2B customers)
- Cryptocurrency (international)
- Manual/other

---

## Migration from Current Setup

### Step 1: Remove All Stripe References

**Files to update:**
- `.env.example` - Remove STRIPE_* variables
- `apps/api/src/payments/` - Delete Stripe service
- `apps/web/` - Remove Stripe Elements
- All documentation - Remove Stripe mentions

### Step 2: Implement Payment Link System

**Create:**
- `PaymentLink` model in Prisma
- `payment-link.service.ts`
- `sms.service.ts`
- Admin payment link UI
- Customer payment page

### Step 3: Add Epicor Propello (When Ready)

**When approved:**
- Add Epicor Propello credentials to `.env`
- Enable `EPICOR_PROPELLO_ENABLED=true`
- Test payment links
- Configure webhooks

---

## Cost Analysis

### SMS Costs (Twilio)
- $0.0079 per SMS (US)
- 1,000 orders/month = ~$8/month

### Email Costs (Mailgun)
- Free tier: 5,000 emails/month
- Or: $35/month for 50,000 emails

### Epicor Propello Fees (Estimated)
- Setup: $0-500
- Monthly: $50-150
- Processing: 4-6% + $0.30 (high-risk)
- Reserve: 5-10% rolling

### Total Estimated Monthly Costs
- Low volume (<100 orders): ~$50-100/month
- Medium volume (500 orders): ~$200-300/month
- High volume (2,000+ orders): $500-800/month

**Much lower than Stripe for high-risk!**

---

## Next Steps

1. **I'll update all documentation to remove Stripe**
2. **Create payment link system specifications**
3. **Update database schema**
4. **Create admin workflow designs**
5. **Update frontend checkout flow**

**What I need from you:**

1. **Twilio account** - Do you have one or need to set up?
2. **Epicor Propello status** - Are you in approval process?
3. **Backup payment method** - Wire transfer acceptable for B2B?
4. **Admin team size** - How many people reviewing orders?
5. **Expected order volume** - Orders per day/week?

Let me know and I'll create the complete implementation! 💳📱
