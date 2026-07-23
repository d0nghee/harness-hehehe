# Airbnb Design System

> Hospitality marketplace with polished editorial warmth. The current public site ships `Airbnb Cereal VF` and pairs crisp white (`#FFFFFF`) and soft neutral surfaces (`#F7F7F7`, `#F7F6F2`, `#F5F1EA`) with dark charcoal text (`#222222`), quiet secondary gray (`#6A6A6A`), generous radii, elevated floating search surfaces, and signature Airbnb coral (`#FF385C`) with a deeper product red (`#E00B41`) and the live rausch gradient (`#E61E4D` -> `#E31C5F` -> `#D70466`).

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Airbnb feels like **a premium travel magazine translated into a booking interface**. The system balances trust, warmth, and aspiration. Big imagery and destination storytelling drive the emotional layer, while search, cards, pricing, and availability controls stay highly legible and operational. The product never feels sterile; even utilitarian surfaces retain a hospitality-forward softness.

### Mood & Feeling
- **Inviting sophistication**: Premium without becoming luxury-brand aloof
- **Hospitality-first warmth**: Soft neutrals and rounded forms reduce transactional harshness
- **Travel editorial energy**: Photography, curation, and lifestyle framing matter
- **Operational trust**: Search, dates, pricing, reviews, and host info stay precise
- **Confident friendliness**: Rounded edges and gentle motion communicate approachability

### Design Density
**Medium density** overall. Search and booking flows contain a lot of structured information, but the spacing keeps the experience calm. Airbnb tends to show fewer items per viewport than a pure commerce site, giving listings and imagery more room to breathe.

### Visual Character
- Clean white cards on warm-neutral backgrounds
- Rounded rectangles everywhere, often 8px to 24px and sometimes larger
- Floating, elevated search and navigation surfaces
- Charcoal-first text system with muted gray support text
- Coral/rausch accents used strategically, not sprayed across the full UI
- Large destination and listing imagery with editorial cropping
- Subtle frosted or translucent overlays on floating chrome

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--palette-white` | `#FFFFFF` | Primary canvas, cards, modals |
| `--palette-faint` | `#F7F7F7` | Hover fills, page backgrounds, secondary surfaces |
| `--palette-capiz` | `#F7F6F2` | Warm hospitality background |
| `--palette-hapuna` | `#F5F1EA` | Warmer editorial surfaces, premium sections |
| `--palette-hof` | `#222222` | Primary text, headings, icons |

### Neutral Scale

| Token | Hex | Role |
|-------|-----|------|
| `--palette-grey0` | `#FFFFFF` | Bright surface |
| `--palette-grey100` | `#F7F7F7` | Light background |
| `--palette-grey200` | `#F2F2F2` | Secondary fills |
| `--palette-grey300` | `#EBEBEB` | Dividers, soft borders |
| `--palette-grey400` | `#DDDDDD` | Stronger borders |
| `--palette-grey500` | `#C1C1C1` | Disabled structure |
| `--palette-grey600` | `#8C8C8C` | Metadata, subtle icons |
| `--palette-grey700` | `#6C6C6C` | Strong secondary copy |
| `--palette-grey800` | `#515151` | Heavy secondary copy |
| `--palette-grey900` | `#3F3F3F` | Focused text states |
| `--palette-grey1000` | `#222222` | Primary body copy |
| `--palette-grey1100` | `#000000` | Maximum emphasis |

### Brand and Product Accent Colors

| Token | Hex | Role |
|-------|-----|------|
| `--palette-rausch` | `#FF385C` | Primary brand accent, CTAs |
| `--palette-product-rausch` | `#E00B41` | Stronger booking/product emphasis |
| `--palette-rausch-start` | `#E61E4D` | Gradient start |
| `--palette-rausch-mid` | `#E31C5F` | Gradient middle |
| `--palette-rausch-end` | `#D70466` | Gradient end |
| `--palette-plus` | `#92174D` | Premium membership / elevated accent |
| `--palette-luxe` | `#460479` | Luxe tier / premium storytelling |

### Semantic Utility Colors

| Token | Hex | Role |
|-------|-----|------|
| `--palette-blue600` | `#318CF7` | Info links, directional guidance |
| `--palette-mykonou5` | `#428BFF` | Legal links, informational states |
| `--palette-ondo` | `#E07912` | Warnings, cautionary states |
| `--palette-green600` | `#12A139` | Success confirmation |
| `--palette-spruce` | `#008A05` | Positive status, availability confirmation |
| `--palette-arches` | `#C13515` | Error and destructive messaging |

