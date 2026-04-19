import { z } from 'zod';

export const bracketParamsSchema = z
  .object({
    width: z.number().min(10).max(500),
    height: z.number().min(10).max(500),
    depth: z.number().min(10).max(300),
    thickness: z.number().min(1).max(20),
    holeCount: z.number().int().min(0).max(8),
    holeDiameter: z.number().min(2).max(20),
    holeSpacing: z.number().min(5).max(200),
    holeInset: z.number().min(3).max(100),
    bracketType: z.enum(['L', 'U']),
  })
  .superRefine((data, ctx) => {
    const minDim = Math.min(data.width, data.height, data.depth);
    if (data.thickness >= minDim / 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thickness too large for bracket dimensions',
        path: ['thickness'],
      });
    }

    if (data.bracketType === 'U' && data.depth <= 2 * data.thickness) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Depth too small for U-bracket (must be > 2× thickness)',
        path: ['depth'],
      });
    }

    if (data.holeCount > 0) {
      const totalSpan =
        data.holeInset + (data.holeCount - 1) * data.holeSpacing + data.holeInset;
      if (totalSpan > data.height) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Holes do not fit within bracket height',
          path: ['holeSpacing'],
        });
      }

      if (data.holeDiameter >= data.width - 2 * data.thickness) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Hole diameter too wide for bracket',
          path: ['holeDiameter'],
        });
      }

      if (data.holeInset <= data.holeDiameter / 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Inset must be greater than half the hole diameter',
          path: ['holeInset'],
        });
      }
    }
  });

export type BracketParams = z.infer<typeof bracketParamsSchema>;

export const DEFAULT_PARAMS: BracketParams = {
  width: 50,
  height: 80,
  depth: 30,
  thickness: 3,
  holeCount: 4,
  holeDiameter: 5,
  holeSpacing: 15,
  holeInset: 10,
  bracketType: 'L',
};

export interface ExportPayload {
  geometry: import('three').BufferGeometry;
  params: BracketParams;
  filename: string;
}
