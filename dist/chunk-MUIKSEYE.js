// src/core/heightfield.ts
function createHeightfield(originX, originZ, cell, cols, rows) {
  return { originX, originZ, cell, cols, rows, data: new Float32Array(cols * rows) };
}
function sampleField(field, x, z) {
  const fx = (x - field.originX) / field.cell;
  const fz = (z - field.originZ) / field.cell;
  const maxC = field.cols - 1;
  const maxR = field.rows - 1;
  const cx = fx <= 0 ? 0 : fx >= maxC ? maxC : fx;
  const cz = fz <= 0 ? 0 : fz >= maxR ? maxR : fz;
  const c0 = Math.floor(cx);
  const r0 = Math.floor(cz);
  const c1 = c0 < maxC ? c0 + 1 : c0;
  const r1 = r0 < maxR ? r0 + 1 : r0;
  const tx = cx - c0;
  const tz = cz - r0;
  const d = field.data;
  const cols = field.cols;
  const a = d[r0 * cols + c0];
  const b = d[r0 * cols + c1];
  const c = d[r1 * cols + c0];
  const e = d[r1 * cols + c1];
  return (a + (b - a) * tx) * (1 - tz) + (c + (e - c) * tx) * tz;
}
function sampleFieldGradient(field, x, z, out) {
  const fx = (x - field.originX) / field.cell;
  const fz = (z - field.originZ) / field.cell;
  const maxC = field.cols - 1;
  const maxR = field.rows - 1;
  const cx = fx <= 0 ? 0 : fx >= maxC ? maxC : fx;
  const cz = fz <= 0 ? 0 : fz >= maxR ? maxR : fz;
  const c0 = Math.floor(cx);
  const r0 = Math.floor(cz);
  const c1 = c0 < maxC ? c0 + 1 : c0;
  const r1 = r0 < maxR ? r0 + 1 : r0;
  const tx = cx - c0;
  const tz = cz - r0;
  const d = field.data;
  const cols = field.cols;
  const a = d[r0 * cols + c0];
  const b = d[r0 * cols + c1];
  const c = d[r1 * cols + c0];
  const e = d[r1 * cols + c1];
  const inv = 1 / field.cell;
  out[0] = (a + (b - a) * tx) * (1 - tz) + (c + (e - c) * tx) * tz;
  out[1] = ((b - a) * (1 - tz) + (e - c) * tz) * inv;
  out[2] = ((c - a) * (1 - tx) + (e - b) * tx) * inv;
}
function fieldGradient(field, x, z) {
  const h = field.cell * 0.5;
  return {
    gx: (sampleField(field, x + h, z) - sampleField(field, x - h, z)) / (2 * h),
    gz: (sampleField(field, x, z + h) - sampleField(field, x, z - h)) / (2 * h),
  };
}
function fillField(field, f) {
  for (let r = 0; r < field.rows; r++) {
    const z = field.originZ + r * field.cell;
    for (let c = 0; c < field.cols; c++) {
      field.data[r * field.cols + c] = f(field.originX + c * field.cell, z);
    }
  }
}

export { createHeightfield, fieldGradient, fillField, sampleField, sampleFieldGradient };
