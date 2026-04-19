# Implementation Plan: Initial App — Bracket Generator

**Branch**: `001-initial-app` | **Date**: 2026-04-18 | **Spec**: (greenfield — no separate spec)
**Input**: Constitution + user description: "build the initial app"

## Summary

Build a TypeScript + React + Tailwind web app that renders a parametric server
rack bracket as a 3D model in real time, with sliders/inputs for all dimensions,
imperial/metric unit toggle, and export to STL and 3MF formats. Internal
representation is always mm; unit conversion occurs only at the UI boundary.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 18, @react-three/fiber, @react-three/drei, three,
  zustand, jszip, zod, tailwindcss
**Storage**: N/A (no persistence — all state in-memory)
**Testing**: Vitest (unit tests for geometry builder and unit conversion)
**Target Platform**: Modern browser (Chrome/Firefox/Safari), desktop viewport
**Project Type**: Web application (single-page, no backend)
**Performance Goals**: Geometry recompute < 16ms per parameter change (60fps)
**Constraints**: All exports in mm; no backend calls; offline-capable
**Scale/Scope**: Single-page app, ~10 components, 6 source modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First Architecture | ✅ PASS | `src/components/` for UI, `src/geometry/` for math — no cross-import |
| II. Parametric Model Integrity | ✅ PASS | Zod schema validates at UI boundary before entering geometry layer |
| III. Real-Time Preview | ✅ PASS | `useMemo` on params → BufferGeometry drives R3F re-render |
| IV. Export Fidelity | ✅ PASS | STL via Three.js STLExporter; 3MF custom serializer with explicit `unit="millimeter"` |
| V. Simplicity & YAGNI | ✅ PASS | No backend, no extra abstraction layers, no speculative features |
| VI. Unit System | ✅ PASS | Store holds mm; `src/units/convert.ts` is sole conversion site; all exports in mm |

**Post-Phase 1 re-check**: All principles satisfied. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-initial-app/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── geometry-api.md  ← Phase 1 output
└── tasks.md             ← Phase 2 output (from /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── BracketViewer.tsx      # R3F canvas + orbit controls
│   ├── DimensionPanel.tsx     # All sliders/inputs (left sidebar)
│   ├── DimensionSlider.tsx    # Single labeled slider + number input
│   ├── UnitToggle.tsx         # mm / in switch
│   ├── ExportBar.tsx          # STL + 3MF download buttons
│   └── ValidationMessage.tsx  # Per-field inline error display
├── geometry/
│   └── bracket.ts             # buildBracket(params): BufferGeometry
├── models/
│   └── bracketParams.ts       # Zod schema, BracketParams type, defaults
├── store/
│   └── bracketStore.ts        # Zustand store (AppState)
├── units/
│   └── convert.ts             # toMm, fromMm, formatDisplay
├── export/
│   ├── exportStl.ts           # exportStl(payload): void
│   └── export3mf.ts           # export3mf(payload): Promise<void>
├── pages/
│   └── BracketPage.tsx        # Layout: left sidebar + right 3D viewer
└── main.tsx

index.html
vite.config.ts
tailwind.config.ts
tsconfig.json
package.json
```

**Structure Decision**: Single-page web app. No backend. All source under `src/`.
No `frontend/backend` split needed — this is a fully client-side tool.

## Complexity Tracking

> No constitution violations — table not required.
