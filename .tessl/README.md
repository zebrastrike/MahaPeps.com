# Tessl Configuration for MAHA Peptides OS

## Overview

This directory contains configuration files for Tessl, an AI-powered development environment that helps with code generation, project understanding, and development workflows.

## What is Tessl?

Tessl is an AI development platform that understands your entire codebase and helps you build features faster while maintaining consistency with your project's architecture and patterns.

## Files in This Directory

### 1. project.yaml
**Purpose:** Project-wide configuration and metadata

**Contents:**
- Project name and description
- Tech stack definition
- Workspace structure
- Domain definitions
- Business rules and constraints
- Code generation preferences
- Testing configuration
- Build and deployment settings
- Feature flags
- Roadmap phases

**When Tessl uses this:**
- Understanding project scope
- Generating code that follows your patterns
- Suggesting appropriate libraries and frameworks
- Validating changes against project rules

### 2. context.md
**Purpose:** Detailed development context and patterns

**Contents:**
- Business model and customer tiers
- Critical compliance requirements
- Database architecture
- Tech stack decisions (with rationale)
- API design patterns
- Frontend patterns
- Security architecture
- Deployment architecture
- Development workflow
- Testing strategy
- Common pitfalls and solutions
- Performance optimization strategies

**When Tessl uses this:**
- Answering questions about architecture
- Generating code that fits existing patterns
- Providing context-aware suggestions
- Explaining why certain decisions were made

### 3. patterns.yaml
**Purpose:** Reusable code patterns and templates

**Contents:**
- NestJS patterns (modules, services, controllers)
- Next.js patterns (pages, layouts, components)
- Prisma patterns (models, transactions)
- Testing patterns (unit, integration, E2E)
- Common use cases (audit logging, inventory, pricing)
- Error handling patterns
- Security patterns

**When Tessl uses this:**
- Generating boilerplate code
- Ensuring consistency across the codebase
- Suggesting patterns for common tasks
- Code completion with project-specific patterns

## How to Use Tessl

### Initial Setup

1. **Install Tessl:**
   ```bash
   npm install -g tessl
   # or
   curl -sSL https://get.tessl.io | bash
   ```

2. **Initialize project:**
   ```bash
   tessl init
   # Tessl will detect .tessl/project.yaml automatically
   ```

3. **Verify configuration:**
   ```bash
   tessl config validate
   ```

### Generating Code

#### Example 1: Create a new API module

```bash
tessl generate module --name Products

# Tessl will:
# 1. Read patterns.yaml for NestJS module pattern
# 2. Create module, service, controller files
# 3. Add proper decorators and guards
# 4. Include audit logging if needed
# 5. Generate DTOs with validation
```

#### Example 2: Add a new database model

```bash
tessl generate model --name ProductReview

# Tessl will:
# 1. Read context.md for database patterns
# 2. Add model to prisma/schema.prisma
# 3. Include audit fields (createdAt, updatedAt)
# 4. Add appropriate indexes
# 5. Suggest relationships based on context
```

#### Example 3: Create a React component

```bash
tessl generate component ProductCard --path apps/web/components

# Tessl will:
# 1. Read patterns.yaml for React component pattern
# 2. Create TypeScript component with proper typing
# 3. Use Tailwind CSS for styling
# 4. Include compliance disclaimers if product-related
```

### Code Assistance

#### Understanding the codebase

```bash
# Ask questions about the project
tessl ask "How does authentication work?"
tessl ask "What's the order status workflow?"
tessl ask "Where are compliance disclaimers enforced?"

# Get file explanations
tessl explain apps/api/src/auth/auth.service.ts

# Find related code
tessl find "order payment processing"
```

#### Code review and suggestions

```bash
# Review changes before committing
tessl review

# Get suggestions for optimization
tessl optimize apps/api/src/catalog/catalog.service.ts

# Check compliance
tessl compliance-check apps/web/app/catalog/page.tsx
```

### Development Workflows

#### Feature Development Workflow

```bash
# 1. Understand requirements
tessl ask "What's required for KYC verification feature?"

# 2. Generate scaffolding
tessl generate feature KYC --type full-stack

# 3. Review generated code
tessl explain apps/api/src/kyc/

# 4. Implement business logic
# (manually code or use tessl assist)

# 5. Generate tests
tessl generate tests apps/api/src/kyc/kyc.service.ts

# 6. Review compliance
tessl compliance-check --feature KYC
```

#### Bug Fix Workflow

```bash
# 1. Find relevant code
tessl find "inventory allocation"

# 2. Understand the issue
tessl explain apps/api/src/orders/orders.service.ts

# 3. Suggest fix
tessl fix "inventory not released when order is canceled"

# 4. Review changes
tessl review
```

## Configuration Deep Dive

### project.yaml Structure

```yaml
name: "MAHA Peptides OS"
type: "monorepo"
frameworks: ["nextjs", "nestjs", "typescript", "prisma"]

# Domains define bounded contexts
domains:
  - name: "Authentication"
    path: "apps/api/src/auth"
    description: "JWT-based authentication with RBAC"

# Rules define constraints
rules:
  compliance:
    - "No medical claims or dosing guidance allowed"
  business_logic:
    - "Four user roles: CLIENT, CLINIC, DISTRIBUTOR, ADMIN"
  security:
    - "JWT authentication with 24-hour expiration"

# Code style preferences
code_style:
  typescript:
    strict: true
    no_any: true
  naming:
    files: "kebab-case"
    classes: "PascalCase"
```

### context.md Sections

