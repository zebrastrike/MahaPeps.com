# Backend Audit Report

## Working Code Found in apps/backend
- [ ] OrderService.createOrder() → apps/backend/src/modules/order/order.service.ts (compliance checks + invoice email)
- [ ] ShippoService → apps/backend/src/modules/order/shippo.service.ts
- [ ] NotificationService (Mailgun) → apps/backend/src/modules/notification/notification.service.ts
- [ ] AuthService (JWT + bcrypt) → apps/backend/src/modules/auth/auth.service.ts
- [ ] UserService → apps/backend/src/modules/user/user.service.ts

## Stubs Found (Not Migrated)
- apps/backend/src/modules/compliance (module only, no service implementation)
- apps/backend/src/modules/product (module only)
- apps/backend/src/modules/payment/payment.service.ts (processor stub)

## Decision: apps/api is PRIMARY
All future development occurs in apps/api only.
