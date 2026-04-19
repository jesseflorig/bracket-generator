import { UnitSystem } from '../units/convert';

interface UnitToggleProps {
  value: UnitSystem;
  onChange: (unit: UnitSystem) => void;
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className="flex rounded overflow-hidden border border-zinc-700 text-sm">
      {(['mm', 'in'] as UnitSystem[]).map((unit) => (
        <button
          key={unit}
          onClick={() => onChange(unit)}
          className={`flex-1 px-3 py-1 text-center transition-colors ${
            value === unit
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}
