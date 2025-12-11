# MAHA Peptides OS – Repo Structure

## Monorepo Directory Tree

```
/
├── apps/
│   ├── frontend/         # Next.js App Router frontend
│   ├── backend/          # NestJS or Laravel backend
│   └── admin/            # Admin portal (standalone or embedded)
├── packages/
│   ├── shared/           # Shared code (types, utils, validation)
│   └── ui/               # Design system, UI components
├── infra/
│   ├── db/               # Database migrations, seeders, schema
│   ├── docker/           # Dockerfiles, compose, entrypoints
│   ├── terraform/        # IaC for Hetzner, Cloudflare, etc.
│   └── scripts/          # Infra automation scripts
├── config/               # App, env, and deployment configs
├── scripts/              # Dev and CI/CD scripts
├── docs/                 # Architecture, compliance, API docs
├── .github/              # GitHub Actions, PR templates
├── .env.example          # Example environment variables
├── README.md             # Project overview
├── PROJECT.md            # Vision, architecture, modules
├── GUARDRAILS.md         # Compliance and safety guardrails
├── ENGINEERING_PRINCIPLES.md # Engineering standards
├── REPO_STRUCTURE.md     # This file
```

## Folder Descriptions
- **apps/frontend**: Next.js frontend (storefront, portals)
- **apps/backend**: API backend (NestJS or Laravel)
- **apps/admin**: Admin portal (can be separate or embedded)
- **packages/shared**: Shared logic, types, validation
- **packages/ui**: Design system, UI components
- **infra/db**: Migrations, schema, seeders
- **infra/docker**: Dockerfiles, docker-compose, entrypoints
- **infra/terraform**: Infrastructure as Code
- **infra/scripts**: Automation for infra tasks
- **config**: App, env, deployment configs
- **scripts**: Dev, build, and CI/CD scripts
- **docs**: Architecture, compliance, API docs
- **.github**: GitHub workflows, templates
- **.env.example**: Example env vars
