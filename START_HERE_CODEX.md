# START HERE - Codex Development Guide

## 🎯 What You're Building

**MAHA Peptides OS** - A research materials marketplace (NOT a supplement store) with:

✅ **Amazon-level UX** - Product cards, smart recommendations, advanced search
✅ **Iron-clad compliance** - Research-only positioning, no medical claims
✅ **No-code admin dashboard** - Non-technical staff can manage everything
✅ **Private payment links** - SMS + Email, no Stripe
✅ **COA tracking** - Certificate of Analysis for every batch

**Result:** The professional, compliant "Amazon of Peptides" for research labs.

---

## 📋 Critical Rules (Read First)

### 1. **[GUARDRAILS.md](GUARDRAILS.md) is LAW**

**Before coding anything, read GUARDRAILS.md**

**Non-negotiable:**
- ❌ NO dosing calculators (even "theoretical")
- ❌ NO protocol files
- ❌ NO medical claims, health benefits, treatment suggestions
- ❌ NO "supplement" / "wellness" / "dosage" language
- ✅ ONLY "research peptides" / "laboratory materials"
- ✅ EXACT disclaimer text only (5 required - copy exactly)

### 2. **Admin Must Be No-Code**

Non-technical staff must manage entire platform:
- ✅ Drag-and-drop interfaces
- ✅ WYSIWYG editors with compliance blocking
- ✅ One-click actions
- ✅ No code editing
- ✅ No SQL queries
- ✅ No command-line

### 3. **Payment is Private Links (NO Stripe)**

- ❌ NO Stripe integration
- ✅ Private payment links via SMS (Twilio) + Email (Mailgun)
- ✅ Admin reviews orders before sending payment link
- ✅ Epicor Propello integration (when available)
- ✅ Wire transfer backup

### 4. **Repo Structure**

```
MahaPeps.com/
├── apps/
│   ├── api/     ← Backend (NestJS) - USE THIS
│   └── web/     ← Frontend (Next.js) - USE THIS
```

**DO NOT create `/apps/backend` or `/apps/frontend`**

---

## 📚 Documentation to Read (Priority Order)

### ⭐ Read First (Compliance & Rules)

1. **[GUARDRAILS.md](GUARDRAILS.md)** - 15 min
   - Compliance rules (absolute)
   - Forbidden terms blacklist
   - Required disclaimers (exact text)
   - No-code admin requirements

2. **[CODEX_CONFLICTS_RESOLVED.md](CODEX_CONFLICTS_RESOLVED.md)** - 5 min
   - Resolves all documentation conflicts
   - Authoritative answers to Codex questions
   - Clean implementation guidance

### 💳 Payment System

3. **[PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md)** - 15 min
   - Private payment link system
   - Admin order review workflow
   - Epicor Propello integration
   - SMS/Email delivery

4. **[STRIPE_REMOVAL_CHECKLIST.md](STRIPE_REMOVAL_CHECKLIST.md)** - 5 min
   - Remove all Stripe references
   - Migration guide

### 🏗️ Architecture & Implementation

5. **[.codex/MASTER_PROMPT.md](.codex/MASTER_PROMPT.md)** - 20 min
   - Project overview
   - Tech stack
   - Database schema
   - API patterns
   - Frontend patterns

6. **[COMPLIANCE_ANALYSIS.md](COMPLIANCE_ANALYSIS.md)** - 30 min
   - Feature specifications
   - Database updates
   - Product cards design
   - COA management system
   - Recommendation engine
   - **⚠️ IGNORE:** "Theoretical dosage calculator" (Prompt 21), RESEARCH_PROTOCOL file type

7. **[IMMEDIATE_ACTION_PLAN.md](IMMEDIATE_ACTION_PLAN.md)** - 15 min
   - 6-week roadmap
   - Week 1: Compliance foundation
   - Weeks 2-6: Feature development

### 🎨 Code Patterns

8. **[.tessl/patterns.yaml](.tessl/patterns.yaml)** - Reference as needed
   - NestJS service/controller patterns
   - Next.js page patterns
   - Prisma patterns

### 🚀 Infrastructure (Later)

9. **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** - When optimizing
   - Cloudflare setup
   - Server hardening
   - Performance optimization
   - Monitoring

---

## 🚦 Start Here: Week 1 Tasks

### **Goal:** Compliance foundation (before any features)

### Task 1: Update Database Schema (2 hours)

**File:** `prisma/schema.prisma`

**Changes:**