### Material / Glass Surfaces

| Token | Value | Role |
|-------|-------|------|
| `--material-extra-thin` | `rgba(218,218,218,0.40)` | Ultra-light translucent chrome |
| `--material-thin` | `rgba(240,240,240,0.50)` | Floating nav/search surfaces |
| `--material-regular` | `rgba(250,250,250,0.72)` | Frosted overlays |
| `--material-thick` | `rgba(240,240,240,0.86)` | Strong translucent panels |
| `--material-extra-thick` | `rgba(255,255,255,0.925)` | Almost-solid elevated shells |

---

## 3. Typography Rules

### Font Stack

```css
/* Live shipped product font */
--font-sans: 'Airbnb Cereal VF', 'Circular', -apple-system, BlinkMacSystemFont,
             'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* Product does not lean on mono, but keep a sane fallback */
--font-mono: 'SF Mono', 'JetBrains Mono', 'Roboto Mono', Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 72px | 600 | 1.03 | 0 | `--palette-grey1000` |
| Large Display | 60px | 600 | 1.13 | 0 | `--palette-grey1000` |
| Page Title | 48px | 600 | 1.125 | 0 | `--palette-grey1000` |
| Section Title | 32px | 600 | 1.125 | 0 | `--palette-grey1000` |
| Card Title | 22px | 600 | 1.18 | 0 | `--palette-grey1000` |
| Title Medium | 18px | 500 | 1.33 | 0 | `--palette-grey1000` |
| Subtitle | 16px | 400 | 1.375 | 0 | `--palette-grey900` |
| Body | 16px | 400 | 1.25 | 0 | `--palette-text-primary` |
| Small Body | 14px | 400 | 1.125 | 0 | `--palette-text-secondary` |
| Caption | 12px | 400 | 1 | 0 | `--palette-grey600` |
| Label | 14px | 600 | 1.125 | 0.04em | `--palette-grey1000` |

### Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Book | Body text, descriptions, metadata |
| 500 | Medium | Controls, tabs, UI titles |
| 600 | Semibold | Headings, cards, important labels |
| 700 | Bold | Reserved for stronger emphasis and rare marketing lockups |

### Typography Philosophy
Airbnb typography is built around **clarity with softness**. It does not use aggressive tracking or stark newspaper drama. The Cereal family keeps the interface modern and ownable while remaining easy to scan across long lists, review snippets, and booking details.

```css
--tracking-normal: normal;
--tracking-wide: 0.04em; /* compact labels and pill buttons */
```

---

## 4. Component Stylings

### Buttons

#### Primary Button
```css
.button-primary {
  background: #ff385c;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  min-height: 48px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transition: transform 100ms ease, box-shadow 200ms ease, background 200ms ease;
}

.button-primary:hover {
  background: #e00b41;
}

.button-primary:active {
  transform: scale(0.98);
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #222222;
}
```

#### Secondary Button
```css
.button-secondary {
  background: #ffffff;
  color: #222222;
  border: 1px solid #dddddd;
  border-radius: 12px;
  min-height: 48px;
  padding: 14px 24px;
}

