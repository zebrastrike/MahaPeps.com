# Stripe Removal & Payment Link Migration Checklist

## Overview

**Goal:** Remove ALL Stripe references and implement private payment link system with Epicor Propello (or similar high-risk processor).

**Status:** 🔄 In Progress

---

## Files Updated

### ✅ Completed

- [x] [PAYMENT_STRATEGY.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/PAYMENT_STRATEGY.md) - Created comprehensive payment link strategy
- [x] [.env.example](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/.env.example) - Removed Stripe, added Epicor Propello + Twilio
- [x] [.codex/MASTER_PROMPT.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/.codex/MASTER_PROMPT.md) - Updated with research-only compliance (partial)

### 🔄 Needs Update

#### High Priority (Remove Stripe References)

- [ ] `.codex/MASTER_PROMPT.md` - Remove Stripe from tech stack section
- [ ] `.codex/FEATURE_PROMPTS.md` - Update Prompts 6-7 (payment processing)
- [ ] `.tessl/project.yaml` - Update stack and dependencies
- [ ] `RECOMMENDATIONS.md` - Remove Stripe optimization sections

#### Medium Priority (Backend Code)

- [ ] `apps/api/src/payments/` - Delete Stripe service files (if exist)
- [ ] `apps/api/package.json` - Remove `stripe` dependency
- [ ] `prisma/schema.prisma` - Update Payment model for payment links

#### Low Priority (Frontend Code)

- [ ] `apps/web/package.json` - Remove `@stripe/stripe-js` and `@stripe/react-stripe-js`
- [ ] `apps/web/app/(public)/checkout/` - Remove Stripe Elements
- [ ] Any Stripe-related components

---

## Documentation Updates Needed

### 1. Update MASTER_PROMPT.md Tech Stack

**Find and replace:**

❌ **Remove:**
```
**Payments:** Stripe (configurable for high-risk processors)
```

✅ **Replace with:**
```
**Payments:** Private payment links via SMS/Email + Epicor Propello (or similar high-risk processor)
**SMS:** Twilio for payment link delivery
```

**Also update Integration Points section:**

❌ **Remove:**
```
### Payment Processing (Stripe)
- Checkout session creation
- Webhook handling for payment events
- Refund processing
- Dispute management
- Risk scoring
```

✅ **Replace with:**
```
### Payment Processing (Payment Links)
- Private payment link generation
- Order review and approval workflow
- Epicor Propello integration (when available)
- Wire transfer as backup method
- SMS delivery via Twilio
- Payment webhook handling
- Manual payment reconciliation
```

---

### 2. Update FEATURE_PROMPTS.md

**Prompts to rewrite:**

#### Prompt 6: Implement Payment Link System ⚠️ **CRITICAL UPDATE**

**OLD (Stripe-based):**
```markdown
### Prompt 6: Implement Stripe Payment Integration
Implement Stripe payment processing...
```

**NEW (Payment Link-based):**
```markdown
### Prompt 6: Implement Private Payment Link System

Implement secure payment link generation and delivery system.

Requirements:

Order Review Workflow:
- Admin dashboard for pending order review
- Compliance checklist per order
- Approve/reject with notes
- Bulk approval for trusted customers

Payment Link Generation:
- Generate secure token (32-byte hex)
- Create payment link: /pay/{token}
- Set 48-hour expiration
- Support multiple payment methods:
  - Epicor Propello (credit card)
  - Wire transfer
  - Cryptocurrency

Link Delivery:
- Send via SMS (Twilio)
- Send via Email (Mailgun)
- Track delivery status
- Track link clicks
- Track payment completion

Database Models:
```prisma
model PaymentLink {
  id              String   @id @default(cuid())
  orderId         String   @unique
  token           String   @unique
  amount          Float
  expiresAt       DateTime
  status          PaymentLinkStatus
  sentVia         String[]
  processorType   String?
  processorUrl    String?

  order           Order    @relation(fields: [orderId], references: [id])
}