1. **Update ProductCategory enum:**
```prisma
enum ProductCategory {
  RESEARCH_PEPTIDES
  ANALYTICAL_REFERENCE_MATERIALS
  LABORATORY_ADJUNCTS
  RESEARCH_COMBINATIONS
  MATERIALS_SUPPLIES
  MERCHANDISE
}

// ❌ DO NOT ADD: SUPPLEMENTS, WELLNESS, FDA_APPROVED_CONSUMER
```

2. **Update BatchFileType enum:**
```prisma
enum BatchFileType {
  COA              // Certificate of Analysis (REQUIRED)
  MSDS             // Material Safety Data Sheet
  PRODUCT_IMAGE    // Product photos
  TECHNICAL_SHEET  // Chemical technical specifications
}

// ❌ DO NOT ADD: RESEARCH_PROTOCOL, DOSING_GUIDE
```

3. **Add new models:**
```prisma
model PaymentLink {
  id              String            @id @default(cuid())
  orderId         String            @unique
  token           String            @unique
  amount          Float
  expiresAt       DateTime
  status          PaymentLinkStatus
  sentVia         String[]
  processorType   String?
  processorUrl    String?
  customerPhone   String?
  customerEmail   String

  order           Order             @relation(fields: [orderId], references: [id])
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([token])
  @@index([status])
}

enum PaymentLinkStatus {
  PENDING
  SENT
  CLICKED
  PAID
  EXPIRED
  CANCELED
}

model ForbiddenTerm {
  id        String   @id @default(cuid())
  term      String   @unique
  severity  String   // "CRITICAL", "HIGH", "MEDIUM"
  category  String   // "medical", "supplement", "dosing"
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  @@index([active])
}

model ComplianceAcknowledgment {
  id             String   @id @default(cuid())
  userId         String
  orderId        String?
  type           String   // "checkout", "terms"
  ipAddress      String
  acknowledgedAt DateTime @default(now())

  user           User     @relation(fields: [userId], references: [id])
  order          Order?   @relation(fields: [orderId], references: [id])

  @@index([userId])
  @@index([orderId])
}

model SmsLog {
  id          String   @id @default(cuid())
  to          String
  message     String
  status      String   // "SENT", "FAILED"
  twilioSid   String?
  error       String?
  createdAt   DateTime @default(now())

  @@index([to])
  @@index([createdAt])
}
```

4. **Update Order model:**
```prisma
model Order {
  // Add fields
  paymentLinkId      String?      @unique
  paymentLink        PaymentLink? @relation(fields: [paymentLinkId], references: [id])
  complianceReviewed Boolean      @default(false)
  complianceApproved Boolean?
  reviewedBy         String?
  reviewedAt         DateTime?
}

enum OrderStatus {
  PENDING_REVIEW     // NEW - waiting for admin review
  REVIEW_REJECTED    // NEW - admin rejected
  PENDING_PAYMENT    // Payment link sent
  PAYMENT_FAILED
  PAID
  FULFILLING
  SHIPPED
  COMPLETED
  CANCELED
  REFUNDED
}
```

**Run:**
```bash
cd apps/api
npx prisma migrate dev --name compliance-updates
npx prisma generate
```

---

### Task 2: Implement Forbidden Term System (3 hours)

**Create:** `apps/api/src/compliance/`

**1. Compliance Service:**
```typescript
// apps/api/src/compliance/compliance.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async scanContent(text: string): Promise<{
    violations: string[];
    isCompliant: boolean;
  }> {
    const terms = await this.prisma.forbiddenTerm.findMany({
      where: { active: true },
    });

    const violations = [];

    for (const term of terms) {
      const regex = new RegExp(`\\b${term.term}\\b`, 'gi');
      if (regex.test(text)) {
        violations.push({
          term: term.term,
          severity: term.severity,
          category: term.category,
        });
      }
    }

    return {
      violations,
      isCompliant: violations.length === 0,
    };
  }

  async seedForbiddenTerms() {
    const terms = [
      { term: 'supplement', severity: 'CRITICAL', category: 'medical' },
      { term: 'dietary supplement', severity: 'CRITICAL', category: 'medical' },
      { term: 'wellness', severity: 'CRITICAL', category: 'medical' },
      { term: 'health benefits', severity: 'CRITICAL', category: 'medical' },
      { term: 'treatment', severity: 'CRITICAL', category: 'medical' },
      { term: 'therapy', severity: 'CRITICAL', category: 'medical' },
      { term: 'dosage', severity: 'CRITICAL', category: 'dosing' },
      { term: 'dose', severity: 'CRITICAL', category: 'dosing' },
      { term: 'administration', severity: 'CRITICAL', category: 'dosing' },
      { term: 'for humans', severity: 'CRITICAL', category: 'medical' },
      { term: 'for patients', severity: 'CRITICAL', category: 'medical' },
      { term: 'improves', severity: 'HIGH', category: 'claims' },
      { term: 'treats', severity: 'HIGH', category: 'claims' },
      { term: 'cures', severity: 'HIGH', category: 'claims' },
      { term: 'prevents', severity: 'HIGH', category: 'claims' },
      { term: 'weight loss', severity: 'HIGH', category: 'claims' },
      { term: 'anti-aging', severity: 'HIGH', category: 'claims' },
      // Add more from GUARDRAILS.md
    ];

    await this.prisma.forbiddenTerm.createMany({
      data: terms,
      skipDuplicates: true,
    });
  }
}
```

