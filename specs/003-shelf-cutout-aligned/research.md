# Research: Shelf-Cutout Alignment

**Branch**: `003-shelf-cutout-aligned` | **Date**: 2026-04-18

## Decision 1: Shelf Geometry Coordinate Derivation

**Decision**: Derive all shelf part positions from `cutoutWidth` and `cutoutHeight` (replacing `rackWidth` and `faceplateHeight`). The faceplate is centered at X=0, Y=0, so the cutout spans X ∈ [-cutoutWidth/2, +cutoutWidth/2] and Y ∈ [-cutoutHeight/2, +cutoutHeight/2].

**Clarification (2026-04-18)**: Inner wall faces are flush with the cutout edges; walls extend outward beyond the cutout boundary. The cutout channel passes through the full shelf depth.

**New shelf part geometry** (all parts at Z center = `faceplateDepth + shelfDepth/2`):

| Part | Width (X) | Height (Y) | X center | Y center |
|------|-----------|------------|----------|----------|
| Bottom panel | `cutoutWidth` | `shelfWallThickness` | 0 | `-(cutoutHeight/2 + shelfWallThickness/2)` |
| Left wall | `shelfWallThickness` | `cutoutHeight` | `-(cutoutWidth/2 + shelfWallThickness/2)` | 0 |
| Right wall | `shelfWallThickness` | `cutoutHeight` | `+(cutoutWidth/2 + shelfWallThickness/2)` | 0 |

**Why these positions**:
- Left wall inner face at X = -(cutoutWidth/2 + shelfWallThickness/2) + shelfWallThickness/2 = -cutoutWidth/2 ✓ flush with cutout left edge
- Right wall inner face at +cutoutWidth/2 ✓ flush with cutout right edge
- Bottom panel top face at -(cutoutHeight/2 + shelfWallThickness/2) + shelfWallThickness/2 = -cutoutHeight/2 ✓ flush with cutout bottom edge
- Side walls centered vertically on Y=0 span from -cutoutHeight/2 to +cutoutHeight/2, matching the cutout opening exactly

**Rationale**: The shelf walls sit outside the cutout boundary (inner faces at cutout edges, walls extending outward). The clear interior of the shelf is `cutoutWidth` wide by `cutoutHeight` tall — exactly the channel visible through the cutout opening. Total exterior shelf width = cutoutWidth + 2×shelfWallThickness.

**Alternatives considered**:
- Walls inside the cutout (outer faces at cutout edges): Rejected — inner clear width would be cutoutWidth - 2×wallThickness, not matching the cutout opening.

---

## Decision 2: Zero-Dimension Guard

**Decision**: `buildShelf` returns `null` when `cutoutWidth <= 0` OR `cutoutHeight <= 0` (in addition to the existing `shelfDepth <= 0` guard).

**Rationale**: A cutout of zero width or height means there is no opening for the shelf to back. Rendering a shelf behind a zero-width cutout would produce invisible or degenerate geometry. This aligns with FR-004 and FR-005.

**Implementation**: Add a single early-return check before all geometry construction:
```
if (p.shelfDepth <= 0 || p.cutoutWidth <= 0 || p.cutoutHeight <= 0) return null;
```

---

## No External Research Required

All geometry math is straightforward coordinate arithmetic on existing params. No new dependencies, libraries, or external patterns needed.
