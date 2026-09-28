type Quat = {
  x: number;
  y: number;
  z: number;
  w: number;
};
type Vec3 = {
  x: number;
  y: number;
  z: number;
};
declare function identity(): Quat;
/** Hamilton product `a ⊗ b`: rotate by `b` first, then by `a`. */
declare function multiply(a: Quat, b: Quat): Quat;
/** Renormalise in place. Integration drifts the length by a part in a
 * million per step, which after a minute at 120 Hz is a visible skew. */
declare function normalize(q: Quat): Quat;
/** The rotation by `angle` radians (right-handed) about a unit axis. */
declare function fromAxisAngle(ax: number, ay: number, az: number, angle: number): Quat;
/** Rotate a body-frame vector into the world frame. */
declare function rotate(q: Quat, v: Vec3): Vec3;
/** Rotate a world-frame vector into the body frame (the inverse rotation). */
declare function unrotate(q: Quat, v: Vec3): Vec3;
/** Advance the orientation by a BODY-frame angular velocity over `dt`:
 * `q ← q ⊗ exp(½ ω dt)`, the exact rotation for a rate held constant over
 * the step. Post-multiplied because the rate is expressed in the body's own
 * axes; a world-frame rate would pre-multiply. */
declare function integrate(q: Quat, wx: number, wy: number, wz: number, dt: number): Quat;
/** The orientation with the given heading (rad, 0 = +z, clockwise from
 * above), pitch (nose up positive) and roll (right side down positive):
 * yaw first, then pitch about the yawed right axis, then roll about the
 * resulting forward axis. */
declare function fromEuler(heading: number, pitch: number, roll: number): Quat;
/** The three angles `fromEuler` was built from, read back off the rotated
 * axes. At a pitch of exactly ±90° heading and roll share an axis and the
 * split between them is arbitrary — a backflip passes through that point
 * for one step and the HUD reads a heading that swings, which is the
 * gimbal every Euler triple has and nothing downstream steers by. */
declare function toEuler(q: Quat): {
  heading: number;
  pitch: number;
  roll: number;
};

type quat_Quat = Quat;
type quat_Vec3 = Vec3;
declare const quat_fromAxisAngle: typeof fromAxisAngle;
declare const quat_fromEuler: typeof fromEuler;
declare const quat_identity: typeof identity;
declare const quat_integrate: typeof integrate;
declare const quat_multiply: typeof multiply;
declare const quat_normalize: typeof normalize;
declare const quat_rotate: typeof rotate;
declare const quat_toEuler: typeof toEuler;
declare const quat_unrotate: typeof unrotate;
declare namespace quat {
  export {
    type quat_Quat as Quat,
    type quat_Vec3 as Vec3,
    quat_fromAxisAngle as fromAxisAngle,
    quat_fromEuler as fromEuler,
    quat_identity as identity,
    quat_integrate as integrate,
    quat_multiply as multiply,
    quat_normalize as normalize,
    quat_rotate as rotate,
    quat_toEuler as toEuler,
    quat_unrotate as unrotate,
  };
}

export {
  type Quat as Q,
  type Vec3 as V,
  fromEuler as a,
  integrate as b,
  fromAxisAngle as f,
  identity as i,
  multiply as m,
  normalize as n,
  quat as q,
  rotate as r,
  toEuler as t,
  unrotate as u,
};
