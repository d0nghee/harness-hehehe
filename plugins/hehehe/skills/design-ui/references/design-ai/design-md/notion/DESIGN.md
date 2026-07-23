# Notion Design System

> Connected workspace with editorial calm. The live site currently serves `NotionInter` webfonts and pairs warm white surfaces (`#FFFFFF`, `#F9F9F8`, `#FCF8F5`) with charcoal content text (`#191919`, `#37352F`), quiet gray structure, and selective accent bursts from current marketing surfaces such as teal (`#03C1BA`), violet (`#A361FF`), yellow (`#FFB600`), and orange (`#FF6522`).

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Notion feels like **a beautifully typeset document editor that grew into an operating system for work**. The interface avoids flashy SaaS chrome. Instead, it leans on paper-like neutrals, disciplined typography, and modular block composition. Marketing pages add more motion and color, but the underlying system still feels calm, structured, and writer-friendly.

### Mood & Feeling
- **Editorial clarity**: Reads like a thoughtful publication rather than a noisy dashboard
- **Modular flexibility**: Every page feels reconfigurable, stackable, and composable
- **Quiet confidence**: Minimal chrome, soft borders, understated interaction states
- **Warm productivity**: Whites skew slightly warm instead of cold blue-gray
- **Playful restraint**: Bright accents appear in illustrations, AI surfaces, and callouts, not everywhere

### Design Density
**Medium density** in the product, **low-to-medium density** on marketing. Dense information is supported through blocks, toggles, databases, and sidebars, but the default presentation is spacious enough to feel approachable.

### Visual Character
- Warm-white canvases instead of harsh pure gray app backgrounds
- Charcoal text with softer secondary grays
- Border-first surfaces, almost no heavy shadow language
- Block-based composition with visible spacing between content units
- Rounded cards and controls, but never overly bubbly
- Bright AI and illustration accents sitting on top of a quiet neutral system
- Flexible document widths, columns, and toggled density

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--notion-white` | `#FFFFFF` | Primary page canvas, cards, editors |
| `--notion-paper` | `#F9F9F8` | Soft background wash, large surfaces |
| `--notion-paper-warm` | `#FCF8F5` | Warm marketing sections, editorial contrast |
| `--notion-ink` | `#191919` | Headlines, nav, strong UI emphasis |
| `--notion-body` | `#37352F` | Primary product text, document copy |

### Neutral Scale

| Token | Hex | Role |
|-------|-----|------|
| `--gray-50` | `#F7F6F3` | Hover fills, subtle blocks |
| `--gray-100` | `#F1F1EF` | Soft section backgrounds |
| `--gray-200` | `#E9E9E7` | Borders, dividers, table lines |
| `--gray-300` | `#D9D8D4` | Disabled borders, inactive states |
| `--gray-400` | `#B8B7B3` | Placeholder content |
| `--gray-500` | `#9B9A97` | Secondary metadata, captions |
| `--gray-600` | `#6F6E69` | Secondary text, helper labels |
| `--gray-700` | `#4F4E49` | Strong secondary text |
| `--gray-800` | `#37352F` | Primary body copy |
| `--gray-900` | `#191919` | Maximum emphasis |

### Accent Colors Seen on Current Public Surfaces

| Token | Hex | Role |
|-------|-----|------|
| `--accent-teal` | `#03C1BA` | AI and feature highlights |
| `--accent-teal-soft` | `#DDFCFA` | Teal-tinted backgrounds |
| `--accent-violet` | `#A361FF` | AI, premium, feature emphasis |
| `--accent-violet-soft` | `#F7E5FF` | Soft violet surfaces |
| `--accent-yellow` | `#FFB600` | Warm highlight, hero accents |
| `--accent-yellow-soft` | `#FFF4CB` | Highlight backgrounds |
| `--accent-orange` | `#FF6522` | CTA energy, feature emphasis |
| `--accent-orange-soft` | `#FFEBE3` | Warm background accents |

### Product Utility Colors

