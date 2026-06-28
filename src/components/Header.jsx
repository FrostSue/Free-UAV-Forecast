import { locales } from '../utils/locales';

const Header = ({ language, setLanguage, locationName, onUpdateLocation }) => {
  const t = locales[language];

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'tr' ? 'en' : 'tr'));
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-4 bg-slate-900 text-white border-b border-slate-700 shadow-md">
      <div className="flex items-center space-x-4 mb-3 md:mb-0">
        <h1 className="text-xl font-bold tracking-wide text-slate-100">{t.title}</h1>
        <button
          onClick={toggleLanguage}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-semibold uppercase transition-colors"
        >
          {language}
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="text-slate-300 text-sm font-medium">{locationName}</span>
        <button
          onClick={onUpdateLocation}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;