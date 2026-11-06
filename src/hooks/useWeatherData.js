import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchLiveKpIndex, fetchGnssSatellites, reverseGeocode, getBestUserLocation, fetchWithTimeout } from '../utils/spaceWeather.js';
import { buildWindProfile, evaluateFlightSafety, toNumber } from '../utils/flightSafety.js';

const CURRENT_VARS = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'precipitation',
  'weather_code', 'cloud_cover', 'pressure_msl', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m'
].join(',');

const HOURLY_VARS = [
  'temperature_2m', 'dew_point_2m', 'precipitation_probability', 'weather_code', 'cloud_cover',
  'visibility', 'is_day', 'wind_speed_10m', 'wind_speed_80m', 'wind_speed_120m', 'wind_speed_180m',
  'wind_direction_10m', 'wind_gusts_10m', 'temperature_80m', 'temperature_120m', 'temperature_180m'
].join(',');

export const buildForecastUrl = (lat, lon) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
  `&current=${CURRENT_VARS}&hourly=${HOURLY_VARS}&daily=sunrise,sunset` +
  `&timezone=auto&forecast_days=4&wind_speed_unit=kmh`;

/**
 * Open-Meteo returns local wall-clock times ("2026-11-06T06:42") for the location.
 * We display them verbatim so the times are correct for the *location*, not the browser.
 */
const wallClock = (isoString) => (isoString && isoString.length >= 16 ? isoString.slice(11, 16) : '--:--');

/**
 * Finds the hourly index matching the current local hour at the location.
 */
const findNowIndex = (hourlyTimes, currentTime) => {
  const currentLocalHour = currentTime ? currentTime.slice(0, 13) : '';
  let idx = currentLocalHour ? hourlyTimes.findIndex(ts => ts.startsWith(currentLocalHour)) : -1;
  if (idx === -1) {
    const now = Date.now();
    idx = hourlyTimes.findIndex(ts => new Date(ts).getTime() > now) - 1;
  }
  return Math.max(0, idx);
};

export const processForecast = (data, kpResult, satResult) => {
  const current = data.current || {};
  const hourly = data.hourly || {};
  const daily = data.daily || {};
  const times = hourly.time || [];
  const at = (key, i, fallback = null) => {
    const v = hourly[key]?.[i];
    return v === null || v === undefined ? fallback : v;
  };

  const nowIndex = findNowIndex(times, current.time);

  const w10 = toNumber(current.wind_speed_10m, 0);
  const g10 = toNumber(current.wind_gusts_10m, w10);
  const t2 = toNumber(current.temperature_2m, 0);

  const windProfile = buildWindProfile(
    w10,
    toNumber(at('wind_speed_80m', nowIndex), w10),
    toNumber(at('wind_speed_120m', nowIndex), w10),
    toNumber(at('wind_speed_180m', nowIndex), w10),
    g10,
    t2,
    toNumber(at('temperature_80m', nowIndex), t2),
    toNumber(at('temperature_120m', nowIndex), t2),
    toNumber(at('temperature_180m', nowIndex), t2)
  );

  const visMeters = toNumber(at('visibility', nowIndex), 10000);
  const visKm = Number((visMeters / 1000).toFixed(1));
  const precipNow = toNumber(at('precipitation_probability', nowIndex), 0);

  const currentSafety = evaluateFlightSafety({
    windGusts: g10,
    windSpeed: w10,
    precipProb: precipNow,
    visibilityKm: visKm,
    kpIndex: kpResult.kp,
    temperature: t2,
    satsLocked: satResult.lockedSats
  });

  const hourlyForecast = times.slice(nowIndex, nowIndex + 72).map((timeStr, offset) => {
    const i = nowIndex + offset;
    const wind = toNumber(at('wind_speed_10m', i), 0);
    const gust = toNumber(at('wind_gusts_10m', i), wind);
    const temp = toNumber(at('temperature_2m', i), t2);
    const precip = toNumber(at('precipitation_probability', i), 0);
    const hVisKm = Number((toNumber(at('visibility', i), 10000) / 1000).toFixed(1));

    const safety = evaluateFlightSafety({
      windGusts: gust,
      windSpeed: wind,
      precipProb: precip,
      visibilityKm: hVisKm,
      kpIndex: kpResult.kp,
      temperature: temp,
      satsLocked: satResult.lockedSats
    });

    return {
      time: timeStr,
      date: timeStr.slice(0, 10),
      hour: wallClock(timeStr),
      temperature: temp,
      precipProb: precip,
      cloudCover: toNumber(at('cloud_cover', i), 0),
      weatherCode: at('weather_code', i),
      isDay: at('is_day', i, 1) === 1,
      visibilityKm: hVisKm,
      windSpeed: wind,
      windSpeedKmh: wind,
      windGusts: gust,
      windGustsKmh: gust,
      windDirDegree: at('wind_direction_10m', i),
      kpIndex: kpResult.kp,
      flightSafety: safety,
      isGoodToFly: safety.status === 'good'
    };
  });

  return {
    current: {
      time: current.time,
      timezone: data.timezone,
      timezoneAbbr: data.timezone_abbreviation || null,
      utcOffsetSeconds: toNumber(data.utc_offset_seconds, 0),
      weatherCode: current.weather_code,
      isDay: current.is_day === undefined ? true : current.is_day === 1,
      sunrise: wallClock(daily.sunrise?.[0]),
      sunset: wallClock(daily.sunset?.[0]),
      temperature: t2,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      pressure: current.pressure_msl,
      dewPoint: at('dew_point_2m', nowIndex),
      windSpeed: w10,
      windSpeedKmh: w10,
      windGusts: g10,
      windGustsKmh: g10,
      windDirDegree: toNumber(current.wind_direction_10m, 0),
      precipProb: precipNow,
      cloudCover: toNumber(current.cloud_cover, 0),
      visibilityKm: visKm,
      visibilityMiles: Number((visMeters / 1609.344).toFixed(1)),
      visibleSats: satResult.visibleSats,
      satsLocked: satResult.lockedSats,
      satLive: satResult.live,
      kpIndex: kpResult.kp,
      kpLive: kpResult.live,
      kpTimeTag: kpResult.timeTag,
      flightSafety: currentSafety
    },
    hourlyForecast,
    windProfile,
    isGoodToFly: currentSafety.status === 'good'
  };
};

