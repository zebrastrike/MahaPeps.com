# Compliance Analysis & Gap Report

## Executive Summary

The ChatGPT compliance document is **SIGNIFICANTLY MORE RESTRICTIVE** than the initial implementation in the Codex prompts. This is a **research-only platform**, not a supplement or wellness marketplace. Major updates are required across all documentation.

---

## Critical Gaps Identified

### 1. Language Violations in Current Documentation

**VIOLATIONS FOUND:**

❌ **In MASTER_PROMPT.md:**
- Line references to "FDA-approved peptides" for D2C sales
- "Supplements" terminology used
- "Consumer health" framing
- "Wellness" context implied

❌ **In FEATURE_PROMPTS.md:**
- Product catalog prompts use "FDA Approved" category
- Checkout flow mentions "supplements"
- Email templates imply consumer products
- Missing research-use-only enforcement

❌ **In GUARDRAILS.md (need to verify):**
- May contain supplement/wellness language
- Disclaimer text may not match strict requirements
- Missing 503A/503B pharmacy disclaimers

❌ **In DisclaimerBar component (frontend):**
- Generic "research use only" may not be sufficient
- Missing FDA statement verbatim
- No pharmacy disclaimer

---

## Required Changes by Document

### A. MASTER_PROMPT.md - Critical Updates

**Current Violations:**
```markdown
# WRONG (Current):
"FDA-Approved Peptides (D2C) - Approved peptide supplements, sold directly to consumers"
"Consumer-ready peptides"
"Supplement" category

# CORRECT (Required):
"Analytical Reference Materials (D2C) - Research-grade peptides available to qualified researchers and laboratories"
"Research materials"
"Research Peptides" category
```

**Required Sections to Add:**

1. **Product Categories (Replace Existing):**
```markdown
### Approved Product Categories (ONLY THESE)

1. **Research Peptides** - Laboratory research compounds
2. **Analytical Reference Materials** - Chemical standards and controls
3. **Laboratory Adjuncts** - Research support materials
4. **Research Combinations** - Pre-configured research sets
5. **Materials & Supplies** - Lab equipment and supplies
6. **Merchandise** - Non-consumable branded items (lab coats, beakers, etc.)

🚫 BANNED CATEGORIES:
- Supplements (any type)
- Wellness products
- Health products
- Dietary supplements
- Injectable supplements
- Oral supplements
```

2. **Forbidden Language Global Blacklist:**
```markdown
### Language Blacklist (AUTO-REJECT)

The following terms must NEVER appear in:
- Product names
- Product descriptions
- Category names
- Marketing copy
- Admin fields
- User-facing content

🚫 FORBIDDEN TERMS:
- "Supplement" / "Dietary supplement"
- "Wellness" / "Health benefits"
- "Treatment" / "Therapy" / "Therapeutic"
- "Dosage" / "Dose" / "Administration"
- "Injectable" / "Injection" / "Oral use" / "Nasal use"
- "For humans" / "For patients" / "Clinical use"
- "Improves", "Treats", "Cures", "Prevents" (health outcomes)
- "Weight loss", "Anti-aging", "Performance enhancement"
- "Medical", "Medicine", "Drug"

✅ APPROVED ALTERNATIVES:
- "Research peptide" / "Laboratory material"
- "Research purposes" / "Analytical use"
- "Theoretical calculation" / "Academic reference"
- "Reconstitution" / "Preparation" (for research only)
- "For laboratory research" / "For qualified researchers"
- "Molecular structure" / "Chemical properties"
```

3. **Required Disclaimers (Exact Text):**
```markdown
### Canonical Compliance Disclaimers

Copy these EXACTLY - no modifications:

#### Primary FDA Disclaimer (Footer + Product Pages):
"All statements on this website have not been evaluated by the Food and Drug Administration (FDA). All products are sold strictly for research, laboratory, or analytical purposes only. Products are not intended to diagnose, treat, cure, or prevent any disease."

#### Research-Use-Only Disclaimer (Product Pages + Checkout):
"All products sold on this platform are intended solely for lawful laboratory research and analytical use. Not for human or veterinary consumption."

#### Non-Pharmacy Disclaimer (Footer + Legal):
"This site operates solely as a chemical and research materials supplier. We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act. We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act."

#### Liability & Responsibility Disclaimer:
"The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products. The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws."

#### No Medical Advice Disclaimer:
"Nothing on this website constitutes medical, clinical, or healthcare advice. All information provided is for educational and research discussion purposes only."
```

