import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const RENDER_CREASE_ANGLE = THREE.MathUtils.degToRad(35);

export function toBracketRenderGeometry(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = toCreasedNormals(source, RENDER_CREASE_ANGLE);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
