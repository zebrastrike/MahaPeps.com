# MAHA Peptides OS - Recommendations & Improvements

## Executive Summary

Your peptide marketplace has a solid foundation with well-structured architecture, comprehensive compliance guardrails, and proper separation of concerns. This document provides recommendations for improvements, optimizations, and considerations for your private server + Cloudflare infrastructure.

---

## 1. Infrastructure & Deployment

### Current Setup Analysis
- **Good:** Docker containerization, monorepo structure, Nginx reverse proxy
- **Needs Improvement:** Production hardening, monitoring, backup automation

### Recommendations

#### 1.1 Cloudflare Optimization

**Priority: HIGH**

Your Cloudflare + private server setup is excellent for security and performance. Optimize it further:

```yaml
# Cloudflare Page Rules (Priority Order)

1. /api/* (Bypass Cache)
   - Cache Level: Bypass
   - Security Level: High
   - Browser Integrity Check: On
   - Disable Performance features (not needed for API)

2. /_next/static/* (Aggressive Cache)
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year
   - Origin Cache Control: On

3. /images/* (Image Cache)
   - Cache Level: Cache Everything
   - Edge Cache TTL: 30 days
   - Polish: Lossless
   - WebP: On
   - Mirage: On (for mobile optimization)

4. /* (Standard Caching)
   - Cache Level: Standard
   - Edge Cache TTL: 4 hours
   - Browser Cache TTL: 4 hours
```

**Cloudflare WAF Custom Rules:**

```
1. Block Bad Bots
   (cf.bot_management.score < 30)
   Action: Block

2. Rate Limit Auth Endpoints
   (http.request.uri.path contains "/auth/")
   Rate: 5 requests per minute per IP
   Action: Challenge

3. Block SQL Injection Attempts
   (http.request.uri.query contains "' OR 1=1" or similar)
   Action: Block

4. Geo-blocking (if USA only)
   (ip.geoip.country ne "US")
   and (http.request.uri.path contains "/checkout")
   Action: Challenge or Block

5. Require HTTPS
   (ssl eq "off")
   Action: Redirect to HTTPS
```

**Cloudflare Workers (Advanced):**

Consider adding a Cloudflare Worker for:
- A/B testing product pages
- Edge-side authentication token validation
- Custom rate limiting logic
- Request sanitization before reaching origin

#### 1.2 Private Server Hardening

**Priority: HIGH**

Secure your private server:

**1. Firewall Configuration (UFW):**
```bash
# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow only necessary ports
ufw allow 22/tcp   # SSH (consider changing port)
ufw allow 80/tcp   # HTTP (Cloudflare IPs only)
ufw allow 443/tcp  # HTTPS (Cloudflare IPs only)

# Restrict to Cloudflare IPs only
for ip in $(curl https://www.cloudflare.com/ips-v4); do
  ufw allow from $ip to any port 80
  ufw allow from $ip to any port 443
done

ufw enable
```

**2. SSH Hardening:**
```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change from default 22
MaxAuthTries 3
```

**3. Fail2Ban Setup:**
```bash
apt-get install fail2ban

# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 2222
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
```

**4. Automatic Security Updates:**
```bash
apt-get install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

**5. Docker Security:**
```yaml
# docker-compose.prod.yml security improvements
services:
  postgres:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/run/postgresql
    volumes:
      - postgres_data:/var/lib/postgresql/data:rw

  api:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

#### 1.3 Monitoring & Observability

**Priority: MEDIUM**

Implement comprehensive monitoring:

**1. Application Monitoring:**
```typescript
// Recommended: Sentry for error tracking
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Sanitize sensitive data
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['authorization'];
      }
    }
    return event;
  },
});
```

**2. Infrastructure Monitoring:**
```bash
# Install Netdata for real-time monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Monitor:
# - CPU, Memory, Disk usage
# - Docker container metrics
# - PostgreSQL performance
# - Nginx request rates
# - Network traffic
```

