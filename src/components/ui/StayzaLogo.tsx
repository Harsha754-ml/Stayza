import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Stayza brand logo — a neural-network / constellation style mark
 * representing AI-powered hostel management.
 */
const StayzaLogo: React.FC<LogoProps> = ({ size = 36, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad-1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="logo-grad-2" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
          <filter id="logo-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rounded square */}
        <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logo-grad-2)" stroke="url(#logo-grad-1)" strokeWidth="1.5" />

        {/* Neural network / constellation lines */}
        <g stroke="url(#logo-grad-1)" strokeWidth="1" strokeLinecap="round" opacity="0.5">
          <line x1="14" y1="14" x2="24" y2="20" />
          <line x1="34" y1="14" x2="24" y2="20" />
          <line x1="24" y1="20" x2="24" y2="30" />
          <line x1="24" y1="30" x2="14" y2="36" />
          <line x1="24" y1="30" x2="34" y2="36" />
          <line x1="14" y1="14" x2="14" y2="36" />
          <line x1="34" y1="14" x2="34" y2="36" />
          <line x1="14" y1="14" x2="34" y2="36" />
          <line x1="34" y1="14" x2="14" y2="36" />
        </g>

        {/* Neural nodes with glow */}
        <g filter="url(#logo-glow)">
          {/* Top nodes */}
          <circle cx="14" cy="14" r="3.5" fill="#14b8a6" />
          <circle cx="34" cy="14" r="3.5" fill="#3b82f6" />
          {/* Center hub — the AI brain */}
          <circle cx="24" cy="20" r="4.5" fill="url(#logo-grad-1)" />
          <circle cx="24" cy="30" r="4" fill="url(#logo-grad-1)" />
          {/* Bottom nodes */}
          <circle cx="14" cy="36" r="3" fill="#8b5cf6" />
          <circle cx="34" cy="36" r="3" fill="#14b8a6" />
        </g>

        {/* Inner glow on center node */}
        <circle cx="24" cy="20" r="2" fill="white" opacity="0.6" />
        <circle cx="24" cy="30" r="1.5" fill="white" opacity="0.4" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-white leading-none">STAYZA</span>
          <span className="text-[9px] font-semibold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400 uppercase leading-tight mt-0.5">
            AI · Hostel · PG
          </span>
        </div>
      )}
    </div>
  );
};

export default StayzaLogo;
