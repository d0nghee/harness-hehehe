# Perplexity Design System

> Answer-engine design with paper-white calm, dark citation-focused reading, and a restrained turquoise intelligence accent.

---

## 1. Visual Theme & Atmosphere

Perplexity should feel like search, research, and reading compressed into one calm answer surface. The interface is less chatbot spectacle and more cited exploration: focused input, readable answers, sources, follow-ups, and collections.

- Mood: curious, calm, cited, precise, research-oriented
- Density: medium, with source cards and answer structure
- Character: paper-like neutrals, deep ink, turquoise accent, minimal chrome

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--pplx-offblack` | `#091717` | Primary text and dark surface |
| `--pplx-paper` | `#FBFAF4` | Warm page background |
| `--pplx-turquoise` | `#20808D` | Primary accent and active state |
| `--pplx-turquoise-dark` | `#016A71` | Hover / stronger action |
| `--surface-card` | `#FFFFFF` | Answer and source cards |
| `--surface-soft` | `#F3F1EA` | Secondary background |
| `--border-default` | `#DEDAD0` | Borders and dividers |
| `--text-muted` | `#5F6966` | Metadata and source snippets |

Use turquoise sparingly. Keep most surfaces reading-first and warm.

## 3. Typography Rules

```css
--font-sans: "pplxSans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-serif: Georgia, "Times New Roman", serif;
--font-mono: "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Display | 54px | 650 | 1.08 |
| Page Title | 38px | 650 | 1.15 |
| Answer Title | 28px | 650 | 1.25 |
| Source Title | 16px | 600 | 1.35 |
| Body | 16px | 400 | 1.7 |
| Small | 14px | 400 | 1.5 |
| Label | 13px | 600 | 1.35 |

## 4. Component Stylings

```css
.search-box {
  min-height: 56px;
  border: 1px solid #DEDAD0;
  border-radius: 18px;
  background: #FFFFFF;
  padding: 0 16px;
  color: #091717;
}

.button-primary {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid #20808D;
  border-radius: 999px;
  background: #20808D;
  color: #FFFFFF;
  font: 600 14px/1 Inter, sans-serif;
}

.answer-card {
  border: 1px solid #DEDAD0;
  border-radius: 18px;
  background: #FFFFFF;
  padding: 22px;
}

.source-chip {
  border: 1px solid #DEDAD0;
  border-radius: 999px;
  background: #FBFAF4;
  padding: 6px 10px;
}
```

## 5. Layout Principles

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Source spacing |
| `--space-4` | `16px` | Paragraph rhythm |
| `--space-5` | `24px` | Answer cards |
| `--space-8` | `48px` | Major sections |

Center the query entry, then make answer, sources, related questions, and follow-ups easy to scan.

## 6. Depth & Elevation

```css
.shadow-card { box-shadow: 0 8px 20px rgba(9, 23, 23, 0.06); }
.shadow-search { box-shadow: 0 16px 36px rgba(9, 23, 23, 0.10); }
```

Use subtle elevation only for active search and answer panels. The design should feel readable, not layered.

## 7. Do's and Don'ts

Do prioritize citations, answer hierarchy, and follow-up flow. Do use paper-like backgrounds. Do not make it look like a generic chat app. Do not overuse turquoise.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Single-column answers and sources |
| Tablet | `768px` | Wider answer body, source cards below |
| Desktop | `1200px` | Answer column with related/source side support |

Keep search input large enough for natural language questions.

## 9. Agent Prompt Guide

Design like Perplexity: paper-white research surfaces, deep off-black text, restrained turquoise actions, cited answer cards, source chips, and a calm answer-engine rhythm.
