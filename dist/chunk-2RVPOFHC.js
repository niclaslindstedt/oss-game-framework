import { __export } from "./chunk-MLKGABMK.js";

// src/core/output.ts
var output_exports = {};
__export(output_exports, {
  debug: () => debug,
  error: () => error,
  header: () => header,
  info: () => info,
  recentLogs: () => recentLogs,
  setDebugEnabled: () => setDebugEnabled,
  setOutputSink: () => setOutputSink,
  status: () => status,
  warn: () => warn,
});
var RECENT_CAP = 200;
var recent = [];
var sink = null;
var debugEnabled = false;
function setOutputSink(next) {
  sink = next;
  if (next) for (const line of recent) next(line.level, line.message);
}
function setDebugEnabled(enabled) {
  debugEnabled = enabled;
}
function recentLogs() {
  return recent;
}
function emit(level, message) {
  if (level === "debug" && !debugEnabled) return;
  recent.push({ level, message });
  if (recent.length > RECENT_CAP) recent.shift();
  if (sink) sink(level, message);
}
function status(message) {
  emit("status", message);
}
function info(message) {
  emit("info", message);
}
function warn(message) {
  emit("warn", message);
}
function error(message) {
  emit("error", message);
}
function header(message) {
  emit("status", `\u2500\u2500 ${message} \u2500\u2500`);
}
function debug(message) {
  emit("debug", message);
}

export {
  debug,
  error,
  header,
  info,
  output_exports,
  recentLogs,
  setDebugEnabled,
  setOutputSink,
  status,
  warn,
};
