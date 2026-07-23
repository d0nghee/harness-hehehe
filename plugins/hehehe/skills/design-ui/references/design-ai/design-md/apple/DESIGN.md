# Apple Design System

> Premium consumer technology with extreme visual restraint. The current public Apple site pairs `SF Pro Display`, `SF Pro Text`, and `New York` with bright white (`#FFFFFF`), soft aluminum grays (`#F5F5F7`, `#FBFBFD`), deep near-black text (`#1D1D1F`), muted secondary gray (`#86868B`), and the familiar Apple link blue (`#0071E3`).

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Apple feels like **industrial design translated into web layout**. Large product renders, disciplined spacing, and quiet typography do most of the work. The system is intentionally minimal, but not generic; it uses scale, photography, and materials to create prestige.

### Mood & Feeling
- Precise and premium
- Calm, polished, and highly controlled
- Editorial without feeling noisy
- Product-first rather than decoration-first
- Confident enough to leave large empty areas

### Design Density
**Low to medium density.** Apple prefers fewer, bigger modules with strong imagery and simple copy. Dense utility UI exists in the store and support surfaces, but the homepage experience stays spacious.

### Visual Character
- Vast white or soft-gray canvases
- Massive product imagery on clean stages
- Tight headline spacing with understated body copy
- Rounded hardware-like cards and chips
- Minimal borders, minimal ornament, minimal color noise

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--apple-white` | `#FFFFFF` | Main canvas, cards, inverse text backgrounds |
| `--apple-soft` | `#FBFBFD` | Soft section fill |
| `--apple-gray-050` | `#F5F5F7` | Product-stage background |
| `--apple-ink` | `#1D1D1F` | Primary text and dark hero surfaces |
| `--apple-muted` | `#86868B` | Secondary copy, metadata |

### Accent and Utility

| Token | Hex | Role |
|-------|-----|------|
| `--apple-blue` | `#0071E3` | Links, primary action accents |
| `--apple-blue-deep` | `#0066CC` | Hover and stronger CTA state |
| `--apple-border` | `#D2D2D7` | Soft borders and separators |
| `--apple-success` | `#68CC45` | Positive status / trade-in highlights |
| `--apple-danger` | `#D92C2C` | Error or critical emphasis |

### Dark Surface Scale

| Token | Hex | Role |
|-------|-----|------|
| `--apple-black` | `#000000` | Hero contrast blocks |
| `--apple-graphite` | `#111111` | Dark product stage |
| `--apple-silver-text` | `#F5F5F7` | Text on dark surfaces |

---

## 3. Typography Rules

### Font Stack

```css
--font-sans: "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont,
             "Helvetica Neue", Arial, sans-serif;

--font-serif: "New York", "Iowan Old Style", Georgia, serif;

--font-mono: "SF Mono", Menlo, Monaco, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 80px | 600 | 1.02 | -0.04em | `#1D1D1F` |
| Page Title | 56px | 600 | 1.06 | -0.03em | `#1D1D1F` |
| Section Title | 40px | 600 | 1.1 | -0.02em | `#1D1D1F` |
| Card Title | 28px | 600 | 1.15 | -0.015em | `#1D1D1F` |
| Body Large | 21px | 400 | 1.45 | -0.01em | `#1D1D1F` |
| Body | 17px | 400 | 1.47 | -0.01em | `#1D1D1F` |
| Small Body | 14px | 400 | 1.45 | 0 | `#86868B` |
| Label | 12px | 600 | 1.3 | 0.06em | `#86868B` |

### Typography Philosophy
Apple typography should feel **quiet, expensive, and inevitable**. Large headlines carry the emotional weight; supporting text stays restrained. Serif should be used sparingly for editorial or cultural moments, not routine UI chrome.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #0071e3;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 44px;
  padding: 0 20px;
  font-size: 17px;
  font-weight: 500;
}

.button-primary:hover {
  background: #0066cc;
}

.button-secondary {
  background: transparent;
  color: #0071e3;
  border: 1px solid #0071e3;
  border-radius: 999px;
  min-height: 44px;
  padding: 0 20px;
}
```

### Cards and Product Panels

```css
.product-card {
  background: #f5f5f7;
  color: #1d1d1f;
  border-radius: 28px;
  overflow: hidden;
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  min-height: 44px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.14);
}
```

### Component Notes
- CTAs are simple, pill-shaped, and highly legible
- Product blocks often rely on photography and background tone rather than visible chrome
- Navigation is compact and understated

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Fine alignment |
| `--space-3` | `8px` | Small gaps |
| `--space-4` | `12px` | Compact control padding |
| `--space-5` | `16px` | Default internal spacing |
| `--space-6` | `24px` | Card spacing |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section spacing |
| `--space-9` | `64px` | Hero structure |
| `--space-10` | `96px` | Large product-stage breathing room |

### Layout Behavior
- Center the main story and let product imagery dominate
- Use wide max widths with clear alignment rails
- Keep copy columns narrower than image columns
- Favor stacked rhythm over busy side-by-side comparison grids

### Whitespace Philosophy
Whitespace should feel **luxurious and engineered**, never empty by accident. Apple uses negative space to increase focus and perceived product quality.

---

## 6. Depth & Elevation

### Elevation Strategy
Apple generally uses **very low drama elevation**. Separation comes from contrast, scale, and background shifts more than heavy shadows.

```css
--shadow-soft: 0 6px 20px rgba(0, 0, 0, 0.08);
--shadow-card: 0 12px 32px rgba(0, 0, 0, 0.10);
--shadow-focus: 0 0 0 4px rgba(0, 113, 227, 0.14);
```

### Surface Hierarchy
- White canvas
- Soft gray product stages
- Dark hero sections for contrast campaigns
- Minimal floating overlays

---

## 7. Do's and Don'ts

### Do
- Use clean white space and disciplined alignment
- Let photography and typography carry the brand
- Keep accents rare and intentional
- Use generous radii with crisp edges

### Don't
- Do not add decorative gradients everywhere
- Do not overuse color as a substitute for hierarchy
- Do not crowd modules with extra badges, outlines, or labels
- Do not make Apple look like generic B2B SaaS

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 734px` | Stacked product stories, reduced hero scale |
| Tablet | `734px - 1068px` | Two-column transitions, compact nav |
| Desktop | `1069px+` | Full-width product stages and large-type storytelling |

### Responsive Rules
- Reduce hero type before reducing contrast
- Keep CTAs large and thumb-friendly
- Preserve product image prominence on small screens
- Stack comparison content rather than compressing it

---

## 9. Agent Prompt Guide

### Quick Reference
- White and soft-gray foundation with near-black text
- SF Pro style typography with occasional restrained serif support
- Large product imagery, quiet CTAs, minimal chrome
- Premium, calm, and ruthlessly edited

### Prompt Template
```text
Design this like Apple's current public website:
- expansive white and light-gray product stages
- SF Pro-style typography with tight display spacing
- minimal blue CTAs and almost no decorative color noise
- large premium product renders with very clean card shells
- calm, precise, industrial-design energy
```
