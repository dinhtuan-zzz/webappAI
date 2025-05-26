// ws-server.js
// ---
// Minimal WebSocket server for real-time notifications
// Usage:
//   1. Run: `node ws-server.js` (requires 'ws' package: npm install ws)
//   2. Frontend: connect to ws://localhost:3001
//   3. To send a notification: use wsServer.sendToUser(userId, notification)
//
// This server is for local/dev use. For production, use a managed service or secure appropriately.

const WebSocket = require('ws');
const http = require('http');

const PORT = 3001;
const userSockets = new Map(); // userId -> Set<WebSocket>

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // Expect userId as a query param, e.g., ws://localhost:3001?userId=abc
  const url = new URL(req.url, `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId');
  console.log('WebSocket connection attempt:', userId);
  if (!userId) {
    ws.close(4000, 'Missing userId');
    return;
  }
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(ws);

  ws.on('close', (code, reason) => {
    console.log(`WebSocket closed for user ${userId}: code=${code}, reason=${reason}`);
    userSockets.get(userId).delete(ws);
    if (userSockets.get(userId).size === 0) userSockets.delete(userId);
  });
  ws.on('error', (err) => {
    console.error(`WebSocket error for user ${userId}:`, err);
  });
});

// Helper to send notification to a user
wss.sendToUser = (userId, notification) => {
  const sockets = userSockets.get(userId);
  if (sockets) {
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(notification));
      }
    }
  }
};

server.listen(PORT, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});

module.exports = wss; 