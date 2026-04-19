# Quickstart: Bracket Data Model Redesign

**Branch**: `002-bracket-data-model`

## Dev Setup

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm typecheck    # tsc --noEmit (run before committing)
pnpm test         # vitest
pnpm build        # production build
```

## Key Files for This Feature

| File | Role |
|------|------|
| `src/models/bracketParams.ts` | Zod schema, DEFAULT_PARAMS, derived-value functions |
| `src/geometry/bracket.ts` | Geometry builder (buildBracket, holePositions) |
| `src/geometry/bracket.test.ts` | Unit tests — run `pnpm test` to verify |
| `src/store/bracketStore.ts` | Zustand store — update DEFAULT_PARAMS import only |
| `src/components/DimensionPanel.tsx` | UI controls — replace all sliders |
| `src/components/BracketViewer.tsx` | 3D viewer — update camera param references |
| `src/components/ExportBar.tsx` | Export buttons — update filename construction |

## Recommended Implementation Order

1. `src/models/bracketParams.ts` — new schema first; everything else depends on it
2. `src/geometry/bracket.ts` — new geometry builder + derived functions
3. `src/geometry/bracket.test.ts` — verify geometry before touching UI
4. `src/store/bracketStore.ts` — trivial update (just re-exports DEFAULT_PARAMS)
5. `src/components/DimensionPanel.tsx` — new control layout
6. `src/components/BracketViewer.tsx` + `ExportBar.tsx` — param reference updates

## Validation Approach

The Zod schema in `bracketParams.ts` is the single source of truth for constraints. `DimensionPanel` calls `bracketParamsSchema.safeParse` on every change (as now) and shows errors inline. No validation logic anywhere else.

## Derived Values

Never call these inside the Zod schema (circular dependency risk) — call them from the geometry builder or viewer after the schema validates:

```typescript
import { faceplateWidth, shelfMaxWidth, holeCount, holePositions } from '../geometry/bracket';
```

These are pure functions of `BracketParams` — no side effects, safe to call from `useMemo`.
