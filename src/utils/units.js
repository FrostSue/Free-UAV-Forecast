/**
 * Meteorological & Aviation Unit Conversion Engine for UAV Operations.
 * Canonical internal base unit for wind speeds is km/h (Open-Meteo default).
 */

export const WIND_UNITS = {
  KMH: 'km/h',
  KNOTS: 'kn',
  MS: 'm/s',
  MPH: 'mph'
};

export const WIND_UNIT_LABELS = {
  'km/h': 'km/h',
  'kn': 'kn',
  'm/s': 'm/s',
  'mph': 'mph'
};

// Precise mathematical conversion factors from km/h
// 1 knot = 1.852 km/h
// 1 m/s  = 3.6 km/h
// 1 mph  = 1.609344 km/h
const KMH_TO_UNIT_FACTORS = {
  'km/h': 1.0,
  'kn': 1 / 1.852,
  'm/s': 1 / 3.6,
  'mph': 1 / 1.609344
};

/**
 * Converts wind speed from canonical km/h to the target unit.
 * @param {number|string} valueInKmh - Wind speed in km/h
 * @param {string} targetUnit - Target unit ('km/h' | 'kn' | 'm/s' | 'mph')
 * @param {number} decimals - Precision (default: 1)
 * @returns {number}
 */
export const convertWindSpeed = (valueInKmh, targetUnit = 'km/h', decimals = 1) => {
  const numericVal = parseFloat(valueInKmh);
  if (isNaN(numericVal)) return 0;
  
  const factor = KMH_TO_UNIT_FACTORS[targetUnit] ?? 1.0;
  const result = numericVal * factor;
  return Number(result.toFixed(decimals));
};

/**
 * Formats wind speed for UI display.
 * @param {number|string} valueInKmh - Wind speed in km/h
 * @param {string} targetUnit - Target unit ('km/h' | 'kn' | 'm/s' | 'mph')
 * @param {number} decimals - Precision (default: 1)
 * @returns {string}
 */
export const formatWindSpeed = (valueInKmh, targetUnit = 'km/h', decimals = 1) => {
  const converted = convertWindSpeed(valueInKmh, targetUnit, decimals);
  return decimals === 0 ? Math.round(converted).toString() : converted.toFixed(decimals);
};

/**
 * Converts any wind speed value in sourceUnit back to canonical km/h.
 * @param {number|string} value - Speed value
 * @param {string} sourceUnit - Source unit ('km/h' | 'kn' | 'm/s' | 'mph')
 * @returns {number}
 */
export const toCanonicalKmh = (value, sourceUnit = 'km/h') => {
  const numericVal = parseFloat(value);
  if (isNaN(numericVal)) return 0;
  
  const factor = KMH_TO_UNIT_FACTORS[sourceUnit] ?? 1.0;
  return numericVal / factor;
};

/**
 * Returns formatted threshold text for safety warnings in the chosen unit.
 * Canonical thresholds (km/h):
 * - Critical Gust: 35 km/h
 * - Caution Gust: 25 km/h
 * - Critical Wind: 28 km/h
 */
export const getThresholdLabel = (canonicalKmh, targetUnit = 'km/h') => {
  const converted = convertWindSpeed(canonicalKmh, targetUnit, targetUnit === 'm/s' || targetUnit === 'kn' ? 1 : 0);
  return `${converted} ${targetUnit}`;
};
