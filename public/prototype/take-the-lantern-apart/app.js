import { PARTS, OPTIONS, DEFAULTS, PART_LABEL, EFFECT, PENDING_TEXT, UI, optionOf, specStatus } from "./data.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const state = {
  lang: params.get("lang") === "en" ? "en" : "zh",
  screen: 0,
  angle: "f",
  zoom: false,
  seen: new Set(),
  picks: { ...DEFAULTS },
  changed: [],
};
const ANGLES = ["l", "f", "r"];
const t = (key) => UI[state.lang][key];

function applyText() {
  document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
  document.title = state.lang === "zh" ? "拆一盞燈 · Take the Lantern Apart" : "Take the Lantern Apart · 拆一盞燈";
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  $("zoom").textContent = state.zoom ? t("zoomOut") : t("zoom");
  for (const b of document.querySelectorAll("[data-lang]")) b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang));
  $("next-link").href = `/prototype/trade-street/?lang=${state.lang}`;
  $("home").href = `/?lang=${state.lang}`;
  renderNote();
  renderParts();
  renderEffects();
  renderLists();
  if (state.screen === 5) drawCard();
}

function show(n) {
  state.screen = n;
  for (const s of document.querySelectorAll(".screen")) s.hidden = Number(s.dataset.screen) !== n;
  $("lamp").classList.toggle("lit", n >= 1);
  $("lamp").classList.toggle("apart", n === 3);
  if (n === 4) renderLists();
  if (n === 5) drawCard();
  const heading = document.querySelector(`#s${n} h1, #s${n} h2`);
  if (heading && n > 0) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  if (n > 0) document.querySelector(`#s${n}`).scrollIntoView({ block: "nearest" });
}

function paintLamp() {
  const lamp = $("lamp");
  lamp.dataset.angle = state.angle;
  lamp.dataset.size = state.picks.size;
  $("shade").className = `shade ${state.picks.shade}`;
  $("shade").style.setProperty("background-color", optionOf("colour", state.picks.colour).tint);
  $("base").className = `base ${state.picks.base}`;
  $("lamp-wrap").classList.toggle("zoomed", state.zoom);
}

function turn(dir) {
  const i = Math.max(0, Math.min(2, ANGLES.indexOf(state.angle) + dir));
  state.angle = ANGLES[i];
  paintLamp();
}

function renderNote() {
  const note = $("note");
  const last = state.lastSpot;
  if (!last) { note.textContent = ""; return; }
  if (last === "shade") note.innerHTML = `<p>${t("shadeNote")}</p><p class="egg" id="egg">${t("egg")}</p>`;
  else if (last === "base") note.textContent = t("baseNote");
  else note.textContent = t("mg");
}

function spot(which) {
  state.lastSpot = which;
  state.seen.add(which);
  $("spot-shade").setAttribute("aria-expanded", String(which === "shade"));
  $("spot-base").setAttribute("aria-expanded", String(which === "base"));
  if (which === "mg") $("lamp").classList.add("apart");
  renderNote();
  $("go2").disabled = !(state.seen.has("shade") && state.seen.has("base"));
}

function renderParts() {
  const box = $("parts");
  box.textContent = "";
  for (const part of PARTS) {
    const fs = document.createElement("fieldset");
    fs.className = "part";
    const lg = document.createElement("legend");
    lg.textContent = PART_LABEL[part][state.lang];
    const opts = document.createElement("div");
    opts.className = "opts";
    for (const o of OPTIONS[part]) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.part = part;
      b.dataset.option = o.id;
      b.textContent = o[state.lang];
      b.setAttribute("aria-pressed", String(state.picks[part] === o.id));
      b.addEventListener("click", () => pick(part, o.id));
      opts.append(b);
    }
    fs.append(lg, opts);
    box.append(fs);
  }
}

function pick(part, id) {
  state.picks[part] = id;
  state.changed = state.changed.filter((p) => p !== part);
  if (id !== DEFAULTS[part]) state.changed.push(part);
  $("kid-react").hidden = state.picks.shade !== "glass";
  paintLamp();
  renderParts();
  renderEffects();
  const btn = document.querySelector(`[data-part="${part}"][data-option="${id}"]`);
  if (btn) btn.focus();
}

function renderEffects() {
  const ul = $("effects");
  ul.textContent = "";
  for (const part of state.changed) {
    const o = optionOf(part, state.picks[part]);
    const li = document.createElement("li");
    li.dataset.part = part;
    const sep = state.lang === "zh" ? "：" : ": ";
    const join = state.lang === "zh" ? "，" : ", ";
    li.textContent = `${o[state.lang]}${sep}${EFFECT.price[o.price][state.lang]}${join}${EFFECT.time[o.time][state.lang]}`;
    ul.append(li);
  }
  if (!state.changed.length) {
    const li = document.createElement("li");
    li.textContent = state.lang === "zh" ? "還沒換：跟原本一樣。" : "Nothing changed yet.";
    ul.append(li);
  }
}

function renderLists() {
  const { agreed, pending } = specStatus(state.picks);
  const a = $("agreed-list");
  const p = $("pending-list");
  a.textContent = "";
  p.textContent = "";
  for (const { part, option } of agreed) {
    const li = document.createElement("li");
    li.dataset.item = part;
    li.textContent = `${PART_LABEL[part][state.lang]}${state.lang === "zh" ? "：" : ": "}${option[state.lang]}`;
    a.append(li);
  }
  for (const key of pending) {
    const [name, why] = PENDING_TEXT[key][state.lang];
    const li = document.createElement("li");
    li.dataset.item = key;
    li.innerHTML = `<strong></strong><small></small>`;
    li.firstChild.textContent = name;
    li.lastChild.textContent = why;
    p.append(li);
  }
}

