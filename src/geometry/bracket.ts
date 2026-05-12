import * as THREE from 'three';
import ManifoldModule from 'manifold-3d';
import manifoldWasmUrl from 'manifold-3d/manifold.wasm?url';
import type { ManifoldToplevel, SimplePolygon } from 'manifold-3d';
import type { BracketParams } from '../models/bracketParams';

// ---------------------------------------------------------------------------
// Manifold WASM initialization — call manifoldReady before buildBracket
// ---------------------------------------------------------------------------

interface ManifoldState {
  lib: ManifoldToplevel | null;
  ready: Promise<void> | null;
}

type GlobalWithManifoldState = typeof globalThis & {
  __bracketGeneratorManifold?: ManifoldState;
};

const manifoldState =
  (globalThis as GlobalWithManifoldState).__bracketGeneratorManifold ??= {
    lib: null,
    ready: null,
  };

const resolvedManifoldWasmUrl =
  typeof window === 'undefined'
    ? new URL('../../node_modules/manifold-3d/manifold.wasm', import.meta.url).href
    : manifoldWasmUrl;

export const manifoldReady: Promise<void> = manifoldState.ready ??= ManifoldModule({
  locateFile: () => resolvedManifoldWasmUrl,
}).then((loadedLib) => {
  loadedLib.setup();
  manifoldState.lib = loadedLib;
});

function lib(): ManifoldToplevel {
  if (!manifoldState.lib) throw new Error('Manifold WASM not yet loaded — await manifoldReady first');
  return manifoldState.lib;
}

// ---------------------------------------------------------------------------
// Derived values — pure functions, never stored in state
// ---------------------------------------------------------------------------

export function faceplateWidth(p: BracketParams): number {
  return p.rackWidth + 2 * p.railWidth;
}

export function shelfMaxWidth(p: BracketParams): number {
  if (p.shelfCount <= 0) return 0;
  return (p.rackWidth - (p.shelfCount + 1) * p.shelfWallThickness) / p.shelfCount;
}

export function holeCount(p: BracketParams): number {
  return Math.floor(p.faceplateHeight / 25.4);
}

export interface HolePosition {
  x: number;
  y: number;
  z: number;
}

export function holePositions(p: BracketParams): { x: number; y: number }[] {
  const count = holeCount(p);
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0 }];

  const top = p.faceplateHeight / 2 - p.holeEdgeOffset;
  const bottom = -(p.faceplateHeight / 2 - p.holeEdgeOffset);
  return Array.from({ length: count }, (_, i) => ({
    x: 0,
    y: bottom + (i / (count - 1)) * (top - bottom),
  }));
}

// ---------------------------------------------------------------------------
// Hex mesh helpers
// ---------------------------------------------------------------------------

function hexHoleCenters(
  faceW: number,
  faceH: number,
  p: BracketParams
): Array<{ cx: number; cy: number }> {
  const aw = faceW - 2 * p.hexHoleInset;
  const ah = faceH - 2 * p.hexHoleInset;
  if (aw <= 0 || ah <= 0 || p.hexHoleDiameter <= 0) return [];

  const R = p.hexHoleDiameter / Math.sqrt(3);
  if (2 * R > aw || 2 * R > ah) return [];

  const colStep = 1.5 * R + p.hexHoleGap;
  const rowStep = p.hexHoleDiameter + p.hexHoleGap;
  const maxCols = Math.ceil(aw / (2 * colStep)) + 2;
  const maxRows = Math.ceil(ah / (2 * rowStep)) + 2;

  const centers: Array<{ cx: number; cy: number }> = [];

  for (let ci = -maxCols; ci <= maxCols; ci++) {
    const cx = ci * colStep;
    const rowOffset = Math.abs(ci) % 2 !== 0 ? rowStep / 2 : 0;

    for (let ri = -maxRows; ri <= maxRows; ri++) {
      const cy = ri * rowStep + rowOffset;

      let fits = true;
      for (let i = 0; i < 6 && fits; i++) {
        const vx = cx + R * Math.cos((i * Math.PI) / 3);
        const vy = cy + R * Math.sin((i * Math.PI) / 3);
        if (vx < -aw / 2 || vx > aw / 2 || vy < -ah / 2 || vy > ah / 2) fits = false;
      }
      if (fits) centers.push({ cx, cy });
    }
  }

  return centers;
}

