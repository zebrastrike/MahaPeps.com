# MAHA Peptides OS – Repo Structure

This monorepo follows the architecture and engineering practices defined in `PROJECT.md` and `ENGINEERING_PRINCIPLES.md`. It separates application concerns (frontend, backend), shared packages, infrastructure, scripts, and documentation to support security, compliance, and CI/CD workflows.

## Top-Level Directories

### /apps
Applications that serve end users or expose APIs.

- **/apps/api**  
  - **Purpose:** Backend service (NestJS or Laravel) that powers the public/authenticated/admin APIs, RBAC, compliance logging, KYC, payments, and integrations described in `PROJECT.md`.  
  - **Example files:** `src/main.ts`, `src/modules/orders`, `src/modules/auth`, `src/modules/compliance`, `ormconfig.ts` or `config/database.php`, `Dockerfile`.  
  - **Ownership:** Backend team.

- **/apps/web**  
  - **Purpose:** Next.js App Router frontend for the storefront, wholesale/clinic portals, account area, and admin routes. Consumes `/apps/api` and surfaces compliance messaging.  
  - **Example files:** `app/page.tsx`, `app/(storefront)/products`, `app/(admin)/dashboard`, `components/ui`, `next.config.js`, `Dockerfile`.  
  - **Ownership:** Frontend team.

### /packages
Shared code that should be versioned and reused across apps to enforce consistency.

- **Purpose:** Host shared libraries for types, validation schemas, utility functions, and a design system aligned with the engineering principles (linted, type-safe, and documented).  
- **Example files:** `types/index.ts`, `utils/formatters.ts`, `ui/button.tsx`, `tsconfig.json`, `package.json`.  
- **Ownership:** Joint (frontend + backend) depending on package domain; UI packages owned by frontend, cross-cutting types/utilities jointly maintained.

### /infra
Infrastructure-as-code and deployment assets to support secure, observable, and reproducible environments.

- **Purpose:** Define containerization, orchestration, networking, IaC, and operational tooling for Hetzner/Cloudflare as outlined in `PROJECT.md` and enforced by `ENGINEERING_PRINCIPLES.md`.  
- **Example files:** `docker-compose.yml`, `Dockerfile.api`, `Dockerfile.web`, `nginx/default.conf`, `terraform/`, `ansible/`, `k8s/`, `monitoring/`.  
- **Ownership:** DevOps/SRE.

### /scripts
Automation and developer tooling.

- **Purpose:** Helper scripts for local setup, lint/test/build pipelines, database migrations/seed, and release chores that keep CI/CD reproducible.  
- **Example files:** `setup.sh`, `lint.sh`, `test.sh`, `migrate.sh`, `release.sh`.  
- **Ownership:** Shared; authored by DevOps with contributions from frontend/backend for app-specific tasks.

### /docs
Project documentation per the documentation standards. Houses architecture references, compliance guardrails, API docs, and changelog. Includes the top-level markdown assets already defined.  
- **Example files:** `ARCHITECTURE.md`, `API.md`, `SECURITY.md`, `CHANGELOG.md`, `PROJECT.md`, `ENGINEERING_PRINCIPLES.md`, `GUARDRAILS.md`, `REPO_STRUCTURE.md`.  
- **Ownership:** Shared across teams; DevOps curates operational docs, backend/ frontend own their respective sections.

## Notes
- Adopt feature-based subfolders inside `/apps/api` and `/apps/web` to keep domains (auth, catalog, orders, compliance) modular.  
- All code should follow linting/formatting, testing, and documentation expectations from `ENGINEERING_PRINCIPLES.md`.  
- Secrets stay out of the repo; rely on environment variables and deployment config managed under `/infra`.
