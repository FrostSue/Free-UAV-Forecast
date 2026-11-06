import { useState, useEffect } from 'react';
import { getLocale } from '../utils/locales';
import { WIND_UNITS } from '../utils/units';
import Icon from './Icon';
import Logo from './Logo';

const UNIT_ORDER = [WIND_UNITS.KMH, WIND_UNITS.KNOTS, WIND_UNITS.MS, WIND_UNITS.MPH];

const Header = ({
  language,
  setLanguage,
  windUnit = 'km/h',
  setWindUnit,
  locationName,
  coords,
  onOpenModal,
  onRefresh,
  loading,
  lastUpdateTime
}) => {
  const t = getLocale(language);
  const [time, setTime] = useState(() => new Date());
  const localeCode = language === 'tr' ? 'tr-TR' : 'en-US';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateTimeStr = lastUpdateTime
    ? new Date(lastUpdateTime).toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const coordStr = coords
    ? `${Math.abs(coords.lat).toFixed(3)}°${coords.lat >= 0 ? 'N' : 'S'} ${Math.abs(coords.lon).toFixed(3)}°${coords.lon >= 0 ? 'E' : 'W'}`
    : null;

  return (
    <header className="z-40 border-b border-white/[0.06] bg-ink-950/75 px-4 backdrop-blur-xl sm:px-6 md:sticky md:top-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-3 py-3 sm:gap-x-4">
        {/* Brand */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 md:flex-none">
          <Logo className="h-9 w-9 flex-shrink-0 drop-shadow-[0_6px_18px_rgba(34,211,238,0.25)] sm:h-10 sm:w-10" />
          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-display text-base font-bold tracking-tight text-white sm:text-xl">
              {t.title}
            </h1>
            <p className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">{t.subtitle}</p>
          </div>
        </div>

        {/* Location */}
        <button
          type="button"
          onClick={onOpenModal}
          title={t.changeLocation}
          className="group order-last flex w-full min-w-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-left transition hover:border-brand-400/40 hover:bg-white/[0.06] md:order-none md:ml-auto md:w-auto md:max-w-xs"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20">
            <Icon name="mapPin" className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{locationName || t.loading}</span>
            <span className="block truncate font-mono text-[10.5px] text-slate-500">{coordStr || '—'}</span>
          </span>
          <Icon name="search" className="h-4 w-4 flex-shrink-0 text-slate-500 transition group-hover:text-brand-300" />
        </button>

        {/* Controls */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={() => setWindUnit?.(UNIT_ORDER[(UNIT_ORDER.indexOf(windUnit) + 1) % UNIT_ORDER.length])}
            title={t.windUnitLabel}
            aria-label={`${t.windUnitLabel}: ${windUnit}`}
            className="icon-btn w-auto gap-1.5 px-2.5 font-mono text-[11px] font-semibold sm:hidden"
          >
            <Icon name="wind" className="h-3.5 w-3.5 text-brand-300" />
            {windUnit}
          </button>
          <div className="segmented hidden sm:inline-flex" role="group" aria-label={t.windUnitLabel}>
            {UNIT_ORDER.map(u => (
              <button
                key={u}
                type="button"
                aria-pressed={windUnit === u}
                onClick={() => setWindUnit?.(u)}
                className="font-mono"
              >
                {u}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            title={t.langSwitch}
            aria-label={t.langSwitch}
            className="icon-btn w-auto gap-1.5 px-2.5 text-[11px] font-bold uppercase"
          >
            <Icon name="globe" className="h-3.5 w-3.5" />
            {language === 'tr' ? 'TR' : 'EN'}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title={t.refresh}
            aria-label={t.refresh}
            className="icon-btn"
          >
            <Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Telemetry strip */}
      <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto border-t border-white/[0.04] py-2 text-[11px] text-slate-500 custom-scrollbar">
        <span className="flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {t.live}
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap font-mono text-slate-300 tabular">
          <Icon name="clock" className="h-3.5 w-3.5 text-slate-500" />
          {time.toLocaleTimeString(localeCode)}
        </span>
        <span className="whitespace-nowrap">
          {t.lastUpdate}: <span className="font-mono text-slate-300">{updateTimeStr}</span>
        </span>
      </div>
    </header>
  );
};

export default Header;