**3. Log Aggregation:**
```yaml
# docker-compose.prod.yml - Add Loki for logs
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  loki_data:
  grafana_data:
```

**4. Uptime Monitoring:**
- Use external service: UptimeRobot (free tier) or Pingdom
- Monitor endpoints:
  - `https://mahapeps.com` (public site)
  - `https://mahapeps.com/api/health` (API health)
  - `https://mahapeps.com/api/health/db` (database connectivity)
- Set up alerts via email/SMS/Slack

**5. Custom Health Checks:**
```typescript
// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('db')
  async database() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      return { status: 'error', database: 'disconnected' };
    }
  }

  @Get('redis')
  async redis() {
    // Check Redis connection
    // Implementation depends on Redis client
  }

  @Get('stripe')
  async stripe() {
    // Verify Stripe API key is valid
    try {
      await this.stripe.balance.retrieve();
      return { status: 'ok', stripe: 'connected' };
    } catch (error) {
      return { status: 'error', stripe: 'disconnected' };
    }
  }
}
```

#### 1.4 Backup Strategy

**Priority: HIGH**

Automated backups are critical for compliance and disaster recovery:

**1. Database Backups:**
```bash
#!/bin/bash
# scripts/backup-db.sh

set -e

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/mahapeps_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
docker exec mahapeps_postgres pg_dump -U $DB_USER -Fc mahapeps > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3 (optional but recommended)
aws s3 cp "$BACKUP_FILE.gz" "s3://mahapeps-backups/db/$TIMESTAMP.sql.gz"

# Keep only last 30 days locally
find $BACKUP_DIR -name "mahapeps_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"

# Test backup integrity
gunzip -t "$BACKUP_FILE.gz"
if [ $? -eq 0 ]; then
  echo "Backup integrity verified"
else
  echo "ERROR: Backup corrupted!"
  # Send alert
fi
```

**2. File Storage Backups:**
```bash
#!/bin/bash
# scripts/backup-files.sh

# Backup uploaded files (COAs, images, etc.)
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
tar -czf /backups/files_$TIMESTAMP.tar.gz /var/lib/docker/volumes/mahapeps_uploads/

# Upload to S3
aws s3 cp "/backups/files_$TIMESTAMP.tar.gz" "s3://mahapeps-backups/files/"

# Keep only last 30 days
find /backups -name "files_*.tar.gz" -mtime +30 -delete
```

**3. Cron Schedule:**
```bash
# crontab -e

# Database backup every 6 hours
0 */6 * * * /opt/mahapeps/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1

# File backup daily at 3 AM
0 3 * * * /opt/mahapeps/scripts/backup-files.sh >> /var/log/backup-files.log 2>&1

# Health check every 5 minutes
*/5 * * * * curl -f https://mahapeps.com/api/health || echo "Health check failed" | mail -s "MahaPeps Health Alert" admin@mahapeps.com
```

**4. Backup Restoration Testing:**
- Test backup restoration monthly
- Document restoration procedure
- Measure Recovery Time Objective (RTO) and Recovery Point Objective (RPO)

---

## 2. Security Enhancements

### 2.1 Advanced Authentication

**Priority: MEDIUM**

**1. Implement Refresh Tokens:**
```typescript
// Current: Single JWT with 24h expiration
// Recommended: Access token (15 min) + Refresh token (7 days)

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

async login(email: string, password: string): Promise<TokenPair> {
  const user = await this.validateUser(email, password);

  const accessToken = this.jwtService.sign(
    { sub: user.id, role: user.role },
    { expiresIn: '15m' },
  );

  const refreshToken = this.jwtService.sign(
    { sub: user.id, type: 'refresh' },
    { expiresIn: '7d' },
  );

  // Store refresh token in database for revocation capability
  await this.prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken, expiresIn: 900 };
}
```

