# Workday Design System

> Enterprise operations design with calm authority and warm orange emphasis. Workday’s current visual language pairs soft neutrals, ink-heavy typography, rounded enterprise cards, and selective orange accents to make large-scale HR and finance workflows feel modern and human-centered.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Workday presents **human-centric enterprise software**. The brand feels polished and future-facing, but it avoids techno-overload. The current site balances cream and white surfaces, deep blue-gray text, warm orange highlights, and generous spacing to frame AI-driven product stories with confidence and warmth.

### Mood & Feeling
- **Human-first**: even complex software is presented as people-enabling
- **Forward-looking**: AI and automation are central, but not visually chaotic
- **Refined**: the layouts are spacious, intentional, and premium
- **Stable**: large-enterprise seriousness comes through in contrast and structure
- **Inviting**: orange accents add warmth and recognition

### Design Density
**Medium density**. Workday surfaces often combine storytelling, proof points, and product categories, but they keep breathing room around all major blocks.

### Visual Character
- Warm orange signals brand recognition and selective action emphasis
- Ink and navy tones ground the interface with credibility
- Cream and white surfaces soften enterprise content
- Large rounded cards and section blocks feel modern and approachable
- Typography is spacious and editorial, but still practical

---

## 2. Color Palette & Roles

### Core Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--workday-orange` | `#F38B00` | Brand accent, primary CTA emphasis |
| `--workday-orange-dark` | `#D97706` | Hover / stronger accent |
| `--workday-orange-soft` | `#FFE7C2` | Warm tinted background |

### Neutral Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--ink-strong` | `#0F172A` | Primary text |
| `--ink-default` | `#1F2937` | Body text |
| `--ink-muted` | `#64748B` | Secondary text |
| `--surface-cream` | `#F7F3EC` | Soft page background |
| `--surface-white` | `#FFFFFF` | Cards and panels |
| `--surface-soft` | `#F1F5F9` | Alternate section surface |
| `--border-default` | `#E2E8F0` | Borders and dividers |

### Supportive Colors

| Token | Hex | Role |
|-------|-----|------|
| `--navy` | `#123C69` | Deep brand surface |
| `--sky` | `#8BC7FF` | Secondary highlight |
| `--success` | `#1F8B4C` | Positive state |
| `--warning` | `#C47A00` | Warning state |
| `--danger` | `#C0392B` | Error state |

### Color Usage Rules
- Use orange intentionally and sparingly; it should feel important.
- Let cream and white provide softness and readability.
- Rely on ink-heavy type and neutral layout for enterprise credibility.
- Avoid turning the interface into a bright rainbow of category colors.

---

## 3. Typography Rules

### Font Stack

```css
/* Workday-style enterprise sans */
--font-sans: 'Workday Sans', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 60px | 700 | 1.05 | -0.02em | Homepage hero |
| Page Title | 42px | 700 | 1.1 | -0.015em | Major page title |
| Section Title | 30px | 600 | 1.15 | -0.01em | Product / solution section |
| Card Title | 22px | 600 | 1.25 | -0.01em | Category or feature card |
| Subsection | 18px | 600 | 1.35 | 0 | Supporting heading |
| Body | 16px | 400 | 1.65 | 0 | Standard content |
| Small Body | 14px | 400 | 1.55 | 0 | Secondary content |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons, tags |
| Caption | 12px | 500 | 1.4 | 0.01em | Eyebrows, utility text |

### Typography Philosophy
Workday typography is **confident and breathable**. It emphasizes editorial clarity at large sizes and calm legibility in product-oriented content blocks.

### Practical Rules
- Use short, outcome-based headlines.
- Give body copy generous line height.
- Use typographic hierarchy to reduce the need for excessive decoration.
- Keep CTA labels plainspoken and direct.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #F38B00;
  color: #FFFFFF;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 999px;
  font: 600 14px/1 'Workday Sans', 'Helvetica Neue', Arial, sans-serif;
}

.button-primary:hover {
  background: #D97706;
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(243, 139, 0, 0.18);
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #0F172A;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #E2E8F0;
  border-radius: 999px;
  font-weight: 600;
}

.button-secondary:hover {
  background: #F7F3EC;
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
  color: #0F172A;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  font: 400 16px/1.2 'Workday Sans', 'Helvetica Neue', Arial, sans-serif;
}

.input:focus {
  outline: none;
  border-color: #F38B00;
  box-shadow: 0 0 0 3px rgba(243, 139, 0, 0.14);
}

.input::placeholder {
  color: #64748B;
}
```

