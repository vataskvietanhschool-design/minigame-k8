import React, { useRef, useState } from 'react';

type PieceId = 'ifelse' | 'ifthen' | 'cond' | 'ok' | 'bad';
type SlotId = 'frame' | 'cond' | 'then' | 'else';

const PIECES: { id: PieceId; src: string; left: string; top: string; tall?: boolean }[] = [
  { id: 'ifelse', src: '/assets/hinhcauhoi/4_1.png', left: '4%', top: '8%', tall: true },
  { id: 'ifthen', src: '/assets/hinhcauhoi/4_2.png', left: '46%', top: '6%', tall: true },
  { id: 'cond', src: '/assets/hinhcauhoi/4_3.png', left: '24%', top: '48%' },
  { id: 'ok', src: '/assets/hinhcauhoi/4_5.png', left: '2%', top: '62%' },
  { id: 'bad', src: '/assets/hinhcauhoi/4_6.png', left: '50%', top: '54%' }
];

const SLOTS: { id: SlotId; label: string }[] = [
  { id: 'frame', label: 'Khối rẽ nhánh' },
  { id: 'cond', label: 'Điều kiện' },
  { id: 'then', label: 'Nhánh đúng' },
  { id: 'else', label: 'Nhánh sai' }
];

function accepts(slot: SlotId, piece: PieceId) {
  if (slot === 'frame') return piece === 'ifelse' || piece === 'ifthen';
  if (slot === 'cond') return piece === 'cond';
  return piece === 'ok' || piece === 'bad';
}

interface Station4BlockBenchProps {
  onSolved?: () => void;
}

export const Station4BlockBench: React.FC<Station4BlockBenchProps> = ({ onSolved }) => {
  const [placed, setPlaced] = useState<Partial<Record<SlotId, PieceId>>>({});
  const [drag, setDrag] = useState<{ id: PieceId; x: number; y: number; ox: number; oy: number } | null>(null);
  const [warning, setWarning] = useState('');
  const [passed, setPassed] = useState(false);
  const slotRefs = useRef<Partial<Record<SlotId, HTMLDivElement | null>>>({});
  const dragRef = useRef<typeof drag>(null);

  const pieceInSlot = (id: PieceId) => (Object.values(placed) as PieceId[]).includes(id);

  const startDrag = (id: PieceId, event: React.PointerEvent<HTMLButtonElement>) => {
    if (passed) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const next = { id, x: event.clientX, y: event.clientY, ox: event.clientX - rect.left, oy: event.clientY - rect.top };
    dragRef.current = next;
    setDrag(next);
    setPlaced((prev) => {
      const copy = { ...prev };
      (Object.keys(copy) as SlotId[]).forEach((slot) => {
        if (copy[slot] === id) delete copy[slot];
      });
      return copy;
    });

    const move = (ev: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      const updated = { ...current, x: ev.clientX, y: ev.clientY };
      dragRef.current = updated;
      setDrag(updated);
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!current) return;
      let hit: SlotId | null = null;
      (Object.keys(slotRefs.current) as SlotId[]).forEach((slot) => {
        const node = slotRefs.current[slot];
        if (!node || hit) return;
        const bounds = node.getBoundingClientRect();
        if (ev.clientX >= bounds.left && ev.clientX <= bounds.right && ev.clientY >= bounds.top && ev.clientY <= bounds.bottom) {
          hit = slot;
        }
      });
      if (!hit || !accepts(hit, current.id)) return;
      const target = hit;
      setPlaced((prev) => ({ ...prev, [target]: current.id }));
      setWarning('');
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const check = () => {
    if (passed) return;
    if ((Object.values(placed) as PieceId[]).includes('ifthen')) {
      setWarning('Khối if then không dùng được. Hãy điều chỉnh lại.');
      return;
    }
    if (placed.frame === 'ifelse' && placed.cond === 'cond' && placed.then === 'ok' && placed.else === 'bad') {
      setWarning('');
      setPassed(true);
      onSolved?.();
      return;
    }
    setWarning('Chưa đúng. Hãy điều chỉnh lại các mảnh.');
  };

  const renderPiece = (id: PieceId, className: string) => {
    const piece = PIECES.find((item) => item.id === id);
    if (!piece || drag?.id === id) return null;
    return (
      <button type="button" onPointerDown={(event) => startDrag(id, event)} className={`touch-none cursor-grab active:cursor-grabbing ${className}`}>
        <img src={piece.src} alt="" draggable={false} className="h-full w-auto max-w-full object-contain" />
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <style>{`@keyframes piece-float { 50% { transform: translateY(-10px); } }`}</style>
      <div className="relative h-56 overflow-hidden rounded-2xl border border-cyan-900 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(251,191,36,0.12),transparent_36%)] bg-slate-950">
        {PIECES.filter((piece) => !pieceInSlot(piece.id)).map((piece) => (
          <div
            key={piece.id}
            className="absolute"
            style={{ left: piece.left, top: piece.top, animation: drag?.id === piece.id ? undefined : 'piece-float 2.8s ease-in-out infinite' }}
          >
            {renderPiece(piece.id, piece.tall ? 'h-20' : 'h-12')}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-amber-700/70 bg-slate-950 p-4 space-y-3">
        <p className="text-xs font-black uppercase tracking-wider text-amber-200">Cổ máy</p>
        <div
          ref={(node) => { slotRefs.current.frame = node; }}
          className="min-h-24 rounded-2xl border border-dashed border-amber-400/70 bg-slate-900 p-2"
        >
          <p className="mb-1 text-[10px] font-bold text-amber-200/80">{SLOTS[0].label}</p>
          {placed.frame && renderPiece(placed.frame, 'h-16')}
        </div>
        <div className="ml-5 space-y-2 border-l-4 border-amber-500 pl-3">
          {SLOTS.slice(1).map((slot) => (
            <div
              key={slot.id}
              ref={(node) => { slotRefs.current[slot.id] = node; }}
              className="min-h-16 rounded-xl border border-dashed border-slate-600 bg-slate-900 px-2 py-1"
            >
              <p className="text-[10px] font-bold text-slate-400">{slot.label}</p>
              {placed[slot.id] && renderPiece(placed[slot.id] as PieceId, 'h-10')}
            </div>
          ))}
        </div>
        {!passed ? (
          <button type="button" onClick={check} className="w-full rounded-full bg-amber-400 py-2 text-sm font-black text-slate-950">
            Kiểm tra
          </button>
        ) : (
          <p className="text-center text-sm font-black text-emerald-300">Chương trình đúng.</p>
        )}
        {warning && <p className="text-sm font-semibold text-rose-300">{warning}</p>}
      </div>

      {drag && (
        <img
          src={PIECES.find((piece) => piece.id === drag.id)?.src}
          alt=""
          className="pointer-events-none fixed z-50 h-16 w-auto"
          style={{ left: drag.x - drag.ox, top: drag.y - drag.oy }}
        />
      )}
    </div>
  );
};
