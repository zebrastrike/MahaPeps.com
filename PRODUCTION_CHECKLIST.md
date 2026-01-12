# MAHA Peptides - Production Deployment Checklist

**Last Updated:** 2026-01-12
**Company:** MAHA Peptides
**Owner/CEO:** Scott S. (Fitness Expert & Peptide Specialist)

---

## ✅ COMPLETED FIXES

### Critical Issues Resolved
- [x] Deleted broken `seed-full-catalog.ts` file (schema mismatch)
- [x] Updated all email addresses to new @mahapeps.com domain
- [x] Removed console.log statements from critical files
- [x] Verified admin dashboard has full product control capabilities

### Email Addresses Updated
- **General Inquiries:** info@mahapeps.com
- **Sales & Wholesale:** sales@mahapeps.com
- **Customer Support:** support@mahapeps.com
- **Owner:** scott@mahapeps.com

### Company Information
- **Company Name:** MAHA Peptides
- **Owner/CEO:** Scott S.
- **Background:** Fitness Influencer & Peptide Expert (self-educated specialist)
- **Address:** P.O. Box (TBD - add before production)
- **Mission:** American-made pharmaceutical-grade research peptides

---

## 🚨 CRITICAL - MUST COMPLETE BEFORE DEPLOYMENT

### 1. Environment Variables (HIGH PRIORITY)
```bash
# Backend (.env) - REPLACE THESE VALUES
JWT_SECRET="<GENERATE-SECURE-64-CHAR-SECRET>"  # Currently: dev-secret-change-in-production-min-32-chars
ENCRYPTION_KEY="<GENERATE-SECURE-64-CHAR-HEX>" # Currently: dev key
ADMIN_PASSWORD_HASH="<NEW-BCRYPT-HASH>"       # Currently: admin123

# Email Configuration (ADD THESE)
MAILGUN_API_KEY="<your-mailgun-api-key>"
MAILGUN_DOMAIN="mahapeps.com"
MAIL_FROM_ADDRESS="support@mahapeps.com"

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL="https://api.mahapeps.com"  # Update from localhost
```

### 2. Security Updates
- [ ] Generate new JWT_SECRET (min 64 characters, random)
- [ ] Generate new ENCRYPTION_KEY (64 hex characters)
- [ ] Change admin password from `admin123` to secure password
- [ ] Remove or gate all localhost URL fallbacks with `NODE_ENV` checks
- [ ] Verify CORS settings in production (remove localhost from allowlist)

### 3. Database
- [ ] Run production migrations: `npx prisma migrate deploy`
- [ ] Seed production database with real products
- [ ] Change default admin credentials in seed script
- [ ] Verify all product data is realistic (not test/placeholder data)

### 4. Email Integration
- [ ] Set up Mailgun account
- [ ] Verify domain (mahapeps.com) in Mailgun
- [ ] Add MAILGUN_API_KEY to environment
- [ ] Test contact form email delivery
- [ ] Test order confirmation emails
- [ ] Set up email templates in Mailgun dashboard

---

## 🟡 RECOMMENDED - DO BEFORE GO-LIVE

### Code Quality
- [ ] Remove remaining console.log statements (42 total in web app)
- [ ] Address all TODO comments (17 files)
- [ ] Fix TypeScript `unknown` types with proper interfaces
- [ ] Run TypeScript type checking: `npm run type-check`

### SEO & Meta Tags
- [ ] Add dynamic meta tags to product pages
- [ ] Add Open Graph tags for social sharing
- [ ] Create `robots.txt` file
- [ ] Generate `sitemap.xml`
- [ ] Add JSON-LD structured data for products

### Testing
- [ ] Run Playwright end-to-end tests
- [ ] Test all user flows (browse → cart → checkout)
- [ ] Test admin dashboard (create/edit products)
- [ ] Test contact form submission
- [ ] Test wholesale application form
- [ ] Verify all pages are responsive (mobile/tablet/desktop)

### Performance
- [ ] Run Lighthouse audit (target 90+ score)
- [ ] Optimize images (convert to WebP where possible)
- [ ] Enable Next.js image optimization
- [ ] Verify lazy loading on heavy components
- [ ] Check bundle size

### Content
- [ ] Add P.O. Box address to contact page
- [ ] Add phone number to contact page (currently placeholder)
- [ ] Review all legal/compliance text
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Add shipping policy page

---

## 📊 ADMIN DASHBOARD CAPABILITIES (VERIFIED)

### ✅ Product Management
Admin can control ALL product fields via dashboard:
- **Basic Info:** Name, SKU, Slug, Description
- **Categorization:** Product Category (enum-based)
- **Visibility:** B2C_ONLY, B2B_ONLY, or BOTH
- **Stock:** Current stock, low stock threshold, restock date
- **Status:** IN_STOCK, LOW_STOCK, OUT_OF_STOCK, DISCONTINUED, BACKORDER
- **Chemical:** CAS Number, Molecular Formula, Form, Concentration
- **Active/Inactive:** Hide products without deleting them

### ✅ Variant Management
Per product variant, admin can control:
- **Pricing:** Set individual price or mark as "Pricing on Request"
- **Strength:** Value and unit (MG, IU, ML)
- **SKU:** Unique identifier
- **Active Status:** Hide/show individual variants
- **COA:** Upload Certificate of Analysis files

