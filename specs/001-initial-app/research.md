# Research: Initial App — Bracket Generator

## Decision 1: 3D Rendering Library

**Decision**: React Three Fiber (R3F) — `@react-three/fiber` + `@react-three/drei`

**Rationale**: R3F is the community standard for Three.js in React. For a
parametric viewer, the pattern is clean: `useMemo` recomputes a `BufferGeometry`
when parameters change, and R3F handles mount/unmount/disposal. Overhead vs raw
Three.js is negligible for a single-model viewer.

**Alternatives considered**:
- Raw Three.js + `useRef`/`useEffect`: More boilerplate, no meaningful performance
  gain for this use case. Rejected.
- Babylon.js: Heavier, less React-idiomatic. Rejected.

---

## Decision 2: Parametric Geometry

**Decision**: Manual Three.js `BufferGeometry` construction — procedurally
computed vertex and index buffers in `src/geometry/bracket.ts`.

**Rationale**: A server bracket is a constrained shape (two rectangular prisms
forming an L or U, with cylindrical holes punched through). This geometry does
not require a full CSG engine. The vertex math is straightforward: define
rectangular faces for each arm of the bracket, subtract holes by generating
cylinder facets and removing covered geometry. A procedural approach keeps the
bundle small, eliminates the JSCAD serialization layer, and allows direct
assignment to `BufferGeometry.setAttribute()` with no intermediate format.

The geometry function signature is: `buildBracket(params: BracketParams): BufferGeometry`.

**Alternatives considered**:
- `@jscad/modeling` v2: Has a clean API for CSG, but designed for export
  pipelines rather than interactive browser rendering. The polygon-soup → Three.js
  conversion step adds complexity without benefit for this geometry. Rejected.
- `three-bvh-csg`: More mature than JSCAD for Three.js, but still overhead for
  geometry this simple. Rejected.

---

## Decision 3: 3MF Export

**Decision**: Custom serializer in `src/export/export3mf.ts` using manual XML
string construction + `jszip` for packaging.

**Rationale**: Three.js core and `three-stdlib` do not include a 3MFExporter.
A minimal valid 3MF file is well-defined (~3 required files) and writing a
serializer from `BufferGeometry` (positions + index buffer) is ~100 lines.
This keeps the dependency light and gives full control over the `unit="millimeter"`
declaration (critical for slicer correctness).

**Minimum 3MF structure required**:
```
[Content_Types].xml
_rels/.rels
3D/3dmodel.model   ← <model unit="millimeter"> with <mesh> vertices + triangles
```

**Alternatives considered**:
- Finding a pre-built JS 3MF exporter: None maintained for browser use. Rejected.
- Reusing Three.js OBJ/PLY exporters and converting: Non-standard, slicer support
  varies. Rejected.

---

## Decision 4: STL Export

**Decision**: Three.js built-in `STLExporter` from `three/examples/jsm/exporters/STLExporter`.

**Rationale**: Ships with Three.js, handles `BufferGeometry` directly, outputs
binary STL. No additional dependencies needed. Internal geometry is in mm, so
output is automatically correct.

---

## Decision 5: State Management

**Decision**: Zustand for the parameter store.

**Rationale**: Parameters (dimensions + active unit system) are shared between
the slider UI, the 3D viewer, and the export button. A lightweight global store
avoids prop drilling without the ceremony of React Context + useReducer. Zustand
is well-typed in TypeScript and integrates cleanly with R3F's render loop.

**Alternatives considered**:
- React Context: Fine for simple cases, but causes full subtree re-renders on
  every slider tick. Rejected for performance.
- Jotai/Recoil: Viable, but Zustand has the broadest adoption and simplest API
  for this use case.

---

## Decision 6: Unit Conversion

**Decision**: Pure conversion functions in `src/units/convert.ts`. No library.

**Rationale**: Only two conversions are needed: `mm → inches` (divide by 25.4)
and `inches → mm` (multiply by 25.4). A dedicated micro-library would add
complexity without benefit. Validation always operates on mm values after
conversion from display units.

---

## Decision 7: Build & Tooling

**Decision**: Vite + TypeScript strict mode + Tailwind CSS v3.

**Rationale**: Specified in the constitution. Vite's ESM-first build handles
`@jscad/modeling`'s ESM exports correctly without config hacks.

**Package manager**: pnpm (faster installs, strict `node_modules` layout).
