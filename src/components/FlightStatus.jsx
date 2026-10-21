import { locales } from '../utils/locales';

const FlightStatus = ({ data, language }) => {
  const t = locales[language] || locales['tr'];

  if (!data) return null;

  const safety = data.flightSafety || { status: 'bad', reasons: [] };

  let statusConfig = {
    title: t.notGoodToFly,
    icon: '⛔',
    bgGradient: 'from-red-950/80 via-red-900/60 to-slate-900',
    borderColor: 'border-red-500/40',
    textColor: 'text-red-400',
    badgeStyle: 'bg-red-500/15 border-red-500/30 text-red-300'
  };

  if (safety.status === 'good') {
    statusConfig = {
      title: t.goodToFly,
      icon: '🛡️',
      bgGradient: 'from-emerald-950/80 via-emerald-900/50 to-slate-900',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      badgeStyle: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
    };
  } else if (safety.status === 'caution') {
    statusConfig = {
      title: `${t.caution} (RİSKLİ / KISITLI UÇUŞ)`,
      icon: '⚠️',
      bgGradient: 'from-amber-950/80 via-amber-900/50 to-slate-900',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-400',
      badgeStyle: 'bg-amber-500/15 border-amber-500/30 text-amber-300'
    };
  }

  return (
    <div className="p-4 md:p-5">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${statusConfig.bgGradient} border ${statusConfig.borderColor} p-5 md:p-6 shadow-xl backdrop-blur-md transition-all duration-300`}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="text-3xl md:text-4xl p-3 rounded-2xl bg-slate-900/60 border border-white/10 shadow-inner">
              {statusConfig.icon}
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">
                UÇUŞ UYGUNLUK DURUMU / FLIGHT READINESS
              </div>
              <h2 className={`text-xl md:text-2xl font-black tracking-tight ${statusConfig.textColor} drop-shadow`}>
                {statusConfig.title}
              </h2>
            </div>
          </div>

          {safety.reasons && safety.reasons.length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 max-w-md">
              {safety.reasons.map((reasonKey) => (
                <span
                  key={reasonKey}
                  className={`text-xs px-3 py-1 rounded-full border font-semibold tracking-wide ${statusConfig.badgeStyle} flex items-center gap-1`}
                >
                  <span>•</span>
                  <span>{t[reasonKey] || reasonKey}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightStatus;
