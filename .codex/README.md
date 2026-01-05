# Codex Configuration for MAHA Peptides OS

## Overview

This directory contains comprehensive prompts and context for AI-assisted development with GitHub Copilot, Cursor, or similar AI coding assistants.

## Files in This Directory

### 1. MASTER_PROMPT.md
**Purpose:** Complete project context and guidelines for AI assistants

**When to use:**
- When starting work on any new feature
- When onboarding a new AI assistant to the project
- As a reference for project architecture and patterns

**Contents:**
- Project overview and tech stack
- Core business logic and user roles
- Database schema and relationships
- API and frontend patterns
- Compliance requirements (CRITICAL)
- Security requirements
- Development guidelines
- Common pitfalls to avoid

**How to use with Codex:**
```
Include this file in your context window when asking for code generation.

Example prompt:
"Using the context in .codex/MASTER_PROMPT.md, implement the product catalog API
with filtering by category and search by name."
```

### 2. FEATURE_PROMPTS.md
**Purpose:** Ready-to-use prompts for implementing specific features

**When to use:**
- When implementing a new feature from the roadmap
- When you want consistent, well-structured implementations
- As a template for similar features

**Contents:**
20 detailed feature prompts covering:
- Product Catalog (Prompts 1-3)
- Order Management (Prompts 4-5)
- Payment Processing (Prompts 6-7)
- User Dashboards (Prompts 8-10)
- Compliance & Audit (Prompts 11-13)
- B2B Features (Prompts 14-15)
- Notifications (Prompt 16)
- Admin Portal (Prompts 17-18)
- Testing (Prompt 19)
- Deployment (Prompt 20)

**How to use:**
```
Copy the entire prompt for the feature you want to implement and paste it
into your AI assistant. The prompt includes:
- Complete requirements
- Code patterns to follow
- Security considerations
- Compliance requirements
- API endpoints
- Testing requirements
```

**Example workflow:**
1. Find the feature you want to implement (e.g., "Prompt 4: Implement Order Creation and Management API")
2. Copy the entire prompt
3. Paste into GitHub Copilot Chat or Cursor
4. Review the generated code
5. Test thoroughly
6. Reference GUARDRAILS.md for compliance

## Using These Files with Different AI Tools

### GitHub Copilot
```
1. Open Copilot Chat (Ctrl+I or Cmd+I)
2. Type: "@workspace /explain Read .codex/MASTER_PROMPT.md"
3. Then ask: "Implement product catalog API following the patterns in the master prompt"
4. Copilot will use the context to generate appropriate code
```

### Cursor
```
1. Open Cursor Composer (Ctrl+K or Cmd+K)
2. Reference the files: "@.codex/MASTER_PROMPT.md"
3. Paste the feature prompt from FEATURE_PROMPTS.md
4. Cursor will generate code following the project patterns
```

### Claude Code (this tool)
```
Simply reference these files in your prompts:
"Using .codex/MASTER_PROMPT.md and .codex/FEATURE_PROMPTS.md prompt #4,
implement the order management API"
```

### ChatGPT / Claude Web
```
1. Upload MASTER_PROMPT.md to the conversation
2. Copy and paste the specific feature prompt you want
3. Ask follow-up questions for clarification
```

## Best Practices

### Before Starting Any Feature

1. **Read GUARDRAILS.md first** - Compliance requirements are non-negotiable
2. **Review MASTER_PROMPT.md** - Understand the project context
3. **Check ENGINEERING_PRINCIPLES.md** - Follow code standards
4. **Use the appropriate feature prompt** - Don't start from scratch

### While Implementing

1. **Reference the database schema** in MASTER_PROMPT.md
2. **Follow the code patterns** exactly (NestJS service-controller-DTO pattern)
3. **Add role guards** for protected endpoints
4. **Include audit logging** for admin actions
5. **Add input validation** with DTOs
6. **Write tests** for your code

### After Implementation

1. **Verify compliance** - Check GUARDRAILS.md
2. **Test thoroughly** - Unit, integration, and E2E tests
3. **Update documentation** - If you changed anything significant
4. **Commit with clear messages** - Describe what and why

## Feature Prompt Quick Reference

| Prompt # | Feature | Priority | Complexity |
|----------|---------|----------|------------|
| 1 | Product Catalog API | HIGH | Medium |
| 2 | Batch Management API | HIGH | Medium |
| 3 | Product Catalog UI | HIGH | Medium |
| 4 | Order Management API | HIGH | High |
| 5 | Shopping Cart & Checkout | HIGH | High |
| 6 | Stripe Payment Integration | HIGH | High |
| 7 | Stripe Elements Checkout | HIGH | Medium |
| 8 | Client Dashboard | MEDIUM | Medium |
| 9 | Clinic Dashboard | MEDIUM | High |
| 10 | Distributor Dashboard | MEDIUM | High |
| 11 | Audit Logging System | HIGH | Medium |
| 12 | Audit Log Dashboard | MEDIUM | Medium |
| 13 | KYC Verification | HIGH | High |
| 14 | Price List Management | MEDIUM | High |
| 15 | Bulk Ordering Interface | MEDIUM | Medium |
| 16 | Email Notifications | MEDIUM | Medium |
| 17 | Admin User Management | MEDIUM | Medium |
| 18 | Admin Settings Panel | LOW | Medium |
| 19 | API Integration Tests | MEDIUM | Medium |
| 20 | Production Deployment | HIGH | High |

