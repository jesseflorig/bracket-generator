# Data Model: Shelf-Cutout Alignment

**Branch**: `003-shelf-cutout-aligned` | **Date**: 2026-04-18

## Schema Changes

**None.** `BracketParams` is unchanged. `cutoutWidth` and `cutoutHeight` already exist as stored fields. No new fields, no removed fields, no validation rule changes.

---

## Geometry Change: `buildShelf` in `src/geometry/bracket.ts`

### Current behavior (to be replaced)

```
shelf exterior width = rackWidth
bottom Y center      = -(faceplateHeight/2 - shelfWallThickness/2)
wall height          = faceplateHeight
wall X centers       = ±(rackWidth/2 - shelfWallThickness/2)
guard                = shelfDepth <= 0
```

### New behavior

```
shelf exterior width = cutoutWidth + 2 × shelfWallThickness
bottom Y center      = -(cutoutHeight/2 + shelfWallThickness/2)
wall height          = cutoutHeight
wall X centers       = ±(cutoutWidth/2 + shelfWallThickness/2)
guard                = shelfDepth <= 0 || cutoutWidth <= 0 || cutoutHeight <= 0
```

**Clarification (2026-04-18)**: Inner wall faces are flush with the cutout edges; walls extend outward beyond the cutout boundary. The cutout channel runs through the full shelf depth.

### Part-by-part spec

| Part | Geometry | X center | Y center | Z center |
|------|----------|----------|----------|----------|
| Bottom panel | `BoxGeometry(cutoutWidth, shelfWallThickness, shelfDepth)` | 0 | `-(cutoutHeight/2 + shelfWallThickness/2)` | `faceplateDepth + shelfDepth/2` |
| Left wall | `BoxGeometry(shelfWallThickness, cutoutHeight, shelfDepth)` | `-(cutoutWidth/2 + shelfWallThickness/2)` | 0 | `faceplateDepth + shelfDepth/2` |
| Right wall | `BoxGeometry(shelfWallThickness, cutoutHeight, shelfDepth)` | `+(cutoutWidth/2 + shelfWallThickness/2)` | 0 | `faceplateDepth + shelfDepth/2` |

### Flush verification (at default params)

Defaults: `cutoutWidth=127`, `cutoutHeight=19.05`, `shelfWallThickness=3.175`

- Left wall inner face X: -(127/2 + 3.175/2) + 3.175/2 = -63.5 = -(cutoutWidth/2) ✓
- Right wall inner face X: +(127/2 + 3.175/2) - 3.175/2 = +63.5 = +(cutoutWidth/2) ✓
- Bottom panel top face Y: -(19.05/2 + 3.175/2) + 3.175/2 = -9.525 = -(cutoutHeight/2) ✓

---

## Test Coverage Required (`bracket.test.ts`)

| Test | What to verify |
|------|---------------|
| Shelf not rendered when `cutoutWidth = 0` | `buildBracket` with `cutoutWidth=0` has Z depth = `faceplateDepth` only |
| Shelf not rendered when `cutoutHeight = 0` | `buildBracket` with `cutoutHeight=0` has Z depth = `faceplateDepth` only |
| Shelf renders when cutout dimensions > 0 and shelfDepth > 0 | Geometry depth = `faceplateDepth + shelfDepth` |
| Shelf bounding box X matches cutoutWidth | Shelf X span equals cutoutWidth (within tolerance) |
