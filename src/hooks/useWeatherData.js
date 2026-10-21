import { useState, useEffect, useRef } from 'react';
import { fetchLiveKpIndex, fetchGnssSatellites, reverseGeocode, getBestUserLocation } from '../utils/spaceWeather';
import { buildWindProfile, evaluateFlightSafety } from '../utils/flightSafety';

const useWeatherData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const activeRequestId = useRef(0);

  const formatTimeData = (isoString) => {
    if (!isoString) return "--:--";
    const dateObj = new Date(isoString);
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchWeather = async (lat, lon, customName = null) => {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    if (isNaN(parsedLat) || isNaN(parsedLon) || parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
      setError("Geçersiz koordinat değerleri. Enlem -90/+90, Boylam -180/+180 arasında olmalıdır.");
      setLoading(false);
      return;
    }

    const currentRequestId = ++activeRequestId.current;

    try {
      setLoading(true);
      setError(null);

      // Fast parallel fetch with timeouts
      const weatherPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${parsedLat}&longitude=${parsedLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m&daily=sunrise,sunset&timezone=auto`
      );
      const kpPromise = fetchLiveKpIndex();
      const satPromise = fetchGnssSatellites(parsedLat, parsedLon);
      const geoPromise = customName ? Promise.resolve(customName) : reverseGeocode(parsedLat, parsedLon);

      const [weatherRes, kpResult, satResult, resolvedLocationName] = await Promise.all([
        weatherPromise,
        kpPromise,
        satPromise,
        geoPromise
      ]);

      if (currentRequestId !== activeRequestId.current) return;

      if (!weatherRes.ok) {
        throw new Error('Meteoroloji sunucusundan veri alınamadı.');
      }

      const data = await weatherRes.json();
      const current = data.current;
      const hourly = data.hourly;
      const daily = data.daily;

      // Timezone-accurate matching
      const currentLocalHour = current.time ? current.time.slice(0, 13) : '';
      let nowIndex = hourly.time.findIndex(timeStr => timeStr.startsWith(currentLocalHour));
      if (nowIndex === -1) {
        const currentTimeDate = new Date();
        nowIndex = hourly.time.findIndex(timeStr => new Date(timeStr) > currentTimeDate) - 1;
        if (nowIndex < 0) nowIndex = 0;
      }

      const hourlySlice = hourly.time.slice(nowIndex, nowIndex + 72);

      const w10 = current.wind_speed_10m || 0;
      const w80 = hourly.wind_speed_80m[nowIndex] || 0;
      const w120 = hourly.wind_speed_120m[nowIndex] || 0;
      const w180 = hourly.wind_speed_180m[nowIndex] || 0;

      const t2 = current.temperature_2m || 0;
      const t80 = hourly.temperature_80m[nowIndex] || 0;
      const t120 = hourly.temperature_120m[nowIndex] || 0;
      const t180 = hourly.temperature_180m[nowIndex] || 0;

      const g10 = current.wind_gusts_10m || w10;

      const visMeters = hourly.visibility[nowIndex] || 10000;
      const visKm = (visMeters / 1000).toFixed(1);
      const visMiles = (visMeters / 1609.34).toFixed(1);

      const sunriseTime = daily?.sunrise?.[0] ? formatTimeData(daily.sunrise[0]) : "--:--";
      const sunsetTime = daily?.sunset?.[0] ? formatTimeData(daily.sunset[0]) : "--:--";

      const windProfile = buildWindProfile(w10, w80, w120, w180, g10, t2, t80, t120, t180);

      const currentSafety = evaluateFlightSafety({
        windGusts: g10,
        windSpeed: w10,
        precipProb: hourly.precipitation_probability[nowIndex] || 0,
        visibilityKm: visKm,
        kpIndex: kpResult.kp,
        temperature: t2,
        satsLocked: satResult.lockedSats
      });

      const processedData = {
        current: {
          weatherCode: current.weather_code,
          sunrise: sunriseTime,
          sunset: sunsetTime,
          temperature: current.temperature_2m,
          dewPoint: hourly.dew_point_2m[nowIndex],
          windSpeed: current.wind_speed_10m,
          windGusts: current.wind_gusts_10m,
          windDirDegree: current.wind_direction_10m,
          precipProb: hourly.precipitation_probability[nowIndex] || 0,
          cloudCover: current.cloud_cover,
          visibilityKm: visKm,
          visibilityMiles: visMiles,
          visibleSats: satResult.visibleSats,
          satsLocked: satResult.lockedSats,
          satSource: satResult.source,
          kpIndex: kpResult.kp,
          kpSource: kpResult.source,
          flightSafety: currentSafety
        },
        hourlyForecast: hourlySlice.map((timeStr, index) => {
          const i = nowIndex + index;
          const hSafety = evaluateFlightSafety({
            windGusts: hourly.wind_gusts_10m[i] || 0,
            windSpeed: hourly.wind_speed_10m[i] || 0,
            precipProb: hourly.precipitation_probability[i] || 0,
            visibilityKm: (hourly.visibility[i] || 10000) / 1000,
            kpIndex: kpResult.kp,
            temperature: hourly.temperature_2m[i] || 20,
            satsLocked: satResult.lockedSats
          });

          return {
            time: timeStr,
            temperature: hourly.temperature_2m[i],
            precipProb: hourly.precipitation_probability[i],
            cloudCover: hourly.cloud_cover[i],
            windSpeed: hourly.wind_speed_10m[i],
            windGusts: hourly.wind_gusts_10m[i],
            kpIndex: kpResult.kp,
            flightSafety: hSafety,
            isGoodToFly: hSafety.status === 'good'
          };
        }),
        windProfile,
        isGoodToFly: currentSafety.status === 'good'
      };

      setWeatherData(processedData);
      setLocationName(resolvedLocationName);
      setLoading(false);
    } catch (err) {
      if (currentRequestId === activeRequestId.current) {
        setError(err.message || "API hatası: Veriler çekilemedi.");
        setLoading(false);
      }
    }
  };

  const updateLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fast, non-blocking dual-tier location resolver (GPS + IP fallback)
      const loc = await getBestUserLocation();
      fetchWeather(loc.lat, loc.lon, loc.cityName);
    } catch (err) {
      fetchWeather(41.0082, 28.9784, "İstanbul");
    }
  };

  useEffect(() => {
    updateLocation();
  }, []);

  return { loading, error, locationName, weatherData, updateLocation, fetchWeather };
};

export default useWeatherData;
