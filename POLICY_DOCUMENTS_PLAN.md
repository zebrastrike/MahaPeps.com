# Policy Documents Implementation Plan

## Current Status
**NO POLICY DOCUMENTS EXIST** - The site links to `/terms` and `/privacy` in the create-account page but these pages don't exist yet.

## Critical Priority (Required for Legal Operation)

### 1. Terms of Service / Terms and Conditions
**Location**: `/apps/web/src/app/(public)/terms/page.tsx`

**Must Include**:
- **Research Use Only Clause**: Explicit statement that products are ONLY for research, not human/veterinary use
- **Age Restriction**: Must be 18+ to purchase
- **Account Terms**: Registration requirements, account termination rights
- **Order Acceptance**: Right to refuse orders, verification requirements
- **Pricing**: Right to change prices, pricing accuracy disclaimers
- **Payment Terms**: Accepted payment methods, when charges occur
- **Shipping**: Shipping policies, risk of loss transfer
- **Product Information**: Accuracy of descriptions, right to modify specifications
- **Prohibited Uses**: Explicit list of prohibited activities
- **Intellectual Property**: Ownership of site content, trademarks
- **Limitation of Liability**: Cap on damages, disclaimer of warranties
- **Indemnification**: Customer agrees to indemnify company
- **Governing Law**: Jurisdiction and dispute resolution
- **Changes to Terms**: Right to modify terms with notice

**Peptide-Specific Clauses**:
- Federal restrictions on peptide sales (FD&C Act Section 503A/503B compliance)
- No compounding pharmacy affiliation disclaimer
- Research chemical supplier designation
- State-specific restrictions and compliance requirements
- Import/export restrictions for international orders
- Requirement for institutional or research affiliation verification (if applicable)

### 2. Privacy Policy (REQUIRED by Law)
**Location**: `/apps/web/src/app/(public)/privacy/page.tsx`

**Must Include**:
- **Information Collection**: What data is collected (email, shipping address, payment info, IP, cookies)
- **How We Use Information**: Order processing, communication, analytics
- **Information Sharing**: Third parties (payment processors, shipping, email service)
- **Data Security**: How data is protected
- **Cookies**: What cookies are used, how to disable
- **Third-Party Links**: Disclaimer about external sites
- **Children's Privacy**: Not intended for under-18 users
- **Your Rights**: Access, correction, deletion of personal data
- **California Privacy Rights** (if selling to CA residents): CCPA compliance
- **GDPR Compliance** (if selling to EU): Right to be forgotten, data portability, etc.
- **Contact Information**: How to exercise privacy rights

### 3. Refund & Return Policy
**Location**: `/apps/web/src/app/(public)/refund-policy/page.tsx`

**Recommended for Peptides**:
- **No Returns on Opened Products**: Due to research chemical nature, temperature sensitivity
- **Damaged Shipments**: 48-hour reporting window, photo evidence required
- **Incorrect Orders**: Company error = replacement or refund
- **Quality Issues**: COA-backed quality guarantee, testing results disputes
- **Refund Timeline**: When refunds are processed
- **Non-Refundable Items**: Opened products, custom orders, international shipments
- **Restocking Fees**: If applicable for unopened returns
- **Temperature Excursions**: Claims for improper shipping temperature handling

**Critical Note**: For research peptides, most vendors have a "no return once opened" policy due to:
1. Cannot verify product integrity after customer receipt
2. Cannot resell opened research chemicals
3. Liability concerns

### 4. Shipping Policy
**Location**: `/apps/web/src/app/(public)/shipping-policy/page.tsx`

**Must Include**:
- **Shipping Methods**: Available carriers and speeds
- **Processing Time**: Business days before shipment
- **Shipping Costs**: How calculated, free shipping thresholds
- **International Shipping**:
  - Countries served
  - Customer responsible for customs/duties/import restrictions
  - No guarantee of deliverability to controlled substance countries
- **Temperature-Controlled Shipping**: Cold pack/dry ice handling for peptides
- **Delivery Issues**: Lost packages, damaged shipments, claims process
- **Address Accuracy**: Customer responsibility for correct addresses
- **Order Tracking**: How tracking info is provided
- **PO Boxes**: Restrictions on delivery to PO boxes for temperature-sensitive items

### 5. Acceptable Use Policy / Research Use Policy
**Location**: `/apps/web/src/app/(public)/research-use-policy/page.tsx`

**Essential for Peptide Business**:
- **Intended Use**: Laboratory research, analytical purposes only
- **Prohibited Uses**:
  - Human consumption or injection
  - Veterinary use
  - Resale without proper licensing
  - Manufacture of unauthorized products
  - Any use prohibited by federal/state law
