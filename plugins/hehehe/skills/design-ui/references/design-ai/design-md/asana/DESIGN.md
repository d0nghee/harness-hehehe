# Asana Design System

> Work management with a polished, AI-forward enterprise feel. Asana's current public site combines a refined neo-grotesk display system with clean sans UI text, using coral (`#FC636B`) as the historic brand anchor alongside white (`#FFFFFF`), soft neutral backgrounds, dark ink text (`#0D0D0D`), and a set of polished product-image cards.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Asana feels like **strategy and execution software presented with premium clarity**. The site balances enterprise trust with an aspirational, modern polish. Product images, AI story blocks, and clear benefit framing do most of the work.

### Mood & Feeling
- Organized and high-performing
- Premium but not exclusive
- AI-forward without becoming gimmicky
- Strategic, not merely task-list oriented
- Polished and business-ready

### Design Density
**Medium density.** Asana presents many capabilities, use cases, and integrations, but frames them in large cards and structured sections so the experience remains calm.

### Visual Character
- White and light-neutral base
- Coral brand accent used selectively
- Clean product screenshots and workflow imagery
- Rounded cards with strong spacing
- Enterprise polish with a softer edge than legacy B2B

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--asana-coral` | `#FC636B` | Historic brand accent, CTA support |
| `--asana-white` | `#FFFFFF` | Main surface and cards |
| `--asana-ink` | `#0D0D0D` | Primary text |
| `--asana-muted` | `#5E626A` | Secondary copy |
| `--asana-surface` | `#F7F7F8` | Light section background |

### Support and Product Tokens

| Token | Hex | Role |
|-------|-----|------|
| `--asana-border` | `#E5E7EB` | Card borders and separators |
| `--asana-coral-soft` | `#FFE7E8` | Soft accent background |
| `--asana-purple-soft` | `#F1ECFF` | AI / insight support tint |
| `--asana-success` | `#1C8B5B` | Positive state |
| `--asana-warning` | `#A45F13` | Warning / attention |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Lausanne", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Lausanne", "Inter", system-ui, sans-serif;
--font-mono: "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 68px | 600 | 1.02 | -0.03em | `#0D0D0D` |
| Page Title | 48px | 600 | 1.08 | -0.02em | `#0D0D0D` |
| Section Title | 36px | 600 | 1.12 | -0.02em | `#0D0D0D` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#0D0D0D` |
| Body Large | 18px | 400 | 1.55 | 0 | `#0D0D0D` |
| Body | 16px | 400 | 1.55 | 0 | `#0D0D0D` |
| Small Body | 14px | 400 | 1.45 | 0 | `#5E626A` |
| Label | 12px | 700 | 1.3 | 0.04em | `#5E626A` |

### Typography Philosophy
Asana typography should feel **strategic, modern, and composed**. It should support executive storytelling, workflow explanation, and UI proof without becoming cold.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #0d0d0d;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 15px;
  font-weight: 600;
}

.button-primary:hover {
  background: #222222;
}

.button-secondary {
  background: #ffffff;
  color: #0d0d0d;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and Workflow Blocks

```css
.workflow-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  box-shadow: 0 14px 34px rgba(13, 13, 13, 0.06);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #0d0d0d;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #0d0d0d;
  box-shadow: 0 0 0 4px rgba(13, 13, 13, 0.08);
}
```

### Component Notes
- Product screenshots should look polished and current, not overly abstract
- CTA styling is restrained; coral often works better as a support accent than the only CTA fill
- Enterprise credibility matters more than novelty

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Fine alignment |
| `--space-3` | `8px` | Tight rhythm |
| `--space-4` | `12px` | Compact controls |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card spacing |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section rhythm |
| `--space-9` | `64px` | Hero layout |
| `--space-10` | `96px` | Large capability sections |

### Layout Behavior
- Use broad hero messaging with immediate product proof
- Present capabilities, use cases, and integrations in bounded groups
- Keep enterprise trust signals close to CTAs
- Let AI stories feel modern but still operationally useful

### Whitespace Philosophy
Whitespace should feel **executive-ready and composed**, supporting a premium B2B narrative without becoming sterile.

---

## 6. Depth & Elevation

### Elevation Strategy
Asana uses **soft card elevation** and clear section separation. The right result is polished and current, not glossy.

```css
--shadow-soft: 0 8px 22px rgba(13, 13, 13, 0.05);
--shadow-card: 0 16px 36px rgba(13, 13, 13, 0.08);
```

### Surface Hierarchy
- White base
- Soft neutral background bands
- Elevated product and proof cards
- Coral and pale purple accents used with restraint

---

## 7. Do's and Don'ts

### Do
- Keep the system polished, capable, and enterprise-trustworthy
- Use coral as a memorable accent, not a full-page flood
- Show product clarity and workflow relevance
- Balance AI ambition with operational realism

### Don't
- Do not make Asana feel like a playful consumer to-do app
- Do not overuse decorative gradients or noise
- Do not crowd use cases and integrations into indistinct grids
- Do not let AI visuals overpower the core work-management story

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked AI/product modules and simplified proof sections |
| Tablet | `768px - 1023px` | Two-column cards with reduced screenshot scale |
| Desktop | `1024px+` | Wide strategic storytelling plus dense but ordered capability sections |

### Responsive Rules
- Preserve CTA clarity and trust signals near the top on mobile
- Stack workflow screenshots and benefit lists instead of shrinking them too far
- Keep integration logos readable and well-spaced
- Maintain comfortable touch targets and card padding

---

## 9. Agent Prompt Guide

### Quick Reference
- White and soft-neutral B2B foundation with coral support accents
- Premium modern enterprise typography and rounded cards
- AI-forward but still workflow-credible
- Product screenshots, integrations, and strategic messaging in balance

### Prompt Template
```text
Design this like Asana's current public website:
- clean white and soft-neutral enterprise foundation
- premium modern sans typography with composed high-level messaging
- rounded workflow cards and polished product screenshots
- restrained coral accents with occasional soft purple support tints
- strategic AI-enabled work-management energy, not casual task-app styling
```
