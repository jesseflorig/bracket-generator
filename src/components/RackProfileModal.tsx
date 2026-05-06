import { useState, useRef } from 'react';
import { useBracketStore } from '../store/bracketStore';
import { RackProfileParams, VANLAB_ID, extractRackProfileParams } from '../models/rackProfile';
import { bracketParamsSchema, BracketParams } from '../models/bracketParams';
import { DimensionSlider } from './DimensionSlider';
import { UnitToggle } from './UnitToggle';

interface Props {
  onClose: () => void;
}

type RackErrors = Partial<Record<keyof RackProfileParams, string>>;

const RACK_FIELDS: (keyof RackProfileParams)[] = [
  'rackWidth', 'railWidth', 'holeDiameter', 'holeInset', 'holeEdgeOffset', 'railSlotWidth',
  'faceplateDepth', 'cornerRadius',
];

function validateDraft(draft: RackProfileParams, baseParams: BracketParams): RackErrors {
  const merged = { ...baseParams, ...draft };
  const result = bracketParamsSchema.safeParse(merged);
  if (result.success) return {};
  const fieldErrors = result.error.flatten().fieldErrors;
  const out: RackErrors = {};
  RACK_FIELDS.forEach((k) => {
    if (fieldErrors[k]?.[0]) out[k] = fieldErrors[k]![0];
  });
  return out;
}

