// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// WHERE THE SUN IS — textbook solar geometry, and nothing of any one game in
// it. An hour, a latitude and a declination go in; an elevation and a bearing
// come out.
//
// It sits in the generic pool because two very different callers need the
// same arithmetic and must not each keep a copy of it: a world generator
// asks which hours of the day are daylight before it draws one, and the
// app's sky asks how high the sun stands at the hour the run has reached. A second implementation of a cosine is a second
// implementation of sunset.
//
// ANGLES: the elevation is radians above the horizon, negative under it.
// The bearing is a WORLD HEADING in the engine's own convention — 0 along
// +z, growing clockwise toward +x — so +z is north and the south the sun
// crosses at noon is `SOUTH`.

const DEG = Math.PI / 180;

/** The world heading of due south — where the sun stands at solar noon on
 * anywhere north of the tropics. */
export const SOUTH = Math.PI;

export type SunPlace = {
  /** Radians above the horizon; negative under it. */
  elevation: number;
  /** World heading the sun stands at (see `SOUTH`). */
  azimuth: number;
  /** Whether it is on its way up — before solar noon. */
  rising: boolean;
  /** The hour it was read at, 0..24. */
  hour: number;
};

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * WHERE THE SUN IS at `hour` (solar time, 0..24) at `latitude` degrees
 * north, with the sun at `declination` degrees (a game dates its own seasons —
 * the declination is the caller's).
 * The hour angle runs 15° an hour either side of noon, and the elevation
 * and the azimuth fall out of it with the latitude and the declination.
 */
export function sunAt(hour: number, latitude: number, declination: number): SunPlace {
  const lat = latitude * DEG;
  const dec = declination * DEG;
  const h = ((((hour % 24) + 24) % 24) - 12) * 15 * DEG;
  const sinEl = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(h);
  const elevation = Math.asin(clamp(sinEl, -1, 1));
  // Azimuth measured from the south, positive toward the west — so it is
  // negative all morning and swings through zero at noon.
  const fromSouth = Math.atan2(
    Math.sin(h),
    Math.cos(h) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat),
  );
  return { elevation, azimuth: SOUTH + fromSouth, rising: h < 0, hour };
}

/** How finely the crossings below are searched, hours. A twentieth of an
 * hour is three minutes of clock and a few hundredths of a degree of arc;
 * the linear step between two samples closes the rest. */
const STEP = 1 / 20;

/**
 * The hour at which the sun stands at `elevation`, on its way up (`rising`)
 * or down — or null when it never reaches it that day. Both answers are
 * real: a midsummer night at 62°N never gets down to −8°, and no hour of it
 * gets up to +60°.
 */
export function hourOfElevation(
  elevation: number,
  rising: boolean,
  latitude: number,
  declination: number,
): number | null {
  const from = rising ? 0 : 12;
  let was = sunAt(from, latitude, declination).elevation - elevation;
  for (let h = from + STEP; h <= from + 12 + 1e-9; h += STEP) {
    const now = sunAt(h, latitude, declination).elevation - elevation;
    if ((rising && was < 0 && now >= 0) || (!rising && was > 0 && now <= 0)) {
      // The arc is a cosine, and a twentieth of an hour of it is straight.
      const f = was / (was - now);
      return h - STEP + f * STEP;
    }
    was = now;
  }
  return null;
}

/**
 * THE HOURS A PLACE IS IN DAYLIGHT — the window between the morning and
 * evening crossings of `minElevation`, or null when the sun never reaches
 * it at all.
 *
 * A sun that is already over the floor at midnight (the midnight sun, and
 * at high summer it takes very little latitude) has no crossing to
 * find, and the whole clock is the window.
 */
export function daylightWindow(
  latitude: number,
  minElevation: number,
  declination: number,
): { min: number; max: number } | null {
  const noon = sunAt(12, latitude, declination).elevation;
  if (noon < minElevation) return null;
  const up = hourOfElevation(minElevation, true, latitude, declination);
  const down = hourOfElevation(minElevation, false, latitude, declination);
  if (up === null || down === null) return { min: 0, max: 24 };
  return { min: up, max: down };
}

