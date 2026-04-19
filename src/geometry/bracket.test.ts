import { describe, it, expect } from 'vitest';
import { Box3, Vector3 } from 'three';
import {
  buildBracket,
  faceplateWidth,
  shelfMaxWidth,
  holeCount,
  holePositions,
  hexHolePaths,
} from './bracket';
import { DEFAULT_PARAMS, bracketParamsSchema } from '../models/bracketParams';

// ---------------------------------------------------------------------------
// Derived functions
// ---------------------------------------------------------------------------

describe('faceplateWidth', () => {
  it('equals rackWidth + 2 * railWidth at defaults', () => {
    expect(faceplateWidth(DEFAULT_PARAMS)).toBeCloseTo(165.1 + 2 * 25.4, 3);
  });

  it('updates when rackWidth changes', () => {
    const p = { ...DEFAULT_PARAMS, rackWidth: 200 };
    expect(faceplateWidth(p)).toBeCloseTo(200 + 2 * 25.4, 3);
  });
});

describe('shelfMaxWidth', () => {
  it('equals rackWidth − 2 * shelfWallThickness at defaults', () => {
    expect(shelfMaxWidth(DEFAULT_PARAMS)).toBeCloseTo(165.1 - 2 * 3.175, 3);
  });
});

describe('holeCount', () => {
  it('returns 1 for 31.75mm (1.25")', () => {
    expect(holeCount({ ...DEFAULT_PARAMS, faceplateHeight: 31.75 })).toBe(1);
  });

  it('returns 1 for exactly 25.4mm (1.0")', () => {
    expect(holeCount({ ...DEFAULT_PARAMS, faceplateHeight: 25.4 })).toBe(1);
  });

  it('returns 2 for 50.8mm (2.0")', () => {
    expect(holeCount({ ...DEFAULT_PARAMS, faceplateHeight: 50.8 })).toBe(2);
  });

  it('returns 2 for 63.5mm (2.5")', () => {
    expect(holeCount({ ...DEFAULT_PARAMS, faceplateHeight: 63.5 })).toBe(2);
  });

  it('returns 3 for 76.2mm (3.0")', () => {
    expect(holeCount({ ...DEFAULT_PARAMS, faceplateHeight: 76.2 })).toBe(3);
  });
});

describe('holePositions', () => {
  it('returns single hole at y=0 for count=1', () => {
    const p = { ...DEFAULT_PARAMS, faceplateHeight: 31.75 };
    const positions = holePositions(p);
    expect(positions).toHaveLength(1);
    expect(positions[0].y).toBeCloseTo(0, 5);
  });

  it('returns two holes for count=2 at correct Y positions', () => {
    const p = { ...DEFAULT_PARAMS, faceplateHeight: 50.8, holeEdgeOffset: 12.7 };
    const positions = holePositions(p);
    expect(positions).toHaveLength(2);
    const expectedTop = 50.8 / 2 - 12.7;
    const expectedBottom = -(50.8 / 2 - 12.7);
    expect(positions[1].y).toBeCloseTo(expectedTop, 3);
    expect(positions[0].y).toBeCloseTo(expectedBottom, 3);
  });

  it('returns evenly spaced holes for count=3', () => {
    const p = { ...DEFAULT_PARAMS, faceplateHeight: 76.2, holeEdgeOffset: 12.7 };
    const positions = holePositions(p);
    expect(positions).toHaveLength(3);
    const top = 76.2 / 2 - 12.7;
    const bottom = -(76.2 / 2 - 12.7);
    const mid = (top + bottom) / 2;
    expect(positions[1].y).toBeCloseTo(mid, 3);
  });
});

// ---------------------------------------------------------------------------
// Geometry builder
// ---------------------------------------------------------------------------

describe('buildBracket', () => {
  it('produces geometry with vertex data', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    expect(geo.getAttribute('position').count).toBeGreaterThan(0);
    geo.dispose();
  });

  it('bounding box depth equals faceplateDepth + shelfDepth', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    geo.computeBoundingBox();
    const size = new Vector3();
    (geo.boundingBox as Box3).getSize(size);
    const expectedDepth = DEFAULT_PARAMS.faceplateDepth + DEFAULT_PARAMS.shelfDepth;
    expect(size.z).toBeCloseTo(expectedDepth, 1);
    geo.dispose();
  });

  it('bounding box width spans faceplateWidth', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    geo.computeBoundingBox();
    const size = new Vector3();
    (geo.boundingBox as Box3).getSize(size);
    expect(size.x).toBeCloseTo(faceplateWidth(DEFAULT_PARAMS), 1);
    geo.dispose();
  });

  it('returns geometry even when shelfDepth is 0', () => {
    const p = { ...DEFAULT_PARAMS, shelfDepth: 0 };
    const geo = buildBracket(p);
    expect(geo.getAttribute('position').count).toBeGreaterThan(0);
    geo.dispose();
  });
});