| Token | Hex | Role |
|-------|-----|------|
| `--link-blue` | `#2383E2` | Links, selected text, focus states |
| `--link-blue-soft` | `#E7F3FF` | Selected background, focus fills |
| `--success-green` | `#0F9D58` | Confirmation states |
| `--warning-amber` | `#FFB110` | Warning chips, notices |
| `--error-red` | `#FF3B30` | Errors, destructive actions |

### Dark Theme

| Token | Hex | Role |
|-------|-----|------|
| `--dark-bg` | `#191919` | Primary dark canvas |
| `--dark-surface` | `#202020` | Elevated surfaces |
| `--dark-surface-soft` | `#2F2F2F` | Sidebar and hover surfaces |
| `--dark-border` | `#373530` | Borders, dividers |
| `--dark-text-primary` | `#F7F6F3` | Primary text |
| `--dark-text-secondary` | `#B8B7B3` | Secondary copy |

---

## 3. Typography Rules

### Font Stack

```css
/* Primary UI Font - served on the live site */
--font-sans: 'Notion Inter', 'Inter', -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Helvetica Neue', Arial, sans-serif;

/* Page style options publicly exposed in Notion */
--font-serif: ui-serif, Georgia, Cambria, 'Times New Roman', serif;
--font-mono: 'SF Mono', 'JetBrains Mono', 'Roboto Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 56px | 700 | 1.05 | -0.03em | `--gray-900` |
| Page Title | 40px | 700 | 1.15 | -0.02em | `--gray-900` |
| Section Title | 30px | 600 | 1.2 | -0.015em | `--gray-900` |
| Card Title | 24px | 600 | 1.25 | -0.01em | `--gray-900` |
| Subsection | 20px | 600 | 1.35 | -0.01em | `--gray-800` |
| Large Body | 18px | 400 | 1.65 | 0 | `--gray-700` |
| Body | 16px | 400 | 1.6 | 0 | `--gray-800` |
| Small Body | 14px | 400 | 1.55 | 0 | `--gray-600` |
| Caption | 13px | 400 | 1.45 | 0.01em | `--gray-500` |
| Label | 12px | 500 | 1.4 | 0.02em | `--gray-600` |
| Mono Text | 13px | 400 | 1.55 | 0 | `--gray-800` |

### Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Document content, descriptions |
| 500 | Medium | UI labels, nav, pills |
| 600 | Semibold | Card titles, subheads, important buttons |
| 700 | Bold | Hero headlines, page titles |

### Typography Philosophy
Notion typography is built for **reading, writing, and structuring thought**. The base sans style is neutral and highly legible. Public help content also confirms three page-level text styles: `Default`, `Serif`, and `Mono`, plus a `Small text` density option. The system should feel comfortable for long-form reading first, and “product UI” second.

```css
--tracking-tight: -0.03em;   /* Hero headlines */
--tracking-snug: -0.015em;   /* Section titles */
--tracking-normal: 0;        /* Body copy */
--tracking-wide: 0.02em;     /* Labels, buttons */
```

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #191919;
  color: #ffffff;
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: background 150ms ease, transform 150ms ease;
}

.button-primary:hover {
  background: #2b2b2b;
}

.button-primary:active {
  transform: translateY(1px);
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #2383e2;
}
```

#### Secondary Button
```css
.button-secondary {
  background: #ffffff;
  color: #37352f;
  border: 1px solid #e9e9e7;
  border-radius: 10px;
  height: 40px;
  padding: 0 16px;
}

.button-secondary:hover {
  background: #f7f6f3;
}
```

### Cards and Blocks
```css
.card,
.block-surface {
  background: #ffffff;
  border: 1px solid #e9e9e7;
  border-radius: 12px;
  box-shadow: none;
}

.card:hover {
  background: #fcf8f5;
  border-color: #d9d8d4;
}
```

### Inputs and Search
```css
.input {
  background: #ffffff;
  color: #37352f;
  border: 1px solid #e9e9e7;
  border-radius: 8px;
  min-height: 36px;
  padding: 8px 12px;
}

.input:focus {
  border-color: #2383e2;
  box-shadow: 0 0 0 3px rgba(35, 131, 226, 0.14);
}
```

