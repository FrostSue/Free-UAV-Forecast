/**
 * WMO weather interpretation codes (as used by Open-Meteo) mapped to
 * locale keys and icon names.
 * https://open-meteo.com/en/docs#weathervariables
 */
const WMO_TABLE = [
  { codes: [0], key: 'wx_clear', icon: 'sun', nightIcon: 'moon' },
  { codes: [1], key: 'wx_mainlyClear', icon: 'cloudSun', nightIcon: 'moon' },
  { codes: [2], key: 'wx_partlyCloudy', icon: 'cloudSun', nightIcon: 'cloud' },
  { codes: [3], key: 'wx_overcast', icon: 'cloud' },
  { codes: [45, 48], key: 'wx_fog', icon: 'cloudFog' },
  { codes: [51, 53, 55], key: 'wx_drizzle', icon: 'cloudRain' },
  { codes: [56, 57], key: 'wx_freezingDrizzle', icon: 'cloudRain' },
  { codes: [61, 63, 65], key: 'wx_rain', icon: 'cloudRain' },
  { codes: [66, 67], key: 'wx_freezingRain', icon: 'cloudRain' },
  { codes: [71, 73, 75], key: 'wx_snow', icon: 'cloudSnow' },
  { codes: [77], key: 'wx_snowGrains', icon: 'cloudSnow' },
  { codes: [80, 81, 82], key: 'wx_showers', icon: 'cloudRain' },
  { codes: [85, 86], key: 'wx_snowShowers', icon: 'cloudSnow' },
  { codes: [95, 96, 99], key: 'wx_thunderstorm', icon: 'cloudLightning' }
];

export const describeWeatherCode = (code, isDay = true) => {
  const numeric = Number(code);
  const entry = WMO_TABLE.find(e => e.codes.includes(numeric));
  if (!entry) return { key: 'wx_unknown', icon: 'cloud' };
  return { key: entry.key, icon: !isDay && entry.nightIcon ? entry.nightIcon : entry.icon };
};
