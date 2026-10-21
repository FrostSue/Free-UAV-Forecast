/**
 * Meteorological and Flight Safety Physics Models for UAV / Drone Flight Planning.
 */

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

  const baseAlt = refAlt2;
  const baseV = v2;
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

  return altitudes.map(tier => {
    let speed = 0;
    if (tier.exactV !== undefined) {
      speed = tier.exactV;
    } else if (tier.vRef) {
      speed = calculateWindAtAltitude(tier.alt, tier.vRef[0], tier.vRef[1], tier.vRef[2], tier.vRef[3]);
    } else if (tier.vExtrap) {
      speed = calculateWindAtAltitude(tier.alt, tier.vExtrap[0], tier.vExtrap[1], tier.vExtrap[2], tier.vExtrap[3]);
    }

    const groundGustDelta = Math.max(0, g10 - w10);
    const gustDamping = Math.max(0.6, 1.0 - (tier.alt / 1000.0) * 0.4);
    const gustSpeed = Math.max(speed * 1.15, speed + groundGustDelta * gustDamping);

    return {
      altitudeKey: tier.key,
      altitudeMeters: tier.alt,
      windSpeed: speed.toFixed(1),
      gustSpeed: gustSpeed.toFixed(1),
      temperature: tier.t.toFixed(1)
    };
  });
};

/**
 * Evaluates comprehensive flight condition across meteorological and telemetry safety parameters.
 * Note: Satellite count is informational/advisory and does NOT block flights by itself.
 */
export const evaluateFlightSafety = (metrics = {}) => {
  const gusts = parseFloat(metrics.windGusts || 0);
  const windSpeed = parseFloat(metrics.windSpeed || 0);
  const precipProb = parseFloat(metrics.precipProb || 0);
  const visibilityKm = parseFloat(metrics.visibilityKm || 10);
  const kpIndex = parseFloat(metrics.kpIndex || 0);
  const temp = parseFloat(metrics.temperature || 20);
  const satsLocked = parseInt(metrics.satsLocked || 18, 10);

  const criticalIssues = [];
  const cautionIssues = [];

  // 1. Wind Gusts (Real physical risk to drone attitude & stabilization)
  if (gusts >= 35) {
    criticalIssues.push('windGustHigh');
  } else if (gusts >= 25) {
    cautionIssues.push('windGustModerate');
  }

  // 2. Sustained Wind
  if (windSpeed >= 28) {
    criticalIssues.push('windSpeedHigh');
  } else if (windSpeed >= 20) {
    cautionIssues.push('windSpeedModerate');
  }

  // 3. Precipitation Probability
  if (precipProb >= 40) {
    criticalIssues.push('precipHigh');
  } else if (precipProb >= 20) {
    cautionIssues.push('precipModerate');
  }

  // 4. Visibility (VLOS regulations)
  if (visibilityKm < 3.0) {
    criticalIssues.push('visibilityLow');
  } else if (visibilityKm < 5.0) {
    cautionIssues.push('visibilityModerate');
  }

  // 5. Space Weather (Severe Geomagnetic Storm)
  if (kpIndex >= 5.0) {
    criticalIssues.push('kpStorm');
  } else if (kpIndex >= 3.8) {
    cautionIssues.push('kpActive');
  }

  // 6. LiPo Battery Temperature Safe Zone
  if (temp < -2 || temp > 42) {
    criticalIssues.push('tempExtreme');
  } else if (temp < 5 || temp > 36) {
    cautionIssues.push('tempSuboptimal');
  }

  // 7. GPS Satellites: Advisory only! Does NOT create a critical blocker, only a soft advisory tag
  if (satsLocked < 10) {
    cautionIssues.push('satsCheck');
  }

  if (criticalIssues.length > 0) {
    return {
      status: 'bad',
      reasons: criticalIssues
    };
  }

  if (cautionIssues.length > 0) {
    return {
      status: 'caution',
      reasons: cautionIssues
    };
  }

  return {
    status: 'good',
    reasons: []
  };
};
