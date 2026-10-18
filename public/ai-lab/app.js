import { AGENTS, LINKS, NAV_CHAPTERS, TEXT, TIERS } from "./content.js";
import { CONTEXT_ITEMS, CONTEXT_START, DEEP, PHYSICS, TOLERANCE } from "./deep.js";
import { GATES, GLOSSARY, MORE, NEXT, TRACE } from "./more.js";
import { LATEST, LATEST_TEXT } from "./latest.js";
import { SPIRIT } from "./spirit.js";
import { PART_TWO, SYSTEMS, TASK_REQUIREMENTS } from "./enterprise.js";
import { LADDER } from "./ladder.js";

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
  ctx: new Set(CONTEXT_START),
  measured: false,
  words: [],
  traced: false,
  noDoc: false,
  gates: new Set(),
  task: "products",
  access: new Set(["products:read"]),
  approval: true,
  ladderLevel: 1,
  ladderSkip: false,
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

const d = () => DEEP[state.lang];

function renderContext() {
  const x = d().c5;
  $("ctx-label").textContent = x.window;
  const holder = $("ctx-items");
  holder.replaceChildren(...CONTEXT_ITEMS.map((item) => {
    const b = el("button", "ctx-item");
    b.type = "button";
    b.dataset.item = item.id;
    b.setAttribute("aria-pressed", String(state.ctx.has(item.id)));
    b.append(el("strong", null, x.items[item.id][0]), el("span", null, x.items[item.id][1]));
    b.addEventListener("click", () => {
      if (state.ctx.has(item.id)) state.ctx.delete(item.id); else state.ctx.add(item.id);
      renderContext();
    });
    return b;
  }));
  const on = CONTEXT_ITEMS.filter((i) => state.ctx.has(i.id));
  const used = on.reduce((s, i) => s + i.size, 0);
  const bar = $("ctx-bar");
  bar.replaceChildren(...on.map((i) => {
    const seg = el("span", `seg ${i.need}`);
    seg.style.flexGrow = String(i.size);
    return seg;
  }));
  if (used < 100) { const free = el("span", "seg free"); free.style.flexGrow = String(100 - used); bar.appendChild(free); }
  bar.classList.toggle("over", used > 100);
  const has = (id) => state.ctx.has(id);
  let key = "right";
  if (used > 100) key = "full";
  else if (!has("rules")) key = "noRules";
  else if (!has("memory")) key = "noMemory";
  else if (!has("task")) key = "noTask";
  else if (!has("files")) key = "noFiles";
  else if (on.some((i) => i.need === "noise")) key = "noise";
  const v = $("ctx-verdict");
  v.textContent = x.verdict[key];
  v.dataset.state = key === "right" ? "ok" : key === "noise" ? "meh" : "bad";
  v.dataset.key = key;
  $("c5-ours-title").textContent = x.oursTitle;
  $("c5-ours").replaceChildren(...x.ours.map((r) => el("li", null, r)));
}

function renderVerify() {
  const x = d().c7;
  $("c7-auto-title").textContent = x.autoTitle;
  $("c7-auto").replaceChildren(...x.auto.map((r) => el("li", null, r)));
  $("c7-review-title").textContent = x.reviewTitle;
  $("c7-review").replaceChildren(...x.review.map((r) => el("li", null, r)));
  $("c7-demo-title").textContent = x.demoTitle;
  $("c7-demo-lead").textContent = x.demoLead;
  $("use-guess").textContent = x.useGuess;
  $("use-measured").textContent = x.useMeasured;
  $("use-guess").setAttribute("aria-pressed", String(!state.measured));
  $("use-measured").setAttribute("aria-pressed", String(state.measured));
  const head = el("tr");
  ["", x.colSurface, x.colLamp, ""].forEach((h) => head.appendChild(el("th", null, h)));
  const rows = PHYSICS.map((p) => {
    const at = state.measured ? p.target : p.guess;
    const ok = Math.abs(at - p.target) <= TOLERANCE;
    const tr = el("tr", ok ? "ok" : "bad");
    tr.dataset.row = p.id;
    tr.append(el("td", null, x.rows[p.id]), el("td", "mono", `${p.target.toFixed(1)}%`), el("td", "mono", `${at.toFixed(1)}%`), el("td", "verdict", ok ? x.pass : x.fail));
    return tr;
  });
  $("phys").replaceChildren(head, ...rows);
  $("phys-note").textContent = state.measured ? x.measuredNote : x.guessNote;
  $("c7-rule").textContent = x.rule;
}

