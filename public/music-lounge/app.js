import { COPY, TRACKS } from "./tracks.js?v=voice";

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
  "gallery-link": "gallery",
})) $(id).textContent = copy[key];
$("home").href = `/?lang=${lang}`;
$("back").href = `/ai-lab/?lang=${lang}#gallery-front`;
$("gallery-link").href = `/gallery/?lang=${lang}`;
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
  { id: "afternoon", ids: ["series-night", "bund-swing", "afternoon-ascending", "bay-area-afternoon", "afternoon-alley", "brooklyn-windowsill"] },
  { id: "night", ids: ["adagio", "bund-at-night", "fire-escape-rain"] },
];

// Brooklyn Windowsill lets the visitor pick the melody voice on its card (Paul 2026-11-27); ?lead= in the address still works.
let brooklynLead = ["organ", "sax", "guitar", "rhodes", "piano"].includes(new URLSearchParams(location.search).get("lead")) ? new URLSearchParams(location.search).get("lead") : "organ";
let audioUnlockContext = null;
let intent = 0;
let pendingId = null;
let pendingTrack = null;
let active = null;
const buttons = new Map();
const statuses = new Map();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One bar for the whole page, the same on a phone and a desktop: it says which track is up, what the player is actually
// doing, and it stops it. The card's own status line and this bar are driven by one function so they cannot disagree.
const bar = {
  root: $("player-bar"),
  kicker: $("player-kicker"),
  title: $("player-title"),
  status: $("player-status"),
  stop: $("player-stop"),
  pause: $("player-pause"),
  thumb: $("player-thumb"),
};
$("player-stop").addEventListener("click", () => void stopFromBar());
$("player-pause").addEventListener("click", () => void togglePause());
function showBar(track, statusText) {
  bar.kicker.textContent = copy.nowPlaying;
  bar.title.textContent = track.title[lang];
  bar.status.textContent = statusText;
  bar.stop.textContent = copy.barStop;
  bar.stop.setAttribute("aria-label", `${copy.barStop}: ${track.title[lang]}`);
  // the sleeve of the track that is up, so the bar is identified at a glance even when the card is scrolled away
  bar.thumb.style.backgroundImage = `url("${track.cover}")`;
  if (bar.root.hidden) {
    bar.root.hidden = false;
    document.body.classList.add("has-player-bar");
  }
}

function hideBar() {
  bar.root.hidden = true;
  document.body.classList.remove("has-player-bar");
  bar.title.textContent = "";
  bar.status.textContent = "";
}

// The card and the bar always show the same words for the same moment.
function setStatus(id, text) {
  const status = statuses.get(id);
  if (status) status.textContent = text;
  if (active?.track.id === id) bar.status.textContent = text;
}

// Pause / resume (Paul 2026-11-26): every score in this page runs on the one shared AudioContext (see unlockAudioFromGesture),
// and each engine schedules its notes by that context's clock. Suspending the context therefore freezes the music exactly
// where it is, and resuming carries on from the same note. Pause is offered only once a note has really sounded.
const ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="2" width="3.4" height="12" rx="1"/><rect x="9.6" y="2" width="3.4" height="12" rx="1"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 2.2v11.6a.8.8 0 0 0 1.2.7l9-5.8a.8.8 0 0 0 0-1.4l-9-5.8A.8.8 0 0 0 4 2.2z"/></svg>';
const pauseButtons = new Map();
let paused = false;
let ready = false;

function paintPauseButton(button, track) {
  const label = paused ? copy.resume : copy.pause;
  button.innerHTML = `${paused ? ICON_PLAY : ICON_PAUSE}<span class="label"></span>`;
  button.querySelector(".label").textContent = label;
  button.setAttribute("aria-label", `${label}: ${track.title[lang]}`);
}

function syncPauseUi() {
  const canPause = Boolean(active && ready && audioUnlockContext);
  for (const [id, button] of pauseButtons) {
    const mine = canPause && active.track.id === id;
    button.hidden = !mine;
    if (mine) paintPauseButton(button, active.track);
    button.closest(".track-card")?.classList.toggle("is-paused", mine && paused);
  }
  bar.pause.hidden = !canPause;
  if (canPause) paintPauseButton(bar.pause, active.track);
  document.body.classList.toggle("lounge-paused", canPause && paused);
}

async function togglePause() {
  const ctx = audioUnlockContext;
  if (!active || !ready || !ctx) return;
  const track = active.track;
  const wantPause = !paused;
  try {
    if (wantPause) await ctx.suspend();
    else await ctx.resume();
  } catch {
    return; // the browser refused; leave everything as it was
  }
  if (active?.track.id !== track.id) {
    // the track was stopped or replaced while the context was changing state: never leave the page frozen
    if (wantPause) void ctx.resume();
    return;
  }
  paused = wantPause;
  setStatus(track.id, paused ? copy.paused : copy.playing);
  syncPauseUi();
}

