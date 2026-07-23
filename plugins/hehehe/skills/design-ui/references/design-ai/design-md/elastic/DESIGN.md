# Elastic Design System

> Technical platform UI with crisp semantic color and controlled depth. Elastic’s product language pairs Inter, dense but readable layouts, EUI token discipline, and strong semantic blues, teals, and magentas to create interfaces that feel powerful without becoming visually noisy.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Elastic expresses **operator-grade clarity**. The interface is designed for search, observability, and security workflows where users need signal-rich layouts, stable interaction patterns, and reliable semantic color. EUI keeps the tone modern and technical without feeling cold.

### Mood & Feeling
- **Operational confidence**: serious, capable, information-rich
- **Calm precision**: lots of controls, but highly structured
- **Semantic clarity**: color indicates purpose more than brand theater
- **Composable flexibility**: surfaces are meant to be assembled into complex tools
- **Accessible rigor**: components prioritize legibility and predictable interaction

### Design Density
**Medium-high density** with tight discipline. Elastic surfaces frequently contain forms, panels, filters, and data views, but the system stays readable through spacing tokens, consistent borders, and restrained corner radii.

### Visual Character
- Primary blue used for actions and navigation emphasis
- Accent magenta and teal used selectively for attention and secondary categorization
- Panels, borders, and subtle shadows define hierarchy
- Rounded corners are minimal and pragmatic
- Product typography is modern and neutral, tuned for extended use
- Data and form-heavy layouts remain visually stable

---

## 2. Color Palette & Roles

### Brand and Semantic Colors

| Token | Hex | Role |
|-------|-----|------|
| `--elastic-primary` | `#0B64DD` | Primary buttons, links, selected states |
| `--elastic-accent` | `#BC1E70` | High-attention accent, badges, notifications |
| `--elastic-accent-secondary` | `#008B87` | Secondary emphasis, alternative highlight |
| `--elastic-success` | `#008A5E` | Success messages and positive actions |
| `--elastic-warning` | `#FACB3D` | Warning states |
| `--elastic-danger` | `#C61E25` | Errors and destructive actions |

### Neutrals and Surfaces

| Token | Hex | Role |
|-------|-----|------|
| `--text-strong` | `#343741` | Primary text |
| `--text-subdued` | `#535966` | Body copy, secondary text |
| `--text-muted` | `#69707D` | Metadata, placeholders |
| `--surface-base` | `#FFFFFF` | Main panel background |
| `--surface-subdued` | `#F8FAFD` | Secondary sections, low-emphasis backgrounds |
| `--surface-tinted` | `#ECF1F9` | Disabled or subdued controls |
| `--border-subdued` | `#E3E8F2` | Default border |
| `--border-plain` | `#CAD3E2` | Stronger border, form border |

### Supportive Semantic Borders

| Token | Hex | Role |
|-------|-----|------|
| `--border-primary` | `#BFDBFF` | Blue-tinted callout borders |
| `--border-accent` | `#FFC7DB` | Magenta accent borders |
| `--border-success` | `#AEE8D2` | Success callouts |
| `--border-warning` | `#FCD883` | Warning callouts |
| `--border-danger` | `#FFC9C2` | Danger callouts |

### Color Usage Rules
- Use primary blue for default calls to action and active state.
- Use magenta and teal sparingly to prevent signal overload.
- Lean on neutral surfaces and semantic callout colors for complex workflows.
- Color should clarify meaning, never replace labels or icons.

---

## 3. Typography Rules

### Font Stack

