import { COPY, PREREQUISITES, SCENARIOS, STARTING_FOUNDATIONS, STATIONS } from "./content.js";

const $ = (id) => document.getElementById(id);
const queryLang = new URLSearchParams(location.search).get("lang");
const state = { lang: ["zh", "en"].includes(queryLang) ? queryLang : (navigator.language.startsWith("zh") ? "zh" : "en"), scenario: null, phase: "start", selected: null, route: [], feedback: null };
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const asset = (name) => `assets/${name}.webp`;
// Match each card surface to the sampled outer pixel of its paper-textured icon.
const ICON_SURFACES = {
  learn: "#f5f3ef", tools: "#f5f4ed", context: "#f5f3ef", data: "#f5f4ed",
  search: "#f5f3ef", connect: "#f6f4f0", collaborate: "#f8f8ef",
};

const scenarioButtons = SCENARIOS.map((id) => {
  const button = document.createElement("button");
  button.type = "button"; button.className = "scenario"; button.dataset.scenario = id;
  const img = document.createElement("img"); img.src = asset(`scenario-${id === "scattered" ? "a" : id === "individual" ? "b" : "c"}`); img.width = 640; img.height = 480; img.decoding = "async";
  button.append(img, document.createElement("strong"), document.createElement("span"));
  button.addEventListener("click", () => { state.scenario = id; render(); });
  $("scenarios").append(button); return button;
});
const stationButtons = STATIONS.map((id) => {
  const button = document.createElement("button"); button.type = "button"; button.className = "station"; button.dataset.station = id;
  const img = document.createElement("img"); img.src = asset(`station-${id}`); img.width = 128; img.height = 128; img.decoding = "async";
  button.style.setProperty("--icon-surface", ICON_SURFACES[id]);
  button.append(img, document.createElement("span"), document.createElement("small"));
  button.addEventListener("click", () => { state.selected = id; render(); });
  $("stations").append(button); return button;
});

