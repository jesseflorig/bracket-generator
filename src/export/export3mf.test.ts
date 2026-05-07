import { beforeAll, describe, expect, it } from 'vitest';
import { buildBracket, manifoldReady } from '../geometry/bracket';
import { DEFAULT_PARAMS } from '../models/bracketParams';
import { meshDataFromGeometry, modelXmlFromMeshData } from './export3mf';

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function nonManifoldEdgeCount(triangles: ReadonlyArray<readonly [number, number, number]>): number {
  const edges = new Map<string, number>();

  for (const [a, b, c] of triangles) {
    for (const key of [edgeKey(a, b), edgeKey(b, c), edgeKey(c, a)]) {
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }

  return Array.from(edges.values()).filter((count) => count !== 2).length;
}

beforeAll(async () => {
  await manifoldReady;
});

describe('meshDataFromGeometry', () => {
  it('preserves shared topology for 3MF export', () => {
    const geometry = buildBracket(DEFAULT_PARAMS);
    const data = meshDataFromGeometry(geometry);

    expect(data.vertices.length).toBeLessThan(data.triangles.length * 3);
    expect(nonManifoldEdgeCount(data.triangles)).toBe(0);

    geometry.dispose();
  });

  it('writes triangle indices that reference exported vertices', () => {
    const geometry = buildBracket(DEFAULT_PARAMS);
    const data = meshDataFromGeometry(geometry);
    const xml = modelXmlFromMeshData(data);

    expect(xml).toContain('<model unit="millimeter"');
    expect(xml).toContain(`<triangle v1="${data.triangles[0][0]}"`);
    for (const triangle of data.triangles) {
      for (const vertexIndex of triangle) {
        expect(vertexIndex).toBeGreaterThanOrEqual(0);
        expect(vertexIndex).toBeLessThan(data.vertices.length);
      }
    }

    geometry.dispose();
  });
});
