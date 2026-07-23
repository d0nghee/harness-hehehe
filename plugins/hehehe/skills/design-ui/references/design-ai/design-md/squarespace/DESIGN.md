# Squarespace Design System

> Editorial website-builder design with New York polish and expressive restraint. Squarespace pairs the custom Clarkson typeface, spacious black-and-white layouts, rich typography choices, and Fluid Engine’s smart grid to create interfaces that feel premium, creative, and intentionally composed.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Squarespace presents **design as a product feature**. The brand feels fashion-editorial, premium, and highly curated. Even when the tooling is broad and flexible, the interface should suggest refinement, taste, and clarity.

### Mood & Feeling
- **Creative**: the platform should feel like a design partner, not just a builder
- **Editorial**: typography and white space do much of the storytelling
- **Premium**: surfaces feel tailored and deliberate
- **Expressive**: layouts support personality without turning chaotic
- **Accessible**: polished does not mean obscure or hard to use

### Design Density
**Low to medium density**. Squarespace gives large headlines, template previews, and layout compositions generous room.

### Visual Character
- Strong black-and-white base
- High typographic confidence with curated font pairings
- Spacious section rhythm
- Rich template previews and layout demos
- Minimal but intentional color

---

## 2. Color Palette & Roles

### Core Palette

| Token | Hex | Role |
|-------|-----|------|
| `--black` | `#000000` | Primary text and dark surfaces |
| `--white` | `#ffffff` | Base background |
| `--soft-ivory` | `#f6f3ee` | Warm editorial surface |
| `--gray-200` | `#e8e5df` | Border and divider |
| `--gray-500` | `#6f6b65` | Secondary text |

### Supporting Accents

| Token | Hex | Role |
|-------|-----|------|
| `--ink-blue` | `#24313f` | Cool editorial accent |
| `--stone` | `#c9b9a6` | Soft product highlight |
| `--olive` | `#78826b` | Lifestyle or content accent |

### Color Usage Rules
- Start with black, white, and warm off-white.
- Keep accent colors secondary to typography and imagery.
- Use color as curation, not as constant brand shouting.

---

## 3. Typography Rules

### Font Stack

```css
/* Squarespace brand */
--font-display: 'Clarkson', 'Helvetica Neue', Arial, sans-serif;
--font-sans: 'Clarkson', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 64px | 700 | 1.0 | -0.03em | Homepage or template hero |
| Page Title | 48px | 700 | 1.08 | -0.02em | Major title |
| Section Title | 32px | 600 | 1.15 | -0.01em | Section heading |
| Card Title | 22px | 600 | 1.2 | -0.01em | Template / feature title |
| Body | 16px | 400 | 1.65 | 0 | Main content |
| Small Body | 14px | 400 | 1.55 | 0 | Supporting content |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons, nav |

### Typography Philosophy
Squarespace typography is **the core of the brand experience**. It should feel sharp, curated, and premium, with enough flexibility to support many creative styles.

### Practical Rules
- Give large headlines room to land.
- Avoid stacking too many competing text styles.
- Use strong negative space around hero type.
- Let typography lead before color does.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #000000;
  color: #ffffff;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid #000000;
  border-radius: 999px;
  font: 600 14px/1 'Clarkson', sans-serif;
}
```

#### Secondary Button
```css
.button-secondary {
  background: #ffffff;
  color: #000000;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid #000000;
  border-radius: 999px;
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  background: #ffffff;
  color: #000000;
  border: 1px solid #e8e5df;
  border-radius: 14px;
  font: 400 16px/1.2 'Clarkson', sans-serif;
}

.input:focus {
  outline: none;
  border-color: #000000;
}
```

### Cards and Preview Frames

#### Template Card
```css
.card {
  background: #ffffff;
  border: 1px solid #e8e5df;
  border-radius: 24px;
  padding: 24px;
}
```

#### Editorial Section
```css
.editorial-panel {
  background: #f6f3ee;
  border-radius: 28px;
  padding: 32px;
}
```

---

## 5. Layout Principles

### Layout System
Squarespace’s Fluid Engine introduces a **smart grid** that supports flexible drag-and-drop composition while preserving visual order.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Tight spacing |
| `--space-4` | `16px` | Core spacing |
| `--space-5` | `24px` | Card spacing |
| `--space-6` | `32px` | Section spacing |
| `--space-8` | `48px` | Major grouping |
| `--space-10` | `64px` | Large page rhythm |
| `--space-12` | `96px` | Hero spacing |

### Layout Rules
- Favor clean, asymmetrical-but-balanced compositions.
- Use generous vertical spacing between content chapters.
- Let template previews and creative content feel gallery-like.
- Maintain clear alignment even in flexible layouts.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base | white | Primary page field |
| Warm panel | ivory / soft editorial surface | Alternate content chapter |
| Card | white with subtle border | Template or feature preview |
| Overlay | white + soft shadow | Modal or floating utility |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.shadow-overlay {
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.12);
}
```

### Depth Rules
- Use soft depth, never heavy UI chrome.
- Rely on spacing and composition before shadow.
- Keep overlays clean and light.

---

## 7. Do's and Don'ts

### Do
- Let typography and layout carry the design.
- Keep the color system restrained.
- Use premium spacing and sharp contrast.
- Treat template previews as hero content.
- Keep controls simple and polished.

### Don't
- Turn the UI into generic SaaS panels.
- Overfill pages with too many simultaneous messages.
- Use loud, arbitrary accent colors.
- Flatten all layouts into uniform blocks.
- Sacrifice elegance for density.

---

## 8. Responsive Behavior

### Responsive Rules
- Preserve editorial rhythm on smaller screens.
- Let large headlines wrap gracefully.
- Stack preview cards without losing their gallery feel.
- Keep touch targets large and minimal.
- Maintain clear alignment inside Fluid Engine-style layouts.

### Mobile Character
Squarespace mobile should still feel curated and premium. The content may stack, but the typographic confidence and spacing should remain obvious.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: editorial, creative, premium
- **Core type**: Clarkson
- **Base palette**: black, white, warm ivory
- **Layout**: Fluid Engine smart grid with generous spacing
- **Components**: pill buttons, quiet inputs, gallery-like cards

### Prompt Snippet

```text
Design this interface in the style of Squarespace’s current brand and product experience. Use Clarkson typography, a black-white-ivory palette, premium editorial spacing, and flexible but aligned compositions inspired by Fluid Engine. The result should feel creative, curated, and high-end rather than generic SaaS.
```
