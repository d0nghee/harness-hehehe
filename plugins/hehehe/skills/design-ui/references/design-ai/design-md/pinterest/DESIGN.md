# Pinterest Design System

> Inspiration-first consumer product with soft warmth and bold action cues. Pinterest Red (#e60023), rounded surfaces, large image-led cards, and Gestalt's mobile-friendly component logic create a system that feels approachable, visual, and decisively action-oriented.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Pinterest is built around **visual discovery with emotional warmth**. The product UI stays intentionally simple so that imagery, collections, and saved ideas remain the stars. Gestalt reinforces that simplicity with rounded components, generous touch targets, and a calm neutral base punctuated by unmistakable red CTAs.

### Mood & Feeling
- **Creative momentum**: the interface should encourage collecting, saving, and trying ideas
- **Friendly utility**: polished without feeling premium or exclusive
- **Image-first clarity**: UI supports photos, boards, and categories rather than competing with them
- **Optimistic warmth**: soft neutrals and rounded geometry reduce friction
- **Mobile-native ease**: touchable, scannable, and immediately understandable

### Design Density
**Medium density** with lots of visual variety. Pinterest can show many items on screen, but the experience stays breathable because each element is cleanly boxed, rounded, and clearly separated.

### Visual Character
- Large rounded cards and pill-like controls
- Red reserved for commitment actions like Save
- Warm, low-contrast neutrals around media-heavy content
- Minimal shadow; separation comes more from cards and gaps
- Typography stays functional and readable rather than expressive
- Interfaces feel casual, visual, and highly tap-friendly

---

## 2. Color Palette & Roles

### Core Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--pinterest-red` | `#e60023` | Primary CTA, save state, strongest action cue |
| `--pinterest-red-hover` | `#ad081b` | Hover and pressed state for primary CTA |
| `--pinterest-red-soft` | `#ffe0e5` | Subtle brand-tinted backgrounds |

### Neutral UI Palette

| Token | Hex | Role |
|-------|-----|------|
| `--ink-strong` | `#111111` | Headlines, primary text |
| `--ink-default` | `#211922` | Rich dark text on warm surfaces |
| `--ink-muted` | `#5c5c5c` | Secondary text |
| `--ink-subtle` | `#767676` | Placeholder text, metadata |
| `--surface-default` | `#ffffff` | Base cards, modals, floating controls |
| `--surface-soft` | `#f7f7f7` | Page background, secondary buttons |
| `--surface-muted` | `#efefef` | Chips, low-emphasis fields, separators |
| `--border-default` | `#dddddd` | Dividers, low-contrast card boundaries |

### Support and Focus

| Token | Hex | Role |
|-------|-----|------|
| `--focus-blue` | `#0074e8` | Keyboard focus ring |
| `--success-green` | `#0fa573` | Success and confirmation states |
| `--warning-gold` | `#e9a817` | Caution and attention markers |
| `--info-sky` | `#4a90e2` | Informational links / learning states |

### Color Usage Rules
- Use red as the clearest sign of commitment, especially for Save.
- Let neutrals carry almost all structure around image content.
- Prefer white or soft gray card surfaces over tinted panels.
- Use blue only for focus and specific informational interactions, not as a second brand color.

---

## 3. Typography Rules

### Font Stack

```css
/* Pinterest/Gestalt product UI */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;

/* Monospace */
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 56px | 700 | 1.05 | -0.02em | Marketing hero statements |
| Page Title | 40px | 700 | 1.1 | -0.015em | Section-leading titles |
| Section Title | 28px | 700 | 1.15 | -0.01em | Landing page and board section titles |
| Card Title | 20px | 600 | 1.25 | -0.005em | Board cards, promos |
| Subsection | 18px | 600 | 1.3 | 0 | Supporting headings |
| Body | 16px | 400 | 1.45 | 0 | Default UI copy |
| Small Body | 14px | 400 | 1.45 | 0 | Metadata, helper copy |
| Label | 14px | 600 | 1.2 | 0.01em | Buttons, chips, filters |
| Caption | 12px | 500 | 1.3 | 0.01em | Counts, utility labels |

### Typography Philosophy
Pinterest typography is **quietly supportive**. It should never overpower the imagery. Headlines can be warm and bold, but most product text should feel clean, direct, and highly legible in grid-heavy environments.

### Practical Rules
- Favor sentence case everywhere.
- Keep labels short and action-oriented.
- Use stronger weight on buttons and section titles, but avoid heavy text walls.
- Preserve readable line lengths even when layouts become masonry-like.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #e60023;
  color: #ffffff;
  min-height: 48px;
  padding: 0 16px;
  border: none;
  border-radius: 24px;
  font: 600 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background 120ms ease, transform 120ms ease;
}

.button-primary:hover {
  background: #ad081b;
}

.button-primary:active {
  transform: scale(0.98);
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 116, 232, 0.32);
}
```

#### Secondary Button
```css
.button-secondary {
  background: #efefef;
  color: #111111;
  min-height: 48px;
  padding: 0 16px;
  border: none;
  border-radius: 24px;
  font-weight: 600;
}

.button-secondary:hover {
  background: #e2e2e2;
}
```

#### Tertiary / Ghost Button
```css
.button-ghost {
  background: transparent;
  color: #111111;
  min-height: 40px;
  padding: 0 12px;
  border: none;
  border-radius: 20px;
  font-weight: 600;
}

.button-ghost:hover {
  background: #f7f7f7;
}
```

#### Button Sizes

| Size | Height | Usage |
|------|--------|-------|
| `sm` | `32px` | Dense UI only |
| `md` | `40px` | General desktop utility UI |
| `lg` | `48px` | Primary Pinner-facing surfaces |

### Inputs

#### Text Field
```css
.input {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  background: #ffffff;
  color: #111111;
  border: 1px solid #dddddd;
  border-radius: 16px;
  font: 400 16px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.input:focus {
  outline: none;
  border-color: #0074e8;
  box-shadow: 0 0 0 4px rgba(0, 116, 232, 0.15);
}

.input::placeholder {
  color: #767676;
}
```

#### Label and Helper Text
```css
.input-label {
  display: block;
  margin-bottom: 8px;
  color: #111111;
  font: 600 14px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.input-helper {
  margin-top: 8px;
  color: #5c5c5c;
  font: 400 14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.input-error {
  border-color: #e60023;
}
```

### Cards

#### Pin / Board Card
```css
.card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

.card-media {
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #efefef;
}

.card-body {
  padding: 12px;
}
```

#### Elevated Utility Card
```css
.card-utility {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #efefef;
  box-shadow: 0 1px 3px rgba(17, 17, 17, 0.08);
  padding: 16px;
}
```

#### Compact Filter Chip
```css
.chip {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  background: #efefef;
  color: #111111;
  border-radius: 999px;
  font: 600 14px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chip.is-selected {
  background: #111111;
  color: #ffffff;
}
```

---

## 5. Layout Principles

### Grid Logic
Pinterest uses a **mobile-first, image-led layout**. Content often shifts between feed, board, and utility layouts, but the system remains grounded in clean columns and consistent gutters.

| Layout | Pattern | Use |
|--------|---------|-----|
| Mobile feed | 2-up or single-column card rhythm | Home feed, saved ideas |
| Tablet | 2-4 columns | Boards, search results |
| Desktop | 4-6 columns / 12-column utility layout | Browsing, creation tools, settings |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tiny internal spacing |
| `--space-2` | `8px` | Tight gaps |
| `--space-3` | `12px` | Compact card padding |
| `--space-4` | `16px` | Standard padding |
| `--space-5` | `24px` | Section spacing |
| `--space-6` | `32px` | Larger separation |
| `--space-7` | `48px` | Hero and layout spacing |

### Layout Rules
- Keep image containers simple and let media define personality.
- Use rounded cards to contain dense visual lists.
- Preserve generous gutters between cards so scrolling feels calm.
- Separate browsing UI from creation flows with clearer container structure.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base | `#ffffff` / `#f7f7f7` | Main browsing surfaces |
| Card | Rounded white with subtle border or soft shadow | Pins, modals, menus |
| Floating | White card + slightly stronger shadow | Menus, saves, overlays |
| Active | Red, black, or selected chip fill | Action emphasis |

### Shadow System
Pinterest uses depth sparingly. Most hierarchy comes from cards, cropping, and spacing rather than layered shadow.

```css
.shadow-soft {
  box-shadow: 0 1px 3px rgba(17, 17, 17, 0.08);
}

.shadow-floating {
  box-shadow: 0 8px 24px rgba(17, 17, 17, 0.14);
}
```

### Depth Rules
- Prefer rounded surfaces and clean gaps before adding heavy elevation.
- Use stronger shadows only for flyouts, modals, and save surfaces.
- Avoid sharp rectangular panels unless inside admin-like tooling.

---

## 7. Do's and Don'ts

### Do
- Make imagery and boards the focal point.
- Use red only when you want a clear, intentional action.
- Keep touch targets generous and corners soft.
- Write copy that feels direct, friendly, and low-friction.
- Use pills, chips, and rounded cards to make dense discovery UIs feel approachable.

### Don't
- Overdecorate with extra colors around photo content.
- Use red for non-primary moments.
- Flatten everything into sterile square cards.
- Crowd many competing CTAs into the same content block.
- Turn the experience into generic dashboard UI.

---

## 8. Responsive Behavior

### Breakpoints

| Token | Value |
|-------|-------|
| `--screen-xs` | `0px` |
| `--screen-sm` | `576px` |
| `--screen-md` | `768px` |
| `--screen-lg` | `1024px` |
| `--screen-xl` | `1280px` |

### Responsive Rules
- Default to large (`48px`) buttons on core user-facing surfaces.
- Collapse action groups into wrapping rows on smaller screens.
- Keep forms comfortably spaced; do not compress labels into placeholders.
- Let feed cards reflow naturally by column count rather than fixed widths.
- Preserve minimum touch targets of `44px`, ideally `48px`.

### Mobile Character
Pinterest should feel at home on phones first. Every layout decision should support thumb reach, scanning, and quick save/inspect behavior.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: warm, visual, approachable, mobile-first
- **Primary color**: Pinterest Red `#e60023`
- **Base palette**: white and soft gray neutrals with dark text
- **Typography**: system sans with simple hierarchy
- **Shape language**: rounded pills, rounded cards, soft edges
- **Layout**: image-led grids, masonry-inspired rhythm, roomy gutters
- **Components**: red save buttons, gray utility buttons, rounded inputs, board-style cards

### Prompt Snippet

```text
Design this interface in the style of Pinterest's current product UI and Gestalt system. Use a warm neutral base with Pinterest Red (#e60023) reserved for primary actions, rounded cards and pill buttons, clean system sans typography, and image-first layouts. The interface should feel highly touchable, visually calm, and optimized for discovery, saving, and browsing rather than enterprise density.
```
