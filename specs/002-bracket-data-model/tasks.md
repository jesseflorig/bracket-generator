# Tasks: Bracket Data Model Redesign

**Input**: Design documents from `/specs/002-bracket-data-model/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested — test tasks are included for the geometry layer only (vitest, already in the project).

**Organization**: Tasks are grouped by user story. The foundational phase covers the complete schema + geometry replacement that all stories depend on.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Confirm green baseline before any code changes.

- [x] T001 Run `pnpm test` and `pnpm typecheck` in the project root; confirm all current tests pass and no type errors exist before any file is modified

---

## Phase 2: Foundational — Schema, Derived Functions, Geometry, Store

**Purpose**: Replace the complete data model and geometry layer. All user story UI work is blocked on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Replace `src/models/bracketParams.ts` — new Zod schema with all 12 stored fields (`rackWidth`, `railWidth`, `faceplateHeight`, `faceplateDepth`, `cornerRadius`, `shelfWallThickness`, `cutoutWidth`, `cutoutHeight`, `shelfDepth`, `holeDiameter`, `holeInset`, `holeEdgeOffset`), per-field min/max constraints (in mm), cross-field `superRefine` rules from data-model.md, new `DEFAULT_PARAMS`, and `ExportPayload` interface

- [x] T003 Add exported derived-value pure functions to `src/geometry/bracket.ts` — `faceplateWidth(p)`, `shelfMaxWidth(p)`, `holeCount(p)`, `holePositions(p)` — formulas exactly as specified in data-model.md; these must be exported and usable before `buildBracket` is implemented

- [x] T004 Replace `buildBracket` in `src/geometry/bracket.ts` — faceplate via `THREE.Shape` + `THREE.ExtrudeGeometry`: outer rounded-rectangle path (cornerRadius arcs), rectangular cutout hole path centered in faceplate, circular mounting hole paths at computed positions on left and right sides; shelf via three merged `BoxGeometry` parts (bottom panel, left wall, right wall) per coordinate layout in data-model.md; keep and update `HolePosition` interface

- [x] T005 [P] Update `src/store/bracketStore.ts` — import new `BracketParams` and `DEFAULT_PARAMS` from updated `bracketParams.ts`; verify the file compiles without changes to the store interface (the generic `setParam<K>` should work as-is)

- [x] T006 Replace `src/geometry/bracket.test.ts` — write vitest tests covering: `faceplateWidth` formula (165.1 + 2×25.4 = 216.9), `shelfMaxWidth` formula (165.1 − 2×3.175 = 158.75), `holeCount` at 31.75mm→1, 50.8mm→2, 25.4mm→1, `holePositions` for count=1 returns y=0, `holePositions` for count=2 returns correct top/bottom positions, `buildBracket` bounding box matches expected envelope, geometry has vertex data, schema rejects `faceplateHeight` < 25.4, schema rejects `cornerRadius` too large, schema rejects cutout exceeding faceplate

**Checkpoint**: Run `pnpm test` and `pnpm typecheck` — all T006 tests must pass and zero type errors before proceeding.

---

## Phase 3: User Story 1 — Rack and Rail Dimensions (Priority: P1) 🎯 MVP Start

**Goal**: User can set rack width and rail width; faceplate width is displayed as a read-only derived value; 3D preview reflects correct overall bracket envelope.

**Independent Test**: Load app, verify rack width defaults to 6.5", rail width to 1", and the read-only faceplate width shows 8.5". Change rack width to 8" — faceplate width should update to 10". 3D preview updates immediately.

- [x] T007 [US1] Rewrite `src/components/DimensionPanel.tsx` — remove all legacy controls (bracketType toggle, width/height/depth/thickness/holeCount/holeSpacing sliders); add Rack section with `DimensionSlider` for `rackWidth` (minMm=50.8, maxMm=609.6) and `railWidth` (minMm=6.35, maxMm=50.8); add read-only faceplate width display showing `faceplateWidth(params)` formatted via `formatDisplay`; preserve Units section and Reset button; wire validation via `bracketParamsSchema.safeParse` as before

- [x] T008 [US1] Update `src/components/BracketViewer.tsx` — replace all `params.width`, `params.height`, `params.depth` references: camera position uses `faceplateWidth(params)`, `params.faceplateHeight`, `params.shelfDepth`; `OrbitControls` target uses `new THREE.Vector3(0, 0, params.shelfDepth / 2)` (faceplate is now Y-centered at 0); import `faceplateWidth` from `../geometry/bracket`

**Checkpoint**: `pnpm dev` — Rack section visible, faceplate width updates when rack width changes, 3D preview no longer crashes.

---

## Phase 4: User Story 2 — Faceplate Dimensions (Priority: P1)

**Goal**: User can adjust faceplate height, depth (thickness), and corner radius; 3D preview shows the correct faceplate shape with rounded corners.

**Independent Test**: Change faceplate height from 1.25" to 2" — the preview faceplate grows taller and `holeCount` shown later should jump from 1 to 2. Change corner radius to 5mm — corners visibly round. Change depth to 0.0625" — faceplate thins noticeably.

- [x] T009 [US2] Add Faceplate section to `src/components/DimensionPanel.tsx` — `DimensionSlider` for `faceplateHeight` (minMm=25.4, maxMm=127.0), `faceplateDepth` (minMm=1.5875, maxMm=6.35), `cornerRadius` (minMm=0, maxMm=derived — use a safe static max like 15mm and rely on Zod cross-field for the true limit); insert section after Rack section; validation errors from `cornerRadius` must surface inline

**Checkpoint**: Faceplate height, depth, and corner radius controls appear and drive the 3D preview.

---

## Phase 5: User Story 3 — Faceplate Mounting Holes (Priority: P1)

**Goal**: Mounting holes appear automatically in the preview, count derived from faceplate height; user can adjust diameter, horizontal inset, and vertical edge offset.

**Independent Test**: With default 1.25" height, exactly 1 hole per side appears centered vertically. Change faceplate height to 2.5" — 2 holes per side appear with correct top/bottom positioning. Adjust hole diameter — all holes resize simultaneously.

- [x] T010 [US3] Add Mounting Holes section to `src/components/DimensionPanel.tsx` — read-only display of `holeCount(params)` (integer, no unit); `DimensionSlider` for `holeDiameter` (minMm=2, maxMm=15), `holeInset` (minMm=derived — use 3mm static min, rely on Zod for true limit), `holeEdgeOffset` (minMm=3, maxMm=25.4); insert section after Faceplate section

**Checkpoint**: Hole controls visible; hole count changes automatically when faceplateHeight changes; hole diameter/position adjustments update the 3D preview.

---

## Phase 6: User Story 4 — Shelf Cutout Dimensions (Priority: P2)

**Goal**: User can set the cutout opening size (height and width); a read-only shelf max width is displayed; the preview shows the opening centered in the faceplate.

**Independent Test**: Default cutout (5" × 0.75") visible as an opening in the faceplate preview. Change cutout width to 6" — opening grows. Set cutout width larger than faceplate width — Zod validation error appears inline, geometry update blocked.

- [x] T011 [US4] Add Shelf Cutout section to `src/components/DimensionPanel.tsx` — `DimensionSlider` for `cutoutWidth` (minMm=0, maxMm derived — use 200mm static max, Zod enforces real limit) and `cutoutHeight` (minMm=0, maxMm derived — use 120mm static max); read-only display of `shelfMaxWidth(params)` via `formatDisplay`; insert section after Mounting Holes section

**Checkpoint**: Cutout controls visible; cutout appears in faceplate preview; invalid cutout sizes show validation errors.

---

## Phase 7: User Story 5 — Shelf Depth (Priority: P3)

**Goal**: User can set shelf depth; the bottom panel and side walls behind the faceplate extend by that amount in the preview.

**Independent Test**: Default shelf depth (2") shows visible shelf in preview. Set to 0 — shelf disappears; only the flat faceplate remains. Set to 6" — shelf extends noticeably deeper.

- [x] T012 [US5] Add Shelf section to `src/components/DimensionPanel.tsx` — `DimensionSlider` for `shelfDepth` (minMm=0, maxMm=304.8) and `shelfWallThickness` (minMm=1, maxMm=6.35); insert section after Shelf Cutout section

**Checkpoint**: Shelf depth and wall thickness controls visible; 3D preview shelf extends/retracts correctly.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finalize all secondary file updates and validate the complete feature end-to-end.

- [x] T013 [P] Update `src/components/ExportBar.tsx` — replace legacy `params.width`, `params.height`, `params.depth` in the filename string with `faceplateWidth(params)`, `params.faceplateHeight`, `params.shelfDepth`; import `faceplateWidth` from `../geometry/bracket`

- [x] T014 Run full validation suite — `pnpm typecheck` (zero errors), `pnpm test` (all pass), `pnpm dev` (open in browser: verify all sections render, preview updates on every input, both STL and 3MF downloads produce valid files matching the preview)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phases 3–7 (User Stories)**: All depend on Phase 2; must proceed in order (T007→T008→T009→T010→T011→T012) since they all modify `DimensionPanel.tsx` sequentially
- **Phase 8 (Polish)**: Depends on all story phases complete

### Within Phase 2

```
T002 (schema) → T003 (derived functions) → T004 (geometry builder) → T006 (tests)
T002 (schema) → T005 (store update)   [parallel with T003]
```

### Parallel Opportunities

- **T005** (store) can run alongside T003/T004 — different file, no dependency on geometry
- **T013** (ExportBar) can run in parallel with T014 (validation) since they're independent

---

## Parallel Example: Phase 2 (Foundational)

```
# Sequential spine:
T002 → T003 → T004 → T006

