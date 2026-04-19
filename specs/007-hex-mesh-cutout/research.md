# Research: Hexagonal Mesh Cutout on Shelf Walls

## Decision 1: Hole-punching strategy

**Decision**: Use `THREE.Shape` + `THREE.Path` holes + `ExtrudeGeometry` — the same approach already used for the faceplate cutout and mounting holes.

**Rationale**: The faceplate already punches circular `THREE.Path` holes into a `THREE.Shape` before extruding. The shelf walls can follow the exact same pattern: define the wall's large face as a `THREE.Shape` with hex `THREE.Path` holes, extrude by the wall thickness, then rotate/translate into position. Zero new dependencies, zero new abstractions.

**Alternatives considered**:
- CSG library (`three-bvh-csg`): Would work but adds a dependency and changes the geometry pipeline for a problem the existing Shape+holes approach already solves.
- Instanced mesh with stencil masking: Purely visual, doesn't produce real through-geometry in exports. Violates FR-008.

---

## Decision 2: Hexagon orientation and tiling grid

**Decision**: Flat-top orientation, standard honeycomb offset grid (alternating columns offset by half a hex height).

**Rationale**: Flat-top hexagons produce a tiling where the horizontal step is predictable and the vertical alignment is symmetric — easier to center on a rectangular wall surface. The alternating-column offset is the canonical honeycomb grid.

**Tiling math (all in mm)**:
- User parameter: `hexHoleDiameter` (flat-to-flat) = `d`
- User parameter: `hexHoleGap` (edge-to-edge between adjacent holes) = `g`
- Circumradius: `R = d / √3`
- Side length: `s = R = d / √3`
- Tip-to-tip (point-to-point) width = `2R`
- Center-to-center horizontal step: `3R + g` (gap measured at the closest edge-to-edge point between adjacent hex columns, which is the flat-to-flat edge distance = `g`, so center step = `3R + g√(? )` — see note)

**Note on gap geometry**: For flat-top hexagons, the minimum distance between adjacent cells in the same row is the tip-to-tip distance between the angled edges. The "gap" between flat faces of adjacent-column hexagons is measured flat-to-flat: center-to-center horizontal = `3s + gap_flat_equiv`. For simplicity, the gap parameter is treated as the minimum wall material thickness measured edge-to-edge at the closest point between any two adjacent holes. The implementation derives center-to-center spacing from this constraint.

**Alternatives considered**:
- Pointy-top orientation: Equivalent in density; flat-top is conventional for horizontal mesh patterns on vertical faces.

---

## Decision 3: Wall reconstruction approach

**Decision**: Rebuild the three shelf wall panels using `ExtrudeGeometry` instead of `BoxGeometry` when hex mesh is enabled. Walls are defined as 2D shapes in the appropriate plane, extruded by thickness, then rotated into position.

**Rationale**: `BoxGeometry` cannot have holes. Switching to `ExtrudeGeometry` for the wall panels when holes are needed matches the faceplate precedent and keeps the geometry pipeline uniform.

**Coordinate approach**:
- **Left wall** (`t × (ch+t) × depth`): Shape defined in local XY plane as `depth × (ch+t)` rectangle with hex holes. Extrude by `t`, rotate -90° around Y, translate to position.
- **Right wall**: Same shape, mirrored X translation.
- **Bottom panel** (`cw × t × depth`): Shape defined in local XY plane as `cw × depth` rectangle with hex holes. Extrude by `t`, rotate -90° around X, translate to position.

---

## Decision 4: Boundary handling for partial holes

**Decision**: Omit any hex hole whose bounding box extends beyond the wall boundary. No partial holes.

**Rationale**: Partial hexagon paths in `THREE.Shape.holes` that cross the shape boundary produce degenerate geometry artifacts. Omitting boundary-crossing holes is the safest approach and aligns with FR-006/FR-007.

---

## Decision 5: Parameter storage and defaults

**Decision**: Two new fields on `BracketParams`: `hexHoleDiameter` (mm, default 3.175 = 0.125") and `hexHoleGap` (mm, default 3.175 = 0.125"). Stored in mm per Principle VI.

**Rationale**: Follows the existing schema pattern. The defaults match the user's spec exactly.
