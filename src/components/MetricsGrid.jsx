import { getLocale } from '../utils/locales';
import { formatWindSpeed } from '../utils/units';
import { SAFETY_THRESHOLDS as T, toNumber } from '../utils/flightSafety';
import { describeWeatherCode } from '../utils/weatherCodes';
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

const TONE_TEXT = { normal: 'text-ink', warning: 'text-caution', critical: 'text-nogo' };
const TONE_TAG = { warning: ['status-caution', 'statusCaution'], critical: ['status-bad', 'statusCritical'] };

const Cell = ({ title, value, unit, sub, tone = 'normal', tooltip, aside, t }) => (
  <div className="flex min-h-[128px] flex-col bg-surface p-4">
    <div className="flex items-center gap-1.5">
      <span className="label min-w-0 flex-1 truncate">{title}</span>
      {tooltip && <InfoTip title={tooltip.title} label={tooltip.title}>{tooltip.desc}</InfoTip>}
    </div>

    <div className="mt-3 flex items-end justify-between gap-2">
      <div className="min-w-0">
        <span className={`font-mono text-[30px] font-medium leading-none tracking-[-0.03em] tabular ${TONE_TEXT[tone]}`}>{value}</span>
        {unit && <span className="ml-1 font-mono text-[13px] text-ink-faint">{unit}</span>}
      </div>
      {aside}
    </div>

    <div className="mt-auto pt-3 text-[12.5px] leading-snug text-ink-soft">
      {TONE_TAG[tone] && <span className={`status ${TONE_TAG[tone][0]} mr-2`}>{t[TONE_TAG[tone][1]]}</span>}
      {sub}
    </div>
  </div>
);

const Bar = ({ pct, tone = 'normal' }) => (
  <div className="mb-1.5 h-1 w-full overflow-hidden rounded-full bg-paper-deep">
    <div
      className={`h-full ${tone === 'critical' ? 'bg-nogo' : tone === 'warning' ? 'bg-caution-bright' : 'bg-ink'}`}
      style={{ width: `${Math.max(0, Math.min(100, toNumber(pct, 0)))}%` }}
    />
  </div>
);

const Compass = ({ degree }) => {
  // Meteorological direction = where wind comes FROM; the arrow shows where it blows TO.
  const rot = (toNumber(degree, 0) + 180) % 360;
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 flex-shrink-0" aria-hidden="true">
      <circle cx="24" cy="24" r="21" className="fill-paper-deep stroke-line-strong" strokeWidth="1" />
      {Array.from({ length: 36 }).map((_, i) => (
        <line
          key={i}
          x1="24" y1="3" x2="24" y2={i % 9 === 0 ? 8 : 5}
          className={i % 9 === 0 ? 'stroke-ink' : 'stroke-ink-faint'}
          strokeWidth={i % 9 === 0 ? 1.4 : 0.6}
          transform={`rotate(${i * 10} 24 24)`}
        />
      ))}
      <text x="24" y="15" textAnchor="middle" fontSize="6" fontFamily="IBM Plex Mono, monospace" className="fill-ink">N</text>
      <g transform={`rotate(${rot} 24 24)`} style={{ transition: 'transform 0.6s ease-out' }}>
        <line x1="24" y1="34" x2="24" y2="16" className="stroke-signal" strokeWidth="2" />
        <path d="M24 13 L27.5 20 L20.5 20 Z" className="fill-signal" />
      </g>
    </svg>
  );
};

const KpScale = ({ kp }) => (
  <div className="mb-1.5 flex w-full gap-[3px]">
    {Array.from({ length: 9 }).map((_, i) => {
      const lvl = i + 1;
      const active = kp >= lvl - 0.5;
      const color = lvl >= 5 ? 'bg-nogo' : lvl >= 4 ? 'bg-caution-bright' : 'bg-ink';
      return <span key={i} className={`h-2 flex-1 rounded-[2px] ${active ? color : 'bg-paper-deep'}`} />;
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

  const wx = describeWeatherCode(data.weatherCode, data.isDay);
  const fmt1 = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(1));

  const cells = [
    {
      title: t.weather,
      value: <span className="font-cond text-[26px] font-semibold tracking-normal">{t[wx.key]}</span>,
      sub: `${t.feelsLike} ${fmt1(data.apparentTemperature)} °C · ${t.humidity} ${data.humidity ?? '—'}%`
    },
    {
      title: t.temperature,
      value: fmt1(temp),
      unit: '°C',
      tone: tempTone,
      sub: `${t.dewPoint} ${fmt1(data.dewPoint)} °C`,
      tooltip: { title: t.dewPointTooltipTitle, desc: t.dewPointTooltipDesc }
    },
    {
      title: t.wind,
      value: formatWindSpeed(wind, windUnit, 1),
      unit: windUnit,
      tone: tone(wind, T.wind.caution, T.wind.critical),
      sub: t.groundLevel
    },
    {
      title: t.gusts,
      value: formatWindSpeed(gusts, windUnit, 1),
      unit: windUnit,
      tone: tone(gusts, T.gust.caution, T.gust.critical),
      sub: t.groundLevel,
      tooltip: { title: t.gustTooltipTitle, desc: t.gustTooltipDesc }
    },
    {
      title: t.windDir,
      value: cardinal(data.windDirDegree, language),
      unit: `${String(Math.round(toNumber(data.windDirDegree, 0))).padStart(3, '0')}°`,
      sub: `${t.pressure} ${data.pressure ? Math.round(data.pressure) : '—'} hPa`,
      aside: <Compass degree={data.windDirDegree} />
    },
    {
      title: t.precipProb,
      value: precip,
      unit: '%',
      tone: tone(precip, T.precip.caution, T.precip.critical),
      sub: <Bar pct={precip} tone={tone(precip, T.precip.caution, T.precip.critical)} />
    },
    {
      title: t.cloudCover,
      value: data.cloudCover,
      unit: '%',
      sub: <Bar pct={data.cloudCover} />
    },
    {
      title: t.visibility,
      value: language === 'tr' ? data.visibilityKm : data.visibilityMiles,
      unit: t.visibilityUnit,
      tone: tone(vis, T.visibilityKm.caution, T.visibilityKm.critical, true),
      tooltip: { title: t.visibilityTooltipTitle, desc: t.visibilityTooltipDesc }
    },
    {
      title: t.sunTimes,
      value: data.sunrise,
      unit: t.sunriseLabel.toLowerCase(),
      sub: `${t.sunsetLabel} ${data.sunset}`
    },
    {
      title: t.visibleSats,
      value: data.visibleSats,
      sub: data.satLive ? t.satLive : t.satEstimated,
      tooltip: { title: t.gnssTooltipTitle, desc: t.gnssTooltipDesc }
    },
    {
      title: t.satsLocked,
      value: data.satsLocked,
      tone: locked < T.sats.caution ? 'warning' : 'normal',
      sub: data.satLive ? t.satLive : t.satEstimated,
      tooltip: { title: t.gnssLockTooltipTitle, desc: t.gnssLockTooltipDesc }
    },
    {
      title: t.kpIndex,
      value: kp.toFixed(1),
      tone: tone(kp, T.kp.caution, T.kp.critical),
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
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">{t.sectionConditions}</h2>
        <span className="panel-sub">{t.sectionConditionsSub}</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-3 lg:grid-cols-4">
        {cells.map(c => <Cell key={c.title} {...c} t={t} />)}
      </div>
    </section>
  );
};

export default MetricsGrid;
