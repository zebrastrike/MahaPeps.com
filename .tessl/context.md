# MAHA Peptides OS - Development Context

## Project Context

MAHA Peptides OS is an enterprise-grade e-commerce marketplace for peptide sales across three distinct channels:

1. **Research Chemical Sales (B2B)** - Peptides for laboratory research, sold to research institutions and labs
2. **Clinical Trial Peptides (B2B2C)** - Peptides in FDA clinical trials, sold to authorized clinics and doctors
3. **FDA-Approved Peptides (D2C)** - Approved peptide supplements, sold directly to consumers

The platform must handle complex compliance requirements, multi-tiered pricing, batch tracking with Certificates of Analysis (COA), KYC verification for wholesale customers, and comprehensive audit logging.

## Business Model

### Customer Tiers

**Retail Customers (CLIENT)**
- Purchase FDA-approved peptides directly
- Subject to age verification (21+)
- Standard retail pricing
- Personal account dashboard

**Clinics (CLINIC)**
- Purchase clinical trial peptides
- Require KYC verification (medical license, business documents)
- Access to special pricing via distributor price lists
- Manage patients and staff
- Track inventory

**Distributors (DISTRIBUTOR)**
- Wholesale partners managing multiple clinics
- Require KYC verification (business license, tax documents)
- Create custom price lists for each clinic
- Bulk ordering capabilities
- Logistics and billing management

**Administrators (ADMIN)**
- System administrators
- Full access to all functions
- Audit trail access
- User and organization management

## Critical Compliance Requirements

**MUST ALWAYS ENFORCE:**

1. **No Medical Claims** - Products cannot make health, treatment, or therapeutic claims
2. **No Dosing Guidance** - Cannot provide dosage recommendations or protocols
3. **Mandatory Disclaimers** - Every product page must display "For research use only" or FDA disclaimer
4. **KYC Verification** - Clinics and distributors cannot access wholesale features without approved KYC
5. **Age Verification** - Retail customers must verify age (21+) before checkout
6. **Audit Logging** - All admin actions, user changes, order status changes, and payment events must be logged
7. **Data Encryption** - PII (personally identifiable information) encrypted at rest
8. **Payment Security** - Never store raw card data, use Stripe tokens only

See [GUARDRAILS.md](../GUARDRAILS.md) for complete list.

## Database Architecture

### Core Models

**User & Organization**
- `User` - Authentication and profile (email, role, password hash)
- `Org` - Multi-tenant organization entity
- `Distributor` - Wholesale partners (linked to clinics)
- `Clinic` - Medical facilities (linked to distributor)

**Products & Inventory**
- `Product` - Peptide products (name, SKU, category, form, concentration)
- `ProductBatch` - Batch tracking (batch code, purity %, manufactured/expiry dates, qty)
- `BatchFile` - COA documents, images, description forms
- `Inventory` - Stock levels (initial qty, available qty)
- `PriceList` - Distributor-specific pricing
- `PriceListItem` - Product prices with tiered quantity pricing

**Orders & Payments**
- `Order` - Customer orders with status workflow
- `OrderItem` - Line items (product, batch, qty, price)
- `Address` - Shipping and billing addresses
- `Payment` - Payment records with Stripe transaction IDs

**Compliance**
- `AuditLog` - Immutable audit trail (user, action, timestamp, metadata)

### Key Relationships

- User → Role (enum: CLIENT, CLINIC, DISTRIBUTOR, ADMIN)
- Clinic → Distributor (many-to-one)
- Clinic → PriceList (one-to-one active list)
- Order → OrderItems → Product + ProductBatch
- ProductBatch → BatchFiles (COA, images)
- User/Org → AuditLog (all actions tracked)

## Tech Stack Decisions

### Why Next.js?
- Server-side rendering for SEO (product catalog)
- API routes for simple endpoints
- App Router for nested layouts
- TypeScript support out of the box

### Why NestJS?
- Modular architecture fits domain complexity
- Built-in dependency injection
- TypeScript-first framework
- Easy to integrate Prisma, JWT, and external services

### Why Prisma?
- Type-safe database queries
- Easy migrations
- Excellent TypeScript integration
- Great developer experience

### Why PostgreSQL?
- ACID compliance for financial transactions
- JSON support for flexible metadata
- Proven reliability for e-commerce
- Excellent performance with proper indexing

### Why Stripe?
- PCI compliance handled by Stripe
- Extensive payment method support
- Webhook system for async payment events
- Risk scoring and fraud detection

### Why Cloudflare?
- Global CDN for static assets
- DDoS protection
- Web Application Firewall (WAF)
- SSL/TLS termination
- Rate limiting at edge

## API Design Patterns

### Authentication
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.CLINIC)
@Get('protected')
async protectedRoute(@CurrentUser() user: User) {
  // Only admins and clinics can access
}
```

### DTOs with Validation
```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  @Min(0)
  @Max(100)
  purity: number;
}
```

### Service Layer
```typescript
@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ProductFilters) {
    return this.prisma.product.findMany({
      where: { category: filters.category },
      include: { batches: true },
    });
  }
}
```

### Error Handling
```typescript
if (!product) {
  throw new NotFoundException('Product not found');
}

