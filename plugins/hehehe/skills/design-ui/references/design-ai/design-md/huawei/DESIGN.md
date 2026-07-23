# Huawei Design System

> Global intelligent technology with enterprise-scale polish. Huawei's current public presence combines bright white editorial sections, deep navy framing, selective red accents, and broad platform storytelling across consumer devices, cloud, networking, automotive, and digital infrastructure, creating a design system that feels advanced, credible, and strategically expansive.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Huawei feels like **technology at national and global infrastructure scale presented through premium corporate clarity**. The site needs to support consumer devices, intelligent world narratives, sustainability, trust, and enterprise platforms without losing coherence. It does this through clean editorial structure, calm confidence, and strong product architecture.

### Mood & Feeling
- Advanced and globally ambitious
- Corporate but polished
- Trust-first and infrastructure-aware
- Broad in portfolio but still structured
- Future-oriented without becoming noisy

### Design Density
**Medium density.** Huawei presents many products, initiatives, and enterprise topics, but keeps them readable through strong modular sections, broad editorial spacing, and clear category pathways.

### Visual Character
- White and deep navy structural contrast
- Huawei red used as a measured brand accent
- A mix of consumer imagery, infrastructure visuals, and thought-leadership framing
- Large category blocks for cloud, devices, networking, automotive, and intelligent world themes
- Clean editorial storytelling with corporate confidence

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--huawei-white` | `#FFFFFF` | Main canvas and cards |
| `--huawei-surface` | `#F5F7FA` | Soft section background |
| `--huawei-navy` | `#0B1A33` | Deep contrast background |
| `--huawei-navy-soft` | `#162742` | Secondary dark surface |
| `--huawei-text` | `#1F2937` | Primary body text |

### Brand and Support

| Token | Hex | Role |
|-------|-----|------|
| `--huawei-red` | `#CF0A2C` | Core brand accent and CTA support |
| `--huawei-red-deep` | `#A50822` | Hover and active state |
| `--huawei-red-soft` | `#F8D7DE` | Light callout fill |
| `--huawei-border` | `#D8E0EA` | Borders and separators |
| `--huawei-muted` | `#6B7280` | Secondary text |

### Utility

| Token | Hex | Role |
|-------|-----|------|
| `--huawei-blue` | `#2F6BFF` | Secondary technology accent |
| `--huawei-success` | `#148A58` | Positive status |
| `--huawei-danger` | `#D14343` | Error or critical notice |
| `--huawei-focus` | `#F3A7B6` | Focus ring tint |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Huawei Sans", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Huawei Sans", system-ui, -apple-system, sans-serif;
--font-mono: "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 68px | 700 | 1.02 | -0.03em | `#0B1A33` |
| Page Title | 48px | 700 | 1.08 | -0.02em | `#0B1A33` |
| Section Title | 34px | 700 | 1.12 | -0.015em | `#0B1A33` |
| Card Title | 22px | 600 | 1.22 | -0.01em | `#1F2937` |
| Body Large | 18px | 400 | 1.6 | 0 | `#1F2937` |
| Body | 16px | 400 | 1.6 | 0 | `#1F2937` |
| Small Body | 14px | 400 | 1.45 | 0 | `#6B7280` |
| Label | 12px | 700 | 1.3 | 0.04em | `#6B7280` |

### Typography Philosophy
Huawei typography should feel **clear, authoritative, and globally scalable**. Headlines can be large and future-facing, but the system must stay calm enough to support policy, enterprise, and infrastructure content alongside consumer product stories.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #cf0a2c;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 700;
}

.button-primary:hover {
  background: #a50822;
}

.button-secondary {
  background: #ffffff;
  color: #0b1a33;
  border: 1px solid #d8e0ea;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and Platform Panels

```css
.platform-card {
  background: #ffffff;
  border: 1px solid #d8e0ea;
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(11, 26, 51, 0.05);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #d8e0ea;
  border-radius: 14px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #cf0a2c;
  box-shadow: 0 0 0 4px rgba(243, 167, 182, 0.42);
}
```

### Component Notes
- Enterprise and consumer platform cards should feel related, even when the subject matter shifts
- Red should act as a measured trust and identity cue, not a constant loud background
- Category modules need to support broad navigation across devices, cloud, networking, and intelligent world themes

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Tight alignment |
| `--space-3` | `8px` | Small gaps |
| `--space-4` | `12px` | Compact internal spacing |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card interiors |
| `--space-7` | `32px` | Module grouping |
| `--space-8` | `48px` | Section rhythm |
| `--space-9` | `64px` | Hero spacing |
| `--space-10` | `96px` | Large strategy, industry, and platform sections |

### Layout Behavior
- Lead with one clear future-facing technology or mission statement per section
- Group content by platform and audience: consumer, enterprise, cloud, networking, automotive, intelligent world
- Use large visual modules and concise editorial copy instead of dense feature walls
- Keep trust, sustainability, and corporate information easy to discover without overpowering product stories

### Whitespace Philosophy
Whitespace should feel **strategic and polished**, helping a broad technology portfolio read as coherent, advanced, and trustworthy.

---

## 6. Depth & Elevation

### Elevation Strategy
Huawei uses **soft corporate-tech elevation**. White cards lift subtly above pale surfaces, while deep navy framing and large editorial imagery provide the stronger depth cues.

```css
--shadow-soft: 0 8px 18px rgba(11, 26, 51, 0.04);
--shadow-card: 0 14px 30px rgba(11, 26, 51, 0.08);
--shadow-focus: 0 0 0 4px rgba(243, 167, 182, 0.42);
```

### Surface Hierarchy
- White main canvas
- Soft gray support surfaces
- Elevated white platform cards
- Deep navy framing for hero, category, and trust sections

---

## 7. Do's and Don'ts

### Do
- Keep Huawei broad, advanced, and strategically structured
- Use red as a precise identity and action accent
- Let platform architecture and category hierarchy do major navigation work
- Preserve trust and enterprise clarity across consumer-facing storytelling

### Don't
- Do not make Huawei feel like a flashy gadget-only brand
- Do not overuse red across large backgrounds
- Do not collapse enterprise, infrastructure, and consumer narratives into one undifferentiated stream
- Do not sacrifice trust readability for abstract futurism

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked category cards, simple platform pathways, clear trust and support modules |
| Tablet | `768px - 1023px` | Two-column platform and editorial layouts |
| Desktop | `1024px+` | Broad strategy sections, multi-card category groupings, and full editorial platform storytelling |

### Responsive Rules
- Preserve category clarity across consumer and enterprise paths on small screens
- Keep platform hierarchy obvious when cards stack
- Maintain strong contrast between white editorial sections and navy framing blocks
- Ensure trust, support, and corporate information remain easy to find on mobile

---

## 9. Agent Prompt Guide

### Quick Reference
- White and deep-navy structure with measured Huawei red accents
- Broad platform architecture across devices, cloud, networking, and intelligent-world themes
- Rounded platform cards, editorial sections, and trust-first hierarchy
- Advanced, global, and credible rather than gadget-hype driven

### Prompt Template
```text
Design this like Huawei's current public website:
- white editorial canvas with deep navy framing and measured red brand accents
- broad platform navigation across consumer devices, cloud, networking, and intelligent-world themes
- rounded category cards and clean corporate-tech storytelling
- trust, sustainability, and enterprise clarity integrated with product narratives
- advanced global technology feel rather than narrow gadget-only marketing
```
