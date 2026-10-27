import { ClassItem, PlayData, ClientQuestionView, QuestionData, StationId, GamePhase } from '../../shared/types';

const TOKEN_STORAGE_KEY = 'robot_rescue:v1:play_token';

let inMemoryToken: string = '';

export function getPlayToken(): string {
  if (inMemoryToken) return inMemoryToken;
  try {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      inMemoryToken = stored;
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return '';
}

export function setPlayToken(token: string): void {
  inMemoryToken = token;
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage errors
  }
}

export function clearPlayToken(): void {
  inMemoryToken = '';
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export interface ApiError {
  code: string;
  message: string;
}

export function generateEventId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getPlayToken();
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    defaultHeaders['X-Play-Token'] = token;
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>)
    },
    credentials: 'same-origin'
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Yêu cầu không thành công.');
    }
    return data as T;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Lỗi máy chủ (${response.status})`);
  }

  return {} as T;
}

export async function fetchSystemStatus() {
  return request<{
    isFirestoreConnected: boolean;
    storageMode: string;
    notice: string;
    demoTeacherEnabled?: boolean;
  }>('/api/system/status');
}

export async function fetchClasses(): Promise<ClassItem[]> {
  return request<ClassItem[]>('/api/classes');
}

export async function resolveActiveSession(classCode: string) {
  return request<{
    sessionId: string;
    classCode: string;
    title: string;
    status: string;
  }>('/api/session/resolve', {
    method: 'POST',
    body: JSON.stringify({ classCode })
  });
}

export async function startPlay(params: {
  sessionId: string;
  classCode: string;
  fullName: string;
  deviceId: string;
}): Promise<{ play: PlayData; token: string; isNew: boolean }> {
  const result = await request<{ play: PlayData; token: string; isNew: boolean }>('/api/play/start', {
    method: 'POST',
    body: JSON.stringify({ ...params, requestId: generateEventId() })
  });

  if (result.token) {
    setPlayToken(result.token);
  }

  return result;
}

export async function fetchPlayState(): Promise<{ play: PlayData; sessionTitle?: string }> {
  return request<{ play: PlayData; sessionTitle?: string }>('/api/play/state');
}

export async function fetchPlayQuestion(): Promise<{
  question: ClientQuestionView;
  stationNo: StationId;
  phase: GamePhase;
  currentAttempts: number;
  wrongAttempts: number;
  currentHintLevel: number;
}> {
  return request('/api/play/question');
}

export async function submitAnswer(params: {
  eventId: string;
  selectedOption: 'A' | 'B';
}): Promise<{
  isCorrect: boolean;
  attemptNo: number;
  hintLevel?: number;
  hintText?: string;
  explanation?: QuestionData['explanation'];
  phase: GamePhase;
  currentStation: StationId;
  firstTryCorrectCount?: number;
}> {
  return request('/api/play/answer', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

export async function acknowledgeExplanation(eventId: string): Promise<{
  success: boolean;
  currentStation: StationId;
  phase: GamePhase;
}> {
  return request('/api/play/ack', {
    method: 'POST',
    body: JSON.stringify({ eventId })
  });
}

export async function unlockWithPin(params: {
  eventId: string;
  pin: string;
}): Promise<{
  success: boolean;
  newStation: StationId;
  phase: GamePhase;
  message: string;
}> {
  return request('/api/play/unlock', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

export async function finishMission(eventId: string): Promise<{
  success: boolean;
  phase: GamePhase;
  play: PlayData;
}> {
  return request('/api/play/finish', {
    method: 'POST',
    body: JSON.stringify({ eventId })
  });
}
