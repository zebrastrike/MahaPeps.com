# MAHA Peptides OS – Compliance Guardrails

## CRITICAL: Source of Truth for Compliance

This document is the **authoritative source** for all compliance requirements. When conflicts exist with other documents, **this file takes precedence**.

---

## Platform Positioning (Non-Negotiable)

### ✅ What This Platform IS:
- Research materials supplier
- Laboratory chemical marketplace
- B2B + qualified researcher platform
- Non-clinical, non-medical, non-therapeutic system

### ❌ What This Platform IS NOT:
- NOT a supplement store
- NOT a pharmacy or compounding facility
- NOT a wellness brand
- NOT a medical platform
- NOT a consumer health product site

---

## Prohibited Content Categories (ABSOLUTE)

### 🚫 NEVER Allow:

1. **Medical Claims**
   - No health benefits
   - No therapeutic claims
   - No treatment suggestions
   - No cure/prevention claims

2. **Dosing & Administration**
   - No dosage recommendations
   - No administration instructions
   - No injection protocols
   - No consumption guidance
   - **NO "theoretical dosage calculator"** (even for "academic purposes")

3. **Protocols & Treatment Plans**
   - No medical protocols
   - No treatment plans
   - No off-label use guidance
   - **NO "research protocol" files** (even labeled "theoretical")

4. **Health Outcomes**
   - No testimonials about effects/results
   - No before/after claims
   - No efficacy statements
   - No performance claims

5. **Medical Framing**
   - No "for patients" language
   - No "clinical use" references
   - No "medical advice" provision
   - No "consult a doctor" (implies medical use)

---

## Language Blacklist (AUTO-REJECT)

### 🚫 FORBIDDEN TERMS - Must NEVER Appear:

**Medical/Health:**
- "Supplement" / "Dietary supplement"
- "Wellness" / "Health benefits"
- "Treatment" / "Therapy" / "Therapeutic"
- "Medical" / "Medicine" / "Drug" (except in disclaimers)
- "Clinical use" / "For patients" / "For humans"
- "Improves", "Treats", "Cures", "Prevents" (health outcomes)

**Dosing/Administration:**
- "Dosage" / "Dose" / "Dosing"
- "Administration" / "Administer"
- "Injectable" / "Injection" / "Injecting" (for human use)
- "Oral use" / "Nasal use" / "Topical use" (for human use)
- "Protocol" / "Regimen" / "Cycle" (medical context)

**Marketing/Claims:**
- "Weight loss" / "Fat burning"
- "Anti-aging" / "Rejuvenation"
- "Performance enhancement" / "Muscle building"
- "Energy boost" / "Cognitive enhancement"
- "FDA-approved" (for consumer health use)

### ✅ APPROVED ALTERNATIVES:

**Instead of Medical Terms:**
- "Research peptide" / "Laboratory material" / "Analytical reference"
- "Research purposes" / "Analytical use" / "Laboratory application"
- "For qualified researchers" / "For laboratory research"

**Instead of Dosing Terms:**
- "Reconstitution" / "Preparation" (for research only)
- "Concentration" / "Molarity" (chemical properties)
- "Theoretical calculation" / "Academic reference" (if absolutely needed)

**Instead of Health Claims:**
- "Molecular structure" / "Chemical properties"
- "Published research" / "Scientific literature"
- "Mechanism of action" (biochemical, not clinical)

---

## Required Disclaimers (EXACT TEXT ONLY)

**Copy these EXACTLY - no modifications allowed.**

### 1. Primary FDA Disclaimer
**Placement:** Footer (every page) + Product pages

```
All statements on this website have not been evaluated by the Food and Drug Administration (FDA).
All products are sold strictly for research, laboratory, or analytical purposes only.
Products are not intended to diagnose, treat, cure, or prevent any disease.
```

### 2. Research-Use-Only Disclaimer
**Placement:** Product pages + Checkout + Order confirmation

```
All products sold on this platform are intended solely for lawful laboratory research and analytical use.
Not for human or veterinary consumption.
```

### 3. Non-Pharmacy Disclaimer (503A/503B)
**Placement:** Footer + Legal/Terms page

```
This site operates solely as a chemical and research materials supplier.
We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act.
We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act.
```

### 4. Liability & Responsibility Disclaimer
**Placement:** Checkout + Terms of Service

```
The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products.
The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws.
```

