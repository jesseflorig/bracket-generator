import { describe, it, expect } from 'vitest';
import { Box3, Vector3 } from 'three';
import { buildBracket, getHolePositions } from './bracket';
import { DEFAULT_PARAMS } from '../models/bracketParams';

describe('buildBracket', () => {
  it('L-bracket bounding box matches params', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    geo.computeBoundingBox();
    const bbox = geo.boundingBox as Box3;
    const size = new Vector3();
    bbox.getSize(size);

    expect(size.x).toBeCloseTo(DEFAULT_PARAMS.width, 1);
    expect(size.y).toBeCloseTo(DEFAULT_PARAMS.height, 1);
    expect(size.z).toBeCloseTo(DEFAULT_PARAMS.depth, 1);
    geo.dispose();
  });

  it('L-bracket bottom face sits at Y=0', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    geo.computeBoundingBox();
    expect((geo.boundingBox as Box3).min.y).toBeCloseTo(0, 3);
    geo.dispose();
  });

  it('U-bracket bounding box matches params', () => {
    const params = { ...DEFAULT_PARAMS, bracketType: 'U' as const };
    const geo = buildBracket(params);
    geo.computeBoundingBox();
    const bbox = geo.boundingBox as Box3;
    const size = new Vector3();
    bbox.getSize(size);

    expect(size.x).toBeCloseTo(params.width, 1);
    expect(size.y).toBeCloseTo(params.height, 1);
    expect(size.z).toBeCloseTo(params.depth, 1);
    geo.dispose();
  });

  it('returns a geometry with vertex data', () => {
    const geo = buildBracket(DEFAULT_PARAMS);
    expect(geo.getAttribute('position').count).toBeGreaterThan(0);
    geo.dispose();
  });
});

describe('getHolePositions', () => {
  it('returns empty array when holeCount is 0', () => {
    const positions = getHolePositions({ ...DEFAULT_PARAMS, holeCount: 0 });
    expect(positions).toHaveLength(0);
  });

  it('returns correct count for L-bracket', () => {
    const positions = getHolePositions(DEFAULT_PARAMS);
    expect(positions).toHaveLength(DEFAULT_PARAMS.holeCount);
  });

  it('returns double count for U-bracket', () => {
    const params = { ...DEFAULT_PARAMS, bracketType: 'U' as const };
    const positions = getHolePositions(params);
    expect(positions).toHaveLength(params.holeCount * 2);
  });

  it('holes are spaced correctly along Y', () => {
    const positions = getHolePositions(DEFAULT_PARAMS);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i].y - positions[i - 1].y).toBeCloseTo(
        DEFAULT_PARAMS.holeSpacing,
        3
      );
    }
  });
});
