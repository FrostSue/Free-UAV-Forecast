import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FlightStatus from './components/FlightStatus';
import MetricsGrid from './components/MetricsGrid';
import HourlyForecast from './components/HourlyForecast';
import WindProfile from './components/WindProfile';
import LocationModal from './components/LocationModal';
import useWeatherData from './hooks/useWeatherData';
import { getLocale } from './utils/locales';
import { WIND_UNITS } from './utils/units';

const AUTO_REFRESH_MS = 10 * 60 * 1000;
const VALID_UNITS = Object.values(WIND_UNITS);

const readPref = (key, fallback, allowed) => {
  try {
    const v = localStorage.getItem(key);
    return v && (!allowed || allowed.includes(v)) ? v : fallback;
  } catch {
    return fallback;
  }
};

const writePref = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode)
  }
};

const detectLanguage = () => {
  const stored = readPref('uav_lang', null, ['tr', 'en']);
  if (stored) return stored;
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : '';
  return nav.toLowerCase().startsWith('tr') ? 'tr' : 'en';
};

const LoadingState = ({ t }) => (
  <div className="pt-10">
    <div className="h-12 w-2/3 max-w-md animate-pulse rounded-lg bg-paper-deep" />
    <p className="mt-4 font-mono text-[13px] text-ink-soft">{t.loading}</p>
    <p className="text-[13px] text-ink-faint">{t.loadingSub}</p>
    <div className="panel mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[128px] border-b border-r border-rule p-4">
          <div className="h-3 w-1/2 animate-pulse rounded bg-paper-deep" />
          <div className="mt-4 h-7 w-2/3 animate-pulse rounded bg-paper-deep" />
        </div>
      ))}
    </div>
  </div>
);

const ErrorState = ({ t, message, onRetry, onChoose }) => (
  <div className="panel mt-10 max-w-xl border-l-4 border-l-nogo p-6">
    <h2 className="font-cond text-[26px] font-bold uppercase tracking-[0.02em]">{t.errorTitle}</h2>
    <p className="mt-1 text-[15px] text-ink-soft">{message}</p>
    <div className="mt-5 flex flex-wrap gap-2">
      <button type="button" onClick={onRetry} className="btn-solid">{t.retry}</button>
      <button type="button" onClick={onChoose} className="btn px-4 py-2.5">{t.chooseLocation}</button>
    </div>
  </div>
);

const Footer = ({ t }) => (
  <footer className="mt-12 grid gap-3 border-t border-rule pt-5 text-[12.5px] text-ink-soft sm:grid-cols-2">
    <p className="max-w-md leading-relaxed">{t.footerDisclaimer}</p>
    <p className="leading-relaxed sm:text-right">
      <span className="label mr-2">{t.footerSources}</span>
      <a className="underline decoration-rule underline-offset-2 hover:decoration-ink" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>,{' '}
      <a className="underline decoration-rule underline-offset-2 hover:decoration-ink" href="https://www.swpc.noaa.gov/" target="_blank" rel="noreferrer">NOAA SWPC</a>,{' '}
      <a className="underline decoration-rule underline-offset-2 hover:decoration-ink" href="https://celestrak.org/" target="_blank" rel="noreferrer">CelesTrak</a>,{' '}
      <a className="underline decoration-rule underline-offset-2 hover:decoration-ink" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
    </p>
  </footer>
);

const App = () => {
  const [language, setLanguageState] = useState(detectLanguage);
  const [windUnit, setWindUnitState] = useState(() => readPref('uav_wind_unit', WIND_UNITS.KMH, VALID_UNITS));
  const [theme, setThemeState] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading, error, locationName, coords, weatherData, updatedAt, fetchWeather, refresh } = useWeatherData(language);
  const t = getLocale(language);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    writePref('uav_lang', lang);
  }, []);

  const setWindUnit = useCallback((unit) => {
    setWindUnitState(unit);
    writePref('uav_wind_unit', unit);
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    writePref('uav_theme', next);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#090c13' : '#e9e7e1');
  }, [theme]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'tr'
      ? 'UAV Forecast — Drone Uçuş Hava Durumu'
      : 'UAV Forecast — Drone Flight Weather';
  }, [language]);

  // Keep data fresh while the tab is open
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const errorMessage = error ? t[error] || error : null;

  return (
    <div className="min-h-screen">
      <Header
        language={language}
        setLanguage={setLanguage}
        windUnit={windUnit}
        setWindUnit={setWindUnit}
        theme={theme}
        setTheme={setTheme}
        locationName={locationName || (loading ? t.loading : '')}
        coords={coords}
        current={weatherData?.current}
        updatedAt={updatedAt}
        onOpenModal={openModal}
        onRefresh={refresh}
        loading={loading}
      />

      <main className="mx-auto max-w-[1200px] px-4 pb-10 sm:px-6">
        {weatherData && error && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-caution/30 bg-caution-soft px-3 py-2 text-[13px]">
            <span className="flex-1">{errorMessage}</span>
            <button type="button" onClick={refresh} className="font-semibold underline underline-offset-2">{t.retry}</button>
          </div>
        )}

        {!weatherData && error ? (
          <ErrorState t={t} message={errorMessage} onRetry={refresh} onChoose={openModal} />
        ) : !weatherData ? (
          <LoadingState t={t} />
        ) : (
          <div className={`transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
            <div className="space-y-5 pt-6">
              <FlightStatus data={weatherData.current} language={language} windUnit={windUnit} />
              <MetricsGrid data={weatherData.current} language={language} windUnit={windUnit} />
              <HourlyForecast hourlyData={weatherData.hourlyForecast} language={language} windUnit={windUnit} />
              <WindProfile profileData={weatherData.windProfile} language={language} windUnit={windUnit} />
            </div>
          </div>
        )}

        <Footer t={t} />
      </main>

      <LocationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSelect={fetchWeather}
        language={language}
        initialCoords={coords}
        initialName={locationName}
      />
    </div>
  );
};

export default App;