export function hexHolePaths(faceW: number, faceH: number, p: BracketParams): THREE.Path[] {
  const R = p.hexHoleDiameter / Math.sqrt(3);
  return hexHoleCenters(faceW, faceH, p).map(({ cx, cy }) => {
    const path = new THREE.Path();
    path.moveTo(cx + R, cy);
    for (let i = 1; i < 6; i++) {
      path.lineTo(cx + R * Math.cos((i * Math.PI) / 3), cy + R * Math.sin((i * Math.PI) / 3));
    }
    path.closePath();
    return path;
  });
}

// ---------------------------------------------------------------------------
// Manifold ↔ Three.js conversion
// ---------------------------------------------------------------------------

function manifoldToGeo(m: ReturnType<ManifoldToplevel['Manifold']['prototype']['add']>): THREE.BufferGeometry {
  const mesh = m.getMesh();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mesh.vertProperties), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(mesh.triVerts), 1));
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// Rounded-rectangle cross-section polygon
// ---------------------------------------------------------------------------

function roundedRectPolygon(
  cx: number, cy: number, w: number, h: number, r: number, segs = 8
): SimplePolygon {
  const safeR = Math.min(r, w / 2, h / 2);
  const pts: [number, number][] = [];

  const arc = (ox: number, oy: number, startAngle: number) => {
    for (let i = 0; i < segs; i++) {
      const a = startAngle + (i / segs) * (Math.PI / 2);
      pts.push([ox + safeR * Math.cos(a), oy + safeR * Math.sin(a)]);
    }
  };

  // BL corner, BR corner, TR corner, TL corner
  arc(cx - w / 2 + safeR, cy - h / 2 + safeR, Math.PI);
  arc(cx + w / 2 - safeR, cy - h / 2 + safeR, Math.PI * 1.5);
  arc(cx + w / 2 - safeR, cy + h / 2 - safeR, 0);
  arc(cx - w / 2 + safeR, cy + h / 2 - safeR, Math.PI / 2);

  return pts;
}

// ---------------------------------------------------------------------------
// Perforated wall panel cross-section — outer rect minus hex holes
// ---------------------------------------------------------------------------

function hexWallCrossSection(faceW: number, faceH: number, p: BracketParams) {
  const { CrossSection } = lib();

  // Outer rectangle
  let cs = CrossSection.square([faceW, faceH], true);

  // Subtract all hex holes
  const R = p.hexHoleDiameter / Math.sqrt(3);
  const centers = hexHoleCenters(faceW, faceH, p);
  if (centers.length > 0) {
    const holes = centers.map(({ cx, cy }) => {
      const hexPts: SimplePolygon = Array.from({ length: 6 }, (_, i) => [
        cx + R * Math.cos((i * Math.PI) / 3),
        cy + R * Math.sin((i * Math.PI) / 3),
      ] as [number, number]);
      return new CrossSection([hexPts]);
    });
    cs = cs.subtract(CrossSection.union(holes));
  }

  return cs;
}

// ---------------------------------------------------------------------------
// Bracket geometry — built entirely from Manifold primitives
// ---------------------------------------------------------------------------

const SLOT_DEPTH_MM = 2.032; // 0.08"

