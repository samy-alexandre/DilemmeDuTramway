// ===================== Le Dilemme V3 — client.js =====================
(function() {

  // ===================== STATE =====================
  const socket = io();
  let myId = null;
  let myName = null;
  let currentRoom = null;
  let lastScenarioKey = null;
  let lastRevealed = false;
  let myVote = null;
  let pendingRevealTimer = null;
  let timerInterval = null;
  let abstentionSent = false;

  // ===================== DOM =====================
  const $ = id => document.getElementById(id);
  const lobby = $("lobby"), game = $("game");
  const hostNameInput = $("host-name"), guestCodeInput = $("guest-code"), guestNameInput = $("guest-name");
  const lobbyError = $("lobby-error");
  const roomCode = $("room-code"), roundLabel = $("round-label"), modeBadge = $("mode-badge");
  const playersBar = $("players-bar");
  const btnSound = $("btn-sound");
  const btnEndGame = $("btn-end-game");
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

  // ===================== HELPERS =====================
  function show(el) { if (el) el.style.display = ""; }
  function hide(el) { if (el) el.style.display = "none"; }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function pickRandom(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }
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

  // ===================== SOUND TOGGLE =====================
  btnSound.addEventListener("click", () => {
    if (window.Sfx.isEnabled()) {
      window.Sfx.disable();
      btnSound.textContent = "🔇 Son";
      btnSound.classList.remove("on");
      btnSound.setAttribute("aria-pressed", "false");
      btnSound.setAttribute("aria-label", "Activer le son");
    } else {
      window.Sfx.enable();
      btnSound.textContent = "🔊 Son";
      btnSound.classList.add("on");
      btnSound.setAttribute("aria-pressed", "true");
      btnSound.setAttribute("aria-label", "Couper le son");
      window.Sfx.play("click");
    }
  });

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
    window.Sfx.play("vote");
    socket.emit("vote", "act");
  });
  btnWait.addEventListener("click", () => {
    if (myVote) return;
    myVote = "wait";
    window.Sfx.play("vote");
    socket.emit("vote", "wait");
  });
  $("btn-reveal").addEventListener("click", () => {
    window.Sfx.play("click");
    socket.emit("reveal");
  });
  $("btn-next-round").addEventListener("click", () => {
    window.Sfx.play("click");
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
        if (sec > 0 && sec <= 5) window.Sfx.play("tick");
      }
      if (pct < 25 && pct > 0 && now - lastHeartbeat > 700) {
        window.Sfx.play("heartbeat");
        lastHeartbeat = now;
      }
      if (remaining <= 0) {
        clearTimerUI();
        if (!myVote && !abstentionSent && currentRoom && currentRoom.currentScenario && !currentRoom.revealed) {
          abstentionSent = true;
          myVote = "abstention";
          btnAct.disabled = true;
          btnWait.disabled = true;
          statusLine.textContent = "Temps écoulé — abstention enregistrée.";
          socket.emit("vote", "abstention");
        }
      }
    }
    timerInterval = setInterval(update, 100);
    update();
  }

  // ===================== ROUND RESET =====================
  function resetForNewRound() {
    myVote = null;
    abstentionSent = false;
    btnAct.disabled = false;
    btnWait.disabled = false;
    if (pendingRevealTimer) { clearTimeout(pendingRevealTimer); pendingRevealTimer = null; }
    clearTimerUI();
    window.Scenes.clear();
  }

  // ===================== ANIMATION ORCHESTRATION =====================
  function playAnimationForScenario(scenarioKey, choice) {
    const sc = window.getScenario(scenarioKey);
    if (!sc) return;
    window.Sfx.play("reveal");
    window.Scenes.animate(sc.categoryKey, choice);
  }

  // ===================== RENDER =====================
  function render(state) {
    if (!state) { showLobby(); return; }
    currentRoom = state;
    hide(lobby); show(game);

    roomCode.textContent = state.code;
    roundLabel.textContent = state.round > 0 ? "· Tour " + state.round : "";

    if (state.mode && state.mode !== "classique") {
      modeBadge.textContent = state.mode === "psy" ? "PSYCHOLOGIQUE" : "PRESSION";
      modeBadge.className = "mode-badge " + state.mode;
      show(modeBadge);
    } else {
      hide(modeBadge);
    }

    if (state.mode && selectMode.value !== state.mode) selectMode.value = state.mode;
    if (state.timerDuration !== undefined && parseInt(selectTimer.value, 10) !== state.timerDuration) {
      selectTimer.value = String(state.timerDuration);
    }

    renderPlayersBar(state);

    const host = isHost();
    const sc = state.currentScenario ? window.getScenario(state.currentScenario) : null;

    if (host && state.round > 0 && !state.ended) show(btnEndGame); else hide(btnEndGame);

    if (state.currentScenario !== lastScenarioKey) {
      resetForNewRound();
      if (state.currentScenario && sc) {
        window.Scenes.build(sc.categoryKey, sc);
      } else {
        window.Scenes.reset();
      }
      lastScenarioKey = state.currentScenario;
      if (state.currentScenario && !state.revealed && state.timerDuration > 0 && state.roundStartedAt) {
        startTimerUI(state.timerDuration, state.roundStartedAt);
      }
    }

    if (state.currentScenario && !state.revealed) {
      const me = state.players.find(p => p.id === myId);
      const myStoredVote = state.votes && state.votes[myId];
      if (myStoredVote && !myVote) myVote = myStoredVote;
      else if (!me || !me.hasVoted) myVote = null;
    }

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
      window.Scenes.reset();
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
          voteConfirm.innerHTML = "<strong>Abstention enregistrée.</strong><span class='vote-progress'>" + state.voteCount + " / " + state.players.length + " joueurs ont voté ou abstenu</span>";
        } else {
          voteConfirm.innerHTML = "<strong>Vote enregistré.</strong><span class='vote-progress'>" + state.voteCount + " / " + state.players.length + " joueurs ont voté</span>";
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
          ? "Tous les votes sont enregistrés. L'hôte peut révéler."
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
        if (majority) playAnimationForScenario(state.currentScenario, majority);
        if (pendingRevealTimer) clearTimeout(pendingRevealTimer);
        const delay = state.mode === "pression" ? 1600 : 2400;
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

  // ===================== UI RENDERERS =====================
  function renderPlayersBar(state) {
    playersBar.innerHTML = "";
    state.players.forEach(p => {
      const chip = document.createElement("span");
      let cls = "player-chip";
      if (p.id === myId) cls += " me";
      if (p.isHost) cls += " host";
      if (state.currentScenario && !state.revealed && p.hasVoted) cls += " voted";
      chip.className = cls;
      chip.textContent = p.name + (p.isHost ? " (hôte)" : "");
      playersBar.appendChild(chip);
    });
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
          window.Sfx.play("click");
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

    let html = '<h3>Tour ' + state.round + ' · ' + escapeHtml(sc.categoryName) + ' : ' + escapeHtml(sc.variantName) + '</h3>';

    html += '<div class="votes-list">';
    players.forEach(p => {
      const choice = votes[p.id];
      let cls, label;
      if (!choice || choice === "abstention") {
        cls = "abstention";
        label = "abstention";
      } else {
        cls = choice;
        label = choice === "act" ? sc.labels.act : sc.labels.wait;
      }
      html += '<div class="vote-row ' + cls + '">'
        + '<span class="player-name"><strong>' + escapeHtml(p.name) + '</strong></span>'
        + '<span class="choice">' + escapeHtml(label) + '</span></div>';
    });
    html += '</div>';

    const counts = { act: 0, wait: 0, abstention: 0 };
    Object.values(votes).forEach(v => { if (counts[v] !== undefined) counts[v]++; });
    const totalChoices = counts.act + counts.wait;
    if (totalChoices > 0) {
      const pctAct = Math.round((counts.act / totalChoices) * 100);
      html += '<div class="vote-stats">'
        + '<span class="stat-act">' + counts.act + ' agissent (' + pctAct + '%)</span>'
        + '<span class="stat-wait">' + counts.wait + ' attendent (' + (100 - pctAct) + '%)</span>'
        + (counts.abstention > 0 ? '<span>' + counts.abstention + ' abstention</span>' : '')
        + '</div>';
    }

    const majority = majorityChoice(votes);
    if (majority && window.SARCASTIC_PHRASES && window.SARCASTIC_PHRASES[majority]) {
      const phrase = pickRandom(window.SARCASTIC_PHRASES[majority]);
      if (phrase) html += '<div class="sarcastic-phrase">' + escapeHtml(phrase) + '</div>';
    }

    if (totalChoices >= 2) {
      if (counts.act === totalChoices) {
        const p = pickRandom(window.PHASE_PHRASES.unanimous_act);
        if (p) html += '<div class="sarcastic-phrase">' + escapeHtml(p) + '</div>';
      } else if (counts.wait === totalChoices) {
        const p = pickRandom(window.PHASE_PHRASES.unanimous_wait);
        if (p) html += '<div class="sarcastic-phrase">' + escapeHtml(p) + '</div>';
      } else if (counts.act === 1 || counts.wait === 1) {
        const loneChoice = counts.act === 1 ? "act" : "wait";
        const loneEntry = Object.entries(votes).find(([id, c]) => c === loneChoice);
        if (loneEntry) {
          const lonePlayer = players.find(p => p.id === loneEntry[0]);
          if (lonePlayer && window.PHASE_PHRASES.lone_wolf && window.PHASE_PHRASES.lone_wolf.length > 0) {
            const item = pickRandom(window.PHASE_PHRASES.lone_wolf);
            const phrase = typeof item === "function" ? item(lonePlayer.name) : String(item || "");
            if (phrase) html += '<div class="sarcastic-phrase">' + escapeHtml(phrase) + '</div>';
          }
        }
      } else {
        const p = pickRandom(window.PHASE_PHRASES.split);
        if (p) html += '<div class="sarcastic-phrase">' + escapeHtml(p) + '</div>';
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

    if (state.mode === "psy" && state.history && myName) {
      const myVoteHere = votes[myId];
      if (myVoteHere && myVoteHere !== "abstention") {
        const fakeHistory = state.history.concat([{
          round: state.round,
          scenario: state.currentScenario,
          votes: votesByName(votes, players)
        }]);
        const analysis = computePlayerAnalysis(myName, fakeHistory);
        if (analysis.contradictions.length > 0) {
          const last = analysis.contradictions[analysis.contradictions.length - 1];
          html += '<div class="contradiction-alert">' + escapeHtml(last.message) + '</div>';
          window.Sfx.play("contradictionFound");
        }
      }
    }

    revealCard.innerHTML = html;
  }

  function votesByName(idVotes, players) {
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
    const votes = {};
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
    let html = '<h2>Analyse finale</h2>';
    html += '<p class="analysis-meta">' + state.history.length + ' tour(s) joué(s) · ' + state.players.length + ' joueur(s)</p>';

    // Group averages for comparison
    const allAnalyses = state.players.map(p => ({ player: p, analysis: computePlayerAnalysis(p.name, state.history) }));
    const groupActAvg = allAnalyses.reduce((s, a) => s + a.analysis.actCount, 0) / (allAnalyses.length || 1);

    allAnalyses.forEach(({ player, analysis }) => {
      html += renderPlayerCard(player, analysis, groupActAvg);
    });

    html += '<div class="analysis-actions">';
    if (isHost()) {
      html += '<button id="btn-restart" class="btn-primary" type="button">Nouvelle partie ↻</button>';
    }
    html += '</div>';
    finalAnalysis.innerHTML = html;

    window.Sfx.play("profileRevealed");

    const restart = $("btn-restart");
    if (restart) {
      restart.addEventListener("click", () => {
        window.Sfx.play("click");
        socket.emit("restart-game");
      });
    }
  }

  function renderPlayerCard(player, analysis, groupActAvg) {
    const p = analysis.profile;
    const total = Object.values(analysis.traits).reduce((a, b) => a + b, 0) || 1;
    const sortedTraits = Object.entries(analysis.traits)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    let html = '<div class="player-analysis">';
    html += '<div class="player-name">' + escapeHtml(player.name) + (player.isHost ? " · hôte" : "") + '</div>';
    html += '<span class="profile-name">' + escapeHtml(p.name) + '</span>';
    html += '<div class="profile-desc">' + escapeHtml(p.long) + '</div>';

    if (analysis.votedCount === 0) {
      html += '<div class="final-phrase"><em>Aucun vote — analyse impossible.</em></div></div>';
      return html;
    }

    // Score bars
    html += '<div class="score-bars">';
    sortedTraits.forEach(([trait, value]) => {
      html += '<div class="score-bar">'
        + '<span class="score-bar-label">' + traitLabel(trait) + '</span>'
        + '<div class="score-bar-track"><div class="score-bar-fill" style="width:' + Math.min(100, value * 8) + '%"></div></div>'
        + '<span class="score-bar-value">' + value + '</span>'
        + '</div>';
    });
    html += '</div>';

    // Stats grid
    const coherencePct = Math.round(analysis.coherence * 100);
    const logicScore = (analysis.traits.logical || 0) + (analysis.traits.utilitarian || 0);
    const empathScore = (analysis.traits.empathic || 0) + (analysis.traits.emotional || 0);
    const balance = logicScore + empathScore > 0
      ? Math.round((logicScore / (logicScore + empathScore)) * 100)
      : 50;

    html += '<div class="analysis-stats">';
    html += '<div><span class="stat-label">Cohérence</span><span class="stat-value">' + coherencePct + '%</span></div>';
    html += '<div><span class="stat-label">Logique / Empathie</span><span class="stat-value">' + balance + '/' + (100 - balance) + '</span></div>';
    html += '<div><span class="stat-label">Agir / Attendre</span><span class="stat-value">' + analysis.actCount + '/' + analysis.waitCount + '</span></div>';
    if (analysis.totalDeaths > 0 || analysis.totalSaved > 0) {
      html += '<div><span class="stat-label">Morts / Sauvés</span><span class="stat-value">' + analysis.totalDeaths + '/' + analysis.totalSaved + '</span></div>';
    }
    html += '</div>';

    // Group comparison
    if (groupActAvg !== undefined && analysis.votedCount > 0) {
      let comp = "";
      if (analysis.actCount > groupActAvg + 0.5) comp = "Vous agissez plus que la moyenne du groupe.";
      else if (analysis.actCount < groupActAvg - 0.5) comp = "Vous agissez moins que la moyenne du groupe.";
      else comp = "Vous êtes dans la moyenne du groupe.";
      html += '<div class="coherence-line" style="font-size:0.88rem;color:var(--ink-soft);font-style:italic;margin-top:0.5rem;">' + escapeHtml(comp) + '</div>';
    }

    // Contradictions
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
      window.Scenes.reset();
      lobbyError.textContent = "Le serveur a redémarré. Recréez ou rejoignez une partie.";
      showLobby();
    }
  });
  socket.on("connect_error", () => { lobbyError.textContent = "Impossible de joindre le serveur."; });

  showLobby();
})();
