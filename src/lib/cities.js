/**
 * Source-pinned city coordinates and civil-time aware apparent solar correction.
 */

import cityCore from './cities.runtime.json' with { type: 'json' };

export const CITY_DATA_MODEL = Object.freeze({
  status: cityCore.status,
  sourceLicense: cityCore.sourceLicense,
  civilTimePolicy: Object.freeze({ ...cityCore.civilTimePolicy }),
});

// Compatibility name retained for existing consumers; this now includes China and overseas cities.
export const CHINA_CITIES = Object.freeze(
  cityCore.cities
    .map(city => Object.freeze({ ...city }))
    .sort((a, b) => a.province.localeCompare(b.province, 'zh') || a.name.localeCompare(b.name, 'zh')),
);

/**
 * Search cities by name or province. Returns top 10 matches.
 */
export function searchCities(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const results = CHINA_CITIES.filter(c =>
    c.name.includes(q) || c.province.includes(q) || (c.en && c.en.toLowerCase().includes(q))
  );
  // Prioritize exact name match, then name starts-with, then province match
  results.sort((a, b) => {
    const aExact = (a.name === q || (a.en && a.en.toLowerCase() === q)) ? 0 : 1;
    const bExact = (b.name === q || (b.en && b.en.toLowerCase() === q)) ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    const aStart = (a.name.startsWith(q) || (a.en && a.en.toLowerCase().startsWith(q))) ? 0 : 1;
    const bStart = (b.name.startsWith(q) || (b.en && b.en.toLowerCase().startsWith(q))) ? 0 : 1;
    return aStart - bStart;
  });
  return results.slice(0, 10);
}

/**
 * Calculate the equation of time in minutes using NOAA's fractional-year
 * approximation. Positive values mean apparent solar time is ahead of mean
 * solar time.
 *
 * @param {{ year: number, month: number, day: number, hour?: number, minute?: number }} dateParts
 * @returns {number}
 */
export function calcEquationOfTime({ year, month, day, hour = 12, minute = 0 }) {
  validateCivilDateParts({ year, month, day, hour, minute });
  const currentDate = new Date(0);
  currentDate.setUTCFullYear(year, month - 1, day);
  currentDate.setUTCHours(0, 0, 0, 0);
  const yearStart = new Date(0);
  yearStart.setUTCFullYear(year, 0, 1);
  yearStart.setUTCHours(0, 0, 0, 0);
  const dayOfYear = (currentDate - yearStart) / 86400000 + 1;
  const fractionalHour = hour + minute / 60;
  const daysInYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
  const gamma = (2 * Math.PI / daysInYear)
    * (dayOfYear - 1 + (fractionalHour - 12) / 24);

  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  );
}

const civilFormatterCache = new Map();

function getCivilFormatter(timeZone) {
  if (!civilFormatterCache.has(timeZone)) {
    civilFormatterCache.set(timeZone, new Intl.DateTimeFormat('en-CA', {
      timeZone,
      calendar: 'gregory',
      numberingSystem: 'latn',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }));
  }
  return civilFormatterCache.get(timeZone);
}

function validateCivilDateParts({ year, month, day, hour = 0, minute = 0 }) {
  for (const [name, value] of Object.entries({ year, month, day, hour, minute })) {
    if (!Number.isInteger(value)) throw new RangeError(`${name} must be an integer`);
  }
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new RangeError('Invalid civil date or time');
  }
  const probe = new Date(0);
  probe.setUTCFullYear(year, month - 1, day);
  probe.setUTCHours(hour, minute, 0, 0);
  if (
    probe.getUTCFullYear() !== year
    || probe.getUTCMonth() + 1 !== month
    || probe.getUTCDate() !== day
    || probe.getUTCHours() !== hour
    || probe.getUTCMinutes() !== minute
  ) {
    throw new RangeError('Invalid civil date or time');
  }
  return { year, month, day, hour, minute };
}

function civilPartsAtInstant(timeZone, instantMs) {
  const parts = Object.fromEntries(
    getCivilFormatter(timeZone)
      .formatToParts(new Date(instantMs))
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
  };
}

function civilUtcTimestamp({ year, month, day, hour = 0, minute = 0 }) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, 0, 0);
  return date.getTime();
}

function utcOffsetAtInstant(timeZone, instantMs) {
  const civil = civilPartsAtInstant(timeZone, instantMs);
  const civilAsUtc = civilUtcTimestamp(civil);
  const instantAtMinute = Math.floor(instantMs / 60000) * 60000;
  return Math.round((civilAsUtc - instantAtMinute) / 60000);
}

/**
 * Resolve a local wall time against the host runtime's IANA transition data.
 * Ambiguous and nonexistent times are reported instead of silently normalized.
 */
export function resolveCivilTimeOffset(timeZone, dateParts) {
  const target = validateCivilDateParts(dateParts);
  const naiveUtc = civilUtcTimestamp(target);
  const sampledOffsets = new Set(
    [-48, -24, 0, 24, 48].map(hours => utcOffsetAtInstant(timeZone, naiveUtc + hours * 3600000)),
  );
  const offsets = [...sampledOffsets]
    .filter((offset) => {
      const candidateInstant = naiveUtc - offset * 60000;
      return JSON.stringify(civilPartsAtInstant(timeZone, candidateInstant)) === JSON.stringify(target);
    })
    .sort((left, right) => left - right);

  if (offsets.length === 0) return { status: 'nonexistent', offsets, selectedOffset: null };
  if (offsets.length > 1) return { status: 'ambiguous', offsets, selectedOffset: null };
  return { status: 'exact', offsets, selectedOffset: offsets[0] };
}