enum PaymentLinkStatus {
  PENDING
  SENT
  CLICKED
  PAID
  EXPIRED
  CANCELED
}
```

API Endpoints:
- POST /admin/orders/:id/approve - Approve order and generate payment link
- POST /admin/orders/:id/reject - Reject order with reason
- GET /pay/:token - Customer payment page
- POST /pay/:token/complete - Process payment
- POST /webhooks/epicor-propello - Webhook handler

Security:
- Token-based authentication
- 48-hour expiration
- One-time use only
- IP tracking
- Rate limiting
- HTTPS required

SMS Integration:
```typescript
// Send payment link via Twilio
await twilioClient.messages.create({
  to: customer.phone,
  from: process.env.TWILIO_PHONE_NUMBER,
  body: `Your MAHA Peptides payment link: ${paymentUrl} (expires in 48h)`
});
```

Email Integration:
- Professional HTML template
- Payment link button
- Order summary
- Expiration notice
- Support contact

Admin Features:
- Pending review queue
- Payment link status dashboard
- Resend payment link
- Cancel/regenerate link
- Manual payment confirmation (wire transfers)

Reference PAYMENT_STRATEGY.md for complete implementation details.
```

---

#### Prompt 7: Build Payment Link UI ⚠️ **CRITICAL UPDATE**

**OLD (Stripe Elements):**
```markdown
### Prompt 7: Integrate Stripe Elements in Checkout
```

**NEW:**
```markdown
### Prompt 7: Build Payment Link Customer Experience

Build customer-facing payment link page and checkout flow.

Requirements:

Checkout Page (NO card processing):
- Shipping address form
- Phone number (required for SMS)
- Email (required)
- Compliance checkboxes (5 required)
- Submit button: "Request Payment Link"
- No payment information collected

After Submission:
- Redirect to /orders/{id}/pending
- Show "Order Received" message
- Explain next steps:
  1. Order review (1-4 hours)
  2. Payment link sent via SMS + Email
  3. Complete payment within 48 hours
  4. Order ships in 1-3 days

Payment Link Page (/pay/{token}):
- Verify token valid and not expired
- Display order summary
- Show payment options:
  - Credit card (via Epicor Propello iframe)
  - Wire transfer (show instructions)
  - Cryptocurrency (show QR code)
- Security notice
- Expiration countdown

Payment Options UI:
```typescript
// Option 1: Epicor Propello (if available)
<div className="payment-option">
  <h3>Pay with Card</h3>
  <p>Credit/Debit Card - 3.5% processing fee</p>
  {processorUrl && (
    <iframe src={processorUrl} />
  )}
</div>

// Option 2: Wire Transfer
<div className="payment-option">
  <h3>Pay with Wire Transfer</h3>
  <p>No fee - 2-5 business days</p>
  <WireInstructions order={order} />
</div>

// Option 3: Cryptocurrency
<div className="payment-option">
  <h3>Pay with Crypto</h3>
  <p>Bitcoin, USDC - 0% fee - Instant</p>
  <CryptoPayment order={order} />
</div>
```

Order Pending Page:
- Order number
- Status timeline
- Contact information sent to
- Estimated timeline
- Help/support contact

Security Features:
- Token validation
- Expiration check
- One-time use enforcement
- IP logging
- Rate limiting

Mobile Responsive:
- Payment link page optimized for mobile (SMS clicks)
- Touch-friendly payment option selection
- Easy copy/paste for wire instructions
- Mobile wallet support for crypto

Error Handling:
- Expired link message with "Request New Link" button
- Invalid token message
- Already paid message
- Payment failed message with retry option

Use Radix UI for accessible components.
Add loading states during payment processing.
Reference PAYMENT_STRATEGY.md for complete specs.
```

---

### 3. Update RECOMMENDATIONS.md

**Find and remove these sections:**

- ❌ "Payment Security Enhancements" → Section 2.2 (Stripe-specific)
- ❌ "Stripe Radar (Fraud Detection)"
- ❌ "3D Secure Authentication"
- ❌ Cost optimization section mentioning Stripe fees

**Add new section:**

✅ **Payment Link Security Best Practices**
```markdown
### Payment Link Security

**Token Generation:**
- Use cryptographically secure random tokens (32 bytes)
- One-time use only
- 48-hour expiration
- Store hashed tokens in database

**Delivery Security:**
- Send to verified phone + email only
- Track delivery status
- Log all access attempts
- Alert on suspicious activity

**Payment Page Security:**
- HTTPS required
- CORS restrictions
- Rate limiting (max 5 attempts per hour)
- IP whitelisting option for B2B customers
- Webhook signature validation

**Fraud Prevention:**
- Manual order review before payment link generation
- Customer vetting (new vs returning)
- Order velocity checks
- Geographic restrictions
- Product-specific limits
```

---

### 4. Update .tessl/project.yaml

**Find and replace:**

