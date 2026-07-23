# Spotify Design System

> Streaming product with immersive dark-mode gravity. The current public Spotify web surfaces ship `SpotifyMixUI`, `SpotifyMixUITitle`, `SpotifyMixUITitleVariable`, and `SpotifyMixMono`, and rely on near-black surfaces (`#121212`, `#181818`, `#141414`, `#000000`), elevated charcoal panels (`#282828`, `#1F1F1F`), bright white text, subdued gray copy (`#B3B3B3`, `#A7A7A7`), and the signature Spotify green (`#1ED760`, `#1DB954`, `#1ABC54`, `#13873C`) with compact Encore spacing and small-to-medium corner radii.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Spotify feels like **a cinematic media player built on a disciplined design system**. The product is unapologetically dark-first. Art, playlists, and mood surfaces create the emotional layer, while navigation rails, playback chrome, search, and library structures stay highly standardized. The result is immersive without being chaotic.

### Mood & Feeling
- **Immersive entertainment**: Music and artwork sit at the center of the experience
- **Systemic consistency**: The Encore system keeps the UI tight and repeatable
- **Confident contrast**: Bright type on dark surfaces creates immediate scanability
- **Energetic minimalism**: Bold but not ornamental, dense but still controlled
- **Live-product immediacy**: Playback, queues, and rails feel active and responsive

### Design Density
**Medium-to-high density**. Spotify is comfortable showing many rows, shelves, and actions in a single view. The layout remains manageable through repetition, spacing tokens, consistent card structures, and clear dark-surface layering.

### Visual Character
- Black and charcoal layered surfaces
- Bright green primary action accent
- Large art-driven cards and circular artist imagery
- Tight, repeated content rails for playlists, albums, artists, and charts
- Clear playback chrome and sticky bars
- White headings with subdued gray metadata
- Rounded but not bubbly controls, often 4px to 8px

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--spotify-black` | `#000000` | Deepest base, maximum contrast sections |
| `--spotify-bg` | `#121212` | Primary app background |
| `--spotify-surface` | `#181818` | Elevated app panel background |
| `--spotify-surface-strong` | `#141414` | Darker panel / chrome |
| `--spotify-panel` | `#282828` | Tooltip, menu, and elevated card background |
| `--spotify-card` | `#1F1F1F` | Strong content containers |

### Text Scale

| Token | Hex | Role |
|-------|-----|------|
| `--text-primary` | `#FFFFFF` | Headings, titles, key controls |
| `--text-secondary` | `#B3B3B3` | Metadata, helper copy |
| `--text-tertiary` | `#A7A7A7` | Muted labels, supporting text |
| `--text-disabled` | `rgba(255,255,255,0.7)` | Disabled or lower-emphasis content on dark |

### Brand and Accent Colors

| Token | Hex | Role |
|-------|-----|------|
| `--spotify-green` | `#1ED760` | Primary brand and CTA accent |
| `--spotify-green-legacy` | `#1DB954` | Older brand/action green still present |
| `--spotify-green-hover` | `#1ABC54` | Dark-surface hover/active state |
| `--spotify-green-deep` | `#13873C` | Pressed and darker green actions |
| `--info-blue` | `#0D72EA` | Tooltips, educational overlays |
| `--accent-blue` | `#2E77D0` | Feature cards and secondary emphasis |
| `--accent-purple` | `#7358FF` | Promotional or category accent |
| `--danger-red` | `#E91429` | Destructive or negative actions |

### Supporting Palette

| Token | Hex | Role |
|-------|-----|------|
| `--highlight-yellow` | `#FFD97E` | Artwork/category support accent |
| `--soft-pink` | `#FFD2D7` | Warm supporting card accent |
| `--soft-blue` | `#C8E0FC` | Cool supporting card accent |
| `--soft-green` | `#96F0B6` | Success or supportive green surface |

### Common Overlays