1. **Project Context** - What the project does
2. **Business Model** - How money is made
3. **Critical Compliance** - Non-negotiable rules
4. **Database Architecture** - Data model
5. **Tech Stack Decisions** - Why each technology
6. **Patterns** - How to write code
7. **Security** - How to protect data
8. **Deployment** - How to ship to production
9. **Testing** - How to verify quality
10. **Common Pitfalls** - What to avoid

### patterns.yaml Structure

```yaml
nestjs_service:
  description: "Standard service with Prisma injection"
  template: |
    @Injectable()
    export class {{Name}}Service {
      constructor(private prisma: PrismaService) {}
      // ...
    }
```

Each pattern includes:
- **description** - What the pattern does
- **template** - Code template with placeholders
- **usage** - Example of how to use it

## Advanced Features

### Custom Commands

Create custom Tessl commands:

```yaml
# .tessl/commands.yaml
commands:
  - name: "create-api-module"
    description: "Create a complete API module with tests"
    steps:
      - generate module --name {{name}}
      - generate tests --for {{name}}
      - add-to-app-module {{name}}

  - name: "deploy-production"
    description: "Deploy to production server"
    steps:
      - run: "npm run test"
      - run: "docker-compose build"
      - run: "./scripts/deploy.sh"
```

Use: `tessl create-api-module --name Products`

### Hooks

Run code before/after Tessl actions:

```yaml
# .tessl/hooks.yaml
hooks:
  before_generate:
    - check_compliance.sh
  after_generate:
    - lint_and_format.sh
  before_commit:
    - run_tests.sh
```

### Templates

Override default templates:

```
.tessl/
  templates/
    nestjs/
      controller.ts.template
      service.ts.template
    nextjs/
      page.tsx.template
      component.tsx.template
```

## Integration with Other Tools

### VS Code Integration

```json
// .vscode/settings.json
{
  "tessl.enabled": true,
  "tessl.configPath": ".tessl/project.yaml",
  "tessl.autoComplete": true,
  "tessl.inlineAssist": true
}
```

### Git Hooks

```bash
# .git/hooks/pre-commit
#!/bin/bash
tessl compliance-check --staged
tessl lint --staged
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
- name: Validate Tessl Config
  run: tessl config validate

- name: Check Code Quality
  run: tessl review --all
```

## Compliance Features

Tessl can enforce compliance rules from project.yaml:

```bash
# Check if code violates compliance rules
tessl compliance-check apps/web/app/catalog/page.tsx

# Output:
# ✓ Compliance disclaimer present
# ✗ Warning: Text "dosage recommendation" found (violates GUARDRAILS.md)
# ✓ No medical claims detected
```

## Best Practices

### 1. Keep Configuration Updated

When project changes:
- Update project.yaml (tech stack, domains, rules)
- Update context.md (patterns, decisions)
- Update patterns.yaml (code templates)

### 2. Use Domains to Organize

Structure code by business domains:
```yaml
domains:
  - name: "Orders"
    path: "apps/api/src/orders"
  - name: "Products"
    path: "apps/api/src/catalog"
```

Tessl will understand relationships and suggest relevant code.

### 3. Define Clear Rules

```yaml
rules:
  security:
    - "Always use @UseGuards(JwtAuthGuard) for protected routes"
    - "Hash passwords with bcrypt, 10 salt rounds"
  testing:
    - "Minimum 80% code coverage"
    - "E2E tests for critical flows"
```

Tessl will enforce these during code generation.

### 4. Document Patterns

Every pattern should have:
- Clear description
- Complete template
- Usage example

This helps Tessl generate consistent code.

### 5. Leverage Context

Include architectural decisions in context.md:
```markdown
### Why Prisma?
- Type-safe database queries
- Easy migrations
- Great TypeScript integration
```

Tessl will explain these decisions when asked.

## Troubleshooting

### Tessl generates incorrect code

**Problem:** Generated code doesn't follow project patterns

**Solution:**
1. Check patterns.yaml has the correct template
2. Verify project.yaml code_style settings
3. Review context.md for conflicting information
4. Update templates with correct examples

### Compliance checks fail

**Problem:** Tessl flags valid code as non-compliant

**Solution:**
1. Review rules in project.yaml
2. Add exceptions if needed
3. Update compliance patterns
4. Whitelist specific files if necessary

### Tessl doesn't understand context

**Problem:** Tessl gives generic suggestions instead of project-specific ones

**Solution:**
1. Ensure .tessl directory is in project root
2. Validate configuration: `tessl config validate`
3. Rebuild context: `tessl reindex`
4. Add more detail to context.md

## Comparison: Tessl vs Codex

| Feature | Tessl | Codex (.codex/) |
|---------|-------|-----------------|
| Purpose | Interactive dev environment | Static prompts for AI assistants |
| Configuration | YAML + Markdown | Markdown only |
| Code Generation | Built-in commands | Copy/paste prompts |
| Code Review | Automated | Manual |
| Compliance Checking | Automated | Manual |
| Learning Curve | Medium | Low |
| Best For | Active development | Reference documentation |

**Use both together:**
- Use Tessl for day-to-day development
- Use Codex prompts for onboarding new AI assistants
- Reference both for understanding patterns

## Resources

- **Tessl Documentation:** https://docs.tessl.io
- **Tessl GitHub:** https://github.com/tessl/tessl
- **Tessl Community:** https://community.tessl.io

## Support

For Tessl-specific issues:
1. Check Tessl documentation
2. Validate configuration: `tessl config validate`
3. Review logs: `tessl logs`
4. Open issue on Tessl GitHub

For project-specific questions:
1. Check context.md
2. Review patterns.yaml
3. Consult ../ENGINEERING_PRINCIPLES.md
4. Ask team members

---

**Pro Tip:** Run `tessl assist` in your terminal while coding. Tessl will watch your files and provide real-time suggestions based on project context and patterns.
