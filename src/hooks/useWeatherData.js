import { useState, useEffect } from 'react';

const useWeatherData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const current = data.current;
      const hourly = data.hourly;
      
      const now = new Date();
      let nowIndex = hourly.time.findIndex(timeStr => new Date(timeStr) > now) - 1;
      if (nowIndex < 0) nowIndex = 0;

      const hourlySlice = hourly.time.slice(nowIndex, nowIndex + 12);

      const formattedData = {
        current: {
          weatherCode: current.weather_code,
          sunrise: "05:15", 
          sunset: "20:00", 
          temperature: current.temperature_2m,
          dewPoint: hourly.dew_point_2m[nowIndex],
          windSpeed: current.wind_speed_10m,
          windGusts: current.wind_gusts_10m,
          windDir: `${current.wind_direction_10m}°`,
          precipProb: hourly.precipitation_probability[nowIndex],
          cloudCover: current.cloud_cover,
          visibility: hourly.visibility[nowIndex] / 1000, 
          visibleSats: 22, 
          kpIndex: 1.5, 
          satsLocked: 20 
        },
        hourlyForecast: hourlySlice.map((timeStr, index) => {
          const i = nowIndex + index;
          return {
            time: timeStr,
            gusts: hourly.wind_gusts_10m[i],
            temperature: hourly.temperature_2m[i],
            precipProb: hourly.precipitation_probability[i],
            cloudCover: hourly.cloud_cover[i],
            kpIndex: 1.5,
            isGoodToFly: hourly.wind_gusts_10m[i] < 25 && hourly.precipitation_probability[i] < 20
          };
        }),
        windProfile: [
          { altitudeKey: 'ground', windSpeed: current.wind_speed_10m, gustSpeed: current.wind_gusts_10m, temperature: current.temperature_2m },
          { altitudeKey: 'alt80m', windSpeed: hourly.wind_speed_80m[nowIndex], gustSpeed: (hourly.wind_gusts_10m[nowIndex] * 1.2).toFixed(1), temperature: hourly.temperature_80m[nowIndex] },
          { altitudeKey: 'alt120m', windSpeed: hourly.wind_speed_120m[nowIndex], gustSpeed: (hourly.wind_gusts_10m[nowIndex] * 1.3).toFixed(1), temperature: hourly.temperature_120m[nowIndex] },
          { altitudeKey: 'alt180m', windSpeed: hourly.wind_speed_180m[nowIndex], gustSpeed: (hourly.wind_gusts_10m[nowIndex] * 1.5).toFixed(1), temperature: hourly.temperature_180m[nowIndex] }
        ],
        isGoodToFly: current.wind_gusts_10m < 25 && hourly.precipitation_probability[nowIndex] < 20
      };

      setWeatherData(formattedData);
      setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      setLoading(false);
    } catch (err) {
      setError("API hatası: Veriler çekilemedi.");
      setLoading(false);
    }
  };

  const updateLocation = () => {
    setLoading(true);
    setError(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setLoading(false);
          setError("Konum izni reddedildi veya alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.");
        }
      );
    } else {
      setLoading(false);
      setError("Tarayıcınız konum özelliğini desteklemiyor.");
    }
  };

  useEffect(() => {
    updateLocation();
  }, []);

  return { loading, error, locationName, weatherData, updateLocation, fetchWeather };
};

export default useWeatherData;