### B. FEATURE_PROMPTS.md - Updates Required

**Prompt 1-3: Product Catalog**

**ADD to requirements:**
```markdown
Language Enforcement:
- Implement global term blacklist in API validation
- Reject product creation/update with forbidden terms
- Auto-scan descriptions for compliance violations
- Admin warning system for flagged content

Category Restrictions:
- Only allow these categories: Research Peptides, Analytical Reference Materials, Laboratory Adjuncts, Research Combinations, Materials & Supplies, Merchandise
- Hard-coded enum in database
- No custom categories allowed

Product Card Requirements:
- Display "Research Use Only" badge prominently
- Show batch number and purity %
- Link to COA (Certificate of Analysis)
- No health benefit claims
- No testimonials about effects
```

**Prompt 2: Batch Management - ENHANCED**

**NEW REQUIREMENTS:**
```markdown
COA (Certificate of Analysis) Management:

Required COA Fields:
- Batch number (unique per product)
- Manufacturing date
- Expiration date
- Purity percentage (HPLC tested)
- Storage conditions
- PDF upload of lab analysis
- Lab name and accreditation
- Test date

COA Display:
- "View COA" button on product cards
- Download COA as PDF
- Display purity % prominently
- Show expiration date warning (if < 60 days)
- QR code for COA verification (optional)

Admin COA Management:
- Upload COA per batch
- Preview PDF before publishing
- Require COA for batch activation
- Audit trail of COA uploads
- Version history for COA updates

Batch Tracking:
- Each batch has unique identifier (e.g., PEP-001-240115-A)
- Batch selection during checkout
- Batch traceability in orders
- Low stock alerts per batch
- Expiration notifications per batch
```

**Prompt 5: Shopping Cart & Checkout - COMPLIANCE ADDITIONS**

**ADD mandatory checkboxes:**
```markdown
Checkout Compliance Checkboxes (Required):

1. Research Acknowledgment:
   ☐ "I acknowledge that all products are for research purposes only and not for human or veterinary consumption."

2. Responsibility Acceptance:
   ☐ "I accept full responsibility for proper handling, storage, and disposal of all products in accordance with applicable laws."

3. No Medical Advice:
   ☐ "I understand that no information on this site constitutes medical or healthcare advice."

4. Age Verification (21+):
   ☐ "I confirm that I am at least 21 years of age."

5. Terms of Service:
   ☐ "I have read and agree to the Terms of Service and Research Use Policy."

ALL must be checked to enable "Place Order" button.
Log timestamp and IP of acceptance to database.
```

**NEW PROMPT 21: Peptide Calculator (Compliance-First)**

```markdown
### Prompt 21: Implement Theoretical Peptide Calculator

Build a research calculation tool for theoretical reconstitution and concentration calculations.

CRITICAL COMPLIANCE REQUIREMENTS:

Pre-Use Disclaimer:
Display before calculator loads:
"This calculator is provided strictly for academic, theoretical, and research calculation purposes. It does not provide guidance for human, veterinary, or clinical application."

Required Acknowledgment:
- Checkbox: "I acknowledge this tool is for academic calculation only"
- Calculator disabled (grayed out) until checked
- Log acknowledgment (userId, timestamp, IP) to database

Calculator Features:
- Peptide concentration calculator (mg to mL)
- Reconstitution volume calculator
- Molarity calculator
- Unit conversion (mg, µg, IU)
- Theoretical dosage calculator (WITH DISCLAIMER)

UI Enforcement:
- All results labeled "Theoretical" or "For Research Purposes"
- No "Recommended" or "Suggested" language
- No human body weight input (only generic mass units)
- Results display: "Theoretical Concentration: X mg/mL (for research reference only)"

Admin Controls:
- Enable/disable calculator site-wide
- Edit disclaimer text
- View calculator usage logs
- Flag suspicious usage patterns

Never display:
- "Dosage for humans"
- "Administration schedule"
- "Clinical protocol"
- "Treatment plan"
```

