# HashiCorp Design System

> Infrastructure-cloud branding with elegant black-and-white fundamentals, bespoke typography, and portfolio gradients derived from product colors. HashiCorp’s current brand feels technical, premium, and visually confident without losing clarity.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
HashiCorp expresses **infrastructure sophistication**. The system starts from black and white, then layers in carefully derived gradients and product color references. It should feel refined, technical, and composed.

### Mood & Feeling
- **Elegant**: the brand should feel premium and deliberate
- **Technical**: infrastructure credibility is central
- **Modern**: gradients and type give the system present-day energy
- **Confident**: layouts should feel decisive, not crowded
- **Systematic**: product-derived color should be used with intent

### Design Density
**Medium density**. HashiCorp pages explain complex portfolio and platform ideas, but the layouts keep those ideas spacious and digestible.

### Visual Character
- Black and white as foundational brand colors
- Product-based gradients for highlight moments
- Strong typography-driven hierarchy
- Spacious modular storytelling
- Minimal chrome and sharp contrast

---

## 2. Color Palette & Roles

### Foundational Colors

| Token | Hex | Role |
|-------|-----|------|
| `--hashi-black` | `#000000` | Primary text and contrast |
| `--hashi-white` | `#FFFFFF` | Layout base and negative space |

### Product-Derived Brand Support

| Token | Hex | Role |
|-------|-----|------|
| `--terraform-purple` | `#844FBA` | Portfolio highlight reference |
| `--vault-red` | `#E4572E` | Security/product accent reference |
| `--consul-blue` | `#1F6FEB` | Network/infrastructure accent reference |
| `--nomad-green` | `#6CBF84` | Orchestration/product accent reference |
| `--brand-gradient` | `linear-gradient(90deg, #844FBA 0%, #1F6FEB 50%, #6CBF84 100%)` | Headline and spotlight treatment |

### Supporting Neutrals

| Token | Hex | Role |
|-------|-----|------|
| `--gray-100` | `#F5F5F5` | Light section fill |
| `--gray-400` | `#7A7A7A` | Secondary text |
| `--gray-700` | `#333333` | Dense secondary foreground |

### Color Usage Rules
- Start from black and white for most layout decisions.
- Use gradients and product colors as emphasis, not background noise.
- Keep the interface refined even when multi-color moments appear.

---

## 3. Typography Rules

### Font Stack

```css
/* HashiCorp brand typography */
--font-display: 'HashiCorp Sans', Inter, 'Helvetica Neue', Arial, sans-serif;
--font-sans: 'Metro Sans', Inter, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 56px | 600 | 1.04 | -0.02em | Hero and portfolio statement |
| Page Title | 40px | 600 | 1.1 | -0.015em | Major title |
| Section Title | 28px | 600 | 1.15 | -0.01em | Section heading |
| Card Title | 20px | 600 | 1.25 | 0 | Product or feature card |
| Body | 16px | 400 | 1.6 | 0 | Main content |
| Small Body | 14px | 400 | 1.5 | 0 | Supporting text |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons and labels |
| Code | 13px | 400 | 1.5 | 0 | Technical or CLI values |

### Typography Philosophy
HashiCorp Sans adds **warmth and movement** to headings while Metro Sans keeps body content stable and practical. The pairing should feel premium, not ornamental.

### Practical Rules
- Use HashiCorp Sans on titles and subheads.
- Use Metro Sans for body copy and functional UI text.
- Keep sentence case throughout.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #000000;
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #000000;
  border-radius: 999px;
  font: 600 14px/1 'Metro Sans', sans-serif;
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #000000;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #000000;
  border-radius: 999px;
}
```

#### Gradient Highlight Button
```css
.button-highlight {
  background: linear-gradient(90deg, #844FBA 0%, #1F6FEB 100%);
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #D9D9D9;
  border-radius: 12px;
  font: 400 16px/1.2 'Metro Sans', sans-serif;
}
```

### Cards and Spotlight Modules

#### Card
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 20px;
  padding: 24px;
}
```

#### Gradient Panel
```css
.gradient-panel {
  background: linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%);
  border-radius: 24px;
  padding: 28px;
}
```

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Tight spacing |
| `--space-4` | `16px` | Core spacing |
| `--space-5` | `24px` | Card spacing |
| `--space-6` | `32px` | Section spacing |
| `--space-8` | `48px` | Major grouping |
| `--space-10` | `64px` | Large brand rhythm |

### Layout Rules
- Use white as the dominant layout field.
- Reserve gradients for spotlights and highlight moments.
- Break infrastructure narratives into clear modules and product paths.
- Let typography and spacing do most of the brand work.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| White base | clean page field | Main content structure |
| Card | light bounded module | Product and feature grouping |
| Gradient panel | branded spotlight surface | Hero or portfolio moment |
| Overlay | elevated clean surface | Dialog or focused interaction |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
}

.shadow-overlay {
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.12);
}
```

### Depth Rules
- Let contrast and gradient treatment drive most hierarchy.
- Keep depth subtle and refined.
- Avoid stacking too many branded effects in one view.

---

## 7. Do's and Don'ts

### Do
- Start with black and white as the baseline.
- Use product-derived gradients as special moments.
- Apply HashiCorp Sans to titles and Metro Sans to body copy.
- Preserve spacious, premium composition.
- Keep technical messaging sharp and modular.

### Don't
- Turn every surface into a gradient.
- Use product colors as random UI accents.
- Crowd a page with too many visual treatments.
- Drift into generic SaaS blue-on-white styling.

---

## 8. Responsive Behavior

### Responsive Rules
- Preserve headline impact with simplified stacked layouts.
- Keep modular sections distinct on smaller screens.
- Maintain clean CTA spacing in portfolio and product bands.
- Let gradients simplify rather than dominate on mobile.

### Mobile Character
HashiCorp mobile should still feel elegant and technically assured. The refined contrast and selective gradient treatment should remain intact even when layouts compress.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: elegant, technical, premium
- **Core palette**: black, white, selective product-derived gradients
- **Typography**: HashiCorp Sans + Metro Sans
- **Layout**: modular white-base storytelling with spotlight panels
- **Components**: pill buttons, clean cards, gradient moments

### Prompt Snippet

```text
Design this interface in the style of HashiCorp’s current brand system. Use black and white as the foundation, reserve product-derived gradients for featured moments, apply HashiCorp Sans to titles and Metro Sans to body copy, and keep the overall composition spacious and premium. The result should feel elegant, technical, and infrastructure-grade.
```
