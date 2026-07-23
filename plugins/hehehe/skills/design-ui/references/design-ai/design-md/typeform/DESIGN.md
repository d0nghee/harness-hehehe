# Typeform Design System

> Conversational form design with editorial personality, expressive brand customization, and low-friction question-by-question interaction.

---

## 1. Visual Theme & Atmosphere

Typeform should feel human, focused, and conversational. The interface is not a spreadsheet-like survey tool; it is a guided exchange where each question receives space, personality, and clear interaction feedback.

- Mood: conversational, polished, expressive, calm, brandable
- Density: low-to-medium, with one primary decision at a time
- Character: large question typography, generous spacing, soft panels, customizable brand surfaces

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--typeform-eggplant` | `#2A222B` | Deep brand ink and primary text |
| `--typeform-coral` | `#EF6451` | Warm CTA and expressive accent |
| `--typeform-blue` | `#388AED` | Link and interactive accent |
| `--typeform-blue-strong` | `#006BFF` | Strong action / focus state |
| `--surface-page` | `#F6F4EF` | Warm page background |
| `--surface-card` | `#FFFFFF` | Question and form surfaces |
| `--surface-soft` | `#EEE8DF` | Subtle section background |
| `--border-default` | `#DCD5CB` | Inputs and dividers |
| `--text-muted` | `#6F6870` | Helper text and metadata |

Typeform experiences are often brand-customized, so the core system should support color overrides while preserving contrast, legibility, and conversational rhythm.

## 3. Typography Rules

```css
--font-display: "Tobias", Georgia, "Times New Roman", serif;
--font-sans: "TWK Lausanne", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Display | 64px | 500 | 1.05 |
| Question Title | 42px | 500 | 1.15 |
| Section Title | 30px | 600 | 1.2 |
| Card Title | 22px | 600 | 1.3 |
| Body | 16px | 400 | 1.6 |
| Helper | 14px | 400 | 1.45 |
| Label | 13px | 600 | 1.35 |

## 4. Component Stylings

```css
.button-primary {
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid #2A222B;
  border-radius: 12px;
  background: #2A222B;
  color: #FFFFFF;
  font: 600 15px/1 "TWK Lausanne", Inter, sans-serif;
}

.question-panel {
  max-width: 760px;
  padding: 32px;
  border-radius: 24px;
  background: #FFFFFF;
}

.input {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-bottom: 2px solid #DCD5CB;
  background: transparent;
  color: #2A222B;
  font: 400 22px/1.35 "TWK Lausanne", Inter, sans-serif;
}

.input:focus {
  outline: none;
  border-color: #006BFF;
}
```

## 5. Layout Principles

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Answer spacing |
| `--space-4` | `16px` | Input rhythm |
| `--space-6` | `32px` | Question panels |
| `--space-10` | `64px` | Major form stages |

Use centered, narrow question flows. Keep progress, helper text, and answer choices visible without making the screen feel like an admin form.

## 6. Depth & Elevation

```css
.shadow-panel { box-shadow: 0 12px 30px rgba(42, 34, 43, 0.08); }
.shadow-modal { box-shadow: 0 24px 60px rgba(42, 34, 43, 0.16); }
```

Favor flat editorial surfaces and subtle depth. Focus should come from typography, spacing, and active state.

## 7. Do's and Don'ts

Do make one question feel important. Do allow brand customization. Do use friendly interaction states. Do not compress questions into dense tables. Do not overdecorate answer choices.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Single-column questions, large touch targets |
| Tablet | `768px` | Centered form panel with wider answers |
| Desktop | `1200px` | Full editorial spacing and optional side media |

Keep answer choices at least `44px` tall and preserve large question text on mobile.

## 9. Agent Prompt Guide

Design like Typeform: conversational one-question-at-a-time forms, warm editorial surfaces, large expressive question typography, soft brandable panels, clear progress, and calm low-friction input states.
