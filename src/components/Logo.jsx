/**
 * UAV Forecast brand mark: an airfield windsock on an ink tile.
 * Kept in sync with /public/favicon.svg.
 */
const Logo = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="1" y="1" width="62" height="62" rx="10" fill="#16150f" className="stroke-line-strong" strokeWidth="2" />
    <line x1="13" y1="9" x2="13" y2="56" stroke="#f3f0e8" strokeWidth="3.5" strokeLinecap="round" />
    <polygon points="15,12 23.2,13.6 23.2,29.6 15,30" fill="#e8550f" />
    <polygon points="23.2,13.6 31.4,15.2 31.4,29.2 23.2,29.6" fill="#f3f0e8" />
    <polygon points="31.4,15.2 39.6,16.8 39.6,28.8 31.4,29.2" fill="#e8550f" />
    <polygon points="39.6,16.8 47.8,18.4 47.8,28.4 39.6,28.8" fill="#f3f0e8" />
    <polygon points="47.8,18.4 56,20 56,28 47.8,28.4" fill="#e8550f" />
  </svg>
);

export default Logo;
