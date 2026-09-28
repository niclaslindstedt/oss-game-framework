type Point = {
  readonly x: number;
  readonly z: number;
};
/** Distance from a plan point to a segment. */
declare function segmentDistance(
  x: number,
  z: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
): number;
/** Distance from a plan point to a polyline. */
declare function polylineDistance(points: readonly Point[], x: number, z: number): number;

export { polylineDistance, segmentDistance };
