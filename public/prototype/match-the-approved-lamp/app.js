import { AGREEMENTS, ASSET, BASKETS, LAMPS, MISSED, NAMES, SAMPLE, TEXT } from "./content.js";

// Match the Lamp on the Shelf. Nothing is stored: no storage, no cookie, no address change beyond the language.
// Reactions are fixed per choice (never random). No score, no right or wrong.

const $ = (id) => document.getElementById(id);
const TRIAL = { tint: "#ECDDB3", baseFilter: "none", glowFilter: "none", glowColor: "rgba(255,206,120,.7)" };

const state = {
  lang: "zh",
  screen: 0,
  agreement: null,
  mode: "side",
  lit: false,
  single: 0,
  seenSide: false,
  marks: new Set(),
  baskets: {},
};

function t() { return TEXT[state.lang]; }
// Quote marks and colon follow the language: no full-width marks inside English lines.
const quoted = (text) => (state.lang === "zh" ? `「${text}」。` : `“${text}”.`);
const colon = () => (state.lang === "zh" ? "：" : ": ");
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function readLang() {
  const q = new URLSearchParams(location.search).get("lang");
  return q === "en" || q === "zh" ? q : (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function lampLayers(spec) {
  const lamp = el("div", "lamp");
  lamp.style.setProperty("--tint", spec.tint);
  lamp.style.setProperty("--glowc", spec.glowColor);
  lamp.style.setProperty("--shade-mask", `url("${ASSET}lamp-shade-paper-f.webp")`);
  const mk = (cls, name, filter) => {
    const img = el("img", `layer ${cls}`);
    img.src = `${ASSET}${name}`;
    img.alt = "";
    img.width = 800;
    img.height = 800;
    img.decoding = "async";
    if (filter && filter !== "none") img.style.filter = filter;
    return img;
  };
  lamp.append(mk("cord", "lamp-cord-f.webp"), mk("base", "lamp-base-brass-f.webp", spec.baseFilter), mk("shade", "lamp-shade-paper-f.webp"), el("div", "layer tint"), mk("glow", "lamp-shade-glow-f.webp", spec.glowFilter));
  return lamp;
}

function buildStage() {
  const sample = $("sample");
  const prop = (cls, name) => {
    const img = el("img", cls);
    img.src = `assets/${name}`;
    img.alt = "";
    img.width = 480;
    img.height = 480;
    img.decoding = "async";
    return img;
  };
  sample.replaceChildren(lampLayers(SAMPLE), prop("stand", "prop-sealed-stand.webp"), prop("tagcard", "prop-approved-tag.webp"));
  const holder = $("lamps");
  holder.replaceChildren();
  LAMPS.forEach((spec, index) => {
    const button = el("button", "lamp-btn");
    button.type = "button";
    button.dataset.i = String(index);
    button.dataset.id = spec.id;
    button.setAttribute("aria-pressed", "false");
    button.append(lampLayers(spec), el("span", "letter", spec.id));
    button.addEventListener("click", () => onLampClick(spec.id));
    holder.appendChild(button);
  });
  const trial = el("div", "lamp-btn trial");
  trial.dataset.i = "2";
  trial.append(lampLayers(TRIAL));
  holder.appendChild(trial);
}

function onLampClick(id) {
  if (state.screen !== 2) return;
  if (state.marks.has(id)) state.marks.delete(id); else state.marks.add(id);
  syncMarks();
  syncGate2();
}

function syncMarks() {
  document.querySelectorAll(".lamp-btn[data-id]").forEach((button) => {
    const on = state.marks.has(button.dataset.id);
    button.setAttribute("aria-pressed", String(on));
    button.setAttribute("aria-label", t().lampLabel(button.dataset.id, on));
  });
}

function syncStage() {
  const stage = $("stage");
  stage.dataset.screen = String(state.screen);
  stage.dataset.mode = state.screen === 2 ? state.mode : "side";
  stage.classList.toggle("lit", state.lit && state.screen === 2);
  document.querySelectorAll(".lamp-btn[data-id]").forEach((button, index) => {
    button.classList.toggle("current", state.mode === "single" && index === state.single);
    button.disabled = state.screen !== 2;
  });
}

function applyStatic() {
  const x = t();
  document.documentElement.lang = x.htmlLang;
  document.title = x.docTitle;
  $("skip").textContent = x.skip;
  $("toy-label").textContent = x.label;
  $("lang-group").setAttribute("aria-label", x.lang);
  document.querySelectorAll("#lang-group button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  $("s0-title").textContent = x.title;
  $("s0-tagline").textContent = x.tagline;
  $("s0-scope").textContent = x.scope;
  $("s0-note").textContent = x.startNote;
  $("go0").textContent = x.start;
  $("s1-title").textContent = x.s1title;
  $("s1-narr").textContent = x.s1narr;
  $("s1-ask").textContent = x.s1ask;
  $("go1").textContent = x.s1go;
  $("s2-title").textContent = x.s2title;
  $("s2-narr").textContent = x.s2narr;
  $("s2-hint").textContent = x.s2hint;
  $("mode-single").textContent = x.modeSingle;
  $("mode-side").textContent = x.modeSide;
  $("prev").textContent = x.prev;
  $("next").textContent = x.next;
  $("mark-hint").textContent = x.markHint;
  $("go2").textContent = x.s2go;
  $("s3-title").textContent = x.s3title;
  $("s3-narr").textContent = x.s3narr;
  $("go3").textContent = x.s3go;
  $("s4-title").textContent = x.s4title;
  $("scope-end").textContent = x.scopeEnd;
  $("again").textContent = x.again;
  $("link-lamp").textContent = x.linkLamp;
  $("link-lamp").href = `/prototype/take-the-lantern-apart/?lang=${state.lang}`;
  $("link-street").textContent = x.linkStreet;
  $("link-street").href = `/prototype/trade-street/?lang=${state.lang}`;
  $("boundary-end").textContent = x.boundaryEnd;
  renderAgree();
  renderModes();
  syncMarks();
  syncGate2();
  if (state.screen === 3) renderSort();
  if (state.screen === 4) renderEnd();
}

function sayBlock(who, text) {
  const box = el("div", "say");
  box.append(el("b", null, NAMES[who][state.lang]), el("span", null, text));
  return box;
}

function renderAgree() {
  const x = t();
  const holder = $("agree");
  holder.replaceChildren();
  AGREEMENTS.forEach((id) => {
    const button = el("button");
    button.type = "button";
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(state.agreement === id));
    button.dataset.agree = id;
    button.append(el("strong", null, x.agree[id].t), el("span", null, x.agree[id].d));
    button.addEventListener("click", () => {
      state.agreement = id;
      renderAgree();
    });
    holder.appendChild(button);
  });
  const react = $("agree-react");
  if (state.agreement) {
    const r = x.agreeReact[state.agreement];
    react.replaceChildren(el("b", null, NAMES[r.who][state.lang]), el("span", null, r.t));
    react.hidden = false;
  } else react.hidden = true;
  $("go1").disabled = !state.agreement;
}

function renderModes() {
  const x = t();
  $("mode-single").setAttribute("aria-pressed", String(state.mode === "single"));
  $("mode-side").setAttribute("aria-pressed", String(state.mode === "side"));
  $("light").setAttribute("aria-pressed", String(state.lit));
  $("light").textContent = state.lit ? x.lightOff : x.lightOn;
  $("single-nav").hidden = state.mode !== "single";
  const note = state.lit ? x.litNote : state.mode === "single" ? x.singleNote : x.sideNote;
  $("mode-note").textContent = note;
}

function syncGate2() {
  const x = t();
  let message = "";
  if (!state.seenSide) message = x.needSide;
  else if (state.marks.size === 0) message = x.needMark;
  $("gate").textContent = message;
  $("go2").disabled = Boolean(message);
}

function setMode(mode) {
  state.mode = mode;
  if (mode === "side") state.seenSide = true;
  renderModes();
  syncStage();
  syncGate2();
}

function renderSort() {
  const x = t();
  const holder = $("sort");
  holder.replaceChildren();
  [...state.marks].sort().forEach((id) => {
    const spec = LAMPS.find((l) => l.id === id);
    const item = el("div", "sort-item");
    item.dataset.lamp = id;
    item.append(el("h3", null, spec.diff ? x.diffTitle[spec.diff](id) : x.sameTitle(id)));
    const group = el("div", "baskets");
    group.setAttribute("role", "group");
    BASKETS.forEach((basket) => {
      const button = el("button", null, x.basket[basket]);
      button.type = "button";
      button.dataset.basket = basket;
      button.setAttribute("aria-pressed", String(state.baskets[id] === basket));
      button.addEventListener("click", () => {
        state.baskets[id] = basket;
        renderSort();
      });
      group.appendChild(button);
    });
    item.appendChild(group);
    const basket = state.baskets[id];
    if (basket) {
      const r = spec.diff ? x.react[spec.diff][basket] : x.reactSame[basket];
      const reply = sayBlock(r.who, r.t);
      if (basket === "inrange") {
        reply.appendChild(el("span", "soft", ` ${state.agreement ? `${x.agreedWas}${quoted(x.agree[state.agreement].t)}` : x.agreedNone}`));
      }
      item.appendChild(reply);
    }
    holder.appendChild(item);
  });
  const missing = [...state.marks].some((id) => !state.baskets[id]);
  $("gate3").textContent = missing ? x.needBasket : "";
  $("go3").disabled = missing;
}

function renderEnd() {
  const x = t();
  $("card-lines").replaceChildren(...x.cardLines.map((line) => el("li", null, line)));
  $("agreed").textContent = state.agreement ? `${x.agreedWas}${quoted(x.agree[state.agreement].t)}` : x.agreedNone;
  const missed = LAMPS.filter((l) => l.diff && !state.marks.has(l.id));
  const holder = $("missed");
  holder.replaceChildren();
  if (missed.length) {
    holder.appendChild(el("p", "soft", x.missedTitle));
    missed.forEach((l) => holder.appendChild(el("p", null, `${l.id}${colon()}${MISSED[l.diff][state.lang]}`)));
  } else holder.appendChild(el("p", "soft", x.missedNone));
}

function show(n, focus) {
  state.screen = n;
  document.querySelectorAll(".screen").forEach((s) => { s.hidden = Number(s.dataset.screen) !== n; });
  if (n === 2) { state.mode = "single"; state.lit = false; state.seenSide = false; state.single = 0; renderModes(); syncGate2(); }
  if (n === 3) renderSort();
  if (n === 4) renderEnd();
  syncStage();
  syncMarks();
  if (focus) {
    const heading = n === 0 ? $("s0-title") : $(`s${n}-title`);
    heading.setAttribute("tabindex", "-1");
    window.scrollTo(0, 0);
    heading.focus({ preventScroll: true });
  }
}

function reset() {
  state.agreement = null;
  state.marks = new Set();
  state.baskets = {};
  renderAgree();
  $("agree-react").hidden = true;
  show(0, true);
}

function wire() {
  document.querySelectorAll("#lang-group button").forEach((button) => {
    button.addEventListener("click", () => {
      state.lang = button.dataset.lang;
      const url = new URL(location.href);
      url.searchParams.set("lang", state.lang);
      history.replaceState(null, "", url);
      applyStatic();
    });
  });
  $("go0").addEventListener("click", () => show(1, true));
  $("go1").addEventListener("click", () => show(2, true));
  $("go2").addEventListener("click", () => show(3, true));
  $("go3").addEventListener("click", () => show(4, true));
  $("again").addEventListener("click", reset);
  $("mode-single").addEventListener("click", () => setMode("single"));
  $("mode-side").addEventListener("click", () => setMode("side"));
  $("light").addEventListener("click", () => {
    state.lit = !state.lit;
    renderModes();
    syncStage();
  });
  $("prev").addEventListener("click", () => { state.single = (state.single + LAMPS.length - 1) % LAMPS.length; syncStage(); });
  $("next").addEventListener("click", () => { state.single = (state.single + 1) % LAMPS.length; syncStage(); });
}

state.lang = readLang();
buildStage();
wire();
applyStatic();
show(0, false);
