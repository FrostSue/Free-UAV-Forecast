import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseKpResponse, parseUtcEpoch, gmstRadians, computeSatelliteElevations } from '../src/utils/spaceWeather.js';

describe('parseKpResponse', () => {
  it('parses the current NOAA object format', () => {
    const data = [
      { time_tag: '2026-11-06T09:00:00', Kp: 1.67, a_running: 6, station_count: 8 },
      { time_tag: '2026-11-06T12:00:00', Kp: 2.33, a_running: 9, station_count: 8 }
    ];
    assert.deepEqual(parseKpResponse(data), { kp: 2.33, timeTag: '2026-11-06T12:00:00' });
  });

  it('parses the legacy array-of-arrays format (with header row)', () => {
    const data = [
      ['time_tag', 'Kp', 'a_running', 'station_count'],
      ['2024-05-10 18:00:00.000', '8.67', '300', '8']
    ];
    assert.deepEqual(parseKpResponse(data), { kp: 8.67, timeTag: '2024-05-10 18:00:00.000' });
  });

  it('skips trailing rows without a numeric Kp', () => {
    const data = [{ time_tag: 'a', Kp: 3 }, { time_tag: 'b', Kp: null }];
    assert.equal(parseKpResponse(data).kp, 3);
  });

  it('returns null for unusable payloads', () => {
    assert.equal(parseKpResponse(null), null);
    assert.equal(parseKpResponse([]), null);
    assert.equal(parseKpResponse([['time_tag', 'Kp']]), null);
  });
});

describe('orbital helpers', () => {
  it('parses zone-less CelesTrak epochs as UTC', () => {
    assert.equal(parseUtcEpoch('2026-11-05T14:59:20.277600').toISOString(), '2026-11-05T14:59:20.277Z');
    assert.equal(parseUtcEpoch('2026-11-05T14:59:20Z').toISOString(), '2026-11-05T14:59:20.000Z');
  });

  it('computes GMST at the J2000 epoch (~280.46°)', () => {
    const deg = (gmstRadians(new Date('2000-01-01T12:00:00Z')) * 180) / Math.PI;
    assert.ok(Math.abs(deg - 280.46) < 0.01, `got ${deg}`);
  });

  it('places a satellite at the sub-satellite point near zenith', () => {
    // Circular equatorial GPS-like orbit; at epoch the satellite sits over
    // longitude (RAAN + argP + M) − GMST. Choose RAAN so it is over 0° longitude.
    const now = new Date('2026-01-01T00:00:00Z');
    const gmstDeg = (gmstRadians(now) * 180) / Math.PI;
    const sat = {
      EPOCH: '2026-01-01T00:00:00',
      MEAN_MOTION: 2.0056,
      ECCENTRICITY: 0,
      INCLINATION: 0,
      RA_OF_ASC_NODE: gmstDeg,
      ARG_OF_PERICENTER: 0,
      MEAN_ANOMALY: 0
    };
    const [overhead] = computeSatelliteElevations([sat], 0, 0, now);
    const [antipode] = computeSatelliteElevations([sat], 0, 180, now);
    assert.ok(overhead > 89, `expected zenith, got ${overhead}`);
    assert.ok(antipode < 0, `expected below horizon, got ${antipode}`);
  });
});
