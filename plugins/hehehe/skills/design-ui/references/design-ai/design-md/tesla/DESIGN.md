# Tesla Design System

> Minimalist product design with cinematic restraint and direct-to-consumer confidence. Tesla’s web presence relies on black-and-white contrast, ultra-clean typography, giant product imagery, and sparse controls to make the products feel inevitable rather than marketed.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Tesla presents **engineering as aspiration**. The interface is stripped down, high contrast, and image-led. It should feel fast, premium, and unmistakably modern.

### Mood & Feeling
- **Minimal**: remove anything not needed for the sale or story
- **Premium**: spacing, imagery, and motion should feel polished
- **Confident**: the design never begs for attention
- **Product-first**: vehicles, energy systems, and factories are the hero
- **Direct**: CTA paths are simple and obvious

### Design Density
**Low density**. Tesla’s website uses large hero sections, short headlines, and minimal body copy. Any complexity is pushed into configurators or product details.

### Visual Character
- White or black hero fields with massive product photography
- Minimal chrome and short copy
- Rounded but understated buttons
- Spacious single-message sections
- Product imagery provides most of the emotion

---

## 2. Color Palette & Roles

### Core Palette

| Token | Hex | Role |
|-------|-----|------|
| `--tesla-black` | `#000000` | Primary dark surface / text |
| `--tesla-white` | `#FFFFFF` | Primary light surface / text |
| `--tesla-gray-100` | `#F4F4F4` | Soft background |
| `--tesla-gray-400` | `#9CA3AF` | Secondary text |
| `--tesla-gray-700` | `#374151` | Strong secondary text |

### Supporting Accents

| Token | Hex | Role |
|-------|-----|------|
| `--tesla-red` | `#B91C1C` | Rare brand or urgent highlight |
| `--success` | `#15803D` | Positive state |
| `--warning` | `#D97706` | Caution state |

### Color Usage Rules
- Let black and white dominate.
- Use red very sparingly.
- Keep controls and typography neutral so imagery stays primary.

---

## 3. Typography Rules

### Font Stack

```css
/* Tesla-style premium sans */
--font-sans: Gotham, Inter, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 56px | 700 | 1.02 | -0.03em | Main vehicle / product hero |
| Page Title | 40px | 700 | 1.08 | -0.02em | Section title |
| Card Title | 22px | 600 | 1.2 | -0.01em | Spec or support card |
| Body | 16px | 400 | 1.6 | 0 | Supporting content |
| Small Body | 14px | 400 | 1.5 | 0 | Secondary content |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons and nav |

### Typography Philosophy
Tesla typography should feel **clean, premium, and almost invisible**. It is there to frame the product, not compete with it.

### Practical Rules
- Keep headlines short.
- Use minimal copy in hero sections.
- Let typography breathe inside large image-led layouts.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: rgba(23, 26, 32, 0.8);
  color: #FFFFFF;
  min-height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
  font: 600 14px/1 Gotham, Inter, sans-serif;
  backdrop-filter: blur(4px);
}
```

#### Secondary Button
```css
.button-secondary {
  background: rgba(244, 244, 244, 0.85);
  color: #111827;
  min-height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  background: #FFFFFF;
  color: #111827;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font: 400 16px/1.2 Gotham, Inter, sans-serif;
}
```

### Panels and Spec Cards

#### Spec Card
```css
.card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 18px;
  padding: 24px;
}
```

#### Dark Story Panel
```css
.panel-dark {
  background: #000000;
  color: #FFFFFF;
  border-radius: 24px;
  padding: 32px;
}
```

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Tight alignment |
| `--space-4` | `16px` | Core spacing |
| `--space-6` | `32px` | Section spacing |
| `--space-8` | `48px` | Large grouping |
| `--space-10` | `64px` | Hero rhythm |
| `--space-12` | `96px` | Major cinematic spacing |

### Layout Rules
- One message per hero section.
- Keep CTAs short and close to the focal product.
- Use large product imagery and spacious vertical stacking.
- Avoid clutter in support and spec areas too.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base hero | photo or video-led field | Main product storytelling |
| Soft overlay | translucent button / panel | CTAs and utility info |
| White card | spec or support module | Detailed content |
| Dark panel | immersive technical story | Engineering / factory narrative |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}

.shadow-overlay {
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.18);
}
```

### Depth Rules
- Use product photography as the main depth effect.
- Keep overlays subtle and translucent.
- Avoid layered interface chrome over hero imagery.

---

## 7. Do's and Don'ts

### Do
- Let product imagery dominate.
- Keep copy and controls sparse.
- Use black and white confidently.
- Make CTAs obvious but quiet.
- Preserve premium restraint.

### Don't
- Add unnecessary visual decoration.
- Use too many accent colors.
- Fill hero sections with explanatory text.
- Make overlays heavy or opaque.

---

## 8. Responsive Behavior

### Responsive Rules
- Keep hero messaging compact enough to scale to mobile.
- Let CTA buttons stack cleanly under product titles.
- Preserve image impact even when crops change.
- Keep product details separated into simple vertical cards on mobile.

### Mobile Character
Tesla mobile should still feel cinematic and direct. The minimal black-and-white product-first approach needs to remain intact on every screen size.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: minimal, premium, cinematic
- **Core palette**: black, white, neutral gray
- **Typography**: Gotham-like premium sans
- **Layout**: image-led heroes, sparse CTAs, minimal copy
- **Components**: translucent pill buttons, clean spec cards, dark story panels

### Prompt Snippet

```text
Design this interface in the style of Tesla’s current website. Use a black-and-white premium palette, large cinematic product imagery, sparse copy, restrained typography, and quiet pill-shaped CTAs. The result should feel direct, modern, and product-first rather than content-heavy or visually busy.
```