function renderCases() {
  const x = d().c10;
  $("cases").replaceChildren(...x.cases.map((c) => {
    const li = el("li", "case");
    li.append(el("span", "mono kind", `${x.kinds[c.kind]} · ${c.who}`), el("p", "what", c.what));
    const dl = el("dl");
    dl.append(el("dt", null, x.found), el("dd", null, c.found), el("dt", null, x.fix), el("dd", null, c.fix));
    li.appendChild(dl);
    return li;
  }));
  $("c10-closing").textContent = x.closing;
}

function renderLessons() {
  const x = d().c12;
  $("lessons").replaceChildren(...x.cases.map((c) => {
    const li = el("li", "case");
    li.append(el("span", "mono kind", `${x.kinds[c.kind]} · ${c.who}`), el("p", "what", c.what));
    const dl = el("dl");
    dl.append(el("dt", null, x.found), el("dd", null, c.found), el("dt", null, x.fix), el("dd", null, c.fix));
    li.appendChild(dl);
    return li;
  }));
  $("c12-closing").replaceChildren(...x.closing.map((line) => el("p", "sub", line)));
}

function renderEnterpriseResult() {
  const x = PART_TWO[state.lang];
  const requirements = TASK_REQUIREMENTS[state.task];
  const granted = [...state.access];
  const unreviewed = granted.filter((key) => /:(write|send)$/.test(key));
  const missing = requirements.filter(([system, permission]) => !state.access.has(`${system}:${permission}`));
  const result = $("access-result");
  let status;
  let message;
  if (unreviewed.length && !state.approval) {
    status = "risky";
    message = unreviewed.some((key) => key === "email:send")
      ? x.risks.send
      : unreviewed.some((key) => key === "erp:write") ? x.risks.erp : x.risks.write;
  } else if (missing.length) {
    status = "missing";
    const labels = missing.map(([system, permission]) => `${x.systems[system]} · ${x.permissions[permission]}`);
    message = `${x.missing} ${labels.join(state.lang === "zh" ? "、" : ", ")}.`;
  } else {
    const required = new Set(requirements.map(([system, permission]) => `${system}:${permission}`));
    const hasExtraAccess = granted.some((key) => !required.has(key));
    status = hasExtraAccess ? "broad" : "safe";
    message = x.results[state.task] + (hasExtraAccess ? ` ${x.extra}` : "");
  }
  result.dataset.state = status;
  $("access-result-status").textContent = x.statuses[status];
  $("access-result-copy").textContent = message;
}

