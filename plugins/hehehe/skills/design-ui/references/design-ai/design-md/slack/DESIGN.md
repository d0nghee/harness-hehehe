# Slack Design System

> Work collaboration with enterprise utility and brand warmth. Slack's current public site mixes `Larsseit`-style display typography with `Slack-Circular-Pro`-style UI text, anchored by aubergine (`#4A154B`), white (`#FFFFFF`), warm off-white (`#F8F5F0`), and the familiar multicolor accent system of green (`#2EB67D`), blue (`#36C5F0`), yellow (`#ECB22E`), and red (`#E01E5A`).

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Slack feels like **a friendly collaboration platform with serious operational depth**. The marketing system is conversational, colorful, and approachable, but the UI examples remain highly structured and productivity-driven.

### Mood & Feeling
- Smart and human
- Warm, not cold enterprise
- Dense with capability but still approachable
- Conversational and energetic
- Reliable enough for large teams

### Design Density
**Medium density.** Slack is willing to show lots of product depth, but it offsets that density with rounded shapes, clear modules, and a forgiving warm palette.

### Visual Character
- Aubergine-led brand framing
- Warm ivory backgrounds instead of sterile white-only layouts
- Rounded modules with strong product screenshots
- Colorful brand accents used in categorical clusters
- Large, readable, confident headlines

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--slack-aubergine` | `#4A154B` | Brand anchor, dark nav, key CTAs |
| `--slack-white` | `#FFFFFF` | Cards, inverse text, main surfaces |
| `--slack-ivory` | `#F8F5F0` | Page background, warm sections |
| `--slack-ink` | `#1D1C1D` | Primary text |
| `--slack-muted` | `#5E5A5E` | Secondary copy |

### Brand Accent System

| Token | Hex | Role |
|-------|-----|------|
| `--slack-green` | `#2EB67D` | Positive states, workflow success |
| `--slack-blue` | `#36C5F0` | Informational accent |
| `--slack-yellow` | `#ECB22E` | Highlight accent |
| `--slack-red` | `#E01E5A` | Alert and promotional emphasis |
| `--slack-purple` | `#611F69` | Richer hover / premium purple |

### Structure Tokens

| Token | Hex | Role |
|-------|-----|------|
| `--slack-border` | `#DDD6D1` | Soft border on warm backgrounds |
| `--slack-panel` | `#F4EDE4` | Soft cards and section blocks |
| `--slack-panel-deep` | `#EEE7E1` | Stronger warm container |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Larsseit", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Slack-Circular-Pro", "Circular Std", system-ui, sans-serif;
--font-mono: "Slack-Circular-Pro", "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 72px | 700 | 1.02 | -0.03em | `#1D1C1D` |
| Page Title | 48px | 700 | 1.08 | -0.02em | `#1D1C1D` |
| Section Title | 36px | 700 | 1.12 | -0.02em | `#1D1C1D` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#1D1C1D` |
| Body Large | 20px | 400 | 1.5 | 0 | `#1D1C1D` |
| Body | 18px | 400 | 1.55 | 0 | `#1D1C1D` |
| Small Body | 14px | 400 | 1.5 | 0 | `#5E5A5E` |
| Label | 13px | 700 | 1.35 | 0.03em | `#4A154B` |

### Typography Philosophy
Slack typography should feel **clear, confident, and conversational**. Big display moments make the brand feel modern and optimistic; body copy stays plainspoken and useful.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #4a154b;
  color: #ffffff;
  border: 1px solid #4a154b;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 15px;
  font-weight: 700;
}

.button-primary:hover {
  background: #611f69;
}

.button-secondary {
  background: #ffffff;
  color: #4a154b;
  border: 1px solid #4a154b;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and UI Panels

```css
.panel {
  background: #ffffff;
  border: 1px solid #ddd6d1;
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(29, 28, 29, 0.08);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #1d1c1d;
  border: 1px solid #c9c1bc;
  border-radius: 12px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #611f69;
  box-shadow: 0 0 0 4px rgba(97, 31, 105, 0.14);
}
```

### Component Notes
- Product screenshots should feel native to the story, not decorative inserts
- Pills, tabs, and integrations logos are rounded and approachable
- Slack can support colorful accents, but the base UI must remain orderly

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Fine alignment |
| `--space-3` | `8px` | Tight gaps |
| `--space-4` | `12px` | Compact padding |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card internals |
| `--space-7` | `32px` | Module rhythm |
| `--space-8` | `48px` | Section spacing |
| `--space-9` | `64px` | Hero padding |
| `--space-10` | `96px` | Large storytelling sections |

### Layout Behavior
- Alternate warm light sections with white modules for rhythm
- Use generous screenshot frames and clear text columns
- Keep multi-feature grids tidy and highly scannable
- Give integrations and customer logos obvious grouping

### Whitespace Philosophy
Slack whitespace should feel **friendly and productive**, not sparse or precious. Leave room for dense product storytelling without making the experience feel corporate or brittle.

---

## 6. Depth & Elevation

### Elevation Strategy
Slack uses **soft card elevation** with rounded containers and warm outlines.

```css
--shadow-soft: 0 8px 24px rgba(29, 28, 29, 0.06);
--shadow-card: 0 16px 36px rgba(29, 28, 29, 0.10);
--shadow-focus: 0 0 0 4px rgba(97, 31, 105, 0.14);
```

### Surface Hierarchy
- Warm page canvas
- White content cards
- Aubergine CTA and footer surfaces
- Product screenshots framed inside rounded shells

---

## 7. Do's and Don'ts

### Do
- Keep the tone human and readable
- Use aubergine as the stable brand anchor
- Let multicolor accents support, not dominate
- Show product UI with clarity and trust

### Don't
- Do not flatten Slack into gray enterprise software
- Do not oversaturate every block with competing colors
- Do not use cold minimalist styling that removes warmth
- Do not make collaboration surfaces look toy-like

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked sections, full-width CTAs, simplified nav |
| Tablet | `768px - 1023px` | Two-column modules with narrower screenshot frames |
| Desktop | `1024px+` | Wide product storytelling and multi-column feature grids |

### Responsive Rules
- Preserve headline confidence on mobile, but reduce line count
- Keep screenshot frames readable; crop before shrinking too far
- Use full-width action buttons on small screens where needed
- Maintain touch targets of at least `44px`

---

## 9. Agent Prompt Guide

### Quick Reference
- Aubergine, ivory, white, and a restrained multicolor accent set
- Bold, friendly display typography with clean sans UI text
- Rounded cards, warm enterprise feel, collaboration-first UI
- Dense product examples balanced by approachable spacing

### Prompt Template
```text
Design this like Slack's current public website:
- aubergine-led branding with warm ivory backgrounds
- bold friendly display type and clean rounded interface shells
- product screenshots embedded in polished white cards
- selective blue, green, yellow, and red accents
- enterprise collaboration energy that still feels human
```
