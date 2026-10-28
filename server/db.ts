import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb, Timestamp } from './firebaseAdmin.js';
import { ClassItem, SessionData, PlayData, PlayEvent } from '../shared/types.js';

export interface SystemStatus {
  isFirestoreConnected: boolean;
  storageMode: 'FIRESTORE' | 'LOCAL';
  notice: string;
}

export const DEFAULT_CLASSES: ClassItem[] = Array.from({ length: 9 }, (_, i) => ({
  code: `8C${i + 1}`,
  displayName: `Lớp 8C${i + 1}`,
  enabled: true,
  sortOrder: i + 1
}));

function isLocalMode(): boolean {
  return process.env.STORAGE_MODE === 'local';
}

function nowIso(): string {
  return new Date().toISOString();
}

function toIso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** Maze builds stored EXPLORE before the station flow. Those plays still need to answer. */
export function reopenLegacyExplore(play: PlayData): PlayData {
  if ((play.phase as string) !== 'EXPLORE') return play;
  return { ...play, phase: 'QUESTION', updatedAt: nowIso() };
}

function normalizeDates<T extends object>(data: T): T {
  const out = { ...data } as Record<string, unknown>;
  for (const key of ['createdAt', 'updatedAt', 'startedAt', 'completedAt']) {
    if (key in out) out[key] = toIso(out[key]);
  }
  return out as T;
}

function buildInitialPlay(
  playId: string,
  sessionId: string,
  deviceId: string,
  classCode: string,
  fullName: string
): PlayData {
  const now = nowIso();
  return {
    playId,
    sessionId,
    classCode,
    deviceId,
    fullName,
    currentStation: 1,
    phase: 'QUESTION',
    attemptsByStation: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    wrongByStation: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    hintsByStation: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    firstTryCorrectCount: 0,
    totalAttempts: 0,
    wrongAttempts: 0,
    completedStations: [],
    version: 1,
    startedAt: now,
    updatedAt: now,
    completedAt: null
  };
}

// ------------------- LOCAL FILE STORE (dev/test only) -------------------
interface LocalStoreData {
  classes: Record<string, ClassItem>;
  sessions: Record<string, SessionData>;
  plays: Record<string, PlayData>;
  events: Record<string, PlayEvent>;
}

const LOCAL_STORE_PATH = path.resolve(process.cwd(), '.data', 'store.json');

function saveLocalStore(data: LocalStoreData): void {
  fs.mkdirSync(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function loadLocalStore(): LocalStoreData {
  if (fs.existsSync(LOCAL_STORE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_STORE_PATH, 'utf8'));
    } catch {
      // Corrupted file: recreate below
    }
  }

  const now = nowIso();
  const demoSession: SessionData = {
    sessionId: 'ses_8c1_demo',
    classCode: '8C1',
    title: 'Tiết 14: Cấu trúc điều khiển trong Scratch (Mẫu)',
    status: 'ACTIVE',
    pin12: '1209',
    pin23: '4820',
    pin34: '7391',
    pin45: '0042',
    createdAt: now,
    updatedAt: now
  };

  const initial: LocalStoreData = {
    classes: Object.fromEntries(DEFAULT_CLASSES.map((c) => [c.code, c])),
    sessions: { [demoSession.sessionId]: demoSession },
    plays: {},
    events: {}
  };
  saveLocalStore(initial);
  return initial;
}

// ------------------- SYSTEM STATUS -------------------
export async function getSystemStatus(): Promise<SystemStatus> {
  if (isLocalMode()) {
    return {
      isFirestoreConnected: false,
      storageMode: 'LOCAL',
      notice: 'Chế độ phát triển: dữ liệu được lưu trong tệp .data/store.json trên máy.'
    };
  }
  try {
    await getDb().collection('classes').limit(1).get();
    return {
      isFirestoreConnected: true,
      storageMode: 'FIRESTORE',
      notice: 'Đang kết nối Firebase Cloud Firestore trực tiếp.'
    };
  } catch (err: any) {
    console.error('[Database] Firestore unavailable:', err.message);
    return {
      isFirestoreConnected: false,
      storageMode: 'FIRESTORE',
      notice: 'Không kết nối được Cloud Firestore. Vui lòng kiểm tra cấu hình máy chủ.'
    };
  }
}

