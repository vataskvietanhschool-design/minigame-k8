import { StationId, QuestionData, AnswerResult } from '../shared/types.js';
import { QUESTIONS_DB } from '../shared/questions.js';

export function normalizeFullName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateStudentRegistration(
  fullName: string,
  classCode: string
): { isValid: boolean; error?: string; cleanName: string } {
  const cleanName = normalizeFullName(fullName);
  if (!cleanName || cleanName.length < 2) {
    return { isValid: false, error: 'Họ và tên phải có ít nhất 2 ký tự.', cleanName };
  }
  if (cleanName.length > 80) {
    return { isValid: false, error: 'Họ và tên không được vượt quá 80 ký tự.', cleanName };
  }
  if (!classCode || typeof classCode !== 'string' || classCode.trim() === '') {
    return { isValid: false, error: 'Vui lòng chọn lớp học.', cleanName };
  }
  return { isValid: true, cleanName };
}

export function validatePinFormat(pin: string): boolean {
  return typeof pin === 'string' && /^\d{6}$/.test(pin);
}

export function validateSessionPins(pins: {
  pin12: string;
  pin23: string;
  pin34: string;
  pin45: string;
}): { isValid: boolean; error?: string } {
  const pinList = [pins.pin12, pins.pin23, pins.pin34, pins.pin45];
  for (let i = 0; i < pinList.length; i++) {
    const pin = pinList[i];
    if (!validatePinFormat(pin)) {
      return {
        isValid: false,
        error: `Mã PIN thứ ${i + 1} phải gồm đúng 6 chữ số (ví dụ: 004216).`
      };
    }
  }

  const uniqueSet = new Set(pinList);
  if (uniqueSet.size !== 4) {
    return {
      isValid: false,
      error: 'Bốn mã PIN chuyển trạm trong cùng tiết học phải khác nhau đôi một.'
    };
  }

  return { isValid: true };
}

export function evaluateStationAnswer(
  stationNo: StationId,
  selectedOption: 'A' | 'B',
  currentWrongAttemptsForStation: number
): AnswerResult {
  const question = QUESTIONS_DB[stationNo];
  if (!question) {
    throw new Error(`Invalid station number: ${stationNo}`);
  }

  const isCorrect = question.correctOption === selectedOption;

  if (isCorrect) {
    return {
      isCorrect: true,
      attemptNo: currentWrongAttemptsForStation + 1,
      explanation: question.explanation,
      phase: 'EXPLANATION',
      currentStation: stationNo
    };
  } else {
    const newWrongCount = currentWrongAttemptsForStation + 1;
    const hintLevel = Math.min(newWrongCount, 3) as 1 | 2 | 3;
    const hintText = question.hints[hintLevel - 1];

    return {
      isCorrect: false,
      attemptNo: newWrongCount,
      hintLevel,
      hintText,
      phase: 'QUESTION',
      currentStation: stationNo
    };
  }
}

export function sanitizeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '';
  let str = String(field);
  // Prevent CSV Formula Injection: =, +, -, @
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  // Escape double quotes and enclose in quotes if contains comma, quote, or newline
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
