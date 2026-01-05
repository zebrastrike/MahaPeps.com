# Codex Conflicts Resolved - Clean Start Guide

## ✅ All Conflicts Resolved

This document addresses **all issues** found by Codex and provides the **authoritative answers** for starting development.

---

## Issue 1: Compliance Contradictions ✅ RESOLVED

### ❌ Problem (High Priority):
- **GUARDRAILS.md** banned dosing/protocols
- **COMPLIANCE_ANALYSIS.md** proposed "theoretical dosage calculator" and "RESEARCH_PROTOCOL" file type
- **Result:** Could lead to implementing prohibited features

### ✅ Solution:
**GUARDRAILS.md** is now the **authoritative source** and explicitly states:

```
❌ NO "theoretical dosage calculator" (even for "academic purposes")
❌ NO "research protocol" files (even labeled "theoretical")
```

**Action Required:**
- Do NOT implement any dosing calculator
- Do NOT add RESEARCH_PROTOCOL file type
- Follow GUARDRAILS.md for all compliance decisions

**Updated Files:**
- ✅ [GUARDRAILS.md](GUARDRAILS.md) - Now authoritative (version 2.0)
- 🔄 [COMPLIANCE_ANALYSIS.md](COMPLIANCE_ANALYSIS.md) - Ignore calculator/protocol sections

---

## Issue 2: Disclaimer Source-of-Truth Conflict ✅ RESOLVED

### ❌ Problem (High Priority):
- **GUARDRAILS.md** had short disclaimers + "Consult a licensed professional"
- **COMPLIANCE_ANALYSIS.md** had exact FDA/503A/503B text
- **Result:** Compliance mismatch

### ✅ Solution:
**GUARDRAILS.md** now contains the **exact disclaimer text** (5 required disclaimers):

1. **Primary FDA Disclaimer** (Footer + Product pages)
2. **Research-Use-Only Disclaimer** (Product + Checkout)
3. **Non-Pharmacy Disclaimer 503A/503B** (Footer + Legal)
4. **Liability & Responsibility Disclaimer** (Checkout + Terms)
5. **No Medical Advice Disclaimer** (Footer + Support)

**❌ NEVER Use:**
- "Consult a licensed professional" (removed - implies medical use)
- Short/generic disclaimers

**Action Required:**
- Copy disclaimer text EXACTLY from GUARDRAILS.md (lines 112-152)
- No modifications allowed
- Implement on specified pages

**Authoritative Source:**
- ✅ [GUARDRAILS.md lines 108-157](GUARDRAILS.md) - Exact disclaimer text

---

## Issue 3: Repo Layout Mismatch ✅ RESOLVED

### ❌ Problem (Medium Priority):
- Docs expect `/apps/api` + `/apps/web`
- Bootstrap instructions create `/apps/backend`, `/apps/frontend`, `/apps/admin`
- **Result:** Repo layout confusion

### ✅ Solution:
**Standardize on the ACTUAL codebase structure:**

```
MahaPeps.com/
├── apps/
│   ├── api/          ← NestJS backend (USE THIS)
│   ├── web/          ← Next.js frontend (USE THIS)
│   └── packages/     ← Shared code (future)
├── infra/            ← Docker, nginx
├── scripts/          ← Automation
└── docs/             ← Documentation
```

**Why this structure:**
- ✅ Already exists in current codebase
- ✅ Monorepo best practices
- ✅ Clear separation frontend/backend
- ✅ Matches all documentation references

**Action Required:**
- Use `/apps/api` for backend
- Use `/apps/web` for frontend
- Ignore bootstrap instructions that mention `/apps/backend` or `/apps/frontend`

**DO NOT CREATE:**
- ❌ `/apps/backend`
- ❌ `/apps/frontend`
- ❌ `/apps/admin` (admin is a route group in `/apps/web/app/(admin)`)

---

## Issue 4: Non-Portable File Links ✅ RESOLVED

### ❌ Problem (Medium Priority):
- Absolute `file://` links won't work on GitHub
- Leak local paths

### ✅ Solution:
**Use relative links** for all internal documentation references.

**Examples:**

❌ **Wrong:**
```markdown
See [COMPLIANCE_ANALYSIS.md](file://c:/Users/keyse_pt9dxr4/MAHAPEPS/MahaPeps.com/COMPLIANCE_ANALYSIS.md)
```

