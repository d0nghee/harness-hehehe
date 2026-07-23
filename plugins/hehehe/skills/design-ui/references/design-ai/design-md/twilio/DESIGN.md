# Twilio Design System

> Developer-first enterprise platform with approachable polish. Twilio Sans, a disciplined 8px grid, token-driven semantics, and restrained use of brand red create a system that feels clean, professional, and neighborly without losing technical credibility.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Twilio’s design language, expressed through Paste, feels like **serious software made friendly**. It avoids startup flash and cold enterprise heaviness at the same time. The visual system emphasizes accessible controls, tokenized consistency, and clean composability for product surfaces used all day by developers and operations teams.

### Mood & Feeling
- **Clean**: interfaces should reduce clutter and present one clear next step
- **Professional**: strong visual hierarchy, semantic consistency, and trusted form patterns
- **Neighborly**: subtle warmth and optimism, especially in onboarding and success moments
- **Composable**: everything should feel like it belongs to a coherent system, not a gallery of one-off screens
- **Accessible-first**: focus, contrast, and predictable interaction are non-negotiable

### Design Density
**Medium density** with strong spacing discipline. Twilio interfaces often include forms, settings, and account tooling, but Paste keeps them readable with generous whitespace and careful grouping.

### Visual Character
- Brand red is intentionally restrained in product UI
- Blue is used for primary interactive elements like buttons and links
- Panels and cards use soft radii with subtle borders
- Typography is clean and modern, with a distinct branded superfamily
- Layout rhythm is unmistakably grid-driven and token-based
- Interfaces feel inviting without becoming playful

---

## 2. Color Palette & Roles

### Core Product Colors

| Token | Hex | Role |
|-------|-----|------|
| `--twilio-blue-60` | `#0263E0` | Primary interactive color, filled buttons, active links |
| `--twilio-blue-70` | `#0047B3` | Hover / stronger active state |
| `--twilio-blue-10` | `#E8F0FE` | Light interactive backgrounds |
| `--twilio-red` | `#F22F46` | Brand color, illustrations, highlight moments |
| `--twilio-red-strong` | `#D61F3C` | Destructive action, error-heavy states |

### Neutral Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--text-default` | `#121C2D` | Primary text |
| `--text-weak` | `#3E546B` | Secondary copy |
| `--text-weaker` | `#6B7C93` | Metadata, placeholder, helper text |
| `--surface-body` | `#F4F6F8` | App background |
| `--surface-default` | `#FFFFFF` | Cards, forms, panels |
| `--surface-strong` | `#DDE4EE` | Subdued surface / selected non-primary UI |
| `--border-default` | `#C9D3DD` | Default border |
| `--border-weak` | `#E1E7EF` | Low-contrast divider |

### Semantic States

| Token | Hex | Role |
|-------|-----|------|
| `--success` | `#0C8B5D` | Success states, confirmations |
| `--success-weak` | `#E7F7F0` | Success backgrounds |
| `--warning` | `#D97706` | Warning text / border |
| `--warning-weak` | `#FFF4E5` | Warning backgrounds |
| `--error` | `#D61F3C` | Error text / destructive state |
| `--error-weak` | `#FDECEE` | Error backgrounds |
| `--info` | `#0263E0` | Informational state |

### Color Usage Rules
- Reserve brand red for brand moments and destructive emphasis.
- Use blue to indicate primary interactivity.
- Let neutrals do the structural work in forms and tables.
- Apply semantic colors through tokens and paired text/icon treatments rather than arbitrary fills.

---

## 3. Typography Rules

### Font Stack

