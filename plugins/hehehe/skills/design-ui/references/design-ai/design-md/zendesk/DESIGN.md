# Zendesk Design System

> Support-centric product design with restrained enterprise clarity. Garden’s neutral grays, kale depth, blue interaction states, and semantic color model create interfaces that feel calm, actionable, and highly structured without becoming sterile.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Zendesk’s Garden system is built around **purposeful support software**. It emphasizes composure, semantic consistency, and accessibility so agents and admins can navigate dense workflows without visual fatigue. The design is understated, but it is not dull; it has character through color hierarchy, depth logic, and a clean typographic scale.

### Mood & Feeling
- **Calm**: support tools should reduce urgency even when users are handling urgent work
- **Structured**: interfaces communicate hierarchy clearly through surface levels and color meaning
- **Professional**: polished and productized rather than consumer-casual
- **Accessible**: interaction, validation, and state changes are highly legible
- **Purposeful**: color and depth exist to communicate function, not decoration

### Design Density
**Medium to medium-high density**. Zendesk surfaces often contain forms, tables, and multi-step workflows, but Garden keeps them readable with semantic states, balanced spacing, and predictable hierarchy.

### Visual Character
- Blue is reserved for actions, links, and selection
- Neutral grays carry most UI structure
- Kale-toned depth adds a subtle Zendesk character to elevated surfaces
- Surfaces communicate elevation through background, border, and shadow together
- Forms and buttons are compact, refined, and highly repeatable

---

## 2. Color Palette & Roles

### Garden Primary Palette

| Token | Hex | Role |
|-------|-----|------|
| `--grey-100` | `#f8f9f9` | Lightest app background |
| `--grey-200` | `#e8eaec` | Subtle background and dividers |
| `--grey-300` | `#d8dcde` | Borders, inactive controls |
| `--grey-500` | `#919ca5` | Secondary copy |
| `--grey-700` | `#5c6970` | Body text, strong secondary text |
| `--grey-800` | `#39434b` | Strong foregrounds |
| `--grey-900` | `#293239` | Primary text |
| `--grey-1200` | `#0a0d0e` | Maximum emphasis |

### Brand-Tinted Neutrals

| Token | Hex | Role |
|-------|-----|------|
| `--kale-100` | `#ecf9f9` | Light tinted surface |
| `--kale-300` | `#cbe2e1` | Soft accent background |
| `--kale-600` | `#4a9999` | Mid-tone brand accent |
| `--kale-700` | `#40787a` | Strong accent / secondary emphasis |
| `--kale-800` | `#16494f` | Dark raised surface accent |
| `--kale-900` | `#063940` | Deep brand surface |

### Interactive and Semantic Colors

| Token | Hex | Role |
|-------|-----|------|
| `--blue-600` | `#2694d6` | Primary interactive fill |
| `--blue-700` | `#1f73b7` | Accessible action / link color |
| `--blue-800` | `#13456d` | Hover / active emphasis |
| `--green-700` | `#037f52` | Success state |
| `--red-700` | `#cd3642` | Danger / destructive state |
| `--yellow-700` | `#ac5918` | Warning / caution state |

### Product Suite Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--support` | `#00a656` | Product-specific brand cue |
| `--explore` | `#30aabc` | Product-specific brand cue |
| `--guide` | `#eb4962` | Product-specific brand cue |
| `--chat` | `#f79a3e` | Product-specific brand cue |
| `--talk` | `#efc93d` | Product-specific brand cue |

### Color Usage Rules
- Use blue for interactive elements and selection.
- Use neutrals for the default interface skeleton.
- Use success, warning, and danger only for real semantic meaning.
- Match elevation with surface color and shadow, not shadow alone.

---

## 3. Typography Rules

### Font Stack

```css
/* Zendesk Garden UI */
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Helvetica, Arial, sans-serif;
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| XXXL | 36px | 700 | 1.15 | -0.02em | Page-leading statements |
| XXL | 28px | 700 | 1.2 | -0.01em | Major section title |
| XL | 22px | 600 | 1.25 | -0.01em | Panel title |
| LG | 18px | 600 | 1.35 | 0 | Section heading |
| MD | 16px | 400 | 1.55 | 0 | Standard body text |
| SM | 14px | 400 | 1.5 | 0 | Dense UI body |
| XS | 12px | 500 | 1.4 | 0.01em | Metadata, labels |
| Mono | 13px | 400 | 1.5 | 0 | Codes, IDs, values |

### Typography Philosophy
Garden typography is **quietly functional**. It avoids flamboyant display moments in favor of durable hierarchy that works across dashboards, forms, and service tooling.

### Practical Rules
- Use no more than one major visual emphasis per screen.
- Keep labels clear and literal.
- Use monospace sparingly for data-like content only.
- Preserve readability in compact spaces by relying on size and weight, not decoration.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #1f73b7;
  color: #ffffff;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: 600 14px/1 system-ui, sans-serif;
}

.button-primary:hover {
  background: #13456d;
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(31, 115, 183, 0.18);
}
```

#### Default Button
```css
.button-default {
  background: #ffffff;
  color: #293239;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #d8dcde;
  border-radius: 6px;
  font-weight: 600;
}

.button-default:hover {
  background: #f8f9f9;
}
```

