import React from 'react';

interface LogoProps { size?: number; showText?: boolean; className?: string; }

const StayzaLogo: React.FC<LogoProps> = ({ size = 36, showText = true, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="10" fill="rgba(99,102,241,0.1)" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.25" />
      <g stroke="#6366F1" strokeWidth="1" strokeLinecap="round" opacity="0.3">
        <line x1="14" y1="15" x2="24" y2="21" /><line x1="34" y1="15" x2="24" y2="21" />
        <line x1="24" y1="21" x2="24" y2="30" /><line x1="24" y1="30" x2="14" y2="35" />
        <line x1="24" y1="30" x2="34" y2="35" /><line x1="14" y1="15" x2="34" y2="35" />
        <line x1="34" y1="15" x2="14" y2="35" />
      </g>
      <circle cx="14" cy="15" r="3" fill="#6366F1" /><circle cx="34" cy="15" r="3" fill="#4F46E5" />
      <circle cx="24" cy="21" r="4" fill="url(#lg)" /><circle cx="24" cy="30" r="3.5" fill="url(#lg)" />
      <circle cx="14" cy="35" r="2.5" fill="#6366F1" opacity="0.5" />
      <circle cx="34" cy="35" r="2.5" fill="#6366F1" opacity="0.5" />
      <circle cx="24" cy="21" r="1.5" fill="#080A0F" opacity="0.8" />
    </svg>
    {showText && (
      <span className="text-[15px] font-semibold tracking-tight text-text-1 leading-none">Stayza</span>
    )}
  </div>
);

export default StayzaLogo;
