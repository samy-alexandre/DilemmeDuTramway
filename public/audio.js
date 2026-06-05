// ===================== audio.js =====================
// Modular Web Audio system with per-category sound signatures.
// All sounds generated programmatically — no audio files.
// Public API: Audio.enable() / Audio.disable() / Audio.isEnabled() / Audio.play(name, opts?)

(function() {
  let ctx = null;
  let masterGain = null;
  let enabled = false;
  let activeNodes = new Set();

  // ===================== CORE =====================
  function init() {
    if (ctx) return ctx;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctor();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.6;
      masterGain.connect(ctx.destination);
    } catch (e) {
      console.warn("Web Audio unavailable", e);
      ctx = null;
    }
    return ctx;
  }

  function enable() {
    enabled = true;
    const c = init();
    if (c && c.state === "suspended") c.resume();
  }

  function disable() {
    enabled = false;
    // Stop all currently-playing nodes
    activeNodes.forEach(n => {
      try { n.stop(0); } catch(e) {}
    });
    activeNodes.clear();
  }

  function isEnabled() { return enabled; }

  // ===================== PRIMITIVES =====================

  function tone({ freq, duration, type = "sine", gain = 0.1, attack = 0.005, release = null }) {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    const rel = release !== null ? release : duration;
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
    activeNodes.add(osc);
    osc.onended = () => activeNodes.delete(osc);
    return { osc, g };
  }

  function sweep({ from, to, duration, type = "sine", gain = 0.1 }) {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
    activeNodes.add(osc);
    osc.onended = () => activeNodes.delete(osc);
  }

  function noise({ duration, gain = 0.08, filterFreq = null, filterType = "lowpass", filterQ = 1 }) {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    if (filterFreq) {
      const f = ctx.createBiquadFilter();
      f.type = filterType;
      f.frequency.value = filterFreq;
      f.Q.value = filterQ;
      source.connect(f);
      f.connect(g);
    } else {
      source.connect(g);
    }
    g.connect(masterGain);
    source.start(t);
    source.stop(t + duration + 0.05);
    activeNodes.add(source);
    source.onended = () => activeNodes.delete(source);
  }

  // ===================== GENERIC SOUNDS =====================

  const sounds = {
    click: () => tone({ freq: 600, duration: 0.04, type: "square", gain: 0.04 }),

    vote: () => {
      tone({ freq: 523, duration: 0.08, type: "sine", gain: 0.07 });
      setTimeout(() => tone({ freq: 659, duration: 0.1, type: "sine", gain: 0.06 }), 50);
    },

    reveal: () => {
      // Tense ascending chord
      tone({ freq: 220, duration: 0.4, type: "triangle", gain: 0.06 });
      setTimeout(() => tone({ freq: 277, duration: 0.4, type: "triangle", gain: 0.05 }), 50);
      setTimeout(() => tone({ freq: 330, duration: 0.5, type: "triangle", gain: 0.04 }), 100);
    },

    tick: () => tone({ freq: 1500, duration: 0.025, type: "square", gain: 0.03 }),

    heartbeat: () => {
      tone({ freq: 55, duration: 0.12, type: "sine", gain: 0.1 });
      setTimeout(() => tone({ freq: 45, duration: 0.09, type: "sine", gain: 0.07 }), 140);
    },

    danger: () => {
      // Low warning pulse
      sweep({ from: 200, to: 120, duration: 0.3, type: "sawtooth", gain: 0.06 });
    },

    contradictionFound: () => {
      // Dissonant alert
      tone({ freq: 440, duration: 0.15, type: "sine", gain: 0.05 });
      setTimeout(() => tone({ freq: 466, duration: 0.25, type: "sine", gain: 0.05 }), 80);
    },

    profileRevealed: () => {
      // Solemn chord
      tone({ freq: 196, duration: 1.2, type: "triangle", gain: 0.04 });
      setTimeout(() => tone({ freq: 247, duration: 1.0, type: "triangle", gain: 0.035 }), 100);
      setTimeout(() => tone({ freq: 330, duration: 0.9, type: "triangle", gain: 0.03 }), 200);
    },

    endGame: () => {
      sweep({ from: 440, to: 110, duration: 0.8, type: "triangle", gain: 0.06 });
    }
  };

  // ===================== CATEGORY SIGNATURES =====================
  // Each category has a unique sonic identity played during reveal animation

  const categorySounds = {
    // Trolley — metal screech then heavy impact
    lever: () => {
      noise({ duration: 0.4, gain: 0.05, filterFreq: 2000, filterType: "bandpass", filterQ: 5 });
      setTimeout(() => {
        sweep({ from: 200, to: 60, duration: 0.4, type: "sawtooth", gain: 0.12 });
        noise({ duration: 0.25, gain: 0.08, filterFreq: 800 });
      }, 1800);
    },
    bridge: () => {
      // Silence then thud
      setTimeout(() => {
        sweep({ from: 180, to: 50, duration: 0.5, type: "sawtooth", gain: 0.12 });
        noise({ duration: 0.3, gain: 0.07, filterFreq: 400 });
      }, 1500);
    },

    // Médecin — cardiac monitor, flatline
    medecin: () => {
      tone({ freq: 880, duration: 0.06, type: "sine", gain: 0.05 });
      setTimeout(() => tone({ freq: 880, duration: 0.06, type: "sine", gain: 0.05 }), 700);
      setTimeout(() => tone({ freq: 880, duration: 0.06, type: "sine", gain: 0.05 }), 1400);
      setTimeout(() => tone({ freq: 880, duration: 2.0, type: "sine", gain: 0.04 }), 2100);
    },

    // Justice — gavel strike
    justice: () => {
      setTimeout(() => {
        sweep({ from: 120, to: 40, duration: 0.2, type: "sawtooth", gain: 0.15 });
        noise({ duration: 0.15, gain: 0.06, filterFreq: 200 });
      }, 800);
    },

    // IA — digital glitch
    ia: () => {
      const seq = [1200, 600, 1500, 700, 1100];
      seq.forEach((f, i) => {
        setTimeout(() => tone({ freq: f, duration: 0.04, type: "square", gain: 0.04 }), i * 60);
      });
      setTimeout(() => noise({ duration: 0.1, gain: 0.04, filterFreq: 3000, filterType: "highpass" }), 400);
    },

    // Survie — bunker door + air rushing
    survie: () => {
      noise({ duration: 1.5, gain: 0.04, filterFreq: 400, filterType: "lowpass" });
      setTimeout(() => {
        sweep({ from: 80, to: 30, duration: 0.8, type: "sawtooth", gain: 0.08 });
      }, 1200);
    },

    // Argent — coin/metallic chime
    argent: () => {
      tone({ freq: 1760, duration: 0.15, type: "sine", gain: 0.05 });
      setTimeout(() => tone({ freq: 2349, duration: 0.2, type: "sine", gain: 0.04 }), 80);
      setTimeout(() => tone({ freq: 1318, duration: 0.4, type: "sine", gain: 0.03 }), 200);
    },

    // Famille — warm chord shifting cold
    famille: () => {
      tone({ freq: 261, duration: 1.2, type: "triangle", gain: 0.05 });
      tone({ freq: 329, duration: 1.2, type: "triangle", gain: 0.04 });
      setTimeout(() => tone({ freq: 220, duration: 0.6, type: "triangle", gain: 0.05 }), 800);
    },

    // Guerre — distant radio static + low rumble
    guerre: () => {
      noise({ duration: 1.0, gain: 0.04, filterFreq: 1500, filterType: "bandpass", filterQ: 8 });
      sweep({ from: 60, to: 40, duration: 1.5, type: "sawtooth", gain: 0.07 });
    },

    // Mensonge — voice cracking
    mensonge: () => {
      sweep({ from: 440, to: 350, duration: 0.4, type: "sawtooth", gain: 0.05 });
      setTimeout(() => sweep({ from: 350, to: 200, duration: 0.5, type: "sawtooth", gain: 0.04 }), 300);
    },

    // Punition — group hum dispersing
    punition: () => {
      tone({ freq: 110, duration: 1.5, type: "sawtooth", gain: 0.04 });
      tone({ freq: 165, duration: 1.5, type: "sawtooth", gain: 0.03 });
      setTimeout(() => sweep({ from: 165, to: 80, duration: 0.8, type: "sawtooth", gain: 0.04 }), 700);
    },

    // Animaux — gentle high tone fading
    animaux: () => {
      tone({ freq: 880, duration: 1.2, type: "sine", gain: 0.04 });
      setTimeout(() => sweep({ from: 880, to: 220, duration: 0.8, type: "sine", gain: 0.04 }), 600);
    },

    // Absurde — cosmic drone
    absurde: () => {
      tone({ freq: 65, duration: 2.0, type: "sine", gain: 0.05 });
      tone({ freq: 98, duration: 2.0, type: "triangle", gain: 0.03 });
      setTimeout(() => tone({ freq: 1320, duration: 0.3, type: "sine", gain: 0.02 }), 800);
    }
  };

  // ===================== PUBLIC API =====================
  function play(name, opts = {}) {
    if (!enabled) return;
    init();
    if (sounds[name]) {
      sounds[name](opts);
      return;
    }
    // Category-specific
    if (categorySounds[name]) {
      categorySounds[name](opts);
      return;
    }
  }

  // Stop all ambient/looping sounds (called between rounds)
  function stopAll() {
    activeNodes.forEach(n => {
      try {
        if (n.stop) n.stop(0);
      } catch(e) {}
    });
    activeNodes.clear();
  }

  window.Sfx = {
    enable, disable, isEnabled, play, stopAll
  };
})();
