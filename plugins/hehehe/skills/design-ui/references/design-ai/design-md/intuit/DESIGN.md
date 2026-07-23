# Intuit Design System

> Friendly financial software design with optimism, precision, and brand discipline. Avenir Next for Intuit, a 4px grid, bright blue-led interfaces, and tightly controlled use of QuickBooks green create experiences that feel supportive, modern, and trustworthy.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Intuit, especially through the public QuickBooks design guidance and current corporate site, expresses **financial confidence without intimidation**. The interfaces pair simple typography, carefully regulated color use, and accessible motion with upbeat product storytelling. The mood is professional but reassuring.

### Mood & Feeling
- **Helpful**: design should make customers feel guided rather than tested
- **Optimistic**: bright color, friendly imagery, and clean composition suggest progress
- **Practical**: product expression stays grounded in real tasks and outcomes
- **Trustworthy**: financial interfaces should feel accurate, stable, and clear
- **Inclusive**: accessibility and legibility are explicit design priorities

### Design Density
**Medium density**. Intuit layouts often mix marketing narrative with product UI moments, but they maintain clarity through generous spacing, clear type scale, and controlled surface complexity.

### Visual Character
- Bright but disciplined blue-led palette
- QuickBooks green is carefully protected and often reserved
- Rounded cards and light surfaces feel approachable
- Product UI is often spotlighted against simplified backgrounds
- Motion is subtle, empathetic, and purposeful
- Typography is clean and consistent rather than decorative

---

## 2. Color Palette & Roles

### Core Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--intuit-blue` | `#0077C5` | Primary link, action, navigation emphasis |
| `--intuit-blue-dark` | `#0B5CAB` | Hover / active state |
| `--intuit-blue-soft` | `#E8F4FB` | Subtle tinted background |
| `--quickbooks-green` | `#2CA01C` | Reserved brand / logo color |
| `--kiwi-50` | `#D7F26E` | Spotlight and illustration accent |
| `--agave-50` | `#9BE7B0` | Product spotlight accent |

### Neutral Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--ink-strong` | `#393A3D` | Primary text |
| `--ink-default` | `#4C4D50` | Body text |
| `--ink-muted` | `#6B6C72` | Secondary text |
| `--border-default` | `#D4D7DC` | Borders and dividers |
| `--surface-page` | `#F2F5FA` | Light page background |
| `--surface-card` | `#FFFFFF` | Primary card surface |

### Semantic Colors

| Token | Hex | Role |
|-------|-----|------|
| `--success` | `#108000` | Success and positive confirmation |
| `--warning` | `#F5A623` | Warning |
| `--danger` | `#D52B1E` | Error / destructive |
| `--info` | `#0077C5` | Info callout |

### Color Usage Rules
- Use blue to guide attention to actionable elements.
- Treat QuickBooks green as a protected brand cue, not a default action fill.
- Use spotlight greens only as focused product-expression accents.
- Keep financial UI grounded in light neutrals and strong readable text.

---

## 3. Typography Rules

### Font Stack

```css
/* Official QuickBooks typeface */
--font-sans: 'Avenir Next for Intuit', 'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Display XL | 56px | 700 | 1.05 | -0.02em | Hero headline |
| Display LG | 44px | 700 | 1.1 | -0.015em | Major page title |
| Heading 1 | 32px | 600 | 1.2 | -0.01em | Section headline |
| Heading 2 | 24px | 600 | 1.25 | -0.01em | Card / module title |
| Heading 3 | 20px | 600 | 1.3 | 0 | Product callout |
| Body | 16px | 400 | 1.6 | 0 | Main content |
| Small Body | 14px | 400 | 1.5 | 0 | Secondary copy |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons, fields |
| Caption | 12px | 500 | 1.4 | 0.01em | Utility text |

### Typography Philosophy
Intuit typography is **simple and confidence-building**. The hierarchy is designed to avoid friction and keep interfaces understandable for people doing stressful financial tasks.

### Practical Rules
- Use sentence case by default.
- Keep font variety low and hierarchy obvious.
- Fit typography to a 4px design grid.
- Use all caps sparingly and only for short, high-emphasis moments.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #0077C5;
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 999px;
  font: 600 14px/1 'Avenir Next for Intuit', 'Avenir Next', sans-serif;
}

.button-primary:hover {
  background: #0B5CAB;
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 119, 197, 0.18);
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #393A3D;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #D4D7DC;
  border-radius: 999px;
  font-weight: 600;
}

.button-secondary:hover {
  background: #F2F5FA;
}
```

#### Emphasis / Brand Button
```css
.button-brand {
  background: #2CA01C;
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 999px;
}
```

