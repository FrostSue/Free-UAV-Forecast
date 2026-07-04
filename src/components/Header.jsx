import { useState, useEffect } from 'react';
import { locales } from '../utils/locales';

const Header = ({ language, setLanguage, locationName, onOpenModal, lastUpdateTime }) => {
  const t = locales[language] || locales['tr'];
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'tr' ? 'en' : 'tr'));
  };

  const updateTimeStr = lastUpdateTime 
    ? new Date(lastUpdateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) 
    : time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="flex flex-col bg-slate-900 text-white border-b border-slate-700 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center p-4">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <h1 className="text-xl font-bold tracking-wide text-slate-100">{t.title}</h1>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-semibold uppercase transition-colors"
          >
            {language}
          </button>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-0 bg-slate-800 px-3 py-2 md:px-4 md:py-2 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-widest text-emerald-500 text-xs md:text-sm">{t.active}</span>
          </div>
          <div className="text-sm md:text-base font-mono font-semibold tracking-wider border-l border-slate-600 pl-3 md:pl-4">
            {time.toLocaleTimeString('tr-TR')}
          </div>
          <div className="hidden sm:block text-xs text-slate-400 font-medium border-l border-slate-600 pl-3 md:pl-4">
            {t.lastUpdate}: {updateTimeStr}
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-slate-300 text-sm font-medium truncate max-w-[200px]">{locationName}</span>
          <button
            onClick={onOpenModal}
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="sm:hidden w-full text-center pb-3 text-xs text-slate-400 font-medium">
        {t.lastUpdate}: {updateTimeStr}
      </div>
    </header>
  );
};

export default Header;