### 5. No Medical Advice Disclaimer
**Placement:** Footer + Contact/Support pages

```
Nothing on this website constitutes medical, clinical, or healthcare advice.
All information provided is for educational and research discussion purposes only.
```

### ❌ NEVER Use:
- "Consult a licensed professional" (implies medical use)
- "For informational purposes only" (too vague)
- "Not FDA approved" (without full FDA disclaimer)

---

## UX/Content Safety Rules

### Display Requirements:

1. **All Product Pages:**
   - Research-use-only disclaimer (prominent)
   - FDA disclaimer (visible without scrolling)
   - "Research Use Only" badge on product cards
   - No health benefit text allowed

2. **All Checkout Pages:**
   - Required compliance checkboxes (5 total - see below)
   - All disclaimers visible
   - Cannot proceed without accepting all checkboxes
   - Acceptance logged (timestamp + IP)

3. **Footer (Every Page):**
   - FDA disclaimer
   - Non-pharmacy disclaimer
   - No medical advice disclaimer

### Prohibited UX Elements:

- ❌ No dosing calculators (even "theoretical")
- ❌ No protocol templates
- ❌ No administration guides
- ❌ No user forums or public comments
- ❌ No testimonials about effects/results
- ❌ No AI-generated medical content
- ❌ No auto-suggest for dosing/protocols

### Required Checkout Checkboxes (All Mandatory):

```
☐ I acknowledge that all products are for research purposes only and not for human or veterinary consumption.

☐ I accept full responsibility for proper handling, storage, and disposal of all products in accordance with applicable laws.

☐ I understand that no information on this site constitutes medical or healthcare advice.

☐ I confirm that I am at least 21 years of age.

☐ I have read and agree to the Terms of Service and Research Use Policy.
```

All must be checked before order submission. Log acceptance with userId, timestamp, and IP address.

---

## Product Categories (STRICT - ONLY THESE)

### ✅ ALLOWED Categories:

1. **Research Peptides** - Laboratory research compounds
2. **Analytical Reference Materials** - Chemical standards and controls
3. **Laboratory Adjuncts** - Research support materials
4. **Research Combinations** - Pre-configured research sets
5. **Materials & Supplies** - Lab equipment and supplies (non-consumable)
6. **Merchandise** - Branded non-consumable items (lab coats, beakers, etc.)

### 🚫 BANNED Categories:

- "Supplements" (any type)
- "Wellness products"
- "Health products"
- "Dietary supplements"
- "Injectable supplements"
- "Oral supplements"
- "FDA Approved" (for consumer health use)
- "Medical" or "Clinical" (without "research" qualifier)
- Any category implying human consumption or therapeutic use

---

## File Types (Compliance-Safe Only)

### ✅ ALLOWED File Types:

For ProductBatch files:

```prisma
enum BatchFileType {
  COA                // Certificate of Analysis (REQUIRED)
  MSDS               // Material Safety Data Sheet
  PRODUCT_IMAGE      // Product photos
  TECHNICAL_SHEET    // Chemical technical specifications
}
```

### 🚫 BANNED File Types:

- ❌ `RESEARCH_PROTOCOL` - Implies dosing/administration protocols
- ❌ `DOSING_GUIDE` - Prohibited
- ❌ `ADMINISTRATION_GUIDE` - Prohibited
- ❌ `TREATMENT_PROTOCOL` - Prohibited
- ❌ Any file type that could contain dosing or medical guidance

---

## Data Handling Rules

### Encryption Requirements:

1. **PII (Personally Identifiable Information):**
   - Encrypt at rest (AES-256)
   - Encrypt in transit (HTTPS/TLS)
   - Fields: name, phone, SSN, address

2. **Payment Data:**
   - NEVER store raw card numbers
   - Use payment processor tokens only
   - Tokenize via Epicor Propello or wire transfer
   - No CVV storage ever

3. **Sensitive Documents:**
   - COAs: Encrypted at rest
   - KYC documents: Encrypted at rest
   - MSDS files: Encrypted at rest

### Access Controls:

- **Admin Access:**
  - IP whitelisting recommended
  - MFA required for admin accounts
  - All admin actions logged to AuditLog

- **Customer Access:**
  - Role-based access (CLIENT, CLINIC, DISTRIBUTOR, ADMIN)
  - JWT authentication with 24h expiration
  - Session management

