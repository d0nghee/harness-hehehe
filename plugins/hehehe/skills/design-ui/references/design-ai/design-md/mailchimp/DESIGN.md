# Mailchimp Design System

> The iconic email marketing platform with playful personality and signature yellow branding. Mailchimp pairs a white/light foundation with their iconic `#FFE01B` (mustard yellow) as primary brand color, `#DE3A3A` (red) for errors/alerts, `#3AB551` (green) for success, and `#241C15` (dark brown) for primary text. The system balances professional marketing utility with friendly, approachable visual elements and their signature chimp mascot.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Mailchimp feels like **a friendlymarketing partner**. The design balances professional utility with playful personality. Their iconic yellow anchors brand recognition while keeping the interface approachable for non-technical users. The design is not overly corporate—it has warmth and character.

### Mood & Feeling
- **Friendly professionalism**: Built for marketers who may not be tech experts
- **Yellow signature**: Brand color that stands out in a sea of blue/indigo competitors
- **Playful but focused**: Monkey mascot adds personality without distracting
- **Trustworthy utility**: Clear hierarchy for campaign management
- **Approachable**: Easy for beginners, powerful for experts

### Design Density
**Medium density**. Mailchimp gives content and campaign details room to breathe while maintaining efficient dashboard layouts. The overall system feels organized but not cramped.

### Visual Character
- White foundations with light gray accents
- Signature yellow (`#FFE01B`) for primary CTAs
- Red for errors and alerts
- Green for success and confirmations
- Dark brown/charcoal for primary text
- Large, friendly typography
- Card-based content organization
- Generous radius (12px-16px)
- Playful illustrations and icons

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--mc-white` | `#FFFFFF` | Primary canvas, inverse backgrounds |
| `--mc-gray-50` | `#FEFEFE` | Light backgrounds |
| `--mc-gray-100` | `#F2F3F4` | Subtle fills, hover states |
| `--mc-gray-200` | `#E1E3E5` | Borders, dividers |
| `--mc-gray-300` | `#C9CDD4` | Disabled states |
| `--mc-gray-400` | `#9CA3AF` | Muted text |
| `--mc-gray-500` | `#636F85` | Secondary text |
| `--mc-gray-600` | `#48515D` | Support text |
| `--mc-gray-700` | `#363B45` | Body text |
| `--mc-gray-800` | `#241C15` | Primary text, headlines |
| `--mc-black` | `#000000` | Strong emphasis |

### Brand & Accent Colors

| Token | Hex | Role |
|-------|-----|------|
| `--mc-yellow` | `#FFE01B` | Primary brand, CTAs, highlights |
| `--mc-yellow-dark` | `#F2BE00` | Yellow hover state |
| `--mc-yellow-light` | `#FFF2CC` | Yellow backgrounds |
| `--mc-red` | `#DE3A3A` | Errors, alerts, destructive |
| `--mc-red-light` | `#FDECEC` | Error backgrounds |
| `--mc-green` | `#3AB551` | Success, confirmations |
| `--mc-green-light` | `#E5F7EE` | Success backgrounds |
| `--mc-blue` | `#0071DB` | Links, informational |
| `--mc-blue-light` | `#E6F4FF` | Link backgrounds |
| `--mc-purple` | `#7C55DA` | Special features |

### Functional Token Roles

| Token | Hex | Role |
|-------|-----|------|
| `--mc-success` | `#3AB551` | Campaign success |
| `--mc-warning` | `#F59E0B` | Caution states |
| `--mc-error` | `#DE3A3A` | Failed campaigns |
| `--mc-info` | `#0071DB` | Information links |

### Color Usage Philosophy
Mailchimp uses color **purposefully and playfiully**. The brand yellow anchors recognition, while functional colors communicate status clearly. Avoid gradients—the flat, friendly aesthetic is core to the brand.

---

## 3. Typography Rules

### Font Stack

```css
--font-sans: "Mailchimp", "Avenir", "Graphik", "Inter",
             system-ui, -apple-system, sans-serif;

--font-display: "Avenir", "Graphik", "Inter",
               system-ui, sans-serif;

--font-mono: "Roboto Mono", "Menlo", monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Color |
|---------|------|--------|-----------|-------|
| Hero | 48px | 700 | 1.1 | `#241C15` |
| H1 | 36px | 700 | 1.2 | `#241C15` |
| H2 | 28px | 600 | 1.3 | `#241C15` |
| H3 | 22px | 600 | 1.35 | `#241C15` |
| H4 | 18px | 600 | 1.4 | `#241C15` |
| Body Large | 16px | 400 | 1.5 | `#363B45` |
| Body | 14px | 400 | 1.5 | `#363B45` |
| Small | 12px | 400 | 1.4 | `#636F85` |
| Caption | 11px | 500 | 1.3 | `#636F85` |

### Typography Philosophy
Mailchimp typography is **friendly and confident**. Headlines use bold weights for impact, body copy stays readable. The font choices feel human—not sterile or overly technical.

