import React, { useRef, useState } from 'react';
import { sounds } from '../utils/sound';

const PROGRAMS = [
  { id: 'then-only', src: '/assets/hinhcauhoi/5_1.png' },
  { id: 'correct', src: '/assets/hinhcauhoi/5_2.png' },
  { id: 'reversed', src: '/assets/hinhcauhoi/5_3.png' }
] as const;

type ProgramId = (typeof PROGRAMS)[number]['id'];

interface Station5CoolDownProps {
  onSolved?: () => void;
}

export const Station5CoolDown: React.FC<Station5CoolDownProps> = ({ onSolved }) => {
  const [temp, setTemp] = useState(90);
  const [selected, setSelected] = useState<ProgramId | null>(null);
  const [warning, setWarning] = useState('');
  const [cooling, setCooling] = useState(false);
  const solvedRef = useRef(false);

  const check = () => {
    if (solvedRef.current || cooling) return;
    if (!selected) {
      setWarning('Hãy chọn một chương trình.');
      return;
    }
    if (selected !== 'correct') {
      sounds.playBeep(false);
      setWarning('Chưa hạ được nhiệt. Hãy chọn lại.');
      return;
    }
    sounds.playPowerUp();
    setWarning('');
    setCooling(true);
    setTemp(38);
  };

  const finishCooling = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'height' || !cooling || solvedRef.current) return;
    solvedRef.current = true;
    onSolved?.();
  };

  const level = Math.max(8, Math.min(100, ((temp - 20) / 80) * 100));

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="relative h-44 w-14 overflow-hidden rounded-full border border-rose-400/70 bg-slate-950">
          <div
            className={`absolute inset-x-0 bottom-0 ${temp > 60 ? 'bg-gradient-to-t from-rose-600 to-orange-400' : 'bg-gradient-to-t from-cyan-500 to-emerald-300'}`}
            style={{ height: `${level}%`, transition: 'height 1.6s ease-in-out' }}
            onTransitionEnd={finishCooling}
          />
        </div>
        <div>
          <p className="text-2xl font-black text-white">{Math.round(temp)}°C</p>
          <p className="text-xs text-slate-400">{temp > 60 ? 'Robot đang quá nóng' : 'Nhiệt độ đã an toàn'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {PROGRAMS.map((program) => (
          <button
            key={program.id}
            type="button"
            disabled={cooling}
            aria-pressed={selected === program.id}
            onClick={() => {
              setSelected(program.id);
              setWarning('');
              sounds.playTick();
            }}
            className={`relative rounded-2xl border-4 bg-white p-2 transition duration-200 ${
              selected === program.id
                ? 'z-10 scale-[1.03] border-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.35),0_0_28px_rgba(34,211,238,0.85)]'
                : selected
                  ? 'border-slate-700 opacity-45'
                  : 'border-slate-700'
            }`}
          >
            {selected === program.id && (
              <span className="absolute left-2 top-2 rounded-full bg-cyan-400 px-2 py-0.5 text-[11px] font-black text-slate-950">
                Đang chọn
              </span>
            )}
            <img src={program.src} alt="" className="mx-auto max-h-52 w-full object-contain" />
          </button>
        ))}
      </div>

      {!cooling && (
        <button type="button" onClick={check} className="w-full rounded-full bg-cyan-500 py-2 text-sm font-black text-slate-950">
          Kiểm tra
        </button>
      )}
      {cooling && <p className="text-center text-sm font-black text-emerald-300">Đang hạ nhiệt.</p>}
      {warning && <p className="text-sm font-semibold text-rose-300">{warning}</p>}
    </div>
  );
};
