import { hypot4, hypot3 } from "./chunk-JRRRZ4XY.js";
import { __export } from "./chunk-MLKGABMK.js";

// src/core/quat.ts
var quat_exports = {};
__export(quat_exports, {
  fromAxisAngle: () => fromAxisAngle,
  fromEuler: () => fromEuler,
  identity: () => identity,
  integrate: () => integrate,
  multiply: () => multiply,
  normalize: () => normalize,
  rotate: () => rotate,
  toEuler: () => toEuler,
  unrotate: () => unrotate,
});
function identity() {
  return { x: 0, y: 0, z: 0, w: 1 };
}
function multiply(a, b) {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}
function normalize(q) {
  const n = hypot4(q.x, q.y, q.z, q.w) || 1;
  q.x /= n;
  q.y /= n;
  q.z /= n;
  q.w /= n;
  return q;
}
function fromAxisAngle(ax, ay, az, angle) {
  const h = angle * 0.5;
  const s = Math.sin(h);
  return { x: ax * s, y: ay * s, z: az * s, w: Math.cos(h) };
}
function rotate(q, v) {
  const ux = q.x;
  const uy = q.y;
  const uz = q.z;
  const cx = uy * v.z - uz * v.y;
  const cy = uz * v.x - ux * v.z;
  const cz = ux * v.y - uy * v.x;
  const ccx = uy * cz - uz * cy;
  const ccy = uz * cx - ux * cz;
  const ccz = ux * cy - uy * cx;
  return {
    x: v.x + 2 * (q.w * cx + ccx),
    y: v.y + 2 * (q.w * cy + ccy),
    z: v.z + 2 * (q.w * cz + ccz),
  };
}
function unrotate(q, v) {
  return rotate({ x: -q.x, y: -q.y, z: -q.z, w: q.w }, v);
}
function integrate(q, wx, wy, wz, dt) {
  const mag = hypot3(wx, wy, wz);
  if (mag < 1e-9) return q;
  const angle = mag * dt;
  const d = fromAxisAngle(wx / mag, wy / mag, wz / mag, angle);
  return normalize(multiply(q, d));
}
function fromEuler(heading, pitch, roll) {
  const qy = fromAxisAngle(0, 1, 0, heading);
  const qx = fromAxisAngle(1, 0, 0, -pitch);
  const qz = fromAxisAngle(0, 0, 1, -roll);
  return normalize(multiply(multiply(qy, qx), qz));
}
function toEuler(q) {
  const f = rotate(q, { x: 0, y: 0, z: 1 });
  const heading = Math.atan2(f.x, f.z);
  const pitch = Math.asin(Math.max(-1, Math.min(1, f.y)));
  const yp = fromEuler(heading, pitch, 0);
  const rest = multiply({ x: -yp.x, y: -yp.y, z: -yp.z, w: yp.w }, q);
  let roll = -2 * Math.atan2(rest.z, rest.w);
  if (roll > Math.PI) roll -= 2 * Math.PI;
  if (roll <= -Math.PI) roll += 2 * Math.PI;
  return { heading, pitch, roll };
}

export {
  fromAxisAngle,
  fromEuler,
  identity,
  integrate,
  multiply,
  normalize,
  quat_exports,
  rotate,
  toEuler,
  unrotate,
};