**NEW PROMPT 22: Smart Recommendations Engine**

```markdown
### Prompt 22: Implement Product Recommendations ("Customers Also Researched")

Build an Amazon-style recommendation system for research materials.

Requirements:

Recommendation Types:
1. "Researchers Also Purchased" - Based on co-purchase history
2. "Frequently Researched Together" - Based on cart co-occurrence
3. "Similar Research Materials" - Based on category and properties
4. "Complete Your Research" - Based on incomplete sets

Algorithm:
- Collaborative filtering (user-item matrix)
- Content-based filtering (product properties)
- Hybrid approach for best results

Display Locations:
- Product detail page (sidebar)
- Cart page (upsell section)
- Checkout confirmation (related products)
- Email: Order confirmation (suggestions)

Recommendation Card:
- Product image
- Product name
- Batch purity %
- Price
- "View Details" button
- "Add to Cart" button

Compliance Language:
- Title: "Researchers Also Purchased" (NOT "Customers also bought")
- No health claims in recommendations
- Research-only framing

Admin Dashboard:
- View recommendation performance
- Manually curate recommendations per product
- Exclude products from recommendations
- A/B test recommendation algorithms

Analytics:
- Recommendation click-through rate
- Conversion rate from recommendations
- Revenue from recommendations
- Most recommended products

Database Schema:
```prisma
model ProductRecommendation {
  id            String   @id @default(cuid())
  productId     String
  recommendedId String
  score         Float    // Recommendation strength (0-1)
  algorithm     String   // "collaborative", "content", "manual"
  createdAt     DateTime @default(now())

  product       Product  @relation("source", fields: [productId], references: [id])
  recommended   Product  @relation("target", fields: [recommendedId], references: [id])

  @@index([productId, score])
}
```

API Endpoints:
- GET /products/:id/recommendations - Get recommendations for product
- POST /admin/recommendations - Manually create recommendation
- DELETE /admin/recommendations/:id - Remove recommendation
- GET /admin/recommendations/performance - View analytics
```

### C. Database Schema Updates

**ADD to prisma/schema.prisma:**

