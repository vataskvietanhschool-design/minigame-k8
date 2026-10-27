import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  getClasses,
  getActiveSessionsForClass,
  getSessionById,
  getAllSessions,
  createSession,
  updateSession,
  createOrGetPlay,
  getPlayById,
  savePlayAndEvent,
  getPlaysBySession,
  getEventsBySession,
  getSystemStatus
} from './db.js';
import {
  validateStudentRegistration,
  validateSessionPins,
  evaluateStationAnswer,
  sanitizeCsvField
} from './gameRules.js';
import { getClientQuestion, QUESTIONS_DB } from '../shared/questions.js';
import {
  signPlayToken,
  AuthenticatedPlayRequest,
  playAuthMiddleware,
  AuthenticatedTeacherRequest,
  teacherAuthMiddleware,
  isDemoTeacherAllowed,
  getTeacherEmails,
  PLAY_TOKEN_TTL_MS
} from './auth.js';
import { StationId, SessionData, PlayData, PlayEvent } from '../shared/types.js';

const router = Router();

// In-memory rate limiter for PIN attempts: playId -> { count: number, resetAt: number, lockedUntil: number }
const pinRateLimitMap = new Map<string, { count: number; resetAt: number; lockedUntil: number }>();

function checkPinRateLimit(playId: string): { allowed: boolean; remainingLockSeconds?: number } {
  const now = Date.now();
  const entry = pinRateLimitMap.get(playId);

  if (!entry) {
    pinRateLimitMap.set(playId, { count: 0, resetAt: now + 60000, lockedUntil: 0 });
    return { allowed: true };
  }

  if (entry.lockedUntil > now) {
    return { allowed: false, remainingLockSeconds: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 60000;
  }

  return { allowed: true };
}

function recordPinFailure(playId: string): void {
  const now = Date.now();
  let entry = pinRateLimitMap.get(playId);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + 60000, lockedUntil: 0 };
    pinRateLimitMap.set(playId, entry);
    return;
  }

  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = now + 60000; // 60s cooldown
    entry.count = 0;
    entry.resetAt = now + 120000;
  }
}

// ------------------- 1. SYSTEM STATUS -------------------
router.get('/system/status', async (_req: Request, res: Response) => {
  try {
    const status = await getSystemStatus();
    res.json({
      ...status,
      demoTeacherEnabled: isDemoTeacherAllowed(),
      teacherAllowlistCount: getTeacherEmails().length
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'STATUS_ERROR', message: err.message } });
  }
});

// ------------------- 2. PUBLIC: CLASSES -------------------
router.get('/classes', async (_req: Request, res: Response) => {
  try {
    const classes = await getClasses();
    res.json(classes);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: 'Không thể tải danh sách lớp học.' } });
  }
});

