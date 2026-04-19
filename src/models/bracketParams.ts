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
    shelfWallThickness: z.number().min(1.0).max(6.35),
    cutoutWidth: z.number().min(0).max(500),
    cutoutHeight: z.number().min(0).max(200),
    shelfDepth: z.number().min(0).max(304.8),
    // Mounting holes (count and positions are derived from faceplateHeight)
    holeDiameter: z.number().min(2.0).max(25.4),
    holeInset: z.number().min(1.0).max(100.0),
    holeEdgeOffset: z.number().min(1.0).max(63.5),
  })
  .superRefine((d, ctx) => {
    const fw = d.rackWidth + 2 * d.railWidth;

    if (d.cornerRadius > Math.min(d.faceplateHeight, fw) / 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Corner radius too large for faceplate dimensions',
        path: ['cornerRadius'],
      });
    }

    if (d.shelfWallThickness * 2 >= d.rackWidth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wall thickness too large for rack width',
        path: ['shelfWallThickness'],
      });
    }

    if (d.cutoutWidth > fw - 2 * d.shelfWallThickness) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cutout too wide for faceplate',
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

    // Left hole center is at -(fw/2 - holeInset); its right edge at that + holeDiameter/2.
    // Cutout left edge is at -cutoutWidth/2. Overlap when cutoutWidth > fw - 2*holeInset - holeDiameter.
    if (d.cutoutWidth > 0 && d.cutoutWidth > fw - 2 * d.holeInset - d.holeDiameter) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mounting holes overlap the cutout opening',
        path: ['holeDiameter'],
      });
    }
  });

export type BracketParams = z.infer<typeof bracketParamsSchema>;

export const DEFAULT_PARAMS: BracketParams = {
  rackWidth: 165.1,          // 6.5"
  railWidth: 25.4,           // 1.0"
  faceplateHeight: 31.75,    // 1.25"
  faceplateDepth: 3.175,     // 0.125"
  cornerRadius: 1.0,         // 1mm
  shelfWallThickness: 3.175, // 0.125"
  cutoutWidth: 127.0,        // 5.0"
  cutoutHeight: 19.05,       // 0.75"
  shelfDepth: 50.8,          // 2.0"
  holeDiameter: 6.604,       // 0.26"
  holeInset: 12.7,           // 0.5"
  holeEdgeOffset: 12.7,      // 0.5"
};

export interface ExportPayload {
  geometry: import('three').BufferGeometry;
  params: BracketParams;
  filename: string;
}
