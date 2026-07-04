import { useState } from 'react';
import { locales } from '../utils/locales';

const HourlyForecast = ({ data, hourlyData, language }) => {
  const activeData = hourlyData || data;
  const t = locales[language] || locales['tr'];
  const [days, setDays] = useState(1);

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

  const getFlightStatus = (gusts, precip) => {
    const g = parseFloat(gusts);
    const p = parseFloat(precip);
    
    if (g < 25 && p < 15) return { text: t.yes, color: 'text-green-500' };
    if (g < 35 && p < 40) return { text: t.caution, color: 'text-yellow-400' };
    return { text: t.no, color: 'text-red-500' };
  };

  return (
    <div className="w-full bg-slate-900 border-t border-slate-700 mt-3">
      <div className="bg-slate-800 text-slate-200 text-sm font-semibold p-2 border-b border-slate-700 text-center">
        {t.hourlyForecast}
      </div>
      
      <div className="p-2 flex flex-wrap gap-2 justify-between items-center bg-slate-800/50 border-b border-slate-700">
        <div className="flex gap-1">
          {[1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${days === d ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {t[`day${d}`]}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
        >
          ⬇ {t.exportJson}
        </button>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar h-96">
        <table className="w-full text-sm text-center text-slate-300 relative">
          <thead className="text-xs text-slate-400 bg-slate-900 uppercase sticky top-0 z-10 shadow-md">
            <tr>
              <th className="px-2 py-3 border-b border-r border-slate-700 font-medium">{t.date}</th>
              <th className="px-2 py-3 border-b border-r border-slate-700 font-medium">{t.time}</th>
              <th className="px-2 py-3 border-b border-r border-slate-700 font-medium">{t.temperature}</th>
              <th className="px-2 py-3 border-b border-r border-slate-700 font-medium">{t.precipProb}</th>
              <th className="px-2 py-3 border-b border-r border-slate-700 font-medium">{t.windGustCol}</th>
              <th className="px-2 py-3 border-b border-r border-slate-700 font-medium">{t.cloudCover}</th>
              <th className="px-2 py-3 border-b font-medium">{t.fly}</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => {
              const dateObj = new Date(row.time);
              const dateStr = dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
              const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const status = getFlightStatus(row.windGusts, row.precipProb);

              return (
                <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-2 py-2 border-r border-slate-700">{dateStr}</td>
                  <td className="px-2 py-2 border-r border-slate-700 font-semibold">{timeStr}</td>
                  <td className="px-2 py-2 border-r border-slate-700">{row.temperature}°C</td>
                  <td className="px-2 py-2 border-r border-slate-700">{row.precipProb}%</td>
                  <td className="px-2 py-2 border-r border-slate-700">{row.windSpeed} / {row.windGusts} {t.kmh}</td>
                  <td className="px-2 py-2 border-r border-slate-700">{row.cloudCover}%</td>
                  <td className={`px-2 py-2 font-bold ${status.color}`}>
                    {status.text}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HourlyForecast;