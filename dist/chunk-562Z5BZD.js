import { safeCutoff, shaperPush, envelopeShape, shaperSteepness } from "./chunk-4LE636JF.js";

// src/audio/synth.ts
var ECHO_DELAY_S = 0.21;
var ECHO_FEEDBACK = 0.24;
var ECHO_DAMP_HZ = 1800;
var LIMITER_THRESHOLD_DB = -10;
var LIMITER_KNEE_DB = 12;
var LIMITER_RATIO = 12;
var LIMITER_ATTACK_S = 5e-3;
var LIMITER_RELEASE_S = 0.25;
var ZOMBIE_PROBE_MS = 350;
var SHAPER_STEPS = 1024;
var NOISE_POOL_S = 4;
var LAYER_DRIVE = 0.6;
var GRIT_PUSH = 4;
var SET_EPSILON = 1e-4;
var ROUTE_RESEAT_MS = 250;
var pageHidden = () => typeof document !== "undefined" && document.visibilityState === "hidden";
function shaperCurve(drive) {
  const k = shaperSteepness(drive);
  const curve = new Float32Array(SHAPER_STEPS);
  for (let i = 0; i < SHAPER_STEPS; i++) {
    const x = (i / (SHAPER_STEPS - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return curve;
}
function fillNoise(data, color, sampleRate) {
  const n = data.length;
  if (color === "white") {
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  } else if (color === "pink") {
    let last = 0;
    for (let i = 0; i < n; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.75 * last + 0.25 * white;
      data[i] = last * 3.2;
    }
  } else {
    const hp = Math.exp((-2 * Math.PI * 8) / sampleRate);
    let last = 0;
    let dcIn = 0;
    let dcOut = 0;
    for (let i = 0; i < n; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.96 * last + 0.04 * white;
      const sample = last * 11;
      dcOut = hp * (dcOut + sample - dcIn);
      dcIn = sample;
      data[i] = dcOut;
    }
  }
}
function createSynth(options = {}) {
  const echoDelayS = options.echo?.delayS ?? ECHO_DELAY_S;
  const echoFeedback = options.echo?.feedback ?? ECHO_FEEDBACK;
  const echoDampHz = options.echo?.dampHz ?? ECHO_DAMP_HZ;
  let ctx = null;
  let echoInput = null;
  let master = null;
  let listenersArmed = false;
  let probeTimer = null;
  let reseatTimer = null;
  let healAttempted = false;
  let rebuildOnGesture = false;
  const curves = /* @__PURE__ */ new Map();
  const pools = /* @__PURE__ */ new Map();
  const resumeCtx = (c) => {
    if (pageHidden()) return;
    if (c.state !== "running" && c.state !== "closed") c.resume().catch(() => {});
  };
  const suspendCtx = () => {
    const c = ctx;
    if (!c || c.state !== "running" || typeof c.suspend !== "function") return;
    if (probeTimer !== null) {
      clearTimeout(probeTimer);
      probeTimer = null;
    }
    healAttempted = false;
    c.suspend().catch(() => {});
  };
  const teardown = () => {
    const old = ctx;
    ctx = null;
    master = null;
    echoInput = null;
    pools.clear();
    if (probeTimer !== null) {
      clearTimeout(probeTimer);
      probeTimer = null;
    }
    healAttempted = false;
    if (old && old.state !== "closed" && typeof old.close === "function") {
      old.close().catch(() => {});
    }
  };
  const probeZombie = () => {
    const c = ctx;
    if (!c || probeTimer !== null || c.state !== "running") return;
    if (pageHidden()) return;
    const t0 = c.currentTime;
    probeTimer = setTimeout(() => {
      probeTimer = null;
      if (ctx !== c || c.state !== "running") return;
      if (c.currentTime !== t0) {
        healAttempted = false;
        return;
      }
      if (!healAttempted && typeof c.suspend === "function") {
        healAttempted = true;
        c.suspend()
          .then(() => (pageHidden() ? void 0 : c.resume()))
          .catch(() => {})
          .then(() => probeZombie());
      } else {
        rebuildOnGesture = true;
      }
    }, ZOMBIE_PROBE_MS);
  };
  const reseatRoute = () => {
    if (reseatTimer !== null) clearTimeout(reseatTimer);
    reseatTimer = setTimeout(() => {
      reseatTimer = null;
      const c = ctx;
      if (!c || c.state !== "running" || pageHidden()) return;
      if (typeof c.suspend !== "function") return;
      c.suspend()
        .then(() => (pageHidden() ? void 0 : c.resume()))
        .catch(() => {})
        .then(() => probeZombie());
    }, ROUTE_RESEAT_MS);
  };
  const armListeners = () => {
    if (listenersArmed) return;
    listenersArmed = true;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (ctx) resumeCtx(ctx);
      probeZombie();
    };
    document.addEventListener("visibilitychange", () => {
      if (pageHidden()) suspendCtx();
      else onVisible();
    });
    window.addEventListener("pageshow", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("pagehide", suspendCtx);
    const onGesture = () => {
      if (rebuildOnGesture) {
        rebuildOnGesture = false;
        teardown();
        const fresh = ensure();
        if (fresh) resumeCtx(fresh);
        return;
      }
      if (ctx) resumeCtx(ctx);
      probeZombie();
    };
    const gestureOpts = { capture: true, passive: true };
    document.addEventListener("pointerdown", onGesture, gestureOpts);
    document.addEventListener("touchend", onGesture, gestureOpts);
    const devices = typeof navigator !== "undefined" ? navigator.mediaDevices : void 0;
    if (devices && typeof devices.addEventListener === "function") {
      devices.addEventListener("devicechange", reseatRoute);
    }
  };
  const autoplayAllowed = () => {
    if (typeof navigator === "undefined") return false;
    const nav = navigator;
    if (typeof nav.getAutoplayPolicy !== "function") return false;
    try {
      return nav.getAutoplayPolicy("audiocontext") === "allowed";
    } catch {
      return false;
    }
  };
  const ensure = () => {
    if (typeof AudioContext === "undefined") return null;
    if (!ctx) {
      if (pageHidden()) return null;
      ctx = new AudioContext({ latencyHint: "balanced" });
      armListeners();
      const c = ctx;
      c.addEventListener("statechange", () => {
        if (ctx !== c) return;
        if (document.visibilityState === "visible") {
          resumeCtx(c);
          probeZombie();
        }
      });
    }
    return ctx;
  };
  const masterBus = (c) => {
    if (!master) {
      if (typeof c.createDynamicsCompressor === "function") {
        const limiter = c.createDynamicsCompressor();
        limiter.threshold.value = LIMITER_THRESHOLD_DB;
        limiter.knee.value = LIMITER_KNEE_DB;
        limiter.ratio.value = LIMITER_RATIO;
        limiter.attack.value = LIMITER_ATTACK_S;
        limiter.release.value = LIMITER_RELEASE_S;
        limiter.connect(c.destination);
        master = limiter;
      } else {
        master = c.destination;
      }
    }
    return master;
  };
  const echoBus = (c) => {
    if (!echoInput) {
      echoInput = c.createGain();
      const delay = c.createDelay(1);
      delay.delayTime.value = echoDelayS;
      const damp = c.createBiquadFilter();
      damp.type = "lowpass";
      damp.frequency.value = echoDampHz;
      const feedback = c.createGain();
      feedback.gain.value = echoFeedback;
      echoInput.connect(delay);
      delay.connect(damp);
      damp.connect(feedback);
      feedback.connect(delay);
      damp.connect(masterBus(c));
    }
    return echoInput;
  };
  const output = (c, gain, pan, echo, alwaysPan = false) => {
    let tail = gain;
    let panner = null;
    if ((pan !== 0 || alwaysPan) && typeof c.createStereoPanner === "function") {
      panner = c.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      tail.connect(panner);
      tail = panner;
    }
    tail.connect(masterBus(c));
    if (echo > 0) {
      const send = c.createGain();
      send.gain.value = Math.min(1, echo);
      tail.connect(send);
      send.connect(echoBus(c));
    }
    return panner;
  };
  const applyFilter = (c, source, filter, t0, t1) => {
    if (!filter) return source;
    const node = c.createBiquadFilter();
    node.type = filter.type;
    const from = safeCutoff(filter.frequency, c.sampleRate);
    node.frequency.setValueAtTime(from, t0);
    const to = filter.to === void 0 ? from : safeCutoff(filter.to, c.sampleRate);
    if (to !== from) {
      node.frequency.exponentialRampToValueAtTime(to, t1);
    }
    if (filter.q !== void 0) node.Q.value = filter.q;
    source.connect(node);
    return node;
  };
  const noisePool = (c, color) => {
    let pool = pools.get(color);
    if (!pool || pool.sampleRate !== c.sampleRate) {
      pool = c.createBuffer(1, Math.ceil(c.sampleRate * NOISE_POOL_S), c.sampleRate);
      fillNoise(pool.getChannelData(0), color, c.sampleRate);
      pools.set(color, pool);
    }
    return pool;
  };
  const shaper = (c, drive, oversample = "2x") => {
    if (drive <= 0 || typeof c.createWaveShaper !== "function") return null;
    const key = Math.round(Math.min(1, drive) * 20) / 20;
    let curve = curves.get(key);
    if (!curve) {
      curve = shaperCurve(key);
      curves.set(key, curve);
    }
    const node = c.createWaveShaper();
    node.curve = curve;
    node.oversample = oversample;
    return node;
  };
  const envelope = (gain, target, t0, t1, attackMs, holdMs, decay = "exp") => {
    for (const point of envelopeShape(target, t0, t1, attackMs, holdMs, decay)) {
      if (point.ramp === "set") gain.gain.setValueAtTime(point.value, point.at);
      else if (point.ramp === "lin") gain.gain.linearRampToValueAtTime(point.value, point.at);
      else gain.gain.exponentialRampToValueAtTime(point.value, point.at);
    }
  };
  const steer = (param, last, value, at, tau) => {
    if (Math.abs(value - last) <= SET_EPSILON * Math.max(1, Math.abs(value))) return last;
    param.setTargetAtTime(value, at, Math.max(5e-3, tau));
    return value;
  };
  return {
    unlock() {
      const c = ensure();
      if (c) resumeCtx(c);
    },
    autostart() {
      if (ctx) {
        resumeCtx(ctx);
        return;
      }
      if (!autoplayAllowed()) return;
      const c = ensure();
      if (c) resumeCtx(c);
    },
    resume() {
      if (ctx) resumeCtx(ctx);
    },
    now() {
      return ctx && ctx.state === "running" ? ctx.currentTime : null;
    },
    tone({
      type = "square",
      from,
      to = from,
      durationMs,
      volume = 0.06,
      delayMs = 0,
      at,
      attackMs = 0,
      holdMs = 0,
      detuneCents = 0,
      vibrato,
      pan = 0,
      echo = 0,
      filter,
      drive = 0,
    }) {
      const c = ensure();
      if (!c) return;
      if (c.state !== "running") {
        resumeCtx(c);
        return;
      }
      const t0 = at ?? c.currentTime + delayMs / 1e3;
      const t1 = t0 + durationMs / 1e3;
      const detunes = detuneCents > 0 ? [detuneCents, -detuneCents] : [0];
      const peak = detunes.length > 1 ? volume * 0.6 : volume;
      const gain = c.createGain();
      gain.gain.value = 0;
      envelope(gain, peak, t0, t1, attackMs, holdMs, "exp");
      const mix = c.createGain();
      let chain = mix;
      const shape = shaper(c, drive);
      if (shape) {
        mix.gain.value = shaperPush(drive);
        chain.connect(shape);
        chain = shape;
      }
      applyFilter(c, chain, filter, t0, t1).connect(gain);
      output(c, gain, pan, echo);
      for (const cents of detunes) {
        const osc = c.createOscillator();
        osc.type = type;
        osc.detune.value = cents;
        osc.frequency.setValueAtTime(Math.max(1, from), t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t1);
        if (vibrato) {
          const lfo = c.createOscillator();
          lfo.frequency.value = vibrato.rateHz;
          const depth = c.createGain();
          const rise = t0 + (vibrato.delayMs ?? 0) / 1e3;
          depth.gain.setValueAtTime(0, t0);
          depth.gain.linearRampToValueAtTime(vibrato.depthCents, Math.min(rise + 0.08, t1));
          lfo.connect(depth);
          depth.connect(osc.detune);
          lfo.start(t0);
          lfo.stop(t1);
        }
        osc.connect(mix);
        osc.start(t0);
        osc.stop(t1);
      }
    },
    noise({
      durationMs,
      volume = 0.05,
      delayMs = 0,
      at,
      color = "white",
      filter,
      attackMs = 0,
      holdMs = 0,
      pan = 0,
      echo = 0,
    }) {
      const c = ensure();
      if (!c) return;
      if (c.state !== "running") {
        resumeCtx(c);
        return;
      }
      const t0 = at ?? c.currentTime + delayMs / 1e3;
      const t1 = t0 + durationMs / 1e3;
      const shaped = attackMs > 0 || holdMs > 0;
      const gain = c.createGain();
      envelope(gain, volume, t0, t1, attackMs, holdMs, shaped ? "exp" : "lin");
      const buffer = noisePool(c, color);
      const source = c.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const offset = Math.random() * buffer.duration;
      applyFilter(c, source, filter, t0, t1).connect(gain);
      output(c, gain, pan, echo);
      source.start(t0, offset);
      source.stop(t1);
    },
    layer(spec) {
      const c = ensure();
      if (!c || c.state !== "running") return null;
      const owner = c;
      const t0 = c.currentTime;
      const gain = c.createGain();
      gain.gain.value = 0;
      const panner = output(c, gain, 0, spec.echo ?? 0, true);
      let filterNode = null;
      if (spec.filter) {
        filterNode = c.createBiquadFilter();
        filterNode.type = spec.filter.type;
        filterNode.frequency.value = safeCutoff(1e3, c.sampleRate);
        if (spec.filter.q !== void 0) filterNode.Q.value = spec.filter.q;
        filterNode.connect(gain);
      }
      const head = filterNode ?? gain;
      const oscillators = [];
      const sources = [];
      let push = null;
      if (spec.kind === "tone") {
        const mix = c.createGain();
        let chain = mix;
        if ((spec.drive ?? 0) > 0) {
          const shape = shaper(c, LAYER_DRIVE, "4x");
          if (shape) {
            push = mix;
            mix.gain.value = 0.35;
            const trim = c.createGain();
            trim.gain.value = 0.7;
            chain.connect(shape);
            shape.connect(trim);
            chain = trim;
          }
        }
        chain.connect(head);
        const width = spec.detuneCents ?? 0;
        const detunes = width > 0 ? [width, -width] : [0];
        for (const cents of detunes) {
          const osc = c.createOscillator();
          osc.type = spec.type ?? "triangle";
          osc.detune.value = cents;
          osc.frequency.value = 100;
          if (spec.vibrato) {
            const lfo = c.createOscillator();
            lfo.frequency.value = spec.vibrato.rateHz;
            const depth = c.createGain();
            depth.gain.value = spec.vibrato.depthCents;
            lfo.connect(depth);
            depth.connect(osc.detune);
            lfo.start(t0);
            sources.push(lfo);
          }
          osc.connect(mix);
          osc.start(t0);
          oscillators.push(osc);
          sources.push(osc);
        }
      } else {
        const buffer = noisePool(c, spec.color ?? "white");
        const source = c.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(head);
        source.start(t0, Math.random() * buffer.duration);
        sources.push(source);
      }
      const pairScale = oscillators.length > 1 ? 0.6 : 1;
      let lastLevel = 0;
      let lastHz = 100;
      let lastCutoff = filterNode ? filterNode.frequency.value : 0;
      let lastPush = 0.35;
      let lastPan = 0;
      let stopped = false;
      return {
        set(target, glideS) {
          if (stopped || ctx !== owner || owner.state === "closed") return;
          const now = owner.currentTime;
          lastLevel = steer(
            gain.gain,
            lastLevel,
            Math.max(0, target.level) * pairScale,
            now,
            glideS,
          );
          if (target.hz !== void 0 && oscillators.length > 0) {
            const hz = Math.max(1, target.hz);
            if (hz !== lastHz) {
              for (const osc of oscillators) osc.frequency.setTargetAtTime(hz, now, glideS * 0.5);
              lastHz = hz;
            }
          }
          if (target.cutoff !== void 0 && filterNode) {
            lastCutoff = steer(
              filterNode.frequency,
              lastCutoff,
              safeCutoff(target.cutoff, owner.sampleRate),
              now,
              glideS,
            );
          }
          if (target.grit !== void 0 && push) {
            const amount = 0.35 + (GRIT_PUSH - 0.35) * Math.min(1, Math.max(0, target.grit));
            lastPush = steer(push.gain, lastPush, amount, now, glideS);
          }
          if (target.pan !== void 0 && panner) {
            lastPan = steer(
              panner.pan,
              lastPan,
              Math.max(-1, Math.min(1, target.pan)),
              now,
              glideS,
            );
          }
        },
        stop() {
          if (stopped) return;
          stopped = true;
          if (owner.state === "closed") return;
          const now = owner.currentTime;
          gain.gain.setTargetAtTime(0, now, 0.02);
          for (const source of sources) {
            try {
              source.stop(now + 0.15);
            } catch {}
          }
        },
        alive: () => !stopped && ctx === owner && owner.state !== "closed",
      };
    },
  };
}

export { createSynth };