// ------------------- 3. PUBLIC: RESOLVE ACTIVE SESSION -------------------
router.post('/session/resolve', async (req: Request, res: Response) => {
  const { classCode } = req.body;
  if (!classCode || typeof classCode !== 'string') {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Vui lòng cung cấp mã lớp.' } });
    return;
  }

  try {
    const activeSessions = await getActiveSessionsForClass(classCode.trim());

    if (activeSessions.length === 0) {
      res.status(404).json({
        error: {
          code: 'NO_ACTIVE_SESSION',
          message: 'Giáo viên chưa mở hoạt động cho lớp này. Em hãy chờ thầy/cô thông báo nhé!'
        }
      });
      return;
    }

    if (activeSessions.length > 1) {
      res.status(409).json({
        error: {
          code: 'SESSION_CONFLICT',
          message: 'Phát hiện nhiều hơn một tiết học đang mở cho lớp này. Vui lòng liên hệ giáo viên xử lý.'
        }
      });
      return;
    }

    const session = activeSessions[0];
    // Security: Do NOT send PINs to public client
    res.json({
      sessionId: session.sessionId,
      classCode: session.classCode,
      title: session.title,
      status: session.status,
      startsAt: session.startsAt,
      endsAt: session.endsAt
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Lỗi truy vấn tiết học.' } });
  }
});

// ------------------- 4. PUBLIC: START PLAY -------------------
router.post('/play/start', async (req: Request, res: Response) => {
  const { sessionId, classCode, fullName, deviceId } = req.body;

  if (!sessionId || !deviceId) {
    res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'Thiếu thông tin phiên hoặc thiết bị.' } });
    return;
  }

  const nameValidation = validateStudentRegistration(fullName || '', classCode || '');
  if (!nameValidation.isValid) {
    res.status(400).json({ error: { code: 'INVALID_NAME', message: nameValidation.error } });
    return;
  }

  try {
    const session = await getSessionById(sessionId);
    if (!session || session.status !== 'ACTIVE') {
      res.status(400).json({
        error: { code: 'SESSION_NOT_ACTIVE', message: 'Tiết học này hiện không ở trạng thái hoạt động.' }
      });
      return;
    }

    if (session.classCode !== classCode) {
      res.status(400).json({
        error: { code: 'CLASS_MISMATCH', message: 'Lớp học đã chọn không khớp với tiết học đang mở.' }
      });
      return;
    }

    // Atomic create or recover play
    const { play, isNew } = await createOrGetPlay(
      sessionId,
      deviceId,
      classCode,
      nameValidation.cleanName
    );

    // Issue secure signed cookie
    const token = signPlayToken({
      playId: play.playId,
      sessionId: play.sessionId,
      deviceId: play.deviceId
    });

    res.cookie('play_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: PLAY_TOKEN_TTL_MS
    });

    res.json({
      play: {
        playId: play.playId,
        sessionId: play.sessionId,
        classCode: play.classCode,
        fullName: play.fullName,
        currentStation: play.currentStation,
        phase: play.phase,
        attemptsByStation: play.attemptsByStation,
        wrongByStation: play.wrongByStation,
        hintsByStation: play.hintsByStation,
        firstTryCorrectCount: play.firstTryCorrectCount,
        totalAttempts: play.totalAttempts,
        wrongAttempts: play.wrongAttempts,
        completedStations: play.completedStations,
        version: play.version
      },
      token,
      isNew
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'START_PLAY_ERROR', message: 'Không thể khởi tạo lượt chơi.' } });
  }
});

