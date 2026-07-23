# Monzo Design System

> Mobile banking with cheerful confidence. Monzo's current public site centers its signature Hot Coral card, bright white and soft cream surfaces, rounded app-first modules, playful illustrations, and colorful trust-forward storytelling that makes money management feel friendly, immediate, and human.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Monzo feels like **personal finance redesigned as a friendly mobile product**. The system is colorful, soft-edged, and app-led, but still clear about security and trust. It uses real app features, support claims, and product plans as the core story rather than abstract fintech posturing.

### Mood & Feeling
- Friendly and upbeat
- Practical, safe, and human
- Mobile-first and app-native
- Bright without becoming childish
- Trustworthy with a warm personality

### Design Density
**Medium density.** Monzo shows many account features, plans, and support cues, but keeps the page approachable through rounded cards, short copy blocks, and product-led layouts.

### Visual Character
- Hot Coral as the iconic brand anchor
- Bright white canvas with soft warm and pastel support tones
- App screenshots and card imagery as the main product proof
- Rounded shapes, soft illustrations, and conversational messaging
- Security and support presented in a reassuring, accessible way

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--monzo-coral` | `#FF5A5F` | Signature card color and primary brand accent |
| `--monzo-coral-deep` | `#E5484D` | Hover and active coral state |
| `--monzo-white` | `#FFFFFF` | Main canvas and cards |
| `--monzo-cream` | `#FFF7F0` | Warm section background |
| `--monzo-ink` | `#1F2A37` | Primary text and deep contrast |

### Support Palette

| Token | Hex | Role |
|-------|-----|------|
| `--monzo-blue` | `#2D6CDF` | Trust and secondary accent |
| `--monzo-mint` | `#CFF5D8` | Savings and positive state support |
| `--monzo-yellow` | `#FFD166` | Reward and highlight accent |
| `--monzo-border` | `#E6E6E6` | Card boundaries and separators |
| `--monzo-muted` | `#6B7280` | Secondary copy |

### Utility

| Token | Hex | Role |
|-------|-----|------|
| `--monzo-success` | `#2E8B57` | Positive account or savings state |
| `--monzo-warning` | `#C98600` | Warning or caution state |
| `--monzo-danger` | `#D14343` | Fraud or error notice |
| `--monzo-focus` | `#9FC2FF` | Focus ring tint |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Monzo Sans", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Monzo Sans", system-ui, -apple-system, sans-serif;
--font-mono: "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 70px | 700 | 1.02 | -0.03em | `#1F2A37` |
| Page Title | 50px | 700 | 1.08 | -0.02em | `#1F2A37` |
| Section Title | 34px | 700 | 1.12 | -0.015em | `#1F2A37` |
| Card Title | 22px | 600 | 1.22 | -0.01em | `#1F2A37` |
| Body Large | 18px | 400 | 1.6 | 0 | `#1F2A37` |
| Body | 16px | 400 | 1.6 | 0 | `#1F2A37` |
| Small Body | 14px | 400 | 1.45 | 0 | `#6B7280` |
| Label | 12px | 700 | 1.3 | 0.04em | `#6B7280` |

### Typography Philosophy
Monzo typography should feel **warm, direct, and highly legible**. The voice can be conversational, but hierarchy must stay clear because trust and feature understanding matter as much as personality.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #ff5a5f;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 700;
}

.button-primary:hover {
  background: #e5484d;
}

.button-secondary {
  background: #ffffff;
  color: #1f2a37;
  border: 1px solid #e6e6e6;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and App Modules

```css
.app-card {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 24px;
  box-shadow: 0 16px 32px rgba(31, 42, 55, 0.06);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #1f2a37;
  border: 1px solid #e6e6e6;
  border-radius: 14px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #2d6cdf;
  box-shadow: 0 0 0 4px rgba(159, 194, 255, 0.35);
}
```

### Component Notes
- Product modules should feel like extensions of the app, not generic landing-page tiles
- Security and trust callouts deserve a friendly but clear visual treatment
- Coral is the unmistakable brand flag, but supporting pastels should keep the system warm and balanced

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Tight alignment |
| `--space-3` | `8px` | Small gaps |
| `--space-4` | `12px` | Compact padding |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card internals |
| `--space-7` | `32px` | Module grouping |
| `--space-8` | `48px` | Section rhythm |
| `--space-9` | `64px` | Hero spacing |
| `--space-10` | `96px` | Large product and trust sections |

### Layout Behavior
- Lead with the app and card as the central proof objects
- Break account benefits into approachable, short feature clusters
- Mix product screens, support messaging, and playful illustration moments
- Keep plan comparison and safety features easy to scan and non-threatening

### Whitespace Philosophy
Whitespace should feel **friendly and breathable**, giving the page warmth and app clarity without making finance feel empty or overly polished.

---

## 6. Depth & Elevation

### Elevation Strategy
Monzo uses **soft consumer-product elevation**. Cards float lightly, while color, illustration, and app framing do most of the emotional work.

```css
--shadow-soft: 0 8px 20px rgba(31, 42, 55, 0.05);
--shadow-card: 0 16px 32px rgba(31, 42, 55, 0.07);
--shadow-focus: 0 0 0 4px rgba(159, 194, 255, 0.35);
```

### Surface Hierarchy
- White base canvas
- Warm cream and pastel support sections
- Elevated white app cards
- Coral CTA and card surfaces as the strongest brand moments

---

## 7. Do's and Don'ts

### Do
- Keep Monzo warm, mobile-first, and immediately understandable
- Use coral confidently as the anchor brand signal
- Make trust and support feel human and accessible
- Let the app and card do most of the storytelling

### Don't
- Do not make Monzo feel like stiff legacy banking
- Do not overcomplicate layouts with enterprise-style data density
- Do not replace coral warmth with generic blue fintech minimalism
- Do not make safety messaging feel fear-based or severe

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked app screens, simple plan cards, full-width CTAs |
| Tablet | `768px - 1023px` | Two-column feature and support groupings |
| Desktop | `1024px+` | Full card-led hero, broader plan comparison, mixed illustration/product storytelling |

### Responsive Rules
- Keep the Hot Coral card visible in key mobile layouts
- Stack feature and support blocks before shrinking type too aggressively
- Preserve generous tap targets and simple plan-selection paths
- Maintain clear contrast between trust messaging and cheerful brand moments

---

## 9. Agent Prompt Guide

### Quick Reference
- Hot Coral brand core with white, cream, and soft pastel support
- Friendly mobile-banking tone with rounded app-first cards
- Warm, direct typography and highly approachable product storytelling
- Trustworthy, human, and colorful rather than formal or bank-like

### Prompt Template
```text
Design this like Monzo's current public website:
- Hot Coral brand accents with bright white and warm pastel surfaces
- rounded mobile-app product cards and soft friendly illustrations
- direct, human copy with strong trust and support cues
- app-led personal-finance storytelling with simple plan and feature blocks
- cheerful, safe, modern banking energy rather than legacy bank stiffness
```
