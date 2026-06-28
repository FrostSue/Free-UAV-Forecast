import { locales } from '../utils/locales';

const WindProfile = ({ profileData, language }) => {
  const t = locales[language];

  if (!profileData || profileData.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 overflow-x-auto border-t border-slate-700">
      <div className="bg-slate-800 text-slate-200 text-sm font-semibold p-2 border-b border-slate-700 text-center">
        {t.windProfile}
      </div>
      <table className="w-full text-sm text-center text-slate-300">
        <thead className="text-xs text-slate-400 bg-slate-900 uppercase">
          <tr>
            <th className="px-3 py-3 border-r border-slate-700 font-medium">Altitude AGL</th>
            <th className="px-3 py-3 border-r border-slate-700 font-medium">Wind Speed</th>
            <th className="px-3 py-3 border-r border-slate-700 font-medium">Gust Speed</th>
            <th className="px-3 py-3 font-medium">{t.temperature}</th>
          </tr>
        </thead>
        <tbody>
          {profileData.map((level, index) => (
            <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
              <td className="px-3 py-2 border-r border-slate-700 font-medium text-emerald-400">
                {level.altitude}
              </td>
              <td className="px-3 py-2 border-r border-slate-700">{level.windSpeed} {t.kmh}</td>
              <td className="px-3 py-2 border-r border-slate-700">{level.gustSpeed} {t.kmh}</td>
              <td className="px-3 py-2">{level.temperature}°C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WindProfile;