```css
/* Twilio's branded superfamily */
--font-display: 'Twilio Sans Display', 'Inter', 'Helvetica Neue', Arial, sans-serif;
--font-text: 'Twilio Sans Text', 'Inter', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'Twilio Sans Mono', 'SF Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 56px | 700 | 1.05 | -0.02em | Product hero / marketing statement |
| Page Title | 40px | 700 | 1.1 | -0.015em | High-level page title |
| Section Title | 28px | 700 | 1.15 | -0.01em | Major sections |
| Card Title | 20px | 600 | 1.25 | -0.005em | Panels and cards |
| Subsection | 18px | 600 | 1.3 | 0 | Supporting headings |
| Body | 16px | 400 | 1.6 | 0 | Primary body and field text |
| Small Body | 14px | 400 | 1.5 | 0 | Dense UI copy |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons and form labels |
| Caption | 12px | 500 | 1.4 | 0.01em | Metadata, helper notes |
| Code | 13px | 400 | 1.5 | 0 | Technical identifiers |

### Typography Philosophy
Twilio’s typography is **branded but practical**. Display styles help marketing pages feel distinct, while Text and Mono keep product surfaces calm and legible in dense contexts.

### Practical Rules
- Use `Twilio Sans Display` for large marketing and page-heading moments.
- Use `Twilio Sans Text` for almost all product UI copy.
- Use `Twilio Sans Mono` for code, logs, credentials, and API-related content.
- Keep button labels in sentence case and verb-forward.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #0263E0;
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: 600 14px/1 'Twilio Sans Text', Inter, sans-serif;
  transition: background 140ms ease, box-shadow 140ms ease;
}

.button-primary:hover {
  background: #0047B3;
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(2, 99, 224, 0.2);
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #121C2D;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid #C9D3DD;
  border-radius: 6px;
  font-weight: 600;
}

.button-secondary:hover {
  background: #F4F6F8;
}
```

#### Destructive Button
```css
.button-destructive {
  background: #D61F3C;
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 6px;
}

.button-destructive:hover {
  background: #B51B34;
}
```

#### Link-Style Button
```css
.button-link {
  background: transparent;
  color: #0263E0;
  min-height: 32px;
  padding: 0;
  border: none;
  border-radius: 0;
  font-weight: 600;
}

.button-link:hover {
  color: #0047B3;
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  background: #FFFFFF;
  color: #121C2D;
  border: 1px solid #C9D3DD;
  border-radius: 6px;
  font: 400 16px/1.2 'Twilio Sans Text', Inter, sans-serif;
}

.input:hover {
  border-color: #94A3B8;
}

.input:focus {
  outline: none;
  border-color: #0263E0;
  box-shadow: 0 0 0 3px rgba(2, 99, 224, 0.16);
}

.input::placeholder {
  color: #6B7C93;
}
```

#### Label and Help Text
```css
.input-label {
  display: block;
  margin-bottom: 8px;
  color: #121C2D;
  font: 600 14px/1.3 'Twilio Sans Text', Inter, sans-serif;
}

.input-help {
  margin-top: 8px;
  color: #3E546B;
  font: 400 12px/1.4 'Twilio Sans Text', Inter, sans-serif;
}

.input-error {
  border-color: #D61F3C;
}
```

### Cards and Panels

#### Standard Card
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E1E7EF;
  border-radius: 8px;
  padding: 16px;
}
```

#### Elevated Panel
```css
.panel-elevated {
  background: #FFFFFF;
  border: 1px solid #E1E7EF;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(18, 28, 45, 0.08);
}
```

#### Status Card
```css
.status-card {
  background: #FFFFFF;
  border-left: 4px solid #0263E0;
  border-radius: 8px;
  padding: 16px;
}

.status-card.is-success {
  border-left-color: #0C8B5D;
}

.status-card.is-error {
  border-left-color: #D61F3C;
}
```

---

## 5. Layout Principles

### Grid and Spacing
Paste uses an **8px UI grid paired with a 4px baseline**. Most spacing should be multiples of 8, while 4px increments are available for finer adjustments.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-10` | `4px` | Fine adjustment |
| `--space-20` | `8px` | Tight internal spacing |
| `--space-30` | `12px` | Dense content |
| `--space-40` | `16px` | Default component padding |
| `--space-50` | `24px` | Standard panel spacing |
| `--space-60` | `32px` | Section spacing |
| `--space-80` | `48px` | Major grouping |
| `--space-100` | `64px` | Large page spacing |
| `--space-120` | `96px` | Outer margins / hero spacing |

