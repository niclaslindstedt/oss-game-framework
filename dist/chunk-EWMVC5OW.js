// src/hud/format.ts
function formatTime(seconds) {
  const clamped = Math.max(0, seconds);
  const m = Math.floor(clamped / 60);
  const s = Math.floor(clamped - m * 60);
  const cs = Math.floor((clamped - m * 60 - s) * 100);
  return `${m}'${String(s).padStart(2, "0")}"${String(cs).padStart(2, "0")}`;
}
var MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function formatDay(at, now = Date.now()) {
  if (!Number.isFinite(at) || at <= 0) return "";
  const day = new Date(at);
  const stamp = `${day.getDate()} ${MONTHS[day.getMonth()]}`;
  if (day.getFullYear() === new Date(now).getFullYear()) return stamp;
  return `${stamp} ${String(day.getFullYear() % 100).padStart(2, "0")}`;
}
function ordinal(place) {
  const teens = place % 100;
  if (teens >= 11 && teens <= 13) return `${place}TH`;
  return `${place}${["TH", "ST", "ND", "RD"][place % 10] ?? "TH"}`;
}
function formatScore(points) {
  const whole = String(Math.max(0, Math.round(points)));
  let out = "";
  for (let i = 0; i < whole.length; i++) {
    if (i > 0 && (whole.length - i) % 3 === 0) out += ",";
    out += whole[i];
  }
  return out;
}
var MIN_LUMA = 0.5;
function legible(color, floor = MIN_LUMA) {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luma >= floor) return `rgb(${r},${g},${b})`;
  const mix = (floor - luma) / (1 - luma);
  const lift = (c) => Math.round(c + (255 - c) * mix);
  return `rgb(${lift(r)},${lift(g)},${lift(b)})`;
}

export { formatDay, formatScore, formatTime, legible, ordinal };
