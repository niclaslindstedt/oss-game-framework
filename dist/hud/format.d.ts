/** Format seconds the way a race clock reads them: minutes, seconds and
 * HUNDREDTHS, punctuated the way an arcade timer punctuates them —
 * `2'46"85`. Hundredths and not tenths because a hundredth is the unit a
 * record is actually won by, and a clock that cannot show the margin is a
 * clock nobody chases. */
declare function formatTime(seconds: number): string;
/** WHEN a stamped thing happened, as short as a table row can carry: `12 SEP`
 * inside the current year, `12 SEP 24` outside it — a year on every row is a
 * column of the same four digits, and a row with no year on it at all is a
 * row that quietly ages into a lie. In the reader's own time zone, because
 * the only date a player wants is the one they were playing on. Empty for a
 * stamp nobody wrote (0, or anything that is not a time). */
declare function formatDay(at: number, now?: number): string;
/** A finishing position, the way a results sheet writes one: 1ST, 2ND, 3RD,
 * 4TH — and 11TH through 13TH, which are the three every naive version of
 * this gets wrong. */
declare function ordinal(place: number): string;
/** A score with its thousands grouped, the way a scoreboard writes one:
 * `5,936`. Grouped by hand and always with a comma. */
declare function formatScore(points: number): string;
/** A packed 0xRRGGBB colour as CSS, brightened until it clears a luminance
 * floor (0.5 by default).
 *
 * For every surface that dresses something in a VEHICLE'S OWN PAINT — a name
 * tag over a rival, their plate on a minimap — so one rider is one colour
 * wherever they are shown. Paint chosen to stand out against a world leaves
 * some of it darker than a plate, and dark paint behind dark ink is a hole
 * rather than a badge. Anything under the floor is mixed toward white until
 * it clears it, which lifts the shade without moving the hue. */
declare function legible(color: number, floor?: number): string;

export { formatDay, formatScore, formatTime, legible, ordinal };
