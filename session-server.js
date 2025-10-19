import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const servers = new Map();

// Register new server
app.post("/servers/register", (req, res) => {
  const { id, name, maxPlayers, url } = req.body;
  servers.set(id || url, {
    id: id || url,
    name: name || "Unnamed Server",
    maxPlayers: maxPlayers || 10,
    players: 0,
    url: url || "unknown",
    lastHeartbeat: Date.now(),
  });
  console.log(`🟢 Registered server: ${name || url}`);
  res.json({ success: true, message: "Server registered" });
});

// Heartbeat endpoint (keeps server alive)
app.post("/servers/heartbeat", (req, res) => {
  const { id, url, players } = req.body;
  const key = id || url;
  if (servers.has(key)) {
    const server = servers.get(key);
    server.players = players || server.players;
    server.lastHeartbeat = Date.now();
    console.log(`💓 Heartbeat from: ${server.name || key} (${server.players} players)`);
  } else {
    console.log(`⚠️ Received heartbeat from unregistered server: ${key}`);
    servers.set(key, { id: key, players: players || 0, lastHeartbeat: Date.now() });
  }
  res.json({ success: true });
});

// Server list endpoint
app.get("/servers/list", (req, res) => {
  const now = Date.now();

  // Clean up servers that stopped heartbeating (after 30s)
  for (const [id, server] of servers) {
    if (now - server.lastHeartbeat > 30000) {
      console.log(`🔴 Removing inactive server: ${server.name || id}`);
      servers.delete(id);
    }
  }

  const activeServers = Array.from(servers.values());
  console.log(`📜 /servers/list requested — ${activeServers.length} active server(s)`);
  res.json(activeServers);
});

// Default root message
app.get("/", (req, res) => {
  res.send("✅ BlockCraft Session Server is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Session server running on port ${PORT}`));
