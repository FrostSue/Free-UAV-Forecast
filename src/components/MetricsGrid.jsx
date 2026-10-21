import { locales } from '../utils/locales';

const getWindDirText = (degree, lang) => {
  const dirsEN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dirsTR = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
  const dirs = lang === 'tr' ? dirsTR : dirsEN;
  const index = Math.round((degree % 360) / 45);
  return `${degree}° ${dirs[index % 8]}`;
};

const MetricsGrid = ({ data, language }) => {
  const t = locales[language] || locales['tr'];

  if (!data) {
    return (
      <div className="flex justify-center items-center p-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mr-3"></div>
        {t.loading}
      </div>
    );
  }

  const renderCard = ({ icon, title, value, unit = '', subValue = null, badge = null, alert = 'normal' }) => {
    let alertClasses = 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600';
    let textAccent = 'text-white';

    if (alert === 'good') {
      alertClasses = 'bg-emerald-950/25 border-emerald-700/50 hover:border-emerald-600/70';
      textAccent = 'text-emerald-300';
    } else if (alert === 'warning') {
      alertClasses = 'bg-amber-950/25 border-amber-700/50 hover:border-amber-600/70';
      textAccent = 'text-amber-300';
    } else if (alert === 'critical') {
      alertClasses = 'bg-red-950/35 border-red-700/60 hover:border-red-600/80';
      textAccent = 'text-red-300';
    }

    return (
      <div className={`flex flex-col justify-between p-3.5 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${alertClasses}`}>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <span className="text-sm">{icon}</span>
            <span className="truncate">{title}</span>
          </div>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-wider bg-slate-700/70 text-slate-300 border border-slate-600/50">
              {badge}
            </span>
          )}
        </div>

        {/* Main Value */}
        <div className="my-1">
          <span className={`text-xl md:text-2xl font-black tracking-tight ${textAccent}`}>
            {value}
          </span>
          {unit && <span className="text-xs font-semibold text-slate-400 ml-1">{unit}</span>}
        </div>

        {/* Subvalue / Bottom info */}
        {subValue && (
          <div className="text-[11px] font-medium text-slate-400 mt-1 border-t border-slate-700/40 pt-1.5 flex items-center justify-between">
            <span className="truncate">{subValue}</span>
          </div>
        )}
      </div>
    );
  };

  const kp = parseFloat(data.kpIndex || 0);
  const kpAlert = kp >= 5.0 ? 'critical' : kp >= 3.8 ? 'warning' : 'good';

  const lockedSats = parseInt(data.satsLocked || 0, 10);
  const satsAlert = lockedSats < 10 ? 'warning' : 'good';

  const vis = parseFloat(data.visibilityKm || 10);
  const visAlert = vis < 3.0 ? 'critical' : vis < 5.0 ? 'warning' : 'normal';

  const gusts = parseFloat(data.windGusts || 0);
  const gustAlert = gusts >= 35 ? 'critical' : gusts >= 25 ? 'warning' : 'normal';

  const precip = parseFloat(data.precipProb || 0);
  const precipAlert = precip >= 40 ? 'critical' : precip >= 20 ? 'warning' : 'normal';

  return (
    <div className="px-4 md:px-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {renderCard({
          icon: '⛅',
          title: t.weather,
          value: data.weatherCode <= 3 ? t.clear : t.rain,
          alert: 'normal'
        })}

        {renderCard({
          icon: '🌅',
          title: t.sunTimes,
          value: `${data.sunrise}`,
          subValue: `${t.sunsetLabel}: ${data.sunset}`,
          badge: t.sunriseLabel
        })}

        {renderCard({
          icon: '🌡️',
          title: t.temperature,
          value: data.temperature,
          unit: '°C',
          subValue: `${t.dewPoint}: ${data.dewPoint}°C`
        })}

        {renderCard({
          icon: '💨',
          title: t.wind,
          value: data.windSpeed,
          unit: t.kmh,
          subValue: t.alt5000
        })}

        {renderCard({
          icon: '🌪️',
          title: t.gusts,
          value: data.windGusts,
          unit: t.kmh,
          alert: gustAlert,
          subValue: t.alt5000
        })}

        {renderCard({
          icon: '🧭',
          title: t.windDir,
          value: getWindDirText(data.windDirDegree, language),
          alert: 'normal'
        })}

        {renderCard({
          icon: '💧',
          title: t.precipProb,
          value: data.precipProb,
          unit: '%',
          alert: precipAlert
        })}

        {renderCard({
          icon: '☁️',
          title: t.cloudCover,
          value: data.cloudCover,
          unit: '%'
        })}

        {renderCard({
          icon: '👁️',
          title: t.visibility,
          value: language === 'tr' ? data.visibilityKm : data.visibilityMiles,
          unit: t.visibilityUnit,
          alert: visAlert
        })}

        {renderCard({
          icon: '🛰️',
          title: t.visibleSats,
          value: data.visibleSats,
          badge: 'GNSS',
          subValue: data.satSource || t.satLive
        })}

        {renderCard({
          icon: '🔒',
          title: t.satsLocked,
          value: data.satsLocked,
          alert: satsAlert,
          badge: 'LOCK',
          subValue: data.satSource || t.satLive
        })}

        {renderCard({
          icon: '⚡',
          title: t.kpIndex,
          value: data.kpIndex,
          alert: kpAlert,
          badge: 'NOAA',
          subValue: data.kpSource || t.kpWarning
        })}
      </div>
    </div>
  );
};

export default MetricsGrid;
