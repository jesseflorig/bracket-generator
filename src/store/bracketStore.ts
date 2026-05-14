import { create } from 'zustand';
import { BracketParams, DEFAULT_PARAMS, constrainShelfParams } from '../models/bracketParams';
import { UnitSystem } from '../units/convert';
import {
  RackProfile,
  RackProfileParams,
  VANLAB_ID,
  loadProfilesFromStorage,
  saveProfilesToStorage,
  loadActiveProfileIdFromStorage,
  saveActiveProfileIdToStorage,
} from '../models/rackProfile';

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const initialProfiles = loadProfilesFromStorage();
const initialActiveId = (() => {
  const id = loadActiveProfileIdFromStorage();
  return initialProfiles.some((p) => p.id === id) ? id : initialProfiles[0].id;
})();
const initialActiveProfile = initialProfiles.find((p) => p.id === initialActiveId)!;

interface AppState {
  params: BracketParams;
  unitSystem: UnitSystem;
  rackProfiles: RackProfile[];
  activeProfileId: string;

  setParam: <K extends keyof BracketParams>(key: K, value: BracketParams[K]) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  resetToDefaults: () => void;

  setActiveProfile: (id: string) => void;
  upsertRackProfile: (id: string | null, name: string, profileParams: RackProfileParams) => void;
  deleteRackProfile: (id: string) => void;
}

export const useBracketStore = create<AppState>((set, get) => ({
  params: constrainShelfParams({ ...DEFAULT_PARAMS, ...initialActiveProfile.params }),
  unitSystem: 'mm',
  rackProfiles: initialProfiles,
  activeProfileId: initialActiveId,

  setParam: (key, value) =>
    set((state) => {
      const next = { ...state.params, [key]: value };
      return { params: constrainShelfParams(next, key) };
    }),
  setUnitSystem: (unit) => set({ unitSystem: unit }),
  resetToDefaults: () => set({ params: constrainShelfParams(DEFAULT_PARAMS) }),

  setActiveProfile: (id) => {
    const { rackProfiles, params } = get();
    const profile = rackProfiles.find((p) => p.id === id);
    if (!profile) return;
    saveActiveProfileIdToStorage(id);
    set({ activeProfileId: id, params: constrainShelfParams({ ...params, ...profile.params }) });
  },

  upsertRackProfile: (id, name, profileParams) => {
    const { rackProfiles, params } = get();
    let newProfiles: RackProfile[];
    let finalId: string;

    if (id !== null) {
      finalId = id;
      newProfiles = rackProfiles.map((p) =>
        p.id === id ? { ...p, name, params: profileParams } : p
      );
    } else {
      finalId = generateId();
      newProfiles = [...rackProfiles, { id: finalId, name, params: profileParams }];
    }

    saveProfilesToStorage(newProfiles);
    saveActiveProfileIdToStorage(finalId);
    set({
      rackProfiles: newProfiles,
      activeProfileId: finalId,
      params: constrainShelfParams({ ...params, ...profileParams }),
    });
  },

  deleteRackProfile: (id) => {
    if (id === VANLAB_ID) return;
    const { rackProfiles, activeProfileId, params } = get();
    const newProfiles = rackProfiles.filter((p) => p.id !== id);
    saveProfilesToStorage(newProfiles);

    if (activeProfileId === id) {
      const fallback = newProfiles[0];
      saveActiveProfileIdToStorage(fallback.id);
      set({
        rackProfiles: newProfiles,
        activeProfileId: fallback.id,
        params: constrainShelfParams({ ...params, ...fallback.params }),
      });
    } else {
      set({ rackProfiles: newProfiles });
    }
  },
}));
