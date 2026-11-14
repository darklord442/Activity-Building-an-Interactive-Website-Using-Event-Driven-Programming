const MIN_INCREMENT = 10;
const MAX_NAME_LENGTH = 40;
const MAX_HISTORY = 20;

const DEFAULT_LOTS = [
  { id: 101, name: "Victorian Gold Pocket Watch", desc: "18k case, hand-engraved, c. 1885", category: "Jewelry", bid: 1200, bids: 7, minutes: 42 },
  { id: 102, name: "Oil Painting: Harbor at Dusk", desc: "Signed, gilt frame, 24 x 36 in.", category: "Fine Art", bid: 3400, bids: 12, minutes: 95 },
  { id: 103, name: "Ming-Style Porcelain Vase", desc: "Blue & white, 14 in. tall", category: "Ceramics", bid: 850, bids: 4, minutes: 18 },
  { id: 104, name: "First Edition Novel", desc: "Clothbound, original dust jacket", category: "Books", bid: 620, bids: 5, minutes: 63 },
  { id: 105, name: "Mid-Century Walnut Armchair", desc: "Restored upholstery, 1958", category: "Furniture", bid: 480, bids: 3, minutes: 7 },
  { id: 106, name: "Rare Silver Coin Set", desc: "Six coins, presentation case", category: "Coins", bid: 950, bids: 9, minutes: 130 }
];

function createAuction(lots = DEFAULT_LOTS, now = Date.now()) {
  return {
    lots: lots.map(({ minutes, ...lot }) => ({
      ...lot,
      highBidder: null,
      endsAt: now + minutes * 60 * 1000
    })),
    history: []
  };
}

function placeBid(auction, { lotId, name, amount }, now = Date.now()) {
  const bidder = typeof name === "string" ? name.trim() : "";
  const value = Number(amount);
  const lot = auction.lots.find((l) => l.id === Number(lotId));

  if (!bidder) {
    return { ok: false, error: "Please enter your name before bidding." };
  }
  if (bidder.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Name must be " + MAX_NAME_LENGTH + " characters or fewer." };
  }
  if (!lot) {
    return { ok: false, error: "Please choose a lot." };
  }
  if (now >= lot.endsAt) {
    return { ok: false, error: "Bidding on Lot #" + lot.id + " has closed." };
  }
  if (!Number.isInteger(value)) {
    return { ok: false, error: "Please bid in whole dollars." };
  }
  if (value < lot.bid + MIN_INCREMENT) {
    return { ok: false, error: "Your bid must be at least $" + (lot.bid + MIN_INCREMENT).toLocaleString("en-US") + "." };
  }

  lot.bid = value;
  lot.bids += 1;
  lot.highBidder = bidder;

  const entry = { lotId: lot.id, lotName: lot.name, name: bidder, amount: value, at: now };
  auction.history.unshift(entry);
  auction.history.length = Math.min(auction.history.length, MAX_HISTORY);

  return { ok: true, lot, entry };
}

module.exports = { MIN_INCREMENT, DEFAULT_LOTS, createAuction, placeBid };