| Token | Value | Role |
|-------|-------|------|
| `--overlay-strong` | `rgba(0,0,0,0.7)` | Modal and overlay background |
| `--overlay-deeper` | `rgba(0,0,0,0.9)` | Strong gradient/footer overlays |
| `--surface-tint` | `rgba(255,255,255,0.1)` | Subtle overlays on dark surfaces |
| `--surface-tint-strong` | `rgba(255,255,255,0.3)` | Active circular controls on dark |

---

## 3. Typography Rules

### Font Stack

```css
/* Live Encore stacks from current public web surfaces */
--font-body: SpotifyMixUI, CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl,
             CircularSp-Grek, CircularSp-Deva, sans-serif;

--font-title: SpotifyMixUITitle, CircularSp-Arab, CircularSp-Hebr,
              CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, sans-serif;

--font-title-variable: SpotifyMixUITitleVariable, CircularSp-Arab,
                       CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek,
                       CircularSp-Deva, sans-serif;

--font-mono: SpotifyMixMono, CircularSp-Arab, CircularSp-Hebr,
             CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 48px | 700 | 1.05 | -0.02em | `--text-primary` |
| Page Title | 32px | 700 | 1.1 | -0.02em | `--text-primary` |
| Section Title | 24px | 700 | 1.2 | -0.01em | `--text-primary` |
| Card Title | 18px | 700 | 1.33 | 0 | `--text-primary` |
| Subsection | 16px | 700 | 1.25 | 0 | `--text-primary` |
| Body Large | 16px | 400 | 1.5 | 0 | `--text-primary` |
| Body | 14px | 400 | 1.4 | 0 | `--text-secondary` |
| Small Body | 13px | 400 | 1.35 | 0 | `--text-tertiary` |
| Label | 12px | 700 | 1.3 | 0.04em | `--text-secondary` |
| Caption | 11px | 400 | 1.3 | 0 | `--text-tertiary` |
| Mono | 13px | 400 | 1.4 | 0 | `--text-primary` |

### Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Metadata, descriptions, secondary content |
| 500 | Medium | Minor controls and compact emphasis |
| 700 | Bold | Section titles, cards, key calls to action |

### Typography Philosophy
Spotify typography is built around **impactful titles and compact scanability**. Titles need to hold against album art and black backgrounds, while metadata remains highly legible across dense lists and rails. The system prefers boldness and clarity over subtle editorial nuance.

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
  background: #1ed760;
  color: #000000;
  border: none;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 700;
  transition: transform 100ms ease, background 150ms ease;
}

.button-primary:hover {
  background: #3be477;
  transform: scale(1.02);
}

.button-primary:active {
  background: #1abc54;
  transform: scale(0.98);
}
```

#### Secondary / Ghost Button
```css
.button-secondary {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  min-height: 48px;
  padding: 0 24px;
}

.button-secondary:hover {
  border-color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}
```

### Cards and Media Tiles
```css
.media-card {
  background: #181818;
  border-radius: 8px;
  padding: 16px;
}

.media-card:hover {
  background: #1f1f1f;
}

.cover-art {
  border-radius: 4px;
  overflow: hidden;
}

.artist-art {
  border-radius: 50%;
  overflow: hidden;
}
```

### Search and Inputs
```css
.input {
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 4px;
  min-height: 48px;
  padding: 12px 16px;
}

.input::placeholder {
  color: #000000;
}
```

### Navigation and Playback Chrome
- Left navigation should feel persistent, compact, and systemized
- Playback controls live in fixed or sticky bars with strong state visibility
- Toolbar and rail surfaces usually step from `#121212` to `#181818` or `#282828`
- Action icons stay understated until hover or active states

