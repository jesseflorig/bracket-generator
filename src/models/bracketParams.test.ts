import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMS,
  bracketParamsSchema,
  constrainShelfParams,
  maxCutoutHeightForFaceplate,
  maxCutoutWidthForRack,
  maxShelfCountForRack,
  maxShelfWallThicknessForRack,
  shelfTotalWidth,
} from './bracketParams';

describe('shelf rack-width constraints', () => {
  it('reports dynamic max values from rack width, shelf count, width, and wall thickness', () => {
    const params = { ...DEFAULT_PARAMS, shelfCount: 2, cutoutWidth: 50, shelfWallThickness: 3.175 };

    expect(maxShelfCountForRack(params)).toBe(3);
    expect(maxCutoutWidthForRack(params)).toBeCloseTo(77.7875, 4);
    expect(maxCutoutHeightForFaceplate(params)).toBeCloseTo(25.4, 4);
    expect(maxShelfWallThicknessForRack(params)).toBeCloseTo(6.35, 4);
  });

  it('constrains shelf count when count changes', () => {
    const params = constrainShelfParams(
      { ...DEFAULT_PARAMS, shelfCount: 10, cutoutWidth: 20, shelfWallThickness: 3.175 },
      'shelfCount'
    );

    expect(params.shelfCount).toBe(6);
    expect(shelfTotalWidth(params)).toBeLessThanOrEqual(params.rackWidth);
    expect(bracketParamsSchema.safeParse(params).success).toBe(true);
  });

  it('constrains per-shelf width when width changes', () => {
    const params = constrainShelfParams(
      { ...DEFAULT_PARAMS, shelfCount: 2, cutoutWidth: 100, shelfWallThickness: 3.175 },
      'cutoutWidth'
    );

    expect(params.cutoutWidth).toBeCloseTo(77.7875, 4);
    expect(shelfTotalWidth(params)).toBeLessThanOrEqual(params.rackWidth);
    expect(bracketParamsSchema.safeParse(params).success).toBe(true);
  });

  it('constrains wall thickness when wall thickness changes', () => {
    const params = constrainShelfParams(
      { ...DEFAULT_PARAMS, rackWidth: 50.8, shelfCount: 10, cutoutWidth: 3, shelfWallThickness: 6.35 },
      'shelfWallThickness'
    );

    expect(params.shelfWallThickness).toBeCloseTo(1.8909, 4);
    expect(shelfTotalWidth(params)).toBeLessThanOrEqual(params.rackWidth);
    expect(bracketParamsSchema.safeParse(params).success).toBe(true);
  });

  it('constrains cutout height to faceplate height minus two wall thicknesses', () => {
    const params = constrainShelfParams(
      { ...DEFAULT_PARAMS, faceplateHeight: 31.75, shelfWallThickness: 6.35, cutoutHeight: 40 },
      'cutoutHeight'
    );

    expect(params.cutoutHeight).toBeCloseTo(19.05, 4);
    expect(bracketParamsSchema.safeParse(params).success).toBe(true);
  });

  it('shrinks cutout height when wall thickness changes', () => {
    const params = constrainShelfParams(
      { ...DEFAULT_PARAMS, faceplateHeight: 31.75, shelfWallThickness: 6.35, cutoutHeight: 25 },
      'shelfWallThickness'
    );

    expect(params.cutoutHeight).toBeCloseTo(19.05, 4);
    expect(bracketParamsSchema.safeParse(params).success).toBe(true);
  });

  it('shrinks shelf dimensions when rack width changes', () => {
    const params = constrainShelfParams(
      { ...DEFAULT_PARAMS, rackWidth: 50.8, shelfCount: 10, cutoutWidth: 10, shelfWallThickness: 6.35 },
      'rackWidth'
    );

    expect(params.shelfCount).toBe(10);
    expect(params.cutoutWidth).toBe(0);
    expect(params.shelfWallThickness).toBeCloseTo(4.6182, 4);
    expect(shelfTotalWidth(params)).toBeLessThanOrEqual(params.rackWidth);
    expect(bracketParamsSchema.safeParse(params).success).toBe(true);
  });

  it('leaves keystone mode shelf dimensions unchanged', () => {
    const params = constrainShelfParams(
      { ...DEFAULT_PARAMS, mode: 'keystone', shelfCount: 10, cutoutWidth: 100, shelfWallThickness: 6.35 },
      'cutoutWidth'
    );

    expect(params.shelfCount).toBe(10);
    expect(params.cutoutWidth).toBe(100);
    expect(params.shelfWallThickness).toBe(6.35);
  });
});