function missingFor(id) {
  const visited = new Set([...state.route.map((step) => step.id), ...(STARTING_FOUNDATIONS[state.scenario] || [])]);
  return PREREQUISITES[id].filter((required) => !visited.has(required));
}
function makeStep(id, missing, t) {
  const item = document.createElement("li"); item.className = missing.length ? "unsteady" : "steady";
  item.style.setProperty("--icon-surface", ICON_SURFACES[id]);
  const img = document.createElement("img"); img.src = asset(`station-${id}`); img.width = 128; img.height = 128; img.alt = t.stations[id].imageAlt;
  const text = document.createElement("span"); const name = document.createElement("strong"); name.textContent = t.stations[id].name;
  const status = document.createElement("small"); status.textContent = missing.length ? `⚠ ${t.unstable}` : `✓ ${t.stable}`;
  text.append(name, status); item.append(img, text); return item;
}
function render() {
  const t = COPY[state.lang];
  document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
  document.title = `${t.title} · Paul's Tradecraft`;
  document.querySelector(".hero-art img").alt = t.graphicAlt;
  document.querySelectorAll("[data-copy]").forEach((node) => { node.textContent = t[node.dataset.copy]; });
  document.querySelectorAll("[data-lang]").forEach((node) => node.setAttribute("aria-pressed", String(node.dataset.lang === state.lang)));
  $("home-link").href = `/?lang=${state.lang}`; $("footer-link").href = `/?lang=${state.lang}`;
  $("lab-link").href = `/ai-lab/?lang=${state.lang}#c13`; $("funnel-link").href = `/prototype/ai-funnel/?lang=${state.lang}`;
  scenarioButtons.forEach((button, index) => { const d = t.scenarios[SCENARIOS[index]]; button.children[0].alt = d.imageAlt; button.children[1].textContent = d.name; button.children[2].textContent = d.description; button.setAttribute("aria-pressed", String(state.scenario === SCENARIOS[index])); });
  $("begin").disabled = !state.scenario;
  const initial = STARTING_FOUNDATIONS[state.scenario] || [];
  $("starting-foundation").hidden = !initial.length;
  $("starting-foundation").textContent = initial.length ? `${t.startingFoundation} ${initial.map((id) => t.stations[id].name).join(" · ")}` : "";
  $("summary-foundation").hidden = !initial.length;
  $("summary-foundation").textContent = $("starting-foundation").textContent;
  $("start").hidden = state.phase !== "start"; $("route").hidden = state.phase !== "route"; $("summary").hidden = state.phase !== "summary";
  stationButtons.forEach((button, index) => {
    const id = STATIONS[index], data = t.stations[id], done = state.route.find((step) => step.id === id);
    button.children[0].alt = data.imageAlt; button.children[1].textContent = data.name;
    button.children[2].textContent = done ? (done.missing.length ? `⚠ ${t.unstable}` : `✓ ${t.stable}`) : t.unvisited;
    button.disabled = Boolean(done); button.setAttribute("aria-pressed", String(state.selected === id));
    button.classList.toggle("unsteady", Boolean(done?.missing.length));
  });
  $("journey").replaceChildren(...state.route.map((step) => makeStep(step.id, step.missing, t)));
  $("empty-journey").hidden = state.route.length > 0;
  $("summary-button").disabled = state.route.length === 0;
  const selected = state.selected, detail = selected && t.stations[selected];
  $("detail-name").textContent = detail?.name ?? t.unvisited;
  $("detail-description").textContent = detail?.detail ?? t.routeLead;
  $("detail-gate").textContent = detail?.gate ?? "";
  const missing = selected ? missingFor(selected) : [];
  $("detail-needs").hidden = !missing.length;
  $("detail-needs").textContent = missing.length ? `${t.needs} ${missing.map((id) => t.stations[id].name).join(" · ")}` : "";
  $("add-station").disabled = !selected || state.route.some((step) => step.id === selected);
  $("feedback").textContent = state.feedback ? (state.feedback.missing.length ? `${t.feedbackBad} ${t.stations[state.feedback.id].consequence}` : t.feedbackGood) : "";
  $("summary-route").replaceChildren(...state.route.map((step) => makeStep(step.id, step.missing, t)));
  const unstable = state.route.filter((step) => step.missing.length);
  $("unstable-list").replaceChildren(...(unstable.length ? unstable.map((step) => { const p = document.createElement("p"); p.className = "unstable-note"; const strong = document.createElement("strong"); strong.textContent = t.stations[step.id].name; p.append(strong, document.createTextNode(` — ${t.stations[step.id].consequence} ${t.needs} ${step.missing.map((id) => t.stations[id].name).join(" · ")}`)); return p; }) : [Object.assign(document.createElement("p"), { textContent: t.noUnstable })]));
  if (state.scenario) {
    const s = t.scenarios[state.scenario]; $("first-step").textContent = s.first;
    $("suggested-route").replaceChildren(...s.order.map((id) => Object.assign(document.createElement("li"), { textContent: t.stations[id].name })));
  }
  $("glossary-list").replaceChildren(...t.glossaryItems.flatMap(([term, definition]) => { const dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = term; dd.textContent = definition; return [dt, dd]; }));
}
function reveal(id) { const node = $(id); node.scrollIntoView({ block: "start", behavior: reduced() ? "instant" : "smooth" }); node.focus({ preventScroll: true }); }
document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => { state.lang = button.dataset.lang; const url = new URL(location.href); url.searchParams.set("lang", state.lang); history.replaceState(null, "", url); render(); }));
$("begin").addEventListener("click", () => { if (!state.scenario) return; state.phase = "route"; state.selected = null; state.route = []; state.feedback = null; render(); reveal("route"); });
$("add-station").addEventListener("click", () => { const id = state.selected; if (!id || state.route.some((step) => step.id === id)) return; const missing = missingFor(id); state.route.push({ id, missing }); state.feedback = { id, missing }; state.selected = null; render(); if (state.route.length === STATIONS.length) { $("summary-button").focus(); } });
$("summary-button").addEventListener("click", () => { if (!state.route.length) return; state.phase = "summary"; render(); reveal("summary"); });
$("restart").addEventListener("click", () => { state.route = []; state.selected = null; state.phase = "route"; state.feedback = null; render(); reveal("route"); });
$("change-start").addEventListener("click", () => { state.route = []; state.selected = null; state.scenario = null; state.phase = "start"; state.feedback = null; render(); reveal("start"); });
const initialUrl = new URL(location.href); initialUrl.searchParams.set("lang", state.lang); history.replaceState(null, "", initialUrl);
render();