if (user.role !== UserRole.ADMIN) {
  throw new ForbiddenException('Admin access required');
}
```

## Frontend Patterns

### Route Groups (Next.js App Router)
- `(public)` - Marketing pages, product catalog
- `(auth)` - Login, registration, password recovery
- `(client)` - Retail customer dashboard
- `(clinic)` - Clinic management dashboard
- `(distributor)` - Wholesale partner dashboard
- `(admin)` - System administration portal

### Components
```typescript
// Functional components with TypeScript
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product.id)}>Add to Cart</button>
    </div>
  );
}
```

### API Calls
```typescript
async function fetchProducts() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}
```

## Security Architecture

### Authentication Flow
1. User submits email/password to `POST /auth/login`
2. Backend validates credentials with bcrypt
3. Backend generates JWT token (24h expiration)
4. Client stores token in httpOnly cookie or localStorage
5. Client includes token in `Authorization: Bearer <token>` header
6. Backend validates token on protected routes

### Authorization Flow
1. JWT payload includes `userId` and `role`
2. `JwtAuthGuard` extracts and validates token
3. `RolesGuard` checks if user's role matches `@Roles()` decorator
4. Request proceeds if authorized, 403 if not

### Payment Security
1. Client creates payment intent: `POST /checkout/:orderId/create-payment-intent`
2. Backend creates Stripe PaymentIntent, returns client secret
3. Client uses Stripe.js to collect card data (never touches our server)
4. Stripe tokenizes card and processes payment
5. Stripe sends webhook to `POST /webhooks/stripe`
6. Backend verifies webhook signature
7. Backend updates order status based on payment result

### Data Protection
- Passwords: bcrypt hashed (10 rounds)
- JWT tokens: HS256 signed with secret key
- PII: Encrypted at rest (AES-256)
- Payment cards: Never stored (Stripe tokens only)
- HTTPS: Enforced via Cloudflare (Full Strict mode)

## Deployment Architecture

```
Internet
   ↓
Cloudflare CDN (SSL termination, DDoS, WAF, Caching)
   ↓
Private Server (Ubuntu 22.04 LTS)
   ↓
Nginx (Reverse proxy, rate limiting, static caching)
   ↓
Docker Compose
   ├── api (NestJS backend)
   ├── web (Next.js frontend)
   ├── postgres (Database)
   └── redis (Cache & queues)
