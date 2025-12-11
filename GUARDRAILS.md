# MAHA Peptides OS – Guardrails

## Prohibited Content Categories
- Medical claims, dosing, or therapeutic guidance
- Protocols, treatment plans, or off-label use
- User-generated content referencing medical advice
- Unverified testimonials or health outcomes
- Any content violating local, national, or international law

## Required Disclaimers
- "Products are for research use only. Not for human consumption."
- "No medical advice or guidance is provided."
- "Consult a licensed professional for any health-related questions."
- Display compliance and safety banners on all product and checkout pages

## UX/Content Safety Rules
- No display of dosing, administration, or medical protocols
- No auto-suggest or AI-generated medical content
- All product pages must show disclaimers
- KYC required for wholesale/clinic access
- Age verification for retail checkout
- No user forums or public comments

## Data Handling Rules
- Encrypt all PII at rest and in transit
- No storage of sensitive payment data (use tokenization)
- Strict access controls for admin and support
- Regular data retention and deletion reviews
- Audit logs for all admin actions

## Support/Ops Guardrails
- Support staff must not provide medical advice
- All support interactions logged and monitored
- Escalation protocols for compliance issues
- Automated alerts for suspicious activity

## AI/Autogen Guardrails
- No generative AI for medical or compliance content
- AI/autogen only for internal ops (e.g., fraud detection)
- All AI outputs reviewed before user exposure

## Allowed vs. Disallowed Examples

| Allowed                                 | Disallowed                                 |
|------------------------------------------|--------------------------------------------|
| "Research use only"                     | "For treatment of X condition"             |
| "No medical advice provided"            | "Recommended dosage: 10mg"                 |
| "KYC required for wholesale"            | "Protocol for injection: ..."              |
| "Contact support for order issues"      | "Contact us for dosing guidance"           |
