import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const servers = new Map();

app.post("/register", (req, res) => {
  const { id, name, maxPlayers } = req.body;
  servers.set(id, { id, name, maxPlayers, players: 0, lastHeartbeat: Date.now() });
  res.json({ success: true });
});

app.post("/heartbeat", (req, res) => {
  const { id, players } = req.body;
  if (servers.has(id)) {
    const server = servers.get(id);
    server.players = players;
    server.lastHeartbeat = Date.now();
  }
  res.json({ success: true });
});

app.get("/list", (req, res) => {
  const now = Date.now();
  for (const [id, server] of servers) {
    if (now - server.lastHeartbeat > 15000) servers.delete(id);
  }
  res.json(Array.from(servers.values()));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Session server running on port ${PORT}`));