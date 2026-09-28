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

export {
  type MoonPlace,
  SOUTH,
  SYNODIC_MONTH,
  type SunPlace,
  daylightWindow,
  hourOfElevation,
  moonAt,
  sunAt,
};
