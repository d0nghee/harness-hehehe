# Dropbox Design System

> Cloud collaboration with editorial confidence and product clarity. Dropbox's current public site combines `Sharp Grotesk`-style display typography with `Atlas Grotesk`-style body text, using bright Dropbox blue (`#0061FF`), dense near-black (`#1E1919`), white (`#FFFFFF`), and warm neutral backgrounds (`#F7F5F2`).

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Dropbox feels like **work infrastructure presented through confident editorial framing**. The brand has more personality than a typical storage product, but it still prioritizes trust, organization, and clarity.

### Mood & Feeling
- Capable and grounded
- Practical with a strong brand voice
- Editorial, but not delicate
- Friendly to both teams and individuals
- Built around clarity and organization

### Design Density
**Medium density.** Marketing content is spacious and bold, while product panels and industry blocks become more information-rich.

### Visual Character
- Bold blue as a clear brand anchor
- Warm neutrals rather than cold all-white minimalism
- Large blocky headlines
- Product screenshots paired with real-world photography
- Clear, solid cards and content lanes

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--dropbox-blue` | `#0061FF` | Primary brand color and CTA |
| `--dropbox-ink` | `#1E1919` | Main text and dark surfaces |
| `--dropbox-white` | `#FFFFFF` | Cards and inverse content |
| `--dropbox-cream` | `#F7F5F2` | Default page background |
| `--dropbox-cream-deep` | `#EEE8E2` | Section contrast background |

### Support and UI

| Token | Hex | Role |
|-------|-----|------|
| `--dropbox-border` | `#D8D1CB` | Borders and soft dividers |
| `--dropbox-muted` | `#5F5855` | Secondary copy |
| `--dropbox-blue-soft` | `#EAF1FF` | Soft brand tint surfaces |
| `--dropbox-success` | `#18794E` | Positive state |
| `--dropbox-warning` | `#A45C13` | Warning state |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Sharp Grotesk", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Atlas Grotesk", system-ui, -apple-system, sans-serif;
--font-mono: "IBM Plex Mono", "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 72px | 600 | 1.0 | -0.04em | `#1E1919` |
| Page Title | 52px | 600 | 1.05 | -0.03em | `#1E1919` |
| Section Title | 36px | 600 | 1.12 | -0.02em | `#1E1919` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#1E1919` |
| Body Large | 18px | 400 | 1.55 | 0 | `#1E1919` |
| Body | 16px | 400 | 1.55 | 0 | `#1E1919` |
| Small Body | 14px | 400 | 1.45 | 0 | `#5F5855` |
| Label | 12px | 700 | 1.3 | 0.04em | `#0061FF` |

### Typography Philosophy
Dropbox typography should feel **bold at the top, stable underneath**. Display type gives the brand a recognizable voice; body text stays grounded and operational.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #0061ff;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 600;
}

.button-primary:hover {
  background: #0050d8;
}

.button-secondary {
  background: #ffffff;
  color: #1e1919;
  border: 1px solid #d8d1cb;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and Screenshots

```css
.card {
  background: #ffffff;
  border: 1px solid #d8d1cb;
  border-radius: 24px;
  box-shadow: 0 14px 34px rgba(30, 25, 25, 0.08);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #1e1919;
  border: 1px solid #d8d1cb;
  border-radius: 14px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #0061ff;
  box-shadow: 0 0 0 4px rgba(0, 97, 255, 0.14);
}
```

### Component Notes
- Cards should feel solid and dependable, not glassy or experimental
- Product UI deserves large screenshot treatment
- Real-world photography and product surfaces can coexist in one module

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Small alignment |
| `--space-3` | `8px` | Tight spacing |
| `--space-4` | `12px` | Control padding |
| `--space-5` | `16px` | Default component spacing |
| `--space-6` | `24px` | Card interiors |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section spacing |
| `--space-9` | `64px` | Hero blocks |
| `--space-10` | `96px` | Large feature rows |

### Layout Behavior
- Use strong text-image pairings in wide modules
- Alternate warm sections and white cards for rhythm
- Let blue guide calls to action, not every surface
- Keep product proof and trust signals easy to scan

### Whitespace Philosophy
Whitespace should feel **organized and editorial**, helping the system feel more premium than ordinary enterprise storage UI.

---

## 6. Depth & Elevation

### Elevation Strategy
Dropbox uses **moderate card elevation** with substantial rounded containers and solid edges.

```css
--shadow-soft: 0 8px 20px rgba(30, 25, 25, 0.06);
--shadow-card: 0 16px 40px rgba(30, 25, 25, 0.10);
```

### Surface Hierarchy
- Warm neutral page background
- White primary cards
- Blue CTA and badge accents
- Dark footer / strong type blocks

---

## 7. Do's and Don'ts

### Do
- Use blue as a crisp, unmistakable action signal
- Keep text and structure highly scannable
- Pair product proof with grounded storytelling
- Let the brand feel useful, not sterile

### Don't
- Do not turn Dropbox into neon startup branding
- Do not overuse blue as a full-page background
- Do not crowd screenshot and copy pairings
- Do not make collaboration surfaces look flimsy or ornamental

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked feature rows and full-width CTAs |
| Tablet | `768px - 1023px` | Split modules with reduced media size |
| Desktop | `1024px+` | Wide editorial rows with large screenshot frames |

### Responsive Rules
- Preserve large readable headlines on smaller screens
- Stack screenshot and copy blocks instead of shrinking too far
- Keep CTA clarity strong on warm backgrounds
- Maintain comfortable card radii and readable spacing

---

## 9. Agent Prompt Guide

### Quick Reference
- Dropbox blue plus warm cream and near-black
- Sharp Grotesk-style headlines with Atlas Grotesk-style body copy
- Solid white cards, editorial product marketing, trustworthy organization
- Clean collaboration software energy with stronger brand voice

### Prompt Template
```text
Design this like Dropbox's current public website:
- bright Dropbox-blue accents on warm cream and white surfaces
- bold editorial headlines with clean utilitarian body text
- large rounded white cards for product screenshots and proof
- organized collaboration-software structure with grounded warmth
- practical, trustworthy, and slightly more branded than generic enterprise SaaS
```