### Inputs

#### Text Field
```css
.input {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  background: #FFFFFF;
  color: #393A3D;
  border: 1px solid #D4D7DC;
  border-radius: 12px;
  font: 400 16px/1.2 'Avenir Next for Intuit', 'Avenir Next', sans-serif;
}

.input:focus {
  outline: none;
  border-color: #0077C5;
  box-shadow: 0 0 0 3px rgba(0, 119, 197, 0.16);
}

.input::placeholder {
  color: #6B6C72;
}
```

#### Labels and Notes
```css
.input-label {
  display: block;
  margin-bottom: 8px;
  color: #393A3D;
  font: 600 14px/1.3 'Avenir Next for Intuit', 'Avenir Next', sans-serif;
}

.input-help {
  margin-top: 8px;
  color: #6B6C72;
  font: 400 12px/1.4 'Avenir Next for Intuit', 'Avenir Next', sans-serif;
}
```

### Cards and Product Expression

#### Product Card
```css
.card {
  background: #FFFFFF;
  border: 1px solid #D4D7DC;
  border-radius: 20px;
  padding: 24px;
}
```

#### Spotlight Product Frame
```css
.product-spotlight {
  position: relative;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 24px;
}

.product-spotlight::before {
  content: '';
  position: absolute;
  inset: auto auto -24px -24px;
  width: 120px;
  height: 120px;
  background: #D7F26E;
  border-radius: 50%;
  z-index: 0;
}
```

---

## 5. Layout Principles

### Grid and Rhythm
Intuit design guidance emphasizes a **4px grid** for typography and spatial alignment.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Fine adjustment |
| `--space-2` | `8px` | Tight internal spacing |
| `--space-3` | `12px` | Dense component spacing |
| `--space-4` | `16px` | Standard spacing |
| `--space-5` | `24px` | Card spacing |
| `--space-6` | `32px` | Section spacing |
| `--space-8` | `48px` | Major grouping |
| `--space-10` | `64px` | Large layout spacing |

### Layout Rules
- Use clear max-widths and comfortable reading measures.
- Keep product callouts and hero storytelling focused on one idea at a time.
- Spotlight product UI intentionally rather than decorating every section.
- Let forms feel guided and manageable, not dense or legalistic.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base | `#F2F5FA` | Page background |
| Card | `#FFFFFF` with border | Primary surface |
| Spotlight | white surface with green or agave highlight | Product hero framing |
| Overlay | white card with stronger shadow | Modals and popups |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 4px 12px rgba(57, 58, 61, 0.08);
}

.shadow-spotlight {
  box-shadow: 0 12px 24px rgba(57, 58, 61, 0.12);
}
```

### Depth Rules
- Use elevation to support product focus, not to create visual drama.
- Product screenshots and popups can carry slightly stronger shadow.
- Keep financial UI clear and lightweight even when layered.

---

## 7. Do's and Don'ts

### Do
- Use blue to guide attention to meaningful actions.
- Keep QuickBooks green special and intentional.
- Preserve accessible contrast and clear labels.
- Fit layouts and typography to the 4px grid.
- Use optimistic visuals without compromising clarity.

### Don't
- Use too many spotlight accents on a single page.
- Turn finance workflows into dark, overly technical dashboards.
- Replace labels with placeholder-only forms.
- Use QuickBooks green as a generic interactive fill everywhere.
- Overload hero areas with multiple competing messages.

---

## 8. Responsive Behavior

### Responsive Rules
- Collapse multi-column feature and pricing layouts early on smaller screens.
- Keep buttons comfortably touchable and centered on action flows.
- Maintain readable input widths and clear label placement.
- Let product UI spotlights scale down gracefully rather than crop awkwardly.
- Preserve the same 4px rhythm on mobile.

### Mobile Character
Intuit mobile experiences should still feel bright, calm, and guided. The design should reassure users that complex financial tasks remain manageable on smaller screens.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: supportive, optimistic, financially trustworthy
- **Primary action color**: Intuit blue `#0077C5`
- **Protected brand color**: QuickBooks green `#2CA01C`
- **Typography**: Avenir Next for Intuit
- **Layout**: 4px grid, clear max widths, guided task flow
- **Components**: pill buttons, rounded cards, spotlight product framing

### Prompt Snippet

```text
Design this interface in the style of Intuit and public QuickBooks design guidance. Use Avenir Next for Intuit, a 4px grid, blue (#0077C5) for primary interaction, carefully limited QuickBooks green (#2CA01C) for brand emphasis, and bright, reassuring financial-software surfaces. The result should feel clear, helpful, optimistic, and highly accessible rather than dense or intimidating.
```
