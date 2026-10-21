import { useState, useEffect, useRef } from 'react';
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
  const [activeTooltip, setActiveTooltip] = useState(null);
  const gridRef = useRef(null);

  // Close tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (gridRef.current && !gridRef.current.contains(e.target)) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center items-center p-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mr-3"></div>
        {t.loading}
      </div>
    );
  }

  const renderCard = ({
    id,
    icon,
    title,
    value,
    unit = '',
    subValue = null,
    badge = null,
    alert = 'normal',
    tooltip = null,
    popPosition = 'down', // 'down' or 'up'
    alignRight = false
  }) => {
    const isTooltipOpen = activeTooltip === id;

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
      <div 
        className={`relative flex flex-col justify-between p-3.5 rounded-xl border backdrop-blur-sm transition-all duration-200 ${
          isTooltipOpen ? 'z-50 ring-2 ring-amber-400/50 shadow-2xl' : 'z-0 hover:-translate-y-0.5 hover:shadow-lg'
        } ${alertClasses}`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold truncate">
            <span className="text-sm flex-shrink-0">{icon}</span>
            <span className="truncate">{title}</span>
            {tooltip && (
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(isTooltipOpen ? null : id);
                  }}
                  className="w-4 h-4 rounded-full bg-slate-700 hover:bg-slate-600 text-amber-400 hover:text-amber-300 flex items-center justify-center ml-0.5 transition-colors focus:outline-none cursor-pointer flex-shrink-0"
                  aria-label="Detay"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </button>

                {/* 100% Solid Opaque Popover Card */}
                {isTooltipOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute ${
                      alignRight ? 'right-0 sm:-right-2' : 'left-0 sm:-left-2'
                    } ${
                      popPosition === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'
                    } w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] p-4 bg-slate-950 border-2 border-slate-700 rounded-2xl shadow-2xl shadow-black text-xs text-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150`}
                  >
                    {/* Directional Pointer Arrow */}
                    <div 
                      className={`absolute ${
                        popPosition === 'up' 
                          ? '-bottom-1.5 border-b-2 border-r-2' 
                          : '-top-1.5 border-t-2 border-l-2'
                      } ${
                        alignRight ? 'right-4' : 'left-4'
                      } w-3 h-3 bg-slate-950 border-slate-700 rotate-45 pointer-events-none`}
                    ></div>

                    <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-slate-800">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{tooltip.title}</span>
                      </div>
                      <button
                        onClick={() => setActiveTooltip(null)}
                        className="text-slate-400 hover:text-white p-0.5 rounded text-xs leading-none"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="leading-relaxed text-slate-200 text-[11px] font-normal">
                      {tooltip.desc}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold tracking-wider bg-slate-700/70 text-slate-300 border border-slate-600/50 flex-shrink-0">
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
    <div ref={gridRef} className="px-4 md:px-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* ROW 1 */}
        {renderCard({
          id: 'weather',
          icon: '⛅',
          title: t.weather,
          value: data.weatherCode <= 3 ? t.clear : t.rain,
          alert: 'normal',
          popPosition: 'down'
        })}

        {renderCard({
          id: 'sun',
          icon: '🌅',
          title: t.sunTimes,
          value: `${data.sunrise}`,
          subValue: `${t.sunsetLabel}: ${data.sunset}`,
          badge: t.sunriseLabel,
          popPosition: 'down'
        })}

        {renderCard({
          id: 'temp',
          icon: '🌡️',
          title: t.temperature,
          value: data.temperature,
          unit: '°C',
          subValue: `${t.dewPoint}: ${data.dewPoint}°C`,
          popPosition: 'down',
          tooltip: {
            title: t.dewPointTooltipTitle,
            desc: t.dewPointTooltipDesc
          }
        })}

        {renderCard({
          id: 'wind',
          icon: '💨',
          title: t.wind,
          value: data.windSpeed,
          unit: t.kmh,
          subValue: t.alt5000,
          popPosition: 'down'
        })}

        {/* ROW 2 */}
        {renderCard({
          id: 'gusts',
          icon: '🌪️',
          title: t.gusts,
          value: data.windGusts,
          unit: t.kmh,
          alert: gustAlert,
          subValue: t.alt5000,
          popPosition: 'down',
          tooltip: {
            title: t.gustTooltipTitle,
            desc: t.gustTooltipDesc
          }
        })}

        {renderCard({
          id: 'dir',
          icon: '🧭',
          title: t.windDir,
          value: getWindDirText(data.windDirDegree, language),
          alert: 'normal',
          popPosition: 'down'
        })}

        {renderCard({
          id: 'precip',
          icon: '💧',
          title: t.precipProb,
          value: data.precipProb,
          unit: '%',
          alert: precipAlert,
          popPosition: 'down'
        })}

        {renderCard({
          id: 'cloud',
          icon: '☁️',
          title: t.cloudCover,
          value: data.cloudCover,
          unit: '%',
          popPosition: 'down'
        })}

        {/* ROW 3 (Bottom Row: pops UPWARDS so it never overlaps tables or lower rows!) */}
        {renderCard({
          id: 'vis',
          icon: '👁️',
          title: t.visibility,
          value: language === 'tr' ? data.visibilityKm : data.visibilityMiles,
          unit: t.visibilityUnit,
          alert: visAlert,
          popPosition: 'up',
          tooltip: {
            title: t.visibilityTooltipTitle,
            desc: t.visibilityTooltipDesc
          }
        })}

        {renderCard({
          id: 'sats_vis',
          icon: '🛰️',
          title: t.visibleSats,
          value: data.visibleSats,
          badge: 'GNSS',
          subValue: data.satSource || t.satLive,
          popPosition: 'up',
          alignRight: true,
          tooltip: {
            title: t.gnssTooltipTitle,
            desc: t.gnssTooltipDesc
          }
        })}

        {renderCard({
          id: 'sats_lock',
          icon: '🔒',
          title: t.satsLocked,
          value: data.satsLocked,
          alert: satsAlert,
          badge: 'LOCK',
          subValue: data.satSource || t.satLive,
          popPosition: 'up',
          alignRight: true,
          tooltip: {
            title: t.gnssLockTooltipTitle,
            desc: t.gnssLockTooltipDesc
          }
        })}

        {renderCard({
          id: 'kp',
          icon: '⚡',
          title: t.kpIndex,
          value: data.kpIndex,
          alert: kpAlert,
          badge: 'NOAA',
          subValue: data.kpSource || t.kpWarning,
          popPosition: 'up',
          alignRight: true,
          tooltip: {
            title: t.kpTooltipTitle,
            desc: t.kpTooltipDesc
          }
        })}
      </div>
    </div>
  );
};

export default MetricsGrid;
