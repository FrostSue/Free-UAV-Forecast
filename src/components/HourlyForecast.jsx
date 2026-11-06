import { useState, useMemo, useRef } from 'react';
import { getLocale, format } from '../utils/locales';
import { convertWindSpeed, formatWindSpeed } from '../utils/units';
import { SAFETY_THRESHOLDS as T, toNumber } from '../utils/flightSafety';
import { describeWeatherCode } from '../utils/weatherCodes';
import Icon from './Icon';

const STATUS = {
  good: { cls: 'status-good', cell: 'bg-go', key: 'statusOk' },
  caution: { cls: 'status-caution', cell: 'bg-caution-bright', key: 'statusCaution' },
  bad: { cls: 'status-bad', cell: 'bg-nogo', key: 'statusCritical' }
};

const formatDay = (dateStr, localeCode) => {
  // dateStr is "YYYY-MM-DD" at the location; build a UTC date to avoid browser TZ drift.
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(localeCode, {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC'
  });
};

const WindChart = ({ rows, windUnit, t }) => {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const n = rows.length;
  const W = 1000;
  const H = 200;
  const TOP = 10;

  const maxKmh = Math.max(T.gust.critical + 8, ...rows.map(r => toNumber(r.windGustsKmh, 0))) * 1.08;
  const x = (i) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v) => TOP + (1 - toNumber(v, 0) / maxKmh) * (H - TOP);

  const line = (key) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(' ');
  const gustPath = line('windGustsKmh');
  const windPath = line('windSpeedKmh');
  // Shaded band between mean wind and gust = gust spread
  const band = `${gustPath} ${rows.map((r, i) => `L${x(n - 1 - i).toFixed(1)},${y(rows[n - 1 - i].windSpeedKmh).toFixed(1)}`).join(' ')} Z`;

  const tickEvery = n > 48 ? 12 : n > 24 ? 6 : 3;
  const ticks = rows.map((r, i) => ({ i, r })).filter(({ i }) => i % tickEvery === 0);
  const labelDigits = windUnit === 'km/h' || windUnit === 'mph' ? 0 : 1;

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(n - 1, Math.round(px * (n - 1)))));
  };

  const h = hover !== null ? rows[hover] : null;
  const hoverLeftPct = hover !== null ? (x(hover) / W) * 100 : 0;
  const hs = h ? STATUS[h.flightSafety?.status] || STATUS.bad : null;

  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-ink-soft">
        <span className="flex items-center gap-2"><span className="h-[2px] w-5 bg-ink" />{t.chartWind}</span>
        <span className="flex items-center gap-2"><span className="h-2.5 w-5 bg-ink/10 ring-1 ring-inset ring-ink/40" />{t.chartGust}</span>
        <span className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-caution-bright" />{t.thresholdCaution}</span>
        <span className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-nogo" />{t.thresholdCritical}</span>
      </div>

      <div
        ref={ref}
        className="relative h-48 w-full touch-pan-y select-none border-b border-l border-line-strong sm:h-56"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          {ticks.map(({ i }) => (
            <line key={i} x1={x(i)} x2={x(i)} y1="0" y2={H} className="stroke-rule" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" x2={W} y1={y(T.gust.caution)} y2={y(T.gust.caution)} className="stroke-caution-bright" strokeWidth="1.5" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2={W} y1={y(T.gust.critical)} y2={y(T.gust.critical)} className="stroke-nogo" strokeWidth="1.5" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
          <path d={band} className="fill-ink/10" />
          <path d={gustPath} fill="none" className="stroke-ink/40" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={windPath} fill="none" className="stroke-ink" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} className="stroke-signal" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        <span className="pointer-events-none absolute right-1 -translate-y-full pb-0.5 font-mono text-[10.5px] text-caution" style={{ top: `${(y(T.gust.caution) / H) * 100}%` }}>
          {convertWindSpeed(T.gust.caution, windUnit, labelDigits)} {windUnit}
        </span>
        <span className="pointer-events-none absolute right-1 -translate-y-full pb-0.5 font-mono text-[10.5px] text-nogo" style={{ top: `${(y(T.gust.critical) / H) * 100}%` }}>
          {convertWindSpeed(T.gust.critical, windUnit, labelDigits)} {windUnit}
        </span>

        {h && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-44 rounded-lg border border-rule bg-surface p-2.5 text-[12px] shadow-lg shadow-black/20"
            style={{
              left: `${hoverLeftPct}%`,
              transform: `translateX(${hoverLeftPct > 65 ? 'calc(-100% - 10px)' : '10px'})`
            }}
          >
            <div className="mb-1.5 flex items-center justify-between border-b border-rule pb-1.5">
              <span className="font-mono font-semibold">{h.hour}</span>
              <span className={`status ${hs.cls}`}>{t[hs.key]}</span>
            </div>
            <div className="flex justify-between text-ink-soft"><span>{t.chartWind}</span><span className="font-mono text-ink">{formatWindSpeed(h.windSpeedKmh, windUnit, 1)}</span></div>
            <div className="flex justify-between text-ink-soft"><span>{t.chartGust}</span><span className="font-mono text-ink">{formatWindSpeed(h.windGustsKmh, windUnit, 1)}</span></div>
            <div className="flex justify-between text-ink-soft"><span>{t.precipProb}</span><span className="font-mono text-ink">{h.precipProb}%</span></div>
          </div>
        )}
      </div>

      {/* Flyability strip */}
      <div className="mt-1.5 flex h-2.5 w-full gap-px overflow-hidden rounded-sm">
        {rows.map((r, i) => (
          <span
            key={r.time}
            title={r.hour}
            className={`flex-1 ${(STATUS[r.flightSafety?.status] || STATUS.bad).cell} ${hover === i ? 'opacity-100' : 'opacity-85'}`}
          />
        ))}
      </div>

      <div className="relative mt-1 h-4 font-mono text-[11px] text-ink-faint">
        {ticks.map(({ i, r }, k) => (
          <span
            key={r.time}
            className={`absolute whitespace-nowrap ${k % 2 ? 'hidden sm:block' : ''}`}
            style={{ left: `${(x(i) / W) * 100}%`, transform: i === 0 ? 'none' : 'translateX(-50%)' }}
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
  const localeCode = language === 'tr' ? 'tr-TR' : 'en-GB';

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
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">{t.sectionHourly} <span className="ml-1 font-mono text-[12px] font-normal text-ink-faint">{format(t.hoursForecast, { n: days * 24 })}</span></h2>
          <p className="panel-sub">{t.sectionHourlySub}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="seg" role="group">
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

      <div className="thin-scrollbar max-h-[28rem] overflow-auto border-t border-rule">
        <table className="ruled-table w-full text-[14px]">
          <thead className="sticky top-0 z-[1] bg-surface">
            <tr>
              <th>{t.time}</th>
              <th>{t.condition}</th>
              <th className="text-right"><span className="sm:hidden">°C</span><span className="hidden sm:inline">{t.temperature}</span></th>
              <th className="hidden text-right sm:table-cell">{t.precipProb}</th>
              <th className="text-right">{t.windGustCol} <span className="hidden normal-case tracking-normal sm:inline">({windUnit})</span></th>
              <th className="hidden text-right sm:table-cell">{t.cloudCover}</th>
              <th>{t.fly}</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => {
              const status = STATUS[row.flightSafety?.status] || STATUS.bad;
              const wx = describeWeatherCode(row.weatherCode, row.isDay);
              const newDay = index === 0 || row.date !== displayData[index - 1].date;
              return [
                newDay && (
                  <tr key={`d-${row.date}`}>
                    <td colSpan={7} className="bg-paper-deep !py-1.5 font-cond text-[12.5px] font-semibold uppercase tracking-[0.08em]">
                      {formatDay(row.date, localeCode)}
                    </td>
                  </tr>
                ),
                <tr key={row.time} className="transition-colors hover:bg-paper-deep/70">
                  <td className="font-mono font-medium">
                    {index === 0 ? <span className="text-signal">{t.now}</span> : row.hour}
                  </td>
                  <td>
                    <span className="flex items-center gap-2 text-ink-soft">
                      <Icon name={wx.icon} className="h-4 w-4" strokeWidth={1.6} />
                      <span className="hidden text-[13px] md:inline">{t[wx.key]}</span>
                    </span>
                  </td>
                  <td className="text-right font-mono tabular">{toNumber(row.temperature, 0).toFixed(1)}°</td>
                  <td className={`hidden text-right font-mono tabular sm:table-cell ${row.precipProb >= T.precip.caution ? 'font-semibold text-caution' : ''}`}>{row.precipProb}%</td>
                  <td className="text-right font-mono tabular">
                    <span className="text-ink-soft">{formatWindSpeed(row.windSpeedKmh, windUnit, 1)}</span>
                    <span className="mx-1 text-ink-faint">/</span>
                    <span className={`font-semibold ${row.windGustsKmh >= T.gust.critical ? 'text-nogo' : row.windGustsKmh >= T.gust.caution ? 'text-caution' : ''}`}>
                      {formatWindSpeed(row.windGustsKmh, windUnit, 1)}
                    </span>
                  </td>
                  <td className="hidden text-right font-mono text-ink-soft tabular sm:table-cell">{row.cloudCover}%</td>
                  <td><span className={`status ${status.cls}`}>{t[status.key]}</span></td>
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
