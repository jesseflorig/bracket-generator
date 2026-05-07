import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { toBracketRenderGeometry } from './renderGeometry';

function sharedVertexCubeGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array([
    -1, -1, -1,
    1, -1, -1,
    1, 1, -1,
    -1, 1, -1,
    -1, -1, 1,
    1, -1, 1,
    1, 1, 1,
    -1, 1, 1,
  ]);

  const indices = [
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    3, 6, 2, 3, 7, 6,
    1, 2, 6, 1, 6, 5,
    0, 4, 7, 0, 7, 3,
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}

describe('toBracketRenderGeometry', () => {
  it('splits hard edges so each cube triangle has a flat normal', () => {
    const source = sharedVertexCubeGeometry();
    const renderGeometry = toBracketRenderGeometry(source);
    const normals = renderGeometry.getAttribute('normal');

    for (let i = 0; i < normals.count; i += 3) {
      const x = normals.getX(i);
      const y = normals.getY(i);
      const z = normals.getZ(i);

      expect(normals.getX(i + 1)).toBeCloseTo(x, 5);
      expect(normals.getY(i + 1)).toBeCloseTo(y, 5);
      expect(normals.getZ(i + 1)).toBeCloseTo(z, 5);
      expect(normals.getX(i + 2)).toBeCloseTo(x, 5);
      expect(normals.getY(i + 2)).toBeCloseTo(y, 5);
      expect(normals.getZ(i + 2)).toBeCloseTo(z, 5);
    }

    source.dispose();
    renderGeometry.dispose();
  });
});
