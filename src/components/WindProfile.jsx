import { locales } from '../utils/locales';

const WindProfile = ({ windProfileData, language }) => {
  const t = locales[language];

  if (!windProfileData || windProfileData.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 border-t border-slate-700">
      <div className="bg-slate-800 text-slate-200 text-sm font-semibold p-2 border-b border-slate-700 text-center">
        {t.windProfile}
      </div>
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-center text-slate-300">
          <thead className="text-xs text-slate-400 bg-slate-900 uppercase">
            <tr>
              <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.altitudeAgl}</th>
              <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.windSpeedProfile}</th>
              <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.gustSpeedProfile}</th>
              <th className="px-2 py-3 border-r border-slate-700 font-medium">{t.temperature}</th>
              <th className="px-2 py-3 font-medium">{t.fly}</th>
            </tr>
          </thead>
          <tbody>
            {windProfileData.map((tier, index) => {
              const isGood = parseFloat(tier.gustSpeed) < 25;
              return (
                <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-2 py-2 border-r border-slate-700 font-semibold text-slate-200">
                    {t[tier.altitudeKey] || tier.altitudeKey}
                  </td>
                  <td className="px-2 py-2 border-r border-slate-700">{tier.windSpeed} {t.kmh}</td>
                  <td className="px-2 py-2 border-r border-slate-700">{tier.gustSpeed} {t.kmh}</td>
                  <td className="px-2 py-2 border-r border-slate-700">{tier.temperature}°C</td>
                  <td className={`px-2 py-2 font-bold ${isGood ? 'text-green-500' : 'text-red-500'}`}>
                    {isGood ? t.yes : t.no}
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

export default WindProfile;