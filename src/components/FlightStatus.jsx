import { locales } from '../utils/locales';

const FlightStatus = ({ data, language }) => {
  const t = locales[language] || locales['tr'];

  if (!data) return null;

  const gusts = parseFloat(data.windGusts || 0);
  const precip = parseFloat(data.precipProb || 0);

  let statusText = t.notGoodToFly;
  let bgColor = 'bg-red-600';

  if (gusts < 25 && precip < 15) {
    statusText = t.goodToFly;
    bgColor = 'bg-emerald-600';
  } else if (gusts < 35 && precip < 40) {
    statusText = t.caution ? `⚠️ ${t.caution.toUpperCase()} (RİSKLİ)` : '⚠️ DİKKAT (RİSKLİ)';
    bgColor = 'bg-amber-500';
  }

  return (
    <div className={`p-4 text-center font-bold text-xl md:text-2xl text-white ${bgColor} shadow-md tracking-wide transition-colors duration-500`}>
      {statusText}
    </div>
  );
};

export default FlightStatus;