// ------------------- 5. PLAY: GET STATE -------------------
router.get('/play/state', playAuthMiddleware, async (req: AuthenticatedPlayRequest, res: Response) => {
  const { playId, sessionId } = req.playToken!;

  try {
    const play = await getPlayById(playId);
    if (!play) {
      res.status(404).json({ error: { code: 'PLAY_NOT_FOUND', message: 'Không tìm thấy lượt chơi.' } });
      return;
    }

    const session = await getSessionById(sessionId);
    if (session && session.status === 'CLOSED' && play.phase !== 'COMPLETED') {
      res.json({
        play: {
          ...play,
          phase: 'SESSION_CLOSED'
        },
        sessionTitle: session.title
      });
      return;
    }

    res.json({
      play,
      sessionTitle: session?.title
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Không thể lấy trạng thái.' } });
  }
});

// ------------------- 6. PLAY: GET QUESTION -------------------
router.get('/play/question', playAuthMiddleware, async (req: AuthenticatedPlayRequest, res: Response) => {
  const { playId } = req.playToken!;

  try {
    const play = await getPlayById(playId);
    if (!play) {
      res.status(404).json({ error: { code: 'PLAY_NOT_FOUND', message: 'Không tìm thấy lượt chơi.' } });
      return;
    }

    const question = getClientQuestion(play.currentStation);
    res.json({
      question,
      stationNo: play.currentStation,
      phase: play.phase,
      currentAttempts: play.attemptsByStation[String(play.currentStation)] || 0,
      wrongAttempts: play.wrongByStation[String(play.currentStation)] || 0,
      currentHintLevel: play.hintsByStation[String(play.currentStation)] || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Không thể tải câu hỏi.' } });
  }
});

// ------------------- 7. PLAY: ANSWER -------------------
router.post('/play/answer', playAuthMiddleware, async (req: AuthenticatedPlayRequest, res: Response) => {
  const { playId, sessionId } = req.playToken!;
  const { eventId, selectedOption } = req.body;

  if (!eventId || (selectedOption !== 'A' && selectedOption !== 'B')) {
    res.status(400).json({ error: { code: 'INVALID_ANSWER', message: 'Vui lòng chọn đáp án A hoặc B.' } });
    return;
  }

  try {
    const play = await getPlayById(playId);
    if (!play) {
      res.status(404).json({ error: { code: 'PLAY_NOT_FOUND', message: 'Không tìm thấy lượt chơi.' } });
      return;
    }

    if (play.phase !== 'QUESTION') {
      res.status(400).json({
        error: { code: 'INVALID_PHASE', message: 'Trạm này đã có câu trả lời đúng hoặc đang chờ bước tiếp theo.' }
      });
      return;
    }

    const currentStation = play.currentStation;
    const currentWrong = play.wrongByStation[String(currentStation)] || 0;
    const currentAttempts = play.attemptsByStation[String(currentStation)] || 0;

    const evaluation = evaluateStationAnswer(currentStation, selectedOption, currentWrong);

    // Update play state
    const updatedAttemptsByStation = {
      ...play.attemptsByStation,
      [String(currentStation)]: currentAttempts + 1
    };

    let updatedWrongByStation = { ...play.wrongByStation };
    let updatedHintsByStation = { ...play.hintsByStation };
    let updatedCompletedStations = [...play.completedStations];
    let updatedFirstTryCount = play.firstTryCorrectCount;
    let newPhase: import('../shared/types.js').GamePhase = play.phase;

    if (evaluation.isCorrect) {
      newPhase = 'EXPLANATION';
      if (!updatedCompletedStations.includes(currentStation)) {
        updatedCompletedStations.push(currentStation);
      }
      if (currentWrong === 0) {
        updatedFirstTryCount += 1;
      }
    } else {
      updatedWrongByStation[String(currentStation)] = currentWrong + 1;
      updatedHintsByStation[String(currentStation)] = evaluation.hintLevel || 1;
    }

    const updatedPlay: PlayData = {
      ...play,
      attemptsByStation: updatedAttemptsByStation,
      wrongByStation: updatedWrongByStation,
      hintsByStation: updatedHintsByStation,
      firstTryCorrectCount: updatedFirstTryCount,
      totalAttempts: play.totalAttempts + 1,
      wrongAttempts: evaluation.isCorrect ? play.wrongAttempts : play.wrongAttempts + 1,
      completedStations: updatedCompletedStations,
      phase: newPhase,
      version: play.version + 1
    };

    const event: PlayEvent = {
      eventId,
      sessionId,
      stationNo: currentStation,
      eventType: 'ANSWER',
      attemptNo: currentAttempts + 1,
      selectedOption,
      isCorrect: evaluation.isCorrect,
      hintLevel: evaluation.hintLevel || null
    };

    await savePlayAndEvent(updatedPlay, event);

    res.json({
      isCorrect: evaluation.isCorrect,
      attemptNo: evaluation.attemptNo,
      hintLevel: evaluation.hintLevel,
      hintText: evaluation.hintText,
      explanation: evaluation.explanation,
      phase: newPhase,
      currentStation,
      firstTryCorrectCount: updatedFirstTryCount
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'ANSWER_ERROR', message: 'Không thể ghi nhận câu trả lời.' } });
  }
});

// ------------------- 8. PLAY: ACKNOWLEDGE EXPLANATION -------------------
router.post('/play/ack', playAuthMiddleware, async (req: AuthenticatedPlayRequest, res: Response) => {
  const { playId, sessionId } = req.playToken!;
  const { eventId } = req.body;

  if (!eventId) {
    res.status(400).json({ error: { code: 'MISSING_EVENT_ID', message: 'Thiếu eventId.' } });
    return;
  }

  try {
    const play = await getPlayById(playId);
    if (!play) {
      res.status(404).json({ error: { code: 'PLAY_NOT_FOUND', message: 'Không tìm thấy lượt chơi.' } });
      return;
    }

    if (play.phase !== 'EXPLANATION') {
      res.status(400).json({ error: { code: 'INVALID_PHASE', message: 'Chỉ xác nhận tiếp tục khi đã trả lời đúng.' } });
      return;
    }

    // For station 1-4: transition to WAIT_PIN
    // For station 5: transition directly to COMPLETED or complete flow
    const nextPhase = play.currentStation === 5 ? 'COMPLETED' : 'WAIT_PIN';

    const updatedPlay: PlayData = {
      ...play,
      phase: nextPhase,
      completedAt: play.currentStation === 5 ? new Date().toISOString() : null,
      version: play.version + 1
    };

    const event: PlayEvent = {
      eventId,
      sessionId,
      stationNo: play.currentStation,
      eventType: 'EXPLANATION_ACK'
    };

    await savePlayAndEvent(updatedPlay, event);

    res.json({
      success: true,
      currentStation: play.currentStation,
      phase: nextPhase
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'ACK_ERROR', message: 'Lỗi xác nhận trạm.' } });
  }
});

// ------------------- 9. PLAY: UNLOCK NEXT STATION VIA PIN -------------------
router.post('/play/unlock', playAuthMiddleware, async (req: AuthenticatedPlayRequest, res: Response) => {
  const { playId, sessionId } = req.playToken!;
  const { eventId, pin } = req.body;

  if (!eventId || typeof pin !== 'string') {
    res.status(400).json({ error: { code: 'INVALID_PIN_INPUT', message: 'Vui lòng nhập mã PIN 6 chữ số.' } });
    return;
  }

  const rateCheck = checkPinRateLimit(playId);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: {
        code: 'PIN_RATE_LIMIT',
        message: `Em đã thử sai quá nhiều lần. Vui lòng chờ ${rateCheck.remainingLockSeconds} giây để thử lại.`
      }
    });
    return;
  }

  try {
    const play = await getPlayById(playId);
    if (!play) {
      res.status(404).json({ error: { code: 'PLAY_NOT_FOUND', message: 'Không tìm thấy lượt chơi.' } });
      return;
    }

    if (play.phase !== 'WAIT_PIN') {
      res.status(400).json({
        error: { code: 'INVALID_PHASE', message: 'Lượt chơi hiện không ở trạng thái chờ nhập mã chuyển trạm.' }
      });
      return;
    }

    if (play.currentStation >= 5) {
      res.status(400).json({ error: { code: 'MAX_STATION', message: 'Đã hoàn thành trạm thử thách cuối cùng.' } });
      return;
    }

    const session = await getSessionById(sessionId);
    if (!session || session.status !== 'ACTIVE') {
      res.status(400).json({ error: { code: 'SESSION_CLOSED', message: 'Tiết học đã đóng.' } });
      return;
    }

    // Tra PIN theo đúng cặp trạm hiện tại:
    let expectedPin = '';
    if (play.currentStation === 1) expectedPin = session.pin12;
    else if (play.currentStation === 2) expectedPin = session.pin23;
    else if (play.currentStation === 3) expectedPin = session.pin34;
    else if (play.currentStation === 4) expectedPin = session.pin45;

    const trimmedInputPin = pin.trim();

    if (trimmedInputPin !== expectedPin) {
      recordPinFailure(playId);
      res.status(400).json({
        error: {
          code: 'INCORRECT_PIN',
          message: 'Mã chưa chính xác. Em hãy kiểm tra lại mã giáo viên cung cấp.'
        }
      });
      return;
    }

    // PIN đúng -> chuyển sang QUESTION trạm kế tiếp
    const nextStation = (play.currentStation + 1) as StationId;
    const updatedPlay: PlayData = {
      ...play,
      currentStation: nextStation,
      phase: 'QUESTION',
      version: play.version + 1
    };

    const event: PlayEvent = {
      eventId,
      sessionId,
      stationNo: play.currentStation,
      eventType: 'PIN_UNLOCK'
    };

    await savePlayAndEvent(updatedPlay, event);

    res.json({
      success: true,
      newStation: nextStation,
      phase: 'QUESTION',
      message: `Mở khóa thành công! Chào mừng em đến với Trạm ${nextStation}.`
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'UNLOCK_ERROR', message: 'Lỗi xác thực mã PIN.' } });
  }
});

