# Stripe Design System

> Financial infrastructure with developer-grade precision. The live site currently serves `Sohne` and `Source Code Pro`, combining white and mist-blue surfaces (`#FFFFFF`, `#F8FAFD`) with deep ink/navy foundations (`#061B31`, `#30313D`) and a vivid accent spectrum anchored by Stripe violet (`#533AFD`, `#635BFF`), electric blue (`#0073E6`, `#0570DE`), green (`#00D66F`), orange (`#FF6118`), and pink (`#FB76FA`).

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Stripe feels like **finance infrastructure rendered with product-design confidence**. The brand system mixes enterprise trust, developer ergonomics, and editorial motion. Marketing pages are dramatic and kinetic, with gradients, angled shapes, and layered product mockups. Docs and payment surfaces become calmer, more methodical, and deeply readable.

### Mood & Feeling
- **Infrastructure trust**: Feels reliable, global, and precise
- **Developer fluency**: Code, APIs, and implementation details are first-class
- **High-end momentum**: Marketing surfaces have motion, gradients, and energy
- **Systematic polish**: Tables, forms, and dashboards feel controlled and exact
- **Modern financial optimism**: Bright violet and blue accents keep it forward-looking

### Design Density
**Medium density** on marketing, **medium-to-high density** in docs, forms, and dashboard-like surfaces. Stripe is comfortable showing a lot of information, but it rarely feels cluttered because hierarchy, spacing, and contrast are tightly managed.

### Visual Character
- White and mist-blue surfaces with deep navy framing
- Bright violet as signature brand accent
- Layered gradients and diagonal transitions on marketing pages
- Rounded, elevated product cards and dashboard mockups
- Monospace code support embedded naturally into the layout
- Data-rich UI that still feels approachable
- Soft shadows and translucent overlays rather than harsh borders everywhere

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--stripe-white` | `#FFFFFF` | Primary surface, cards, forms |
| `--stripe-mist` | `#F8FAFD` | Section background, docs canvas |
| `--stripe-mist-soft` | `#FCFDFE` | Elevated light panels |
| `--stripe-ink` | `#061B31` | Deep brand ink, dark sections |
| `--stripe-text` | `#30313D` | Primary form/docs text |

### Brand and Primary Accents

| Token | Hex | Role |
|-------|-----|------|
| `--stripe-violet` | `#635BFF` | Canonical Stripe brand accent |
| `--stripe-violet-bright` | `#533AFD` | Current marketing CTA / hero emphasis |
| `--stripe-violet-deep` | `#7232F1` | Hover/gradient support |
| `--stripe-indigo` | `#1318C1` | Deep gradient endpoint |
| `--stripe-blue` | `#0073E6` | Links, supporting primary accent |
| `--stripe-elements-blue` | `#0570DE` | Official Elements appearance primary |

### Support Palette

| Token | Hex | Role |
|-------|-----|------|
| `--stripe-success` | `#00D66F` | Success states, confirmation |
| `--stripe-orange` | `#FF6118` | Calls to action, featured emphasis |
| `--stripe-pink` | `#FB76FA` | Gradient and promotional accent |
| `--stripe-yellow` | `#FFCF5E` | Highlight, layered illustration accent |
| `--stripe-danger` | `#DF1B41` | Error states in Elements/docs |

### Surface and Border Scale

| Token | Hex | Role |
|-------|-----|------|
| `--surface-50` | `#FAFDFF` | Light background alternate |
| `--surface-100` | `#F6F9FC` | Section fill |
| `--surface-200` | `#ECF0F4` | Subtle panel fill |
| `--border-soft` | `#E3ECF7` | Light borders |
| `--border-mid` | `#D4DEE9` | Stronger table/input boundaries |
| `--text-muted` | `#737373` | Secondary metadata |

### Dark / Ink Scale

| Token | Hex | Role |
|-------|-----|------|
| `--ink-900` | `#061B31` | Deepest brand background |
| `--ink-800` | `#1C1E54` | Dark card background |
| `--ink-700` | `#2B408A` | Gradient support |
| `--ink-600` | `#453BB3` | Brand transition tone |
| `--text-on-dark` | `#FFFFFF` | Text on dark brand surfaces |