**2. Multi-Factor Authentication (MFA):**
```typescript
// apps/api/src/auth/mfa.service.ts
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class MfaService {
  async generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `MahaPeps (${userId})`,
      length: 32,
    });

    // Store secret in database
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret.base32 },
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return { secret: secret.base32, qrCode };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after
    });
  }
}
```

**3. IP-Based Restrictions for Admin:**
```typescript
// apps/api/src/auth/guards/ip-whitelist.guard.ts
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;

    const user = request.user;
    if (user.role === UserRole.ADMIN) {
      const allowedIps = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
      return allowedIps.includes(ip);
    }

    return true;
  }
}
```

### 2.2 Payment Security Enhancements

**Priority: HIGH**

**1. Stripe Radar (Fraud Detection):**
```typescript
// apps/api/src/payments/payments.service.ts
async createPaymentIntent(order: Order) {
  const paymentIntent = await this.stripe.paymentIntents.create({
    amount: order.total * 100, // cents
    currency: 'usd',
    metadata: {
      orderId: order.id,
      userId: order.userId,
    },
    // Enable Radar fraud detection
    radar_options: {
      session: await this.getRadarSession(order.userId),
    },
  });

  // Check risk score
  if (paymentIntent.charges.data[0]?.outcome?.risk_score > 70) {
    // Flag for manual review
    await this.flagOrderForReview(order.id, 'HIGH_RISK_SCORE');
  }

  return paymentIntent;
}
```

**2. 3D Secure Authentication:**
```typescript
// Require 3D Secure for high-value orders
const paymentIntent = await this.stripe.paymentIntents.create({
  amount: order.total * 100,
  currency: 'usd',
  payment_method_types: ['card'],
  // Require 3DS for orders > $500
  payment_method_options: {
    card: {
      request_three_d_secure: order.total > 500 ? 'required' : 'automatic',
    },
  },
});
```

**3. Velocity Checks:**
```typescript
// Detect and block suspicious order patterns
async checkOrderVelocity(userId: string): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentOrders = await this.prisma.order.count({
    where: {
      userId,
      createdAt: { gte: oneDayAgo },
    },
  });

  // Block if more than 5 orders in 24 hours
  if (recentOrders > 5) {
    throw new BadRequestException(
      'Order limit exceeded. Please contact support.',
    );
  }

  const recentTotal = await this.prisma.order.aggregate({
    where: {
      userId,
      createdAt: { gte: oneDayAgo },
    },
    _sum: { total: true },
  });

  // Block if total > $10,000 in 24 hours
  if (recentTotal._sum.total > 10000) {
    throw new BadRequestException(
      'Order limit exceeded. Please contact support.',
    );
  }
}
```

### 2.3 Data Encryption

**Priority: HIGH**

**1. PII Encryption at Rest:**
```typescript
// apps/api/src/common/encryption.service.ts
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Usage: Encrypt sensitive fields
async createUser(dto: CreateUserDto) {
  const user = await this.prisma.user.create({
    data: {
      email: dto.email,
      phone: this.encryption.encrypt(dto.phone), // Encrypt PII
      ssn: this.encryption.encrypt(dto.ssn),     // Encrypt PII
      passwordHash: await bcrypt.hash(dto.password, 10),
    },
  });

  return user;
}
```

**2. Database-Level Encryption:**
```sql
-- Enable pgcrypto extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt column at database level
ALTER TABLE users ADD COLUMN phone_encrypted BYTEA;
UPDATE users SET phone_encrypted = pgp_sym_encrypt(phone, 'encryption-key');
ALTER TABLE users DROP COLUMN phone;
```

---

## 3. Performance Optimizations

### 3.1 Database Optimization

**Priority: MEDIUM**