/**
 * Calculate the minutes to subtract from a city's recorded civil wall time.
 * The UTC offset comes from its IANA zone for that exact local date and time.
 */
export function calcCitySolarTimeOffset(city, dateParts, { disambiguation = 'reject' } = {}) {
  if (!city || !Number.isFinite(city.lng) || typeof city.timeZone !== 'string') {
    throw new TypeError('city must include a finite longitude and IANA timeZone');
  }
  const resolution = resolveCivilTimeOffset(city.timeZone, dateParts);
  if (resolution.status === 'nonexistent') {
    throw new RangeError(`Nonexistent civil time in ${city.timeZone}`);
  }

  let utcOffsetMinutes = resolution.selectedOffset;
  if (resolution.status === 'ambiguous') {
    if (disambiguation === 'earlier') utcOffsetMinutes = Math.max(...resolution.offsets);
    else if (disambiguation === 'later') utcOffsetMinutes = Math.min(...resolution.offsets);
    else throw new RangeError(`Ambiguous civil time in ${city.timeZone}`);
  }
  if (!['reject', 'earlier', 'later'].includes(disambiguation)) {
    throw new RangeError('disambiguation must be reject, earlier, or later');
  }

  const equationOfTimeMinutes = calcEquationOfTime(dateParts);
  return {
    offsetMinutes: Math.round(utcOffsetMinutes - city.lng * 4 - equationOfTimeMinutes),
    utcOffsetMinutes,
    equationOfTimeMinutes,
    timeZone: city.timeZone,
    resolution: resolution.status,
    disambiguation: resolution.status === 'ambiguous' ? disambiguation : null,
  };
}

/**
 * Calculate the minutes to subtract from standard clock time to obtain local
 * apparent solar time. With dateParts this includes the equation of time;
 * without it the function preserves the former longitude-only behavior.
 *
 * For China (UTC+8, standard meridian 120°E):
 *   offset = 4 * (120 - longitude) - equationOfTime
 *
 * @param {number} longitude - City longitude in degrees
 * @param {number} [standardMeridian=120] - Standard meridian for timezone
 * @param {{ year: number, month: number, day: number, hour?: number, minute?: number }} [dateParts]
 * @returns {number} Offset in minutes to SUBTRACT from clock time
 */
export function calcTrueSolarTimeOffset(longitude, standardMeridian = 120, dateParts) {
  const equationOfTime = dateParts ? calcEquationOfTime(dateParts) : 0;
  return Math.round(
    (standardMeridian - longitude) * 4 - equationOfTime,
  );
}

/**
 * Adjust birth time by applying true solar time offset.
 * Handles day/month/year boundary crossing.
 *
 * @param {number} year
 * @param {number} month (1-12)
 * @param {number} day (1-31)
 * @param {number} hour (0-23)
 * @param {number} minute (0-59)
 * @param {number} offsetMinutes - Minutes to SUBTRACT (positive = west of 120E)
 * @returns {{ year, month, day, hour, minute }}
 */
export function adjustBirthTime(year, month, day, hour, minute, offsetMinutes) {
  const civil = validateCivilDateParts({ year, month, day, hour, minute });
  const d = new Date(civilUtcTimestamp(civil));
  // Subtract the offset (west of 120E = positive offset = solar time is earlier)
  d.setUTCMinutes(d.getUTCMinutes() - offsetMinutes);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

/**
 * Format offset for display. E.g. "-64分" or "+27分"
 */
export function formatOffset(offsetMinutes) {
  if (offsetMinutes === 0) return '±0分';
  const sign = offsetMinutes > 0 ? '-' : '+';
  return `${sign}${Math.abs(offsetMinutes)}分`;
}

/**
 * Format adjusted time for display.
 */
export function formatTrueSolarTime(adjusted, offsetMinutes) {
  const hh = String(adjusted.hour).padStart(2, '0');
  const mm = String(adjusted.minute).padStart(2, '0');
  return `真太阳时（民用时区口径） ${hh}:${mm} (校正 ${formatOffset(offsetMinutes)})`;
}

// Branch to midpoint hour mapping (for Ziwei which uses branch strings)
const BRANCH_HOURS = {
  '子': 0, '丑': 2, '寅': 4, '卯': 6, '辰': 8, '巳': 10,
  '午': 12, '未': 14, '申': 16, '酉': 18, '戌': 20, '亥': 22,
};
const HOUR_TO_BRANCH = ['子','子','丑','丑','寅','寅','卯','卯','辰','辰','巳','巳',
  '午','午','未','未','申','申','酉','酉','戌','戌','亥','亥'];

export function getBranchMidpointHour(branch) {
  if (!Object.hasOwn(BRANCH_HOURS, branch)) throw new RangeError('Invalid hour branch');
  return BRANCH_HOURS[branch];
}

/**
 * Adjust a branch-based hour for true solar time.
 * Converts branch → midpoint hour → adjust → convert back to branch.
 * Also returns the full adjusted date in case of day boundary crossing.
 *
 * @param {number} year, month, day
 * @param {string} branch - e.g. '辰'
 * @param {number} offsetMinutes
 * @returns {{ branch: string, year: number, month: number, day: number }}
 */
export function adjustHourBranch(year, month, day, branch, offsetMinutes) {
  const hour = getBranchMidpointHour(branch);
  const adjusted = adjustBirthTime(year, month, day, hour, 0, offsetMinutes);
  // Handle 子时 wrapping: hour 23 maps to 子
  const adjBranch = adjusted.hour === 23 ? '子' : HOUR_TO_BRANCH[adjusted.hour];
  return {
    branch: adjBranch,
    year: adjusted.year,
    month: adjusted.month,
    day: adjusted.day,
  };
}
