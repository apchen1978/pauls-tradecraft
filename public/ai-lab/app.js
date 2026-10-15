import { AGENTS, LINKS, TEXT, TIERS } from "./content.js";

// AI Lab, phase 1. Nothing is stored; only ?lang= goes into the address. Demos are fixed, never random.
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  lang: (() => {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "zh" || q === "en") return q;
    return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  })(),
  tier: null,
  played: false,
  removed: false,
  agent: null,
};
let timers = [];
const t = () => TEXT[state.lang];

function drawNet() {
  // A quiet network: dots on a line, joined, one pulsing. Fixed positions, no randomness.
  const g = $("net");
  const ns = "http://www.w3.org/2000/svg";
  const pts = [[20, 110], [90, 60], [170, 100], [250, 40], [330, 90], [410, 50], [490, 105], [580, 70]];
  g.replaceChildren();
  pts.forEach((p, i) => {
    if (i) {
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", pts[i - 1][0]); l.setAttribute("y1", pts[i - 1][1]);
      l.setAttribute("x2", p[0]); l.setAttribute("y2", p[1]);
      g.appendChild(l);
    }
    if (i > 1 && i % 3 === 0) {
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", pts[i - 2][0]); l.setAttribute("y1", pts[i - 2][1]);
      l.setAttribute("x2", p[0]); l.setAttribute("y2", p[1]);
      g.appendChild(l);
    }
  });
  pts.forEach((p, i) => {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", p[0]); c.setAttribute("cy", p[1]); c.setAttribute("r", i === 4 ? 6 : 3.5);
    if (i === 4) c.setAttribute("class", "pulse");
    g.appendChild(c);
  });
}

function renderFunnel() {
  const x = t().c0;
  const holder = $("funnel");
  holder.replaceChildren();
  TIERS.forEach((id, i) => {
    const b = el("button", "tier");
    b.type = "button";
    b.dataset.i = String(i);
    b.dataset.tier = id;
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(state.tier === id));
    b.append(el("strong", null, x.tiers[id].name), el("span", null, x.tiers[id].d));
    if (state.tier === id) b.appendChild(el("span", "here", x.here));
    b.addEventListener("click", () => { state.tier = id; renderFunnel(); });
    holder.appendChild(b);
  });
  $("funnel-reply").textContent = state.tier ? x.tiers[state.tier].reply : "";
}

function clearTimers() { timers.forEach(clearTimeout); timers = []; }

function renderCompare(animate) {
  const x = t().c2;
  clearTimers();
  $("play").textContent = state.played ? x.replay : x.play;
  $("chat-title").textContent = x.chatTitle;
  $("chat-sub").textContent = x.chatSub;
  $("chat-reply").textContent = x.chatReply;
  $("chat-note").textContent = x.chatNote;
  $("agent-title").textContent = x.agentTitle;
  $("agent-sub").textContent = x.agentSub;
  $("agent-note").textContent = x.agentNote;
  const steps = $("steps");
  steps.replaceChildren(...x.steps.map(([name, text], i) => {
    const li = el("li", i === x.steps.length - 1 ? "stop" : "");
    const body = el("span");
    body.append(el("b", null, name), document.createTextNode(` ${text}`));
    li.append(el("span", "dot", String(i + 1).padStart(2, "0")), body);
    return li;
  }));
  const items = [...steps.children];
  const show = (done) => {
    $("chat-reply").hidden = !done.chat;
    $("chat-note").hidden = !done.chat;
    items.forEach((li, i) => li.classList.toggle("on", i < done.steps));
    $("agent-note").hidden = done.steps < items.length;
  };
  if (!state.played) { show({ chat: false, steps: 0 }); return; }
  if (!animate || reduced()) { show({ chat: true, steps: items.length }); return; }
  show({ chat: false, steps: 0 });
  timers.push(setTimeout(() => show({ chat: true, steps: 0 }), 500));
  items.forEach((_, i) => timers.push(setTimeout(() => show({ chat: true, steps: i + 1 }), 900 + i * 650)));
}

