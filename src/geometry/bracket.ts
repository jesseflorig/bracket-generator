import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BracketParams } from '../models/bracketParams';

// ---------------------------------------------------------------------------
// Derived values — pure functions, never stored in state
// ---------------------------------------------------------------------------

export function faceplateWidth(p: BracketParams): number {
  return p.rackWidth + 2 * p.railWidth;
}

export function shelfMaxWidth(p: BracketParams): number {
  return p.rackWidth - 2 * p.shelfWallThickness;
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
// Rounded-rectangle shape path helper
// ---------------------------------------------------------------------------

function roundedRect(
  shape: THREE.Shape | THREE.Path,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const safeR = Math.min(r, w / 2, h / 2);
  shape.moveTo(x + safeR, y);
  shape.lineTo(x + w - safeR, y);
  shape.absarc(x + w - safeR, y + safeR, safeR, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - safeR);
  shape.absarc(x + w - safeR, y + h - safeR, safeR, 0, Math.PI / 2, false);
  shape.lineTo(x + safeR, y + h);
  shape.absarc(x + safeR, y + h - safeR, safeR, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + safeR);
  shape.absarc(x + safeR, y + safeR, safeR, Math.PI, Math.PI * 1.5, false);
}

// ---------------------------------------------------------------------------
// Faceplate geometry (Shape + ExtrudeGeometry with cutout and holes)
// ---------------------------------------------------------------------------

function buildFaceplate(p: BracketParams): THREE.BufferGeometry {
  const fw = faceplateWidth(p);
  const fh = p.faceplateHeight;
  const fd = p.faceplateDepth;

  // Outer shape: rounded rectangle, centered on origin
  const shape = new THREE.Shape();
  roundedRect(shape, -fw / 2, -fh / 2, fw, fh, p.cornerRadius);

  // Cutout hole (rectangular, centered)
  if (p.cutoutWidth > 0 && p.cutoutHeight > 0) {
    const cutout = new THREE.Path();
    cutout.moveTo(-p.cutoutWidth / 2, -p.cutoutHeight / 2);
    cutout.lineTo(p.cutoutWidth / 2, -p.cutoutHeight / 2);
    cutout.lineTo(p.cutoutWidth / 2, p.cutoutHeight / 2);
    cutout.lineTo(-p.cutoutWidth / 2, p.cutoutHeight / 2);
    cutout.closePath();
    shape.holes.push(cutout);
  }

  // Mounting holes — one column per side
  const count = holeCount(p);
  const positions = holePositions(p);
  const holeR = p.holeDiameter / 2;
  const leftX = -(fw / 2 - p.holeInset);
  const rightX = fw / 2 - p.holeInset;

  for (const pos of positions) {
    for (const hx of [leftX, rightX]) {
      const holePath = new THREE.Path();
      holePath.absarc(hx, pos.y, holeR, 0, Math.PI * 2, false);
      shape.holes.push(holePath);
    }
  }

  // Suppress unused variable warning — count is used via positions
  void count;

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: fd,
    bevelEnabled: false,
  });
  // ExtrudeGeometry extrudes along +Z; translate so front face sits at Z=0
  geo.translate(0, 0, 0);

  return geo;
}

// ---------------------------------------------------------------------------
// Hex mesh helpers — flat-top honeycomb holes for shelf wall panels
// ---------------------------------------------------------------------------

export function hexHolePaths(faceW: number, faceH: number, p: BracketParams): THREE.Path[] {
  const aw = faceW - 2 * p.hexHoleInset;
  const ah = faceH - 2 * p.hexHoleInset;
  if (aw <= 0 || ah <= 0 || p.hexHoleDiameter <= 0) return [];

  const R = p.hexHoleDiameter / Math.sqrt(3); // circumradius
  if (2 * R > aw || 2 * R > ah) return [];

  // colStep: horizontal center-to-center between adjacent columns
  // rowStep: vertical center-to-center within a column
  const colStep = 1.5 * R + p.hexHoleGap;
  const rowStep = p.hexHoleDiameter + p.hexHoleGap;

  const paths: THREE.Path[] = [];
  const maxCols = Math.ceil(aw / (2 * colStep)) + 2;
  const maxRows = Math.ceil(ah / (2 * rowStep)) + 2;

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
      if (!fits) continue;

      const path = new THREE.Path();
      path.moveTo(cx + R, cy);
      for (let i = 1; i < 6; i++) {
        path.lineTo(cx + R * Math.cos((i * Math.PI) / 3), cy + R * Math.sin((i * Math.PI) / 3));
      }
      path.closePath();
      paths.push(path);
    }
  }

  return paths;
}

