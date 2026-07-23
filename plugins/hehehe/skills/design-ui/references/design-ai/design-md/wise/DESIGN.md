# Wise Design System

> Global money movement with practical clarity. Wise's current public site uses a fresh green brand palette, white and pale-mint surfaces, bold product-led typography, and straightforward app visuals to make international money movement feel fast, transparent, and modern instead of mysterious or bank-like.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Wise feels like **financial infrastructure translated into consumer product confidence**. It is clean, optimistic, and utility-first. The system highlights real-world money tasks, app screens, cards, and country coverage with very direct communication and a bright international tone.

### Mood & Feeling
- Clear and transparent
- Fast, modern, and no-nonsense
- Friendly without becoming playful fluff
- International and product-driven
- More helpful than luxurious

### Design Density
**Medium density.** Wise presents many product capabilities, countries, currencies, and trust signals, but keeps everything digestible through strong grouping, large type, and uncluttered product sections.

### Visual Character
- Fresh green brand anchors
- White and pale-mint surfaces with dark text
- Large, plainspoken headlines
- Product screenshots and card imagery used as proof
- Information architecture that feels global and operational

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--wise-green` | `#9FE870` | Primary brand accent and CTA support |
| `--wise-green-deep` | `#163300` | Deep contrast text and dark sections |
| `--wise-green-mid` | `#2E8B57` | Supporting green action tone |
| `--wise-white` | `#FFFFFF` | Main canvas and cards |
| `--wise-mint` | `#EAF8E2` | Soft section background |

### Support Palette

| Token | Hex | Role |
|-------|-----|------|
| `--wise-ink` | `#0F1720` | Primary body text |
| `--wise-muted` | `#5D6B63` | Secondary text |
| `--wise-border` | `#D7E7CF` | Borders and separators |
| `--wise-blue` | `#1631FF` | Occasional contrast accent and UI support |
| `--wise-focus` | `#C9F5AE` | Focus ring tint |

### Utility

| Token | Hex | Role |
|-------|-----|------|
| `--wise-success` | `#2E8B57` | Positive transaction state |
| `--wise-warning` | `#A66B00` | Caution state |
| `--wise-danger` | `#BF3B3B` | Error or blocked state |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Wise Sans", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Wise Sans", system-ui, -apple-system, sans-serif;
--font-mono: "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 68px | 700 | 1.02 | -0.03em | `#163300` |
| Page Title | 48px | 700 | 1.08 | -0.02em | `#163300` |
| Section Title | 34px | 700 | 1.12 | -0.02em | `#0F1720` |
| Card Title | 22px | 600 | 1.22 | -0.01em | `#0F1720` |
| Body Large | 18px | 400 | 1.6 | 0 | `#0F1720` |
| Body | 16px | 400 | 1.6 | 0 | `#0F1720` |
| Small Body | 14px | 400 | 1.45 | 0 | `#5D6B63` |
| Label | 12px | 700 | 1.3 | 0.04em | `#5D6B63` |

### Typography Philosophy
Wise typography should feel **clear, international, and highly usable**. Headlines can be bold and product-led, but copy should stay plainspoken and transparent, reflecting the brand promise of no hidden complexity.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #163300;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 700;
}

.button-primary:hover {
  background: #0f2200;
}

.button-secondary {
  background: #ffffff;
  color: #163300;
  border: 1px solid #d7e7cf;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and Product Panels

```css
.product-card {
  background: #ffffff;
  border: 1px solid #d7e7cf;
  border-radius: 24px;
  box-shadow: 0 14px 32px rgba(15, 23, 32, 0.05);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #0f1720;
  border: 1px solid #d7e7cf;
  border-radius: 14px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #9fe870;
  box-shadow: 0 0 0 4px rgba(201, 245, 174, 0.45);
}
```

### Component Notes
- Product cards should foreground practical tasks like sending, holding, and receiving money
- App screenshots and card visuals should feel real and operational, not decorative chrome
- CTAs should be prominent, but the UI should still read as efficient and transparent

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Tight alignment |
| `--space-3` | `8px` | Small gaps |
| `--space-4` | `12px` | Compact UI padding |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card interior spacing |
| `--space-7` | `32px` | Module grouping |
| `--space-8` | `48px` | Section rhythm |
| `--space-9` | `64px` | Hero spacing |
| `--space-10` | `96px` | Large product storytelling blocks |

### Layout Behavior
- Lead with one direct financial promise and support it with product proof
- Group capabilities into clear send, spend, receive, and manage clusters
- Use country or currency scale as a visual proof mechanism
- Prefer simple comparison and trust blocks over decorative marketing detours

### Whitespace Philosophy
Whitespace should feel **clean and operational**, giving global money features room to scan quickly without making the experience feel empty or cold.

---

## 6. Depth & Elevation

### Elevation Strategy
Wise uses **light product elevation**. Surfaces float softly above pale-mint sections, but the interface relies more on grouping and color balance than on dramatic shadow.

```css
--shadow-soft: 0 8px 20px rgba(15, 23, 32, 0.04);
--shadow-card: 0 16px 36px rgba(15, 23, 32, 0.07);
--shadow-focus: 0 0 0 4px rgba(201, 245, 174, 0.45);
```

### Surface Hierarchy
- White base canvas
- Pale-mint support sections
- Elevated white product cards
- Deep green or ink sections for contrast and CTA framing

---

## 7. Do's and Don'ts

### Do
- Keep Wise clear, useful, and globally oriented
- Use green as a fresh brand signal, not as a loud background everywhere
- Make tasks and financial benefits immediately understandable
- Let product screenshots and real use cases anchor the system

### Don't
- Do not make Wise feel like a legacy bank portal
- Do not overdecorate with abstract fintech gradients
- Do not hide key pricing or trust cues behind flashy marketing copy
- Do not turn the palette into generic dark-mode crypto styling

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked product proofs, full-width CTAs, simplified country/currency modules |
| Tablet | `768px - 1023px` | Two-column product and trust layouts |
| Desktop | `1024px+` | Wide hero, multi-card product storytelling, large proof sections |

### Responsive Rules
- Keep send/spend/receive paths obvious on small screens
- Stack screenshots and copy rather than shrinking type too aggressively
- Preserve card clarity and trust messaging across breakpoints
- Maintain generous tap targets for CTAs and currency tasks

---

## 9. Agent Prompt Guide

### Quick Reference
- Fresh green brand palette with white and pale-mint support surfaces
- Bold, practical headlines and transparent product messaging
- Real app/card visuals, rounded cards, and soft product elevation
- International, useful, and modern rather than luxurious or playful

### Prompt Template
```text
Design this like Wise's current public website:
- fresh green brand accents with white and pale-mint surfaces
- bold practical typography and very clear money-task messaging
- rounded product cards with app screenshots and real financial workflows
- clean global fintech feel focused on transparency and speed
- modern, useful, and operational rather than bank-like or flashy
```
