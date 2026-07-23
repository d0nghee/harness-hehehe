# Plaid Design System

> Open-finance product design with dark trust-first foundations, bright blue holographic gradients, and precise onboarding flows. Plaid's current web and product language combines financial credibility with modern digital optimism so data connectivity feels secure, fast, and easy to adopt.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Plaid communicates **financial infrastructure with human-friendly clarity**. The brand direction draws from paper currency details, security marks, and guilloche patterns, then translates them into crisp digital gradients, simplified product surfaces, and high-trust onboarding moments.

### Mood & Feeling
- **Trustworthy**: core experiences should feel safe and institution-ready
- **Modern**: the interface should feel current, digital, and forward-looking
- **Precise**: data, verification, and payment flows need tight visual control
- **Optimistic**: brand moments use color and light to suggest progress
- **Friction-reducing**: onboarding and consent should feel quick and calm

### Design Density
**Medium density** overall. Marketing pages use spacious storytelling with bold illustrations, while product and Link-style surfaces tighten the layout to support forms, institution search, consent, and verification states.

### Visual Character
- Deep navy and charcoal foundations for trust
- Bright blue and cyan gradients inspired by holographic security strips
- Clean white and mist surfaces for forms and product cards
- Fine-line illustrations, currency-inspired patterning, and editorial imagery
- Strong contrast between dark hero sections and light product surfaces
- Straightforward copy and concise interface language

---

## 2. Color Palette & Roles

### Core Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--plaid-blue` | `#0A85FF` | Primary action and key highlight |
| `--plaid-blue-dark` | `#0668D8` | Hover / pressed state |
| `--plaid-cyan` | `#37D7FF` | Gradient support and bright accent |
| `--plaid-indigo` | `#275EF1` | Secondary brand anchor |

### Trust and Surface Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--ink-strong` | `#0B1020` | Hero background and strongest text |
| `--ink-default` | `#162033` | Product frame and dark panels |
| `--text-primary` | `#111827` | Primary text on light surfaces |
| `--text-secondary` | `#475569` | Body and supporting text |
| `--surface-page` | `#F7FAFC` | Main page background |
| `--surface-card` | `#FFFFFF` | Cards, forms, and consent panels |
| `--surface-soft` | `#EAF5FF` | Soft highlighted background |
| `--border-default` | `#D9E5F2` | Inputs, dividers, and card borders |

### Status and Supportive Colors

| Token | Hex | Role |
|-------|-----|------|
| `--success` | `#10B981` | Success and verified state |
| `--warning` | `#F59E0B` | Warning / review state |
| `--danger` | `#DC2626` | Error / destructive state |
| `--lavender` | `#A78BFA` | Gradient enrichment and editorial accent |

### Color Usage Rules
- Use blue gradients to suggest network intelligence, security, and motion.
- Reserve the darkest ink surfaces for hero areas, product depth, and trust-heavy storytelling.
- Keep form panels and consent flows mostly white to preserve clarity.
- Use bright accents sparingly so CTAs and key metrics stay prominent.
- Avoid rainbow-heavy palettes; Plaid should feel focused, not playful-chaotic.

---

## 3. Typography Rules

### Font Stack

```css
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", sans-serif;

--font-mono: "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| Hero Display | 64px | 700 | 1.02 | Homepage or campaign hero |
| Page Title | 44px | 700 | 1.08 | Major landing titles |
| Section Title | 32px | 700 | 1.15 | Section headers |
| Card Title | 22px | 600 | 1.25 | Product cards and modules |
| Subsection | 18px | 600 | 1.35 | Supporting headings |
| Body Large | 18px | 400 | 1.65 | Intro copy |
| Body | 16px | 400 | 1.6 | Standard body text |
| Small Body | 14px | 400 | 1.5 | Meta, helper, and label text |
| Label | 13px | 600 | 1.4 | Inputs and micro labels |
| Code | 13px | 500 | 1.55 | API snippets and tokens |

### Typography Guidance
- Use bold, high-contrast headlines with short line lengths.
- Keep body copy concise and conversational.
- Prefer sentence case over all caps for a calmer, more modern tone.
- Use monospace only where API, data, or technical implementation context adds value.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: linear-gradient(135deg, #0A85FF 0%, #275EF1 100%);
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  font: 600 14px/1 Inter, sans-serif;
  box-shadow: 0 10px 24px rgba(39, 94, 241, 0.22);
}

.button-primary:hover {
  filter: brightness(0.97);
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #111827;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #D9E5F2;
  border-radius: 999px;
  font: 600 14px/1 Inter, sans-serif;
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  background: #FFFFFF;
  color: #111827;
  border: 1px solid #D9E5F2;
  border-radius: 14px;
  font: 400 16px/1.2 Inter, sans-serif;
}

.input:focus {
  outline: none;
  border-color: #0A85FF;
  box-shadow: 0 0 0 3px rgba(10, 133, 255, 0.14);
}
```