### Layout Widths

| Layout Token | Value | Use |
|--------------|-------|-----|
| `--breakpoint-sm` | `400px` | Small responsive breakpoint |
| `--breakpoint-lg` | `1024px` | Standard desktop breakpoint |
| `--breakpoint-xl` | `1232px` | Max-width breakpoint |
| `--content-max` | `1232px` | Standard content max width |
| `--text-max` | `712px` | Comfortable body text measure |

### Layout Rules
- Group related content with “friendship spacing” rather than equal spacing everywhere.
- Prefer single-column forms; multi-column only when the relationship is obvious.
- Use max widths to keep text readable and tasks scannable.
- Align primary actions to flow direction and keep one primary action per screen.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base | `#F4F6F8` | App body background |
| Default | `#FFFFFF` with subtle border | Cards, forms, panels |
| Strong | `#DDE4EE` or border emphasis | Selected / nested state |
| Semantic | Tinted success/warning/error background | Alerts, inline status |

### Shadow System
Twilio uses depth carefully. Most hierarchy comes from spacing, borders, and panel grouping rather than aggressive shadow.

```css
.shadow-soft {
  box-shadow: 0 2px 8px rgba(18, 28, 45, 0.06);
}

.shadow-panel {
  box-shadow: 0 4px 12px rgba(18, 28, 45, 0.08);
}
```

### Depth Rules
- Prefer border and background contrast before stronger elevation.
- Use semantic tinted surfaces for messaging, not arbitrary shadows.
- Keep overlays and menus slightly more elevated than cards, never dramatically floating.

---

## 7. Do's and Don'ts

### Do
- Use blue as the primary interactive signal in product UI.
- Keep one primary button per task surface when possible.
- Follow 8px spacing multiples and token naming.
- Use Twilio Sans Mono for technical content.
- Make accessibility, focus treatment, and readable grouping obvious.

### Don't
- Flood product screens with Twilio red.
- Use inconsistent spacing or one-off hard-coded paddings.
- Split long forms into multiple columns without a strong reason.
- Hide meaning behind color alone.
- Make enterprise surfaces feel cold or overly severe.

---

## 8. Responsive Behavior

### Breakpoints
- `400px`: small responsive breakpoint
- `1024px`: desktop breakpoint
- `1232px`: max-width layout breakpoint

### Responsive Rules
- Start mobile-first and allow content to reflow into wider layouts progressively.
- Preserve the 8px spacing rhythm at every breakpoint.
- Stack form fields vertically by default.
- Keep primary actions easy to reach and visually singular on narrow screens.
- Maintain touch targets at `44px` or larger.

### Mobile Character
Twilio mobile layouts should still feel clean and product-grade, not stripped down. The same semantic color, spacing, and hierarchy rules should survive the narrower canvas.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: clean, professional, neighborly, developer-first
- **Primary interaction color**: blue `#0263E0`
- **Brand accent**: Twilio red `#F22F46`
- **Typography**: Twilio Sans Display, Text, Mono
- **Layout**: 8px grid, token-driven spacing, max width `1232px`
- **Components**: subtle cards, accessible form controls, one-primary-action screens

### Prompt Snippet

```text
Design this interface in the style of Twilio's current product language and Paste design system. Use Twilio Sans typography, an 8px spacing grid, blue (#0263E0) for primary interactivity, Twilio red (#F22F46) only for brand emphasis or destructive states, and calm enterprise surfaces with subtle borders and moderate radii. The interface should feel accessible, composable, developer-friendly, and confidently structured rather than flashy.
```
