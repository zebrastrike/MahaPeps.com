# Updated Implementation Plan
## With Order Insurance, Age Gate, and Streamlined Workflow

---

## Your Decisions

✅ **Time Zone**: Arizona (MST - no daylight saving)
✅ **Weekend Orders**: Ship Monday (clarified in emails)
✅ **Shippo Workflow**: Orders auto-populate in Shippo dashboard, owner purchases labels there
✅ **Payment Confirmation**: Manual review (owner clicks "Confirm Payment" button)
✅ **Order Insurance**: Offered as optional upsell at checkout
✅ **Age Gate**: Required for all pages except homepage, persists for session

---

## 1. Order Insurance Feature

### How It Works:
- **Optional checkbox** at checkout: "Protect your order with shipping insurance"
- **Cost**: 2% of order total (minimum $2.00, maximum $50.00)
- **Coverage**: Lost, stolen, or damaged shipments
- **Backed by**: You (not third-party insurance)
- **Claim process**: Customer contacts support, you review and issue refund/replacement

### Implementation:

#### Database Changes
**File**: `apps/api/prisma/schema.prisma`

```prisma
model Order {
  // ... existing fields

  insuranceSelected Boolean @default(false)
  insuranceFee      Decimal @default(0) @db.Decimal(10, 2)

  // ... rest of model
}
```

#### Checkout Page Update
**File**: `apps/web/src/app/(public)/checkout/page.tsx`

Add after shipping method selection:

```typescript
// Add to state:
const [orderInsurance, setOrderInsurance] = useState(false);

// Calculate insurance fee (2% of subtotal, min $2, max $50)
const calculateInsurance = (subtotal: number) => {
  if (!orderInsurance) return 0;
  const fee = subtotal * 0.02;
  return Math.max(2, Math.min(50, fee));
};

const insuranceFee = calculateInsurance(cart.subtotal);

// Add section after processing speed selection:
<section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
  <h2 className="mb-4 text-xl font-bold text-clinical-white">Shipping Protection</h2>

  <label className="flex cursor-pointer items-start gap-4 rounded-md border border-charcoal-600 bg-charcoal-900/50 p-4 hover:border-accent-500 transition-colors">
    <input
      type="checkbox"
      checked={orderInsurance}
      onChange={(e) => setOrderInsurance(e.target.checked)}
      className="mt-1 h-5 w-5 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20"
    />
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-clinical-white">🛡️ Order Protection</span>
        <span className="font-bold text-accent-400">+${insuranceFee.toFixed(2)}</span>
      </div>
      <p className="text-sm text-charcoal-300 mb-2">
        Protect your order against loss, theft, or damage during shipping.
        Get a full refund or replacement if something goes wrong.
      </p>
      <ul className="text-xs text-charcoal-400 space-y-1">
        <li>✓ Coverage for lost packages</li>
        <li>✓ Protection against shipping damage</li>
        <li>✓ Theft protection</li>
        <li>✓ Fast claim processing</li>
      </ul>
      <p className="text-xs text-charcoal-500 mt-2">
        Cost: 2% of order total (min $2.00, max $50.00)
      </p>
    </div>
  </label>
</section>

// Update order summary to include insurance:
<div className="flex justify-between text-charcoal-300">
  <span>Shipping Protection</span>
  <span>${insuranceFee.toFixed(2)}</span>
</div>

// Update total calculation:
const finalTotal = cart.subtotal + shippingCost + processingFee + insuranceFee + tax;
```

**Backend**: Update checkout service to save insurance selection.

---

## 2. Age Gate Implementation

### How It Works:
- **Homepage accessible** to everyone (no gate)
- **All other pages** require age verification
- **One-time verification** per browser session
- **Session storage** persists verification across page loads
- **Exit button** redirects to Google (or closes window)

### Design:
```
┌─────────────────────────────────────────┐
│                                         │
│          🔒 Age Verification            │
│                                         │
│   This site contains research           │
│   chemicals for laboratory use only.    │
│                                         │
│   You must be 18 years or older         │
│   to access this site.                  │
│                                         │
│   [ ] I am 18 years of age or older    │
│                                         │
│   [  Enter Site  ]    [  Exit  ]       │
│                                         │
└─────────────────────────────────────────┘
```

### Implementation:

