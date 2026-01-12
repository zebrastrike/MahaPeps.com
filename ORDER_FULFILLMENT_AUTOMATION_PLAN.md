# Order Fulfillment Automation Plan
## Payment via Zelle/CashApp with Shippo Integration

---

## Current System Status

### ✅ Already Built & Working

1. **Order Creation Flow**:
   - Users can add items to cart
   - Checkout creates order with PENDING_PAYMENT status
   - Compliance acknowledgments captured
   - Order stored in database with 72-hour expiration

2. **Email System**:
   - Payment instructions email sent to customer
   - Includes Zelle and CashApp payment info
   - Order summary with line items
   - Payment link for proof upload
   - All compliance disclaimers included

3. **Shippo Integration**:
   - Service configured and ready
   - Can create shipping labels
   - Validates order is PAID before creating label
   - Returns tracking numbers
   - Supports USPS, FedEx, UPS

4. **Email Templates Exist For**:
   - Payment instructions (sent at checkout)
   - Payment verified (sent after admin confirms payment)
   - Shipping confirmation with tracking (sent after label creation)

### ⚠️ What's Missing (Needs to Be Built)

1. **Order Number in Payment Instructions** - NOT showing prominently
2. **Owner Notification Email** - When new order placed
3. **Processing Time Rules** - 10am cutoff, 2-day standard processing
4. **Expedited Processing Option** - Fee-based rush processing
5. **Admin Dashboard Improvements** - Easy payment confirmation workflow
6. **Shippo Auto-population** - Create draft shipment without purchasing label
7. **Owner Packing Instructions** - What to do when payment received

---

## Desired Workflow

### Customer Side:
1. **Place Order** → Checkout with compliance checkboxes
2. **Receive Email** → Invoice with Zelle/CashApp instructions + **ORDER NUMBER**
3. **Make Payment** → Send via Zelle/CashApp **including order number in payment note**
4. **Upload Proof** → Via payment link (take screenshot)
5. **Wait for Confirmation** → Owner verifies payment
6. **Receive Shipping Notification** → Tracking number sent via email

### Owner Side:
1. **Receive Order Notification Email** → "New Order #12345 - $234.50" (immediate)
2. **Wait for Payment** → Customer pays via Zelle/CashApp
3. **Check Payment** → Look for order number in payment note/memo
4. **Verify in Admin Dashboard** → Mark order as PAID
5. **System Auto-Creates Shippo Draft** → When marked PAID
6. **Owner Reviews Shippo** → Verifies address, weight, etc.
7. **Purchase Label** → Click in Shippo or admin dashboard
8. **Pack Order** → Print label, pack items
9. **Ship Package** → Drop at post office
10. **Tracking Auto-Sent** → Customer receives email with tracking

---

## Implementation Plan

### Phase 1: Critical Payment Flow Updates (Do First)

#### 1.1 Update Payment Instructions Email Template
**File**: `apps/api/src/modules/notifications/email-templates.service.ts`

**Changes Needed**:
```typescript
// Line 100-130 area - Update the payment instructions section:

<div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
  <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">
    Order Number: <span style="color: #2563eb; font-size: 28px; font-family: monospace;">#{params.orderId}</span>
  </p>
  <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">
    Total Amount Due: <span style="color: #059669; font-size: 24px;">$${params.orderTotal}</span>
  </p>

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
      <strong>Zelle:</strong> Send to <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">payments@mahapeps.com</code>
      <br><span style="font-size: 13px; color: #6b7280;">Include "#${params.orderId}" in note field</span>
    </li>
    <li style="margin-bottom: 8px;">
      <strong>CashApp:</strong> Send to <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">$MahaPeps</code>
      <br><span style="font-size: 13px; color: #6b7280;">Include "#${params.orderId}" in note field</span>
    </li>
    <li><strong>Wire Transfer:</strong> Contact support@mahapeps.com for wire instructions</li>
  </ul>

  <!-- Add Processing Time Info -->
  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 20px; border-radius: 4px;">
    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">Processing & Shipping Timeline:</p>
    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
      <li><strong>Payment Verification:</strong> Within 24 hours of receiving payment</li>
      <li><strong>Standard Processing:</strong> 2 business days after payment confirmation</li>
      <li><strong>Orders paid before 10:00 AM EST:</strong> Same-day processing (ship today)</li>
      <li><strong>Orders paid after 10:00 AM EST:</strong> Next business day processing</li>
      <li><strong>Expedited Processing Available:</strong> Contact us for rush orders</li>
    </ul>
  </div>
</div>
```

