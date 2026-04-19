# Data Model: Bracket Data Model Redesign

**Branch**: `002-bracket-data-model` | **Date**: 2026-04-18

## Schema: `BracketParams` (replaces current schema entirely)

File: `src/models/bracketParams.ts`

### Stored Fields (user-configurable, persisted in Zustand)

All values stored in **millimeters**.

| Field | Type | Default (mm) | Default (in) | Min (mm) | Max (mm) | Description |
|-------|------|-------------|-------------|---------|---------|-------------|
| `rackWidth` | `number` | 165.1 | 6.5" | 50.8 (2") | 609.6 (24") | Inner opening width of the rack enclosure |
| `railWidth` | `number` | 25.4 | 1.0" | 6.35 (0.25") | 50.8 (2") | Width of each mounting rail/flange on the faceplate |
| `faceplateHeight` | `number` | 31.75 | 1.25" | 25.4 (1.0") | 127.0 (5.0") | Height of the faceplate panel |
| `faceplateDepth` | `number` | 3.175 | 0.125" | 1.5875 (0.0625") | 6.35 (0.25") | Thickness of the faceplate |
| `cornerRadius` | `number` | 1.0 | — | 0.0 | derived* | Faceplate corner rounding radius (mm) |
| `shelfWallThickness` | `number` | 3.175 | 0.125" | 1.0 | 6.35 (0.25") | Thickness of the shelf's left and right walls, and bottom panel |
| `cutoutWidth` | `number` | 127.0 | 5.0" | 0.0 | derived* | Width of the cutout opening in the faceplate |
| `cutoutHeight` | `number` | 19.05 | 0.75" | 0.0 | derived* | Height of the cutout opening in the faceplate |
| `shelfDepth` | `number` | 50.8 | 2.0" | 0.0 | 304.8 (12") | Depth of the shelf structure behind the faceplate |
| `holeDiameter` | `number` | 6.604 | 0.26" | 2.0 | derived* | Diameter of each mounting hole |
| `holeInset` | `number` | 12.7 | 0.5" | derived* | derived* | Horizontal distance from each side edge to the nearest hole center |
| `holeEdgeOffset` | `number` | 12.7 | 0.5" | derived* | — | Vertical distance from top/bottom edges to the outermost hole centers |

*derived constraints — see Cross-Field Validation below.

### Derived Values (pure functions, never stored)

Exported from `src/geometry/bracket.ts` (or `src/models/bracketParams.ts` if needed by validation).

```typescript
export function faceplateWidth(p: BracketParams): number {
  return p.rackWidth + 2 * p.railWidth;
}

export function shelfMaxWidth(p: BracketParams): number {
  return p.rackWidth - 2 * p.shelfWallThickness;
}

export function holeCount(p: BracketParams): number {
  return Math.floor(p.faceplateHeight / 25.4); // floor of height in inches
}

export function holePositions(p: BracketParams): Array<{ x: number; y: number }> {
  const count = holeCount(p);
  if (count === 0) return [];
  if (count === 1) {
    return [{ x: 0, y: 0 }]; // centered (faceplate centered on Y=0)
  }
  const top = p.faceplateHeight / 2 - p.holeEdgeOffset;
  const bottom = -(p.faceplateHeight / 2 - p.holeEdgeOffset);
  const positions: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : bottom + (i / (count - 1)) * (top - bottom);
    positions.push({ x: 0, y });
  }
  return positions;
}
```

Note: Hole X positions (left/right inset) are computed separately in `buildBracket` since holes appear on both sides of the faceplate. The `holePositions` function returns Y positions only; the builder mirrors them at `x = -(fw/2 - holeInset)` and `x = +(fw/2 - holeInset)`.

### Cross-Field Validation (Zod `superRefine`)

Applied in mm, after any UI-boundary conversion:

| Rule | Error path | Message |
|------|-----------|---------|
| `cornerRadius ≤ min(faceplateHeight, faceplateWidth(p)) / 2` | `cornerRadius` | "Corner radius too large for faceplate dimensions" |
| `cutoutWidth ≤ faceplateWidth(p) - 2 * shelfWallThickness` | `cutoutWidth` | "Cutout too wide for faceplate" |
| `cutoutHeight ≤ faceplateHeight - 2 * shelfWallThickness` | `cutoutHeight` | "Cutout too tall for faceplate" |
| `holeInset ≥ holeDiameter / 2` | `holeInset` | "Inset must be greater than hole radius" |
| `holeEdgeOffset ≥ holeDiameter / 2` | `holeEdgeOffset` | "Edge offset must be greater than hole radius" |
| `shelfWallThickness * 2 < rackWidth` | `shelfWallThickness` | "Wall thickness too large for rack width" |
| Hole circles do not overlap cutout: `holeInset - holeDiameter/2 > (cutoutWidth/2)` when cutout is centered (only applies if cutout is narrower than the distance from edge to hole) | `holeDiameter` | "Mounting holes overlap the cutout opening" |

