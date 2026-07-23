# MongoDB Design System

> Developer-platform design with calm green confidence and open-source product rigor. MongoDB’s LeafyGreen system uses strong accessibility rules, a disciplined green-led palette, and modular component patterns to make technical workflows feel clean, modern, and highly usable.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
MongoDB expresses **developer confidence without noise**. LeafyGreen is crisp, well-documented, and practical. It feels modern and product-focused, with enough warmth from the green brand foundation to avoid becoming cold or generic.

### Mood & Feeling
- **Technical**: built for real developer and database workflows
- **Approachable**: strong usability softens platform complexity
- **Reliable**: visual rules feel stable and systemized
- **Open**: the interface should feel accessible and easy to explore
- **Efficient**: patterns should help repeat tasks stay fast

### Design Density
**Medium density**. MongoDB surfaces often include controls, tables, docs, and cloud management patterns, but they remain readable through spacing, contrast, and predictable component behavior.

### Visual Character
- MongoDB green as the signature action color
- White and dark charcoal themes both feel intentional
- Card-driven modularity with light border structure
- Typography and component consistency matter more than visual flourish

---

## 2. Color Palette & Roles

### Core Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `--mongodb-green` | `#00ED64` | Primary brand action color |
| `--mongodb-green-dark` | `#13AA52` | Hover / stronger action state |
| `--mongodb-green-soft` | `#E3FCF7` | Soft highlighted surface |

### Neutral Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--mongo-black` | `#001E2B` | Primary dark text / dark UI base |
| `--gray-dark-4` | `#112733` | Secondary dark surface |
| `--gray-dark-2` | `#3D4F58` | Borders and dark separators |
| `--gray-light-1` | `#C1C7C6` | Light icon / secondary border |
| `--gray-light-3` | `#E8EDEB` | Subtle divider and surface |
| `--white` | `#FFFFFF` | Primary light surface |

### Supportive Colors

| Token | Hex | Role |
|-------|-----|------|
| `--blue` | `#016BF8` | Links and secondary interaction |
| `--red` | `#CF000F` | Error / destructive |
| `--yellow` | `#FFC010` | Warning / caution |

### Color Usage Rules
- Use MongoDB green for primary actions and moments of intent.
- Preserve high contrast in both light and dark themes.
- Keep supporting colors semantic and secondary to the green brand signal.

---

## 3. Typography Rules

### Font Stack

```css
/* LeafyGreen defaults */
--font-sans: Euclid Circular A, Akzidenz, 'Helvetica Neue', Helvetica, Arial, sans-serif;
--font-mono: 'Source Code Pro', Menlo, Consolas, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| Display | 48px | 700 | 1.08 | -0.02em | Hero / high-level heading |
| H1 | 32px | 700 | 1.15 | -0.01em | Page title |
| H2 | 24px | 600 | 1.2 | -0.01em | Section heading |
| H3 | 20px | 600 | 1.25 | 0 | Card title |
| Body | 16px | 400 | 1.6 | 0 | Standard content |
| Small Body | 14px | 400 | 1.5 | 0 | Secondary content |
| Label | 14px | 600 | 1.3 | 0.01em | Buttons and field labels |
| Code | 13px | 400 | 1.5 | 0 | Technical values |

### Typography Philosophy
MongoDB typography should feel **clean, developer-native, and highly legible**. The goal is to support long sessions in docs, cloud tooling, and admin surfaces.

### Practical Rules
- Keep headings concise and literal.
- Use monospace for code, IDs, and query-adjacent text.
- Preserve strong contrast and spacing in dense technical views.

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #00ED64;
  color: #001E2B;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #00ED64;
  border-radius: 8px;
  font: 600 14px/1 'Euclid Circular A', sans-serif;
}

.button-primary:hover {
  background: #13AA52;
  border-color: #13AA52;
  color: #FFFFFF;
}
```

#### Secondary Button
```css
.button-secondary {
  background: #FFFFFF;
  color: #001E2B;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #C1C7C6;
  border-radius: 8px;
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  background: #FFFFFF;
  color: #001E2B;
  border: 1px solid #C1C7C6;
  border-radius: 8px;
  font: 400 14px/1.2 'Euclid Circular A', sans-serif;
}

.input:focus {
  outline: none;
  border-color: #00ED64;
  box-shadow: 0 0 0 3px rgba(0, 237, 100, 0.14);
}
```

### Cards and Product Surfaces

#### Card
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E8EDEB;
  border-radius: 16px;
  padding: 24px;
}
```

#### Dark Panel
```css
.panel-dark {
  background: #001E2B;
  color: #FFFFFF;
  border-radius: 18px;
  padding: 24px;
}
```

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Fine adjustment |
| `--space-2` | `8px` | Tight spacing |
| `--space-4` | `16px` | Core spacing |
| `--space-5` | `24px` | Card spacing |
| `--space-6` | `32px` | Section spacing |
| `--space-8` | `48px` | Major grouping |

### Layout Rules
- Build around modular product and docs sections.
- Use dark product zones and light explanatory zones intentionally.
- Keep developer paths clear: docs, Atlas, tooling, platform.
- Let content hierarchy stay practical and low-friction.

---

## 6. Depth & Elevation

### Surface Hierarchy

| Level | Treatment | Use |
|-------|-----------|-----|
| Base light | white / pale neutral | Docs and content |
| Card | white with light border | Standard grouping |
| Dark panel | charcoal surface | Product / console framing |
| Overlay | elevated light surface | Modal / flyout |

### Shadow System

```css
.shadow-card {
  box-shadow: 0 8px 18px rgba(0, 30, 43, 0.08);
}

.shadow-overlay {
  box-shadow: 0 18px 30px rgba(0, 30, 43, 0.14);
}
```

### Depth Rules
- Use contrast before aggressive shadow.
- Keep dark panels clean and bounded.
- Reserve stronger elevation for overlays and high-focus flows.

---

## 7. Do's and Don'ts

### Do
- Use MongoDB green as the main action color.
- Keep developer workflows clean and modular.
- Respect LeafyGreen accessibility and contrast rules.
- Use dark mode intentionally, not decoratively.
- Let component consistency lead the experience.

### Don't
- Overwhelm technical pages with too many bright accents.
- Turn docs or cloud tooling into marketing-heavy layouts.
- Use generic SaaS purple/blue palettes instead of MongoDB green.
- Reduce contrast in dark panels.

---

## 8. Responsive Behavior

### Responsive Rules
- Stack cards and panels early on smaller screens.
- Preserve readable code and docs measures on mobile.
- Keep primary actions visible without crowding the viewport.
- Maintain clear distinction between light docs and dark product frames.

### Mobile Character
MongoDB mobile layouts should still feel developer-friendly and efficient. The green-led brand identity and clean modular structure should survive the reduced space.

---

## 9. Agent Prompt Guide

### Quick Reference
- **Mood**: developer-native, clean, reliable
- **Primary accent**: MongoDB green `#00ED64`
- **Core surfaces**: white + charcoal product zones
- **Typography**: Euclid Circular A + Source Code Pro
- **Layout**: modular docs and product sections
- **Components**: green primary buttons, clean cards, dark panels

### Prompt Snippet

```text
Design this interface in the style of MongoDB’s current website and LeafyGreen design system. Use MongoDB green (#00ED64) for primary actions, crisp white content surfaces, dark product panels, highly legible developer typography, and modular platform sections. The result should feel modern, technical, and clean without becoming visually noisy.
```
