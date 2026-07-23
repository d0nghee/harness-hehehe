# ElevenLabs Design System

> AI audio design with stark black-and-white foundations, refined voice-first minimalism, and precise production controls.

---

## 1. Visual Theme & Atmosphere

ElevenLabs should feel like audio research transformed into a clean creative tool. The design is minimal, technical, and production-oriented, with enough expressiveness to represent voices, speech, music, and narrative media.

- Mood: refined, audio-focused, precise, creative, research-grade
- Density: medium, especially in timeline and generation controls
- Character: monochrome base, subtle blue accents, waveform and playback modules

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| `--eleven-black` | `#000000` | Primary brand and strongest text |
| `--eleven-white` | `#FFFFFF` | Main background and inverted text |
| `--neutral-100` | `#F5F5F5` | Light panels and cards |
| `--neutral-300` | `#D4D4D4` | Borders and inactive controls |
| `--neutral-700` | `#404040` | Secondary text |
| `--eleven-blue` | `#5D79DF` | Interactive accent |
| `--success` | `#10B978` | Generation success / ready state |
| `--warning` | `#F59E0B` | Processing or caution |
| `--danger` | `#DC2626` | Error state |

Use monochrome for the core interface. Use blue only for interaction and audio state, not decoration.

## 3. Typography Rules

```css
--font-display: Waldenburg, Inter, ui-sans-serif, system-ui, sans-serif;
--font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, monospace;
```

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Display | 62px | 700 | 1.04 |
| Page Title | 42px | 700 | 1.1 |
| Section Title | 30px | 700 | 1.2 |
| Card Title | 22px | 600 | 1.3 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.45 |
| Label | 13px | 600 | 1.35 |

## 4. Component Stylings

```css
.button-primary {
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #000000;
  border-radius: 999px;
  background: #000000;
  color: #FFFFFF;
  font: 600 14px/1 Inter, sans-serif;
}

.audio-panel {
  border: 1px solid #D4D4D4;
  border-radius: 18px;
  background: #FFFFFF;
  padding: 20px;
}

.waveform {
  min-height: 72px;
  border-radius: 14px;
  background: #F5F5F5;
}

.input {
  min-height: 46px;
  border: 1px solid #D4D4D4;
  border-radius: 12px;
  padding: 0 14px;
}
```

## 5. Layout Principles

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `8px` | Control spacing |
| `--space-4` | `16px` | Core rhythm |
| `--space-5` | `24px` | Audio panels |
| `--space-8` | `48px` | Major sections |

Lead with generation, playback, voice choice, and transcript editing. Make controls feel like a studio surface, not a marketing card deck.

## 6. Depth & Elevation

```css
.shadow-panel { box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08); }
.shadow-modal { box-shadow: 0 22px 54px rgba(0, 0, 0, 0.16); }
```

Use restrained shadows. Audio controls should feel solid and engineered.

## 7. Do's and Don'ts

Do use waveforms, playback controls, and transcript structure. Do keep the palette disciplined. Do not make the UI colorful unless color maps to voice or state. Do not hide technical generation settings.

## 8. Responsive Behavior

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | `0px` | Stack transcript, settings, and playback |
| Tablet | `768px` | Two-column editor/settings |
| Desktop | `1200px` | Full studio layout with side panels |

Keep play and generate controls reachable and at least `44px` tall.

## 9. Agent Prompt Guide

Design like ElevenLabs: monochrome AI audio studio, crisp black CTAs, white production panels, waveform modules, precise voice controls, and subtle blue interaction states.
