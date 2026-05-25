const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "public")));

const SCENARIO_KEY_PATTERN = /^[a-z_]+:[a-z_]+$/;
const VALID_MODES = ["classique", "psy", "pression"];
const VALID_TIMERS = [0, 3, 10, 20];
const rooms = new Map();

function genCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 200; attempt++) {
    let code = "";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    if (!rooms.has(code)) return code;
  }
  return "X" + Date.now().toString(36).slice(-3).toUpperCase();
}

function roomPublic(room) {
  return {
    code: room.code,
    hostId: room.host,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.id === room.host,
      hasVoted: !!room.votes[p.id]
    })),
    round: room.round,
    currentScenario: room.currentScenario,
    revealed: room.revealed,
    voteCount: Object.keys(room.votes).length,
    votes: room.revealed ? room.votes : null,
    history: room.history,
    mode: room.mode,
    timerDuration: room.timerDuration,
    roundStartedAt: room.roundStartedAt,
    ended: room.ended
  };
}

function broadcast(code) {
  const room = rooms.get(code);
  if (!room) return;
  io.to(code).emit("state", roomPublic(room));
}

io.on("connection", (socket) => {
  socket.data.roomCode = null;

  socket.on("create-room", (rawName, cb) => {
    const name = (rawName || "").trim().slice(0, 20);
    if (!name) return cb({ error: "Pseudo requis" });
    const code = genCode();
    const room = {
      code, host: socket.id,
      players: [{ id: socket.id, name }],
      currentScenario: null, votes: {}, revealed: false,
      round: 0, history: [],
      mode: "classique", timerDuration: 0, roundStartedAt: null, ended: false,
      createdAt: Date.now()
    };
    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    cb({ ok: true, code, myId: socket.id });
    broadcast(code);
  });

  socket.on("join-room", (payload, cb) => {
    const code = ((payload && payload.code) || "").trim().toUpperCase();
    const name = ((payload && payload.name) || "").trim().slice(0, 20);
    if (!code || !name) return cb({ error: "Code et pseudo requis" });
    const room = rooms.get(code);
    if (!room) return cb({ error: "Salle introuvable" });
    if (room.players.length >= 16) return cb({ error: "Salle pleine (16 max)" });
    if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      return cb({ error: "Ce pseudo est déjà pris dans la salle" });
    }
    room.players.push({ id: socket.id, name });
    socket.join(code);
    socket.data.roomCode = code;
    cb({ ok: true, code, myId: socket.id });
    broadcast(code);
  });

  socket.on("set-mode", (mode) => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || room.host !== socket.id) return;
    if (!VALID_MODES.includes(mode)) return;
    room.mode = mode;
    broadcast(code);
  });

  socket.on("set-timer", (seconds) => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || room.host !== socket.id) return;
    const n = parseInt(seconds, 10);
    if (!VALID_TIMERS.includes(n)) return;
    room.timerDuration = n;
    broadcast(code);
  });

  socket.on("start-round", (scenarioKey) => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || room.host !== socket.id) return;
    if (typeof scenarioKey !== "string" || !SCENARIO_KEY_PATTERN.test(scenarioKey)) return;
    if (room.ended) return;
    room.currentScenario = scenarioKey;
    room.votes = {};
    room.revealed = false;
    room.round++;
    room.roundStartedAt = Date.now();
    broadcast(code);
  });

  socket.on("vote", (choice) => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || !room.currentScenario || room.revealed) return;
    if (choice !== "act" && choice !== "wait" && choice !== "abstention") return;
    if (room.votes[socket.id]) return;
    room.votes[socket.id] = choice;
    broadcast(code);
  });

  socket.on("reveal", () => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || room.host !== socket.id) return;
    if (!room.currentScenario || room.revealed) return;
    if (Object.keys(room.votes).length === 0) return;
    room.revealed = true;
    const archived = {};
    room.players.forEach(p => {
      if (room.votes[p.id]) archived[p.name] = room.votes[p.id];
      else archived[p.name] = "abstention";
    });
    room.history.push({
      round: room.round,
      scenario: room.currentScenario,
      votes: archived
    });
    broadcast(code);
  });

  socket.on("next-round", () => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || room.host !== socket.id) return;
    if (room.ended) return;
    room.currentScenario = null;
    room.votes = {};
    room.revealed = false;
    room.roundStartedAt = null;
    broadcast(code);
  });

  socket.on("end-game", () => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || room.host !== socket.id) return;
    if (room.history.length === 0) return;
    room.ended = true;
    room.currentScenario = null;
    room.votes = {};
    room.revealed = false;
    broadcast(code);
  });

  socket.on("restart-game", () => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room || room.host !== socket.id) return;
    room.history = [];
    room.round = 0;
    room.currentScenario = null;
    room.votes = {};
    room.revealed = false;
    room.ended = false;
    room.roundStartedAt = null;
    broadcast(code);
  });

  socket.on("disconnect", () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;
    room.players = room.players.filter(p => p.id !== socket.id);
    delete room.votes[socket.id];
    if (room.players.length === 0) {
      rooms.delete(code);
      return;
    }
    if (room.host === socket.id) {
      room.host = room.players[0].id;
    }
    broadcast(code);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Le Dilemme V5 server listening on " + PORT);
});
