# SAP Design System

> Enterprise application design with calm clarity and rigorous structure. SAP Fiori combines the proprietary 72 typeface, Horizon theme colors, a responsive 12-column grid, and intent-driven controls to create interfaces that feel trustworthy, humane, and highly operational.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
SAP’s Fiori design language expresses **enterprise complexity made usable**. It is structured, consistent, and deliberately quiet. The interface should help people complete business tasks efficiently rather than impress them with visual novelty.

### Mood & Feeling
- **Trustworthy**: serious enough for finance, operations, and procurement
- **Humane**: clean spacing and friendly typography soften dense workflows
- **Systematic**: patterns should repeat predictably across applications
- **Accessible**: contrast, hierarchy, and focus treatment are explicit priorities
- **Task-oriented**: every visual choice should clarify what users can do next

### Design Density
**Medium to medium-high density**. SAP apps often hold lots of information, but Fiori keeps them readable through strong page structure, consistent controls, and clear floorplans.

### Visual Character
- Blue-led interactive system with restrained semantic colors
- Soft enterprise grays and cool neutrals for structural surfaces
- Highly repeatable buttons, toolbars, tables, and forms
- Clear distinction between app shell, page header, content, and footer toolbar
- Minimal ornamental styling

---

## 2. Color Palette & Roles

### Horizon / Core Interactive Colors

| Token | Hex | Role |
|-------|-----|------|
| `--sap-primary` | `#0070f2` | Primary action, active control, selected state |
| `--sap-primary-hover` | `#0057d2` | Hover / active state |
| `--sap-primary-soft` | `#ebf5ff` | Selected row or subtle highlighted surface |
| `--sap-link` | `#0064d9` | Link styling |

### Neutral Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--shell-bg` | `#354a5f` | Launchpad shell / global frame |
| `--text-strong` | `#223548` | Primary text |
| `--text-default` | `#475e75` | Body text |
| `--text-muted` | `#8396a8` | Secondary text |
| `--surface-page` | `#f5f6f7` | App background |
| `--surface-card` | `#ffffff` | Card and content surface |
| `--border-default` | `#d9d9d9` | Standard border |
| `--border-soft` | `#eaecee` | Light divider |

### Semantic Colors

| Token | Hex | Role |
|-------|-----|------|
| `--success` | `#188918` | Positive outcome / accepted action |
| `--warning` | `#e9730c` | Warning / attention |
| `--danger` | `#bb0000` | Error / destructive |
| `--information` | `#0070f2` | Info and inline help |

### Color Usage Rules
- Use blue to indicate interaction priority.
- Keep semantic colors attached to actual meaning, not decoration.
- Let grays and whites carry most structure.
- Shell areas can be darker; content areas should stay lighter and readable.

---

## 3. Typography Rules

### Font Stack

```css
/* SAP Fiori */
--font-sans: '72', 'Helvetica Neue', Arial, sans-serif;
--font-mono: '72 Mono', 'SF Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Shell Title | 28px | 700 | 1.2 | -0.01em | App-level title |
| Section Title | 20px | 700 | 1.25 | -0.005em | Page section heading |
| Card Title | 18px | 600 | 1.3 | 0 | Card / form title |
| Body | 16px | 400 | 1.5 | 0 | Standard UI text |
| Small Body | 14px | 400 | 1.45 | 0 | Dense app text |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons, field labels |
| Caption | 12px | 500 | 1.4 | 0.01em | Helper and metadata |
| Code | 13px | 400 | 1.45 | 0 | Technical values |

### Typography Philosophy
The `72` typeface is designed to feel **credible, modern, and humane** in enterprise contexts. It should support dense applications without visual fatigue.

### Practical Rules
- Prefer sentence case.
- Keep labels short and explicit.
- Use typography to reduce truncation and scanning effort.
- Avoid dramatic display styles outside marketing-adjacent shells.

---

## 4. Component Stylings

### Buttons

#### Emphasized Button
```css
.button-primary {
  background: #0070f2;
  color: #ffffff;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #0070f2;
  border-radius: 8px;
  font: 600 14px/1 '72', sans-serif;
}

