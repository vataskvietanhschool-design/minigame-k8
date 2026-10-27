import React from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { StationIllustration } from '../components/StationIllustration';
import { QuestionData, StationId } from '../../shared/types';
import { CheckCircle2, ArrowRight, BookMarked, GitFork, Lightbulb, Check } from 'lucide-react';

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

      {/* Visual illustration in success state */}
      <StationIllustration stationNo={stationNo} isSuccess={true} />

      {/* 4-Part Pedagogical Synthesis Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <BookMarked className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
            Chốt kiến thức bài học – Trạm {stationNo}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs sm:text-sm">
          {/* Part 1: Correct Choice */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              1. Đáp án phù hợp
            </span>
            <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                ✓
              </span>
              <span>{explanation.correctChoice}</span>
            </div>
          </div>

          {/* Part 2: Reason */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-indigo-400" />
              2. Vì sao lựa chọn cấu trúc này?
            </span>
            <p className="text-slate-300 leading-relaxed font-medium">
              {explanation.reason}
            </p>
          </div>

          {/* Part 3: Branches Analysis */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5 text-amber-400" />
              3. Diễn biến phân nhánh Đúng / Sai
            </span>
            <p className="text-slate-300 leading-relaxed font-medium">
              {explanation.branchesAnalysis}
            </p>
          </div>

          {/* Part 4: Takeaway / Rule of Thumb */}
          <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 space-y-1">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
              4. Điều cần ghi nhớ khi lập trình Scratch
            </span>
            <p className="text-emerald-100 font-semibold leading-relaxed">
              {explanation.takeaway}
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-3 flex justify-center">
          <button
            onClick={onContinue}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[280px] py-4 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition active:scale-[0.98]"
          >
            <span>
              {stationNo === 5 ? 'HOÀN THÀNH NHIỆM VỤ' : `TIẾP TỤC SANG TRẠM ${stationNo + 1}`}
            </span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
