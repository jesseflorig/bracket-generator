# Research: Rack Profile Group

**Branch**: `004-rack-profile-group` | **Date**: 2026-04-18

## Decision 1: UI Preference Persistence Strategy

**Decision**: Use `useState` + `useEffect` with `localStorage` directly in `DimensionPanel.tsx`. No new store, no new hook file, no new dependency.

**Implementation**:
```ts
const [rackCollapsed, setRackCollapsed] = useState<boolean>(() => {
  const saved = localStorage.getItem('ui-rack-profile-collapsed');
  return saved !== null ? saved === 'true' : true; // default: collapsed
});

useEffect(() => {
  localStorage.setItem('ui-rack-profile-collapsed', String(rackCollapsed));
}, [rackCollapsed]);
```

**Rationale**: This is the minimum code needed to satisfy FR-005, FR-006, and FR-007. The state is purely local to the component — no other component or layer reads it. A dedicated store (Zustand persist) or shared hook adds abstraction without a second consumer to justify it (Constitution V).

**Alternatives considered**:
- **Zustand `persist` middleware on `bracketStore`**: Rejected — mixes UI state with model params, violates the constitution's separation of concerns (geometry store ≠ UI preferences).
- **New `uiPrefsStore.ts` with Zustand persist**: Rejected — a second Zustand store for a single boolean that is consumed by exactly one component is premature abstraction. If more UI preferences are added later, this can be extracted then.
- **Custom `useLocalStorage` hook in `src/hooks/`**: Rejected — only one call site, so the abstraction has no leverage yet (Constitution V: "Abstractions MUST be introduced only when two or more concrete uses exist").

---

## Decision 2: Collapsed Section Contents

**Decision**: The Rack Profile collapsible group wraps the following settings:
- Rack Width, Rail Width (currently "Rack" section)
- Hole Diameter, Side Inset, Edge Offset, Count derived display (currently "Mounting Holes" section)

The "Faceplate Width" derived read-only field is moved **outside** the collapsible body and displayed directly below the group header at all times (per FR-004 and the spec's assumption that derived rack-dependent values remain visible).

"Max Inner Width" (shelf max width) stays in the Shelf section unchanged.

**Rationale**: Faceplate Width is live geometry feedback that the designer needs while adjusting faceplate and cutout settings — hiding it with the rack inputs would break that feedback loop. The hole count display follows the hole parameters into the group since it's only meaningful in context of those settings.

---

## Decision 3: Chevron Direction Convention

**Decision**: Chevron points **down (▾)** when expanded, **right (▸)** when collapsed — the standard HTML `<details>/<summary>` convention. Implemented with a simple inline SVG or a unicode character in the group header.

**Rationale**: Down = open, right = there's more — universally understood in sidebar UIs. No library needed; a rotated CSS `transform` on an SVG arrow is sufficient.

---

## No External Research Required

All decisions are derivable from existing project patterns and YAGNI constraints. No new dependencies, libraries, or external patterns needed.
