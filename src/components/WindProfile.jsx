import { useState } from 'react';
import { locales } from '../utils/locales';

const WindProfile = (props) => {
  const language = props.language || 'tr';
  const t = locales[language] || locales['tr'];
  const [showTooltip, setShowTooltip] = useState(false);
  
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
        {/* Title Bar with Circular Exclamation Button */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📈</span>
            <h3 className="font-bold text-white text-base md:text-lg tracking-tight">
              {t.windProfile}
            </h3>
            
            {/* Interactive Info Icon Button (Circle with Exclamation Mark) */}
            <div className="relative inline-flex items-center">
              <button
                type="button"
                onClick={() => setShowTooltip(prev => !prev)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400/80 text-amber-400 flex items-center justify-center transition-all shadow-sm focus:outline-none cursor-pointer"
                aria-label="Model Bilgisi"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </button>

              {/* Tooltip Card (Aligned left-0 to extend to the open right side, no cutoff) */}
              {showTooltip && (
                <div 
                  className="absolute left-0 top-full mt-2.5 w-80 max-w-[calc(100vw-3rem)] p-4 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl text-xs text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {/* Upward pointer arrow */}
                  <div className="absolute -top-1.5 left-2 w-3 h-3 bg-slate-900 border-t border-l border-slate-700 rotate-45 pointer-events-none"></div>

                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{t.windProfileTooltipTitle}</span>
                  </div>
                  <p className="leading-relaxed text-slate-300 mb-2.5">
                    {t.windProfileTooltipDesc}
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center font-mono text-emerald-400 font-bold text-xs">
                    {t.windProfileFormula}
                  </div>
                </div>
              )}
            </div>
          </div>
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