// ------------------- 10. PLAY: FINISH -------------------
router.post('/play/finish', playAuthMiddleware, async (req: AuthenticatedPlayRequest, res: Response) => {
  const { playId, sessionId } = req.playToken!;
  const { eventId } = req.body;

  try {
    const play = await getPlayById(playId);
    if (!play) {
      res.status(404).json({ error: { code: 'PLAY_NOT_FOUND', message: 'Không tìm thấy lượt chơi.' } });
      return;
    }

    if (play.currentStation !== 5 || !play.completedStations.includes(5)) {
      res.status(400).json({ error: { code: 'NOT_ELIGIBLE', message: 'Chưa hoàn thành toàn bộ 5 trạm thử thách.' } });
      return;
    }

    const updatedPlay: PlayData = {
      ...play,
      phase: 'COMPLETED',
      completedAt: play.completedAt || new Date().toISOString(),
      version: play.version + 1
    };

    if (eventId) {
      const event: PlayEvent = {
        eventId,
        sessionId,
        stationNo: 5,
        eventType: 'FINISH'
      };
      await savePlayAndEvent(updatedPlay, event);
    }

    res.json({
      success: true,
      phase: 'COMPLETED',
      play: updatedPlay
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FINISH_ERROR', message: 'Lỗi hoàn thành nhiệm vụ.' } });
  }
});

// =================== TEACHER MANAGEMENT ROUTES ===================

router.get('/teacher/sessions', teacherAuthMiddleware, async (_req: AuthenticatedTeacherRequest, res: Response) => {
  try {
    const sessions = await getAllSessions();
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'TEACHER_ERROR', message: 'Không thể lấy danh sách tiết học.' } });
  }
});