**1. Add Indexes:**
```prisma
// prisma/schema.prisma

model Order {
  id        String   @id @default(cuid())
  userId    String
  status    OrderStatus
  createdAt DateTime @default(now())

  // Add compound indexes for common queries
  @@index([userId, status])
  @@index([status, createdAt])
  @@index([createdAt])
}

model Product {
  id          String  @id @default(cuid())
  sku         String  @unique
  category    String
  name        String

  // Add indexes for filtering
  @@index([category])
  @@index([name])  // For search
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  orgId     String?
  action    String
  createdAt DateTime @default(now())

  // Critical for audit queries
  @@index([userId, createdAt])
  @@index([orgId, createdAt])
  @@index([action, createdAt])
}
```

**2. Query Optimization:**
```typescript
// BAD: N+1 query problem
const orders = await this.prisma.order.findMany();
for (const order of orders) {
  const items = await this.prisma.orderItem.findMany({
    where: { orderId: order.id },
  });
}

// GOOD: Use include to fetch related data
const orders = await this.prisma.order.findMany({
  include: {
    items: {
      include: {
        product: true,
        batch: true,
      },
    },
    user: true,
    address: true,
  },
});
```

**3. Connection Pooling:**
```typescript
// prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Configure connection pool
      log: ['error', 'warn'],
      errorFormat: 'minimal',
    });
  }
}

// DATABASE_URL with pool settings
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30"
```

**4. Read Replicas (Future):**
```typescript
// For scaling read-heavy workloads
const prismaRead = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_READ_REPLICA_URL },
  },
});

const prismaWrite = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

// Use read replica for queries
async findAll() {
  return prismaRead.product.findMany();
}

// Use primary for writes
async create(dto: CreateProductDto) {
  return prismaWrite.product.create({ data: dto });
}
```

### 3.2 Caching Strategy

**Priority: MEDIUM**

**1. Redis Caching:**
```typescript
// apps/api/src/common/cache.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage: Cache product catalog
@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll(filters: ProductFilters) {
    const cacheKey = `products:${JSON.stringify(filters)}`;

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const products = await this.prisma.product.findMany({
      where: filters,
      include: { batches: true },
    });

    // Cache for 1 hour
    await this.cache.set(cacheKey, products, 3600);

    return products;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
    });

    // Invalidate all product caches
    await this.cache.invalidatePattern('products:*');

    return product;
  }
}
```

**2. HTTP Caching Headers:**
```typescript
// apps/api/src/catalog/catalog.controller.ts
@Controller('catalog')
export class CatalogController {
  @Get('products')
  @Header('Cache-Control', 'public, max-age=3600')
  findAll() {
    return this.catalogService.findAll();
  }

  @Get('products/:id')
  @Header('Cache-Control', 'public, max-age=1800')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }
}
```

### 3.3 Frontend Performance

**Priority: LOW**

**1. Image Optimization:**
```typescript
// apps/web/components/ProductImage.tsx
import Image from 'next/image';

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={400}
      quality={85}
      placeholder="blur"
      blurDataURL="/placeholder.png"
      loading="lazy"
    />
  );
}
```

**2. Code Splitting:**
```typescript
// apps/web/app/(client)/dashboard/orders/page.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const OrderChart = dynamic(() => import('@/components/OrderChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Don't render on server
});
```

**3. Prefetching:**
```typescript
// apps/web/components/ProductCard.tsx
import Link from 'next/link';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/catalog/${product.id}`}
      prefetch={true} // Prefetch on hover
    >
      <div>{product.name}</div>
    </Link>
  );
}
```

---

## 4. Compliance & Legal

### 4.1 Enhanced Compliance

**Priority: HIGH**

**1. Terms of Service Acceptance Tracking:**
```prisma
// prisma/schema.prisma
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  tosAcceptedAt    DateTime?
  tosVersion       String?
  privacyAcceptedAt DateTime?
  privacyVersion   String?
}

