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
  normal: { card: 'hover:border-brand/40', value: 'text-ink', tile: 'bg-brand/10 text-brand ring-brand/20', bar: 'bg-brand' },
  good: { card: 'hover:border-go/40', value: 'text-go', tile: 'bg-go/10 text-go ring-go/20', bar: 'bg-go' },
  warning: { card: 'border-caution/35', value: 'text-caution', tile: 'bg-caution/10 text-caution ring-caution/25', bar: 'bg-caution-bright' },
  critical: { card: 'border-nogo/40', value: 'text-nogo', tile: 'bg-nogo/10 text-nogo ring-nogo/25', bar: 'bg-nogo' }
};

const Card = ({ icon, title, value, unit, sub, tone = 'normal', tooltip, badge, aside, delay = 0 }) => {
  const s = TONE[tone] || TONE.normal;
  return (
    <div
      className={`panel group flex flex-col gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-fade-up ${s.card}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ring-1 transition-transform duration-200 group-hover:scale-110 ${s.tile}`}>
          <Icon name={icon} className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink-soft">{title}</span>
        {tooltip && <InfoTip title={tooltip.title} label={tooltip.title}>{tooltip.desc}</InfoTip>}
        {badge && (
          <span className="hidden rounded-md border border-rule bg-paper-deep px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-wider text-ink-faint sm:inline">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <span className={`text-[26px] font-semibold leading-none tracking-[-0.02em] tabular ${s.value}`}>{value}</span>
          {unit && <span className="ml-1 text-[12px] font-medium text-ink-faint">{unit}</span>}
        </div>
        {aside}
      </div>

      {sub && <div className="mt-auto text-[12px] text-ink-faint">{sub}</div>}
    </div>
  );
};

const Meter = ({ pct, tone = 'normal' }) => (
  <div className="h-1 w-full overflow-hidden rounded-full bg-paper-deep">
    <div
      className={`h-full rounded-full ${(TONE[tone] || TONE.normal).bar} transition-all duration-700`}
      style={{ width: `${Math.max(0, Math.min(100, toNumber(pct, 0)))}%` }}
    />
  </div>
);

const Compass = ({ degree }) => {
  // Meteorological direction = where wind comes FROM; the arrow shows where it blows TO.
  const rot = (toNumber(degree, 0) + 180) % 360;
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 flex-shrink-0" aria-hidden="true">
      <circle cx="24" cy="24" r="21" className="fill-paper-deep stroke-rule" strokeWidth="1" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="24" y1="4.5" x2="24" y2={i % 3 === 0 ? 8.5 : 6.5}
          className={i === 0 ? 'stroke-brand' : 'stroke-ink-faint'}
          strokeWidth={i % 3 === 0 ? 1.6 : 1}
          transform={`rotate(${i * 30} 24 24)`}
        />
      ))}
      <g transform={`rotate(${rot} 24 24)`} style={{ transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
        <path d="M24 11 L29 27 L24 24 L19 27 Z" className="fill-brand" />
        <path d="M24 37 L24 27" className="stroke-brand/50" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="24" cy="24" r="2" className="fill-surface stroke-brand" strokeWidth="1.2" />
    </svg>
  );
};

const KpScale = ({ kp }) => (
  <div className="mb-1.5 flex w-full gap-0.5">
    {Array.from({ length: 9 }).map((_, i) => {
      const lvl = i + 1;
      const active = kp >= lvl - 0.5;
      const color = lvl >= 5 ? 'bg-nogo' : lvl >= 4 ? 'bg-caution-bright' : 'bg-go';
      return <span key={i} className={`h-1.5 flex-1 rounded-sm ${active ? color : 'bg-paper-deep'}`} />;
    })}
  </div>
);

const MetricsGrid = ({ data, language, windUnit = 'km/h' }) => {
  const t = getLocale(language);
  if (!data) return null;

  const tone = (v, caution, critical, below = false) => {
    if (below) return v < critical ? 'critical' : v < caution ? 'warning' : 'normal';
    return v >= critical ? 'critical' : v >= caution ? 'warning' : 'normal';
  };

  const kp = toNumber(data.kpIndex, 0);
  const locked = toNumber(data.satsLocked, 0);
  const vis = toNumber(data.visibilityKm, 10);
  const gusts = toNumber(data.windGustsKmh, 0);
  const wind = toNumber(data.windSpeedKmh, 0);
  const precip = toNumber(data.precipProb, 0);
  const temp = toNumber(data.temperature, 0);
  const tempTone = temp < T.temp.criticalLow || temp > T.temp.criticalHigh
    ? 'critical'
    : temp < T.temp.cautionLow || temp > T.temp.cautionHigh ? 'warning' : 'normal';
  const kpTone = kp >= T.kp.critical ? 'critical' : kp >= T.kp.caution ? 'warning' : 'good';

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
      tone: tone(wind, T.wind.caution, T.wind.critical),
      sub: t.groundLevel
    },
    {
      icon: 'gust',
      title: t.gusts,
      value: formatWindSpeed(gusts, windUnit, 1),
      unit: windUnit,
      tone: tone(gusts, T.gust.caution, T.gust.critical),
      sub: t.groundLevel,
      tooltip: { title: t.gustTooltipTitle, desc: t.gustTooltipDesc }
    },
    {
      icon: 'compass',
      title: t.windDir,
      value: cardinal(data.windDirDegree, language),
      unit: `${Math.round(toNumber(data.windDirDegree, 0))}°`,
      sub: `${t.pressure}: ${data.pressure ? Math.round(data.pressure) : '—'} hPa`,
      aside: <Compass degree={data.windDirDegree} />
    },
    {
      icon: 'droplet',
      title: t.precipProb,
      value: precip,
      unit: '%',
      tone: tone(precip, T.precip.caution, T.precip.critical),
      sub: <Meter pct={precip} tone={tone(precip, T.precip.caution, T.precip.critical)} />
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
      tone: tone(vis, T.visibilityKm.caution, T.visibilityKm.critical, true),
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
      tone: locked < T.sats.caution ? 'warning' : 'good',
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
        <>
          <KpScale kp={kp} />
          {data.kpLive ? t.kpLive : t.kpEstimated}
        </>
      ),
      tooltip: { title: t.kpTooltipTitle, desc: t.kpTooltipDesc }
    }
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((c, i) => (
        <Card key={c.title} {...c} delay={120 + i * 35} />
      ))}
    </section>
  );
};

export default MetricsGrid;
