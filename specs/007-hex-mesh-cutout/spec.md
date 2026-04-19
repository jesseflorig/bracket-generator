# Feature Specification: Hexagonal Mesh Cutout on Shelf Walls

**Feature Branch**: `007-hex-mesh-cutout`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "Add a hexagonal mesh cutout on the shelf walls (default 0.125" hexagonal holes spaced 0.125" apart)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Hex Mesh Pattern on Shelf Walls in 3D Viewer (Priority: P1)

A designer configuring a bracket opens the 3D viewer and sees the shelf walls rendered with a repeating hexagonal grid of through-holes — small hexagonal openings in a honeycomb pattern — rather than solid wall surfaces.

**Why this priority**: This is the foundational visual output of the feature. All other stories depend on the hex mesh geometry being correctly produced and visible.

**Independent Test**: Load the app with a bracket that has shelf walls. Confirm that the shelf walls show a repeating pattern of hexagonal voids where background or interior structure is visible through each opening.

**Acceptance Scenarios**:

1. **Given** a bracket with shelf walls, **When** the 3D viewer renders the bracket, **Then** each shelf wall displays a tiled hexagonal grid of through-holes across the available wall area.
2. **Given** the default settings (0.125" hole size, 0.125" spacing), **When** the viewer renders the shelf walls, **Then** the hex pattern uses those dimensions and the holes are clearly distinct from the solid wall material between them.
3. **Given** a shelf wall too small to fit even a single hex hole with the required margin, **When** rendered, **Then** no holes are shown on that wall and the surface remains solid without error.

---

### User Story 2 — Configure Hex Mesh Parameters (Priority: P2)

A designer wants to adjust the hex hole size and the spacing between holes to match a target visual density or structural requirement. They update the parameters in the UI and immediately see the 3D view update with the new pattern.

**Why this priority**: The default values cover the common case, but users need control over these parameters to match real-world requirements (material strength, aesthetics, airflow).

**Independent Test**: Change the hole size and spacing independently. Confirm the 3D view reflects each change without requiring a page reload.

**Acceptance Scenarios**:

1. **Given** the hex mesh parameters panel, **When** the user changes the hole size, **Then** the shelf wall re-renders with the new hole dimensions while the spacing remains unchanged.
2. **Given** the hex mesh parameters panel, **When** the user changes the spacing between holes, **Then** the pattern re-renders with the new gap between adjacent holes while hole size remains unchanged.
3. **Given** a spacing value of zero, **When** rendered, **Then** holes are tiled edge-to-edge (touching but not overlapping) and the wall renders without errors.

---

### User Story 3 — Exported 3D File Reflects Hex Mesh Geometry (Priority: P3)

A designer exports the bracket as an STL or 3MF file and opens it in a slicer or CAD tool. The shelf walls show the hexagonal hole pattern as actual through-material voids, ready for 3D printing or manufacturing without rework.

**Why this priority**: Visual accuracy in the viewer is prerequisite; export accuracy is required for manufacturing use. It follows the same dependency chain as the mounting holes feature.

**Independent Test**: Export a bracket with hex mesh walls. Open the exported file in any standard 3D viewer and confirm each hex hole is open geometry, not a filled solid.

**Acceptance Scenarios**:

1. **Given** shelf walls rendered with hex mesh cutouts, **When** the user exports to STL or 3MF, **Then** the exported geometry contains open voids at every hex hole position.
2. **Given** an exported file with hex mesh walls, **When** sliced for 3D printing, **Then** the slicer treats hex hole regions as empty space and generates no infill inside them.

---

### Edge Cases

- What happens when the hex hole size is larger than the wall height or width? No holes should be placed and the wall renders solid.
- What happens when very large hole size or very small spacing creates only a thin web of material between holes? The pattern renders as specified; structural validity is the user's responsibility.
- How does the hex mesh coexist with the existing rectangular shelf cutout? Both must render as through-material voids without visual conflicts or z-fighting artifacts.
- What happens when holes would extend into the inset zone or beyond the wall boundary? Any hole whose center or vertex falls within the inset margin is omitted entirely; no partial holes appear.
- What happens when the inset is larger than half the wall dimension? The available area shrinks to zero; the wall renders solid.