**2. Validation Pipe:**
```typescript
// apps/api/src/compliance/compliance.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Injectable()
export class ComplianceValidationPipe implements PipeTransform {
  constructor(private complianceService: ComplianceService) {}

  async transform(value: any) {
    if (typeof value === 'object') {
      // Scan all string fields
      for (const key in value) {
        if (typeof value[key] === 'string') {
          const result = await this.complianceService.scanContent(value[key]);
          if (!result.isCompliant) {
            throw new BadRequestException({
              message: 'Content contains forbidden terms',
              violations: result.violations,
              field: key,
            });
          }
        }
      }
    }

    return value;
  }
}
```

**3. Use in Product Controller:**
```typescript
// apps/api/src/catalog/catalog.controller.ts
@Post()
@Roles(UserRole.ADMIN)
@UsePipes(ComplianceValidationPipe)
async create(@Body() dto: CreateProductDto) {
  return this.catalogService.create(dto);
}
```

---

### Task 3: Update DisclaimerBar Component (1 hour)

**File:** `apps/web/components/DisclaimerBar.tsx`

**Replace with:**
```typescript
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DisclaimerBarProps {
  variant?: 'footer' | 'product' | 'checkout';
}

export function DisclaimerBar({ variant = 'footer' }: DisclaimerBarProps) {
  const disclaimers = {
    footer: `All statements on this website have not been evaluated by the Food and Drug Administration (FDA). All products are sold strictly for research, laboratory, or analytical purposes only. Products are not intended to diagnose, treat, cure, or prevent any disease.

This site operates solely as a chemical and research materials supplier. We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act. We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act.

Nothing on this website constitutes medical, clinical, or healthcare advice. All information provided is for educational and research discussion purposes only.`,

    product: `All products sold on this platform are intended solely for lawful laboratory research and analytical use. Not for human or veterinary consumption.`,

    checkout: `All products sold on this platform are intended solely for lawful laboratory research and analytical use. Not for human or veterinary consumption.

The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products. The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws.`,
  };

  return (
    <Alert className="border-amber-500 bg-amber-50 mt-8">
      <AlertDescription className="text-sm text-amber-900 whitespace-pre-line">
        {disclaimers[variant]}
      </AlertDescription>
    </Alert>
  );
}
```

**Add to layouts:**
```typescript
// apps/web/app/layout.tsx
import { DisclaimerBar } from '@/components/DisclaimerBar';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <footer>
          <DisclaimerBar variant="footer" />
        </footer>
      </body>
    </html>
  );
}
```

---

### Task 4: Add Checkout Compliance Checkboxes (2 hours)

**File:** `apps/web/app/(public)/checkout/page.tsx`

