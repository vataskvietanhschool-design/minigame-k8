import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeFullName,
  validateStudentRegistration,
  validatePinFormat,
  validateSessionPins,
  evaluateStationAnswer,
  sanitizeCsvField
} from './gameRules.js';

test('normalizeFullName trims and condenses extra whitespace', () => {
  assert.equal(normalizeFullName('   Nguyễn   Văn   A   '), 'Nguyễn Văn A');
});

test('validateStudentRegistration validates character bounds and class code', () => {
  const shortRes = validateStudentRegistration('A', '8A1');
  assert.equal(shortRes.isValid, false);

  const emptyClass = validateStudentRegistration('Trần Thị B', '   ');
  assert.equal(emptyClass.isValid, false);

  const validRes = validateStudentRegistration('  Lê Hoàng Nam  ', '8A2');
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.cleanName, 'Lê Hoàng Nam');
});

test('validatePinFormat correctly handles 4-digit strings including leading zeros', () => {
  assert.equal(validatePinFormat('0042'), true);
  assert.equal(validatePinFormat('1234'), true);
  assert.equal(validatePinFormat('123'), false);
  assert.equal(validatePinFormat('12345'), false);
  assert.equal(validatePinFormat('12a4'), false);
});

test('validateSessionPins requires 4 distinct 4-digit PINs', () => {
  const valid = validateSessionPins({
    pin12: '1001',
    pin23: '2002',
    pin34: '3003',
    pin45: '0042'
  });
  assert.equal(valid.isValid, true);

  const duplicate = validateSessionPins({
    pin12: '1001',
    pin23: '1001',
    pin34: '3003',
    pin45: '4004'
  });
  assert.equal(duplicate.isValid, false);
  assert.match(duplicate.error || '', /khác nhau/);
});

test('TC11: Trạm 2 câu hỏi "vì sao" có đáp án A', () => {
  const wrongRes = evaluateStationAnswer(2, 'B', 0);
  assert.equal(wrongRes.isCorrect, false);
  assert.equal(wrongRes.hintLevel, 1);

  const correctRes = evaluateStationAnswer(2, 'A', 1);
  assert.equal(correctRes.isCorrect, true);
  assert.equal(correctRes.phase, 'EXPLANATION');
});

test('TC12: Trạm 4 ước số có đáp án A', () => {
  const ansB = evaluateStationAnswer(4, 'B', 0);
  assert.equal(ansB.isCorrect, false);

  const ansA = evaluateStationAnswer(4, 'A', 1);
  assert.equal(ansA.isCorrect, true);
  assert.match(ansA.explanation?.reason || '', /chia hết cho B/);
});

test('TC13: Trạm 5 chẵn lẻ có đáp án B', () => {
  const ansA = evaluateStationAnswer(5, 'A', 0);
  assert.equal(ansA.isCorrect, false);

  const ansB = evaluateStationAnswer(5, 'B', 1);
  assert.equal(ansB.isCorrect, true);
  assert.match(ansB.explanation?.takeaway || '', /if then else/);
});

test('TC09: Trả lời sai lần 1, 2, 3 thì gợi ý tăng dần từ H1 -> H3 và dừng ở H3', () => {
  const wrong1 = evaluateStationAnswer(1, 'B', 0);
  assert.equal(wrong1.hintLevel, 1);

  const wrong2 = evaluateStationAnswer(1, 'B', 1);
  assert.equal(wrong2.hintLevel, 2);

  const wrong3 = evaluateStationAnswer(1, 'B', 2);
  assert.equal(wrong3.hintLevel, 3);

  const wrong4 = evaluateStationAnswer(1, 'B', 3);
  assert.equal(wrong4.hintLevel, 3);
});

test('sanitizeCsvField escapes dangerous spreadsheet formulas', () => {
  assert.equal(sanitizeCsvField('=SUM(A1:A10)'), "'=SUM(A1:A10)");
  assert.equal(sanitizeCsvField('+123'), "'+123");
  assert.equal(sanitizeCsvField('-500'), "'-500");
  assert.equal(sanitizeCsvField('@alert'), "'@alert");
  assert.equal(sanitizeCsvField('Nguyễn Văn A'), 'Nguyễn Văn A');
  assert.equal(sanitizeCsvField('Lớp, 8A1'), '"Lớp, 8A1"');
});
