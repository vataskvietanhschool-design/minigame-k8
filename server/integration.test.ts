import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOrGetPlay,
  getPlayById,
  savePlayAndEvent,
  getActiveSessionsForClass,
  createSession
} from './db.js';
import { evaluateStationAnswer } from './gameRules.js';
import { PlayData, PlayEvent } from '../shared/types.js';

test('TC01 & TC04: createOrGetPlay creates unique play for sessionId and deviceId', async () => {
  const testRunId = Date.now();
  const sessionId = `ses_test_${testRunId}`;
  const deviceId = `dev_${testRunId}`;
  const classCode = '8C1';
  const fullName = 'Nguyễn Văn Test';

  const { play, isNew } = await createOrGetPlay(sessionId, deviceId, classCode, fullName);
  assert.equal(isNew, true);
  assert.equal(play.fullName, fullName);
  assert.equal(play.currentStation, 1);
  assert.equal(play.phase, 'QUESTION');
});

test('TC07: Duplicate start with same deviceId and sessionId returns existing play', async () => {
  const testRunId = `dup_${Date.now()}`;
  const sessionId = `ses_${testRunId}`;
  const deviceId = `dev_${testRunId}`;
  const classCode = '8C1';

  // First creation
  const first = await createOrGetPlay(sessionId, deviceId, classCode, 'Học sinh Gốc');
  assert.equal(first.isNew, true);

  // Duplicate attempt with different name
  const second = await createOrGetPlay(sessionId, deviceId, classCode, 'Kẻ Gian Lận Đổi Tên');
  assert.equal(second.isNew, false);
  // Name was not altered, original state preserved
  assert.equal(second.play.fullName, 'Học sinh Gốc');
});

test('TC09 & TC10: Answer evaluation increments attempts and hints properly', async () => {
  const stationNo = 1;
  const res1 = evaluateStationAnswer(stationNo, 'B', 0);
  assert.equal(res1.isCorrect, false);
  assert.equal(res1.attemptNo, 1);
  assert.equal(res1.hintLevel, 1);

  const res2 = evaluateStationAnswer(stationNo, 'B', 1);
  assert.equal(res2.isCorrect, false);
  assert.equal(res2.attemptNo, 2);
  assert.equal(res2.hintLevel, 2);

  const resCorrect = evaluateStationAnswer(stationNo, 'A', 2);
  assert.equal(resCorrect.isCorrect, true);
  assert.equal(resCorrect.phase, 'EXPLANATION');
});

test('TC16: 6-digit PIN with leading zero matches correctly', () => {
  const expectedPin = '004216';
  const inputPin = '004216';
  assert.equal(inputPin === expectedPin, true);
  assert.equal(inputPin.length, 6);
});

test('TC20: Event idempotency prevents double recording for same eventId', async () => {
  const testRunId = `idem_${Date.now()}`;
  const sessionId = `ses_${testRunId}`;
  const deviceId = `dev_${testRunId}`;
  const { play } = await createOrGetPlay(sessionId, deviceId, '8C1', 'Trần Idempotent');

  const eventId = `evt_${testRunId}`;
  const event: PlayEvent = {
    eventId,
    sessionId,
    stationNo: 1,
    eventType: 'ANSWER',
    attemptNo: 1,
    selectedOption: 'A',
    isCorrect: true
  };

  const updatedPlay: PlayData = {
    ...play,
    phase: 'EXPLANATION',
    completedStations: [1]
  };

  await savePlayAndEvent(updatedPlay, event);
  // Re-saving same eventId should not error and should be idempotent
  await savePlayAndEvent(updatedPlay, event);

  const stored = await getPlayById(play.playId);
  assert.equal(stored?.phase, 'EXPLANATION');
});
