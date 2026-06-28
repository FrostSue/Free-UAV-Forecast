import { locales } from '../utils/locales';

const getWindDirText = (degree, lang) => {
  const dirsEN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dirsTR = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
  const dirs = lang === 'tr' ? dirsTR : dirsEN;
  const index = Math.round((degree % 360) / 45);
  return `${degree}° ${dirs[index % 8]}`;
};

const MetricsGrid = ({ data, language }) => {
  const t = locales[language];

  if (!data) {
    return <div className="flex justify-center p-10 text-slate-300">{t.loading}</div>;
  }

  const renderCard = (title, value, subValue = null) => (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-emerald-800 text-white rounded-md shadow-sm border border-emerald-700">
      <span className="text-xs font-light text-emerald-200 mb-1">{title}</span>
      <span className="text-lg font-semibold tracking-tight w-full break-words">{value}</span>
      {subValue && <span className="text-[10px] font-medium text-amber-300 mt-1">{subValue}</span>}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 bg-slate-900">
      {renderCard(t.weather, data.weatherCode <= 3 ? t.clear : t.rain)}
      {renderCard(t.sunTimes, data.sunrise, data.sunset)}
      {renderCard(t.temperature, `${data.temperature}°C`, `${t.dewPoint}: ${data.dewPoint}°C`)}
      {renderCard(t.wind, `${data.windSpeed} ${t.kmh}`, t.alt5000)}
      {renderCard(t.gusts, `${data.windGusts} ${t.kmh}`, t.alt5000)}
      {renderCard(t.windDir, getWindDirText(data.windDirDegree, language))}
      {renderCard(t.precipProb, `${data.precipProb}%`)}
      {renderCard(t.cloudCover, `${data.cloudCover}%`)}
      {renderCard(t.visibility, `${language === 'tr' ? data.visibilityKm : data.visibilityMiles} ${t.visibilityUnit}`)}
      {renderCard(t.visibleSats, data.visibleSats)}
      {renderCard(t.kpIndex, data.kpIndex, t.kpWarning)}
      {renderCard(t.satsLocked, data.satsLocked)}
    </div>
  );
};

export default MetricsGrid;