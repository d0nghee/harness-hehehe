# Adobe Design System

> Creative software and digital experience tooling with a bold brand spine. Adobe's current public site uses `Adobe Clean`, relying on black (`#000000`), white (`#FFFFFF`), soft gray (`#F5F5F5`), deep charcoal (`#2C2C2C`), and Adobe red (`#FA0F00`) across product cards, commerce modules, and AI-focused feature blocks.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Adobe feels like **a platform of serious creative tools presented with brand confidence**. The design system needs to support many product families, so it uses a strong black-white-red frame and lets product imagery, app badges, and feature tiles create the variety.

### Mood & Feeling
- Professional and creative
- Brand-strong without being chaotic
- Broad and platform-like
- Capable of handling both commerce and inspiration
- Clear enough for beginners, credible for experts

### Design Density
**Medium density.** Adobe often stacks many offerings and tool links into a single page, but section framing and strong headings keep it navigable.

### Visual Character
- Black and white structural backbone
- Red used for brand identity and certain CTAs
- Large product tiles and app iconography
- Varied feature cards across creative, PDF, and business categories
- Confident editorial headline treatment

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--adobe-black` | `#000000` | Brand anchor, header, key contrast |
| `--adobe-white` | `#FFFFFF` | Canvas and inverse text |
| `--adobe-gray-050` | `#F5F5F5` | Section background |
| `--adobe-charcoal` | `#2C2C2C` | Strong dark content surfaces |
| `--adobe-muted` | `#6E6E73` | Secondary copy |

### Brand and Product Support

| Token | Hex | Role |
|-------|-----|------|
| `--adobe-red` | `#FA0F00` | Primary Adobe brand accent |
| `--adobe-red-deep` | `#D80D00` | Hover / strong brand state |
| `--adobe-border` | `#DADADA` | Divider and card edge |
| `--adobe-purple` | `#7B61FF` | AI / Firefly support accent |
| `--adobe-orange` | `#FF8A00` | Warm product highlight |

---

## 3. Typography Rules

### Font Stack

```css
--font-sans: "Adobe Clean", "Helvetica Neue", Arial, sans-serif;
--font-display: "Adobe Clean", "Helvetica Neue", Arial, sans-serif;
--font-mono: "Adobe Clean", "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 64px | 700 | 1.03 | -0.03em | `#000000` |
| Page Title | 48px | 700 | 1.08 | -0.02em | `#000000` |
| Section Title | 36px | 700 | 1.12 | -0.02em | `#000000` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#000000` |
| Body Large | 18px | 400 | 1.55 | 0 | `#2C2C2C` |
| Body | 16px | 400 | 1.55 | 0 | `#2C2C2C` |
| Small Body | 14px | 400 | 1.45 | 0 | `#6E6E73` |
| Label | 12px | 700 | 1.3 | 0.04em | `#FA0F00` |

### Typography Philosophy
Adobe typography should feel **clear, professional, and ready for a broad product family**. The right tone is confident and informative rather than whimsical.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 44px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 700;
}

.button-primary:hover {
  background: #2c2c2c;
}

.button-secondary {
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 999px;
  min-height: 44px;
  padding: 0 20px;
}
```

### Cards and Product Blocks

```css
.product-card {
  background: #ffffff;
  border: 1px solid #dadada;
  border-radius: 20px;
  overflow: hidden;
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #2c2c2c;
  border: 1px solid #dadada;
  border-radius: 12px;
  min-height: 44px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #000000;
}
```

### Component Notes
- Product cards can be visually varied, but the chrome should stay consistent
- Adobe tolerates more color variety than pure enterprise systems
- App icons, product badges, and supporting visuals are essential brand signals

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Fine spacing |
| `--space-3` | `8px` | Tight rhythm |
| `--space-4` | `12px` | Compact internal spacing |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card and list spacing |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section rhythm |
| `--space-9` | `64px` | Hero sections |
| `--space-10` | `96px` | Large product families / commerce blocks |

### Layout Behavior
- Support many product categories without losing hierarchy
- Use large section headers and bounded groups
- Keep navigation and product discovery easy to scan
- Allow visual variety inside a stable grid frame

### Whitespace Philosophy
Whitespace should feel **structured and platform-ready**, giving a broad ecosystem enough room without making the page feel diffuse.

---

## 6. Depth & Elevation

### Elevation Strategy
Adobe uses **moderate, clean elevation**. Cards are distinct, but contrast and grouping matter more than dramatic shadow.

```css
--shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.06);
--shadow-card: 0 16px 36px rgba(0, 0, 0, 0.10);
```

### Surface Hierarchy
- White and light-gray sections
- Black brand anchors
- Red brand markers
- Product-specific art and iconography inside cards

---

## 7. Do's and Don'ts

### Do
- Keep the Adobe frame strong and recognizable
- Let product art and app icons provide variety
- Use red with intention and restraint
- Maintain professional clarity across many offerings

### Don't
- Do not make every block compete for attention
- Do not reduce Adobe to generic red-on-white commerce
- Do not overuse gradients where the structure should lead
- Do not let creative energy override information architecture

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked product blocks and simplified nav density |
| Tablet | `768px - 1023px` | Multi-row cards with balanced text and iconography |
| Desktop | `1024px+` | Full ecosystem browsing with broad section groupings |

### Responsive Rules
- Keep product categories legible and touch-friendly
- Stack dense link lists before shrinking type too far
- Preserve app icon visibility and CTA clarity
- Maintain clear section boundaries as grids collapse

---

## 9. Agent Prompt Guide

### Quick Reference
- Black, white, gray, and Adobe red foundation
- Adobe Clean-style typography and crisp rounded cards
- Platform-scale product browsing with strong hierarchy
- Creative-tool credibility with professional order

### Prompt Template
```text
Design this like Adobe's current public website:
- strong black-white-red brand frame
- clean Adobe-style typography with confident product headings
- rounded white product cards and clear category grouping
- room for app iconography, creative visuals, and commerce CTAs
- professional creative-platform energy, not playful startup chaos
```
