import { getLocale } from '../utils/locales';
import { WIND_UNITS } from '../utils/units';
import Icon from './Icon';
import Logo from './Logo';

const UNIT_ORDER = [WIND_UNITS.KMH, WIND_UNITS.KNOTS, WIND_UNITS.MS, WIND_UNITS.MPH];

const Header = ({ language, setLanguage, windUnit = 'km/h', setWindUnit, theme, setTheme, onRefresh, loading }) => {
  const t = getLocale(language);
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <Logo className="h-8 w-8 flex-shrink-0" />
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="whitespace-nowrap font-cond text-[18px] font-bold uppercase tracking-[0.05em]">UAV Forecast</span>
          <span className="hidden truncate border-l border-rule pl-3 text-[12.5px] text-ink-faint lg:inline">{t.briefingTitle}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Mobile: cycle units with one button */}
          <button
            type="button"
            onClick={() => setWindUnit?.(UNIT_ORDER[(UNIT_ORDER.indexOf(windUnit) + 1) % UNIT_ORDER.length])}
            aria-label={`${t.windUnitLabel}: ${windUnit}`}
            className="icon-btn w-auto px-2.5 font-mono text-[12px] text-ink sm:hidden"
          >
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

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title={t.refresh}
            aria-label={t.refresh}
            className="icon-btn hidden sm:inline-flex"
          >
            <Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      {loading && (
        <div className="relative h-0.5 overflow-hidden">
          <span className="absolute inset-y-0 w-1/3 animate-slide-in bg-signal" />
        </div>
      )}
    </header>
  );
};

export default Header;
