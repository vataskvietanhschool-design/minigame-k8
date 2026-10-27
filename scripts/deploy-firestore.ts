import 'dotenv/config';
import fs from 'fs';
import { GoogleAuth } from 'google-auth-library';

// Deploys firestore.rules and firestore.indexes.json field overrides using FIREBASE_SERVICE_ACCOUNT_KEY,
// as an alternative to `firebase deploy --only firestore` (which needs extra Service Usage permissions).

const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
const projectId = process.env.FIREBASE_PROJECT_ID || credentials.project_id;
const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
if (!projectId || !credentials.client_email) {
  console.error('[Deploy] Thiếu FIREBASE_SERVICE_ACCOUNT_KEY / FIREBASE_PROJECT_ID trong .env');
  process.exit(1);
}

const client = await new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
}).getClient();
const project = `projects/${projectId}`;

async function deployRules(): Promise<void> {
  const content = fs.readFileSync('firestore.rules', 'utf8');
  const ruleset = await client.request<{ name: string }>({
    url: `https://firebaserules.googleapis.com/v1/${project}/rulesets`,
    method: 'POST',
    data: { source: { files: [{ name: 'firestore.rules', content }] } }
  });

  const releaseName =
    databaseId === '(default)'
      ? `${project}/releases/cloud.firestore`
      : `${project}/releases/cloud.firestore/${databaseId}`;
  const release = { name: releaseName, rulesetName: ruleset.data.name };

  try {
    await client.request({
      url: `https://firebaserules.googleapis.com/v1/${releaseName}`,
      method: 'PATCH',
      data: { release }
    });
  } catch (err: any) {
    if (err.response?.status !== 404) throw err;
    await client.request({
      url: `https://firebaserules.googleapis.com/v1/${project}/releases`,
      method: 'POST',
      data: release
    });
  }
  console.log(`[Deploy] Rules: ${ruleset.data.name} -> ${releaseName}`);
}

async function deployFieldOverrides(): Promise<void> {
  const config = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));
  for (const override of config.fieldOverrides || []) {
    const name = `${project}/databases/${databaseId}/collectionGroups/${override.collectionGroup}/fields/${override.fieldPath}`;
    await client.request({
      url: `https://firestore.googleapis.com/v1/${name}?updateMask=indexConfig`,
      method: 'PATCH',
      data: {
        indexConfig: {
          indexes: override.indexes.map((idx: any) => ({
            queryScope: idx.queryScope,
            fields: [{ fieldPath: override.fieldPath, order: idx.order }]
          }))
        }
      }
    });
    console.log(`[Deploy] Index: ${override.collectionGroup}.${override.fieldPath} (đang build ở nền)`);
  }
}

try {
  await deployRules();
  await deployFieldOverrides();
  console.log('[Deploy] Hoàn tất.');
} catch (err: any) {
  const status = err.response?.status;
  const message = err.response?.data?.error?.message || err.message;
  console.error(`[Deploy] Lỗi${status ? ` ${status}` : ''}: ${message}`);
  process.exit(1);
}