### Consent / Verification Panel

```css
.consent-panel {
  background: #FFFFFF;
  border: 1px solid #D9E5F2;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 18px 40px rgba(11, 16, 32, 0.08);
}
```

### Dark Feature Frame

```css
.feature-frame {
  background: #0B1020;
  color: #FFFFFF;
  border-radius: 28px;
  padding: 28px;
  overflow: hidden;
}
```

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Tight spacing |
| `--space-3` | `12px` | Input and label rhythm |
| `--space-4` | `16px` | Core spacing |
| `--space-5` | `24px` | Card padding |
| `--space-6` | `32px` | Section grouping |
| `--space-8` | `48px` | Major content rhythm |
| `--space-10` | `64px` | Hero and large-section spacing |

### Layout Rules
- Alternate dark editorial sections with light product sections to preserve momentum.
- Keep onboarding and consent modules centered with narrow, readable widths.
- Use strong grouping for institution search, verification, and fraud-related content.
- Let illustrations and gradients support the message, but keep UI panels function-first.
- Maintain wide breathing room around key CTA paths.

### Grid Approach
- Use a 12-column desktop grid for marketing and product storytelling.
- Collapse to 6 columns on tablet and a single-column flow on mobile.
- Keep dense forms and connection flows within constrained content widths.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base | pale cool page field | Default canvas |
| Card | white bordered module | Standard content grouping |
| Consent panel | elevated white surface | Link, verification, and onboarding |
| Dark frame | high-contrast ink surface | Hero and feature emphasis |
| Overlay | deeper elevated light panel | Modal or focused flow |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 8px 18px rgba(11, 16, 32, 0.06);
}

.shadow-panel {
  box-shadow: 0 18px 40px rgba(11, 16, 32, 0.10);
}

.shadow-overlay {
  box-shadow: 0 28px 64px rgba(11, 16, 32, 0.16);
}
```

### Elevation Guidance
- Use shadows subtly on light surfaces and rely on contrast, not heavy blur, on dark surfaces.
- Pair elevation with rounded corners so product modules feel refined, not severe.
- Keep the sharpest emphasis on onboarding panels and CTA-focused content.

---

## 7. Do's and Don'ts

### Do
- Use dark-to-light contrast to separate trust messaging from task surfaces.
- Make account-linking and consent steps feel simple and low-friction.
- Use gradients and currency-inspired patterning as supporting identity cues.
- Keep copy plainspoken and direct.
- Design technical flows to feel approachable for first-time fintech users.

### Don't
- Overload key forms with too many decorative layers.
- Use playful consumer-app styling that weakens trust.
- Let gradients overpower text contrast or functional UI.
- Make onboarding steps feel bureaucratic or visually dense.
- Depend on jargon-heavy copy to explain simple actions.

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Single-column flow, stacked CTAs, compressed hero art |
| Tablet | `768px` | Two-column layout where useful, simplified panels |
| Desktop | `1200px` | Full editorial rhythm, wide section spacing, larger hero treatments |

### Mobile Rules
- Collapse complex hero compositions into a single focal illustration or gradient panel.
- Keep institution search, verification, and consent tasks vertically sequenced.
- Preserve at least `44px` touch targets for buttons and major controls.
- Reduce decorative pattern density before reducing readability.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Theme**: secure open-finance platform with modern blue holographic energy
- **Primary colors**: `#0A85FF`, `#275EF1`, `#37D7FF`, `#0B1020`
- **Surfaces**: dark editorial frames plus clean white consent and form panels
- **Typography**: bold sans-serif headlines, concise body copy, occasional monospace
- **Components**: pill CTAs, rounded bordered inputs, elevated onboarding panels
- **Mood**: trusted, precise, modern, low-friction, financially credible

### Prompt Snippet

```text
Design this interface in the style of Plaid’s current design language: dark trust-first hero surfaces, bright blue-to-cyan holographic accents, clean white onboarding panels, rounded high-clarity inputs, concise and conversational fintech copy, and a strong sense of security, precision, and low-friction account connectivity.
```