```css
/* Primary UI font */
--font-sans: 'Inter', BlinkMacSystemFont, Helvetica, Arial, sans-serif;

/* Monospace */
--font-mono: 'Roboto Mono', Menlo, Courier, monospace;

/* Serif accent */
--font-serif: Georgia, 'Times New Roman', serif;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 48px | 700 | 1.1 | -0.025em | Homepage hero and large product statements |
| Page Title | 32px | 700 | 1.15 | -0.02em | Primary page heading |
| Section Title | 24px | 600 | 1.2 | -0.015em | Panel and page section heading |
| Card Title | 20px | 600 | 1.25 | -0.01em | Panel header |
| Body Large | 18px | 400 | 1.5 | 0 | Long-form intro copy |
| Body | 16px | 400 | 1.5 | 0 | Standard body and UI text |
| Small Body | 14px | 400 | 1.45 | 0 | Labels, dense data surfaces |
| Caption | 12px | 500 | 1.35 | 0.01em | Metadata, utility copy |
| Code | 13px | 400 | 1.5 | 0 | Logs, queries, identifiers |

### Typography Philosophy
Elastic typography is **quietly technical**. It should support long sessions, dense tables, configuration screens, and data-heavy content without fatigue. The system reads cleanly, with little stylistic flourish.

### Practical Rules
- Use consistent heading jumps; avoid improvised sizes.
- Prefer 14px and 16px text for dense operational interfaces.
- Use monospace for values, logs, paths, code, and metrics.
- Keep text color hierarchy strong so dense surfaces stay scannable.

---

## 4. Component Stylings

### Buttons

#### Primary Filled Button
```css
.button-primary {
  background: #0B64DD;
  color: #ffffff;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  font: 500 14px/1 'Inter', sans-serif;
  transition: background 140ms ease, box-shadow 140ms ease;
}

.button-primary:hover {
  background: #1750BA;
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(11, 100, 221, 0.2);
}
```

#### Secondary Button
```css
.button-secondary {
  background: #ffffff;
  color: #343741;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #CAD3E2;
  border-radius: 4px;
  font-weight: 500;
}

.button-secondary:hover {
  background: #F8FAFD;
}
```

#### Tertiary / Empty Button
```css
.button-empty {
  background: transparent;
  color: #0B64DD;
  min-height: 32px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
}

.button-empty:hover {
  background: rgba(11, 100, 221, 0.08);
}
```

#### Semantic Buttons
```css
.button-danger {
  background: #C61E25;
  color: #ffffff;
}

.button-success {
  background: #008A5E;
  color: #ffffff;
}
```

### Inputs

#### Text Field
```css
.input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  background: #ffffff;
  color: #343741;
  border: 1px solid #CAD3E2;
  border-radius: 4px;
  font: 400 14px/1.2 'Inter', sans-serif;
}

.input:hover {
  border-color: #A9B8D1;
}

.input:focus {
  outline: none;
  border-color: #0B64DD;
  box-shadow: 0 0 0 2px rgba(11, 100, 221, 0.16);
}

.input::placeholder {
  color: #69707D;
}
```

#### Form Row Helpers
```css
.input-label {
  display: block;
  margin-bottom: 8px;
  color: #343741;
  font: 500 14px/1.3 'Inter', sans-serif;
}

.input-help {
  margin-top: 8px;
  color: #535966;
  font: 400 12px/1.4 'Inter', sans-serif;
}

.input-error {
  border-color: #C61E25;
}
```

### Panels and Cards

#### Default Panel
```css
.panel {
  background: #ffffff;
  border: 1px solid #E3E8F2;
  border-radius: 4px;
  padding: 16px;
}
```

#### Elevated Panel
```css
.panel-elevated {
  background: #ffffff;
  border: 1px solid #E3E8F2;
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 0 2px 0 rgba(52, 55, 65, 0.16),
              0 3px 10px 0 rgba(52, 55, 65, 0.10),
              0 6px 14px 0 rgba(52, 55, 65, 0.06);
}
```

#### Callout Panel
```css
.callout {
  background: #F8FAFD;
  border: 1px solid #BFDBFF;
  border-left: 4px solid #0B64DD;
  border-radius: 4px;
  padding: 16px;
}
```

### Status Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font: 500 12px/1 'Inter', sans-serif;
}

.badge-primary {
  background: #E8F1FF;
  color: #0B64DD;
}

.badge-success {
  background: #E6F7EF;
  color: #008A5E;
}

.badge-danger {
  background: #FDEAE8;
  color: #C61E25;
}
```

---

## 5. Layout Principles

### Breakpoint System

| Breakpoint | Starts At | Use |
|------------|-----------|-----|
| `xs` | `0px` | Small mobile |
| `s` | `575px` | Large mobile / small tablet |
| `m` | `768px` | Tablet and compact desktop |
| `l` | `992px` | Standard desktop |
| `xl` | `1200px` | Large desktop |