### Removed Fields (legacy — must not appear anywhere in codebase after this feature)

| Removed field | Was used for |
|--------------|-------------|
| `width` | Generic bracket width |
| `height` | Generic bracket height |
| `depth` | Generic bracket depth |
| `thickness` | Generic wall thickness |
| `holeCount` | Manual hole count input |
| `holeSpacing` | Manual hole spacing input |
| `bracketType` | L vs U bracket type selector |

### Default Parameters

```typescript
export const DEFAULT_PARAMS: BracketParams = {
  rackWidth: 165.1,         // 6.5"
  railWidth: 25.4,          // 1.0"
  faceplateHeight: 31.75,   // 1.25"
  faceplateDepth: 3.175,    // 0.125"
  cornerRadius: 1.0,        // 1mm
  shelfWallThickness: 3.175,// 0.125"
  cutoutWidth: 127.0,       // 5.0"
  cutoutHeight: 19.05,      // 0.75"
  shelfDepth: 50.8,         // 2.0"
  holeDiameter: 6.604,      // 0.26"
  holeInset: 12.7,          // 0.5"
  holeEdgeOffset: 12.7,     // 0.5"
};
```

### ExportPayload (unchanged interface, updated type reference)

```typescript
export interface ExportPayload {
  geometry: import('three').BufferGeometry;
  params: BracketParams;
  filename: string;
}
```

---

## Geometry Model: `buildBracket`

File: `src/geometry/bracket.ts`

### Faceplate

- Shape: rounded rectangle (faceplateWidth × faceplateHeight) with `cornerRadius`
- Holes in shape: centered rectangular cutout (cutoutWidth × cutoutHeight) + circular mounting holes (one per side at each computed Y position)
- Extrude depth: `faceplateDepth`
- Origin: shape centered on X=0, Y=0; extrudes along +Z from Z=0 to Z=faceplateDepth

### Shelf

Three BoxGeometry pieces, merged:

| Part | Width | Height | Depth | Position |
|------|-------|--------|-------|----------|
| Bottom panel | `rackWidth` | `shelfWallThickness` | `shelfDepth` | Y = −faceplateHeight/2 + shelfWallThickness/2 |
| Left wall | `shelfWallThickness` | `faceplateHeight` | `shelfDepth` | X = −(rackWidth/2 − shelfWallThickness/2) |
| Right wall | `shelfWallThickness` | `faceplateHeight` | `shelfDepth` | X = +(rackWidth/2 − shelfWallThickness/2) |

All shelf parts: Z centered at `faceplateDepth + shelfDepth/2`

### HolePosition interface (updated)

```typescript
export interface HolePosition {
  x: number; // mm, world space
  y: number; // mm, world space
  z: number; // mm, world space (for viewer cylinder placement)
}
```

---

## State: `bracketStore.ts`

Interface unchanged (generic `setParam<K>` works with new param keys). Only `DEFAULT_PARAMS` import needs to point to the updated schema.

---

## Test Coverage Required (`bracket.test.ts`)

| Test | What to verify |
|------|---------------|
| `faceplateWidth` | 165.1 + 2×25.4 = 216.9mm |
| `shelfMaxWidth` | 165.1 − 2×3.175 = 158.75mm |
| `holeCount` at 31.75mm (1.25") | = 1 |
| `holeCount` at 50.8mm (2.0") | = 2 |
| `holeCount` at 25.4mm (1.0") | = 1 |
| `holePositions` count=1 | single hole at y=0 |
| `holePositions` count=2 | top at +holeEdgeOffset from center, bottom at -holeEdgeOffset from center |
| `buildBracket` bounding box | width = faceplateWidth, height = faceplateHeight, depth = faceplateDepth + shelfDepth |
| Geometry has vertex data | position attribute count > 0 |
| Schema rejects faceplateHeight < 25.4 | Zod parse failure |
| Schema rejects cornerRadius too large | Zod parse failure |
| Schema rejects cutout exceeding faceplate | Zod parse failure |
