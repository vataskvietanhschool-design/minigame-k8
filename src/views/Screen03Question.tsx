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
  1: 'Bấm các icon pin đang rơi. Thu đủ 100% năng lượng để bật robot.',
  2: 'Bấm các icon pin đang rơi. Trúng +5%, bỏ lỡ −5%. Thu đủ 100% năng lượng để bật robot.',
  3: 'Bấm robot đủ 120 lần trong 30 giây để kích hoạt.',
  4: 'Khi nhập mật khẩu hệ thống không báo mật khẩu đúng hay sai nếu nhập quá nhiều lần thì máy tự khóa. Nên cần viết chương trình để thông báo khi nhập mật khẩu và khi sai mật khẩu',
  5: 'Robot đang quá nóng nên không hoạt động bình thường. Hãy chọn chương trình giúp hạ nhiệt. Chỉ chương trình đúng mới làm nhiệt độ giảm. Gợi ý: chương trình phải cho biết khi đang hoạt động bình thường.'
};

const ENERGY_QUIZZES: Partial<Record<StationId, { prompt: string; options: string[]; correct: number; typed?: string }[]>> = {
  1: [
    {
      prompt: 'Robot cần bao nhiêu năng lượng để kích hoạt?',
      options: ['> 50%', '>= 60%', '= 100%'],
      correct: 2
    },
    {
      prompt: 'Nếu bạn bấm không đúng viên pin thì có hiện tượng gì xảy ra không?',
      options: ['Có', 'Không'],
      correct: 1
    },
    {
      prompt: 'Năng lượng chỉ tăng lên khi bấm trúng viên pin, vậy câu lệnh rẽ nhánh nên sử dụng ở đây là gì?',
      options: ['if then', 'if then else'],
      correct: 0
    }
  ],
  2: [
    {
      prompt: 'Khi bạn bỏ lỡ viên pin thì có điều gì xảy ra không?',
      options: ['Không có gì xảy ra', 'Có, bị trừ -5/Viên Pin'],
      correct: 1
    },
    {
      prompt: 'Nếu bạn bấm trúng viên pin thì +5 năng lượng, nếu để Pin chạm cạnh dưới thì bạn -5 điểm. Với điều kiện trên nên sử dụng câu lệnh rẽ nhánh nào?',
      options: ['if then', 'if then else', '2 câu if then'],
      correct: 2
    }
  ],
  3: [
    {
      prompt: 'Em cần Click đủ 120 lần trong bao lâu?',
      options: ['30', '60', '90'],
      correct: 0
    },
    {
      prompt: 'Nếu hết thời gian mà không click đủ 120 lần thì điều gì xảy ra?',
      options: ['Kích hoạt thành công', 'Kích hoạt thất bại', 'Không có gì xảy ra'],
      correct: 1
    },
    {
      prompt: 'Nếu click đủ 120 lần trong 30s thì thành công, nếu không thì thông báo thất bại. Với điều kiện này nên áp dụng trong trường hợp này là gì?',
      options: ['If then', 'If then else', 'nhiều câu lệnh if then'],
      correct: 1
    }
  ],
  4: [
    {
      prompt: 'Câu lệnh rẽ nhánh sử dụng trong chương trình trên là gì?',
      options: [],
      correct: 0,
      typed: 'if then else'
    },
    {
      prompt: 'Tại sao không sử dụng câu lệnh rẽ nhánh If Then?',
      options: [
        'Vì chương trình cần thông báo 2 trường hợp khi đúng và khi sai mật khẩu',
        'Vì chương trình có 3 trường hợp cần thông báo',
        'Sử dụng cái nào cũng được'
      ],
      correct: 0
    }
  ],
  5: [
    {
      prompt: 'Chương trình hạ nhiệt dùng câu lệnh rẽ nhánh nào?',
      options: ['If then', 'If then else', 'Hai câu if then'],
      correct: 1
    },
    {
      prompt: 'Vì sao chương trình “Nhiệt độ < 60” không hạ nhiệt được?',
      options: [
        'Vì robot đang nóng hơn 60, nhánh làm mát không chạy',
        'Vì chương trình không có khối say',
        'Vì chương trình thiếu nhánh else'
      ],
      correct: 0
    },
    {
      prompt: 'Nếu chỉ dùng If then thì khi nhiệt độ đã an toàn, chương trình có báo “Đang hoạt động” không?',
      options: ['Có', 'Không'],
      correct: 1
    }
  ]
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
  const energyQuizItems = ENERGY_QUIZZES[stationNo];
  const energyQuiz = Boolean(energyQuizItems);
  const alreadyTried = wrongCount > 0;
  const [solved, setSolved] = useState(alreadyTried);
  const [modalOpen, setModalOpen] = useState(alreadyTried && !energyQuiz);
  const [selectedOpt, setSelectedOpt] = useState<'A' | 'B' | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizWrong, setQuizWrong] = useState(false);
  const [typedValue, setTypedValue] = useState('');

  const handleSolved = () => {
    setSolved(true);
    if (!energyQuiz) setModalOpen(true);
  };

  const answerQuiz = (index: number) => {
    if (isSubmitting) return;
    const current = energyQuizItems?.[quizIndex];
    if (!current) return;
    if (index !== current.correct) {
      setQuizWrong(true);
      return;
    }
    setQuizWrong(false);
    setTypedValue('');
    if (quizIndex < (energyQuizItems?.length ?? 1) - 1) {
      setQuizIndex(quizIndex + 1);
      return;
    }
    onSelectOption(stationNo === 3 || stationNo === 5 ? 'B' : 'A');
  };

  const answerTyped = () => {
    if (isSubmitting) return;
    const current = energyQuizItems?.[quizIndex];
    if (!current?.typed) return;
    const typed = typedValue.trim().toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ');
    if (typed !== current.typed) {
      setQuizWrong(true);
      return;
    }
    answerQuiz(current.correct);
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

      {energyQuiz && solved && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug">
              Câu {quizIndex + 1}. {energyQuizItems?.[quizIndex].prompt}
            </h3>
            <span className="shrink-0 text-[11px] font-mono text-cyan-300">{quizIndex + 1}/{energyQuizItems?.length}</span>
          </div>
          {energyQuizItems?.[quizIndex].typed ? (
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                answerTyped();
              }}
            >
              <input
                value={typedValue}
                onChange={(event) => {
                  setTypedValue(event.target.value);
                  setQuizWrong(false);
                }}
                disabled={isSubmitting}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Nhập câu lệnh"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-100"
              />
              <button type="submit" disabled={isSubmitting} className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950">
                Trả lời
              </button>
            </form>
          ) : (
          <div className="grid grid-cols-1 gap-2">
            {energyQuizItems?.[quizIndex].options.map((label, index) => (
              <button
                key={label}
                type="button"
                disabled={isSubmitting}
                onClick={() => answerQuiz(index)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-slate-100 hover:border-cyan-500"
              >
                {label}
              </button>
            ))}
          </div>
          )}
          {quizWrong && <p className="text-sm font-medium text-amber-200">Chưa đúng. Hãy làm lại câu này.</p>}
          {isSubmitting && <p className="text-center text-xs text-cyan-400 font-mono">Đang xác thực câu trả lời...</p>}
        </div>
        </div>
      )}

      {solved && !modalOpen && !energyQuiz && (
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
