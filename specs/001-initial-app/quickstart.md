# Quickstart: Bracket Generator

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

## Setup

```bash
pnpm install
pnpm dev
```

App runs at `http://localhost:5173`.

## Project Structure

```
src/
├── components/       # React UI components (sliders, inputs, export buttons)
├── geometry/         # Pure geometry builders — no React imports
│   └── bracket.ts   # buildBracket(params) → BufferGeometry
├── models/           # Zod schemas and TypeScript types
│   └── bracketParams.ts
├── store/            # Zustand app state
│   └── bracketStore.ts
├── units/            # Unit conversion utilities
│   └── convert.ts
├── export/           # File serializers
│   ├── exportStl.ts
│   └── export3mf.ts
├── pages/            # Top-level views
│   └── BracketPage.tsx
└── main.tsx
```

## Key Invariants

1. All values in the store and geometry layer are **mm**.
2. Unit conversion occurs **only** in `src/units/convert.ts`, consumed by UI
   components via the store's `unitSystem` field.
3. `buildBracket` is a pure function — call it from a `useMemo` keyed on params.
4. Export functions trigger a browser download directly — no return value to handle.

## Validation

```bash
pnpm typecheck   # tsc --noEmit
pnpm build       # production build
```

## Acceptance Smoke Test

1. Open the app, observe the 3D bracket rendered in the viewer.
2. Move any slider — the viewer updates without a page reload.
3. Switch unit toggle between mm and in — all inputs relabel and reformat.
4. Click "Export STL" — a `.stl` file downloads; open in a slicer, dimensions
   match the mm values shown in the UI.
5. Click "Export 3MF" — a `.3mf` file downloads; open in a slicer, dimensions
   match. Verify slicer reports unit as mm.
