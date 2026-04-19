# Quickstart Guide

## Prerequisites

- Node.js v18+
- pnpm package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bracket-generator
```

2. Install dependencies:
```bash
pnpm install
```

## Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Building

Create a production build:
```bash
pnpm build
```

## Testing

Run tests:
```bash
pnpm test
```

## Feature Usage

1. Adjust bracket parameters using the control panel:
   - Rack width, rail width, faceplate dimensions
   - Shelf cutout size and depth
   - Mounting hole parameters

2. View the 3D model in real-time as you adjust parameters

3. Fine-tune your design by modifying parameters

4. Export your bracket design in STL or 3MF format using the export buttons

## Data Model

The application uses a `BracketParams` data model that defines all configurable aspects of the bracket:
- Physical dimensions in millimeters
- Geometry parameters
- Mounting hole specifications
- Shelf configuration

All parameters are validated using Zod schemas to ensure valid configurations.

## Key Files

- `src/models/bracketParams.ts`: Defines the `BracketParams` schema and default values
- `src/store/bracketStore.ts`: Manages the application state using Zustand
- `src/geometry/bracket.ts`: Contains the logic for building 3D bracket geometry
- `src/export/`: Contains export functionality for STL and 3MF formats