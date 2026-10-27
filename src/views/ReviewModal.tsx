import React from 'react';
import { QUESTIONS_DB } from '../../shared/questions';
import { BookOpen, X } from 'lucide-react';

interface ReviewModalProps {
  completedStations: number[];
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ completedStations, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              Ôn tập lý thuyết các trạm đã hoàn thành
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs sm:text-sm">
          {completedStations.length === 0 ? (
            <p className="text-center text-slate-400 py-6">
              Em chưa hoàn thành trạm nào. Hãy trả lời đúng trạm hiện tại để mở khóa nội dung ôn tập nhé!
            </p>
          ) : (
            completedStations.map((st) => {
              const q = QUESTIONS_DB[st as 1 | 2 | 3 | 4 | 5];
              return (
                <div key={st} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{q.title}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs border border-emerald-700">
                      {q.explanation.correctChoice}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Lý do:</strong> {q.explanation.reason}
                  </p>
                  <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-900/60 text-emerald-200 text-xs">
                    💡 <strong>Ghi nhớ:</strong> {q.explanation.takeaway}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
