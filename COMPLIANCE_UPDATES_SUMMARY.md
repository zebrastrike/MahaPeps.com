# Compliance Updates Summary

## What Has Been Changed

### ✅ Updated Files

1. **[.codex/MASTER_PROMPT.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/.codex/MASTER_PROMPT.md)**
   - ✅ Changed from "supplement marketplace" to "research materials marketplace"
   - ✅ Added strict product categories (6 allowed, banned "supplements")
   - ✅ Added forbidden terms blacklist
   - ✅ Added exact disclaimer text (5 required disclaimers)
   - ✅ Updated user roles to research-focused language
   - ✅ Added compliance requirements section

2. **[COMPLIANCE_ANALYSIS.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/COMPLIANCE_ANALYSIS.md)** (NEW)
   - Complete gap analysis
   - Required changes by document
   - New features to add (COA management, product cards, recommendations)
   - Implementation priority roadmap
   - Database schema updates

---

## What Still Needs to Be Updated

### 🔄 Files Requiring Updates

#### High Priority (Do First)

1. **GUARDRAILS.md** - Update with strict compliance
   - Add forbidden terms blacklist
   - Add exact disclaimer text
   - Add pharmacy disclaimers (503A/503B)
   - Add content moderation rules

2. **FEATURE_PROMPTS.md** - Update all 20 prompts
   - Remove "supplement" language
   - Add compliance enforcement to all prompts
   - Add COA management prompts
   - Add product card prompt
   - Add recommendation engine prompt
   - Add peptide calculator prompt
   - Add admin compliance dashboard prompt

3. **prisma/schema.prisma** - Update database schema
   - Change ProductCategory enum (remove FDA_APPROVED, add strict categories)
   - Add COA fields to ProductBatch
   - Add ComplianceAcknowledgment model
   - Add ForbiddenTerm model
   - Add ProductRecommendation model

#### Medium Priority

4. **.tessl/project.yaml** - Update rules and categories

5. **.tessl/context.md** - Update business model description

6. **apps/web/components/DisclaimerBar.tsx** - Update with exact text

7. **All product page templates** - Add disclaimers

8. **Email templates** - Change to research-only language

---

## New Features to Implement

### 1. Product Cards (Amazon-Style)

**Location:** `apps/web/components/ProductCard.tsx`

**Features:**
- ✅ "Research Use Only" badge (mandatory)
- ✅ Purity % display
- ✅ Batch number display
- ✅ "COA Available" indicator
- ✅ Product image with hover effects
- ✅ Category badge
- ✅ Price with volume discounts
- ❌ No health benefit text
- ❌ No effect testimonials

**Implementation:** See COMPLIANCE_ANALYSIS.md Section D

### 2. COA (Certificate of Analysis) Management

**Location:** `apps/api/src/batches/` + `apps/web/components/COAViewer.tsx`

**Features:**
- ✅ Upload COA PDF per batch
- ✅ Display purity % from COA
- ✅ Show testing lab and date
- ✅ Download COA button
- ✅ Batch cannot go live without COA
- ✅ COA versioning
- ✅ Expiration tracking

**Database Updates:**
```prisma
model ProductBatch {
  // ... existing fields
  coaFileId         String?
  coaFile           BatchFile? @relation("COA")
  labName           String?
  labAccreditation  String?
  testDate          DateTime?
}

enum BatchFileType {
  COA
  MSDS
  PRODUCT_IMAGE
  TECHNICAL_SHEET
  RESEARCH_PROTOCOL
}
```

**Implementation:** See COMPLIANCE_ANALYSIS.md Section C

### 3. Smart Shopping Features

#### A. Recommendation Engine

**Location:** `apps/api/src/recommendations/` + frontend components

**Features:**
- "Researchers Also Purchased"
- "Frequently Researched Together"
- "Complete Your Research Set"
- Collaborative filtering algorithm
- Manual curation by admin

**Database:**
```prisma
model ProductRecommendation {
  id            String   @id @default(cuid())
  productId     String
  recommendedId String
  score         Float
  algorithm     String
  active        Boolean  @default(true)
}
```

**Implementation:** See COMPLIANCE_ANALYSIS.md Prompt 22

#### B. Advanced Search & Filters

**Features:**
- Filter by: category, purity %, batch availability, price
- Search by: name, SKU, CAS number, molecular formula
- Sort by: purity (high to low), price, newest batches
- Autocomplete suggestions

#### C. Bulk Discounts UI

**Features:**
- Volume pricing tiers displayed on product pages
- "Save 15% when you order 10+ vials" messaging
- Research set bundles
- Bulk order interface for labs

### 4. Peptide Calculator (Theoretical)

