---
name: implement-ui
description: Implement UI from a selected design direction or design system using the existing frontend stack.
---

# hehehe:implement-ui

Use to build UI after design direction is clear.

Use `hehehe:resume` in automatic mode before non-trivial implementation and run the app with the selected task workspace and runtime identity.
Use `hehehe:frontend-architecture` before non-trivial implementation.

- Default new frontend structure to FSD.
- Default styling to Tailwind CSS.
- Follow an explicit user request for another architecture or styling system.
- In an established project, keep its single coherent architecture and styling system unless migration is in scope.
- Keep route files compositional, state/API ownership explicit, and shared UI domain-neutral.

Codex reads the frontend architecture first, implements with existing components and conventions, starts the app when needed, and validates in browser. Claude can critique the resulting screen but cannot replace browser validation.
