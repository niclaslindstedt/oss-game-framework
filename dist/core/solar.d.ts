/** The world heading of due south — where the sun stands at solar noon on
 * anywhere north of the tropics. */
declare const SOUTH: number;
type SunPlace = {
  /** Radians above the horizon; negative under it. */
  elevation: number;
  /** World heading the sun stands at (see `SOUTH`). */
  azimuth: number;
  /** Whether it is on its way up — before solar noon. */
  rising: boolean;
  /** The hour it was read at, 0..24. */
  hour: number;
};
/**
 * WHERE THE SUN IS at `hour` (solar time, 0..24) at `latitude` degrees
 * north, with the sun at `declination` degrees (a game dates its own seasons —
 * the declination is the caller's).
 * The hour angle runs 15° an hour either side of noon, and the elevation
 * and the azimuth fall out of it with the latitude and the declination.
 */
declare function sunAt(hour: number, latitude: number, declination: number): SunPlace;
/**
 * The hour at which the sun stands at `elevation`, on its way up (`rising`)
 * or down — or null when it never reaches it that day. Both answers are
 * real: a midsummer night at 62°N never gets down to −8°, and no hour of it
 * gets up to +60°.
 */
declare function hourOfElevation(
  elevation: number,
  rising: boolean,
  latitude: number,
  declination: number,
): number | null;
/**
 * THE HOURS A PLACE IS IN DAYLIGHT — the window between the morning and
 * evening crossings of `minElevation`, or null when the sun never reaches
 * it at all.
 *
 * A sun that is already over the floor at midnight (the midnight sun, and
 * at high summer it takes very little latitude) has no crossing to
 * find, and the whole clock is the window.
 */
declare function daylightWindow(
  latitude: number,
  minElevation: number,
  declination: number,
): {
  min: number;
  max: number;
} | null;
/** The synodic month, days: new moon to new moon. */
declare const SYNODIC_MONTH = 29.530589;
type MoonPlace = SunPlace & {
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
declare function moonAt(
  hour: number,
  latitude: number,
  sunDeclination: number,
  age: number,
): MoonPlace;
/** The Julian day at 0h UT of a civil (Gregorian) date. */
declare function julianDay(year: number, month: number, day: number): number;
/** The Julian day at 0h UT of the `dayOfYear`-th day (1 = 1 January) of
 * `year`; a day past the year's end runs on into the next. */
declare function julianDayOfYear(year: number, dayOfYear: number): number;
type SolarCoordinates = {
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
declare function solarCoordinates(jd: number): SolarCoordinates;
/** THE AIR'S REFRACTION at a true elevation (radians), radians: how far the
 * atmosphere lifts an image off where it geometrically stands — about half
 * a degree on the horizon, a few arc-minutes at ten degrees, nothing
 * overhead. Below the horizon it keeps the fit's own falling tail, so the
 * apparent height runs on smoothly through sunset. */
declare function refraction(elevation: number): number;
/** The TRUE elevation of the sun's centre when its upper limb, lifted by the
 * refraction, touches a level horizon — sunrise and sunset as an almanac
 * states them: −0.833°, radians. */
declare const SUNRISE: number;
/** The twilights' depths, radians: the sun's centre this far under the
 * horizon ends civil, nautical and astronomical twilight. */
declare const TWILIGHT: {
  readonly civil: number;
  readonly nautical: number;
  readonly astronomical: number;
};
type DatedSunPlace = SunPlace & {
  /** The geometric elevation, radians — `elevation` is the APPARENT one,
   * lifted by the refraction, the height the sun is seen at. */
  trueElevation: number;
  /** The sun's declination at that instant, °. */
  declination: number;
};
/** The UT hour (off `jd0`'s midnight) at which a place `longitude` ° east
 * stands at apparent solar `hour`: the longitude's hours and the equation
 * of time taken off, the latter re-read at the instant it lands on. */
declare function universalHourOf(jd0: number, hour: number, longitude: number): number;
/**
 * WHERE THE SUN IS at apparent solar `hour` at `latitude` ° north and
 * `longitude` ° east on the civil date whose 0h UT is Julian day `jd0`: the
 * declination reckoned for that very instant, the geometry `sunAt`'s, and
 * the elevation lifted by the refraction (the geometric one beside it).
 */
declare function sunOnDate(
  hour: number,
  latitude: number,
  longitude: number,
  jd0: number,
): DatedSunPlace;
/**
 * The apparent solar hour at which the sun's centre stands at the TRUE
 * `elevation` (radians) on a date at a place — rising, or setting — or null
 * when it never crosses it that day (the midnight sun, the polar night).
 * `SUNRISE` for sunrise and sunset; `TWILIGHT`'s depths for their ends.
 * Searched every few minutes across the half-day, then bisected to well
 * under a second: the declination moves through the day and is re-read at
 * every instant tried.
 */
declare function hourOfSunOnDate(
  elevation: number,
  rising: boolean,
  latitude: number,
  longitude: number,
  jd0: number,
): number | null;
/**
 * THE HOURS THE SUN STANDS OVER `minElevation` (true, radians; `SUNRISE`
 * for the day between sunrise and sunset) on a date at a place, in apparent
 * solar hours — the whole clock under a sun that never goes down to it,
 * null on a day it never comes up to it.
 */
declare function sunWindowOnDate(
  latitude: number,
  longitude: number,
  jd0: number,
  minElevation?: number,
): {
  min: number;
  max: number;
} | null;
type MoonOrbit = {
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
declare function lunarCoordinates(jd: number): MoonOrbit;
type DatedMoonPlace = MoonPlace & {
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
declare function moonOnDate(
  hour: number,
  latitude: number,
  longitude: number,
  jd0: number,
): DatedMoonPlace;

export {
  type DatedMoonPlace,
  type DatedSunPlace,
  type MoonOrbit,
  type MoonPlace,
  SOUTH,
  SUNRISE,
  SYNODIC_MONTH,
  type SolarCoordinates,
  type SunPlace,
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
