// src/core/math.ts
var TAU = Math.PI * 2;
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function smoothstep(a, b, v) {
  const t = v <= a ? 0 : v >= b ? 1 : (v - a) / (b - a);
  return t * t * (3 - 2 * t);
}
function angleDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d <= -Math.PI) d += TAU;
  return d;
}
function decay(v, k, dt) {
  return v * Math.exp(-k * dt);
}
function approach(v, target, maxDelta) {
  const d = target - v;
  if (Math.abs(d) <= maxDelta) return target;
  return v + Math.sign(d) * maxDelta;
}
function hypot(a, b) {
  const x = Math.abs(a);
  const y = Math.abs(b);
  if (x === Infinity || y === Infinity) return Infinity;
  if (x !== x || y !== y) return Number.NaN;
  const m = x > y ? x : y;
  if (m === 0) return 0;
  const p = x / m;
  const q = y / m;
  return Math.sqrt(p * p + q * q) * m;
}
function hypot3(a, b, c) {
  const x = Math.abs(a);
  const y = Math.abs(b);
  const z = Math.abs(c);
  if (x === Infinity || y === Infinity || z === Infinity) return Infinity;
  if (x !== x || y !== y || z !== z) return Number.NaN;
  const m = x > y ? (x > z ? x : z) : y > z ? y : z;
  if (m === 0) return 0;
  const p = x / m;
  const q = y / m;
  const r = z / m;
  const pp = p * p;
  const qq = q * q;
  const two = pp + qq;
  const carried = two - pp - qq;
  return Math.sqrt(two + (r * r - carried)) * m;
}
function hypot4(a, b, c, d) {
  const x = Math.abs(a);
  const y = Math.abs(b);
  const z = Math.abs(c);
  const w = Math.abs(d);
  if (x === Infinity || y === Infinity || z === Infinity || w === Infinity) return Infinity;
  if (x !== x || y !== y || z !== z || w !== w) return Number.NaN;
  let m = x > y ? x : y;
  if (z > m) m = z;
  if (w > m) m = w;
  if (m === 0) return 0;
  const p = x / m;
  const q = y / m;
  const r = z / m;
  const t = w / m;
  const pp = p * p;
  const qq = q * q;
  const two = pp + qq;
  let carried = two - pp - qq;
  const third = r * r - carried;
  const three = two + third;
  carried = three - two - third;
  return Math.sqrt(three + (t * t - carried)) * m;
}
function dist2(ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  return dx * dx + dz * dz;
}
function cellKey(ix, iz) {
  return ix * 8192 + iz;
}
function blockOffsets(radius) {
  const offsets = [];
  for (let r = 0; r <= radius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) === r) offsets.push(dx, dz);
      }
    }
  }
  return offsets;
}

export {
  TAU,
  angleDiff,
  approach,
  blockOffsets,
  cellKey,
  clamp,
  decay,
  dist2,
  hypot,
  hypot3,
  hypot4,
  lerp,
  smoothstep,
};
