import { useState, useEffect } from 'react';
import { getLocale } from '../utils/locales';
import { WIND_UNITS } from '../utils/units';
import { buildBriefingLine, formatUtcOffset } from '../utils/briefing';
import { toNumber } from '../utils/flightSafety';
import Icon from './Icon';
import Logo from './Logo';

const UNIT_ORDER = [WIND_UNITS.KMH, WIND_UNITS.KNOTS, WIND_UNITS.MS, WIND_UNITS.MPH];

const Header = ({
  language,
  setLanguage,
  windUnit = 'km/h',
  setWindUnit,
  theme,
  setTheme,
  locationName,
  coords,
  current,
  updatedAt,
  onOpenModal,
  onRefresh,
  loading
}) => {
  const t = getLocale(language);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const localeCode = language === 'tr' ? 'tr-TR' : 'en-GB';
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Clock shows the wall time *at the selected location*, not the browser's.
  const offset = toNumber(current?.utcOffsetSeconds, -new Date().getTimezoneOffset() * 60);
  const clock = new Date(now + offset * 1000).toLocaleTimeString(localeCode, {
    hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC'
  });
  const updated = updatedAt
    ? new Date(updatedAt).toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const coordStr = coords
    ? `${Math.abs(coords.lat).toFixed(3)}°${coords.lat >= 0 ? 'N' : 'S'}  ${Math.abs(coords.lon).toFixed(3)}°${coords.lon >= 0 ? 'E' : 'W'}`
    : '—';
  const line = buildBriefingLine(current, coords, windUnit);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <header className="z-40 border-b border-rule bg-paper/80 backdrop-blur-xl md:sticky md:top-0">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="group/logo flex min-w-0 flex-1 items-center gap-3 md:flex-none">
          <Logo className="h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10" spin={loading} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[16px] font-bold tracking-[-0.01em] sm:text-[18px]">{t.title}</div>
            <div className="hidden truncate text-[11.5px] text-ink-faint sm:block">{t.subtitle}</div>
          </div>
        </div>

        {/* Location pill */}
        <button
          type="button"
          onClick={onOpenModal}
          title={t.changeLocation}
          className="group order-last flex w-full min-w-0 items-center gap-3 rounded-2xl border border-rule bg-surface px-3 py-2 text-left transition-all hover:border-brand/50 hover:shadow-[0_0_0_4px_rgb(var(--brand)/0.08)] md:order-none md:ml-auto md:w-auto md:min-w-[240px] md:max-w-xs"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20 transition-transform group-hover:scale-105">
            <Icon name="mapPin" className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{locationName || t.loading}</span>
            <span className="block truncate font-mono text-[10.5px] text-ink-faint">{coordStr}</span>
          </span>
          <Icon name="search" className="h-4 w-4 flex-shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
        </button>

        {/* Controls */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={() => setWindUnit?.(UNIT_ORDER[(UNIT_ORDER.indexOf(windUnit) + 1) % UNIT_ORDER.length])}
            aria-label={`${t.windUnitLabel}: ${windUnit}`}
            className="icon-btn w-auto gap-1.5 px-2.5 font-mono text-[12px] text-ink sm:hidden"
          >
            <Icon name="wind" className="h-3.5 w-3.5 text-brand" />
            {windUnit}
          </button>
          <div className="seg hidden sm:inline-flex" role="group" aria-label={t.windUnitLabel}>
            {UNIT_ORDER.map(u => (
              <button key={u} type="button" aria-pressed={windUnit === u} onClick={() => setWindUnit?.(u)}>
                {u}
              </button>
            ))}
          </div>

          <div className="seg" role="group" aria-label={t.langSwitch}>
            {['tr', 'en'].map(lang => (
              <button key={lang} type="button" aria-pressed={language === lang} onClick={() => setLanguage(lang)} className="uppercase">
                {lang}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            title={nextTheme === 'dark' ? t.themeDark : t.themeLight}
            aria-label={nextTheme === 'dark' ? t.themeDark : t.themeLight}
            className="icon-btn"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-4 w-4" />
          </button>

          <button type="button" onClick={onRefresh} disabled={loading} title={t.refresh} aria-label={t.refresh} className="icon-btn">
            <Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live telemetry strip */}
      <div className="border-t border-rule/70">
        <div className="thin-scrollbar mx-auto flex max-w-[1200px] items-center gap-4 overflow-x-auto px-4 py-2 text-[11.5px] text-ink-faint sm:px-6">
          <span className="flex items-center gap-1.5 font-cond font-bold uppercase tracking-[0.14em] text-go">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-go" />
            </span>
            {t.live}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap font-mono text-ink tabular">
            <Icon name="clock" className="h-3.5 w-3.5 text-ink-faint" />
            {clock}
            <span className="text-ink-faint">{formatUtcOffset(offset)}</span>
          </span>
          <span className="whitespace-nowrap">
            {t.lastUpdate}: <span className="font-mono text-ink-soft">{updated}</span>
          </span>
          {line && (
            <button
              type="button"
              onClick={copy}
              title={t.copyBriefingTitle}
              className="ml-auto hidden items-center gap-2 whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[11px] text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink lg:flex"
            >
              <span className="max-w-[460px] truncate">{line}</span>
              <span className="font-cond text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand">
                {copied ? t.copied : t.copyBriefing}
              </span>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="relative h-0.5 overflow-hidden">
          <span className="absolute inset-y-0 w-1/3 animate-slide-in bg-brand" />
        </div>
      )}
    </header>
  );
};

export default Header;
