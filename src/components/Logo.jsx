import { useId } from 'react';

/**
 * UAV Forecast brand mark: top-down quadcopter inside a rounded avionics tile.
 * Kept in sync with /public/favicon.svg.
 */
const Logo = ({ className = 'h-10 w-10' }) => {
  const uid = useId().replace(/:/g, '');
  const bg = `logo-bg-${uid}`;
  const ac = `logo-ac-${uid}`;

  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={bg} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#12203a" />
          <stop offset="1" stopColor="#060b16" />
        </linearGradient>
        <linearGradient id={ac} x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${bg})`} />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="15.25" stroke={`url(#${ac})`} strokeOpacity=".45" strokeWidth="1.5" />
      <path d="M21 21 43 43M43 21 21 43" stroke={`url(#${ac})`} strokeWidth="3.2" strokeLinecap="round" />
      <g stroke={`url(#${ac})`} strokeWidth="2.6">
        <circle cx="19" cy="19" r="7.5" />
        <circle cx="45" cy="19" r="7.5" />
        <circle cx="19" cy="45" r="7.5" />
        <circle cx="45" cy="45" r="7.5" />
      </g>
      <g fill="#67e8f9">
        <circle cx="19" cy="19" r="1.8" />
        <circle cx="45" cy="19" r="1.8" />
        <circle cx="19" cy="45" r="1.8" />
        <circle cx="45" cy="45" r="1.8" />
      </g>
      <rect x="26" y="26" width="12" height="12" rx="3.5" fill={`url(#${ac})`} />
      <circle cx="32" cy="32" r="2.2" fill="#060b16" />
    </svg>
  );
};

export default Logo;
