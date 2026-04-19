# Data Model: Rack Profile Group

**Branch**: `004-rack-profile-group` | **Date**: 2026-04-18

## Schema Changes

**None.** `BracketParams` and `bracketParamsSchema` are unchanged. No new fields, no removed fields, no validation rule changes.

---

## UI State: `rackProfileCollapsed`

This is a **local component state** in `DimensionPanel.tsx`, not stored in Zustand or the params schema.

| Property | Type | Default | Persistence |
|----------|------|---------|-------------|
| `rackCollapsed` | `boolean` | `true` | `localStorage` key: `ui-rack-profile-collapsed` |

### State transitions

```
Initial load (no saved value) → rackCollapsed = true  (collapsed by default)
Initial load (saved 'true')   → rackCollapsed = true
Initial load (saved 'false')  → rackCollapsed = false
User clicks header            → rackCollapsed = !rackCollapsed → persisted to localStorage
```

### Persistence contract

- Key: `'ui-rack-profile-collapsed'`
- Values written: `'true'` | `'false'`
- Read: on component mount (lazy `useState` initializer)
- Written: on every toggle via `useEffect([rackCollapsed])`

---

## UI Structure Change: `DimensionPanel.tsx`

### Before

```
Units
Rack
  ├── Rack Width (slider)
  ├── Rail Width (slider)
  └── Faceplate Width (derived, read-only)
Faceplate
  ├── Height (slider)
  ├── Depth (slider)
  └── Corner Radius (slider)
Mounting Holes
  ├── Count per side (derived, read-only)
  ├── Diameter (slider)
  ├── Side Inset (slider)
  └── Edge Offset (slider)
Cutout
  ├── Width (slider)
  └── Height (slider)
Shelf
  ├── Depth (slider)
  ├── Wall Thickness (slider)
  └── Max Inner Width (derived, read-only)
```

### After

```
Units
Rack Profile [▸/▾ toggle header]
  ├── Faceplate Width (derived, read-only) — ALWAYS VISIBLE, outside collapsed body
  └── [collapsible body — hidden when rackCollapsed=true]
      ├── Rack Width (slider)
      ├── Rail Width (slider)
      ├── ── (separator implied by label)
      ├── Count per side (derived, read-only)
      ├── Diameter (slider)
      ├── Side Inset (slider)
      └── Edge Offset (slider)
Faceplate
  ├── Height (slider)
  ├── Depth (slider)
  └── Corner Radius (slider)
Cutout
  ├── Width (slider)
  └── Height (slider)
Shelf
  ├── Depth (slider)
  ├── Wall Thickness (slider)
  └── Max Inner Width (derived, read-only)
```

**Note**: The "Rack" and "Mounting Holes" section labels are retired; they merge into the single "Rack Profile" group header.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/DimensionPanel.tsx` | Add collapsible Rack Profile group, `useState`+`useEffect` for persistence |

**All other files unchanged.** No schema, store, geometry, export, or page modifications needed.
