# Research: Mounting Holes Render as Cutouts

**Feature**: 005-mounting-hole-cutouts  
**Date**: 2026-04-18

## Findings

### Does `THREE.ExtrudeGeometry` with `shape.holes` produce visible through-holes?

**Decision**: Yes — `shape.holes` paths are subtracted from the extruded shape, producing an open void through the full depth of the extrusion. No additional CSG or boolean operations are needed.

**Rationale**: `THREE.ShapeGeometry` and `THREE.ExtrudeGeometry` both respect holes defined on `THREE.Shape`. Each hole path is treated as a subtraction region, and the triangulation algorithm (earcut) handles the interior void. The resulting mesh has no faces inside the hole area — it is genuinely open from front face to back face.

**Alternatives considered**: CSG subtraction (e.g., `three-bvh-csg`) — unnecessary; the existing `shape.holes` approach already achieves the same result without an additional library.

### Are there any visual quality tradeoffs from removing the cylinder overlays?

**Decision**: The cylinders provided fake depth shading inside the holes (the near-black color simulated a dark interior). Removing them means the hole interior shows whatever is behind the faceplate in the scene. Given the scene background and shelf geometry behind the faceplate, the through-holes will show scene content — which is the correct and expected behavior for a physically accurate preview.

**Rationale**: The dark cylinder was a workaround for a renderer that wasn't showing through-holes. Once the through-holes are visible, the workaround is both redundant and harmful (it blocks the actual hole).

### Any risk to export geometry?

**Decision**: No risk. `buildBracket` in `src/geometry/bracket.ts` already uses `shape.holes` for the mounting holes. The exported geometry has had correct through-holes since the geometry layer was implemented. The viewer cylinders were never part of the export path.

## Summary of Unknowns Resolved

| Unknown | Resolution |
|---------|-----------|
| Does shape.holes create real through-holes? | Yes — confirmed by Three.js ExtrudeGeometry behavior |
| Will removing cylinders degrade visual quality? | No — scene content visible through holes is correct behavior |
| Do exports need to change? | No — geometry layer already correct |