```css
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.04em;
```

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #FFE01B;
  color: #241C15;
  border: none;
  border-radius: 12px;
  min-height: 48px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  transition: all 150ms ease;
}

.button-primary:hover {
  background: #F2BE00;
  transform: translateY(-1px);
}

.button-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #241C15;
  border: 2px solid #E1E3E5;
  border-radius: 12px;
  min-height: 48px;
  padding: 14px 28px;
}

.button-secondary:hover {
  border-color: #C9CDD4;
  background: #F2F3F4;
}
```

#### Danger Button
```css
.button-danger {
  background: #DE3A3A;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  min-height: 48px;
  padding: 14px 28px;
}

.button-danger:hover {
  background: #C42E2E;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E1E3E5;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-hover:hover {
  border-color: #C9CDD4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### Inputs
```css
.input {
  background: #FFFFFF;
  color: #241C15;
  border: 2px solid #E1E3E5;
  border-radius: 12px;
  min-height: 48px;
  padding: 12px 16px;
  font-size: 15px;
  transition: border-color 150ms ease;
}

.input:focus {
  outline: none;
  border-color: #FFE01B;
}

.input::placeholder {
  color: #9CA3AF;
}

.input-error {
  border-color: #DE3A3A;
}
```

### Badges & Pills
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background: #E5F7EE;
  color: #3AB551;
}

.badge-error {
  background: #FDECEC;
  color: #DE3A3A;
}

.badge-warning {
  background: #FFF3DC;
  color: #B77C00;
}
```

### Component Philosophy
Mailchimp components should feel **friendly and approachable**. Use generous radius, subtle shadows, and the signature yellow for primary CTAs.

---

## 5. Layout Principles

### Grid System

```css
--layout-columns: 12;
--layout-gutter: 24px;
--layout-max-width: 1440px;
--layout-content-max: 1080px;
```

### Spacing Scale

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

### Layout Style
- Single-column dashboard on mobile
- Two/three-column on desktop
- Card-based content organization
- Sidebar navigation on dashboard views
- Modal overlays for confirmations
- Footer with extensive links

### Whitespace Philosophy
Whitespace in Mailchimp should feel **clear and organized**, not sparse. Give breathing room to campaign previews and analytics, but use consistent spacing throughout.

---

## 6. Depth & Elevation

### Elevation Style
Mailchimp uses **subtle shadows and layers** for depth. Cards get light shadows that grow on hover. Uses subtle layering rather than dramatic elevation changes.

### Elevation System

```css
--elevation-none: none;
--elevation-1: 0 1px 3px rgba(0, 0, 0, 0.04);
--elevation-2: 0 2px 8px rgba(0, 0, 0, 0.06);
--elevation-3: 0 4px 16px rgba(0, 0, 0, 0.1);
--elevation-toast: 0 8px 32px rgba(0, 0, 0, 0.15);
```

### Surface Hierarchy
1. Base white canvas
2. Subtle gray fills (#F2F3F4)
3. Card surfaces (white with border)
4. Elevated cards (white with shadow)
5. Modals and overlays

### Elevation Rules
- Keep shadows light and subtle
- Use shadow on card hover
- Ensure text remains readable
- Don’t over-layer surfaces

---

## 7. Do's and Don'ts

### Do
- Use white backgrounds as the foundation
- Use yellow (#FFE01B) for primary CTAs and brand moments
- Include chimp mascot for personality
- Keep campaigns and content clearly visible
- Prioritize list and audience management
- Support 300+ integrations visually

### Don't
- Don't use gradients in buttons
- Don't overload the dashboard
- Don't hide important metrics
- Don't make it feel corporate/cold

---

## 8. Responsive Behavior

### Breakpoints

```css
--bp-xs: 320px;
--bp-sm: 480px;
--bp-md: 768px;  /* Tablet */
--bp-lg: 1024px; /* Desktop */
--bp-xl: 1280px;
--bp-2xl: 1536px;
```

### Desktop-First Approach
Mailchimp was designed primarily as a web application. Desktop layouts are most detailed, with responsive simplification for mobile.

### Touch Targets

```css
--touch-target-min: 44px;
--control-height: 48px;
```

---

## 9. Agent Prompt Guide

### Quick Visual Summary
- Use white/light foundations (#FFFFFF, #F2F3F4)
- Add yellow accents like `#FFE01B` for primary, `#0071DB` for links, `#3AB551` for success
- Include chimp mascot for brand personality
- Keep interface friendly and approachable
- Show campaign and content clearly
- Use generous rounded corners

### Prompt Snippet

```txt
Design this interface like Mailchimp's design system: white/light backgrounds, signature yellow (#FFE01B) primary brand, red (#DE3A3A) for errors, green (#3AB551) for success, dark brown (#241C15) primary text, friendly card-based layouts, generous rounded corners (12px-16px), chimp mascot branding, campaign management dashboard aesthetic. Keep interface approachable and marketing-focused.
```