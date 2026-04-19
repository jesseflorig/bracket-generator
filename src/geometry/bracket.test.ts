import { describe, it, expect } from 'vitest';
import { Box3, Vector3 } from 'three';
import {
  buildBracket,
  faceplateWidth,
  shelfMaxWidth,
  holeCount,
  holePositions,
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
});
