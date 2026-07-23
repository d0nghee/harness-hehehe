# Meta Design System

> Social infrastructure at global scale. Meta's live surfaces serve `Optimistic` (Meta's proprietary sans-serif) and `Roboto` as fallback, combining clean whites and light grays (`#FFFFFF`, `#F0F2F5`) with deep dark foundations (`#1C1E21`, `#242526`) and a focused accent palette anchored by Facebook blue (`#1877F2`), Messenger gradient blue-violet (`#0099FF`, `#A033FF`), Instagram warm gradient (`#E1306C`, `#F77737`), and WhatsApp green (`#25D366`).

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Meta feels like **global social infrastructure rendered with product-scale discipline**. The brand sits across four major surfaces — Facebook, Instagram, Messenger, WhatsApp — each with distinct personality while sharing core structural DNA. Marketing and brand pages carry bold typography and aspirational photography. Product surfaces become flatter, denser, and more systematic.

### Mood & Feeling
- **Accessible scale**: Designed for billions of users across device classes and network speeds
- **Platform confidence**: Clean, unobtrusive chrome that keeps content front and center
- **Community warmth**: Photography and social proof are the hero, not the interface
- **Systematic clarity**: Consistent iconography, spacing, and surface treatment at every breakpoint
- **Multi-product coherence**: Shared design vocabulary across Facebook, Instagram, Messenger, WhatsApp

### Design Density
**Medium density** across all product surfaces, leaning toward information density in feeds and notifications. Meta surfaces are carefully balanced — enough information per view without sacrificing legibility on low-end devices.

### Visual Character
- White and light-gray surfaces with deep charcoal dark mode
- Electric blue as primary interactive accent
- Near-borderless cards floated on surface backgrounds
- Rounded, contained UI with consistent 8px radii
- Strong use of photographs and user-generated content as primary visual layer
- Icon-rich navigation, minimal text labels
- Both light and dark modes as first-class targets

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--meta-white` | `#FFFFFF` | Primary surface, cards, inputs |
| `--meta-surface` | `#F0F2F5` | Page background, feed canvas |
| `--meta-surface-dark` | `#18191A` | Dark mode page background |
| `--meta-card-dark` | `#242526` | Dark mode card surface |
| `--meta-sidebar-dark` | `#3A3B3C` | Dark mode elevated surface |
| `--meta-text-primary` | `#1C1E21` | Primary text, light mode |
| `--meta-text-primary-dark` | `#E4E6EB` | Primary text, dark mode |

### Brand and Primary Accents

| Token | Hex | Role |
|-------|-----|------|
| `--facebook-blue` | `#1877F2` | Facebook primary CTA, links, focus |
| `--facebook-blue-hover` | `#166FE5` | Hover state |
| `--facebook-blue-light` | `#E7F3FF` | Tinted backgrounds, selected states |
| `--messenger-blue` | `#0099FF` | Messenger primary |
| `--messenger-violet` | `#A033FF` | Messenger gradient endpoint |
| `--meta-brand` | `#0082FB` | Meta corporate blue (rebrand) |

### Support Palette

| Token | Hex | Role |
|-------|-----|------|
| `--meta-success` | `#42B72A` | Positive reactions, confirmation, online |
| `--meta-danger` | `#FA3E3E` | Errors, destructive actions, alerts |
| `--meta-warning` | `#F7B928` | Warning states |
| `--meta-like` | `#1877F2` | Like reaction blue |
| `--meta-love` | `#F33E58` | Love reaction red |
| `--meta-haha` | `#F7B928` | Haha reaction yellow |

### Surface and Border Scale

| Token | Hex | Role |
|-------|-----|------|
| `--surface-0` | `#FFFFFF` | Cards, modals, composer |
| `--surface-100` | `#F0F2F5` | Feed, page, section background |
| `--border-light` | `#CED0D4` | Card outlines, input borders |
| `--border-soft` | `#E4E6EB` | Dividers, row separators |
| `--text-secondary` | `#65676B` | Metadata, timestamps, captions |
| `--text-placeholder` | `#BCC0C4` | Input placeholders |