/** The synodic month, days: new moon to new moon. */
export const SYNODIC_MONTH = 29.530589;

export type MoonPlace = SunPlace & {
  /** How much of the disc is lit, 0 (new) … 1 (full). */
  lit: number;
};

/**
 * WHERE THE MOON IS, to the accuracy a sky needs and no further: a moon
 * `age` days past new rides the sky `age / SYNODIC_MONTH` of a day behind
 * the sun, so it rises with the sun at new, at sunset when full, and its
 * declination swings from the sun's own at new to the opposite at full —
 * which is why a winter's full moon rides high when the sun rides low.
 * The orbit's five-degree tilt and its own wobbles are left out.
 */
export function moonAt(
  hour: number,
  latitude: number,
  sunDeclination: number,
  age: number,
): MoonPlace {
  const phase = (((age / SYNODIC_MONTH) % 1) + 1) % 1;
  const lag = phase * 24;
  const declination = sunDeclination * Math.cos(2 * Math.PI * phase);
  const place = sunAt(hour - lag, latitude, declination);
  return { ...place, hour, lit: (1 - Math.cos(2 * Math.PI * phase)) / 2 };
}

// ── THE SUN AND THE MOON ON A REAL DATE ─────────────────────────────────
//
// Everything above takes the sun's declination as given and reads the
// geometry. What follows reckons the declination itself — and the equation
// of time, the air's refraction and the moon's true place among the stars —
// for a real instant, so a sky can stand where it really stands at any
// latitude, longitude and day of any year. The old functions are untouched:
// a caller that dates its own seasons keeps them bit for bit.
//
// The sun is the series NOAA's solar calculator states (after Meeus's
// "Astronomical Algorithms": the mean longitude and anomaly, the equation of
// the centre, the nutation in longitude, the obliquity), good to about a
// hundredth of a degree for this century. The refraction is the same
// calculator's piecewise fit (Bennett's near the horizon), which lifts the
// sun about half a degree there. The moon is Schlyter's low-precision orbit
// (the mean elements, Kepler's equation, the twelve largest perturbations in
// longitude and five in latitude), good to a few arc-minutes, its height
// taken down by the parallax of an observer on the surface.
//
// TIMES: a Julian day (`jd`) is days since noon UT on 1 January 4713 BC;
// `jd0` is the one at 0h UT of a civil date. The HOUR these take is the
// place's local APPARENT SOLAR hour — noon when the sun crosses the
// meridian — like `sunAt`'s, and the longitude (° east) and the equation of
// time turn it into the UT instant the stars are read at.

/** The Julian day at 0h UT of a civil (Gregorian) date. */
export function julianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

/** The Julian day at 0h UT of the `dayOfYear`-th day (1 = 1 January) of
 * `year`; a day past the year's end runs on into the next. */
export function julianDayOfYear(year: number, dayOfYear: number): number {
  return julianDay(year, 1, 1) + dayOfYear - 1;
}

const sinD = (x: number): number => Math.sin(x * DEG);
const cosD = (x: number): number => Math.cos(x * DEG);
const tanD = (x: number): number => Math.tan(x * DEG);
const wrap360 = (x: number): number => ((x % 360) + 360) % 360;

export type SolarCoordinates = {
  /** The sun's apparent declination, °. */
  declination: number;
  /** The equation of time, minutes: apparent solar time less mean. */
  equationOfTime: number;
  /** The sun's apparent ecliptic longitude, °. */
  longitude: number;
  /** The obliquity of the ecliptic, corrected for nutation, °. */
  obliquity: number;
};

/** WHERE THE SUN IS AMONG THE STARS at Julian day `jd`: its declination,
 * the equation of time, its ecliptic longitude and the obliquity. */
