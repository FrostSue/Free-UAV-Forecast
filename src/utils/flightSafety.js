/**
 * Meteorological and Flight Safety Physics Models for UAV / Drone Flight Planning.
 */

/**
 * Parses a numeric value, falling back only when the value is missing or not a number.
 * (Unlike `value || fallback`, a legitimate 0 — e.g. 0 °C or 0 % rain — is preserved.)
 */
export const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Canonical safety thresholds. Wind values are in km/h (Open-Meteo default).
 */
export const SAFETY_THRESHOLDS = {
  gust: { caution: 25, critical: 35 },
  wind: { caution: 20, critical: 28 },
  precip: { caution: 20, critical: 40 },
  visibilityKm: { caution: 5, critical: 3 },
  kp: { caution: 3.8, critical: 5 },
  temp: { cautionLow: 5, cautionHigh: 36, criticalLow: -2, criticalHigh: 42 },
  sats: { caution: 10 }
};

/**
 * Calculates wind speed at altitude using the Atmospheric Boundary Layer Power Law:
 * v(z) = v_ref * (z / z_ref)^alpha
 */
export const calculateWindAtAltitude = (targetAlt, refAlt1, refAlt2, v1, v2) => {
  if (v1 <= 0.1 && v2 <= 0.1) return 0;

  let alpha = 0.143; // Standard Hellmann exponent for open terrain
  if (v1 > 0.1 && v2 > 0.1 && refAlt1 !== refAlt2) {
    const rawAlpha = Math.log(v2 / v1) / Math.log(refAlt2 / refAlt1);
    alpha = Math.max(-0.05, Math.min(0.40, rawAlpha));
  }

  // Anchor on the reference level that actually has wind data.
  const baseAlt = v2 > 0.1 ? refAlt2 : refAlt1;
  const baseV = v2 > 0.1 ? v2 : v1;
  const estimatedV = baseV * Math.pow(targetAlt / baseAlt, alpha);
  return Math.max(0, estimatedV);
};

/**
 * Generates an aerodynamically realistic vertical wind profile.
 */
export const buildWindProfile = (w10, w80, w120, w180, g10, t2, t80, t120, t180) => {
  const lerp = (x, x0, x1, y0, y1) => y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);

  const lapseRatePerM = (t180 - t120) / 60.0;
  const clampedLapse = Math.max(-0.01, Math.min(0.005, lapseRatePerM));

  const altitudes = [
    { key: 'alt20m', alt: 20, vRef: [10, 80, w10, w80], t: lerp(20, 2, 80, t2, t80) },
    { key: 'alt40m', alt: 40, vRef: [10, 80, w10, w80], t: lerp(40, 2, 80, t2, t80) },
    { key: 'alt60m', alt: 60, vRef: [10, 80, w10, w80], t: lerp(60, 2, 80, t2, t80) },
    { key: 'alt80m', alt: 80, exactV: w80, t: t80 },
    { key: 'alt120m', alt: 120, exactV: w120, t: t120 },
    { key: 'alt150m', alt: 150, vRef: [120, 180, w120, w180], t: lerp(150, 120, 180, t120, t180) },
    { key: 'alt180m', alt: 180, exactV: w180, t: t180 },
    { key: 'alt250m', alt: 250, vExtrap: [120, 180, w120, w180], t: t180 + clampedLapse * (250 - 180) },
    { key: 'alt300m', alt: 300, vExtrap: [120, 180, w120, w180], t: t180 + clampedLapse * (300 - 180) },
    { key: 'alt400m', alt: 400, vExtrap: [120, 180, w120, w180], t: t180 + clampedLapse * (400 - 180) },
  ];

  const groundGustDelta = Math.max(0, g10 - w10);

  return altitudes.map(tier => {
    let speed = 0;
    if (tier.exactV !== undefined) {
      speed = tier.exactV;
    } else if (tier.vRef) {
      speed = calculateWindAtAltitude(tier.alt, ...tier.vRef);
    } else if (tier.vExtrap) {
      speed = calculateWindAtAltitude(tier.alt, ...tier.vExtrap);
    }

    const gustDamping = Math.max(0.6, 1.0 - (tier.alt / 1000.0) * 0.4);
    const gustSpeed = Math.max(speed * 1.15, speed + groundGustDelta * gustDamping);

    return {
      altitudeKey: tier.key,
      altitudeMeters: tier.alt,
      windSpeed: speed.toFixed(1),
      windSpeedKmh: parseFloat(speed.toFixed(1)),
      gustSpeed: gustSpeed.toFixed(1),
      gustSpeedKmh: parseFloat(gustSpeed.toFixed(1)),
      temperature: tier.t.toFixed(1)
    };
  });
};

