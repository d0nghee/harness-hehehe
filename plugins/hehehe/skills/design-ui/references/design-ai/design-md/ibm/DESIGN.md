# IBM Design System

> Enterprise technology brand with engineered clarity. Neutral gray layers, IBM Blue 60 (#0f62fe), IBM Plex typography, and a rigorously structured 2x grid create a system that feels precise, scalable, and deeply product-oriented.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
IBM expresses **systems thinking made visible**. The visual language feels engineered rather than decorated: modular grids, disciplined spacing, strong alignment, and a restrained palette dominated by grays and electric blue. It is confident, utilitarian, and unmistakably enterprise.

### Mood & Feeling
- **Rational confidence**: serious, dependable, intentional
- **Technical optimism**: advanced but not flashy
- **Structured clarity**: hierarchy is obvious and decisions feel systematic
- **Industrial polish**: product UI and brand communications share the same logic
- **Quiet authority**: visual restraint signals maturity and trust

### Design Density
**Medium density** with tight control over rhythm. IBM pages are not sparse, but they never feel cluttered because spacing, alignment, and type scale are highly regular.

### Visual Character
- Blue used as a purposeful action and emphasis color, not a wash
- Neutrals do most of the layout and organizational work
- Sharp rectangular geometry with minimal rounding
- Strong preference for layers, dividers, and field backgrounds over decorative shadows
- Product surfaces feel modular, almost dashboard-like
- Grid logic remains visible in both marketing and application contexts

---

## 2. Color Palette & Roles

### Core Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--ibm-blue-60` | `#0f62fe` | Primary CTA, links, focus actions |
| `--ibm-blue-70` | `#0043ce` | Hover state for primary actions |
| `--ibm-blue-80` | `#002d9c` | Active state, stronger emphasis |
| `--ibm-blue-20` | `#d0e2ff` | Subtle highlight backgrounds |
| `--ibm-blue-10` | `#edf5ff` | Tint fills, low-emphasis surfaces |

### Neutral Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--gray-100` | `#161616` | Headings, max-emphasis text |
| `--gray-90` | `#262626` | Dense dark surfaces |
| `--gray-80` | `#393939` | Secondary dark surfaces |
| `--gray-70` | `#525252` | Strong secondary text |
| `--gray-60` | `#6f6f6f` | Body text |
| `--gray-50` | `#8d8d8d` | Tertiary text, placeholders |
| `--gray-30` | `#c6c6c6` | Borders, dividers |
| `--gray-20` | `#e0e0e0` | Hairlines, low-contrast separators |
| `--gray-10` | `#f4f4f4` | App background, field fill |
| `--white` | `#ffffff` | Elevated content surfaces |

### Cool Gray Support

| Token | Hex | Role |
|-------|-----|------|
| `--cool-gray-100` | `#121619` | High-contrast dark theme base |
| `--cool-gray-90` | `#21272a` | Dark section backgrounds |
| `--cool-gray-60` | `#697077` | Muted labels, metadata |
| `--cool-gray-30` | `#c1c7cd` | Subtle borders on cooler surfaces |
| `--cool-gray-10` | `#f2f4f8` | Alternate app background |

### Semantic Colors

| Token | Hex | Role |
|-------|-----|------|
| `--support-error` | `#da1e28` | Errors, destructive actions |
| `--support-success` | `#24a148` | Success states |
| `--support-warning` | `#f1c21b` | Caution, pending status |
| `--support-info` | `#4589ff` | Info accents, supportive callouts |
| `--support-purple` | `#8a3ffc` | AI, advanced tooling, premium data moments |

### Color Usage Rules
- Let grays dominate the canvas; blue should punctuate, not flood.
- Prefer `--gray-10` or `--cool-gray-10` for section backgrounds over pure white everywhere.
- Use semantic colors sparingly and functionally.
- Keep dark mode grounded in cool grays rather than pure black unless you need maximum contrast.

---

## 3. Typography Rules

### Font Stack

```css
/* Primary */
--font-sans: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;

/* Monospace */
--font-mono: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;

/* Editorial / long-form accent */
--font-serif: 'IBM Plex Serif', Georgia, serif;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Display 01 | 64px | 300 | 1.1 | -0.02em | Large hero statements |
| Display 02 | 48px | 300 | 1.15 | -0.015em | Landing page hero |
| Heading 01 | 32px | 400 | 1.2 | -0.01em | Section headlines |
| Heading 02 | 24px | 400 | 1.25 | -0.01em | Feature titles |
| Heading 03 | 20px | 400 | 1.3 | -0.005em | Card / panel headings |
| Body 01 | 16px | 400 | 1.5 | 0 | Standard body copy |
| Body 02 | 14px | 400 | 1.45 | 0 | Dense UI body text |
| Label 01 | 14px | 400 | 1.3 | 0 | Form labels, buttons |
| Label 02 | 12px | 400 | 1.3 | 0.01em | Metadata, overlines |
| Code 01 | 14px | 400 | 1.5 | 0 | Inline code / terminal |

### Typography Philosophy
IBM typography is **humanist precision**. IBM Plex softens the austerity of enterprise software without compromising clarity. Large headlines feel calm and measured rather than aggressive; UI labels stay plainspoken and functional.

### Practical Rules
- Use sentence case, not all caps, for most labels and buttons.
- Keep weights conservative; IBM rarely needs heavy bold text.
- Use `IBM Plex Mono` for code, metrics, and technical identifiers.
- Use expressive display sizes sparingly and pair them with generous white space.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #0f62fe;
  color: #ffffff;
  min-height: 48px;
  padding: 0 64px 0 16px;
  border: none;
  border-radius: 0;
  font: 400 14px/1.2 'IBM Plex Sans', sans-serif;
  transition: background 150ms ease;
}

.button-primary:hover {
  background: #0043ce;
}

.button-primary:active {
  background: #002d9c;
}

.button-primary:focus-visible {
  outline: 2px solid #161616;
  outline-offset: 2px;
}
```

#### Secondary Button
```css
.button-secondary {
  background: #393939;
  color: #ffffff;
  min-height: 48px;
  padding: 0 64px 0 16px;
  border: none;
  border-radius: 0;
}

.button-secondary:hover {
  background: #4c4c4c;
}
```

#### Tertiary Button
```css
.button-tertiary {
  background: transparent;
  color: #0f62fe;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid #0f62fe;
  border-radius: 0;
}

.button-tertiary:hover {
  background: #0f62fe;
  color: #ffffff;
}
```

#### Ghost Button
```css
.button-ghost {
  background: transparent;
  color: #0f62fe;
  min-height: 48px;
  padding: 0 16px;
  border: none;
}

.button-ghost:hover {
  background: #edf5ff;
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  min-height: 40px;
  padding: 0 16px;
  background: #f4f4f4;
  color: #161616;
  border: none;
  border-bottom: 1px solid #8d8d8d;
  border-radius: 0;
  font: 400 14px/1.2 'IBM Plex Sans', sans-serif;
}

.input:focus {
  outline: 2px solid #0f62fe;
  outline-offset: -2px;
  border-bottom-color: #0f62fe;
}

.input::placeholder {
  color: #6f6f6f;
}

.input:disabled {
  color: #8d8d8d;
  border-bottom-color: #c6c6c6;
}
```

#### Input Label and Helper
```css
.input-label {
  display: block;
  margin-bottom: 8px;
  color: #161616;
  font: 400 14px/1.3 'IBM Plex Sans', sans-serif;
}

.input-helper {
  margin-top: 8px;
  color: #6f6f6f;
  font: 400 12px/1.4 'IBM Plex Sans', sans-serif;
}

.input-error {
  border-bottom-color: #da1e28;
  outline-color: #da1e28;
}
```

### Tiles and Cards

#### Standard Tile
```css
.tile {
  min-height: 64px;
  padding: 16px;
  background: #ffffff;
  color: #161616;
  border: 1px solid #e0e0e0;
  border-radius: 0;
}
```

#### Interactive Tile
```css
.tile-interactive {
  background: #ffffff;
  border: 1px solid #c6c6c6;
  transition: border-color 150ms ease, background 150ms ease;
}

.tile-interactive:hover {
  background: #f4f4f4;
  border-color: #8d8d8d;
}
```

#### Data Card
```css
.card-metric {
  background: #ffffff;
  border-left: 4px solid #0f62fe;
  padding: 24px;
}

.card-metric-value {
  color: #161616;
  font: 300 48px/1 'IBM Plex Sans', sans-serif;
}

.card-metric-label {
  color: #6f6f6f;
  font: 400 14px/1.4 'IBM Plex Sans', sans-serif;
}
```

### Navigation

#### Product Tabs
```css
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #c6c6c6;
}

.tab {
  padding: 12px 16px;
  color: #525252;
  border-bottom: 2px solid transparent;
  font: 400 14px/1.3 'IBM Plex Sans', sans-serif;
}

.tab:hover {
  color: #161616;
}

.tab.is-active {
  color: #161616;
  border-bottom-color: #0f62fe;
}
```

---

## 5. Layout Principles

### Grid System
IBM’s layout logic is built on the **2x Grid**: divide space into powers of two and keep placement aligned to repeatable geometry.

| Breakpoint | Width | Columns | Margin | Gutter |
|------------|-------|---------|--------|--------|
| Small | `320px+` | 4 | `0px` | `32px` |
| Medium | `672px+` | 8 | `16px` | `32px` |
| Large | `1056px+` | 16 | `16px` | `32px` |
| X-Large | `1312px+` | 16 | `16px` | `32px` |
| Max | `1584px+` | 16 | `24px` | `32px` |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-01` | `2px` | Fine alignment |
| `--space-02` | `4px` | Tight micro-spacing |
| `--space-03` | `8px` | Label + helper spacing |
| `--space-05` | `16px` | Core padding unit |
| `--space-06` | `24px` | Card padding / section inset |
| `--space-07` | `32px` | Standard component separation |
| `--space-09` | `48px` | Section spacing |
| `--space-10` | `64px` | Large section spacing |

### Layout Behavior
- Keep text, media, and data aligned to grid columns.
- Use 16px padding as the default interior spacing for fields and tiles.
- Favor edge alignment over visual centering tricks.
- Dense UI should still preserve strong row rhythm and predictable baselines.

---

## 6. Depth & Elevation

### Surface Hierarchy
IBM relies more on **layers and separators** than on dramatic shadow.

| Level | Treatment | Use Case |
|-------|-----------|----------|
| Base | `#f4f4f4` or `#f2f4f8` | Page background |
| Layer 01 | `#ffffff` | Primary cards, panels |
| Layer 02 | `#f4f4f4` | Nested sections, fields |
| Layer 03 | `#e0e0e0` accents + borders | Group separation |
| Dark Layer | `#21272a` / `#161616` | Inverted sections, console-like modules |

### Shadow Strategy
Use shadow rarely, and only when a floating relationship truly matters.

```css
.elevation-subtle {
  box-shadow: 0 2px 6px rgba(22, 22, 22, 0.08);
}

.elevation-overlay {
  box-shadow: 0 8px 24px rgba(22, 22, 22, 0.18);
}
```

### Depth Rules
- Prefer borders, background shifts, and left rules before adding shadow.
- Overlays can use shadow; standard product tiles usually should not.
- In dark themes, rely on contrast and spacing more than blur.

---

## 7. Do's and Don'ts

### Do
- Use IBM Blue for actions, selection, and state change.
- Build with visible grid discipline and even spacing intervals.
- Let neutral layers carry most of the composition.
- Keep corners mostly square and geometry clean.
- Write terse, helpful UI copy that matches the brand’s technical tone.

### Don't
- Over-round buttons, cards, or inputs.
- Replace structure with decorative gradients or large glows.
- Use too many accent colors in one viewport.
- Center everything; IBM feels stronger when aligned and modular.
- Make product UI feel playful or ornamental.

---

## 8. Responsive Behavior

### Breakpoints
- `320px`: 4-column small layout
- `672px`: 8-column tablet layout
- `1056px`: 16-column desktop layout
- `1312px`: large desktop refinement
- `1584px`: max layout width and expanded margins

### Responsive Rules
- Stack split layouts below `672px`.
- Convert dense data tables to cards or horizontally scrollable containers on small screens.
- Preserve 16px field and tile padding even when columns collapse.
- Keep CTAs full-width on mobile when paired with forms or transactional flows.
- Maintain minimum touch targets of `44px`, even if visual height is slightly tighter.

### Mobile Character
IBM mobile layouts should still feel structured, not app-like in the consumer sense. Maintain row rhythm, visible grouping, and clear functional hierarchy.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: enterprise, structured, rigorous, calm
- **Primary color**: IBM Blue 60 `#0f62fe`
- **Base palette**: gray-led with cool-gray alternates
- **Typography**: IBM Plex Sans + IBM Plex Mono
- **Shape language**: square corners, hard edges, minimal ornament
- **Layout**: 2x Grid, column-aware, 16px padding baseline
- **Components**: Carbon-style buttons, layered tiles, underlined inputs

### Prompt Snippet

```text
Design this interface in the style of IBM's current design language. Use IBM Plex Sans and IBM Plex Mono, a gray-led UI with IBM Blue 60 (#0f62fe) for actions, square geometry, and a disciplined 2x grid. Favor layered surfaces, 1px separators, strong alignment, and enterprise clarity over decoration. Buttons should feel Carbon-inspired, inputs should use filled neutral backgrounds with bottom borders, and spacing should follow a strict 8px/16px rhythm.
```
