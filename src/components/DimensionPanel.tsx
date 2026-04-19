import { useState } from 'react';
import { useBracketStore } from '../store/bracketStore';
import { bracketParamsSchema, BracketParams } from '../models/bracketParams';
import { DimensionSlider } from './DimensionSlider';
import { UnitToggle } from './UnitToggle';

type Errors = Partial<Record<keyof BracketParams, string>>;

function flattenZodErrors(params: Partial<BracketParams>): Errors {
  const result = bracketParamsSchema.safeParse(params);
  if (result.success) return {};
  const fieldErrors = result.error.flatten().fieldErrors;
  const out: Errors = {};
  Object.entries(fieldErrors).forEach(([k, msgs]) => {
    if (msgs?.[0]) out[k as keyof BracketParams] = msgs[0];
  });
  return out;
}

export function DimensionPanel() {
  const { params, setParam, unitSystem, setUnitSystem, resetToDefaults } =
    useBracketStore();
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = <K extends keyof BracketParams>(
    key: K,
    valueMm: BracketParams[K]
  ) => {
    const candidate = { ...params, [key]: valueMm };
    const errs = flattenZodErrors(candidate);
    setErrors(errs);
    // Always update store for immediate 3D feedback; errors shown as warnings
    setParam(key, valueMm);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
          Bracket Generator
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Server rack mount bracket
        </p>
      </div>

      {/* Scrollable controls */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">

        {/* Unit system */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Units</p>
          <UnitToggle value={unitSystem} onChange={setUnitSystem} />
        </div>

        {/* Bracket type */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Type</p>
          <div className="flex rounded overflow-hidden border border-zinc-700 text-sm">
            {(['L', 'U'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleChange('bracketType', t)}
                className={`flex-1 px-3 py-1 text-center transition-colors ${
                  params.bracketType === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t}-Bracket
              </button>
            ))}
          </div>
        </div>

        {/* Shape */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Shape</p>
          <DimensionSlider
            label="Width"
            valueMm={params.width}
            onChange={(v) => handleChange('width', v)}
            minMm={10}
            maxMm={500}
            unitSystem={unitSystem}
            error={errors.width}
          />
          <DimensionSlider
            label="Height"
            valueMm={params.height}
            onChange={(v) => handleChange('height', v)}
            minMm={10}
            maxMm={500}
            unitSystem={unitSystem}
            error={errors.height}
          />
          <DimensionSlider
            label="Depth"
            valueMm={params.depth}
            onChange={(v) => handleChange('depth', v)}
            minMm={10}
            maxMm={300}
            unitSystem={unitSystem}
            error={errors.depth}
          />
          <DimensionSlider
            label="Thickness"
            valueMm={params.thickness}
            onChange={(v) => handleChange('thickness', v)}
            minMm={1}
            maxMm={20}
            unitSystem={unitSystem}
            error={errors.thickness}
          />
        </div>

        {/* Holes */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Holes</p>
          <DimensionSlider
            label="Count"
            valueMm={params.holeCount}
            onChange={(v) => handleChange('holeCount', v)}
            minMm={0}
            maxMm={8}
            isUnitless
            isInteger
            unitSystem={unitSystem}
            error={errors.holeCount}
          />
          {params.holeCount > 0 && (
            <>
              <DimensionSlider
                label="Diameter"
                valueMm={params.holeDiameter}
                onChange={(v) => handleChange('holeDiameter', v)}
                minMm={2}
                maxMm={20}
                unitSystem={unitSystem}
                error={errors.holeDiameter}
              />
              <DimensionSlider
                label="Spacing"
                valueMm={params.holeSpacing}
                onChange={(v) => handleChange('holeSpacing', v)}
                minMm={5}
                maxMm={200}
                unitSystem={unitSystem}
                error={errors.holeSpacing}
              />
              <DimensionSlider
                label="Inset"
                valueMm={params.holeInset}
                onChange={(v) => handleChange('holeInset', v)}
                minMm={3}
                maxMm={100}
                unitSystem={unitSystem}
                error={errors.holeInset}
              />
            </>
          )}
        </div>
      </div>

      {/* Reset button */}
      <div className="px-4 py-2 border-t border-zinc-800">
        <button
          onClick={resetToDefaults}
          className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