```

### Nginx Responsibilities
- HTTPS redirect (80 → 443)
- Reverse proxy to API and Web containers
- Rate limiting (10 req/s general, 5 req/min auth)
- Static asset caching (1 year for /_next/static/)
- Security headers (HSTS, CSP, X-Frame-Options)

### Cloudflare Responsibilities
- Global CDN for static assets
- DDoS protection (automatic mitigation)
- Web Application Firewall (OWASP rule sets)
- SSL/TLS encryption (Full Strict mode)
- Bot management
- Caching rules (bypass /api/*, cache everything else)

### Docker Compose Services
- **postgres** - PostgreSQL 14 with persistent volume
- **redis** - Redis 7 for caching and queues
- **api** - NestJS backend (port 3000 internal)
- **web** - Next.js frontend (port 3000 internal)
- **nginx** - Reverse proxy (port 80, 443 external)

## Development Workflow

### Feature Development
1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation if needed
4. Run tests locally (`npm run test`)
5. Commit with descriptive message
6. Create PR for review
7. Merge to `main` after approval

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Run `npx prisma generate` to update client
4. Test migration locally
5. Commit migration files
6. In production, run `npx prisma migrate deploy`

### API Endpoint Development
1. Create/update DTOs in `src/<module>/dto/`
2. Add service method in `src/<module>/<module>.service.ts`
3. Add controller method in `src/<module>/<module>.controller.ts`
4. Add guards and roles if protected
5. Write unit tests in `src/<module>/<module>.service.spec.ts`
6. Document endpoint in comments
7. Test manually with Postman/curl

### Frontend Page Development
1. Create route in `app/(group)/[route]/page.tsx`
2. Implement page component with TypeScript
3. Add API calls to backend
4. Handle loading and error states
5. Add compliance disclaimers if required
6. Test responsive design
7. Test on different browsers

## Testing Strategy

### Unit Tests (Jest)
- Test individual functions and methods
- Mock external dependencies (Prisma, Stripe, etc.)
- Focus on business logic
- Target: 80%+ coverage

### Integration Tests
- Test API endpoints end-to-end
- Use test database
- Test authentication and authorization
- Test error cases

### E2E Tests
- Test critical user flows
- Shopping cart → Checkout → Payment → Order confirmation
- KYC submission → Admin approval → Wholesale access
- Use Playwright or Cypress

### Manual Testing Checklist
- [ ] Product catalog loading and filtering
- [ ] Shopping cart add/remove
- [ ] Checkout flow with Stripe test cards
- [ ] Order status updates
- [ ] Role-based access control
- [ ] Compliance disclaimers present
- [ ] Email notifications (use Mailtrap in dev)
- [ ] Mobile responsive design

## Common Pitfalls & Solutions

### Pitfall: Forgetting Compliance Disclaimers
**Solution:** Always check `GUARDRAILS.md` before adding product content. Use `DisclaimerBar` component on all pages.

### Pitfall: Not Logging Admin Actions
**Solution:** Call `AuditService.logAction()` in every admin operation. Never skip audit logs.

### Pitfall: Storing Payment Card Data
**Solution:** Always use Stripe tokens. Never accept raw card data in API. Use Stripe Elements in frontend.

### Pitfall: Not Validating User Input
**Solution:** Use DTOs with `class-validator` decorators. Validate on backend, not just frontend.

### Pitfall: Missing Role Guards
**Solution:** Always use `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles()` on protected routes.

### Pitfall: Not Handling Payment Webhooks Idempotently
**Solution:** Check if webhook already processed before updating database. Use Stripe event ID as idempotency key.

### Pitfall: Exposing Sensitive Data in Logs
**Solution:** Sanitize logs. Never log passwords, tokens, card numbers, or full SSN.

### Pitfall: Not Testing on Mobile
**Solution:** Use Chrome DevTools mobile emulator. Test on real devices if possible.

## Performance Optimization

### Database Optimization
- Add indexes on frequently queried fields (userId, orgId, createdAt)
- Use `select` to fetch only needed fields
- Use `include` instead of separate queries for relations
- Implement pagination for large result sets

### Caching Strategy
- Cache product catalog in Redis (TTL: 1 hour)
- Cache price lists in Redis (TTL: 1 hour, invalidate on update)
- Use Cloudflare for static assets (TTL: 1 year)
- Cache user sessions in Redis

### Frontend Optimization
- Use Next.js Image component for optimized images
- Implement lazy loading for images below fold
- Code splitting with dynamic imports
- Use React.memo for expensive components

### API Optimization
- Implement rate limiting to prevent abuse
- Use connection pooling for database (Prisma default)
- Batch database queries where possible
- Return minimal data (no over-fetching)

## Monitoring & Observability

### Application Logging
- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Log context: userId, requestId, timestamp
- Log errors with stack traces
- Never log sensitive data

### Error Tracking
- Use Sentry or similar for error monitoring
- Track user context with errors
- Set up alerts for critical errors
- Monitor error rates and trends

### Performance Monitoring
- Track API response times
- Monitor database query performance
- Track payment processing times
- Monitor server resources (CPU, memory, disk)

### Business Metrics
- Daily order volume
- Conversion rate (cart → order)
- Payment success rate
- Average order value
- User registration rate
- KYC approval rate

## Key Files to Reference

**Always read before implementing:**
- `GUARDRAILS.md` - Compliance requirements (CRITICAL)
- `ENGINEERING_PRINCIPLES.md` - Code standards and patterns
- `prisma/schema.prisma` - Data model

**Read for context:**
- `PROJECT.md` - Project vision and roadmap
- `REPO_STRUCTURE.md` - Monorepo organization
- `.codex/MASTER_PROMPT.md` - Full development context

**Reference when needed:**
- `apps/api/README.md` - NestJS backend structure
- `docker-compose.prod.yml` - Production deployment
- `infra/nginx/nginx.conf` - Nginx configuration

## Questions to Ask Before Coding

1. **Does this feature handle sensitive data?** → Add encryption and audit logging
2. **Does this feature require authentication?** → Add JWT and role guards
3. **Does this feature involve payments?** → Use Stripe, never store cards
4. **Does this feature need compliance disclaimers?** → Check GUARDRAILS.md
5. **Does this feature affect inventory?** → Use database transactions
6. **Does this feature send emails?** → Queue with Bull, don't block request
7. **Does this feature modify user data?** → Audit log the change
8. **Can this feature be abused?** → Add rate limiting and validation

## Getting Help

- **Prisma Issues:** https://www.prisma.io/docs
- **NestJS Questions:** https://docs.nestjs.com
- **Next.js Help:** https://nextjs.org/docs
- **Stripe Integration:** https://stripe.com/docs/api
- **Compliance Questions:** Consult `GUARDRAILS.md` first

## Current Implementation Status

**Completed:**
✅ Project architecture and monorepo setup
✅ Database schema with all models
✅ Authentication and RBAC system
✅ Docker and deployment configuration
✅ Frontend layouts and route structure
✅ Backend module scaffolding
✅ Compliance guardrails documentation
✅ Payment processor integration pattern

**In Progress:**
🔄 Core API implementations (services and controllers)
🔄 Frontend page content and API integration
🔄 Email notification system
🔄 File upload service

**Not Started:**
⏳ KYC verification workflow
⏳ Bulk ordering interface
⏳ Audit log dashboard
⏳ Reporting and analytics
⏳ Mobile app

---

Use this context to inform all development decisions. When implementing features, always reference the relevant patterns and examples above.
