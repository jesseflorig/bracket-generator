import { useState } from 'react';
import { useBracketStore } from '../store/bracketStore';
import { bracketParamsSchema, BracketParams } from '../models/bracketParams';
import { faceplateWidth, keystoneExteriorWidth } from '../geometry/bracket';
import { DimensionSlider } from './DimensionSlider';
import { UnitToggle } from './UnitToggle';
import { fromMm } from '../units/convert';
import { RackProfileModal } from './RackProfileModal';

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
  derived = true,
}: {
  label: string;
  valueMm: number;
  unitSystem: 'mm' | 'in';
  derived?: boolean;
}) {
  const displayed = fromMm(valueMm, unitSystem).toFixed(2);
  const unit = unitSystem === 'in' ? '"' : 'mm';
  return (
    <div className="flex items-center justify-between py-1 text-xs text-zinc-500">
      <span>{label}</span>
      <span className="font-mono text-zinc-400">
        {displayed} {unit}
        {derived && <span className="text-zinc-600"> (derived)</span>}
      </span>
    </div>
  );
}

function ReadOnlyTextField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs text-zinc-500">
      <span>{label}</span>
      <span className="font-mono text-zinc-400">{value}</span>
    </div>
  );
}

export function DimensionPanel() {
  const { params, setParam, unitSystem, setUnitSystem, resetToDefaults, rackProfiles, activeProfileId, setActiveProfile } =
    useBracketStore();

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleChange = <K extends keyof BracketParams>(
    key: K,
    valueMm: BracketParams[K]
  ) => {
    setParam(key, valueMm);
  };

  const errors = flattenZodErrors(params);

  const fw = faceplateWidth(params);
  const totalShelfWidth = params.shelfCount > 0 
    ? (params.shelfCount * params.cutoutWidth) + ((params.shelfCount + 1) * params.shelfWallThickness)
    : 0;
  const shelfWidthPercent = params.rackWidth > 0 ? (totalShelfWidth / params.rackWidth) * 100 : 0;
  const widthBudgetLabel = `${shelfWidthPercent.toFixed(2)}%`;
  const totalKeystoneExteriorWidth = keystoneExteriorWidth(params);
  const keystoneWidthPercent = params.rackWidth > 0 ? (totalKeystoneExteriorWidth / params.rackWidth) * 100 : 0;
  const keystoneWidthBudgetLabel = `${keystoneWidthPercent.toFixed(2)}%`;

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

        {/* Rack Profile — dropdown + edit */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Rack Profile</p>
          <div className="flex items-center gap-2 mb-1">
            <select
              value={activeProfileId}
              onChange={(e) => setActiveProfile(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 cursor-pointer"
            >
              {rackProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 hover:border-zinc-500 transition-colors cursor-pointer"
              aria-label="Edit rack profile"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" />
              </svg>
            </button>
          </div>
          <ReadOnlyField label="Faceplate Width" valueMm={fw} unitSystem={unitSystem} derived={false} />
        </div>

        {/* Mode */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Generation Mode</p>
          <div className="flex bg-zinc-800 p-1 rounded gap-1">
            {(['shelf', 'keystone'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleChange('mode', m)}
                className={`flex-1 py-1 text-[10px] uppercase tracking-wider font-semibold rounded transition-colors ${
                  params.mode === m
                    ? 'bg-zinc-600 text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
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
        </div>

        {params.mode === 'keystone' && (
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Keystone Configuration</p>
            <DimensionSlider
              label="Keystone Count"
              valueMm={params.keystoneCount}
              onChange={(v) => handleChange('keystoneCount', v)}
              minMm={1}
              maxMm={24}
              isUnitless
              isInteger
              unitSystem={unitSystem}
              error={errors.keystoneCount}
            />
            <ReadOnlyField
              label="Rack Width"
              valueMm={params.rackWidth}
              unitSystem={unitSystem}
              derived={false}
            />
            <ReadOnlyField
              label="Total Exterior Width"
              valueMm={totalKeystoneExteriorWidth}
              unitSystem={unitSystem}
              derived={false}
            />
            <ReadOnlyTextField label="Width Budget" value={keystoneWidthBudgetLabel} />
            <div className="p-2 bg-zinc-800/50 rounded border border-zinc-700/50">
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Standard 14.8 x 16.2mm cutouts with a 10mm stepped jack sleeve.
              </p>
            </div>
          </div>
        )}

        {params.mode === 'shelf' && (
          <>
            {/* Cutout */}
            <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Cutout</p>
          <DimensionSlider
            label="Count"
            valueMm={params.shelfCount}
            onChange={(v) => handleChange('shelfCount', v)}
            minMm={0}
            maxMm={10}
            isUnitless
            isInteger
            unitSystem={unitSystem}
            error={errors.shelfCount}
          />
          <DimensionSlider
            label="Width (per shelf)"
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
          <ReadOnlyField label="Rack Width" valueMm={params.rackWidth} unitSystem={unitSystem} derived={false} />
          <ReadOnlyField label="Total Shelf Width" valueMm={totalShelfWidth} unitSystem={unitSystem} derived={false} />
          <ReadOnlyTextField label="Width Budget" value={widthBudgetLabel} />
        </div>

        {/* Hex Mesh */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Hex Mesh</p>
          <DimensionSlider
            label="Hole Size"
            valueMm={params.hexHoleDiameter}
            onChange={(v) => handleChange('hexHoleDiameter', v)}
            minMm={1.0}
            maxMm={25.4}
            unitSystem={unitSystem}
            error={errors.hexHoleDiameter}
          />
          <DimensionSlider
            label="Gap"
            valueMm={params.hexHoleGap}
            onChange={(v) => handleChange('hexHoleGap', v)}
            minMm={0}
            maxMm={25.4}
            unitSystem={unitSystem}
            error={errors.hexHoleGap}
          />
          <DimensionSlider
            label="Inset"
            valueMm={params.hexHoleInset}
            onChange={(v) => handleChange('hexHoleInset', v)}
            minMm={0}
            maxMm={50.8}
            unitSystem={unitSystem}
            error={errors.hexHoleInset}
          />
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-zinc-300">Include Floor Panel</span>
            <input
              type="checkbox"
              checked={params.hexMeshFloor}
              onChange={(e) => handleChange('hexMeshFloor', e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </>
    )}

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

      {profileModalOpen && (
        <RackProfileModal onClose={() => setProfileModalOpen(false)} />
      )}
    </div>
  );
}