### Dark Mode Scale

| Token | Hex | Role |
|-------|-----|------|
| `--dark-bg` | `#18191A` | Page background |
| `--dark-surface` | `#242526` | Card surface |
| `--dark-elevated` | `#3A3B3C` | Input, secondary surface |
| `--dark-border` | `#3E4042` | Dividers, borders |
| `--dark-text` | `#E4E6EB` | Primary text |
| `--dark-text-secondary` | `#B0B3B8` | Metadata, timestamps |

---

## 3. Typography Rules

### Font Stack

```css
/* Meta's proprietary brand font */
--font-sans: 'Optimistic Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* UI font (product surfaces) */
--font-ui: 'Optimistic Text', system-ui, -apple-system, BlinkMacSystemFont,
           'Segoe UI', sans-serif;

/* Fallback stack for web */
--font-fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                 'Roboto', Oxygen, Ubuntu, sans-serif;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 52px | 700 | 1.1 | -0.02em | `--meta-text-primary` |
| Page Title | 36px | 700 | 1.15 | -0.015em | `--meta-text-primary` |
| Section Title | 24px | 700 | 1.2 | -0.01em | `--meta-text-primary` |
| Card Title | 17px | 700 | 1.3 | 0 | `--meta-text-primary` |
| Body | 15px | 400 | 1.5 | 0 | `--meta-text-primary` |
| Small Body | 13px | 400 | 1.4 | 0 | `--text-secondary` |
| Label | 12px | 500 | 1.3 | 0.01em | `--text-secondary` |
| Nav Item | 15px | 500 | 1.3 | 0 | `--meta-text-primary` |

### Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body, captions, metadata |
| 500 | Medium | Nav, labels, secondary actions |
| 600 | Semibold | Card headers, inline emphasis |
| 700 | Bold | Page titles, hero headlines, CTA labels |

### Typography Philosophy
Meta typography is **invisible infrastructure**. The goal is maximum readability across device classes at small-to-medium sizes. Display type on brand/marketing pages adopts more personality. Product UI defaults to tight, consistent body type with bold used only for genuine hierarchy, not decoration.

---

## 4. Component Stylings

### Buttons

#### Primary CTA
```css
.button-primary {
  background: #1877F2;
  color: #ffffff;
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  transition: background 100ms ease;
}

.button-primary:hover {
  background: #166FE5;
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #1877F2;
}
```

#### Secondary Action
```css
.button-secondary {
  background: #E4E6EB;
  color: #1C1E21;
  border: none;
  border-radius: 6px;
  height: 36px;
  padding: 0 12px;
  font-size: 15px;
  font-weight: 600;
}

.button-secondary:hover {
  background: #D8DADF;
}
```

### Cards

```css
.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Dark mode */
.card-dark {
  background: #242526;
  box-shadow: none;
  border: 1px solid #3E4042;
}
```

### Inputs

```css
.input {
  background: #F0F2F5;
  color: #1C1E21;
  border: 1px solid transparent;
  border-radius: 20px; /* pill inputs in composer */
  padding: 8px 16px;
  font-size: 15px;
  transition: background 100ms ease, border-color 100ms ease;
}

