import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../utils/sound';

const LIMIT_SECONDS = 30;
const GOAL = 120;

interface Station3RobotChargeProps {
  onSolved?: () => void;
}

export const Station3RobotCharge: React.FC<Station3RobotChargeProps> = ({ onSolved }) => {
  const [clicks, setClicks] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(LIMIT_SECONDS);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [started, setStarted] = useState(false);
  const clicksRef = useRef(0);
  const solvedRef = useRef(false);

  useEffect(() => {
    if (!started || failed || done) return;
    const endsAt = performance.now() + LIMIT_SECONDS * 1000;
    const timer = window.setInterval(() => {
      const remain = Math.max(0, (endsAt - performance.now()) / 1000);
      setSecondsLeft(remain);
      if (remain <= 0 && !solvedRef.current) setFailed(true);
    }, 100);
    return () => window.clearInterval(timer);
  }, [started, failed, done, round]);

  const tap = () => {
    if (!started || failed || solvedRef.current) return;
    const next = Math.min(GOAL, clicksRef.current + 1);
    clicksRef.current = next;
    setClicks(next);
    setPulse((value) => value + 1);
    sounds.playTick();
    if (next >= GOAL) {
      solvedRef.current = true;
      setDone(true);
      sounds.playPowerUp();
      onSolved?.();
    }
  };

  const retry = () => {
    clicksRef.current = 0;
    solvedRef.current = false;
    setClicks(0);
    setSecondsLeft(LIMIT_SECONDS);
    setFailed(false);
    setPulse(0);
    setStarted(false);
    setRound((value) => value + 1);
  };

  const shownSeconds = Math.ceil(secondsLeft);
  const energy = Math.round((clicks / GOAL) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-cyan-200">
        <span>Thời gian: {shownSeconds}s</span>
        <span>{clicks}/{GOAL} lần</span>
      </div>
      <div className="relative mx-auto grid h-80 w-full max-w-sm place-items-center">
        <button
          type="button"
          onClick={tap}
          disabled={!started || failed || done}
          aria-label="Bấm để kích hoạt robot"
          className="relative h-72 w-44 select-none disabled:cursor-default"
        >
          <span className="absolute left-1/2 top-0 h-3 w-1 -translate-x-1/2 rounded-full bg-cyan-300" />
          <span className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
          <span className="absolute left-1/2 top-6 grid h-14 w-24 -translate-x-1/2 place-items-center rounded-2xl border-2 border-cyan-200 bg-slate-900">
            <span className="flex gap-4">
              <span className="h-3 w-3 rounded-full bg-cyan-300" />
              <span className="h-3 w-3 rounded-full bg-cyan-300" />
            </span>
          </span>
          <span className="absolute bottom-2 left-1/2 h-48 w-36 -translate-x-1/2 overflow-hidden rounded-[1.6rem] border-2 border-cyan-200 bg-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
            <span
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-500 via-emerald-400 to-cyan-300 transition-[height] duration-75"
              style={{ height: `${energy}%` }}
            />
            <span className="absolute inset-0 grid place-items-center font-mono text-2xl font-black text-white drop-shadow">
              {energy}%
            </span>
          </span>
          {pulse > 0 && (
            <span
              key={pulse}
              className="pointer-events-none absolute bottom-2 left-1/2 h-48 w-36 -translate-x-1/2 rounded-[1.6rem] border-2 border-emerald-200"
              style={{ animation: 'robot-tap 180ms ease-out' }}
            />
          )}
        </button>
        <style>{`@keyframes robot-tap { 0% { opacity: 0.9; } 100% { opacity: 0; transform: translateX(-50%) scale(1.08); } }`}</style>
        {!started && !failed && !done && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-slate-950/85 p-4 text-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-cyan-100">Bấm robot đủ 120 lần trong 30 giây để kích hoạt.</p>
              <p className="text-xs text-slate-300">Đọc hướng dẫn, rồi bấm Bắt đầu. Đồng hồ chỉ chạy sau đó.</p>
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-black text-slate-950"
              >
                Bắt đầu
              </button>
            </div>
          </div>
        )}
        {failed && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-slate-950/80 p-4 text-center">
            <div className="space-y-3">
              <p className="text-lg font-black text-rose-300">Kích hoạt thất bại</p>
              <p className="text-sm text-rose-100">Hết 30 giây mà chưa đủ 120 lần bấm.</p>
              <button
                type="button"
                onClick={retry}
                className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-black text-slate-950"
              >
                Chơi lại
              </button>
            </div>
          </div>
        )}
        {done && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
            <p className="text-sm font-black text-emerald-300">Robot đã kích hoạt</p>
          </div>
        )}
      </div>
    </div>
  );
};
