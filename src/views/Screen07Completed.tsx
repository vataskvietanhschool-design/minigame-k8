import React, { useEffect, useState } from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { PlayData } from '../../shared/types';
import { QUESTIONS_DB } from '../../shared/questions';
import { sounds } from '../utils/sound';
import { Award, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const CONFETTI = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  left: `${(index * 17) % 100}%`,
  delay: `${(index % 12) * 0.12}s`,
  color: ['#34d399', '#67e8f9', '#fbbf24', '#fb7185', '#a78bfa'][index % 5],
  rotate: `${(index % 8) * 45}deg`
}));

interface Screen07CompletedProps {
  play: PlayData;
}

export const Screen07Completed: React.FC<Screen07CompletedProps> = ({ play }) => {
  const [expandedStation, setExpandedStation] = useState<number | null>(null);

  useEffect(() => {
    sounds.playPowerUp();
    const again = window.setTimeout(() => sounds.playBeep(true), 280);
    return () => window.clearTimeout(again);
  }, []);

  const issuedOn = new Date().toLocaleDateString('vi-VN');

  const toggleStation = (st: number) => {
    setExpandedStation((prev) => (prev === st ? null : st));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 my-4 space-y-6">
      <style>{`
        @keyframes rescue-confetti {
          0% { transform: translateY(-12vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes rescue-burst {
          0% { transform: scale(0.6); opacity: 0; }
          30% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rescue-glow {
          50% { box-shadow: 0 0 40px rgba(52, 211, 153, 0.45); }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
        {CONFETTI.map((piece) => (
          <span
            key={piece.id}
            className="absolute top-0 h-3 w-2 rounded-sm"
            style={{
              left: piece.left,
              background: piece.color,
              animation: `rescue-confetti 3.2s ease-in ${piece.delay} forwards`,
              transform: `rotate(${piece.rotate})`
            }}
          />
        ))}
      </div>
      <div
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-amber-950 via-slate-950 to-emerald-950 p-3 shadow-2xl"
        style={{ animation: 'rescue-burst 0.7s ease-out, rescue-glow 1.8s ease-in-out 0.7s infinite' }}
      >
        <div className="rounded-[1.6rem] border-2 border-amber-300/80 bg-slate-950/80 px-5 py-7 text-center sm:px-10">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-amber-300 bg-amber-400/15">
            <Award className="h-7 w-7 text-amber-300" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">Chứng nhận</p>
          <div className="mt-4 flex justify-center">
            <RobotAvatar mood="victory" size="lg" />
          </div>
          <p className="mt-4 text-sm text-slate-300">Chứng nhận bạn</p>
          <h2 className="mt-1 text-3xl font-black text-amber-100 sm:text-4xl">{play.fullName}</h2>
          <p className="mt-1 text-sm font-semibold text-cyan-200">Lớp {play.classCode}</p>
          <p className="mx-auto mt-4 max-w-md text-base font-semibold leading-relaxed text-white sm:text-lg">
            đã hoàn thành xuất sắc việc giải cứu robot
          </p>
          <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Đúng lần đầu</p>
              <p className="text-lg font-black text-emerald-300">{play.firstTryCorrectCount}/5</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Lượt trả lời</p>
              <p className="text-lg font-black text-cyan-300">{play.totalAttempts}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Ngày cấp</p>
              <p className="text-lg font-black text-amber-200">{issuedOn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Theoretical Review of 5 Stations */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            Xem lại chốt kiến thức trọng tâm (5 Trạm)
          </h3>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((st) => {
            const q = QUESTIONS_DB[st as 1 | 2 | 3 | 4 | 5];
            const isExpanded = expandedStation === st;

            return (
              <div
                key={st}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggleStation(st)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-400 text-xs font-black flex items-center justify-center">
                      ✓
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {q.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400 font-mono hidden sm:inline">
                      {q.explanation.correctChoice}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-900 space-y-3 text-xs sm:text-sm">
                    <div className="p-3 bg-slate-900/80 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-cyan-400 uppercase font-mono block">
                        Vì sao lựa chọn?
                      </span>
                      <p className="text-slate-300 font-medium leading-relaxed">
                        {q.explanation.reason}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/60 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase font-mono block">
                        Điều cần ghi nhớ
                      </span>
                      <p className="text-emerald-100 font-medium leading-relaxed">
                        {q.explanation.takeaway}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