export function solarCoordinates(jd: number): SolarCoordinates {
  const T = (jd - 2451545) / 36525;
  const L0 = wrap360(280.46646 + T * (36000.76983 + T * 0.0003032));
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C =
    sinD(M) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    sinD(2 * M) * (0.019993 - 0.000101 * T) +
    sinD(3 * M) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  const longitude = L0 + C - 0.00569 - 0.00478 * sinD(omega);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const obliquity = eps0 + 0.00256 * cosD(omega);
  const declination = Math.asin(clamp(sinD(obliquity) * sinD(longitude), -1, 1)) / DEG;
  const y = tanD(obliquity / 2) ** 2;
  const equationOfTime =
    (4 / DEG) *
    (y * sinD(2 * L0) -
      2 * e * sinD(M) +
      4 * e * y * sinD(M) * cosD(2 * L0) -
      0.5 * y * y * sinD(4 * L0) -
      1.25 * e * e * sinD(2 * M));
  return { declination, equationOfTime, longitude: wrap360(longitude), obliquity };
}

/** THE AIR'S REFRACTION at a true elevation (radians), radians: how far the
 * atmosphere lifts an image off where it geometrically stands — about half
 * a degree on the horizon, a few arc-minutes at ten degrees, nothing
 * overhead. Below the horizon it keeps the fit's own falling tail, so the
 * apparent height runs on smoothly through sunset. */
export function refraction(elevation: number): number {
  const el = elevation / DEG;
  if (el > 85) return 0;
  const te = Math.tan(elevation);
  let arcsec: number;
  if (el > 5) arcsec = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5;
  else if (el > -0.575) arcsec = 1735 + el * (-518.2 + el * (103.4 + el * (-12.79 + el * 0.711)));
  else arcsec = -20.774 / te;
  return (arcsec / 3600) * DEG;
}

/** The TRUE elevation of the sun's centre when its upper limb, lifted by the
 * refraction, touches a level horizon — sunrise and sunset as an almanac
 * states them: −0.833°, radians. */
export const SUNRISE = -0.833 * DEG;

/** The twilights' depths, radians: the sun's centre this far under the
 * horizon ends civil, nautical and astronomical twilight. */
export const TWILIGHT = { civil: -6 * DEG, nautical: -12 * DEG, astronomical: -18 * DEG } as const;

export type DatedSunPlace = SunPlace & {
  /** The geometric elevation, radians — `elevation` is the APPARENT one,
   * lifted by the refraction, the height the sun is seen at. */
  trueElevation: number;
  /** The sun's declination at that instant, °. */
  declination: number;
};

/** The UT hour (off `jd0`'s midnight) at which a place `longitude` ° east
 * stands at apparent solar `hour`: the longitude's hours and the equation
 * of time taken off, the latter re-read at the instant it lands on. */
export function universalHourOf(jd0: number, hour: number, longitude: number): number {
  let utc = hour - longitude / 15;
  for (let i = 0; i < 3; i++) {
    utc = hour - longitude / 15 - solarCoordinates(jd0 + utc / 24).equationOfTime / 60;
  }
  return utc;
}

/**
 * WHERE THE SUN IS at apparent solar `hour` at `latitude` ° north and
 * `longitude` ° east on the civil date whose 0h UT is Julian day `jd0`: the
 * declination reckoned for that very instant, the geometry `sunAt`'s, and
 * the elevation lifted by the refraction (the geometric one beside it).
 */
export function sunOnDate(
  hour: number,
  latitude: number,
  longitude: number,
  jd0: number,
): DatedSunPlace {
  const utc = universalHourOf(jd0, hour, longitude);
  const { declination } = solarCoordinates(jd0 + utc / 24);
  const at = sunAt(hour, latitude, declination);
  return {
    ...at,
    elevation: at.elevation + refraction(at.elevation),
    trueElevation: at.elevation,
    declination,
  };
}

/**
 * The apparent solar hour at which the sun's centre stands at the TRUE
 * `elevation` (radians) on a date at a place — rising, or setting — or null
 * when it never crosses it that day (the midnight sun, the polar night).
 * `SUNRISE` for sunrise and sunset; `TWILIGHT`'s depths for their ends.
 * Searched every few minutes across the half-day, then bisected to well
 * under a second: the declination moves through the day and is re-read at
 * every instant tried.
 */
