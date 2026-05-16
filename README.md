# Bracket Generator

![Project Screenshot](assets/screenshot.png)

A browser-based 3D bracket generator for designing rack-mount shelf brackets and exporting slicer-ready models.

## Features

- Interactive Three.js preview with orbit, zoom, pan, and Space-triggered view toggle
- Manifold-based bracket geometry for clean solid models
- Rack profiles with editable rack width, rail width, mounting holes, rail slot width, faceplate depth, and corner radius
- Unit toggle for millimeters and inches
- Configurable faceplate height, cutout size, shelf depth, and shelf wall thickness
- Dual generation modes: **Shelf** (for holding devices) and **Keystone** (for patch panel cutouts)
- **Keystone Mode**: Configurable 1-24 standard 14.8 x 16.2mm cutouts with automatic spacing, 10mm stepped jack sleeves, 1mm rear sleeve extensions, and sleeve relief cutouts
- Optional CM5-PoE-BASE-A shelf in Keystone mode with a 165mm x 165mm tray, 2mm floor, and default hex-mesh 20mm side walls
- Shelf width readouts for rack width, shelf width, and width budget
- Optional hex mesh cutouts on shelf side walls and floor panel
- STL and 3MF export for slicers

## Technical Stack

- **Frontend**: [React 18](https://react.dev), [TypeScript 5.x](https://www.typescriptlang.org)
- **3D Rendering**: [Three.js](https://threejs.org) with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) and [Drei](https://github.com/pmndrs/drei)
- **Solid Geometry**: [manifold-3d](https://github.com/elalish/manifold)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs)
- **Data Validation**: [Zod](https://zod.dev)
- **Build Tool**: [Vite](https://vite.dev)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Testing**: [Vitest](https://vitest.dev)
- **Export**: Three.js STL exporter and [JSZip](https://stuk.github.io/jszip) for 3MF packaging

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm

### Installation

Clone the repository and install dependencies:
```bash
pnpm install
```

The project scripts also work with npm, but the repository lockfile and local docs use pnpm.

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Building

Create a production build:
```bash
pnpm build
```

### Testing

Run tests:
```bash
pnpm test --run
```

Run TypeScript checks:
```bash
pnpm typecheck
```

## Project Structure

```
src/
├── components/    # React UI components
├── geometry/      # 3D geometry builders
├── models/        # Zod schemas and TypeScript types
├── store/         # Zustand app state
├── units/         # Unit conversion utilities
├── export/        # STL and 3MF serializers
└── pages/         # Top-level views
```

## Usage

1. Choose or edit a rack profile.
2. Select **Shelf** or **Keystone** generation mode.
3. In Shelf mode, set cutout, shelf, and hex mesh parameters, then use the shelf readouts to compare total shelf width against rack width.
4. In Keystone mode, set keystone count, then use the exterior-width readouts to compare jack sleeve width against rack width.
5. Inspect the model in the 3D viewer.
6. Export the final bracket as STL or 3MF.

## Notes

- Export geometry comes from the manifold mesh used by the model builder.
- Browser rendering uses a display-only geometry pass with crease-aware normals so flat CAD faces shade cleanly.
- Rack profiles are stored in browser `localStorage`.
- There is currently no `lint` script in `package.json`.

## Acknowledgments

- 3D rendering via [Three.js](https://threejs.org) and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- Solid geometry via [manifold-3d](https://github.com/elalish/manifold)
- State management via [Zustand](https://zustand-demo.pmnd.rs)
- Schema validation via [Zod](https://zod.dev)
