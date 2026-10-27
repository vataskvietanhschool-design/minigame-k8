import React, { useState } from 'react';
import { ClientQuestionView, StationId } from '../../shared/types';
import { RobotAvatar, RobotMood } from '../components/RobotAvatar';
import { HelpCircle, Sparkles, MessageCircle } from 'lucide-react';
import { InteractiveStationMinigame } from '../components/InteractiveStationMinigame';

interface Screen03QuestionProps {
  question: ClientQuestionView;
  stationNo: StationId;
  attempts: number;
  wrongCount: number;
  isSubmitting: boolean;
  onSelectOption: (option: 'A' | 'B') => void;
}

export const Screen03Question: React.FC<Screen03QuestionProps> = ({
  question,
  stationNo,
  attempts,
  wrongCount,
  isSubmitting,
  onSelectOption
}) => {
  const [selectedOpt, setSelectedOpt] = useState<'A' | 'B' | null>(null);
  const [showRobotTip, setShowRobotTip] = useState<boolean>(true);

  const getRobotMood = (): RobotMood => {
    if (stationNo === 1) return 'battery';
    if (stationNo === 2) return 'card';
    if (stationNo === 3) return 'laser';
    if (stationNo === 4) return 'temperature';
    if (stationNo === 5) return 'gears';
    return 'idle';
  };

  const getRobotSpeech = (): string => {
    switch (stationNo) {
      case 1:
        return 'Em hãy dùng chuột xoay núm vặn mức pin về 40% rồi gạt công tắc nguồn xem robot có bật được không nhé!';
      case 2:
        return 'Em hãy bấm chuột kéo từng thẻ lại vị trí khe quẹt trên cửa để thử xem thẻ nào mở được cửa nhé!';
      case 3:
        return 'Em hãy đọc gợi ý ở bên phải, nhập mã số trên bàn phím rồi nhấn ENTER để xem đèn nào bật sáng nhé!';
      case 4:
        return 'Em hãy kéo xô múc nước đổ vào lò lửa để hạ nhiệt độ về mốc 80°C và xem robot báo gì nhé!';
      case 5:
        return 'Em hãy gắp linh kiện từ hộp bên trái kéo sang hộp bên phải để xem khi nào tờ giấy nhiệm vụ có tích xanh nhé!';
      default:
        return 'Tớ đang đồng hành cùng em. Hãy tương tác mô phỏng rồi chọn đáp án A/B nhé!';
    }
  };

  const handleChoose = (opt: 'A' | 'B') => {
    if (isSubmitting) return;
    setSelectedOpt(opt);
    onSelectOption(opt);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 my-2 pb-24">
      {/* Station Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center font-black text-cyan-400 text-lg shadow-inner">
            {stationNo}
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              Thử thách {stationNo} / 5
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">{question.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 bg-slate-950 text-slate-300 rounded-lg border border-slate-800">
            Lượt thử: <strong>{attempts}</strong>
          </span>
          {wrongCount > 0 && (
            <span className="px-2.5 py-1 bg-amber-950 text-amber-400 rounded-lg border border-amber-800">
              Chưa đúng: <strong>{wrongCount}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Scenario Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Tình huống thử thách
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
          {question.scenario}
        </p>
      </div>

      {/* Interactive Minigame Simulation - Full Width */}
      <InteractiveStationMinigame stationNo={stationNo} />

      {/* Question & A/B Choices */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <h3 className="text-sm sm:text-base font-black text-white leading-snug">
            {question.question}
          </h3>
        </div>

        {/* A/B Option Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Option A */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleChoose('A')}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 group relative ${
              selectedOpt === 'A'
                ? 'bg-cyan-950/80 border-cyan-500 ring-2 ring-cyan-500/30'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            } ${isSubmitting ? 'cursor-wait opacity-80' : 'cursor-pointer active:scale-[0.99]'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-600 group-hover:bg-cyan-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
              A
            </div>
            <div className="flex-1 text-sm font-semibold text-slate-200 group-hover:text-white pt-1">
              {question.optionA}
            </div>
          </button>

          {/* Option B */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleChoose('B')}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 group relative ${
              selectedOpt === 'B'
                ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/30'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            } ${isSubmitting ? 'cursor-wait opacity-80' : 'cursor-pointer active:scale-[0.99]'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
              B
            </div>
            <div className="flex-1 text-sm font-semibold text-slate-200 group-hover:text-white pt-1">
              {question.optionB}
            </div>
          </button>
        </div>

        {isSubmitting && (
          <p className="text-center text-xs text-cyan-400 font-mono animate-pulse pt-2">
            Đang xác thực câu trả lời...
          </p>
        )}
      </div>

      {/* Floating Robot Companion in bottom corner */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none">
        {showRobotTip && (
          <div className="pointer-events-auto mb-2 max-w-[240px] sm:max-w-[280px] p-3 bg-slate-900/95 border border-cyan-500/60 rounded-2xl shadow-2xl backdrop-blur text-xs text-slate-200 relative animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={() => setShowRobotTip(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] border border-slate-700 shadow"
              title="Tạm ẩn lời nhắc"
            >
              ✕
            </button>
            <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-[11px] mb-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Gợi ý từ Trợ lý Robot</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {getRobotSpeech()}
            </p>
          </div>
        )}

        <div
          onClick={() => setShowRobotTip((prev) => !prev)}
          className="pointer-events-auto cursor-pointer p-2 bg-slate-900/95 hover:bg-slate-800 border-2 border-cyan-500 rounded-2xl shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 select-none"
          title="Nhấp để bật/tắt lời nhắc của Robot"
        >
          <RobotAvatar mood={getRobotMood()} size="sm" />
          <div className="hidden sm:flex flex-col pr-1 text-left">
            <span className="text-[11px] font-black text-cyan-300">Trợ lý Robot</span>
            <span className="text-[9px] text-slate-400 font-mono">Bấm để nghe gợi ý</span>
          </div>
        </div>
      </div>
    </div>
  );
};
