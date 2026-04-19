import { useState, useEffect } from 'react';
import { useBracketStore } from '../store/bracketStore';
import { bracketParamsSchema, BracketParams } from '../models/bracketParams';
import {
  faceplateWidth,
  shelfMaxWidth,
  holeCount,
} from '../geometry/bracket';
import { DimensionSlider } from './DimensionSlider';
import { UnitToggle } from './UnitToggle';
import { fromMm } from '../units/convert';

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

function ReadOnlyField({
  label,
  valueMm,
  unitSystem,
}: {
  label: string;
  valueMm: number;
  unitSystem: 'mm' | 'in';
}) {
  const displayed = fromMm(valueMm, unitSystem).toFixed(3);
  const unit = unitSystem === 'in' ? '"' : 'mm';
  return (
    <div className="flex items-center justify-between py-1 text-xs text-zinc-500">
      <span>{label}</span>
      <span className="font-mono text-zinc-400">
        {displayed} {unit} <span className="text-zinc-600">(derived)</span>
      </span>
    </div>
  );
}

export function DimensionPanel() {
  const { params, setParam, unitSystem, setUnitSystem, resetToDefaults } =
    useBracketStore();

  const [rackCollapsed, setRackCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('ui-rack-profile-collapsed');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('ui-rack-profile-collapsed', String(rackCollapsed));
  }, [rackCollapsed]);

  const handleChange = <K extends keyof BracketParams>(
    key: K,
    valueMm: BracketParams[K]
  ) => {
    setParam(key, valueMm);
  };

  const errors = flattenZodErrors(params);

  const fw = faceplateWidth(params);
  const smw = shelfMaxWidth(params);
  const count = holeCount(params);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
          Bracket Generator
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">Server rack mount bracket</p>
      </div>

      {/* Scrollable controls */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">

        {/* Units */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Units</p>
          <UnitToggle value={unitSystem} onChange={setUnitSystem} />
        </div>

        {/* Rack Profile — collapsible */}
        <div>
          <button
            onClick={() => setRackCollapsed((c) => !c)}
            className="flex items-center justify-between w-full text-xs text-zinc-500 uppercase tracking-wide mb-2 hover:text-zinc-300 transition-colors"
          >
            <span>Rack Profile</span>
            <svg
              className={`w-3 h-3 transition-transform duration-150 ${rackCollapsed ? '-rotate-90' : ''}`}
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2,4 6,8 10,4" />
            </svg>
          </button>
          <ReadOnlyField label="Faceplate Width" valueMm={fw} unitSystem={unitSystem} />
          {!rackCollapsed && (
            <>
              <DimensionSlider
                label="Rack Width"
                valueMm={params.rackWidth}
                onChange={(v) => handleChange('rackWidth', v)}
                minMm={50.8}
                maxMm={609.6}
                unitSystem={unitSystem}
                error={errors.rackWidth}
              />
              <DimensionSlider
                label="Rail Width"
                valueMm={params.railWidth}
                onChange={(v) => handleChange('railWidth', v)}
                minMm={6.35}
                maxMm={50.8}
                unitSystem={unitSystem}
                error={errors.railWidth}
              />
              <div className="flex items-center justify-between py-1 text-xs text-zinc-500">
                <span>Holes (per side)</span>
                <span className="font-mono text-zinc-400">
                  {count} <span className="text-zinc-600">(derived)</span>
                </span>
              </div>
              <DimensionSlider
                label="Hole Diameter"
                valueMm={params.holeDiameter}
                onChange={(v) => handleChange('holeDiameter', v)}
                minMm={2.0}
                maxMm={25.4}
                unitSystem={unitSystem}
                error={errors.holeDiameter}
              />
              <DimensionSlider
                label="Hole Inset"
                valueMm={params.holeInset}
                onChange={(v) => handleChange('holeInset', v)}
                minMm={1.0}
                maxMm={100.0}
                unitSystem={unitSystem}
                error={errors.holeInset}
              />
              <DimensionSlider
                label="Hole Edge Offset"
                valueMm={params.holeEdgeOffset}
                onChange={(v) => handleChange('holeEdgeOffset', v)}
                minMm={1.0}
                maxMm={63.5}
                unitSystem={unitSystem}
                error={errors.holeEdgeOffset}
              />
            </>
          )}
        </div>

        {/* Faceplate */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Faceplate</p>
          <DimensionSlider
            label="Height"
            valueMm={params.faceplateHeight}
            onChange={(v) => handleChange('faceplateHeight', v)}
            minMm={25.4}
            maxMm={127.0}
            unitSystem={unitSystem}
            error={errors.faceplateHeight}
          />
          <DimensionSlider
            label="Depth"
            valueMm={params.faceplateDepth}
            onChange={(v) => handleChange('faceplateDepth', v)}
            minMm={1.5875}
            maxMm={6.35}
            unitSystem={unitSystem}
            error={errors.faceplateDepth}
          />
          <DimensionSlider
            label="Corner Radius"
            valueMm={params.cornerRadius}
            onChange={(v) => handleChange('cornerRadius', v)}
            minMm={0}
            maxMm={15}
            unitSystem={unitSystem}
            error={errors.cornerRadius}
          />
        </div>

        {/* Cutout */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Cutout</p>
          <DimensionSlider
            label="Width"
            valueMm={params.cutoutWidth}
            onChange={(v) => handleChange('cutoutWidth', v)}
            minMm={0}
            maxMm={500}
            unitSystem={unitSystem}
            error={errors.cutoutWidth}
          />
          <DimensionSlider
            label="Height"
            valueMm={params.cutoutHeight}
            onChange={(v) => handleChange('cutoutHeight', v)}
            minMm={0}
            maxMm={200}
            unitSystem={unitSystem}
            error={errors.cutoutHeight}
          />
        </div>

        {/* Shelf */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Shelf</p>
          <DimensionSlider
            label="Depth"
            valueMm={params.shelfDepth}
            onChange={(v) => handleChange('shelfDepth', v)}
            minMm={0}
            maxMm={304.8}
            unitSystem={unitSystem}
            error={errors.shelfDepth}
          />
          <DimensionSlider
            label="Wall Thickness"
            valueMm={params.shelfWallThickness}
            onChange={(v) => handleChange('shelfWallThickness', v)}
            minMm={1.0}
            maxMm={6.35}
            unitSystem={unitSystem}
            error={errors.shelfWallThickness}
          />
          <ReadOnlyField label="Max Inner Width" valueMm={smw} unitSystem={unitSystem} />
        </div>

      </div>

      {/* Reset */}
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
