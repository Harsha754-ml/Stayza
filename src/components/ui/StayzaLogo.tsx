import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

const StayzaLogo: React.FC<LogoProps> = ({ size = 36, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#E55A25" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="10" fill="#1F110A" stroke="#FF6B35" strokeWidth="1" strokeOpacity="0.3" />
        <g stroke="#FF6B35" strokeWidth="1" strokeLinecap="round" opacity="0.35">
          <line x1="14" y1="15" x2="24" y2="21" />
          <line x1="34" y1="15" x2="24" y2="21" />
          <line x1="24" y1="21" x2="24" y2="30" />
          <line x1="24" y1="30" x2="14" y2="35" />
          <line x1="24" y1="30" x2="34" y2="35" />
          <line x1="14" y1="15" x2="34" y2="35" />
          <line x1="34" y1="15" x2="14" y2="35" />
        </g>
        <circle cx="14" cy="15" r="3" fill="#FF6B35" />
        <circle cx="34" cy="15" r="3" fill="#E55A25" />
        <circle cx="24" cy="21" r="4" fill="url(#lg1)" />
        <circle cx="24" cy="30" r="3.5" fill="url(#lg1)" />
        <circle cx="14" cy="35" r="2.5" fill="#FF6B35" opacity="0.6" />
        <circle cx="34" cy="35" r="2.5" fill="#FF6B35" opacity="0.6" />
        <circle cx="24" cy="21" r="1.5" fill="#0E0F13" opacity="0.8" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-text-1 leading-none">Stayza</span>
          <span className="text-[9px] font-medium tracking-[0.12em] uppercase text-text-2 leading-tight mt-0.5">
            Smart Living
          </span>
        </div>
      )}
    </div>
  );
};

export default StayzaLogo;
