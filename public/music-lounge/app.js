import { COPY, TRACKS } from "./tracks.js?v=5";

const lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
const copy = COPY[lang];
const $ = (id) => document.getElementById(id);
document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
document.title = `${copy.title} · Paul’s Tradecraft`;
for (const [id, key] of Object.entries({
  skip: "skip",
  title: "title",
  subtitle: "subtitle",
  split: "split",
  credit: "credit",
  hint: "hint",
  "morning-title": "morning",
  "morning-note": "morningNote",
  "afternoon-title": "afternoon",
  "afternoon-note": "afternoonNote",
  "night-title": "night",
  "night-note": "nightNote",
  back: "back",
})) $(id).textContent = copy[key];
$("home").href = `/?lang=${lang}`;
$("back").href = `/ai-lab/?lang=${lang}#gallery-front`;
document.querySelectorAll(".languages a").forEach((link) => {
  if (link.getAttribute("lang") === document.documentElement.lang) link.setAttribute("aria-current", "page");
  else link.removeAttribute("aria-current");
});

const ROOM_HREF = {
  "Room 01": "/prototype/roomverse-3d/",
  "Room 02": "/prototype/roomverse-3d/bedroom/",
  "Room 03": "/prototype/roomverse-3d/kitchen/",
  "Room 04": "/prototype/roomverse-3d/cafe/",
};
const GROUPS = [
  { id: "morning", ids: ["window-afternoon"] },
  { id: "afternoon", ids: ["bay-area-afternoon", "afternoon-alley", "afternoon-ascending", "brooklyn-windowsill", "bund-swing"] },
  { id: "night", ids: ["adagio", "bund-at-night", "fire-escape-rain", "series-night"] },
];

let audioUnlockContext = null;
let intent = 0;
let pendingId = null;
let active = null;
const buttons = new Map();
const statuses = new Map();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function unlockAudioFromGesture() {
  if (audioUnlockContext) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    audioUnlockContext = new AudioContextClass();
    const buffer = audioUnlockContext.createBuffer(1, 1, audioUnlockContext.sampleRate);
    const source = audioUnlockContext.createBufferSource();
    const gain = audioUnlockContext.createGain();
    gain.gain.value = 0;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(audioUnlockContext.destination);
    source.start();
    void audioUnlockContext.resume();
  } catch {
    audioUnlockContext = null;
  }
}

async function makePlayer(track) {
  if (track.engine === "night") {
    const { createNightMusic } = await import("/prototype/roomverse-3d/night-score.js?v=auto");
    const player = createNightMusic();
    return { player, start: () => player.start(track.index), stop: () => player.stop(), state: () => player.state() };
  }
  if (track.engine === "cafe") {
    const { createRoomSound } = await import("/prototype/roomverse-3d/cafe/sound.js?v=auto");
    const player = createRoomSound();
    const options = track.room01Day ? { vinyl: false, bpm: 100 } : track.room01NoVinyl ? { vinyl: false } : {};
    return { player, start: () => player.start(track.index, false, options), stop: () => player.stop(), state: () => player.state() };
  }
  if (track.engine === "bedroom") {
    const { createRoomRecord } = await import("/prototype/roomverse-3d/bedroom/sound.js?v=auto");
    const player = createRoomRecord();
    return { player, start: () => player.start(track.index), stop: () => player.stop(), state: () => player.state() };
  }
  const { createBayRecord } = await import("/prototype/roomverse-3d/kitchen/sound.js?v=auto");
  const player = createBayRecord();
  return { player, start: () => player.start(), stop: () => player.stop(), state: () => player.state() };
}

function syncLive() {
  let live = false;
  for (const [, button] of buttons) {
    const on = button.getAttribute("aria-pressed") === "true";
    button.closest(".track-card")?.classList.toggle("is-live", on);
    if (on) live = true;
  }
  document.body.classList.toggle("lounge-live", live);
}

function resetCard(id, message = "") {
  const button = buttons.get(id);
  const status = statuses.get(id);
  if (!button || !status) return;
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", `${copy.play}: ${TRACKS.find((item) => item.id === id)?.title[lang] ?? ""}`);
  button.textContent = copy.play;
  status.textContent = message;
  syncLive();
}

async function stopActive() {
  if (!active) return;
  const previous = active;
  active = null;
  previous.handle.stop();
  resetCard(previous.track.id, copy.stopped);
  await pause(720);
}

