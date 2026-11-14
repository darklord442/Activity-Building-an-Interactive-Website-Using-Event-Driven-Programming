const test = require("node:test");
const assert = require("node:assert");
const { once } = require("node:events");
const WebSocket = require("ws");
const { createServer } = require("../server");

function nextMessage(socket, type) {
  return new Promise((resolve) => {
    socket.on("message", function handler(raw) {
      const message = JSON.parse(raw);
      if (message.type === type) {
        socket.off("message", handler);
        resolve(message);
      }
    });
  });
}

test("serves the page and broadcasts accepted bids to every client", async (t) => {
  const server = createServer();
  server.listen(0);
  await once(server, "listening");
  const url = "http://localhost:" + server.address().port;
  t.after(() => server.close());

  const page = await fetch(url + "/");
  assert.strictEqual(page.status, 200);
  assert.match(await page.text(), /Bidly/);

  const alice = new WebSocket(url.replace("http", "ws"));
  const bob = new WebSocket(url.replace("http", "ws"));
  t.after(() => { alice.close(); bob.close(); });

  const [init] = await Promise.all([nextMessage(alice, "init"), nextMessage(bob, "init")]);
  const lot = init.lots[0];

  const bobSeesBid = nextMessage(bob, "bid");
  const aliceResult = nextMessage(alice, "bid-result");
  alice.send(JSON.stringify({ type: "bid", lotId: lot.id, name: "Alice", amount: lot.bid + 10 }));

  assert.strictEqual((await aliceResult).ok, true);
  const broadcast = await bobSeesBid;
  assert.strictEqual(broadcast.lot.bid, lot.bid + 10);
  assert.strictEqual(broadcast.lot.highBidder, "Alice");

  const rejected = nextMessage(bob, "bid-result");
  bob.send(JSON.stringify({ type: "bid", lotId: lot.id, name: "Bob", amount: lot.bid + 10 }));
  assert.strictEqual((await rejected).ok, false);
});

test("ignores non-object JSON messages without crashing", async (t) => {
  const server = createServer();
  server.listen(0);
  await once(server, "listening");
  const url = "ws://localhost:" + server.address().port;
  t.after(() => server.close());

  const client = new WebSocket(url);
  t.after(() => client.close());
  await nextMessage(client, "init");

  client.send("null");
  client.send("42");
  const result = nextMessage(client, "bid-result");
  client.send(JSON.stringify({ type: "bid", lotId: 0, name: "A", amount: 1 }));
  assert.strictEqual((await result).ok, false);
});

test("broadcasts chat messages to every client", async (t) => {
  const server = createServer();
  server.listen(0);
  await once(server, "listening");
  const url = "ws://localhost:" + server.address().port;
  t.after(() => server.close());

  const alice = new WebSocket(url);
  const bob = new WebSocket(url);
  t.after(() => { alice.close(); bob.close(); });
  await Promise.all([nextMessage(alice, "init"), nextMessage(bob, "init")]);

  const bobSees = nextMessage(bob, "chat");
  alice.send(JSON.stringify({ type: "chat", name: "Alice", text: "Good luck everyone!" }));
  const { entry } = await bobSees;
  assert.strictEqual(entry.name, "Alice");
  assert.strictEqual(entry.text, "Good luck everyone!");

  const rejected = nextMessage(alice, "chat-result");
  alice.send(JSON.stringify({ type: "chat", name: "Alice", text: "" }));
  assert.strictEqual((await rejected).ok, false);
});