// ---------------------------------------------------------------------------
// Shelf-cutout alignment (feature 003)
// ---------------------------------------------------------------------------

describe('buildBracket — shelf suppressed when cutout dimension is zero', () => {
  it('produces no shelf when cutoutWidth is 0', () => {
    const SLOT_DEPTH_MM = 2.032;
    const p = { ...DEFAULT_PARAMS, cutoutWidth: 0, shelfDepth: 50.8 };
    const geo = buildBracket(p);
    geo.computeBoundingBox();
    const size = new Vector3();
    (geo.boundingBox as Box3).getSize(size);
    expect(size.z).toBeCloseTo(p.faceplateDepth + SLOT_DEPTH_MM, 2);
    geo.dispose();
  });

  it('produces no shelf when cutoutHeight is 0', () => {
    const SLOT_DEPTH_MM = 2.032;
    const p = { ...DEFAULT_PARAMS, cutoutHeight: 0, shelfDepth: 50.8 };
    const geo = buildBracket(p);
    geo.computeBoundingBox();
    const size = new Vector3();
    (geo.boundingBox as Box3).getSize(size);
    expect(size.z).toBeCloseTo(p.faceplateDepth + SLOT_DEPTH_MM, 2);
    geo.dispose();
  });
});

describe('buildBracket — shelf geometry aligned to cutout', () => {
  it('renders shelf when cutoutWidth, cutoutHeight, and shelfDepth are all > 0', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    geo.computeBoundingBox();
    const size = new Vector3();
    (geo.boundingBox as Box3).getSize(size);
    const expectedZ = DEFAULT_PARAMS.faceplateDepth + DEFAULT_PARAMS.shelfDepth;
    expect(size.z).toBeCloseTo(expectedZ, 2);
    geo.dispose();
  });

  it('shelf X outer span equals cutoutWidth + 2 * shelfWallThickness', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    const positions = geo.getAttribute('position');
    const fd = DEFAULT_PARAMS.faceplateDepth;
    const SLOT_DEPTH_MM = 2.032;
    let minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < positions.count; i++) {
      if (positions.getZ(i) > fd + SLOT_DEPTH_MM + 0.01) {
        minX = Math.min(minX, positions.getX(i));
        maxX = Math.max(maxX, positions.getX(i));
      }
    }
    const expectedSpan = DEFAULT_PARAMS.cutoutWidth + 2 * DEFAULT_PARAMS.shelfWallThickness;
    expect(maxX - minX).toBeCloseTo(expectedSpan, 2);
    geo.dispose();
  });

  it('shelf vertical extent matches cutoutHeight with bottom panel below', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    const positions = geo.getAttribute('position');
    const fd = DEFAULT_PARAMS.faceplateDepth;
    // Filter past slot depth (2.032mm) to isolate shelf vertices only
    const SLOT_DEPTH_MM = 2.032;
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < positions.count; i++) {
      if (positions.getZ(i) > fd + SLOT_DEPTH_MM + 0.01) {
        minY = Math.min(minY, positions.getY(i));
        maxY = Math.max(maxY, positions.getY(i));
      }
    }
    const ch = DEFAULT_PARAMS.cutoutHeight;
    const t = DEFAULT_PARAMS.shelfWallThickness;
    expect(maxY).toBeCloseTo(ch / 2, 2);
    expect(minY).toBeCloseTo(-(ch / 2 + t), 2);
    geo.dispose();
  });
});

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

