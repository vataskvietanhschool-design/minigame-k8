import React, { useState, useRef, useEffect } from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { StationId } from '../../shared/types';
import { KeyRound, Unlock, AlertCircle, ShieldAlert } from 'lucide-react';

interface Screen06WaitPinProps {
  currentStation: StationId;
  isSubmitting: boolean;
  error?: string;
  onUnlock: (pin: string) => void;
}

export const Screen06WaitPin: React.FC<Screen06WaitPinProps> = ({
  currentStation,
  isSubmitting,
  error,
  onUnlock
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    setLocalError('');
    // Only accept numeric
    const clean = val.replace(/\D/g, '');

    if (clean.length > 1) {
      // Pasting full 6-digit PIN
      const chars = clean.slice(0, 6).split('');
      const newDigits = [...pinDigits];
      chars.forEach((c, idx) => {
        newDigits[idx] = c;
      });
      setPinDigits(newDigits);
      const nextIndex = Math.min(chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...pinDigits];
    newDigits[index] = clean;
    setPinDigits(newDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...pinDigits];
      pasted.split('').forEach((char, idx) => {
        if (idx < 6) newDigits[idx] = char;
      });
      setPinDigits(newDigits);
      const targetIndex = Math.min(pasted.length, 5);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pinDigits.join('');
    if (fullPin.length !== 6) {
      setLocalError('Vui lòng nhập đủ 6 chữ số của mã chuyển trạm.');
      return;
    }
    onUnlock(fullPin);
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 my-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Robot Waiting */}
        <div className="flex flex-col items-center">
          <RobotAvatar mood="idle" size="lg" />
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 border border-indigo-800 rounded-full text-indigo-300 text-xs font-bold">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            Mã mở khóa trạm {currentStation + 1}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Nhập mã chuyển trạm từ Thầy/Cô
          </h2>
          <p className="text-xs text-slate-300 max-w-md mt-1.5 leading-relaxed">
            Chúc mừng em đã hoàn thành Trạm {currentStation}! Hãy lắng nghe phần chốt kiến thức từ giáo viên để nhận mã 6 chữ số mở <strong>Trạm {currentStation + 1}</strong>.
          </p>
        </div>

        {/* 6-Digit PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={isSubmitting}
                className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 rounded-xl text-white outline-none transition"
              />
            ))}
          </div>

          {(localError || error) && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/80 rounded-xl text-rose-300 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Mỗi lần chuyển trạm sử dụng một mã 6 chữ số riêng biệt do Thầy/Cô điều tiết.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || pinDigits.join('').length !== 6}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xl transition active:scale-[0.98] ${
              isSubmitting || pinDigits.join('').length !== 6
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30'
            }`}
          >
            <Unlock className="w-4 h-4" />
            {isSubmitting ? 'Đang mở khóa...' : `MỞ KHÓA TRẠM ${currentStation + 1}`}
          </button>
        </form>
      </div>
    </div>
  );
};
