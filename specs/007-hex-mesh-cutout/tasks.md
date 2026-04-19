# Tasks: Hexagonal Mesh Cutout on Shelf Walls

**Input**: Design documents from `/specs/007-hex-mesh-cutout/`  
**Branch**: `007-hex-mesh-cutout`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

No new project setup required. All dependencies are already present. The existing Three.js `THREE.Shape` + `THREE.Path` holes approach used by the faceplate is sufficient — no new libraries needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema changes that all three user stories depend on. Must complete before any geometry or UI work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Add `hexHoleDiameter`, `hexHoleGap`, `hexHoleInset` fields to `bracketParamsSchema` (Zod `z.number()` with min/max) and `DEFAULT_PARAMS` (3.175 mm each) in `src/models/bracketParams.ts`
- [x] T002 Add `hexMeshFloor` boolean field to `bracketParamsSchema` (`z.boolean()`) and `DEFAULT_PARAMS` (`false`) in `src/models/bracketParams.ts`
- [x] T003 Update `src/geometry/bracket.test.ts` default-params snapshot to include the four new fields so the existing test suite does not break

**Checkpoint**: `pnpm typecheck` and `pnpm test` both pass with new fields before proceeding.

---

## Phase 3: User Story 1 — Hex Mesh Renders on Side Walls in 3D Viewer (Priority: P1) 🎯 MVP

**Goal**: The two vertical shelf walls display a centered, inset-respecting honeycomb grid of through-holes in the 3D viewer.

**Independent Test**: Start `pnpm dev`, load default bracket. Confirm both side walls show a repeating hexagonal pattern with visible openings. Rotate to confirm holes are through-geometry.

### Implementation

- [x] T004 [US1] Implement `hexHolePaths(faceW, faceH, p: BracketParams): THREE.Path[]` in `src/geometry/bracket.ts` — generates flat-top hex hole paths tiled over the inset-reduced face, centered on the face, omitting any hole whose vertex falls within the inset zone or outside the face boundary
- [x] T005 [US1] Implement `buildHexWallPanel(faceW, faceH, thickness: number, p: BracketParams): THREE.BufferGeometry` in `src/geometry/bracket.ts` — creates a `THREE.Shape` rectangle with hex holes from `hexHolePaths`, extrudes by `thickness`, returns oriented geometry (caller applies rotation + translation)
- [x] T006 [US1] Refactor left wall and right wall construction in `buildShelf()` in `src/geometry/bracket.ts` to use `buildHexWallPanel` instead of `BoxGeometry` — maintain identical position and orientation; rotate the extruded geometry -90° around Y and translate to match the current BoxGeometry placement
- [x] T007 [US1] Add floor panel hex mesh path to `buildShelf()` in `src/geometry/bracket.ts` — when `p.hexMeshFloor` is `true`, replace the bottom `BoxGeometry` with a `buildHexWallPanel` call rotated -90° around X; when `false`, keep the existing `BoxGeometry` floor

**Checkpoint**: Side walls show hex pattern with default params. Floor remains solid. No TypeScript errors.

---

## Phase 4: User Story 2 — Configure Hex Mesh Parameters in UI (Priority: P2)

**Goal**: The parameter panel exposes all four hex mesh controls; changes update the 3D view immediately.

**Independent Test**: Change hole diameter, gap, and inset individually — confirm 3D view updates after each change. Toggle the floor checkbox — confirm floor panel gains/loses hex pattern.

### Implementation

- [x] T008 [US2] Add `DimensionSlider` for `hexHoleDiameter` in the shelf section of `src/components/DimensionPanel.tsx` — label "Hex Hole Size", range 1–25.4 mm (0.04"–1"), step 0.5 mm, unit-converted display
- [x] T009 [US2] Add `DimensionSlider` for `hexHoleGap` in `src/components/DimensionPanel.tsx` — label "Hex Gap", range 0–25.4 mm (0"–1"), step 0.5 mm, unit-converted display
- [x] T010 [US2] Add `DimensionSlider` for `hexHoleInset` in `src/components/DimensionPanel.tsx` — label "Mesh Inset", range 0–25.4 mm (0"–1"), step 0.5 mm, unit-converted display
- [x] T011 [US2] Add a checkbox/toggle for `hexMeshFloor` in `src/components/DimensionPanel.tsx` — label "Include Floor Panel", wired to `setParam('hexMeshFloor', value)` from the Zustand store