function paramsEqual(a: RackProfileParams, b: RackProfileParams): boolean {
  return RACK_FIELDS.every((k) => a[k] === b[k]);
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 shadow-xl max-w-xs w-full mx-4">
        <p className="text-sm text-zinc-200 mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function RackProfileModal({ onClose }: Props) {
  const { params, unitSystem, setUnitSystem, rackProfiles, activeProfileId, upsertRackProfile, deleteRackProfile } =
    useBracketStore();

  const initialDraft = extractRackProfileParams(params);
  const [draft, setDraft] = useState<RackProfileParams>(initialDraft);
  const [nameInput, setNameInput] = useState(
    () => rackProfiles.find((p) => p.id === activeProfileId)?.name ?? ''
  );

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingSave, setPendingSave] = useState<{ id: string; name: string } | null>(null);

  const importRef = useRef<HTMLInputElement>(null);

  const errors = validateDraft(draft, params);
  const hasErrors = Object.keys(errors).length > 0;
  const isDirty = !paramsEqual(draft, initialDraft);

  const updateDraft = <K extends keyof RackProfileParams>(key: K, value: RackProfileParams[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleClose = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    const name = nameInput.trim();
    if (!name || hasErrors) return;

    const existingByName = rackProfiles.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== activeProfileId
    );

    if (existingByName) {
      setPendingSave({ id: existingByName.id, name });
      setShowOverwriteConfirm(true);
      return;
    }

    const isSameNameAsCurrent =
      rackProfiles.find((p) => p.id === activeProfileId)?.name.toLowerCase() === name.toLowerCase();

    upsertRackProfile(isSameNameAsCurrent ? activeProfileId : null, name, draft);
    onClose();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(rackProfiles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rack-profiles.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as typeof rackProfiles;
        if (!Array.isArray(imported)) return;
        // Merge: replace all non-Vanlab profiles with imported ones
        const { upsertRackProfile: upsert } = useBracketStore.getState();
        imported.forEach((p) => {
          if (p.id !== VANLAB_ID && p.name && p.params) {
            upsert(null, p.name, p.params);
          }
        });
      } catch {
        // silently ignore malformed JSON
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isVanlab = activeProfileId === VANLAB_ID;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-96 max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100">Rack Profile</h2>
            <button
              onClick={handleClose}
              className="text-zinc-500 hover:text-zinc-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>

          {/* Unit toggle */}
          <div className="px-5 py-3 border-b border-zinc-800">
            <UnitToggle value={unitSystem} onChange={setUnitSystem} />
          </div>

          {/* Sliders */}
          <div className="px-5 py-4 overflow-y-auto space-y-4">

            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Rack Dimensions</p>
              <div className="space-y-1">
                <DimensionSlider
                  label="Rack Width"
                  valueMm={draft.rackWidth}
                  onChange={(v) => updateDraft('rackWidth', v)}
                  minMm={50.8}
                  maxMm={609.6}
                  unitSystem={unitSystem}
                  error={errors.rackWidth}
                />
                <DimensionSlider
                  label="Rail Width"
                  valueMm={draft.railWidth}
                  onChange={(v) => updateDraft('railWidth', v)}
                  minMm={6.35}
                  maxMm={50.8}
                  unitSystem={unitSystem}
                  error={errors.railWidth}
                />
                <DimensionSlider
                  label="Hole Diameter"
                  valueMm={draft.holeDiameter}
                  onChange={(v) => updateDraft('holeDiameter', v)}
                  minMm={2.0}
                  maxMm={25.4}
                  unitSystem={unitSystem}
                  error={errors.holeDiameter}
                />
                <DimensionSlider
                  label="Hole Inset"
                  valueMm={draft.holeInset}
                  onChange={(v) => updateDraft('holeInset', v)}
                  minMm={1.0}
                  maxMm={100.0}
                  unitSystem={unitSystem}
                  error={errors.holeInset}
                />
                <DimensionSlider
                  label="Hole Edge Offset"
                  valueMm={draft.holeEdgeOffset}
                  onChange={(v) => updateDraft('holeEdgeOffset', v)}
                  minMm={1.0}
                  maxMm={63.5}
                  unitSystem={unitSystem}
                  error={errors.holeEdgeOffset}
                />
                <DimensionSlider
                  label="Rail Slot Width"
                  valueMm={draft.railSlotWidth}
                  onChange={(v) => updateDraft('railSlotWidth', v)}
                  minMm={3.175}
                  maxMm={19.05}
                  unitSystem={unitSystem}
                  error={errors.railSlotWidth}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Faceplate Standards</p>
              <div className="space-y-1">
                <DimensionSlider
                  label="Faceplate Depth"
                  valueMm={draft.faceplateDepth}
                  onChange={(v) => updateDraft('faceplateDepth', v)}
                  minMm={1.5875}
                  maxMm={6.35}
                  unitSystem={unitSystem}
                  error={errors.faceplateDepth}
                />
                <DimensionSlider
                  label="Corner Radius"
                  valueMm={draft.cornerRadius}
                  onChange={(v) => updateDraft('cornerRadius', v)}
                  minMm={0}
                  maxMm={15}
                  unitSystem={unitSystem}
                  error={errors.cornerRadius}
                />
              </div>
            </div>

          </div>

          {/* Save row */}
          <div className="px-5 py-3 border-t border-zinc-800 flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Profile name"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <button
              onClick={handleSave}
              disabled={!nameInput.trim() || hasErrors}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Save
            </button>
          </div>

          {/* Footer row */}
          <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => importRef.current?.click()}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Import
              </button>
              <input
                ref={importRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isVanlab}
              className="text-xs text-red-600 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Delete
            </button>
          </div>

        </div>
      </div>

      {/* Cancel confirm */}
      {showCancelConfirm && (
        <ConfirmDialog
          message="Discard changes to this profile?"
          onConfirm={onClose}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      {/* Overwrite confirm */}
      {showOverwriteConfirm && pendingSave && (
        <ConfirmDialog
          message={`A profile named "${pendingSave.name}" already exists. Overwrite it?`}
          onConfirm={() => {
            upsertRackProfile(pendingSave.id, pendingSave.name, draft);
            onClose();
          }}
          onCancel={() => {
            setShowOverwriteConfirm(false);
            setPendingSave(null);
          }}
        />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <ConfirmDialog
          message={`Delete "${rackProfiles.find((p) => p.id === activeProfileId)?.name}"? This cannot be undone.`}
          onConfirm={() => {
            deleteRackProfile(activeProfileId);
            onClose();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
