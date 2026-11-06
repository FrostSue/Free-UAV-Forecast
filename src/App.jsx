import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FlightStatus from './components/FlightStatus';
import MetricsGrid from './components/MetricsGrid';
import HourlyForecast from './components/HourlyForecast';
import WindProfile from './components/WindProfile';
import LocationModal from './components/LocationModal';
import Icon from './components/Icon';
import Logo from './components/Logo';
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
  <div className="space-y-5">
    <div className="panel flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-brand-400/20" />
        <Logo className="relative h-14 w-14" />
      </div>
      <div>
        <div className="font-display text-base font-semibold text-white">{t.loading}</div>
        <div className="mt-1 text-xs text-slate-500">{t.loadingSub}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-[118px]" />
      ))}
    </div>
  </div>
);

const ErrorState = ({ t, message, onRetry, onChoose }) => (
  <div className="panel mx-auto flex max-w-lg flex-col items-center gap-4 border-rose-400/20 px-6 py-12 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/25">
      <Icon name="alert" className="h-7 w-7" strokeWidth={1.8} />
    </span>
    <div>
      <h2 className="font-display text-lg font-semibold text-white">{t.errorTitle}</h2>
      <p className="mt-1 text-sm text-slate-400">{message}</p>
    </div>
    <div className="flex gap-2">
      <button type="button" onClick={onRetry} className="btn-primary">
        <Icon name="refresh" className="h-4 w-4" />
        {t.retry}
      </button>
      <button type="button" onClick={onChoose} className="btn px-4 py-2.5 text-sm">
        <Icon name="mapPin" className="h-4 w-4" />
        {t.chooseLocation}
      </button>
    </div>
  </div>
);

const Footer = ({ t }) => (
  <footer className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-[11.5px] text-slate-500 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex items-center gap-2.5">
      <Logo className="h-6 w-6 opacity-80" />
      <p className="max-w-md leading-relaxed">{t.footerDisclaimer}</p>
    </div>
    <p className="leading-relaxed sm:text-right">
      {t.footerSources}:{' '}
      <a className="text-slate-400 hover:text-brand-300" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> ·{' '}
      <a className="text-slate-400 hover:text-brand-300" href="https://www.swpc.noaa.gov/" target="_blank" rel="noreferrer">NOAA SWPC</a> ·{' '}
      <a className="text-slate-400 hover:text-brand-300" href="https://celestrak.org/" target="_blank" rel="noreferrer">CelesTrak</a> ·{' '}
      <a className="text-slate-400 hover:text-brand-300" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
    </p>
  </footer>
);

const App = () => {
  const [language, setLanguageState] = useState(detectLanguage);
  const [windUnit, setWindUnitState] = useState(() => readPref('uav_wind_unit', WIND_UNITS.KMH, VALID_UNITS));
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

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'tr'
      ? `${t.title} — Drone Uçuş Hava Durumu`
      : `${t.title} — Drone Flight Weather`;
  }, [language, t.title]);

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
        locationName={locationName || (loading ? t.loading : '')}
        coords={coords}
        onOpenModal={() => setIsModalOpen(true)}
        onRefresh={refresh}
        loading={loading}
        lastUpdateTime={updatedAt}
      />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        {weatherData && error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
            <Icon name="alert" className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button type="button" onClick={refresh} className="font-semibold underline-offset-2 hover:underline">{t.retry}</button>
          </div>
        )}

        {!weatherData && error ? (
          <ErrorState t={t} message={errorMessage} onRetry={refresh} onChoose={() => setIsModalOpen(true)} />
        ) : !weatherData ? (
          <LoadingState t={t} />
        ) : (
          <div className={`space-y-5 transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
            <FlightStatus data={weatherData.current} language={language} windUnit={windUnit} />
            <MetricsGrid data={weatherData.current} language={language} windUnit={windUnit} />
            <HourlyForecast hourlyData={weatherData.hourlyForecast} language={language} windUnit={windUnit} />
            <WindProfile profileData={weatherData.windProfile} language={language} windUnit={windUnit} />
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