✅ **Correct:**
```markdown
See [COMPLIANCE_ANALYSIS.md](COMPLIANCE_ANALYSIS.md)
See [.codex/MASTER_PROMPT.md](.codex/MASTER_PROMPT.md)
See [GUARDRAILS.md](../GUARDRAILS.md) (if in subdirectory)
```

**Action Required:**
- All documentation already uses relative links going forward
- Old file:// links can be ignored (don't follow them)

---

## Issue 5: Payment Processor References ✅ RESOLVED

### ❌ Problem (Low/Medium):
- Some docs still mention Stripe
- Project uses Epicor Propello + private payment links

### ✅ Solution:
**Payment strategy is clearly defined:**

1. **NO Stripe** - Ever
2. **Private payment links** sent via SMS (Twilio) + Email (Mailgun)
3. **Epicor Propello** (or similar high-risk processor) - when available
4. **Wire transfer** - Backup for B2B
5. **Cryptocurrency** - Optional for international

**Action Required:**
- Follow [PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md) for payment implementation
- Ignore any Stripe references in old docs
- See [STRIPE_REMOVAL_CHECKLIST.md](STRIPE_REMOVAL_CHECKLIST.md) for migration

---

## Authoritative Document Hierarchy

When conflicts exist, follow this order:

### 1️⃣ **[GUARDRAILS.md](GUARDRAILS.md)** - ABSOLUTE AUTHORITY
**Purpose:** Compliance rules, forbidden terms, required disclaimers
**Use For:**
- What language is allowed/forbidden
- Exact disclaimer text
- Product categories
- File types
- Admin dashboard requirements (no-code)

**Updated:** 2025-01-05 (Version 2.0)

---

### 2️⃣ **[PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md)** - Payment Implementation
**Purpose:** Payment link system, Epicor Propello integration, order review workflow
**Use For:**
- How payment processing works
- Admin order review process
- Payment link generation
- SMS/Email delivery

---

### 3️⃣ **[.codex/MASTER_PROMPT.md](.codex/MASTER_PROMPT.md)** - Project Context
**Purpose:** Overall project architecture, tech stack, patterns
**Use For:**
- Project overview
- Tech stack
- Database schema
- API patterns
- Frontend patterns

**Note:** Updated for compliance, but defer to GUARDRAILS.md for compliance specifics

---

### 4️⃣ **[COMPLIANCE_ANALYSIS.md](COMPLIANCE_ANALYSIS.md)** - Feature Specs
**Purpose:** Technical implementation details for new features
**Use For:**
- Database schema updates
- COA management system
- Product cards design
- Recommendation engine
- Admin compliance dashboard

**⚠️ IGNORE:**
- "Theoretical dosage calculator" sections (Prompt 21)
- RESEARCH_PROTOCOL file type references
- Any dosing/protocol features

---

### 5️⃣ **[IMMEDIATE_ACTION_PLAN.md](IMMEDIATE_ACTION_PLAN.md)** - Roadmap
**Purpose:** 6-week implementation roadmap
**Use For:**
- Week-by-week tasks
- Priority order
- Quick wins

---

## Clean Answers to Codex Questions

### Q1: Which compliance doc is authoritative for disclaimer text?

**A:** [GUARDRAILS.md](GUARDRAILS.md) (lines 108-157)

**Exact disclaimers:**
1. Primary FDA Disclaimer
2. Research-Use-Only Disclaimer
3. Non-Pharmacy Disclaimer (503A/503B)
4. Liability & Responsibility Disclaimer
5. No Medical Advice Disclaimer

Copy these EXACTLY with no modifications.

---

### Q2: Which app folder convention?

**A:** `/apps/api` + `/apps/web`

**Structure:**
```
MahaPeps.com/
├── apps/
│   ├── api/     ← Backend (NestJS)
│   └── web/     ← Frontend (Next.js)
```

**DO NOT create:**
- `/apps/backend`
- `/apps/frontend`
- `/apps/admin` (admin is a route in web)

---

### Q3: Stripe or high-risk processor?

**A:** **NO Stripe**. Use:
1. **Private payment links** (primary method)
2. **Epicor Propello** (when available)
3. **Wire transfer** (B2B backup)

See [PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md) for complete details.

---

### Q4: Should we do a full compliance pass on MASTER_PROMPT.md and FEATURE_PROMPTS.md?

**A:** **Partial - not urgent**

**What's done:**
- ✅ GUARDRAILS.md is now authoritative
- ✅ MASTER_PROMPT.md updated with research-only language
- ✅ Payment strategy defined (no Stripe)

