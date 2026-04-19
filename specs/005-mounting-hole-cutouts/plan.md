# Implementation Plan: Mounting Holes Render as Cutouts

**Branch**: `005-mounting-hole-cutouts` | **Date**: 2026-04-18 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-mounting-hole-cutouts/spec.md`

## Summary

The faceplate geometry already produces accurate through-holes via `THREE.ExtrudeGeometry` with `shape.holes`. The 3D viewer additionally renders dark cylinder meshes over each hole position to visually simulate depth — but these cylinders block the through-hole view. The fix is to remove those cylinder overlays from `BracketViewer.tsx`. No geometry, model, store, or export changes are required.

## Technical Context

**Language/Version**: TypeScript 5.x strict  
**Primary Dependencies**: React 18, Three.js, @react-three/fiber, Zustand, Zod  
**Storage**: N/A  
**Testing**: Vitest  
**Target Platform**: Browser / WebGL  
**Project Type**: Web application (single-page app)  
**Performance Goals**: Smooth real-time preview at interactive frame rates  
**Constraints**: Geometry layer must remain importable without a DOM context  
**Scale/Scope**: Single-file viewer component change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | ✅ Pass | Change is confined to the viewer component layer; geometry layer is untouched |
| II. Parametric Model Integrity | ✅ Pass | No model or validation changes needed |
| III. Real-Time Preview | ✅ Pass | Removing cylinders improves preview accuracy — holes will now match actual geometry |
| IV. Export Fidelity | ✅ Pass | Export already derives from the geometry layer which has correct through-holes; no divergence introduced |
| V. Simplicity & YAGNI | ✅ Pass | Net code removal — deleting the cylinder overlay loop, no abstractions added |
| VI. Unit System | ✅ Pass | No dimension conversions involved |

No violations. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/005-mounting-hole-cutouts/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A — no data model changes)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (affected files only)

```text
src/
└── components/
    └── BracketViewer.tsx   # Remove dark cylinder mesh overlay per hole position
```

No other files change.

**Structure Decision**: Single-project layout. Only one file in `src/components/` is affected — the cylinder overlay loop in `BracketMesh` is removed. Geometry, model, store, export, and unit layers are all unchanged.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design

### Data Model

No data model changes. Mounting hole parameters (`holeDiameter`, `holeInset`, `holeEdgeOffset`) remain unchanged. The geometry layer already produces correct through-hole geometry.

### Interface Contracts

No external interface changes. This is a purely visual rendering change internal to the viewer component.

### Implementation Notes

**Root cause**: `BracketViewer.tsx` `BracketMesh` renders the faceplate mesh (which has correct through-holes from the geometry layer) and then renders one `<mesh>` cylinder per hole position per side. The cylinders are colored `#1e293b` (near-black) and sized to `faceplateDepth + 2` tall, positioned at the hole center. They visually fill the hole openings.

**Fix**: Delete the cylinder mesh rendering block in `BracketMesh`. The `holePositions` import, `positions` memo, `holeR`, `leftX`, `rightX`, and `holeCylinderZ` locals become unused and should also be removed.

**Verification**: After removing cylinders, the through-holes in the extruded faceplate geometry become visible. The dark interior of the hole (from the scene background) will provide natural depth cues without needing overlay geometry.

**Export**: No change needed. STL and 3MF exports derive from `buildBracket` geometry which already has the holes cut through.