export function buildBracket(p: BracketParams): THREE.BufferGeometry {
  const { Manifold, CrossSection } = lib();

  const fw = faceplateWidth(p);
  const fh = p.faceplateHeight;
  const fd = p.faceplateDepth;
  const cw = p.cutoutWidth;
  const ch = p.cutoutHeight;
  const t  = p.shelfWallThickness;

  // --- Faceplate body ---
  const fpPoly = roundedRectPolygon(0, 0, fw, fh, p.cornerRadius, 8);
  const fpBody = new CrossSection([fpPoly]).extrude(fd);

  const parts: ReturnType<typeof Manifold.cube>[] = [fpBody];

  // --- Shelf walls and floors ---
  const count = p.shelfCount;
  const hasShelf = count > 0 && p.shelfDepth > 0 && cw > 0 && ch > 0;
  if (hasShelf) {
    const depth = p.shelfDepth;
    const tw = count * cw + (count + 1) * t;
    const startX = -tw / 2;

    // Walls
    for (let i = 0; i <= count; i++) {
      // Wall center X: startX + i*(cw+t) + t/2
      const wallX = startX + i * (cw + t) + t / 2;
      const wallCS = hexWallCrossSection(depth, ch + t, p);
      // Manifold.extrude(t) creates a solid from 0 to t in Z by default. 
      // We rotate it to align with X. After rotation [0, -90, 0], 
      // the thickness t is along X, ranging from -t to 0 if we don't center.
      // However, we want the wall centered at wallX.
      const wall = wallCS
        .extrude(t)
        .rotate([0, -90, 0])
        .translate([wallX + t / 2, -t / 2, fd + depth / 2]);
      parts.push(wall);
    }

    // Floors
    for (let i = 0; i < count; i++) {
      const floorX = startX + i * (cw + t) + t + cw / 2;
      if (p.hexMeshFloor) {
        const floorCS = hexWallCrossSection(cw, depth, p);
        const floorPanel = floorCS
          .extrude(t)
          .rotate([-90, 0, 0])
          .translate([floorX, -(ch / 2 + t), fd + depth / 2]);
        parts.push(floorPanel);
      } else {
        const floor = Manifold.cube([cw, t, depth], true)
          .translate([floorX, -(ch / 2 + t / 2), fd + depth / 2]);
        parts.push(floor);
      }
    }
  }

  // --- Rail slot bumps ---
  const positions = holePositions(p);
  if (positions.length > 0) {
    const slotW = p.holeDiameter - 0.01;
    const slotH = p.railSlotWidth;
    const leftX  = -(fw / 2 - p.holeInset);
    const rightX =   fw / 2 - p.holeInset;
    const slotZCenter = fd + SLOT_DEPTH_MM / 2;

    for (const pos of positions) {
      const topY    = pos.y + p.holeDiameter / 2 + slotH / 2;
      const bottomY = pos.y - p.holeDiameter / 2 - slotH / 2;
      for (const hx of [leftX, rightX]) {
        parts.push(Manifold.cube([slotW, slotH, SLOT_DEPTH_MM], true).translate([hx, topY,    slotZCenter]));
        parts.push(Manifold.cube([slotW, slotH, SLOT_DEPTH_MM], true).translate([hx, bottomY, slotZCenter]));
      }
    }
  }

  // Union all positive volumes
  let solid = Manifold.union(parts);

  // --- Subtract cutout openings ---
  if (hasShelf) {
    const tw = count * cw + (count + 1) * t;
    const startX = -tw / 2;
    for (let i = 0; i < count; i++) {
      const cutoutX = startX + i * (cw + t) + t + cw / 2;
      const cutout = Manifold.cube([cw, ch, fd + 0.2], true)
        .translate([cutoutX, 0, fd / 2]);
      solid = solid.subtract(cutout);
    }
  }

  // --- Subtract mounting holes ---
  if (positions.length > 0) {
    const holeR  = p.holeDiameter / 2;
    const leftX  = -(fw / 2 - p.holeInset);
    const rightX =   fw / 2 - p.holeInset;
    const holeCylinders: ReturnType<typeof Manifold.cylinder>[] = [];

    for (const pos of positions) {
      for (const hx of [leftX, rightX]) {
        // Cylinder along Z: bottom at -0.1, top at fd+0.1 for clean punch-through
        holeCylinders.push(
          Manifold.cylinder(fd + 0.2, holeR, holeR, 32)
            .translate([hx, pos.y, -0.1])
        );
      }
    }
    solid = solid.subtract(Manifold.union(holeCylinders));
  }

  return manifoldToGeo(solid);
}
