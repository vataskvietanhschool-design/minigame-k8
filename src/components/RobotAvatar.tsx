import React from 'react';

export type RobotMood =
  | 'idle'
  | 'thinking'
  | 'happy'
  | 'puzzled'
  | 'battery'
  | 'card'
  | 'laser'
  | 'temperature'
  | 'gears'
  | 'victory';

interface RobotAvatarProps {
  mood?: RobotMood;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  mood = 'idle',
  className = '',
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-40 h-40',
    xl: 'w-52 h-52'
  };

  const isHappy = mood === 'happy' || mood === 'victory';
  const isPuzzled = mood === 'puzzled' || mood === 'thinking';

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md animate-pulse-slow"
      >
        {/* Glow halo */}
        <circle
          cx="100"
          cy="105"
          r="82"
          fill={isHappy ? '#10B981' : isPuzzled ? '#F59E0B' : '#3B82F6'}
          fillOpacity="0.12"
        />

        {/* Antenna */}
        <line x1="100" y1="46" x2="100" y2="22" stroke="#64748B" strokeWidth="5" strokeLinecap="round" />
        <circle
          cx="100"
          cy="20"
          r="9"
          fill={isHappy ? '#10B981' : isPuzzled ? '#F59E0B' : '#3B82F6'}
          className={isHappy ? 'animate-ping' : ''}
        />
        <circle cx="100" cy="20" r="5" fill="#FFFFFF" />

        {/* Ears / Side receivers */}
        <rect x="36" y="70" width="12" height="28" rx="4" fill="#64748B" />
        <rect x="152" y="70" width="12" height="28" rx="4" fill="#64748B" />
        <line x1="39" y1="84" x2="45" y2="84" stroke="#94A3B8" strokeWidth="2" />
        <line x1="155" y1="84" x2="161" y2="84" stroke="#94A3B8" strokeWidth="2" />

        {/* Head Shell */}
        <rect
          x="44"
          y="44"
          width="112"
          height="86"
          rx="24"
          fill="#1E293B"
          stroke="#475569"
          strokeWidth="4"
        />

        {/* Face Screen */}
        <rect
          x="54"
          y="56"
          width="92"
          height="62"
          rx="16"
          fill="#0F172A"
          stroke={isHappy ? '#10B981' : isPuzzled ? '#F59E0B' : '#38BDF8'}
          strokeWidth="2.5"
        />

        {/* Eyes */}
        {isHappy ? (
          // Cheerful curved eyes ^^
          <g>
            <path
              d="M70 88C70 80 82 80 82 88"
              stroke="#34D399"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M118 88C118 80 130 80 130 88"
              stroke="#34D399"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        ) : isPuzzled ? (
          // Puzzled asymmetrical eyes
          <g>
            <circle cx="76" cy="85" r="9" fill="#FBBF24" />
            <circle cx="78" cy="83" r="3" fill="#FFFFFF" />
            <ellipse cx="124" cy="88" rx="8" ry="5" fill="#FBBF24" />
          </g>
        ) : (
          // Standard glowing blue eyes
          <g>
            <circle cx="76" cy="85" r="8" fill="#38BDF8" />
            <circle cx="79" cy="82" r="3" fill="#FFFFFF" />
            <circle cx="124" cy="85" r="8" fill="#38BDF8" />
            <circle cx="127" cy="82" r="3" fill="#FFFFFF" />
          </g>
        )}

        {/* Mouth */}
        {isHappy ? (
          <path
            d="M86 102Q100 114 114 102"
            stroke="#34D399"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : isPuzzled ? (
          <path
            d="M88 106Q100 100 112 106"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : (
          <line x1="88" y1="104" x2="112" y2="104" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        )}

        {/* Neck */}
        <rect x="88" y="130" width="24" height="12" rx="3" fill="#475569" />

        {/* Body */}
        <rect
          x="56"
          y="142"
          width="88"
          height="50"
          rx="18"
          fill="#1E293B"
          stroke="#475569"
          strokeWidth="3"
        />

        {/* Chest Display: mood indicators */}
        <rect x="74" y="152" width="52" height="28" rx="8" fill="#0F172A" />

        {mood === 'battery' && (
          <g>
            {/* Battery icon */}
            <rect x="84" y="158" width="30" height="16" rx="3" fill="none" stroke="#38BDF8" strokeWidth="2" />
            <rect x="114" y="162" width="2" height="8" rx="1" fill="#38BDF8" />
            <rect x="87" y="161" width="16" height="10" rx="1.5" fill="#10B981" />
          </g>
        )}

        {mood === 'card' && (
          <g>
            {/* RFID Keycard */}
            <rect x="86" y="158" width="28" height="16" rx="2" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1.5" />
            <circle cx="93" cy="166" r="3" fill="#FDE047" />
            <line x1="99" y1="164" x2="110" y2="164" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )}

        {mood === 'laser' && (
          <g>
            {/* Shield / laser ray */}
            <path d="M100 156L112 162V170C112 176 100 180 100 180C100 180 88 176 88 170V162L100 156Z" fill="#8B5CF6" />
            <path d="M96 164L104 172" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {mood === 'temperature' && (
          <g>
            {/* Thermometer */}
            <line x1="100" y1="158" x2="100" y2="170" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="172" r="5" fill="#EF4444" />
          </g>
        )}

        {mood === 'gears' && (
          <g>
            {/* 3/5 components */}
            <circle cx="90" cy="166" r="4" fill="#F59E0B" />
            <circle cx="100" cy="166" r="4" fill="#F59E0B" />
            <circle cx="110" cy="166" r="4" fill="#F59E0B" />
          </g>
        )}

        {(mood === 'idle' || mood === 'happy' || mood === 'victory') && (
          <g>
            {/* Scratch cat logo paw or circuit heart */}
            <circle cx="100" cy="166" r="6" fill={isHappy ? '#10B981' : '#38BDF8'} />
            <line x1="84" y1="166" x2="90" y2="166" stroke="#64748B" strokeWidth="2" />
            <line x1="110" y1="166" x2="116" y2="166" stroke="#64748B" strokeWidth="2" />
          </g>
        )}

        {/* Arms */}
        <path
          d={isHappy ? "M54 150Q36 130 42 110" : "M54 152Q36 166 40 180"}
          stroke="#64748B"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={isHappy ? "M146 150Q164 130 158 110" : "M146 152Q164 166 160 180"}
          stroke="#64748B"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
