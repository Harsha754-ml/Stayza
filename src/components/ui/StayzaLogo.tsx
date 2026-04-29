import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  dark?: boolean;
  className?: string;
}

const StayzaLogo: React.FC<LogoProps> = ({ size = 36, showText = true, dark = false, className = '' }) => {
  const textColor = dark ? 'text-cream' : 'text-warm-900';
  const subColor = dark ? 'text-warm-400' : 'text-accent';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-warm-1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4704B" />
            <stop offset="100%" stopColor="#D4A04A" />
          </linearGradient>
          <linearGradient id="logo-warm-2" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4704B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#D4A04A" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logo-warm-2)" stroke="url(#logo-warm-1)" strokeWidth="1.5" />

        {/* Connection lines */}
        <g stroke="url(#logo-warm-1)" strokeWidth="1" strokeLinecap="round" opacity="0.4">
          <line x1="14" y1="15" x2="24" y2="21" />
          <line x1="34" y1="15" x2="24" y2="21" />
          <line x1="24" y1="21" x2="24" y2="30" />
          <line x1="24" y1="30" x2="14" y2="35" />
          <line x1="24" y1="30" x2="34" y2="35" />
          <line x1="14" y1="15" x2="34" y2="35" />
          <line x1="34" y1="15" x2="14" y2="35" />
        </g>

        {/* Nodes */}
        <circle cx="14" cy="15" r="3.5" fill="#C4704B" />
        <circle cx="34" cy="15" r="3.5" fill="#D4A04A" />
        <circle cx="24" cy="21" r="4.5" fill="url(#logo-warm-1)" />
        <circle cx="24" cy="30" r="4" fill="url(#logo-warm-1)" />
        <circle cx="14" cy="35" r="3" fill="#7A9E7E" />
        <circle cx="34" cy="35" r="3" fill="#C4704B" />

        {/* Center glow */}
        <circle cx="24" cy="21" r="2" fill="white" opacity="0.7" />
        <circle cx="24" cy="30" r="1.5" fill="white" opacity="0.5" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`text-xl font-bold tracking-tight leading-none font-[family-name:var(--font-display)] ${textColor}`}>Stayza</span>
          <span className={`text-[9px] font-semibold tracking-[0.15em] uppercase leading-tight mt-0.5 ${subColor}`}>
            Smart Living
          </span>
        </div>
      )}
    </div>
  );
};

export default StayzaLogo;
