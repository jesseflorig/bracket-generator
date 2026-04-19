# Tasks: Shelf-Cutout Alignment

**Input**: Design documents from `/specs/003-shelf-cutout-aligned/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Scope**: Single function change in `src/geometry/bracket.ts` (`buildShelf`) plus test coverage in `src/geometry/bracket.test.ts`. No schema, store, UI, or export changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

No project structure or dependency changes required. The existing Vitest + TypeScript setup is sufficient.

*(No tasks)*

---

## Phase 2: Foundational

No schema, store, or component changes required. `buildShelf` is a self-contained function in `src/geometry/bracket.ts`.

*(No tasks)*

---

## Phase 3: User Story 1 — Shelf Walls Align with Cutout Edges (Priority: P1) 🎯 MVP

**Goal**: Reposition shelf side walls so their inner faces are flush with the cutout left/right edges, and extend the zero-dimension guard to cover `cutoutWidth = 0`.

**Independent Test**: Configure a bracket with `cutoutWidth` narrower than `rackWidth`; verify the shelf's X bounding box outer span equals `cutoutWidth + 2 × shelfWallThickness` and the inner span equals `cutoutWidth`. With `cutoutWidth = 0`, verify no shelf renders.

### Implementation for User Story 1

- [x] T001 [US1] Update `buildShelf` guard in `src/geometry/bracket.ts` to return `null` when `cutoutWidth <= 0` (add alongside existing `shelfDepth <= 0` check)
- [x] T002 [US1] Update left wall X center in `buildShelf` in `src/geometry/bracket.ts` from `-(cutoutWidth/2 - shelfWallThickness/2)` to `-(cutoutWidth/2 + shelfWallThickness/2)`
- [x] T003 [US1] Update right wall X center in `buildShelf` in `src/geometry/bracket.ts` from `+(cutoutWidth/2 - shelfWallThickness/2)` to `+(cutoutWidth/2 + shelfWallThickness/2)`

### Tests for User Story 1

- [x] T004 [P] [US1] Add test: shelf not rendered when `cutoutWidth = 0` — `buildBracket` Z depth equals `faceplateDepth` only — in `src/geometry/bracket.test.ts`
- [x] T005 [P] [US1] Add test: shelf X outer span equals `cutoutWidth + 2 × shelfWallThickness` (within 0.001 tolerance) when cutout and shelf are both > 0 — in `src/geometry/bracket.test.ts`

**Checkpoint**: Shelf side walls now sit outside the cutout boundary with inner faces flush. `cutoutWidth = 0` suppresses shelf.

---

## Phase 4: User Story 2 — Shelf Bottom Aligns with Cutout Bottom (Priority: P1)

**Goal**: Reposition the shelf bottom panel and extend the zero-dimension guard to cover `cutoutHeight = 0`. The shelf walls are already correctly sized to `cutoutHeight` — only the bottom Y position and guard need confirming.

**Independent Test**: Configure a bracket with `cutoutHeight` shorter than `faceplateHeight`; verify the shelf bottom panel's top face Y equals `-(cutoutHeight / 2)`. With `cutoutHeight = 0`, verify no shelf renders.

### Implementation for User Story 2

- [x] T006 [US2] Update `buildShelf` guard in `src/geometry/bracket.ts` to also return `null` when `cutoutHeight <= 0` (combine with T001 into single early-return: `shelfDepth <= 0 || cutoutWidth <= 0 || cutoutHeight <= 0`)
- [x] T007 [US2] Confirm wall height in `buildShelf` in `src/geometry/bracket.ts` uses `cutoutHeight` (not `faceplateHeight`) — update if still using `faceplateHeight`
- [x] T008 [US2] Confirm bottom panel Y center in `buildShelf` in `src/geometry/bracket.ts` is `-(cutoutHeight/2 + shelfWallThickness/2)` — update if still using `faceplateHeight`

### Tests for User Story 2

- [x] T009 [P] [US2] Add test: shelf not rendered when `cutoutHeight = 0` — `buildBracket` Z depth equals `faceplateDepth` only — in `src/geometry/bracket.test.ts`
- [x] T010 [P] [US2] Add test: shelf renders (Z depth = `faceplateDepth + shelfDepth`) when `cutoutWidth > 0`, `cutoutHeight > 0`, `shelfDepth > 0` — in `src/geometry/bracket.test.ts`
- [x] T011 [P] [US2] Add test: shelf bottom panel top face Y equals `-(cutoutHeight / 2)` within 0.001 tolerance — in `src/geometry/bracket.test.ts`

**Checkpoint**: Shelf bottom is flush with cutout bottom edge. Zero-dimension guards prevent degenerate geometry for both cutout dimensions.

---

## Phase 5: Polish & Verification

- [x] T012 Run `pnpm typecheck` and resolve any TypeScript errors in `src/geometry/bracket.ts`
- [x] T013 Run `pnpm test` and confirm all tests pass (existing 28 tests + 6 new tests = 34 total)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 3 (US1)**: No prior phases required — start immediately
- **Phase 4 (US2)**: T006/T007/T008 depend on T001 (guard is combined); otherwise independent
- **Phase 5 (Polish)**: Depends on all implementation and test tasks

### Within Each User Story

- T001–T003: Implement guard + wall repositioning before tests
- T004–T005: Write tests after implementation (verify they pass, not fail — this is a geometry adjustment, not TDD)
- T006 folds the `cutoutHeight` guard into the same early-return as T001
- T007–T008 may be no-ops if the existing code already uses `cutoutHeight` (verify first)

### Parallel Opportunities

- T004 and T005 can run in parallel (both in bracket.test.ts, independent test cases)
- T009, T010, T011 can run in parallel (independent test cases)
- T012 and T013 run sequentially (typecheck before test run)

---

## Parallel Example: User Story 1 Tests

```bash
# After T001–T003 implementation:
Task: "Add test: shelf not rendered when cutoutWidth = 0"
Task: "Add test: shelf X outer span equals cutoutWidth + 2×shelfWallThickness"
# Both write to bracket.test.ts — stage sequentially or merge carefully
```

---

## Implementation Strategy

### MVP (US1 + US2 together — single function)

Both user stories modify `buildShelf` in the same function. Implement the complete guard + geometry change in one pass:

1. Open `src/geometry/bracket.ts`, locate `buildShelf`
2. Replace guard: `if (p.shelfDepth <= 0 || p.cutoutWidth <= 0 || p.cutoutHeight <= 0) return null;`
3. Update left wall: `x = -(p.cutoutWidth / 2 + p.shelfWallThickness / 2)`
4. Update right wall: `x = +(p.cutoutWidth / 2 + p.shelfWallThickness / 2)`
5. Confirm bottom panel: `y = -(p.cutoutHeight / 2 + p.shelfWallThickness / 2)` and `BoxGeometry(p.cutoutWidth, ...)`
6. Confirm wall height: `BoxGeometry(p.shelfWallThickness, p.cutoutHeight, ...)`
7. Add 6 tests to `bracket.test.ts`
8. Run typecheck + tests

---

## Notes

- T007 and T008 are verification tasks — read the current code first and only edit if the value is wrong
- The bottom panel width stays `cutoutWidth` (inner channel width); walls sit outside on either side
- Wall height = `cutoutHeight` (unchanged from previous behavior if already correct)
- All values in mm — no unit conversion involved
- Existing 28 tests must continue to pass unchanged
