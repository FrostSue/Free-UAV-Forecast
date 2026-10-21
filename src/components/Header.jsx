import { useState, useEffect } from 'react';
import { locales } from '../utils/locales';

const Header = ({ language, setLanguage, locationName, onOpenModal, lastUpdateTime }) => {
  const t = locales[language] || locales['tr'];
  const [time, setTime] = useState(new Date());
  const localeCode = language === 'tr' ? 'tr-TR' : 'en-US';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'tr' ? 'en' : 'tr'));
  };

  const updateTimeStr = lastUpdateTime 
    ? new Date(lastUpdateTime).toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' }) 
    : time.toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 shadow-xl px-4 py-4 md:px-6">
      {/* Top Branding Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-400/20 text-xl">
            🛸
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {t.title}
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls: Language Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            title="Dili Değiştir / Switch Language"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold uppercase text-slate-200 transition-all shadow-sm active:scale-95"
          >
            <span>🌐</span>
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Bottom Telemetry & Location Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
        {/* Live System Status & Clock Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-400 tracking-wider uppercase text-[11px]">
              {t.active}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-slate-200">
            <span>⏱️</span>
            <span>{time.toLocaleTimeString(localeCode)}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 pl-1">
            <span>{t.lastUpdate}:</span>
            <span className="text-slate-300 font-medium">{updateTimeStr}</span>
          </div>
        </div>

        {/* Location Picker Button */}
        <button
          onClick={onOpenModal}
          className="group flex items-center justify-between sm:justify-end gap-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 hover:border-emerald-500/40 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition-all shadow-sm active:scale-98"
          title={t.searchLocation}
        >
          <div className="flex items-center gap-2 truncate max-w-[220px]">
            <span className="text-emerald-400 group-hover:scale-110 transition-transform">📍</span>
            <span className="truncate font-semibold text-slate-100">{locationName || t.loading}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            {t.search}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
