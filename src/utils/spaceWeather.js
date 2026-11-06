// Space Weather & Multi-GNSS Orbital Mechanics Service for UAV Operations

/**
 * Timeout wrapper for network requests to prevent UI hanging.
 */
export const fetchWithTimeout = async (url, options = {}, timeoutMs = 2500) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const geoLang = (lang) => (lang === 'en' ? 'en' : 'tr');

/**
 * Extracts the most recent Kp value from a NOAA SWPC planetary K-index payload.
 * Supports both the current object format ([{ time_tag, Kp, ... }]) and the
 * legacy array-of-arrays format ([["time_tag","Kp",...], ["2024-..","2.33",...]]).
 * Returns { kp, timeTag } or null.
 */
export const parseKpResponse = (data) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    let kp = NaN;
    let timeTag = null;

    if (Array.isArray(row)) {
      kp = parseFloat(row[1]);
      timeTag = row[0] ?? null;
    } else if (row && typeof row === 'object') {
      kp = parseFloat(row.Kp ?? row.kp ?? row.kp_index);
      timeTag = row.time_tag ?? null;
    }

    if (Number.isFinite(kp)) return { kp, timeTag };
  }
  return null;
};

/**
 * Fetches the real-time Planetary K-Index from NOAA SWPC with fast timeout.
 * `live` is false when the value is a climatological estimate (API unreachable).
 */
export const fetchLiveKpIndex = async () => {
  try {
    const res = await fetchWithTimeout('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', {}, 3000);
    if (res.ok) {
      const parsed = parseKpResponse(await res.json());
      if (parsed) return { ...parsed, live: true, source: 'NOAA SWPC' };
    }
  } catch {
    // Graceful fast fallback
  }
  return { kp: 1.8, timeTag: null, live: false, source: 'NOAA SWPC' };
};

/**
 * Greenwich Mean Sidereal Time in radians for a given Date.
 */
export const gmstRadians = (date) => {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0;
  const deg = (280.46061837 + 360.98564736629 * d) % 360;
  return ((deg < 0 ? deg + 360 : deg) * Math.PI) / 180;
};

/**
 * CelesTrak OMM epochs are UTC but carry no zone designator; parse them as UTC.
 */
export const parseUtcEpoch = (epoch) => {
  if (!epoch) return new Date(NaN);
  const hasZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(epoch);
  return new Date(hasZone ? epoch : `${epoch}Z`);
};

const ELEVATION_MASK_DEG = 15;

/**
 * Computes the elevation (degrees) of each satellite above the observer's horizon
 * using two-body Keplerian propagation from OMM mean elements.
 */
export const computeSatelliteElevations = (satellites, lat, lon, now = new Date()) => {
  const Re = 6378.137;
  const mu = 398600.4418;
  const phi = (lat * Math.PI) / 180.0;
  const lambda = (lon * Math.PI) / 180.0;

  // Observer position & local "up" vector in Earth-fixed (ECEF) frame
  const upX = Math.cos(phi) * Math.cos(lambda);
  const upY = Math.cos(phi) * Math.sin(lambda);
  const upZ = Math.sin(phi);
  const uX = Re * upX;
  const uY = Re * upY;
  const uZ = Re * upZ;

  const theta = gmstRadians(now);
  const elevations = [];

  for (const sat of satellites) {
    if (!sat || !sat.EPOCH || !sat.MEAN_MOTION) continue;

    const epoch = parseUtcEpoch(sat.EPOCH);
    if (Number.isNaN(epoch.getTime())) continue;
    const dtSec = (now.getTime() - epoch.getTime()) / 1000.0;

    const n = (sat.MEAN_MOTION * 2 * Math.PI) / 86400.0;
    const a = Math.cbrt(mu / (n * n));
    const M = ((sat.MEAN_ANOMALY * Math.PI) / 180.0 + n * dtSec) % (2 * Math.PI);
    const e = Number.isFinite(sat.ECCENTRICITY) ? sat.ECCENTRICITY : 0.01;

    let E = M;
    for (let iter = 0; iter < 6; iter++) {
      E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }

    const nu = 2.0 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2.0), Math.sqrt(1 - e) * Math.cos(E / 2.0));
    const r = a * (1.0 - e * Math.cos(E));

    const inc = (sat.INCLINATION * Math.PI) / 180.0;
    // Inertial RAAN rotated into the Earth-fixed frame by the current sidereal angle
    const raan = (sat.RA_OF_ASC_NODE * Math.PI) / 180.0 - theta;
    const argP = (sat.ARG_OF_PERICENTER * Math.PI) / 180.0;

    const u = argP + nu;
    const xNode = r * Math.cos(u);
    const yNode = r * Math.sin(u);

    const sX = xNode * Math.cos(raan) - yNode * Math.cos(inc) * Math.sin(raan);
    const sY = xNode * Math.sin(raan) + yNode * Math.cos(inc) * Math.cos(raan);
    const sZ = yNode * Math.sin(inc);

    const dx = sX - uX;
    const dy = sY - uY;
    const dz = sZ - uZ;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const dot = (dx * upX + dy * upY + dz * upZ) / dist;
    elevations.push(Math.asin(Math.max(-1.0, Math.min(1.0, dot))) * (180.0 / Math.PI));
  }

  return elevations;
};

