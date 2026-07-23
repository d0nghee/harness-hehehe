# Sanity Design System

> Content operating system design with bright red identity, structured editorial surfaces, and schema-first collaboration.

---

## 1. Visual Theme & Atmosphere

Sanity should feel like structured content for modern teams and AI systems. The design supports Studio, schema, content releases, visual editing, APIs, datasets, and composable experiences.

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--sanity-red` | `#F03E2F` | Primary brand and CTA |
| `--sanity-ink` | `#101112` | Strong text and dark surface |
| `--sanity-blue` | `#2563EB` | Link / API accent |
| `--surface-page` | `#F7F7F5` | Editorial background |
| `--surface-card` | `#FFFFFF` | Content cards |
| `--border-default` | `#E5E7EB` | Dividers |
| `--text-muted` | `#64748B` | Metadata |
| `--success` | `#16A34A` | Published state |

## 3. Typography Rules

```css
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Display | 60px | 700 | 1.05 |
| Page Title | 40px | 700 | 1.12 |
| Section Title | 30px | 650 | 1.2 |
| Document Title | 20px | 650 | 1.3 |
| Body | 16px | 400 | 1.6 |
| Code | 13px | 500 | 1.55 |

## 4. Component Stylings

```css
.button-primary { min-height: 44px; padding: 0 18px; border-radius: 10px; border: 1px solid #F03E2F; background: #F03E2F; color: #fff; font: 600 14px/1 Inter, sans-serif; }
.document-card { border: 1px solid #E5E7EB; border-radius: 16px; background: #fff; padding: 18px; }
.schema-panel { border-radius: 14px; background: #101112; color: #fff; padding: 16px; font: 500 13px/1.55 "SF Mono", monospace; }
.status-published { background: rgba(22, 163, 74, 0.12); color: #15803D; border-radius: 999px; padding: 6px 10px; }
```

## 5. Layout Principles

Organize around content type, document, field, preview, release, dataset, API, and schema. Keep structured content relationships visible.

## 6. Depth & Elevation

```css
.shadow-card { box-shadow: 0 8px 18px rgba(16, 17, 18, 0.07); }
.shadow-panel { box-shadow: 0 20px 48px rgba(16, 17, 18, 0.14); }
```

## 7. Do's and Don'ts

Do make content structure and publishing state clear. Do use red as a focused brand cue. Do not make editorial workflows look like generic CMS tables.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Stack document and preview panels |
| Tablet | `768px` | Two-column editor/preview |
| Desktop | `1200px` | Full Studio-like content workspace |

## 9. Agent Prompt Guide

Design like Sanity: red content-platform identity, white document cards, dark schema/code panels, structured content fields, preview/edit workflows, and editorial collaboration clarity.
