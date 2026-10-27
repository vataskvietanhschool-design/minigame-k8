import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

function loadServiceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed;
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY không phải JSON hợp lệ.');
  }
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const serviceAccount = loadServiceAccount();
  const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id;
  if (!projectId) {
    throw new Error('Thiếu FIREBASE_PROJECT_ID hoặc FIREBASE_SERVICE_ACCOUNT_KEY.');
  }

  if (serviceAccount) {
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }

  // Missing credentials make the Firestore client throw outside any request promise and crash the process.
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      'Thiếu FIREBASE_SERVICE_ACCOUNT_KEY (hoặc GOOGLE_APPLICATION_CREDENTIALS). Xem README mục 6.'
    );
  }
  return initializeApp({ projectId });
}

export function initFirebaseAdmin(): { db: Firestore; auth: Auth } {
  if (dbInstance && authInstance) {
    return { db: dbInstance, auth: authInstance };
  }

  const app = getAdminApp();
  const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';

  authInstance = getAuth(app);
  dbInstance = databaseId !== '(default)' ? getFirestore(app, databaseId) : getFirestore(app);

  console.log(`[FirebaseAdmin] Initialized for project ${app.options.projectId}, db: ${databaseId}`);
  return { db: dbInstance, auth: authInstance };
}

export function getDb(): Firestore {
  return dbInstance ?? initFirebaseAdmin().db;
}

export function getAdminAuth(): Auth {
  return authInstance ?? initFirebaseAdmin().auth;
}

export { FieldValue, Timestamp };
