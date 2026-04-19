# Quickstart: Rack Profile Parameter for Rail Slot

## Overview

This feature extends the bracket generator application to include a configurable rail slot parameter that creates proper slot geometry above and below each mounting hole on the backside of the faceplate.

## Getting Started

### Prerequisites
- Node.js v18+ installed
- pnpm package manager
- Basic understanding of rack mounting systems and rail profile dimensions

### Installation
1. Clone the repository:
```bash
git clone https://github.com/jesseflorig/bracket-generator.git
```

2. Navigate to project directory:
```bash
cd bracket-generator
```

3. Install dependencies:
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

## Using the Feature

### Configuration Parameters

The application now supports a new `railSlotWidth` parameter:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| railSlotWidth | number (mm) | 0.25" (6.35mm) | Width of the rail slot for mounting compatibility |

### User Interface

1. In the control panel, locate the "Rail Slot Width" parameter
2. Adjust the value to your desired rail profile dimension
3. Observe the real-time update of slot geometry in the 3D visualization
4. The slots will automatically appear above and below each mounting hole

### Key Data Model

The bracket parameters are defined in `src/models/bracketSchema.ts`:
- `BracketParams` includes the new `railSlotWidth` field
- Zod validation ensures all parameters are valid
- Default value is set to 0.25" (6.35mm)

## Implementation Details

### Architecture

The implementation follows the established project patterns:
- Parameters are stored in Zustand state (`src/store/bracketStore.ts`)
- Geometry is computed in the geometry layer (`src/geometry/bracket.ts`)
- Validation is handled through Zod schemas (`src/models/bracketSchema.ts`)
- UI components are implemented in `src/components/BracketViewer.tsx`

### Slot Geometry Generation

1. For each mounting hole position, two slot geometries are created:
   - One above the faceplate at the hole position
   - One below the faceplate at the hole position
2. Slot width is calculated as hole diameter minus 0.01mm for proper fit
3. Slot depth is fixed at 0.08" (2.03mm) as specified

### Validation

The system implements automatic clamping for invalid values:
- Value clamped between 0.125" (3.2mm) and 0.75" (19.1mm)
- User input is validated against physical constraints
- Backward compatibility is maintained for existing brackets

## Export Functionality

Generated brackets can be exported in STL or 3MF formats:
- The slot geometry is preserved in exports
- All bracket parameters are included in export metadata
- Exported models are ready for 3D printing or manufacturing

## File Structure

### Core Files
- `src/components/BracketViewer.tsx` - UI component for 3D visualization
- `src/geometry/bracket.ts` - Geometry generation logic with rail slot support
- `src/models/bracketSchema.ts` - Zod validation schemas
- `src/store/bracketStore.ts` - Zustand state management

### Documentation
- `specs/006-rail-slot-profile/` - Feature-specific documentation:
  - `plan.md` - Implementation plan
  - `research.md` - Research findings
  - `data-model.md` - Data model specification
  - `quickstart.md` - Quickstart guide