### Audit Requirements:

All of the following MUST be logged:

```typescript
// AuditLog entries required for:
- User authentication (login, logout, failed attempts)
- Order creation, status changes, cancellation
- Payment events (initiated, completed, failed, refunded)
- Admin actions (user management, product changes, settings)
- KYC submissions, approvals, rejections
- COA uploads and updates
- Compliance violations detected
```

**Retention:** 7 years minimum (compliance requirement)

---

## Access Restrictions

### KYC Requirements:

1. **CLINIC Role:**
   - KYC verification required before wholesale access
   - Required documents:
     - Business license
     - Medical facility license
     - Tax ID
     - Principal officer ID

2. **DISTRIBUTOR Role:**
   - KYC verification required before wholesale access
   - Required documents:
     - Business license
     - Tax ID
     - Principal officer ID
     - Proof of business address

3. **CLIENT Role:**
   - Age verification required (21+)
   - Research credentials recommended (university email, lab affiliation)
   - Optional: Institutional affiliation verification

### Geographic Restrictions:

**International Shipping:**
- Per-country allowlist (admin configurable)
- Per-SKU restrictions by country
- Import disclaimer required:
  ```
  International customers are solely responsible for understanding and complying with
  their local import and customs regulations. We do not guarantee successful customs clearance.
  ```

---

## Support/Operations Guardrails

### Support Staff Rules:

1. **NEVER Provide:**
   - Medical advice
   - Dosing guidance
   - Administration instructions
   - Protocol recommendations
   - Health outcome predictions

2. **CAN Provide:**
   - Order status updates
   - Shipping information
   - Product availability
   - Account assistance
   - Technical product specs (chemical properties)
   - COA explanations (purity, testing methods)

3. **Escalation Required For:**
   - Any medical or dosing questions → Compliance team
   - Suspicious orders → Compliance review
   - Bulk orders from new customers → KYC verification
   - International orders → Compliance check

### Support Interaction Logging:

- All support tickets logged
- Customer service calls recorded (with consent)
- Email support archived
- Flagged interactions reviewed by compliance team

---

## AI/Automation Guardrails

### Allowed AI Use:

✅ **Internal Operations Only:**
- Fraud detection
- Order anomaly detection
- Inventory forecasting
- Recommendation engine (products, not dosing)
- Search relevance

### Prohibited AI Use:

❌ **User-Facing Content:**
- No AI-generated medical content
- No AI-generated dosing guidance
- No AI-generated protocols
- No AI chatbot for medical questions

### AI Output Review:

- All AI-generated content reviewed by human before publishing
- Content moderation with forbidden term scanning
- Compliance team approval for any AI features

---

## Testimonial & Review Rules

### ✅ ALLOWED Reviews:

Reviews can ONLY reference:
- Shipping speed
- Packaging quality
- Customer service experience
- Order accuracy
- Product availability
- COA quality/clarity

### 🚫 PROHIBITED Reviews:

Reviews must NEVER reference:
- Effects or results
- Health outcomes
- Usage experiences
- Dosing experiences
- Administration experiences
- Before/after changes
- Any bodily or mental effects

### Review Moderation:

- All reviews moderated before publishing
- Auto-flag reviews with forbidden terms
- Manual approval required for all reviews
- Rejection reasons logged

---

## Admin Dashboard Requirements

### No-Code Management (Critical):

The admin dashboard MUST allow **non-technical staff** to manage:

1. **Content Management:**
   - Product CRUD (create, read, update, delete)
   - Rich text editor with forbidden term blocking
   - Image upload with validation
   - Category management (from allowed list only)

2. **Compliance Tools:**
   - Real-time forbidden term scanner
   - Product compliance audit (bulk scan)
   - Flagged content review queue
   - Manual content approval workflow

3. **Order Management:**
   - Pending order review queue
   - Compliance checklist per order
   - Approve/reject with notes
   - Payment link generation (one click)
   - Manual payment confirmation

4. **User Management:**
   - User CRUD
   - Role assignment (CLIENT, CLINIC, DISTRIBUTOR, ADMIN)
   - KYC document review
   - Account status controls

5. **COA Management:**
   - Upload COA per batch
   - Batch activation (requires COA)
   - COA preview/download
   - Batch expiration tracking

