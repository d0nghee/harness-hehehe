# Airtable Design System

> App-building product design with bright trust-blue accents, calm productivity surfaces, and flexible no-code structure. Airtable’s current web and product language blends enterprise clarity with approachable visual energy so complex workflows feel configurable, not intimidating.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Airtable expresses **flexible power with minimal friction**. The product needs to feel visual and configurable, but still solid enough for enterprise-critical workflows. The overall tone is optimistic, organized, and modern.

### Mood & Feeling
- **Flexible**: users should feel they can shape the system to their workflow
- **Approachable**: no-code power should feel friendly rather than technical
- **Structured**: dense workflow UIs still need clear hierarchy
- **Modern**: layouts feel current, crisp, and product-led
- **Collaborative**: the interface should support teams and shared work clearly

### Design Density
**Medium density**. Airtable often carries grids, interfaces, records, automations, and builder controls, but those surfaces are spaced and grouped to stay readable.

### Visual Character
- Bright blue-led primary accents
- White and cool-neutral surfaces
- Rounded but efficient component shapes
- Product screenshots and interface previews as hero assets
- Clear modular cards for features, use cases, and workflows

---

## 2. Color Palette & Roles

### Core Brand and Product Colors

| Token | Hex | Role |
|-------|-----|------|
| `--airtable-blue` | `#1C6BFF` | Primary CTA and action color |
| `--airtable-blue-dark` | `#1557D6` | Hover / pressed state |
| `--airtable-blue-soft` | `#E8F0FF` | Subtle highlighted surface |

### Neutral Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--ink-strong` | `#111827` | Primary text |
| `--ink-default` | `#334155` | Body text |
| `--ink-muted` | `#64748B` | Secondary text |
| `--surface-page` | `#F8FAFC` | Page background |
| `--surface-card` | `#FFFFFF` | Card and app surface |
| `--border-default` | `#E2E8F0` | Border and divider |

### Supporting Accents

| Token | Hex | Role |
|-------|-----|------|
| `--aqua` | `#18BFFF` | Supporting product accent |
| `--yellow` | `#FACC15` | Warm callout / optimism accent |
| `--coral` | `#FF6B6B` | Highlight and illustration support |
| `--green` | `#16A34A` | Success / positive state |

### Color Usage Rules
- Use blue as the clearest interaction signal.
- Keep neutral surfaces dominant in workflow UI.
- Use supporting accents more in marketing and illustrations than in the product shell.
- Preserve strong contrast for grids, forms, and dense builder layouts.

---

## 3. Typography Rules

### Font Stack

```css
/* Airtable-style modern productivity sans */
--font-sans: Inter, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 54px | 700 | 1.05 | -0.02em | Homepage hero |
| Page Title | 38px | 700 | 1.1 | -0.015em | Major title |
| Section Title | 28px | 600 | 1.15 | -0.01em | Section heading |
| Card Title | 20px | 600 | 1.25 | 0 | Feature or workflow card |
| Body | 16px | 400 | 1.6 | 0 | Main content |
| Small Body | 14px | 400 | 1.5 | 0 | Secondary content |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons and form labels |
| Code | 13px | 400 | 1.5 | 0 | Formula or technical values |

### Typography Philosophy
Airtable typography should feel **productive, clear, and contemporary**. It needs to support both bright marketing storytelling and denser builder workflows without losing readability.

### Practical Rules
- Keep headlines short and high-confidence.
- Use modular blocks of body copy instead of long text walls.
- Use monospace sparingly for formulas, field types, and technical configuration moments.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #1C6BFF;
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #1C6BFF;
  border-radius: 999px;
  font: 600 14px/1 Inter, sans-serif;
}

.button-primary:hover {
  background: #1557D6;
  border-color: #1557D6;
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #111827;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #E2E8F0;
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
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font: 400 16px/1.2 Inter, sans-serif;
}

.input:focus {
  outline: none;
  border-color: #1C6BFF;
  box-shadow: 0 0 0 3px rgba(28, 107, 255, 0.14);
}
```

### Cards and Interface Frames

#### Feature Card
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 24px;
}
```

#### Builder Preview Panel
```css
.builder-panel {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.08);
}
```

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Tight spacing |
| `--space-4` | `16px` | Core spacing |
| `--space-5` | `24px` | Card spacing |
| `--space-6` | `32px` | Section spacing |
| `--space-8` | `48px` | Major grouping |
| `--space-10` | `64px` | Large layout rhythm |

### Layout Rules
- Keep product previews visually central in marketing sections.
- Use modular cards to explain capabilities and use cases.
- Separate builder, data, and automation concepts into distinct visual zones.
- Maintain clear alignment and consistent spacing in denser product views.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base | light neutral page field | Main app or page canvas |
| Card | white bounded module | Standard grouping |
| Builder panel | elevated white surface | Product preview and focused workflows |
| Overlay | stronger elevated surface | Modal or drawer |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 6px 14px rgba(17, 24, 39, 0.06);
}

.shadow-panel {
  box-shadow: 0 18px 30px rgba(17, 24, 39, 0.12);
}
```

### Depth Rules
- Use depth to support workflow focus, not decoration.
- Keep cards calm and light.
- Reserve stronger elevation for previews, dialogs, and configuration-heavy panels.

---

## 7. Do's and Don'ts

### Do
- Use Airtable blue consistently for primary actions.
- Keep workflow complexity grouped into clean modules.
- Balance visual friendliness with enterprise clarity.
- Let previews and interfaces demonstrate product value.

### Don't
- Overload the UI with too many bright accent colors.
- Turn dense workflow screens into noisy dashboards.
- Hide key builder actions in low-contrast layouts.
- Treat every card as a unique visual system.

---

## 8. Responsive Behavior

### Responsive Rules
- Stack workflow panels and preview frames early on smaller screens.
- Preserve strong CTA visibility without crowding.
- Keep tables and interface previews readable with simplified framing on mobile.
- Maintain generous touch targets in creation and editing contexts.

### Mobile Character
Airtable mobile should still feel flexible and clean. Even when stacked, the product must preserve its approachable no-code energy and clear action structure.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: flexible, modern, approachable
- **Primary accent**: Airtable blue `#1C6BFF`
- **Core layout**: modular cards and builder-preview sections
- **Typography**: modern productivity sans
- **Components**: pill CTAs, rounded inputs, elevated builder panels

### Prompt Snippet

```text
Design this interface in the style of Airtable’s current product and marketing experience. Use a bright blue primary accent (#1C6BFF), light neutral surfaces, modern productivity typography, modular workflow cards, and strong builder preview framing. The result should feel flexible, approachable, and enterprise-capable rather than cluttered or overly technical.
```

