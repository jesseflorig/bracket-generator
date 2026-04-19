# Tasks: Mounting Holes Render as Cutouts

**Input**: Design documents from `/specs/005-mounting-hole-cutouts/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup required — existing project, existing dependencies.

*(No tasks — project is already initialized with all required dependencies.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No new infrastructure required — change is confined to a single component.

*(No tasks — no shared infrastructure to establish before user story work begins.)*

---

## Phase 3: User Story 1 — View Through-Hole Faceplate in 3D Viewer (Priority: P1) 🎯 MVP

**Goal**: The 3D viewer renders mounting holes as visible through-material voids, not dark-filled discs.

**Independent Test**: Run `pnpm dev`, open the viewer with a bracket that has mounting holes configured, rotate the model — scene content should be visible through each hole from both front and back.

### Implementation for User Story 1

- [x] T001 [US1] Remove the dark cylinder overlay loop and its associated locals (`positions`, `holeR`, `leftX`, `rightX`, `holeCylinderZ`) from `BracketMesh` in `src/components/BracketViewer.tsx`
- [x] T002 [US1] Remove the now-unused `holePositions` import from `'../geometry/bracket'` in `src/components/BracketViewer.tsx`

**Checkpoint**: Dev server shows mounting holes as visible through-holes. View from both faces. No dark disc overlay present.

---

## Phase 4: User Story 2 — Exported 3D File Reflects Cutout Geometry (Priority: P2)

**Goal**: Confirm exported STL/3MF files contain open through-holes at mounting hole positions.

**Independent Test**: Export a bracket and open in any 3D viewer — hole regions should be open geometry.

### Implementation for User Story 2

- [x] T003 [US2] Run `pnpm test` to confirm all geometry tests pass — the geometry layer (`src/geometry/bracket.ts`) already produces through-holes and requires no changes; this task verifies no regressions were introduced

**Checkpoint**: All tests pass. Export geometry is confirmed unchanged and correct.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T004 Run `pnpm typecheck` and confirm no type errors after removing unused locals in `src/components/BracketViewer.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 3 (US1)**: No prerequisites — start immediately
- **Phase 4 (US2)**: No code changes required; can run in parallel with Phase 3 or immediately after
- **Phase 5 (Polish)**: Run after T001/T002 are complete

### User Story Dependencies

- **US1**: Independent — no dependencies
- **US2**: Independent — geometry layer is unchanged; test confirms existing behavior

### Parallel Opportunities

T001 and T003 touch different files and can run in parallel if desired (though T001 is the only real code change).

---

## Parallel Example: User Story 1

```bash
# The entire implementation is two edits to the same file — sequential by nature:
Task T001: Remove cylinder loop and locals from src/components/BracketViewer.tsx
Task T002: Remove unused import from src/components/BracketViewer.tsx
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete T001 + T002 in `src/components/BracketViewer.tsx`
2. Visual verification in dev server
3. **STOP and VALIDATE**: Rotate model, confirm holes are open from both faces

### Full Delivery

1. T001 + T002 — remove cylinder overlay
2. T003 — confirm geometry tests pass (US2 verification)
3. T004 — typecheck
4. Done

---

## Notes

- Total tasks: 4 (T001–T004)
- Tasks per user story: US1 = 2, US2 = 1, Polish = 1
- Net code change: deletion only — no new code, no new abstractions
- Suggested MVP scope: T001 + T002 (US1 complete, demonstrable in under 5 minutes)
