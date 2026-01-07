# MAHA Peptides UI/UX Design System
**Version 1.0** | Clinical-Grade Research Marketplace

---

## 🎯 Brand Positioning

**NOT:** Supplement store, wellness brand, fitness marketplace, biohacker lifestyle
**YES:** Private lab supplier, pharmaceutical portal, biotech B2B platform, compliance-first research marketplace

**User Mental Model:**
"I am ordering from a serious laboratory supplier with pharmaceutical-grade standards."

---

## 🎨 Visual Identity

### Color Palette

#### Primary Colors
```typescript
// Dark Mode Primary (Default)
charcoal: {
  DEFAULT: '#0E0F12',  // Near-black background
  50: '#F8F9FA',       // Clinical white (light mode)
  100: '#E9ECEF',
  200: '#DEE2E6',
  300: '#CED4DA',
  400: '#ADB5BD',
  500: '#6E737A',      // Utility gray
  600: '#495057',
  700: '#343A40',
  800: '#212529',
  900: '#0E0F12',      // Primary dark
}

// Accent Color (GHK-Cu Inspired)
accent: {
  DEFAULT: '#3A7F8C',  // Copper-teal
  50: '#F0F7F8',
  100: '#D9EBEE',
  200: '#B3D7DD',
  300: '#8CC3CB',
  400: '#66AFBA',
  500: '#3A7F8C',      // Primary accent
  600: '#2E6670',
  700: '#234C54',
  800: '#173338',
  900: '#0C191C',
}

// Utility Colors
clinical: {
  white: '#F8F9FA',
  gray: '#6E737A',
  warning: '#D97706',  // Amber for compliance warnings
  error: '#DC2626',    // Red for errors
  success: '#059669',  // Green for verified/approved
}
```

#### Usage Guidelines
- **Backgrounds:** Dark mode uses `charcoal-900` as primary
- **Text:** `clinical-white` on dark, `charcoal-900` on light
- **Accents:** Use `accent-500` sparingly for CTAs and highlights
- **Interactive states:** Subtle opacity shifts (0.8 hover, 0.6 disabled)
- **No gradients** except subtle dark-to-darker overlays

### Typography

#### Font Stack
```typescript
fontFamily: {
  // UI & Body Text
  sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],

  // Optional Alternative Headings
  display: ['Space Grotesk', 'Inter', 'sans-serif'],

  // Data, Specs, Batch Numbers
  mono: ['IBM Plex Mono', 'Consolas', 'Monaco', 'monospace'],
}
```

#### Type Scale
```typescript
fontSize: {
  // Data/Specs
  'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],    // 12px - Batch codes
  'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }], // 14px - Specs

  // Body Text
  'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px - Standard text
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px - Large body

  // Headings
  'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],   // 20px - H4
  '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],     // 24px - H3
  '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }], // 30px - H2
  '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],  // 36px - H1
  '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],           // 48px - Hero
}
```

#### Font Weights
```typescript
fontWeight: {
  normal: '400',    // Body text
  medium: '500',    // UI elements
  semibold: '600',  // Subheadings
  bold: '700',      // Headings
}
```

### Spacing & Layout

#### Spacing Scale
```typescript
spacing: {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
}
```

#### Border Radius
```typescript
borderRadius: {
  none: '0',
  sm: '0.125rem',   // 2px - Tight, clinical
  DEFAULT: '0.25rem', // 4px - Standard
  md: '0.375rem',   // 6px - Cards
  lg: '0.5rem',     // 8px - Modals
  xl: '0.75rem',    // 12px - Large containers
  full: '9999px',   // Pills/badges
}
```

#### Container Widths
```typescript
maxWidth: {
  'content': '65ch',    // Optimal reading width
  'narrow': '48rem',    // 768px
  'default': '64rem',   // 1024px
  'wide': '80rem',      // 1280px
  'full': '100%',
}
```

### Shadows & Elevation