# Parallel with T003:
T005 (bracketStore.ts update — different file)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup baseline check
2. Complete Phase 2: Foundational (CRITICAL — blocks everything)
3. Complete Phase 3: Rack and Rail Dimensions (US1)
4. Complete Phase 4: Faceplate Dimensions (US2)
5. Complete Phase 5: Mounting Holes (US3)
6. **STOP and VALIDATE**: All P1 stories functional — bracket has correct shape, correct holes, correct derived values
7. Demo/review if ready

### Incremental Delivery

1. Phase 1 + 2 → geometry correct, store updated, tests green
2. Phase 3 → rack/rail controls + viewer working
3. Phase 4 → faceplate controls working
4. Phase 5 → mounting hole controls working (all P1 complete)
5. Phase 6 → cutout controls working (P2 complete)
6. Phase 7 → shelf depth controls working (P3 complete)
7. Phase 8 → polish and export validated

---

## Notes

- [P] tasks operate on different files and can run in parallel
- [Story] label maps each task to its user story for traceability
- DimensionPanel.tsx is modified in place across Phases 3–7; tasks are sequential within that file
- All dimension values in sliders must pass `minMm`/`maxMm` in mm — the DimensionSlider handles display conversion via `unitSystem`
- Derived values (`faceplateWidth`, `shelfMaxWidth`, `holeCount`) must never be stored in Zustand — always compute on render
- Run `pnpm typecheck` after each phase; TypeScript will catch any param-name regressions early
