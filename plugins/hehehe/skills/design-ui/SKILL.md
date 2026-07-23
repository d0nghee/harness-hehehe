---
name: design-ui
description: Generate UI design directions for a product screen or workflow before implementation, including optional use of bundled DESIGN.md references from Design AI Systems when the user asks for a known brand-like, website-inspired, or design-system-led UI direction.
---

# hehehe:design-ui

Use when the user wants UI direction before building.

Create up to five distinct, practical design directions. Each must describe layout, interaction model, visual system, components, and tradeoffs. Favor designs that fit the product domain over decorative novelty.

## Design AI Systems references

This skill includes markdown design-system references from `references/design-ai/design-md/<brand>/DESIGN.md`, sourced from `github.com/Khalidabdi1/design-ai`.

Use these references when the user asks for:

- a UI direction inspired by a named company, product, website, or brand style
- examples of concrete design-system language before implementation
- a stronger visual system than generic adjectives such as "modern", "clean", or "premium"

Before using a reference, inspect the matching `DESIGN.md` file and adapt it to the user's product, not as a literal clone. Preserve useful guidance about visual theme, colors, typography, component styling, layout, depth, responsive behavior, and prompt-ready style constraints.

If the requested brand is not available, choose the closest reference by product domain and explain the substitution briefly. Good starting references include:

- `stripe` for fintech, developer tools, APIs, dashboards, and premium data-rich UI
- `figma` for design tools, modular workspaces, and crisp creation surfaces
- `apple` for premium consumer technology and restrained product pages
- `slack` for warm enterprise collaboration software
- `airbnb` for travel, marketplace, hospitality, and editorial commerce
- `github`, `linear`, `vercel`, or `notion` for developer/productivity tools
- `netflix`, `spotify`, or `steam` for media, entertainment, and gaming surfaces
- `paypal`, `coinbase`, `wise`, or `revolut` for payments and finance flows

Do not claim affiliation with referenced brands. Do not reproduce protected logos, exact copy, or trademarked identity as the product's own brand unless the user owns that brand or explicitly asks for an internal mockup. Use the references as design-language input: structure, density, interaction feel, palette roles, and component behavior.

Do not implement until the user chooses a direction or asks Codex to proceed.