.input:focus {
  background: #ffffff;
  border-color: #1877F2;
  box-shadow: 0 0 0 2px #E7F3FF;
}
```

### Navigation
- Bottom navigation on mobile (icon + label) for Facebook, icon-only for Instagram
- Top navigation bar on desktop with centered search, right-side shortcuts
- Left sidebar on desktop for secondary navigation and shortcuts
- Active state: blue filled icon with matching text color
- Hover state: gray filled circular background

### Reaction System
- Emoji reactions use 32–40px animated icons
- Hover on desktop surfaces floating reaction shelf
- Counts grouped with icon for each reaction type
- Transition in/out with spring animation

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight UI rhythm |
| `--space-2` | `8px` | Component internals |
| `--space-3` | `12px` | Card paddings |
| `--space-4` | `16px` | Default content padding |
| `--space-5` | `20px` | Section gaps |
| `--space-6` | `24px` | Module spacing |
| `--space-7` | `32px` | Large section padding |
| `--space-8` | `48px` | Major editorial gaps |
| `--space-9` | `64px` | Hero spacing |

### Layout Behavior
- Desktop feed: narrow center column (680px max) flanked by sidebars
- Left sidebar: fixed navigation, shortcuts, and groups
- Right sidebar: ads, sponsored content, and suggested connections
- Cards span full column width with 8px radius and soft shadow
- Content-first layout: the chrome is minimal, content fills the space
- Sticky top navigation bar across all breakpoints

### Whitespace Philosophy
Meta whitespace is **functional, not editorial**. Surface colors replace heavy borders. Spacing is consistent but not generous — the goal is information density that still reads comfortably at body copy size.

---

## 6. Depth & Elevation

### Elevation Strategy
Meta uses **minimal, consistent elevation**. Cards are separated from the page background primarily by surface color contrast, not aggressive shadows. Dark mode eliminates shadows in favor of surface color stepping.

### Shadow Language

```css
--shadow-card: 0 1px 2px rgba(0, 0, 0, 0.10);
--shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.18);
--shadow-tooltip: 0 2px 8px rgba(0, 0, 0, 0.12);
--shadow-focus: 0 0 0 2px #ffffff, 0 0 0 4px #1877F2;
```

### Surface Hierarchy
- Base canvas: `#F0F2F5` (light) / `#18191A` (dark)
- Cards: white with `1px` soft shadow (light) / `#242526` with border (dark)
- Elevated surfaces: modals, tooltips, popovers use stronger shadow
- Overlays: semi-transparent scrim `rgba(0,0,0,0.65)` for modals

---

## 7. Do's and Don'ts

### Do
- Lead with content: photos, posts, and social signals are the primary visual layer
- Use Facebook blue exclusively for interactive elements and primary CTAs
- Apply both light and dark mode from the start; this is a two-theme system
- Keep icon usage consistent with Meta's Phosphor-style icon system
- Respect dense information layouts — users are accustomed to high information density

### Don't
- Don't add decorative gradients or shadows that don't exist in the actual product
- Don't over-personalize across the four platforms — they share structural DNA
- Don't use custom fonts for body text; system fallbacks and Optimistic are the stack
- Don't treat white space as premium — Meta surfaces are functionally dense, not editorial
- Don't ignore accessibility — Meta has strict contrast and focus requirements at global scale

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 600px` | Single column, bottom tab navigation, full-width cards |
| Tablet | `600px - 1023px` | Wider center column, collapsible sidebars |
| Desktop | `1024px+` | Three-column layout with fixed left sidebar |

### Responsive Rules
- Collapse three-column layout to single column on mobile
- Bottom navigation replaces top nav on mobile for Facebook
- Card radius and padding stay consistent across breakpoints
- Photos and media maintain aspect ratio; never crop to fit layout
- Composer and reaction UI simplify on mobile (fewer inline options)
- Sticky header shrinks to icon-only on mobile to preserve vertical space

---

## 9. Agent Prompt Guide

### Quick Reference
- **Foundation**: light gray page background with white card surfaces; full dark mode support
- **Typography**: Optimistic / system sans — tight, legible, weight-led hierarchy
- **Shape language**: 6–8px radius on cards and buttons; pill inputs in composer flows
- **Mood**: global social infrastructure — accessible, content-forward, community-warm

### Prompt Template
```text
Design this like Meta / Facebook:
- Light gray (#F0F2F5) page canvas with white cards and soft 1px shadows
- Facebook blue (#1877F2) for all interactive elements and primary CTAs
- Optimistic/system sans-serif with bold weight for hierarchy
- Dense, content-first layout with minimal chrome
- Full dark mode using #18191A / #242526 surface stepping
- Community-warm, photo-first — let user content be the visual hero
```

### Avoid
- Overly decorated or gradient-heavy marketing aesthetics on product surfaces
- Thin borders and micro-details that Meta's design system avoids
- Single-mode designs (always target both light and dark)
- Any visual treatment that competes with user-generated content for attention
