// src/core/noise.ts
function hash2(ix, iz, seed) {
  let h = (ix * 374761393 + iz * 668265263 + seed * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function smooth(t) {
  return t * t * (3 - 2 * t);
}
function valueNoise(x, z, scale, seed) {
  const gx = x / scale;
  const gz = z / scale;
  const ix = Math.floor(gx);
  const iz = Math.floor(gz);
  const fx = smooth(gx - ix);
  const fz = smooth(gz - iz);
  const a = hash2(ix, iz, seed);
  const b = hash2(ix + 1, iz, seed);
  const c = hash2(ix, iz + 1, seed);
  const d = hash2(ix + 1, iz + 1, seed);
  return (a + (b - a) * fx) * (1 - fz) + (c + (d - c) * fx) * fz;
}
function noiseField(scale, seed) {
  return { scale, seed, ix: Number.NaN, iz: Number.NaN, a: 0, b: 0, c: 0, d: 0 };
}
function sampleNoise(f, x, z) {
  const gx = x / f.scale;
  const gz = z / f.scale;
  const ix = Math.floor(gx);
  const iz = Math.floor(gz);
  if (ix !== f.ix || iz !== f.iz) {
    f.ix = ix;
    f.iz = iz;
    f.a = hash2(ix, iz, f.seed);
    f.b = hash2(ix + 1, iz, f.seed);
    f.c = hash2(ix, iz + 1, f.seed);
    f.d = hash2(ix + 1, iz + 1, f.seed);
  }
  const fx = smooth(gx - ix);
  const fz = smooth(gz - iz);
  const a = f.a;
  const b = f.b;
  const c = f.c;
  const d = f.d;
  return (a + (b - a) * fx) * (1 - fz) + (c + (d - c) * fx) * fz;
}
function tiledValueNoise(gx, gz, cellsX, cellsZ, seed) {
  const ix = Math.floor(gx);
  const iz = Math.floor(gz);
  const fx = smooth(gx - ix);
  const fz = smooth(gz - iz);
  const wx0 = ((ix % cellsX) + cellsX) % cellsX;
  const wz0 = ((iz % cellsZ) + cellsZ) % cellsZ;
  const wx1 = (wx0 + 1) % cellsX;
  const wz1 = (wz0 + 1) % cellsZ;
  const a = hash2(wx0, wz0, seed);
  const b = hash2(wx1, wz0, seed);
  const c = hash2(wx0, wz1, seed);
  const d = hash2(wx1, wz1, seed);
  return (a + (b - a) * fx) * (1 - fz) + (c + (d - c) * fx) * fz;
}

export { hash2, noiseField, sampleNoise, smooth, tiledValueNoise, valueNoise };