```prisma
enum ProductCategory {
  RESEARCH_PEPTIDES
  ANALYTICAL_REFERENCE_MATERIALS
  LABORATORY_ADJUNCTS
  RESEARCH_COMBINATIONS
  MATERIALS_SUPPLIES
  MERCHANDISE
}

model Product {
  id          String          @id @default(cuid())
  sku         String          @unique
  name        String
  description String          @db.Text
  category    ProductCategory // Use strict enum

  // Research-specific fields
  casNumber   String?         // Chemical Abstract Service number
  molecularFormula String?
  molecularWeight Float?
  purity      Float?          // Minimum purity %

  // Compliance
  researchUseOnly Boolean @default(true)
  isActive    Boolean @default(false) // Requires COA before activation

  // Relations
  batches     ProductBatch[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProductBatch {
  id                String   @id @default(cuid())
  productId         String
  batchCode         String   @unique // e.g., "PEP-001-240115-A"
  purity            Float    // Actual tested purity (e.g., 98.5%)
  manufacturedAt    DateTime
  expiresAt         DateTime
  quantity          Int      // Initial quantity
  available         Int      // Available quantity
  storageConditions String   // e.g., "-20°C, protect from light"

  // COA (Certificate of Analysis)
  coaFileId         String?
  coaFile           BatchFile? @relation("COA", fields: [coaFileId], references: [id])
  labName           String?    // Testing lab name
  labAccreditation  String?    // Lab certification (ISO, etc.)
  testDate          DateTime?  // Date of purity testing

  product           Product  @relation(fields: [productId], references: [id])
  files             BatchFile[] @relation("BatchFiles")

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([productId])
  @@index([expiresAt])
  @@index([batchCode])
}

model BatchFile {
  id          String        @id @default(cuid())
  batchId     String
  type        BatchFileType
  fileName    String
  fileUrl     String
  fileSize    Int           // bytes
  uploadedBy  String        // userId
  description String?

  batch       ProductBatch @relation("BatchFiles", fields: [batchId], references: [id])
  coaBatches  ProductBatch[] @relation("COA")

  createdAt   DateTime @default(now())

  @@index([batchId])
}

enum BatchFileType {
  COA               // Certificate of Analysis (required)
  MSDS              // Material Safety Data Sheet
  PRODUCT_IMAGE
  TECHNICAL_SHEET
  RESEARCH_PROTOCOL // Example research protocols (theoretical)
}

model ComplianceAcknowledgment {
  id                String   @id @default(cuid())
  userId            String
  orderId           String?
  type              String   // "checkout", "calculator", "terms"
  ipAddress         String
  userAgent         String?
  acknowledgedAt    DateTime @default(now())

  user              User     @relation(fields: [userId], references: [id])
  order             Order?   @relation(fields: [orderId], references: [id])

  @@index([userId])
  @@index([orderId])
  @@index([type])
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

model ProductRecommendation {
  id            String   @id @default(cuid())
  productId     String
  recommendedId String
  score         Float    // 0-1
  algorithm     String   // "collaborative", "content", "manual"
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())

  product       Product  @relation("RecommendationSource", fields: [productId], references: [id])
  recommended   Product  @relation("RecommendationTarget", fields: [recommendedId], references: [id])

  @@unique([productId, recommendedId])
  @@index([productId, score])
}
```

### D. Frontend Component Updates

**DisclaimerBar Component - REPLACE:**

```typescript
// apps/web/components/DisclaimerBar.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DisclaimerBarProps {
  variant?: 'default' | 'product' | 'checkout' | 'footer';
}

export function DisclaimerBar({ variant = 'default' }: DisclaimerBarProps) {
  const disclaimers = {
    default: 'All products are sold strictly for research, laboratory, or analytical purposes only.',

    product: 'All products sold on this platform are intended solely for lawful laboratory research and analytical use. Not for human or veterinary consumption.',

    checkout: 'By completing this purchase, you acknowledge that all products are for research purposes only and accept full responsibility for proper handling and compliance with applicable laws.',

    footer: 'All statements on this website have not been evaluated by the Food and Drug Administration (FDA). All products are sold strictly for research, laboratory, or analytical purposes only. Products are not intended to diagnose, treat, cure, or prevent any disease.',
  };

  return (
    <Alert variant="warning" className="border-amber-500 bg-amber-50">
      <AlertDescription className="text-sm text-amber-900">
        {disclaimers[variant]}
      </AlertDescription>
    </Alert>
  );
}

// Add to all product pages:
<DisclaimerBar variant="product" />

// Add to checkout:
<DisclaimerBar variant="checkout" />

// Add to footer:
<DisclaimerBar variant="footer" />
```

**ProductCard Component - NEW:**