#### Basic Button
```css
.button-basic {
  background: transparent;
  color: #1f73b7;
  min-height: 32px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
}

.button-basic:hover {
  background: rgba(31, 115, 183, 0.08);
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
  color: #293239;
  border: 1px solid #d8dcde;
  border-radius: 6px;
  font: 400 14px/1.2 system-ui, sans-serif;
}

.input:focus {
  outline: none;
  border-color: #1f73b7;
  box-shadow: 0 0 0 3px rgba(31, 115, 183, 0.16);
}

.input::placeholder {
  color: #919ca5;
}
```

#### Input States
```css
.input-success {
  border-color: #037f52;
}

.input-warning {
  border-color: #ac5918;
}

.input-error {
  border-color: #cd3642;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: #293239;
  font: 600 14px/1.3 system-ui, sans-serif;
}
```

### Cards and Surfaces

#### Default Surface
```css
.card {
  background: #ffffff;
  border: 1px solid #e8eaec;
  border-radius: 8px;
  padding: 16px;
}
```

#### Raised Surface
```css
.card-raised {
  background: #ffffff;
  border: 1px solid #d8dcde;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(10, 13, 14, 0.08);
}
```

#### Subtle Alert
```css
.alert-subtle {
  background: #ecf9f9;
  border: 1px solid #cbe2e1;
  border-left: 4px solid #4a9999;
  border-radius: 8px;
  padding: 16px;
}
```

---

## 5. Layout Principles

### Grid
Garden’s grid is modeled on a **12-column Bootstrap-style system** with configurable gutter widths.

| Token | Value | Use |
|-------|-------|-----|
| `columns` | `12` | Standard page layout |
| `gutters-xs` | `4px` | Tight layout |
| `gutters-sm` | `8px` | Compact panels |
| `gutters-md` | `16px` | Default gutter |
| `gutters-lg` | `24px` | Spacious sections |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Fine alignment |
| `--space-2` | `8px` | Tight gaps |
| `--space-3` | `12px` | Dense component padding |
| `--space-4` | `16px` | Default component spacing |
| `--space-5` | `20px` | Mid-density grouping |
| `--space-6` | `24px` | Section padding |
| `--space-8` | `32px` | Major grouping |
| `--space-10` | `40px` | Page-level spacing |

### Layout Rules
- Use spacing and surface levels to distinguish tasks and context.
- Keep actions close to the content they affect.
- Let primary actions stand out through color, not size inflation.
- Prefer predictable grid alignment over expressive asymmetry.

---

## 6. Depth & Elevation

### Surface Levels
Garden explicitly uses color, border, backdrop, and shadow to express elevation.

| Level | Treatment | Use |
|-------|-----------|-----|
| Recessed | tinted or lower background | Wells, embedded surfaces |
| Default | neutral base surface | Main page background |
| Subtle | emphasized on-page surface | Alerts, grouped content |
| Raised | floating with shadow | Menus, dialogs, notifications |

### Shadow System

```css
.shadow-small {
  box-shadow: 0 2px 8px rgba(10, 13, 14, 0.08);
}

.shadow-medium {
  box-shadow: 0 8px 20px rgba(10, 13, 14, 0.12);
}

.shadow-large {
  box-shadow: 0 16px 40px rgba(10, 13, 14, 0.18);
}
```

### Depth Rules
- Match shadow strength to semantic elevation level.
- Raised surfaces should never appear ambiguous against the base.
- Avoid decorative shadows on elements that are not conceptually elevated.

---

## 7. Do's and Don'ts

### Do
- Use blue for interaction and selection.
- Keep semantic hues aligned to their expected meanings.
- Use elevation tokens consistently across alerts, menus, modals, and panels.
- Maintain compact but readable spacing in dense screens.
- Treat content clarity as more important than visual flourish.

### Don't
- Use semantic colors as decoration.
- Overemphasize too many actions on the same surface.
- Mix elevation cues inconsistently.
- Push support workflows into consumer-style playful UI.
- Remove clear labels in favor of placeholder-only forms.

---

## 8. Responsive Behavior

### Responsive Rules
- Keep the 12-column logic, but collapse into stacked content early on smaller screens.
- Preserve button clarity by limiting the number of primary CTAs in a row.
- Use compact inputs only when density genuinely improves task flow.
- Maintain accessible focus and validation states across touch layouts.
- Let tables and dense controls reformat rather than shrink to illegibility.

### Mobile Character
Zendesk on mobile should still feel composed and operational. The layout may simplify, but the semantic clarity and calm visual tone should remain intact.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: calm, structured, support-focused, accessible
- **Primary interaction color**: blue `#1f73b7`
- **Base structure**: neutral grays with kale-tinted depth
- **Typography**: system sans + monospace for data
- **Layout**: 12-column grid, predictable spacing, semantic surfaces
- **Components**: compact buttons, clear form fields, elevation-aware cards

### Prompt Snippet

```text
Design this interface in the style of Zendesk Garden. Use neutral gray surfaces, blue (#1f73b7) for interaction, restrained kale-tinted depth, compact enterprise controls, and clearly semantic validation colors. The UI should feel calm, structured, accessible, and optimized for support workflows rather than expressive marketing theatrics.
```
