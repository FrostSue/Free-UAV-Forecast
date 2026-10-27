import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { convertWindSpeed, toCanonicalKmh, WIND_UNITS } from '../src/utils/units.js';
import { calculateWindAtAltitude } from '../src/utils/flightSafety.js';

describe('Meteorological & Aviation Unit Conversion Tests', () => {
  it('converts canonical 25 km/h to knots (~13.5 kn)', () => {
    const knots = convertWindSpeed(25.0, WIND_UNITS.KNOTS, 1);
    assert.equal(knots, 13.5);
  });

  it('converts canonical 51 km/h to knots (~27.5 kn)', () => {
    const knots = convertWindSpeed(51.0, WIND_UNITS.KNOTS, 1);
    assert.equal(knots, 27.5);
  });

  it('converts canonical 25 km/h to m/s (~6.9 m/s)', () => {
    const ms = convertWindSpeed(25.0, WIND_UNITS.MS, 1);
    assert.equal(ms, 6.9);
  });

  it('converts canonical 25 km/h to mph (~15.5 mph)', () => {
    const mph = convertWindSpeed(25.0, WIND_UNITS.MPH, 1);
    assert.equal(mph, 15.5);
  });

  it('preserves bidirectional identity: knots -> km/h -> knots', () => {
    const originalKnots = 13.5;
    const kmh = toCanonicalKmh(originalKnots, WIND_UNITS.KNOTS);
    const backToKnots = convertWindSpeed(kmh, WIND_UNITS.KNOTS, 1);
    assert.equal(backToKnots, originalKnots);
  });

  it('preserves bidirectional identity: m/s -> km/h -> m/s', () => {
    const originalMs = 10.0;
    const kmh = toCanonicalKmh(originalMs, WIND_UNITS.MS);
    assert.equal(kmh, 36.0);
    const backToMs = convertWindSpeed(kmh, WIND_UNITS.MS, 1);
    assert.equal(backToMs, originalMs);
  });

  it('calculates wind shear power law without exponential or negative drift', () => {
    const speedAt120m = calculateWindAtAltitude(120, 10, 80, 20.0, 28.0);
    assert.ok(speedAt120m > 20.0, 'Speed at 120m should be greater than speed at 10m');
    assert.ok(speedAt120m < 50.0, 'Speed at 120m should not exhibit runaway acceleration');
  });
});
