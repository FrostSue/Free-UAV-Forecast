import { getLocale } from '../utils/locales';
import { formatWindSpeed } from '../utils/units';
import { SAFETY_THRESHOLDS as T, toNumber } from '../utils/flightSafety';
import { describeWeatherCode } from '../utils/weatherCodes';
import Icon from './Icon';
import InfoTip from './InfoTip';

const DIRS = {
  en: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
  tr: ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB']
};

export const cardinal = (degree, lang = 'en') => {
  const d = ((toNumber(degree, 0) % 360) + 360) % 360;
  const list = DIRS[lang] || DIRS.en;
  return list[Math.round(d / 22.5) % 16];
};

const TONE = {
  normal: { card: '', value: 'text-white', icon: 'text-brand-300 bg-brand-400/10 ring-brand-400/15', bar: 'bg-brand-400' },
  good: { card: '', value: 'text-emerald-300', icon: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/15', bar: 'bg-emerald-400' },
  warning: { card: 'border-amber-400/25', value: 'text-amber-300', icon: 'text-amber-300 bg-amber-400/10 ring-amber-400/20', bar: 'bg-amber-400' },
  critical: { card: 'border-rose-400/30', value: 'text-rose-300', icon: 'text-rose-300 bg-rose-400/10 ring-rose-400/20', bar: 'bg-rose-400' }
};

const Card = ({ icon, title, value, unit, sub, tone = 'normal', tooltip, badge, children, delay = 0 }) => {
  const s = TONE[tone] || TONE.normal;
  return (
    <div
      className={`panel group flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-white/[0.12] animate-fade-up ${s.card}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${s.icon}`}>
          <Icon name={icon} className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-400">{title}</span>
        {tooltip && <InfoTip title={tooltip.title} label={tooltip.title}>{tooltip.desc}</InfoTip>}
        {badge && (
          <span className="hidden rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono sm:inline text-[9.5px] font-semibold tracking-wider text-slate-500">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <span className={`font-display text-[26px] font-semibold leading-none tracking-tight tabular ${s.value}`}>{value}</span>
          {unit && <span className="ml-1 text-xs font-medium text-slate-500">{unit}</span>}
        </div>
        {children}
      </div>

      {sub && <div className="truncate text-[11.5px] text-slate-500">{sub}</div>}
    </div>
  );
};

const Meter = ({ pct, tone = 'normal' }) => (
  <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
    <div className={`h-full rounded-full ${(TONE[tone] || TONE.normal).bar} transition-all duration-700`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
  </div>
);

const Compass = ({ degree }) => {
  // Meteorological direction = where wind comes FROM; arrow shows where it blows TO.
  const rot = (toNumber(degree, 0) + 180) % 360;
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 flex-shrink-0" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="24" y1="4.5" x2="24" y2={i % 3 === 0 ? 8.5 : 6.5}
          stroke={i === 0 ? '#67e8f9' : 'rgba(148,163,184,0.35)'}
          strokeWidth={i % 3 === 0 ? 1.6 : 1}
          transform={`rotate(${i * 30} 24 24)`}
        />
      ))}
      <g transform={`rotate(${rot} 24 24)`} style={{ transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
        <path d="M24 11 L29 27 L24 24 L19 27 Z" fill="#22d3ee" />
        <path d="M24 37 L24 27" stroke="rgba(103,232,249,0.5)" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="24" cy="24" r="2" fill="#04070d" stroke="#67e8f9" strokeWidth="1.2" />
    </svg>
  );
};

const KpScale = ({ kp }) => (
  <div className="flex w-full gap-0.5">
    {Array.from({ length: 9 }).map((_, i) => {
      const lvl = i + 1;
      const active = kp >= lvl - 0.5;
      const color = lvl >= 5 ? 'bg-rose-400' : lvl >= 4 ? 'bg-amber-400' : 'bg-emerald-400';
      return <span key={i} className={`h-1.5 flex-1 rounded-sm ${active ? color : 'bg-white/[0.07]'}`} />;
    })}
  </div>
);

const MetricsGrid = ({ data, language, windUnit = 'km/h' }) => {
  const t = getLocale(language);
  if (!data) return null;

  const kp = toNumber(data.kpIndex, 0);
  const kpTone = kp >= T.kp.critical ? 'critical' : kp >= T.kp.caution ? 'warning' : 'good';

  const locked = toNumber(data.satsLocked, 0);
  const satsTone = locked < T.sats.caution ? 'warning' : 'good';

  const vis = toNumber(data.visibilityKm, 10);
  const visTone = vis < T.visibilityKm.critical ? 'critical' : vis < T.visibilityKm.caution ? 'warning' : 'normal';

  const gusts = toNumber(data.windGustsKmh, 0);
  const gustTone = gusts >= T.gust.critical ? 'critical' : gusts >= T.gust.caution ? 'warning' : 'normal';

  const wind = toNumber(data.windSpeedKmh, 0);
  const windTone = wind >= T.wind.critical ? 'critical' : wind >= T.wind.caution ? 'warning' : 'normal';

  const precip = toNumber(data.precipProb, 0);
  const precipTone = precip >= T.precip.critical ? 'critical' : precip >= T.precip.caution ? 'warning' : 'normal';

  const temp = toNumber(data.temperature, 0);
  const tempTone = temp < T.temp.criticalLow || temp > T.temp.criticalHigh
    ? 'critical'
    : temp < T.temp.cautionLow || temp > T.temp.cautionHigh ? 'warning' : 'normal';

  const wx = describeWeatherCode(data.weatherCode, data.isDay);
  const fmt1 = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(1));

  const cards = [
    {
      icon: wx.icon,
      title: t.weather,
      value: <span className="text-[20px]">{t[wx.key]}</span>,
      sub: `${t.feelsLike} ${fmt1(data.apparentTemperature)}°C · ${t.humidity} ${data.humidity ?? '—'}%`
    },
    {
      icon: 'sunrise',
      title: t.sunTimes,
      value: data.sunrise,
      badge: t.sunriseLabel.toUpperCase(),
      sub: `${t.sunsetLabel}: ${data.sunset}`
    },
    {
      icon: 'thermometer',
      title: t.temperature,
      value: fmt1(temp),
      unit: '°C',
      tone: tempTone,
      sub: `${t.dewPoint}: ${fmt1(data.dewPoint)}°C`,
      tooltip: { title: t.dewPointTooltipTitle, desc: t.dewPointTooltipDesc }
    },
    {
      icon: 'wind',
      title: t.wind,
      value: formatWindSpeed(wind, windUnit, 1),
      unit: windUnit,
      tone: windTone,
      sub: t.groundLevel
    },
    {
      icon: 'gust',
      title: t.gusts,
      value: formatWindSpeed(gusts, windUnit, 1),
      unit: windUnit,
      tone: gustTone,
      sub: t.groundLevel,
      tooltip: { title: t.gustTooltipTitle, desc: t.gustTooltipDesc }
    },
    {
      icon: 'compass',
      title: t.windDir,
      value: cardinal(data.windDirDegree, language),
      unit: `${Math.round(toNumber(data.windDirDegree, 0))}°`,
      sub: `${t.pressure}: ${data.pressure ? Math.round(data.pressure) : '—'} hPa`,
      children: <Compass degree={data.windDirDegree} />
    },
    {
      icon: 'droplet',
      title: t.precipProb,
      value: precip,
      unit: '%',
      tone: precipTone,
      sub: <Meter pct={precip} tone={precipTone} />
    },
    {
      icon: 'cloud',
      title: t.cloudCover,
      value: data.cloudCover,
      unit: '%',
      sub: <Meter pct={data.cloudCover} />
    },
    {
      icon: 'eye',
      title: t.visibility,
      value: language === 'tr' ? data.visibilityKm : data.visibilityMiles,
      unit: t.visibilityUnit,
      tone: visTone,
      tooltip: { title: t.visibilityTooltipTitle, desc: t.visibilityTooltipDesc }
    },
    {
      icon: 'satellite',
      title: t.visibleSats,
      value: data.visibleSats,
      badge: 'GNSS',
      sub: data.satLive ? t.satLive : t.satEstimated,
      tooltip: { title: t.gnssTooltipTitle, desc: t.gnssTooltipDesc }
    },
    {
      icon: 'lock',
      title: t.satsLocked,
      value: data.satsLocked,
      tone: satsTone,
      badge: '>15°',
      sub: data.satLive ? t.satLive : t.satEstimated,
      tooltip: { title: t.gnssLockTooltipTitle, desc: t.gnssLockTooltipDesc }
    },
    {
      icon: 'zap',
      title: t.kpIndex,
      value: kp.toFixed(1),
      tone: kpTone,
      badge: 'NOAA',
      sub: (
        <div className="space-y-1.5">
          <KpScale kp={kp} />
          <div>{data.kpLive ? t.kpLive : t.kpEstimated}</div>
        </div>
      ),
      tooltip: { title: t.kpTooltipTitle, desc: t.kpTooltipDesc }
    }
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((c, i) => (
        <Card key={c.title} {...c} delay={i * 30} />
      ))}
    </section>
  );
};

export default MetricsGrid;
