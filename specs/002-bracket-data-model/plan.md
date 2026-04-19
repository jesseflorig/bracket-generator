# Implementation Plan: Bracket Data Model Redesign

**Branch**: `002-bracket-data-model` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/002-bracket-data-model/spec.md`

## Summary

Replace the current generic `BracketParams` schema (width/height/depth/thickness/bracketType) with a domain-accurate model: a **faceplate** (rounded rectangle with cutout and computed mounting holes) sitting in front of a **shelf** (bottom + side walls), both derived from a **rack width** input. The existing geometry builder (`bracket.ts`) is fully replaced with a `THREE.Shape` + `ExtrudeGeometry` faceplate and merged `BoxGeometry` shelf parts. All other layers (export, unit conversion) are unaffected.

## Technical Context

**Language/Version**: TypeScript 5.x strict  
**Primary Dependencies**: React 18, @react-three/fiber, @react-three/drei, Three.js, Zustand, Zod, JSZip  
**Storage**: N/A (no persistence)  
**Testing**: Vitest  
**Target Platform**: Browser (Vite SPA)  
**Project Type**: Desktop-class web application  
**Performance Goals**: 3D preview updates in <500ms on input change  
**Constraints**: All dimensions stored in mm; unit conversion only in `src/units/`; geometry layer must be DOM-free  
**Scale/Scope**: Single bracket configuration at a time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | ✅ Pass | Geometry stays in `src/geometry/`, schema in `src/models/`, store in `src/store/`. No geometry logic enters render paths. |
| II. Parametric Model Integrity | ✅ Pass | New Zod schema validates all fields including cross-field rules. Derived values (faceplateWidth, shelfMaxWidth, holeCount) computed as pure functions — never stored. Invalid states surfaced before geometry is consumed. |
| III. Real-Time Preview | ✅ Pass | Store/hook architecture unchanged. `useMemo` on params drives geometry rebuild. |
| IV. Export Fidelity | ✅ Pass | Export layer accepts `BufferGeometry` — no params coupling. Mounting holes and cutout are punched into geometry via `Shape.holes`, not visual-only overlays. 3MF unit attribute remains `millimeter`. |
| V. Simplicity & YAGNI | ✅ Pass | No new abstractions. Derived values are plain functions. Shelf is merged BoxGeometry — no dedicated class. |
| VI. Unit System | ✅ Pass | All defaults stored in mm. `DimensionPanel` converts at boundary using existing `toMm`/`fromMm`. Validation applied in mm after conversion. |

No violations. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/002-bracket-data-model/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
├── quickstart.md    ← Phase 1 output
└── tasks.md         ← Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/
├── models/
│   └── bracketParams.ts      ← REPLACE: new schema + DEFAULT_PARAMS + ExportPayload
├── geometry/
│   ├── bracket.ts            ← REPLACE: new buildBracket + derivedParams functions
│   └── bracket.test.ts       ← REPLACE: tests for new geometry
├── store/
│   └── bracketStore.ts       ← UPDATE: new default params shape (store interface unchanged)
├── components/
│   ├── DimensionPanel.tsx    ← REPLACE: new controls matching new schema
│   ├── BracketViewer.tsx     ← UPDATE: camera uses faceplateHeight/shelfDepth/faceplateWidth
│   └── ExportBar.tsx         ← UPDATE: filename uses new param names
├── units/
│   └── convert.ts            ← UNCHANGED
├── export/
│   ├── exportStl.ts          ← UNCHANGED
│   └── export3mf.ts          ← UNCHANGED
└── pages/
    └── BracketPage.tsx       ← UNCHANGED
```

**Structure Decision**: Single-project layout unchanged. No new directories needed. The geometry replacement is a drop-in at the same file paths.
