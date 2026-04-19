# Data Model: Hexagonal Mesh Cutout on Shelf Walls

## New Parameters (additions to BracketParams)

| Field | Type | Unit | Default | Min | Max | Description |
|-------|------|------|---------|-----|-----|-------------|
| `hexHoleDiameter` | `number` | mm | 3.175 | 1.0 | 25.4 | Flat-to-flat diameter of each hexagonal hole |
| `hexHoleGap` | `number` | mm | 3.175 | 0.0 | 25.4 | Minimum wall material between adjacent hole edges |

## Validation Rules (additions to bracketParamsSchema)

- `hexHoleDiameter` must be > 0 and ≤ min(shelfWallThickness * 0.9, 25.4) to ensure at least some wall material remains and holes fit within the wall thickness. *(Note: holes go through the wall in the thin direction, so the hole must be smaller than the wall depth, not thickness. No cross-parameter constraint needed beyond min/max.)*
- `hexHoleGap` must be ≥ 0.

## Derived Values (geometry layer, no storage)

| Name | Formula | Description |
|------|---------|-------------|
| `hexCircumradius` | `hexHoleDiameter / √3` | Point-to-point radius of each hex |
| `hexColStep` | `3 * hexCircumradius + hexHoleGap` | Horizontal center-to-center distance between hex columns |
| `hexRowStep` | `hexHoleDiameter + hexHoleGap` | Vertical center-to-center distance between rows in same column |
| `hexRowOffset` | `hexColStep / 2` ... | Vertical offset applied to alternating columns |

*(Exact tiling math resolved in geometry implementation; captured here as named concepts.)*

## Schema Location

`src/models/bracketParams.ts` — `bracketParamsSchema` (Zod object) and `BracketParams` type.

## Store Impact

`DEFAULT_PARAMS` in `bracketParams.ts` gains two new fields. `bracketStore.ts` is unchanged (generic `setParam` covers all fields).

## Geometry Layer Impact

`src/geometry/bracket.ts`:
- `buildShelf` is extended (or split) to produce wall panels with hex holes when the parameters are non-zero and a wall is large enough to contain at least one hole.
- New helper: `buildHexWallPanel(width, height, thickness, p)` — returns an `ExtrudeGeometry`-based wall panel with hex holes, oriented in the caller's coordinate frame.
- New helper: `hexHolePaths(width, height, p)` — returns `THREE.Path[]` for all hex holes that fit within the given wall face, centered on it.

## No New Entities

No new data entities are introduced. The two new parameters are scalar fields on the existing `BracketParams` schema.