```typescript
boxShadow: {
  // Minimal, clinical shadows
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

  // Dark mode specific
  'dark-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  'dark': '0 2px 4px 0 rgb(0 0 0 / 0.4)',
  'dark-lg': '0 4px 8px 0 rgb(0 0 0 / 0.5)',

  // Glass effect for cards
  'glass': '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -1px rgb(0 0 0 / 0.06), inset 0 1px 0 0 rgb(255 255 255 / 0.05)',
}
```

---

## 🧩 Component Architecture

### Base Component Principles
1. **Glass Morphism:** Dark cards with subtle borders, not heavy shadows
2. **Minimal Motion:** Fade in/out, scale max 1.02, no bounce/spring
3. **Monospace for Data:** All specs, batch codes, temperatures use mono font
4. **Accessibility First:** WCAG AA contrast minimum, keyboard navigation
5. **No Marketing Fluff:** Every pixel serves a functional purpose

---

## 📦 Core Components

### 1. Product Card (Grid View)

**Anatomy:**
```
┌─────────────────────────────────┐
│  [Product Image]                │ ← Dark background, subtle border
│  GHK-Cu 100mg                   │ ← Vial render, high-quality
├─────────────────────────────────┤
│  GHK-Cu Copper Peptide          │ ← Sans-serif, semibold
│  SKU: GHKCU-100-3ML             │ ← Mono, small, gray
│                                 │
│  99.0% Purity                   │ ← Mono, medium weight
│  Batch: GHK-2024-08-042         │ ← Mono, gray
│                                 │
│  [RESEARCH USE ONLY]            │ ← Badge, subtle amber/yellow
│                                 │
│  $47.00                         │ ← Large, sans, medium weight
│  [View Details]                 │ ← Ghost button, accent color
└─────────────────────────────────┘
```

**States:**
- **Hover:** Scale 1.01, border accent glow
- **Out of Stock:** 0.6 opacity, "Out of Stock" badge
- **New:** Subtle "New" badge in corner

### 2. Product Detail Page

**Hero Section:**
```
┌────────────────────────────────────────────────────────┐
│  [Large Vial Image]  │  GHK-Cu Copper Peptide          │
│                      │  100mg, 3ml Multi-Dose Vial     │
│  [Additional Images] │                                 │
│                      │  SKU: GHKCU-100-3ML             │
│                      │  Batch: GHK-2024-08-042         │
│                      │  Purity: 99.0%                  │
│                      │                                 │
│                      │  [⚠️ RESEARCH USE ONLY]         │
│                      │                                 │
│                      │  $47.00                         │
│                      │  [Add to Cart] [View COA]       │
└────────────────────────────────────────────────────────┘
```

**Specs Panel (Below Hero):**
```
┌─────────────────────────────────────────────────┐
│  PRODUCT SPECIFICATIONS                         │
├─────────────────────────────────────────────────┤
│  Molecular Formula    C₁₄H₂₄N₆O₄Cu              │ ← Mono font
│  Molecular Weight     419.92 g/mol              │
│  CAS Number          49557-75-7                 │
│  Purity              ≥99.0% (HPLC)              │
│  Form                Lyophilized powder         │
│  Color               Blue-green                 │
└─────────────────────────────────────────────────┘
```

**Storage & Handling Panel:**
```
┌─────────────────────────────────────────────────┐
│  STORAGE & HANDLING                             │
├─────────────────────────────────────────────────┤
│  Storage Temperature   2–8°C (refrigerate)      │
│  Freeze Tolerance      Do not freeze            │
│  Light Sensitivity     Protect from light       │
│  Shelf Life            24 months (unopened)     │
│  After Reconstitution  30 days (2–8°C)          │
└─────────────────────────────────────────────────┘
```

