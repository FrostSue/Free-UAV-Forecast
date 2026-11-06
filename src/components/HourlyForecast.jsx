import { useState, useMemo, useRef } from 'react';
import { getLocale, format } from '../utils/locales';
import { convertWindSpeed, formatWindSpeed } from '../utils/units';
import { SAFETY_THRESHOLDS as T, toNumber } from '../utils/flightSafety';
import { describeWeatherCode } from '../utils/weatherCodes';
import Icon from './Icon';

const STATUS = {
  good: { pill: 'pill-good', cell: 'bg-emerald-400/70', key: 'yes' },
  caution: { pill: 'pill-caution', cell: 'bg-amber-400/80', key: 'caution' },
  bad: { pill: 'pill-bad', cell: 'bg-rose-400/80', key: 'no' }
};

const formatDay = (dateStr, localeCode) => {
  // dateStr is "YYYY-MM-DD" at the location; build a UTC date to avoid browser TZ drift.
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(localeCode, {
    weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC'
  });
};

const WindChart = ({ rows, windUnit, t }) => {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const n = rows.length;
  const W = 1000;
  const H = 180;
  const PAD_TOP = 12;

  const maxKmh = Math.max(T.gust.critical + 8, ...rows.map(r => toNumber(r.windGustsKmh, 0))) * 1.08;
  const x = (i) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v) => PAD_TOP + (1 - toNumber(v, 0) / maxKmh) * (H - PAD_TOP);

  const line = (key) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(' ');
  const gustPath = line('windGustsKmh');
  const windPath = line('windSpeedKmh');
  const area = `${gustPath} L${W},${H} L0,${H} Z`;

  const tickEvery = n > 48 ? 12 : n > 24 ? 6 : 3;
  const ticks = rows.map((r, i) => ({ i, r })).filter(({ i }) => i % tickEvery === 0);

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(n - 1, Math.round(px * (n - 1)))));
  };

  const h = hover !== null ? rows[hover] : null;
  const hoverLeftPct = hover !== null ? (x(hover) / W) * 100 : 0;

  return (
    <div className="px-4 pb-2 pt-4 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-brand-300" />{t.chartWind}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-brand-400/25 ring-1 ring-brand-300/40" />{t.chartGust}</span>
        <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-amber-400/70" />{t.thresholdCaution}</span>
        <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-rose-400/70" />{t.thresholdCritical}</span>
      </div>

      <div
        ref={ref}
        className="relative h-44 w-full touch-pan-y select-none"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="gustFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#22d3ee" stopOpacity="0.28" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1="0" x2={W} y1={PAD_TOP + f * (H - PAD_TOP)} y2={PAD_TOP + f * (H - PAD_TOP)} stroke="rgba(148,163,184,0.08)" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" x2={W} y1={y(T.gust.caution)} y2={y(T.gust.caution)} stroke="rgba(251,191,36,0.6)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2={W} y1={y(T.gust.critical)} y2={y(T.gust.critical)} stroke="rgba(251,113,133,0.6)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          <path d={area} fill="url(#gustFill)" />
          <path d={gustPath} fill="none" stroke="rgba(103,232,249,0.55)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
          <path d={windPath} fill="none" stroke="#67e8f9" strokeWidth="2.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="rgba(226,232,240,0.35)" vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        {/* threshold labels */}
        <span className="pointer-events-none absolute right-0 -translate-y-full pb-0.5 font-mono text-[9.5px] text-amber-300/80" style={{ top: `${(y(T.gust.caution) / H) * 100}%` }}>
          {convertWindSpeed(T.gust.caution, windUnit, windUnit === 'km/h' ? 0 : 1)} {windUnit}
        </span>
        <span className="pointer-events-none absolute right-0 -translate-y-full pb-0.5 font-mono text-[9.5px] text-rose-300/80" style={{ top: `${(y(T.gust.critical) / H) * 100}%` }}>
          {convertWindSpeed(T.gust.critical, windUnit, windUnit === 'km/h' ? 0 : 1)} {windUnit}
        </span>

        {h && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-40 rounded-xl border border-white/10 bg-ink-850/95 p-2.5 text-[11px] shadow-xl backdrop-blur"
            style={{
              left: `${hoverLeftPct}%`,
              transform: `translateX(${hoverLeftPct > 70 ? 'calc(-100% - 10px)' : '10px'})`
            }}
          >
            <div className="mb-1 flex items-center justify-between font-mono text-slate-300">
              <span>{h.hour}</span>
              <span className={`pill ${STATUS[h.flightSafety?.status]?.pill || 'pill-bad'}`}>{t[STATUS[h.flightSafety?.status]?.key || 'no']}</span>
            </div>
            <div className="flex justify-between text-slate-400"><span>{t.chartWind}</span><span className="font-mono text-white">{formatWindSpeed(h.windSpeedKmh, windUnit, 1)}</span></div>
            <div className="flex justify-between text-slate-400"><span>{t.chartGust}</span><span className="font-mono text-white">{formatWindSpeed(h.windGustsKmh, windUnit, 1)}</span></div>
            <div className="flex justify-between text-slate-400"><span>{t.precipProb}</span><span className="font-mono text-white">{h.precipProb}%</span></div>
          </div>
        )}
      </div>

      {/* Flyability strip */}
      <div className="mt-2 flex h-2 w-full gap-px overflow-hidden rounded-full">
        {rows.map((r, i) => (
          <span
            key={r.time}
            className={`flex-1 ${STATUS[r.flightSafety?.status]?.cell || 'bg-rose-400/80'} ${hover === i ? 'opacity-100' : 'opacity-80'}`}
          />
        ))}
      </div>

      <div className="relative mt-1.5 h-4 font-mono text-[10px] text-slate-500">
        {ticks.map(({ i, r }) => (
          <span
            key={r.time}
            className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0"
            style={{ left: `${(x(i) / W) * 100}%` }}
          >
            {r.hour}
          </span>
        ))}
      </div>
    </div>
  );
};