model TermsVersion {
  id        String   @id @default(cuid())
  version   String   @unique
  content   String   @db.Text
  effectiveAt DateTime
  createdAt DateTime @default(now())
}
```

```typescript
// Require TOS acceptance before checkout
async checkout(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  const currentTosVersion = await this.prisma.termsVersion.findFirst({
    orderBy: { effectiveAt: 'desc' },
  });

  if (!user.tosVersion || user.tosVersion !== currentTosVersion.version) {
    throw new BadRequestException(
      'Please accept the latest Terms of Service before checking out.',
    );
  }
}
```

**2. Audit Log Retention Policy:**
```typescript
// Retain audit logs for 7 years (compliance requirement)
// Schedule cleanup of logs older than 7 years
async cleanupOldAuditLogs() {
  const sevenYearsAgo = new Date();
  sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

  // Archive to cold storage before deletion
  const oldLogs = await this.prisma.auditLog.findMany({
    where: { createdAt: { lt: sevenYearsAgo } },
  });

  // Export to S3 Glacier
  await this.archiveToGlacier(oldLogs);

  // Delete from active database
  await this.prisma.auditLog.deleteMany({
    where: { createdAt: { lt: sevenYearsAgo } },
  });
}
```

**3. GDPR Compliance (if expanding to EU):**
```typescript
// Right to be forgotten
async deleteUserData(userId: string) {
  await this.prisma.$transaction([
    // Anonymize orders (keep for financial records)
    this.prisma.order.updateMany({
      where: { userId },
      data: {
        userId: 'DELETED_USER',
        // Keep order data but remove PII
      },
    }),

    // Delete user profile
    this.prisma.user.delete({
      where: { id: userId },
    }),

    // Delete addresses
    this.prisma.address.deleteMany({
      where: { userId },
    }),

    // Audit log the deletion
    this.prisma.auditLog.create({
      data: {
        userId: 'SYSTEM',
        action: 'USER_DATA_DELETED',
        metadata: { deletedUserId: userId },
      },
    }),
  ]);
}

// Data export (GDPR right to portability)
async exportUserData(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: { include: { items: true } },
      addresses: true,
    },
  });

  // Return as JSON
  return {
    personal_information: {
      email: user.email,
      name: user.name,
      created_at: user.createdAt,
    },
    orders: user.orders,
    addresses: user.addresses,
  };
}
```

### 4.2 Age Verification

**Priority: HIGH (for retail customers)**

```typescript
// apps/api/src/auth/age-verification.service.ts
import Axios from 'axios';

@Injectable()
export class AgeVerificationService {
  // Use third-party service like Yoti, Jumio, or Onfido
  async verifyAge(userId: string, documentImage: Buffer) {
    // Example with Onfido API
    const response = await Axios.post(
      'https://api.onfido.com/v3/checks',
      {
        applicant_id: userId,
        report_names: ['document', 'facial_similarity_photo'],
      },
      {
        headers: {
          Authorization: `Token token=${process.env.ONFIDO_API_KEY}`,
        },
      },
    );

    const result = response.data;

    // Update user verification status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ageVerified: result.status === 'complete',
        ageVerifiedAt: new Date(),
      },
    });

    return result;
  }

  // Simpler: Self-declaration with IP/device fingerprinting
  async selfDeclareAge(userId: string, birthDate: Date, ip: string) {
    const age = this.calculateAge(birthDate);

    if (age < 21) {
      throw new BadRequestException('Must be 21 or older');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        birthDate,
        ageVerified: true,
        ageVerifiedAt: new Date(),
      },
    });

    // Log for compliance
    await this.auditService.logAction(
      userId,
      null,
      'AGE_VERIFIED',
      { age, ip, method: 'self_declaration' },
    );
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
```

---

## 5. User Experience Improvements

### 5.1 Search Functionality

**Priority: MEDIUM**

**1. Full-Text Search with PostgreSQL:**
```prisma
// prisma/schema.prisma
model Product {
  id          String  @id @default(cuid())
  name        String
  description String  @db.Text
  sku         String  @unique

  // Add full-text search column
  searchVector String? @db.TsVector

  @@index([searchVector], type: Gin)
}
```

```typescript
// apps/api/src/catalog/catalog.service.ts
async search(query: string) {
  const products = await this.prisma.$queryRaw`
    SELECT *
    FROM products
    WHERE search_vector @@ plainto_tsquery('english', ${query})
    ORDER BY ts_rank(search_vector, plainto_tsquery('english', ${query})) DESC
    LIMIT 50
  `;

  return products;
}

