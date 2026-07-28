---
name: design-system
description: Extract a practical design system from a selected UI direction for implementation.
---

# hehehe:design-system

Use after a UI direction is chosen.

Define:

- layout grid and spacing
- typography scale
- color tokens
- component states
- form and navigation patterns
- responsive behavior

Keep tokens implementable in the current codebase.

Use Tailwind theme tokens, CSS variables, and utilities by default. Follow an explicit user request for another styling system. Do not introduce Tailwind alongside an established non-Tailwind system during a scoped change unless migration is authorized.
