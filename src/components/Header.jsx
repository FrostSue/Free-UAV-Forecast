import { locales } from '../utils/locales';

const Header = ({ language, setLanguage, locationName, onOpenModal }) => {
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
          onClick={onOpenModal}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;