// Spec card. Wrap-and-shrink fitting adapted from card 022's download card.
function wrap(ctx, text, maxWidth) {
  const units = state.lang === "zh" ? [...text] : text.split(/(\s+)/);
  const lines = [];
  let line = "";
  for (const u of units) {
    const test = line + u;
    if (ctx.measureText(test).width > maxWidth && line.trim()) { lines.push(line.trim()); line = u.trimStart(); }
    else line = test;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function layoutCard(ctx, scale) {
  const { agreed, pending } = specStatus(state.picks);
  const rows = [];
  const W = 600;
  let y = 0;
  const add = (text, size, weight, color) => {
    ctx.font = `${weight} ${Math.round(size * scale)}px system-ui, "Noto Sans TC", sans-serif`;
    for (const l of wrap(ctx, text, W)) { y += size * scale * 1.35; rows.push({ l, y, size: size * scale, weight, color }); }
  };
  add(t("agreed"), 34, 800, "#E7C27A");
  for (const { part, option } of agreed) add(`${PART_LABEL[part][state.lang]}${state.lang === "zh" ? "：" : ": "}${option[state.lang]}`, 26, 500, "#F4EEDF");
  y += 24 * scale;
  add(t("pending"), 34, 800, "#E7C27A");
  for (const key of pending) add(`· ${PENDING_TEXT[key][state.lang][0]}`, 26, 500, "#F4EEDF");
  return { rows, height: y };
}

function drawCard() {
  const c = $("card");
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#14213A";
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = "#E7C27A";
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 1020, 1290);
  ctx.fillStyle = "#E7C27A";
  ctx.font = `800 52px system-ui, "Noto Sans TC", sans-serif`;
  ctx.fillText(t("cardTitle"), 70, 120, 940);
  ctx.fillStyle = "#F4EEDF";
  ctx.font = `500 30px system-ui, "Noto Sans TC", sans-serif`;
  ctx.fillText(t("client"), 70, 175, 940);
  // Lamp sketch (placeholder until art lands).
  const tint = optionOf("colour", state.picks.colour).tint;
  const s = { s: 0.82, m: 1, l: 1.12 }[state.picks.size];
  ctx.save();
  ctx.translate(220, 640);
  ctx.scale(s * 1.4, s * 1.4);
  ctx.fillStyle = tint;
  ctx.beginPath(); ctx.moveTo(-40, -150); ctx.lineTo(40, -150); ctx.lineTo(70, -40); ctx.lineTo(-70, -40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#6B5A44"; ctx.fillRect(-4, -40, 8, 80);
  ctx.fillStyle = { wood: "#8A5A34", ceramic: "#D9D2C3", brass: "#B8913F" }[state.picks.base];
  ctx.fillRect(-40, 40, 80, 40);
  ctx.restore();
  let scale = 1;
  let lay = layoutCard(ctx, scale);
  while (lay.height > 1000 && scale > 0.6) { scale -= 0.05; lay = layoutCard(ctx, scale); }
  for (const r of lay.rows) {
    ctx.font = `${r.weight} ${Math.round(r.size)}px system-ui, "Noto Sans TC", sans-serif`;
    ctx.fillStyle = r.color;
    ctx.fillText(r.l, 420, 220 + r.y);
  }
  ctx.fillStyle = "#B9C2D3";
  ctx.font = `500 24px system-ui, "Noto Sans TC", sans-serif`;
  ctx.fillText(t("label"), 70, 1280, 940);
  c.setAttribute("aria-label", `${t("cardTitle")}. ${t("client")}`);
}

function download() {
  drawCard();
  $("card").toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = t("fileName");
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
}

function setLang(lang) {
  state.lang = lang;
  const u = new URL(location.href);
  u.searchParams.set("lang", lang);
  history.replaceState(null, "", u);
  applyText();
}

// Drag on the stage to turn between the three angles.
let dragX = null;
$("stage").addEventListener("pointerdown", (e) => { dragX = e.clientX; });
$("stage").addEventListener("pointerup", (e) => {
  if (dragX === null) return;
  const dx = e.clientX - dragX;
  dragX = null;
  if (Math.abs(dx) > 30) turn(dx > 0 ? 1 : -1);
});

$("go0").addEventListener("click", () => show(1));
$("go1").addEventListener("click", () => show(2));
$("turn-l").addEventListener("click", () => turn(-1));
$("turn-r").addEventListener("click", () => turn(1));
$("zoom").addEventListener("click", () => { state.zoom = !state.zoom; $("zoom").setAttribute("aria-pressed", String(state.zoom)); $("zoom").textContent = state.zoom ? t("zoomOut") : t("zoom"); paintLamp(); });
$("spot-shade").addEventListener("click", () => spot("shade"));
$("spot-base").addEventListener("click", () => spot("base"));
$("spot-mg").addEventListener("click", () => spot("mg"));
$("go2").addEventListener("click", () => show(3));
$("go3").addEventListener("click", () => show(4));
$("go4").addEventListener("click", () => show(5));
$("download").addEventListener("click", download);
$("again").addEventListener("click", () => { state.picks = { ...DEFAULTS }; state.changed = []; paintLamp(); renderParts(); renderEffects(); show(3); });
for (const b of document.querySelectorAll("[data-lang]")) b.addEventListener("click", () => setLang(b.dataset.lang));

paintLamp();
applyText();
show(0);