// Update search vector on product changes
async updateProduct(id: string, dto: UpdateProductDto) {
  await this.prisma.$executeRaw`
    UPDATE products
    SET
      name = ${dto.name},
      description = ${dto.description},
      search_vector = to_tsvector('english', ${dto.name} || ' ' || ${dto.description})
    WHERE id = ${id}
  `;
}
```

**2. Search with Elasticsearch (Advanced):**
```yaml
# docker-compose.prod.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

volumes:
  elasticsearch_data:
```

```typescript
// apps/api/src/search/search.service.ts
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class SearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL,
    });
  }

  async indexProduct(product: Product) {
    await this.client.index({
      index: 'products',
      id: product.id,
      document: {
        name: product.name,
        description: product.description,
        sku: product.sku,
        category: product.category,
        tags: product.tags,
      },
    });
  }

  async search(query: string, filters: any = {}) {
    const result = await this.client.search({
      index: 'products',
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['name^3', 'description', 'sku^2', 'tags'],
                  fuzziness: 'AUTO',
                },
              },
            ],
            filter: [
              { term: { category: filters.category } },
            ],
          },
        },
        highlight: {
          fields: {
            name: {},
            description: {},
          },
        },
      },
    });

    return result.hits.hits.map(hit => ({
      ...hit._source,
      highlights: hit.highlight,
    }));
  }
}
```

### 5.2 Real-time Order Tracking

**Priority: LOW**

```typescript
// WebSocket for real-time order updates
// apps/api/src/orders/orders.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/orders' })
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  // Notify user when order status changes
  notifyOrderUpdate(userId: string, order: Order) {
    this.server.to(`user:${userId}`).emit('order:updated', order);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, userId: string) {
    client.join(`user:${userId}`);
  }
}

