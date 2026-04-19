# Data Model: Bracket Generator

## BracketParams

The central parameter object. All numeric fields are stored and validated in
**millimeters**. Display conversion happens only at the UI layer.

```typescript
interface BracketParams {
  // Overall envelope
  width: number;          // mm — horizontal span of the bracket
  height: number;         // mm — vertical span (depth of the rack-mount leg)
  depth: number;          // mm — front-to-back depth of the horizontal arm

  // Wall thickness
  thickness: number;      // mm — material thickness (all walls uniform)

  // Mounting holes (vertical leg)
  holeCount: number;      // integer — number of mounting holes, 0–8
  holeDiameter: number;   // mm — diameter of each mounting hole
  holeSpacing: number;    // mm — center-to-center distance between holes
  holeInset: number;      // mm — distance from edge to first hole center

  // Shape variant
  bracketType: 'L' | 'U'; // L = single right-angle, U = two legs + bridge
}
```

### Validation Rules (enforced in mm before geometry)

| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| `width` | 10 | 500 | — |
| `height` | 10 | 500 | — |
| `depth` | 10 | 300 | — |
| `thickness` | 1 | 20 | Must be < min(width, height, depth) / 2 |
| `holeCount` | 0 | 8 | 0 = no holes |
| `holeDiameter` | 2 | 20 | Must be < thickness × 0.8 guard removed — holes go through |
| `holeSpacing` | 5 | — | Must fit all holes within height − 2×holeInset |
| `holeInset` | 3 | — | Must be > holeDiameter / 2 |

Cross-field invariants:
- `holeInset + (holeCount − 1) × holeSpacing + holeInset ≤ height`
- `holeDiameter < width − 2 × thickness` (holes fit within leg width)
- For `bracketType: 'U'`: `depth > 2 × thickness`

---

## UnitSystem

```typescript
type UnitSystem = 'mm' | 'in';
```

Controls display only. The store always holds mm values. Conversion:
- `mm → in`: `value / 25.4`
- `in → mm`: `value × 25.4`

---

## AppState (Zustand store shape)

```typescript
interface AppState {
  params: BracketParams;
  unitSystem: UnitSystem;

  // Actions
  setParam: <K extends keyof BracketParams>(key: K, value: BracketParams[K]) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  resetToDefaults: () => void;
}
```

---

## Default Values

```typescript
const DEFAULT_PARAMS: BracketParams = {
  width: 50,          // mm
  height: 80,         // mm
  depth: 30,          // mm
  thickness: 3,       // mm
  holeCount: 4,
  holeDiameter: 5,    // mm
  holeSpacing: 15,    // mm
  holeInset: 10,      // mm
  bracketType: 'L',
};
```

---

## ExportPayload

Passed from the store/viewer into the export functions:

```typescript
interface ExportPayload {
  geometry: THREE.BufferGeometry;  // mm-unit geometry
  params: BracketParams;           // metadata embedded in 3MF
  filename: string;                // e.g. "bracket-50x80x30"
}
```

---

## File Locations

| Artifact | Path |
|----------|------|
| BracketParams schema + validation | `src/models/bracketParams.ts` |
| UnitSystem type + conversion fns | `src/units/convert.ts` |
| AppState store | `src/store/bracketStore.ts` |
| Geometry builder | `src/geometry/bracket.ts` |
| STL exporter | `src/export/exportStl.ts` |
| 3MF exporter | `src/export/export3mf.ts` |
