# Klarna Design System

> Flexible payments with distinctly Swedish attitude. Klarna's current public and brand sites pair a bold pink brand core with black, off-white, and occasional warm accent support, using roomy layouts, strong typographic contrast, playful-but-minimal imagery, and product framing that makes checkout feel smooth rather than bureaucratic.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Klarna feels like **consumer finance with fashion-editorial confidence**. The system is bright, disruptive, and personality-led, but it still stays simple where money clarity matters. Marketing surfaces are bolder than the underlying payment message, with pink badges, oversized type, and pared-back layout blocks.

### Mood & Feeling
- Bold and offbeat
- Minimal but not sterile
- Fashion-forward rather than corporate
- Friendly, smooth, and checkout-centered
- Confident enough to let simple layouts carry the brand

### Design Density
**Low to medium density.** Klarna prefers large blocks, spacious copy, and obvious product benefits. It avoids fintech dashboard clutter in favor of bold headers and simple proof sections.

### Visual Character
- Signature pink used as a memorable brand stamp
- Strong black-and-off-white contrast
- Large type and short copy blocks
- Image-led layouts with controlled whitespace
- Product messaging that feels easy and stylish, not technical

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--klarna-pink` | `#FFB3C7` | Signature brand background, badges, callouts |
| `--klarna-black` | `#000000` | Primary text and deep contrast |
| `--klarna-white` | `#FFFFFF` | Main canvas and elevated surfaces |
| `--klarna-offwhite` | `#FFF8F3` | Preferred light brand background |
| `--klarna-text` | `#1A1A1A` | Default body text |

### Support Palette

| Token | Hex | Role |
|-------|-----|------|
| `--klarna-gray` | `#E8E1DB` | Soft separators and panels |
| `--klarna-gray-deep` | `#6E6A67` | Secondary copy |
| `--klarna-orange` | `#F7A65A` | Warm campaign accent |
| `--klarna-sage` | `#DCE6D2` | Secondary palette support |
| `--klarna-focus` | `#FF7CA3` | Focus and interactive highlight |

### Utility

| Token | Hex | Role |
|-------|-----|------|
| `--klarna-success` | `#2E8B57` | Positive payment or approval state |
| `--klarna-warning` | `#C47A00` | Caution or billing warning |
| `--klarna-danger` | `#C43C4D` | Error state |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Klarna Title", "Helvetica Neue", Arial, sans-serif;
--font-sans: "Klarna Text", system-ui, -apple-system, sans-serif;
--font-mono: "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 72px | 700 | 0.98 | -0.04em | `#000000` |
| Page Title | 52px | 700 | 1.04 | -0.03em | `#000000` |
| Section Title | 36px | 700 | 1.1 | -0.02em | `#000000` |
| Card Title | 24px | 600 | 1.2 | -0.01em | `#1A1A1A` |
| Body Large | 18px | 400 | 1.6 | 0 | `#1A1A1A` |
| Body | 16px | 400 | 1.6 | 0 | `#1A1A1A` |
| Small Body | 14px | 400 | 1.45 | 0 | `#6E6A67` |
| Label | 12px | 700 | 1.25 | 0.05em | `#6E6A67` |

### Typography Philosophy
Klarna typography should feel **bold, stylish, and instantly scannable**. Big headlines are encouraged, but explanatory text must stay simple and plainspoken so payments still feel trustworthy.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 700;
}

.button-primary:hover {
  background: #1a1a1a;
}

.button-secondary {
  background: #ffffff;
  color: #000000;
  border: 1px solid #e8e1db;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 22px;
}
```

### Cards and Promo Panels

```css
.promo-card {
  background: #ffffff;
  border: 1px solid #e8e1db;
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #1a1a1a;
  border: 1px solid #e8e1db;
  border-radius: 16px;
  min-height: 48px;
  padding: 12px 14px;
}

.input:focus {
  outline: none;
  border-color: #ff7ca3;
  box-shadow: 0 0 0 4px rgba(255, 124, 163, 0.18);
}
```

### Component Notes
- Pink should usually appear as a badge, stage, or large section accent rather than a tiny decorative detail
- Buttons stay simple and highly legible
- Product cards should feel smooth and consumer-friendly, not bank-like or rigid

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Tight alignment |
| `--space-3` | `8px` | Small gaps |
| `--space-4` | `12px` | Compact padding |
| `--space-5` | `16px` | Default spacing |
| `--space-6` | `24px` | Card interiors |
| `--space-7` | `32px` | Module separation |
| `--space-8` | `48px` | Section rhythm |
| `--space-9` | `64px` | Hero spacing |
| `--space-10` | `96px` | Large editorial intervals |

### Layout Behavior
- Use bold headline blocks followed by concise supporting text
- Favor large image panels and controlled card groupings over dense comparison tables
- Alternate between off-white, pink, and white sections for rhythm
- Keep conversion paths simple and obvious

### Whitespace Philosophy
Whitespace should feel **fashion-clean and intentionally composed**. The page should look curated, not crowded, with enough empty space to let pink, headlines, and images land.

---

## 6. Depth & Elevation

### Elevation Strategy
Klarna uses **soft, understated elevation**. Separation comes mostly from color blocks, large radius, and image composition rather than dramatic shadow stacks.

```css
--shadow-soft: 0 8px 20px rgba(0, 0, 0, 0.04);
--shadow-card: 0 16px 32px rgba(0, 0, 0, 0.06);
--shadow-focus: 0 0 0 4px rgba(255, 124, 163, 0.18);
```

### Surface Hierarchy
- Off-white or white base canvas
- Pink hero or brand blocks
- Elevated white consumer cards
- Black text and CTA elements for clean contrast

---

## 7. Do's and Don'ts

### Do
- Keep Klarna bold, simple, and stylish
- Use pink with confidence, but with clear purpose
- Let headlines and imagery do most of the persuasion
- Preserve checkout clarity and consumer trust

### Don't
- Do not turn Klarna into generic blue fintech UI
- Do not overcomplicate layouts with too many data-heavy modules
- Do not use pink as a tiny accent sprinkled everywhere
- Do not make the interface feel cold or overly serious

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked hero blocks, simplified promo cards, strong CTA visibility |
| Tablet | `768px - 1023px` | Two-column campaign and benefits layouts |
| Desktop | `1024px+` | Full editorial image-and-type compositions with large color blocks |

### Responsive Rules
- Reduce headline size before reducing contrast or whitespace
- Stack image and copy modules cleanly on mobile
- Keep button shapes generous and thumb-friendly
- Preserve the pink brand moments even when layouts compress

---

## 9. Agent Prompt Guide

### Quick Reference
- Bold pink brand blocks with black, white, and off-white support
- Fashion-editorial layout energy with simple consumer-finance messaging
- Large headlines, short copy, pill buttons, and spacious cards
- Stylish but still clear, smooth, and checkout-friendly

### Prompt Template
```text
Design this like Klarna's current public website:
- signature pink brand moments with black-and-off-white framing
- bold editorial headlines and short, clear consumer-finance copy
- clean rounded cards and simple pill CTAs
- stylish Swedish minimalism with playful attitude
- smooth checkout energy rather than dense banking UI
```
