import { BracketParams, DEFAULT_PARAMS } from './bracketParams';

export type RackProfileParams = Pick<BracketParams,
  'rackWidth' | 'railWidth' | 'holeDiameter' | 'holeInset' | 'holeEdgeOffset' | 'railSlotWidth' |
  'faceplateDepth' | 'cornerRadius'
>;

export interface RackProfile {
  id: string;
  name: string;
  params: RackProfileParams;
}

export const VANLAB_ID = 'vanlab';

export const VANLAB_PROFILE: RackProfile = {
  id: VANLAB_ID,
  name: 'Vanlab',
  params: {
    rackWidth: DEFAULT_PARAMS.rackWidth,
    railWidth: DEFAULT_PARAMS.railWidth,
    holeDiameter: DEFAULT_PARAMS.holeDiameter,
    holeInset: DEFAULT_PARAMS.holeInset,
    holeEdgeOffset: DEFAULT_PARAMS.holeEdgeOffset,
    railSlotWidth: DEFAULT_PARAMS.railSlotWidth,
    faceplateDepth: DEFAULT_PARAMS.faceplateDepth,
    cornerRadius: DEFAULT_PARAMS.cornerRadius,
  },
};

const STORAGE_PROFILES = 'rack-profiles';
const STORAGE_ACTIVE = 'rack-active-profile-id';

export function loadProfilesFromStorage(): RackProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    if (!raw) return [VANLAB_PROFILE];
    const parsed = JSON.parse(raw) as RackProfile[];
    const hasVanlab = parsed.some((p) => p.id === VANLAB_ID);
    return hasVanlab ? parsed : [VANLAB_PROFILE, ...parsed];
  } catch {
    return [VANLAB_PROFILE];
  }
}

export function saveProfilesToStorage(profiles: RackProfile[]): void {
  localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
}

export function loadActiveProfileIdFromStorage(): string {
  return localStorage.getItem(STORAGE_ACTIVE) ?? VANLAB_ID;
}

export function saveActiveProfileIdToStorage(id: string): void {
  localStorage.setItem(STORAGE_ACTIVE, id);
}

export function extractRackProfileParams(params: BracketParams): RackProfileParams {
  return {
    rackWidth: params.rackWidth,
    railWidth: params.railWidth,
    holeDiameter: params.holeDiameter,
    holeInset: params.holeInset,
    holeEdgeOffset: params.holeEdgeOffset,
    railSlotWidth: params.railSlotWidth,
    faceplateDepth: params.faceplateDepth,
    cornerRadius: params.cornerRadius,
  };
}
