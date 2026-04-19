# Feature Specification: Mounting Holes Render as Cutouts

**Feature Branch**: `005-mounting-hole-cutouts`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "the mounting holes should render as cutouts"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Through-Hole Faceplate in 3D Viewer (Priority: P1)

A designer configuring a rack bracket opens the 3D viewer and sees the mounting holes as actual holes through the faceplate material — the background or shelf structure is visible through them — rather than as dark-painted discs sitting on the faceplate surface.

**Why this priority**: The core purpose of this feature. All other stories depend on this visual accuracy being established first.

**Independent Test**: Load the app with a bracket that has mounting holes configured. Rotate the 3D view and confirm that light or background is visible through each mounting hole opening.

**Acceptance Scenarios**:

1. **Given** a bracket with mounting holes configured, **When** the 3D viewer renders the faceplate, **Then** each mounting hole appears as a through-material opening where the hole edge is clearly visible and the hole interior shows the scene behind the faceplate.
2. **Given** a bracket with zero hole diameter or hole count of zero, **When** the 3D viewer renders the faceplate, **Then** no hole openings appear and the faceplate renders as a solid surface.
3. **Given** the mounting holes are positioned near the faceplate edges, **When** rendered, **Then** the holes remain fully circular and do not distort near boundaries.

---

### User Story 2 — Exported 3D File Reflects Cutout Geometry (Priority: P2)

A designer exports the bracket as an STL or 3MF file and opens it in a slicer or CAD tool. The mounting holes appear as actual voids through the faceplate, so the part is ready to print or machine without manual rework.

**Why this priority**: Export accuracy matters for manufacturing intent. If the visual is correct but the export still has plugged holes, the feature is incomplete for real-world use.

**Independent Test**: Export a bracket with two mounting holes. Open the file in any standard 3D viewer and confirm the holes are open geometry, not filled cylinders or capped openings.

**Acceptance Scenarios**:

1. **Given** a bracket with mounting holes rendered as cutouts, **When** the user exports to STL or 3MF, **Then** the exported geometry contains open voids at each mounting hole position.
2. **Given** an exported file, **When** sliced for 3D printing, **Then** the slicer treats the hole regions as empty space and does not generate infill inside them.

---

### Edge Cases

- What happens when hole diameter is large enough that holes nearly touch each other or the rectangular cutout? The holes must still render as open geometry; validation elsewhere handles the overlap constraint.
- How does the system handle a bracket with both mounting holes and the rectangular shelf cutout rendered simultaneously? Both must appear as through-material voids without visual artifacts at their boundaries.
- What happens when the bracket is viewed from behind? The holes must be visible from both front and back faces.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The 3D viewer MUST render each mounting hole as a through-material void in the faceplate, visually open from both the front and back faces.
- **FR-002**: The viewer MUST render mounting holes as open voids — no filled or opaque material should cover the hole opening on either faceplate face.
- **FR-003**: The mounting hole geometry MUST be consistent between the 3D viewer and all export formats (STL, 3MF).
- **FR-004**: When hole count is zero or hole diameter is zero, the faceplate MUST render without any hole openings.
- **FR-005**: The cutout rendering MUST coexist correctly with the existing rectangular shelf cutout — both must render as through-material voids without visual conflicts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A designer can visually confirm that each mounting hole is a through-hole by rotating the 3D view — background or internal structure is visible through every hole.
- **SC-002**: Exported bracket files open in a standard 3D viewer and show mounting holes as open geometry in 100% of test cases across supported export formats.
- **SC-003**: No visual artifacts (unintended dark regions, overlapping surfaces, or opaque fill inside hole openings) are present when viewing a bracket with mounting holes from any angle.
- **SC-004**: The rendering change does not alter the position, diameter, or count of mounting holes relative to the configured parameters.

## Assumptions

- The existing faceplate geometry already uses a shape-with-holes approach that creates through-holes at the geometry level; the fix primarily involves removing the dark cylinder overlay meshes added in the viewer layer.
- Export formats (STL, 3MF) derive from the same geometry objects produced by the geometry layer, so correcting the viewer does not require separate export changes.
- Performance is not a concern for typical bracket configurations (≤ 6 holes per side).
- The mounting hole shape is circular; non-circular hole shapes are out of scope.
