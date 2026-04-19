# Tasks: Rack Profile Group

**Input**: Design documents from `/specs/004-rack-profile-group/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Scope**: Single component change in `src/components/DimensionPanel.tsx`. No schema, store, geometry, or export modifications.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

No project structure or dependency changes required.

*(No tasks)*

---

## Phase 2: Foundational

No schema, store, or infrastructure changes required. `DimensionPanel.tsx` is self-contained for this feature.

*(No tasks)*

---

## Phase 3: User Story 1 — Collapse Rack Profile to Reduce Visual Clutter (Priority: P1) 🎯 MVP

**Goal**: Merge the "Rack" and "Mounting Holes" sections into a single "Rack Profile" collapsible group with a toggle header. Faceplate Width derived field remains visible at all times above the collapsible body.

**Independent Test**: Open the app, click the "Rack Profile" header — the rack width, rail width, hole diameter, inset, and edge offset controls should disappear. Click again — they reappear. Faceplate Width remains visible throughout. All other controls (Faceplate, Cutout, Shelf) remain visible and fully interactive.

### Implementation for User Story 1

- [x] T001 [US1] Add `rackCollapsed` state (default `true`) to `DimensionPanel` component in `src/components/DimensionPanel.tsx` using `useState<boolean>` with a lazy initializer that reads `localStorage.getItem('ui-rack-profile-collapsed')` (returns `true` if null or `'true'`, `false` if `'false'`)
- [x] T002 [US1] Replace the "Rack" and "Mounting Holes" `<div>` sections in `src/components/DimensionPanel.tsx` with a single "Rack Profile" group that has a clickable header button toggling `rackCollapsed`
- [x] T003 [US1] Add a chevron indicator to the Rack Profile header in `src/components/DimensionPanel.tsx` — rotated right (▸) when collapsed, down (▾) when expanded — using a CSS `transform` on an inline SVG or a `▾`/`▸` character
- [x] T004 [US1] Place the Faceplate Width `<ReadOnlyField>` outside the collapsible body in `src/components/DimensionPanel.tsx`, directly below the group header, so it remains visible when the group is collapsed
- [x] T005 [US1] Wrap all five editable rack/hole controls (Rack Width, Rail Width, Hole Diameter, Side Inset, Edge Offset) and the hole Count derived display in the collapsible body in `src/components/DimensionPanel.tsx` — hidden via `{!rackCollapsed && <...>}` or conditional rendering

**Checkpoint**: Clicking the Rack Profile header toggles visibility of 5 sliders + hole count. Faceplate Width remains visible. All other settings unaffected.

---

## Phase 4: User Story 2 — Rack Profile Group Remembers Its State (Priority: P2)

**Goal**: Persist the `rackCollapsed` boolean to `localStorage` so the group restores its last state on page refresh. Default to collapsed on first load.

**Independent Test**: Collapse the group, refresh the page — the group is still collapsed. Expand it, refresh — it's still expanded. Open in a fresh browser tab (no saved state) — it starts collapsed.

### Implementation for User Story 2

- [x] T006 [US2] Add a `useEffect` in `src/components/DimensionPanel.tsx` that writes `String(rackCollapsed)` to `localStorage.setItem('ui-rack-profile-collapsed', ...)` whenever `rackCollapsed` changes — dependency array: `[rackCollapsed]`
- [x] T007 [US2] Verify the lazy `useState` initializer from T001 correctly reads and applies the saved value on mount — confirm default `true` when no value is saved

**Checkpoint**: Collapse state survives page refresh in both directions. First-load default is collapsed.

---

## Phase 5: Polish & Verification

- [x] T008 Run `pnpm typecheck` and resolve any TypeScript errors in `src/components/DimensionPanel.tsx`
- [x] T009 Start `pnpm dev` and manually verify: (1) group collapses/expands on click, (2) chevron rotates correctly, (3) Faceplate Width stays visible when collapsed, (4) all other sections unaffected, (5) collapsed state persists on refresh

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 3 (US1)**: No prior phases — start immediately
- **Phase 4 (US2)**: T006 and T007 depend on T001 being complete (same state variable); otherwise independent of T002–T005
- **Phase 5 (Polish)**: Depends on all implementation tasks

### Within Each User Story

- T001 first — state variable must exist before it can be rendered (T002–T005) or persisted (T006)
- T002 before T003, T004, T005 — group structure must exist before adding details
- T006 after T001 — uses same `rackCollapsed` variable
- T007 is a verification step — confirm T001's lazy initializer is correct

### Parallel Opportunities

- T003, T004, T005 can overlap once T002 establishes the group structure (all edits to the same file, so coordinate carefully — implement sequentially)
- T008 and T009 are sequential (typecheck before manual test)

---

## Implementation Strategy

### MVP (US1 — collapsible group, no persistence)

1. Complete T001–T005 in order
2. Verify: click toggle → controls hide/show; Faceplate Width always visible
3. Ship as MVP if persistence (US2) can wait

### Full Delivery (US1 + US2)

1. T001 (state) → T002 (group structure) → T003 (chevron) → T004 (Faceplate Width outside) → T005 (collapsible body)
2. T006 (persist) → T007 (verify initializer)
3. T008 (typecheck) → T009 (manual smoke test)

---

## Notes

- All edits are in one file (`DimensionPanel.tsx`) — tasks are sequential, not parallel
- `localStorage` key: `'ui-rack-profile-collapsed'`; values: `'true'` | `'false'`
- The hole count display (`{count} (derived)`) moves into the collapsible body alongside the hole sliders
- The existing `ReadOnlyField` component handles Faceplate Width display — no new components needed
- Existing Faceplate, Cutout, and Shelf sections are untouched
