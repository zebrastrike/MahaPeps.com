# MAHA Peptides OS - Master Codex Prompt

## Project Overview

MAHA Peptides OS is an enterprise-grade peptide e-commerce marketplace with three distinct sales channels:

1. **Research Chemical Sales** - To labs and research institutions (B2B)
2. **Clinical Trial Peptides** - To doctors, PRC clinics, and medical facilities (B2B2C)
3. **FDA-Approved Peptides** - Direct to consumer (D2C)

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

1. **CLIENT** - Retail customers buying FDA-approved peptides
   - Age verification required (21+)
   - Personal account dashboard
   - Order tracking and protocols

2. **CLINIC** - Medical facilities and doctor offices
   - KYC verification required
   - Access to clinical trial peptides
   - Patient management
   - Staff management
   - Inventory tracking
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

### Product Categories

1. **Research Use Only (RUO)** - Lab research chemicals
2. **Clinical Trial** - In-trial peptides for approved clinical sites
3. **FDA Approved** - Consumer-ready peptides

### Compliance Requirements

**CRITICAL:** All code must adhere to these guardrails:

- **NO medical claims** - Products are research chemicals or supplements only
- **NO dosing guidance** - Cannot provide dosage recommendations
- **NO treatment protocols** - Cannot suggest medical uses
- **NO unverified testimonials** - User reviews require legal approval
- **Mandatory disclaimers** - "For research use only" or FDA disclaimer on all pages
- **KYC for wholesale** - Clinics and distributors must verify identity/credentials
- **Age verification** - Retail customers must be 21+
- **Audit logging** - All admin actions logged with user, timestamp, org

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
