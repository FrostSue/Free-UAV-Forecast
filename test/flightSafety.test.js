import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateFlightSafety, classifyWind, toNumber, buildWindProfile, calculateWindAtAltitude } from '../src/utils/flightSafety.js';

const calm = {
  windGusts: 10,
  windSpeed: 6,
  precipProb: 0,
  visibilityKm: 20,
  kpIndex: 1,
  temperature: 18,
  satsLocked: 20
};

describe('toNumber', () => {
  it('keeps legitimate zero values', () => {
    assert.equal(toNumber(0, 20), 0);
    assert.equal(toNumber('0', 20), 0);
  });

  it('falls back for missing or invalid values', () => {
    assert.equal(toNumber(undefined, 5), 5);
    assert.equal(toNumber(null, 5), 5);
    assert.equal(toNumber('abc', 5), 5);
    assert.equal(toNumber(NaN, 5), 5);
  });
});

describe('evaluateFlightSafety', () => {
  it('returns good with a full 7-item checklist in calm weather', () => {
    const res = evaluateFlightSafety(calm);
    assert.equal(res.status, 'good');
    assert.deepEqual(res.reasons, []);
    assert.equal(res.checks.length, 7);
    assert.ok(res.checks.every(c => c.level === 'ok'));
  });

  it('treats 0 °C as a cold-battery caution (not as the 20 °C default)', () => {
    const res = evaluateFlightSafety({ ...calm, temperature: 0 });
    assert.equal(res.status, 'caution');
    assert.ok(res.reasons.includes('tempSuboptimal'));
  });

  it('treats 0 km visibility as critical (not as the 10 km default)', () => {
    const res = evaluateFlightSafety({ ...calm, visibilityKm: 0 });
    assert.equal(res.status, 'bad');
    assert.ok(res.reasons.includes('visibilityLow'));
  });

  it('flags critical gusts and keeps cautions out of the bad reason list', () => {
    const res = evaluateFlightSafety({ ...calm, windGusts: 40, precipProb: 25 });
    assert.equal(res.status, 'bad');
    assert.deepEqual(res.reasons, ['windGustHigh']);
    assert.equal(res.checks.find(c => c.id === 'precip').level, 'caution');
  });

  it('never blocks a flight on satellite count alone', () => {
    const res = evaluateFlightSafety({ ...calm, satsLocked: 4 });
    assert.equal(res.status, 'caution');
    assert.deepEqual(res.reasons, ['satsCheck']);
  });

  it('flags geomagnetic storms', () => {
    assert.equal(evaluateFlightSafety({ ...calm, kpIndex: 5.3 }).status, 'bad');
    assert.equal(evaluateFlightSafety({ ...calm, kpIndex: 4 }).status, 'caution');
  });
});

describe('classifyWind', () => {
  it('considers both gust and sustained wind', () => {
    assert.equal(classifyWind(10, 5), 'good');
    assert.equal(classifyWind(26, 5), 'caution');
    assert.equal(classifyWind(15, 22), 'caution');
    assert.equal(classifyWind(15, 30), 'bad');
    assert.equal(classifyWind(36, 5), 'bad');
  });
});

describe('wind profile', () => {
  it('does not collapse to zero when only the lower reference level has wind', () => {
    const v = calculateWindAtAltitude(40, 10, 80, 12, 0);
    assert.ok(v > 0, 'expected a positive extrapolated speed');
  });

  it('builds 10 tiers with gusts never below mean wind', () => {
    const profile = buildWindProfile(10, 18, 21, 24, 20, 15, 14, 13.5, 13);
    assert.equal(profile.length, 10);
    for (const tier of profile) {
      assert.ok(tier.gustSpeedKmh >= tier.windSpeedKmh, `${tier.altitudeKey} gust < wind`);
    }
    assert.equal(profile.find(p => p.altitudeKey === 'alt80m').windSpeedKmh, 18);
  });
});
