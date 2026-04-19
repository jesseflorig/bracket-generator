import { create } from 'zustand';
import { BracketParams, DEFAULT_PARAMS } from '../models/bracketParams';
import { UnitSystem } from '../units/convert';

interface AppState {
  params: BracketParams;
  unitSystem: UnitSystem;
  setParam: <K extends keyof BracketParams>(key: K, value: BracketParams[K]) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  resetToDefaults: () => void;
}

export const useBracketStore = create<AppState>((set) => ({
  params: DEFAULT_PARAMS,
  unitSystem: 'mm',
  setParam: (key, value) =>
    set((state) => ({ params: { ...state.params, [key]: value } })),
  setUnitSystem: (unit) => set({ unitSystem: unit }),
  resetToDefaults: () => set({ params: DEFAULT_PARAMS }),
}));
