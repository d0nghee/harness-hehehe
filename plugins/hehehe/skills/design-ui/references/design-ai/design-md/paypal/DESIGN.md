# PayPal Design System

> Digital payments with a polished blue trust system. PayPal's current public site combines `PayPal Pro` / `PayPal Sans`-style typography with deep navy (`#003087`), bright blue (`#0070E0`), softer cyan-blue (`#009CDE`), white (`#FFFFFF`), and pale neutral backgrounds for commerce and finance messaging.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
PayPal feels like **consumer finance wrapped in high-recognition trust cues**. The interface balances approachability and security, using blue gradients and rounded surfaces to make transactions feel safe and simple.

### Mood & Feeling
- Trusted and accessible
- Familiar, mainstream, and dependable
- Friendly enough for everyday payments
- Structured enough for business finance
- Action-oriented, not overly editorial

### Design Density
**Medium density.** PayPal supports offers, credit products, and business tools, but the interface stays approachable through strong blue framing and card-based grouping.

### Visual Character
- Layered blues as the core brand signal
- White cards and rounded shells
- Large numeric and offer modules
- Smooth, consumer-friendly finance rhythm
- Clean checkout and card metaphors

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--paypal-navy` | `#003087` | Brand foundation, dark CTA surfaces |
| `--paypal-blue` | `#0070E0` | Primary brand blue |
| `--paypal-cyan` | `#009CDE` | Secondary bright accent |
| `--paypal-white` | `#FFFFFF` | Main surface, cards, inverse text |
| `--paypal-ink` | `#0C0C0D` | Primary text |

### Support and UI

| Token | Hex | Role |
|-------|-----|------|
| `--paypal-surface` | `#F5F7FA` | Page background |
| `--paypal-border` | `#D9E2EC` | Border and divider color |
| `--paypal-muted` | `#55606E` | Secondary text |
| `--paypal-success` | `#127A43` | Positive state |
| `--paypal-focus` | `rgba(0, 112, 224, 0.16)` | Focus ring |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "PayPal Pro", "Helvetica Neue", Arial, sans-serif;
--font-sans: "PayPal Sans Big", "PayPal Sans Small", system-ui, sans-serif;
--font-mono: "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 64px | 700 | 1.02 | -0.03em | `#003087` |
| Page Title | 48px | 700 | 1.08 | -0.02em | `#003087` |
| Section Title | 34px | 700 | 1.12 | -0.02em | `#003087` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#0C0C0D` |
| Body Large | 18px | 400 | 1.55 | 0 | `#0C0C0D` |
| Body | 16px | 400 | 1.55 | 0 | `#0C0C0D` |
| Small Body | 14px | 400 | 1.45 | 0 | `#55606E` |
| Label | 12px | 700 | 1.3 | 0.03em | `#0070E0` |

### Typography Philosophy
PayPal typography should feel **trustworthy, clean, and consumer-friendly**. The large headlines carry optimism; the smaller UI text should remain calm and highly legible.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #0070e0;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 700;
}

.button-primary:hover {
  background: #005dc1;
}

.button-secondary {
  background: #ffffff;
  color: #003087;
  border: 1px solid #003087;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and Offer Modules

```css
.card {
  background: #ffffff;
  border: 1px solid #d9e2ec;
  border-radius: 24px;
  box-shadow: 0 14px 32px rgba(0, 48, 135, 0.08);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #0c0c0d;
  border: 1px solid #d9e2ec;
  border-radius: 14px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #0070e0;
  box-shadow: 0 0 0 4px rgba(0, 112, 224, 0.16);
}
```

### Component Notes
- Buttons should feel friendly and touchable
- Offer cards and financing blocks need strong hierarchy
- Blue gradients can be used in hero or promotional framing, not every routine component

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Small alignments |
| `--space-3` | `8px` | Tight gaps |
| `--space-4` | `12px` | Control padding |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card rhythm |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section spacing |
| `--space-9` | `64px` | Hero layout |

### Layout Behavior
- Lead with trust and consumer value propositions
- Use large cards for offers, cash back, financing, and benefits
- Keep flows broad and scannable rather than dense and technical
- Let blue guide the eye through the page

### Whitespace Philosophy
Whitespace should feel **clean and reassuring**, giving financial actions room to breathe without making the site feel empty.

---

## 6. Depth & Elevation

### Elevation Strategy
PayPal uses **soft consumer-finance elevation**. Floating cards, rounded offer blocks, and light shadows create comfort and perceived safety.

```css
--shadow-soft: 0 8px 20px rgba(0, 48, 135, 0.06);
--shadow-card: 0 16px 36px rgba(0, 48, 135, 0.10);
```

### Surface Hierarchy
- Pale neutral page base
- White elevated cards
- Deep navy anchors
- Bright blue action accents

---

## 7. Do's and Don'ts

### Do
- Use blue as a trust and action system
- Keep rounded components polished and accessible
- Make payment choices and benefits easy to compare
- Preserve a mainstream, dependable consumer-finance tone

### Don't
- Do not overcomplicate the visual system with too many unrelated accents
- Do not turn PayPal into cold enterprise banking software
- Do not reduce contrast in critical payment actions
- Do not overuse gradients in low-level UI

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked offer cards and full-width key actions |
| Tablet | `768px - 1023px` | Two-column support modules and compact hero |
| Desktop | `1024px+` | Wide promotional rows and multi-card offer layouts |

### Responsive Rules
- Keep key payment and signup CTAs large and easy to reach
- Preserve readability of percentage and installment offers
- Collapse wide offer grids into stacked cards before reducing type too far
- Maintain strong contrast for legal and informational text

---

## 9. Agent Prompt Guide

### Quick Reference
- Deep navy and bright blue trust system on white cards
- Rounded, touchable finance UI with clean headlines
- Consumer-friendly payments and offers, not dense banking dashboards
- Soft elevation and approachable checkout-style components

### Prompt Template
```text
Design this like PayPal's current public website:
- deep navy and bright blue brand system on clean white cards
- rounded consumer-finance surfaces with soft shadows
- large trust-first headlines and clear payment/offer modules
- polished checkout-style buttons and fields
- dependable mainstream payments energy rather than cold banking minimalism
```
