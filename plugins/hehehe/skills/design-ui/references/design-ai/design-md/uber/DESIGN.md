# Uber Design System

> Urban mobility with a crisp black-and-white interface core. Uber's current public site uses `Uber Move Display` and `Uber Move Text`, leaning on black (`#000000`), white (`#FFFFFF`), light gray (`#F6F6F6`), border gray (`#E2E2E2`), and a small set of functional greens for positive states and map-related emphasis.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Uber feels like **transportation logistics made consumer-simple**. The design is direct, fast, and functional. It avoids visual clutter and leans on type, spacing, and clear actions rather than heavy brand ornament.

### Mood & Feeling
- Direct and practical
- Urban, modern, and efficient
- Neutral enough for many countries and services
- Built for fast task completion
- Confident but not flashy

### Design Density
**Medium density.** Search, routing, and account surfaces show a lot of utility quickly, but Uber keeps the frames minimal and readable.

### Visual Character
- Black navigation and white content fields
- Strong rectangular layout blocks
- Clear pickup/dropoff forms
- Sparse use of color outside maps, success, and illustrations
- Product photography that supports utility rather than aspiration alone

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--uber-black` | `#000000` | Header, CTA, strong text |
| `--uber-white` | `#FFFFFF` | Main surface, cards, inputs |
| `--uber-gray-050` | `#F6F6F6` | Section background |
| `--uber-gray-200` | `#E2E2E2` | Borders and dividers |
| `--uber-gray-700` | `#545454` | Secondary text |

### Utility and Semantic

| Token | Hex | Role |
|-------|-----|------|
| `--uber-ink` | `#111111` | Primary body text |
| `--uber-success` | `#0A7F5A` | Positive status |
| `--uber-success-soft` | `#E8F5EF` | Soft positive tint |
| `--uber-warning` | `#A85F00` | Cautionary state |
| `--uber-focus` | `rgba(0,0,0,0.14)` | Focus ring shadow |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Uber Move Display", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Uber Move Text", "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 64px | 700 | 1.02 | -0.03em | `#000000` |
| Page Title | 44px | 700 | 1.08 | -0.02em | `#000000` |
| Section Title | 32px | 700 | 1.12 | -0.01em | `#000000` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#111111` |
| Body Large | 18px | 400 | 1.5 | 0 | `#111111` |
| Body | 16px | 400 | 1.5 | 0 | `#111111` |
| Small Body | 14px | 400 | 1.45 | 0 | `#545454` |
| Label | 12px | 600 | 1.3 | 0.04em | `#545454` |

### Typography Philosophy
Uber typography should feel **fast, plainspoken, and highly legible**. Display moments are bold, but the system is still grounded in utility and short task-oriented copy.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  min-height: 48px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 600;
}

.button-primary:hover {
  background: #222222;
}

.button-secondary {
  background: #f6f6f6;
  color: #111111;
  border: 1px solid #e2e2e2;
  border-radius: 10px;
  min-height: 48px;
  padding: 0 20px;
}
```

### Cards and Search Panels

```css
.panel {
  background: #ffffff;
  color: #111111;
  border: 1px solid #e2e2e2;
  border-radius: 16px;
}
```

### Inputs

```css
.input {
  background: #f6f6f6;
  color: #111111;
  border: 1px solid transparent;
  border-radius: 10px;
  min-height: 52px;
  padding: 14px 16px;
}

.input:focus {
  outline: none;
  border-color: #000000;
  background: #ffffff;
}
```

### Component Notes
- Pickup and destination fields should feel immediate and effortless
- Uber prefers simple rectangles with modest radii
- Utility modules should read faster than marketing copy

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Small icon adjustments |
| `--space-3` | `8px` | Tight gaps |
| `--space-4` | `12px` | Compact padding |
| `--space-5` | `16px` | Default internal spacing |
| `--space-6` | `24px` | Form grouping |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section spacing |
| `--space-9` | `64px` | Hero sections |

### Layout Behavior
- Start with the task: ride, delivery, drive, or reserve
- Place key forms high and visually dominant
- Keep supporting information modular and scannable
- Use strong vertical rhythm instead of decorative asymmetry

### Whitespace Philosophy
Whitespace should feel **efficient and urban**, leaving enough room for quick comprehension without slowing the experience down.

---

## 6. Depth & Elevation

### Elevation Strategy
Uber uses **low to moderate elevation**. Search shells and floating panels can lift slightly, but most depth comes from contrast and clean framing.

```css
--shadow-soft: 0 8px 20px rgba(0, 0, 0, 0.08);
--shadow-panel: 0 16px 32px rgba(0, 0, 0, 0.10);
```

### Surface Hierarchy
- Black header / CTA surfaces
- White content panels
- Light gray utility backgrounds
- Minimal floating chrome

---

## 7. Do's and Don'ts

### Do
- Keep forms obvious and friction-free
- Use black and white as the core language
- Keep copy concise and action-oriented
- Use color mainly for state, map context, or confirmation

### Don't
- Do not flood the interface with gradient marketing effects
- Do not over-round the system into a soft consumer lifestyle app
- Do not bury ride and driver actions under decorative content
- Do not weaken contrast in core form flows

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked form flow, compact cards, drawer-like panels |
| Tablet | `768px - 1023px` | Wider forms and split hero modules |
| Desktop | `1024px+` | Large task-first hero and multi-column utility sections |

### Responsive Rules
- Keep pickup and dropoff fields at comfortable tap size
- Allow route and pricing content to stack rather than squeeze
- Preserve action clarity before preserving decorative imagery
- Use sticky or repeated CTA patterns when helpful on mobile

---

## 9. Agent Prompt Guide

### Quick Reference
- Black, white, and light gray functional system
- Uber Move-style bold display with very readable body text
- Task-first layouts, route/search forms, modest radii
- Fast, urban, practical, and conversion-oriented

### Prompt Template
```text
Design this like Uber's current public website:
- black-and-white mobility UI with light gray utility surfaces
- bold Uber Move-style display type and highly legible forms
- route and search fields as the hero focus
- modest rounded corners, low visual clutter, clear CTAs
- efficient urban transportation energy over decorative branding
```