// Frontend
// apps/web/hooks/useOrderUpdates.ts
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useOrderUpdates(userId: string) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const socket = io('wss://mahapeps.com/orders', {
      auth: { token: getAuthToken() },
    });

    socket.emit('subscribe', userId);

    socket.on('order:updated', (order) => {
      setOrders(prev => {
        const index = prev.findIndex(o => o.id === order.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = order;
          return updated;
        }
        return [...prev, order];
      });
    });

    return () => socket.disconnect();
  }, [userId]);

  return orders;
}
```

### 5.3 Email Preferences

**Priority: LOW**

```prisma
// prisma/schema.prisma
model User {
  id                        String   @id @default(cuid())
  email                     String   @unique

  // Email preferences
  emailOrderConfirmation    Boolean  @default(true)
  emailShippingUpdates      Boolean  @default(true)
  emailPromotions           Boolean  @default(false)
  emailProductUpdates       Boolean  @default(false)
  unsubscribedAt            DateTime?
}
```

```typescript
// Check preferences before sending email
async sendEmail(userId: string, emailType: string, content: any) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  // Check if user has opted out
  if (user.unsubscribedAt) return;

  // Check specific preference
  const preferenceMap = {
    order_confirmation: user.emailOrderConfirmation,
    shipping_update: user.emailShippingUpdates,
    promotion: user.emailPromotions,
    product_update: user.emailProductUpdates,
  };

  if (!preferenceMap[emailType]) {
    console.log(`User ${userId} opted out of ${emailType}`);
    return;
  }

  // Send email
  await this.mailgun.send({
    to: user.email,
    subject: content.subject,
    html: content.html,
  });
}
```

---

## 6. Testing & Quality Assurance

### 6.1 Automated Testing

**Priority: MEDIUM**

**1. E2E Testing with Playwright:**
```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('complete purchase as retail customer', async ({ page }) => {
    // Login
    await page.goto('https://localhost:3000/sign-in');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');

    // Add product to cart
    await page.goto('/catalog');
    await page.click('[data-product-id="test-product"]');
    await page.click('button:has-text("Add to Cart")');

    // Checkout
    await page.goto('/cart');
    await page.click('button:has-text("Checkout")');

    // Fill shipping
    await page.fill('[name=fullName]', 'Test User');
    await page.fill('[name=address]', '123 Main St');
    await page.fill('[name=city]', 'San Francisco');
    await page.selectOption('[name=state]', 'CA');
    await page.fill('[name=zip]', '94102');

    // Fill payment (Stripe test card)
    await page.frameLocator('iframe[name^="__privateStripeFrame"]')
      .locator('[name="cardnumber"]')
      .fill('4242424242424242');
    await page.frameLocator('iframe[name^="__privateStripeFrame"]')
      .locator('[name="exp-date"]')
      .fill('12/25');
    await page.frameLocator('iframe[name^="__privateStripeFrame"]')
      .locator('[name="cvc"]')
      .fill('123');

    // Accept terms
    await page.check('[name=terms]');
    await page.check('[name=ageVerification]');

    // Submit
    await page.click('button:has-text("Place Order")');

    // Verify success
    await expect(page).toHaveURL(/\/orders\/.*\/success/);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });
});
```

**2. Load Testing with k6:**
```javascript
// tests/load/api.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // < 1% errors
  },
};

