# Data Model

## Entities

### BracketParams
Represents the configuration parameters for a bracket design.

**Fields:**
- `rackWidth`: number (50.8 to 609.6 mm) - Width of the rack section
- `railWidth`: number (6.35 to 50.8 mm) - Width of the rail sections
- `faceplateHeight`: number (25.4 to 127.0 mm) - Height of the faceplate
- `faceplateDepth`: number (1.5875 to 6.35 mm) - Depth of the faceplate
- `cornerRadius`: number (0 to 63.5 mm) - Radius for rounded corners
- `shelfWallThickness`: number (1.0 to 6.35 mm) - Thickness of shelf walls
- `cutoutWidth`: number (0 to 500 mm) - Width of cutout opening for shelf
- `cutoutHeight`: number (0 to 200 mm) - Height of cutout opening for shelf
- `shelfDepth`: number (0 to 304.8 mm) - Depth of shelf structure
- `holeDiameter`: number (2.0 to 25.4 mm) - Diameter of mounting holes
- `holeInset`: number (1.0 to 100.0 mm) - Distance from edge to hole center
- `holeEdgeOffset`: number (1.0 to 63.5 mm) - Distance from top/bottom to first hole

### ExportPayload
Data structure for exporting bracket geometry.

**Fields:**
- `geometry`: THREE.BufferGeometry - The 3D geometry to export
- `params`: BracketParams - The parameters used to generate the geometry
- `filename`: string - Name of the exported file

## Relationships

- `BracketParams` is the core entity that defines how a bracket is built
- `ExportPayload` contains a `BracketParams` object and the corresponding 3D `geometry`
- `BracketParams` is managed by `useBracketStore` in the application state
- `buildBracket` function takes `BracketParams` and returns `THREE.BufferGeometry`
- `ExportPayload` is consumed by export functions in `src/export/` directory

## Derived Values

Several computed values are derived from the base parameters:
- `faceplateWidth`: rackWidth + 2 * railWidth
- `shelfMaxWidth`: rackWidth - 2 * shelfWallThickness
- `holeCount`: floor(faceplateHeight / 25.4)
- `holePositions`: calculated positions based on holeCount and faceplateHeight

## Validation Rules

The `bracketParamsSchema` includes the following validation:
- Corner radius cannot be larger than half the faceplate dimensions
- Shelf wall thickness cannot exceed half the rack width
- Cutout dimensions cannot exceed available space in the faceplate
- Hole dimensions and positioning must be valid
- Mounting holes cannot overlap the cutout opening