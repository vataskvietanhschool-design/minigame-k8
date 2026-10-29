import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StationId } from '../../shared/types';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  RotateCw, 
  ShieldCheck, 
  Cpu, 
  Flame, 
  Snowflake,
  MousePointer,
  Droplets,
  Thermometer,
  Waves
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { Station1EnergyCatch } from './Station1EnergyCatch';
import { Station3RobotCharge } from './Station3RobotCharge';
import { Station4BlockBench } from './Station4BlockBench';
import { Station5CoolDown } from './Station5CoolDown';

interface InteractiveStationMinigameProps {
  stationNo: StationId;
  onSolved?: () => void;
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

const Station2DragCardMinigame: React.FC<{ onSolved?: () => void }> = ({ onSolved }) => {
  const [doorState, setDoorState] = useState<'CLOSED' | 'OPEN'>('CLOSED');
  const [activeSlotCard, setActiveSlotCard] = useState<KeycardItem | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('Kéo một thẻ vào khe cửa.');

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
        setStatusMessage('Cửa mở.');
        onSolved?.();
      } else {
        sounds.playBeep(false);
        setScanResult('INVALID');
        setDoorState('CLOSED');
        setStatusMessage('Cửa vẫn đóng.');
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
    setStatusMessage('Kéo một thẻ vào khe cửa.');
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
        {statusMessage}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TRẠM 4: Minigame Lò Lửa Thiêu Hủy & Kéo Xô Nước Làm Mát
// ---------------------------------------------------------------------------
const Station4FurnaceWaterMinigame: React.FC<{ onSolved?: () => void }> = ({ onSolved }) => {
  // Initial temperature: 83°C (hotter than 80°C)
  const [temperature, setTemperature] = useState<number>(83);
  const [bucketState, setBucketState] = useState<'EMPTY' | 'FULL'>('EMPTY');
  const [isSteaming, setIsSteaming] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Múc nước rồi đổ vào lò.');

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
      setStatusMessage('Xô đã đầy. Đổ vào lò.');
      return;
    }
    sounds.playSplash();
    setBucketState('FULL');
    setStatusMessage('Đã múc nước. Đổ vào lò.');
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

    const next = Math.max(78, temperature - 1);
    setTemperature(next);
    setStatusMessage(next > 80 ? 'Quá nóng.' : 'Nhiệt độ an toàn.');
    if (next <= 80) {
      sounds.playPowerUp();
      onSolved?.();
    }
  };

  // Reset furnace
  const handleReset = (targetTemp: number = 83) => {
    sounds.playTick();
    setTemperature(targetTemp);
    setBucketState('EMPTY');
    setIsSteaming(false);
    setStatusMessage('Múc nước rồi đổ vào lò.');
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
              <div className="text-lg font-black tracking-wide">
                {temperature > 80 ? 'Quá nóng' : 'Nhiệt độ an toàn'}
              </div>
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
            <p className="text-[11px] text-slate-400 mb-3">Múc nước, rồi đổ vào lò.</p>

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
            {statusMessage}
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

const Station5ComponentBoxMinigame: React.FC<{ onSolved?: () => void }> = ({ onSolved }) => {
  // Right box collection (starts empty 0/5 as requested)
  const [collectedParts, setCollectedParts] = useState<RobotComponent[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Kéo linh kiện sang hộp bên phải.');

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
      setStatusMessage('Tờ giấy đã đổi.');
      onSolved?.();
    } else {
      sounds.playTick();
      setStatusMessage('Tờ giấy chưa đổi.');
    }
  };

  // Remove component from right box back to left box
  const moveToLeft = (part: RobotComponent) => {
    sounds.playTick();
    const nextParts = collectedParts.filter((c) => c.id !== part.id);
    setCollectedParts(nextParts);
    setStatusMessage('Tờ giấy chưa đổi.');
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
              Kéo linh kiện sang hộp bên phải.
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
                  <span className="text-xs font-bold text-slate-800">Tờ giấy nhiệm vụ</span>
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
              <div className="text-sm font-black">
                {isCompleted ? 'Nhiệm vụ hoàn thành' : 'Chưa đủ linh kiện'}
              </div>
            </div>
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

    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Interactive Minigames Router
// ---------------------------------------------------------------------------
export const InteractiveStationMinigame: React.FC<InteractiveStationMinigameProps> = ({ stationNo, onSolved }) => {
  return (
    <div className="w-full bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 text-xs font-bold text-cyan-300">Thử thách</div>

      {/* ================================================================ */}
      {/* TRẠM 1: NÚM VẶN PIN XOAY TRÒN & CÔNG TẮC BẬT NGUỒN VẬT LÝ         */}
      {/* ================================================================ */}
      {stationNo === 1 && <Station1EnergyCatch onSolved={onSolved} />}

      {/* ================================================================ */}
      {/* TRẠM 2: MINIGAME KÉO THẢ THẺ TỪ VÀO KHE CỬA (KHÔNG KÝ HIỆU TRÊN CỬA) */}
      {/* ================================================================ */}
      {stationNo === 2 && (
        <Station1EnergyCatch
          onSolved={onSolved}
          penalizeMiss
          hint="Bấm icon pin đang rơi. Trúng +5%, bỏ lỡ −5%. Cần đủ 100% để bật robot."
        />
      )}

      {/* ================================================================ */}
      {/* TRẠM 3: BÀN PHÍM CƠ & HÀNG RÀO LASER BẢO VỆ                     */}
      {/* ================================================================ */}
      {stationNo === 3 && <Station3RobotCharge onSolved={onSolved} />}

      {/* ================================================================ */}
      {/* TRẠM 4: MINIGAME LÒ LỬA THIÊU HỦY & KÉO XÔ NƯỚC LÀM MÁT          */}
      {/* ================================================================ */}
      {stationNo === 4 && <Station4BlockBench onSolved={onSolved} />}

      {/* ================================================================ */}
      {/* TRẠM 5: MINIGAME GẮP LINH KIỆN VÀO HỘP NHIỆM VỤ (0/5)             */}
      {/* ================================================================ */}
      {stationNo === 5 && <Station5CoolDown onSolved={onSolved} />}
    </div>
  );
};
