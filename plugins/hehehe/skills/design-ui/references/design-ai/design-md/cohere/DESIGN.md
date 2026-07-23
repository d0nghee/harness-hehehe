# Cohere Design System

> Enterprise AI design with natural-language intelligence, warm neutral foundations, and practical model-platform structure.

---

## 1. Visual Theme & Atmosphere

Cohere should feel like AI applied to real business systems. The brand direction is intellectual and organic, but the interface needs enterprise clarity for models, retrieval, workplace systems, security, and private deployment.

- Mood: intelligent, grounded, enterprise-ready, research-backed
- Density: medium, with product taxonomy and technical proof
- Character: warm neutrals, dark text, restrained green and coral accents

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--cohere-ink` | `#11130F` | Strongest text and dark surface |
| `--cohere-forest` | `#1F4D3A` | Primary intelligent accent |
| `--cohere-green` | `#6BAF7A` | Positive state / natural language cue |
| `--cohere-coral` | `#F06A4D` | Human warmth and highlight |
| `--cohere-cream` | `#F7F4EA` | Warm page background |
| `--cohere-sand` | `#E8DFCC` | Secondary warm surface |
| `--surface-card` | `#FFFFFF` | Product cards |
| `--border-default` | `#DDD5C6` | Warm dividers |
| `--text-muted` | `#6B6F66` | Secondary text |

Use green for intelligence and trust. Use coral as a selective human accent. Keep large areas calm and warm.

## 3. Typography Rules

```css
--font-sans: "Suisse Intl", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Display | 60px | 650 | 1.05 |
| Page Title | 42px | 650 | 1.12 |
| Section Title | 30px | 600 | 1.2 |
| Card Title | 22px | 600 | 1.3 |
| Body | 16px | 400 | 1.65 |
| Small | 14px | 400 | 1.45 |
| Code | 13px | 500 | 1.55 |

## 4. Component Stylings

```css
.button-primary {
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #1F4D3A;
  border-radius: 999px;
  background: #1F4D3A;
  color: #FFFFFF;
  font: 600 14px/1 Inter, sans-serif;
}

.product-card {
  border: 1px solid #DDD5C6;
  border-radius: 18px;
  background: #FFFFFF;
  padding: 22px;
}

.model-panel {
  border-radius: 20px;
  background: #11130F;
  color: #FFFFFF;
  padding: 24px;
}

.input {
  min-height: 44px;
  border: 1px solid #DDD5C6;
  border-radius: 12px;
  padding: 0 14px;
}
```

## 5. Layout Principles

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Inline spacing |
| `--space-4` | `16px` | Core rhythm |
| `--space-5` | `24px` | Card padding |
| `--space-8` | `48px` | Section rhythm |

Organize around product families, deployment options, and proof. Give security and enterprise controls visible placement.

## 6. Depth & Elevation

```css
.shadow-card { box-shadow: 0 8px 18px rgba(17, 19, 15, 0.07); }
.shadow-panel { box-shadow: 0 18px 42px rgba(17, 19, 15, 0.12); }
```

Use warm borders and subtle shadows. Dark model panels can rely on color contrast.

## 7. Do's and Don'ts

Do balance research credibility with enterprise utility. Do make model choices and deployment paths legible. Do not make the UI feel speculative or consumer-playful. Do not overuse abstract AI gradients.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Single-column product taxonomy |
| Tablet | `768px` | Two-column feature cards |
| Desktop | `1200px` | Multi-column enterprise/product layout |

Stack model cards on mobile and keep CTAs visible near product descriptions.

## 9. Agent Prompt Guide

Design like Cohere: warm enterprise AI, cream and white surfaces, forest-green primary actions, subtle coral highlights, model and retrieval product cards, and serious deployment/security framing.