---

## 3. Typography Rules

### Font Stack

```css
/* Primary brand font - served on the live site */
--font-sans: 'Sohne', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Helvetica Neue', Arial, sans-serif;

/* UI/forms/docs token used in Stripe Elements documentation */
--font-ui: 'Ideal Sans', system-ui, -apple-system, BlinkMacSystemFont,
           'Segoe UI', sans-serif;

/* Code font - served on the live site */
--font-mono: 'Source Code Pro', 'SF Mono', 'JetBrains Mono',
             'Roboto Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 64px | 600 | 1.02 | -0.04em | `--stripe-ink` |
| Page Title | 44px | 600 | 1.1 | -0.03em | `--stripe-ink` |
| Section Title | 32px | 600 | 1.15 | -0.02em | `--stripe-ink` |
| Card Title | 24px | 500 | 1.25 | -0.015em | `--stripe-ink` |
| Subsection | 20px | 500 | 1.35 | -0.01em | `--stripe-text` |
| Large Body | 18px | 400 | 1.65 | 0 | `--stripe-text` |
| Body | 16px | 400 | 1.6 | 0 | `--stripe-text` |
| Small Body | 14px | 400 | 1.5 | 0 | `--text-muted` |
| Label | 13px | 500 | 1.4 | 0.02em | `--stripe-text` |
| Code | 13px | 500 | 1.55 | 0 | `--stripe-ink` |

### Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body copy, docs, helper text |
| 500 | Medium | Labels, tabs, cards, controls |
| 600 | Semibold | Marketing headlines, key section titles |

### Typography Philosophy
Stripe typography balances **editorial impact and implementation clarity**. Marketing surfaces use large, tightly tracked display type. Docs, forms, and embedded checkout surfaces shift into calmer UI typography with exact spacing. Code and numeric information should always feel first-class, never bolted on.

```css
--tracking-tightest: -0.04em; /* Hero */
--tracking-tight: -0.02em;    /* Section titles */
--tracking-normal: 0;         /* Body */
--tracking-wide: 0.02em;      /* Labels */
```

---

## 4. Component Stylings

### Buttons

#### Primary CTA
```css
.button-primary {
  background: #533afd;
  color: #ffffff;
  height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 8px 20px rgba(83, 58, 253, 0.24);
  transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
}

.button-primary:hover {
  background: #635bff;
  transform: translateY(-1px);
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(5, 112, 222, 0.2), 0 8px 20px rgba(83, 58, 253, 0.24);
}
```

#### Secondary CTA
```css
.button-secondary {
  background: #ffffff;
  color: #061b31;
  border: 1px solid #d4dee9;
  border-radius: 999px;
  height: 44px;
  padding: 0 18px;
}

.button-secondary:hover {
  background: #f8fafd;
}
```

### Cards and Product Mockups
```css
.card {
  background: #ffffff;
  border: 1px solid rgba(212, 222, 233, 0.75);
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(13, 23, 56, 0.15);
}
```

### Inputs and Checkout Fields
Stripe’s public docs for Elements expose a compact, systemized input model.

```css
.input {
  background: #ffffff;
  color: #30313d;
  border: 1px solid #d4dee9;
  border-radius: 4px;
  padding: 12px;
  font-family: var(--font-ui);
}

