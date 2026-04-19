import { BoxGeometry, BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BracketParams } from '../models/bracketParams';

export interface HolePosition {
  x: number;
  y: number;
  z: number;
}

export function buildBracket(params: BracketParams): BufferGeometry {
  const width = Math.max(10, params.width);
  const height = Math.max(10, params.height);
  const depth = Math.max(10, params.depth);
  const t = Math.min(Math.max(1, params.thickness), Math.min(width, height, depth) / 2 - 0.01);

  const parts: BufferGeometry[] = [];

  if (params.bracketType === 'L') {
    // Vertical face plate: X centered, Y from 0→height, Z from 0→t
    const vLeg = new BoxGeometry(width, height, t);
    vLeg.translate(0, height / 2, t / 2);
    parts.push(vLeg);

    // Horizontal arm: X centered, Y from 0→t, Z from t→depth
    const hArm = new BoxGeometry(width, t, depth - t);
    hArm.translate(0, t / 2, t + (depth - t) / 2);
    parts.push(hArm);
  } else {
    // Front leg: Z from 0→t
    const frontLeg = new BoxGeometry(width, height, t);
    frontLeg.translate(0, height / 2, t / 2);
    parts.push(frontLeg);

    // Back leg: Z from depth-t→depth
    const backLeg = new BoxGeometry(width, height, t);
    backLeg.translate(0, height / 2, depth - t / 2);
    parts.push(backLeg);

    // Bridge: Y from 0→t, Z from t→depth-t
    const innerDepth = Math.max(0.1, depth - 2 * t);
    const bridge = new BoxGeometry(width, t, innerDepth);
    bridge.translate(0, t / 2, depth / 2);
    parts.push(bridge);
  }

  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());

  if (!merged) {
    // Fallback: plain box matching the envelope
    const fallback = new BoxGeometry(width, height, depth);
    fallback.translate(0, height / 2, depth / 2);
    return fallback;
  }

  return merged;
}

export function getHolePositions(params: BracketParams): HolePosition[] {
  if (params.holeCount === 0) return [];

  const { holeCount, holeSpacing, holeInset, thickness, depth, bracketType } = params;
  const positions: HolePosition[] = [];

  // Holes in front vertical leg, centered in X, spaced along Y
  // Holes pass through the plate thickness (Z direction)
  const zFront = thickness / 2;

  for (let i = 0; i < holeCount; i++) {
    positions.push({ x: 0, y: holeInset + i * holeSpacing, z: zFront });
  }

  // U-bracket gets matching holes in the back leg too
  if (bracketType === 'U') {
    const zBack = depth - thickness / 2;
    for (let i = 0; i < holeCount; i++) {
      positions.push({ x: 0, y: holeInset + i * holeSpacing, z: zBack });
    }
  }

  return positions;
}