function unlockAudioFromGesture() {
  const Native = window.AudioContext || window.webkitAudioContext;
  if (!Native || Native.__loungeShared) {
    if (audioUnlockContext) void audioUnlockContext.resume();
    return;
  }
  try {
    audioUnlockContext = new Native();
    const buffer = audioUnlockContext.createBuffer(1, 1, audioUnlockContext.sampleRate);
    const source = audioUnlockContext.createBufferSource();
    const gain = audioUnlockContext.createGain();
    gain.gain.value = 0;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(audioUnlockContext.destination);
    source.start();
    void audioUnlockContext.resume();
    // The score modules load after this tap, and each engine then does `new AudioContext()`.
    // A context created after the tap can stay suspended, so every later constructor
    // returns the context this tap already resumed.
    const shared = function LoungeAudioContext() { return audioUnlockContext; };
    shared.prototype = Native.prototype;
    shared.__loungeShared = true;
    if (window.AudioContext) window.AudioContext = shared;
    if (window.webkitAudioContext) window.webkitAudioContext = shared;
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
    if (track.id === "brooklyn-windowsill") player.setLead?.(brooklynLead); // the voice chosen on the card
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
  syncPauseUi();
}

// The bar's stop button works in every state, including while a track is still loading and there is nothing to stop yet.
async function stopFromBar() {
  const token = ++intent;
  const loading = pendingTrack;
  pendingTrack = null;
  pendingId = null;
  await stopActive();
  if (token !== intent) return;
  if (loading) resetCard(loading.id, copy.stopped);
  hideBar();
}

async function stopActive() {
  if (!active) return;
  const previous = active;
  active = null;
  ready = false;
  if (paused) {
    paused = false;
    try { await audioUnlockContext?.resume(); } catch { /* the stop below still runs */ }
  }
  previous.handle.stop();
  resetCard(previous.track.id, copy.stopped);
  hideBar();
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
    hideBar();
    return;
  }

  unlockAudioFromGesture();
  const token = ++intent;
  pendingId = track.id;
  pendingTrack = track;
  for (const item of TRACKS) resetCard(item.id);
  button.setAttribute("aria-pressed", "true");
  button.setAttribute("aria-label", `${copy.loading}: ${track.title[lang]}`);
  button.textContent = copy.loading;
  status.textContent = copy.loading;
  syncLive();
  await stopActive();
  if (token !== intent) return;
  showBar(track, copy.loading);
  // A slow network shows up while the score module is still being fetched, before there is any player to start. Say so
  // instead of repeating "loading" for half a minute as if nothing were wrong.
  const slowLoad = setTimeout(() => {
    if (token === intent && pendingId === track.id) {
      status.textContent = copy.slowLoad;
      showBar(track, copy.slowLoad);
    }
  }, 12000);

  try {
    const handle = await makePlayer(track);
    clearTimeout(slowLoad);
    if (token !== intent) {
      handle.stop();
      return;
    }
    const started = handle.start();
    if (!started) throw new Error("audio did not start");
    active = { track, handle };
    pendingId = null;
    pendingTrack = null;
    button.textContent = copy.stop;
    button.setAttribute("aria-label", `${copy.stop}: ${track.title[lang]}`);
    setStatus(track.id, copy.waiting);
    // Paul 2026-11-25: waiting for the first note used to fall through to "playing" after 20 s even when nothing had been
    // heard, which is a status that lies. Now the bar says what is true: waiting, then "slower than usual" while it keeps
    // listening, and only "playing" once the engine has actually scheduled a note. A player that never starts is reported
    // as a failure rather than left looking like it plays.
    const startedAt = Date.now();
    const slowAfter = 12000, giveUpAfter = 60000;
    for (;;) {
      if (token !== intent || active?.track.id !== track.id) return;
      if (handle.state().notes > 0) {
        setStatus(track.id, copy.playing);
        ready = true;
        syncPauseUi();
        return;
      }
      const waited = Date.now() - startedAt;
      if (waited >= slowAfter && bar.status.textContent === copy.waiting) setStatus(track.id, copy.slow);
      if (waited >= giveUpAfter) {
        throw new Error("no note was scheduled");
      }
      await pause(120);
    }
  } catch {
    clearTimeout(slowLoad);
    if (token === intent) {
      pendingId = null;
      active?.handle.stop();
      active = null;
      ready = false;
      paused = false;
      resetCard(track.id, copy.failed);
      showBar(track, copy.failed);
      setTimeout(() => { if (!active) hideBar(); }, 4000);
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
  const pauseButton = document.createElement("button");
  pauseButton.className = "pause-button";
  pauseButton.type = "button";
  pauseButton.hidden = true;
  pauseButton.addEventListener("click", () => void togglePause());
  pauseButtons.set(track.id, pauseButton);
  const actions = document.createElement("div");
  actions.className = "track-actions";
  actions.append(pauseButton, button);
  top.append(heading, actions);

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
  const extras = [];
  if (track.id === "brooklyn-windowsill") {
    const pick = document.createElement("div");
    pick.className = "voice-pick";
    const label = document.createElement("label");
    label.textContent = copy.voice;
    const select = document.createElement("select");
    select.id = "voice-brooklyn";
    label.htmlFor = select.id;
    for (const key of ["organ", "sax", "guitar", "rhodes", "piano"]) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = copy.voices[key];
      if (key === brooklynLead) option.selected = true;
      select.append(option);
    }
    select.addEventListener("change", () => {
      brooklynLead = select.value;
      if (active?.track.id === track.id) active.handle.player.setLead?.(brooklynLead); // takes effect from the next notes
    });
    pick.append(label, select);
    extras.push(pick);
  }
  item.append(cover, top, roomBlock, ...extras, notes, status);
  return item;
}

const byId = new Map(TRACKS.map((track) => [track.id, track]));
for (const group of GROUPS) {
  $(`${group.id}-list`).replaceChildren(...group.ids.map((id) => makeTrackCard(byId.get(id))));
}

window.addEventListener("pagehide", () => {
  ++intent;
  hideBar();
  pendingId = null;
  active?.handle.stop();
  active = null;
  audioUnlockContext?.close();
});