### Navigation and Sidebar
- Sidebar backgrounds stay close to `#F7F6F3` or dark equivalents
- Active rows use a subtle fill instead of a strong pill
- Disclosure arrows, drag handles, and block affordances are visible but quiet
- Search and command surfaces rely on contrast and spacing more than color

### Callouts, Highlights, and Pills
- Use soft tinted backgrounds, not saturated solid fills
- Keep text charcoal even on accent backgrounds
- Prefer rounded rectangles over hard-edged tags
- Allow decorative accents to appear in illustrations and hero moments, not in every control

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight inline gaps |
| `--space-2` | `8px` | Control spacing |
| `--space-3` | `12px` | Block internals |
| `--space-4` | `16px` | Default padding |
| `--space-5` | `24px` | Card padding, section gaps |
| `--space-6` | `32px` | Large content separations |
| `--space-7` | `48px` | Marketing modules |
| `--space-8` | `64px` | Hero and page section spacing |

### Layout Behavior
- Pages should feel like stacked content blocks, not rigid application panels
- Default content width stays readable, with optional full-width layouts for databases and dashboards
- Columns should align visually without becoming overly grid-locked
- Marketing pages can use bento compositions, but product surfaces should remain document-first
- Dense information is acceptable when grouped with clear block spacing and dividers

### Whitespace Philosophy
Whitespace in Notion should feel **functional, not luxurious**. Give every block a bit of air, but avoid giant empty zones unless a marketing hero needs them.

---

## 6. Depth & Elevation

### Elevation Strategy
Notion relies mostly on **borders, tonal shifts, and hover fills** rather than obvious shadows. Menus, command palettes, and floating toolbars can use small shadows, but the core canvas should feel flat and steady.

### Shadow Language

```css
--shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.14);
```

### Surface Hierarchy
- Base canvas: warm white or paper
- Blocks/cards: white with 1px border
- Hover: fill shift before shadow
- Floating menus: soft shadow + thin border
- Dark mode: separate surfaces using gray steps more than blur

---

## 7. Do's and Don'ts

### Do
- Keep the system document-first and text-forward
- Use warm neutrals as the default tone
- Let accent colors appear sparingly and purposefully
- Favor simple borders and soft hover fills over heavy shadows
- Support multiple reading/writing densities without visual clutter

### Don't
- Don’t make Notion look like a neon AI dashboard
- Don’t overuse saturated accent colors in core navigation or forms
- Don’t rely on giant shadows or glossy gradients in product UI
- Don’t compress document spacing so far that writing feels cramped
- Don’t swap the calm editorial feeling for generic enterprise blue

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 640px` | Single-column stack, sidebar becomes drawer |
| Tablet | `640px - 1023px` | Narrower page widths, simplified multi-column layouts |
| Desktop | `1024px+` | Full doc/editor patterns, persistent nav |

### Responsive Rules
- Collapse complex bento and testimonial grids into stacked cards on mobile
- Keep editor-style content readable before preserving layout tricks
- Allow tables and databases to scroll horizontally instead of crushing columns
- Maintain comfortable 44px+ tap targets for block actions and navigation
- Preserve page hierarchy through spacing even when columns collapse

---

## 9. Agent Prompt Guide

### Quick Reference
- **Foundation**: warm white, paper gray, charcoal text
- **Typography**: NotionInter-style sans, with optional serif/mono page variants
- **Shape language**: soft rectangles, subtle radii, border-first surfaces
- **Mood**: editorial, modular, calm, writer-friendly

### Prompt Template
```text
Design this interface like Notion:
- Warm white document canvas with soft gray structure
- Charcoal text, subtle borders, minimal shadows
- Modular block-based layout with readable spacing
- Calm editorial typography with occasional bright accent callouts
- Productive, flexible, and quietly polished rather than flashy
```

### Avoid
- Loud SaaS gradients everywhere
- Heavy glassmorphism
- Oversized pill UI on every element
- Dense enterprise-table styling without document breathing room
