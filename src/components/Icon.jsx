/**
 * Lightweight inline SVG icon set (stroke icons, 24×24 grid).
 * Usage: <Icon name="wind" className="h-4 w-4" />
 */
const CLOUD_BASE = 'M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2';

const ICONS = {
  wind: ['M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2', 'M9.6 4.6A2 2 0 1 1 11 8H2', 'M12.6 19.4A2 2 0 1 0 14 16H2'],
  gust: ['M21 4H3', 'M18 8H6', 'M19 12H9', 'M16 16h-6', 'M11 20H9'],
  thermometer: ['M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z'],
  droplet: ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'],
  cloud: ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'],
  cloudSun: ['M12 2v2', 'm4.93 4.93 1.41 1.41', 'M20 12h2', 'm19.07 4.93-1.41 1.41', 'M15.95 12.65a4 4 0 0 0-5.93-4.13', 'M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z'],
  cloudRain: [CLOUD_BASE, 'M16 14v6', 'M8 14v6', 'M12 16v6'],
  cloudSnow: [CLOUD_BASE, 'M8 15h.01', 'M8 19h.01', 'M12 17h.01', 'M12 21h.01', 'M16 15h.01', 'M16 19h.01'],
  cloudFog: [CLOUD_BASE, 'M16 17H7', 'M17 21H9'],
  cloudLightning: ['M6 16.33A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.97', 'm13 12-3 5h4l-3 5'],
  sun: [{ circle: [12, 12, 4] }, 'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  sunrise: ['M12 2v8', 'm4.93 10.93 1.41 1.41', 'M2 18h2', 'M20 18h2', 'm19.07 10.93-1.41 1.41', 'M22 22H2', 'm8 6 4-4 4 4', 'M16 18a4 4 0 0 0-8 0'],
  sunset: ['M12 10V2', 'm4.93 10.93 1.41 1.41', 'M2 18h2', 'M20 18h2', 'm19.07 10.93-1.41 1.41', 'M22 22H2', 'm16 6-4 4-4-4', 'M16 18a4 4 0 0 0-8 0'],
  compass: [{ circle: [12, 12, 10] }, 'm16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z'],
  eye: ['M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0', { circle: [12, 12, 3] }],
  satellite: ['M13 7 9 3 5 7l4 4', 'm17 11 4 4-4 4-4-4', 'm8 12 4 4 6-6-4-4Z', 'm16 8 3-3', 'M9 21a6 6 0 0 0-6-6'],
  lock: [{ rect: [3, 11, 18, 11, 2] }, 'M7 11V7a5 5 0 0 1 10 0v4'],
  zap: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
  mapPin: ['M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0', { circle: [12, 10, 3] }],
  search: [{ circle: [11, 11, 8] }, 'm21 21-4.3-4.3'],
  locate: ['M2 12h3', 'M19 12h3', 'M12 2v3', 'M12 19v3', { circle: [12, 12, 7] }, { circle: [12, 12, 2.5] }],
  refresh: ['M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5', 'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16', 'M16 16h5v5'],
  globe: [{ circle: [12, 12, 10] }, 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', 'M2 12h20'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  info: [{ circle: [12, 12, 10] }, 'M12 16v-4', 'M12 8h.01'],
  check: ['M20 6 9 17l-5-5'],
  alert: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z', 'M12 9v4', 'M12 17h.01'],
  ban: ['M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z', 'm15 9-6 6', 'm9 9 6 6'],
  shieldCheck: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4'],
  calendar: [{ rect: [3, 4, 18, 18, 2] }, 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  layers: ['m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'],
  clock: [{ circle: [12, 12, 10] }, 'M12 6v6l4 2'],
  gauge: ['m12 14 4-4', 'M3.34 19a10 10 0 1 1 17.32 0'],
  battery: [{ rect: [2, 7, 16, 10, 2] }, 'M22 11v2', 'M6 11v2', 'M10 11v2'],
  chart: ['M3 3v16a2 2 0 0 0 2 2h16', 'm19 9-5 5-4-4-3 3'],
};

const Icon = ({ name, className = 'h-4 w-4', strokeWidth = 2, title, ...rest }) => {
  const parts = ICONS[name];
  if (!parts) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title && <title>{title}</title>}
      {parts.map((p, i) => {
        if (typeof p === 'string') return <path key={i} d={p} />;
        if (p.circle) return <circle key={i} cx={p.circle[0]} cy={p.circle[1]} r={p.circle[2]} />;
        if (p.rect) return <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} rx={p.rect[4]} />;
        return null;
      })}
    </svg>
  );
};

export default Icon;
