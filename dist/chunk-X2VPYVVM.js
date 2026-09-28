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

export { SOUTH, SYNODIC_MONTH, daylightWindow, hourOfElevation, moonAt, sunAt };
