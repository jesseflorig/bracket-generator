import { UnitSystem, fromMm, toMm } from '../units/convert';
import { ValidationMessage } from './ValidationMessage';

interface DimensionSliderProps {
  label: string;
  valueMm: number;
  onChange: (valueMm: number) => void;
  minMm: number;
  maxMm: number;
  step?: number;
  /** True for unitless integer fields like holeCount */
  isUnitless?: boolean;
  isInteger?: boolean;
  unitSystem: UnitSystem;
  error?: string;
}

export function DimensionSlider({
  label,
  valueMm,
  onChange,
  minMm,
  maxMm,
  step,
  isUnitless = false,
  isInteger = false,
  unitSystem,
  error,
}: DimensionSliderProps) {
  const displayMin = isUnitless ? minMm : fromMm(minMm, unitSystem);
  const displayMax = isUnitless ? maxMm : fromMm(maxMm, unitSystem);
  const displayValue = isUnitless ? valueMm : fromMm(valueMm, unitSystem);
  const displayStep = step ?? (isUnitless || isInteger ? 1 : unitSystem === 'in' ? 0.05 : 0.5);
  const unitLabel = isUnitless ? '' : unitSystem;

  const handleChange = (raw: number) => {
    const clamped = Math.min(displayMax, Math.max(displayMin, raw));
    const rounded = isInteger ? Math.round(clamped) : clamped;
    const newMm = isUnitless ? rounded : toMm(rounded, unitSystem);
    onChange(newMm);
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-xs text-zinc-400 uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={displayMin}
            max={displayMax}
            step={displayStep}
            value={isInteger ? Math.round(displayValue) : parseFloat(displayValue.toFixed(2))}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            className="w-20 text-right text-sm bg-zinc-800 text-zinc-100 border border-zinc-700 rounded px-2 py-0.5 focus:outline-none focus:border-blue-500"
          />
          {unitLabel && (
            <span className="text-xs text-zinc-500 w-6">{unitLabel}</span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={displayMin}
        max={displayMax}
        step={displayStep}
        value={isInteger ? Math.round(displayValue) : displayValue}
        onChange={(e) => handleChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <ValidationMessage message={error} />
    </div>
  );
}
