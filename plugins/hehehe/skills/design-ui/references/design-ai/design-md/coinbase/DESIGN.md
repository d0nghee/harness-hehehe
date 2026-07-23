# Coinbase Design System

> Crypto finance with a highly controlled, confidence-first interface. Coinbase's current public site pairs `Coinbase Sans` with a bright signature blue (`#0052FF`), abundant white space, pale blue support surfaces (`#EEF4FF`), deep text grays, and rounded product cards that frame charts and balances cleanly.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Coinbase feels like **consumer fintech upgraded for crypto volatility**. The interface is bright, trustworthy, and intentionally simple, with blue acting as the main stabilizing signal across a category that can otherwise feel chaotic.

### Mood & Feeling
- Trustworthy and highly legible
- Minimal, but not cold
- Financially disciplined
- Beginner-friendly without feeling unsophisticated
- Clean and product-led

### Design Density
**Medium density.** Coinbase surfaces show charts, balances, asset lists, and educational content, but the spacing and card framing keep the experience approachable.

### Visual Character
- Bright white pages with blue anchors
- Rounded cards and soft blue tints
- Clear hierarchy for finance and asset data
- Minimal decorative noise
- Charts and token lists treated as first-class UI

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--coinbase-blue` | `#0052FF` | Primary CTA, links, brand anchor |
| `--coinbase-blue-soft` | `#EEF4FF` | Soft accent surfaces |
| `--coinbase-white` | `#FFFFFF` | Base canvas and cards |
| `--coinbase-ink` | `#0A0B0D` | Primary text |
| `--coinbase-muted` | `#5B616E` | Secondary text |

### Data and Utility

| Token | Hex | Role |
|-------|-----|------|
| `--coinbase-border` | `#E3E8EF` | Cards, tables, dividers |
| `--coinbase-surface` | `#F7F9FC` | Neutral section fill |
| `--coinbase-success` | `#098551` | Positive movement / success |
| `--coinbase-danger` | `#CF202F` | Negative movement / warning |
| `--coinbase-info` | `#2D6BFF` | Informational emphasis |

---

## 3. Typography Rules

### Font Stack

```css
--font-sans: "Coinbase Sans", "Helvetica Neue", Arial, sans-serif;
--font-display: "Coinbase Sans", "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 72px | 600 | 1.02 | -0.04em | `#0A0B0D` |
| Page Title | 48px | 600 | 1.08 | -0.02em | `#0A0B0D` |
| Section Title | 34px | 600 | 1.12 | -0.02em | `#0A0B0D` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#0A0B0D` |
| Body Large | 18px | 400 | 1.55 | 0 | `#0A0B0D` |
| Body | 16px | 400 | 1.55 | 0 | `#0A0B0D` |
| Small Body | 14px | 400 | 1.45 | 0 | `#5B616E` |
| Label | 12px | 600 | 1.3 | 0.04em | `#5B616E` |

### Typography Philosophy
Coinbase typography should feel **clean, exact, and low-drama**. Big headlines create confidence, while finance-heavy body content stays neutral and readable.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #0052ff;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 600;
}

.button-primary:hover {
  background: #0043d9;
}

.button-secondary {
  background: #ffffff;
  color: #0a0b0d;
  border: 1px solid #e3e8ef;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and Market Modules

```css
.market-card {
  background: #ffffff;
  border: 1px solid #e3e8ef;
  border-radius: 24px;
  box-shadow: 0 12px 28px rgba(10, 11, 13, 0.06);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #0a0b0d;
  border: 1px solid #e3e8ef;
  border-radius: 16px;
  min-height: 52px;
  padding: 14px 16px;
}

.input:focus {
  outline: none;
  border-color: #0052ff;
  box-shadow: 0 0 0 4px rgba(0, 82, 255, 0.12);
}
```

### Component Notes
- Asset lists and chart modules should feel stable and highly legible
- Blue is a directional brand color, not a background blanket
- Rounded shells should feel polished, not bubbly

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Dense data alignment |
| `--space-3` | `8px` | Small rhythm |
| `--space-4` | `12px` | Compact form spacing |
| `--space-5` | `16px` | Default component spacing |
| `--space-6` | `24px` | Card interiors |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section spacing |
| `--space-9` | `64px` | Hero structure |

### Layout Behavior
- Keep the main promise and CTA immediately visible
- Use wide white space to reduce crypto-related anxiety
- Present asset data in clean, repeatable cards and lists
- Let education and onboarding content sit close to trading entry points

### Whitespace Philosophy
Whitespace should feel **reassuring and financial**, creating the sense that every data point has room and intention.

---

## 6. Depth & Elevation

### Elevation Strategy
Coinbase uses **light, careful elevation**. Most separation comes from card borders, gentle shadows, and pale tinted backgrounds.

```css
--shadow-soft: 0 6px 18px rgba(10, 11, 13, 0.05);
--shadow-card: 0 14px 32px rgba(10, 11, 13, 0.08);
```

### Surface Hierarchy
- White base canvas
- Soft neutral and pale-blue support sections
- Rounded bordered cards
- Blue CTA accents

---

## 7. Do's and Don'ts

### Do
- Keep the experience calm, exact, and trustworthy
- Let blue provide clear orientation and action
- Treat data and education content as equally important
- Preserve strong spacing and readable borders

### Don't
- Do not turn Coinbase into a noisy crypto trading theme
- Do not overuse gradients, glows, or neon highlights
- Do not bury charts and prices under decorative copy
- Do not make the UI feel flimsy or trend-chasing

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked market cards and simplified hero actions |
| Tablet | `768px - 1023px` | Split modules with reduced chart framing |
| Desktop | `1024px+` | Wide hero plus multi-card market and education sections |

### Responsive Rules
- Prioritize buy/sell/onboarding clarity on mobile
- Keep price lists scrollable instead of cramming columns
- Preserve generous card padding even when grids collapse
- Maintain at least `44px` touch targets in finance actions

---

## 9. Agent Prompt Guide

### Quick Reference
- White and pale-blue foundation with Coinbase blue as the anchor
- Clean rounded cards for prices, charts, and balances
- Minimal, precise, trust-first crypto-finance styling
- Calm headline system and strong data legibility

### Prompt Template
```text
Design this like Coinbase's current public website:
- bright white finance UI with pale-blue support surfaces
- Coinbase-blue CTAs, links, and trust accents
- rounded bordered cards for charts, balances, and asset lists
- minimal, calm typography and strong financial clarity
- modern crypto onboarding without noisy trading-platform chaos
```