export default function () {
  // Test product catalog
  const catalogRes = http.get('https://mahapeps.com/api/catalog/products');
  check(catalogRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test product detail
  const productRes = http.get('https://mahapeps.com/api/catalog/products/test-id');
  check(productRes, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(2);
}
```

Run: `k6 run tests/load/api.js`

### 6.2 CI/CD Pipeline

**Priority: MEDIUM**

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

      - name: Run integration tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker build -t mahapeps-api:${{ github.sha }} ./apps/api
          docker build -t mahapeps-web:${{ github.sha }} ./apps/web

      - name: Push to registry (if main branch)
        if: github.ref == 'refs/heads/main'
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin
          docker push mahapeps-api:${{ github.sha }}
          docker push mahapeps-web:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/mahapeps
            git pull origin main
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker-compose exec -T api npx prisma migrate deploy
```

---

## 7. Cost Optimization

### 7.1 Infrastructure Costs

**Current Estimated Monthly Costs:**
- Private server (Hetzner CPX41): ~$30-50/month
- PostgreSQL managed (optional): ~$50-100/month
- Cloudflare Pro: $20/month (recommended for better WAF)
- Stripe fees: 2.9% + $0.30 per transaction
- Mailgun: $0-35/month (depends on volume)
- **Total: ~$100-200/month for infrastructure**

**Optimization Recommendations:**

1. **Use Cloudflare R2 instead of S3** for file storage
   - R2: $0.015/GB stored, no egress fees
   - S3: $0.023/GB + egress fees
   - Savings: ~40-60% on storage costs

2. **Optimize Docker images**
   ```dockerfile
   # Current: ~500MB image
   # Optimized: ~100MB image

   FROM node:18-alpine AS base
   # Use alpine instead of standard node image

   # Multi-stage build to exclude dev dependencies
   FROM base AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   FROM base AS runner
   WORKDIR /app
   COPY --from=builder /app/node_modules ./node_modules
   COPY dist ./dist
   ```

3. **Database optimization**
   - Regular VACUUM and ANALYZE
   - Archive old data to cold storage
   - Use connection pooling (Prisma default)

### 7.2 Payment Processing Optimization

**Current: Stripe standard (2.9% + $0.30)**

**Considerations:**
- For high volume (>$1M/year), negotiate custom pricing with Stripe
- For very high volume, consider ACH/bank transfers (0.8%, capped at $5)
- For B2B, offer net-30 terms (invoice payment) to reduce fees

**Example savings:**
- $100,000/month in sales
- Standard: $2,900 + $300 = $3,200/month in fees
- Custom pricing (2.5% + $0.20): $2,500 + $200 = $2,700/month
- **Savings: $500/month ($6,000/year)**

---

## 8. Scalability Roadmap

### Current Architecture Capacity

**Estimated Capacity:**
- Single server: ~1,000-5,000 concurrent users
- Database: ~10,000-50,000 products
- Orders: ~1,000-5,000 per day

### Phase 1: Horizontal Scaling (>5,000 concurrent users)

```
Load Balancer (Nginx or Cloudflare Load Balancing)
    ↓
App Server 1  App Server 2  App Server 3
    ↓              ↓              ↓
PostgreSQL Primary + Read Replicas
    ↓
Redis Cluster
```

### Phase 2: Microservices (>100,000 users)

```
API Gateway (Kong or AWS API Gateway)
    ↓
├─ Catalog Service (Product management)
├─ Order Service (Order processing)
├─ Payment Service (Payment processing)
├─ User Service (Authentication, profiles)
├─ Notification Service (Emails, SMS)
└─ Audit Service (Compliance logging)
```

### Phase 3: Multi-Region (Global expansion)

```
Cloudflare (Global CDN)
    ↓
├─ US-East (Primary)
├─ US-West (Replica)
└─ EU (GDPR compliance)
    ↓
Global database (CockroachDB or Spanner)
```

---

## Summary of Priorities

### Immediate (Week 1-2)
1. ✅ Set up Cloudflare with proper caching and WAF rules
2. ✅ Configure server firewall and security hardening
3. ✅ Implement automated database backups
4. ✅ Add health check endpoints
5. ✅ Set up monitoring (Netdata or similar)

### Short-term (Month 1-2)
1. Implement refresh tokens for better security
2. Add Redis caching for product catalog
3. Implement database indexes for performance
4. Set up error tracking (Sentry)
5. Write E2E tests for critical flows
6. Add age verification for retail customers
7. Implement KYC workflow for B2B

### Medium-term (Month 3-6)
1. Implement MFA for admin accounts
2. Add full-text search (PostgreSQL or Elasticsearch)
3. Build email notification system
4. Implement file upload service for COAs
5. Add reporting and analytics dashboard
6. Set up CI/CD pipeline
7. Perform load testing and optimization

### Long-term (Month 6+)
1. Consider horizontal scaling if traffic grows
2. Implement real-time order tracking
3. Add mobile app (React Native)
4. Expand to multi-region if going global
5. Consider microservices architecture for scale

---

## Conclusion

Your MAHA Peptides OS platform has a solid foundation. The combination of private server + Cloudflare is cost-effective and scalable for early-stage growth. Focus on security hardening, monitoring, and compliance features first, then optimize performance as traffic grows.

**Key Takeaways:**
1. Security: Implement the recommendations in sections 1 and 2 immediately
2. Performance: Start with caching (Redis) and database indexes
3. Compliance: Age verification and KYC workflows are critical for your business model
4. Monitoring: You can't improve what you don't measure - set up monitoring ASAP
5. Backups: Automate backups and test restoration regularly

The architecture will easily handle 10,000+ users and $1M+ in annual sales. Scale horizontally when you reach those milestones.

For questions or implementation help, reference the documentation in:
- `.codex/MASTER_PROMPT.md`
- `.codex/FEATURE_PROMPTS.md`
- `GUARDRAILS.md`
- `ENGINEERING_PRINCIPLES.md`
