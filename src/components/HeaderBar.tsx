import React from 'react';
import { StationId } from '../../shared/types';
import { BookOpen, UserCheck, ShieldCheck } from 'lucide-react';

interface HeaderBarProps {
  fullName?: string;
  classCode?: string;
  currentStation?: StationId;
  completedStations?: number[];
  onOpenReview?: () => void;
  onOpenTeacher?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  fullName,
  classCode,
  currentStation = 1,
  completedStations = [],
  onOpenReview,
  onOpenTeacher
}) => {
  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-30 px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Logo and Game Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <span className="text-lg font-black">🤖</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>GIẢI CỨU ROBOT</span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full">
                Bài 14: Scratch 8
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Chinh phục 5 trạm thử thách – Chọn nhánh đúng
            </p>
          </div>
        </div>

        {/* 5-Station Stepper */}
        {fullName && (
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-950/80 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-800">
            {[1, 2, 3, 4, 5].map((st) => {
              const isCurrent = currentStation === st;
              const isDone = completedStations.includes(st);

              return (
                <div
                  key={st}
                  className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-cyan-500 text-white ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                  title={`Trạm ${st}`}
                >
                  {isDone ? '✓' : st}
                </div>
              );
            })}
          </div>
        )}

        {/* Student tag & Actions */}
        <div className="flex items-center gap-2">
          {fullName && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/90 rounded-lg text-xs border border-slate-700 text-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold truncate max-w-[120px] sm:max-w-[160px]">{fullName}</span>
              <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded text-[10px] font-bold">
                {classCode}
              </span>
            </div>
          )}

          {completedStations.length > 0 && onOpenReview && (
            <button
              onClick={onOpenReview}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 transition"
              title="Xem lại chốt kiến thức các trạm đã qua"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ôn tập</span>
            </button>
          )}

          {onOpenTeacher && (
            <button
              onClick={onOpenTeacher}
              className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs border border-slate-800 transition"
              title="Khu vực dành cho giáo viên"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Giáo viên</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
