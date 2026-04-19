# Bracket Generator

![Project Screenshot](assets/screenshot.png)

A 3D bracket generator tool built with React, Three.js, and TypeScript. This application allows users to design and visualize custom brackets with various parameters.

## Features

- Interactive 3D bracket visualization
- Configurable bracket parameters (width, height, depth, hole positions)
- Real-time preview of bracket designs
- Export functionality for 3D models (STL/3MF formats)
- Responsive web interface with Tailwind CSS styling

## Technical Stack

- **Frontend**: [React 18](https://react.dev), [TypeScript 5.x](https://www.typescriptlang.org)
- **3D Rendering**: [Three.js](https://threejs.org) with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) and [Drei](https://github.com/pmndrs/drei)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs)
- **Data Validation**: [Zod](https://zod.dev)
- **Build Tool**: [Vite](https://vite.dev)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Testing**: [Vitest](https://vitest.dev)
- **Export**: [JSZip](https://stuk.github.io/jszip) (3MF packaging)

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm package manager

### Installation

Clone the repository and install dependencies:
```bash
pnpm install
```

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
pnpm test
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

1. Adjust the bracket parameters using the control panel
2. View the 3D model in real-time
3. Fine-tune the design by modifying parameters
4. Export your bracket design in STL or 3MF format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- 3D rendering via [Three.js](https://threejs.org) and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- State management via [Zustand](https://zustand-demo.pmnd.rs)
- Schema validation via [Zod](https://zod.dev)
