# Environment Variables Checklist
## Values to Update Tomorrow with Client Info

---

## Required Before Launch

### Payment Information (Update in Email Templates)
```bash
# apps/api/src/modules/notifications/email-templates.service.ts
# Lines that need updating with actual values:

ZELLE_EMAIL="UPDATE_WITH_ACTUAL_ZELLE_EMAIL@example.com"
ZELLE_PHONE="UPDATE_WITH_ACTUAL_PHONE"  # If using phone instead of email
CASHAPP_TAG="$UPDATE_WITH_ACTUAL_CASHAPP_TAG"
```

### Owner Notifications
```bash
# Add to apps/api/.env or .env.local:
OWNER_EMAIL="owner@mahapeps.com"  # UPDATE with actual owner email
```

### Shippo Integration
```bash
# Add to apps/api/.env or .env.local:
SHIPPO_API_KEY="shippo_test_xxxxx"  # Get from https://app.goshippo.com/settings/api
SHIPPO_WEBHOOK_SECRET="whsec_xxxxx"  # Get from Shippo webhook settings
SHIPPO_RETURN_ADDRESS_ID="optional"  # Can save return address in Shippo, use ID here
```

### Frontend URL (for emails)
```bash
# Add to apps/api/.env:
FRONTEND_URL="http://localhost:3000"  # Change to https://mahapeps.com in production
```

---

## Database Migration Required

Run this AFTER client confirms everything looks good:

```bash
cd apps/api
npx prisma migrate dev --name add-order-insurance-and-processing
npx prisma generate
```

This adds:
- `insuranceSelected` (boolean)
- `insuranceFee` (decimal)
- `processingType` (enum: STANDARD, EXPEDITED, RUSH)
- `processingFee` (decimal)
- `expectedShipDate` (datetime)
- `paidAt` (datetime)
- `ProcessingType` enum

---

## Optional (Can Configure Later)

### Email Service (if not already configured)
```bash
# Add to apps/api/.env:
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="notifications@mahapeps.com"
SMTP_PASS="your_app_password"  # Use app-specific password, not regular password
SMTP_FROM="MAHA Peptides <noreply@mahapeps.com>"
```

### Shippo Webhook URL (for production)
```bash
# Configure in Shippo dashboard:
# Webhook URL: https://api.mahapeps.com/webhooks/shippo
# Events: track_updated, transaction_created
```

---

## Files That Need Manual Updates Tomorrow

### 1. Email Templates Service
**File**: `apps/api/src/modules/notifications/email-templates.service.ts`

**Lines to Update** (search for "UPDATE_WITH"):
- Line ~116: `<strong>Zelle:</strong> Send to <code>UPDATE_WITH_ACTUAL_ZELLE_EMAIL</code>`
- Line ~117: `<strong>CashApp:</strong> Send to <code>$UPDATE_WITH_ACTUAL_CASHAPP</code>`

### 2. Environment Files
**File**: `apps/api/.env.local` (create if doesn't exist)

Add:
```
OWNER_EMAIL=actual-owner@mahapeps.com
FRONTEND_URL=http://localhost:3000
SHIPPO_API_KEY=your_key_here
```

---

## Quick Reference: What Each Variable Does

| Variable | Purpose | Required? | Where Used |
|----------|---------|-----------|------------|
| `OWNER_EMAIL` | Receives new order notifications | Yes | checkout.service.ts |
| `ZELLE_EMAIL` | Customer payment instructions | Yes | email-templates.service.ts |
| `CASHAPP_TAG` | Customer payment instructions | Yes | email-templates.service.ts |
| `FRONTEND_URL` | Links in emails | Yes | All email templates |
| `SHIPPO_API_KEY` | Create shipping labels | Yes | shippo.service.ts |
| `SHIPPO_WEBHOOK_SECRET` | Verify webhook authenticity | Recommended | webhooks controller |
| `SHIPPO_RETURN_ADDRESS_ID` | Saved return address | Optional | shippo.service.ts |
| `SMTP_*` | Send emails | Yes | notifications.service.ts |

---

## Testing Checklist (After Updates)

- [ ] Send test email - verify Zelle/CashApp info displays correctly
- [ ] Place test order - verify owner receives notification
- [ ] Test age gate on non-homepage - should show modal
- [ ] Test age gate on homepage - should NOT show modal
- [ ] Test order insurance checkbox - fee calculates correctly (2% min $2 max $50)
- [ ] Test processing type selection - fees apply correctly ($0, $25, $50)
- [ ] Confirm payment button works - order marked PAID
- [ ] Verify Shippo order created when payment confirmed
- [ ] Purchase label in Shippo - verify tracking email sent

---

## Production Deployment Changes

When deploying to production, update:

```bash
# Production environment variables:
FRONTEND_URL="https://mahapeps.com"
SHIPPO_API_KEY="shippo_live_xxxxx"  # Use LIVE key, not test

# Shippo webhook URL in dashboard:
https://api.mahapeps.com/webhooks/shippo
```

---

## Insurance Coverage Terms (Define with Client)

Questions to answer for policy pages:

1. **Maximum coverage amount**: $500? $1000? Match order value?
2. **Claim window**: 30 days from delivery? 60 days?
3. **Required documentation**:
   - Police report for theft?
   - Photos for damage?
   - Delivery confirmation?
4. **Exclusions**:
   - Customer error (wrong address)?
   - Refused delivery?
   - Weather delays?
5. **Claim processing time**: 3-5 business days?
6. **Refund vs replacement**: Customer choice or company discretion?

---

## Summary

**Critical Path** (Must do tomorrow):
1. Get Zelle email/phone from client
2. Get CashApp tag from client
3. Get owner notification email
4. Update email template with actual payment info
5. Add env variables
6. Run database migration

**Total Time**: 30 minutes to update and test

**Then Ready to Launch!**
