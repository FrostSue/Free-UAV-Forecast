import { getLocale } from '../utils/locales';
import { formatWindSpeed, convertWindSpeed } from '../utils/units';
import { SAFETY_THRESHOLDS as T } from '../utils/flightSafety';
import Icon from './Icon';

const STYLES = {
  good: {
    icon: 'shieldCheck',
    titleKey: 'goodToFly',
    descKey: 'statusDescGood',
    text: 'text-go',
    tile: 'bg-go/10 text-go ring-go/30',
    glow: 'from-go/20',
    bar: 'bg-go',
    border: 'border-go/30'
  },
  caution: {
    icon: 'alert',
    titleKey: 'cautionToFly',
    descKey: 'statusDescCaution',
    text: 'text-caution',
    tile: 'bg-caution/10 text-caution ring-caution/30',
    glow: 'from-caution/20',
    bar: 'bg-caution-bright',
    border: 'border-caution/30'
  },
  bad: {
    icon: 'ban',
    titleKey: 'notGoodToFly',
    descKey: 'statusDescBad',
    text: 'text-nogo',
    tile: 'bg-nogo/10 text-nogo ring-nogo/30',
    glow: 'from-nogo/20',
    bar: 'bg-nogo',
    border: 'border-nogo/30'
  }
};

const DOT = {
  ok: 'bg-go shadow-[0_0_10px_rgb(var(--go)/0.7)]',
  caution: 'bg-caution-bright shadow-[0_0_10px_rgb(var(--caution-bright)/0.7)]',
  critical: 'bg-nogo shadow-[0_0_10px_rgb(var(--nogo)/0.7)]'
};

const CHIP_TONE = {
  ok: 'border-rule hover:border-go/40',
  caution: 'border-caution/40 bg-caution-soft/50',
  critical: 'border-nogo/40 bg-nogo-soft/50'
};

const META = {
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
  const s = STYLES[safety.status] || STYLES.bad;
  const checks = safety.checks || [];
  const okCount = checks.filter(c => c.level === 'ok').length;
  const score = checks.length ? Math.round((okCount / checks.length) * 100) : 0;
  const wd = windUnit === 'km/h' || windUnit === 'mph' ? 0 : 1;
  const w = (v) => convertWindSpeed(v, windUnit, wd);
  const isTr = language === 'tr';

  const info = (id) => {
    switch (id) {
      case 'wind': return [`${formatWindSpeed(data.windSpeedKmh, windUnit, 1)} ${windUnit}`, `${w(T.wind.caution)} / ${w(T.wind.critical)} ${windUnit}`];
      case 'gusts': return [`${formatWindSpeed(data.windGustsKmh, windUnit, 1)} ${windUnit}`, `${w(T.gust.caution)} / ${w(T.gust.critical)} ${windUnit}`];
      case 'precip': return [`${data.precipProb}%`, `${T.precip.caution} / ${T.precip.critical} %`];
      case 'visibility': return isTr
        ? [`${data.visibilityKm} km`, `< ${T.visibilityKm.caution} / < ${T.visibilityKm.critical} km`]
        : [`${data.visibilityMiles} mi`, '< 3.1 / < 1.9 mi'];
      case 'kp': return [`Kp ${Number(data.kpIndex).toFixed(1)}`, `${T.kp.caution} / ${T.kp.critical}`];
      case 'temp': return [`${Number(data.temperature).toFixed(1)}°C`, `${T.temp.cautionLow}…${T.temp.cautionHigh} °C`];
      case 'gnss': return [`${data.satsLocked} sat`, `≥ ${T.sats.caution}`];
      default: return ['', ''];
    }
  };

  return (
    <section className={`panel relative animate-fade-up ${s.border}`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.glow} via-transparent to-transparent`} />
      <div className={`pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br ${s.glow} to-transparent blur-3xl`} />

      <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_1.15fr] lg:gap-8">
        {/* Verdict */}
        <div className="flex flex-col justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ring-1 ${s.tile} sm:h-16 sm:w-16`}>
              <Icon name={s.icon} className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="label mb-1">{t.flightReadiness}</div>
              <h2 className={`text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px] ${s.text}`}>
                {t[s.titleKey]}
              </h2>
              <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-ink-soft">{t[s.descKey]}</p>
            </div>
          </div>

          {safety.reasons?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {safety.reasons.map(reasonKey => (
                <span
                  key={reasonKey}
                  className={`rounded-full border px-2.5 py-1 text-[12px] font-medium ${safety.status === 'bad' ? 'border-nogo/30 bg-nogo-soft text-nogo' : 'border-caution/30 bg-caution-soft text-caution'}`}
                >
                  {t[reasonKey] || reasonKey}
                </span>
              ))}
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between text-[12px] text-ink-faint">
              <span>{t.preflightChecklist}</span>
              <span className="font-mono text-ink">{okCount}/{checks.length}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
              <div className={`h-full rounded-full ${s.bar} transition-all duration-700`} style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>

        {/* Checklist chips — hover reveals the limit */}
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {checks.map((check, i) => {
            const meta = META[check.id];
            if (!meta) return null;
            const [value, limit] = info(check.id);
            return (
              <li
                key={check.id}
                className={`group relative flex items-center gap-3 rounded-xl border bg-surface/70 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-fade-up ${CHIP_TONE[check.level]}`}
                style={{ animationDelay: `${80 + i * 40}ms` }}
              >
                <Icon name={meta.icon} className="h-4 w-4 flex-shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{t[meta.labelKey]}</span>
                  <span className="block max-h-0 overflow-hidden font-mono text-[10.5px] text-ink-faint opacity-0 transition-all duration-200 group-hover:max-h-4 group-hover:opacity-100">
                    {t.colLimit.split('(')[0].trim()}: {limit}
                  </span>
                </span>
                <span className="font-mono text-[12.5px] text-ink-soft tabular">{value}</span>
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${DOT[check.level]}`} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default FlightStatus;