- **Purchaser Qualifications**: May require research affiliation verification
- **Handling Requirements**: Proper storage, disposal per regulations
- **Safety Data Sheets**: MSDS/SDS availability and customer responsibility to review
- **No Medical Claims**: Disclaimer that no health/medical claims are made
- **FDA Disclaimer**: Products not approved for human use, not intended to diagnose/treat/cure disease

### 6. Cookie Policy (Optional but Recommended)
**Location**: `/apps/web/src/app/(public)/cookie-policy/page.tsx`

**Should Include**:
- Types of cookies used (essential, analytics, marketing)
- How to manage cookie preferences
- Third-party cookies (Google Analytics, payment processors)
- EU Cookie Law compliance

## Additional Legal Pages (Recommended)

### 7. FDA Disclaimer Page
**Location**: Can be standalone or incorporated into footer

**Standard FDA Disclaimer**:
"These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure or prevent any disease. Products are for research purposes only."

### 8. Compliance & Regulatory Information
**Location**: `/apps/web/src/app/(public)/compliance/page.tsx`

**Should Cover**:
- DEA registration status (if applicable)
- State licensing
- Export control compliance
- Controlled substance analog act awareness
- Research chemical supplier designation under FD&C Act

## Footer Links Required

Update footer to include links to:
- Terms of Service ✓
- Privacy Policy ✓
- Refund Policy
- Shipping Policy
- Research Use Policy
- Contact Us ✓
- Compliance Information

## Liability Disclaimers for All Pages

### Recommended Disclaimers to Include Site-Wide:
1. **No Warranty Disclaimer**: Products sold "as-is"
2. **Consequential Damages**: Not liable for indirect/consequential damages
3. **Use Limitation**: Purchaser assumes all risk for handling/use
4. **Professional Advice**: Site doesn't provide medical/legal/professional advice
5. **Product Accuracy**: While efforts are made for accuracy, no guarantee of specifications

## Google OAuth & Terms of Service Concerns

### Your OAuth Questions Answered:

**Q: Is it easy to add Google OAuth for admin and clients?**
**A**: Yes, relatively easy with NestJS Passport. You would use one Google OAuth app but configure different scopes/redirects for admin vs. client.

**Q: Would I need two separate OAuth keys?**
**A**: No, you can use ONE Google Cloud project with ONE OAuth client ID. You can differentiate admin vs. client login flows by:
- Different redirect URIs (admin login redirects to `/admin`, client to `/dashboard`)
- Different authorization scopes
- Role assignment after authentication based on email domain or database lookup

**Q: Would using Google OAuth cause problems with Google's TOS regarding peptides?**
**A**: **POTENTIAL CONCERN** - Google's terms prohibit using their services for:
- "Unapproved pharmaceuticals and supplements"
- Products that make health claims

**Recommendation**:
- You CAN use Google OAuth for authentication (just login)
- You CANNOT use Google Ads, Google Merchant Center, or Google Shopping for peptide sales
- Keep authentication separate from business model - you're using it as a login convenience, not promoting products through Google
- Ensure your TOS clearly states research-only use to distance from pharmaceutical claims

**Safe Approach**:
1. Use Google OAuth purely for authentication
2. Don't advertise peptides through Google services
3. Make research-only nature extremely clear in all documentation
4. Consider also offering email/password login as primary option

## Implementation Priority

### Phase 1 (CRITICAL - Do Before Launch):
1. Terms of Service
2. Privacy Policy
3. Research Use Policy / Acceptable Use
4. FDA Disclaimer (in footer)

### Phase 2 (Important - Do Within First Week):
5. Refund & Return Policy
6. Shipping Policy

### Phase 3 (Good to Have):
7. Cookie Policy
8. Compliance Page

## Next Steps

1. **Review this plan** and provide feedback
2. **Choose**: Should I draft template content for each policy, or do you want to provide specific terms?
3. **Legal Review**: STRONGLY recommend having a lawyer review all policies, especially:
   - Terms of Service
   - Privacy Policy
   - Any liability disclaimers
4. **Decide on OAuth**: Do you want to implement Google OAuth, or stick with email/password only?

## Important Notes

⚠️ **I am not a lawyer** - This is a template plan based on common e-commerce and research chemical vendor practices. You MUST have actual legal counsel review these documents.

⚠️ **Peptide regulations vary by state** - Some states have additional restrictions on peptide sales. Consult with a lawyer familiar with your state's regulations.

⚠️ **FDA enforcement** - The FDA has increased scrutiny on peptide sellers. Robust terms and disclaimers are essential but don't guarantee protection from enforcement action.

## Estimated Implementation Time

- Writing policy content: 4-6 hours (with templates)
- Creating page layouts: 2-3 hours
- Legal review: 2-4 weeks (external)
- Revisions: 1-2 hours

**Total: 1-2 days of dev work + legal review time**