/**
 * Classifies a single wind tier (gust + sustained) into good / caution / bad.
 */
export const classifyWind = (gustKmh, windKmh = 0) => {
  const g = toNumber(gustKmh, 0);
  const w = toNumber(windKmh, 0);
  const { gust, wind } = SAFETY_THRESHOLDS;
  if (g >= gust.critical || w >= wind.critical) return 'bad';
  if (g >= gust.caution || w >= wind.caution) return 'caution';
  return 'good';
};

/**
 * Evaluates comprehensive flight condition across meteorological and telemetry safety parameters.
 * Note: Satellite count is informational/advisory and does NOT block flights by itself.
 *
 * Returns { status, reasons, checks } where `checks` lists every factor with its level
 * ('ok' | 'caution' | 'critical') so the UI can render a full pre-flight checklist.
 */
export const evaluateFlightSafety = (metrics = {}) => {
  const gusts = toNumber(metrics.windGusts, 0);
  const windSpeed = toNumber(metrics.windSpeed, 0);
  const precipProb = toNumber(metrics.precipProb, 0);
  const visibilityKm = toNumber(metrics.visibilityKm, 10);
  const kpIndex = toNumber(metrics.kpIndex, 0);
  const temp = toNumber(metrics.temperature, 20);
  const satsLocked = toNumber(metrics.satsLocked, 18);
  const T = SAFETY_THRESHOLDS;

  const checks = [];
  const add = (id, level, reason) => checks.push({ id, level, reason: level === 'ok' ? null : reason });

  // 1. Wind Gusts (Real physical risk to drone attitude & stabilization)
  if (gusts >= T.gust.critical) add('gusts', 'critical', 'windGustHigh');
  else if (gusts >= T.gust.caution) add('gusts', 'caution', 'windGustModerate');
  else add('gusts', 'ok');

  // 2. Sustained Wind
  if (windSpeed >= T.wind.critical) add('wind', 'critical', 'windSpeedHigh');
  else if (windSpeed >= T.wind.caution) add('wind', 'caution', 'windSpeedModerate');
  else add('wind', 'ok');

  // 3. Precipitation Probability
  if (precipProb >= T.precip.critical) add('precip', 'critical', 'precipHigh');
  else if (precipProb >= T.precip.caution) add('precip', 'caution', 'precipModerate');
  else add('precip', 'ok');

  // 4. Visibility (VLOS regulations)
  if (visibilityKm < T.visibilityKm.critical) add('visibility', 'critical', 'visibilityLow');
  else if (visibilityKm < T.visibilityKm.caution) add('visibility', 'caution', 'visibilityModerate');
  else add('visibility', 'ok');

  // 5. Space Weather (Severe Geomagnetic Storm)
  if (kpIndex >= T.kp.critical) add('kp', 'critical', 'kpStorm');
  else if (kpIndex >= T.kp.caution) add('kp', 'caution', 'kpActive');
  else add('kp', 'ok');

  // 6. LiPo Battery Temperature Safe Zone
  if (temp < T.temp.criticalLow || temp > T.temp.criticalHigh) add('temp', 'critical', 'tempExtreme');
  else if (temp < T.temp.cautionLow || temp > T.temp.cautionHigh) add('temp', 'caution', 'tempSuboptimal');
  else add('temp', 'ok');

  // 7. GPS Satellites: Advisory only! Never a critical blocker.
  if (satsLocked < T.sats.caution) add('gnss', 'caution', 'satsCheck');
  else add('gnss', 'ok');

  const criticalIssues = checks.filter(c => c.level === 'critical').map(c => c.reason);
  const cautionIssues = checks.filter(c => c.level === 'caution').map(c => c.reason);

  if (criticalIssues.length > 0) {
    return { status: 'bad', reasons: criticalIssues, checks };
  }
  if (cautionIssues.length > 0) {
    return { status: 'caution', reasons: cautionIssues, checks };
  }
  return { status: 'good', reasons: [], checks };
};