function renderFlow() {
  const x = t().c3;
  const flow = $("flow");
  flow.classList.toggle("removed", state.removed);
  flow.replaceChildren(...x.nodes.map(([name, kind]) => {
    const li = el("li");
    li.dataset.kind = kind;
    li.append(el("span", "tag", kind === "human" ? x.humanTag : x.aiTag), el("strong", null, name));
    return li;
  }));
  const btn = $("remove-human");
  btn.setAttribute("aria-pressed", String(state.removed));
  btn.textContent = state.removed ? x.restore : x.remove;
  const out = $("outcome");
  out.classList.toggle("warn", state.removed);
  out.replaceChildren();
  if (state.removed) {
    out.appendChild(el("p", null, x.without));
    const ul = el("ul");
    x.risks.forEach((r) => ul.appendChild(el("li", null, r)));
    out.appendChild(ul);
    out.firstChild.style.margin = "0";
  } else {
    const p = el("p", null, x.withHuman);
    p.style.margin = "0";
    out.appendChild(p);
  }
  $("c3-link").textContent = x.link;
  $("c3-link").href = `/cases/commercial-decision-desk/${state.lang === "en" ? "#en" : ""}`;
}

function renderTeam() {
  const x = t().c4;
  const hub = $("paul");
  hub.replaceChildren(el("strong", null, x.paul[0]), el("span", null, x.paul[1]));
  const holder = $("agents");
  holder.replaceChildren(...AGENTS.map((id) => {
    const a = x.agents[id];
    const b = el("button", "agent-btn");
    b.type = "button";
    b.dataset.agent = id;
    b.setAttribute("aria-pressed", String(state.agent === id));
    b.append(el("span", "mono", a.full), el("strong", null, a.name), el("span", null, a.role));
    b.addEventListener("click", () => { state.agent = id; renderTeam(); });
    return b;
  }));
  const detail = $("agent-detail");
  detail.replaceChildren();
  if (state.agent) {
    detail.append(el("b", null, `${x.agents[state.agent].name} · ${x.exampleLabel}`), el("span", null, x.agents[state.agent].example));
  } else detail.appendChild(el("span", null, x.pick));
  $("story-title").textContent = x.storyTitle;
  $("story").replaceChildren(...x.story.map(([who, what]) => {
    const li = el("li", who === "Paul" ? "paul" : "");
    li.append(el("span", "who", who), el("span", null, what));
    return li;
  }));
  $("rules-title").textContent = x.rulesTitle;
  $("rules").replaceChildren(...x.rules.map((r) => el("li", null, r)));
  $("play-work").textContent = `${x.playWork} →`;
  $("play-work").href = `/prototype/match-the-approved-lamp/?lang=${state.lang}`;
  $("method").textContent = `${x.method} →`;
  $("method").href = `/cases/how-i-run-ai-agents/${state.lang === "en" ? "#en" : ""}`;
}

function render() {
  const x = t();
  document.documentElement.lang = x.htmlLang;
  document.title = x.docTitle;
  $("skip").textContent = x.skip;
  $("home").href = `/?lang=${state.lang}`;
  $("home").setAttribute("aria-label", x.home);
  document.querySelectorAll("#lang-group button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  $("kicker").textContent = x.kicker;
  $("title").textContent = x.title;
  $("lead").textContent = x.lead;
  $("toc").replaceChildren(...x.toc.map((label, i) => {
    const li = el("li");
    const a = el("a");
    a.href = `#c${[0, 2, 3, 4][i]}`;
    a.append(el("span", "n", String([0, 2, 3, 4][i]).padStart(2, "0")), document.createTextNode(label));
    li.appendChild(a);
    return li;
  }));
  for (const c of ["c0", "c2", "c3", "c4"]) {
    $(`${c}-no`).textContent = x[c].no;
    $(`${c}-title`).textContent = x[c].title;
    $(`${c}-lead`).textContent = x[c].lead;
  }
  $("c0-source").textContent = x.c0.source;
  $("c0-link").textContent = x.c0.sourceLink;
  $("c0-link").href = LINKS.decoder;
  $("c0-x").textContent = x.c0.sourceOriginal;
  $("c0-x").href = LINKS.x;
  $("c2-demo").textContent = x.c2.demo;
  $("cta-title").textContent = x.ctaTitle;
  $("cta").textContent = x.cta;
  $("cta").href = `/?lang=${state.lang}#contact`;
  $("footer").textContent = x.footer;
  renderFunnel();
  renderCompare(false);
  renderFlow();
  renderTeam();
}

document.querySelectorAll("#lang-group button").forEach((b) => b.addEventListener("click", () => {
  state.lang = b.dataset.lang;
  const url = new URL(location.href);
  url.searchParams.set("lang", state.lang);
  history.replaceState(null, "", url);
  render();
}));
$("play").addEventListener("click", () => { state.played = true; renderCompare(true); });
$("remove-human").addEventListener("click", () => { state.removed = !state.removed; renderFlow(); });

drawNet();
render();