**Location:** `apps/web/app/tools/calculator/page.tsx`

**CRITICAL COMPLIANCE:**

**Pre-Use Disclaimer:**
```
This calculator is provided strictly for academic, theoretical, and research calculation purposes.
It does not provide guidance for human, veterinary, or clinical application.
```

**Required Acknowledgment:**
- Checkbox: "I acknowledge this tool is for academic calculation only"
- Calculator disabled until checked
- Log acknowledgment (userId, timestamp, IP)

**Calculator Functions:**
- Peptide concentration (mg to mL)
- Reconstitution volume
- Molarity calculation
- Unit conversion
- Theoretical dosage (WITH DISCLAIMER)

**UI Requirements:**
- All results labeled "Theoretical" or "For Research Purposes"
- No "Recommended" language
- No human body weight input
- Results: "Theoretical Concentration: X mg/mL (for research reference only)"

**Implementation:** See COMPLIANCE_ANALYSIS.md Prompt 21

### 5. Admin Compliance Dashboard

**Location:** `apps/web/app/(admin)/compliance/page.tsx`

**Features:**

#### Content Moderation:
- Real-time language scanning
- Forbidden term detection
- Auto-flagging system
- Manual review queue
- Bulk content audit

#### Forbidden Term Manager:
- CRUD interface for forbidden terms
- Term severity levels (CRITICAL, HIGH, MEDIUM)
- Regex pattern support
- Case-insensitive matching

#### Product Submission Workflow:
1. Admin creates/edits product
2. System scans for forbidden terms
3. If violations found:
   - Highlight violations in UI
   - Prevent save until fixed
   - Suggest alternatives
4. If clean:
   - Allow save
   - Log compliance check passed

#### Rich Text Editor Constraints:
- Block forbidden terms on paste
- Real-time violation highlighting
- Character limit enforcement
- HTML sanitization
- Image restrictions (no human images)

#### Compliance Analytics:
- Total products scanned
- Violations detected (last 30 days)
- Most common violations
- Compliance score (%)
- Recent admin actions

**Implementation:** See COMPLIANCE_ANALYSIS.md Prompt 23

### 6. International Shipping Restrictions

**Location:** `apps/api/src/shipping/` + checkout flow

**Features:**
- Per-country allowlist (USA, Canada, UK, etc.)
- Per-SKU international availability
- Customs declaration automation
- Import responsibility disclaimer

**Database:**
```prisma
model CountryRestriction {
  id        String   @id @default(cuid())
  country   String   // ISO 3166-1 alpha-2
  productId String?  // Null = all products
  allowed   Boolean
  reason    String?
}
```

**Checkout Disclaimer:**
```
International customers are solely responsible for understanding and complying with
their local import and customs regulations. We do not guarantee successful customs clearance.
```

---

## Implementation Roadmap

### Week 1: Critical Compliance (MUST DO)
- [x] Update MASTER_PROMPT.md (✅ DONE)
- [ ] Update GUARDRAILS.md with strict compliance
- [ ] Update FEATURE_PROMPTS.md (all 23 prompts)
- [ ] Update database schema (ProductCategory enum, new models)
- [ ] Update DisclaimerBar component with exact text
- [ ] Add compliance checkboxes to checkout

### Week 2: COA & Batch Management
- [ ] Enhanced ProductBatch model with COA fields
- [ ] COA upload API endpoint
- [ ] COA viewer component (frontend)
- [ ] Batch-level inventory tracking
- [ ] Purity % display on all product cards
- [ ] Batch selection during checkout

### Week 3: Product Cards & UX
- [ ] ProductCard component (Amazon-style)
- [ ] Recommendation engine (collaborative filtering)
- [ ] Advanced search and filters
- [ ] Bulk discount UI
- [ ] Wishlist functionality
- [ ] "Researchers Also Purchased" display

### Week 4: Admin Compliance Tools
- [ ] Content moderation dashboard
- [ ] Forbidden term manager (CRUD)
- [ ] Product scanner (bulk audit)
- [ ] Compliance analytics
- [ ] Rich text editor constraints
- [ ] Automated compliance checks

### Week 5: Advanced Features
- [ ] Peptide calculator (with strict disclaimers)
- [ ] International shipping restrictions
- [ ] Email templates (research-only language)
- [ ] Smart search (CAS number, molecular formula)
- [ ] Research set bundles

### Week 6: Testing & Hardening
- [ ] Compliance testing (forbidden term detection)
- [ ] E2E testing (checkout with disclaimers)
- [ ] Load testing
- [ ] Security audit
- [ ] Payment processor review prep
- [ ] Hosting provider compliance check

---

## Quick Reference: Approved vs Forbidden Language

