# MAHA Peptides OS – Engineering Principles

## Coding Style
- Use consistent, modern language idioms (TypeScript/ES202x or PHP 8+)
- Enforce linting and formatting (Prettier, ESLint, PHP-CS-Fixer)
- Prefer immutability and pure functions where possible
- Write self-documenting, intention-revealing code

## API Design Principles
- RESTful or GraphQL, versioned endpoints
- Consistent error handling and status codes
- Input validation and sanitization everywhere
- Minimal, explicit, and secure data exposure
- Use OpenAPI/Swagger for documentation

## Naming Conventions
- snake_case for DB, camelCase for code, kebab-case for files
- Descriptive, unambiguous names for all entities
- Prefix interfaces with "I" (TypeScript)
- Suffix DTOs with "Dto"

## Folder Structure
- Monorepo: /apps, /packages, /infra, /scripts, /config, /docs
- Separate frontend, backend, shared, and infra code
- Feature-based subfolders within apps

## Documentation Standards
- Markdown for all docs
- Inline code comments for complex logic
- API docs auto-generated and versioned
- Architecture diagrams in /docs

## DevOps + CI/CD Expectations
- All code must pass lint, test, and build before merge
- Automated CI/CD pipelines (GitHub Actions, GitLab CI, etc.)
- Infrastructure as Code (Terraform, Ansible, etc.)
- Automated backups and disaster recovery

## Security Best Practices
- Secrets in environment variables, never in code
- Regular dependency and vulnerability scans
- Principle of least privilege for all services
- Encrypted connections everywhere
- Regular security reviews and pentests

## Versioning Strategy
- Semantic Versioning (SemVer)
- API versioning via URL or header
- Changelog maintained in /docs/CHANGELOG.md