```yaml
# Current
stack:
  services:
    - "Stripe (Payments)"

# Replace with
stack:
  services:
    - "Epicor Propello or similar (High-Risk Payment Processing)"
    - "Twilio (SMS Delivery)"
    - "Mailgun (Email)"

key_dependencies:
  backend:
    - "@nestjs/common"
    - "twilio"        # ADD
    - "mailgun-js"    # Already exists

  # Remove if exists:
  # - "stripe"
```

---

## Code Files to Check

### Backend Files

```
apps/api/src/
├── payments/
│   ├── payment-link.service.ts       ← CREATE NEW
│   ├── payment-link.controller.ts    ← CREATE NEW
│   ├── processors/
│   │   ├── epicor-propello.service.ts   ← CREATE NEW
│   │   ├── wire-transfer.service.ts     ← CREATE NEW
│   │   └── crypto.service.ts            ← CREATE NEW (optional)
│   ├── payments.service.ts           ← UPDATE (remove Stripe)
│   └── dto/
│       ├── create-payment-link.dto.ts   ← CREATE NEW
│       └── payment-webhook.dto.ts       ← UPDATE
├── notifications/
│   ├── sms.service.ts                ← CREATE NEW (Twilio)
│   └── email.service.ts              ← UPDATE (payment link template)
└── admin/
    └── order-review.controller.ts    ← CREATE NEW
```

**Search for "stripe" (case-insensitive):**
```bash
cd apps/api
grep -ri "stripe" src/
```

**Remove if found:**
- `import Stripe from 'stripe'`
- `new Stripe(...)`
- Any Stripe-related code

---

### Frontend Files

```
apps/web/
├── app/
│   ├── (public)/
│   │   ├── checkout/page.tsx         ← UPDATE (remove Stripe Elements)
│   │   ├── pay/[token]/page.tsx      ← CREATE NEW
│   │   └── orders/[id]/pending/page.tsx  ← CREATE NEW
│   └── (admin)/
│       └── orders/pending-review/page.tsx  ← CREATE NEW
├── components/
│   ├── PaymentLinkButton.tsx         ← CREATE NEW
│   ├── WireInstructions.tsx          ← CREATE NEW
│   └── OrderStatusTimeline.tsx       ← CREATE NEW
└── lib/
    └── payment-link.ts                ← CREATE NEW (API calls)
```

**Search for Stripe:**
```bash
cd apps/web
grep -ri "stripe" app/ components/
```

**Remove if found:**
- `import { loadStripe } from '@stripe/stripe-js'`
- `import { Elements } from '@stripe/react-stripe-js'`
- Any Stripe Elements components

---

## Database Migration

### Add New Models

```prisma
// prisma/schema.prisma

model PaymentLink {
  id                String            @id @default(cuid())
  orderId           String            @unique
  token             String            @unique
  amount            Float
  currency          String            @default("USD")
  expiresAt         DateTime
  status            PaymentLinkStatus @default(PENDING)
  sentVia           String[]
  sentAt            DateTime?
  clickedAt         DateTime?
  paidAt            DateTime?
  processorType     String?
  processorLinkId   String?
  processorUrl      String?
  customerPhone     String?
  customerEmail     String
  ipAddress         String?
  userAgent         String?

  order             Order             @relation(fields: [orderId], references: [id])

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([token])
  @@index([status])
  @@index([expiresAt])
}

enum PaymentLinkStatus {
  PENDING
  SENT
  CLICKED
  PAID
  EXPIRED
  CANCELED
  FAILED
}

model SmsLog {
  id          String   @id @default(cuid())
  to          String
  message     String
  status      String   // SENT, FAILED
  twilioSid   String?
  error       String?
  createdAt   DateTime @default(now())

  @@index([to])
  @@index([createdAt])
}
```

### Update Existing Models

```prisma
model Order {
  // Add fields
  paymentLinkId     String?      @unique
  paymentLink       PaymentLink? @relation(fields: [paymentLinkId], references: [id])
  complianceReviewed Boolean    @default(false)
  complianceApproved Boolean?
  complianceNotes    String?
  reviewedBy         String?
  reviewedAt         DateTime?
}

// Update OrderStatus enum
enum OrderStatus {
  PENDING_REVIEW     // NEW - waiting for admin review
  REVIEW_REJECTED    // NEW - admin rejected
  PENDING_PAYMENT    // Updated - payment link sent
  PAYMENT_FAILED
  PAID
  FULFILLING
  SHIPPED
  COMPLETED
  CANCELED
  REFUNDED
}

model Payment {
  // Update to support multiple processors
  processorType          String  // "EPICOR_PROPELLO", "WIRE", "CRYPTO", "MANUAL"
  processorTransactionId String?

  // Wire transfer specific
  wireReference          String?
  wireDate               DateTime?

  // Crypto specific
  cryptoCurrency         String?
  cryptoTxHash           String?
  cryptoAddress          String?
}
```

