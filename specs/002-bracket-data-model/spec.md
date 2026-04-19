# Feature Specification: Bracket Data Model Redesign

**Feature Branch**: `002-bracket-data-model`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "Replace the bracket data model with the following: faceplate dimensions (default 1.25"H x 8.5" x 0.125"D) with corner radius of 1mm. shelf dimensions support cutout dimensions (height x width) and shelf depth for bottom and sides (depth)"

## Clarifications

### Session 2026-04-18

- Q: What are the rack dimensions that limit max shelf width? → A: Rack has a max shelf width of 6.5" (default).
- Q: What are the faceplate mounting hole defaults? → A: 0.26" diameter circles, centered vertically on the faceplate, positioned 0.5" inset from each left and right edge. Count and position are adjustable.
- Q: What is the relationship between faceplate width, rack width, and shelf width? → A: Faceplate width = rack width + (rail width × 2), default rail width 1". Shelf max width = rack width − (shelf wall thickness × 2), default shelf wall thickness 0.125". Both faceplate width and shelf max width are derived values.
- Q: How is faceplate width surfaced in the UI — editable or computed? → A: Displayed as a read-only computed field alongside rack width and rail width inputs. Users never type into it directly.
- Q: How is mounting hole count determined, and how are holes positioned vertically? → A: Count per side = floor(faceplate height in inches) — e.g., 1"–1.99" = 1 hole, 2"–2.99" = 2 holes. Top and bottom holes are 0.5" offset from their respective edges. Intermediate holes (when count > 2) are distributed evenly between them. Count and positions are derived, not independently stored.
- Q: When hole count = 1, where is the single hole positioned vertically? → A: Centered between the top and bottom edge offsets — equivalent to faceplate height / 2.
- Q: Is a faceplate height under 1" (zero holes) a valid state? → A: Invalid — minimum faceplate height is 1". Heights below 1" are rejected at input time.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Rack and Rail Dimensions (Priority: P1)

A designer sets the rack width (the inner opening of the rack enclosure) and the rail width (the mounting flange on each side of the faceplate). The app derives the faceplate width and shelf max width from these inputs and updates the 3D preview. Defaults are 6.5" rack width and 1" rail width, yielding an 8.5" faceplate width.

**Why this priority**: Rack width is the root constraint from which faceplate width and shelf max width are derived. It must be correct before any other dimension is meaningful.

**Independent Test**: Can be fully tested by changing rack width or rail width and verifying the derived faceplate width and shelf max width update correctly in the preview.

**Acceptance Scenarios**:

1. **Given** the app loads fresh, **When** the user views the rack controls, **Then** rack width shows 6.5" and rail width shows 1".
2. **Given** rack width 6.5" and rail width 1", **When** the app computes faceplate width, **Then** faceplate width displays as 8.5" (read-only derived value).
3. **Given** rack width 6.5" and shelf wall thickness 0.125", **When** the app computes shelf max width, **Then** shelf max width displays as 6.25" (read-only derived value).
4. **Given** a configured rack width, **When** the user changes it, **Then** faceplate width and shelf max width update immediately.

---

### User Story 2 - Configure Faceplate Dimensions (Priority: P1)

A designer views the faceplate with derived width (from rack + rails), and adjusts height, depth (thickness), and corner radius. The 3D preview updates to reflect the new shape.

**Why this priority**: The faceplate is the primary visible face of the bracket. Height, depth, and corner radius must be independently configurable.

**Independent Test**: Can be fully tested by adjusting faceplate height, depth, and corner radius and verifying the 3D shape is correct.

**Acceptance Scenarios**:

1. **Given** the app loads fresh, **When** the user views the faceplate controls, **Then** height shows 1.25", depth shows 0.125", and corner radius shows 1mm. Faceplate width (8.5") is displayed as a read-only derived value.
2. **Given** a faceplate, **When** the user changes height, depth, or corner radius, **Then** the 3D preview updates immediately.
3. **Given** a faceplate, **When** corner radius is set to 1mm, **Then** the rendered corners are visibly rounded.

---

### User Story 3 - Configure Faceplate Mounting Holes (Priority: P1)

A designer views mounting holes that are automatically computed from the faceplate height — one hole per whole inch of height, per side. For the default 1.25" faceplate, one hole appears per side. Holes are positioned 0.5" from the top and bottom edges (with intermediates evenly distributed when count > 2) and 0.5" inset from each horizontal edge. The designer can adjust hole diameter and inset distance; hole count and vertical positions update automatically as faceplate height changes.

**Why this priority**: Mounting holes are critical for physical installation — they must be present and correctly positioned for the bracket to function.

**Independent Test**: Can be fully tested by verifying hole count and positions compute correctly from faceplate height, and that adjusting diameter or inset updates the preview.

**Acceptance Scenarios**:

1. **Given** a faceplate height of 1.25", **When** the app computes hole count, **Then** one hole per side appears with defaults: 0.26" diameter, 0.5" inset from each horizontal edge.
2. **Given** a faceplate height of 2.5", **When** the app computes hole count, **Then** two holes per side appear — top hole 0.5" from top edge, bottom hole 0.5" from bottom edge.
3. **Given** a faceplate height of 3.0", **When** the app computes hole count, **Then** three holes per side appear — top at 0.5" from top, bottom at 0.5" from bottom, middle evenly distributed between them.
4. **Given** a configured faceplate, **When** the user adjusts hole diameter, **Then** all holes resize in the 3D preview.
5. **Given** a configured faceplate, **When** the user adjusts the horizontal inset, **Then** all holes on each side shift to the new horizontal position.

---

### User Story 4 - Configure Shelf Cutout Dimensions (Priority: P2)

A designer specifies the opening in the faceplate (the cutout) by entering its height and width. The cutout represents the usable opening and must fit within the faceplate. The preview updates to show the opening centered in the faceplate.

**Why this priority**: The cutout defines what passes through the bracket. It is the functional core of the bracket's purpose.

**Independent Test**: Can be fully tested by setting cutout height and width and verifying the opening appears correctly centered in the faceplate.

**Acceptance Scenarios**:

1. **Given** a configured faceplate, **When** the user sets a cutout height and width, **Then** the 3D preview shows the opening centered in the faceplate.
2. **Given** a cutout, **When** the cutout dimensions exceed the faceplate dimensions, **Then** the app indicates the values are invalid.

---

### User Story 5 - Configure Shelf Depth (Priority: P3)

A designer sets the shelf depth, which controls how far the bottom and side surfaces extend behind the faceplate. The shelf walls are 0.125" thick by default. The shelf max width (rack width minus wall thickness × 2) is a derived read-only value.

**Why this priority**: Shelf depth controls the structural footprint of the bracket but does not affect the visible face.

**Independent Test**: Can be fully tested by adjusting shelf depth and confirming the bottom and side surfaces in the 3D preview extend by the correct amount.

**Acceptance Scenarios**:

1. **Given** rack width 6.5" and shelf wall thickness 0.125", **When** the app derives shelf max width, **Then** it shows 6.25" (read-only).
2. **Given** a configured faceplate and cutout, **When** the user sets a shelf depth, **Then** the bottom and side surfaces extend that distance behind the faceplate plane.
3. **Given** a shelf depth of zero, **When** the user views the preview, **Then** the bracket appears as a flat faceplate with no extending shelf surfaces.

---

### Edge Cases

- What happens when cutout height or width equals or exceeds the faceplate dimension on the same axis?
- What happens when corner radius is so large it exceeds half the shorter faceplate dimension?
- What happens when shelf depth is zero or a negative value?
- How does the model behave when faceplate depth (thickness) is thinner than what is geometrically required to display rounded corners?
- What happens when a mounting hole's inset position plus radius overlaps the cutout opening or faceplate edge?
- What happens when rack width is set so small that derived shelf max width becomes zero or negative?
- Faceplate height below 1" is invalid — rejected at input time (minimum enforced at 1").
- When hole count = 1 and faceplate height > 1", where exactly does the single hole sit — at 0.5" from the top edge, or centered between the top and bottom offsets?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The data model MUST include a rack entity with a configurable width field (default 6.5").
- **FR-002**: The data model MUST include a rail width parameter (default 1" per side).
- **FR-003**: Faceplate width MUST be derived as: rack width + (rail width × 2). It is a read-only computed value, not independently stored.
- **FR-004**: The data model MUST include a faceplate entity with height (default 1.25", minimum 1"), depth/thickness (default 0.125"), and corner radius (default 1mm) as configurable fields. Faceplate height below 1" MUST be rejected at input time.
- **FR-005**: The data model MUST include a shelf entity with configurable wall thickness (default 0.125"), cutout height, cutout width, and shelf depth fields.
- **FR-006**: Shelf max width MUST be derived as: rack width − (shelf wall thickness × 2). It is a read-only computed value.
- **FR-007**: Shelf depth MUST apply uniformly to both the bottom surface and the side surfaces of the bracket.
- **FR-008**: The app MUST prevent export or preview when cutout dimensions exceed the faceplate dimensions on the same axis.
- **FR-009**: Corner radius MUST be validated so it does not exceed half the shorter faceplate dimension (height or derived width).
- **FR-010**: All dimension inputs MUST accept values in inches; the underlying model stores values in millimeters.
- **FR-011**: Mounting hole count per side MUST be derived as the floor of faceplate height in inches (e.g., 1.0"–1.99" = 1 hole, 2.0"–2.99" = 2 holes). Count is not independently configurable.
- **FR-012**: When hole count ≥ 2: the topmost hole MUST be positioned 0.5" from the top edge and the bottommost hole 0.5" from the bottom edge; intermediates (count > 2) MUST be distributed evenly between them. When hole count = 1: the single hole MUST be positioned at the vertical midpoint of the faceplate (faceplate height / 2).
- **FR-013**: Mounting hole diameter MUST default to 0.26" and be user-adjustable. Horizontal inset from each edge MUST default to 0.5" and be user-adjustable.
- **FR-014**: The app MUST validate that mounting holes do not overlap the faceplate cutout opening or extend beyond the faceplate boundary.
- **FR-015**: The previous bracket data model MUST be fully replaced — no legacy fields should remain.

### Key Entities

- **Rack**: The physical enclosure the bracket mounts into. Attributes: width (inner opening, default 6.5"). Drives all derived width values.
- **Rail**: The mounting flange on each side of the faceplate. Attributes: width per side (default 1"). Rail width is a bracket design property, not a rack property.
- **Faceplate**: The front panel of the bracket. Attributes: height (default 1.25"), depth/thickness (default 0.125"), corner radius (default 1mm). Width is derived: rack width + (rail width × 2).
- **Shelf**: The structural body behind the faceplate. Attributes: wall thickness (default 0.125"), cutout height, cutout width, shelf depth. Shelf max width is derived: rack width − (wall thickness × 2).
- **Mounting Hole**: A circular perforation in the faceplate for physical attachment. Count per side is derived: floor(faceplate height in inches). Configurable attributes: diameter (default 0.26"), horizontal inset from edge (default 0.5"), vertical edge offset (default 0.5" from top and bottom). Positions are fully computed — top hole at vertical edge offset from top, bottom hole at vertical edge offset from bottom, intermediates evenly distributed between them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All configurable fields (rack width, rail width, faceplate height/depth/corner radius, shelf wall thickness/depth, mounting hole diameter/inset) load with correct defaults on first launch — verifiable by inspection without any user input.
- **SC-002**: All derived values (faceplate width, shelf max width) compute correctly from their inputs and match expected values at defaults: faceplate width = 8.5", shelf max width = 6.25".
- **SC-003**: Changing any primary input updates the 3D preview in under 500ms.
- **SC-004**: Invalid states (faceplate height below 1", cutout exceeds faceplate, corner radius too large, mounting hole out of bounds, shelf exceeds rack max width) are surfaced to the user before any export is attempted — 100% of invalid states caught at input time.
- **SC-005**: No data fields from the previous bracket model remain in the codebase after replacement.

## Assumptions

- Faceplate width and shelf max width are always derived — users never set them directly.
- Rail width is a property of the bracket design (not the physical rack) and is the same on both sides.
- Shelf wall thickness is uniform across all shelf walls (bottom and sides share the same thickness).
- Mounting holes are symmetric: both holes share the same diameter and the same inset distance from their respective edges.
- Cutout position is centered within the faceplate; no offset configuration is required at this stage.
- Units displayed to the user are inches; the internal model stores millimeters, consistent with the existing unit conversion invariant.
- The app configures a single bracket at a time; this model redesign applies to that single bracket.
- The rack entity models a constraint envelope only — no rack height, depth, or unit count at this stage.
