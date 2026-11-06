/**
 * UAV Forecast brand mark: a three-blade rotor whose blades curl like wind
 * streamlines — drone and weather in a single shape.
 * Kept in sync with /public/favicon.svg.
 */
const BLADE = 'M0 0 C0 -13 9 -21 19 -18 C11 -15 6 -8 0 0Z';

const Logo = ({ className = 'h-9 w-9', spin = false }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="1" y="1" width="62" height="62" rx="15" fill="#101826" stroke="#24324a" strokeWidth="2" />
    <g transform="translate(32 32)">
      <g style={{ transformOrigin: '0px 0px' }} className={spin ? 'animate-[spin_1.2s_linear_infinite]' : 'transition-transform duration-700 ease-out group-hover/logo:rotate-[120deg]'}>
        <path d={BLADE} fill="#22d3ee" />
        <path d={BLADE} fill="#67e8f9" transform="rotate(120)" />
        <path d={BLADE} fill="#0891b2" transform="rotate(240)" />
      </g>
      <circle r="4.2" fill="#101826" stroke="#22d3ee" strokeWidth="2" />
    </g>
  </svg>
);

export default Logo;
