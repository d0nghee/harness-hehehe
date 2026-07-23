# Expo Design System

> React Native app-platform design with black-and-white developer clarity, blue deployment accents, and native build workflow ergonomics.

---

## 1. Visual Theme & Atmosphere

Expo should feel like the fastest path from React code to native apps. The system supports Expo Router, EAS Build, updates, app services, docs, preview, and mobile deployment workflows.

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--expo-black` | `#000020` | Primary brand text and dark surface |
| `--expo-blue` | `#4630EB` | Primary action and docs link |
| `--expo-cyan` | `#00D4FF` | Mobile/preview accent |
| `--surface-page` | `#F8FAFC` | Page background |
| `--surface-card` | `#FFFFFF` | Cards and docs panels |
| `--border-default` | `#E2E8F0` | Dividers |
| `--text-muted` | `#64748B` | Secondary text |
| `--success` | `#16A34A` | Build success |

## 3. Typography Rules

```css
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Display | 58px | 700 | 1.05 |
| Page Title | 40px | 700 | 1.12 |
| Section Title | 30px | 650 | 1.2 |
| Build Title | 20px | 650 | 1.3 |
| Body | 16px | 400 | 1.6 |
| Code | 13px | 500 | 1.55 |

## 4. Component Stylings

```css
.button-primary { min-height: 44px; padding: 0 18px; border-radius: 10px; border: 1px solid #4630EB; background: #4630EB; color: #fff; font: 600 14px/1 Inter, sans-serif; }
.build-card { border: 1px solid #E2E8F0; border-radius: 16px; background: #fff; padding: 18px; }
.device-frame { border-radius: 24px; background: #000020; color: #fff; padding: 18px; }
.code-panel { border-radius: 14px; background: #111827; color: #fff; padding: 16px; font: 500 13px/1.55 "SF Mono", monospace; }
```

## 5. Layout Principles

Organize around app, route, build, update, preview, store submission, and docs. Use mobile device frames when showing product output.

## 6. Depth & Elevation

```css
.shadow-card { box-shadow: 0 8px 18px rgba(0, 0, 32, 0.07); }
.shadow-device { box-shadow: 0 24px 60px rgba(0, 0, 32, 0.18); }
```

## 7. Do's and Don'ts

Do make native app workflows concrete. Do show code, preview, and build state together. Do not make it feel like generic web hosting.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Stack docs, build cards, and device previews |
| Tablet | `768px` | Two-column code and preview |
| Desktop | `1200px` | Full docs/product layout with device frame |

## 9. Agent Prompt Guide

Design like Expo: black-and-white React Native platform, blue build actions, device preview frames, clean docs cards, code panels, and mobile deployment clarity.
