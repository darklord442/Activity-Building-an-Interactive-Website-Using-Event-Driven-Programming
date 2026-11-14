const test = require("node:test");
const assert = require("node:assert");
const { createAuction, placeBid } = require("../auction");

const lots = [{ id: 1, name: "Vase", desc: "", category: "Ceramics", bid: 100, bids: 0, minutes: 10 }];

test("accepts a bid at the minimum increment and records history", () => {
  const auction = createAuction(lots, 0);
  const result = placeBid(auction, { lotId: 1, name: " Prince ", amount: 110 }, 1000);

  assert.strictEqual(result.ok, true);
  assert.strictEqual(auction.lots[0].bid, 110);
  assert.strictEqual(auction.lots[0].bids, 1);
  assert.strictEqual(auction.lots[0].highBidder, "Prince");
  assert.strictEqual(auction.history[0].amount, 110);
});

test("rejects invalid bids", () => {
  const auction = createAuction(lots, 0);
  const cases = [
    [{ lotId: 1, name: "", amount: 200 }, /name/],
    [{ lotId: 99, name: "A", amount: 200 }, /choose a lot/],
    [{ lotId: 1, name: "A", amount: 109 }, /at least \$110/],
    [{ lotId: 1, name: "A", amount: 110.5 }, /whole dollars/],
    [{ lotId: 1, name: "A".repeat(41), amount: 200 }, /40 characters/]
  ];

  for (const [bid, pattern] of cases) {
    const result = placeBid(auction, bid, 1000);
    assert.strictEqual(result.ok, false);
    assert.match(result.error, pattern);
  }
  assert.strictEqual(auction.lots[0].bid, 100);
});

test("rejects bids after the lot closes", () => {
  const auction = createAuction(lots, 0);
  const result = placeBid(auction, { lotId: 1, name: "A", amount: 200 }, 10 * 60 * 1000);

  assert.strictEqual(result.ok, false);
  assert.match(result.error, /closed/);
});
