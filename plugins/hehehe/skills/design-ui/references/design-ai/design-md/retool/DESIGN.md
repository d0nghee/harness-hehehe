# Retool Design System

> Internal tools design with confident blue identity, drag-and-drop builder surfaces, component-palette clarity, and data-connection UX.

---

## 1. Visual Theme & Atmosphere

Retool should feel powerful, pragmatic, and developer-friendly. The design language communicates rapid internal tool building — connecting databases, APIs, and business logic to polished admin panels, dashboards, and workflows.

- Mood: pragmatic, powerful, productive, technical
- Density: high, with component palettes, canvas grids, query editors, and data table surfaces
- Character: confident blue brand, white canvas, component-library sidebar, dark query panels

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--rt-blue` | `#3B82F6` | Primary brand CTA and selected component |
| `--rt-blue-dark` | `#2563EB` | Hover and active states |
| `--rt-indigo` | `#4F46E5` | Workflow and automation accent |
| `--rt-green` | `#16A34A` | Query success and connected state |
| `--rt-amber` | `#D97706` | Warning and slow-query state |
| `--rt-red` | `#DC2626` | Query error and delete action |
| `--surface-canvas` | `#F8F9FB` | App builder canvas |
| `--surface-card` | `#FFFFFF` | Component and panel surfaces |
| `--surface-sidebar` | `#1E293B` | Left component palette |
| `--surface-query` | `#0D1117` | Query editor panel |
| `--text-primary` | `#111827` | Labels and table data |
| `--border-default` | `#E5E7EB` | Component and canvas borders |

Blue is the selection and action color — a selected component on the canvas gets a blue border. This must be consistent everywhere in the builder.

## 3. Typography Rules

```css
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", "Fira Code", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| App Title | 20px | 700 | 1.1 |
| Panel Title | 14px | 600 | 1.3 |
| Component Label | 13px | 500 | 1.35 |
| Body / Table | 14px | 400 | 1.5 |
| Query Code | 13px | 400 | 1.7 |
| Property Key | 12px | 600 | 1.35 |
| Caption | 11px | 400 | 1.4 |

## 4. Component Stylings

```css
.button-primary {
  min-height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 6px;
  background: #3B82F6;
  color: #FFFFFF;
  font: 600 13px/1 Inter, sans-serif;
}

.canvas-component {
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: #FFFFFF;
  position: absolute;
}

.canvas-component.selected {
  border: 2px solid #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.20);
}

.query-editor {
  border-radius: 8px;
  background: #0D1117;
  color: #C9D1D9;
  padding: 16px;
  font: 400 13px/1.7 "JetBrains Mono", monospace;
}

.property-input {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font: 400 12px/1 Inter, sans-serif;
}
```

## 5. Layout Principles

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Property panel tight spacing |
| `--space-2` | `8px` | Component palette items |
| `--space-3` | `12px` | Panel section rhythm |
| `--space-6` | `24px` | Builder toolbar padding |

Three-panel layout: component sidebar (left) + drag canvas (center) + property inspector (right). The canvas grid should be 8px base. Component palette groups by category with clear icons.

## 6. Depth & Elevation

```css
.shadow-component { box-shadow: 0 1px 3px rgba(17, 24, 39, 0.08); }
.shadow-selected  { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.20); }
.shadow-modal     { box-shadow: 0 16px 40px rgba(17, 24, 39, 0.18); }
.shadow-dropdown  { box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12); }
```

Selection state uses a blue ring — shadow elevation is used sparingly in the dense builder UI.

## 7. Do's and Don'ts

Do make the component drop target area clearly visible with a blue highlight. Do auto-size the property inspector to show only relevant properties for the selected component. Do use mono font everywhere in the query editor. Do not use decorative gradients in the canvas UI. Do not hide the "Save" and "Deploy" actions — they are always needed.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | View-only mode for built apps — no builder |
| Tablet | `768px` | Simplified builder with collapsed panels |
| Desktop | `1200px` | Full three-panel builder with canvas, palette, and inspector |

The builder is exclusively a desktop experience. Built apps may be responsive depending on the creator's configuration.

## 9. Agent Prompt Guide

Design like Retool: confident blue CTAs, three-panel drag-and-drop builder, dark query editor panels, blue component selection rings, dense property inspector, and pragmatic internal-tool hierarchy.
