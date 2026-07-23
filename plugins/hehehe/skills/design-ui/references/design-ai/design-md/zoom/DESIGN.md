# Zoom Design System

> Communication software with a bright, approachable productivity frame. Zoom's current public site combines `Happy Display`-style headlines with `Almaden Sans`-style UI text, using Zoom blue (`#0B5CFF`), white (`#FFFFFF`), deep navy (`#0B1739`), soft blue surfaces, and rounded product cards for meetings, AI, and collaboration tools.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Zoom feels like **connected work presented through a clean, optimistic SaaS lens**. The site emphasizes communication, AI assistance, and platform breadth, but keeps the visual language bright and approachable rather than dense or intimidating.

### Mood & Feeling
- Connected and productive
- Bright, helpful, and modern
- Professional without being severe
- AI-forward with practical framing
- Broad platform confidence

### Design Density
**Medium density.** Zoom shows many products and categories, but the overall system stays readable through large cards, blue anchors, and generous spacing.

### Visual Character
- Bright white base with strong blue anchors
- Rounded cards and product category pills
- Friendly but professional illustrations and screenshots
- AI blocks framed as helpful work accelerators
- Clean dashboard-style proof modules

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--zoom-blue` | `#0B5CFF` | Primary brand and CTA color |
| `--zoom-navy` | `#0B1739` | Deep brand contrast |
| `--zoom-white` | `#FFFFFF` | Main surface and cards |
| `--zoom-surface` | `#F5F8FF` | Soft blue section background |
| `--zoom-ink` | `#101828` | Primary text |

### Support and Utility

| Token | Hex | Role |
|-------|-----|------|
| `--zoom-border` | `#D6E2FF` | Card edges and separators |
| `--zoom-muted` | `#5B6475` | Secondary copy |
| `--zoom-blue-soft` | `#EAF0FF` | Subtle brand tint |
| `--zoom-success` | `#1E8E5A` | Positive AI or workflow state |
| `--zoom-warning` | `#A96800` | Warning emphasis |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Happy Display", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Almaden Sans", system-ui, -apple-system, sans-serif;
--font-mono: "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 68px | 700 | 1.02 | -0.03em | `#0B1739` |
| Page Title | 48px | 700 | 1.08 | -0.02em | `#0B1739` |
| Section Title | 36px | 700 | 1.12 | -0.02em | `#0B1739` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#101828` |
| Body Large | 18px | 400 | 1.55 | 0 | `#101828` |
| Body | 16px | 400 | 1.55 | 0 | `#101828` |
| Small Body | 14px | 400 | 1.45 | 0 | `#5B6475` |
| Label | 12px | 700 | 1.3 | 0.04em | `#0B5CFF` |

### Typography Philosophy
Zoom typography should feel **clear, optimistic, and high-utility**. Display type can be warm and memorable, but body text needs to support product breadth and technical trust.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #0b5cff;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 700;
}

.button-primary:hover {
  background: #0848cc;
}

.button-secondary {
  background: #ffffff;
  color: #0b1739;
  border: 1px solid #d6e2ff;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and Product Modules

```css
.product-card {
  background: #ffffff;
  border: 1px solid #d6e2ff;
  border-radius: 24px;
  box-shadow: 0 14px 34px rgba(11, 23, 57, 0.06);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #101828;
  border: 1px solid #d6e2ff;
  border-radius: 14px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #0b5cff;
  box-shadow: 0 0 0 4px rgba(11, 92, 255, 0.14);
}
```

### Component Notes
- Category pills and product chips should read clearly and feel touch-friendly
- Blue should guide action, not saturate every surface
- AI modules should feel practical and integrated into work

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Tight icon spacing |
| `--space-3` | `8px` | Small gaps |
| `--space-4` | `12px` | Control padding |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card spacing |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section rhythm |
| `--space-9` | `64px` | Hero spacing |
| `--space-10` | `96px` | Large platform storytelling sections |

### Layout Behavior
- Lead with a broad "work connects" message and product entry points
- Use blue product categories as a navigation and hierarchy aid
- Keep platform breadth organized into cards, tabs, or bounded rows
- Mix product imagery with concise benefit lists

### Whitespace Philosophy
Whitespace should feel **helpful and platform-ready**, giving a broad suite of tools enough room without making the page feel slow.

---

## 6. Depth & Elevation

### Elevation Strategy
Zoom uses **soft SaaS elevation** with rounded shells, light shadows, and pale blue section framing.

```css
--shadow-soft: 0 8px 20px rgba(11, 23, 57, 0.05);
--shadow-card: 0 16px 36px rgba(11, 23, 57, 0.08);
```

### Surface Hierarchy
- White base canvas
- Soft blue support sections
- Elevated white cards
- Blue CTA and pill accents

---

## 7. Do's and Don'ts

### Do
- Keep the experience bright, clear, and work-focused
- Use blue to orient and connect the suite
- Make AI feel practical and useful
- Preserve product category clarity across the page

### Don't
- Do not make Zoom feel like a dark enterprise security portal
- Do not overcomplicate card styling with too many accent colors
- Do not let AI messaging become abstract or decorative
- Do not crowd product categories into hard-to-scan grids

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked cards, pill rows, simplified hero copy |
| Tablet | `768px - 1023px` | Two-column product blocks and compact category rows |
| Desktop | `1024px+` | Wide suite storytelling and multi-card product groups |

### Responsive Rules
- Keep primary actions and plan exploration obvious on mobile
- Allow category pills to wrap or scroll rather than shrink too aggressively
- Preserve clear product-card padding when layouts collapse
- Maintain readable screenshots and proof modules

---

## 9. Agent Prompt Guide

### Quick Reference
- Bright Zoom blue and white with soft blue support surfaces
- Friendly professional SaaS typography and rounded cards
- Product-category chips, AI helper modules, and communication tooling
- Helpful, connected, and modern work-platform energy

### Prompt Template
```text
Design this like Zoom's current public website:
- bright Zoom-blue accents on white and soft blue surfaces
- friendly professional SaaS typography with bold clean headlines
- rounded product cards, pill navigation, and practical AI modules
- broad communication-platform clarity without enterprise heaviness
- approachable collaboration energy with polished product proof
```
