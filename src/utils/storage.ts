const DEVICE_ID_KEY = 'robot_rescue:v1:device_id';
const CURRENT_PLAY_KEY = 'robot_rescue:v1:current_play';

export interface StoredPlayInfo {
  sessionId: string;
  playId: string;
  classCode: string;
  fullName: string;
  lastKnownStation: number;
  lastKnownPhase: string;
  updatedAt: number;
}

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id || typeof id !== 'string') {
      id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch (err) {
    console.warn('localStorage is unavailable:', err);
    return `temp_${Date.now()}`;
  }
}

export function getStoredPlay(): StoredPlayInfo | null {
  try {
    const raw = localStorage.getItem(CURRENT_PLAY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredPlayInfo;
  } catch {
    return null;
  }
}

export function saveStoredPlay(info: StoredPlayInfo): void {
  try {
    localStorage.setItem(CURRENT_PLAY_KEY, JSON.stringify(info));
  } catch (err) {
    console.warn('Cannot write to localStorage:', err);
  }
}

export function clearStoredPlay(): void {
  try {
    localStorage.removeItem(CURRENT_PLAY_KEY);
  } catch (err) {
    console.warn('Cannot clear localStorage:', err);
  }
}
