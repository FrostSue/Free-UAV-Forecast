import { useState, useEffect } from 'react';
import Header from './components/Header';
import FlightStatus from './components/FlightStatus';
import MetricsGrid from './components/MetricsGrid';
import HourlyForecast from './components/HourlyForecast';
import WindProfile from './components/WindProfile';
import LocationModal from './components/LocationModal';
import useWeatherData from './hooks/useWeatherData';
import { locales } from './utils/locales';

const App = () => {
  const [language, setLanguage] = useState('tr');
  const [windUnit, setWindUnit] = useState(() => {
    try {
      return localStorage.getItem('uav_wind_unit') || 'km/h';
    } catch {
      return 'km/h';
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const { loading, error, locationName, weatherData, fetchWeather } = useWeatherData();
  const t = locales[language] || locales['tr'];

  useEffect(() => {
    if (weatherData) {
      setLastUpdateTime(new Date().toISOString());
    }
  }, [weatherData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-start items-center py-0 md:py-6 px-0 md:px-4">
      {/* Main Glassmorphism Dashboard Container */}
      <div className="w-full max-w-5xl bg-slate-900/95 border-x md:border border-slate-800/90 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative min-h-screen md:min-h-0">
        <Header
          language={language}
          setLanguage={setLanguage}
          windUnit={windUnit}
          setWindUnit={setWindUnit}
          locationName={locationName || (loading ? t.loading : '')}
          onOpenModal={() => setIsModalOpen(true)}
          lastUpdateTime={lastUpdateTime}
        />

        {error ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-red-400">
            <div className="bg-red-950/40 border border-red-900/60 p-6 rounded-2xl max-w-md shadow-xl backdrop-blur-md">
              <span className="text-3xl block mb-2">⚠️</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          </div>
        ) : loading || !weatherData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
            <div className="relative flex h-12 w-12 mb-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
              <span className="relative inline-flex rounded-full h-12 w-12 bg-emerald-600/30 border border-emerald-500/50 items-center justify-center text-xl">
                🛰️
              </span>
            </div>
            <div className="animate-pulse text-emerald-400 font-bold tracking-wider text-sm">
              {t.loading}
            </div>
          </div>
        ) : (
          <div className="flex-1 pb-10 space-y-2">
            <FlightStatus data={weatherData.current} language={language} />
            <MetricsGrid data={weatherData.current} language={language} windUnit={windUnit} />
            <HourlyForecast hourlyData={weatherData.hourlyForecast} language={language} windUnit={windUnit} />
            <WindProfile profileData={weatherData.windProfile} language={language} windUnit={windUnit} />
          </div>
        )}

        <LocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={fetchWeather}
          language={language}
        />
      </div>
    </div>
  );
};

export default App;
