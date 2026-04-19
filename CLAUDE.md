# bracket-generator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-18

## Active Technologies

- (001-initial-app) TypeScript 5.x strict, React 18, @react-three/fiber,
  @react-three/drei, three, zustand, jszip, zod, tailwindcss, vite, vitest

## Project Structure

```text
src/
├── components/    # React UI — no geometry imports
├── geometry/      # Pure geometry builders — no React imports
├── models/        # Zod schemas and TypeScript types
├── store/         # Zustand app state
├── units/         # Unit conversion utilities (only place for mm↔in conversion)
├── export/        # STL and 3MF serializers
└── pages/         # Top-level views
```

## Commands

```bash
pnpm dev          # start dev server (localhost:5173)
pnpm build        # production build
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest
```

## Code Style

TypeScript: Follow strict mode conventions. No `any`. Prefer `interface` for
object shapes, `type` for unions/intersections.

## Key Invariants

- All dimension values in the store and geometry layer are **millimeters**.
- Unit conversion occurs **only** in `src/units/convert.ts`.
- `src/geometry/` MUST be importable without a DOM or browser context.
- `src/export/` functions accept geometry objects, not React components.

## Recent Changes

- 001-initial-app: Initial app — full greenfield implementation

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
