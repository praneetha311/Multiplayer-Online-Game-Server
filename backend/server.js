const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const PORT = process.env.PORT || 3006;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// WebSocket server logic
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Assign a unique ID to each websocket connection
  ws.id = Date.now().toString();

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        const player = new Player(ws.id, data.name);
        game.addPlayer(player);

        // Broadcast updated player list to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'playerList',
              players: game.players.map((player) => ({ id: player.id, name: player.name })),
            }));
          }
        });
        break;

      case 'move':
        // Update player position based on received data
        // ...

        break;

      case 'disconnect':
        game.removePlayer(ws.id);

        // Broadcast updated player list to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'playerList',
              players: game.players.map((player) => ({ id: player.id, name: player.name })),
            }));
          }
        });
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    game.removePlayer(ws.id);

    // Broadcast updated player list to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'playerList',
          players: game.players.map((player) => ({ id: player.id, name: player.name })),
        }));
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Define the Player and Game classes
class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.score = 0;
  }
}

class Game {
  constructor() {
    this.players = [];
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(playerId) {
    this.players = this.players.filter((player) => player.id !== playerId);
  }
}

const game = new Game();