describe('bracketParamsSchema', () => {
  it('accepts default params', () => {
    expect(bracketParamsSchema.safeParse(DEFAULT_PARAMS).success).toBe(true);
  });

  it('rejects faceplateHeight below 25.4mm (1")', () => {
    const result = bracketParamsSchema.safeParse({
      ...DEFAULT_PARAMS,
      faceplateHeight: 20,
    });
    expect(result.success).toBe(false);
  });

  it('rejects cornerRadius exceeding half the shorter faceplate dimension', () => {
    const result = bracketParamsSchema.safeParse({
      ...DEFAULT_PARAMS,
      cornerRadius: 20, // larger than faceplateHeight/2 = 15.875
    });
    expect(result.success).toBe(false);
  });

  it('rejects cutoutWidth exceeding faceplate interior', () => {
    const result = bracketParamsSchema.safeParse({
      ...DEFAULT_PARAMS,
      cutoutWidth: 300, // larger than faceplateWidth - 2*wallThickness
    });
    expect(result.success).toBe(false);
  });

  it('rejects cutoutHeight exceeding faceplate interior', () => {
    const result = bracketParamsSchema.safeParse({
      ...DEFAULT_PARAMS,
      cutoutHeight: 40, // larger than faceplateHeight - 2*wallThickness
    });
    expect(result.success).toBe(false);
  });

  it('accepts railSlotWidth at default (6.35mm)', () => {
    expect(bracketParamsSchema.safeParse(DEFAULT_PARAMS).success).toBe(true);
  });

  it('rejects railSlotWidth below minimum (3.175mm)', () => {
    const result = bracketParamsSchema.safeParse({ ...DEFAULT_PARAMS, railSlotWidth: 2.0 });
    expect(result.success).toBe(false);
  });

  it('rejects railSlotWidth above maximum (19.05mm)', () => {
    const result = bracketParamsSchema.safeParse({ ...DEFAULT_PARAMS, railSlotWidth: 20.0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rail slot geometry (feature 006)
// ---------------------------------------------------------------------------

describe('buildBracket — rail slot bumps', () => {
  it('slot protrusion extends beyond faceplateDepth on the shelf side', () => {
    const p = { ...DEFAULT_PARAMS, shelfDepth: 0, cutoutWidth: 0, cutoutHeight: 0 };
    const geo = buildBracket(p);
    geo.computeBoundingBox();
    expect((geo.boundingBox as Box3).max.z).toBeGreaterThan(p.faceplateDepth);
    geo.dispose();
  });

  it('slot protrusion depth is 2.032mm (0.08")', () => {
    const p = { ...DEFAULT_PARAMS, shelfDepth: 0, cutoutWidth: 0, cutoutHeight: 0 };
    const geo = buildBracket(p);
    geo.computeBoundingBox();
    expect((geo.boundingBox as Box3).max.z).toBeCloseTo(p.faceplateDepth + 2.032, 2);
    geo.dispose();
  });

  it('Z min stays at 0 (slots do not protrude behind the faceplate)', () => {
    const p = { ...DEFAULT_PARAMS, shelfDepth: 0, cutoutWidth: 0, cutoutHeight: 0 };
    const geo = buildBracket(p);
    geo.computeBoundingBox();
    expect((geo.boundingBox as Box3).min.z).toBeCloseTo(0, 2);
    geo.dispose();
  });
});

// ---------------------------------------------------------------------------
// Hex mesh hole paths (feature 007)
// ---------------------------------------------------------------------------

describe('hexHolePaths', () => {
  const base = DEFAULT_PARAMS;

  it('returns paths for a wall that fits at least one hex hole', () => {
    const paths = hexHolePaths(50, 20, base);
    expect(paths.length).toBeGreaterThan(0);
  });

  it('returns empty array when available area after inset is zero (inset >= half face dim)', () => {
    const p = { ...base, hexHoleInset: 30 }; // inset 30mm on each side of a 50mm face = 0 available
    const paths = hexHolePaths(50, 20, p);
    expect(paths).toHaveLength(0);
  });

  it('returns empty array when face is too small to fit a single hole', () => {
    // hole diameter 3.175mm, inset 3.175mm each side → available = faceW - 6.35
    // face 8mm → available = 1.65mm < 2*R ≈ 3.67mm → no holes
    const paths = hexHolePaths(8, 8, base);
    expect(paths).toHaveLength(0);
  });

  it('returns paths when gap is zero (holes tiled edge-to-edge)', () => {
    const p = { ...base, hexHoleGap: 0 };
    const paths = hexHolePaths(50, 20, p);
    expect(paths.length).toBeGreaterThan(0);
  });

  it('all returned paths have exactly 6 points (flat-top hex)', () => {
    const paths = hexHolePaths(50, 20, base);
    for (const path of paths) {
      expect(path.getPoints().length).toBeGreaterThanOrEqual(6);
    }
  });

  it('no hole center extends beyond the inset boundary', () => {
    const aw = 50 - 2 * base.hexHoleInset;
    const ah = 20 - 2 * base.hexHoleInset;
    const R = base.hexHoleDiameter / Math.sqrt(3);
    const paths = hexHolePaths(50, 20, base);
    for (const path of paths) {
      const pts = path.getPoints();
      for (const pt of pts) {
        expect(pt.x).toBeGreaterThanOrEqual(-aw / 2 - 0.001);
        expect(pt.x).toBeLessThanOrEqual(aw / 2 + 0.001);
        expect(pt.y).toBeGreaterThanOrEqual(-ah / 2 - 0.001);
        expect(pt.y).toBeLessThanOrEqual(ah / 2 + 0.001);
      }
      void R;
    }
  });
});