export function hourOfSunOnDate(
  elevation: number,
  rising: boolean,
  latitude: number,
  longitude: number,
  jd0: number,
): number | null {
  const off = (h: number): number =>
    sunOnDate(h, latitude, longitude, jd0).trueElevation - elevation;
  const from = rising ? 0 : 12;
  let was = off(from);
  for (let h = from + STEP; h <= from + 12 + 1e-9; h += STEP) {
    const now = off(h);
    if ((rising && was < 0 && now >= 0) || (!rising && was > 0 && now <= 0)) {
      let lo = h - STEP;
      let hi = h;
      for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2;
        const m = off(mid);
        if ((rising && m < 0) || (!rising && m > 0)) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    was = now;
  }
  return null;
}

/**
 * THE HOURS THE SUN STANDS OVER `minElevation` (true, radians; `SUNRISE`
 * for the day between sunrise and sunset) on a date at a place, in apparent
 * solar hours — the whole clock under a sun that never goes down to it,
 * null on a day it never comes up to it.
 */
export function sunWindowOnDate(
  latitude: number,
  longitude: number,
  jd0: number,
  minElevation: number = SUNRISE,
): { min: number; max: number } | null {
  const up = hourOfSunOnDate(minElevation, true, latitude, longitude, jd0);
  const down = hourOfSunOnDate(minElevation, false, latitude, longitude, jd0);
  if (up !== null && down !== null) return { min: up, max: down };
  const noon = sunOnDate(12, latitude, longitude, jd0).trueElevation;
  if (noon < minElevation) return null;
  // Over the floor at noon and never crossing it: a sun that never sets.
  if (up === null && down === null) return { min: 0, max: 24 };
  // One crossing only — the day the midnight sun begins or ends.
  return { min: up ?? 0, max: down ?? 24 };
}

/** Greenwich mean sidereal time at Julian day `jd`, °. */
function siderealTime(jd: number): number {
  const T = (jd - 2451545) / 36525;
  return wrap360(280.46061837 + 360.98564736629 * (jd - 2451545) + T * T * 0.000387933);
}

/** A body at `declination` ° and local hour angle `hourAngle` ° seen from
 * `latitude` °: its elevation (radians) and compass bearing (radians, the
 * world heading `sunAt` gives, `SOUTH` at the meridian). */
function horizontalOf(
  declination: number,
  hourAngle: number,
  latitude: number,
): { elevation: number; azimuth: number } {
  const sinEl =
    sinD(latitude) * sinD(declination) + cosD(latitude) * cosD(declination) * cosD(hourAngle);
  const elevation = Math.asin(clamp(sinEl, -1, 1));
  const fromSouth = Math.atan2(
    sinD(hourAngle),
    cosD(hourAngle) * sinD(latitude) - tanD(declination) * cosD(latitude),
  );
  return { elevation, azimuth: SOUTH + fromSouth };
}

export type MoonOrbit = {
  /** Geocentric ecliptic longitude and latitude, °. */
  longitude: number;
  latitude: number;
  /** Distance, Earth radii. */
  distance: number;
  /** Right ascension and declination, °. */
  rightAscension: number;
  declination: number;
};

/** WHERE THE MOON IS AMONG THE STARS at Julian day `jd` (Schlyter's orbit,
 * to a few arc-minutes): its ecliptic and equatorial place and its
 * distance. */
export function lunarCoordinates(jd: number): MoonOrbit {
  const d = jd - 2451543.5;
  const N = 125.1228 - 0.0529538083 * d;
  const i = 5.1454;
  const w = 318.0634 + 0.1643573223 * d;
  const a = 60.2666;
  const e = 0.0549;
  const M = wrap360(115.3654 + 13.0649929509 * d);
  // Kepler's equation, by Newton's steps from the first-order guess.
  let E = M + (e / DEG) * sinD(M) * (1 + e * cosD(M));
  for (let k = 0; k < 5; k++) {
    E = E - (E - (e / DEG) * sinD(E) - M) / (1 - e * cosD(E));
  }
  const xv = a * (cosD(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * sinD(E);
  const v = Math.atan2(yv, xv) / DEG;
  let r = Math.sqrt(xv * xv + yv * yv);
  const xh = r * (cosD(N) * cosD(v + w) - sinD(N) * sinD(v + w) * cosD(i));
  const yh = r * (sinD(N) * cosD(v + w) + cosD(N) * sinD(v + w) * cosD(i));
  const zh = r * sinD(v + w) * sinD(i);
  let lon = Math.atan2(yh, xh) / DEG;
  let lat = Math.atan2(zh, Math.sqrt(xh * xh + yh * yh)) / DEG;
  // The perturbations: the evection, the variation, the yearly equation
  // and the rest down to a hundredth of a degree.
  const Ms = 356.047 + 0.9856002585 * d;
  const Ls = Ms + 282.9404 + 4.70935e-5 * d;
  const Lm = M + w + N;
  const D = Lm - Ls;
  const F = Lm - N;
  lon +=
    -1.274 * sinD(M - 2 * D) +
    0.658 * sinD(2 * D) -
    0.186 * sinD(Ms) -
    0.059 * sinD(2 * M - 2 * D) -
    0.057 * sinD(M - 2 * D + Ms) +
    0.053 * sinD(M + 2 * D) +
    0.046 * sinD(2 * D - Ms) +
    0.041 * sinD(M - Ms) -
    0.035 * sinD(D) -
    0.031 * sinD(M + Ms) -
    0.015 * sinD(2 * F - 2 * D) +
    0.011 * sinD(M - 4 * D);
  lat +=
    -0.173 * sinD(F - 2 * D) -
    0.055 * sinD(M - F - 2 * D) -
    0.046 * sinD(M + F - 2 * D) +
    0.033 * sinD(F + 2 * D) +
    0.017 * sinD(2 * M + F);
  r += -0.58 * cosD(M - 2 * D) - 0.46 * cosD(2 * D);
  lon = wrap360(lon);
  const ecl = 23.4393 - 3.563e-7 * d;
  const xe = cosD(lon) * cosD(lat);
  const ye = cosD(ecl) * sinD(lon) * cosD(lat) - sinD(ecl) * sinD(lat);
  const ze = sinD(ecl) * sinD(lon) * cosD(lat) + cosD(ecl) * sinD(lat);
  return {
    longitude: lon,
    latitude: lat,
    distance: r,
    rightAscension: wrap360(Math.atan2(ye, xe) / DEG),
    declination: Math.atan2(ze, Math.sqrt(xe * xe + ye * ye)) / DEG,
  };
}

export type DatedMoonPlace = MoonPlace & {
  /** Days past new, off its elongation from the sun (0 … `SYNODIC_MONTH`). */
  age: number;
  /** Its declination, °. */
  declination: number;
};

/**
 * WHERE THE MOON IS at apparent solar `hour` at a place on a date (as
 * `sunOnDate`): its height as seen from the surface (the parallax taken
 * off, no refraction), its bearing, how much of its disc is lit and its
 * age — all off its real orbit, so a full moon in winter rides high, a
 * quarter moon can stand far from the equator, and the phase is the date's.
 */
export function moonOnDate(
  hour: number,
  latitude: number,
  longitude: number,
  jd0: number,
): DatedMoonPlace {
  const jd = jd0 + universalHourOf(jd0, hour, longitude) / 24;
  const moon = lunarCoordinates(jd);
  const sun = solarCoordinates(jd);
  const hourAngle = wrap360(siderealTime(jd) + longitude - moon.rightAscension + 180) - 180;
  const geo = horizontalOf(moon.declination, hourAngle, latitude);
  const parallax = Math.asin(1 / moon.distance);
  const elongation = wrap360(moon.longitude - sun.longitude);
  const cosPhase = cosD(moon.longitude - sun.longitude) * cosD(moon.latitude);
  return {
    elevation: geo.elevation - parallax * Math.cos(geo.elevation),
    azimuth: geo.azimuth,
    rising: hourAngle < 0,
    hour,
    lit: (1 - cosPhase) / 2,
    age: (elongation / 360) * SYNODIC_MONTH,
    declination: moon.declination,
  };
}