function renderEnterprise() {
  const x = PART_TWO[state.lang];
  $("part2-kicker").textContent = x.partKicker;
  $("part2-title").textContent = x.partTitle;
  $("part2-intro").replaceChildren(...x.partIntro.map((line) => el("p", "sub", line)));
  $("c13-no").textContent = x.no;
  $("c13-title").textContent = x.title;
  $("c13-lead").textContent = x.lead;
  $("c13-demo").textContent = x.demo;
  $("access-desk-title").textContent = x.deskTitle;
  $("access-desk-lead").textContent = x.deskLead;
  $("access-task-label").textContent = x.taskLabel;
  $("access-result-title").textContent = x.resultTitle;

  const taskList = $("access-tasks");
  taskList.replaceChildren(...x.tasks.map((task) => {
    const button = el("button", "access-task");
    button.type = "button";
    button.dataset.task = task.id;
    button.setAttribute("aria-pressed", String(state.task === task.id));
    button.append(el("strong", null, task.name), el("span", null, task.hint));
    button.addEventListener("click", () => {
      state.task = task.id;
      taskList.querySelectorAll("[data-task]").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.task === state.task)));
      renderEnterpriseResult();
    });
    return button;
  }));

  const table = $("access-table");
  const head = el("thead");
  const headerRow = el("tr");
  headerRow.appendChild(el("th", null, x.systemHeading));
  ["read", "write", "send"].forEach((permission) => headerRow.appendChild(el("th", null, x.permissions[permission])));
  head.appendChild(headerRow);
  const body = el("tbody");
  SYSTEMS.forEach((system) => {
    const row = el("tr");
    row.appendChild(el("th", null, x.systems[system.id]));
    system.permissions.forEach((permission) => {
      const cell = el("td");
      if (!permission) {
        const na = el("span", "access-na", x.notApplicable);
        na.setAttribute("aria-label", x.notApplicable);
        cell.appendChild(na);
      } else {
        const label = el("label", "access-toggle");
        const input = el("input");
        input.type = "checkbox";
        input.dataset.system = system.id;
        input.dataset.permission = permission;
        input.setAttribute("aria-label", `${x.systems[system.id]} · ${x.permissions[permission]}`);
        input.checked = state.access.has(`${system.id}:${permission}`);
        input.addEventListener("change", () => {
          const key = `${system.id}:${permission}`;
          if (input.checked) state.access.add(key); else state.access.delete(key);
          renderEnterpriseResult();
        });
        label.appendChild(input);
        cell.appendChild(label);
      }
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
  table.replaceChildren(head, body);
  $("access-email-note").textContent = x.emailNote;
  const approval = $("access-approval");
  approval.checked = state.approval;
  approval.setAttribute("aria-label", x.approval);
  $("access-approval-label").textContent = x.approval;
  approval.onchange = () => { state.approval = approval.checked; renderEnterpriseResult(); };

  const reveal = $("access-reveal");
  reveal.querySelector("summary").textContent = x.revealTitle;
  $("access-reveal-lead").textContent = x.revealLead;
  $("access-just-enough").replaceChildren(...x.justEnough.map((item) => {
    const li = el("li", "access-answer");
    li.append(el("strong", null, item.name), el("span", null, item.access));
    return li;
  }));
  $("access-principles-title").textContent = x.principlesTitle;
  $("access-principles").replaceChildren(...x.principles.map((principle) => el("li", null, principle)));
  renderEnterpriseResult();
}

function renderLadderSteps() {
  const x = LADDER[state.lang];
  $("ladder-steps").replaceChildren(...x.steps.map((name, index) => {
    const agentStep = index === 1 || index === 2;
    const proposedStep = agentStep && state.ladderLevel === 2;
    const autonomousStep = agentStep && state.ladderLevel === 3;
    const jumpedStep = index === 3 && state.ladderSkip;
    const li = el("li", jumpedStep ? "ladder-step jumped" : "ladder-step");
    li.dataset.owner = jumpedStep || autonomousStep ? "agent" : proposedStep ? "shared" : "human";
    const heading = el("div", "ladder-step-heading");
    heading.append(el("strong", null, name), el("span", "ladder-owner", jumpedStep || autonomousStep ? x.agent : proposedStep ? `${x.agent} + ${x.human}` : x.human));
    li.append(heading, el("p", null, jumpedStep ? x.jumped : x.roles[state.ladderLevel - 1][index]));
    return li;
  }));
  const outcome = $("ladder-outcome");
  outcome.dataset.state = state.ladderSkip ? "jumped" : "normal";
  outcome.textContent = state.ladderSkip ? x.jumped : x.normal;
}

function renderLadder() {
  const x = LADDER[state.lang];
  $("c13-to-c14").textContent = x.bridge;
  $("c14-no").textContent = x.no;
  $("c14-title").textContent = x.title;
  $("c14-lead").textContent = x.lead;
  $("c14-demo").textContent = x.demo;
  $("ladder-desk-title").textContent = x.deskTitle;
  $("ladder-desk-lead").textContent = x.deskLead;
  $("ladder-level-label").textContent = x.levelLabel;
  $("ladder-step-label").textContent = x.stepLabel;
  $("ladder-options").replaceChildren(...x.levels.map((level, index) => {
    const label = el("label", "ladder-option");
    const input = el("input");
    input.type = "radio";
    input.name = "ladder-level";
    input.value = String(index + 1);
    input.checked = state.ladderLevel === index + 1;
    input.addEventListener("change", () => { state.ladderLevel = index + 1; renderLadderSteps(); });
    label.append(input, el("strong", null, level.name), el("span", null, level.hint));
    return label;
  }));
  const skip = $("ladder-skip");
  skip.checked = state.ladderSkip;
  skip.onchange = () => { state.ladderSkip = skip.checked; renderLadderSteps(); };
  $("ladder-skip-label").textContent = x.skip;
  $("ladder-reveal").querySelector("summary").textContent = x.reveal;
  $("ladder-gates").replaceChildren(...x.gates.map((gate) => el("li", null, gate)));
  $("ladder-principles-title").textContent = x.principlesTitle;
  $("ladder-principles").replaceChildren(...x.principles.map((principle) => el("li", null, principle)));
  renderLadderSteps();
}

function renderDeep() {
  const x = d();
  $("deep-title").textContent = x.divider;
  $("deep-lead").textContent = x.dividerLead;
  $("deep-toc").replaceChildren(...x.toc.map((label, i) => {
    const li = el("li");
    const a = el("a");
    const n = [5, 6, 7, 8, 9, 10, 11, 12][i];
    a.href = `#c${n}`;
    a.append(el("span", "n", String(n).padStart(2, "0")), document.createTextNode(label));
    li.appendChild(a);
    return li;
  }));
  const deepLink = el("li");
  const da = el("a", "deep-link");
  da.href = "#deep";
  da.append(el("span", "n", "05+"), document.createTextNode(x.divider));
  deepLink.appendChild(da);
  $("toc").appendChild(deepLink);
  for (const c of ["c5", "c7", "c10", "c12"]) {
    $(`${c}-no`).textContent = x[c].no;
    $(`${c}-title`).textContent = x[c].title;
    $(`${c}-lead`).textContent = x[c].lead;
  }
  renderContext();
  renderVerify();
  renderCases();
  renderLessons();
}

const m = () => MORE[state.lang];

function renderNext() {
  const x = m().c1;
  $("c1-no").textContent = x.no;
  $("c1-title").textContent = x.title;
  $("c1-lead").textContent = x.lead;
  $("c1-demo").textContent = x.demo;
  $("nw-pick").textContent = x.pick;
  const line = $("nw-line");
  line.replaceChildren(el("span", "nw-prompt", x.prompt), ...state.words.map((w) => el("span", "nw-word", `${x.words[w]}${state.lang === "en" ? " " : ""}`)));
  const node = state.words.length === 0 ? "start" : state.words.length === 1 ? state.words[0] : null;
  const choices = $("nw-choices");
  choices.replaceChildren();
  if (node && NEXT[node]) {
    const max = Math.max(...NEXT[node].map(([, w]) => w));
    NEXT[node].forEach(([id, weight]) => {
      const b = el("button", "nw-choice");
      b.type = "button";
      b.dataset.word = id;
      const bar = el("span", "nw-bar");
      bar.style.width = `${Math.round((weight / max) * 100)}%`;
      b.append(el("span", "nw-text", x.words[id]), bar);
      b.addEventListener("click", () => { state.words.push(id); renderNext(); });
      choices.appendChild(b);
    });
  }
  $("nw-pick").hidden = !node;
  const done = !node;
  $("nw-reveal").hidden = !done;
  $("nw-reveal").textContent = x.reveal;
  $("nw-again").hidden = !done;
  $("nw-again").textContent = x.again;
}

function renderTrace(animate) {
  const x = m().c6;
  clearTraceTimers();
  $("trace-play").textContent = state.traced ? x.replay : x.play;
  const ol = $("trace");
  ol.replaceChildren(...TRACE.map((t) => {
    const li = el("li");
    li.append(el("span", "mono tool", t.tool), el("span", null, x.steps[t.key]));
    return li;
  }));
  const items = [...ol.children];
  const show = (n) => items.forEach((li, i) => li.classList.toggle("on", i < n));
  if (!state.traced) show(0);
  else if (!animate || reduced()) show(items.length);
  else { show(0); items.forEach((_, i) => traceTimers.push(setTimeout(() => show(i + 1), 300 + i * 550))); }
  $("mcp-title").textContent = x.mcpTitle;
  $("mcp-body").textContent = x.mcp;
  $("c6-warn").textContent = x.warn;
}
let traceTimers = [];
function clearTraceTimers() { traceTimers.forEach(clearTimeout); traceTimers = []; }

function renderTeamwork() {
  const x = m().c8;
  $("c8-rules").replaceChildren(...x.rules.map((r) => el("li", null, r)));
  $("doc-title").textContent = x.docTitle;
  $("doc").replaceChildren(...x.doc.map((r) => el("li", null, r)));
  $("no-doc").textContent = x.without;
  $("no-doc").setAttribute("aria-pressed", String(state.noDoc));
  $("no-doc-list").hidden = !state.noDoc;
  $("no-doc-list").replaceChildren(...x.withoutList.map((r) => el("li", null, r)));
  $("relay-title").textContent = x.relayTitle;
  $("relay").replaceChildren(...x.relay.map(([who, what]) => {
    const li = el("li", who === "Paul" ? "paul" : "");
    li.append(el("span", "who", who), el("span", null, what));
    return li;
  }));
}

function renderGates() {
  const x = m().c9;
  $("gates").replaceChildren(...GATES.map((g) => {
    const li = el("li", "gate-row");
    li.dataset.gate = g.id;
    const shown = state.gates.has(g.id);
    const b = el("button", "gate-btn");
    b.type = "button";
    b.setAttribute("aria-expanded", String(shown));
    b.append(el("span", null, x.items[g.id]), el("span", `gate-answer ${shown ? (g.alone ? "alone" : "ask") : "unknown"}`, shown ? (g.alone ? x.alone : x.ask) : x.yourGuess));
    b.addEventListener("click", () => { state.gates.add(g.id); renderGates(); });
    li.appendChild(b);
    return li;
  }));
  $("c9-ours-title").textContent = x.oursTitle;
  $("c9-ours").replaceChildren(...x.ours.map((r) => el("li", null, r)));
}

function renderFrontier() {
  const x = m().c11;
  $("frontier").replaceChildren(...x.items.map((it) => {
    const li = el("li", `fr ${it.tag}`);
    li.append(el("span", "mono fr-tag", x.tags[it.tag]), el("strong", null, it.title), el("span", null, it.body));
    return li;
  }));
  $("c11-where").textContent = x.where;
  $("c11-link").textContent = x.source;
  $("c11-link").href = LINKS.decoder;
}

function renderSteps() {
  const s = m().steps;
  $("steps-kicker").textContent = s.kicker;
  $("steps-title").textContent = s.title;
  $("three").replaceChildren(...s.list.map(([t1, body], i) => {
    const li = el("li");
    li.append(el("span", "mono n3", String(i + 1).padStart(2, "0")), el("strong", null, t1), el("span", null, body));
    return li;
  }));
  const g = m().glossary;
  $("gl-kicker").textContent = g.kicker;
  $("gl-title").textContent = g.title;
  $("gl-lead").textContent = g.lead;
  $("gl").replaceChildren(...GLOSSARY.map((id) => {
    const [term, plain, example] = g.terms[id];
    const d = el("details", "term");
    d.dataset.term = id;
    d.append(el("summary", null, term), el("p", null, plain), el("p", "ex", example));
    return d;
  }));
}

function renderLatest() {
  const x = LATEST_TEXT[state.lang];
  $("latest-kicker").textContent = x.kicker;
  $("latest-title").textContent = x.title;
  $("latest-lead").textContent = x.lead;
  $("latest-list").replaceChildren(...LATEST.slice(0, 6).map((item) => {
    const c = item[state.lang];
    const li = el("li", `obs ${item.tag}`);
    const head = el("p", "obs-head");
    head.append(el("time", "mono", item.date), el("span", "mono obs-tag", x.tags[item.tag]));
    head.firstChild.setAttribute("datetime", item.date);
    const took = el("p", "obs-took");
    took.append(el("b", null, `${x.took}　`), document.createTextNode(c.took));
    const src = el("a", "obs-src", `${x.source} ↗`);
    src.href = item.source;
    src.target = "_blank";
    src.rel = "noopener noreferrer";
    li.append(head, el("h3", null, c.title), el("p", null, c.what), took, src);
    return li;
  }));
}

function renderMore() {
  for (const c of ["c6", "c8", "c9", "c11"]) {
    $(`${c}-no`).textContent = m()[c].no;
    $(`${c}-title`).textContent = m()[c].title;
    $(`${c}-lead`).textContent = m()[c].lead;
  }
  renderNext();
  renderTrace(false);
  renderTeamwork();
  renderGates();
  renderFrontier();
  renderSteps();
  renderLatest();
}

let consoleTimers = [];
function renderConsole(animate) {
  const x = t();
  consoleTimers.forEach(clearTimeout);
  consoleTimers = [];
  $("console-name").textContent = x.consoleName;
  $("console-cap").textContent = x.consoleCap;
  const ol = $("console-lines");
  ol.replaceChildren(...x.console.map(([kind, text]) => {
    const li = el("li", `cl ${kind}`);
    li.append(el("span", "cl-mark", { task: ">", ok: "✓", warn: "!", wait: "⏸" }[kind]), el("span", null, text));
    return li;
  }));
  const items = [...ol.children];
  if (!animate || reduced()) { items.forEach((li) => li.classList.add("on")); return; }
  items.forEach((li, i) => consoleTimers.push(setTimeout(() => li.classList.add("on"), 400 + i * 520)));
}

function renderRail() {
  const x = t();
  const rail = $("rail");
  rail.replaceChildren(...NAV_CHAPTERS.map(({ id, mark }, i) => {
    const a = el("a", "rail-dot");
    a.href = `#${id}`;
    a.dataset.target = id;
    a.append(el("span", "mono", mark), el("span", "rail-label", x.rail[i]));
    return a;
  }));
}

function watchChapters() {
  if (!("IntersectionObserver" in window)) return;
  const seen = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      document.querySelectorAll(".rail-dot").forEach((a) => a.classList.toggle("on", a.dataset.target === e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  NAV_CHAPTERS.forEach(({ id }) => { const node = $(id); if (node) seen.observe(node); });
  if (reduced()) return;
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".chapter, .deep, .cta").forEach((node) => {
    if (node.getBoundingClientRect().top > window.innerHeight) { node.classList.add("reveal"); reveal.observe(node); }
  });
}

function spiritBlocks(blocks) {
  return blocks.map((b) => {
    const wrap = el("div", "spirit-block");
    wrap.appendChild(el("h3", null, b.h));
    b.p.forEach((line) => wrap.appendChild(el("p", "sub", line)));
    if (b.link) {
      const p = el("p", "sub");
      const a = el("a", null, b.link.text);
      a.href = b.link.href;
      p.append(document.createTextNode(b.link.before), a, document.createTextNode(b.link.after));
      wrap.appendChild(p);
    }
    return wrap;
  });
}

function renderSpirit() {
  const x = SPIRIT[state.lang];
  $("spirit-kicker").textContent = x.open.kicker;
  $("spirit-title").textContent = x.open.title;
  $("spirit-img").alt = x.open.alt;
  $("spirit-body").replaceChildren(...spiritBlocks(x.open.blocks));
  $("spirit-end-kicker").textContent = x.close.kicker;
  $("spirit-end-title").textContent = x.close.title;
  $("spirit-end-body").replaceChildren(...spiritBlocks(x.close.blocks));
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
    const target = ["c0", "c1", "c2", "c3", "c4"][i];
    const mark = target.slice(1).padStart(2, "0");
    a.href = `#${target}`;
    a.append(el("span", "n", mark), document.createTextNode(label));
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
  renderDeep();
  renderMore();
  renderEnterprise();
  renderLadder();
  renderSpirit();
  renderConsole(false);
  renderRail();
}

document.querySelectorAll("#lang-group button").forEach((b) => b.addEventListener("click", () => {
  state.lang = b.dataset.lang;
  const url = new URL(location.href);
  url.searchParams.set("lang", state.lang);
  history.replaceState(null, "", url);
  render();
}));
$("play").addEventListener("click", () => { state.played = true; renderCompare(true); });
$("nw-again").addEventListener("click", () => { state.words = []; renderNext(); });
$("trace-play").addEventListener("click", () => { state.traced = true; renderTrace(true); });
$("no-doc").addEventListener("click", () => { state.noDoc = !state.noDoc; renderTeamwork(); });
$("use-guess").addEventListener("click", () => { state.measured = false; renderVerify(); });
$("use-measured").addEventListener("click", () => { state.measured = true; renderVerify(); });
$("remove-human").addEventListener("click", () => { state.removed = !state.removed; renderFlow(); });

drawNet();
render();
renderConsole(true);
watchChapters();
