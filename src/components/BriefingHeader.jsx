import { useState, useEffect } from 'react';
import { getLocale } from '../utils/locales';
import { formatWindSpeed } from '../utils/units';
import { toNumber } from '../utils/flightSafety';

const pad = (n, w) => String(Math.round(Math.abs(n))).padStart(w, '0');

const fmtCoord = (lat, lon) =>
  `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? 'N' : 'S'}  ${Math.abs(lon).toFixed(3)}°${lon >= 0 ? 'E' : 'W'}`;

const fmtOffset = (sec) => {
  const sign = sec >= 0 ? '+' : '-';
  const h = Math.floor(Math.abs(sec) / 3600);
  const m = Math.round((Math.abs(sec) % 3600) / 60);
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
};

/**
 * One-line, METAR-inspired summary that pilots can paste into a flight log.
 * Uses aviation abbreviations in both languages on purpose.
 */
export const buildBriefingLine = (d, coords, windUnit) => {
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

const BriefingHeader = ({ data, coords, locationName, language, windUnit, updatedAt, onChangeLocation }) => {
  const t = getLocale(language);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const localeCode = language === 'tr' ? 'tr-TR' : 'en-GB';

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const offset = toNumber(data?.utcOffsetSeconds, 0);
  const localTime = new Date(now + offset * 1000).toLocaleTimeString(localeCode, {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });
  const issued = updatedAt
    ? new Date(updatedAt).toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const line = data ? buildBriefingLine(data, coords, windUnit) : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard not available (insecure context)
    }
  };

  return (
    <section className="pb-6 pt-8 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onChangeLocation}
            className="group block max-w-full text-left"
            title={t.changeLocation}
          >
            <span className="block truncate font-cond text-[40px] font-bold leading-[1.05] tracking-[-0.01em] sm:text-[56px]">
              {locationName || t.loading}
            </span>
            <span className="mt-1 inline-flex items-center gap-2 text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 group-hover:decoration-ink">
              {t.changeLocation} →
            </span>
          </button>
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[13px]">
          <div>
            <dt className="label mb-0.5">{t.localTime}</dt>
            <dd className="tabular">{localTime} <span className="text-ink-faint">{fmtOffset(offset)}</span></dd>
          </div>
          <div>
            <dt className="label mb-0.5">{t.issued}</dt>
            <dd className="tabular">{issued}</dd>
          </div>
          <div>
            <dt className="label mb-0.5">{t.latitude} / {t.longitude}</dt>
            <dd className="whitespace-nowrap tabular">{coords ? fmtCoord(coords.lat, coords.lon) : '—'}</dd>
          </div>
        </dl>
      </div>

      {line && (
        <div className="mt-6 flex items-stretch border border-ink">
          <span className="label hidden items-center border-r border-ink px-3 sm:flex">{t.briefingLine}</span>
          <code className="thin-scrollbar flex-1 overflow-x-auto whitespace-nowrap px-3 py-2.5 font-mono text-[13px] tracking-tight">
            {line}
          </code>
          <button
            type="button"
            onClick={copy}
            className="border-l border-ink px-3 font-cond text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors hover:bg-ink hover:text-paper"
          >
            {copied ? t.copied : t.copyBriefing}
          </button>
        </div>
      )}
    </section>
  );
};

export default BriefingHeader;
