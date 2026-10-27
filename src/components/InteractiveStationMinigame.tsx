import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StationId } from '../../shared/types';
import { 
  Power, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  RotateCw, 
  ShieldCheck, 
  Cpu, 
  Flame, 
  Snowflake,
  Zap,
  MousePointer,
  Droplets,
  Thermometer,
  Waves
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface InteractiveStationMinigameProps {
  stationNo: StationId;
}

// ---------------------------------------------------------------------------
// Reusable Tactile Rotary Dial Knob Component (For Station 1 and Station 4)
// ---------------------------------------------------------------------------
interface RotaryKnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label: string;
  targetMarker?: number;
  criticalMarkerLabel?: string;
  presets?: { value: number; label: string; desc?: string }[];
  onChange: (val: number) => void;
}

const RotaryKnob: React.FC<RotaryKnobProps> = ({
  value,
  min,
  max,
  step = 1,
  unit = '',
  label,
  targetMarker,
  criticalMarkerLabel,
  presets = [],
  onChange
}) => {
  const knobRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastAngleRef = useRef<number>(0);

  // Map value to angle (-135deg to +135deg, total 270deg sweep)
  const valueToAngle = (v: number) => {
    const fraction = (v - min) / (max - min);
    return -135 + fraction * 270;
  };

  // Map angle back to value
  const angleToValue = (deg: number) => {
    const clampedDeg = Math.max(-135, Math.min(135, deg));
    const fraction = (clampedDeg - (-135)) / 270;
    const rawVal = min + fraction * (max - min);
    const stepped = Math.round(rawVal / step) * step;
    return Math.max(min, Math.min(max, stepped));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  };

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle in degrees where 0deg is top (12 o'clock)
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg > 180) deg -= 360;

    // Dead zone check (avoid jumping when dragging through bottom 90 degrees)
    if (deg > 140 && lastAngleRef.current < -100) return;
    if (deg < -140 && lastAngleRef.current > 100) return;

    lastAngleRef.current = deg;
    const newVal = angleToValue(deg);
    if (newVal !== value) {
      sounds.playTick();
      onChange(newVal);
    }
  }, [min, max, step, value, onChange]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      updateFromPointer(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, updateFromPointer]);

  const currentAngle = valueToAngle(value);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
        <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
        <span>{label}</span>
      </div>

      {/* Rotary Dial Container */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Outer Bezel Dial Markings */}
        <div className="absolute inset-0 rounded-full border-2 border-slate-700 bg-slate-950/90 shadow-2xl flex items-center justify-center">
          {[0, 25, 50, 75, 100].map((pct) => {
            const val = min + (pct / 100) * (max - min);
            const ang = valueToAngle(val);
            const isTarget = targetMarker !== undefined && Math.abs(val - targetMarker) < 0.1;
            return (
              <div
                key={pct}
                className="absolute inset-0 flex flex-col items-center pointer-events-none"
                style={{ transform: `rotate(${ang}deg)` }}
              >
                <div
                  className={`w-1 h-3 rounded-full mt-1.5 ${
                    isTarget ? 'bg-amber-400 h-4 w-1.5' : 'bg-slate-500'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono mt-1 ${
                    isTarget ? 'text-amber-300 font-bold' : 'text-slate-500'
                  }`}
                  style={{ transform: `rotate(${-ang}deg)` }}
                >
                  {val}{unit}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tactile Rotating Knob Body */}
        <div
          ref={knobRef}
          onPointerDown={handlePointerDown}
          className={`relative w-28 h-28 rounded-full cursor-grab active:cursor-grabbing transition-transform duration-75 shadow-xl ${
            isDragging ? 'scale-105 ring-4 ring-cyan-500/40' : 'hover:ring-2 hover:ring-cyan-500/30'
          }`}
          style={{
            background: 'radial-gradient(circle at 35% 35%, #334155 0%, #0f172a 70%, #020617 100%)',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 8px 16px rgba(0,0,0,0.6)',
            transform: `rotate(${currentAngle}deg)`
          }}
          title="Bấm chuột và xoay núm vặn"
        >
          <div className="absolute inset-1 rounded-full border border-dashed border-slate-600/50" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
            <div className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/60 shadow-sm shadow-cyan-400" />
          </div>
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-6 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400" />
        </div>

        {targetMarker !== undefined && criticalMarkerLabel && (
          <div className="absolute -bottom-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md border border-amber-300 uppercase">
            {criticalMarkerLabel}
          </div>
        )}
      </div>

      {/* Value Display */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[11px] text-slate-400 font-mono">Giá trị hiện tại:</span>
        <span className="font-mono font-black text-xl text-cyan-300 bg-slate-950 px-3 py-0.5 rounded-lg border border-slate-800 shadow-inner">
          {value}{unit}
        </span>
      </div>

      {/* Preset Notches for Quick Testing */}
      {presets.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                sounds.playTick();
                onChange(p.value);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition active:scale-95 ${
                value === p.value
                  ? 'bg-cyan-600 text-white ring-2 ring-cyan-400 shadow-md shadow-cyan-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// TRẠM 2: Minigame Kéo Thả Thẻ Từ Quẹt Vào Khe Cửa Phòng Thí Nghiệm
// ---------------------------------------------------------------------------
interface KeycardItem {
  id: 'card_hex' | 'card_diamond';
  code: string;
  symbol: string;
  symbolName: string;
  borderStyle: string;
  chipColor: string;
  isValid: boolean;
}

const STATION2_CARDS: KeycardItem[] = [
  {
    id: 'card_hex',
    code: 'MÃ #KX-71',
    symbol: '⬡',
    symbolName: 'Ký hiệu Lục giác',
    borderStyle: 'border-amber-500/60 shadow-amber-500/20',
    chipColor: 'bg-amber-400',
    isValid: false, // Thẻ sai để học sinh thử sai
  },
  {
    id: 'card_diamond',
    code: 'MÃ #QZ-94',
    symbol: '❖',
    symbolName: 'Ký hiệu Kim cương',
    borderStyle: 'border-cyan-500/60 shadow-cyan-500/20',
    chipColor: 'bg-cyan-400',
    isValid: true, // Thẻ đúng
  },
];

const Station2DragCardMinigame: React.FC = () => {
  const [doorState, setDoorState] = useState<'CLOSED' | 'OPEN'>('CLOSED');
  const [activeSlotCard, setActiveSlotCard] = useState<KeycardItem | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Hãy bấm chuột kéo 1 trong 2 thẻ từ sang khe quẹt trên cửa để thử nghiệm!'
  );

  // Dragging states
  const [draggingCard, setDraggingCard] = useState<KeycardItem | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringSlot, setIsHoveringSlot] = useState<boolean>(false);

  const slotRef = useRef<HTMLDivElement | null>(null);

  // Start pointer drag on card
  const handleStartDrag = (card: KeycardItem, e: React.PointerEvent) => {
    e.preventDefault();
    sounds.playTick();
    setDraggingCard(card);
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  // Track dragging movement and collision with slot
  useEffect(() => {
    if (!draggingCard) return;

    const handlePointerMove = (e: PointerEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      if (slotRef.current) {
        const rect = slotRef.current.getBoundingClientRect();
        // Generous hit box (+40px)
        const isInside =
          e.clientX >= rect.left - 40 &&
          e.clientX <= rect.right + 40 &&
          e.clientY >= rect.top - 40 &&
          e.clientY <= rect.bottom + 40;
        setIsHoveringSlot(isInside);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (slotRef.current) {
        const rect = slotRef.current.getBoundingClientRect();
        const isInside =
          e.clientX >= rect.left - 40 &&
          e.clientX <= rect.right + 40 &&
          e.clientY >= rect.top - 40 &&
          e.clientY <= rect.bottom + 40;

        if (isInside) {
          dockCardIntoSlot(draggingCard);
        }
      }
      setDraggingCard(null);
      setIsHoveringSlot(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingCard]);

  // Dock card and evaluate
  const dockCardIntoSlot = (card: KeycardItem) => {
    setActiveSlotCard(card);
    setIsScanning(true);
    setScanResult('IDLE');
    sounds.playTick();

    setTimeout(() => {
      setIsScanning(false);
      if (card.isValid) {
        sounds.playBeep(true);
        sounds.playPowerUp();
        setScanResult('VALID');
        setDoorState('OPEN');
        setStatusMessage(
          `✅ THẺ ${card.symbol} HỢP LỆ (Điều kiện ĐÚNG) → Khối lệnh "Mở cửa" được thực thi! Cửa trượt mở.`
        );
      } else {
        sounds.playBeep(false);
        setScanResult('INVALID');
        setDoorState('CLOSED');
        setStatusMessage(
          `❌ THẺ ${card.symbol} KHÔNG HỢP LỆ (Điều kiện SAI) → Khối lệnh mở cửa không chạy! Cửa ban đầu đang đóng nên VẪN ĐÓNG!`
        );
      }
    }, 600);
  };

  // Reset to initial state
  const handleReset = () => {
    sounds.playTick();
    setDoorState('CLOSED');
    setActiveSlotCard(null);
    setScanResult('IDLE');
    setIsScanning(false);
    setStatusMessage('Đã đặt lại vị trí thẻ. Hãy thử kéo thẻ còn lại để quan sát phản ứng của cửa!');
  };

  return (
    <div className="space-y-4">
      {/* Interactive Arena */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Left Side: Card Desk with mysterious symbol cards */}
        <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-inner space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                BÀN THẺ TỪ (BẤM GIỮ ĐỂ KÉO)
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Thử nghiệm 2 thẻ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Kéo thẻ di chuyển sang khe quẹt trên cửa phòng thí nghiệm (hoặc nhấp vào thẻ để tự động quẹt):
            </p>

            {/* 2 Keycards */}
            <div className="grid grid-cols-2 gap-3">
              {STATION2_CARDS.map((card) => {
                const isSlotted = activeSlotCard?.id === card.id;
                return (
                  <div
                    key={card.id}
                    onPointerDown={(e) => handleStartDrag(card, e)}
                    onClick={() => dockCardIntoSlot(card)}
                    className={`relative p-3 rounded-xl border-2 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing transition-all select-none ${
                      card.borderStyle
                    } ${
                      isSlotted ? 'opacity-40 scale-95 border-dashed' : 'hover:scale-102 hover:shadow-lg'
                    }`}
                    title="Bấm giữ chuột để kéo sang khe quẹt trên cửa"
                  >
                    {/* Magnetic Stripe on Top */}
                    <div className="w-full h-2 bg-slate-800 rounded-sm mb-1" />

                    {/* Prominent Mysterious Symbol (No text stating right/wrong!) */}
                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner font-mono font-bold text-white">
                      {card.symbol}
                    </div>

                    {/* Microchip Pin */}
                    <div className={`w-4 h-3 rounded-sm ${card.chipColor} opacity-80 my-0.5`} />

                    {/* Card Code (Mysterious serial) */}
                    <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-wider">
                      {card.code}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {card.symbolName}
                    </span>

                    {/* Visual drag prompt tag */}
                    <span className="text-[9px] font-bold text-cyan-400/90 mt-1 flex items-center gap-0.5">
                      👆 Kéo hoặc Chạm
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Đặt lại vị trí thẻ & Đóng cửa
          </button>
        </div>

        {/* Right Side: Steel Lab Door with RFID Slot (NO symbol on door!) */}
        <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-between shadow-inner min-h-[260px] relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 font-mono">
              CỬA PHÒNG THÍ NGHIỆM BAN ĐẦU: <strong className="text-amber-400">ĐANG ĐÓNG</strong>
            </span>
            <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded ${
              doorState === 'OPEN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400'
            }`}>
              {doorState === 'OPEN' ? 'TRẠNG THÁI: CỬA MỞ' : 'TRẠNG THÁI: CỬA ĐÓNG'}
            </span>
          </div>

          {/* Central Lab Door Graphic with RFID Reader Slot */}
          <div className="relative w-full max-w-sm h-40 bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden flex items-center justify-center shadow-2xl my-2">
            {/* Inside Room View (Revealed when door opens) */}
            <div className="flex flex-col items-center z-0 text-center px-4">
              <ShieldCheck className="w-10 h-10 text-emerald-400 animate-bounce mb-1" />
              <span className="text-sm font-black text-emerald-300 uppercase tracking-wide">
                PHÒNG THÍ NGHIỆM AN TOÀN
              </span>
              <span className="text-[10px] text-emerald-200">
                Lối đi thông thoáng - Robot có thể tiến vào!
              </span>
            </div>

            {/* Left Sliding Door Panel */}
            <div
              className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-r-2 border-slate-600 transition-all duration-700 z-10 flex flex-col justify-between p-2 shadow-2xl ${
                doorState === 'OPEN' ? '-translate-x-full' : 'translate-x-0'
              }`}
            >
              <div className="w-full h-1.5 bg-amber-500/60 rounded-full" />
              <div className="w-full h-8 border border-dashed border-slate-600/60 rounded flex items-center justify-center">
                <span className="text-[9px] font-mono text-slate-400 tracking-widest font-black">KHÓA PNEUMATIC</span>
              </div>
              <div className="w-full h-1.5 bg-amber-500/60 rounded-full" />
            </div>

            {/* Right Sliding Door Panel */}
            <div
              className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-slate-800 via-slate-700 to-slate-800 border-l-2 border-slate-600 transition-all duration-700 z-10 flex flex-col justify-between p-2 shadow-2xl ${
                doorState === 'OPEN' ? 'translate-x-full' : 'translate-x-0'
              }`}
            >
              <div className="w-full h-1.5 bg-amber-500/60 rounded-full" />
              <div className="w-full h-8 border border-dashed border-slate-600/60 rounded flex items-center justify-center">
                <span className="text-[9px] font-mono text-slate-400 tracking-widest font-black">PHÒNG LAB #04</span>
              </div>
              <div className="w-full h-1.5 bg-amber-500/60 rounded-full" />
            </div>

            {/* Locked Padlock Indicator when closed */}
            {doorState === 'CLOSED' && (
              <div className="absolute z-20 flex flex-col items-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-slate-950/90 border border-slate-600 flex items-center justify-center text-slate-300 text-xs shadow-lg">
                  🔒
                </div>
              </div>
            )}
          </div>

          {/* RFID Card Reader Drop Target Slot (Mounted on door panel) */}
          <div
            ref={slotRef}
            className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 shadow-lg ${
              isHoveringSlot
                ? 'bg-cyan-950/90 border-cyan-400 ring-4 ring-cyan-400/40 scale-102'
                : scanResult === 'VALID'
                ? 'bg-emerald-950/80 border-emerald-500 shadow-emerald-500/20'
                : scanResult === 'INVALID'
                ? 'bg-rose-950/80 border-rose-500 shadow-rose-500/20'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* LED Sensor */}
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                  isScanning
                    ? 'bg-amber-400 border-amber-300 animate-ping'
                    : scanResult === 'VALID'
                    ? 'bg-emerald-400 border-emerald-200 shadow-md shadow-emerald-400'
                    : scanResult === 'INVALID'
                    ? 'bg-rose-500 border-rose-200 shadow-md shadow-rose-500 animate-pulse'
                    : 'bg-cyan-500 border-cyan-300 shadow-sm shadow-cyan-400'
                }`}
              />

              {/* Reader Slot Bezel */}
              <div>
                <span className="text-xs font-mono font-black text-slate-200 block uppercase tracking-wider">
                  KHE QUẸT THẺ TỪ RFID
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isHoveringSlot
                    ? '👉 THẢ THẺ VÀO ĐÂY ĐỂ QUẸT!'
                    : isScanning
                    ? 'Đang phân tích chip từ...'
                    : activeSlotCard
                    ? `Thẻ đang quẹt: ${activeSlotCard.symbol} (${activeSlotCard.code})`
                    : 'Kéo thả thẻ vào ô này để thử'}
                </span>
              </div>
            </div>

            {/* Slotted Card Preview */}
            {activeSlotCard && (
              <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-700 font-mono text-xs font-black text-white flex items-center gap-1.5 shadow-inner">
                <span className="text-base">{activeSlotCard.symbol}</span>
                <span>{activeSlotCard.code}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Card Representation when being dragged */}
      {draggingCard && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 scale-105 rotate-3 shadow-2xl opacity-95 transition-opacity"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <div
            className={`w-28 p-3 rounded-xl border-2 bg-slate-900 shadow-2xl flex flex-col items-center justify-center gap-1 ${draggingCard.borderStyle} ring-4 ring-cyan-400/40`}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xl font-bold text-white shadow-inner">
              {draggingCard.symbol}
            </div>
            <span className="text-[10px] font-mono font-black text-white">
              {draggingCard.code}
            </span>
            <span className="text-[8px] font-mono text-cyan-300 bg-cyan-950 px-1 rounded">
              ĐANG KÉO THẺ
            </span>
          </div>
        </div>
      )}

      {/* Status Log & Scratch Principle Explanation */}
      <div
        className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
          scanResult === 'VALID'
            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
            : scanResult === 'INVALID'
            ? 'bg-rose-950/70 border-rose-500 text-rose-200'
            : 'bg-cyan-950/60 border-cyan-800 text-cyan-200'
        }`}
      >
        <strong>Mô phỏng thực tế:</strong> {statusMessage}
      </div>

      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
        💡 <strong>Quy luật Scratch:</strong> Cấu trúc <code>nếu &lt;điều kiện&gt; thì [hành động]</code> không có nhánh phụ. Vì vậy khi thẻ không hợp lệ (điều kiện sai), lệnh <code>mở cửa</code> không bao giờ được gọi. Cửa ban đầu vốn đang đóng nên <strong>vẫn tiếp tục đóng</strong>!
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TRẠM 4: Minigame Lò Lửa Thiêu Hủy & Kéo Xô Nước Làm Mát
// ---------------------------------------------------------------------------
const Station4FurnaceWaterMinigame: React.FC = () => {
  // Initial temperature: 83°C (hotter than 80°C)
  const [temperature, setTemperature] = useState<number>(83);
  const [bucketState, setBucketState] = useState<'EMPTY' | 'FULL'>('EMPTY');
  const [isSteaming, setIsSteaming] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Lò lửa đang cháy phừng phừng ở 83°C (Quá nóng!). Kéo xô rỗng vào bể nước để múc nước, rồi đổ vào lò lửa!'
  );

  // Dragging state for bucket
  const [isDraggingBucket, setIsDraggingBucket] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverTarget, setHoverTarget] = useState<'NONE' | 'WATER_TANK' | 'FURNACE'>('NONE');

  const waterTankRef = useRef<HTMLDivElement | null>(null);
  const furnaceRef = useRef<HTMLDivElement | null>(null);

  // Start dragging bucket
  const handleStartDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    sounds.playTick();
    setIsDraggingBucket(true);
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  // Track dragging movement and collision with water tank and furnace
  useEffect(() => {
    if (!isDraggingBucket) return;

    const handlePointerMove = (e: PointerEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Check collision with water tank
      if (waterTankRef.current) {
        const rect = waterTankRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left - 35 &&
          e.clientX <= rect.right + 35 &&
          e.clientY >= rect.top - 35 &&
          e.clientY <= rect.bottom + 35
        ) {
          setHoverTarget('WATER_TANK');
          return;
        }
      }

      // Check collision with furnace
      if (furnaceRef.current) {
        const rect = furnaceRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left - 35 &&
          e.clientX <= rect.right + 35 &&
          e.clientY >= rect.top - 35 &&
          e.clientY <= rect.bottom + 35
        ) {
          setHoverTarget('FURNACE');
          return;
        }
      }

      setHoverTarget('NONE');
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Check drop on water tank
      if (waterTankRef.current) {
        const rect = waterTankRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left - 35 &&
          e.clientX <= rect.right + 35 &&
          e.clientY >= rect.top - 35 &&
          e.clientY <= rect.bottom + 35
        ) {
          handleFillBucket();
          setIsDraggingBucket(false);
          setHoverTarget('NONE');
          return;
        }
      }

      // Check drop on furnace
      if (furnaceRef.current) {
        const rect = furnaceRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left - 35 &&
          e.clientX <= rect.right + 35 &&
          e.clientY >= rect.top - 35 &&
          e.clientY <= rect.bottom + 35
        ) {
          handlePourWater();
          setIsDraggingBucket(false);
          setHoverTarget('NONE');
          return;
        }
      }

      setIsDraggingBucket(false);
      setHoverTarget('NONE');
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingBucket, bucketState]);

  // Action: Fill bucket at water tank
  const handleFillBucket = () => {
    if (bucketState === 'FULL') {
      setStatusMessage('Xô đã đầy nước rồi! Hãy kéo xô này đổ vào lò lửa.');
      return;
    }
    sounds.playSplash();
    setBucketState('FULL');
    setStatusMessage('💧 Đã múc đầy xô nước mát! Hãy kéo xô đổ vào lò lửa để hạ nhiệt.');
  };

  // Action: Pour water onto furnace
  const handlePourWater = () => {
    if (bucketState === 'EMPTY') {
      sounds.playBeep(false);
      setStatusMessage('❌ Xô đang rỗng! Em hãy kéo xô vào bể nước để múc nước trước đã.');
      return;
    }

    sounds.playSteam();
    setIsSteaming(true);
    setBucketState('EMPTY');
    setTimeout(() => setIsSteaming(false), 800);

    setTemperature((prev) => {
      const next = Math.max(78, prev - 1);
      if (next > 80) {
        setStatusMessage(
          `💨 Xèo xèo! Nhiệt độ giảm xuống ${next}°C (vẫn > 80°C → Lò vẫn Quá nóng!). Hãy múc thêm xô nước nữa!`
        );
      } else if (next === 80) {
        sounds.playPowerUp();
        setStatusMessage(
          `🎯 Nhiệt độ vừa giảm về đúng 80°C! Vì (80 > 80) là SAI → Khối lệnh ELSE được kích hoạt và hiển thị "Nhiệt độ an toàn"!`
        );
      } else {
        setStatusMessage(
          `❄️ Nhiệt độ giảm về ${next}°C! Vì (${next} > 80) là SAI → Khối lệnh ELSE hiển thị "Nhiệt độ an toàn"!`
        );
      }
      return next;
    });
  };

  // Reset furnace
  const handleReset = (targetTemp: number = 83) => {
    sounds.playTick();
    setTemperature(targetTemp);
    setBucketState('EMPTY');
    setIsSteaming(false);
    if (targetTemp === 80) {
      setStatusMessage('Đã đặt nhiệt độ lò về mốc đúng 80°C (theo tình huống đề bài). Hãy quan sát thông báo của robot bên trái!');
    } else if (targetTemp === 81) {
      setStatusMessage('Đã đặt nhiệt độ lò về 81°C (> 80°C). Hãy quan sát thông báo của robot bên trái!');
    } else {
      setStatusMessage('Đã đốt lại lò lửa về 83°C. Hãy múc nước đổ vào lò để hạ nhiệt độ!');
    }
  };

  return (
    <div className="space-y-4">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Side: Robot Sensor Monitor HUD */}
        <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-inner space-y-3 min-h-[300px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                CẢM BIẾN ROBOT (SENSOR HUD)
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Điều kiện: &gt; 80°C
              </span>
            </div>

            {/* Current Measured Temperature */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between shadow-inner mb-3">
              <span className="text-xs text-slate-400 font-mono">Nhiệt độ đo được:</span>
              <div className="flex items-center gap-1.5">
                {temperature > 80 ? (
                  <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                ) : (
                  <Snowflake className="w-5 h-5 text-emerald-400 animate-spin" />
                )}
                <span
                  className={`font-mono font-black text-2xl ${
                    temperature > 80 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {temperature}°C
                </span>
              </div>
            </div>

            {/* Robot Speech Announcement Reaction */}
            <div
              className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 shadow-xl ${
                temperature > 80
                  ? 'bg-rose-950/80 border-rose-500 shadow-rose-950 animate-pulse text-rose-100'
                  : 'bg-emerald-950/80 border-emerald-500 shadow-emerald-950 text-emerald-100'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-300 mb-1">
                THÔNG BÁO HIỂN THỊ CỦA ROBOT:
              </span>
              <div className="text-lg font-black tracking-wide mb-1">
                💬 "{temperature > 80 ? 'Quá nóng!' : 'Nhiệt độ an toàn'}"
              </div>
              <span className="text-[11px] font-mono block opacity-90">
                {temperature > 80
                  ? `Nhánh THEN chạy vì (${temperature} > 80) là ĐÚNG`
                  : `Nhánh ELSE chạy vì (${temperature} > 80) là SAI`}
              </span>
            </div>
          </div>

          {/* Critical 80°C Highlight Callout */}
          {temperature === 80 && (
            <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/70 text-amber-200 text-xs leading-relaxed animate-in fade-in">
              ⭐ <strong>ĐẶC BIỆT CHÚ Ý (ĐỀ BÀI):</strong> Tại đúng <strong>80°C</strong>, phép so sánh (80 &gt; 80) cho kết quả <strong>SAI</strong> (vì 80 không lớn hơn 80). Do đó khối lệnh rẽ vào nhánh <code>else</code> và hiển thị <strong>"Nhiệt độ an toàn"</strong>!
            </div>
          )}

          {/* Quick Boundary Preset Buttons */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block mb-1.5 text-center">
              THỬ NHANH CÁC MỐC NHIỆT ĐỘ:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleReset(81)}
                className={`py-1 rounded text-[10px] font-mono font-bold border transition ${
                  temperature === 81
                    ? 'bg-rose-900 border-rose-400 text-rose-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                81°C (&gt; 80)
              </button>
              <button
                type="button"
                onClick={() => handleReset(80)}
                className={`py-1 rounded text-[10px] font-mono font-black border transition relative ${
                  temperature === 80
                    ? 'bg-amber-600 border-amber-300 text-white ring-2 ring-amber-400'
                    : 'bg-slate-900 border-amber-600/60 text-amber-300 hover:text-white'
                }`}
              >
                80°C (ĐỀ BÀI)
              </button>
              <button
                type="button"
                onClick={() => handleReset(79)}
                className={`py-1 rounded text-[10px] font-mono font-bold border transition ${
                  temperature === 79
                    ? 'bg-emerald-900 border-emerald-400 text-emerald-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                79°C (≤ 80)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Incinerator Furnace & Water Well Arena */}
        <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-inner space-y-3 min-h-[300px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                KHU VỰC THIÊU HỦY & BỂ NƯỚC LÀM MÁT
              </span>
              <button
                type="button"
                onClick={() => handleReset(83)}
                className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Đốt lại lò (83°C)
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Kéo xô rỗng vào bể nước để múc nước, sau đó kéo xô đầy nước đổ vào lò lửa:
            </p>

            {/* Arena: Water Tank on Left, Bucket in Middle, Furnace on Right */}
            <div className="grid grid-cols-12 gap-2.5 items-stretch">
              {/* 1. Bể Nước Làm Mát (Drop Target 1) */}
              <div
                ref={waterTankRef}
                onClick={handleFillBucket}
                className={`col-span-4 p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${
                  hoverTarget === 'WATER_TANK'
                    ? 'bg-cyan-900/80 border-cyan-400 ring-4 ring-cyan-400/40 scale-102'
                    : 'bg-slate-900/90 border-cyan-600/50 hover:border-cyan-400'
                }`}
                title="Bể nước làm mát - Kéo xô vào đây để múc nước"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/60 flex items-center justify-center mb-1 shadow-inner relative overflow-hidden">
                  <Waves className="w-6 h-6 text-cyan-400 animate-pulse" />
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-cyan-500/30 rounded-b-full" />
                </div>
                <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wide">
                  BỂ NƯỚC MÁT
                </span>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                  {hoverTarget === 'WATER_TANK' ? '👉 THẢ ĐỂ MÚC' : 'Nhấp / Thả xô'}
                </span>
              </div>

              {/* 2. Interactive Bucket (Draggable) */}
              <div className="col-span-4 p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center text-center select-none">
                <div
                  onPointerDown={handleStartDrag}
                  onClick={() => {
                    if (bucketState === 'EMPTY') handleFillBucket();
                    else handlePourWater();
                  }}
                  className={`w-14 h-16 rounded-xl border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all shadow-lg relative ${
                    bucketState === 'FULL'
                      ? 'bg-gradient-to-b from-cyan-900 to-blue-950 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/40 shadow-cyan-500/30'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-600 text-slate-400'
                  }`}
                  title="Xô nước - Bấm giữ chuột để kéo di chuyển"
                >
                  {/* Bucket Handle */}
                  <div className="absolute -top-2 w-8 h-3 border-2 border-slate-400 rounded-t-full" />

                  {/* Bucket Contents */}
                  {bucketState === 'FULL' ? (
                    <>
                      <Droplets className="w-6 h-6 text-cyan-300 animate-bounce" />
                      <span className="text-[8px] font-black font-mono text-cyan-200 uppercase mt-0.5">
                        ĐẦY NƯỚC
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🪣</span>
                      <span className="text-[8px] font-black font-mono text-slate-400 uppercase mt-0.5">
                        XÔ RỖNG
                      </span>
                    </>
                  )}
                </div>

                <span className="text-[9px] font-bold text-cyan-400 mt-2 flex items-center gap-0.5">
                  👆 Kéo xô di chuyển
                </span>
              </div>

              {/* 3. Lò Lửa Thiêu Hủy (Drop Target 2) */}
              <div
                ref={furnaceRef}
                onClick={handlePourWater}
                className={`col-span-4 p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none relative overflow-hidden ${
                  hoverTarget === 'FURNACE'
                    ? 'bg-rose-900/80 border-rose-400 ring-4 ring-rose-400/40 scale-102'
                    : temperature > 80
                    ? 'bg-rose-950/60 border-rose-600/60 hover:border-rose-400'
                    : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                }`}
                title="Lò lửa thiêu hủy - Kéo xô đầy nước vào đây để dập lửa"
              >
                {/* Steam effect on pour */}
                {isSteaming && (
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in">
                    <span className="text-xs font-black font-mono text-white animate-bounce bg-slate-950/80 px-2 py-0.5 rounded">
                      💨 XÈO XÈO!
                    </span>
                  </div>
                )}

                <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mb-1 shadow-inner relative overflow-hidden">
                  {temperature > 80 ? (
                    <Flame className="w-7 h-7 text-rose-500 animate-pulse" />
                  ) : (
                    <Flame className="w-5 h-5 text-amber-500/60" />
                  )}
                </div>
                <span className="text-[11px] font-black text-rose-300 uppercase tracking-wide">
                  LÒ THIÊU HỦY
                </span>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                  {hoverTarget === 'FURNACE' ? '👉 THẢ ĐỂ DẬP' : 'Nhấp / Đổ xô'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="p-3 bg-cyan-950/60 border border-cyan-800 rounded-xl text-xs text-cyan-200 leading-relaxed">
            <strong>Mô phỏng thực tế:</strong> {statusMessage}
          </div>
        </div>
      </div>

      {/* Floating Dragged Bucket Clone */}
      {isDraggingBucket && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 scale-110 shadow-2xl opacity-95"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <div
            className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center shadow-2xl ${
              bucketState === 'FULL'
                ? 'bg-blue-900 border-cyan-400 text-cyan-200 ring-4 ring-cyan-400/40'
                : 'bg-slate-900 border-slate-500 text-slate-300 ring-4 ring-slate-600/40'
            }`}
          >
            {bucketState === 'FULL' ? (
              <>
                <Droplets className="w-7 h-7 text-cyan-300" />
                <span className="text-[8px] font-black font-mono text-cyan-200">ĐẦY NƯỚC</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🪣</span>
                <span className="text-[8px] font-black font-mono text-slate-400">XÔ RỖNG</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
        💡 <strong>Quy luật Scratch:</strong> Toán tử <code>&gt;</code> (lớn hơn) đòi hỏi nhiệt độ phải vượt quá mốc 80. Khi nhiệt độ hạ về đúng <strong>80°C</strong>, điều kiện <code>nhiệt độ &gt; 80</code> là <strong>SAI</strong>, do đó khối lệnh <strong>không chạy nhánh then</strong> mà bắt buộc rẽ vào <strong>nhánh else</strong> để hiển thị "Nhiệt độ an toàn"!
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TRẠM 5: Minigame Gắp Linh Kiện Vào Hộp Nhiệm Vụ (Có Tờ Giấy Nhiệm Vụ 0/5)
// ---------------------------------------------------------------------------
interface RobotComponent {
  id: string;
  name: string;
  icon: string;
  badge: string;
}

const ALL_ROBOT_COMPONENTS: RobotComponent[] = [
  { id: 'part_1', name: 'Bánh răng titan', icon: '⚙️', badge: 'Cơ khí' },
  { id: 'part_2', name: 'Vi mạch lõi', icon: '🔲', badge: 'Xử lý' },
  { id: 'part_3', name: 'Tinh thể năng lượng', icon: '💎', badge: 'Lượng tử' },
  { id: 'part_4', name: 'Tụ điện cao áp', icon: '🔋', badge: 'Điện năng' },
  { id: 'part_5', name: 'Cảm biến quang', icon: '💡', badge: 'Cảm biến' },
  { id: 'part_6', name: 'Mô-đun rơ-le', icon: '⚡', badge: 'Truyền dẫn' },
];

const Station5ComponentBoxMinigame: React.FC = () => {
  // Right box collection (starts empty 0/5 as requested)
  const [collectedParts, setCollectedParts] = useState<RobotComponent[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Hộp nhiệm vụ bên phải đang trống (0/5 linh kiện). Hãy kéo linh kiện từ hộp kho bên trái bỏ sang bên phải!'
  );

  // Dragging state
  const [draggingPart, setDraggingPart] = useState<RobotComponent | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringRightBox, setIsHoveringRightBox] = useState<boolean>(false);

  const rightBoxRef = useRef<HTMLDivElement | null>(null);

  // Available components in left box
  const availableParts = ALL_ROBOT_COMPONENTS.filter(
    (p) => !collectedParts.some((c) => c.id === p.id)
  );

  // Start dragging from left box
  const handleStartDrag = (part: RobotComponent, e: React.PointerEvent) => {
    e.preventDefault();
    sounds.playTick();
    setDraggingPart(part);
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  // Track dragging movement and collision with right box
  useEffect(() => {
    if (!draggingPart) return;

    const handlePointerMove = (e: PointerEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      if (rightBoxRef.current) {
        const rect = rightBoxRef.current.getBoundingClientRect();
        const isInside =
          e.clientX >= rect.left - 30 &&
          e.clientX <= rect.right + 30 &&
          e.clientY >= rect.top - 30 &&
          e.clientY <= rect.bottom + 30;
        setIsHoveringRightBox(isInside);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (rightBoxRef.current) {
        const rect = rightBoxRef.current.getBoundingClientRect();
        const isInside =
          e.clientX >= rect.left - 30 &&
          e.clientX <= rect.right + 30 &&
          e.clientY >= rect.top - 30 &&
          e.clientY <= rect.bottom + 30;

        if (isInside) {
          moveToRight(draggingPart);
        }
      }

      setDraggingPart(null);
      setIsHoveringRightBox(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingPart, collectedParts]);

  // Add component to right box
  const moveToRight = (part: RobotComponent) => {
    if (collectedParts.some((c) => c.id === part.id)) return;
    const nextParts = [...collectedParts, part];
    setCollectedParts(nextParts);

    if (nextParts.length >= 5) {
      sounds.playPowerUp();
      setStatusMessage(
        `🎉 Tinh tút! Hộp đã đạt ${nextParts.length}/5 linh kiện (≥ 5, ĐIỀU KIỆN ĐÚNG) → Tờ giấy nhiệm vụ được TÍCH XANH HOÀN THÀNH và robot thông báo "Nhiệm vụ hoàn thành"!`
      );
    } else {
      sounds.playTick();
      setStatusMessage(
        `📦 Đã bỏ thêm 1 linh kiện vào hộp (hiện có ${nextParts.length}/5). Vẫn < 5 linh kiện (ĐIỀU KIỆN SAI) → Robot tiếp tục thông báo "Chưa đủ linh kiện".`
      );
    }
  };

  // Remove component from right box back to left box
  const moveToLeft = (part: RobotComponent) => {
    sounds.playTick();
    const nextParts = collectedParts.filter((c) => c.id !== part.id);
    setCollectedParts(nextParts);
    setStatusMessage(
      `Bỏ bớt 1 linh kiện ra ngoài (còn ${nextParts.length}/5 linh kiện).`
    );
  };

  // Fast presets
  const handleSetPreset = (targetCount: number) => {
    sounds.playTick();
    if (targetCount === 0) {
      setCollectedParts([]);
      setStatusMessage('Đã làm trống hộp bên phải (0/5 linh kiện). Hãy kéo linh kiện từ hộp bên trái sang!');
    } else if (targetCount === 3) {
      const parts = ALL_ROBOT_COMPONENTS.slice(0, 3);
      setCollectedParts(parts);
      setStatusMessage(
        '🎯 Đã đặt 3 linh kiện vào hộp (đúng theo tình huống đề bài)! Vì 3 ≥ 5 là SAI → Robot rẽ vào nhánh ELSE và thông báo "Chưa đủ linh kiện".'
      );
    } else if (targetCount === 5) {
      sounds.playPowerUp();
      const parts = ALL_ROBOT_COMPONENTS.slice(0, 5);
      setCollectedParts(parts);
      setStatusMessage(
        '✅ Đã thu thập đủ 5/5 linh kiện! Điều kiện 5 ≥ 5 là ĐÚNG → Tờ giấy nhiệm vụ được TÍCH XANH và robot thông báo "Nhiệm vụ hoàn thành"!'
      );
    }
  };

  const isCompleted = collectedParts.length >= 5;

  return (
    <div className="space-y-4">
      {/* 2-Column Main Arena */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Side: Supply Box of Components */}
        <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-inner space-y-3 min-h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                HỘP KHO LINH KIỆN (BÊN TRÁI)
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Còn: {availableParts.length} món
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Bấm giữ chuột để gắp linh kiện kéo sang hộp bên phải (hoặc nhấp trực tiếp):
            </p>

            {/* Component Items in Left Box */}
            <div className="grid grid-cols-2 gap-2.5">
              {availableParts.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-slate-500 font-mono italic border border-dashed border-slate-800 rounded-xl">
                  (Hộp kho đã hết linh kiện. Toàn bộ đã chuyển sang hộp bên phải!)
                </div>
              ) : (
                availableParts.map((part) => (
                  <div
                    key={part.id}
                    onPointerDown={(e) => handleStartDrag(part, e)}
                    onClick={() => moveToRight(part)}
                    className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:border-cyan-400 hover:bg-slate-850 flex items-center gap-2.5 cursor-grab active:cursor-grabbing transition-all select-none hover:scale-102 shadow"
                    title="Bấm giữ chuột để kéo sang hộp bên phải"
                  >
                    <span className="text-2xl">{part.icon}</span>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-bold text-slate-200 leading-tight">
                        {part.name}
                      </span>
                      <span className="text-[9px] font-mono text-cyan-400">
                        {part.badge}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Presets for Students */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 block text-center">
              THỬ NHANH CÁC MỐC ĐỀ BÀI:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSetPreset(0)}
                className={`py-1.5 rounded text-[10px] font-mono font-bold border transition ${
                  collectedParts.length === 0
                    ? 'bg-slate-700 border-slate-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                0/5 (Trống)
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(3)}
                className={`py-1.5 rounded text-[10px] font-mono font-black border transition relative ${
                  collectedParts.length === 3
                    ? 'bg-amber-600 border-amber-300 text-white ring-2 ring-amber-400'
                    : 'bg-slate-900 border-amber-600/60 text-amber-300 hover:text-white'
                }`}
              >
                3/5 (ĐỀ BÀI)
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(5)}
                className={`py-1.5 rounded text-[10px] font-mono font-bold border transition ${
                  collectedParts.length === 5
                    ? 'bg-emerald-600 border-emerald-300 text-white ring-2 ring-emerald-400'
                    : 'bg-slate-900 border-emerald-700 text-emerald-300 hover:text-white'
                }`}
              >
                5/5 (ĐỦ MỐC)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Quest Collection Box containing the Task Parchment (Paper Checklist) */}
        <div
          ref={rightBoxRef}
          className={`md:col-span-7 bg-slate-950 p-4 rounded-xl border-2 flex flex-col justify-between shadow-inner space-y-3 min-h-[340px] transition-all relative overflow-hidden ${
            isHoveringRightBox
              ? 'border-cyan-400 ring-4 ring-cyan-400/40 bg-slate-900/90 scale-101'
              : isCompleted
              ? 'border-emerald-500/80'
              : 'border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                📦 HỘP NHIỆM VỤ THU THẬP (BÊN PHẢI)
              </span>
              <span
                className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                  isCompleted
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}
              >
                {isCompleted ? '✓ ĐỦ LINH KIỆN' : 'CHƯA ĐỦ'}
              </span>
            </div>

            {/* The Mission Parchment (Tờ Giấy Nhiệm Vụ 0/5 Trong Hộp) */}
            <div className="relative p-3.5 rounded-xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 text-slate-900 font-mono shadow-md mb-3">
              {/* Parchment clip / pin at top */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-amber-400 border border-amber-600 rounded-sm shadow-sm" />

              <div className="flex items-start justify-between gap-2 border-b border-amber-300 pb-2 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-900 block">
                    📋 TỜ GIẤY NHIỆM VỤ ROBOT
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Nhiệm vụ: Thu thập ít nhất 5 linh kiện
                  </span>
                </div>

                {/* Big Stamp / Tick Mark on Paper */}
                <div
                  className={`px-2.5 py-1 rounded-lg border-2 font-black text-xs uppercase tracking-wider flex items-center gap-1 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-800 shadow-md scale-105 rotate-[-2deg]'
                      : 'bg-amber-200 text-amber-900 border-amber-400 opacity-80'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>ĐÃ HOÀN THÀNH ✓</span>
                    </>
                  ) : (
                    <span>[ ] CHƯA ĐỦ</span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Counter on Paper */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Tiến độ thu thập:</span>
                  <span
                    className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                      isCompleted ? 'bg-emerald-700 text-white' : 'bg-amber-300 text-slate-900'
                    }`}
                  >
                    {collectedParts.length} / 5 linh kiện
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-amber-200/80 rounded-full border border-amber-400 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (collectedParts.length / 5) * 100)}%` }}
                  />
                </div>

                <div className="text-[10px] text-slate-700 flex items-center justify-between">
                  <span>Điều kiện: (linh kiện &ge; 5)</span>
                  <strong className={isCompleted ? 'text-emerald-800' : 'text-amber-800'}>
                    {isCompleted ? 'KẾT QUẢ: ĐÚNG (THEN)' : 'KẾT QUẢ: SAI (ELSE)'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Collected Components Display Inside the Box */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 min-h-[90px] flex flex-col justify-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
                LINH KIỆN TRONG HỘP ({collectedParts.length} MÓN):
              </span>
              {collectedParts.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 font-mono italic">
                  (Hộp hiện đang trống 0/5. Kéo linh kiện từ bên trái thả vào đây!)
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {collectedParts.map((part) => (
                    <div
                      key={part.id}
                      onClick={() => moveToLeft(part)}
                      className="px-2.5 py-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 hover:bg-rose-950 hover:border-rose-500 flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-200 transition active:scale-95 shadow"
                      title="Nhấp để trả lại hộp bên trái"
                    >
                      <span className="text-base">{part.icon}</span>
                      <span>{part.name}</span>
                      <span className="text-[9px] text-slate-400 ml-1">✕</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Educational Feedback Dialogue */}
          <div className="space-y-2">
            <div
              className={`p-3 rounded-xl border-2 text-center transition-all duration-300 ${
                isCompleted
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-emerald-500/20'
                  : 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-amber-500/20'
              }`}
            >
              <div className="text-sm font-black mb-0.5">
                💬 THÔNG BÁO CỦA ROBOT: "{isCompleted ? 'Nhiệm vụ hoàn thành' : 'Chưa đủ linh kiện'}"
              </div>
              <span className="text-[10px] font-mono block">
                {isCompleted
                  ? `Nhánh THEN được thực thi vì (${collectedParts.length} ≥ 5) là ĐÚNG`
                  : `Nhánh ELSE được thực thi vì (${collectedParts.length} ≥ 5) là SAI`}
              </span>
            </div>

            {/* Special Highlight for 3 Components (Question Target) */}
            {collectedParts.length === 3 && (
              <div className="p-2.5 rounded-xl bg-amber-950/90 border border-amber-400 text-amber-200 text-xs leading-relaxed animate-in fade-in">
                ⭐ <strong>TÌNH HUỐNG ĐỀ BÀI (3 LINH KIỆN):</strong> Robot đang có đúng 3 linh kiện. Phép so sánh (3 &ge; 5) cho kết quả <strong>SAI</strong>, do đó khối lệnh Scratch rẽ vào nhánh <code>else</code> và thông báo <strong>"Chưa đủ linh kiện"</strong>!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Dragged Component Clone */}
      {draggingPart && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 scale-110 shadow-2xl opacity-95"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <div className="px-3 py-2 rounded-xl border-2 border-cyan-400 bg-slate-900 text-white shadow-2xl flex items-center gap-2 ring-4 ring-cyan-400/40">
            <span className="text-2xl">{draggingPart.icon}</span>
            <span className="text-xs font-bold">{draggingPart.name}</span>
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
        💡 <strong>Quy luật Scratch:</strong> Điều kiện <code>&ge;</code> (lớn hơn hoặc bằng) yêu cầu số lượng từ 5 trở lên. Khi chỉ có 3 linh kiện, điều kiện là <strong>Sai</strong> và nhánh <code>else</code> luôn được kích hoạt.
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Interactive Minigames Router
// ---------------------------------------------------------------------------
export const InteractiveStationMinigame: React.FC<InteractiveStationMinigameProps> = ({ stationNo }) => {
  // Station 1: Battery level & Industrial Power Switch
  const [batteryPercent, setBatteryPercent] = useState<number>(40);
  const [isPowerSwitchedOn, setIsPowerSwitchedOn] = useState<boolean>(false);
  const [powerResultState, setPowerResultState] = useState<'IDLE' | 'POWERED_ON' | 'FAILED'>('IDLE');

  // Station 3: Laser keypad & Hallway barrier
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [laserState, setLaserState] = useState<'ACTIVE' | 'OFF' | 'ALARM'>('ACTIVE');

  // Reset states when station changes
  useEffect(() => {
    setIsPowerSwitchedOn(false);
    setPowerResultState('IDLE');
    setEnteredPin('');
    setLaserState('ACTIVE');
  }, [stationNo]);

  // Station 1: Power Switch Action
  const handleTogglePowerSwitch = () => {
    const nextState = !isPowerSwitchedOn;
    setIsPowerSwitchedOn(nextState);
    sounds.playSwitch(nextState);

    if (nextState) {
      if (batteryPercent >= 50) {
        sounds.playPowerUp();
        setPowerResultState('POWERED_ON');
      } else {
        sounds.playBeep(false);
        setPowerResultState('FAILED');
      }
    } else {
      setPowerResultState('IDLE');
    }
  };

  // Station 3: Keypad Typing Action
  const handleKeypadPress = (char: string) => {
    sounds.playTick();
    if (char === 'CLR') {
      setEnteredPin('');
      setLaserState('ACTIVE');
      return;
    }
    if (char === 'ENTER') {
      if (!enteredPin || enteredPin.length === 0) return;
      if (enteredPin === '999') {
        sounds.playBeep(true);
        sounds.playPowerUp();
        setLaserState('OFF');
      } else {
        sounds.playBeep(false);
        setLaserState('ALARM');
      }
      return;
    }
    if (enteredPin.length < 3) {
      if (laserState !== 'ACTIVE') {
        setLaserState('ACTIVE');
        setEnteredPin(char);
      } else {
        setEnteredPin((prev) => prev + char);
      }
    }
  };

  return (
    <div className="w-full bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="flex items-center gap-2 text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          Khu vực tương tác mô phỏng thực tế
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
          Chạm / Kéo chuột để trải nghiệm
        </span>
      </div>

      {/* ================================================================ */}
      {/* TRẠM 1: NÚM VẶN PIN XOAY TRÒN & CÔNG TẮC BẬT NGUỒN VẬT LÝ         */}
      {/* ================================================================ */}
      {stationNo === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Left: Tactile Rotary Dial Knob */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center shadow-inner">
              <RotaryKnob
                value={batteryPercent}
                min={0}
                max={100}
                step={5}
                unit="%"
                label="BƯỚC 1: DÙNG CHUỘT XOAY NÚM PIN"
                targetMarker={50}
                criticalMarkerLabel="Mốc ≥ 50%"
                presets={[
                  { value: 40, label: '40% (Đề bài)', desc: 'Dưới 50%' },
                  { value: 50, label: '50% (Mốc chuẩn)', desc: 'Bằng 50%' },
                  { value: 75, label: '75% (Đầy)', desc: 'Trên 50%' },
                ]}
                onChange={(val) => {
                  setBatteryPercent(val);
                  setIsPowerSwitchedOn(false);
                  setPowerResultState('IDLE');
                }}
              />
            </div>

            {/* Right: Heavy Industrial Power Switch & Reactor Reaction */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4 shadow-inner">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Power className="w-4 h-4 text-cyan-400" />
                <span>BƯỚC 2: GẠT CÔNG TẮC BẬT NGUỒN</span>
              </div>

              {/* Physical Flip Toggle Switch */}
              <button
                type="button"
                onClick={handleTogglePowerSwitch}
                className={`relative w-24 h-12 rounded-full p-1.5 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 border-2 ${
                  isPowerSwitchedOn
                    ? 'bg-emerald-600 border-emerald-400 shadow-emerald-500/40'
                    : 'bg-slate-800 border-slate-600 shadow-black'
                }`}
                title="Nhấn để gạt công tắc nguồn"
              >
                <div
                  className={`w-9 h-9 rounded-full bg-slate-100 shadow-md flex items-center justify-center transition-transform duration-300 ${
                    isPowerSwitchedOn ? 'translate-x-12 bg-white' : 'translate-x-0'
                  }`}
                >
                  <Power
                    className={`w-5 h-5 transition-colors ${
                      isPowerSwitchedOn ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  />
                </div>
              </button>

              <span className="text-[11px] font-mono text-slate-400">
                Trạng thái công tắc: <strong>{isPowerSwitchedOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}</strong>
              </span>

              {/* Reactor Core Visual Feedback */}
              <div
                className={`w-full p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-500 ${
                  powerResultState === 'POWERED_ON'
                    ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-500/30'
                    : powerResultState === 'FAILED'
                    ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {powerResultState === 'POWERED_ON' && (
                  <>
                    <Zap className="w-8 h-8 text-emerald-400 animate-bounce mb-1" />
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                      ROBOT KHỞI ĐỘNG THÀNH CÔNG!
                    </span>
                    <p className="text-[11px] text-emerald-200 mt-1">
                      Vì Pin {batteryPercent}% ≥ 50% (ĐIỀU KIỆN ĐÚNG) → Khối lệnh "Bật nguồn" được thực thi!
                    </p>
                  </>
                )}

                {powerResultState === 'FAILED' && (
                  <>
                    <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse mb-1" />
                    <span className="text-xs font-black text-rose-300 uppercase tracking-wider">
                      KHÔNG THỂ BẬT NGUỒN!
                    </span>
                    <p className="text-[11px] text-rose-200 mt-1">
                      Vì Pin {batteryPercent}% &lt; 50% (ĐIỀU KIỆN SAI) → Robot bỏ qua lệnh bật nguồn (không làm gì cả)!
                    </p>
                  </>
                )}

                {powerResultState === 'IDLE' && (
                  <span className="text-xs text-slate-500 italic py-2">
                    Xoay núm vặn mức pin rồi gạt công tắc nguồn để thử nghiệm.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3 bg-cyan-950/60 border border-cyan-800 rounded-xl text-xs text-cyan-200">
            💡 <strong>Quy luật Scratch:</strong> Cấu trúc <code>nếu ... thì</code> chỉ thực hiện hành động khi điều kiện đúng. Khi robot đang có 40% pin, phép so sánh (40 &ge; 50) là <strong>SAI</strong>, do đó robot <strong>không thực hiện bật nguồn</strong>!
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TRẠM 2: MINIGAME KÉO THẢ THẺ TỪ VÀO KHE CỬA (KHÔNG KÝ HIỆU TRÊN CỬA) */}
      {/* ================================================================ */}
      {stationNo === 2 && <Station2DragCardMinigame />}

      {/* ================================================================ */}
      {/* TRẠM 3: BÀN PHÍM CƠ & HÀNG RÀO LASER BẢO VỆ                     */}
      {/* ================================================================ */}
      {stationNo === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Left Screen: Keypad and entered digits ONLY (No right/wrong answers shown!) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 shadow-inner flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">BÀN PHÍM BẢO MẬT:</span>
                <span className="font-mono text-slate-400 text-[11px]">(3 chữ số)</span>
              </div>

              {/* LCD Display */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-center tracking-widest text-2xl font-black text-cyan-300 shadow-inner">
                {enteredPin.padEnd(3, '_')}
              </div>

              {/* 3x4 Mechanical Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'ENTER'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress(k)}
                    className={`p-3 rounded-lg text-sm font-mono font-black transition active:scale-95 shadow cursor-pointer ${
                      k === 'ENTER'
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/40 shadow-md'
                        : k === 'CLR'
                        ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-500 text-center font-mono">
                Bấm số rồi nhấn <strong className="text-cyan-400">ENTER</strong> để kích hoạt
              </div>
            </div>

            {/* Right Screen: Clue and empty frame until user submits code */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between shadow-inner space-y-3 min-h-[260px]">
              {/* Clue message */}
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-center shadow">
                <span className="text-xs sm:text-sm font-bold text-amber-300 block">
                  💡 Gợi ý: Số lớn nhất 3 chữ số mà chia hết cho 3
                </span>
              </div>

              {/* Central Frame: Empty Standby Frame OR Result Light (Shown only AFTER user presses Enter) */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {laserState === 'ACTIVE' && (
                  <div className="w-full py-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 space-y-2 bg-slate-900/40 shadow-inner">
                    <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-600 text-base font-mono">
                      _ _ _
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Khung hiển thị kết quả đèn tín hiệu
                    </span>
                    <span className="text-[11px] text-slate-600 font-mono">
                      (Đang chờ nhập mã và nhấn ENTER...)
                    </span>
                  </div>
                )}

                {/* If Code is correct (999) -> THEN branch with Green Light */}
                {laserState === 'OFF' && (
                  <div className="w-full p-4 rounded-xl border-2 border-emerald-500 bg-emerald-950/70 flex flex-col items-center justify-center space-y-2 shadow-2xl shadow-emerald-950 animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 border-2 border-emerald-300 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/80 scale-105">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                      ĐÈN XANH BẬT SÁNG (NHÁNH THEN)
                    </span>
                    <p className="text-xs text-emerald-100 text-center leading-relaxed">
                      Mã <strong>{enteredPin}</strong> chính xác! Điều kiện mã = 999 là <strong>ĐÚNG</strong> &rarr; Khối lệnh thực thi nhánh <code>then</code>: Đặt đèn sang màu <strong>XANH</strong>!
                    </p>
                  </div>
                )}

                {/* If Code is wrong -> ELSE branch with Red Light */}
                {laserState === 'ALARM' && (
                  <div className="w-full p-4 rounded-xl border-2 border-rose-500 bg-rose-950/70 flex flex-col items-center justify-center space-y-2 shadow-2xl shadow-rose-950 animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 rounded-full bg-rose-500 border-2 border-rose-300 text-white flex items-center justify-center shadow-xl shadow-rose-500/80 scale-105 animate-pulse">
                      <AlertTriangle className="w-9 h-9" />
                    </div>
                    <span className="text-xs font-black text-rose-300 uppercase tracking-wider">
                      ĐÈN ĐỎ BẬT SÁNG (NHÁNH ELSE)
                    </span>
                    <p className="text-xs text-rose-100 text-center leading-relaxed">
                      Mã <strong>{enteredPin}</strong> không đúng! Điều kiện mã = 999 là <strong>SAI</strong> &rarr; Khối lệnh thực thi nhánh <code>else</code>: Đặt đèn sang màu <strong>ĐỎ</strong>!
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom helper when result is shown */}
              {laserState !== 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTick();
                    setEnteredPin('');
                    setLaserState('ACTIVE');
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold border border-slate-700 transition"
                >
                  🔄 Nhập thử mã khác
                </button>
              )}
            </div>
          </div>

          <div className="p-3 bg-cyan-950/60 border border-cyan-800 rounded-xl text-xs text-cyan-200">
            💡 <strong>Quy luật Scratch:</strong> Cấu trúc <code>nếu ... thì ... không thì</code> (if-else) đảm bảo <strong>luôn có đúng 1 trong 2 nhánh</strong> được thực thi. Nếu điều kiện đúng chạy nhánh <code>then</code> (đèn xanh), ngược lại chạy nhánh <code>else</code> (đèn đỏ).
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TRẠM 4: MINIGAME LÒ LỬA THIÊU HỦY & KÉO XÔ NƯỚC LÀM MÁT          */}
      {/* ================================================================ */}
      {stationNo === 4 && <Station4FurnaceWaterMinigame />}

      {/* ================================================================ */}
      {/* TRẠM 5: MINIGAME GẮP LINH KIỆN VÀO HỘP NHIỆM VỤ (0/5)             */}
      {/* ================================================================ */}
      {stationNo === 5 && <Station5ComponentBoxMinigame />}
    </div>
  );
};