6. **Settings Management:**
   - Disclaimer text editor (with validation)
   - Forbidden term manager (CRUD)
   - Email template editor (with validation)
   - Payment processor settings
   - Shipping restrictions (country allowlist)

### Admin UI Requirements:

- **No code editing required**
- **No database access needed**
- **Drag-and-drop interfaces** where possible
- **WYSIWYG editors** with compliance guardrails
- **One-click actions** for common tasks
- **Bulk operations** for efficiency
- **Search and filter** on all tables
- **Export to CSV** for reporting

---

## Compliance Violation Handling

### Automated Detection:

**System MUST automatically:**
1. Scan all product content for forbidden terms (on save)
2. Block save if violations found
3. Highlight violations in admin UI
4. Suggest compliant alternatives
5. Log all violation attempts

### Manual Review:

**Compliance team reviews:**
1. Flagged content from automated scan
2. User-submitted reviews/testimonials
3. Support tickets with medical questions
4. Suspicious orders
5. KYC documents

### Violation Actions:

**If violation detected:**
1. Content: Prevent publication until fixed
2. User content: Remove and notify user
3. Support response: Flag for compliance review
4. Order: Hold for manual review

---

## Allowed vs. Disallowed Examples

### Product Descriptions:

| ✅ ALLOWED | ❌ DISALLOWED |
|-----------|--------------|
| "Research-grade peptide for laboratory use" | "Peptide supplement for anti-aging" |
| "98.5% purity as verified by HPLC" | "Clinically proven to reduce wrinkles" |
| "Molecular formula: C₁₉H₃₄N₆O₅" | "Recommended dosage: 250mcg daily" |
| "Storage: -20°C, protect from light" | "Best results when injected subcutaneously" |
| "COA available for download" | "Improves muscle recovery in athletes" |

### Customer Communication:

| ✅ ALLOWED | ❌ DISALLOWED |
|-----------|--------------|
| "Your order has shipped" | "Here's how to inject the peptide" |
| "COA shows 98.2% purity" | "Take 1mg per day for best results" |
| "Product is for research use only" | "This will help with your condition" |
| "Please refer to published literature" | "Recommended protocol: 4 weeks on, 2 off" |

### Support Responses:

| ✅ ALLOWED | ❌ DISALLOWED |
|-----------|--------------|
| "This product is for research purposes only" | "The typical dosage is 2mg daily" |
| "We can provide the COA for this batch" | "Mix it with bacteriostatic water and inject" |
| "Shipping takes 3-5 business days" | "You should see results in 2-4 weeks" |
| "All products come with a COA" | "Consult your doctor for dosing guidance" |

---

## Compliance Checklist (Pre-Launch)

Before going live, verify:

- [ ] All disclaimers present (exact text) on all pages
- [ ] Forbidden term system implemented and tested
- [ ] Product categories limited to approved list
- [ ] No dosing calculators or protocol tools
- [ ] All checkout compliance checkboxes required
- [ ] Compliance acceptance logging implemented
- [ ] COA required before batch activation
- [ ] KYC workflow implemented for B2B
- [ ] Age verification for retail customers
- [ ] Admin content moderation dashboard functional
- [ ] Forbidden term manager operational
- [ ] Product scanner detects violations
- [ ] All admin actions logged to AuditLog
- [ ] PII encryption at rest implemented
- [ ] Payment tokenization (no raw cards stored)
- [ ] Review moderation system operational
- [ ] Support staff trained on guardrails
- [ ] Escalation protocols documented

---

## Compliance Team Contacts

**For Questions About:**
- Legal compliance → Legal team
- FDA regulations → Regulatory affairs
- Payment processor compliance → Finance team
- Technical implementation → Engineering lead

**Escalate Immediately:**
- FDA inquiry or warning letter
- Payment processor account hold
- Hosting provider compliance issue
- Customer complaint about medical advice
- Media inquiry about products

---

## Document Updates

**Last Updated:** 2025-01-05
**Version:** 2.0 (Authoritative Compliance Version)
**Changes:** Complete rewrite to align with research-only positioning, exact disclaimer requirements, and no-code admin emphasis

**This document supersedes:**
- Previous GUARDRAILS.md versions
- Conflicting compliance language in other docs
- Any "theoretical dosage calculator" proposals
- Any "research protocol" file type proposals

---

**When in doubt: If it could be interpreted as medical, dosing, or therapeutic guidance, DON'T DO IT.**
