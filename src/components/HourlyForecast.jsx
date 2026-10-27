import { useState } from 'react';
import { locales } from '../utils/locales';
import { convertWindSpeed } from '../utils/units';

const HourlyForecast = ({ data, hourlyData, language, windUnit = 'km/h' }) => {
  const activeData = hourlyData || data;
  const t = locales[language] || locales['tr'];
  const [days, setDays] = useState(1);
  const localeCode = language === 'tr' ? 'tr-TR' : 'en-US';

  if (!activeData || !Array.isArray(activeData) || activeData.length === 0) return null;

  const displayData = activeData.slice(0, days * 24);

  const handleExport = () => {
    const dataStr = JSON.stringify(displayData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uav_forecast_${days}day.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (row) => {
    const safety = row.flightSafety;
    if (safety) {
      if (safety.status === 'good') return { text: t.yes, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      if (safety.status === 'caution') return { text: t.caution, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      return { text: t.no, color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }

    const g = parseFloat(row.windGusts || 0);
    const p = parseFloat(row.precipProb || 0);
    if (g < 25 && p < 20) return { text: t.yes, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (g < 35 && p < 40) return { text: t.caution, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { text: t.no, color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const dynamicForecastTitle = language === 'tr' 
    ? `${days * 24} Saatlik Detaylı Tahmin`
    : `${days * 24}-Hour Detailed Forecast`;

  return (
    <div className="p-4 md:p-5">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        {/* Header & Controls Bar */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h3 className="font-bold text-white text-base md:text-lg tracking-tight transition-all">
              {dynamicForecastTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Day Segment Control */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    days === d
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {t[`day${d}`]}
                </button>
              ))}
            </div>

            {/* Export JSON Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95 border border-blue-400/30"
            >
              <span>⬇</span>
              <span>{t.exportJson}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Forecast Table */}
        <div className="w-full overflow-x-auto custom-scrollbar max-h-96">
          <table className="w-full text-xs md:text-sm text-center text-slate-300 divide-y divide-slate-800">
            <thead className="text-[11px] font-bold text-slate-400 bg-slate-900/95 sticky top-0 uppercase tracking-wider backdrop-blur-sm z-10">
              <tr>
                <th className="px-3 py-3 border-r border-slate-800">{t.date}</th>
                <th className="px-3 py-3 border-r border-slate-800">{t.time}</th>
                <th className="px-3 py-3 border-r border-slate-800">{t.temperature}</th>
                <th className="px-3 py-3 border-r border-slate-800">{t.precipProb}</th>
                <th className="px-3 py-3 border-r border-slate-800">{t.windGustCol} ({windUnit})</th>
                <th className="px-3 py-3 border-r border-slate-800">{t.cloudCover}</th>
                <th className="px-3 py-3">{t.fly}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {displayData.map((row, index) => {
                const dateObj = new Date(row.time);
                const dateStr = dateObj.toLocaleDateString(localeCode, { day: '2-digit', month: '2-digit' });
                const timeStr = dateObj.toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' });
                const status = getStatusBadge(row);

                return (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-400">{dateStr}</td>
                    <td className="px-3 py-2.5 border-r border-slate-800/60 font-semibold text-white font-mono">{timeStr}</td>
                    <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-200">{row.temperature}°C</td>
                    <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-200">{row.precipProb}%</td>
                    <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-200 font-mono">
                      {convertWindSpeed(row.windSpeedKmh ?? row.windSpeed, windUnit, 1)} / <span className="font-bold text-white">{convertWindSpeed(row.windGustsKmh ?? row.windGusts, windUnit, 1)}</span> {windUnit}
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-400">{row.cloudCover}%</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
