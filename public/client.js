// ===================== Le Dilemme — client.js =====================
(function() {

  // ===================== STATE =====================
  const socket = io();
  let myId = null, myName = null, currentRoom = null;
  let lastScenarioKey = null, lastRevealed = false, myVote = null;
  let pendingRevealTimer = null;
  let timerInterval = null;
  let heartbeatInterval = null;
  let endedGame = false;

  // Sound state
  let audioCtx = null;
  let soundEnabled = false;

  // ===================== DOM =====================
  const $ = id => document.getElementById(id);
  const lobby = $("lobby"), game = $("game");
  const hostNameInput = $("host-name"), guestCodeInput = $("guest-code"), guestNameInput = $("guest-name");
  const lobbyError = $("lobby-error");
  const roomCode = $("room-code"), roundLabel = $("round-label"), modeBadge = $("mode-badge");
  const playersBar = $("players-bar");
  const btnSound = $("btn-sound");
  const btnEndGame = $("btn-end-game");

  const sceneTrolley = $("scene-trolley"), sceneHospital = $("scene-hospital"), sceneAbstract = $("scene-abstract");
  const statusLine = $("status-line");
  const timerWrap = $("timer-wrap"), timerBar = $("timer-bar");

  const hostBetween = $("host-between"), guestWaiting = $("guest-waiting");
  const scenarioGrid = $("scenario-grid"), nextRoundNum = $("next-round-num");
  const selectMode = $("select-mode"), selectTimer = $("select-timer");

  const introCard = $("intro-card");
  const voteControls = $("vote-controls"), btnAct = $("btn-act"), btnWait = $("btn-wait");
  const voteConfirm = $("vote-confirm");
  const hostReveal = $("host-reveal"), hostNext = $("host-next");
  const revealCard = $("reveal-card");
  const finalAnalysis = $("final-analysis");
  const historySection = $("history-section"), historyList = $("history-list");

  // SVG elements
  const tram = $("tram"), leverArm = $("lever-arm"), leverKnob = $("lever-knob");
  const deviatedTrack = $("deviated-track"), leverStation = $("lever-station");
  const bridgeGroup = $("bridge-group"), bridgeMan = $("bridge-man");
  const operator = $("operator");
  const fivePeople = $("five-people"), onePerson = $("one-person");
  const impactBurst = $("impact-burst");
  const fivePatients = $("five-patients"), healthyPatient = $("healthy-patient");

  const abstractCategoryLabel = $("abstract-category-label");
  const abstractLeftCircle = $("abstract-left-circle"), abstractRightCircle = $("abstract-right-circle");
  const abstractLeftTexts = [$("abstract-left-text-1"), $("abstract-left-text-2"), $("abstract-left-text-3")];
  const abstractRightTexts = [$("abstract-right-text-1"), $("abstract-right-text-2"), $("abstract-right-text-3")];
  const abstractArrowLeft = $("abstract-arrow-left"), abstractArrowRight = $("abstract-arrow-right");

  // ===================== HELPERS =====================
  function isHost() {
    if (!currentRoom) return false;
    const me = currentRoom.players.find(p => p.id === myId);
    return me ? me.isHost : false;
  }
  function majorityChoice(votes) {
    if (!votes) return null;
    let a = 0, w = 0;
    Object.values(votes).forEach(v => { if (v === "act") a++; else if (v === "wait") w++; });
    if (a === 0 && w === 0) return null;
    return a > w ? "act" : "wait";
  }
  function show(el) { if (el) el.style.display = ""; }
  function hide(el) { if (el) el.style.display = "none"; }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function setSphereText(tspans, text) {
    const lines = (text || "").split("\n");
    for (let i = 0; i < tspans.length; i++) tspans[i].textContent = lines[i] || "";
  }
  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ===================== SOUND SYSTEM =====================
  function ensureAudioCtx() {
    if (audioCtx) return audioCtx;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio not supported");
      return null;
    }
    return audioCtx;
  }

  function playTone(freq, duration, type, gain) {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    g.gain.value = gain || 0.08;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  }

  function playNoise(duration, gain, filterFreq) {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain || 0.06;
    if (filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterFreq;
      source.connect(filter);
      filter.connect(g);
    } else {
      source.connect(g);
    }
    g.connect(ctx.destination);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.start();
  }

  function playClick() { playTone(800, 0.04, "square", 0.04); }
  function playVote() { playTone(660, 0.12, "sine", 0.06); setTimeout(() => playTone(880, 0.08, "sine", 0.04), 60); }
  function playLever() { playTone(220, 0.08, "triangle", 0.1); setTimeout(() => playTone(180, 0.07, "sine", 0.07), 70); }
  function playImpact() {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.35);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    playNoise(0.15, 0.08, 800);
  }
  function playGlitch() {
    if (!soundEnabled) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.setValueAtTime(500, ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(1500, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(700, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
  function playTick() { playTone(1200, 0.025, "square", 0.03); }
  function playHeartbeat() {
    playTone(60, 0.1, "sine", 0.1);
    setTimeout(() => playTone(50, 0.08, "sine", 0.07), 130);
  }
  function playReveal() {
    playTone(440, 0.08, "sine", 0.05);
    setTimeout(() => playTone(330, 0.15, "sine", 0.05), 100);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? "🔊 Son" : "🔇 Son";
    btnSound.classList.toggle("active", soundEnabled);
    if (soundEnabled) {
      const ctx = ensureAudioCtx();
      if (ctx && ctx.state === "suspended") ctx.resume();
      playClick();
    }
  }
  btnSound.addEventListener("click", toggleSound);

  // ===================== LOBBY =====================
  function showLobby() {
    show(lobby); hide(game);
    try {
      const savedName = localStorage.getItem("dilemme-name");
      if (savedName) {
        if (!hostNameInput.value) hostNameInput.value = savedName;
        if (!guestNameInput.value) guestNameInput.value = savedName;
      }
    } catch (e) {}
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("room");
    if (codeFromUrl && !guestCodeInput.value) guestCodeInput.value = codeFromUrl.toUpperCase();
  }
  $("btn-create").addEventListener("click", () => {
    const name = hostNameInput.value.trim();
    if (!name) { lobbyError.textContent = "Choisissez un pseudo"; return; }
    lobbyError.textContent = "";
    try { localStorage.setItem("dilemme-name", name); } catch (e) {}
    socket.emit("create-room", name, res => {
      if (res.error) { lobbyError.textContent = res.error; return; }
      myId = res.myId; myName = name;
      const url = new URL(window.location);
      url.searchParams.set("room", res.code);
      window.history.replaceState({}, "", url);
    });
  });
  $("btn-join").addEventListener("click", () => {
    const code = guestCodeInput.value.trim().toUpperCase();
    const name = guestNameInput.value.trim();
    if (!code || !name) { lobbyError.textContent = "Code et pseudo requis"; return; }
    lobbyError.textContent = "";
    try { localStorage.setItem("dilemme-name", name); } catch (e) {}
    socket.emit("join-room", { code, name }, res => {
      if (res.error) { lobbyError.textContent = res.error; return; }
      myId = res.myId; myName = name;
      const url = new URL(window.location);
      url.searchParams.set("room", res.code);
      window.history.replaceState({}, "", url);
    });
  });
  hostNameInput.addEventListener("keydown", e => { if (e.key === "Enter") $("btn-create").click(); });
  guestNameInput.addEventListener("keydown", e => { if (e.key === "Enter") $("btn-join").click(); });
  guestCodeInput.addEventListener("keydown", e => { if (e.key === "Enter") guestNameInput.focus(); });

  // ===================== GAME ACTIONS =====================
  $("btn-copy-link").addEventListener("click", () => {
    if (!currentRoom) return;
    const url = new URL(window.location);
    url.searchParams.set("room", currentRoom.code);
    const link = url.toString();
    const btn = $("btn-copy-link");
    const orig = btn.textContent;
    const setOk = () => { btn.textContent = "✓ Copié"; setTimeout(() => btn.textContent = orig, 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(setOk).catch(() => prompt("Copiez ce lien :", link));
    } else prompt("Copiez ce lien :", link);
  });

  btnAct.addEventListener("click", () => {
    if (myVote) return;
    myVote = "act";
    playVote();
    socket.emit("vote", "act");
  });
  btnWait.addEventListener("click", () => {
    if (myVote) return;
    myVote = "wait";
    playVote();
    socket.emit("vote", "wait");
  });
  $("btn-reveal").addEventListener("click", () => {
    playClick();
    socket.emit("reveal");
  });
  $("btn-next-round").addEventListener("click", () => {
    playClick();
    socket.emit("next-round");
  });
  btnEndGame.addEventListener("click", () => {
    if (!confirm("Terminer la partie et afficher l'analyse finale ?")) return;
    socket.emit("end-game");
  });

  selectMode.addEventListener("change", () => {
    socket.emit("set-mode", selectMode.value);
  });
  selectTimer.addEventListener("change", () => {
    socket.emit("set-timer", parseInt(selectTimer.value, 10) || 0);
  });

  // ===================== TIMER =====================
  function clearTimerUI() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
    timerWrap.classList.remove("active");
    timerBar.style.width = "100%";
    timerBar.classList.remove("warning", "danger");
  }

  function startTimerUI(durationSec, startedAt) {
    clearTimerUI();
    if (!durationSec || durationSec <= 0) return;
    timerWrap.classList.add("active");
    const startMs = startedAt || Date.now();
    const endMs = startMs + durationSec * 1000;
    let lastTickSecond = -1;
    let lastHeartbeat = 0;
    function update() {
      const now = Date.now();
      const remaining = Math.max(0, endMs - now);
      const pct = (remaining / (durationSec * 1000)) * 100;
      timerBar.style.width = pct + "%";
      timerBar.classList.toggle("warning", pct < 50 && pct >= 25);
      timerBar.classList.toggle("danger", pct < 25);
      const sec = Math.ceil(remaining / 1000);
      if (sec !== lastTickSecond) {
        lastTickSecond = sec;
        if (sec > 0 && sec <= 5) playTick();
      }
      // Heartbeat in danger zone
      if (pct < 25 && pct > 0 && now - lastHeartbeat > 700) {
        playHeartbeat();
        lastHeartbeat = now;
      }
      if (remaining <= 0) {
        clearTimerUI();
        // Lock vote if player hasn't voted
        if (!myVote && currentRoom && currentRoom.currentScenario && !currentRoom.revealed) {
          myVote = "abstention";
          btnAct.disabled = true;
          btnWait.disabled = true;
          statusLine.textContent = "Temps écoulé — vous êtes en abstention.";
          // Tell server about abstention (server will treat it as a vote that doesn't count for act/wait but locks the slot)
          socket.emit("vote", "abstention");
        }
      }
    }
    timerInterval = setInterval(update, 100);
    update();
  }

  // ===================== SCENE SWAP =====================
  function showScene(family, variant) {
    hide(sceneTrolley); hide(sceneHospital); hide(sceneAbstract);
    if (family === "hospital") { show(sceneHospital); return; }
    if (family === "abstract") { show(sceneAbstract); return; }
    show(sceneTrolley);
    if (variant === "bridge") {
      deviatedTrack.style.display = "none"; leverStation.style.display = "none";
      operator.style.display = "none"; onePerson.style.display = "none";
      bridgeGroup.style.display = "";
    } else {
      deviatedTrack.style.display = ""; leverStation.style.display = "";
      operator.style.display = ""; onePerson.style.display = "";
      bridgeGroup.style.display = "none";
    }
  }
  function resetScene(scenarioKey) {
    const sc = window.getScenario(scenarioKey);
    if (!sc) return;
    showScene(sc.family, sc.sceneVariant);

    // Remove visual effects
    [sceneTrolley, sceneHospital, sceneAbstract].forEach(s => {
      if (s) s.classList.remove("tremor", "glitch");
    });

    tram.style.transition = "none";
    tram.setAttribute("transform", "translate(105, 225)");
    void tram.getBoundingClientRect();
    tram.style.transition = "";
    leverArm.setAttribute("transform", "rotate(-25)");
    leverKnob.setAttribute("fill", "#B73B2D");
    bridgeMan.style.transition = "none";
    bridgeMan.setAttribute("transform", "translate(400, 150)");
    void bridgeMan.getBoundingClientRect();
    bridgeMan.style.transition = "";

    document.querySelectorAll(".victim").forEach(v => v.classList.remove("fallen"));
    impactBurst.classList.remove("show");
    const qm = $("question-mark"); if (qm) qm.style.opacity = "1";
    const qm2 = $("question-mark-2"); if (qm2) qm2.style.opacity = "1";
    const qm3 = $("question-mark-3"); if (qm3) qm3.style.opacity = "1";

    if (sc.family === "abstract") {
      abstractCategoryLabel.textContent = sc.categoryLabel || "";
      const sl = sc.shortLabels || { act: "", wait: "" };
      setSphereText(abstractLeftTexts, sl.act);
      setSphereText(abstractRightTexts, sl.wait);
      abstractLeftCircle.classList.remove("chosen", "unchosen");
      abstractRightCircle.classList.remove("chosen", "unchosen");
      abstractArrowLeft.classList.remove("show");
      abstractArrowRight.classList.remove("show");
    }
  }

  // ===================== ANIMATIONS =====================
  function showImpactBurst(x, y) {
    impactBurst.setAttribute("transform", "translate(" + x + ", " + y + ")");
    impactBurst.classList.remove("show");
    void impactBurst.getBoundingClientRect();
    impactBurst.classList.add("show");
  }
  function applySceneEffects(scenarioKey) {
    const sc = window.getScenario(scenarioKey);
    if (!sc) return;
    const activeScene = sc.family === "hospital" ? sceneHospital
                      : sc.family === "abstract" ? sceneAbstract
                      : sceneTrolley;
    if (sc.categoryKey === "ia") {
      activeScene.classList.add("glitch");
      playGlitch();
      setTimeout(() => activeScene.classList.remove("glitch"), 700);
    }
    if (sc.intensity === "dark") {
      activeScene.classList.add("tremor");
      setTimeout(() => activeScene.classList.remove("tremor"), 700);
    }
  }
  function playAnimation(scenarioKey, choice) {
    const sc = window.getScenario(scenarioKey);
    if (!sc) return;
    const qm = $("question-mark"); if (qm) qm.style.opacity = "0";
    const qm2 = $("question-mark-2"); if (qm2) qm2.style.opacity = "0";
    const qm3 = $("question-mark-3"); if (qm3) qm3.style.opacity = "0";
    applySceneEffects(scenarioKey);
    playReveal();
    if (sc.family === "hospital") return playHospitalAnimation(sc, choice);
    if (sc.family === "abstract") return playAbstractAnimation(sc, choice);
    if (sc.sceneVariant === "bridge") return playBridgeAnimation(sc, choice);
    return playTrolleyAnimation(sc, choice);
  }
  function playTrolleyAnimation(sc, choice) {
    if (choice === "act") {
      leverArm.setAttribute("transform", "rotate(30)");
      leverKnob.setAttribute("fill", "#4F7A3F");
      playLever();
      statusLine.textContent = sc.verbsPresent.act;
      setTimeout(() => {
        tram.style.transition = "transform 2.4s cubic-bezier(0.4, 0, 0.6, 1)";
        tram.setAttribute("transform", "translate(750, 138) rotate(-12)");
        statusLine.textContent = sc.verbsAfter.act;
      }, 500);
      setTimeout(() => {
        showImpactBurst(750, 144);
        playImpact();
        onePerson.querySelectorAll(".victim").forEach(v => v.classList.add("fallen"));
      }, 2700);
      setTimeout(() => statusLine.textContent = "Une personne touchée. Cinq sauvées.", 3100);
    } else if (choice === "wait") {
      statusLine.textContent = sc.verbsPresent.wait;
      setTimeout(() => {
        tram.style.transition = "transform 2.4s cubic-bezier(0.4, 0, 0.6, 1)";
        tram.setAttribute("transform", "translate(745, 225)");
        statusLine.textContent = sc.verbsAfter.wait;
      }, 400);
      setTimeout(() => {
        showImpactBurst(685, 248);
        playImpact();
        fivePeople.querySelectorAll(".victim").forEach(v => v.classList.add("fallen"));
      }, 2500);
      setTimeout(() => statusLine.textContent = "Cinq personnes touchées.", 2900);
    } else {
      statusLine.textContent = "Aucun choix majoritaire — abstention collective.";
    }
  }
  function playBridgeAnimation(sc, choice) {
    if (choice === "act") {
      statusLine.textContent = sc.verbsPresent.act;
      bridgeMan.style.transition = "transform 1s cubic-bezier(0.5, 0, 0.7, 1)";
      bridgeMan.setAttribute("transform", "translate(400, 240) rotate(20)");
      setTimeout(() => {
        statusLine.textContent = sc.verbsAfter.act;
        tram.style.transition = "transform 1.5s cubic-bezier(0.4, 0, 0.6, 1)";
        tram.setAttribute("transform", "translate(345, 225)");
      }, 1100);
      setTimeout(() => {
        showImpactBurst(400, 245);
        playImpact();
        bridgeMan.classList.add("fallen");
      }, 2600);
      setTimeout(() => statusLine.textContent = "Le tramway s'arrête. Cinq sauvées, un mort.", 3000);
    } else if (choice === "wait") {
      statusLine.textContent = sc.verbsPresent.wait;
      setTimeout(() => {
        tram.style.transition = "transform 2.4s cubic-bezier(0.4, 0, 0.6, 1)";
        tram.setAttribute("transform", "translate(745, 225)");
        statusLine.textContent = sc.verbsAfter.wait;
      }, 400);
      setTimeout(() => {
        showImpactBurst(685, 248);
        playImpact();
        fivePeople.querySelectorAll(".victim").forEach(v => v.classList.add("fallen"));
      }, 2500);
      setTimeout(() => statusLine.textContent = "Cinq personnes touchées.", 2900);
    } else {
      statusLine.textContent = "Aucun choix majoritaire.";
    }
  }
  function playHospitalAnimation(sc, choice) {
    if (choice === "act") {
      statusLine.textContent = sc.verbsPresent.act;
      setTimeout(() => {
        healthyPatient.querySelectorAll(".victim").forEach(v => v.classList.add("fallen"));
        playImpact();
        statusLine.textContent = sc.verbsAfter.act;
      }, 1100);
    } else if (choice === "wait") {
      statusLine.textContent = sc.verbsPresent.wait;
      setTimeout(() => {
        fivePatients.querySelectorAll(".victim").forEach(v => v.classList.add("fallen"));
        playImpact();
        statusLine.textContent = sc.verbsAfter.wait;
      }, 1300);
    } else {
      statusLine.textContent = "Aucun choix majoritaire.";
    }
  }
  function playAbstractAnimation(sc, choice) {
    if (choice === "act" || choice === "wait") {
      statusLine.textContent = choice === "act" ? sc.verbsPresent.act : sc.verbsPresent.wait;
      setTimeout(() => {
        if (choice === "act") {
          abstractArrowLeft.classList.add("show");
          abstractLeftCircle.classList.add("chosen");
          abstractRightCircle.classList.add("unchosen");
        } else {
          abstractArrowRight.classList.add("show");
          abstractRightCircle.classList.add("chosen");
          abstractLeftCircle.classList.add("unchosen");
        }
        statusLine.textContent = choice === "act" ? sc.verbsAfter.act : sc.verbsAfter.wait;
      }, 800);
    } else {
      statusLine.textContent = "Aucun choix majoritaire.";
    }
  }

  // ===================== RENDER =====================
  function render(state) {
    if (!state) { showLobby(); return; }
    currentRoom = state;
    hide(lobby); show(game);
    roomCode.textContent = state.code;
    roundLabel.textContent = state.round > 0 ? "· Tour " + state.round : "";

    // Mode badge
    if (state.mode && state.mode !== "classique") {
      modeBadge.textContent = state.mode === "psy" ? "Psychologique" : "Pression";
      modeBadge.className = "mode-badge " + state.mode;
      show(modeBadge);
    } else {
      hide(modeBadge);
    }

    // Sync host's selector values to room state
    if (state.mode && selectMode.value !== state.mode) selectMode.value = state.mode;
    if (state.timerDuration !== undefined && parseInt(selectTimer.value, 10) !== state.timerDuration) {
      selectTimer.value = String(state.timerDuration);
    }

    // Player chips with abstention markers
    playersBar.innerHTML = "";
    state.players.forEach(p => {
      const chip = document.createElement("span");
      let cls = "player-chip";
      if (p.id === myId) cls += " me";
      if (p.isHost) cls += " host";
      const playerVote = state.votes && state.votes[p.id];
      if (state.currentScenario && !state.revealed) {
        if (playerVote === "abstention") cls += " abstention";
        else if (p.hasVoted) cls += " voted";
      }
      chip.className = cls;
      chip.textContent = p.name + (p.isHost ? " (hôte)" : "");
      playersBar.appendChild(chip);
    });

    const host = isHost();
    const sc = state.currentScenario ? window.getScenario(state.currentScenario) : null;

    // Show end-game button to host
    if (host && state.round > 0 && !state.ended) show(btnEndGame); else hide(btnEndGame);

    if (state.currentScenario !== lastScenarioKey) {
      if (state.currentScenario) resetScene(state.currentScenario);
      lastScenarioKey = state.currentScenario;
      myVote = null;
      btnAct.disabled = false; btnWait.disabled = false;
      if (pendingRevealTimer) { clearTimeout(pendingRevealTimer); pendingRevealTimer = null; }
      clearTimerUI();
      // Start timer if applicable
      if (state.currentScenario && !state.revealed && state.timerDuration > 0 && state.roundStartedAt) {
        startTimerUI(state.timerDuration, state.roundStartedAt);
      }
    }

    if (state.currentScenario && !state.revealed) {
      const me = state.players.find(p => p.id === myId);
      const myStoredVote = state.votes && state.votes[myId];
      if (myStoredVote) myVote = myStoredVote;
      else if (!me || !me.hasVoted) myVote = null;
    }

    // Final analysis takes priority when ended
    if (state.ended) {
      hide(hostBetween); hide(guestWaiting); hide(introCard); hide(voteControls);
      hide(voteConfirm); hide(hostReveal); hide(revealCard); hide(hostNext);
      hide(btnEndGame);
      clearTimerUI();
      renderFinalAnalysis(state);
      show(finalAnalysis);
      statusLine.textContent = "";
    } else if (!state.currentScenario) {
      hide(introCard); hide(voteControls); hide(voteConfirm);
      hide(hostReveal); hide(hostNext); hide(revealCard); hide(finalAnalysis);
      if (state.round === 0) showScene("trolley", "classic");
      statusLine.textContent = "";
      if (host) {
        show(hostBetween); hide(guestWaiting);
        nextRoundNum.textContent = state.round + 1;
        renderScenarioGrid();
      } else {
        hide(hostBetween); show(guestWaiting);
      }
    } else if (!state.revealed) {
      hide(hostBetween); hide(guestWaiting); hide(revealCard); hide(hostNext); hide(finalAnalysis);
      show(introCard);
      renderIntroCard(sc);

      const me = state.players.find(p => p.id === myId);
      const iVoted = me && me.hasVoted;

      if (iVoted) {
        hide(voteControls); show(voteConfirm);
        if (myVote === "abstention") {
          voteConfirm.innerHTML = "<strong>Vous êtes en abstention.</strong> " + state.voteCount + " / " + state.players.length + " ont voté ou abstenu.";
        } else {
          voteConfirm.innerHTML = "<strong>Vote enregistré.</strong> " + state.voteCount + " / " + state.players.length + " ont voté.";
        }
      } else {
        show(voteControls); hide(voteConfirm);
        btnAct.textContent = sc.labels.act;
        btnWait.textContent = sc.labels.wait;
        btnAct.disabled = false; btnWait.disabled = false;
      }
      if (host && state.voteCount > 0) show(hostReveal); else hide(hostReveal);
      if (!myVote || myVote !== "abstention") {
        statusLine.textContent = state.voteCount === state.players.length
          ? "Tous ont voté. L'hôte peut révéler."
          : state.voteCount + " / " + state.players.length + " votes";
      }
    } else {
      hide(hostBetween); hide(guestWaiting); hide(voteControls);
      hide(voteConfirm); hide(hostReveal); hide(finalAnalysis);
      show(introCard);
      renderIntroCard(sc);

      if (!lastRevealed) {
        hide(revealCard);
        if (host) hide(hostNext);
        clearTimerUI();
        const majority = majorityChoice(state.votes);
        playAnimation(state.currentScenario, majority);
        if (pendingRevealTimer) clearTimeout(pendingRevealTimer);
        const delay = sc.family === "hospital" ? 2200 : (sc.family === "abstract" ? 2000 : 3400);
        pendingRevealTimer = setTimeout(() => {
          renderRevealCard(state, sc);
          show(revealCard);
          if (isHost()) show(hostNext);
          pendingRevealTimer = null;
        }, delay);
      } else {
        renderRevealCard(state, sc);
        show(revealCard);
        if (host) show(hostNext);
      }
    }
    lastRevealed = state.revealed;

    if (state.history && state.history.length > 0 && !state.ended) {
      show(historySection);
      renderHistory(state.history);
    } else if (!state.ended) hide(historySection);
  }

  function renderIntroCard(sc) {
    const intensity = sc.intensity || "moral";
    const intensityLabel = intensity === "dark" ? "INTENSE" : (intensity === "soft" ? "DOUX" : "MORAL");
    introCard.innerHTML =
      '<span class="intensity-tag ' + intensity + '">' + intensityLabel + '</span>' +
      '<span class="intro-title">' +
        '<span class="cat">' + escapeHtml(sc.categoryName) + '</span>' +
        '<span class="sep">—</span>' +
        '<span class="var">' + escapeHtml(sc.variantName) + '</span>' +
      '</span>' +
      '<span class="intro-body">' + escapeHtml(sc.intro) + '</span>';
  }

  function renderScenarioGrid() {
    scenarioGrid.innerHTML = "";
    Object.entries(window.CATEGORIES).forEach(([catKey, cat]) => {
      const variantsCount = Object.keys(cat.variants).length;
      const acc = document.createElement("div");
      acc.className = "category-accordion";

      const header = document.createElement("button");
      header.className = "category-header";
      header.type = "button";
      header.innerHTML =
        '<span><strong>' + escapeHtml(cat.name) + '</strong>' +
        ' <span class="theme">' + escapeHtml(cat.theme) + ' · ' + variantsCount + ' variantes</span></span>' +
        '<span class="chevron">▶</span>';
      header.addEventListener("click", () => acc.classList.toggle("open"));
      acc.appendChild(header);

      const list = document.createElement("div");
      list.className = "variant-list";
      Object.entries(cat.variants).forEach(([varKey, v]) => {
        const btn = document.createElement("button");
        btn.className = "variant-card";
        btn.type = "button";
        const intensity = v.intensity || "moral";
        btn.innerHTML =
          '<span class="variant-text"><strong>' + escapeHtml(v.name) + '</strong>' +
          '<small>' + escapeHtml(v.tagline) + '</small></span>' +
          '<span class="intensity-dot ' + intensity + '"></span>';
        btn.addEventListener("click", () => {
          playClick();
          socket.emit("start-round", catKey + ":" + varKey);
        });
        list.appendChild(btn);
      });
      acc.appendChild(list);
      scenarioGrid.appendChild(acc);
    });
  }

  function renderRevealCard(state, sc) {
    const votes = state.votes || {};
    const players = state.players;
    let html = '<h3>Résultats — Tour ' + state.round + ' · ' + escapeHtml(sc.categoryName) + ' : ' + escapeHtml(sc.variantName) + '</h3>';
    html += '<div class="votes-list">';
    players.forEach(p => {
      const choice = votes[p.id];
      if (!choice) {
        html += '<div class="vote-row abstention">'
          + '<span><strong>' + escapeHtml(p.name) + '</strong></span>'
          + '<span class="choice">(n\'a pas voté)</span></div>';
        return;
      }
      if (choice === "abstention") {
        html += '<div class="vote-row abstention">'
          + '<span><strong>' + escapeHtml(p.name) + '</strong></span>'
          + '<span class="choice">abstention</span></div>';
        return;
      }
      const label = choice === "act" ? sc.labels.act : sc.labels.wait;
      html += '<div class="vote-row ' + choice + '">'
        + '<span><strong>' + escapeHtml(p.name) + '</strong></span>'
        + '<span class="choice">' + escapeHtml(label) + '</span></div>';
    });
    html += '</div>';

    const counts = { act: 0, wait: 0, abstention: 0 };
    Object.values(votes).forEach(v => { if (counts[v] !== undefined) counts[v]++; });
    const totalChoices = counts.act + counts.wait;
    if (totalChoices > 0) {
      const pctAct = Math.round((counts.act / totalChoices) * 100);
      const pctWait = 100 - pctAct;
      html += '<div class="vote-stats">'
        + '<span class="stat-act">' + counts.act + ' agissent (' + pctAct + '%)</span>'
        + '<span class="stat-wait">' + counts.wait + ' attendent (' + pctWait + '%)</span>'
        + (counts.abstention > 0 ? '<span>' + counts.abstention + ' abstention</span>' : '')
        + '</div>';
    }

    // Sarcastic phrase
    const majority = majorityChoice(votes);
    if (majority && window.SARCASTIC_PHRASES && window.SARCASTIC_PHRASES[majority]) {
      const phrase = pickRandom(window.SARCASTIC_PHRASES[majority]);
      html += '<div class="sarcastic-phrase">' + escapeHtml(phrase) + '</div>';
    }

    // Phase phrase (unanimous / split / lone wolf)
    if (totalChoices >= 2) {
      let phaseKey = null;
      if (counts.act === totalChoices) phaseKey = "unanimous_act";
      else if (counts.wait === totalChoices) phaseKey = "unanimous_wait";
      else if (counts.act === 1 || counts.wait === 1) {
        // Lone wolf
        const loneChoice = counts.act === 1 ? "act" : "wait";
        const loneName = Object.entries(votes).find(([id, c]) => c === loneChoice && id !== "abstention");
        if (loneName) {
          const lonePlayer = players.find(p => p.id === loneName[0]);
          if (lonePlayer && window.PHASE_PHRASES.lone_wolf.length > 0) {
            const phraseFn = pickRandom(window.PHASE_PHRASES.lone_wolf);
            html += '<div class="sarcastic-phrase">' + escapeHtml(phraseFn(lonePlayer.name)) + '</div>';
          }
        }
      } else phaseKey = "split";
      if (phaseKey && window.PHASE_PHRASES[phaseKey]) {
        html += '<div class="sarcastic-phrase">' + escapeHtml(pickRandom(window.PHASE_PHRASES[phaseKey])) + '</div>';
      }
    }

    html += '<div class="philos-grid">';
    if (counts.act > 0) {
      const o = sc.outcomes.act;
      html += '<div class="philos-block act">'
        + '<span class="philos-tag">' + escapeHtml(o.tag) + '</span>'
        + '<h4>' + escapeHtml(o.title) + '</h4>'
        + '<p>' + escapeHtml(o.text) + '</p></div>';
    }
    if (counts.wait > 0) {
      const o = sc.outcomes.wait;
      html += '<div class="philos-block wait">'
        + '<span class="philos-tag">' + escapeHtml(o.tag) + '</span>'
        + '<h4>' + escapeHtml(o.title) + '</h4>'
        + '<p>' + escapeHtml(o.text) + '</p></div>';
    }
    html += '</div>';

    if (majority) {
      const outcome = sc.outcomes[majority];
      if (outcome.deaths !== undefined && outcome.saved !== undefined) {
        const label = counts.act === counts.wait ? "majorité par défaut (égalité)" : "choix majoritaire";
        html += '<div class="body-count">'
          + '<span class="deaths"><strong>' + outcome.deaths + '</strong> mort(s) — ' + label + '</span>'
          + '<span class="saved"><strong>' + outcome.saved + '</strong> sauvée(s)</span></div>';
      }
    }

    // In psychological mode, show contradiction alerts for the current player if relevant
    if (state.mode === "psy" && state.history && myName) {
      const analysis = computePlayerAnalysis(myName, [...state.history, { round: state.round, scenario: state.currentScenario, votes: votesForHistory(votes, players) }]);
      if (analysis.contradictions.length > 0) {
        // Show the most recent contradiction (last in list)
        const last = analysis.contradictions[analysis.contradictions.length - 1];
        html += '<div class="contradiction-alert">' + escapeHtml(last.message) + '</div>';
      }
    }

    revealCard.innerHTML = html;
  }

  function votesForHistory(idVotes, players) {
    const out = {};
    Object.entries(idVotes).forEach(([id, choice]) => {
      const p = players.find(p => p.id === id);
      if (p) out[p.name] = choice;
    });
    return out;
  }

  function renderHistory(history) {
    historyList.innerHTML = "";
    history.forEach(round => {
      const sc = window.getScenario(round.scenario);
      if (!sc) return;
      const div = document.createElement("div");
      div.className = "history-round";
      let votesHtml = '<ul>';
      Object.entries(round.votes).forEach(([name, choice]) => {
        let label;
        if (choice === "abstention") label = "abstention";
        else label = choice === "act" ? sc.labels.act : sc.labels.wait;
        votesHtml += '<li>' + escapeHtml(name) + ' — <em>' + escapeHtml(label) + '</em></li>';
      });
      votesHtml += '</ul>';
      div.innerHTML = '<h5>Tour ' + round.round + ' · ' + escapeHtml(sc.categoryName) + ' : ' + escapeHtml(sc.variantName) + '</h5>' + votesHtml;
      historyList.appendChild(div);
    });
  }

  // ===================== ANALYSIS =====================
  function computePlayerAnalysis(playerName, history) {
    const votes = {}; // scenarioKey → choice
    const traits = {
      utilitarian: 0, empathic: 0, loyal: 0, logical: 0, emotional: 0,
      authoritarian: 0, selfish: 0, protective: 0, conformist: 0, rebellious: 0, courage: 0
    };
    let actCount = 0, waitCount = 0, abstentionCount = 0;
    let totalDeaths = 0, totalSaved = 0;

    for (const round of history) {
      const choice = round.votes[playerName];
      if (!choice || choice === "abstention") {
        if (choice === "abstention") abstentionCount++;
        continue;
      }
      votes[round.scenario] = choice;
      const sc = window.getScenario(round.scenario);
      if (!sc) continue;
      if (choice === "act") actCount++;
      else if (choice === "wait") waitCount++;
      const outcome = sc.outcomes[choice];
      if (!outcome) continue;
      const outcomeTraits = outcome.traits || {};
      for (const [k, v] of Object.entries(outcomeTraits)) {
        traits[k] = (traits[k] || 0) + v;
      }
      if (typeof outcome.deaths === "number") totalDeaths += outcome.deaths;
      if (typeof outcome.saved === "number") totalSaved += outcome.saved;
    }

    const coherence = window.calculateCoherence(traits);
    const profile = window.detectProfile(traits, coherence);
    const contradictions = window.detectContradictions(votes, traits);

    return { traits, coherence, profile, contradictions, actCount, waitCount, abstentionCount, totalDeaths, totalSaved, votedCount: actCount + waitCount };
  }

  function renderFinalAnalysis(state) {
    let html = '<h2>Analyse finale — ' + state.history.length + ' tour(s) joué(s)</h2>';
    state.players.forEach(p => {
      const analysis = computePlayerAnalysis(p.name, state.history);
      html += renderPlayerCard(p, analysis);
    });
    html += '<div style="text-align:center; margin-top:1rem;">'
         + '<button id="btn-restart" class="btn btn-small" style="display:inline-block; width:auto;">Nouvelle partie ↻</button>'
         + '</div>';
    finalAnalysis.innerHTML = html;
    const restart = $("btn-restart");
    if (restart) restart.addEventListener("click", () => {
      if (isHost()) socket.emit("restart-game");
    });
  }

  function renderPlayerCard(player, analysis) {
    const p = analysis.profile;
    const total = Object.values(analysis.traits).reduce((a, b) => a + b, 0) || 1;
    const sortedTraits = Object.entries(analysis.traits)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    let html = '<div class="player-analysis">';
    html += '<div class="player-name">' + escapeHtml(player.name) + (player.isHost ? " (hôte)" : "") + '</div>';
    html += '<span class="profile-name">' + escapeHtml(p.name) + '</span>';
    html += '<div class="profile-desc">' + escapeHtml(p.long) + '</div>';

    if (analysis.votedCount === 0) {
      html += '<div class="coherence-line"><em>Aucun vote — analyse impossible.</em></div></div>';
      return html;
    }

    html += '<div class="score-bars">';
    sortedTraits.forEach(([trait, value]) => {
      const pct = Math.round((value / total) * 100);
      html += '<div class="score-bar">'
        + '<span class="score-bar-label">' + traitLabel(trait) + '</span>'
        + '<div class="score-bar-track"><div class="score-bar-fill" style="width:' + Math.min(100, value * 8) + '%"></div></div>'
        + '<span class="score-bar-value">' + value + '</span>'
        + '</div>';
    });
    html += '</div>';

    const coherencePct = Math.round(analysis.coherence * 100);
    const logicScore = (analysis.traits.logical || 0) + (analysis.traits.utilitarian || 0);
    const empathScore = (analysis.traits.empathic || 0) + (analysis.traits.emotional || 0);
    const balance = logicScore + empathScore > 0
      ? Math.round((logicScore / (logicScore + empathScore)) * 100)
      : 50;

    html += '<div class="coherence-line">'
      + '<strong>Cohérence morale :</strong> ' + coherencePct + '%'
      + ' · <strong>Logique vs Empathie :</strong> ' + balance + '% / ' + (100 - balance) + '%'
      + ' · <strong>Votes :</strong> ' + analysis.actCount + ' agir, ' + analysis.waitCount + ' attendre'
      + (analysis.abstentionCount > 0 ? ', ' + analysis.abstentionCount + ' abstention' : '')
      + '</div>';

    if (analysis.totalDeaths > 0 || analysis.totalSaved > 0) {
      html += '<div class="coherence-line">'
        + '<strong>Bilan cumulé :</strong> ' + analysis.totalDeaths + ' morts, ' + analysis.totalSaved + ' sauvées (par vos choix)'
        + '</div>';
    }

    if (analysis.contradictions.length > 0) {
      html += '<div class="contradiction-list">';
      html += '<h4>Contradictions détectées</h4>';
      analysis.contradictions.forEach(c => {
        html += '<div class="item">' + escapeHtml(c.message) + '</div>';
      });
      html += '</div>';
    }

    // Final phrase
    let finalPhrase;
    if (analysis.contradictions.length >= 3) {
      finalPhrase = "Vos choix forment une mosaïque, pas une ligne. Très humain — ou très imprévisible.";
    } else if (coherencePct >= 75) {
      finalPhrase = "Cohérence implacable. Vous tenez une ligne. À vous de voir si elle vous plaît encore.";
    } else if (analysis.actCount > analysis.waitCount * 2) {
      finalPhrase = "Vous agissez. Quasi toujours. Le monde s'en trouve modifié — pas toujours pour le mieux.";
    } else if (analysis.waitCount > analysis.actCount * 2) {
      finalPhrase = "Vous attendez. Quasi toujours. Vos mains restent propres. Et après ?";
    } else {
      finalPhrase = "Vos choix s'équilibrent. Sagesse, ou indécision ? À vous de trancher.";
    }
    html += '<div class="final-phrase">' + escapeHtml(finalPhrase) + '</div>';

    html += '</div>';
    return html;
  }

  function traitLabel(t) {
    const labels = {
      utilitarian: "Utilitarisme", empathic: "Empathie", loyal: "Loyauté",
      logical: "Logique", emotional: "Émotion", authoritarian: "Autorité",
      selfish: "Égoïsme", protective: "Protection", conformist: "Conformisme",
      rebellious: "Rébellion", courage: "Courage"
    };
    return labels[t] || t;
  }

  // ===================== SOCKET =====================
  socket.on("state", render);
  socket.on("disconnect", () => {
    if (currentRoom) statusLine.textContent = "⚠ Connexion perdue. Reconnexion...";
  });
  socket.on("connect", () => {
    if (currentRoom && myId) {
      currentRoom = null; myId = null;
      lastScenarioKey = null; lastRevealed = false; myVote = null;
      clearTimerUI();
      lobbyError.textContent = "Le serveur a redémarré. Recréez ou rejoignez une partie.";
      showLobby();
    }
  });
  socket.on("connect_error", () => { lobbyError.textContent = "Impossible de joindre le serveur."; });

  showLobby();
})();
