# Databricks Design System

> Data-and-AI platform design with sharp technical clarity and optimistic orange energy. Databricks pairs modern enterprise typography, modular product storytelling, and bright coral-red accents with dark product imagery to make sophisticated platform concepts feel actionable.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Databricks communicates **enterprise AI momentum**. The current site uses bold but controlled color, clear modular sections, and product-led storytelling to present the lakehouse, AI agents, governance, and analytics as parts of one modern data platform. It should feel ambitious, but never chaotic.

### Mood & Feeling
- **Innovative**: AI and data should feel current and compelling
- **Credible**: large-enterprise trust matters as much as technical novelty
- **Fast**: layouts should suggest acceleration and practical progress
- **Modular**: complex platform capabilities are broken into clean blocks
- **Clear**: data-platform jargon should be framed with strong hierarchy

### Design Density
**Medium density**. Databricks pages cover a lot of capability breadth, but they stay readable because content is grouped into clearly bounded sections, proof points, and spotlight cards.

### Visual Character
- Coral-red/orange accent punctuates the brand
- Dark product images and dashboards provide technical depth
- Light page surfaces preserve clarity
- Rounded cards and highlight panels keep the system approachable
- Typography is current, concise, and product-driven

---

## 2. Color Palette & Roles

### Core Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--dbx-coral` | `#FF5F46` | Primary brand accent, CTA emphasis |
| `--dbx-coral-dark` | `#E84A32` | Hover / active state |
| `--dbx-coral-soft` | `#FFE8E2` | Tinted highlight surface |

### Neutral Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--ink-strong` | `#1B3139` | Primary text |
| `--ink-default` | `#314A52` | Body text |
| `--ink-muted` | `#6B7C85` | Secondary text |
| `--surface-page` | `#F7FAFC` | Page background |
| `--surface-card` | `#FFFFFF` | Card surface |
| `--surface-dark` | `#102A33` | Product / dark showcase frame |
| `--border-default` | `#DCE7EC` | Dividers and borders |

### Supporting Colors

| Token | Hex | Role |
|-------|-----|------|
| `--teal` | `#17B5C4` | Secondary data/AI accent |
| `--gold` | `#F3BA2F` | Attention highlight |
| `--success` | `#1E9E5A` | Success |
| `--danger` | `#D64545` | Error / destructive |

### Color Usage Rules
- Use coral as the main attention-directing color.
- Let dark product frames carry technical depth and screenshots.
- Use teal or gold only when they clarify categories or support visual differentiation.
- Keep the UI skeleton neutral and enterprise-clear.

---

## 3. Typography Rules

### Font Stack

```css
/* Modern enterprise data-platform sans */
--font-sans: Inter, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 56px | 700 | 1.04 | -0.025em | Hero headline |
| Page Title | 42px | 700 | 1.1 | -0.015em | Major title |
| Section Title | 30px | 600 | 1.15 | -0.01em | Platform section title |
| Card Title | 22px | 600 | 1.2 | -0.01em | Product / feature card |
| Subsection | 18px | 600 | 1.35 | 0 | Supporting heading |
| Body | 16px | 400 | 1.6 | 0 | Main content |
| Small Body | 14px | 400 | 1.5 | 0 | Secondary copy |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons and nav |
| Code | 13px | 400 | 1.5 | 0 | Data values / CLI / code |

### Typography Philosophy
Databricks typography is **direct and high-signal**. The hierarchy should help users absorb complex platform language quickly without burying them in dense technical prose.

### Practical Rules
- Keep headlines benefit-oriented and short.
- Use body copy in modular chunks.
- Use mono styles for notebooks, code, and technical identifiers.
- Avoid overly soft or casual text treatments.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #FF5F46;
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 999px;
  font: 600 14px/1 Inter, sans-serif;
}

.button-primary:hover {
  background: #E84A32;
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 95, 70, 0.18);
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #1B3139;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #DCE7EC;
  border-radius: 999px;
  font-weight: 600;
}

.button-secondary:hover {
  background: #F7FAFC;
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
  color: #1B3139;
  border: 1px solid #DCE7EC;
  border-radius: 14px;
  font: 400 16px/1.2 Inter, sans-serif;
}

.input:focus {
  outline: none;
  border-color: #FF5F46;
  box-shadow: 0 0 0 3px rgba(255, 95, 70, 0.14);
}
```

### Cards and Product Frames

#### Capability Card
```css
.card {
  background: #FFFFFF;
  border: 1px solid #DCE7EC;
  border-radius: 22px;
  padding: 24px;
}
```

#### Product Showcase
```css
.showcase {
  background: #102A33;
  color: #FFFFFF;
  border-radius: 24px;
  padding: 24px;
}
```

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Fine adjustment |
| `--space-2` | `8px` | Tight grouping |
| `--space-4` | `16px` | Core spacing |
| `--space-5` | `24px` | Card spacing |
| `--space-6` | `32px` | Section spacing |
| `--space-8` | `48px` | Major grouping |
| `--space-10` | `64px` | Large rhythm |

### Layout Rules
- Organize the platform story into distinct capability bands.
- Use highlight panels to surface proof, not to repeat everything.
- Alternate lighter overview sections with darker product frames.
- Keep CTA pathways obvious for demos, try free, and events.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Page base | `#F7FAFC` | Background |
| Card | white with border | Primary content |
| Highlight | coral-tinted or teal-tinted surface | Key spotlight |
| Product dark | dark showcase panel | Screenshots and product proof |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 8px 18px rgba(27, 49, 57, 0.08);
}

.shadow-showcase {
  box-shadow: 0 16px 28px rgba(16, 42, 51, 0.18);
}
```

### Depth Rules
- Use light border and subtle shadow on white cards.
- Use stronger elevation only for dark product modules.
- Keep highlight surfaces clean and roomy rather than heavily layered.

---

## 7. Do's and Don'ts

### Do
- Use coral-red to create urgency and brand recognition.
- Keep the platform story modular and easy to scan.
- Let dark product imagery signal technical depth.
- Maintain strong contrast and concise copy.
- Use a modern enterprise layout rhythm with clear proof blocks.

### Don't
- Overcrowd sections with too many platform details at once.
- Use multiple bright brand accents in every card.
- Make the experience feel like generic martech SaaS.
- Overstyle data visuals or notebook screenshots.
- Turn technical credibility into visual heaviness.

---

## 8. Responsive Behavior

### Responsive Rules
- Stack platform cards early while preserving clear CTA order.
- Keep dark product modules readable with simplified framing on mobile.
- Reduce supporting proof density before shrinking text too much.
- Maintain generous touch targets and clear button separation.
- Keep metrics and event banners compact but visually important.

### Mobile Character
Databricks mobile layouts should still feel fast and modern. The coral action color and strong modular structure should survive simplification without becoming bland or cramped.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: innovative, enterprise-clear, AI/data-forward
- **Primary accent**: coral `#FF5F46`
- **Base palette**: clean light neutrals + dark product frames
- **Typography**: modern enterprise sans
- **Layout**: modular capability bands and proof blocks
- **Components**: pill buttons, dark showcases, clean highlight cards

### Prompt Snippet

```text
Design this interface in the style of Databricks' current data-and-AI platform website. Use a modern enterprise layout, coral-red (#FF5F46) as the main attention color, clean light surfaces, dark product showcase frames, and concise high-signal typography. The result should feel innovative, credible, modular, and technically sharp without becoming cluttered.
```