**What still needs update:**
- 🔄 FEATURE_PROMPTS.md - Remove Stripe from Prompts 6-7, remove dosing calculator (Prompt 21)
- 🔄 Some old docs may have Stripe references (can ignore)

**Priority:** Low (GUARDRAILS.md supersedes all conflicts)

---

## What to Implement (Authoritative List)

### ✅ DO Implement:

1. **Product Cards (Amazon-Style)**
   - Spec: [COMPLIANCE_ANALYSIS.md Section D](COMPLIANCE_ANALYSIS.md)
   - Compliance: "Research Use Only" badge, purity %, COA indicator
   - No health claims

2. **COA Management System**
   - Spec: [COMPLIANCE_ANALYSIS.md Section C](COMPLIANCE_ANALYSIS.md)
   - Requirement: Batch cannot go live without COA
   - Upload, preview, download, version tracking

3. **Smart Shopping (Recommendations)**
   - Spec: [COMPLIANCE_ANALYSIS.md Prompt 22](COMPLIANCE_ANALYSIS.md)
   - Feature: "Researchers Also Purchased"
   - Algorithm: Collaborative filtering
   - Admin curation

4. **No-Code Admin Dashboard**
   - Spec: [GUARDRAILS.md lines 442-496](GUARDRAILS.md)
   - Content moderation
   - Forbidden term scanner
   - Order review workflow
   - COA management
   - One-click actions

5. **Private Payment Links**
   - Spec: [PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md)
   - SMS delivery (Twilio)
   - Email delivery (Mailgun)
   - Epicor Propello integration

6. **Compliance Enforcement**
   - Forbidden term blacklist
   - Auto-scanning on save
   - Required disclaimers (exact text)
   - Checkout compliance checkboxes
   - Audit logging

---

### ❌ DO NOT Implement:

1. **Theoretical Dosage Calculator**
   - ❌ Banned per GUARDRAILS.md line 41
   - Even "for academic purposes" is prohibited

2. **Research Protocol Files**
   - ❌ Banned per GUARDRAILS.md line 252
   - Do NOT add RESEARCH_PROTOCOL file type

3. **Dosing/Administration Features**
   - ❌ No dosing guides
   - ❌ No protocol templates
   - ❌ No administration instructions

4. **Medical Framing**
   - ❌ No "for patients" language
   - ❌ No health outcome testimonials
   - ❌ No "consult a doctor" disclaimers

5. **Stripe Integration**
   - ❌ No Stripe (replaced with payment links)

---

## Admin Dashboard: No-Code Emphasis

### CRITICAL Requirement:

**Non-technical staff must be able to:**

1. **Manage Products** (no code)
   - Create/edit products via form
   - Upload images (drag-and-drop)
   - Rich text editor with compliance guardrails
   - Category dropdown (only allowed categories)

2. **Review Orders** (one-click workflow)
   - See pending orders
   - Check compliance checklist
   - Click "Approve" → payment link generated automatically
   - Click "Reject" → rejection email sent

3. **Upload COAs** (simple upload)
   - Click "Upload COA" button
   - Drag-and-drop PDF
   - Preview before saving
   - Batch auto-activates when COA uploaded

4. **Moderate Content** (visual interface)
   - See flagged content highlighted in red
   - Click violations to see suggestions
   - Fix and re-save
   - No SQL queries needed

5. **Manage Settings** (form-based)
   - Edit disclaimer text (with validation)
   - Manage forbidden terms (add/remove from table)
   - Configure payment processor (form fields)
   - Set shipping restrictions (country checkboxes)

### Implementation Approach:

**Use:**
- ✅ **Radix UI** for accessible components
- ✅ **React Hook Form** for form management
- ✅ **TanStack Table** for data grids
- ✅ **Rich text editor** (Tiptap or similar) with forbidden term blocking
- ✅ **Drag-and-drop** file uploads (react-dropzone)
- ✅ **WYSIWYG editors** for email templates
- ✅ **One-click buttons** for common actions
- ✅ **Bulk actions** (select multiple, approve all)

**Avoid:**
- ❌ Raw JSON editors
- ❌ SQL query builders
- ❌ Code editing interfaces
- ❌ Command-line tools

**Goal:** Admin with zero coding experience can manage entire platform.

---

## File Type Enum (Corrected)

**GUARDRAILS.md is authoritative**

