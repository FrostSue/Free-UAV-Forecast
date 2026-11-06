import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { processForecast, buildForecastUrl } from '../src/hooks/useWeatherData.js';
import { describeWeatherCode } from '../src/utils/weatherCodes.js';
import { locales } from '../src/utils/locales.js';

const hours = Array.from({ length: 80 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 10, 6, i));
  return d.toISOString().slice(0, 13) + ':00';
});
const fill = (v) => hours.map(() => v);

const payload = {
  timezone: 'Europe/Istanbul',
  current: {
    time: '2026-11-06T03:15',
    temperature_2m: 0,
    relative_humidity_2m: 90,
    apparent_temperature: -3,
    is_day: 0,
    weather_code: 45,
    cloud_cover: 100,
    pressure_msl: 1015,
    wind_speed_10m: 0,
    wind_direction_10m: 0,
    wind_gusts_10m: 0
  },
  hourly: {
    time: hours,
    temperature_2m: fill(0),
    dew_point_2m: fill(-1),
    precipitation_probability: fill(0),
    weather_code: fill(45),
    cloud_cover: fill(100),
    visibility: fill(0),
    is_day: fill(0),
    wind_speed_10m: fill(0),
    wind_speed_80m: fill(0),
    wind_speed_120m: fill(0),
    wind_speed_180m: fill(0),
    wind_direction_10m: fill(0),
    wind_gusts_10m: fill(0),
    temperature_80m: fill(0),
    temperature_120m: fill(0),
    temperature_180m: fill(0)
  },
  daily: { sunrise: ['2026-11-06T06:42'], sunset: ['2026-11-06T17:01'] }
};

describe('processForecast', () => {
  const result = processForecast(payload, { kp: 2, live: true }, { visibleSats: 25, lockedSats: 18, live: true });

  it('anchors the forecast on the current local hour', () => {
    assert.equal(result.hourlyForecast[0].time, '2026-11-06T03:00');
    assert.equal(result.hourlyForecast.length, 72);
  });

  it('preserves zero temperature and zero visibility (fog)', () => {
    assert.equal(result.current.temperature, 0);
    assert.equal(result.current.visibilityKm, 0);
    assert.equal(result.current.flightSafety.status, 'bad');
    assert.ok(result.current.flightSafety.reasons.includes('visibilityLow'));
    assert.equal(result.hourlyForecast[5].temperature, 0);
  });

  it('shows location wall-clock times for sun events', () => {
    assert.equal(result.current.sunrise, '06:42');
    assert.equal(result.current.sunset, '17:01');
  });

  it('builds the 10-tier wind profile', () => {
    assert.equal(result.windProfile.length, 10);
  });

  it('requests km/h explicitly', () => {
    assert.match(buildForecastUrl(41, 29), /wind_speed_unit=kmh/);
  });
});

describe('locales & weather codes', () => {
  it('has identical keys in Turkish and English', () => {
    assert.deepEqual(Object.keys(locales.tr).sort(), Object.keys(locales.en).sort());
  });

  it('maps every WMO code to an existing locale key', () => {
    for (const code of [0, 1, 2, 3, 45, 48, 51, 56, 61, 66, 71, 77, 80, 85, 95, 99, 1234]) {
      const { key } = describeWeatherCode(code);
      assert.ok(locales.tr[key], `missing tr key ${key}`);
      assert.ok(locales.en[key], `missing en key ${key}`);
    }
  });

  it('uses night icons after dark', () => {
    assert.equal(describeWeatherCode(0, false).icon, 'moon');
    assert.equal(describeWeatherCode(0, true).icon, 'sun');
  });
});
