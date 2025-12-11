# MAHA Peptides OS – Project Overview

## Vision & Scope

MAHA Peptides OS is a self-hosted, enterprise-grade ecommerce and wholesale platform for the compliant sale and distribution of peptides to retail clients, clinics, wellness centers, and distributors. The platform is designed for high security, regulatory compliance, and operational scalability, with a focus on safety, privacy, and robust B2B/B2C workflows. No medical claims, dosing, or therapeutic guidance are provided.

## System Architecture

- **Frontend:** Next.js (App Router)
- **Backend:** Node/NestJS or Laravel (final choice pending)
- **Database:** PostgreSQL (Hetzner Cloud)
- **Cache/Queues:** Redis
- **Email:** Mailgun or SMTP
- **Payments:** High-risk payment processor (server-side integration)
- **CDN/Proxy:** Cloudflare
- **Hosting:** Hetzner (self-hosted, Dockerized)

### Infra Diagram-Level Explanation

```
[Client] ⇄ [Cloudflare CDN/Proxy] ⇄ [Next.js Frontend] ⇄ [API Gateway]
                                               ⇄ [Backend (NestJS/Laravel)]
                                               ⇄ [PostgreSQL DB]
                                               ⇄ [Redis Cache/Queues]
                                               ⇄ [Mailgun/SMTP]
                                               ⇄ [Payment Processor]
```

## Backend Modules
- Auth & RBAC (multi-tenant, org/user roles)
- Product Catalog (peptides, variants, compliance data)
- Pricing & Inventory (retail, wholesale, tiered)
- Order Management (cart, checkout, fulfillment)
- Customer/Org Management (B2C, B2B, KYC)
- Payment Integration (high-risk, server-side)
- Shipping & Logistics
- Compliance & Audit Logging
- Notification & Email
- API Gateway (REST/GraphQL)
- Admin Portal API

## Frontend Modules
- Public Storefront (product discovery, cart, checkout)
- Wholesale Portal (org login, bulk orders, pricing)
- Clinic/Distributor Dashboards
- User Account (orders, KYC, docs)
- Compliance Notices & Disclaimers
- Support/Contact
- Admin Portal (separate route)

## Admin Portal & Org Logic
- Multi-org support (retail, clinics, distributors)
- Org onboarding & KYC
- Staff/role management
- Product, pricing, and inventory management
- Order, payment, and shipment tracking
- Compliance/audit logs
- Content & banner management

## Database Schema (High-Level)
- Users, Orgs, Roles, Permissions
- Products, Variants, Categories
- Inventory, Pricing Tiers
- Orders, Order Items, Shipments
- Payments, Refunds
- Compliance Logs, Audit Trails
- KYC Documents
- Support Tickets

## API Boundaries
- Public API (product catalog, cart, checkout)
- Authenticated API (orders, account, org)
- Admin API (management, audit, config)
- Webhooks (payments, shipping, KYC)

## Non-Functional Requirements
- High security (OWASP, GDPR, PCI-DSS)
- Scalability (horizontal, multi-tenant)
- Observability (logging, metrics, tracing)
- Disaster recovery & backup
- Automated testing & CI/CD
- Documentation (internal, API, compliance)

## Phasing Roadmap
1. Core ecommerce (retail, B2B, payments, compliance)
2. Admin portal, KYC, audit
3. Wholesale/clinic features
4. Advanced reporting, integrations
5. Scaling, internationalization

## Security Model
- Zero trust, least privilege
- Encrypted data at rest & in transit
- Strict RBAC & audit logging
- Compliance with GDPR, PCI-DSS
- Regular security reviews & pentests