const HourlyForecast = ({ hourlyData, language, windUnit = 'km/h' }) => {
  const t = getLocale(language);
  const [days, setDays] = useState(1);
  const localeCode = language === 'tr' ? 'tr-TR' : 'en-US';

  const displayData = useMemo(
    () => (Array.isArray(hourlyData) ? hourlyData.slice(0, days * 24) : []),
    [hourlyData, days]
  );

  if (displayData.length === 0) return null;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(displayData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uav_forecast_${days * 24}h.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="panel overflow-hidden animate-fade-up">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/15">
            <Icon name="chart" className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold text-white sm:text-lg">
              {format(t.hoursForecast, { n: days * 24 })}
            </h3>
            <p className="text-[11.5px] text-slate-500">{t.hourlySubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="segmented" role="group">
            {[1, 2, 3].map(d => (
              <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)}>
                {t[`day${d}`]}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleExport} className="btn" title={t.exportJsonTitle}>
            <Icon name="download" className="h-3.5 w-3.5" />
            {t.exportJson}
          </button>
        </div>
      </div>

      <WindChart rows={displayData} windUnit={windUnit} t={t} />

      <div className="max-h-[26rem] overflow-auto border-t border-white/[0.06] custom-scrollbar">
        <table className="data-table w-full text-[13px]">
          <thead className="sticky top-0 z-[1] bg-ink-900/95 backdrop-blur">
            <tr>
              <th>{t.time}</th>
              <th>{t.condition}</th>
              <th className="text-right">{t.temperature}</th>
              <th className="text-right">{t.precipProb}</th>
              <th className="text-right">{t.windGustCol} <span className="normal-case tracking-normal text-slate-600">({windUnit})</span></th>
              <th className="text-right">{t.cloudCover}</th>
              <th className="text-center">{t.fly}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {displayData.map((row, index) => {
              const status = STATUS[row.flightSafety?.status] || STATUS.bad;
              const wx = describeWeatherCode(row.weatherCode, row.isDay);
              const newDay = index === 0 || row.date !== displayData[index - 1].date;
              return [
                newDay && (
                  <tr key={`d-${row.date}`} className="bg-white/[0.015]">
                    <td colSpan={7} className="!py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-300/80">
                      {formatDay(row.date, localeCode)}
                    </td>
                  </tr>
                ),
                <tr key={row.time} className="transition-colors hover:bg-white/[0.03]">
                  <td className="font-mono font-semibold text-white">
                    {index === 0 ? <span className="text-brand-300">{t.now}</span> : row.hour}
                  </td>
                  <td>
                    <span className="flex items-center gap-2 text-slate-400">
                      <Icon name={wx.icon} className="h-4 w-4 text-slate-300" />
                      <span className="hidden text-[12px] md:inline">{t[wx.key]}</span>
                    </span>
                  </td>
                  <td className="text-right font-mono text-slate-200 tabular">{toNumber(row.temperature, 0).toFixed(1)}°</td>
                  <td className={`text-right font-mono tabular ${row.precipProb >= T.precip.caution ? 'text-amber-300' : 'text-slate-400'}`}>{row.precipProb}%</td>
                  <td className="text-right font-mono tabular">
                    <span className="text-slate-400">{formatWindSpeed(row.windSpeedKmh, windUnit, 1)}</span>
                    <span className="mx-1 text-slate-600">/</span>
                    <span className="font-semibold text-white">{formatWindSpeed(row.windGustsKmh, windUnit, 1)}</span>
                  </td>
                  <td className="text-right font-mono text-slate-500 tabular">{row.cloudCover}%</td>
                  <td className="text-center">
                    <span className={`pill ${status.pill}`}>{t[status.key]}</span>
                  </td>
                </tr>
              ];
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default HourlyForecast;