router.post('/teacher/sessions', teacherAuthMiddleware, async (req: AuthenticatedTeacherRequest, res: Response) => {
  const { classCode, title, pin12, pin23, pin34, pin45, startsAt, endsAt } = req.body;

  if (!classCode || !title) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Vui lòng cung cấp mã lớp và tiêu đề tiết học.' } });
    return;
  }

  const pinValidation = validateSessionPins({ pin12, pin23, pin34, pin45 });
  if (!pinValidation.isValid) {
    res.status(400).json({ error: { code: 'INVALID_PINS', message: pinValidation.error } });
    return;
  }

  try {
    const sessionId = `ses_${classCode.toLowerCase()}_${Date.now()}`;
    const newSession: SessionData = {
      sessionId,
      classCode: classCode.trim(),
      title: title.trim(),
      status: 'DRAFT',
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      pin12: pin12.trim(),
      pin23: pin23.trim(),
      pin34: pin34.trim(),
      pin45: pin45.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await createSession(newSession);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Không thể tạo tiết học.' } });
  }
});

router.patch('/teacher/sessions/:id', teacherAuthMiddleware, async (req: AuthenticatedTeacherRequest, res: Response) => {
  const sessionId = req.params.id;
  const { status, title, pin12, pin23, pin34, pin45 } = req.body;

  try {
    const existing = await getSessionById(sessionId);
    if (!existing) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy tiết học.' } });
      return;
    }

    const updates: Partial<SessionData> = {};

    if (status) {
      if (status !== 'DRAFT' && status !== 'ACTIVE' && status !== 'CLOSED') {
        res.status(400).json({ error: { code: 'INVALID_STATUS', message: 'Trạng thái phải là DRAFT, ACTIVE hoặc CLOSED.' } });
        return;
      }

      // Check conflict if changing to ACTIVE: Cannot have 2 ACTIVE sessions for same class
      if (status === 'ACTIVE' && existing.status !== 'ACTIVE') {
        const activeList = await getActiveSessionsForClass(existing.classCode);
        if (activeList.some((s) => s.sessionId !== sessionId)) {
          res.status(409).json({
            error: {
              code: 'SESSION_CONFLICT',
              message: `Lớp ${existing.classCode} đã có một tiết học đang mở (ACTIVE). Vui lòng đóng tiết cũ trước khi kích hoạt tiết này.`
            }
          });
          return;
        }
      }
      updates.status = status;
    }

    if (title) updates.title = title.trim();

    if (pin12 || pin23 || pin34 || pin45) {
      const mergedPins = {
        pin12: pin12 || existing.pin12,
        pin23: pin23 || existing.pin23,
        pin34: pin34 || existing.pin34,
        pin45: pin45 || existing.pin45
      };
      const pinVal = validateSessionPins(mergedPins);
      if (!pinVal.isValid) {
        res.status(400).json({ error: { code: 'INVALID_PINS', message: pinVal.error } });
        return;
      }
      updates.pin12 = mergedPins.pin12;
      updates.pin23 = mergedPins.pin23;
      updates.pin34 = mergedPins.pin34;
      updates.pin45 = mergedPins.pin45;
    }

    const updated = await updateSession(sessionId, updates);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Lỗi cập nhật tiết học.' } });
  }
});

