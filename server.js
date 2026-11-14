const http = require("http");
const path = require("path");
const express = require("express");
const { WebSocketServer, WebSocket } = require("ws");
const { MIN_INCREMENT, MAX_HISTORY, createAuction, placeBid } = require("./auction");

function createServer(auction = createAuction()) {
  const app = express();
  app.use(express.static(path.join(__dirname, "public")));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  function send(socket, message) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  function broadcast(message) {
    wss.clients.forEach((client) => send(client, message));
  }

  function broadcastWatchers() {
    broadcast({ type: "watchers", count: wss.clients.size });
  }

  wss.on("connection", (socket) => {
    send(socket, {
      type: "init",
      lots: auction.lots,
      history: auction.history,
      minIncrement: MIN_INCREMENT,
      maxHistory: MAX_HISTORY,
      serverTime: Date.now()
    });
    broadcastWatchers();

    socket.on("message", (raw) => {
      let message;
      try {
        message = JSON.parse(raw);
      } catch {
        return send(socket, { type: "bid-result", ok: false, message: "Invalid message." });
      }

      if (!message || message.type !== "bid") {
        return;
      }

      const result = placeBid(auction, message);
      if (!result.ok) {
        return send(socket, { type: "bid-result", ok: false, message: result.error });
      }

      send(socket, {
        type: "bid-result",
        ok: true,
        message: "Bid accepted! You are the highest bidder on Lot #" + result.lot.id + " at $" + result.lot.bid.toLocaleString("en-US") + "."
      });
      broadcast({ type: "bid", lot: result.lot, entry: result.entry });
    });

    socket.on("close", broadcastWatchers);
  });

  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log("Bidly auction running at http://localhost:" + port);
  });
}

module.exports = { createServer };