## Common Questions

### Q: Do I need to use these prompts exactly as written?
**A:** The prompts are comprehensive templates. You can adapt them to your specific needs, but they contain important compliance and security requirements. Don't skip those.

### Q: Can I combine multiple prompts?
**A:** Yes, but be careful with complexity. It's better to implement features one at a time and test thoroughly.

### Q: What if the AI generates code that doesn't follow the patterns?
**A:** Refer back to MASTER_PROMPT.md and remind the AI about the specific pattern (e.g., "Follow the NestJS service-controller-DTO pattern shown in MASTER_PROMPT.md").

### Q: Should I always include MASTER_PROMPT.md in context?
**A:** For significant features, yes. For small fixes or tweaks, the feature prompt alone may be sufficient.

### Q: How do I handle compliance requirements?
**A:** ALWAYS reference GUARDRAILS.md. Compliance is non-negotiable. If unsure, ask explicitly: "Does this implementation comply with GUARDRAILS.md?"

## Example Workflows

### Workflow 1: Implementing Product Catalog API

```
Step 1: Read context
- Open .codex/MASTER_PROMPT.md
- Review database schema for Product, ProductBatch, Inventory
- Review API patterns (service-controller-DTO)

Step 2: Get the prompt
- Open .codex/FEATURE_PROMPTS.md
- Copy "Prompt 1: Implement Product Catalog API"

Step 3: Generate code
- Paste prompt into AI assistant
- Review generated code
- Verify it follows patterns from MASTER_PROMPT.md

Step 4: Verify compliance
- Check GUARDRAILS.md for product-related rules
- Ensure no medical claims in descriptions
- Verify audit logging is included

Step 5: Test
- Write unit tests
- Write integration tests
- Test manually with Postman

Step 6: Commit
- Descriptive commit message
- Reference any issues or tasks
```

### Workflow 2: Building Checkout Flow

```
Step 1: Understand the flow
- Read MASTER_PROMPT.md section on order management
- Read MASTER_PROMPT.md section on payment security
- Review order status workflow

Step 2: Backend first
- Use Prompt 4 (Order Management API)
- Use Prompt 6 (Stripe Integration)
- Test both thoroughly

Step 3: Frontend
- Use Prompt 5 (Shopping Cart & Checkout)
- Use Prompt 7 (Stripe Elements)
- Ensure compliance disclaimers included

Step 4: End-to-end testing
- Use Stripe test cards
- Test full flow: cart → checkout → payment → confirmation
- Verify email notifications (if implemented)
- Check audit logs for payment events

Step 5: Security review
- No raw card data in logs
- Webhook signature validation working
- HTTPS enforced
- Age verification for retail customers
```

### Workflow 3: Deploying to Production

```
Step 1: Review deployment guide
- Read RECOMMENDATIONS.md
- Read Prompt 20 (Production Deployment)

Step 2: Prepare infrastructure
- Follow RECOMMENDATIONS.md section 1 (Infrastructure)
- Configure Cloudflare
- Harden server security
- Set up backups

Step 3: Deploy
- Use docker-compose.prod.yml
- Run database migrations
- Test all health checks

Step 4: Monitor
- Set up monitoring (Netdata, Sentry)
- Configure alerts
- Test backup restoration

Step 5: Verify
- Run smoke tests on production
- Check all critical flows work
- Verify compliance features (disclaimers, audit logs)
```

## Maintenance

### Updating Prompts

When the project evolves:

1. **Update MASTER_PROMPT.md** if:
   - Tech stack changes
   - New patterns are established
   - Compliance rules change
   - Architecture changes

2. **Update FEATURE_PROMPTS.md** if:
   - Feature requirements change
   - New features are added to roadmap
   - API patterns change
   - Security requirements change

3. **Version control:**
   - Commit prompt changes separately
   - Document what changed and why
   - Notify team of updates

### Adding New Prompts

Template for new feature prompts:

```markdown
### Prompt X: [Feature Name]

```
[Feature description]

Requirements:
- [Requirement 1]
- [Requirement 2]

Implementation:
[Detailed implementation steps]

Validation:
[What to check]

Security:
[Security considerations]

Compliance:
[Reference to GUARDRAILS.md if applicable]

API Integration:
[Endpoints and methods]

Use [technologies] for [purpose].
Reference [documentation] for [aspect].
```
```

Save and commit with descriptive message.

## Support

If you have questions about:
- **Project context:** See MASTER_PROMPT.md
- **Specific features:** See FEATURE_PROMPTS.md
- **Compliance:** See ../GUARDRAILS.md
- **Code standards:** See ../ENGINEERING_PRINCIPLES.md
- **Improvements:** See ../RECOMMENDATIONS.md

---

**Remember:** These prompts are designed to help you build quickly while maintaining quality, security, and compliance. Always verify generated code follows our standards and meets regulatory requirements.