.button-secondary:hover {
  background: #f7f7f7;
  border-color: #222222;
}
```

### Search Bar and Floating Search Shell
```css
.search-shell {
  background: rgba(255, 255, 255, 0.925);
  backdrop-filter: blur(16px) saturate(1.6);
  border-radius: 999px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.search-chip {
  border-radius: 999px;
  padding: 12px 16px;
}
```

### Listing Cards
```css
.listing-card {
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
}

.listing-media {
  border-radius: 24px;
}

.listing-badge,
.superhost-badge {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 999px;
}
```

### Inputs and Booking Controls
```css
.input,
.date-picker,
.guest-counter {
  background: #ffffff;
  color: #222222;
  border: 1px solid #dddddd;
  border-radius: 12px;
}

.input:focus,
.date-picker:focus-within {
  border-color: #222222;
  box-shadow: 0 0 0 1px #222222;
}
```

### Navigation and Pills
- Top navigation favors floating, elevated shells over flat bars
- Tabs and category chips are rounded, touchable, and softly outlined
- Hover states usually rely on slight fill change and stronger text, not loud color fills
- Heart/save actions are icon-led with subtle surface contrast

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-micro2px` | `2px` | Fine alignment |
| `--spacing-micro4px` | `4px` | Tight visual adjustments |
| `--spacing-micro8px` | `8px` | Small gaps |
| `--spacing-micro12px` | `12px` | Compact control padding |
| `--spacing-micro16px` | `16px` | Standard inline padding |
| `--spacing-micro24px` | `24px` | Comfortable component spacing |
| `--spacing-micro32px` | `32px` | Larger component spacing |
| `--spacing-macro16px` | `16px` | Dense layout rhythm |
| `--spacing-macro24px` | `24px` | Default section gap |
| `--spacing-macro32px` | `32px` | Card and row separation |
| `--spacing-macro40px` | `40px` | Larger layout moves |
| `--spacing-macro48px` | `48px` | Hero and section padding |
| `--spacing-macro64px` | `64px` | Major breathing room |
| `--spacing-macro80px` | `80px` | Big editorial sections |

### Layout Behavior
- Let imagery lead the page, but keep booking controls immediately actionable
- Use modular card grids with enough gap to prevent visual crowding
- Search, filter, and date-selection surfaces should float above the content rather than disappear into it
- Preserve strong left alignment and predictable vertical rhythm in transactional flows
- Allow travel stories and premium/luxe modules to feel more expansive than standard listings

### Whitespace Philosophy
Airbnb whitespace should feel **comfortable and premium, not sparse for its own sake**. Give cards and search elements enough room to feel luxurious, but keep the system practical for browsing many options.

---

## 6. Depth & Elevation

### Elevation Strategy
Airbnb uses **real elevation as a product cue**. Search bars, dropdowns, modals, date pickers, and flyouts visibly float. Cards can stay relatively flat, but important interactive shells should feel lifted and tactile.

### Shadow Language

```css
--elevation-high: 0 8px 28px rgba(0, 0, 0, 0.28);
--elevation-primary: 0 6px 20px rgba(0, 0, 0, 0.20);
--elevation-secondary: 0 6px 16px rgba(0, 0, 0, 0.12);
--elevation-tertiary: 0 2px 4px rgba(0, 0, 0, 0.18);
--elevation-soft-border: 1px solid rgba(0, 0, 0, 0.04);
```

### Surface Hierarchy
- Base page: white or warm neutral
- Standard cards: mostly flat with soft separation
- Floating search/nav: frosted or nearly solid elevated shells
- Menus and modals: strong shadow + rounded corners
- Media overlays: translucent white chips or darkened image treatments

---

## 7. Do's and Don'ts

### Do
- Keep the experience warm, trustworthy, and premium
- Use generous radii and elevated search surfaces
- Let imagery and place-based storytelling lead where appropriate
- Keep transactional UI clean, legible, and confidence-building
- Use coral/rausch accents strategically for action and emphasis

### Don't
- Don’t make Airbnb look like a generic checkout form
- Don’t flatten everything into hard rectangles and cold grays
- Don’t overuse gradients outside brand-specific premium modules
- Don’t pack list items so tightly that browsing feels stressful
- Don’t let decorative travel photography reduce the usability of filters and pricing

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 744px` | Stacked cards, drawer-style filters, simplified floating search |
| Tablet | `744px - 1127px` | Denser grids, persistent search, partial side panels |
| Desktop | `1128px+` | Wide listing grids, richer search/filter chrome, multi-column booking layouts |

### Responsive Rules
- Keep the primary search action obvious and reachable on small screens
- Collapse wide filter bars into drawers or pill rows without losing hierarchy
- Maintain large, tappable chips for dates, guests, and category selection
- Preserve generous image ratios and card rounding on mobile
- Let complex booking detail panels stack rather than over-compress

---

## 9. Agent Prompt Guide

### Quick Reference
- **Foundation**: white, warm neutrals, charcoal text
- **Brand accent**: Airbnb rausch coral with deeper product red and selective premium gradients
- **Typography**: Airbnb Cereal-style sans with calm, readable hierarchy
- **Shape language**: rounded cards, floating pills, elevated search shells
- **Mood**: hospitality, travel editorial, trustworthy, premium but friendly

### Prompt Template
```text
Design this like Airbnb:
- Bright white and warm-neutral surfaces with dark charcoal text
- Generous rounded corners and elevated floating search/filter chrome
- Large editorial imagery and listing-card layouts
- Soft premium spacing that feels welcoming and trustworthy
- Coral action accents used selectively for key CTAs and brand emphasis
```

### Avoid
- Hard-edged enterprise UI
- Overly dense commerce grids
- Neon travel visuals with no restraint
- Cold blue-gray product surfaces that lose hospitality warmth
