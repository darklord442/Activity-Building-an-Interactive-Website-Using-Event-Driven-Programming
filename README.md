# Bidly — Live Auctions

Real-time auction web app built with **Node.js**, **Express** and **WebSockets** (`ws`).

- Express serves the page from `public/`.
- The server (`server.js`) owns the auction state (`auction.js`): lots, bids, countdowns and recent-bid history.
- Browsers place bids over a WebSocket; the server validates each bid (name, lot still open, whole dollars, at least $10 above the current bid) and broadcasts accepted bids to every connected client, along with a live "watching" count.
- The featured panel shows a large photo of the selected lot (click a row in the table to switch). Quick-raise cards (+$10 … +$1,000) fill in the current bid plus that amount.
- A live chat runs over the same WebSocket; messages are validated server-side (max 300 characters, last 50 kept).
- Item photos come from Wikimedia Commons; see `public/images/CREDITS.md` for authors and licenses.

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