#### Create Age Gate Component
**File**: `apps/web/src/components/age-gate/age-gate.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export function AgeGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [showGate, setShowGate] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't show gate on homepage
    if (pathname === '/') {
      setIsLoading(false);
      return;
    }

    // Check if user already verified age this session
    const verified = sessionStorage.getItem('age_verified');
    if (verified === 'true') {
      setIsLoading(false);
      return;
    }

    // Show age gate
    setShowGate(true);
    setIsLoading(false);
  }, [pathname]);

  const handleEnter = () => {
    if (!ageConfirmed) return;

    // Store verification in session storage
    sessionStorage.setItem('age_verified', 'true');
    setShowGate(false);
  };

  const handleExit = () => {
    // Redirect to Google or close window
    window.location.href = 'https://www.google.com';
  };

  if (isLoading) {
    return null; // Or loading spinner
  }

  if (!showGate) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/95 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border-2 border-amber-500 bg-charcoal-800 p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Image
            src="/branding/maha-logo.png"
            alt="MAHA Peptides"
            width={180}
            height={60}
            className="mx-auto h-14 w-auto"
          />
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🔒</div>
          <h1 className="text-2xl font-bold text-clinical-white">Age Verification Required</h1>
        </div>

        {/* Warning */}
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-center text-sm text-amber-200">
            This website contains research chemicals and peptides intended solely for
            <strong> laboratory research and analytical purposes</strong>.
            Not for human or animal consumption.
          </p>
        </div>

        {/* Age requirement */}
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-clinical-white">
            You must be <span className="text-accent-400">18 years of age or older</span> to access this site.
          </p>
        </div>

        {/* Checkbox */}
        <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border border-charcoal-600 bg-charcoal-900/50 p-4 hover:border-accent-500 transition-colors">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20"
          />
          <span className="text-sm text-charcoal-200">
            I confirm that I am at least 18 years of age and agree to the terms of use for research chemicals.
          </span>
        </label>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleExit}
            className="flex-1 rounded-lg border-2 border-charcoal-600 bg-charcoal-900 px-6 py-3 font-semibold text-charcoal-300 transition-colors hover:border-red-500 hover:bg-red-900/20 hover:text-red-400"
          >
            Exit
          </button>
          <button
            onClick={handleEnter}
            disabled={!ageConfirmed}
            className="flex-1 rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent-500"
          >
            Enter Site
          </button>
        </div>

        {/* Footer notice */}
        <p className="mt-6 text-center text-xs text-charcoal-500">
          By entering, you acknowledge that you are accessing this site for legitimate research purposes only.
        </p>
      </div>
    </div>
  );
}
```

#### Add to Layout
**File**: `apps/web/src/app/(public)/layout.tsx`

```typescript
import { AgeGate } from '@/components/age-gate/age-gate';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AgeGate />
      {/* ... rest of layout */}
      {children}
    </>
  );
}
```

### Is Age Gating Ethical?

**YES, absolutely ethical and REQUIRED for research chemicals:**

1. **Legal Protection**: Demonstrates compliance with age restrictions
2. **Industry Standard**: All reputable peptide/research chemical vendors do this
3. **Liability Reduction**: Shows due diligence in preventing minor access
4. **FDA Compliance**: Research chemicals should not be accessible to minors
5. **State Laws**: Many states require age verification for chemical sales

**Allowing homepage access is smart because:**
- SEO benefits (search engines can index homepage)
- Users can see branding and legitimacy
- Not deceptive - clearly a business site
- Age gate appears before accessing products/ordering

**This is standard practice for:**
- Research chemical suppliers
- Nootropic vendors
- Supplement companies with age-restricted products
- Tobacco/vape sites
- Alcohol sites

---

## 3. Payment Confirmation - Manual vs Automated

### The Reality: Manual is Best (and Necessary)

**Why Payment Can't Be Fully Automated:**

1. **Zelle**: No public API, no webhooks, no automation possible
2. **CashApp**: Business API exists BUT:
   - Requires Business account (not personal)
   - Requires API application/approval process
   - Limited functionality
   - Still requires manual verification of payment notes

### Current Best Practice (What Your System Will Do):

**Step 1: Customer Places Order**
- System creates order with PENDING_PAYMENT status
- Email sent to customer with ORDER NUMBER in big text
- Email sent to YOU (owner) with full order details

**Step 2: Customer Pays**
- Sends payment via Zelle/CashApp
- Includes order number in payment note (you remind them prominently)

**Step 3: Owner Checks Payment**
- You receive Zelle/CashApp notification on phone
- See payment amount and order number in note
- Go to admin dashboard

**Step 4: Owner Confirms Payment (ONE CLICK)**
- Click "Confirm Payment Received" button
- System automatically:
  - Updates order to PAID status
  - Sends "Payment Verified" email to customer
  - Creates order in Shippo (draft)
  - Logs the action

**Step 5: Owner Ships**
- Log into Shippo dashboard
- See your orders ready to ship
- Purchase label for each order
- Print, pack, ship

**Step 6: Automatic Tracking**
- Shippo sends webhook when label purchased
- System gets tracking number
- Sends shipping confirmation email to customer automatically