### ✅ Price Display Control
- Admin can set price to null/0 to show "Pricing on Request"
- Admin can hide price fields per variant
- Frontend automatically handles price display logic

### ✅ No-Code Management
- All changes via web dashboard (no database access needed)
- Drag-and-drop file uploads
- Toggle switches for boolean fields
- Real-time preview of changes

---

## 🔍 DATABASE SEED STATUS

### Current Seed Data (seed.ts - WORKING)
- **Users:** 2 (admin@mahapeps.com, client@test.com)
- **Products:** 40+ peptides with realistic data
- **Variants:** Multiple per product with pricing
- **FAQs:** 10 published questions
- **Blogs:** 10 published articles
- **Prices:** Range $150-$1,900 (realistic)
- **Purity:** 98.5%-99.5% (pharmaceutical-grade)

### Verified - No Issues
- ✅ No duplicate products
- ✅ No placeholder/test product names
- ✅ Realistic pricing structure
- ✅ Proper category assignments
- ✅ Valid purity percentages
- ✅ Complete product information

---

## 🌐 DEPLOYMENT CONFIGURATION

### Hetzner Server Setup
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql redis-server

# Set up PostgreSQL
sudo -u postgres createdb mahapeps_production
sudo -u postgres createuser mahapeps_user

# Clone repository
git clone <your-repo-url>
cd MahaPeps.com

# Install dependencies
npm install

# Build
cd apps/api && npm run build
cd ../web && npm run build

# Set up PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Cloudflare Configuration
- [ ] Add DNS records for mahapeps.com
- [ ] Add DNS record for api.mahapeps.com
- [ ] Enable SSL/TLS (Full Strict mode)
- [ ] Set up page rules for caching
- [ ] Enable DDoS protection
- [ ] Configure firewall rules

### Environment Variables on Server
```bash
# API (.env)
DATABASE_URL="postgresql://mahapeps_user:PASSWORD@localhost:5432/mahapeps_production"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="<secure-secret>"
ENCRYPTION_KEY="<secure-key>"
NODE_ENV="production"
PORT=3001

# Web (.env.production)
NEXT_PUBLIC_API_BASE_URL="https://api.mahapeps.com"
NODE_ENV="production"
```

---

## 📋 PRE-LAUNCH TESTING CHECKLIST

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] Product catalog displays all items
- [ ] Product detail pages work
- [ ] Cart functionality (add/remove items)
- [ ] Checkout flow complete
- [ ] Contact form submission
- [ ] Wholesale application form
- [ ] FAQ page accordion
- [ ] Blog list page
- [ ] Blog detail pages
- [ ] Admin login
- [ ] Admin product management

### Backend Tests
- [ ] All API endpoints respond
- [ ] Database connections stable
- [ ] Redis cache working
- [ ] File uploads functional
- [ ] Authentication works
- [ ] Admin routes protected
- [ ] Email sending (via Mailgun)
- [ ] Payment verification

### Security Tests
- [ ] SQL injection attempts blocked (Prisma protects)
- [ ] XSS attempts sanitized (React protects)
- [ ] CSRF protection enabled
- [ ] Rate limiting active
- [ ] Admin routes require auth
- [ ] Sensitive data encrypted

---

## 🚀 GO-LIVE PROCEDURE

1. **Final Code Review**
   - [ ] All critical issues resolved
   - [ ] All tests passing
   - [ ] No console.logs in production code

2. **Database Migration**
   - [ ] Backup current database
   - [ ] Run migrations on production
   - [ ] Seed with production data
   - [ ] Verify data integrity

3. **Deploy to Hetzner**
   - [ ] Push code to production branch
   - [ ] SSH into server
   - [ ] Pull latest code
   - [ ] Install dependencies
   - [ ] Build applications
   - [ ] Restart services with PM2

4. **Configure Cloudflare**
   - [ ] Point DNS to Hetzner server IP
   - [ ] Wait for DNS propagation (24-48 hours)
   - [ ] Verify HTTPS working
   - [ ] Test from different locations

5. **Post-Deployment Verification**
   - [ ] Homepage loads via mahapeps.com
   - [ ] API accessible via api.mahapeps.com
   - [ ] Test complete user journey
   - [ ] Verify emails sending
   - [ ] Check error logs

6. **Monitoring Setup**
   - [ ] Set up uptime monitoring
   - [ ] Configure error alerting
   - [ ] Enable analytics
   - [ ] Set up backup schedule

---

## 📞 SUPPORT CONTACTS

- **General:** info@mahapeps.com
- **Sales:** sales@mahapeps.com
- **Support:** support@mahapeps.com
- **Owner:** scott@mahapeps.com

---

## 🎯 SUCCESS CRITERIA

✅ All pages load without errors
✅ Products display correctly
✅ Contact form sends emails
✅ Admin dashboard fully functional
✅ Mobile responsive
✅ HTTPS enabled
✅ Lighthouse score 90+
✅ No console errors in browser
✅ All compliance notices displayed

---

**Status:** READY FOR PRODUCTION SETUP
**Next Step:** Complete environment variable configuration and Playwright testing
