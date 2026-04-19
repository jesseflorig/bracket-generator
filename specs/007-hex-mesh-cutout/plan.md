# Implementation Plan: Hexagonal Mesh Cutout on Shelf Walls

**Branch**: `007-hex-mesh-cutout` | **Date**: 2026-04-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/007-hex-mesh-cutout/spec.md`

## Summary

Add hexagonal through-holes to all three shelf wall panels (left, right, bottom), controlled by two new parameters: hole diameter (flat-to-flat, default 0.125"/3.175mm) and gap between holes (default 0.125"/3.175mm). The faceplate already uses `THREE.Shape` + `THREE.Path` holes + `ExtrudeGeometry` to punch circular mounting holes — the shelf walls will adopt the same pattern. No new dependencies. Three files change: `bracketParams.ts`, `bracket.ts`, `DimensionPanel.tsx`.

## Technical Context

**Language/Version**: TypeScript 5.x strict  
**Primary Dependencies**: Three.js, @react-three/fiber, Zustand, Zod, Tailwind CSS  
**Storage**: N/A (no persistence)  
**Testing**: vitest  
**Target Platform**: Browser (Vite dev server / production build)  
**Project Type**: Web application (single-page, parametric 3D tool)  
**Performance Goals**: Real-time preview at interactive frame rates; typical bracket configurations produce ≤ ~200 hex holes per wall, well within budget  
**Constraints**: Geometry layer must be importable without DOM; no new dependencies  
**Scale/Scope**: Single-user tool, in-browser geometry only

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First Architecture | ✅ Pass | Geometry helpers stay in `src/geometry/`; UI sliders in `DimensionPanel.tsx`; no geometry in render path |
| II. Parametric Model Integrity | ✅ Pass | Two new fields validated in Zod schema before entering geometry layer; min/max enforced |
| III. Real-Time Preview | ✅ Pass | New params flow through Zustand store → `buildBracket` → viewer; no extra action required |
| IV. Export Fidelity | ✅ Pass | `ExtrudeGeometry` with Shape holes produces real open geometry; STL/3MF export from same object |
| V. Simplicity & YAGNI | ✅ Pass | Two helpers added with two concrete uses each (left/right walls share the pattern); no speculative abstractions |
| VI. Unit System | ✅ Pass | Both new params stored in mm; UI sliders convert via `src/units/convert.ts` |

No violations. Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/007-hex-mesh-cutout/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — approach decisions
├── data-model.md        # Phase 1 — schema changes
├── quickstart.md        # Phase 1 — implementation guide
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (files changed)

```text
src/
├── models/
│   └── bracketParams.ts   # +hexHoleDiameter, +hexHoleGap fields + defaults
├── geometry/
│   └── bracket.ts         # +hexHolePaths(), +buildHexWallPanel(), updated buildShelf()
└── components/
    └── DimensionPanel.tsx # +two DimensionSlider entries for hex mesh params
```

No new files. No new directories.

**Structure Decision**: Single-project layout, matching all prior features. The three changed files are the minimal set — schema, geometry, UI — consistent with the pattern established in features 003–006.
