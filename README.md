# Bidly — Live Auctions

Real-time auction web app built with **Node.js**, **Express** and **WebSockets** (`ws`).

- Express serves the page from `public/`.
- The server (`server.js`) owns the auction state (`auction.js`): lots, bids, countdowns and recent-bid history.
- Browsers place bids over a WebSocket; the server validates each bid (name, lot still open, whole dollars, at least $10 above the current bid) and broadcasts accepted bids to every connected client, along with a live "watching" count.

## Run

```bash
npm install
npm start        # http://localhost:3000 (override with PORT=...)
```

Open the page in two browser windows to see bids update live.

## Test

```bash
npm test
```
