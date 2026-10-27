import React, { useState, useEffect } from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { ClassItem } from '../../shared/types';
import { fetchClasses, resolveActiveSession } from '../utils/api';
import { Play, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface Screen01StartProps {
  onStart: (fullName: string, classCode: string, sessionId: string) => void;
  isLoading: boolean;
  error?: string;
  onOpenTeacher: () => void;
}

export const Screen01Start: React.FC<Screen01StartProps> = ({
  onStart,
  isLoading,
  error,
  onOpenTeacher
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [classCode, setClassCode] = useState<string>('');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    title: string;
  } | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    fetchClasses()
      .then((res) => {
        setClasses(res);
        if (res.length > 0) {
          const defaultCode = res[0].code;
          setClassCode(defaultCode);
          checkSession(defaultCode);
        }
      })
      .catch((err) => {
        setSessionError('Không thể tải danh sách lớp học. Vui lòng thử lại.');
      });
  }, []);

  const checkSession = async (code: string) => {
    if (!code) return;
    setCheckingSession(true);
    setSessionError('');
    setActiveSession(null);

    try {
      const res = await resolveActiveSession(code);
      setActiveSession(res);
    } catch (err: any) {
      setSessionError(err.message || 'Lỗi kiểm tra tiết học.');
    } finally {
      setCheckingSession(false);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setClassCode(code);
    checkSession(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const clean = fullName.trim().replace(/\s+/g, ' ');
    if (clean.length < 2) {
      setValidationError('Họ và tên của em phải có ít nhất 2 ký tự.');
      return;
    }
    if (clean.length > 80) {
      setValidationError('Họ và tên không được dài quá 80 ký tự.');
      return;
    }
    if (!activeSession) {
      setValidationError('Lớp này hiện chưa có tiết học đang hoạt động.');
      return;
    }

    onStart(clean, classCode, activeSession.sessionId);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
        {/* Robot Banner */}
        <div className="flex flex-col items-center text-center space-y-2">
          <RobotAvatar mood="idle" size="lg" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-800 rounded-full text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Tin học lớp 8 – Bài 14: Scratch
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            GIẢI CỨU ROBOT
          </h2>
          <p className="text-sm text-cyan-400 font-bold uppercase tracking-wider">
            Chọn nhánh đúng (If-Then & If-Then-Else)
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            Robot phòng thí nghiệm đang gặp sự cố và bị mắc kẹt. Em hãy đồng hành cùng robot chinh phục 5 trạm thử thách để mở lối thoát hiểm!
          </p>
        </div>

        {/* Start Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Họ và tên học sinh <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Lớp học của em <span className="text-rose-400">*</span>
            </label>
            <select
              value={classCode}
              onChange={handleClassChange}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-sm text-white outline-none transition cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Session Status indicator */}
          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs">
            {checkingSession ? (
              <span className="text-slate-400 animate-pulse">Đang kiểm tra tiết học của lớp...</span>
            ) : activeSession ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">Tiết học: <strong>{activeSession.title}</strong></span>
              </div>
            ) : sessionError ? (
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{sessionError}</span>
              </div>
            ) : (
              <span className="text-slate-400">Vui lòng chọn lớp học.</span>
            )}
          </div>

          {(validationError || error) && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !activeSession || checkingSession}
            className={`w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition shadow-lg ${
              !activeSession || checkingSession || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30 active:scale-[0.98]'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            {isLoading ? 'Đang khởi tạo lượt chơi...' : 'BẮT ĐẦU GIẢI CỨU ROBOT'}
          </button>
        </form>

        {/* Teacher access footer */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onOpenTeacher}
            className="text-xs text-slate-500 hover:text-indigo-400 transition"
          >
            Dành cho giáo viên: Quản lý tiết học & Xem báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};
