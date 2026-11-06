import { formatWindSpeed } from './units.js';
import { toNumber } from './flightSafety.js';

const pad = (n, w) => String(Math.round(Math.abs(toNumber(n, 0)))).padStart(w, '0');

/**
 * One-line, METAR-inspired summary that pilots can paste into a flight log.
 * Uses aviation abbreviations in both languages on purpose.
 */
export const buildBriefingLine = (d, coords, windUnit = 'km/h') => {
  if (!d) return '';
  const u = windUnit.toUpperCase().replace('/', '');
  const parts = [
    coords
      ? `${Math.abs(coords.lat).toFixed(2).padStart(5, '0')}${coords.lat >= 0 ? 'N' : 'S'} ${Math.abs(coords.lon).toFixed(2).padStart(6, '0')}${coords.lon >= 0 ? 'E' : 'W'}`
      : null,
    `WIND ${pad(d.windDirDegree, 3)}/${formatWindSpeed(d.windSpeedKmh, windUnit, 0)}G${formatWindSpeed(d.windGustsKmh, windUnit, 0)}${u}`,
    `VIS ${toNumber(d.visibilityKm, 0).toFixed(1)}KM`,
    `T ${Math.round(toNumber(d.temperature, 0))}/${Math.round(toNumber(d.dewPoint, 0))}`,
    `CLD ${Math.round(toNumber(d.cloudCover, 0))}%`,
    `PRCP ${Math.round(toNumber(d.precipProb, 0))}%`,
    `KP ${toNumber(d.kpIndex, 0).toFixed(1)}`,
    `GNSS ${d.satsLocked}`
  ];
  return parts.filter(Boolean).join('  ');
};

/**
 * Formats a UTC offset in seconds as "UTC+3" / "UTC-4:30".
 */
export const formatUtcOffset = (sec) => {
  const s = toNumber(sec, 0);
  const sign = s >= 0 ? '+' : '-';
  const h = Math.floor(Math.abs(s) / 3600);
  const m = Math.round((Math.abs(s) % 3600) / 60);
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
};