### Tooltips, Menus, and Overlays
```css
.tooltip {
  background: #282828;
  color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.3), 0 6px 8px rgba(0, 0, 0, 0.2);
}

.coachmark {
  background: #0d72ea;
  color: #ffffff;
  border-radius: 8px;
}
```

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--encore-spacing-tighter-5` | `2px` | Fine alignment |
| `--encore-spacing-tighter-4` | `4px` | Tight icon spacing |
| `--encore-spacing-tighter-3` | `6px` | Very small gaps |
| `--encore-spacing-tighter-2` | `8px` | Compact padding |
| `--encore-spacing-tighter` | `12px` | Small control rhythm |
| `--encore-spacing-base` | `16px` | Standard component padding |
| `--encore-spacing-looser` | `20px` | Slightly larger spacing |
| `--encore-spacing-looser-2` | `24px` | Card and section gap |
| `--encore-spacing-looser-3` | `32px` | Larger structural separation |
| `--encore-spacing-looser-4` | `40px` | Big section spacing |
| `--encore-spacing-looser-5` | `48px` | Hero or large shelf spacing |
| `--encore-spacing-looser-6` | `64px` | Maximum layout separation |

### Layout Behavior
- Use rails, shelves, and stacked media modules as primary composition patterns
- Keep navigation and playback structures consistent across screens
- Let artwork dominate the emotional layer while metadata remains compact
- Use dark surface stepping to separate sections instead of heavy borders
- Prefer scrolling content shelves over overcrowded masonry or mixed card logic

### Whitespace Philosophy
Spotify whitespace should feel **efficient and musical**, not sparse. Leave enough room for artwork and clear grouping, but keep the interface dense enough to support discovery and continuous playback.

---

## 6. Depth & Elevation

### Elevation Strategy
Spotify uses **layered dark surfaces** more than dramatic light-mode shadows. Depth is created through black-to-charcoal stepping, scrims, sticky playback bars, and occasional soft overlays. Menus and tooltips add shadow, but the main hierarchy comes from surface contrast.

### Shadow Language

```css
--shadow-soft: 0 6px 8px rgba(0, 0, 0, 0.2);
--shadow-medium: 0 16px 24px rgba(0, 0, 0, 0.3);
--overlay-scrim: rgba(0, 0, 0, 0.7);
--overlay-scrim-deep: rgba(0, 0, 0, 0.9);
```

### Surface Hierarchy
- Base background: `#121212`
- Elevated navigation and app chrome: `#181818`
- Menus/tooltips/cards: `#282828` or `#1F1F1F`
- Media overlays: translucent black or white tints
- Inputs/search: bright white exception surfaces for contrast

---

## 7. Do's and Don'ts

### Do
- Keep Spotify dark-first and art-forward
- Use bright green for the main action hierarchy
- Preserve consistent shelf, rail, and playback patterns
- Let white type and subdued gray metadata carry the information hierarchy
- Use small-to-medium radii and compact spacing to keep the system tight

### Don't
- Don’t brighten the whole interface into a generic light SaaS look
- Don’t replace black/charcoal hierarchy with flat single-tone gray
- Don’t overuse neon accent colors beyond Spotify green
- Don’t let album art and gradients overwhelm text legibility
- Don’t make component spacing so loose that content discovery slows down

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Stacked rails, sticky playback bar, simplified nav |
| Tablet | `768px - 1199px` | Denser content columns, expanded shelves |
| Desktop | `1200px+` | Full navigation rails, more simultaneous content panels |

### Responsive Rules
- Preserve persistent playback visibility on every screen size
- Collapse wide navigation systems into simpler bars or drawers on smaller screens
- Keep artwork readable and correctly cropped before preserving exact row counts
- Maintain large tap targets for playback and media controls
- Allow rails to scroll horizontally instead of crushing cards

---

## 9. Agent Prompt Guide

### Quick Reference
- **Foundation**: near-black background, charcoal elevation, white text
- **Brand accent**: Spotify green for primary actions
- **Typography**: SpotifyMix-style bold titles, compact metadata, mono support
- **Shape language**: small-to-medium radii, pill buttons, clean media cards
- **Mood**: immersive, modern, energetic, music-first

### Prompt Template
```text
Design this like Spotify:
- Dark-first UI with layered black and charcoal surfaces
- Bright green primary actions and strong white typography
- Art-led cards and shelves for playlists, albums, and artists
- Compact, systematic spacing with sticky playback-style chrome
- Immersive entertainment mood without losing scanability
```

### Avoid
- Bright white overall backgrounds
- Excessive decorative gradients unrelated to media content
- Loose, floaty layouts that weaken discovery density
- Weak contrast between metadata and primary text
