# MAHA Peptides OS - Master Codex Prompt

## Project Overview

MAHA Peptides OS is an enterprise-grade research materials marketplace serving laboratories, research institutions, and qualified researchers.

**CRITICAL: This is a RESEARCH-ONLY platform, NOT a supplement or wellness marketplace.**

### Sales Channels:

1. **Research Peptides (B2B)** - To laboratories and research institutions for analytical use
2. **Clinical Research Materials (B2B2C)** - To authorized research clinics and facilities conducting approved studies
3. **Analytical Reference Materials (D2C)** - To qualified researchers for laboratory research purposes

### Platform Positioning:

✅ **What This Platform IS:**
- Research materials supplier
- Laboratory chemical marketplace
- B2B + qualified researcher platform
- Non-clinical, non-medical, non-therapeutic system

❌ **What This Platform IS NOT:**
- NOT a supplement store
- NOT a pharmacy or compounding facility
- NOT a wellness brand
- NOT a medical platform
- NOT a consumer health product site

## Tech Stack

**Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI
**Backend:** NestJS with TypeScript
**Database:** PostgreSQL with Prisma ORM
**Cache:** Redis
**Infrastructure:** Private server with Cloudflare CDN
**Deployment:** Docker, Docker Compose, Nginx reverse proxy
**Email:** Mailgun/SMTP
**Payments:** Stripe (configurable for high-risk processors)

## Project Architecture

This is a monorepo with the following structure:

```
MahaPeps.com/
├── apps/
│   ├── api/          # NestJS backend API
│   ├── web/          # Next.js frontend
├── packages/         # Shared libraries (future)
├── infra/           # Docker, nginx configs
├── scripts/         # Automation scripts
└── docs/            # Project documentation
```

## Core Business Logic

### User Roles & Access Control

1. **CLIENT** - Qualified researchers purchasing analytical reference materials
   - Age verification required (21+)
   - Research credentials verification recommended
   - Personal research dashboard
   - Order tracking and material documentation

2. **CLINIC** - Research clinics and authorized facilities conducting approved studies
   - KYC verification required (research credentials)
   - Access to clinical research materials
   - Research participant tracking
   - Staff researcher management
   - Laboratory inventory tracking
   - Distributor relationship

3. **DISTRIBUTOR** - Wholesale partners
   - KYC verification required
   - Manage multiple clinics
   - Custom price lists per clinic
   - Bulk ordering
   - Logistics and billing management

4. **ADMIN** - System administrators
   - Full system access
   - Audit log access
   - User and org management
   - Settings control

### Product Categories (STRICT - ONLY THESE ALLOWED)

1. **Research Peptides** - Laboratory research compounds
2. **Analytical Reference Materials** - Chemical standards and controls
3. **Laboratory Adjuncts** - Research support materials
4. **Research Combinations** - Pre-configured research sets
5. **Materials & Supplies** - Lab equipment and supplies
6. **Merchandise** - Non-consumable branded items (lab coats, beakers, etc.)

🚫 **PERMANENTLY BANNED CATEGORIES:**
- "Supplements" (any type)
- "Wellness products"
- "Health products"
- "Dietary supplements"
- "Injectable supplements"
- "FDA Approved" (for consumer use)
- Any category implying human consumption or therapeutic use

### Compliance Requirements (ABSOLUTE - NON-NEGOTIABLE)

**CRITICAL:** All code must adhere to these guardrails:

#### Language Prohibitions (AUTO-REJECT)

🚫 **FORBIDDEN TERMS - MUST NEVER APPEAR:**
- "Supplement" / "Dietary supplement" / "Wellness"
- "Health benefits" / "Treatment" / "Therapy" / "Therapeutic"
- "Dosage" / "Dose" / "Administration" / "Clinical use"
- "Injectable" / "Injection" / "Oral use" / "Nasal use" (for human application)
- "For humans" / "For patients" / "Medical use"
- "Improves", "Treats", "Cures", "Prevents" (health outcomes)
- "Weight loss", "Anti-aging", "Performance enhancement"
- "Medical", "Medicine", "Drug" (unless in regulatory disclaimers)

✅ **APPROVED ALTERNATIVES:**
- "Research peptide" / "Laboratory material" / "Analytical reference"
- "Research purposes" / "Analytical use" / "Laboratory application"
- "Theoretical calculation" / "Academic reference"
- "Reconstitution" / "Preparation" (for research only)
- "For laboratory research" / "For qualified researchers"
- "Molecular structure" / "Chemical properties"

#### Required Disclaimers (EXACT TEXT - NO MODIFICATIONS)

**Primary FDA Disclaimer** (Footer + Product Pages):
```
All statements on this website have not been evaluated by the Food and Drug Administration (FDA).
All products are sold strictly for research, laboratory, or analytical purposes only.
Products are not intended to diagnose, treat, cure, or prevent any disease.
```

