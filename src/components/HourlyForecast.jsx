import { locales } from '../utils/locales';

const HourlyForecast = ({ hourlyData, language }) => {
  const t = locales[language];

  if (!hourlyData || hourlyData.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 overflow-x-auto border-t border-slate-700">
      <div className="bg-slate-800 text-slate-200 text-sm font-semibold p-2 border-b border-slate-700 text-center">
        {t.hourlyForecast}
      </div>
      <table className="w-full text-sm text-center text-slate-300">
        <thead className="text-xs text-slate-400 bg-slate-900 uppercase">
          <tr>
            <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.date}</th>
            <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.time}</th>
            <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.temperature}</th>
            <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.precipProb}</th>
            <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.cloudCover}</th>
            <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.kpIndex}</th>
            <th className="px-2 py-3 font-medium">{t.fly}</th>
          </tr>
        </thead>
        <tbody>
          {hourlyData.map((hour, index) => {
            const dateObj = new Date(hour.time);
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const dateFormatted = `${day}/${month}`;
            const timeFormatted = dateObj.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
            
            return (
              <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="px-2 py-2 border-r border-slate-700 text-slate-400">{dateFormatted}</td>
                <td className="px-2 py-2 border-r border-slate-700 text-white">{timeFormatted}</td>
                <td className="px-2 py-2 border-r border-slate-700">{hour.temperature}°C</td>
                <td className="px-2 py-2 border-r border-slate-700">{hour.precipProb}%</td>
                <td className="px-2 py-2 border-r border-slate-700">{hour.cloudCover}%</td>
                <td className="px-2 py-2 border-r border-slate-700">{hour.kpIndex}</td>
                <td className={`px-2 py-2 font-bold ${hour.isGoodToFly ? 'text-green-500' : 'text-red-500'}`}>
                  {hour.isGoodToFly ? t.yes : t.no}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HourlyForecast;