# Implementation Plan: Rack Profile Parameter for Rail Slot

**Branch**: `006-rail-slot-profile` | **Date**: 2026-04-19 | **Spec**: [link](../006-rail-slot-profile/spec.md)
**Input**: Feature specification from `/specs/006-rail-slot-profile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature extends the bracket generator to include a configurable rail slot parameter that creates proper slot geometry above and below each mounting hole on the backside of the faceplate. The rail slot parameter defaults to 0.25" and automatically clamps invalid values while maintaining backward compatibility with existing brackets.

## Technical Context

**Language/Version**: TypeScript 5.x strict  
**Primary Dependencies**: React 18, @react-three/fiber, @react-three/drei, Three.js, Zustand, Zod  
**Storage**: None (uses in-memory state and local storage for UI preferences only)  
**Testing**: Vitest  
**Target Platform**: Web browser (React/Three.js application)  
**Project Type**: Web application  
**Performance Goals**: 60 FPS rendering for interactive 3D models, responsive UI interaction  
**Constraints**: All dimension values in millimeters, no DOM context required for geometry layer  
**Scale/Scope**: Single user web application with standard UI browser compatibility  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature aligns with the project's constitution:
- Follows strict TypeScript conventions with no `any`
- Uses interfaces for object shapes, types for unions/intersections
- Maintains the invariant that all dimension values in store and geometry are in millimeters
- Uses Zod for data validation
- Maintains separation between React components (UI) and geometry builders (no React imports in geometry layer)
- Uses localStorage only for UI preferences, not bracket parameters

## Project Structure

### Documentation (this feature)

```text
specs/006-rail-slot-profile/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Option 1: Single project (DEFAULT)
src/
├── components/    # React UI — no geometry imports
├── geometry/      # Pure geometry builders — no React imports
├── models/        # Zod schemas and TypeScript types
├── store/         # Zustand app state
├── units/         # Unit conversion utilities (only place for mm↔in conversion)
├── export/        # STL and 3MF serializers
└── pages/         # Top-level views
```

**Structure Decision**: This feature will extend the existing project structure by:
- Adding the rail slot parameter to the existing bracket parameters in the store
- Modifying the bracket geometry builder in geometry/ to support the new slot feature
- Extending Zod schemas in models/ to validate the new parameter
- Updating the UI component in components/ to display and accept the parameter

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

This implementation does not violate any constitution requirements and maintains the established patterns.