**Research-Use-Only Disclaimer** (Product Pages + Checkout):
```
All products sold on this platform are intended solely for lawful laboratory research and analytical use.
Not for human or veterinary consumption.
```

**Non-Pharmacy Disclaimer** (Footer + Legal):
```
This site operates solely as a chemical and research materials supplier.
We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act.
We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act.
```

**Liability & Responsibility Disclaimer**:
```
The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products.
The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws.
```

**No Medical Advice Disclaimer**:
```
Nothing on this website constitutes medical, clinical, or healthcare advice.
All information provided is for educational and research discussion purposes only.
```

#### Operational Requirements

- **KYC for wholesale** - Research clinics and distributors must verify research credentials
- **Age verification** - All customers must be 21+
- **Audit logging** - All admin actions logged with user, timestamp, org
- **Compliance acknowledgment** - All purchases require acceptance of research-only terms
- **Content moderation** - Automated scanning for forbidden terms
- **COA (Certificate of Analysis)** - Required for all batches before activation

## Database Schema Key Models

### Users & Organizations
- `User` - email, passwordHash, role (enum), createdAt, updatedAt
- `Org` - organization entity for multi-tenancy
- `Distributor` - wholesale partners linked to clinics
- `Clinic` - medical facilities linked to distributor

### Products & Inventory
- `Product` - name, description, SKU, category, form, concentration, purity
- `ProductBatch` - batch tracking (batchCode, purity%, manufacturedAt, expiresAt, qty, storageInstructions)
- `BatchFile` - COA (Certificate of Analysis), images, description forms
- `Inventory` - quantity tracking per product
- `PriceList` - distributor/clinic-specific pricing
- `PriceListItem` - product prices in price list

### Orders & Payments
- `Order` - status (DRAFT, PENDING_PAYMENT, PAID, FULFILLING, SHIPPED, COMPLETED, CANCELED)
- `OrderItem` - line items with qty, unitPrice, productId, batchId
- `OrderAccountType` - RETAIL, CLINIC, DISTRIBUTOR
- `Address` - shipping and billing addresses
- `Payment` - status (INITIATED, AUTHORIZED, CAPTURED, FAILED, REFUNDED, DISPUTED)

### Audit & Compliance
- `AuditLog` - action, userId, orgId, metadata, createdAt

## API Patterns

### Authentication
- JWT-based authentication with Passport.js
- `@UseGuards(JwtAuthGuard, RolesGuard)` for protected routes
- `@Roles(UserRole.ADMIN, UserRole.CLINIC)` for role restrictions
- Password hashing with bcrypt (10 salt rounds)

### Request/Response DTOs
- Use `class-validator` decorators for input validation
- DTOs in `src/<module>/dto/` directory
- Transform with `class-transformer`

### Service Layer Pattern
```typescript
@Injectable()
export class ExampleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.example.findMany();
  }
}
```

### Error Handling
- Use NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, etc.
- Custom business logic errors via `HttpException`
- Global exception filter for unhandled errors

## Frontend Patterns

### Page Structure (App Router)
- `(public)` - Marketing and catalog pages
- `(auth)` - Sign-in, registration, recovery
- `(client)` - Retail customer dashboard
- `(clinic)` - Clinic dashboard
- `(distributor)` - Distributor dashboard
- `(admin)` - Admin portal

### Components
- Use Radix UI primitives for accessible components
- Tailwind CSS for styling
- TypeScript for type safety
- Components in `components/` directory

### API Calls
- Use `fetch` with TypeScript interfaces
- Environment variable for API URL: `process.env.NEXT_PUBLIC_API_URL`
- Handle loading and error states

### Layout Pattern
```typescript
export default function DashboardLayout({ children }) {
  return (
    <div className="layout-shell">
      <Header />
      <Navigation />
      <main>{children}</main>
      <DisclaimerBar />
    </div>
  );
}
```

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Functional components with hooks (React)
- Dependency injection (NestJS)
- No `any` types - use proper typing

### Testing Strategy
- Unit tests with Jest
- Integration tests for API endpoints
- E2E tests for critical flows (checkout, KYC)
- Test file naming: `*.spec.ts`

### Git Workflow
- Feature branches from `main`
- PR required for merge
- Descriptive commit messages
- Squash commits on merge

### Environment Variables
- Backend: `.env` in `apps/api/`
- Frontend: `.env.local` in `apps/web/`
- Never commit secrets
- Use `.env.example` for templates

## Security Requirements

### Data Protection
- Encrypt PII at rest
- HTTPS only (enforced by Cloudflare)
- No direct card storage - tokenize via Stripe
- Password hashing with bcrypt
- JWT token expiration (24h default)

### Payment Security
- Server-side tokenization only
- Webhook signature validation
- Idempotent webhook processing
- Risk scoring for fraud detection
- PCI DSS compliance (via Stripe)

