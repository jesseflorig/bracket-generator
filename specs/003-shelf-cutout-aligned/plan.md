# Implementation Plan: Shelf-Cutout Alignment

**Branch**: `003-shelf-cutout-aligned` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/003-shelf-cutout-aligned/spec.md`

## Summary

Replace the shelf's width and vertical positioning logic in `buildShelf` so the shelf is sized and positioned to match the faceplate cutout rather than the rack opening. The shelf side walls will be flush with the cutout's left/right edges, and the shelf bottom will be flush with the cutout's lower edge. The cutout dimensions (`cutoutWidth`, `cutoutHeight`) drive shelf geometry; if either is zero, no shelf renders. No schema, store, or UI changes are required — this is a pure geometry adjustment.

## Technical Context

**Language/Version**: TypeScript 5.x strict  
**Primary Dependencies**: Three.js, @react-three/fiber, Zustand, Zod  
**Storage**: N/A  
**Testing**: Vitest  
**Target Platform**: Browser (Vite SPA)  
**Project Type**: Desktop-class web application  
**Performance Goals**: Preview updates in <500ms  
**Constraints**: Geometry layer DOM-free; all values in mm  
**Scale/Scope**: Single function change in one file

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | ✅ Pass | Change entirely within `src/geometry/bracket.ts`. No React imports added. |
| II. Parametric Model Integrity | ✅ Pass | No schema changes. Existing `cutoutWidth` and `cutoutHeight` already validated by Zod. Zero-dimension guard lives in geometry, not schema. |
| III. Real-Time Preview | ✅ Pass | Store/hook architecture unchanged. |
| IV. Export Fidelity | ✅ Pass | Same geometry pipeline; repositioned parts produce correct STL/3MF. |
| V. Simplicity & YAGNI | ✅ Pass | One function updated, no new abstractions. |
| VI. Unit System | ✅ Pass | All values remain in mm. No conversion logic introduced. |

No violations. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/003-shelf-cutout-aligned/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
└── tasks.md         ← Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/geometry/
├── bracket.ts        ← UPDATE: buildShelf function only
└── bracket.test.ts   ← UPDATE: shelf geometry tests for new positioning
```

**All other files unchanged.** No schema, store, component, export, or page modifications needed.
