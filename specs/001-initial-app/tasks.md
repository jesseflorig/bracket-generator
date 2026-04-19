---
description: "Task list for bracket generator initial app"
---

# Tasks: Initial App — Bracket Generator

**Input**: Design documents from `/specs/001-initial-app/`
**Prerequisites**: plan.md ✅, data-model.md ✅, contracts/geometry-api.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Unit tests included for geometry builder and unit conversion (pure functions — high value, low effort).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Vite project scaffolding, tooling, and dependency installation.

- [x] T001 Initialize Vite + React + TypeScript project with pnpm (produces `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json`)
- [x] T00X Install and configure Tailwind CSS v3 (`tailwind.config.ts`, `postcss.config.js`, `src/index.css` with directives)
- [x] T00X [P] Enable TypeScript strict mode in `tsconfig.json` (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes)
- [x] T00X [P] Install runtime dependencies: `three @react-three/fiber @react-three/drei zustand zod jszip` and types in `package.json`

**Checkpoint**: `pnpm dev` starts without errors; blank page loads at localhost:5173.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model, store, unit conversion, and geometry engine — required by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T00X Create `BracketParams` Zod schema, TypeScript type, cross-field validation rules, and `DEFAULT_PARAMS` in `src/models/bracketParams.ts` (see data-model.md for fields, min/max, and invariants)
- [x] T00X [P] Create unit conversion utilities `toMm`, `fromMm`, `formatDisplay` in `src/units/convert.ts` (pure functions, no imports outside this file)
- [x] T00X Create Zustand `AppState` store with `params`, `unitSystem`, `setParam`, `setUnitSystem`, `resetToDefaults` in `src/store/bracketStore.ts` (depends on T005, T006)
- [x] T00X Create geometry builder `buildBracket(params: BracketParams): THREE.BufferGeometry` in `src/geometry/bracket.ts` — L-bracket and U-bracket shapes, mounting holes along X axis, all coordinates in mm, no React imports (depends on T005)

**Checkpoint**: Foundation ready — `pnpm typecheck` passes; all user story work can begin.

---

## Phase 3: User Story 1 — Core 3D Viewer (Priority: P1) 🎯 MVP

**Goal**: User can open the app and see a 3D bracket rendered with default dimensions, orbitable with mouse.

**Independent Test**: Navigate to localhost:5173 — a 3D bracket is visible and can be rotated/zoomed. No controls needed yet.

### Implementation for User Story 1

- [x] T00X [P] [US1] Create `BracketViewer` component: R3F `<Canvas>` with `<OrbitControls>`, ambient + directional lighting, `<mesh>` consuming `useMemo(buildBracket(params), [params])` from the store in `src/components/BracketViewer.tsx`
- [x] T0XX [US1] Create `BracketPage` layout with full-height viewer area and placeholder sidebar in `src/pages/BracketPage.tsx`
- [x] T0XX [US1] Wire `BracketPage` into `src/main.tsx`; verify default L-bracket renders in browser with correct proportions at `DEFAULT_PARAMS`

**Checkpoint**: US1 complete — 3D bracket visible, orbitcontrol working, no console errors.

---

## Phase 4: User Story 2 — Dimension Controls (Priority: P2)

**Goal**: User can adjust all bracket dimensions via sliders and number inputs; 3D viewer updates in real time with no explicit action required.

**Independent Test**: Move the `width` slider — the bracket in the viewer widens immediately. Enter a value outside valid range — an inline error appears.

### Implementation for User Story 2

- [x] T0XX [P] [US2] Create `DimensionSlider` component: labeled range slider + number input + unit suffix, fires `setParam` on change, accepts current display unit from store in `src/components/DimensionSlider.tsx`
- [x] T0XX [P] [US2] Create `ValidationMessage` component: displays a per-field error string with red Tailwind styling in `src/components/ValidationMessage.tsx`
- [x] T0XX [US2] Create `DimensionPanel` with a `DimensionSlider` for each `BracketParams` field (width, height, depth, thickness, holeCount, holeDiameter, holeSpacing, holeInset) and a `bracketType` toggle, with `ValidationMessage` per field, in `src/components/DimensionPanel.tsx` (depends on T012, T013)
- [x] T0XX [US2] Integrate `DimensionPanel` into the `BracketPage` left sidebar in `src/pages/BracketPage.tsx`
- [x] T0XX [US2] Verify real-time update: slide `height` while watching viewer — bracket height changes on each tick without page interaction

**Checkpoint**: US2 complete — all sliders wired, viewer updates live, validation errors display correctly.

---

## Phase 5: User Story 3 — Unit Toggle (Priority: P3)

**Goal**: User can switch between mm and inches display; all dimension inputs reformat instantly; the geometry and store remain in mm throughout.

**Independent Test**: Switch to inches — all input labels show "in" and values reformat (e.g., 50mm → 1.97in). Switch back to mm — original mm values restore exactly (no rounding drift).

### Implementation for User Story 3

