import React from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { QUESTIONS_DB } from '../../shared/questions';
import { QuestionData, StationId } from '../../shared/types';
import { CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';

interface Screen05CorrectTheoryProps {
  stationNo: StationId;
  explanation: QuestionData['explanation'];
  attemptNo: number;
  isFirstTry: boolean;
  isSubmitting: boolean;
  onContinue: () => void;
}

export const Screen05CorrectTheory: React.FC<Screen05CorrectTheoryProps> = ({
  stationNo,
  explanation,
  attemptNo,
  isFirstTry,
  isSubmitting,
  onContinue
}) => {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 my-4 space-y-6">
      {/* Victory Header */}
      <div className="bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <RobotAvatar mood="happy" size="lg" />
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/80 border border-emerald-500 rounded-full text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            CHÍNH XÁC! HOÀN THÀNH TRẠM {stationNo}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Robot đã vượt qua thử thách thành công!
          </h2>
          <p className="text-xs text-slate-300">
            {isFirstTry
              ? 'Tuyệt vời! Em đã đưa ra đáp án chính xác ngay trong lần chọn đầu tiên.'
              : `Rất tốt! Em đã dựa vào gợi ý để tìm ra câu trả lời đúng sau ${attemptNo} lượt suy nghĩ.`}
          </p>
        </div>
      </div>

      {QUESTIONS_DB[stationNo].optionA.endsWith('.png') && (
        <img
          src={QUESTIONS_DB[stationNo].correctOption === 'A' ? QUESTIONS_DB[stationNo].optionA : QUESTIONS_DB[stationNo].optionB}
          alt="Chương trình đúng"
          className="w-full max-h-48 object-contain rounded-2xl bg-white border border-slate-700"
        />
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white">Ghi nhớ trạm {stationNo}</h3>
        <p className="text-sm font-bold text-white">{explanation.correctChoice}</p>
        <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 space-y-1">
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
            Ghi nhớ
          </span>
          <p className="text-emerald-100 font-semibold leading-relaxed text-sm">{explanation.takeaway}</p>
        </div>

        {/* Continue Button */}
        <div className="pt-3 flex justify-center">
          <button
            onClick={onContinue}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[280px] py-4 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition active:scale-[0.98]"
          >
            <span>
              {stationNo === 5 ? 'XEM BẢN ĐỒ' : 'ĐI TỚI TRẠM TIẾP'}
            </span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
