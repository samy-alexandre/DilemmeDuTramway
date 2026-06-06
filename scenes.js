// ===================== scenes.js =====================
// 12 SVG scenes — each with its own visual identity and animation.
// Public API: Scenes.build(category, scenario) → mounts SVG into #scene-container
//             Scenes.animate(category, choice) → plays the reveal animation
//             Scenes.reset() → clears

(function() {

  let currentCategory = null;
  let pendingTimeouts = [];

  function clearPendingTimeouts() {
    pendingTimeouts.forEach(t => clearTimeout(t));
    pendingTimeouts = [];
  }
  function later(fn, ms) {
    const t = setTimeout(fn, ms);
    pendingTimeouts.push(t);
    return t;
  }

  const W = 600, H = 280;
  const baseAttrs = `viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"`;

  // ===================== UTILITIES =====================
  function escapeXml(s) {
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  // Shorten a long label for display inside the SVG (strip parentheticals, cap length)
  function shortLabel(s) {
    if (!s) return "";
    let t = String(s).replace(/\s*\([^)]*\)\s*/g, " ").trim();
    if (t.length > 20) t = t.slice(0, 19).trim() + "\u2026";
    return t;
  }

  // Two side-by-side option labels — reads the scenario's real labels
  function optionLabels(scenario) {
    const left = scenario && scenario.labels ? shortLabel(scenario.labels.act) : "AGIR";
    const right = scenario && scenario.labels ? shortLabel(scenario.labels.wait) : "ATTENDRE";
    return `
      <text x="${W * 0.22}" y="${H - 16}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.55)" letter-spacing="0.5" font-family="Georgia,serif">${escapeXml(left).toUpperCase()}</text>
      <text x="${W * 0.78}" y="${H - 16}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.55)" letter-spacing="0.5" font-family="Georgia,serif">${escapeXml(right).toUpperCase()}</text>
      <line x1="${W * 0.22 - 35}" y1="${H - 30}" x2="${W * 0.22 + 35}" y2="${H - 30}" stroke="rgba(217,104,80,0.4)" stroke-width="1"/>
      <line x1="${W * 0.78 - 35}" y1="${H - 30}" x2="${W * 0.78 + 35}" y2="${H - 30}" stroke="rgba(93,141,184,0.4)" stroke-width="1"/>
    `;
  }

  // ===================== SCENE BUILDERS =====================

  // ---------- 1. TROLLEY (lever) ----------
  // ---------- Figure variants for the lever scene ----------
  function leverFigure(type, cx, cy, scale) {
    scale = scale || 1;
    const s = scale;
    const white = "#e8e8e8";
    switch (type) {
      case "child":
        return `<g class="figure" transform="translate(${cx}, ${cy}) scale(${0.7 * s})">
          <circle cx="0" cy="-9" r="4" fill="${white}"/><rect x="-3" y="-4" width="6" height="11" rx="1" fill="${white}"/></g>`;
      case "elder":
        return `<g class="figure" transform="translate(${cx}, ${cy}) scale(${s})">
          <circle cx="-2" cy="-9" r="4" fill="${white}"/><path d="M -5 -5 Q -7 3 -4 8 L 4 8 Q 4 0 2 -5 Z" fill="${white}"/>
          <line x1="6" y1="-6" x2="7" y2="9" stroke="${white}" stroke-width="1.2"/></g>`;
      case "scientist":
        return `<g class="figure" transform="translate(${cx}, ${cy}) scale(${s})">
          <circle cx="0" cy="-11" r="4.5" fill="${white}"/><path d="M -5 -6 L -5 10 L 5 10 L 5 -6 Z" fill="${white}"/>
          <line x1="0" y1="-6" x2="0" y2="10" stroke="#3a4051" stroke-width="0.6"/></g>`;
      case "worker":
        return `<g class="figure" transform="translate(${cx}, ${cy}) scale(${s})">
          <path d="M -5 -9 A 5 5 0 0 1 5 -9 Z" fill="#f5c842"/><circle cx="0" cy="-8" r="3.5" fill="${white}"/>
          <rect x="-3" y="-4" width="6" height="12" rx="1" fill="${white}"/></g>`;
      case "tyrant":
        return `<g class="figure" transform="translate(${cx}, ${cy}) scale(${1.1 * s})">
          <circle cx="0" cy="-11" r="5" fill="${white}"/><rect x="-6" y="-6" width="12" height="15" rx="1" fill="${white}"/>
          <rect x="-7" y="-5" width="3" height="3" fill="#c9a851"/><rect x="4" y="-5" width="3" height="3" fill="#c9a851"/>
          <circle cx="0" cy="2" r="2" fill="#c9302c"/></g>`;
      default:
        return `<g class="figure" transform="translate(${cx}, ${cy}) scale(${s})">
          <circle cx="0" cy="-10" r="4" fill="${white}"/><rect x="-3" y="-5" width="6" height="13" rx="1" fill="${white}"/></g>`;
    }
  }

  const leverConfig = {
    base:       { group: { type: "person",  count: 5 }, solo: "person" },
    jeunesse:   { group: { type: "youth",   count: 5 }, solo: "elder" },
    proche:     { group: { type: "person",  count: 5 }, solo: "child" },
    chercheuse: { group: { type: "worker",  count: 5 }, solo: "scientist" },
    tyran:      { group: { type: "tyrant",  count: 1 }, solo: "worker" }
  };

  function buildTrolley(scenario) {
    const variant = (scenario && scenario.key ? scenario.key.split(":")[1] : "base") || "base";
    const cfg = leverConfig[variant] || leverConfig.base;
    const groupType = cfg.group.type === "youth" ? "person" : cfg.group.type;
    const groupCount = cfg.group.count;

    let groupSvg = "";
    if (groupCount === 1) {
      groupSvg = leverFigure(groupType, 490, 195, 1.1);
    } else {
      for (let i = 0; i < groupCount; i++) {
        groupSvg += leverFigure(groupType, 460 + i * 18, 195, 1);
      }
    }
    const soloSvg = leverFigure(cfg.solo, 0, 0, 1);

    return `<svg ${baseAttrs} class="scene-svg scene-trolley">
      <defs>
        <linearGradient id="rail-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a4051"/>
          <stop offset="100%" stop-color="#1a1d28"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#rail-grad)"/>
      <ellipse cx="${W/2}" cy="-50" rx="${W*0.7}" ry="120" fill="rgba(245, 100, 80, 0.05)"/>

      <line x1="20" y1="200" x2="${W-20}" y2="200" stroke="#5a6275" stroke-width="2"/>
      <line x1="20" y1="218" x2="${W-20}" y2="218" stroke="#5a6275" stroke-width="2"/>

      <path d="M 280 200 Q 350 180 420 130 L ${W-20} 100" stroke="#5a6275" stroke-width="2" fill="none"/>
      <path d="M 280 218 Q 360 195 430 145 L ${W-20} 115" stroke="#5a6275" stroke-width="2" fill="none"/>

      ${Array.from({length: 18}, (_, i) => {
        const x = 30 + i * 32;
        return `<line x1="${x}" y1="195" x2="${x}" y2="223" stroke="#3d4252" stroke-width="3"/>`;
      }).join("")}

      <circle cx="280" cy="209" r="3" fill="#c9302c"/>

      <g id="trolley-lever" transform="translate(280, 165)">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#7a8090" stroke-width="3" stroke-linecap="round"/>
        <line id="trolley-lever-arm" x1="0" y1="0" x2="-15" y2="-25" stroke="#c9302c" stroke-width="3" stroke-linecap="round" style="transform-origin: 0 0; transition: transform 0.4s ease;"/>
        <circle cx="-15" cy="-25" r="4" fill="#e74c3c"/>
      </g>

      <g id="trolley-five">${groupSvg}</g>

      <g id="trolley-one" transform="translate(${W-60}, 95)">${soloSvg}</g>

      <g id="trolley-tram" transform="translate(60, 195)" style="transition: transform 1.8s cubic-bezier(0.4, 0, 0.6, 1);">
        <rect x="-35" y="-22" width="68" height="32" rx="3" fill="#e8e8e8" stroke="#1a1d28" stroke-width="1.5"/>
        <rect x="-35" y="-22" width="68" height="6" fill="#c9302c"/>
        <rect x="-30" y="-16" width="14" height="12" fill="#5a6275"/>
        <rect x="-13" y="-16" width="14" height="12" fill="#5a6275"/>
        <rect x="4" y="-16" width="14" height="12" fill="#5a6275"/>
        <circle cx="-20" cy="14" r="5" fill="#1a1d28" stroke="#7a8090" stroke-width="1.5"/>
        <circle cx="20" cy="14" r="5" fill="#1a1d28" stroke="#7a8090" stroke-width="1.5"/>
        <circle cx="33" cy="-5" r="2" fill="#f5c842"/>
      </g>

      <g id="trolley-impact" opacity="0">
        <circle cx="0" cy="0" r="22" fill="#f56450" opacity="0.5"/>
        <circle cx="0" cy="0" r="12" fill="#f5c842"/>
      </g>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateTrolley(svg, choice) {
    if (choice === "act") {
      const lever = svg.querySelector("#trolley-lever-arm");
      if (lever) lever.style.transform = "rotate(50deg)";
      window.Sfx && window.Sfx.play("click");
      later(() => {
        const tram = svg.querySelector("#trolley-tram");
        if (tram) tram.setAttribute("transform", "translate(530, 105) rotate(-12)");
      }, 250);
      later(() => {
        const impact = svg.querySelector("#trolley-impact");
        if (impact) {
          impact.setAttribute("transform", `translate(${W-60}, 100)`);
          impact.style.opacity = "1";
          impact.style.transition = "opacity 0.5s ease";
        }
        const one = svg.querySelector("#trolley-one");
        if (one) { one.style.opacity = "0.3"; one.style.transition = "opacity 0.5s ease"; }
      }, 2000);
      later(() => {
        const impact = svg.querySelector("#trolley-impact");
        if (impact) impact.style.opacity = "0";
      }, 2700);
    } else if (choice === "wait") {
      later(() => {
        const tram = svg.querySelector("#trolley-tram");
        if (tram) tram.setAttribute("transform", "translate(520, 195)");
      }, 250);
      later(() => {
        const impact = svg.querySelector("#trolley-impact");
        if (impact) {
          impact.setAttribute("transform", `translate(${488}, 195)`);
          impact.style.opacity = "1";
          impact.style.transition = "opacity 0.5s ease";
        }
        const five = svg.querySelector("#trolley-five");
        if (five) { five.style.opacity = "0.3"; five.style.transition = "opacity 0.5s ease"; }
      }, 2000);
      later(() => {
        const impact = svg.querySelector("#trolley-impact");
        if (impact) impact.style.opacity = "0";
      }, 2700);
    }
  }

  // ---------- 2. BRIDGE ----------
  function buildBridge(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-bridge">
      <defs>
        <linearGradient id="bridge-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a1d28"/>
          <stop offset="100%" stop-color="#2d3142"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bridge-bg)"/>

      <!-- Rails below -->
      <line x1="20" y1="220" x2="${W-20}" y2="220" stroke="#5a6275" stroke-width="2"/>
      <line x1="20" y1="232" x2="${W-20}" y2="232" stroke="#5a6275" stroke-width="2"/>

      <!-- Bridge -->
      <rect x="180" y="120" width="240" height="8" fill="#7a8090"/>
      <rect x="180" y="120" width="240" height="3" fill="#9aa0b0"/>
      <line x1="190" y1="128" x2="190" y2="220" stroke="#5a6275" stroke-width="2.5"/>
      <line x1="410" y1="128" x2="410" y2="220" stroke="#5a6275" stroke-width="2.5"/>
      <!-- Railing -->
      <line x1="180" y1="110" x2="420" y2="110" stroke="#7a8090" stroke-width="1.5"/>
      <line x1="180" y1="120" x2="180" y2="110" stroke="#7a8090" stroke-width="1.5"/>
      <line x1="420" y1="120" x2="420" y2="110" stroke="#7a8090" stroke-width="1.5"/>

      <!-- Man on bridge -->
      <g id="bridge-man" transform="translate(300, 95)" style="transition: transform 1.0s cubic-bezier(0.5, 0, 0.7, 1);">
        <circle cx="0" cy="0" r="8" fill="#e8e8e8" stroke="#1a1d28" stroke-width="1"/>
        <ellipse cx="0" cy="17" rx="11" ry="14" fill="#e8e8e8" stroke="#1a1d28" stroke-width="1"/>
        <line x1="-9" y1="14" x2="-15" y2="26" stroke="#e8e8e8" stroke-width="2"/>
        <line x1="9" y1="14" x2="15" y2="26" stroke="#e8e8e8" stroke-width="2"/>
      </g>

      <!-- 5 people on rail (right side) -->
      <g id="bridge-five">
        ${Array.from({length: 5}, (_, i) => {
          const x = 470 + i * 16;
          return `<g class="figure" transform="translate(${x}, 215)">
            <circle cx="0" cy="-10" r="4" fill="#e8e8e8"/>
            <rect x="-3" y="-5" width="6" height="13" rx="1" fill="#e8e8e8"/>
          </g>`;
        }).join("")}
      </g>

      <!-- Tram -->
      <g id="bridge-tram" transform="translate(60, 215)" style="transition: transform 1.8s cubic-bezier(0.4, 0, 0.6, 1);">
        <rect x="-30" y="-20" width="58" height="28" rx="3" fill="#e8e8e8" stroke="#1a1d28" stroke-width="1.5"/>
        <rect x="-30" y="-20" width="58" height="5" fill="#c9302c"/>
        <circle cx="-18" cy="12" r="4" fill="#1a1d28"/>
        <circle cx="18" cy="12" r="4" fill="#1a1d28"/>
      </g>

      <!-- Impact -->
      <g id="bridge-impact" opacity="0">
        <circle cx="0" cy="0" r="18" fill="#f56450" opacity="0.5"/>
        <circle cx="0" cy="0" r="10" fill="#f5c842"/>
      </g>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateBridge(svg, choice) {
    if (choice === "act") {
      later(() => {
        const man = svg.querySelector("#bridge-man");
        if (man) man.setAttribute("transform", "translate(300, 200) rotate(70)");
      }, 200);
      later(() => {
        const tram = svg.querySelector("#bridge-tram");
        if (tram) tram.setAttribute("transform", "translate(255, 215)");
      }, 800);
      later(() => {
        const impact = svg.querySelector("#bridge-impact");
        if (impact) {
          impact.setAttribute("transform", "translate(300, 215)");
          impact.style.opacity = "1";
          impact.style.transition = "opacity 0.5s ease";
        }
      }, 1900);
      later(() => {
        const impact = svg.querySelector("#bridge-impact");
        if (impact) impact.style.opacity = "0";
      }, 2600);
    } else if (choice === "wait") {
      later(() => {
        const tram = svg.querySelector("#bridge-tram");
        if (tram) tram.setAttribute("transform", "translate(500, 215)");
      }, 250);
      later(() => {
        const impact = svg.querySelector("#bridge-impact");
        if (impact) {
          impact.setAttribute("transform", "translate(490, 215)");
          impact.style.opacity = "1";
          impact.style.transition = "opacity 0.5s ease";
        }
        const five = svg.querySelector("#bridge-five");
        if (five) { five.style.opacity = "0.3"; five.style.transition = "opacity 0.5s ease"; }
      }, 2000);
      later(() => {
        const impact = svg.querySelector("#bridge-impact");
        if (impact) impact.style.opacity = "0";
      }, 2700);
    }
  }

  // ---------- 3. MEDECIN ----------
  function buildMedecin(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-medecin">
      <defs>
        <linearGradient id="med-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a2026"/>
          <stop offset="100%" stop-color="#0d1216"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#med-bg)"/>

      <!-- Cardiac monitor frame -->
      <rect x="120" y="50" width="360" height="140" rx="6" fill="#0a0e12" stroke="#3a4a52" stroke-width="2"/>
      <rect x="130" y="60" width="340" height="120" rx="3" fill="#000508"/>

      <!-- Grid lines -->
      ${Array.from({length: 9}, (_, i) => {
        const x = 130 + (i+1) * 34;
        return `<line x1="${x}" y1="60" x2="${x}" y2="180" stroke="#0d3a30" stroke-width="0.4"/>`;
      }).join("")}
      ${Array.from({length: 5}, (_, i) => {
        const y = 60 + (i+1) * 20;
        return `<line x1="130" y1="${y}" x2="470" y2="${y}" stroke="#0d3a30" stroke-width="0.4"/>`;
      }).join("")}

      <!-- ECG line - normal pattern -->
      <polyline id="med-ecg" points="130,120 180,120 200,120 210,100 215,80 220,150 225,120 250,120 290,120 300,100 305,80 310,150 315,120 350,120 390,120 400,100 405,80 410,150 415,120 470,120" 
        fill="none" stroke="#4ade80" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
        style="transition: stroke 1s ease, opacity 1s ease;"/>

      <!-- Labels -->
      <text x="140" y="76" font-family="monospace" font-size="10" fill="#4ade80">PATIENT ${escapeXml(scenario.variantName || "").slice(0, 18)}</text>
      <text x="140" y="172" font-family="monospace" font-size="9" fill="#4ade80" opacity="0.7">BPM 72 · SPO2 98%</text>

      <!-- Patient icon -->
      <g transform="translate(60, 130)">
        <circle cx="0" cy="-15" r="10" fill="#e8e8e8"/>
        <rect x="-15" y="-3" width="30" height="22" rx="2" fill="#e8e8e8" opacity="0.6"/>
        <line x1="-15" y1="0" x2="15" y2="0" stroke="#e74c3c" stroke-width="1.5"/>
      </g>

      <!-- 5 silhouettes -->
      <g id="med-five" transform="translate(530, 130)">
        ${Array.from({length: 5}, (_, i) => {
          const offset = i * 4 - 8;
          return `<g class="figure" transform="translate(${offset}, ${offset})">
            <circle cx="0" cy="-12" r="6" fill="#e8e8e8" opacity="${0.4 + i*0.1}"/>
            <rect x="-5" y="-6" width="10" height="14" rx="1" fill="#e8e8e8" opacity="${0.4 + i*0.1}"/>
          </g>`;
        }).join("")}
      </g>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateMedecin(svg, choice) {
    const ecg = svg.querySelector("#med-ecg");
    if (choice === "act") {
      // The healthy patient (left) flatlines
      later(() => {
        if (ecg) {
          ecg.setAttribute("points", "130,120 470,120");
          ecg.setAttribute("stroke", "#e74c3c");
        }
      }, 600);
    } else if (choice === "wait") {
      // The 5 patients fade
      later(() => {
        const five = svg.querySelector("#med-five");
        if (five) { five.style.opacity = "0.3"; five.style.transition = "opacity 0.8s ease"; }
        if (ecg) ecg.style.opacity = "0.4";
      }, 800);
    }
  }

  // ---------- 4. JUSTICE ----------
  function buildJustice(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-justice">
      <defs>
        <linearGradient id="jus-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a1410"/>
          <stop offset="100%" stop-color="#0c0a08"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#jus-bg)"/>

      <!-- Hard top light -->
      <ellipse cx="${W/2}" cy="0" rx="200" ry="140" fill="rgba(245, 200, 100, 0.07)"/>

      <!-- Floor -->
      <line x1="0" y1="230" x2="${W}" y2="230" stroke="#3d3528" stroke-width="1"/>
      <rect x="0" y="230" width="${W}" height="50" fill="#0c0a08"/>

      <!-- Balance scale -->
      <g transform="translate(${W/2}, 130)">
        <line x1="0" y1="0" x2="0" y2="60" stroke="#a08850" stroke-width="3"/>
        <ellipse cx="0" cy="65" rx="20" ry="3" fill="#a08850"/>
        <g id="jus-beam" style="transform-origin: 0 0; transition: transform 0.7s ease;">
          <line x1="-70" y1="0" x2="70" y2="0" stroke="#a08850" stroke-width="2.5"/>
          <!-- Left pan -->
          <g transform="translate(-70, 0)">
            <line x1="0" y1="0" x2="-12" y2="20" stroke="#a08850" stroke-width="1"/>
            <line x1="0" y1="0" x2="12" y2="20" stroke="#a08850" stroke-width="1"/>
            <path d="M -16 22 Q 0 30 16 22 L 14 26 Q 0 32 -14 26 Z" fill="#a08850"/>
          </g>
          <!-- Right pan -->
          <g transform="translate(70, 0)">
            <line x1="0" y1="0" x2="-12" y2="20" stroke="#a08850" stroke-width="1"/>
            <line x1="0" y1="0" x2="12" y2="20" stroke="#a08850" stroke-width="1"/>
            <path d="M -16 22 Q 0 30 16 22 L 14 26 Q 0 32 -14 26 Z" fill="#a08850"/>
          </g>
        </g>
      </g>

      <!-- Gavel (top right) -->
      <g id="jus-gavel" transform="translate(${W-80}, 80) rotate(-30)" style="transform-origin: ${W-80}px 80px; transition: transform 0.3s ease;">
        <rect x="-30" y="-5" width="35" height="10" rx="2" fill="#5d4530" stroke="#3d2820" stroke-width="1"/>
        <line x1="5" y1="0" x2="40" y2="0" stroke="#3d2820" stroke-width="3" stroke-linecap="round"/>
      </g>
      <!-- Anvil block -->
      <rect x="${W-100}" y="115" width="50" height="10" fill="#5d4530"/>

      <!-- Defendant silhouette -->
      <g transform="translate(80, 195)">
        <circle cx="0" cy="-20" r="9" fill="#3d3528" stroke="#5d4530" stroke-width="1"/>
        <path d="M -12 -10 L -14 30 L 14 30 L 12 -10 Z" fill="#3d3528" stroke="#5d4530" stroke-width="1"/>
      </g>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateJustice(svg, choice) {
    const beam = svg.querySelector("#jus-beam");
    const gavel = svg.querySelector("#jus-gavel");
    if (choice === "act") {
      // Gavel strikes
      later(() => {
        if (gavel) gavel.style.transform = "rotate(15deg)";
        window.Sfx && window.Sfx.play("justice");
      }, 400);
      later(() => {
        if (gavel) gavel.style.transform = "rotate(-30deg)";
      }, 700);
      // Balance tips toward "guilty"
      later(() => {
        if (beam) beam.style.transform = "rotate(-12deg)";
      }, 900);
    } else if (choice === "wait") {
      // Balance settles to right (acquit)
      later(() => {
        if (beam) beam.style.transform = "rotate(8deg)";
      }, 400);
    }
  }

  // ---------- 5. IA ----------
  function buildIA(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-ia">
      <rect width="${W}" height="${H}" fill="#020812"/>

      <!-- Algorithmic grid -->
      <g opacity="0.3">
        ${Array.from({length: 20}, (_, i) => {
          const x = (i+1) * 30;
          return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#0a3a5a" stroke-width="0.5"/>`;
        }).join("")}
        ${Array.from({length: 10}, (_, i) => {
          const y = (i+1) * 28;
          return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#0a3a5a" stroke-width="0.5"/>`;
        }).join("")}
      </g>

      <!-- Central digital eye -->
      <g id="ia-eye" transform="translate(${W/2}, ${H/2})">
        <ellipse cx="0" cy="0" rx="90" ry="50" fill="#020812" stroke="#0eb6e6" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="38" fill="#020812" stroke="#0eb6e6" stroke-width="2"/>
        <circle cx="0" cy="0" r="22" fill="#0eb6e6" opacity="0.15"/>
        <circle id="ia-pupil" cx="0" cy="0" r="12" fill="#0eb6e6" style="transition: r 0.4s ease, fill 0.4s ease;"/>
        <!-- Scanning ring -->
        <circle cx="0" cy="0" r="60" fill="none" stroke="#0eb6e6" stroke-width="0.5" stroke-dasharray="3,5" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite"/>
        </circle>
      </g>

      <!-- Data markers -->
      <g id="ia-markers" opacity="0.5">
        <rect x="60" y="50" width="60" height="14" fill="none" stroke="#0eb6e6" stroke-width="0.8"/>
        <text x="65" y="60" font-family="monospace" font-size="8" fill="#0eb6e6">99% MATCH</text>
        <rect x="${W-130}" y="200" width="70" height="14" fill="none" stroke="#0eb6e6" stroke-width="0.8"/>
        <text x="${W-125}" y="210" font-family="monospace" font-size="8" fill="#0eb6e6">PREDICTION</text>
      </g>

      <!-- Verdict text (hidden) -->
      <text id="ia-verdict" x="${W/2}" y="${H-50}" text-anchor="middle" font-family="monospace" font-size="14" fill="#0eb6e6" opacity="0"></text>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateIA(svg, choice) {
    const pupil = svg.querySelector("#ia-pupil");
    const verdict = svg.querySelector("#ia-verdict");
    window.Sfx && window.Sfx.play("ia");
    if (choice === "act") {
      later(() => {
        if (pupil) {
          pupil.setAttribute("r", "20");
          pupil.setAttribute("fill", "#e74c3c");
        }
      }, 400);
      later(() => {
        if (verdict) {
          verdict.textContent = "VERDICT: EXÉCUTÉ";
          verdict.style.transition = "opacity 0.6s ease";
          verdict.style.opacity = "1";
        }
      }, 900);
    } else if (choice === "wait") {
      later(() => {
        if (pupil) {
          pupil.setAttribute("r", "8");
          pupil.setAttribute("fill", "#4ade80");
        }
      }, 400);
      later(() => {
        if (verdict) {
          verdict.textContent = "ALGORITHME IGNORÉ";
          verdict.setAttribute("fill", "#4ade80");
          verdict.style.transition = "opacity 0.6s ease";
          verdict.style.opacity = "1";
        }
      }, 900);
    }
  }

  // ---------- 6. ARGENT ----------
  function buildArgent(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-argent">
      <defs>
        <linearGradient id="arg-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a1208"/>
          <stop offset="100%" stop-color="#0c0a06"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#arg-bg)"/>
      <ellipse cx="${W/2}" cy="${H/2}" rx="200" ry="80" fill="rgba(245, 180, 50, 0.04)"/>

      <!-- Balance scale -->
      <g transform="translate(${W/2}, ${H/2 - 20})">
        <line x1="0" y1="0" x2="0" y2="80" stroke="#c9a851" stroke-width="3"/>
        <ellipse cx="0" cy="85" rx="25" ry="4" fill="#c9a851"/>
        <g id="arg-beam" style="transform-origin: 0 0; transition: transform 0.8s cubic-bezier(0.4, 0, 0.6, 1);">
          <line x1="-90" y1="0" x2="90" y2="0" stroke="#c9a851" stroke-width="2.5"/>
          <line x1="-90" y1="0" x2="-90" y2="35" stroke="#c9a851" stroke-width="0.8"/>
          <line x1="90" y1="0" x2="90" y2="35" stroke="#c9a851" stroke-width="0.8"/>
          <!-- Left pan with $ stack -->
          <g transform="translate(-90, 35)">
            <ellipse cx="0" cy="0" rx="25" ry="4" fill="#c9a851"/>
            <rect x="-15" y="-18" width="30" height="6" fill="#5a9858" stroke="#3a7838" stroke-width="0.5"/>
            <rect x="-15" y="-12" width="30" height="6" fill="#5a9858" stroke="#3a7838" stroke-width="0.5"/>
            <rect x="-15" y="-6" width="30" height="6" fill="#5a9858" stroke="#3a7838" stroke-width="0.5"/>
            <text x="0" y="-9" text-anchor="middle" font-size="9" fill="#3a4838" font-weight="bold">€</text>
          </g>
          <!-- Right pan with heart -->
          <g transform="translate(90, 35)">
            <ellipse cx="0" cy="0" rx="25" ry="4" fill="#c9a851"/>
            <path d="M -10 -10 C -10 -15 -5 -18 0 -13 C 5 -18 10 -15 10 -10 L 0 -2 Z" fill="#c9302c"/>
          </g>
        </g>
      </g>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateArgent(svg, choice) {
    const beam = svg.querySelector("#arg-beam");
    window.Sfx && window.Sfx.play("argent");
    if (choice === "act") {
      later(() => { if (beam) beam.style.transform = "rotate(-12deg)"; }, 300);
    } else if (choice === "wait") {
      later(() => { if (beam) beam.style.transform = "rotate(12deg)"; }, 300);
    }
  }

  // ---------- 7. FAMILLE ----------
  function buildFamille(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-famille">
      <defs>
        <radialGradient id="fam-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#3d2818" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0e0a08"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="#0e0a08"/>
      <rect width="${W}" height="${H}" fill="url(#fam-bg)"/>

      <!-- Photo frame -->
      <g id="fam-frame" transform="translate(${W/2}, ${H/2})">
        <rect x="-100" y="-70" width="200" height="140" fill="#6d4a28" stroke="#a08050" stroke-width="3"/>
        <rect x="-90" y="-60" width="180" height="120" fill="#1a1208"/>
        <!-- Family silhouettes (3 figures) -->
        <g transform="translate(0, 20)">
          <!-- Parent 1 -->
          <circle cx="-35" cy="-25" r="9" fill="#d8a865"/>
          <path d="M -50 -15 L -45 30 L -25 30 L -20 -15 Z" fill="#d8a865"/>
          <!-- Child -->
          <circle cx="0" cy="-15" r="7" fill="#d8a865"/>
          <path d="M -10 -8 L -8 30 L 8 30 L 10 -8 Z" fill="#d8a865"/>
          <!-- Parent 2 -->
          <circle cx="35" cy="-25" r="9" fill="#d8a865"/>
          <path d="M 20 -15 L 25 30 L 45 30 L 50 -15 Z" fill="#d8a865"/>
        </g>
        <!-- Crack (hidden initially) -->
        <polyline id="fam-crack" points="-70,-50 -30,-20 -20,10 10,30 30,55 60,68" 
          stroke="#1a1208" stroke-width="2" fill="none" opacity="0" 
          style="transition: opacity 0.5s ease;"/>
        <polyline id="fam-crack2" points="-30,-20 -50,0 -40,30" 
          stroke="#1a1208" stroke-width="1.5" fill="none" opacity="0" 
          style="transition: opacity 0.5s ease;"/>
      </g>

      <!-- Warm light fading -->
      <ellipse id="fam-light" cx="${W/2}" cy="80" rx="180" ry="60" 
        fill="rgba(245, 180, 100, 0.15)" 
        style="transition: opacity 1s ease;"/>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateFamille(svg, choice) {
    window.Sfx && window.Sfx.play("famille");
    if (choice === "act") {
      later(() => {
        const c1 = svg.querySelector("#fam-crack");
        const c2 = svg.querySelector("#fam-crack2");
        if (c1) c1.style.opacity = "1";
        if (c2) c2.style.opacity = "1";
        const light = svg.querySelector("#fam-light");
        if (light) light.style.opacity = "0.3";
      }, 500);
    } else if (choice === "wait") {
      // Light dims slowly — preserving the illusion
      later(() => {
        const light = svg.querySelector("#fam-light");
        if (light) light.style.opacity = "0.5";
      }, 500);
    }
  }

  // ---------- 8. GUERRE ----------
  function buildGuerre(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-guerre">
      <defs>
        <pattern id="guerre-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4d5040" stroke-width="0.4"/>
        </pattern>
      </defs>
      <rect width="${W}" height="${H}" fill="#1c1f15"/>
      <rect width="${W}" height="${H}" fill="url(#guerre-grid)" opacity="0.6"/>

      <!-- Tactical map -->
      <g opacity="0.5">
        <!-- Coastlines -->
        <path d="M 100 80 Q 150 60 220 90 Q 290 70 340 110 Q 380 130 430 100 Q 480 80 510 120" 
          stroke="#6d8050" stroke-width="1.2" fill="none"/>
        <path d="M 80 180 Q 150 200 200 175 Q 260 200 310 180 Q 360 200 420 170 Q 480 195 520 170" 
          stroke="#6d8050" stroke-width="1.2" fill="none"/>
      </g>

      <!-- Position markers -->
      <g id="guerre-marker-left">
        <rect x="120" y="120" width="14" height="14" fill="none" stroke="#5c7a30" stroke-width="1.5"/>
        <line x1="124" y1="124" x2="130" y2="130" stroke="#5c7a30" stroke-width="1.5"/>
        <line x1="130" y1="124" x2="124" y2="130" stroke="#5c7a30" stroke-width="1.5"/>
      </g>
      <g id="guerre-marker-target" transform="translate(450, 150)">
        <circle cx="0" cy="0" r="14" fill="none" stroke="#c9302c" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="6" fill="#c9302c"/>
        <line x1="-20" y1="0" x2="20" y2="0" stroke="#c9302c" stroke-width="0.8"/>
        <line x1="0" y1="-20" x2="0" y2="20" stroke="#c9302c" stroke-width="0.8"/>
      </g>

      <!-- Radio comms (top-left) -->
      <g transform="translate(40, 50)">
        <rect x="0" y="0" width="100" height="30" rx="2" fill="#2a2d1f" stroke="#5c5040" stroke-width="1"/>
        <circle cx="10" cy="15" r="3" fill="#5c7a30"/>
        <text x="20" y="19" font-family="monospace" font-size="8" fill="#8da068">RADIO 32.1MHz</text>
        <line x1="0" y1="30" x2="100" y2="30" stroke="#5c5040" stroke-width="0.5"/>
        <g opacity="0.7">
          ${Array.from({length: 12}, (_, i) => `<rect x="${5 + i*7}" y="36" width="3" height="${4 + Math.random()*8}" fill="#8da068"/>`).join("")}
        </g>
      </g>

      <!-- Status text -->
      <text id="guerre-status" x="${W/2}" y="${H-40}" text-anchor="middle" font-family="monospace" font-size="13" fill="#8da068" letter-spacing="2"></text>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateGuerre(svg, choice) {
    window.Sfx && window.Sfx.play("guerre");
    const target = svg.querySelector("#guerre-marker-target");
    const status = svg.querySelector("#guerre-status");
    if (choice === "act") {
      // Pulse target
      later(() => {
        if (target) {
          target.style.transition = "transform 0.4s ease, opacity 0.4s ease";
          target.setAttribute("transform", "translate(450, 150) scale(1.5)");
        }
      }, 400);
      later(() => {
        if (target) {
          target.setAttribute("transform", "translate(450, 150) scale(0.3)");
          target.style.opacity = "0.3";
        }
        if (status) {
          status.textContent = "FRAPPE EXÉCUTÉE";
        }
      }, 1000);
    } else if (choice === "wait") {
      later(() => {
        if (status) status.textContent = "STAND BY";
      }, 500);
    }
  }

  // ---------- 9. SURVIE ----------
  function buildSurvie(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-survie">
      <defs>
        <radialGradient id="surv-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#3d2818" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0a0805"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="#0a0805"/>
      <rect width="${W}" height="${H}" fill="url(#surv-bg)"/>

      <!-- Bunker door -->
      <g transform="translate(${W/2}, ${H/2})">
        <!-- Door frame -->
        <rect x="-90" y="-100" width="180" height="200" rx="6" fill="#2d2520" stroke="#5d4530" stroke-width="3"/>
        <!-- Door panels -->
        <g id="surv-door-left" style="transform-origin: -85px 0px; transition: transform 1s cubic-bezier(0.5, 0, 0.7, 1);">
          <rect x="-85" y="-95" width="80" height="190" fill="#3d3528" stroke="#5d4530" stroke-width="1"/>
          <circle cx="-20" cy="0" r="6" fill="#a08050"/>
          <line x1="-80" y1="-50" x2="-10" y2="-50" stroke="#5d4530" stroke-width="1"/>
          <line x1="-80" y1="50" x2="-10" y2="50" stroke="#5d4530" stroke-width="1"/>
        </g>
        <g id="surv-door-right" style="transform-origin: 85px 0px; transition: transform 1s cubic-bezier(0.5, 0, 0.7, 1);">
          <rect x="5" y="-95" width="80" height="190" fill="#3d3528" stroke="#5d4530" stroke-width="1"/>
          <circle cx="20" cy="0" r="6" fill="#a08050"/>
          <line x1="10" y1="-50" x2="80" y2="-50" stroke="#5d4530" stroke-width="1"/>
          <line x1="10" y1="50" x2="80" y2="50" stroke="#5d4530" stroke-width="1"/>
        </g>
        <!-- Warning light -->
        <g id="surv-light">
          <circle cx="0" cy="-115" r="6" fill="#c9302c" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        </g>
      </g>

      <!-- Oxygen gauge (right) -->
      <g transform="translate(${W-60}, 100)">
        <text x="0" y="-10" text-anchor="middle" font-family="monospace" font-size="9" fill="#f5c842" letter-spacing="1">O2</text>
        <rect x="-12" y="0" width="24" height="80" fill="none" stroke="#f5c842" stroke-width="1.5"/>
        <rect id="surv-o2" x="-10" y="2" width="20" height="76" fill="#f5c842" opacity="0.6" 
          style="transition: height 1.5s ease, y 1.5s ease;"/>
      </g>

      <!-- People (left side) -->
      <g transform="translate(60, ${H/2})">
        <g class="figure">
          <circle cx="0" cy="-10" r="7" fill="#e8e8e8"/>
          <path d="M -8 -3 L -8 30 L 8 30 L 8 -3 Z" fill="#e8e8e8"/>
        </g>
        <g class="figure" transform="translate(20, 0)">
          <circle cx="0" cy="-10" r="7" fill="#e8e8e8" opacity="0.5"/>
          <path d="M -8 -3 L -8 30 L 8 30 L 8 -3 Z" fill="#e8e8e8" opacity="0.5"/>
        </g>
      </g>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateSurvie(svg, choice) {
    window.Sfx && window.Sfx.play("survie");
    if (choice === "act") {
      // Doors close
      later(() => {
        const left = svg.querySelector("#surv-door-left");
        const right = svg.querySelector("#surv-door-right");
        if (left) left.style.transform = "scaleX(1)";
        if (right) right.style.transform = "scaleX(1)";
      }, 400);
      // Oxygen drops
      later(() => {
        const o2 = svg.querySelector("#surv-o2");
        if (o2) { o2.setAttribute("y", "60"); o2.setAttribute("height", "18"); }
      }, 1200);
    } else if (choice === "wait") {
      // Doors stay open, O2 drops faster
      later(() => {
        const o2 = svg.querySelector("#surv-o2");
        if (o2) { o2.setAttribute("y", "78"); o2.setAttribute("height", "0"); o2.setAttribute("fill", "#c9302c"); }
      }, 600);
    }
  }

  // ---------- 10. MENSONGE ----------
  function buildMensonge(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-mensonge">
      <defs>
        <linearGradient id="mens-bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="50%" stop-color="#2a2520"/>
          <stop offset="50%" stop-color="#0a0a0a"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#mens-bg)"/>

      <!-- Central face / mirror split -->
      <g transform="translate(${W/2}, ${H/2})">
        <!-- Mirror frame -->
        <ellipse cx="0" cy="0" rx="100" ry="120" fill="none" stroke="#c9a851" stroke-width="3"/>
        <ellipse cx="0" cy="0" rx="95" ry="115" fill="none" stroke="#5d4530" stroke-width="1"/>
        
        <!-- Left half (truth) -->
        <g clip-path="inset(0 50% 0 0)">
          <circle cx="0" cy="-30" r="35" fill="#e8d8b8" stroke="#a89878" stroke-width="1"/>
          <circle cx="-12" cy="-35" r="3" fill="#1a1208"/>
          <line x1="-15" y1="-15" x2="-3" y2="-15" stroke="#1a1208" stroke-width="1.5"/>
        </g>
        <!-- Right half (lie) -->
        <g clip-path="inset(0 0 0 50%)">
          <circle cx="0" cy="-30" r="35" fill="#3d3528" stroke="#5d4530" stroke-width="1"/>
          <circle cx="12" cy="-35" r="3" fill="#5a5040"/>
          <line x1="3" y1="-15" x2="15" y2="-15" stroke="#5a5040" stroke-width="1.5"/>
        </g>
        <!-- Center crack -->
        <line id="mens-crack" x1="0" y1="-115" x2="0" y2="115" stroke="#0a0a0a" stroke-width="0" 
          style="transition: stroke-width 0.5s ease;"/>
      </g>

      <!-- Word-blur effect on right -->
      <g id="mens-text-right" opacity="0.4">
        <text x="${W*0.78}" y="50" text-anchor="middle" font-family="serif" font-size="11" fill="#7d7060" font-style="italic">"Tout va bien."</text>
        <text x="${W*0.78}" y="70" text-anchor="middle" font-family="serif" font-size="11" fill="#7d7060" font-style="italic">"Je vais bien."</text>
        <text x="${W*0.78}" y="90" text-anchor="middle" font-family="serif" font-size="11" fill="#7d7060" font-style="italic">"Ne t'en fais pas."</text>
      </g>
      <g id="mens-text-left" opacity="0.4">
        <text x="${W*0.22}" y="50" text-anchor="middle" font-family="serif" font-size="11" fill="#c9a851">"La vérité, c'est..."</text>
        <text x="${W*0.22}" y="70" text-anchor="middle" font-family="serif" font-size="11" fill="#c9a851">"Tu dois savoir."</text>
        <text x="${W*0.22}" y="90" text-anchor="middle" font-family="serif" font-size="11" fill="#c9a851">"Je ne peux plus."</text>
      </g>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateMensonge(svg, choice) {
    window.Sfx && window.Sfx.play("mensonge");
    const crack = svg.querySelector("#mens-crack");
    if (choice === "act") {
      // Truth wins — left side glows, crack appears
      later(() => {
        if (crack) crack.style.strokeWidth = "3";
        const txt = svg.querySelector("#mens-text-left");
        if (txt) { txt.style.transition = "opacity 0.5s ease"; txt.style.opacity = "1"; }
        const right = svg.querySelector("#mens-text-right");
        if (right) { right.style.transition = "opacity 0.5s ease"; right.style.opacity = "0.1"; }
      }, 500);
    } else if (choice === "wait") {
      // Lie persists, right side dominates
      later(() => {
        const right = svg.querySelector("#mens-text-right");
        if (right) { right.style.transition = "opacity 0.5s ease"; right.style.opacity = "0.9"; }
        const left = svg.querySelector("#mens-text-left");
        if (left) { left.style.transition = "opacity 0.5s ease"; left.style.opacity = "0.1"; }
      }, 500);
    }
  }

  // ---------- 11. PUNITION ----------
  function buildPunition(scenario) {
    const figures = [];
    const rows = 4, cols = 8;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 100 + c * 50;
        const y = 80 + r * 35;
        const isGuilty = (r === 1 && c === 3); // one marked
        figures.push(`<g class="figure" data-guilty="${isGuilty}" transform="translate(${x}, ${y})">
          <circle cx="0" cy="-8" r="6" fill="${isGuilty ? '#c9302c' : '#7d7060'}" opacity="${isGuilty ? 1 : 0.5}"/>
          <path d="M -7 -2 L -7 20 L 7 20 L 7 -2 Z" fill="${isGuilty ? '#c9302c' : '#7d7060'}" opacity="${isGuilty ? 1 : 0.5}"/>
        </g>`);
      }
    }
    return `<svg ${baseAttrs} class="scene-svg scene-punition">
      <defs>
        <radialGradient id="pun-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#1d1d22"/>
          <stop offset="100%" stop-color="#0a0a0e"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#pun-bg)"/>

      <!-- Crowd group -->
      <g id="pun-crowd">${figures.join("")}</g>

      <!-- Spotlight ring on guilty -->
      <circle id="pun-spotlight" cx="250" cy="115" r="0" fill="none" stroke="#f5c842" stroke-width="2" opacity="0.7"
        style="transition: r 0.6s ease, opacity 0.6s ease;"/>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animatePunition(svg, choice) {
    window.Sfx && window.Sfx.play("punition");
    if (choice === "act") {
      // All fade together (collective punishment)
      later(() => {
        const figures = svg.querySelectorAll("#pun-crowd .figure");
        figures.forEach((f, i) => {
          f.style.transition = `opacity 0.6s ease ${i * 30}ms`;
          f.style.opacity = "0.25";
        });
      }, 400);
    } else if (choice === "wait") {
      // Spotlight on the guilty
      later(() => {
        const spot = svg.querySelector("#pun-spotlight");
        if (spot) {
          spot.setAttribute("r", "30");
          spot.style.opacity = "1";
        }
        const figures = svg.querySelectorAll("#pun-crowd .figure");
        figures.forEach(f => {
          if (f.getAttribute("data-guilty") !== "true") {
            f.style.transition = "opacity 0.6s ease";
            f.style.opacity = "0.7";
          }
        });
      }, 400);
    }
  }

  // ---------- 12. ANIMAUX ----------
  function buildAnimaux(scenario) {
    return `<svg ${baseAttrs} class="scene-svg scene-animaux">
      <defs>
        <radialGradient id="ani-bg" cx="50%" cy="60%" r="70%">
          <stop offset="0%" stop-color="#1a2818"/>
          <stop offset="100%" stop-color="#0a0a0a"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#ani-bg)"/>

      <!-- Ground -->
      <line x1="0" y1="230" x2="${W}" y2="230" stroke="#3d4828" stroke-width="0.5"/>

      <!-- Human (left) -->
      <g id="ani-human" transform="translate(180, 200)" style="transition: opacity 0.8s ease, transform 0.8s ease;">
        <circle cx="0" cy="-50" r="14" fill="#e8d8b8" stroke="#a89878" stroke-width="1"/>
        <path d="M -15 -38 L -18 30 L 18 30 L 15 -38 Z" fill="#e8d8b8" stroke="#a89878" stroke-width="1"/>
        <line x1="-15" y1="-25" x2="-25" y2="-5" stroke="#e8d8b8" stroke-width="2.5"/>
        <line x1="15" y1="-25" x2="25" y2="-5" stroke="#e8d8b8" stroke-width="2.5"/>
      </g>

      <!-- Dog (right) -->
      <g id="ani-dog" transform="translate(420, 215)" style="transition: opacity 0.8s ease, transform 0.8s ease;">
        <!-- Body -->
        <ellipse cx="0" cy="0" rx="35" ry="14" fill="#a8704c"/>
        <!-- Head -->
        <circle cx="-30" cy="-8" r="13" fill="#a8704c"/>
        <!-- Snout -->
        <ellipse cx="-43" cy="-5" rx="8" ry="5" fill="#a8704c"/>
        <circle cx="-46" cy="-7" r="1.5" fill="#1a1208"/>
        <!-- Ear -->
        <path d="M -38 -18 L -32 -22 L -28 -16 Z" fill="#7d5036"/>
        <!-- Tail -->
        <path d="M 30 -4 Q 50 -20 45 -28" fill="none" stroke="#a8704c" stroke-width="6" stroke-linecap="round"/>
        <!-- Legs -->
        <rect x="-22" y="10" width="4" height="14" fill="#a8704c"/>
        <rect x="-12" y="10" width="4" height="14" fill="#a8704c"/>
        <rect x="14" y="10" width="4" height="14" fill="#a8704c"/>
        <rect x="22" y="10" width="4" height="14" fill="#a8704c"/>
      </g>

      <!-- Heart between them (link) -->
      <g id="ani-heart" transform="translate(${W/2}, 130)" style="transition: opacity 0.8s ease, transform 0.8s ease;">
        <path d="M -10 -8 C -10 -14 -5 -16 0 -11 C 5 -16 10 -14 10 -8 L 0 2 Z" fill="#c9302c"/>
      </g>

      <!-- 5 anonymous people (background, right) -->
      <g id="ani-strangers" transform="translate(${W-90}, 195)" opacity="0.5">
        ${Array.from({length: 5}, (_, i) => `<g transform="translate(${i*12}, 0)">
          <circle cx="0" cy="-12" r="5" fill="#5d5040"/>
          <rect x="-4" y="-7" width="8" height="15" fill="#5d5040"/>
        </g>`).join("")}
      </g>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateAnimaux(svg, choice) {
    window.Sfx && window.Sfx.play("animaux");
    if (choice === "act") {
      // Save the 5 strangers, dog fades
      later(() => {
        const dog = svg.querySelector("#ani-dog");
        if (dog) { dog.style.opacity = "0.2"; }
        const heart = svg.querySelector("#ani-heart");
        if (heart) { heart.style.opacity = "0.2"; heart.style.transform = "translate(300, 130) scale(0.5)"; }
        const strangers = svg.querySelector("#ani-strangers");
        if (strangers) { strangers.style.transition = "opacity 0.8s ease"; strangers.style.opacity = "1"; }
      }, 500);
    } else if (choice === "wait") {
      // Save the dog, strangers fade
      later(() => {
        const strangers = svg.querySelector("#ani-strangers");
        if (strangers) { strangers.style.transition = "opacity 0.8s ease"; strangers.style.opacity = "0.15"; }
        const heart = svg.querySelector("#ani-heart");
        if (heart) { heart.style.transform = "translate(300, 130) scale(1.4)"; }
      }, 500);
    }
  }

  // ---------- 13. ABSURDE ----------
  function buildAbsurde(scenario) {
    const stars = Array.from({length: 60}, () => {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = 0.5 + Math.random() * 1.5;
      const op = 0.3 + Math.random() * 0.7;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8d8e8" opacity="${op}"/>`;
    });
    return `<svg ${baseAttrs} class="scene-svg scene-absurde">
      <defs>
        <radialGradient id="abs-bg" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#1a0e2a"/>
          <stop offset="100%" stop-color="#04020a"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#abs-bg)"/>

      <!-- Stars -->
      <g id="abs-stars">${stars.join("")}</g>

      <!-- Distant nebula -->
      <ellipse cx="${W*0.7}" cy="${H*0.3}" rx="100" ry="40" fill="rgba(180, 100, 200, 0.1)"/>
      <ellipse cx="${W*0.3}" cy="${H*0.7}" rx="80" ry="30" fill="rgba(100, 80, 200, 0.08)"/>

      <!-- The Button -->
      <g id="abs-button" transform="translate(${W/2}, ${H/2})">
        <circle cx="0" cy="0" r="50" fill="none" stroke="#c9a851" stroke-width="1" opacity="0.3"/>
        <circle cx="0" cy="0" r="40" fill="none" stroke="#c9a851" stroke-width="1" opacity="0.5"/>
        <circle cx="0" cy="0" r="32" fill="#5a3070" stroke="#c9a851" stroke-width="2"/>
        <circle id="abs-button-light" cx="0" cy="0" r="20" fill="#c9302c" opacity="0.8" style="transition: opacity 0.5s ease, r 0.8s ease;">
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
        <text x="0" y="4" text-anchor="middle" font-family="serif" font-size="10" fill="#1a0e2a" font-style="italic" font-weight="bold">N'APPUYEZ PAS</text>
      </g>

      <!-- Existential text -->
      <text id="abs-text" x="${W/2}" y="${H-40}" text-anchor="middle" font-family="serif" font-size="11" fill="#e8d8e8" font-style="italic" opacity="0.6" letter-spacing="2"></text>

      ${optionLabels(scenario)}
    </svg>`;
  }

  function animateAbsurde(svg, choice) {
    window.Sfx && window.Sfx.play("absurde");
    const text = svg.querySelector("#abs-text");
    const light = svg.querySelector("#abs-button-light");
    if (choice === "act") {
      // Press the button — stars start fading
      later(() => {
        if (light) light.setAttribute("r", "40");
        const stars = svg.querySelectorAll("#abs-stars circle");
        stars.forEach((s, i) => {
          s.style.transition = `opacity 1s ease ${i * 15}ms`;
          s.style.opacity = "0";
        });
      }, 500);
      later(() => {
        if (text) {
          text.textContent = "Quelque chose a basculé.";
          text.style.transition = "opacity 0.8s ease";
          text.style.opacity = "1";
        }
      }, 1500);
    } else if (choice === "wait") {
      // Stars remain, button dims slightly
      later(() => {
        if (light) light.style.opacity = "0.3";
        if (text) {
          text.textContent = "Rien n'a changé. Ou tout.";
          text.style.transition = "opacity 0.8s ease";
          text.style.opacity = "1";
        }
      }, 600);
    }
  }

  // ---------- REGISTRY ----------
  const registry = {
    lever:    { build: buildTrolley, animate: animateTrolley, sound: "lever" },
    bridge:   { build: buildBridge,  animate: animateBridge,  sound: "bridge" },
    medecin:  { build: buildMedecin, animate: animateMedecin, sound: "medecin" },
    justice:  { build: buildJustice, animate: animateJustice, sound: "justice" },
    ia:       { build: buildIA,      animate: animateIA,      sound: "ia" },
    argent:   { build: buildArgent,  animate: animateArgent,  sound: "argent" },
    famille:  { build: buildFamille, animate: animateFamille, sound: "famille" },
    guerre:   { build: buildGuerre,  animate: animateGuerre,  sound: "guerre" },
    survie:   { build: buildSurvie,  animate: animateSurvie,  sound: "survie" },
    mensonge: { build: buildMensonge, animate: animateMensonge, sound: "mensonge" },
    punition: { build: buildPunition, animate: animatePunition, sound: "punition" },
    animaux:  { build: buildAnimaux, animate: animateAnimaux, sound: "animaux" },
    absurde:  { build: buildAbsurde, animate: animateAbsurde, sound: "absurde" }
  };

  // ---------- PUBLIC API ----------
  function build(category, scenario) {
    clearPendingTimeouts();
    const entry = registry[category];
    const container = document.getElementById("scene-container");
    if (!container) return;
    if (!entry) {
      container.innerHTML = `<svg ${baseAttrs} class="scene-svg"><rect width="${W}" height="${H}" fill="#1a1d28"/><text x="${W/2}" y="${H/2}" text-anchor="middle" font-size="14" fill="#7a8090">Catégorie inconnue : ${escapeXml(category)}</text></svg>`;
      currentCategory = null;
      return;
    }
    container.innerHTML = entry.build(scenario);
    currentCategory = category;
    container.classList.toggle("scene-glitch-cat", category === "ia");
  }

  function animate(category, choice) {
    const entry = registry[category];
    const container = document.getElementById("scene-container");
    if (!entry || !container) return;
    const svg = container.querySelector(".scene-svg");
    if (!svg) return;
    // Honor prefers-reduced-motion: skip the animation, just dim the other side
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      svg.classList.add(choice === "act" ? "chose-act" : "chose-wait");
      return;
    }
    entry.animate(svg, choice);
    svg.classList.add(choice === "act" ? "chose-act" : "chose-wait");
  }

  function reset() {
    clearPendingTimeouts();
    const container = document.getElementById("scene-container");
    if (container) container.innerHTML = "";
    currentCategory = null;
  }

  function clear() {
    clearPendingTimeouts();
  }

  window.Scenes = { build, animate, reset, clear };
})();
