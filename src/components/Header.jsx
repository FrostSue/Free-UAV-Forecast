import { getLocale } from '../utils/locales';
import { WIND_UNITS } from '../utils/units';
import Icon from './Icon';
import Logo from './Logo';

const UNIT_ORDER = [WIND_UNITS.KMH, WIND_UNITS.KNOTS, WIND_UNITS.MS, WIND_UNITS.MPH];

const Header = ({ language, setLanguage, windUnit = 'km/h', setWindUnit, onRefresh, loading }) => {
  const t = getLocale(language);

  return (
    <header className="border-b border-ink">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <Logo className="h-8 w-8 flex-shrink-0" />
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="whitespace-nowrap font-cond text-[18px] font-bold uppercase tracking-[0.06em]">UAV Forecast</span>
          <span className="hidden truncate border-l border-rule pl-3 text-[12.5px] text-ink-faint md:inline">{t.briefingTitle}</span>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          {/* Mobile: cycle through units with one button */}
          <button
            type="button"
            onClick={() => setWindUnit?.(UNIT_ORDER[(UNIT_ORDER.indexOf(windUnit) + 1) % UNIT_ORDER.length])}
            aria-label={`${t.windUnitLabel}: ${windUnit}`}
            className="toggle font-semibold text-ink underline decoration-2 sm:hidden"
          >
            {windUnit}
          </button>
          <div className="hidden items-center sm:flex" role="group" aria-label={t.windUnitLabel}>
            {UNIT_ORDER.map(u => (
              <button key={u} type="button" aria-pressed={windUnit === u} onClick={() => setWindUnit?.(u)} className="toggle">
                {u}
              </button>
            ))}
          </div>

          <span className="hidden h-5 w-px bg-rule sm:block" />

          <div className="flex items-center" role="group" aria-label={t.langSwitch}>
            {['tr', 'en'].map(lang => (
              <button key={lang} type="button" aria-pressed={language === lang} onClick={() => setLanguage(lang)} className="toggle uppercase">
                {lang}
              </button>
            ))}
          </div>

          <span className="hidden h-5 w-px bg-rule sm:block" />

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title={t.refresh}
            aria-label={t.refresh}
            className="inline-flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
          >
            <Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      {loading && (
        <div className="relative h-0.5 overflow-hidden bg-transparent">
          <span className="absolute inset-y-0 w-1/3 animate-slide-in bg-signal" />
        </div>
      )}
    </header>
  );
};

export default Header;