const isValidCoordinate = (lat, lon) =>
  Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

/**
 * Loads weather, space-weather and GNSS data for a location.
 * `error` is a locale key (e.g. 'errorWeatherFetch') so the UI can translate it.
 */
const useWeatherData = (language = 'tr') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const activeRequestId = useRef(0);
  const lastRequest = useRef(null);
  const languageRef = useRef(language);
  languageRef.current = language;

  const fetchWeather = useCallback(async (lat, lon, customName = null) => {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    if (!isValidCoordinate(parsedLat, parsedLon)) {
      setError('invalidCoords');
      setLoading(false);
      return;
    }

    const requestId = ++activeRequestId.current;
    lastRequest.current = { lat: parsedLat, lon: parsedLon, name: customName };
    setLoading(true);
    setError(null);

    try {
      const [weatherRes, kpResult, satResult, resolvedName] = await Promise.all([
        fetchWithTimeout(buildForecastUrl(parsedLat, parsedLon), {}, 12000),
        fetchLiveKpIndex(),
        fetchGnssSatellites(parsedLat, parsedLon),
        customName ? Promise.resolve(customName) : reverseGeocode(parsedLat, parsedLon, languageRef.current)
      ]);

      if (requestId !== activeRequestId.current) return;
      if (!weatherRes.ok) throw Object.assign(new Error('weather'), { code: 'errorWeatherFetch' });

      const data = await weatherRes.json();
      if (!data?.hourly?.time?.length) throw Object.assign(new Error('weather'), { code: 'errorWeatherFetch' });
      if (requestId !== activeRequestId.current) return;

      setWeatherData(processForecast(data, kpResult, satResult));
      setLocationName(resolvedName);
      setCoords({ lat: parsedLat, lon: parsedLon });
      setUpdatedAt(new Date());
      lastRequest.current = { lat: parsedLat, lon: parsedLon, name: resolvedName };
    } catch (err) {
      if (requestId !== activeRequestId.current) return;
      setError(err?.code || (err?.name === 'AbortError' || err instanceof TypeError ? 'errorNetwork' : 'errorWeatherFetch'));
    } finally {
      if (requestId === activeRequestId.current) setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    const loc = await getBestUserLocation();
    await fetchWeather(loc.lat, loc.lon, loc.cityName || null);
  }, [fetchWeather]);

  const refresh = useCallback(() => {
    const last = lastRequest.current;
    if (last) return fetchWeather(last.lat, last.lon, last.name);
    return updateLocation();
  }, [fetchWeather, updateLocation]);

  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  return { loading, error, locationName, coords, weatherData, updatedAt, updateLocation, fetchWeather, refresh };
};

export default useWeatherData;