**Add to checkout form:**
```typescript
'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export default function CheckoutPage() {
  const [acceptances, setAcceptances] = useState({
    researchOnly: false,
    responsibility: false,
    noMedicalAdvice: false,
    ageVerification: false,
    termsOfService: false,
  });

  const allAccepted = Object.values(acceptances).every(v => v);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allAccepted) {
      alert('Please accept all compliance requirements');
      return;
    }

    // Log acceptance
    await fetch('/api/compliance/acknowledge', {
      method: 'POST',
      body: JSON.stringify({
        type: 'checkout',
        acceptances,
        ipAddress: await getClientIP(),
      }),
    });

    // Create order
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Shipping info */}

      <div className="compliance-section">
        <h2>Research Use Acknowledgment (Required)</h2>

        <label className="flex items-start gap-2">
          <Checkbox
            checked={acceptances.researchOnly}
            onCheckedChange={(checked) =>
              setAcceptances(prev => ({ ...prev, researchOnly: checked }))
            }
          />
          <span>
            I acknowledge that all products are for research purposes only and not
            for human or veterinary consumption.
          </span>
        </label>

        <label className="flex items-start gap-2">
          <Checkbox
            checked={acceptances.responsibility}
            onCheckedChange={(checked) =>
              setAcceptances(prev => ({ ...prev, responsibility: checked }))
            }
          />
          <span>
            I accept full responsibility for proper handling, storage, and disposal
            of all products in accordance with applicable laws.
          </span>
        </label>

        <label className="flex items-start gap-2">
          <Checkbox
            checked={acceptances.noMedicalAdvice}
            onCheckedChange={(checked) =>
              setAcceptances(prev => ({ ...prev, noMedicalAdvice: checked }))
            }
          />
          <span>
            I understand that no information on this site constitutes medical or
            healthcare advice.
          </span>
        </label>

        <label className="flex items-start gap-2">
          <Checkbox
            checked={acceptances.ageVerification}
            onCheckedChange={(checked) =>
              setAcceptances(prev => ({ ...prev, ageVerification: checked }))
            }
          />
          <span>I confirm that I am at least 21 years of age.</span>
        </label>

        <label className="flex items-start gap-2">
          <Checkbox
            checked={acceptances.termsOfService}
            onCheckedChange={(checked) =>
              setAcceptances(prev => ({ ...prev, termsOfService: checked }))
            }
          />
          <span>
            I have read and agree to the Terms of Service and Research Use Policy.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!allAccepted}
        className="btn-primary disabled:opacity-50"
      >
        Request Payment Link
      </button>

      <DisclaimerBar variant="checkout" />
    </form>
  );
}
```

**Backend endpoint:**
```typescript
// apps/api/src/compliance/compliance.controller.ts
@Post('acknowledge')
@UseGuards(JwtAuthGuard)
async logAcknowledgment(
  @CurrentUser() user: User,
  @Body() dto: AcknowledgmentDto,
) {
  return this.prisma.complianceAcknowledgment.create({
    data: {
      userId: user.id,
      type: dto.type,
      ipAddress: dto.ipAddress,
    },
  });
}
```

---

## 🎯 Success Criteria for Week 1

**Before moving to Week 2, verify:**

- [ ] Database schema updated (ProductCategory, BatchFileType, new models)
- [ ] Forbidden term system working (scans content, blocks violations)
- [ ] DisclaimerBar component shows exact text on all pages
- [ ] Checkout has 5 required checkboxes (all must be checked)
- [ ] Compliance acceptance logged to database
- [ ] No "supplement" / "dosing" / "protocol" language anywhere
- [ ] Admin can manage forbidden terms via UI (create this if time allows)

---

## 🚀 After Week 1

**Continue with:**
- **Week 2:** COA & Product Cards ([IMMEDIATE_ACTION_PLAN.md](IMMEDIATE_ACTION_PLAN.md))
- **Week 3:** Payment Links ([PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md))
- **Week 4:** Smart Shopping ([COMPLIANCE_ANALYSIS.md](COMPLIANCE_ANALYSIS.md) Prompt 22)
- **Week 5:** Admin Compliance Tools
- **Week 6:** Testing & Launch

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T:
1. Implement dosing calculator (even "theoretical")
2. Add RESEARCH_PROTOCOL file type
3. Use "supplement" / "wellness" / "dosage" language
4. Skip compliance checkboxes
5. Create `/apps/backend` or `/apps/frontend` folders
6. Integrate Stripe
7. Allow admin code editing

### ✅ DO:
1. Check GUARDRAILS.md before implementing features
2. Use exact disclaimer text (no modifications)
3. Make admin UI no-code (drag-and-drop, WYSIWYG)
4. Use private payment links (not direct card processing)
5. Require COA before batch activation
6. Log all compliance acceptances
7. Scan content for forbidden terms

---

## 📞 Questions?

**Check in order:**
1. **Compliance:** [GUARDRAILS.md](GUARDRAILS.md)
2. **Conflicts:** [CODEX_CONFLICTS_RESOLVED.md](CODEX_CONFLICTS_RESOLVED.md)
3. **Payment:** [PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md)
4. **Architecture:** [.codex/MASTER_PROMPT.md](.codex/MASTER_PROMPT.md)

---

## 📊 Project Status

**✅ Complete:**
- Project architecture
- Compliance documentation
- Payment strategy
- Feature specifications
- 6-week roadmap

**🔄 Week 1 (You are here):**
- Update database schema
- Implement forbidden term system
- Add exact disclaimers
- Add compliance checkboxes

**⏳ Weeks 2-6:**
- Product cards & COA management
- Payment link system
- Smart recommendations
- Admin compliance dashboard
- Testing & launch

---

**Ready to build the compliant "Amazon of Peptides"!** 🧪🔬

**Start with Task 1: Update Database Schema** ☝️
