# Data Model: Rack Profile Parameter for Rail Slot

## Entities

### BracketParams
**Description**: Collection of parameters that define the bracket geometry including the new rail slot parameter.

**Fields**:
- `faceplateWidth`: number (mm) - Width of the faceplate
- `faceplateHeight`: number (mm) - Height of the faceplate 
- `faceplateDepth`: number (mm) - Depth of the faceplate
- `holeDiameter`: number (mm) - Diameter of mounting holes
- `holeInset`: number (mm) - Distance from faceplate edge to hole center
- `holeSpacing`: number (mm) - Distance between hole centers
- `railSlotWidth`: number (mm) - Width of the rail slot (default: 0.25")
- `holePositions`: Array<{y: number (mm)}> - Vertical positions for mounting holes

**Validation Rules**:
- All dimensions must be positive numbers
- `railSlotWidth` must be clamped between 0.125" and 0.75" (3.2mm and 19.1mm)
- `holeDiameter` must be less than `faceplateWidth` and `faceplateHeight`
- `holeInset` must be within faceplate boundaries

**Relationships**:
- Derived from `BracketParams` entity
- Used in `BracketGeometry` and `BracketExport` 
- Connected to `ExportPayload` through bracket dimensions

### BracketGeometry
**Description**: The computed 3D geometry of the bracket including rail slot features

**Fields**:
- `baseGeometry`: Three.js geometry object - Main faceplate geometry
- `slotGeometry`: Three.js geometry objects - Slot features above and below mounting holes
- `holePositions`: Array<{y: number (mm)}> - Vertical positions for mounting holes

**Relationships**:
- Generated from `BracketParams`
- Connected to `BracketExport` through dimensions

### ExportPayload
**Description**: Data structure containing bracket information for export formats (STL/3MF)

**Fields**:
- `geometry`: Three.js geometry object - Combined bracket and slot geometry
- `parameters`: `BracketParams` object - All bracket parameters used to generate the model
- `format`: string - Export format type ("stl" or "3mf")
- `fileName`: string - Name of the exported file

**Relationships**:
- Created from `BracketGeometry`
- Uses `BracketParams` for export configuration

## Data Flow
1. User provides bracket parameters (including new `railSlotWidth`)
2. `BracketParams` are validated using Zod schemas
3. `BracketGeometry` is computed using the `railSlotWidth` parameter
4. `ExportPayload` is created for export operations

## Validation
All data is validated using Zod schemas:
- `BracketParams` schema ensures all parameters are valid
- `railSlotWidth` is automatically clamped to [0.125", 0.75"] range
- Geometry calculations are validated against physical constraints