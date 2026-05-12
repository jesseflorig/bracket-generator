import { UnitSystem } from '../units/convert';

interface UnitToggleProps {
  value: UnitSystem;
  onChange: (unit: UnitSystem) => void;
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className="flex bg-zinc-800 p-1 rounded gap-1">
      {(['mm', 'in'] as UnitSystem[]).map((unit) => (
        <button
          key={unit}
          onClick={() => onChange(unit)}
          className={`flex-1 py-1 text-[10px] uppercase tracking-wider font-semibold rounded transition-colors ${
            value === unit
              ? 'bg-zinc-600 text-zinc-100 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {unit === 'in' ? 'inches' : 'millimeters'}
        </button>
      ))}
    </div>
  );
}
