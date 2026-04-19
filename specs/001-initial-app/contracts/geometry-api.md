# Contract: Geometry API

**Module**: `src/geometry/bracket.ts`
**Consumer**: `src/store/bracketStore.ts` (via hook)

---

## buildBracket

```typescript
function buildBracket(params: BracketParams): THREE.BufferGeometry
```

**Preconditions**: `params` has passed all validation rules in `BracketParams`
schema. This function MUST NOT validate — it assumes valid input.

**Postconditions**:
- Returns a non-indexed `BufferGeometry` with position and normal attributes.
- All coordinates in mm.
- Geometry is centered on the XZ plane with the bottom face at Y=0.
- For `bracketType: 'L'`: vertical leg along +Y, horizontal arm along +Z.
- For `bracketType: 'U'`: two vertical legs along +Y flanking a horizontal bridge.
- Holes are along the X axis through the vertical leg(s).

**Side effects**: None. Pure function.

---

## Contract: Unit Conversion

**Module**: `src/units/convert.ts`

```typescript
function toMm(value: number, from: UnitSystem): number
function fromMm(value: number, to: UnitSystem): number
function formatDisplay(valueMm: number, unit: UnitSystem, decimals?: number): string
```

- `toMm('in')`: `value × 25.4`
- `fromMm('in')`: `value / 25.4`
- `formatDisplay`: returns `"50.00 mm"` or `"1.97 in"` (default 2 decimal places)
- No rounding is applied inside the store — only in `formatDisplay` for UI.

---

## Contract: Export Functions

**Module**: `src/export/exportStl.ts`

```typescript
function exportStl(payload: ExportPayload): void
```

- Triggers browser download of `<filename>.stl` (binary STL, mm).
- Uses Three.js `STLExporter` from `three/examples/jsm/exporters/STLExporter`.

**Module**: `src/export/export3mf.ts`

```typescript
function export3mf(payload: ExportPayload): Promise<void>
```

- Triggers browser download of `<filename>.3mf`.
- 3MF root model element MUST declare `unit="millimeter"`.
- Async because JSZip generation is async.
- The 3MF file MUST validate against the 3MF Core Specification 1.x:
  - `[Content_Types].xml` with correct MIME types
  - `_rels/.rels` pointing to the model
  - `3D/3dmodel.model` with vertex list and triangle list
