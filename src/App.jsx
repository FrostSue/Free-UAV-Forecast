import { useState } from 'react';
import Header from './components/Header';
import FlightStatus from './components/FlightStatus';
import MetricsGrid from './components/MetricsGrid';
import HourlyForecast from './components/HourlyForecast';
import WindProfile from './components/WindProfile';
import useWeatherData from './hooks/useWeatherData';
import { locales } from './utils/locales';

const App = () => {
  const [language, setLanguage] = useState('tr');
  const { loading, error, locationName, weatherData, updateLocation } = useWeatherData();
  const t = locales[language];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md mx-auto bg-slate-900 min-h-screen shadow-2xl overflow-hidden flex flex-col border-x border-slate-800">
        <Header
          language={language}
          setLanguage={setLanguage}
          locationName={locationName || (loading ? t.loading : '')}
          onUpdateLocation={updateLocation}
        />

        {error ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-red-400">
            <p className="bg-red-950/30 p-4 rounded-lg border border-red-900/50 text-sm">
              {error}
            </p>
          </div>
        ) : loading || !weatherData ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="animate-pulse text-emerald-500 font-medium tracking-wide">
              {t.loading}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
            <FlightStatus isGoodToFly={weatherData.isGoodToFly} language={language} />
            <MetricsGrid data={weatherData.current} language={language} />
            <HourlyForecast hourlyData={weatherData.hourlyForecast} language={language} />
            <WindProfile profileData={weatherData.windProfile} language={language} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;