### Sizing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--size-xxs` | `2px` | Fine alignment |
| `--size-xs` | `4px` | Compact internal gaps |
| `--size-s` | `8px` | Tight spacing |
| `--size-m` | `12px` | Compact content padding |
| `--size-base` | `16px` | Core layout spacing |
| `--size-l` | `24px` | Panel spacing |
| `--size-xl` | `32px` | Section separation |
| `--size-xxl` | `40px` | Large section spacing |
| `--size-xxxl` | `48px` | Page separation |
| `--size-xxxxl` | `64px` | Hero / major spacing |

### Layout Rules
- Build interfaces from panels, flex groups, and predictable spacing tokens.
- Keep dense form layouts aligned in rows only when the relationship is obvious.
- Use subdued backgrounds to cluster related controls.
- Favor composable horizontal and vertical stacks over decorative layout tricks.

---

## 6. Depth & Elevation

### Borders and Radius

| Token | Value | Use |
|-------|-------|-----|
| `border.thin` | `1px solid #E3E8F2` | Default panel and card border |
| `border.thick` | `2px solid #E3E8F2` | Stronger delineation |
| `radius.small` | `4px` | Controls |
| `radius.medium` | `4px` | Panels and cards |

### Shadow System

```css
.shadow-xs {
  box-shadow: 0 0 2px 0 rgba(52, 55, 65, 0.16),
              0 1px 4px 0 rgba(52, 55, 65, 0.06),
              0 2px 8px 0 rgba(52, 55, 65, 0.04);
}

.shadow-m {
  box-shadow: 0 0 2px 0 rgba(52, 55, 65, 0.16),
              0 3px 10px 0 rgba(52, 55, 65, 0.10),
              0 6px 14px 0 rgba(52, 55, 65, 0.06);
}
```

### Surface Hierarchy
- **Base**: white page and panel surfaces
- **Subdued**: `#F8FAFD` for grouped secondary content
- **Tinted**: `#ECF1F9` for inactive or disabled surfaces
- **Semantic**: light blue/green/yellow/red tinted callouts with meaningful borders

### Depth Rules
- Favor borders before shadows.
- Use shadow sparingly and mostly for elevated panels, overlays, and flyouts.
- Avoid large soft glows; Elastic depth should feel functional, not atmospheric.

---

## 7. Do's and Don'ts

### Do
- Use semantic color with labels and icons for clarity.
- Build complex pages from modular panels and tokenized spacing.
- Keep controls compact, aligned, and consistent.
- Use Inter and Roboto Mono to preserve a technical but readable tone.
- Let borders and subdued fills organize dense workflows.

### Don't
- Use multiple filled button colors side by side without strong semantic need.
- Over-round controls or introduce consumer-app softness.
- Replace semantic status patterns with arbitrary custom colors.
- Use heavy shadows everywhere.
- Let dense UIs drift into inconsistent spacing.

---

## 8. Responsive Behavior

### Responsive Rules
- Stack split panels below the `m` and `s` ranges unless side-by-side comparison is essential.
- Keep form rows single-column on smaller screens when labels or help text would wrap awkwardly.
- Preserve 40px control height as the default; use 32px only for dense toolbars.
- Convert wide tables into horizontally scrollable containers or alternate data views at small widths.
- Maintain readable spacing even in compact operational layouts.

### Touch and Accessibility
- Ensure semantic meaning is never conveyed by color alone.
- Keep interactive targets at least `40px` high in touch-heavy contexts.
- Preserve clear focus states on every control.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: technical, semantic, operator-grade, precise
- **Primary color**: Elastic primary blue `#0B64DD`
- **Accent colors**: magenta `#BC1E70`, teal `#008B87`
- **Typography**: Inter + Roboto Mono
- **Shape language**: low-radius, compact, panel-based
- **Layout**: modular panels, flex rows, tokenized spacing
- **Components**: filled primary buttons, bordered secondary buttons, structured form rows, callout panels

### Prompt Snippet

```text
Design this interface in the style of Elastic's current website and EUI framework. Use Inter for UI text and Roboto Mono for technical values, a neutral white-and-blue operational palette with primary blue (#0B64DD), compact 4px radii, token-based spacing, and panel-driven layouts. The interface should feel powerful, semantic, and highly structured, with borders and subdued surfaces doing most of the organizational work.
```
