type Heightfield = {
  /** World x of column 0 and world z of row 0 (metres). */
  readonly originX: number;
  readonly originZ: number;
  /** Cell pitch in metres, the same along both axes. */
  readonly cell: number;
  readonly cols: number;
  readonly rows: number;
  /** Row-major: index = row * cols + col. */
  readonly data: Float32Array;
};
/** Allocate a zeroed field covering `cols × rows` cells from the origin. */
declare function createHeightfield(
  originX: number,
  originZ: number,
  cell: number,
  cols: number,
  rows: number,
): Heightfield;
/** Bilinear sample at a world point, clamped to the grid's edge. */
declare function sampleField(field: Heightfield, x: number, z: number): number;
/** Bilinear sample AND its plan gradient at a world point, written into
 * `out` as [value, d/dx, d/dz] off one set of weights — for a caller that
 * reads a field's slope thousands of times a frame. The gradient is the
 * bilinear patch's own, so it is constant across a cell and zero along an
 * axis the sample is clamped in. */
declare function sampleFieldGradient(
  field: Heightfield,
  x: number,
  z: number,
  out: Float64Array,
): void;
/** Central-difference slope of the field at a world point: the plan-space
 * gradient (dh/dx, dh/dz), in metres per metre. */
declare function fieldGradient(
  field: Heightfield,
  x: number,
  z: number,
): {
  gx: number;
  gz: number;
};
/** Fill every cell from a function of world position. */
declare function fillField(field: Heightfield, f: (x: number, z: number) => number): void;

export {
  type Heightfield,
  createHeightfield,
  fieldGradient,
  fillField,
  sampleField,
  sampleFieldGradient,
};
