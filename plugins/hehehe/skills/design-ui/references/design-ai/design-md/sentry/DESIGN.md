# Sentry Design System

> Developer error-monitoring design with deep purple night surfaces, sharp debugging hierarchy, and high-contrast alert accents.

---

## 1. Visual Theme & Atmosphere

Sentry should feel like a developer tool built for the moment code breaks. The design language is darker, sharper, and more characterful than neutral enterprise SaaS, while still supporting dense issue lists, stack traces, traces, releases, and alerts.

- Mood: technical, urgent, witty, observability-focused, developer-native
- Density: medium-to-high for dashboards and issue details
- Character: deep violet backgrounds, lime and pink accents, code-forward surfaces

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--sentry-midnight` | `#150F23` | Deepest background |
| `--sentry-purple-dark` | `#1F1633` | Primary dark surface |
| `--sentry-border` | `#362D59` | Dark dividers |
| `--sentry-purple` | `#6A5FC1` | Primary interactive accent |
| `--sentry-muted-purple` | `#79628C` | Tags and secondary controls |
| `--sentry-lime` | `#C2EF4E` | High-visibility highlight |
| `--sentry-pink` | `#FA7FAA` | Supporting accent |
| `--sentry-coral` | `#FFB287` | Warm highlight |
| `--text-on-dark` | `#FFFFFF` | Dark surface text |
| `--surface-light` | `#FFFFFF` | Light docs/cards |

Use purple as the system foundation. Lime is a highlight, not the default button color.

## 3. Typography Rules

```css
--font-display: "Dammit Sans", Inter, ui-sans-serif, system-ui, sans-serif;
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: Monaco, "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Display | 68px | 800 | 1.02 |
| Page Title | 42px | 750 | 1.1 |
| Section Title | 30px | 700 | 1.2 |
| Issue Title | 18px | 650 | 1.3 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.45 |
| Code | 13px | 500 | 1.55 |

## 4. Component Stylings

```css
.button-primary {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid #6A5FC1;
  border-radius: 10px;
  background: #6A5FC1;
  color: #FFFFFF;
  font: 650 14px/1 Inter, sans-serif;
}

.issue-card {
  border: 1px solid #362D59;
  border-radius: 12px;
  background: #1F1633;
  color: #FFFFFF;
  padding: 16px;
}

.code-panel {
  border-radius: 12px;
  background: #150F23;
  color: #FFFFFF;
  padding: 16px;
}

.tag {
  border-radius: 999px;
  background: rgba(194, 239, 78, 0.14);
  color: #C2EF4E;
  padding: 5px 9px;
}
```

## 5. Layout Principles

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Tags and rows |
| `--space-4` | `16px` | Panels |
| `--space-5` | `24px` | Detail sections |
| `--space-8` | `48px` | Marketing sections |

Prioritize issue severity, affected users, stack trace, release, ownership, and remediation steps.

## 6. Depth & Elevation

```css
.shadow-card { box-shadow: 0 10px 28px rgba(21, 15, 35, 0.24); }
.shadow-overlay { box-shadow: 0 24px 56px rgba(21, 15, 35, 0.34); }
```

Use tonal depth and borders inside dark interfaces. Reserve strong elevation for overlays.

## 7. Do's and Don'ts

Do make errors, traces, and ownership immediately scannable. Do use personality carefully. Do not hide severity or timestamps. Do not use lime as a broad background.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Stack issue details and code panels |
| Tablet | `768px` | Two-column issue/metadata layouts |
| Desktop | `1200px` | Full observability dashboard and trace views |

Code panes should scroll horizontally where wrapping would destroy readability.

## 9. Agent Prompt Guide

Design like Sentry: deep purple developer surfaces, sharp issue cards, Monaco-style code panels, restrained lime highlights, dense observability hierarchy, and urgent debugging clarity.
