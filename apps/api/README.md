# API (NestJS) scaffolding

## Scaffold command
To generate a NestJS project rooted at `apps/api` using the Nest CLI:

```bash
npx @nestjs/cli new api --directory apps/api --package-manager npm --skip-git
```

## Recommended folder structure

```text
apps/api/
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  └─ modules/
│     ├─ auth/
│     │  ├─ auth.controller.ts
│     │  ├─ auth.module.ts
│     │  └─ auth.service.ts
│     ├─ users/
│     │  ├─ users.controller.ts
│     │  ├─ users.module.ts
│     │  └─ users.service.ts
│     ├─ orgs/
│     │  ├─ orgs.controller.ts
│     │  ├─ orgs.module.ts
│     │  └─ orgs.service.ts
│     ├─ catalog/
│     │  ├─ catalog.controller.ts
│     │  ├─ catalog.module.ts
│     │  └─ catalog.service.ts
│     ├─ batches/
│     │  ├─ batches.controller.ts
│     │  ├─ batches.module.ts
│     │  └─ batches.service.ts
│     ├─ orders/
│     │  ├─ orders.controller.ts
│     │  ├─ orders.module.ts
│     │  └─ orders.service.ts
│     ├─ payments/
│     │  ├─ payments.controller.ts
│     │  ├─ payments.module.ts
│     │  └─ payments.service.ts
│     ├─ notifications/
│     │  ├─ notifications.controller.ts
│     │  ├─ notifications.module.ts
│     │  └─ notifications.service.ts
│     └─ admin/
│        ├─ admin.controller.ts
│        ├─ admin.module.ts
│        └─ admin.service.ts
├─ package.json
├─ tsconfig.json
├─ tsconfig.build.json
└─ nest-cli.json
```

Each feature module is registered in `AppModule` to keep the application wiring centralized and ready for future domain-specific logic.