**Estimated Time**: 30 minutes

---

#### 1.2 Create Owner Notification Email Template
**File**: `apps/api/src/modules/notifications/email-templates.service.ts`

**Add New Method**:
```typescript
/**
 * New order notification for owner/admin
 */
getNewOrderNotificationEmail(params: {
  orderId: string;
  orderTotal: string;
  customerEmail: string;
  customerName?: string;
  itemCount: number;
  items: Array<{
    productName: string;
    quantity: number;
    lineTotal: string;
  }>;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentLinkUrl: string;
}): { subject: string; html: string } {
  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
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

      <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 3px solid #2563eb;">

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin-bottom: 24px; text-align: center;">
          <h1 style="color: #1e40af; margin: 0; font-size: 28px;">🛒 New Order Received!</h1>
          <p style="color: #1e40af; margin: 8px 0 0 0; font-size: 20px; font-weight: 600;">Order #${params.orderId}</p>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
          <p style="margin: 0; font-weight: 600; color: #92400e;">
            ⏳ Awaiting Customer Payment
          </p>
          <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
            Customer will pay via Zelle/CashApp. Check your payment app for order number <strong>#${params.orderId}</strong> in the payment note.
          </p>
        </div>

        <h2 style="color: #111827; font-size: 18px; margin-top: 24px; margin-bottom: 12px;">Order Details</h2>

        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0;"><strong>Customer:</strong> ${params.customerName || 'N/A'} (${params.customerEmail})</p>
          <p style="margin: 0 0 8px 0;"><strong>Total Amount:</strong> <span style="color: #059669; font-size: 20px; font-weight: 700;">$${params.orderTotal}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>Items:</strong> ${params.itemCount} items</p>
        </div>

        <h3 style="color: #111827; font-size: 16px; margin-bottom: 12px;">Items to Pack:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Product</th>
              <th style="padding: 12px; text-align: center; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h3 style="color: #111827; font-size: 16px; margin-bottom: 12px;">Ship To:</h3>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 24px; font-family: monospace;">
          <p style="margin: 0; line-height: 1.6;">
            ${params.shippingAddress.line1}<br>
            ${params.shippingAddress.line2 ? params.shippingAddress.line2 + '<br>' : ''}
            ${params.shippingAddress.city}, ${params.shippingAddress.state} ${params.shippingAddress.postalCode}<br>
            ${params.shippingAddress.country}
          </p>
        </div>

        <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin-top: 24px; border-radius: 4px;">
          <h3 style="margin: 0 0 12px 0; color: #166534;">✅ Next Steps:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #166534; line-height: 1.8;">
            <li><strong>Wait for Payment:</strong> Customer will send $${params.orderTotal} via Zelle/CashApp with order #${params.orderId} in note</li>
            <li><strong>Verify Payment:</strong> Check Zelle/CashApp for payment with order number</li>
            <li><strong>Mark as Paid:</strong> Go to admin dashboard and mark order as PAID</li>
            <li><strong>System Auto-Creates Shippo Label Draft:</strong> Review and purchase label</li>
            <li><strong>Pack & Ship:</strong> Print label, pack items, ship before cutoff time</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${params.paymentLinkUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
            View Order in Admin Dashboard
          </a>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-top: 24px; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.6;">
            <strong>Processing Time Reminders:</strong><br>
            • Orders paid before 10 AM EST = same-day processing<br>
            • Orders paid after 10 AM EST = next business day<br>
            • Standard processing: 2 business days from payment
          </p>
        </div>

      </div>

    </body>
    </html>
  `;

  return { subject, html };
}
```

**Estimated Time**: 1 hour

---

#### 1.3 Send Owner Notification on Checkout
**File**: `apps/api/src/modules/cart/checkout.service.ts`

**Add After Line 214** (after customer email is sent):

```typescript
// Send owner notification email
try {
  const ownerEmail = process.env.OWNER_EMAIL || 'owner@mahapeps.com';
  const adminDashboardUrl = `${process.env.FRONTEND_URL}/admin/orders/${order.id}`;

  const ownerEmailTemplate = this.emailTemplates.getNewOrderNotificationEmail({
    orderId: order.id,
    orderTotal: order.total.toString(),
    customerEmail: order.user.email,
    customerName: order.user.name,
    itemCount: order.items.length,
    items: order.items.map((item) => ({
      productName: item.product?.name || 'Product',
      quantity: parseFloat(item.quantity.toString()),
      lineTotal: item.lineTotal.toString(),
    })),
    shippingAddress: {
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
    paymentLinkUrl: adminDashboardUrl,
  });

  await this.notifications.sendEmail({
    to: ownerEmail,
    subject: ownerEmailTemplate.subject,
    html: ownerEmailTemplate.html,
  });
} catch (error) {
  console.error('Failed to send owner notification email:', error);
}
```

**Environment Variable Needed**:
Add to `.env.local`:
```
OWNER_EMAIL=your-actual-email@mahapeps.com
```

**Estimated Time**: 30 minutes

---

### Phase 2: Processing Time & Expedited Options

#### 2.1 Add Order Processing Type to Database
**File**: `apps/api/prisma/schema.prisma`

**Add to Order model**:
```prisma
model Order {
  // ... existing fields

  processingType    ProcessingType @default(STANDARD)
  processingFee     Decimal        @default(0) @db.Decimal(10, 2)
  expectedShipDate  DateTime?

  // ... rest of model
}

enum ProcessingType {
  STANDARD       // 2 business days
  EXPEDITED      // 1 business day ($25 fee)
  RUSH           // Same day if before 10am ($50 fee)
}
```

**Run migration**:
```bash
cd apps/api
npx prisma migrate dev --name add-processing-type
```

**Estimated Time**: 20 minutes

---

#### 2.2 Add Processing Type Selection to Checkout Page
**File**: `apps/web/src/app/(public)/checkout/page.tsx`

**Add After Shipping Method Section** (around line 450):

```typescript
// Add to state at top:
const [processingType, setProcessingType] = useState<'STANDARD' | 'EXPEDITED' | 'RUSH'>('STANDARD');

// Processing fees
const processingFees = {
  STANDARD: 0,
  EXPEDITED: 25,
  RUSH: 50,
};

// Add section after shipping rates:
{shippingRates.length > 0 && (
  <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
    <h2 className="mb-4 text-xl font-bold text-clinical-white">Processing Speed</h2>

    <div className="space-y-3">
      {/* STANDARD */}
      <label
        className={`flex cursor-pointer items-start justify-between rounded-md border p-4 transition-colors ${
          processingType === 'STANDARD'
            ? "border-teal-500 bg-teal-900/20"
            : "border-charcoal-600 hover:border-charcoal-500"
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="processingType"
            checked={processingType === 'STANDARD'}
            onChange={() => setProcessingType('STANDARD')}
            className="mt-1 text-teal-500"
          />
          <div>
            <div className="font-medium text-clinical-white">Standard Processing</div>
            <div className="text-sm text-charcoal-400">2 business days - FREE</div>
            <div className="text-xs text-charcoal-500 mt-1">
              Orders paid before 10 AM EST may ship same day
            </div>
          </div>
        </div>
        <div className="text-lg font-bold text-clinical-white">FREE</div>
      </label>

      {/* EXPEDITED */}
      <label
        className={`flex cursor-pointer items-start justify-between rounded-md border p-4 transition-colors ${
          processingType === 'EXPEDITED'
            ? "border-teal-500 bg-teal-900/20"
            : "border-charcoal-600 hover:border-charcoal-500"
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="processingType"
            checked={processingType === 'EXPEDITED'}
            onChange={() => setProcessingType('EXPEDITED')}
            className="mt-1 text-teal-500"
          />
          <div>
            <div className="font-medium text-clinical-white">Expedited Processing</div>
            <div className="text-sm text-charcoal-400">1 business day</div>
          </div>
        </div>
        <div className="text-lg font-bold text-clinical-white">+$25.00</div>
      </label>

      {/* RUSH */}
      <label
        className={`flex cursor-pointer items-start justify-between rounded-md border p-4 transition-colors ${
          processingType === 'RUSH'
            ? "border-teal-500 bg-teal-900/20"
            : "border-charcoal-600 hover:border-charcoal-500"
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="processingType"
            checked={processingType === 'RUSH'}
            onChange={() => setProcessingType('RUSH')}
            className="mt-1 text-teal-500"
          />
          <div>
            <div className="font-medium text-clinical-white">Rush Processing</div>
            <div className="text-sm text-charcoal-400">Same day (if ordered before 10 AM EST)</div>
            <div className="text-xs text-charcoal-500 mt-1">
              Guaranteed same-day processing
            </div>
          </div>
        </div>
        <div className="text-lg font-bold text-clinical-white">+$50.00</div>
      </label>
    </div>
  </section>
)}

// Update the order summary to include processing fee:
<div className="flex justify-between text-charcoal-300">
  <span>Processing</span>
  <span>${processingFees[processingType].toFixed(2)}</span>
</div>

// Update total calculation:
const processingFee = processingFees[processingType];
const finalTotal = cart.subtotal + parseFloat(selectedRate?.amount || '0') + processingFee;
```

**Update checkout API call** to include `processingType` in body.

**Estimated Time**: 1 hour

---

### Phase 3: Admin Dashboard & Shippo Auto-Creation

#### 3.1 Create Payment Confirmation Workflow
**File**: `apps/api/src/modules/admin/admin-orders.controller.ts`

**Add New Endpoint**:

```typescript
@Post(':orderId/confirm-payment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async confirmPayment(
  @Param('orderId') orderId: string,
  @Body() body: { notes?: string },
  @Req() request: Request,
) {
  const user = (request as any).user;

  // Update order status to PAID
  const order = await this.prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PAID,
      paidAt: new Date(),
    },
    include: {
      user: true,
      items: {
        include: { product: true },
      },
      shippingAddress: true,
    },
  });

  // Send payment verified email to customer
  const emailTemplate = this.emailTemplates.getPaymentVerifiedEmail({
    orderId: order.id,
    customerEmail: order.user.email,
    orderTotal: order.total.toString(),
  });

  await this.notifications.sendEmail({
    to: order.user.email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  });

  // Auto-create Shippo draft (but don't purchase label yet)
  await this.createShippoDraft(orderId);

  // Audit log
  await this.audit.log({
    userId: user.id,
    action: 'ORDER_PAYMENT_CONFIRMED',
    entityType: 'Order',
    entityId: orderId,
    metadata: { notes: body.notes },
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
  });

  return { success: true, order };
}

private async createShippoDraft(orderId: string) {
  // Creates a draft shipment in Shippo without purchasing the label
  // Owner will review and purchase manually

  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      shippingAddress: true,
      user: true,
    },
  });

  if (!order) return;

  // Call Shippo to create draft
  // Store draft ID in database for later purchase
  // Implementation details in shippo.service.ts
}
```

**Estimated Time**: 2 hours

---

#### 3.2 Update Admin Orders Dashboard UI
**File**: `apps/web/src/app/admin/(admin)/orders/page.tsx` or `[orderId]/page.tsx`

**Add "Confirm Payment" Button**:

```typescript
{order.status === 'PENDING_PAYMENT' && (
  <div className="rounded-lg border-2 border-yellow-500 bg-yellow-50 p-6">
    <h3 className="text-lg font-semibold text-yellow-900">⏳ Awaiting Payment Confirmation</h3>
    <p className="mt-2 text-sm text-yellow-800">
      Customer should have sent ${order.total.toFixed(2)} via Zelle/CashApp with order #{order.id} in the payment note.
    </p>
    <button
      onClick={() => confirmPayment(order.id)}
      className="mt-4 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
    >
      ✅ Confirm Payment Received
    </button>
  </div>
)}

{order.status === 'PAID' && !order.shippoLabelId && (
  <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6">
    <h3 className="text-lg font-semibold text-blue-900">📦 Ready to Ship</h3>
    <p className="mt-2 text-sm text-blue-800">
      Payment confirmed. Shippo draft created. Review and purchase shipping label.
    </p>
    <button
      onClick={() => window.open(`https://app.goshippo.com/orders/${order.id}`, '_blank')}
      className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
    >
      🚀 Open in Shippo to Purchase Label
    </button>
  </div>
)}
```

**Estimated Time**: 1.5 hours

---

## Summary of Features

### Fully Automated:
✅ Order creation and email to customer
✅ Owner notification email when order placed
✅ Payment instructions with ORDER NUMBER prominently displayed
✅ Reminder to include order number in payment note
✅ Processing time info in emails (10am cutoff, 2-day standard)
✅ Payment confirmation triggers customer "payment verified" email
✅ Shippo draft auto-created when payment confirmed
✅ Tracking email sent when label purchased

### Semi-Automated (Owner Action Required):
⚙️ Owner checks Zelle/CashApp for payment (matches order number)
⚙️ Owner clicks "Confirm Payment" in admin dashboard
⚙️ Owner reviews Shippo draft and purchases label
⚙️ Owner packs order and ships

### New Features Added:
🎉 Expedited processing options ($25 for 1-day, $50 for rush)
🎉 10am cutoff logic in email templates
🎉 2-day standard processing communicated to customers
🎉 Order number in payment instructions (LARGE and PROMINENT)
🎉 Owner notification with full packing list
🎉 One-click payment confirmation in admin dashboard
🎉 Shippo integration that creates drafts but doesn't auto-purchase

---

## Environment Variables Needed

Add to `.env` or `.env.local`:

```bash
# Owner notifications
OWNER_EMAIL=your-email@mahapeps.com

# Shippo API
SHIPPO_API_KEY=your_shippo_api_key_here
SHIPPO_RETURN_ADDRESS_ID=optional_saved_address_id

# Email service (if not already configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@mahapeps.com
SMTP_PASS=your-app-password
```

---

## Policy Document Updates Needed

Add to your Terms of Service and Shipping Policy:

### Order Processing Times:
- **Standard Processing**: 2 business days from payment confirmation (FREE)
- **Same-Day Processing**: Orders paid before 10:00 AM Eastern Time may be processed and shipped the same business day at no extra charge
- **Expedited Processing**: 1 business day guarantee ($25 fee)
- **Rush Processing**: Same-day processing guarantee if paid before 10:00 AM Eastern ($50 fee)

### Payment Terms:
- Accepted Methods: Zelle, CashApp, Wire Transfer
- Payment must include order number in payment note/memo
- Payment verification: within 24 hours
- Orders expire if unpaid after 72 hours
- No credit card processing

### Shipping Cutoff Times:
- Packages ship same day if:
  - Payment confirmed before 10:00 AM Eastern
  - Rush processing purchased
  - Items in stock
- All other orders ship within 2 business days

---

## Implementation Timeline

**Total Estimated Time**: 8-10 hours

### Priority 1 (Do Immediately - 2 hours):
- Update payment instructions email with ORDER NUMBER emphasis
- Add owner notification email
- Test both emails

### Priority 2 (Next Day - 3 hours):
- Add processing type to database (migration)
- Add expedited processing options to checkout page
- Update checkout to include processing fees

### Priority 3 (Following Days - 4 hours):
- Create payment confirmation endpoint
- Update admin dashboard UI
- Implement Shippo draft creation
- Test full workflow end-to-end

---

## Testing Checklist

Before going live:
- [ ] Place test order, verify customer receives email with ORDER NUMBER
- [ ] Verify owner receives notification email immediately
- [ ] Test payment confirmation workflow
- [ ] Verify "payment verified" email sent to customer
- [ ] Test Shippo draft creation
- [ ] Verify tracking email sent when label purchased
- [ ] Test all 3 processing type options (standard, expedited, rush)
- [ ] Verify processing fees calculate correctly
- [ ] Test 10am cutoff logic displays correctly in emails

---

## Questions to Answer

1. **What time zone is your business in?** (for 10am cutoff)
   - Currently set to Eastern Time

2. **What are your actual Zelle/CashApp handles?**
   - Update in email template

3. **Do you want customers to be able to upload payment proof?**
   - Payment link page already supports this
   - Need to enable file upload if not working

4. **Shippo workflow - prefer:**
   - Option A: System creates draft, you purchase in Shippo dashboard
   - Option B: System creates draft, you click "purchase" in YOUR admin dashboard (then calls Shippo API)
   - **Recommendation**: Option A (simpler, less risk of errors)

5. **Saturday/Sunday orders:**
   - Count as next business day?
   - Or offer weekend processing for extra fee?

---

## Next Steps

1. **Review this plan** - confirm workflow makes sense
2. **Answer questions above**
3. **I'll implement Priority 1 items** (payment email updates + owner notifications)
4. **Test in development**
5. **Move to Priority 2 & 3**

Ready to start implementing?