router.get('/teacher/plays', teacherAuthMiddleware, async (req: AuthenticatedTeacherRequest, res: Response) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).json({ error: { code: 'MISSING_SESSION_ID', message: 'Vui lòng chọn tiết học.' } });
    return;
  }

  try {
    const plays = await getPlaysBySession(sessionId);
    res.json(plays);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Không thể lấy kết quả học sinh.' } });
  }
});

// CSV Export (summary & events) with UTF-8 BOM and Formula Injection Guard
router.get('/teacher/export', teacherAuthMiddleware, async (req: AuthenticatedTeacherRequest, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const exportType = req.query.type as string; // 'summary' | 'events'

  if (!sessionId || (exportType !== 'summary' && exportType !== 'events')) {
    res.status(400).json({ error: { code: 'INVALID_PARAMS', message: 'Thiếu sessionId hoặc type (summary/events).' } });
    return;
  }

  try {
    const session = await getSessionById(sessionId);
    if (!session) {
      res.status(404).json({ error: { code: 'SESSION_NOT_FOUND', message: 'Tiết học không tồn tại.' } });
      return;
    }

    const plays = await getPlaysBySession(sessionId);

    // UTF-8 BOM
    let csvContent = '\uFEFF';

    if (exportType === 'summary') {
      const headers = [
        'session_id',
        'class_code',
        'full_name',
        'device_id',
        'play_id',
        'started_at',
        'completed_at',
        'status',
        'current_station',
        'first_try_correct_count',
        'total_attempts',
        'wrong_attempts',
        'h1_battery',
        'h2_door',
        'h3_laser',
        'h4_temp',
        'h5_escape'
      ];
      csvContent += headers.map(sanitizeCsvField).join(',') + '\r\n';

      for (const p of plays) {
        const row = [
          p.sessionId,
          p.classCode,
          p.fullName,
          p.deviceId,
          p.playId,
          p.startedAt || '',
          p.completedAt || '',
          p.phase,
          p.currentStation,
          p.firstTryCorrectCount,
          p.totalAttempts,
          p.wrongAttempts,
          p.hintsByStation['1'] || 0,
          p.hintsByStation['2'] || 0,
          p.hintsByStation['3'] || 0,
          p.hintsByStation['4'] || 0,
          p.hintsByStation['5'] || 0
        ];
        csvContent += row.map(sanitizeCsvField).join(',') + '\r\n';
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="bao_cao_tong_hop_${session.classCode}_${session.sessionId}.csv"`
      );
      res.send(csvContent);
      return;
    } else {
      // events export
      const events = await getEventsBySession(sessionId);
      const headers = [
        'session_id',
        'play_id',
        'station_no',
        'event_type',
        'attempt_no',
        'selected_option',
        'is_correct',
        'hint_level',
        'created_at'
      ];
      csvContent += headers.map(sanitizeCsvField).join(',') + '\r\n';

      for (const ev of events) {
        const row = [
          ev.sessionId,
          ev.playId || '',
          ev.stationNo,
          ev.eventType,
          ev.attemptNo ?? '',
          ev.selectedOption ?? '',
          ev.isCorrect === true ? 'ĐÚNG' : ev.isCorrect === false ? 'SAI' : '',
          ev.hintLevel ?? '',
          ev.createdAt || ''
        ];
        csvContent += row.map(sanitizeCsvField).join(',') + '\r\n';
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="nhat_ky_su_kien_${session.classCode}_${session.sessionId}.csv"`
      );
      res.send(csvContent);
      return;
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'EXPORT_ERROR', message: 'Lỗi xuất tệp CSV.' } });
  }
});

export default router;
