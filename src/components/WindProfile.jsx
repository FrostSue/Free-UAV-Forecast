import { getLocale } from '../utils/locales';
import { formatWindSpeed } from '../utils/units';
import { SAFETY_THRESHOLDS as T, classifyWind, toNumber } from '../utils/flightSafety';
import InfoTip from './InfoTip';

const STATUS = {
  good: { cls: 'status-good', key: 'statusOk', bar: 'bg-go' },
  caution: { cls: 'status-caution', key: 'statusCaution', bar: 'bg-caution-bright' },
  bad: { cls: 'status-bad', key: 'statusCritical', bar: 'bg-nogo' }
};

const WindProfile = ({ profileData, language = 'tr', windUnit = 'km/h' }) => {
  const t = getLocale(language);
  if (!Array.isArray(profileData) || profileData.length === 0) return null;

  // Highest altitude on top, like an atmospheric sounding
  const tiers = [...profileData].sort((a, b) => b.altitudeMeters - a.altitudeMeters);
  const maxKmh = Math.max(T.gust.critical + 10, ...tiers.map(r => toNumber(r.gustSpeedKmh, 0))) * 1.05;
  const pct = (v) => `${(toNumber(v, 0) / maxKmh) * 100}%`;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">{t.sectionProfile}</h2>
        <InfoTip title={t.windProfileTooltipTitle} label={t.windProfileTooltipTitle}>
          <p className="mb-2.5">{t.windProfileTooltipDesc}</p>
          <div className="rounded-md border border-rule bg-paper-deep p-2 text-center font-mono text-[12.5px] text-ink">{t.windProfileFormula}</div>
        </InfoTip>
        <span className="ml-auto flex items-center gap-4 text-[12px] text-ink-soft">
          <span className="flex items-center gap-2"><span className="h-2.5 w-5 rounded-sm bg-go" />{t.windSpeedProfile}</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-5 rounded-sm bg-ink/15" />{t.gustSpeedProfile}</span>
        </span>
      </div>
      <p className="px-4 pt-3 text-[13px] text-ink-soft sm:px-5">{t.windProfileSubtitle}</p>

      <div className="mt-3 hidden grid-cols-[150px_1fr_170px_110px_96px] gap-4 border-b border-rule px-5 py-2 md:grid">
        <span className="label">{t.altitudeAgl}</span>
        <span />
        <span className="label text-right">{t.windSpeedProfile} / {t.gustSpeedProfile}</span>
        <span className="label text-right">{t.temperature}</span>
        <span className="label">{t.fly}</span>
      </div>

      <ul className="pb-1">
        {tiers.map(tier => {
          const status = STATUS[classifyWind(tier.gustSpeedKmh, tier.windSpeedKmh)];
          return (
            <li
              key={tier.altitudeKey}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1.5 border-b border-rule px-4 py-2.5 last:border-b-0 sm:px-5 md:grid-cols-[150px_1fr_170px_110px_96px]"
            >
              <span className="whitespace-nowrap font-mono text-[13px] font-medium">
                {t[tier.altitudeKey] || `${tier.altitudeMeters} m`}
              </span>

              <div className="relative col-span-3 row-start-2 h-3 md:col-span-1 md:row-start-auto">
                <div className="absolute inset-y-0 left-0 rounded-sm bg-ink/15" style={{ width: pct(tier.gustSpeedKmh) }} />
                <div className={`absolute inset-y-0 left-0 rounded-sm ${status.bar}`} style={{ width: pct(tier.windSpeedKmh) }} />
                <span className="absolute -inset-y-1 border-l border-dashed border-caution-bright" style={{ left: pct(T.gust.caution) }} />
                <span className="absolute -inset-y-1 border-l border-dashed border-nogo" style={{ left: pct(T.gust.critical) }} />
              </div>

              <span className="text-right font-mono text-[13px] tabular">
                <span className="text-ink-soft">{formatWindSpeed(tier.windSpeedKmh, windUnit, 1)}</span>
                <span className="mx-1 text-ink-faint">/</span>
                <span className="font-semibold">{formatWindSpeed(tier.gustSpeedKmh, windUnit, 1)}</span>
                <span className="ml-1 text-[11px] text-ink-faint">{windUnit}</span>
              </span>

              <span className="hidden text-right font-mono text-[13px] text-ink-soft tabular md:block">{tier.temperature}°</span>

              <span className="hidden md:block">
                <span className={`status ${status.cls}`}>{t[status.key]}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default WindProfile;