### ❌ NEVER Use:
- "Supplement" / "Wellness" / "Health benefits"
- "Treatment" / "Therapy" / "Cure" / "Heal"
- "Dosage" / "Administration" / "Clinical use"
- "For humans" / "For patients"
- "Weight loss" / "Anti-aging" / "Performance"
- "Improves", "Treats", "Prevents"

### ✅ ALWAYS Use:
- "Research peptide" / "Laboratory material"
- "Research purposes" / "Analytical use"
- "Theoretical calculation" / "Academic reference"
- "Reconstitution" (for research)
- "For laboratory research" / "For qualified researchers"
- "Molecular structure" / "Chemical properties"

---

## Disclaimers (Copy Exactly)

### 1. Primary FDA Disclaimer (Footer + Product Pages):
```
All statements on this website have not been evaluated by the Food and Drug Administration (FDA).
All products are sold strictly for research, laboratory, or analytical purposes only.
Products are not intended to diagnose, treat, cure, or prevent any disease.
```

### 2. Research-Use-Only (Product Pages + Checkout):
```
All products sold on this platform are intended solely for lawful laboratory research and analytical use.
Not for human or veterinary consumption.
```

### 3. Non-Pharmacy Disclaimer (Footer + Legal):
```
This site operates solely as a chemical and research materials supplier.
We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act.
We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act.
```

### 4. Liability Disclaimer:
```
The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products.
The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws.
```

### 5. No Medical Advice:
```
Nothing on this website constitutes medical, clinical, or healthcare advice.
All information provided is for educational and research discussion purposes only.
```

---

## Files Updated Summary

### ✅ Completed
- [x] `.codex/MASTER_PROMPT.md` - Updated with strict compliance
- [x] `COMPLIANCE_ANALYSIS.md` - Created with full gap analysis

### 🔄 In Progress / To Do
- [ ] `.codex/FEATURE_PROMPTS.md` - All 23 prompts need updates
- [ ] `GUARDRAILS.md` - Add strict language
- [ ] `.tessl/project.yaml` - Update categories and rules
- [ ] `.tessl/context.md` - Update business model
- [ ] `prisma/schema.prisma` - Update database schema
- [ ] `apps/web/components/DisclaimerBar.tsx` - Exact disclaimer text
- [ ] All product page templates
- [ ] All email templates
- [ ] Admin UI components

---

## Next Steps

1. **Review COMPLIANCE_ANALYSIS.md** - Full gap analysis and requirements
2. **Implement database changes** - Update Prisma schema
3. **Update remaining prompts** - FEATURE_PROMPTS.md (23 prompts)
4. **Build COA management** - Critical for research credibility
5. **Build compliance dashboard** - Prevent violations before they happen
6. **Test thoroughly** - Forbidden term detection, disclaimers, checkout flow

---

## Questions for User

1. **Product Categories:** Are the 6 approved categories sufficient, or do you need additional research material categories?

2. **COA Requirements:** Should COA be required for ALL batches, or only certain categories?

3. **Age Verification:** Do you want simple self-declaration (checkbox) or third-party verification (Onfido, Yoti)?

4. **International Shipping:** Which countries should be allowed? USA only, or expand to Canada, UK, EU, Australia?

5. **Peptide Calculator:** Should this be public (with disclaimers) or login-required?

6. **Product Recommendations:** Prefer automated (collaborative filtering) or manual curation by admin?

7. **Compliance Alerts:** Email, Slack, or both for content violations?

8. **Research Credentials:** For CLIENT role, should we verify research credentials (university email, lab affiliation) or just age 21+?

---

## Risk Assessment

### High Risk (Must Fix Immediately)
- ❌ "Supplement" language still exists in some files
- ❌ Missing pharmacy disclaimers (503A/503B)
- ❌ No content moderation system
- ❌ No COA requirement enforcement

### Medium Risk (Fix Soon)
- ⚠️ Generic disclaimers instead of exact text
- ⚠️ No international shipping restrictions
- ⚠️ No compliance acknowledgment logging
- ⚠️ Testimonials not restricted

### Low Risk (Can Wait)
- ℹ️ Missing advanced search features
- ℹ️ No recommendation engine yet
- ℹ️ Calculator not implemented

---

## Support

For implementation help:
- **Full gap analysis:** See [COMPLIANCE_ANALYSIS.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/COMPLIANCE_ANALYSIS.md)
- **Code patterns:** See `.tessl/patterns.yaml`
- **Feature prompts:** See `.codex/FEATURE_PROMPTS.md`
- **Compliance rules:** See `GUARDRAILS.md` (to be updated)

**Remember:** Compliance > Features. Platform longevity > Short-term growth.
