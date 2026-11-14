const MIN_INCREMENT = 10;
const MAX_NAME_LENGTH = 40;
const MAX_HISTORY = 20;
const MAX_CHAT = 50;
const MAX_CHAT_LENGTH = 300;

const DEFAULT_LOTS = [
  { id: 101, name: "Rolex Submariner Date", desc: "Stainless steel, black dial, oyster bracelet", category: "Watches", image: "images/rolex-submariner.jpg", bid: 9800, bids: 7, minutes: 42 },
  { id: 102, name: "Air Jordan 2 \"Chicago\"", desc: "White / varsity red, original box", category: "Sneakers", image: "images/air-jordan-2.jpg", bid: 2400, bids: 12, minutes: 95 },
  { id: 103, name: "Leica M6 Film Camera", desc: "Black chrome, 35mm Summilux lens", category: "Cameras", image: "images/leica-m6.jpg", bid: 3100, bids: 4, minutes: 18 },
  { id: 104, name: "Technics SL-1200MK2", desc: "Direct-drive DJ turntable", category: "Audio", image: "images/technics-sl1200.jpg", bid: 650, bids: 5, minutes: 63 },
  { id: 105, name: "Nintendo Game Boy (1989)", desc: "Original DMG-01, fully working", category: "Retro Gaming", image: "images/game-boy.jpg", bid: 300, bids: 3, minutes: 7 },
  { id: 106, name: "Fender Stratocaster", desc: "Electric guitar, maple neck", category: "Instruments", image: "images/stratocaster.jpg", bid: 1500, bids: 9, minutes: 130 }
];

function createAuction(lots = DEFAULT_LOTS, now = Date.now()) {
  return {
    lots: lots.map(({ minutes, ...lot }) => ({
      ...lot,
      highBidder: null,
      endsAt: now + minutes * 60 * 1000
    })),
    history: [],
    chat: []
  };
}

function validateName(name) {
  const bidder = typeof name === "string" ? name.trim() : "";
  if (!bidder) {
    return { error: "Please enter your name first." };
  }
  if (bidder.length > MAX_NAME_LENGTH) {
    return { error: "Name must be " + MAX_NAME_LENGTH + " characters or fewer." };
  }
  return { name: bidder };
}

function placeBid(auction, { lotId, name, amount }, now = Date.now()) {
  const checked = validateName(name);
  const value = Number(amount);
  const lot = auction.lots.find((l) => l.id === Number(lotId));

  if (checked.error) {
    return { ok: false, error: checked.error };
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
  lot.highBidder = checked.name;

  const entry = { lotId: lot.id, lotName: lot.name, name: checked.name, amount: value, at: now };
  auction.history.unshift(entry);
  auction.history.length = Math.min(auction.history.length, MAX_HISTORY);

  return { ok: true, lot, entry };
}

function addChat(auction, { name, text }, now = Date.now()) {
  const checked = validateName(name);
  const message = typeof text === "string" ? text.trim() : "";

  if (checked.error) {
    return { ok: false, error: checked.error };
  }
  if (!message) {
    return { ok: false, error: "Message cannot be empty." };
  }
  if (message.length > MAX_CHAT_LENGTH) {
    return { ok: false, error: "Message must be " + MAX_CHAT_LENGTH + " characters or fewer." };
  }

  const entry = { name: checked.name, text: message, at: now };
  auction.chat.push(entry);
  if (auction.chat.length > MAX_CHAT) {
    auction.chat.shift();
  }

  return { ok: true, entry };
}

module.exports = { MIN_INCREMENT, MAX_HISTORY, MAX_CHAT, DEFAULT_LOTS, createAuction, placeBid, addChat };
