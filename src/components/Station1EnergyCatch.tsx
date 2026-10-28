import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../utils/sound';

type Cell = { id: number; x: number; y: number };
type Burst = { id: number; x: number; y: number; kind: 'hit' | 'miss' };

function PinIcon() {
  return (
    <svg viewBox="0 0 28 40" className="h-9 w-7 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]" aria-hidden>
      <rect x="9" y="1" width="10" height="4" rx="1.2" fill="#a7f3d0" />
      <rect x="2.5" y="6" width="23" height="32" rx="4" fill="#022c22" stroke="#6ee7b7" strokeWidth="2" />
      <rect x="6" y="20" width="16" height="14" rx="1.5" fill="#34d399" />
      <path d="M14 11.5v7M10.5 15h7" stroke="#d1fae5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

interface Station1EnergyCatchProps {
  onSolved?: () => void;
  fallSpeed?: number;
  penalizeMiss?: boolean;
  hint?: string;
}

export const Station1EnergyCatch: React.FC<Station1EnergyCatchProps> = ({
  onSolved,
  fallSpeed = 0.04,
  penalizeMiss = false,
  hint = 'Bấm icon pin đang rơi. Mỗi viên +5%. Cần đủ 100% để bật robot.'
}) => {
  const [energy, setEnergy] = useState(0);
  const [cells, setCells] = useState<Cell[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [activated, setActivated] = useState(false);
  const energyRef = useRef(0);
  const solvedRef = useRef(false);
  const idRef = useRef(0);
  const spawnWait = useRef(0);
  const cellsRef = useRef<Cell[]>([]);

  useEffect(() => {
    if (activated) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      spawnWait.current += dt;
      const missed: Cell[] = [];
      const kept: Cell[] = [];
      for (const cell of cellsRef.current) {
        const next = { ...cell, y: cell.y + dt * fallSpeed };
        if (next.y < 108) kept.push(next);
        else missed.push(next);
      }
      if (spawnWait.current >= 780) {
        spawnWait.current = 0;
        idRef.current += 1;
        kept.push({ id: idRef.current, x: 8 + Math.random() * 76, y: -12 });
      }
      cellsRef.current = kept;
      setCells(kept);
      if (penalizeMiss && missed.length && !solvedRef.current) {
        setBursts((prev) => [
          ...prev,
          ...missed.map((cell) => ({ id: cell.id, x: cell.x, y: 90, kind: 'miss' as const }))
        ]);
        sounds.playBeep(false);
        const next = Math.max(0, energyRef.current - missed.length * 5);
        energyRef.current = next;
        setEnergy(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activated, fallSpeed, penalizeMiss]);

  const catchCell = (cell: Cell) => {
    if (solvedRef.current) return;
    setBursts((prev) => [...prev, { id: cell.id, x: cell.x, y: cell.y, kind: 'hit' }]);
    cellsRef.current = cellsRef.current.filter((item) => item.id !== cell.id);
    setCells(cellsRef.current);
    sounds.playBeep(true);
    const next = Math.min(100, energyRef.current + 5);
    energyRef.current = next;
    setEnergy(next);
    if (next >= 100 && !solvedRef.current) {
      solvedRef.current = true;
      setActivated(true);
      cellsRef.current = [];
      setCells([]);
      sounds.playPowerUp();
      onSolved?.();
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-cyan-200">
          <span>Năng lượng</span>
          <span>{energy}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border border-cyan-800 bg-slate-950">
          <div
            className={`h-full rounded-full transition-[width] duration-150 ${energy >= 100 ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ width: `${energy}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">{hint}</p>
      </div>

      <div className="relative h-80 overflow-hidden rounded-2xl border border-cyan-900 bg-slate-950 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:22px_22px]">
        <style>{`
          @keyframes pin-burst {
            0% { transform: translate(-50%, -40%); opacity: 1; }
            100% { transform: translate(-50%, -170%); opacity: 0; }
          }
          @keyframes pin-ring {
            0% { transform: translate(-50%, -50%) scale(0.35); opacity: 0.95; }
            100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
          }
          @keyframes pin-pop {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
          }
        `}</style>
        {activated && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/75">
            <div className="text-center">
              <p className="text-lg font-black text-emerald-300">Robot đã bật</p>
              <p className="mt-1 text-sm text-emerald-100">Đã đủ {energy}% năng lượng.</p>
            </div>
          </div>
        )}
        {cells.map((cell) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => catchCell(cell)}
            className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
            aria-label="Thu pin 5%"
          >
            <PinIcon />
          </button>
        ))}
        {bursts.map((burst) => (
          <span key={burst.id} className="pointer-events-none absolute z-20" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
            <span
              className={`absolute h-10 w-10 rounded-full border-2 ${burst.kind === 'hit' ? 'border-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.8)]' : 'border-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.8)]'}`}
              style={{ animation: 'pin-ring 420ms ease-out forwards' }}
            />
            {burst.kind === 'hit' && (
              <span className="absolute" style={{ animation: 'pin-pop 380ms ease-out forwards' }}>
                <PinIcon />
              </span>
            )}
            <span
              className={`absolute font-mono text-sm font-black ${burst.kind === 'hit' ? 'text-emerald-300' : 'text-rose-300'}`}
              style={{ animation: 'pin-burst 520ms ease-out forwards' }}
              onAnimationEnd={() => setBursts((prev) => prev.filter((item) => item.id !== burst.id))}
            >
              {burst.kind === 'hit' ? '+5%' : '−5%'}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