**Checkpoint**: All four controls appear in the UI, are correctly labeled, and drive live 3D updates.

---

## Phase 5: User Story 3 — Exported Files Reflect Hex Mesh Geometry (Priority: P3)

**Goal**: STL and 3MF exports contain real open hex voids — no new code required since export pipeline derives directly from the geometry object, but verification is required.

**Independent Test**: Export to STL and 3MF with hex mesh visible in the viewer. Open each file in a standard 3D viewer (e.g., Blender, PrusaSlicer) and confirm hex holes are open geometry.

### Implementation

- [ ] T012 [US3] Run `pnpm build` and export an STL from the production build — open in any 3D viewer and confirm hex holes are through-voids on side walls; document result
- [ ] T013 [US3] Export a 3MF from the production build — open in a slicer (e.g., PrusaSlicer) and confirm hex holes appear as empty space with no infill generated inside them; document result
- [ ] T014 [US3] If either export shows plugged holes or artifacts, trace the geometry pipeline in `src/export/exportStl.ts` and `src/export/export3mf.ts` and fix — the geometry object passed to the exporter must expose the `ExtrudeGeometry` with holes, not a merged solid

**Checkpoint**: Both export formats show open hex geometry confirmed by visual inspection.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T015 [P] Run `pnpm typecheck` — resolve any strict-mode TypeScript errors introduced by new fields or geometry helpers
- [x] T016 [P] Run `pnpm test` — confirm all existing tests pass; add targeted unit assertions in `src/geometry/bracket.test.ts` for `hexHolePaths` boundary cases (wall too small → empty array, inset larger than wall → empty array, gap = 0 → holes touching)
- [ ] T017 Visual smoke test — start `pnpm dev`, verify: (1) side walls show hex mesh by default, (2) floor solid by default, (3) floor toggle adds hex mesh to floor, (4) all three sliders update pattern in real time, (5) no z-fighting or boundary artifacts at any angle

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: No dependencies — start immediately
- **Phase 3 (US1)**: Requires Phase 2 complete — schema must exist before geometry code can reference params
- **Phase 4 (US2)**: Requires Phase 2 complete — UI sliders reference schema fields; can run in parallel with Phase 3
- **Phase 5 (US3)**: Requires Phase 3 complete — export verification depends on geometry producing correct output
- **Phase 6 (Polish)**: Requires Phases 3, 4, 5 complete

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2
- **US2 (P2)**: Unblocked after Phase 2 — can run in parallel with US1
- **US3 (P3)**: Requires US1 complete (geometry must exist to verify exports)

### Within US1

- T004 → T005 → T006 → T007 (each step depends on the previous)

### Within US2

- T008, T009, T010, T011 are independent additions to the same file — implement sequentially in one pass

### Parallel Opportunities

- Phase 3 (US1) and Phase 4 (US2) can run in parallel after Phase 2
- T015 and T016 in Phase 6 can run in parallel

---

## Parallel Example: Phase 3 + Phase 4 (after Phase 2 complete)

```
Stream A (US1 - Geometry):
  T004 hexHolePaths helper
  T005 buildHexWallPanel helper
  T006 left/right wall refactor
  T007 floor panel toggle

Stream B (US2 - UI, same period):
  T008 hexHoleDiameter slider
  T009 hexHoleGap slider
  T010 hexHoleInset slider
  T011 hexMeshFloor toggle
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2 — schema fields
2. Complete Phase 3 — geometry rendering on side walls
3. **Stop and validate**: Side walls show hex mesh, floor is solid, no artifacts
4. Proceed to Phase 4 (UI controls) and Phase 5 (export) once MVP confirmed

### Incremental Delivery

1. Phase 2 → Phase 3: Hex mesh visible in viewer (hardcoded defaults, no UI controls yet)
2. Phase 4: Add UI controls — full interactive configuration
3. Phase 5: Export verification — manufacturing-ready output
4. Phase 6: Type-safe, tested, polished

---

## Notes

- All four new params stored in mm in the schema — UI layer converts via `src/units/convert.ts`
- `hexHolePaths` is the critical geometry helper; test its boundary logic thoroughly in Phase 6
- The `ExtrudeGeometry` + `Shape.holes` pattern is already proven by the faceplate — follow that exact model
- Inset zone: a hole is omitted if any of its 6 vertices falls within `hexHoleInset` mm of any wall edge
- Flat-top hex orientation: vertex at 0°, then every 60°; circumradius `R = hexHoleDiameter / √3`