## Clarifications

### Session 2026-04-19

- Q: Should the hex mesh pattern be inset from the wall edges, and if so by how much? → A: Yes — inset 0.125" (3.175 mm) from all edges of each wall face (default, user-configurable).
- Q: Does the hex mesh apply to the bottom floor panel, or only the two vertical side walls? → A: Side walls by default; floor panel included via a separate toggle (default off).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The 3D viewer MUST render the two vertical side walls of the shelf with a tiled hexagonal grid of through-material holes when hex mesh is enabled.
- **FR-001a**: The floor (bottom) panel of the shelf MUST only receive hex holes when a separate floor toggle is explicitly enabled; it MUST render solid by default.
- **FR-002**: The hex mesh pattern MUST use flat-top hexagon orientation tiled in a standard honeycomb offset grid.
- **FR-003**: The user MUST be able to configure the inscribed diameter (flat-to-flat) of each hex hole, defaulting to 0.125 inches (≈ 3.175 mm).
- **FR-004**: The user MUST be able to configure the gap (wall material thickness) between adjacent hex holes, defaulting to 0.125 inches (≈ 3.175 mm).
- **FR-005**: Hex holes MUST be through-material voids visible from both sides of the shelf wall.
- **FR-006**: The hex mesh pattern MUST be inset from all four edges of each wall face by a configurable margin, defaulting to 0.125 inches (≈ 3.175 mm). No hole center or vertex may fall within the inset zone.
- **FR-007**: The hex mesh pattern MUST be centered on the available area within the inset boundary of each wall surface.
- **FR-008**: When the inset-reduced wall area is too small to fit any complete hex hole, the wall MUST render solid with no partial holes.
- **FR-009**: The hex mesh geometry MUST be consistent between the 3D viewer and all export formats (STL, 3MF).
- **FR-010**: The hex mesh MUST coexist correctly with the existing rectangular shelf cutout — both must render as independent, non-conflicting through-material voids.
- **FR-011**: All hex mesh dimensions in the store and geometry layer MUST be stored in millimeters; unit conversion occurs only at the UI boundary.

### Key Entities

- **Hex Mesh Config**: Hole diameter (flat-to-flat, mm), gap between holes (mm), inset from wall edges (mm), floor panel toggle (boolean, default false).
- **Shelf Wall Surface**: A planar face of the bracket shelf structure to which the hex pattern is applied.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A designer can visually confirm that shelf walls display a continuous hexagonal hole pattern by rotating the 3D view — background or interior is visible through every hole.
- **SC-002**: Changing hole size or spacing in the UI updates the 3D view within a normal interaction response time, with no page reload required.
- **SC-003**: Exported bracket files open in a standard 3D viewer and show hex holes as open geometry in 100% of test cases across supported export formats.
- **SC-004**: No visual artifacts (z-fighting, opaque fill inside holes, holes crossing wall boundaries) are present when viewing the hex mesh pattern from any angle.
- **SC-005**: The hex mesh pattern does not alter any other bracket dimension or interfere with existing shelf cutout or mounting hole geometry.

## Assumptions

- The hex mesh applies to the side walls of the shelf structure, not the top/bottom faces or the faceplate.
- Hole diameter refers to the flat-to-flat (inscribed circle) measurement of the hexagon, consistent with common manufacturing convention.
- The gap parameter refers to the minimum wall thickness between adjacent holes (edge-to-edge), not center-to-center spacing.
- Holes are tiled in a standard honeycomb offset grid (alternating rows offset by half a hex width); rotated or irregular tilings are out of scope.
- Hex mesh is applied to both vertical side walls uniformly; the floor panel is opt-in via a dedicated toggle, defaulting to off.
- Performance is acceptable for typical bracket configurations with standard default hole and gap sizes; very small hole sizes producing hundreds of holes may degrade render performance, which is acceptable for this iteration.
- The geometry layer will need to support boolean subtraction or an equivalent approach for producing through-holes if not already in place.
