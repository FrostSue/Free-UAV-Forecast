import { getLocale, format } from '../utils/locales';
import { formatWindSpeed, convertWindSpeed } from '../utils/units';
import { SAFETY_THRESHOLDS as T } from '../utils/flightSafety';

const VERDICT = {
  good: { bg: 'bg-go', key: 'verdictGo', descKey: 'statusDescGood' },
  caution: { bg: 'bg-caution', key: 'verdictCaution', descKey: 'statusDescCaution' },
  bad: { bg: 'bg-nogo', key: 'verdictNoGo', descKey: 'statusDescBad' }
};

const LEVEL = {
  ok: { cls: 'status-good', key: 'statusOk' },
  caution: { cls: 'status-caution', key: 'statusCaution' },
  critical: { cls: 'status-bad', key: 'statusCritical' }
};

const CHECK_LABEL = {
  wind: 'checkWind',
  gusts: 'checkGusts',
  precip: 'checkPrecip',
  visibility: 'checkVisibility',
  kp: 'checkKp',
  temp: 'checkTemp',
  gnss: 'checkGnss'
};

const FlightStatus = ({ data, language, windUnit = 'km/h' }) => {
  const t = getLocale(language);
  if (!data) return null;

  const safety = data.flightSafety || { status: 'bad', reasons: [], checks: [] };
  const verdict = VERDICT[safety.status] || VERDICT.bad;
  const checks = safety.checks || [];
  const okCount = checks.filter(c => c.level === 'ok').length;
  const wd = windUnit === 'km/h' || windUnit === 'mph' ? 0 : 1;
  const w = (v) => convertWindSpeed(v, windUnit, wd);
  const isTr = language === 'tr';

  const row = (id) => {
    switch (id) {
      case 'wind': return [`${formatWindSpeed(data.windSpeedKmh, windUnit, 1)} ${windUnit}`, `${w(T.wind.caution)} / ${w(T.wind.critical)} ${windUnit}`];
      case 'gusts': return [`${formatWindSpeed(data.windGustsKmh, windUnit, 1)} ${windUnit}`, `${w(T.gust.caution)} / ${w(T.gust.critical)} ${windUnit}`];
      case 'precip': return [`${data.precipProb}%`, `${T.precip.caution} / ${T.precip.critical} %`];
      case 'visibility': return isTr
        ? [`${data.visibilityKm} km`, `< ${T.visibilityKm.caution} / < ${T.visibilityKm.critical} km`]
        : [`${data.visibilityMiles} mi`, '< 3.1 / < 1.9 mi'];
      case 'kp': return [Number(data.kpIndex).toFixed(1), `${T.kp.caution} / ${T.kp.critical}`];
      case 'temp': return [`${Number(data.temperature).toFixed(1)} °C`, `${T.temp.cautionLow}…${T.temp.cautionHigh} / ${T.temp.criticalLow}…${T.temp.criticalHigh} °C`];
      case 'gnss': return [`${data.satsLocked}`, `< ${T.sats.caution} (${t.advisoryOnly})`];
      default: return ['', ''];
    }
  };

  return (
    <section>
      <div className="section-title">
        <span className="num">01</span>
        <h2>{t.sectionDecision}</h2>
      </div>

      <div className="grid border-b border-ink md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Verdict */}
        <div className={`${verdict.bg} flex flex-col justify-between gap-6 p-5 text-paper sm:p-7`}>
          <div>
            <div className="font-cond text-[12px] font-semibold uppercase tracking-[0.12em] opacity-80">
              {t.flightReadiness}
            </div>
            <div className="mt-1 font-cond text-[64px] font-bold uppercase leading-[0.95] tracking-[-0.01em] sm:text-[84px]">
              {t[verdict.key]}
            </div>
          </div>
          <div>
            <p className="max-w-sm text-[15px] leading-snug">{t[verdict.descKey]}</p>
            <p className="mt-3 font-mono text-[12.5px] opacity-85">{format(t.criteriaMet, { ok: okCount, n: checks.length })}</p>
          </div>
        </div>

        {/* Criteria table */}
        <div className="thin-scrollbar overflow-x-auto">
          <table className="ruled-table w-full text-[14px]">
            <thead>
              <tr>
                <th>{t.colCriterion}</th>
                <th className="text-right">{t.colValue}</th>
                <th className="hidden text-right lg:table-cell">{t.colLimit}</th>
                <th>{t.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {checks.map(check => {
                const [value, limit] = row(check.id);
                const lvl = LEVEL[check.level] || LEVEL.critical;
                return (
                  <tr key={check.id} className={check.level !== 'ok' ? 'bg-paper-deep/60' : ''}>
                    <td className="font-medium">{t[CHECK_LABEL[check.id]]}</td>
                    <td className="text-right font-mono tabular">{value}</td>
                    <td className="hidden text-right font-mono text-[12.5px] text-ink-faint tabular lg:table-cell">{limit}</td>
                    <td><span className={`status ${lvl.cls}`}>{t[lvl.key]}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default FlightStatus;