// In-memory & session cache for Keplerian elements
let cachedSatellites = null;
let lastSatFetchTime = 0;
const SAT_CACHE_MS = 2 * 60 * 60 * 1000;

/**
 * Calculates visible and locked Multi-GNSS satellites (GPS, GLONASS, Galileo, BeiDou)
 * using orbital Keplerian mechanics on live GPS ephemeris, scaled by a constellation factor.
 */
export const fetchGnssSatellites = async (lat, lon) => {
  const now = new Date();

  if (!cachedSatellites) {
    try {
      const stored = sessionStorage.getItem('uav_gnss_elements');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.time && now.getTime() - parsed.time < SAT_CACHE_MS) {
          cachedSatellites = parsed.data;
          lastSatFetchTime = parsed.time;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  if (!cachedSatellites || now.getTime() - lastSatFetchTime > SAT_CACHE_MS) {
    try {
      const res = await fetchWithTimeout('https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=json', {}, 3000);
      if (res.ok) {
        const sats = await res.json();
        if (Array.isArray(sats) && sats.length > 0) {
          cachedSatellites = sats;
          lastSatFetchTime = now.getTime();
          try {
            sessionStorage.setItem('uav_gnss_elements', JSON.stringify({ time: now.getTime(), data: sats }));
          } catch {
            // Storage full / unavailable
          }
        }
      }
    } catch {
      // Background fallback
    }
  }

  let gpsVisible;
  let gpsLocked;
  let live = false;

  const elevations = cachedSatellites && cachedSatellites.length > 0
    ? computeSatelliteElevations(cachedSatellites, lat, lon, now)
    : [];

  if (elevations.length > 0) {
    gpsVisible = elevations.filter(el => el > 0).length;
    gpsLocked = elevations.filter(el => el > ELEVATION_MASK_DEG).length;
    live = true;
  } else {
    // Geometric baseline for the 55° inclination GPS constellation
    const phi = (lat * Math.PI) / 180.0;
    gpsVisible = Math.round(10 + 2 * Math.cos(phi));
    gpsLocked = gpsVisible - 2;
  }

  // Multi-GNSS Constellation Factor (GPS + GLONASS + Galileo + BeiDou)
  const multiFactor = 2.3;
  return {
    gpsVisible,
    gpsLocked,
    visibleSats: Math.min(48, Math.round(gpsVisible * multiFactor)),
    lockedSats: Math.min(40, Math.round(gpsLocked * multiFactor)),
    live,
    source: 'CelesTrak'
  };
};

/**
 * Reverse geocodes coordinates to city/region name with fast timeout.
 */
export const reverseGeocode = async (lat, lon, lang = 'tr') => {
  const language = geoLang(lang);
  try {
    const res = await fetchWithTimeout(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${language}`,
      {},
      2500
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      if (city) return city;
    }
  } catch {
    // try next provider
  }

  try {
    const res = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&accept-language=${language}`,
      {},
      2500
    );
    if (res.ok) {
      const geoData = await res.json();
      const addr = geoData?.address;
      const name = addr?.city || addr?.town || addr?.village || addr?.county || geoData?.name;
      if (name) return name;
    }
  } catch {
    // fall through to coordinates
  }

  return `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`;
};

/**
 * Robust Client Geolocation: Uses Browser GPS with fast timeout,
 * and automatically falls back to IP-based Geolocation on desktop.
 */
export const getBestUserLocation = async () => {
  try {
    return await new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        reject(new Error('Geolocation unsupported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'gps' }),
        reject,
        { timeout: 4000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    });
  } catch {
    try {
      const res = await fetchWithTimeout('https://api.bigdatacloud.net/data/reverse-geocode-client', {}, 2500);
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data?.latitude);
        const lon = parseFloat(data?.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          return {
            lat,
            lon,
            cityName: data.city || data.locality || data.principalSubdivision || null,
            source: 'ip'
          };
        }
      }
    } catch {
      // fall through to default
    }
  }

  return { lat: 41.0082, lon: 28.9784, cityName: 'İstanbul', source: 'default' };
};

/**
 * Searches locations using Open-Meteo Geocoding API.
 * Throws on network failure so the UI can distinguish "no results" from "error".
 */
export const searchCity = async (query, lang = 'tr') => {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = query.trim();

  const res = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=6&language=${geoLang(lang)}&format=json`,
    {},
    4000
  );
  if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.results?.length) return [];

  return data.results.map(r => ({
    id: r.id ?? `${r.latitude},${r.longitude}`,
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(', '),
    label: r.admin1 && r.admin1 !== r.name ? `${r.name}, ${r.admin1}` : r.name,
    countryCode: r.country_code || '',
    lat: r.latitude,
    lon: r.longitude
  }));
};