### Access Control
- Role-based access control (RBAC)
- JWT guards on all protected routes
- Admin actions logged in AuditLog
- Session management
- Rate limiting on auth endpoints

## Deployment & Infrastructure

### Docker Setup
- Multi-stage builds for optimization
- Docker Compose for local development
- Separate containers: API, Web, PostgreSQL, Redis, Nginx

### Nginx Configuration
- Reverse proxy to API and Web apps
- Static asset caching
- Rate limiting
- HTTPS redirect

### Cloudflare Integration
- CDN for static assets
- DDoS protection
- WAF (Web Application Firewall)
- SSL/TLS encryption
- Caching rules for performance

### Database
- PostgreSQL 14+ on Hetzner Cloud
- Connection pooling with Prisma
- Regular backups (automated)
- Read replicas for scaling (future)

## Feature Implementation Priorities

### Phase 1: Core E-commerce (Current)
- Product catalog API with batch tracking
- Shopping cart and checkout flow
- Order management system
- Payment processing (Stripe integration)
- Client dashboard
- Compliance disclaimers

### Phase 2: B2B Features
- Clinic dashboard with patient management
- Distributor dashboard with partner management
- Price list management per clinic
- Bulk ordering and invoicing
- KYC verification workflow
- Inventory allocation system

### Phase 3: Compliance & Operations
- COA upload and download system
- Batch expiration notifications
- Audit log dashboard
- Reporting and analytics
- Email notification system (order confirmations, shipping updates)
- Advanced search and filtering

### Phase 4: Scale & Optimization
- Multi-region support
- Advanced caching strategies
- Search with Elasticsearch
- Real-time inventory updates
- Mobile app (React Native)
- Internationalization

## Common Implementation Tasks

### Adding a New API Endpoint
1. Create DTOs in `src/<module>/dto/`
2. Add method to service in `src/<module>/<module>.service.ts`
3. Add controller method in `src/<module>/<module>.controller.ts`
4. Add guards and role restrictions
5. Write tests in `src/<module>/<module>.service.spec.ts`

### Adding a New Page
1. Create route in appropriate group: `app/(group)/[route]/page.tsx`
2. Add navigation link if needed
3. Implement layout if different from default
4. Add API calls to backend
5. Handle loading and error states
6. Add compliance disclaimer if required

### Adding a New Database Model
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Run `npx prisma generate`
4. Create service methods for CRUD
5. Update API endpoints
6. Update TypeScript types if needed

## Integration Points

### Email Service (Mailgun)
- Order confirmations
- Shipping notifications
- Password reset
- KYC approval/rejection
- Low inventory alerts

### Payment Processing (Stripe)
- Checkout session creation
- Webhook handling for payment events
- Refund processing
- Dispute management
- Risk scoring

### File Storage
- COA uploads (PDFs)
- Product images
- Clinic credentials (KYC documents)
- S3-compatible storage recommended

## Monitoring & Logging

### Application Logging
- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Request/response logging (sanitized)
- Performance metrics

### Error Tracking
- Sentry or similar for error monitoring
- User context with errors
- Stack traces for debugging
- Alert on critical errors

### Audit Logging
- All admin actions
- User authentication events
- Order status changes
- Payment events
- KYC approvals/rejections

## Key Documentation Files

- `PROJECT.md` - Vision, scope, roadmap
- `REPO_STRUCTURE.md` - Monorepo organization
- `ENGINEERING_PRINCIPLES.md` - Coding standards
- `GUARDRAILS.md` - Compliance rules (CRITICAL)
- `BOOTSTRAP_CHECKLIST.md` - Setup guide

## Questions to Ask Before Implementation

1. **User Role** - Which user roles can access this feature?
2. **Compliance** - Does this feature require compliance disclaimers?
3. **Audit** - Should this action be logged in AuditLog?
4. **Permissions** - What permissions are needed?
5. **Data Sensitivity** - Does this handle PII or payment data?
6. **Testing** - What test cases are critical?
7. **Error Handling** - What can go wrong and how to handle it?
8. **Performance** - Will this scale with expected load?

## Common Pitfalls to Avoid

- **Never skip compliance disclaimers** - Legal requirement
- **Never store payment card data** - Use Stripe tokens only
- **Never expose admin APIs** - Always use guards and roles
- **Never skip input validation** - Use DTOs with class-validator
- **Never log sensitive data** - Sanitize logs (passwords, tokens, cards)
- **Never hardcode credentials** - Use environment variables
- **Never skip audit logging** - Required for compliance tracking

## Support & Resources

- Prisma Docs: https://www.prisma.io/docs
- NestJS Docs: https://docs.nestjs.com
- Next.js Docs: https://nextjs.org/docs
- Stripe API: https://stripe.com/docs/api
- Radix UI: https://www.radix-ui.com/docs/primitives

---

**When implementing features, always reference `GUARDRAILS.md` for compliance requirements and `ENGINEERING_PRINCIPLES.md` for code standards.**