.button-primary:hover {
  background: #0057d2;
  border-color: #0057d2;
}
```

#### Transparent / Secondary Button
```css
.button-secondary {
  background: transparent;
  color: #223548;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}

.button-secondary:hover {
  background: #f5f6f7;
}
```

#### Semantic Buttons
```css
.button-accept {
  background: #188918;
  color: #ffffff;
}

.button-reject {
  background: #bb0000;
  color: #ffffff;
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  background: #ffffff;
  color: #223548;
  border: 1px solid #89919a;
  border-radius: 8px;
  font: 400 14px/1.2 '72', sans-serif;
}

.input:focus {
  outline: none;
  border-color: #0070f2;
  box-shadow: 0 0 0 2px rgba(0, 112, 242, 0.16);
}
```

### Cards and Page Surfaces

#### Card
```css
.card {
  background: #ffffff;
  border: 1px solid #eaecee;
  border-radius: 12px;
  padding: 16px;
}
```

#### Dynamic Page Header
```css
.page-header {
  background: #ffffff;
  border-bottom: 1px solid #eaecee;
  padding: 16px 24px;
}
```

---

## 5. Layout Principles

### Grid and Floorplans
Fiori uses a **12-column responsive grid** with a **1rem / 16px base unit** and page patterns like Dynamic Page and Flexible Column Layout.

| Token | Value | Usage |
|-------|-------|-------|
| `base-unit` | `16px` | Core sizing system |
| `touch-area` | `3rem` | Comfortable touch area |
| `columns` | `12` | Responsive layout grid |
| `layout` | `Dynamic Page` | Primary app page pattern |
| `layout-alt` | `Flexible Column Layout` | List-detail / multicolumn pattern |

### Spacing Rules
- Use `16px` as the root spacing increment.
- Preserve clear separation between header, content, and footer actions.
- Keep app content aligned to the grid, especially in forms and tables.
- Prefer floorplan consistency over bespoke page layouts.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Shell | darker structural chrome | Global navigation |
| Page | light neutral background | Main content field |
| Card | white with soft border | Grouped content |
| Overlay | white + stronger shadow | Dialogs, menus, popovers |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 2px 6px rgba(34, 53, 72, 0.08);
}

.shadow-overlay {
  box-shadow: 0 12px 24px rgba(34, 53, 72, 0.18);
}
```

### Depth Rules
- Use borders and layout first, shadow second.
- Overlays should be unmistakably elevated.
- Cards should stay subtle and lightweight.

---

## 7. Do's and Don'ts

### Do
- Use standard Fiori floorplans and button roles.
- Keep page hierarchy explicit.
- Use semantic colors with discipline.
- Let `72` carry the tone.
- Favor predictable enterprise clarity over originality.

### Don't
- Invent one-off interactive patterns when Fiori already covers the use case.
- Overuse saturated color.
- Use semantic button styles decoratively.
- Cramp dense workflows into visually flat screens.
- Blur header, content, and footer action zones.

---

## 8. Responsive Behavior

### Responsive Rules
- Keep the 12-column grid fluid across screen sizes.
- Allow button text to truncate only when the parent layout truly requires it.
- Use compact density for mouse/keyboard-heavy contexts and cozy density for touch.
- Collapse multicolumn flows cleanly on smaller screens.
- Preserve the `3rem` touch comfort zone where touch input matters.

### Mobile Character
SAP mobile layouts should remain highly functional and readable. Simplification is fine, but floorplan clarity and action hierarchy must survive intact.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: humane enterprise, structured, trustworthy
- **Core type**: `72`
- **Primary color**: SAP blue `#0070f2`
- **Layout**: Dynamic Page / Flexible Column Layout
- **Components**: emphasized and transparent buttons, disciplined forms, light cards

### Prompt Snippet

```text
Design this interface in the style of SAP Fiori with the Horizon theme. Use the 72 typeface, a 12-column responsive grid, light enterprise surfaces, SAP blue (#0070f2) for primary interaction, and clear Dynamic Page structure. The result should feel trustworthy, humane, and highly task-oriented rather than decorative.
```
