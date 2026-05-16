import { z } from 'zod';

export const bracketParamsSchema = z
  .object({
    // Rack
    rackWidth: z.number().min(50.8).max(609.6),
    // Rails (one per side)
    railWidth: z.number().min(6.35).max(50.8),
    // Faceplate (width is derived: rackWidth + 2 * railWidth)
    faceplateHeight: z.number().min(25.4).max(127.0),
    faceplateDepth: z.number().min(1.5875).max(6.35),
    cornerRadius: z.number().min(0).max(63.5),
    // Shelf
    shelfCount: z.number().int().min(0).max(10),
    shelfWallThickness: z.number().min(1.0).max(6.35),
    cutoutWidth: z.number().min(0).max(500),
    cutoutHeight: z.number().min(0).max(200),
    shelfDepth: z.number().min(0).max(304.8),
    // Mounting holes (count and positions are derived from faceplateHeight)
    holeDiameter: z.number().min(2.0).max(25.4),
    holeInset: z.number().min(1.0).max(100.0),
    holeEdgeOffset: z.number().min(1.0).max(63.5),
    // Rail slot parameter for backside mounting profile (0.125" to 0.75" range)
    railSlotWidth: z.number().min(3.175).max(19.05), // 0.125" to 0.75" in mm
    // Hex mesh cutout on shelf walls
    hexHoleDiameter: z.number().min(1.0).max(25.4),  // flat-to-flat, mm
    hexHoleGap: z.number().min(0).max(25.4),           // edge-to-edge gap between holes, mm
    hexHoleInset: z.number().min(0).max(50.8),          // inset margin from wall edges, mm
    hexMeshFloor: z.boolean(),                           // apply hex mesh to floor panel
    // Mode
    mode: z.enum(['shelf', 'keystone']).default('shelf'),
    keystoneCount: z.number().int().min(1).max(24).default(8),
    cm5PoeBaseShelf: z.boolean().default(false),
  })
  .superRefine((d, ctx) => {
    const fw = d.rackWidth + 2 * d.railWidth;
    const totalShelfWidth = d.shelfCount > 0 
      ? (d.shelfCount * d.cutoutWidth) + ((d.shelfCount + 1) * d.shelfWallThickness)
      : 0;

    if (d.mode === 'shelf') {
      if (totalShelfWidth > d.rackWidth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Total shelf width exceeds rack width',
          path: ['shelfCount'],
        });
      }

      if (d.shelfCount > 0 && d.cutoutWidth > (d.rackWidth - (d.shelfCount + 1) * d.shelfWallThickness) / d.shelfCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cutout too wide for shelf count and rack width',
          path: ['cutoutWidth'],
        });
      }

      if (d.cutoutHeight > d.faceplateHeight - 2 * d.shelfWallThickness) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cutout too tall for faceplate',
          path: ['cutoutHeight'],
        });
      }

      // Left hole center is at -(fw/2 - holeInset); its right edge at that + holeDiameter/2.
      // Cutout left edge is at -cutoutWidth/2. Overlap when cutoutWidth > fw - 2*holeInset - holeDiameter.
      if (d.cutoutWidth > 0 && d.cutoutWidth > fw - 2 * d.holeInset - d.holeDiameter) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mounting holes overlap the cutout opening',
          path: ['holeDiameter'],
        });
      }
    }

    if (d.mode === 'keystone') {
      const KEYSTONE_W = 14.8;
      const KEYSTONE_H = 16.2;
      const MIN_GAP = 4.0;
      const safeWidth = fw - 2 * d.holeInset - d.holeDiameter - 10; // 10mm buffer
      const totalKeystoneWidth = d.keystoneCount * KEYSTONE_W + (d.keystoneCount - 1) * MIN_GAP;
      
      if (totalKeystoneWidth > safeWidth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Too many keystones for the available faceplate width',
          path: ['keystoneCount'],
        });
      }

      if (KEYSTONE_H > d.faceplateHeight - 4) { // 2mm margin top/bottom
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Faceplate too short for keystone jacks',
          path: ['faceplateHeight'],
        });
      }
    }

    if (d.cornerRadius > Math.min(d.faceplateHeight, fw) / 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Corner radius too large for faceplate dimensions',
        path: ['cornerRadius'],
      });
    }

    if (d.holeInset < d.holeDiameter / 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Inset must be greater than hole radius',
        path: ['holeInset'],
      });
    }

    if (d.holeEdgeOffset < d.holeDiameter / 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Edge offset must be greater than hole radius',
        path: ['holeEdgeOffset'],
      });
    }
  });

export type BracketParams = z.infer<typeof bracketParamsSchema>;

export type ShelfConstraintKey = keyof BracketParams;