// ------------------- CLASSES REPO -------------------
export async function getClasses(): Promise<ClassItem[]> {
  if (isLocalMode()) {
    return Object.values(loadLocalStore().classes)
      .filter((c) => c.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const snap = await getDb().collection('classes').where('enabled', '==', true).get();
  return snap.docs.map((d) => d.data() as ClassItem).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function seedClassesIfEmpty(): Promise<number> {
  if (isLocalMode()) {
    loadLocalStore();
    return 0;
  }

  const db = getDb();
  const snap = await db.collection('classes').limit(1).get();
  if (!snap.empty) return 0;

  const batch = db.batch();
  for (const c of DEFAULT_CLASSES) {
    batch.set(db.collection('classes').doc(c.code), c);
  }
  await batch.commit();
  return DEFAULT_CLASSES.length;
}

// ------------------- SESSIONS REPO -------------------
export async function getActiveSessionsForClass(classCode: string): Promise<SessionData[]> {
  if (isLocalMode()) {
    return Object.values(loadLocalStore().sessions).filter(
      (s) => s.classCode === classCode && s.status === 'ACTIVE'
    );
  }

  const snap = await getDb()
    .collection('sessions')
    .where('classCode', '==', classCode)
    .where('status', '==', 'ACTIVE')
    .get();
  return snap.docs.map((d) => normalizeDates(d.data() as SessionData));
}

export async function getSessionById(sessionId: string): Promise<SessionData | null> {
  if (isLocalMode()) {
    return loadLocalStore().sessions[sessionId] || null;
  }

  const doc = await getDb().collection('sessions').doc(sessionId).get();
  return doc.exists ? normalizeDates(doc.data() as SessionData) : null;
}

export async function getAllSessions(): Promise<SessionData[]> {
  if (isLocalMode()) {
    return Object.values(loadLocalStore().sessions).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  const snap = await getDb().collection('sessions').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => normalizeDates(d.data() as SessionData));
}

export async function createSession(session: SessionData): Promise<SessionData> {
  if (isLocalMode()) {
    const store = loadLocalStore();
    store.sessions[session.sessionId] = session;
    saveLocalStore(store);
    return session;
  }

  await getDb().collection('sessions').doc(session.sessionId).set(session);
  return session;
}

export async function updateSession(
  sessionId: string,
  updates: Partial<SessionData>
): Promise<SessionData | null> {
  const withTimestamp = { ...updates, updatedAt: nowIso() };

  if (isLocalMode()) {
    const store = loadLocalStore();
    if (!store.sessions[sessionId]) return null;
    store.sessions[sessionId] = { ...store.sessions[sessionId], ...withTimestamp };
    saveLocalStore(store);
    return store.sessions[sessionId];
  }

  const ref = getDb().collection('sessions').doc(sessionId);
  await ref.update(withTimestamp);
  const snap = await ref.get();
  return snap.exists ? normalizeDates(snap.data() as SessionData) : null;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  if (isLocalMode()) {
    const store = loadLocalStore();
    if (!store.sessions[sessionId]) return false;
    delete store.sessions[sessionId];
    for (const [id, play] of Object.entries(store.plays)) {
      if (play.sessionId === sessionId) delete store.plays[id];
    }
    for (const [id, event] of Object.entries(store.events)) {
      if (event.sessionId === sessionId) delete store.events[id];
    }
    saveLocalStore(store);
    return true;
  }

  const db = getDb();
  const sessionRef = db.collection('sessions').doc(sessionId);
  const session = await sessionRef.get();
  if (!session.exists) return false;

  const plays = await db.collection('plays').where('sessionId', '==', sessionId).get();
  for (const doc of plays.docs) {
    await db.recursiveDelete(doc.ref);
  }
  await sessionRef.delete();
  return true;
}

// ------------------- PLAYS REPO (TRANSACTIONAL) -------------------
export async function getPlayById(playId: string): Promise<PlayData | null> {
  if (isLocalMode()) {
    return loadLocalStore().plays[playId] || null;
  }

  const doc = await getDb().collection('plays').doc(playId).get();
  return doc.exists ? normalizeDates(doc.data() as PlayData) : null;
}

export async function createOrGetPlay(
  sessionId: string,
  deviceId: string,
  classCode: string,
  fullName: string
): Promise<{ play: PlayData; isNew: boolean }> {
  const playId = crypto.createHash('sha256').update(`${sessionId}:${deviceId}`).digest('hex');

  if (isLocalMode()) {
    const store = loadLocalStore();
    if (store.plays[playId]) {
      const play = reopenLegacyExplore(store.plays[playId]);
      store.plays[playId] = play;
      saveLocalStore(store);
      return { play, isNew: false };
    }
    const initialPlay = buildInitialPlay(playId, sessionId, deviceId, classCode, fullName);
    store.plays[playId] = initialPlay;
    saveLocalStore(store);
    return { play: initialPlay, isNew: true };
  }

  const db = getDb();
  const playRef = db.collection('plays').doc(playId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(playRef);
    if (snap.exists) {
      const existing = reopenLegacyExplore(normalizeDates(snap.data() as PlayData));
      if ((snap.data() as PlayData).phase !== existing.phase) {
        tx.set(playRef, existing, { merge: true });
      }
      return { play: existing, isNew: false };
    }
    const initialPlay = buildInitialPlay(playId, sessionId, deviceId, classCode, fullName);
    tx.set(playRef, initialPlay);
    return { play: initialPlay, isNew: true };
  });
}

export async function savePlayAndEvent(play: PlayData, event: PlayEvent): Promise<void> {
  const now = nowIso();
  const storedEvent: PlayEvent = { ...event, playId: play.playId, createdAt: now };
  const storedPlay: PlayData = { ...play, updatedAt: now };

  if (isLocalMode()) {
    const store = loadLocalStore();
    if (store.events[event.eventId]) return;
    store.events[event.eventId] = storedEvent;
    store.plays[play.playId] = storedPlay;
    saveLocalStore(store);
    return;
  }

  const db = getDb();
  const playRef = db.collection('plays').doc(play.playId);
  const eventRef = playRef.collection('events').doc(event.eventId);

  await db.runTransaction(async (tx) => {
    const existingEvent = await tx.get(eventRef);
    if (existingEvent.exists) return;
    tx.set(eventRef, storedEvent);
    tx.set(playRef, storedPlay, { merge: true });
  });
}

export async function getPlaysBySession(sessionId: string): Promise<PlayData[]> {
  if (isLocalMode()) {
    return Object.values(loadLocalStore().plays).filter((p) => p.sessionId === sessionId);
  }

  const snap = await getDb().collection('plays').where('sessionId', '==', sessionId).get();
  return snap.docs.map((d) => normalizeDates(d.data() as PlayData));
}

export async function getEventsBySession(sessionId: string): Promise<PlayEvent[]> {
  let events: PlayEvent[];

  if (isLocalMode()) {
    events = Object.values(loadLocalStore().events).filter((e) => e.sessionId === sessionId);
  } else {
    const snap = await getDb().collectionGroup('events').where('sessionId', '==', sessionId).get();
    events = snap.docs.map((d) =>
      normalizeDates({ playId: d.ref.parent.parent?.id, ...(d.data() as PlayEvent) })
    );
  }

  return events.sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
}
