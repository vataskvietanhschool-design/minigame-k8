import React from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { StationId } from '../../shared/types';
import { RotateCcw, Lightbulb } from 'lucide-react';

interface Screen04WrongHintProps {
  stationNo: StationId;
  hintLevel: number;
  hintText: string;
  attemptNo: number;
  onRetry: () => void;
}

export const Screen04WrongHint: React.FC<Screen04WrongHintProps> = ({
  stationNo,
  hintLevel,
  hintText,
  attemptNo,
  onRetry
}) => {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 my-6">
      <div className="bg-slate-900 border border-amber-600/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Robot avatar */}
        <div className="flex flex-col items-center">
          <RobotAvatar mood="puzzled" size="lg" />
          <span className="mt-2 text-xs font-mono font-bold text-amber-400 px-3 py-1 bg-amber-950/80 border border-amber-800 rounded-full">
            Lần thử thứ {attemptNo} chưa chính xác
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Đừng nản lòng, hãy cùng suy nghĩ lại nhé!
          </h2>
          <p className="text-xs text-slate-400 max-w-md mt-1">
            Robot đã ghi nhận phương án của em. Để chọn đúng nhánh điều khiển, hãy đọc kỹ gợi ý dưới đây:
          </p>
        </div>

        {/* Progressive Hint Card */}
        <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 text-left space-y-2 relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
              GỢI Ý MỨC {hintLevel} / 3
            </span>
            <span className="text-[11px] text-slate-400 font-sans">
              Trạm {stationNo}
            </span>
          </div>

          <p className="text-sm sm:text-base text-amber-100 font-medium leading-relaxed pt-1">
            "{hintText}"
          </p>
        </div>

        {/* Retry Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto min-w-[240px] py-3.5 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>THỬ LẠI NGAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