export const SHELF_LIMITS = {
  countMin: 0,
  countMax: 10,
  widthMin: 0,
  widthMax: 500,
  heightMin: 0,
  heightMax: 200,
  wallThicknessMin: 1.0,
  wallThicknessMax: 6.35,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampShelfCount(value: number): number {
  return Math.round(clamp(value, SHELF_LIMITS.countMin, SHELF_LIMITS.countMax));
}

export function shelfTotalWidth(p: Pick<BracketParams, 'rackWidth' | 'shelfCount' | 'cutoutWidth' | 'shelfWallThickness'>): number {
  if (p.shelfCount <= 0) return 0;
  return p.shelfCount * p.cutoutWidth + (p.shelfCount + 1) * p.shelfWallThickness;
}

export function maxShelfCountForRack(
  p: Pick<BracketParams, 'rackWidth' | 'cutoutWidth' | 'shelfWallThickness'>
): number {
  const denominator = p.cutoutWidth + p.shelfWallThickness;
  if (denominator <= 0) return SHELF_LIMITS.countMax;
  return clampShelfCount(Math.floor((p.rackWidth - p.shelfWallThickness) / denominator));
}

export function maxCutoutWidthForRack(
  p: Pick<BracketParams, 'rackWidth' | 'shelfCount' | 'shelfWallThickness'>
): number {
  if (p.shelfCount <= 0) return SHELF_LIMITS.widthMax;
  const maxWidth = (p.rackWidth - (p.shelfCount + 1) * p.shelfWallThickness) / p.shelfCount;
  return clamp(maxWidth, SHELF_LIMITS.widthMin, SHELF_LIMITS.widthMax);
}

export function maxShelfWallThicknessForRack(
  p: Pick<BracketParams, 'rackWidth' | 'shelfCount' | 'cutoutWidth'>
): number {
  if (p.shelfCount <= 0) return SHELF_LIMITS.wallThicknessMax;
  const maxThickness = (p.rackWidth - p.shelfCount * p.cutoutWidth) / (p.shelfCount + 1);
  return clamp(maxThickness, SHELF_LIMITS.wallThicknessMin, SHELF_LIMITS.wallThicknessMax);
}

export function maxCutoutHeightForFaceplate(
  p: Pick<BracketParams, 'faceplateHeight' | 'shelfWallThickness'>
): number {
  return clamp(
    p.faceplateHeight - 2 * p.shelfWallThickness,
    SHELF_LIMITS.heightMin,
    SHELF_LIMITS.heightMax
  );
}

export function constrainShelfParams(params: BracketParams, changedKey?: ShelfConstraintKey): BracketParams {
  if (params.mode !== 'shelf') return params;

  const next: BracketParams = {
    ...params,
    shelfCount: clampShelfCount(params.shelfCount),
    cutoutWidth: clamp(params.cutoutWidth, SHELF_LIMITS.widthMin, SHELF_LIMITS.widthMax),
    cutoutHeight: clamp(params.cutoutHeight, SHELF_LIMITS.heightMin, SHELF_LIMITS.heightMax),
    shelfWallThickness: clamp(
      params.shelfWallThickness,
      SHELF_LIMITS.wallThicknessMin,
      SHELF_LIMITS.wallThicknessMax
    ),
  };

  if (next.shelfCount <= 0) return next;

  if (changedKey === 'shelfCount') {
    next.shelfCount = Math.min(next.shelfCount, maxShelfCountForRack(next));
  } else if (changedKey === 'cutoutWidth') {
    next.cutoutWidth = Math.min(next.cutoutWidth, maxCutoutWidthForRack(next));
  } else if (changedKey === 'shelfWallThickness') {
    next.shelfWallThickness = Math.min(next.shelfWallThickness, maxShelfWallThicknessForRack(next));
  } else {
    next.cutoutWidth = Math.min(next.cutoutWidth, maxCutoutWidthForRack(next));
    next.shelfWallThickness = Math.min(next.shelfWallThickness, maxShelfWallThicknessForRack(next));
    next.shelfCount = Math.min(next.shelfCount, maxShelfCountForRack(next));
  }

  if (shelfTotalWidth(next) > next.rackWidth && changedKey !== 'cutoutWidth') {
    next.cutoutWidth = Math.min(next.cutoutWidth, maxCutoutWidthForRack(next));
  }
  if (shelfTotalWidth(next) > next.rackWidth && changedKey !== 'shelfWallThickness') {
    next.shelfWallThickness = Math.min(next.shelfWallThickness, maxShelfWallThicknessForRack(next));
  }
  if (shelfTotalWidth(next) > next.rackWidth && changedKey !== 'shelfCount') {
    next.shelfCount = Math.min(next.shelfCount, maxShelfCountForRack(next));
  }

  next.cutoutHeight = Math.min(next.cutoutHeight, maxCutoutHeightForFaceplate(next));

  return next;
}

export const DEFAULT_PARAMS: BracketParams = {
  rackWidth: 165.1,          // 6.5"
  railWidth: 25.4,           // 1.0"
  faceplateHeight: 31.75,    // 1.25"
  faceplateDepth: 3.175,     // 0.125"
  cornerRadius: 1.0,         // 1mm
  shelfCount: 1,
  shelfWallThickness: 3.175, // 0.125"
  cutoutWidth: 127.0,        // 5.0"
  cutoutHeight: 19.05,       // 0.75"
  shelfDepth: 50.8,          // 2.0"
  holeDiameter: 6.604,       // 0.26"
  holeInset: 12.7,           // 0.5"
  holeEdgeOffset: 12.7,      // 0.5"
  railSlotWidth: 6.35,       // 0.25" (default)
  hexHoleDiameter: 3.175,    // 0.125"
  hexHoleGap: 1.5875,        // 0.0625"
  hexHoleInset: 3.175,       // 0.125"
  hexMeshFloor: false,
  mode: 'shelf',
  keystoneCount: 8,
  cm5PoeBaseShelf: false,
};

export interface ExportPayload {
  geometry: import('three').BufferGeometry;
  params: BracketParams;
  filename: string;
}
