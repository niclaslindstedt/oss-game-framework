// src/audio/rack.ts
function createRack(synth, specs, glide) {
  const layers = /* @__PURE__ */ new Map();
  const names = Object.keys(specs);
  return {
    apply(targets) {
      for (const name of names) {
        let layer = layers.get(name);
        if (!layer || !layer.alive()) {
          const fresh = synth.layer(specs[name]);
          if (!fresh) {
            layers.delete(name);
            continue;
          }
          layers.set(name, fresh);
          layer = fresh;
        }
        layer.set(targets[name], glide[name]);
      }
    },
    stop() {
      for (const layer of layers.values()) layer.stop();
      layers.clear();
    },
    live() {
      let n = 0;
      for (const layer of layers.values()) if (layer.alive()) n++;
      return n;
    },
  };
}

export { createRack };
