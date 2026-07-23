# Doppler Design System

> Secrets management design with bold purple identity, developer-first surfaces, audit-trail clarity, and environment-based access UX.

---

## 1. Visual Theme & Atmosphere

Doppler should feel secure, organized, and developer-native. The design language communicates environment secrets, config management, access control, and sync across cloud infrastructure.

- Mood: secure, organized, technical, reliable
- Density: medium-to-high, with secret tables, environment panels, and integration lists
- Character: bold purple brand, dark terminal surfaces, environment color coding, mono keys throughout

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--dop-purple` | `#6941C6` | Primary brand CTA and highlights |
| `--dop-purple-dark` | `#4F2FA0` | Hover and active states |
| `--dop-green` | `#027A48` | Production environment accent |
| `--dop-blue` | `#026AA2` | Staging environment accent |
| `--dop-amber` | `#B54708` | Development environment accent |
| `--dop-red` | `#B42318` | Secret leak alert and error |
| `--surface-card` | `#FFFFFF` | Secret list panels |
| `--surface-bg` | `#F9FAFB` | Dashboard background |
| `--surface-dark` | `#0D1117` | Terminal and audit log panels |
| `--text-primary` | `#101828` | Labels and values |
| `--border-default` | `#EAECF0` | Row and panel borders |

Each environment (production, staging, development) has a unique color. Use these consistently — color is the primary visual signal for environment context.

## 3. Typography Rules

```css
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", "SF Mono", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page Title | 30px | 700 | 1.1 |
| Section Title | 22px | 600 | 1.2 |
| Secret Key | 14px | 600 | 1.4 |
| Secret Value | 14px | 400 | 1.4 |
| Body | 15px | 400 | 1.6 |
| Audit Log | 13px | 400 | 1.5 |
| Label | 12px | 600 | 1.35 |

## 4. Component Stylings

```css
.button-primary {
  min-height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: #6941C6;
  color: #FFFFFF;
  font: 600 14px/1 Inter, sans-serif;
}

.secret-row {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  padding: 12px 16px;
  border-bottom: 1px solid #EAECF0;
  align-items: center;
}

.secret-value {
  font: 400 14px/1 "JetBrains Mono", monospace;
  letter-spacing: 0.05em;
  color: #101828;
}

.env-badge {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 999px;
  font: 600 12px/1.4 Inter, sans-serif;
}
```

## 5. Layout Principles

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Secret row internal spacing |
| `--space-4` | `16px` | Section rhythm |
| `--space-6` | `24px` | Panel padding |
| `--space-10` | `40px` | Major view gaps |

Environment selector must always be visible at the top of every view. Secrets table should fill the main area with sticky header and column alignment.

## 6. Depth & Elevation

```css
.shadow-card   { box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06); }
.shadow-panel  { box-shadow: 0 8px 24px rgba(105, 65, 198, 0.10); }
.shadow-modal  { box-shadow: 0 20px 50px rgba(16, 24, 40, 0.18); }
```

Secret panels are nearly flat — visual density comes from the data, not shadow.

## 7. Do's and Don'ts

Do always mask secret values by default with toggle-to-reveal. Do make the environment context (prod/staging/dev) impossible to miss. Do use mono font for all keys and values. Do not expose production secrets without explicit confirmation. Do make audit log access visible and easy to reach.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Secret list with masked values, no editing |
| Tablet | `768px` | Environment tabs, scrollable secret table |
| Desktop | `1200px` | Full dashboard: project sidebar + environment tabs + secret table |

Secrets management is primarily a desktop/CLI workflow. Mobile should be read-only.

## 9. Agent Prompt Guide

Design like Doppler: bold purple CTAs, mono secret keys and values, environment-color-coded badges, dark audit log panels, default-masked secret values, and developer-native security hierarchy.
