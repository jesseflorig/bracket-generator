# Quickstart: Hex Mesh Cutout Implementation

## What changes

Three files get modified; no new files are needed.

### 1. `src/models/bracketParams.ts`

Add two fields to `bracketParamsSchema`:

```ts
hexHoleDiameter: z.number().min(1.0).max(25.4),  // flat-to-flat, mm
hexHoleGap: z.number().min(0).max(25.4),           // edge-to-edge gap, mm
```

Add to `DEFAULT_PARAMS`:

```ts
hexHoleDiameter: 3.175,  // 0.125"
hexHoleGap: 3.175,       // 0.125"
```

### 2. `src/geometry/bracket.ts`

Add two helpers and update `buildShelf`.

**`hexHolePaths(faceW, faceH, p)`** — returns `THREE.Path[]` for all hex holes that fit completely within a `faceW × faceH` face, centered:

- Compute circumradius `R = p.hexHoleDiameter / Math.sqrt(3)`
- Compute column step `colStep = 3 * R + p.hexHoleGap`
- Compute row step `rowStep = p.hexHoleDiameter + p.hexHoleGap`
- Tile a grid of hex centers; offset every other column by `rowStep / 2`
- For each candidate center, check that all 6 vertices are within the face bounds — omit if any vertex is outside
- For each included center, emit a `THREE.Path` with 6 `absarc`-free moveTo/lineTo calls (flat-top vertex positions at angles 0°, 60°, …, 300°)

**`buildHexWallPanel(faceW, faceH, thickness, p)`** — returns an oriented `THREE.BufferGeometry`:

- Create a `THREE.Shape` rectangle (`faceW × faceH`) centered on origin
- Punch `hexHolePaths(faceW, faceH, p)` as `shape.holes`
- `ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false })`
- Return the resulting geometry (caller handles rotation + translation)

**Update `buildShelf`**: Replace the three `BoxGeometry` calls with `buildHexWallPanel` calls when `p.hexHoleDiameter > 0 && p.hexHoleGap >= 0`. Each panel is rotated and translated to match its current BoxGeometry position. When `hexHoleDiameter === 0`, fall back to existing `BoxGeometry` path (or simply always use the new path — a hex diameter of 0 produces no holes and the shape collapses to a plain rectangle extrusion).

### 3. `src/components/DimensionPanel.tsx`

Add two `DimensionSlider` entries for `hexHoleDiameter` and `hexHoleGap` in the shelf section, with appropriate min/max/step values and unit-converted display.

## Test checklist

- [ ] Default parameters render shelf walls with visible hex pattern
- [ ] Setting `hexHoleGap: 0` tiles holes edge-to-edge without artifacts
- [ ] Setting `hexHoleDiameter: 0` (or below min) renders solid walls
- [ ] Walls too small for any hole render solid, no errors thrown
- [ ] STL export produces open hex voids (inspect in any 3D viewer)
- [ ] 3MF export same
- [ ] TypeScript strict: `pnpm typecheck` passes
- [ ] Unit tests: `pnpm test` passes (update bracket.test.ts with new param defaults)
