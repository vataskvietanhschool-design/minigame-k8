import React, { useEffect, useRef, useState } from 'react';

const STOPS = [
  { no: 1, x: 16, y: 90, title: 'Khởi động' },
  { no: 2, x: 84, y: 70, title: 'Mở cửa' },
  { no: 3, x: 16, y: 48, title: 'Laser' },
  { no: 4, x: 84, y: 26, title: 'Ước số' },
  { no: 5, x: 22, y: 8, title: 'Chẵn lẻ' }
] as const;

export type MapMode = 'pick' | 'walk' | 'pin' | 'finale';

interface StationPathMapProps {
  mode: MapMode;
  completedStations: number[];
  fromStation: number;
  toStation: number;
  onEnterFirst?: () => void;
  onWalkDone?: () => void;
  onShowResult?: () => void;
  pinSlot?: React.ReactNode;
}

function stopAt(no: number) {
  return STOPS.find((s) => s.no === no) || STOPS[0];
}

function curve(fromNo: number, toNo: number) {
  const a = stopAt(fromNo);
  const b = stopAt(toNo);
  const control = { x: a.x < b.x ? 78 : 22, y: a.y - 4 };
  return { a, b, control };
}

function pointOnCurve(fromNo: number, toNo: number, t: number) {
  const { a, b, control } = curve(fromNo, toNo);
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * control.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * control.y + t * t * b.y - Math.sin(t * Math.PI) * 3
  };
}

export const StationPathMap: React.FC<StationPathMapProps> = ({
  mode,
  completedStations,
  fromStation,
  toStation,
  onEnterFirst,
  onWalkDone,
  onShowResult,
  pinSlot
}) => {
  const [progress, setProgress] = useState(mode === 'walk' ? 0 : 1);
  const onWalkDoneRef = useRef(onWalkDone);
  onWalkDoneRef.current = onWalkDone;

  useEffect(() => {
    if (mode !== 'walk') {
      setProgress(1);
      return;
    }
    setProgress(0);
    let frame = 0;
    let finished = false;
    const started = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 2200);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setProgress(eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else if (!finished) {
        finished = true;
        onWalkDoneRef.current?.();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, fromStation, toStation]);

  const marker =
    mode === 'walk'
      ? pointOnCurve(fromStation, toStation, progress)
      : mode === 'pick'
        ? stopAt(1)
        : mode === 'finale'
          ? stopAt(5)
          : stopAt(toStation);

  const trail = STOPS.slice(0, -1)
    .map((station) => {
      const next = stopAt(station.no + 1);
      const bend = curve(station.no, next.no).control;
      return `M ${station.x} ${station.y} Q ${bend.x} ${bend.y} ${next.x} ${next.y}`;
    })
    .join(' ');

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-4 space-y-4">
      <style>{`
        @keyframes station-path-flow { to { stroke-dashoffset: -28; } }
        @keyframes station-bob { 50% { transform: translate(-50%, -150%) translateY(-8px); } }
        @keyframes station-glow { 50% { box-shadow: 0 0 0 8px rgba(34,211,238,0.18); } }
      `}</style>
      <div className="relative h-[680px] rounded-3xl border border-cyan-900/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden shadow-2xl shadow-cyan-950/40">
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_80%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.16),transparent_28%)]" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          <path d={trail} fill="none" stroke="#155e75" strokeWidth="2.4" strokeLinecap="round" />
          <path
            d={trail}
            fill="none"
            stroke="#67e8f9"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeDasharray="2.2 1.8"
            style={{ animation: 'station-path-flow 1.4s linear infinite' }}
          />
        </svg>
        {STOPS.map((station) => {
          const done = completedStations.includes(station.no) || mode === 'finale';
          const isFirstOpen = mode === 'pick' && station.no === 1 && !done;
          const arrived = mode !== 'walk' && marker.x === station.x && marker.y === station.y;
          return (
            <button
              key={station.no}
              type="button"
              disabled={!isFirstOpen}
              onClick={isFirstOpen ? onEnterFirst : undefined}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-[4.6rem] rounded-2xl border px-1.5 py-2.5 text-center transition duration-300 ${
                isFirstOpen
                  ? 'border-cyan-300 bg-cyan-900 cursor-pointer'
                  : done
                    ? 'border-emerald-400 bg-emerald-950/90 cursor-default'
                    : 'border-slate-600 bg-slate-950/90 cursor-default'
              }`}
              style={{
                left: `${station.x}%`,
                top: `${station.y}%`,
                animation: isFirstOpen ? 'station-glow 1.6s ease-in-out infinite' : undefined
              }}
            >
              <span className={`mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full text-[11px] font-black ${done ? 'bg-emerald-400 text-slate-950' : 'bg-cyan-400 text-slate-950'}`}>
                {done ? '✓' : station.no}
              </span>
              <span className="block text-[11px] font-bold text-white leading-tight">{station.title}</span>
              <span className="block text-[10px] text-slate-300">{done ? 'Xong' : isFirstOpen ? 'Vào' : 'Khóa'}</span>
              {arrived && !isFirstOpen && <span className="mt-1 block text-[9px] font-bold text-cyan-300">Đang ở đây</span>}
            </button>
          );
        })}
        <div
          className="absolute z-10 grid h-11 w-11 place-items-center rounded-full border-2 border-amber-100 bg-amber-400 text-xl shadow-lg shadow-amber-500/40 pointer-events-none"
          style={{
            left: `${marker.x}%`,
            top: `${marker.y}%`,
            transform: 'translate(-50%, -150%)',
            animation: mode === 'walk' ? 'station-bob 0.45s ease-in-out infinite' : undefined
          }}
          aria-hidden
        >
          🤖
        </div>
      </div>
      {mode === 'walk' && (
        <p className="text-center text-sm font-semibold text-cyan-200">Đang đi tới trạm {toStation}.</p>
      )}
      {mode === 'pin' && pinSlot}
      {mode === 'finale' && (
        <button
          type="button"
          onClick={onShowResult}
          className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black"
        >
          Xem kết quả
        </button>
      )}
    </div>
  );
};