#### Label and Support Text
```css
.input-label {
  display: block;
  margin-bottom: 8px;
  color: #0F172A;
  font: 600 14px/1.3 'Workday Sans', 'Helvetica Neue', Arial, sans-serif;
}

.input-help {
  margin-top: 8px;
  color: #64748B;
  font: 400 12px/1.4 'Workday Sans', 'Helvetica Neue', Arial, sans-serif;
}
```

### Cards and Layout Blocks

#### Feature Card
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  padding: 24px;
}
```

#### Hero Panel
```css
.panel-hero {
  background: #F7F3EC;
  border-radius: 28px;
  padding: 32px;
}
```

#### Insight Tile
```css
.tile {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}
```

---

## 5. Layout Principles

### Spacing Rhythm

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Fine adjustment |
| `--space-2` | `8px` | Tight grouping |
| `--space-3` | `12px` | Dense content |
| `--space-4` | `16px` | Core component spacing |
| `--space-5` | `24px` | Card padding |
| `--space-6` | `32px` | Section spacing |
| `--space-8` | `48px` | Major grouping |
| `--space-10` | `64px` | Large layout spacing |
| `--space-12` | `80px` | Hero spacing |

### Layout Rules
- Build pages from spacious section bands and rounded cards.
- Keep content columns readable and avoid overfull enterprise walls of text.
- Use recurring module types for product categories, proof points, and customer stories.
- Let imagery and product screenshots breathe inside generous containers.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base | `#F7F3EC` or `#FFFFFF` | Main page sections |
| Card | white with light border | Standard elevated surface |
| Soft band | `#F1F5F9` | Alternate background strip |
| Dark accent | `#123C69` | Select feature / proof sections |

### Shadow System

```css
.shadow-soft {
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
}

.shadow-card {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}
```

### Depth Rules
- Use soft shadows and large radii to keep the interface approachable.
- Prefer one clear elevated surface per grouping rather than layered stacks.
- Let contrast and whitespace do as much work as elevation.

---

## 7. Do's and Don'ts

### Do
- Use orange deliberately for important actions or brand punctuation.
- Keep the enterprise tone human and readable.
- Use cream backgrounds and rounded surfaces to soften dense information.
- Write short, clear product and AI value statements.
- Maintain strong visual rhythm through repeated section patterns.

### Don't
- Turn every CTA orange.
- Collapse spacious sections into cramped dashboard density.
- Use harsh black-on-white everywhere.
- Overdecorate with futuristic gradients or glowing AI motifs.
- Let category cards or proof points compete equally for attention.

---

## 8. Responsive Behavior

### Responsive Rules
- Stack rounded cards and proof modules early on tablet widths.
- Preserve generous spacing, even if some decorative imagery is reduced.
- Keep CTA groups to one or two visible actions per row.
- Ensure headlines wrap naturally rather than scaling too aggressively.
- Maintain large, comfortable touch targets on mobile.

### Mobile Character
Workday on mobile should still feel premium and composed. Even when simplified, the warm surfaces, clear hierarchy, and orange punctuations should remain recognizable.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: human-centric, enterprise-refined, AI-forward
- **Primary brand accent**: Workday orange `#F38B00`
- **Base palette**: cream, white, ink, navy
- **Typography**: Workday-style enterprise sans
- **Layout**: spacious bands, rounded cards, restrained proof modules
- **Components**: pill CTAs, rounded cards, soft neutral inputs

### Prompt Snippet

```text
Design this interface in the style of Workday's current web presence. Use warm cream and white surfaces, ink-heavy typography, rounded enterprise cards, and Workday orange (#F38B00) as the main accent. The result should feel human-centered, premium, and operationally clear, with generous spacing and calm hierarchy rather than dense dashboard clutter.
```