async function playTrack(track) {
  const button = buttons.get(track.id);
  const status = statuses.get(track.id);
  if (active?.track.id === track.id) {
    const token = ++intent;
    pendingId = null;
    await stopActive();
    if (token === intent) resetCard(track.id, copy.stopped);
    return;
  }
  if (pendingId === track.id) {
    intent += 1;
    pendingId = null;
    resetCard(track.id);
    return;
  }

  unlockAudioFromGesture();
  const token = ++intent;
  pendingId = track.id;
  for (const item of TRACKS) resetCard(item.id);
  button.setAttribute("aria-pressed", "true");
  button.setAttribute("aria-label", `${copy.loading}: ${track.title[lang]}`);
  button.textContent = copy.loading;
  status.textContent = copy.loading;
  syncLive();
  await stopActive();
  if (token !== intent) return;

  try {
    const handle = await makePlayer(track);
    if (token !== intent) {
      handle.stop();
      return;
    }
    const started = handle.start();
    if (!started) throw new Error("audio did not start");
    active = { track, handle };
    pendingId = null;
    button.textContent = copy.stop;
    button.setAttribute("aria-label", `${copy.stop}: ${track.title[lang]}`);
    status.textContent = copy.waiting;
    const deadline = Date.now() + 20000;
    while (token === intent && active?.track.id === track.id && Date.now() < deadline) {
      if (handle.state().notes > 0) {
        status.textContent = copy.playing;
        return;
      }
      await pause(120);
    }
    if (token === intent && active?.track.id === track.id) status.textContent = copy.playing;
  } catch {
    if (token === intent) {
      pendingId = null;
      active = null;
      resetCard(track.id, copy.failed);
    }
  }
}

function makeTrackCard(track) {
  const item = document.createElement("li");
  item.className = "track-card";
  item.dataset.track = track.id;
  const cover = document.createElement("div");
  cover.className = "track-cover";
  cover.setAttribute("aria-hidden", "true");
  const sleeve = document.createElement("span");
  sleeve.className = "sleeve";
  const disc = document.createElement("div");
  disc.className = "disc";
  const image = document.createElement("img");
  image.src = track.cover;
  image.alt = "";
  image.width = 240;
  image.height = 240;
  image.loading = "lazy";
  image.decoding = "async";
  const grooves = document.createElement("span");
  grooves.className = "grooves";
  const hub = document.createElement("span");
  hub.className = "hub";
  disc.append(image, grooves, hub);
  const eq = document.createElement("span");
  eq.className = "eq";
  for (let bar = 0; bar < 5; bar += 1) eq.append(document.createElement("i"));
  cover.append(sleeve, disc, eq);

  const top = document.createElement("div");
  top.className = "track-top";
  const heading = document.createElement("div");
  heading.className = "track-heading";
  const title = document.createElement("h3");
  title.textContent = track.title[lang];
  const mood = document.createElement("p");
  mood.className = "track-mood";
  mood.textContent = track.mood[lang];
  heading.append(title, mood);
  const button = document.createElement("button");
  button.className = "play-button";
  button.type = "button";
  button.textContent = copy.play;
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", `${copy.play}: ${track.title[lang]}`);
  button.addEventListener("click", () => void playTrack(track));
  buttons.set(track.id, button);
  top.append(heading, button);

  const roomBlock = document.createElement("div");
  roomBlock.className = "room-block";
  const roomLabel = document.createElement("p");
  roomLabel.className = "field-label";
  roomLabel.textContent = copy.rooms;
  const roomTags = document.createElement("ul");
  roomTags.className = "room-tags";
  roomTags.setAttribute("aria-label", copy.roomsLabel);
  for (const room of track.rooms) {
    const href = ROOM_HREF[room];
    if (!href) continue;
    const tag = document.createElement("li");
    const link = document.createElement("a");
    link.href = `${href}?lang=${lang}`;
    link.textContent = room;
    tag.append(link);
    roomTags.append(tag);
  }
  roomBlock.append(roomLabel, roomTags);

  const notes = document.createElement("details");
  notes.className = "notes";
  const summary = document.createElement("summary");
  summary.textContent = copy.notes;
  const made = document.createElement("p");
  made.className = "track-made";
  made.textContent = track.made[lang];
  notes.append(summary, made);

  const status = document.createElement("p");
  status.className = "track-status";
  status.setAttribute("role", "status");
  statuses.set(track.id, status);
  item.append(cover, top, roomBlock, notes, status);
  return item;
}

const byId = new Map(TRACKS.map((track) => [track.id, track]));
for (const group of GROUPS) {
  $(`${group.id}-list`).replaceChildren(...group.ids.map((id) => makeTrackCard(byId.get(id))));
}

window.addEventListener("pagehide", () => {
  ++intent;
  pendingId = null;
  active?.handle.stop();
  active = null;
  audioUnlockContext?.close();
});
