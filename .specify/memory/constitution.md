<!--
## Sync Impact Report

**Version change**: 1.0.0 → 1.1.0
**Type**: MINOR — new principle added (VI. Unit System)

### Principles Added
- VI. Unit System (new)

### Principles Modified
- None

### Sections Modified
- Governance: Constitution Check reference updated from I–V to I–VI

### Removed
- Nothing

### Templates Status
- `.specify/templates/plan-template.md` ✅ compatible — Constitution Check gate references principles generically
- `.specify/templates/spec-template.md` ✅ compatible — no principle-specific references
- `.specify/templates/tasks-template.md` ✅ compatible — no principle-specific references

### Deferred TODOs
- None
-->

# Bracket Generator Constitution

## Core Principles

### I. Component-First Architecture

React components MUST have a single, well-defined responsibility. UI components
MUST be decoupled from 3D geometry logic — no geometry calculations inside render
paths. State that drives the 3D model MUST flow through a single, clearly-owned
store or context. Components MUST be independently renderable and testable in
isolation.

**Rationale**: The UI and the geometry engine are two distinct domains. Mixing
them produces components that are neither testable nor reusable, and makes the
parameter surface brittle as dimensions change.

### II. Parametric Model Integrity

All dimension inputs MUST be validated at the UI boundary before being passed to
the geometry engine. The model parameter schema is the contract — no raw,
unvalidated values may enter the geometry layer. Invalid parameter combinations
MUST surface as user-visible errors, not silent geometry corruption or crashes.
Min/max constraints for every dimension MUST be defined and enforced.

**Rationale**: 3D geometry libraries are unforgiving of out-of-range or logically
inconsistent inputs (negative thickness, width less than flange, etc.). Validation
at the boundary prevents hard-to-debug rendering failures downstream.

### III. Real-Time Preview

The 3D viewer MUST reflect the current parameter state without requiring an
explicit user action (no "Generate" button for basic changes). Throttling or
debouncing is acceptable for performance, but the preview MUST stay synchronized
with the input state. The viewer MUST never display a model that does not match
the current parameters.

**Rationale**: The core value of the app is interactive exploration of bracket
geometry. A stale or decoupled preview defeats this purpose entirely.

### IV. Export Fidelity

Exported files (3MF and STL) MUST be geometrically identical to the model shown
in the viewer at the time of export. Exports MUST use standard, spec-compliant
encodings — no proprietary extensions that break third-party slicer compatibility.
Both export formats MUST be supported from day one; neither is optional.

**Rationale**: The deliverable of this tool is a printable file. Divergence
between preview and export, or format non-compliance, would render the app
unusable for its primary purpose.

### V. Simplicity & YAGNI

Abstractions MUST be introduced only when two or more concrete uses exist. No
design patterns, utility layers, or service classes should be added speculatively.
Complexity MUST be justified in the plan against a simpler alternative that was
explicitly considered and rejected. Three similar lines of code are preferable to
a premature abstraction.

**Rationale**: This is a focused tool. Over-engineering the geometry pipeline or
the UI state model creates maintenance burden without user benefit.

### VI. Unit System

The internal representation of all dimensions MUST be millimeters (mm) at every
layer — geometry engine, parameter store, and export pipeline. Unit conversion
MUST occur exclusively at the UI boundary: inputs convert from the user's chosen
unit to mm on entry; display values convert from mm to the chosen unit on render.
No conversion logic may exist inside `src/geometry/` or `src/export/`.

The UI MUST support both metric (mm) and imperial (inches) display modes,
switchable at runtime. Validation (min/max constraints from Principle II) MUST
be applied in mm, after conversion, not in the display unit.

All exported files (3MF, STL) MUST encode dimensions in millimeters with no
ambiguity — 3MF unit attributes MUST be explicitly set to `millimeter`.

**Rationale**: Slicer software interprets geometry units literally. A file that
silently encodes inches as mm produces a bracket ~25× too large. Keeping a single
internal unit (mm) eliminates an entire class of conversion bugs and makes the
geometry and export layers unit-agnostic by construction.

## Technology Stack

- **Language**: TypeScript (strict mode enabled)
- **UI Framework**: React 18+
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js (or a React wrapper such as React Three Fiber)
- **Geometry / CSG**: A parametric geometry library appropriate for bracket shapes
  (e.g., OpenJSCAD kernel, Three.js BufferGeometry construction, or jscad/modeling)
- **Export – STL**: Binary STL serialization from the live geometry mesh
- **Export – 3MF**: 3MF-compliant XML+ZIP serialization from the live geometry mesh
- **Build**: Vite
- **Package manager**: npm or pnpm (choose one and commit — do not mix)

Technology choices outside this list MUST be justified in the feature plan before
adoption.

## Development Workflow

- All geometry-related logic MUST live in `src/geometry/` and MUST be importable
  without a DOM or browser context (pure functions, no React imports).
- All export logic MUST live in `src/export/` and MUST accept a geometry object,
  not a React component or DOM node.
- Parameter validation MUST live in `src/models/` as typed schemas (Zod or
  equivalent).
- Unit conversion utilities MUST live in `src/units/` — a thin, pure-function
  module. No other module may perform unit conversion.
- UI components live in `src/components/`; pages/views in `src/pages/`.
- No component file may import from `src/geometry/` directly — geometry access
  MUST go through a hook or store that mediates between UI state and the geometry
  layer.
- Features are spec'd, planned, then tasked — no code before a spec exists.

## Governance

This constitution supersedes all other practices, conventions, and prior
agreements on this project. Amendments require:

1. A written rationale explaining what changed and why.
2. A version bump following semantic versioning (MAJOR/MINOR/PATCH as defined
   in the versioning policy).
3. An updated Sync Impact Report prepended to this file.
4. Review of all dependent templates for alignment.

All implementation plans MUST include a Constitution Check section that explicitly
verifies compliance with Principles I–VI before Phase 0 research may begin.
Complexity violations flagged during Constitution Check MUST be justified in the
Complexity Tracking table of the plan — a violation without justification is a
blocker.

**Versioning policy**:
- PATCH — clarifications, wording, non-semantic refinements
- MINOR — new principle or section added, materially expanded guidance
- MAJOR — principle removed, redefined, or governance structure changed

**Version**: 1.1.0 | **Ratified**: 2026-04-18 | **Last Amended**: 2026-04-18
