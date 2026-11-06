import { getLocale } from '../utils/locales';
import { formatWindSpeed } from '../utils/units';
import Icon from './Icon';

const STATUS_STYLES = {
  good: {
    icon: 'shieldCheck',
    titleKey: 'goodToFly',
    descKey: 'statusDescGood',
    text: 'text-emerald-300',
    ring: 'ring-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    glow: 'from-emerald-500/20',
    bar: 'bg-emerald-400',
    border: 'border-emerald-400/20'
  },
  caution: {
    icon: 'alert',
    titleKey: 'cautionToFly',
    descKey: 'statusDescCaution',
    text: 'text-amber-300',
    ring: 'ring-amber-400/30 bg-amber-400/10 text-amber-300',
    glow: 'from-amber-500/20',
    bar: 'bg-amber-400',
    border: 'border-amber-400/20'
  },
  bad: {
    icon: 'ban',
    titleKey: 'notGoodToFly',
    descKey: 'statusDescBad',
    text: 'text-rose-300',
    ring: 'ring-rose-400/30 bg-rose-400/10 text-rose-300',
    glow: 'from-rose-500/20',
    bar: 'bg-rose-400',
    border: 'border-rose-400/20'
  }
};

const LEVEL_DOT = {
  ok: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]',
  caution: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]',
  critical: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.6)]'
};

const CHECK_META = {
  wind: { icon: 'wind', labelKey: 'checkWind' },
  gusts: { icon: 'gust', labelKey: 'checkGusts' },
  precip: { icon: 'droplet', labelKey: 'checkPrecip' },
  visibility: { icon: 'eye', labelKey: 'checkVisibility' },
  kp: { icon: 'zap', labelKey: 'checkKp' },
  temp: { icon: 'battery', labelKey: 'checkTemp' },
  gnss: { icon: 'satellite', labelKey: 'checkGnss' }
};

const FlightStatus = ({ data, language, windUnit = 'km/h' }) => {
  const t = getLocale(language);
  if (!data) return null;

  const safety = data.flightSafety || { status: 'bad', reasons: [], checks: [] };
  const style = STATUS_STYLES[safety.status] || STATUS_STYLES.bad;
  const checks = safety.checks || [];
  const okCount = checks.filter(c => c.level === 'ok').length;
  const score = checks.length ? Math.round((okCount / checks.length) * 100) : 0;

  const valueFor = (id) => {
    switch (id) {
      case 'wind': return `${formatWindSpeed(data.windSpeedKmh, windUnit, 1)} ${windUnit}`;
      case 'gusts': return `${formatWindSpeed(data.windGustsKmh, windUnit, 1)} ${windUnit}`;
      case 'precip': return `${data.precipProb}%`;
      case 'visibility': return language === 'tr' ? `${data.visibilityKm} km` : `${data.visibilityMiles} mi`;
      case 'kp': return `Kp ${Number(data.kpIndex).toFixed(1)}`;
      case 'temp': return `${Number(data.temperature).toFixed(1)}°C`;
      case 'gnss': return `${data.satsLocked} sat`;
      default: return '';
    }
  };

  return (
    <section className={`panel overflow-hidden ${style.border} animate-fade-up`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow} via-transparent to-transparent`} />

      <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        {/* Verdict */}
        <div className="flex flex-col justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ring-1 ${style.ring} sm:h-16 sm:w-16`}>
              <Icon name={style.icon} className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="eyebrow mb-1">{t.flightReadiness}</div>
              <h2 className={`font-display text-2xl font-bold tracking-tight sm:text-3xl ${style.text}`}>
                {t[style.titleKey]}
              </h2>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">{t[style.descKey]}</p>
            </div>
          </div>

          {safety.reasons?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {safety.reasons.map(reasonKey => (
                <span key={reasonKey} className={`pill ${safety.status === 'bad' ? 'pill-bad' : 'pill-caution'} normal-case tracking-normal`}>
                  {t[reasonKey] || reasonKey}
                </span>
              ))}
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>{t.preflightChecklist}</span>
              <span className="font-mono text-slate-300">{okCount}/{checks.length}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className={`h-full rounded-full ${style.bar} transition-all duration-700`} style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {checks.map(check => {
            const meta = CHECK_META[check.id];
            if (!meta) return null;
            return (
              <li
                key={check.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-ink-950/40 px-3 py-2.5"
              >
                <Icon name={meta.icon} className="h-4 w-4 flex-shrink-0 text-slate-500" />
                <span className="flex-1 truncate text-[13px] font-medium text-slate-300">{t[meta.labelKey]}</span>
                <span className="font-mono text-[12px] text-slate-400 tabular">{valueFor(check.id)}</span>
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${LEVEL_DOT[check.level]}`} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default FlightStatus;
