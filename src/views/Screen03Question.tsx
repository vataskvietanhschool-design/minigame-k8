import React, { useState } from 'react';
import { ClientQuestionView, StationId } from '../../shared/types';
import { HelpCircle } from 'lucide-react';
import { InteractiveStationMinigame } from '../components/InteractiveStationMinigame';

interface Screen03QuestionProps {
  question: ClientQuestionView;
  stationNo: StationId;
  attempts: number;
  wrongCount: number;
  isSubmitting: boolean;
  onSelectOption: (option: 'A' | 'B') => void;
}

const STATION_PROMPT: Partial<Record<StationId, string>> = {
  1: 'Robot cần mức pin đúng thì mới bật được nguồn. Hãy tìm mức đó.',
  2: 'Một thẻ làm cửa mở. Hãy tìm thẻ đó.',
  3: 'Hãy tìm mã làm đèn đổi màu.'
};

function isImageOption(value: string): boolean {
  return value.endsWith('.png');
}

export const Screen03Question: React.FC<Screen03QuestionProps> = ({
  question,
  stationNo,
  attempts,
  wrongCount,
  isSubmitting,
  onSelectOption
}) => {
  const imageQuestion = isImageOption(question.optionA);
  const alreadyTried = wrongCount > 0;
  const [solved, setSolved] = useState(alreadyTried);
  const [modalOpen, setModalOpen] = useState(alreadyTried);
  const [selectedOpt, setSelectedOpt] = useState<'A' | 'B' | null>(null);

  const handleSolved = () => {
    setSolved(true);
    setModalOpen(true);
  };

  const handleChoose = (opt: 'A' | 'B') => {
    if (isSubmitting) return;
    setSelectedOpt(opt);
    onSelectOption(opt);
  };

  const choice = (opt: 'A' | 'B', text: string, tone: 'cyan' | 'indigo') => {
    const selected = selectedOpt === opt;
    const ring = tone === 'cyan' ? 'border-cyan-500 ring-cyan-500/30 bg-cyan-950/80' : 'border-indigo-500 ring-indigo-500/30 bg-indigo-950/80';
    const badge = tone === 'cyan' ? 'bg-cyan-600' : 'bg-indigo-600';
    return (
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => handleChoose(opt)}
        aria-label={`Phương án ${opt}`}
        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
          selected ? `${ring} ring-2` : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
        } ${isSubmitting ? 'cursor-wait opacity-80' : 'cursor-pointer'} ${imageQuestion ? 'flex-col' : ''}`}
      >
        <span className={`w-8 h-8 rounded-lg ${badge} text-white font-black text-sm grid place-items-center shrink-0`}>{opt}</span>
        {isImageOption(text) ? (
          <img src={text} alt={`Phương án ${opt}`} className="w-full max-h-64 object-contain object-top rounded-lg bg-white" />
        ) : (
          <span className="text-sm font-semibold text-slate-200 pt-1">{text}</span>
        )}
      </button>
    );
  };

  return (
    <div className={`${imageQuestion ? 'max-w-6xl' : 'max-w-4xl'} mx-auto p-4 sm:p-6 space-y-4 my-2 pb-8`}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center font-black text-cyan-400 text-lg shadow-inner">
            {stationNo}
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              {imageQuestion ? 'Câu hỏi' : 'Thử thách'} {stationNo} / 5
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">{question.title}</h2>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-slate-950 text-slate-300 rounded-lg border border-slate-800 text-xs font-mono">
          Lượt thử: <strong>{attempts}</strong>
        </span>
      </div>

      {imageQuestion ? (
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl space-y-4">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white leading-snug">{question.question}</h3>
              <p className="mt-1 text-xs text-slate-400">Chọn chương trình đúng.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-start">
            {choice('A', question.optionA, 'cyan')}
            {choice('B', question.optionB, 'indigo')}
          </div>
          {isSubmitting && (
            <p className="text-center text-xs text-cyan-400 font-mono">Đang xác thực câu trả lời...</p>
          )}
        </div>
      ) : (
        <>
      <p className="text-sm sm:text-base text-slate-100 font-medium">{STATION_PROMPT[stationNo]}</p>

      <InteractiveStationMinigame stationNo={stationNo} onSolved={handleSolved} />

      {solved && !modalOpen && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-cyan-600 px-5 py-2 text-sm font-bold text-white"
          >
            Trả lời câu hỏi
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <h3 className="text-sm sm:text-base font-black text-white leading-snug">{question.question}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {choice('A', question.optionA, 'cyan')}
              {choice('B', question.optionB, 'indigo')}
            </div>
            {isSubmitting ? (
              <p className="text-center text-xs text-cyan-400 font-mono">Đang xác thực câu trả lời...</p>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full text-xs text-slate-400 hover:text-white"
              >
                Xem lại thử thách
              </button>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
