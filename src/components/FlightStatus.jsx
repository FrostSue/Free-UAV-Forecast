import { locales } from '../utils/locales';

const FlightStatus = ({ isGoodToFly, language }) => {
  const t = locales[language];
  const bgColor = isGoodToFly ? 'bg-green-700' : 'bg-red-700';
  const statusText = isGoodToFly ? t.goodToFly : t.notGoodToFly;

  return (
    <div className={`w-full ${bgColor} text-white py-3 px-4 shadow-sm flex flex-col items-center justify-center transition-colors`}>
      <h2 className="text-2xl font-bold tracking-wide">{statusText}</h2>
      <span className="text-xs font-light text-slate-200 mt-1">{t.previewOnly}</span>
    </div>
  );
};

export default FlightStatus;