**Compliance Notice (Prominent, Non-Dismissible):**
```
┌─────────────────────────────────────────────────┐
│  ⚠️ REGULATORY COMPLIANCE NOTICE                │
├─────────────────────────────────────────────────┤
│  This product is intended for research use only.│
│  Not for human consumption, diagnostic, or      │
│  therapeutic purposes. Purchaser assumes all    │
│  responsibility for regulatory compliance.      │
│                                                 │
│  [View Full Terms & Conditions]                 │
└─────────────────────────────────────────────────┘
```

### 3. Homepage Hero

**Dark, Minimal, Authoritative:**
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              [MAHA Peptides Logo]                    │
│                                                      │
│         American-Made Research Peptides              │
│         99%+ Purity | Full COA Documentation         │
│                                                      │
│              [Browse Catalog]                        │
│                                                      │
│  [Trust Signal: 99% Purity]  [Cold Chain Certified]  │
│  [American Manufacturing]    [Full COA Access]       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Design Notes:**
- Background: `charcoal-900` with subtle gradient to `charcoal-800`
- Hero image: High-quality vial render with subtle glow
- No people, no lifestyle imagery
- Trust signals use icons from `lucide-react` (Beaker, Shield, FileText, MapPin)

### 4. Wholesale Portal

**Admin-Style Layout:**
```
┌─────────────────────────────────────────────────┐
│  BULK PRICING                                   │
├─────────────────────────────────────────────────┤
│  Tier    Quantity    Unit Price    Discount     │
│  ─────   ────────    ──────────    ────────     │
│  1       1-9         $47.00        —            │
│  2       10-49       $42.30        10%          │
│  3       50-99       $39.95        15%          │
│  4       100+        $37.60        20%          │
│                                                 │
│  MOQ: 10 units for wholesale pricing            │
└─────────────────────────────────────────────────┘
```

**Design:**
- Table layout with mono font for numbers
- Subtle zebra striping
- Highlight current tier on hover
- Clean, data-dense presentation

### 5. Certificate of Analysis (COA) Viewer

**Modal/Page Layout:**
```
┌─────────────────────────────────────────────────┐
│  [×] CERTIFICATE OF ANALYSIS                    │
├─────────────────────────────────────────────────┤
│  Product:     GHK-Cu Copper Peptide             │
│  Batch:       GHK-2024-08-042                   │
│  Tested:      2024-08-15                        │
│  Lab:         American Analytical Lab Inc.      │
│                                                 │
│  PURITY ANALYSIS (HPLC)                         │
│  Target Purity:    ≥99.0%                       │
│  Measured Purity:  99.3%                        │
│  Method:           USP <621>                    │
│                                                 │
│  IDENTITY CONFIRMATION                          │
│  Mass Spec (MS):   ✓ Confirmed                  │
│  Molecular Weight: 419.92 g/mol (expected)      │
│                   419.91 g/mol (measured)       │
│                                                 │
│  [Download PDF] [Print]                         │
└─────────────────────────────────────────────────┘
```

---

## 🎭 Interaction Patterns

### Buttons

#### Primary CTA
```typescript
// Add to Cart, View COA
className="bg-accent-500 text-white px-6 py-3 rounded-md
           font-medium hover:bg-accent-600
           transition-colors duration-200
           focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
```

#### Secondary
```typescript
// View Details
className="border border-accent-500 text-accent-500 px-6 py-3 rounded-md
           font-medium hover:bg-accent-500 hover:text-white
           transition-all duration-200"
```

#### Ghost
```typescript
// Cancel, Back
className="text-charcoal-400 hover:text-charcoal-200 px-4 py-2
           transition-colors duration-150"
```

### Forms

#### Input Fields
```typescript
className="bg-charcoal-800 border border-charcoal-700
           text-clinical-white px-4 py-3 rounded-md
           focus:border-accent-500 focus:ring-1 focus:ring-accent-500
           placeholder:text-charcoal-500
           transition-all duration-200"
```

#### Labels
```typescript
className="text-sm font-medium text-charcoal-300 mb-2 block"
```

### Cards

