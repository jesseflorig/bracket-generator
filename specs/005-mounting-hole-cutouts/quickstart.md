# Quickstart: Mounting Holes Render as Cutouts

## What changed

`src/components/BracketViewer.tsx` — `BracketMesh` component

The dark cylinder meshes that were overlaid on each mounting hole position are removed. The faceplate geometry produced by the geometry layer already has through-holes; the cylinders were blocking them.

## Files to change

| File | Change |
|------|--------|
| `src/components/BracketViewer.tsx` | Remove cylinder overlay loop and associated locals |

## What to remove

In `BracketMesh`, delete:
- The `positions` useMemo (imports `holePositions` from geometry)
- The `holeR`, `leftX`, `rightX`, `holeCylinderZ` locals
- The JSX block that maps over positions and sides to render cylinder meshes

Remove the now-unused `holePositions` import from `'../geometry/bracket'`.

## How to verify

1. `pnpm dev` — open the viewer, configure a bracket with mounting holes
2. Rotate the 3D view — each mounting hole should show the scene behind the faceplate (dark background / shelf geometry) rather than a flat dark disc
3. View from behind the faceplate — holes should be open from both sides
4. `pnpm test` — all geometry tests should still pass (no geometry changes)
5. `pnpm typecheck` — no type errors

## Out of scope

- Geometry layer (`src/geometry/bracket.ts`) — already correct, no changes
- Export layer (`src/export/`) — already correct, no changes
- Models / store — no changes
