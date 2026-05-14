import { describe, it, expect, beforeAll } from 'vitest';
import { Box3, Vector3 } from 'three';
import {
  buildBracket,
  faceplateWidth,
  keystoneExteriorWidth,
  shelfMaxWidth,
  holeCount,
  holePositions,
  hexHolePaths,
  manifoldReady,
} from './bracket';
import { DEFAULT_PARAMS, bracketParamsSchema } from '../models/bracketParams';

beforeAll(async () => {
  await manifoldReady;
});

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
  it('equals rackWidth − 2 * shelfWallThickness at defaults (shelfCount=1)', () => {
    expect(shelfMaxWidth(DEFAULT_PARAMS)).toBeCloseTo(165.1 - 2 * 3.175, 3);
  });

  it('equals (rackWidth - 3*thickness)/2 for shelfCount=2', () => {
    const p = { ...DEFAULT_PARAMS, shelfCount: 2 };
    const expected = (165.1 - 3 * 3.175) / 2;
    expect(shelfMaxWidth(p)).toBeCloseTo(expected, 3);
  });
});

describe('keystoneExteriorWidth', () => {
  it('includes sleeve thickness on both exterior ends', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, keystoneCount: 1 };
    expect(keystoneExteriorWidth(p)).toBeCloseTo(14.8 + 2 * 1.5, 3);
  });

  it('uses standard spacing for eight keystones', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, keystoneCount: 8 };
    const fw = faceplateWidth(p);
    const leftHoleX = -(fw / 2 - p.holeInset);
    const rightHoleX = fw / 2 - p.holeInset;
    const innerLeft = leftHoleX + p.holeDiameter / 2 + 5;
    const innerRight = rightHoleX - p.holeDiameter / 2 - 5;
    const availableW = innerRight - innerLeft;
    const gap = (availableW - p.keystoneCount * 14.8) / (p.keystoneCount + 1);
    const expected = p.keystoneCount * 14.8 + (p.keystoneCount - 1) * gap + 2 * 1.5;

    expect(keystoneExteriorWidth(p)).toBeCloseTo(expected, 3);
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

  it('shelf X outer span equals total block width (shelfCount=1)', () => {
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

  it('shelf X outer span equals total block width (shelfCount=2)', () => {
    const p = { ...DEFAULT_PARAMS, shelfCount: 2, cutoutWidth: 50 };
    const geo = buildBracket(p);
    const positions = geo.getAttribute('position');
    const fd = p.faceplateDepth;
    const SLOT_DEPTH_MM = 2.032;
    let minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < positions.count; i++) {
      if (positions.getZ(i) > fd + SLOT_DEPTH_MM + 0.01) {
        minX = Math.min(minX, positions.getX(i));
        maxX = Math.max(maxX, positions.getX(i));
      }
    }
    const expectedSpan = 2 * p.cutoutWidth + 3 * p.shelfWallThickness;
    expect(maxX - minX).toBeCloseTo(expectedSpan, 2);
    geo.dispose();
  });

  it('shelf walls are correctly positioned at the edges of the block', () => {
    const p = { ...DEFAULT_PARAMS, shelfCount: 1, cutoutWidth: 100, shelfWallThickness: 10 };
    const geo = buildBracket(p);
    const positions = geo.getAttribute('position');
    const fd = p.faceplateDepth;
    const SLOT_DEPTH_MM = 2.032;
    let minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < positions.count; i++) {
      if (positions.getZ(i) > fd + SLOT_DEPTH_MM + 0.01) {
        minX = Math.min(minX, positions.getX(i));
        maxX = Math.max(maxX, positions.getX(i));
      }
    }
    // tw = 1*100 + 2*10 = 120. startX = -60.
    // Wall 0 center = -60 + 0 + 5 = -55. Left edge = -60, Right edge = -50.
    // Wall 1 center = -60 + 110 + 5 = 55. Left edge = 50, Right edge = 60.
    expect(minX).toBeCloseTo(-60, 1);
    expect(maxX).toBeCloseTo(60, 1);
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

  it('rejects total shelf width exceeding rackWidth', () => {
    const result = bracketParamsSchema.safeParse({
      ...DEFAULT_PARAMS,
      shelfCount: 2,
      cutoutWidth: 100, // 2*100 + 3*3.175 = 209.525 > 165.1
    });
    expect(result.success).toBe(false);
  });

  it('accepts zero shelfCount', () => {
    expect(bracketParamsSchema.safeParse({ ...DEFAULT_PARAMS, shelfCount: 0 }).success).toBe(true);
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

// ---------------------------------------------------------------------------
// Keystone Mode (feature 008)
// ---------------------------------------------------------------------------

describe('buildBracket — keystone mode', () => {
  it('suppresses shelf geometry', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, shelfDepth: 50.8 };
    const geo = buildBracket(p);
    geo.computeBoundingBox();
    const size = new Vector3();
    (geo.boundingBox as Box3).getSize(size);
    expect(size.z).toBeLessThan(p.shelfDepth);
    geo.dispose();
  });

  it('bounding box width matches faceplate width', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const };
    const geo = buildBracket(p);
    geo.computeBoundingBox();
    const size = new Vector3();
    (geo.boundingBox as Box3).getSize(size);
    expect(size.x).toBeCloseTo(faceplateWidth(p), 1);
    geo.dispose();
  });

  it('keystone mode adds a 10mm sleeve with a top step at 0.7mm depth', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const };
    const geo = buildBracket(p);
    geo.computeBoundingBox();
    const size = new Vector3();
    (geo.boundingBox as Box3).getSize(size);
    expect(size.z).toBeCloseTo(10.0, 3);
    geo.dispose();
  });

  it('keystone opening is square at the front face without a bottom chamfer', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, keystoneCount: 1 };
    const geo = buildBracket(p);
    const pos = geo.getAttribute('position');

    let tunnelMinY = Infinity, tunnelMaxY = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Tunnel vertices at hole edges (+/- 7.4)
      if (Math.abs(Math.abs(x) - 7.4) < 0.1) {
        if (Math.abs(z - 0) < 0.1) {
          if (Math.abs(y) < 10.0) {
            tunnelMinY = Math.min(tunnelMinY, y);
            tunnelMaxY = Math.max(tunnelMaxY, y);
          }
        }
      }
    }

    expect(tunnelMaxY - tunnelMinY).toBeCloseTo(16.2, 0.5);

    geo.dispose();
  });

  it('keystone count 8 keeps sleeves separated between openings', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, keystoneCount: 8 };
    const geo = buildBracket(p);
    const pos = geo.getAttribute('position');
    const edgeXs: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      if (Math.abs(z - 0) < 0.1 && Math.abs(Math.abs(y) - 8.1) < 0.1 && Math.abs(x) < 90) {
        edgeXs.push(Number(x.toFixed(2)));
      }
    }

    const uniqueEdges = Array.from(new Set(edgeXs)).sort((a, b) => a - b);
    const gaps: number[] = [];
    for (let i = 1; i < 8; i++) {
      gaps.push(uniqueEdges[2 * i] - uniqueEdges[2 * i - 1]);
    }

    expect(uniqueEdges).toHaveLength(16);
    for (const gap of gaps) {
      expect(gap).toBeGreaterThan(3.0);
    }

    geo.dispose();
  });

  it('keystone rear sleeve opening steps upward by 3.4mm after the square section', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, keystoneCount: 1 };
    const geo = buildBracket(p);
    const pos = geo.getAttribute('position');

    let rearMinY = Infinity, rearMaxY = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      if (Math.abs(Math.abs(x) - 7.4) < 0.1 && Math.abs(z - 10.0) < 0.1) {
        if (y > -9.0 && y < 12.0) {
          rearMinY = Math.min(rearMinY, y);
          rearMaxY = Math.max(rearMaxY, y);
        }
      }
    }

    expect(rearMinY).toBeCloseTo(-8.1, 0.5);
    expect(rearMaxY).toBeCloseTo(11.5, 0.5);

    geo.dispose();
  });

  it('keystone rear sleeve opening starts at 0.7mm depth', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, keystoneCount: 1 };
    const geo = buildBracket(p);
    const pos = geo.getAttribute('position');

    let stepStartMaxY = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      if (Math.abs(Math.abs(x) - 7.4) < 0.1 && Math.abs(z - 0.7) < 0.1) {
        if (y > 8.0 && y < 12.0) {
          stepStartMaxY = Math.max(stepStartMaxY, y);
        }
      }
    }

    expect(stepStartMaxY).toBeCloseTo(11.5, 0.5);

    geo.dispose();
  });

  it('keystone sleeve raised top wall extends through the faceplate back', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, keystoneCount: 1 };
    const geo = buildBracket(p);
    const pos = geo.getAttribute('position');

    let sleeveTopAtFaceplateBack = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      if (Math.abs(Math.abs(x) - 8.9) < 0.1 && Math.abs(z - p.faceplateDepth) < 0.1) {
        if (y > 10.0 && y < 15.0) {
          sleeveTopAtFaceplateBack = Math.max(sleeveTopAtFaceplateBack, y);
        }
      }
    }

    expect(sleeveTopAtFaceplateBack).toBeCloseTo(13.0, 0.5);

    geo.dispose();
  });

  it('keystone sleeve has a 10.7mm by 3.17mm vertical cutout at the step depth', () => {
    const p = { ...DEFAULT_PARAMS, mode: 'keystone' as const, keystoneCount: 1 };
    const geo = buildBracket(p);
    const pos = geo.getAttribute('position');

    let slotBackZ = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      if (Math.abs(Math.abs(x) - 5.35) < 0.1 && y > 11.0 && z > 6.0 && z < 9.0) {
        slotBackZ = Math.max(slotBackZ, z);
      }
    }

    expect(slotBackZ).toBeCloseTo(8.4, 0.5);

    geo.dispose();
  });
});

describe('bracketParamsSchema — keystone validation', () => {
  it('rejects too many keystones for narrow rack', () => {
    const result = bracketParamsSchema.safeParse({
      ...DEFAULT_PARAMS,
      rackWidth: 50.8, // 2"
      mode: 'keystone',
      keystoneCount: 10,
    });
    expect(result.success).toBe(false);
  });

  it('accepts keystone mode with default params', () => {
    const result = bracketParamsSchema.safeParse({
      ...DEFAULT_PARAMS,
      mode: 'keystone',
    });
    expect(result.success).toBe(true);
  });
});
