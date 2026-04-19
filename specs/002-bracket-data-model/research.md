# Research: Bracket Data Model Redesign

**Branch**: `002-bracket-data-model` | **Date**: 2026-04-18

## Decision 1: Faceplate Geometry — Shape + ExtrudeGeometry with Holes

**Decision**: Use `THREE.Shape` with `shape.holes` for all perforations (rectangular cutout + circular mounting holes), then `THREE.ExtrudeGeometry` to produce the faceplate solid.

**Rationale**: Three.js's Shape/Path system supports compound shapes with multiple hole paths natively. Both the cutout (rectangular Path) and mounting holes (circular Paths via `absarc`) can be punched in a single extrude call — no CSG library needed. The result is a geometrically correct solid where holes are real topology, not visual overlays. This satisfies Constitution IV (export fidelity) without added dependencies.

**Alternatives considered**:
- **CSG subtraction** (e.g., `three-bvh-csg`): Correct but heavy — adds a dependency and is significantly slower for simple perforations that Shape handles natively.
- **Visual-only cylinders** (current approach for holes): Incorrect for export — exported STL/3MF would show no holes. Rejected.
- **RoundedBoxGeometry** from `three/examples/jsm/geometries/RoundedBoxGeometry.js`: Handles the outer shape but cannot add a cutout or holes without CSG. Rejected.

**Rounded-corner path construction** (for reference during implementation):
```
// Rounded rectangle using lineTo + absarc at each corner
const w = faceplateWidth, h = faceplateHeight, r = cornerRadius;
shape.moveTo(-w/2 + r, -h/2);
shape.lineTo(w/2 - r, -h/2);
shape.absarc(w/2 - r, -h/2 + r, r, -Math.PI/2, 0, false);
shape.lineTo(w/2, h/2 - r);
shape.absarc(w/2 - r, h/2 - r, r, 0, Math.PI/2, false);
shape.lineTo(-w/2 + r, h/2);
shape.absarc(-w/2 + r, h/2 - r, r, Math.PI/2, Math.PI, false);
shape.lineTo(-w/2, -h/2 + r);
shape.absarc(-w/2 + r, -h/2 + r, r, Math.PI, Math.PI*3/2, false);
```

---

## Decision 2: Shelf Geometry — Merged BoxGeometry

**Decision**: Construct the shelf from three `BoxGeometry` pieces (bottom panel + left wall + right wall) and merge with `mergeGeometries` — the same pattern used by the current bracket.ts.

**Rationale**: The shelf is three rectangular solids — no complex curves or perforations. BoxGeometry + merge is the simplest correct approach. Matches existing code patterns (Constitution V).

**Alternatives considered**:
- **Single ExtrudeGeometry U-channel**: Would require a compound outer/inner shape. More complex than three boxes for identical output. Rejected.

**Coordinate layout**:
```
Faceplate: centered on X=0, Y from -faceplateHeight/2 to +faceplateHeight/2, Z from 0 to faceplateDepth
Shelf bottom: X centered on rack opening, Y at -faceplateHeight/2 (bottom), Z from faceplateDepth to faceplateDepth + shelfDepth
Shelf left wall: X at -(rackWidth/2 - shelfWallThickness/2), Y from -faceplateHeight/2 to +faceplateHeight/2, Z same as bottom
Shelf right wall: mirror of left wall
```

---

## Decision 3: Derived Values — Pure Functions, Not Stored

**Decision**: `faceplateWidth`, `shelfMaxWidth`, `holeCount`, and hole positions are computed as exported pure functions in `src/geometry/bracket.ts` (or a helper in `src/models/`). They are never written to the Zustand store.

**Rationale**: Storing derived values introduces the possibility of stale state (store holds a derived value that doesn't match the inputs it was derived from). Pure functions guarantee consistency and are trivially testable. Zustand selectors and `useMemo` already compose well with this pattern.

**Formulas**:
```
faceplateWidth(p)  = p.rackWidth + 2 * p.railWidth
shelfMaxWidth(p)   = p.rackWidth - 2 * p.shelfWallThickness
holeCount(p)       = Math.floor(p.faceplateHeight / 25.4)   // 25.4mm per inch
holePositions(p)   = computed array — see data-model.md
```

**Alternatives considered**:
- **Derived state in Zustand**: Rejected — adds synchronization burden, potential for stale reads.
- **Separate selector file**: Over-engineering for four short functions. They live alongside the geometry builder.

---

## Decision 4: Default Values for Unspecified Fields

The spec did not specify defaults for `cutoutHeight`, `cutoutWidth`, or `shelfDepth`. Engineering defaults chosen:

| Field | Default | Inches | Rationale |
|-------|---------|--------|-----------|
| `cutoutWidth` | 127.0 mm | 5.0" | Centered opening spanning ~59% of the 8.5" faceplate; leaves ≥1.75" of material on each side |
| `cutoutHeight` | 19.05 mm | 0.75" | Covers ~60% of the 1.25" faceplate height; leaves material at top and bottom above/below holeEdgeOffset |
| `shelfDepth` | 50.8 mm | 2.0" | Sufficient for cable management and component support in shallow rack applications |

**Alternatives considered**:
- `cutoutWidth = 0` (no cutout): Preview would show a solid plate with no opening — defeats the purpose of the tool. Rejected.
- `shelfDepth = 25.4mm (1")`: Too shallow for practical use. Rejected.

---

## Decision 5: Camera Positioning in BracketViewer

**Decision**: Update camera to reference derived faceplate width and the new param names.

```typescript
// Before
const camY = params.height / 2;
const camZ = params.depth / 2;
camera.position = [params.width * 2, camY + 60, camZ + 140]
target = new THREE.Vector3(0, params.height / 2, params.depth / 2)

// After
const fw = faceplateWidth(params);
const camY = params.faceplateHeight / 2;
const camZ = params.shelfDepth / 2;
camera.position = [fw * 2, camY + 60, camZ + 140]
target = new THREE.Vector3(0, 0, params.shelfDepth / 2)
// Note: faceplate is centered on Y=0 in new layout, so target Y = 0
```

---

## No External Research Required

All unknowns resolved via Three.js documentation and established patterns. No new npm dependencies needed. `THREE.Shape`, `THREE.ExtrudeGeometry`, and `mergeGeometries` are already in the dependency tree.
