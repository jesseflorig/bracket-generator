# Implementation Plan: Rack Profile Group

**Branch**: `004-rack-profile-group` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-rack-profile-group/spec.md`

## Summary

Add a collapsible "Rack Profile" group to the dimension panel that merges the current "Rack" and "Mounting Holes" sections. The group collapses to hide those 5 settings (rack width, rail width, hole diameter, inset, edge offset) while keeping the derived faceplate width visible at all times. Collapsed/expanded state is persisted to localStorage and defaults to collapsed. Change is entirely within `DimensionPanel.tsx` — no schema, store, geometry, or export changes.

## Technical Context

**Language/Version**: TypeScript 5.x strict
**Primary Dependencies**: React 18, Zustand, Zod, Tailwind CSS
**Storage**: `localStorage` (UI preference only, not bracket params)
**Testing**: Vitest (no new tests required — pure UI restructure with no testable logic)
**Target Platform**: Browser (Vite SPA)
**Project Type**: Desktop-class web application
**Performance Goals**: Toggle responds immediately (<16ms)
**Constraints**: Geometry layer DOM-free (unchanged); all values in mm (unchanged)
**Scale/Scope**: Single component change in one file

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | ✅ Pass | Change entirely within `DimensionPanel.tsx`. No geometry imports added. |
| II. Parametric Model Integrity | ✅ Pass | No schema changes. `rackCollapsed` is UI preference, not a bracket param. |
| III. Real-Time Preview | ✅ Pass | Params still flow through Zustand store unchanged. Preview unaffected. |
| IV. Export Fidelity | ✅ Pass | No geometry or export changes. |
| V. Simplicity & YAGNI | ✅ Pass | `useState` + `useEffect` + `localStorage` — no new abstractions, no new files. |
| VI. Unit System | ✅ Pass | No dimension values involved. |

No violations. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-rack-profile-group/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
└── tasks.md         ← Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/components/
└── DimensionPanel.tsx   ← UPDATE: add collapsible Rack Profile group
```

**All other files unchanged.** No schema, store, geometry, hook, export, or page modifications needed.