#### Dark Glass Card
```typescript
className="bg-charcoal-800/50 backdrop-blur-sm
           border border-charcoal-700/50
           rounded-lg p-6
           shadow-glass
           hover:border-accent-500/30 hover:shadow-dark-lg
           transition-all duration-300"
```

### Badges

#### Research Use Only
```typescript
className="inline-flex items-center px-3 py-1 rounded-full
           bg-clinical-warning/10 border border-clinical-warning/30
           text-clinical-warning text-xs font-medium"
```

#### Purity Badge
```typescript
className="inline-flex items-center px-2.5 py-0.5 rounded
           bg-clinical-success/10 border border-clinical-success/30
           text-clinical-success text-xs font-mono font-medium"
```

---

## 📱 Responsive Breakpoints

```typescript
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet portrait
  'lg': '1024px',  // Tablet landscape / Desktop
  'xl': '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
}
```

**Layout Strategy:**
- Mobile: Single column, stack everything
- Tablet: Two-column product grids, collapsible specs
- Desktop: Three-column grids, side-by-side specs panels

---

## ♿ Accessibility Requirements

1. **Contrast:** Minimum WCAG AA (4.5:1 for normal text, 3:1 for large)
2. **Focus States:** Visible focus rings on all interactive elements
3. **Keyboard Nav:** Full site navigable via keyboard
4. **Screen Readers:** Proper ARIA labels on all interactive components
5. **Alt Text:** Descriptive alt text for product images
6. **Skip Links:** Skip to main content link at top

---

## 🚫 Forbidden Patterns

**DO NOT USE:**
- ❌ Lifestyle photography (people, gyms, labs with people)
- ❌ Medical benefit claims (anti-aging, healing, performance)
- ❌ Animated GIFs or excessive motion
- ❌ Bright, saturated colors (stay muted)
- ❌ Comic Sans, brush fonts, handwriting fonts
- ❌ Stock photo watermarks
- ❌ Pop-ups (except cookie consent)
- ❌ Auto-playing videos
- ❌ Chatbots with personality
- ❌ "Add to cart" sounds or notifications
- ❌ Gamification (points, badges, achievements)

---

## ✅ Success Criteria

**A well-designed MAHA Peptides page:**
1. Looks like a pharmaceutical supplier portal
2. Feels expensive and controlled
3. Inspires trust through precision, not marketing
4. Passes compliance officer scrutiny
5. Uses white space intentionally
6. Presents data clearly (specs, batch, COA)
7. Never makes medical claims
8. Feels distinctly American and premium

---

## 🔧 Implementation Notes

### Tech Stack Integration
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom design tokens
- **Components:** Radix UI primitives (accessible, unstyled)
- **Icons:** Lucide React (technical, not decorative)
- **Fonts:** Inter (primary), IBM Plex Mono (data)
- **Dark Mode:** `class` strategy, dark as default

### File Structure
```
apps/web/src/
├── components/
│   ├── ui/
│   │   ├── button.tsx          # shadcn-style base components
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── product/
│   │   ├── product-card.tsx    # Grid/list product display
│   │   ├── product-hero.tsx    # Detail page hero
│   │   ├── specs-panel.tsx     # Specifications table
│   │   ├── storage-panel.tsx   # Storage instructions
│   │   └── compliance-notice.tsx
│   ├── compliance/
│   │   ├── coa-viewer.tsx
│   │   ├── terms-modal.tsx
│   │   └── age-gate.tsx
│   └── marketing/
│       ├── hero.tsx
│       ├── trust-signals.tsx
│       └── feature-grid.tsx
```

### Next Steps After Logo Upload
1. Extract exact brand colors from logo
2. Update `tailwind.config.ts` with MAHA color palette
3. Create base component library (`ui/` folder)
4. Redesign homepage hero
5. Rebuild product detail page
6. Implement dark mode toggle
7. Add compliance components

---

**End of Design System v1.0**
