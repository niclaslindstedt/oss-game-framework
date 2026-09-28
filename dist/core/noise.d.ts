/** Deterministic lattice hash in [0, 1). */
declare function hash2(ix: number, iz: number, seed: number): number;
/** Hermite fade for interpolation, 0–1 → 0–1. */
declare function smooth(t: number): number;
/** Bilinear value noise over a lattice of `hash2` values, period `scale` m. */
declare function valueNoise(x: number, z: number, scale: number, seed: number): number;
/** One `valueNoise` field — a scale and a seed — read point after point.
 * Neighbouring reads nearly always land in the same lattice square, so the
 * field keeps that square's four corner hashes and recomputes them only when
 * a read steps out of it. The arithmetic is `valueNoise`'s, term for term,
 * so a field returns the very bits `valueNoise` would: a baked grid read
 * through one is the grid read without one, only several times cheaper. */
type NoiseField = {
  readonly scale: number;
  readonly seed: number;
  ix: number;
  iz: number;
  a: number;
  b: number;
  c: number;
  d: number;
};
declare function noiseField(scale: number, seed: number): NoiseField;
/** `valueNoise(x, z, f.scale, f.seed)`, bit for bit. */
declare function sampleNoise(f: NoiseField, x: number, z: number): number;
/** Value noise on a TORUS:the lattice wraps after `cellsX` × `cellsZ` cells,
 * so the field repeats EXACTLY over that many cells in each axis and a tile
 * drawn from it meets itself at its own edges.
 *
 * Coordinates are in CELLS rather than metres — the caller scales, which is
 * what lets one tile carry a different period along each axis (foam streaks
 * are long downwind and short across it, so the tile they are drawn on is
 * not square). A lattice read with `valueNoise` and merely SAMPLED over a
 * whole number of periods does not tile: the hash at cell `cellsX` is not
 * the hash at cell 0, so the wrap lands on a discontinuity and every repeat
 * shows as a hard line. That is the fault this exists to close.
 */
declare function tiledValueNoise(
  gx: number,
  gz: number,
  cellsX: number,
  cellsZ: number,
  seed: number,
): number;

export { type NoiseField, hash2, noiseField, sampleNoise, smooth, tiledValueNoise, valueNoise };