// Builds a faceW × faceH wall panel with hex holes, extruded by thickness along +Z.
// Geometry is centered on the origin in XY — caller applies rotation and translation.
function buildHexWallPanel(
  faceW: number,
  faceH: number,
  thickness: number,
  p: BracketParams
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-faceW / 2, -faceH / 2);
  shape.lineTo(faceW / 2, -faceH / 2);
  shape.lineTo(faceW / 2, faceH / 2);
  shape.lineTo(-faceW / 2, faceH / 2);
  shape.closePath();
  shape.holes = hexHolePaths(faceW, faceH, p);
  return new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
}

// ---------------------------------------------------------------------------
// Shelf geometry — side walls use hex mesh panels; floor is BoxGeometry or hex panel
// ---------------------------------------------------------------------------

function buildShelf(p: BracketParams): THREE.BufferGeometry | null {
  if (p.shelfDepth <= 0 || p.cutoutWidth <= 0 || p.cutoutHeight <= 0) return null;

  const cw = p.cutoutWidth;
  const ch = p.cutoutHeight;
  const fd = p.faceplateDepth;
  const t = p.shelfWallThickness;
  const depth = p.shelfDepth;
  const zCenter = fd + depth / 2;

  const parts: THREE.BufferGeometry[] = [];

  // Bottom panel — solid BoxGeometry by default; hex panel when hexMeshFloor is enabled
  if (p.hexMeshFloor) {
    // faceW=cw, faceH=depth; extrude by t; rotate -90° around X so face lies in XZ plane
    const panel = buildHexWallPanel(cw, depth, t, p);
    panel.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    panel.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -(ch / 2 + t), zCenter));
    parts.push(panel.toNonIndexed());
    panel.dispose();
  } else {
    const bottom = new THREE.BoxGeometry(cw, t, depth);
    bottom.translate(0, -(ch / 2 + t / 2), zCenter);
    parts.push(bottom.toNonIndexed());
    bottom.dispose();
  }

  // Left wall — faceW=depth, faceH=ch+t; extrude by t; rotate -90° around Y
  const leftPanel = buildHexWallPanel(depth, ch + t, t, p);
  leftPanel.applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
  leftPanel.applyMatrix4(new THREE.Matrix4().makeTranslation(-cw / 2, -t / 2, zCenter));
  parts.push(leftPanel.toNonIndexed());
  leftPanel.dispose();

  // Right wall — same shape as left, mirrored translation
  const rightPanel = buildHexWallPanel(depth, ch + t, t, p);
  rightPanel.applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
  rightPanel.applyMatrix4(new THREE.Matrix4().makeTranslation(cw / 2 + t, -t / 2, zCenter));
  parts.push(rightPanel.toNonIndexed());
  rightPanel.dispose();

  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  return merged;
}

// ---------------------------------------------------------------------------
// Rail slot geometry — bumps above and below each hole on the backside
// ---------------------------------------------------------------------------

const SLOT_DEPTH_MM = 2.032; // 0.08"

function buildRailSlots(p: BracketParams): THREE.BufferGeometry | null {
  const positions = holePositions(p);
  if (positions.length === 0) return null;

  const fw = faceplateWidth(p);
  const slotW = p.holeDiameter - 0.01; // FR-010: slot width = hole diameter - 0.01mm
  const slotH = p.railSlotWidth;
  const leftX = -(fw / 2 - p.holeInset);
  const rightX = fw / 2 - p.holeInset;
  const zCenter = p.faceplateDepth + SLOT_DEPTH_MM / 2; // protrude from faceplateDepth outward, same side as shelf

  const parts: THREE.BufferGeometry[] = [];

  for (const pos of positions) {
    const topY = pos.y + p.holeDiameter / 2 + slotH / 2;
    const bottomY = pos.y - p.holeDiameter / 2 - slotH / 2;

    for (const hx of [leftX, rightX]) {
      const top = new THREE.BoxGeometry(slotW, slotH, SLOT_DEPTH_MM);
      top.translate(hx, topY, zCenter);
      parts.push(top);

      const bottom = new THREE.BoxGeometry(slotW, slotH, SLOT_DEPTH_MM);
      bottom.translate(hx, bottomY, zCenter);
      parts.push(bottom);
    }
  }

  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  return merged;
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export function buildBracket(p: BracketParams): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // ExtrudeGeometry must be converted to non-indexed before merging with BoxGeometry parts.
  const faceplate = buildFaceplate(p);
  parts.push(faceplate.toNonIndexed());
  faceplate.dispose();

  const shelf = buildShelf(p);
  if (shelf) {
    parts.push(shelf.toNonIndexed());
    shelf.dispose();
  }

  const slots = buildRailSlots(p);
  if (slots) {
    parts.push(slots.toNonIndexed());
    slots.dispose();
  }

  if (parts.length === 1) return parts[0];

  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());

  return merged ?? buildFaceplate(p);
}
