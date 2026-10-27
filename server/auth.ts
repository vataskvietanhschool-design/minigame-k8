import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getAdminAuth } from './firebaseAdmin.js';

export const PLAY_TOKEN_TTL_MS = 8 * 3600 * 1000;

const DEV_TOKEN_SECRET = 'robot_rescue_dev_only_secret';

function getTokenSecret(): string {
  const secret = process.env.PLAY_TOKEN_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('PLAY_TOKEN_SECRET must be set in production.');
  }
  return DEV_TOKEN_SECRET;
}

export interface PlayTokenPayload {
  playId: string;
  sessionId: string;
  deviceId: string;
  iat: number;
}

export function signPlayToken(payload: Omit<PlayTokenPayload, 'iat'>): string {
  const data: PlayTokenPayload = {
    ...payload,
    iat: Date.now()
  };
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(base64)
    .digest('base64url');
  return `${base64}.${signature}`;
}

export function verifyPlayToken(token: string): PlayTokenPayload | null {
  try {
    const [base64, signature] = token.split('.');
    if (!base64 || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', getTokenSecret())
      .update(base64)
      .digest('base64url');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      const json = Buffer.from(base64, 'base64url').toString('utf8');
      const payload = JSON.parse(json) as PlayTokenPayload;
      if (typeof payload.iat !== 'number' || Date.now() - payload.iat > PLAY_TOKEN_TTL_MS) {
        return null;
      }
      return payload;
    }
  } catch {
    return null;
  }
  return null;
}

export interface AuthenticatedPlayRequest extends Request {
  playToken?: PlayTokenPayload;
}

export function playAuthMiddleware(
  req: AuthenticatedPlayRequest,
  res: Response,
  next: NextFunction
): void {
  let token: string | undefined = undefined;

  const headerVal = req.headers['x-play-token'];
  if (typeof headerVal === 'string' && headerVal.trim()) {
    token = headerVal.trim();
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7).trim();
  } else if (typeof req.cookies?.play_token === 'string') {
    token = req.cookies.play_token;
  }

  if (!token) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Phiên chơi không hợp lệ hoặc đã hết hạn.' }
    });
    return;
  }

  const payload = verifyPlayToken(token);
  if (!payload) {
    res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Mã xác thực lượt chơi không đúng hoặc đã bị sửa đổi.' }
    });
    return;
  }

  req.playToken = payload;
  next();
}

// Teacher Authentication
export const DEMO_TEACHER_TOKEN = 'demo-teacher-token';

export function isDemoTeacherAllowed(): boolean {
  return process.env.ALLOW_DEMO_TEACHER === 'true';
}

export function getTeacherEmails(): string[] {
  const raw = (process.env.TEACHER_EMAILS || '').trim().replace(/^['"]|['"]$/g, '');
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

export interface TeacherUser {
  uid: string;
  email?: string;
  name?: string;
}

export interface AuthenticatedTeacherRequest extends Request {
  teacher?: TeacherUser;
}

export async function teacherAuthMiddleware(
  req: AuthenticatedTeacherRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'TEACHER_AUTH_REQUIRED', message: 'Vui lòng đăng nhập tài khoản giáo viên.' }
    });
    return;
  }

  const token = authHeader.substring(7);

  if (token === DEMO_TEACHER_TOKEN && isDemoTeacherAllowed()) {
    req.teacher = {
      uid: 'demo_teacher_01',
      email: 'dungnq@vietanhschool.edu.vn',
      name: 'Thầy Dũng (Giáo viên Tin học)'
    };
    next();
    return;
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);

    const email = decoded.email?.toLowerCase();
    const allowlist = getTeacherEmails();
    const isAllowed =
      (email && decoded.email_verified !== false && allowlist.includes(email)) ||
      decoded.admin === true;

    if (!isAllowed) {
      const message =
        allowlist.length === 0
          ? 'Máy chủ chưa đọc được danh sách giáo viên. Biến TEACHER_EMAILS trên Vercel đang trống hoặc chưa được gắn vào bản deploy này.'
          : decoded.email_verified === false
            ? `Email ${decoded.email} chưa được Google xác minh.`
            : `Email ${decoded.email} chưa nằm trong danh sách giáo viên (${allowlist.length} email đã cấu hình).`;
      res.status(403).json({
        error: {
          code: 'TEACHER_FORBIDDEN',
          message
        }
      });
      return;
    }

    req.teacher = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email
    };
    next();
  } catch (err: any) {
    console.warn('[Auth] verifyIdToken failed:', err.message);
    res.status(401).json({
      error: { code: 'INVALID_TEACHER_TOKEN', message: 'Phiên đăng nhập giáo viên đã hết hạn hoặc không hợp lệ.' }
    });
  }
}