```typescript
// apps/web/components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    purity?: number;
    price: number;
    imageUrl?: string;
    batchCode?: string;
    hasCOA: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      {/* Research Use Only Badge */}
      <Badge variant="warning" className="mb-2">
        Research Use Only
      </Badge>

      {/* Product Image */}
      <Link href={`/catalog/${product.id}`}>
        <Image
          src={product.imageUrl || '/placeholder-peptide.png'}
          alt={product.name}
          width={300}
          height={300}
          className="rounded-md mb-4"
        />
      </Link>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-sm text-gray-600">SKU: {product.sku}</p>

        <div className="flex gap-2">
          <Badge>{product.category}</Badge>
          {product.purity && (
            <Badge variant="secondary">
              {product.purity}% Purity
            </Badge>
          )}
        </div>

        {product.hasCOA && (
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            COA Available
          </div>
        )}

        {product.batchCode && (
          <p className="text-xs text-gray-500">
            Batch: {product.batchCode}
          </p>
        )}

        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold">
            ${product.price.toFixed(2)}
          </span>
          <Button asChild>
            <Link href={`/catalog/${product.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**COAViewer Component - NEW:**

```typescript
// apps/web/components/COAViewer.tsx
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface COAViewerProps {
  batch: {
    batchCode: string;
    purity: number;
    manufacturedAt: Date;
    expiresAt: Date;
    labName?: string;
    testDate?: Date;
    coaFileUrl?: string;
  };
}

export function COAViewer({ batch }: COAViewerProps) {
  const downloadCOA = () => {
    if (batch.coaFileUrl) {
      window.open(batch.coaFileUrl, '_blank');
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        Certificate of Analysis (COA)
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Batch Code</p>
          <p className="font-semibold">{batch.batchCode}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Purity (HPLC)</p>
          <p className="font-semibold text-green-600">{batch.purity}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Manufacturing Date</p>
          <p>{new Date(batch.manufacturedAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Expiration Date</p>
          <p>{new Date(batch.expiresAt).toLocaleDateString()}</p>
        </div>
        {batch.labName && (
          <div>
            <p className="text-sm text-gray-600">Testing Laboratory</p>
            <p>{batch.labName}</p>
          </div>
        )}
        {batch.testDate && (
          <div>
            <p className="text-sm text-gray-600">Test Date</p>
            <p>{new Date(batch.testDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {batch.coaFileUrl && (
        <Button onClick={downloadCOA} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download Full COA (PDF)
        </Button>
      )}
    </div>
  );
}
```

### E. Admin Dashboard - Content Moderation

**NEW PROMPT 23: Admin Content Compliance Dashboard**

```markdown
### Prompt 23: Build Admin Content Compliance Dashboard

Create an admin interface to prevent compliance violations.

Requirements:

Content Moderation Features:
1. Real-time language scanning
2. Forbidden term detection
3. Auto-flagging system
4. Manual review queue
5. Bulk content audit

Forbidden Term Management:
- Admin can add/edit/remove forbidden terms
- Term categories (critical, high, medium)
- Regex pattern matching support
- Case-insensitive matching
- Whole word vs partial match

Product Submission Workflow:
1. Admin creates product
2. System scans name + description for forbidden terms
3. If violations found:
   - Highlight violations in UI
   - Prevent save until fixed
   - Suggest alternatives
4. If clean:
   - Allow save
   - Log compliance check passed

Rich Text Editor Constraints:
- Block forbidden terms on paste
- Real-time highlighting of violations
- Character limit enforcement
- HTML sanitization
- Image upload restrictions (only lab equipment, no human images)

Compliance Dashboard:
- Total products scanned
- Violations detected (last 30 days)
- Most common violations
- Compliance score (%)
- Recent admin actions (audit log)

Product Audit Tool:
- Scan all existing products
- Generate compliance report
- Bulk fix suggestions
- Export violations to CSV
- Schedule automated audits

Admin Alerts:
- Email alert on critical violation
- Slack webhook for flagged content
- Daily compliance summary email
- Weekly compliance report

UI Components:
- Forbidden term manager (CRUD)
- Product scanner interface
- Violation queue (review/approve/reject)
- Compliance analytics dashboard
- Audit log viewer
```

---

## New Features to Add

### 1. Product Cards (Amazon-Style)

**Requirements:**
- Responsive grid layout (3-4 columns desktop, 1 column mobile)
- High-quality product images (COA-verified batches)
- Purity % badge
- "Research Use Only" label
- COA download icon
- Batch information
- Quick "Add to Cart"
- Hover effects with more info
- Star rating (for service, not effects)
- Price (with volume discounts visible)

**Compliance:**
- No health benefit text
- No testimonials about effects
- Only shipping/service reviews

### 2. Smart Shopping Features

**A. Recommendation Engine:**
- "Researchers Also Purchased"
- "Frequently Researched Together"
- "Complete Your Research Set"
- Based on order co-occurrence, not effects

**B. Advanced Search:**
- Filter by category, purity %, batch availability
- Search by CAS number, molecular formula
- Sort by purity, price, newest batches

**C. Wishlist/Research Cart:**
- Save products for later
- Share research cart with lab colleagues
- Price drop alerts

**D. Bulk Discounts:**
- Volume pricing tiers
- "Save X% when you order 10+"
- Research set bundles

### 3. COA Management System

**Features:**
- Upload COA PDF per batch
- Auto-extract purity % (OCR)
- QR code on COA for verification
- COA versioning (if retested)
- Expiration tracking
- Download all COAs for order (zip file)
- COA email with order confirmation

**Admin Tools:**
- Batch cannot go live without COA
- COA preview before publish
- Bulk COA upload (multiple batches)
- COA template generator
- Audit trail of COA uploads

### 4. International Shipping Compliance

**Restrictions:**
- Per-country allowlist (USA, Canada, UK, etc.)
- Per-SKU international availability
- Customs declaration automation
- Import responsibility disclaimer
- Country-specific disclaimers

**Implementation:**
```typescript
model CountryRestriction {
  id        String   @id @default(cuid())
  country   String   // ISO 3166-1 alpha-2 code
  productId String?  // Null = applies to all
  allowed   Boolean
  reason    String?  // "Customs restriction", "Legal prohibition"
  createdAt DateTime @default(now())

  @@unique([country, productId])
  @@index([country])
}
```

---

## Implementation Priority

### Phase 1: Critical Compliance (Week 1)
1. ✅ Update all language to research-only
2. ✅ Implement forbidden term blacklist
3. ✅ Add exact disclaimer text to all pages
4. ✅ Update product categories (remove supplements)
5. ✅ Add compliance checkboxes to checkout

### Phase 2: COA & Batch Management (Week 2)
1. ✅ Enhanced batch tracking schema
2. ✅ COA upload and management
3. ✅ COA viewer component
4. ✅ Batch-level inventory
5. ✅ Purity % display everywhere

### Phase 3: Product Cards & UX (Week 3)
1. ✅ Product card component
2. ✅ Recommendation engine
3. ✅ Smart search and filters
4. ✅ Wishlist functionality
5. ✅ Bulk discount UI

### Phase 4: Admin Compliance Tools (Week 4)
1. ✅ Content moderation dashboard
2. ✅ Forbidden term manager
3. ✅ Product scanner
4. ✅ Compliance analytics
5. ✅ Automated audits

---

## Updated File Checklist

Files that MUST be updated:

- [ ] `.codex/MASTER_PROMPT.md` - Language, categories, disclaimers
- [ ] `.codex/FEATURE_PROMPTS.md` - All 20+ prompts updated
- [ ] `.tessl/project.yaml` - Categories, rules, constraints
- [ ] `.tessl/context.md` - Business model, compliance context
- [ ] `.tessl/patterns.yaml` - Compliance-aware patterns
- [ ] `GUARDRAILS.md` - Stricter language, exact disclaimers
- [ ] `RECOMMENDATIONS.md` - Compliance-first optimizations
- [ ] `prisma/schema.prisma` - New models, stricter enums
- [ ] `apps/web/components/DisclaimerBar.tsx` - Exact text
- [ ] All product page templates - Add disclaimers
- [ ] All email templates - Research-only language
- [ ] Admin UI - Add content moderation

---

## Conclusion

**Gap Severity: HIGH**

The current implementation allows supplement/wellness framing, which is **unacceptable** for a research-only platform. Major updates required across:
- All documentation (language)
- Database schema (categories, COA tracking)
- Frontend components (disclaimers, product cards)
- Admin tools (compliance enforcement)

**Recommendation:**
1. **Immediately** update MASTER_PROMPT.md with strict compliance
2. Implement forbidden term blacklist in API
3. Update all existing content to research-only language
4. Build admin compliance dashboard
5. Add COA management system

**Risk if not addressed:**
- Payment processor rejection (Stripe/Square may flag)
- Hosting provider suspension
- FDA warning letter
- Legal liability

This is not optional - it's mandatory for platform survival.
