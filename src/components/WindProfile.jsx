import { getLocale } from '../utils/locales';
import { formatWindSpeed } from '../utils/units';
import { SAFETY_THRESHOLDS as T, classifyWind, toNumber } from '../utils/flightSafety';
import Icon from './Icon';
import InfoTip from './InfoTip';

const STATUS = {
  good: { pill: 'pill-good', key: 'yes', bar: 'from-emerald-400/90 to-emerald-300/90' },
  caution: { pill: 'pill-caution', key: 'caution', bar: 'from-amber-400/90 to-amber-300/90' },
  bad: { pill: 'pill-bad', key: 'no', bar: 'from-rose-400/90 to-rose-300/90' }
};

const WindProfile = ({ profileData, language = 'tr', windUnit = 'km/h' }) => {
  const t = getLocale(language);
  if (!Array.isArray(profileData) || profileData.length === 0) return null;

  // Highest altitude on top, like a real atmospheric sounding
  const tiers = [...profileData].sort((a, b) => b.altitudeMeters - a.altitudeMeters);
  const maxKmh = Math.max(T.gust.critical + 10, ...tiers.map(r => toNumber(r.gustSpeedKmh, 0))) * 1.05;
  const pct = (v) => `${(toNumber(v, 0) / maxKmh) * 100}%`;

  return (
    <section className="panel overflow-hidden animate-fade-up">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/15">
            <Icon name="layers" className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-base font-semibold text-white sm:text-lg">{t.windProfile}</h3>
              <InfoTip title={t.windProfileTooltipTitle} label={t.windProfileTooltipTitle}>
                <p className="mb-2.5">{t.windProfileTooltipDesc}</p>
                <div className="rounded-lg border border-white/[0.06] bg-ink-950/70 p-2 text-center font-mono text-[12px] font-semibold text-brand-300">
                  {t.windProfileFormula}
                </div>
              </InfoTip>
            </div>
            <p className="text-[11.5px] text-slate-500">{t.windProfileSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-emerald-400/90" />{t.windSpeedProfile}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-white/[0.12]" />{t.gustSpeedProfile}</span>
        </div>
      </div>

      <div className="hidden grid-cols-[132px_1fr_150px_64px_76px] gap-3 border-b border-white/[0.04] px-5 py-2 md:grid">
        <span className="eyebrow">{t.altitudeAgl}</span>
        <span className="eyebrow" />
        <span className="eyebrow text-right">{t.windSpeedProfile} / {t.gustSpeedProfile}</span>
        <span className="eyebrow text-right">{t.temperature}</span>
        <span className="eyebrow text-center">{t.fly}</span>
      </div>

      <ul className="divide-y divide-white/[0.04]">
        {tiers.map(tier => {
          const status = STATUS[classifyWind(tier.gustSpeedKmh, tier.windSpeedKmh)];
          return (
            <li
              key={tier.altitudeKey}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 px-4 py-2.5 transition-colors hover:bg-white/[0.02] sm:px-5 md:grid-cols-[132px_1fr_150px_64px_76px]"
            >
              <span className="whitespace-nowrap font-mono text-[12px] font-semibold text-slate-200">
                {t[tier.altitudeKey] || `${tier.altitudeMeters} m`}
              </span>

              {/* bar */}
              <div className="relative col-span-2 row-start-2 h-2.5 rounded-full bg-white/[0.04] md:col-span-1 md:row-start-auto">
                <div className="absolute inset-y-0 left-0 rounded-full bg-white/[0.12]" style={{ width: pct(tier.gustSpeedKmh) }} />
                <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${status.bar}`} style={{ width: pct(tier.windSpeedKmh) }} />
                <span className="absolute -inset-y-1 w-px bg-amber-400/50" style={{ left: pct(T.gust.caution) }} />
                <span className="absolute -inset-y-1 w-px bg-rose-400/50" style={{ left: pct(T.gust.critical) }} />
              </div>

              <span className="text-right font-mono text-[12.5px] tabular">
                <span className="text-slate-300">{formatWindSpeed(tier.windSpeedKmh, windUnit, 1)}</span>
                <span className="mx-1 text-slate-600">/</span>
                <span className="font-semibold text-white">{formatWindSpeed(tier.gustSpeedKmh, windUnit, 1)}</span>
                <span className="ml-1 text-[10.5px] text-slate-500">{windUnit}</span>
              </span>

              <span className="hidden text-right font-mono text-[12.5px] text-slate-400 tabular md:block">{tier.temperature}°</span>

              <span className="hidden text-center md:block">
                <span className={`pill ${status.pill}`}>{t[status.key]}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default WindProfile;