### Run Migration

```bash
cd apps/api
npx prisma migrate dev --name add-payment-links
npx prisma generate
```

---

## Package.json Updates

### Remove Stripe Dependencies

**apps/api/package.json:**
```bash
npm uninstall stripe
```

**apps/web/package.json:**
```bash
npm uninstall @stripe/stripe-js @stripe/react-stripe-js
```

### Add New Dependencies

**apps/api/package.json:**
```bash
npm install twilio mailgun-js
```

**apps/web/package.json:**
```bash
# No new dependencies needed for payment links
# (uses standard fetch and Next.js)
```

---

## Testing Checklist

### Unit Tests

- [ ] PaymentLinkService.generatePaymentLink()
- [ ] PaymentLinkService.validateToken()
- [ ] PaymentLinkService.checkExpiration()
- [ ] SmsService.send()
- [ ] EpicorPropelloService.createPaymentLink()
- [ ] WireTransferService.generateInstructions()

### Integration Tests

- [ ] POST /admin/orders/:id/approve - Generates payment link
- [ ] GET /pay/:token - Returns payment page
- [ ] POST /pay/:token/complete - Processes payment
- [ ] POST /webhooks/epicor-propello - Handles webhook
- [ ] Expired link returns 410 Gone
- [ ] Invalid token returns 404 Not Found

### E2E Tests

- [ ] Customer submits order → Admin approves → Customer receives SMS + Email
- [ ] Customer clicks payment link → Completes payment → Order status updates
- [ ] Payment link expires after 48 hours
- [ ] Multiple click attempts tracked
- [ ] Wire transfer manual confirmation workflow
- [ ] Admin can resend payment link

### Manual Testing

- [ ] SMS delivery (Twilio sandbox)
- [ ] Email delivery (Mailgun sandbox)
- [ ] Payment link page mobile responsive
- [ ] Epicor Propello iframe loads correctly (when available)
- [ ] Wire instructions display correctly
- [ ] Admin dashboard usable

---

## Deployment Checklist

### Environment Variables

- [ ] Set TWILIO_* credentials
- [ ] Set MAILGUN_* credentials
- [ ] Set EPICOR_PROPELLO_* credentials (when available)
- [ ] Set WIRE_TRANSFER_* details
- [ ] Set APP_URL and API_URL
- [ ] Set ENCRYPTION_KEY for PII

### Database

- [ ] Run migrations on production
- [ ] Verify new models created
- [ ] Check indexes created

### Monitoring

- [ ] Set up SMS delivery monitoring
- [ ] Set up payment link expiration monitoring
- [ ] Alert on failed payment link generation
- [ ] Track payment completion rate

### Documentation

- [ ] Update README with new payment flow
- [ ] Document admin order review process
- [ ] Document payment link generation
- [ ] Document Twilio setup
- [ ] Document Epicor Propello integration (when available)

---

## Rollback Plan

**If issues occur:**

1. Keep old Stripe code in git history
2. Can revert commit if needed
3. Payment links can coexist with other methods
4. Gradually migrate customers to new flow

**No rush** - implement carefully and test thoroughly.

---

## Timeline

### Week 1: Remove Stripe
- [ ] Update all documentation
- [ ] Remove Stripe code
- [ ] Remove Stripe dependencies
- [ ] Update database schema

### Week 2: Build Payment Links
- [ ] Implement payment link service
- [ ] Build admin order review UI
- [ ] Integrate Twilio SMS
- [ ] Create email templates

### Week 3: Payment Page
- [ ] Build customer payment link page
- [ ] Integrate Epicor Propello (or wire transfer fallback)
- [ ] Add cryptocurrency option (optional)
- [ ] Mobile optimization

### Week 4: Testing & Launch
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing
- [ ] Production deployment

---

## Questions?

**Reference:**
- [PAYMENT_STRATEGY.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/PAYMENT_STRATEGY.md) - Complete payment link system design
- [COMPLIANCE_ANALYSIS.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/COMPLIANCE_ANALYSIS.md) - Compliance requirements
- [IMMEDIATE_ACTION_PLAN.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/IMMEDIATE_ACTION_PLAN.md) - Overall implementation plan

---

**Status:** Ready to implement! 🚀

No Stripe. Ever. ✅
