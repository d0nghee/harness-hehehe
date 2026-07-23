# Netflix Design System

> Streaming entertainment with cinematic contrast. The public Netflix signup site is built around `Netflix Sans` and a stark palette of black (`#000000`), charcoal (`#141414`, `#181818`), white (`#FFFFFF`), soft gray (`#B3B3B3`), and signature Netflix red (`#E50914`).

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Netflix feels like **a streaming theater interface rendered for instant conversion**. The brand is dramatic, dark, and high-contrast, with red used as a clear action signal. The UI is built for posters, carousels, and strong content imagery.

### Mood & Feeling
- Cinematic and direct
- High contrast, low ambiguity
- Promotional but not playful
- Optimized for bingeable content browsing
- Tactile media-first energy

### Design Density
**Medium to high density.** Carousels, rankings, and FAQs pack information efficiently, but the dark background and strong separation keep the layout readable.

### Visual Character
- Black canvas with red action points
- Large content art with dark overlays
- Compact controls and forms
- Heavy emphasis on immediate signup flow
- Card rails and ranking layouts

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--netflix-black` | `#000000` | Global background |
| `--netflix-charcoal` | `#141414` | Card and section surfaces |
| `--netflix-panel` | `#181818` | Feature tiles and FAQ rows |
| `--netflix-white` | `#FFFFFF` | Text and inverse contrast |
| `--netflix-muted` | `#B3B3B3` | Secondary copy |

### Brand and Utility

| Token | Hex | Role |
|-------|-----|------|
| `--netflix-red` | `#E50914` | Primary CTA, brand emphasis |
| `--netflix-red-hover` | `#C11119` | Hover state |
| `--netflix-border` | `#333333` | Tile and divider strokes |
| `--netflix-overlay` | `rgba(0,0,0,0.64)` | Hero image darkening |
| `--netflix-focus` | `rgba(255,255,255,0.18)` | Focus ring / contrast halo |

---

## 3. Typography Rules

### Font Stack

```css
--font-sans: "Netflix Sans", "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Menlo, Monaco, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 56px | 700 | 1.05 | -0.02em | `#FFFFFF` |
| Page Title | 40px | 700 | 1.1 | -0.01em | `#FFFFFF` |
| Section Title | 32px | 700 | 1.15 | -0.01em | `#FFFFFF` |
| Card Title | 24px | 600 | 1.2 | 0 | `#FFFFFF` |
| Body Large | 20px | 400 | 1.45 | 0 | `#FFFFFF` |
| Body | 16px | 400 | 1.5 | 0 | `#FFFFFF` |
| Small Body | 14px | 400 | 1.45 | 0 | `#B3B3B3` |
| Label | 13px | 600 | 1.3 | 0.02em | `#FFFFFF` |

### Typography Philosophy
Netflix typography should feel **immediate and forceful**. It exists to frame entertainment and drive action, not to linger on delicate editorial nuance.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #e50914;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  min-height: 48px;
  padding: 0 24px;
  font-size: 18px;
  font-weight: 600;
}

.button-primary:hover {
  background: #c11119;
}

.button-secondary {
  background: rgba(109, 109, 110, 0.7);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  min-height: 40px;
  padding: 0 18px;
}
```

### Feature Tiles and FAQ Rows

```css
.tile {
  background: #181818;
  color: #ffffff;
  border: 1px solid #333333;
  border-radius: 16px;
}
```

### Inputs

```css
.input {
  background: rgba(22, 22, 22, 0.75);
  color: #ffffff;
  border: 1px solid #666666;
  border-radius: 4px;
  min-height: 56px;
  padding: 16px;
}

.input:focus {
  outline: none;
  border-color: #ffffff;
}
```

### Component Notes
- Red is reserved for action, not used as a background wash everywhere
- Poster art and thumbnails need strong dark framing
- Form controls stay practical and conversion-oriented

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Tight adjustments |
| `--space-3` | `8px` | Compact gaps |
| `--space-4` | `12px` | Internal tile rhythm |
| `--space-5` | `16px` | Form spacing |
| `--space-6` | `24px` | Card gutters |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section padding |
| `--space-9` | `64px` | Hero spacing |

### Layout Behavior
- Put the signup path above the fold
- Use content rails and stacked feature strips below the hero
- Keep dark overlays strong enough for readable text on imagery
- Favor wide media modules over airy editorial white space

### Whitespace Philosophy
Whitespace should feel **purposeful and cinematic**, not minimal for its own sake. The dominant rhythm comes from content modules, gutters, and dark breathing room.

---

## 6. Depth & Elevation

### Elevation Strategy
Netflix uses **overlay depth more than shadow depth**. Dark gradients, image dimming, and layered poster stacks create the sense of space.

```css
--shadow-card: 0 8px 24px rgba(0, 0, 0, 0.45);
--shadow-modal: 0 18px 48px rgba(0, 0, 0, 0.6);
```

### Surface Hierarchy
- Black page base
- Charcoal feature rows
- Bright media art
- Red conversion points

---

## 7. Do's and Don'ts

### Do
- Keep contrast high and the palette disciplined
- Let media art create visual richness
- Use red primarily for conversion and brand emphasis
- Make signup, trending, and content discovery feel immediate

### Don't
- Do not introduce pastel backgrounds or soft enterprise styling
- Do not over-round controls into a playful app language
- Do not weaken image overlays until text becomes hard to read
- Do not turn Netflix into a generic dark dashboard

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 600px` | Single-column signup flow, stacked FAQ, scrollable rails |
| Tablet | `600px - 959px` | Wider hero copy, compact feature tiles |
| Desktop | `960px+` | Full cinematic hero, multi-column supporting modules |

### Responsive Rules
- Keep the primary email capture and CTA obvious on small screens
- Preserve poster readability with horizontal scrolling rather than tiny thumbnails
- Maintain dark overlays and headline contrast at every size
- Use large touchable FAQ rows and buttons

---

## 9. Agent Prompt Guide

### Quick Reference
- Black and charcoal base with white text
- Netflix red for CTAs and key emphasis
- Compact, cinematic, conversion-focused modules
- Poster rails, dark overlays, sharp corners, simple forms

### Prompt Template
```text
Design this like Netflix's current public website:
- black and charcoal streaming-service foundation
- bold white headlines with compact supporting copy
- bright Netflix-red CTAs and very limited accent color
- dark overlay layers, poster cards, and conversion-first forms
- cinematic, high-contrast entertainment energy
```
