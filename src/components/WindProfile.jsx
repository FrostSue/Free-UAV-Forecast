import { locales } from '../utils/locales';

const WindProfile = (props) => {
  const language = props.language || 'tr';
  const t = locales[language] || locales['tr'];
  
  const activeData = props.data || props.windProfileData || props.windProfile || props.profileData;

  if (!activeData || !Array.isArray(activeData) || activeData.length === 0) return null;

  const getTierFlyStatus = (gust) => {
    const g = parseFloat(gust || 0);
    if (g < 25) return { text: t.yes, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (g < 35) return { text: t.caution, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { text: t.no, color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  return (
    <div className="p-4 md:p-5 pt-0">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        {/* Title Bar */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <h3 className="font-bold text-white text-base md:text-lg tracking-tight">
              {t.windProfile}
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Hellmann Power-Law
          </span>
        </div>

        {/* Profile Table */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs md:text-sm text-center text-slate-300 divide-y divide-slate-800">
            <thead className="text-[11px] font-bold text-slate-400 bg-slate-900/95 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-3 border-r border-slate-800">{t.altitudeAgl}</th>
                <th className="px-3 py-3 border-r border-slate-800">{t.windSpeedProfile}</th>
                <th className="px-3 py-3 border-r border-slate-800">{t.gustSpeedProfile}</th>
                <th className="px-3 py-3 border-r border-slate-800">{t.temperature}</th>
                <th className="px-3 py-3">{t.fly}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {activeData.map((tier, index) => {
                const status = getTierFlyStatus(tier.gustSpeed);
                return (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5 border-r border-slate-800/60 font-bold text-slate-100 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                        {t[tier.altitudeKey] || tier.altitudeKey}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-200 font-mono">
                      {tier.windSpeed} {t.kmh}
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-800/60 text-white font-bold font-mono">
                      {tier.gustSpeed} {t.kmh}
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-800/60 text-slate-300">
                      {tier.temperature}°C
                    </td>
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

export default WindProfile;
