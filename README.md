# Bracket Generator

![Project Screenshot](assets/screenshot.png)

A browser-based 3D bracket generator for designing rack-mount shelf brackets and exporting slicer-ready models.

## Features

- Interactive Three.js preview with orbit, zoom, pan, and reset controls
- Manifold-based bracket geometry for clean solid models
- Rack profiles with editable rack width, rail width, mounting holes, rail slot width, faceplate depth, and corner radius
- Unit toggle for millimeters and inches
- Configurable faceplate height, cutout size, shelf depth, and shelf wall thickness
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
- npm

### Installation

Clone the repository and install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Create a production build:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm test -- --run
```

Run TypeScript checks:
```bash
npm run typecheck
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
2. Set the faceplate, cutout, shelf, and hex mesh parameters in the side panel.
3. Use the shelf readouts to compare shelf width against rack width.
4. Inspect the model in the 3D viewer.
5. Export the final bracket as STL or 3MF.

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