.input:focus {
  border-color: #0570de;
  box-shadow: 0 0 0 1px #0570de;
}
```

### Navigation
- Sticky top navigation with spacious horizontal grouping
- Dark-on-light or light-on-dark variants depending on section contrast
- Mega-nav surfaces feel like polished floating panels, not raw dropdown lists
- Docs and product surfaces prioritize left-rail hierarchy and scanability

### Code, Data, and Dashboards
- Code blocks use light mist or dark ink backgrounds with strong monospace readability
- Tables prioritize alignment, numeric clarity, and consistent row rhythm
- Dashboard mockups favor rounded cards, soft shadows, and strong chart separation

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `2px` | Fine-grained UI rhythm, docs tokens |
| `--space-2` | `4px` | Tight control spacing |
| `--space-3` | `8px` | Component internals |
| `--space-4` | `12px` | Compact paddings |
| `--space-5` | `16px` | Default UI padding |
| `--space-6` | `24px` | Card spacing |
| `--space-7` | `32px` | Major module gaps |
| `--space-8` | `48px` | Section spacing |
| `--space-9` | `64px` | Hero structure |
| `--space-10` | `96px` | Large editorial separations |

### Layout Behavior
- Marketing pages use wide canvases, bold section transitions, and layered product storytelling
- Diagonal edges, gradient bands, and floating cards create motion across large sections
- Docs and forms should become flatter and more systematic than the homepage
- Favor 12-column logic on desktop, but let hero compositions break it visually
- Numeric and implementation content should align to strong vertical rhythms

### Whitespace Philosophy
Stripe whitespace should feel **engineered rather than sparse**. Leave enough air for trust and clarity, but keep the interface moving forward with clear stacks, aligned data, and tightly controlled intervals.

---

## 6. Depth & Elevation

### Elevation Strategy
Stripe uses **soft, atmospheric elevation**. Cards float above pale surfaces using cool shadows and blur-like softness. Dark hero sections layer gradients, glows, and product panels for depth.

### Shadow Language

```css
--shadow-sm: 0 8px 20px rgba(13, 23, 56, 0.12);
--shadow-md: 0 18px 40px rgba(13, 23, 56, 0.15);
--shadow-lg: 0 28px 60px rgba(13, 23, 56, 0.18);
--shadow-focus: 0 0 0 3px rgba(5, 112, 222, 0.2);
```

### Surface Hierarchy
- Base canvas: white or mist-blue
- Elevated cards: white with soft border + shadow
- Featured panels: gradient or ink backgrounds with white text
- Overlays/mega-nav: translucent white or dark ink with generous blur and radius
- Docs/forms: sharper edges and lower drama than homepage marketing

---

## 7. Do's and Don'ts

### Do
- Keep Stripe interfaces precise, trustworthy, and implementation-friendly
- Use violet and blue as core accents, with supporting warm accents sparingly
- Let code, tables, and payment UI feel native to the system
- Preserve strong contrast and clean data alignment
- Use gradients and layered cards for marketing drama, not everyday clutter

### Don't
- Don’t flatten Stripe into generic corporate blue SaaS
- Don’t over-round or cartoonify controls
- Don’t use muddy grays where crisp whites and ink tones should lead
- Don’t bury technical content under decorative flourishes
- Don’t apply the loudest homepage gradients to every product screen

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 640px` | Stacked hero modules, condensed nav, single-column cards |
| Tablet | `640px - 1023px` | Simplified multi-column sections, scrollable product mockups |
| Desktop | `1024px+` | Full editorial gradients, multi-panel product storytelling |

### Responsive Rules
- Collapse layered product stories into vertically stacked cards on mobile
- Keep code samples horizontally scrollable instead of reducing legibility
- Preserve CTA prominence and section contrast on small screens
- Use tighter spacing in forms/docs, not smaller type as the first lever
- Maintain clear numerical/data alignment even when tables compress

---

## 9. Agent Prompt Guide

### Quick Reference
- **Foundation**: white + mist-blue surfaces, deep ink structure
- **Typography**: Sohne-style display with clean UI/body text and monospace code support
- **Shape language**: large radii on marketing cards, tighter forms in product flows
- **Mood**: premium financial infrastructure, developer-native, crisp, trustworthy

### Prompt Template
```text
Design this like Stripe:
- White and mist-blue base with deep navy structure
- Electric violet primary accent with precise blue focus states
- Premium marketing gradients and layered product cards
- Clean developer-friendly typography with first-class code/data treatment
- Trustworthy, modern financial infrastructure rather than generic SaaS
```

### Avoid
- Flat monochrome fintech minimalism with no motion
- Overly playful consumer-payment aesthetics
- Thick borders and heavy box outlines everywhere
- Oversaturated gradients in docs and forms where clarity should dominate
