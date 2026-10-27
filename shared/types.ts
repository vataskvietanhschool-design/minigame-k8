export type StationId = 1 | 2 | 3 | 4 | 5;

export type GamePhase =
  | 'NOT_STARTED'
  | 'QUESTION'
  | 'EXPLANATION'
  | 'WAIT_PIN'
  | 'COMPLETED'
  | 'SESSION_CLOSED';

export type SessionStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface ClassItem {
  code: string;
  displayName: string;
  enabled: boolean;
  sortOrder: number;
}

export interface SessionData {
  sessionId: string;
  classCode: string;
  title: string;
  status: SessionStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  pin12: string;
  pin23: string;
  pin34: string;
  pin45: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PlayData {
  playId: string;
  sessionId: string;
  classCode: string;
  deviceId: string;
  fullName: string;
  currentStation: StationId;
  phase: GamePhase;
  attemptsByStation: Record<string, number>;
  wrongByStation: Record<string, number>;
  hintsByStation: Record<string, number>;
  firstTryCorrectCount: number;
  totalAttempts: number;
  wrongAttempts: number;
  completedStations: number[];
  version: number;
  startedAt?: any;
  updatedAt?: any;
  completedAt?: any;
}

export type EventType = 'ANSWER' | 'EXPLANATION_ACK' | 'PIN_UNLOCK' | 'FINISH';

export interface PlayEvent {
  eventId: string;
  sessionId: string;
  playId?: string;
  stationNo: number;
  eventType: EventType;
  attemptNo?: number | null;
  selectedOption?: 'A' | 'B' | null;
  isCorrect?: boolean | null;
  hintLevel?: number | null;
  createdAt?: any;
}

export interface QuestionData {
  stationNo: StationId;
  title: string;
  scenario: string;
  question: string;
  optionA: string;
  optionB: string;
  correctOption: 'A' | 'B';
  hints: [string, string, string];
  explanation: {
    correctChoice: string;
    reason: string;
    branchesAnalysis: string;
    takeaway: string;
  };
}

export interface ClientQuestionView {
  stationNo: StationId;
  title: string;
  scenario: string;
  question: string;
  optionA: string;
  optionB: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  attemptNo: number;
  hintLevel?: number;
  hintText?: string;
  explanation?: QuestionData['explanation'];
  phase: GamePhase;
  currentStation: StationId;
}