### Why This Is Actually Great:

✅ **You maintain control** - verify payment before fulfilling
✅ **Prevents fraud** - catch suspicious payments
✅ **One-click confirmation** - not manually typing anything
✅ **Everything else automated** - emails, Shippo creation, tracking
✅ **Takes 10 seconds per order** - just click confirm button

### Future Enhancement (Optional):

If you get CashApp Business account, could build:
- API integration to automatically fetch payments
- System cross-references payment amounts with order totals
- Still requires you to approve (but highlights matches)
- Estimated time: 8-10 hours of dev work
- Recommendation: **Wait until you're processing 50+ orders/day** before investing in this

---

## 4. Updated Email Templates

### Arizona Time Zone Updates

All email templates will say:
- "Orders paid before **10:00 AM MST (Arizona Time)** ship same day"
- "After 10 AM MST: next business day"
- "Weekend orders: processed Monday"

### Order Insurance Messaging

Payment email will include:
```
📦 Shipping Protection: [Selected/Not Selected]
Fee: $X.XX
Coverage: Full replacement/refund for lost, stolen, or damaged shipments
```

---

## 5. Shippo Workflow (Simplified)

### What Happens Automatically:

1. **Order Placed** → Database record created, emails sent
2. **Payment Confirmed** → Order marked PAID, email sent
3. **Shippo Order Created** → Draft order appears in your Shippo dashboard automatically
4. **You Purchase Label in Shippo** → Shippo webhook fires
5. **System Gets Tracking** → Automatically sends tracking email to customer

### What You'll See in Shippo:

```
Shippo Dashboard > Orders

┌────────────────────────────────────────┐
│ Order #12345 - $234.50                 │
│ Status: Ready to Ship                  │
│ Customer: john@example.com             │
│                                        │
│ Ship To:                               │
│ 123 Main St                            │
│ Phoenix, AZ 85001                      │
│                                        │
│ [ Purchase USPS Label - $8.50 ]       │
│ [ Purchase FedEx Label - $12.30 ]     │
└────────────────────────────────────────┘
```

### Shippo Integration Code

**What I'll Build:**

1. **Function to create Shippo order** when payment confirmed
2. **Webhook listener** to receive tracking when label purchased
3. **Automatic tracking email** when webhook received

**You Never Have To:**
- Manually type addresses into Shippo
- Copy/paste order details
- Look up tracking numbers
- Send tracking emails

**You Just:**
- See order in Shippo
- Click "Purchase Label"
- Pack and ship

**Time Saved**: ~5 minutes per order → with 10 orders/day = 50 minutes/day saved

---

## Implementation Priority

### Phase 1: Critical (Do First - 4 hours)
1. ✅ Age gate component (1.5 hours)
2. ✅ Update email templates with Arizona time, weekend info (1 hour)
3. ✅ Order insurance option at checkout (1.5 hours)

### Phase 2: Owner Workflow (Do Next - 3 hours)
4. ✅ Owner notification email (1 hour)
5. ✅ Payment confirmation button in admin dashboard (1 hour)
6. ✅ Shippo order creation when payment confirmed (1 hour)

### Phase 3: Tracking Automation (Do After - 2 hours)
7. ✅ Shippo webhook listener (1 hour)
8. ✅ Automatic tracking email (1 hour)

### Phase 4: Policy Pages (Do Before Launch - 4 hours)
9. ✅ Draft policy content (2 hours)
10. ✅ Create policy pages (2 hours)

**Total Time**: 13 hours across all phases

---

## Questions Answered

1. **Order insurance**: 2% of order (min $2, max $50), optional checkbox ✅
2. **Time zone**: Arizona MST (no DST) ✅
3. **Weekend orders**: Ship Monday ✅
4. **Shippo workflow**: Auto-populate Shippo, owner purchases there ✅
5. **Payment confirmation**: Manual one-click in admin dashboard ✅
6. **Age gate**: Homepage accessible, all other pages gated, session persists ✅
7. **Age gate ethics**: Absolutely ethical and industry-required ✅

---

## What We Need From Client Tomorrow

1. ✅ Actual Zelle email/phone number
2. ✅ Actual CashApp tag
3. ❓ Do you want me to draft policy page content? Or will you provide?
4. ❓ Any specific insurance coverage limits/terms you want?
5. ❓ Any products that can't be shipped with insurance?

---

## Ready to Start?

I can begin with **Phase 1** right now (age gate + order insurance + email updates).

Should I:
1. ✅ Implement age gate
2. ✅ Add order insurance option
3. ✅ Update all emails with Arizona time + weekend shipping info
4. ⏸️ Wait for Zelle/CashApp info before finalizing email templates

Or do you want me to also draft the policy pages now?
