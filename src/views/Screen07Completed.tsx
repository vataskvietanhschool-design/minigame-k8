import React, { useState } from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { PlayData } from '../../shared/types';
import { QUESTIONS_DB } from '../../shared/questions';
import { Trophy, Award, CheckCircle, ChevronDown, ChevronUp, BookOpen, Clock } from 'lucide-react';

interface Screen07CompletedProps {
  play: PlayData;
}

export const Screen07Completed: React.FC<Screen07CompletedProps> = ({ play }) => {
  const [expandedStation, setExpandedStation] = useState<number | null>(null);

  const toggleStation = (st: number) => {
    setExpandedStation((prev) => (prev === st ? null : st));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 my-4 space-y-6">
      {/* Victory Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="flex flex-col items-center">
          <RobotAvatar mood="victory" size="xl" />
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-900/80 border border-emerald-500 rounded-full text-emerald-300 text-xs sm:text-sm font-black mt-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            NHIỆM VỤ HOÀN THÀNH XUẤT SẮC!
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Robot đã được giải cứu an toàn!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Chúc mừng <strong>{play.fullName}</strong> ({play.classCode})! Em đã chinh phục trọn vẹn 5 trạm thử thách, kích hoạt thành công lối thoát hiểm bằng cách chọn đúng cấu trúc điều khiển rẽ nhánh trong Scratch.
          </p>
        </div>

        {/* Scorecard Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-left">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Đúng ngay lần đầu</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-1">
              <span>{play.firstTryCorrectCount}</span>
              <span className="text-xs text-slate-500 font-normal">/ 5 câu</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Tổng lượt trả lời</span>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1 flex items-baseline gap-1">
              <span>{play.totalAttempts}</span>
              <span className="text-xs text-slate-500 font-normal">({play.wrongAttempts} lần sai)</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Trạng thái tiết học</span>
            <div className="text-sm font-bold text-amber-400 mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Đã ghi nhận kết quả
            </div>
          </div>
        </div>

        {/* Single Session Lock Rule notice */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Tiến trình và kết quả đã được lưu trữ chính thức. Không thể chơi lại trong tiết học này.</span>
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
