# Feature Specification: Shelf-Cutout Alignment

**Feature Branch**: `003-shelf-cutout-aligned`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "Update the shelf rendering so the shelf is flush with the faceplate cutout and the shelf width equals the faceplate cutout so the shelf walls are flush with the cutout"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shelf Walls Align with Cutout Edges (Priority: P1)

A designer configures a bracket with a cutout opening. When they view the 3D preview, the shelf's left and right side walls are positioned exactly at the left and right edges of the cutout — not at the edges of the rack opening. The shelf appears to extend directly behind the cutout, as if the opening leads into the shelf cavity.

**Why this priority**: This is the core geometric change. The entire feature is about this alignment — shelf width equals cutout width and walls are flush with the cutout edges. Everything else follows from it.

**Independent Test**: Can be fully tested by configuring a cutout narrower than the rack width and verifying in the 3D preview that the shelf side walls sit exactly at the cutout edges, not at the rack-width boundaries.

**Acceptance Scenarios**:

1. **Given** a bracket with a cutout narrower than the rack width, **When** the user views the 3D preview, **Then** the shelf side walls are positioned flush with the left and right edges of the cutout opening.
2. **Given** a bracket with a cutout that is the same width as the rack width, **When** the user views the preview, **Then** the shelf appears identical to the previous behavior (shelf walls at rack edges).
3. **Given** a bracket where the cutout width is adjusted, **When** the cutout width changes, **Then** the shelf side walls move to remain flush with the new cutout edges immediately.

---

### User Story 2 - Shelf Bottom Aligns with Cutout Bottom (Priority: P1)

A designer views the bracket in 3D and sees that the bottom of the shelf structure is flush with the bottom edge of the cutout opening — not with the bottom edge of the faceplate. The shelf cavity begins exactly at the cutout boundary.

**Why this priority**: Vertical alignment is equally important to horizontal alignment for the shelf-cutout flush relationship. Together with US1, they define the complete geometric intent.

**Independent Test**: Can be fully tested by configuring a cutout shorter than the faceplate height and verifying the shelf bottom sits at the cutout's lower edge, not the faceplate's lower edge.

**Acceptance Scenarios**:

1. **Given** a cutout shorter than the faceplate height, **When** the user views the 3D preview, **Then** the bottom of the shelf is flush with the bottom edge of the cutout opening.
2. **Given** the cutout height changes, **When** the cutout height is adjusted, **Then** the shelf bottom moves to remain flush with the new cutout bottom edge.
3. **Given** a cutout whose bottom edge aligns with the faceplate bottom, **When** the user views the preview, **Then** the shelf bottom is at the same position as the faceplate bottom (no visible gap).

---

### Edge Cases

- What happens when cutout width is 0 (no cutout) — should the shelf still render?
- What happens when cutout height is 0 — does the shelf have zero height?
- What happens when the cutout is the full width of the faceplate — no faceplate material remains on the sides, but shelf should still render correctly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The shelf width MUST equal the cutout width. The previous behavior (shelf width = rack width) is replaced entirely.
- **FR-002**: The shelf side walls MUST be positioned so their inner faces are flush with the left and right edges of the cutout opening. The walls extend outward beyond the cutout boundary; the cutout channel runs through the full shelf depth.
- **FR-003**: The shelf bottom MUST be positioned so its top face is flush with the bottom edge of the cutout opening.
- **FR-004**: When cutout width is 0, the shelf MUST NOT render (no cutout means no opening for the shelf to back).
- **FR-005**: When cutout height is 0, the shelf MUST NOT render (no vertical opening means no shelf cavity).
- **FR-006**: All shelf depth behavior (the distance the shelf extends behind the faceplate) MUST remain unchanged by this feature.
- **FR-007**: The 3D preview MUST update immediately when cutout width or cutout height is changed, keeping the shelf flush with the new cutout position at all times.

### Key Entities

- **Shelf**: The structural body behind the faceplate. Width now derived from cutout width (not rack width). Vertical position now derived from cutout bottom edge (not faceplate bottom edge).
- **Cutout**: The rectangular opening in the faceplate. Now the primary driver of shelf width and shelf vertical position.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With any cutout narrower than the rack width, the shelf side walls are visually flush with the cutout edges in the 3D preview — verified by visual inspection.
- **SC-002**: Changing cutout width updates the shelf position in under 500ms.
- **SC-003**: Exported STL and 3MF files reflect the cutout-aligned shelf geometry — the shelf opening visible in the export matches what was shown in the preview.
- **SC-004**: When cutout width or height is 0, no shelf geometry appears in the preview or export.

## Clarifications

### Session 2026-04-18

- Q: Are the shelf side wall inner or outer faces flush with the cutout edges? → A: Inner faces flush; walls extend outside the cutout boundary. The cutout channel passes through the full shelf depth.

## Assumptions

- The shelf wall thickness remains as configured — only the shelf's horizontal position and width change.
- The shelf is centered horizontally on the cutout (the cutout is already centered on the faceplate, so the shelf is also centered on the faceplate).
- The shelf height (top-to-bottom span) equals the cutout height — the shelf cavity matches the opening exactly.
- When both cutout width and cutout height are greater than 0, the shelf always renders regardless of shelf depth (shelf depth of 0 still means no shelf, unchanged behavior).
- The faceplate wall thickness is not used to offset the shelf — the shelf aligns to the cutout opening edge, not to the faceplate exterior.
