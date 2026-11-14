const MIN_INCREMENT = 10;
const MAX_NAME_LENGTH = 40;
const MAX_HISTORY = 20;

const DEFAULT_LOTS = [
  { id: 101, name: "Rolex Submariner Date", desc: "41mm, 2023, full box & papers", category: "Watches", bid: 9800, bids: 7, minutes: 42 },
  { id: 102, name: "Air Jordan 1 \"Chicago\" (Signed)", desc: "Size 10, authenticated autograph", category: "Sneakers", bid: 2400, bids: 12, minutes: 95 },
  { id: 103, name: "Leica M6 Film Camera", desc: "Black chrome, 35mm Summicron lens", category: "Cameras", bid: 3100, bids: 4, minutes: 18 },
  { id: 104, name: "Daft Punk Signed Vinyl", desc: "Random Access Memories, 2LP", category: "Music", bid: 650, bids: 5, minutes: 63 },
  { id: 105, name: "KAWS Companion Figure", desc: "Grey colorway, sealed, 2019", category: "Art Toys", bid: 1200, bids: 3, minutes: 7 },
  { id: 106, name: "Charizard 1st Edition PSA 9", desc: "Base Set holo, graded", category: "Trading Cards", bid: 15000, bids: 9, minutes: 130 }
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