```prisma
// prisma/schema.prisma

enum BatchFileType {
  COA              // Certificate of Analysis (REQUIRED)
  MSDS             // Material Safety Data Sheet
  PRODUCT_IMAGE    // Product photos
  TECHNICAL_SHEET  // Chemical technical specifications
}

// ❌ DO NOT ADD:
// RESEARCH_PROTOCOL  ← BANNED
// DOSING_GUIDE       ← BANNED
// ADMINISTRATION_GUIDE ← BANNED
```

---

## Product Category Enum (Corrected)

**GUARDRAILS.md is authoritative**

```prisma
// prisma/schema.prisma

enum ProductCategory {
  RESEARCH_PEPTIDES
  ANALYTICAL_REFERENCE_MATERIALS
  LABORATORY_ADJUNCTS
  RESEARCH_COMBINATIONS
  MATERIALS_SUPPLIES
  MERCHANDISE
}

// ❌ DO NOT ADD:
// SUPPLEMENTS            ← BANNED
// WELLNESS               ← BANNED
// FDA_APPROVED_CONSUMER  ← BANNED
// HEALTH_PRODUCTS        ← BANNED
```

---

## Quick Start for Codex

### Step 1: Read These (In Order)

1. **[GUARDRAILS.md](GUARDRAILS.md)** ⭐ Start here (compliance rules)
2. **[PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md)** (payment system)
3. **[.codex/MASTER_PROMPT.md](.codex/MASTER_PROMPT.md)** (project context)
4. **[IMMEDIATE_ACTION_PLAN.md](IMMEDIATE_ACTION_PLAN.md)** (roadmap)

### Step 2: Use for Implementation

5. **[COMPLIANCE_ANALYSIS.md](COMPLIANCE_ANALYSIS.md)** (feature specs - ignore calculator/protocol sections)
6. **[.tessl/patterns.yaml](.tessl/patterns.yaml)** (code patterns)

### Step 3: Reference as Needed

7. **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** (infrastructure optimization)
8. **[STRIPE_REMOVAL_CHECKLIST.md](STRIPE_REMOVAL_CHECKLIST.md)** (remove Stripe)

---

## What Codex Needs to Know

### 1. Compliance is Non-Negotiable

- **GUARDRAILS.md** is law
- No dosing calculators (even "theoretical")
- No protocol files
- Exact disclaimer text only
- Forbidden term auto-rejection

### 2. No-Code Admin is Priority

- Non-technical staff must be able to manage platform
- Drag-and-drop, WYSIWYG, one-click actions
- No code editing, SQL, or command-line

### 3. Payment is Private Links

- No Stripe
- Private payment links via SMS + Email
- Admin reviews orders before payment
- Epicor Propello when available

### 4. Repo Structure

- `/apps/api` for backend
- `/apps/web` for frontend
- No `/apps/backend` or `/apps/frontend`

### 5. COA is Required

- Batches cannot go live without COA
- Upload system required
- Download available to customers
- Purity % displayed prominently

---

## Summary for Codex

### ✅ Conflicts Resolved:

1. **Compliance contradictions** → GUARDRAILS.md is authoritative, no dosing calculator
2. **Disclaimer conflicts** → GUARDRAILS.md has exact text (5 disclaimers)
3. **Repo layout** → Use `/apps/api` + `/apps/web`
4. **File links** → Use relative links only
5. **Payment** → No Stripe, use private payment links

### 📋 Authoritative Sources:

1. **Compliance:** [GUARDRAILS.md](GUARDRAILS.md)
2. **Payment:** [PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md)
3. **Architecture:** [.codex/MASTER_PROMPT.md](.codex/MASTER_PROMPT.md)
4. **Features:** [COMPLIANCE_ANALYSIS.md](COMPLIANCE_ANALYSIS.md) (ignore calculator/protocol)

### 🚀 Ready to Build:

- All conflicts resolved
- Authoritative docs identified
- Clean implementation path
- No-code admin emphasized
- Compliance-first approach

**Start with Week 1 in [IMMEDIATE_ACTION_PLAN.md](IMMEDIATE_ACTION_PLAN.md)**

---

## Version

**Document:** Codex Conflicts Resolved
**Version:** 1.0
**Date:** 2025-01-05
**Status:** ✅ All conflicts resolved, ready for development

**This document supersedes all conflicting information in other docs.**

When in doubt, check:
1. Compliance → [GUARDRAILS.md](GUARDRAILS.md)
2. Payment → [PAYMENT_STRATEGY.md](PAYMENT_STRATEGY.md)
3. Everything else → This document
