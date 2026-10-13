// src/core/solar.ts
var DEG = Math.PI / 180;
var SOUTH = Math.PI;
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}
function sunAt(hour, latitude, declination) {
  const lat = latitude * DEG;
  const dec = declination * DEG;
  const h = ((((hour % 24) + 24) % 24) - 12) * 15 * DEG;
  const sinEl = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(h);
  const elevation = Math.asin(clamp(sinEl, -1, 1));
  const fromSouth = Math.atan2(
    Math.sin(h),
    Math.cos(h) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat),
  );
  return { elevation, azimuth: SOUTH + fromSouth, rising: h < 0, hour };
}
var STEP = 1 / 20;
function hourOfElevation(elevation, rising, latitude, declination) {
  const from = rising ? 0 : 12;
  let was = sunAt(from, latitude, declination).elevation - elevation;
  for (let h = from + STEP; h <= from + 12 + 1e-9; h += STEP) {
    const now = sunAt(h, latitude, declination).elevation - elevation;
    if ((rising && was < 0 && now >= 0) || (!rising && was > 0 && now <= 0)) {
      const f = was / (was - now);
      return h - STEP + f * STEP;
    }
    was = now;
  }
  return null;
}
function daylightWindow(latitude, minElevation, declination) {
  const noon = sunAt(12, latitude, declination).elevation;
  if (noon < minElevation) return null;
  const up = hourOfElevation(minElevation, true, latitude, declination);
  const down = hourOfElevation(minElevation, false, latitude, declination);
  if (up === null || down === null) return { min: 0, max: 24 };
  return { min: up, max: down };
}
var SYNODIC_MONTH = 29.530589;
function moonAt(hour, latitude, sunDeclination, age) {
  const phase = (((age / SYNODIC_MONTH) % 1) + 1) % 1;
  const lag = phase * 24;
  const declination = sunDeclination * Math.cos(2 * Math.PI * phase);
  const place = sunAt(hour - lag, latitude, declination);
  return { ...place, hour, lit: (1 - Math.cos(2 * Math.PI * phase)) / 2 };
}
function julianDay(year, month, day) {
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
function julianDayOfYear(year, dayOfYear) {
  return julianDay(year, 1, 1) + dayOfYear - 1;
}
var sinD = (x) => Math.sin(x * DEG);
var cosD = (x) => Math.cos(x * DEG);
var tanD = (x) => Math.tan(x * DEG);
var wrap360 = (x) => ((x % 360) + 360) % 360;
function solarCoordinates(jd) {
  const T = (jd - 2451545) / 36525;
  const L0 = wrap360(280.46646 + T * (36000.76983 + T * 3032e-7));
  const M = 357.52911 + T * (35999.05029 - 1537e-7 * T);
  const e = 0.016708634 - T * (42037e-9 + 1267e-10 * T);
  const C =
    sinD(M) * (1.914602 - T * (4817e-6 + 14e-6 * T)) +
    sinD(2 * M) * (0.019993 - 101e-6 * T) +
    sinD(3 * M) * 289e-6;
  const omega = 125.04 - 1934.136 * T;
  const longitude = L0 + C - 569e-5 - 478e-5 * sinD(omega);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (59e-5 - T * 1813e-6))) / 60) / 60;
  const obliquity = eps0 + 256e-5 * cosD(omega);
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
function refraction(elevation) {
  const el = elevation / DEG;
  if (el > 85) return 0;
  const te = Math.tan(elevation);
  let arcsec;
  if (el > 5) arcsec = 58.1 / te - 0.07 / te ** 3 + 86e-6 / te ** 5;
  else if (el > -0.575) arcsec = 1735 + el * (-518.2 + el * (103.4 + el * (-12.79 + el * 0.711)));
  else arcsec = -20.774 / te;
  return (arcsec / 3600) * DEG;
}
var SUNRISE = -0.833 * DEG;
var TWILIGHT = { civil: -6 * DEG, nautical: -12 * DEG, astronomical: -18 * DEG };
function universalHourOf(jd0, hour, longitude) {
  let utc = hour - longitude / 15;
  for (let i = 0; i < 3; i++) {
    utc = hour - longitude / 15 - solarCoordinates(jd0 + utc / 24).equationOfTime / 60;
  }
  return utc;
}
function sunOnDate(hour, latitude, longitude, jd0) {
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
function hourOfSunOnDate(elevation, rising, latitude, longitude, jd0) {
  const off = (h) => sunOnDate(h, latitude, longitude, jd0).trueElevation - elevation;
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
function sunWindowOnDate(latitude, longitude, jd0, minElevation = SUNRISE) {
  const up = hourOfSunOnDate(minElevation, true, latitude, longitude, jd0);
  const down = hourOfSunOnDate(minElevation, false, latitude, longitude, jd0);
  if (up !== null && down !== null) return { min: up, max: down };
  const noon = sunOnDate(12, latitude, longitude, jd0).trueElevation;
  if (noon < minElevation) return null;
  if (up === null && down === null) return { min: 0, max: 24 };
  return { min: up ?? 0, max: down ?? 24 };
}
function siderealTime(jd) {
  const T = (jd - 2451545) / 36525;
  return wrap360(280.46061837 + 360.98564736629 * (jd - 2451545) + T * T * 387933e-9);
}
function horizontalOf(declination, hourAngle, latitude) {
  const sinEl =
    sinD(latitude) * sinD(declination) + cosD(latitude) * cosD(declination) * cosD(hourAngle);
  const elevation = Math.asin(clamp(sinEl, -1, 1));
  const fromSouth = Math.atan2(
    sinD(hourAngle),
    cosD(hourAngle) * sinD(latitude) - tanD(declination) * cosD(latitude),
  );
  return { elevation, azimuth: SOUTH + fromSouth };
}
function lunarCoordinates(jd) {
  const d = jd - 24515435e-1;
  const N = 125.1228 - 0.0529538083 * d;
  const i = 5.1454;
  const w = 318.0634 + 0.1643573223 * d;
  const a = 60.2666;
  const e = 0.0549;
  const M = wrap360(115.3654 + 13.0649929509 * d);
  let E = M + (e / DEG) * sinD(M) * (1 + e * cosD(M));
  for (let k = 0; k < 5; k++) {
    E = E - (E - (e / DEG) * sinD(E) - M) / (1 - e * cosD(E));
  }
  const xv = a * (cosD(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * sinD(E);
  const v = Math.atan2(yv, xv) / DEG;
  let r = Math.hypot(xv, yv);
  const xh = r * (cosD(N) * cosD(v + w) - sinD(N) * sinD(v + w) * cosD(i));
  const yh = r * (sinD(N) * cosD(v + w) + cosD(N) * sinD(v + w) * cosD(i));
  const zh = r * sinD(v + w) * sinD(i);
  let lon = Math.atan2(yh, xh) / DEG;
  let lat = Math.atan2(zh, Math.hypot(xh, yh)) / DEG;
  const Ms = 356.047 + 0.9856002585 * d;
  const Ls = Ms + 282.9404 + 470935e-10 * d;
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
  const ecl = 23.4393 - 3563e-10 * d;
  const xe = cosD(lon) * cosD(lat);
  const ye = cosD(ecl) * sinD(lon) * cosD(lat) - sinD(ecl) * sinD(lat);
  const ze = sinD(ecl) * sinD(lon) * cosD(lat) + cosD(ecl) * sinD(lat);
  return {
    longitude: lon,
    latitude: lat,
    distance: r,
    rightAscension: wrap360(Math.atan2(ye, xe) / DEG),
    declination: Math.atan2(ze, Math.hypot(xe, ye)) / DEG,
  };
}
function moonOnDate(hour, latitude, longitude, jd0) {
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

export {
  SOUTH,
  SUNRISE,
  SYNODIC_MONTH,
  TWILIGHT,
  daylightWindow,
  hourOfElevation,
  hourOfSunOnDate,
  julianDay,
  julianDayOfYear,
  lunarCoordinates,
  moonAt,
  moonOnDate,
  refraction,
  solarCoordinates,
  sunAt,
  sunOnDate,
  sunWindowOnDate,
  universalHourOf,
};