- [x] T0XX [US3] Create `UnitToggle` component (mm / in segmented button) wired to `setUnitSystem` in the store in `src/components/UnitToggle.tsx`
- [x] T0XX [US3] Update `DimensionSlider` to read `unitSystem` from the store and convert display values via `fromMm`/`toMm` from `src/units/convert.ts`; slider min/max must also be converted for display in `src/components/DimensionSlider.tsx`
- [x] T0XX [US3] Integrate `UnitToggle` into `DimensionPanel` header in `src/components/DimensionPanel.tsx`; verify mm↔in round-trip: no drift after switching units twice

**Checkpoint**: US3 complete — unit toggle works, no rounding drift, geometry unchanged by unit switch.

---

## Phase 6: User Story 4 — Export (Priority: P4)

**Goal**: User can download the current bracket as a binary STL file and as a 3MF file, both in mm, both geometrically identical to the viewer.

**Independent Test**: Click "Export STL" — a `.stl` file downloads; open in PrusaSlicer, dimensions match the mm values shown. Click "Export 3MF" — a `.3mf` file downloads; PrusaSlicer shows `unit: millimeter`.

### Implementation for User Story 4

- [x] T0XX [P] [US4] Implement `exportStl(payload: ExportPayload): void` in `src/export/exportStl.ts` using Three.js `STLExporter` from `three/examples/jsm/exporters/STLExporter`; trigger browser download via `URL.createObjectURL`
- [x] T0XX [P] [US4] Implement `export3mf(payload: ExportPayload): Promise<void>` in `src/export/export3mf.ts`: build 3MF XML (`[Content_Types].xml`, `_rels/.rels`, `3D/3dmodel.model` with `unit="millimeter"`), zip with `jszip`, trigger browser download
- [x] T0XX [US4] Create `ExportBar` component with "Export STL" and "Export 3MF" buttons; wire to `exportStl`/`export3mf` with the current geometry from the viewer ref and params from the store in `src/components/ExportBar.tsx` (depends on T020, T021)
- [x] T0XX [US4] Integrate `ExportBar` into `BracketPage` below the viewer or in sidebar footer in `src/pages/BracketPage.tsx`
- [x] T0XX [US4] Verify both exports: download each file type, confirm dimensions match viewer values and 3MF declares `unit="millimeter"`

**Checkpoint**: US4 complete — both file types download, both verified in a slicer.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Test coverage for pure functions, styling, and end-to-end smoke test.

- [x] T0XX [P] Write Vitest unit tests for `buildBracket` edge cases (min params, max params, zero holes, U-bracket) in `src/geometry/bracket.test.ts`
- [x] T0XX [P] Write Vitest unit tests for unit conversion round-trips and `formatDisplay` in `src/units/convert.test.ts`
- [x] T0XX Polish Tailwind styling across all components: consistent sidebar width, slider spacing, dark/neutral color scheme, responsive layout
- [x] T0XX Run all five quickstart.md smoke tests end-to-end and resolve any failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (needs store + geometry builder)
- **US2 (Phase 4)**: Depends on US1 (needs BracketViewer + BracketPage in place)
- **US3 (Phase 5)**: Depends on US2 (needs DimensionSlider to update unit display)
- **US4 (Phase 6)**: Depends on US1 (needs BufferGeometry ref from viewer); can start after US1
- **Polish (Phase 7)**: Depends on all stories complete

### Within Each Phase

- Models before store before geometry (T005 → T007, T005 → T008)
- Leaf components before composite panels (T012/T013 before T014)
- Export utilities before ExportBar (T020/T021 before T022)

### Parallel Opportunities

- T003, T004 (Setup) — parallel
- T006 (units) runs parallel to T005 (schema)
- T009 (BracketViewer) is independent of T010 (BracketPage layout)
- T012 (DimensionSlider) and T013 (ValidationMessage) — parallel
- T020 (exportStl) and T021 (export3mf) — parallel
- T025 (geometry tests) and T026 (unit tests) — parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Start in parallel:
Task T005: "Create BracketParams Zod schema in src/models/bracketParams.ts"
Task T006: "Create unit conversion utilities in src/units/convert.ts"

# After T005 completes, start in parallel:
Task T007: "Create Zustand store in src/store/bracketStore.ts"
Task T008: "Create geometry builder in src/geometry/bracket.ts"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (viewer only)
4. **STOP and VALIDATE**: 3D bracket visible, orbitcontrol works
5. Demo before adding controls

### Incremental Delivery

1. Setup + Foundational → compile passes
2. US1 → 3D viewer working (MVP!)
3. US2 → sliders wired, real-time update
4. US3 → unit toggle working
5. US4 → exports verified in slicer
6. Polish → tests + styling

---

## Notes

- [P] = different files, no dependencies — safe to parallelize
- [Story] label maps task to user story for traceability
- Geometry tests (T025) and unit tests (T026) cover only pure functions — no DOM, no Three.js mocking needed
- US4 can begin after US1 (only needs the geometry, not the controls)
- Avoid: importing from `src/geometry/` directly in components — always go through the store/hook
