import {
  CAST, CAST_ORDER, DECISIONS, LIGHTS, REACT, SCENARIOS, SCENARIO_ORDER, START_BUFFER, STATION_SPEAKER, STYLES, STYLE_CHAR,
  mostLikelyMiss, optionCost, readRoute, resolve, shareSearch,
} from "./game.js";
import { LEARN_TEXT, PAGE_TEXT } from "./steps-text.js";
import { ALL_STEPS, indexOfOriginal, isExtra } from "./extra-steps.js";
import { COMMON, DAILY, EXTRA_TAG, LESSON_LABEL, TIPS, TIP_LABEL } from "./tips.js";
import { HANDOFF, HANDOFF_LABEL } from "./handoff.js";
import { ART, AVATAR_COLOR, GLOSS, MOBILE_QUERY, POS, SHORT } from "./layout.js";

export { AVATAR_COLOR, SHORT };

// What each person says at their stop (working copy, Paul edits the voice).
export const STATION_LINE = {
  zh: [
    "這櫃貨最晚要在哪天到我手上？",
    "想訂哪一班？你問到的，我才回。",
    "位子給你了。上面寫著這櫃貨要走哪一班船。",
    "空櫃我來提。哪一天、去哪裡，請先講清楚。",
    "差不多好了。",
    "補料和重量，要在截港前交。開船日只是最後一個日期。",
    "重櫃進港，排隊。一櫃一櫃來。",
    "資料給我，我再看一次。",
    "前面是閘門：放行，或打開檢查。我們只能等。",
    "上船了嗎？進了港，不等於上了船。",
    "船開了。預計和實際，可能不同。",
    "提單簽好了，請逐項核對。",
    "款還沒到，單我先扣著。這是你手上最後的保障。",
    "單到我手上，貨才提得走。",
  ],
  en: [
    "What is the latest day this container can reach me?",
    "Which sailing do you want? I answer what you ask.",
    "Your place is secured. The paper says which sailing this container is on.",
    "I will collect the empty container. Tell me which day and where.",
    "Nearly done.",
    "Papers and weight must be in before the port cut-off. The sailing day is only the last date.",
    "Full container coming in. Queue up, one at a time.",
    "Give me the papers. I will look once more.",
    "Ahead is the gate: released, or opened for a check. We can only wait.",
    "Is it on the ship? Being in the port is not the same.",
    "The ship has sailed. Expected and actual dates can differ.",
    "The bill is issued. Please check it line by line.",
    "The money is not here yet, so I am holding the papers. They are your last protection.",
    "I can only collect the goods once the documents reach me.",
  ],
};

export const UI = {
  zh: {
    htmlLang: "zh-Hant", docTitle: "貿易街 · 一櫃貨出海 — Paul's Tradecraft", langGroup: "語言", skip: "跳至內容",
    eyebrow: "作品館 · 教學玩具",
    boundary: "教學示意 · 不含具體天數、費用或比例，一律以貨代或船公司通知為準。",
    title: "貿易街",
    intro: "一櫃貨明天要出海，整條街都在接力。",
    lede: "沿著港口走一趟，在六個關鍵時刻做決定，看趕不趕得上船。",
    hint: "同樣的選擇，永遠得到同一個結果。不存任何資料。",
    primerTitle: "先懂一件事：出口一個貨櫃，是一群人在接力。",
    primerBody: "賣到國外的貨，不是自己送過去的。工廠、貨代（替你安排運輸的公司）、拖車、海關、船公司、買家，每個人只做自己那一段，下一個人才接得上。只要有一棒晚了，整櫃貨就可能趕不上船。",
    takeawayTitle: "走完這一趟，你看到的是：",
    takeaway: ["出口不是一個人的事：十四站、好幾個人，一棒接一棒。", "最容易出事的，常常不是某一站，而是交接：誰、什麼時候、把什麼交給下一棒。", "所以有經驗的人，會先問清楚、留一點緩衝、把說好的事寫下來。"],
    takeawayLink: "想看每一步的完整說明：12 步流程",
    loopTitle: "這一櫃貨，是怎麼開始的？", loopLead: "出海之前，有人先問清楚，再把規格講好。",
    loopLamp: "看規格怎麼講好：一盞燈的約定 ↗", loopCorner: "看一封熱情的信該怎麼問：街角的秘密 ↗",
    takeawayCase: "想看一櫃貨在出海之前，怎麼先判斷做不做得成：第一個貨櫃案例",
    entryTitle: "先選這一週的情況", routeLabel: "十四站", lightsLabel: "四個時間點", routeHint: "點地圖上的圓點，看那一站是誰、在做什麼。橘色圈是要做決定的站。",
    castLink: "認識街上的人",
    mapAlt: "貿易街的港口：左邊是工廠，道路通向右邊的碼頭，吊車正把貨櫃吊上船，遠方海面另有一艘船駛離，右下角是岸上的文件角。",
    previewClose: "關閉", stopLabel: (n, name) => `第 ${n} 站：${name}`,
    start: "出發", seeSteps: "先看 12 步流程",
    progress: (n) => `第 ${n} 站 / 14`,
    buffer: (left) => (left >= 0 ? `緩衝格 ${left} / ${START_BUFFER}` : `緩衝格用完，超出 ${-left} 格`),
    afterSail: "船已經開了。這個決定不影響上不上船，只影響單據有沒有順利交到買家手上。",
    handover: { smooth: "單據：順利交到買家手上。", fix: "單據：還需要補件或再確認。" },
    lightsLegend: "✓ 順利　! 用掉 1 格緩衝　✕ 用掉 2 格以上",
    firstNote: "這一站不用選，先看懂誰在做什麼，再按「下一站」。",
    bufferUsed: (n) => (n === 0 ? "這一趟沒用到緩衝格。" : `這一趟用掉 ${n} 格緩衝。`) + "緩衝格是遊戲代幣：代表還撐得住幾次小意外，不是天數或費用。",
    bufferNote: "緩衝格是遊戲代幣，不代表天數或費用。",
    next: "下一站", nextLast: "看航程結果", back: "回上一站", change: "改選這一題",
    who: "誰在做", prep: "你要準備或決定什麼", risk: "卡住會怎樣", decisionTag: "要做決定",
    scnNote: (name, line) => `本週：${name}。${line}`,
    freeText: "這一步沒有用掉緩衝格。",
    costText: (n) => `這個選擇用掉 ${n} 格緩衝。`,
    worseText: (name) => `${name}讓這個選擇更吃虧。`,
    keyPoint: "這一步的要點", ifStuck: "卡住會怎樣", wording: "用語小註", lightsHelp: "這四個時間點是什麼？", lightsHelpNote: "前面的流程都在往這幾個時間點倒數；每一個都是「最後期限」。",
    kicker: "你的航程卡", styleLabel: (name) => `你這一路的做事風格：${name}`,
    tier: {
      clear: { name: "穩穩上船", line: "船開了，這櫃貨在船上。" },
      tight: { name: "壓線上船", line: "趕上了，但差一點。" },
      missed: { name: "改搭下一班船", line: "這班船開走了，貨改搭下一班。" },
    },
    worst: (label) => `最吃緊的一關：${label}`, worstNone: "沒有哪一關特別吃緊。",
    missSpent: (stop) => `這一趟最可能漏的一站：${stop}`, missClean: (stop) => `這一趟沒有走偏的選擇。有一站遊戲沒考你，新人最常漏它：${stop}`, missTip: "新人在這一站常漏的（業界常見）",
    scnLabel: "本週", costMark: (n) => (n === 0 ? "沒用緩衝" : `用掉 ${n} 格`),
    download: "下載航程卡", copy: "複製連結", again: "再走一次",
    copied: "連結已複製。", copyFail: "沒辦法自動複製，請手動複製網址。", downloaded: "已下載。",
    downloadFail: "這次沒畫成圖片，連結一樣能分享。",
    castTitle: "街上的人（暫名）", home: "回到作品館",
    resultTitle: "航程結果",
    cardBoundary: "教學示意 · 不含具體天數、費用或比例，一律以貨代或船公司通知為準 · 緩衝格是遊戲代幣 · 不儲存任何內容。",
    caveat: PAGE_TEXT.zh.caveat,
  },
  en: {
    htmlLang: "en", docTitle: "Trade Street · One Container Ships — Paul's Tradecraft", langGroup: "Language", skip: "Skip to content",
    eyebrow: "Showcase · Teaching toy",
    boundary: "Teaching sketch · no specific days, costs or percentages; always go by your forwarder's or the carrier's notice.",
    title: "Trade Street",
    intro: "One container ships tomorrow, and the whole street is passing the baton.",
    lede: "Walk the harbour, make six decisions, see whether it makes the ship.",
    hint: "Same choices, same result. Nothing is stored.",
    primerTitle: "Exporting a container is a relay.",
    primerBody: "Goods sold abroad do not travel on their own. The factory, the forwarder (the company that arranges transport for you), the truck, customs, the shipping line and the buyer each do one leg, and the next one can only start once the last has finished. If one handover runs late, the whole container can miss its ship.",
    takeawayTitle: "What you just saw:",
    takeaway: ["Exporting is not one person's job: fourteen stops, several people, one handing over to the next.", "What goes wrong is often not a single step but the handover: who passes what to whom, and when.", "That is why experienced people ask first, keep a little buffer, and write down what was agreed."],
    takeawayLink: "Want every step in full? The 12 steps",
    loopTitle: "How does a shipment like this begin?", loopLead: "Before anything ships, someone asks the right questions, then agrees the details.",
    loopLamp: "See how a spec gets agreed: A Lamp, As Promised ↗", loopCorner: "See how to ask about a warm letter: Secrets on the Corner ↗",
    takeawayCase: "Want to see how a first container is judged before it ships? The first-container case",
    entryTitle: "First, pick this week's situation", routeLabel: "Fourteen stops", lightsLabel: "Four moments", routeHint: "Tap a dot on the map to see who is there and what they do. An orange ring marks a stop where you decide.",
    castLink: "Meet the people on the street",
    mapAlt: "The Trade Street harbour: the factory on the left, a road leading to the quay on the right where a crane loads a container onto a ship, another ship sailing away in the distance, and the documents corner on shore at the bottom right.",
    previewClose: "Close", stopLabel: (n, name) => `Stop ${n}: ${name}`,
    start: "Set off", seeSteps: "Read the 12 steps first",
    progress: (n) => `Stop ${n} of 14`,
    buffer: (left) => (left >= 0 ? `Buffer cells ${left} of ${START_BUFFER}` : `Buffer used up, ${-left} over`),
    afterSail: "The ship has already sailed. This decision cannot change whether it makes the ship, only how smoothly the documents reach the buyer.",
    handover: { smooth: "Documents: they reach the buyer smoothly.", fix: "Documents: they still need fixing or waiting." },
    bufferNote: "Buffer cells are a game token, not days or money.",
    lightsLegend: "✓ on track   ! one buffer cell used   ✕ two or more used",
    firstNote: "Nothing to choose at this stop: first see who does what, then press Next.",
    bufferUsed: (n) => (n === 0 ? "This trip used no buffer cells. " : `This trip used ${n} buffer ${n === 1 ? "cell" : "cells"}. `) + "Buffer cells are a game token: how many small surprises you can still absorb, not days or money.",
    next: "Next stop", nextLast: "See the voyage", back: "Previous stop", change: "Choose again",
    who: "Who is involved", prep: "What you prepare or decide", risk: "If it goes wrong", decisionTag: "A decision",
    scnNote: (name, line) => `This week: ${name}. ${line}`,
    freeText: "This step used no buffer cells.",
    costText: (n) => `This choice used ${n} buffer ${n === 1 ? "cell" : "cells"}.`,
    worseText: (name) => `${name} makes this choice cost more.`,
    keyPoint: "The point of this step", ifStuck: "If it goes wrong", wording: "A note on the words", lightsHelp: "What are these four moments?", lightsHelpNote: "Everything before counts down to these moments; each one is a last deadline.",
    kicker: "YOUR VOYAGE CARD", styleLabel: (name) => `Your style on this run: ${name}`,
    tier: {
      clear: { name: "Safely aboard", line: "The ship sailed with your container on it." },
      tight: { name: "Aboard, just", line: "You made it, but only just." },
      missed: { name: "On the next ship", line: "That ship sailed without it. The container waits for the next one." },
    },
    worst: (label) => `The tightest moment: ${label}`, worstNone: "No moment was especially tight.",
    missSpent: (stop) => `The stop you were most likely to miss this time: ${stop}`, missClean: (stop) => `None of your choices went off course. The game did not quiz you on one stop, and newcomers most often miss it: ${stop}`, missTip: "What newcomers often miss at this stop (common practice)",
    scnLabel: "This week", costMark: (n) => (n === 0 ? "no buffer used" : `${n} ${n === 1 ? "cell" : "cells"} used`),
    download: "Download the voyage card", copy: "Copy link", again: "Go again",
    copied: "Link copied.", copyFail: "Could not copy automatically. Please copy the address.", downloaded: "Downloaded.",
    downloadFail: "The picture did not save this time. The link still shares the result.",
    castTitle: "The people on the street (working names)", home: "Back to Showcase",
    resultTitle: "Voyage result",
    cardBoundary: "Teaching sketch · no specific days, costs or percentages; go by your forwarder's or the carrier's notice · buffer cells are a game token · nothing is stored.",
    caveat: PAGE_TEXT.en.caveat,
  },
};

const stepOf = (decision) => ALL_STEPS[decision.step - 1];

const LAST_STOP = ALL_STEPS.length - 1; // index of the last of the fourteen stops

const decisionAtStation = (index) => DECISIONS.findIndex((decision) => decision.step === index + 1);

export function initialOf(charId, lang) {
  const name = CAST[charId][lang].name.replace(/^The /, "");
  return Array.from(name)[0];
}

function loadImage(src) {
  return new Promise((done) => {
    if (!src) { done(null); return; }
    const img = new Image();
    img.onload = () => done(img);
    img.onerror = () => done(null);
    img.src = src;
  });
}

function boot() {
  const $ = (id) => document.getElementById(id);
  const route = readRoute(location.search);
  const state = {
    lang: route.lang,
    scenario: route.scenario || SCENARIO_ORDER[0],
    index: 0,
    picks: Array(DECISIONS.length).fill(null),
    order: Array(DECISIONS.length).fill(null),
    view: "entry",
    preview: null,
  };
  let revealTimer = null;
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ui = () => UI[state.lang];
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  // The hand-over block for one stop. "If it does not arrive" is the stop's own risk line, so nothing new is claimed;
  // it is left out when the page already shows that risk line right next to it.
  function handoffBlock(stepIndex, withMiss) {
    const text = HANDOFF[stepIndex][state.lang];
    const label = HANDOFF_LABEL[state.lang];
    const box = el("div", "handoff");
    box.append(el("h3", null, isExtra(stepIndex) ? (state.lang === "zh" ? `${label.head}（${COMMON.zh}）` : `${label.head} (${COMMON.en})`) : label.head));
    const line = (name, value) => { const p = el("p"); p.append(el("b", null, name), document.createTextNode(value)); box.appendChild(p); };
    line(label.gives, text.gives);
    line(label.to, text.to);
    if (withMiss) line(label.miss, ALL_STEPS[stepIndex][state.lang].risk);
    if (TIPS[stepIndex]) line(TIP_LABEL[state.lang], TIPS[stepIndex][state.lang]);
    return box;
  }
  const avatar = (node, charId) => {
    const fallback = () => { node.classList.remove("has-img"); node.replaceChildren(); node.textContent = initialOf(charId, state.lang); node.style.background = AVATAR_COLOR[charId]; };
    const src = ART.avatar[charId];
    node.replaceChildren();
    if (!src) { fallback(); return; }
    node.classList.add("has-img");
    node.style.background = "";
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.onerror = fallback;
    img.src = src;
    node.appendChild(img);
  };

  function syncUrl() {
    let search;
    if (state.view === "result" && state.picks.every(Boolean)) search = shareSearch(state.scenario, state.picks.join(""), state.lang);
    else search = shareSearch(null, null, state.lang);
    history.replaceState(null, "", `${location.pathname}${search}${location.hash}`);
  }

  function lightStates() {
    return LIGHTS.map((_, lightIndex) => {
      const feeding = DECISIONS.map((decision, i) => ({ decision, i })).filter((item) => item.decision.light === lightIndex);
      const made = feeding.filter((item) => state.picks[item.i]);
      if (!made.length) return "off";
      const cost = made.reduce((sum, item) => sum + optionCost(item.decision, item.decision.options.find((o) => o.id === state.picks[item.i]), state.scenario), 0);
      return cost === 0 ? "green" : cost === 1 ? "amber" : "red";
    });
  }

  // The source page says there is nothing special to note for some steps; that line teaches nothing, so it is left out.
  const NO_NOTE = /沒有特別有把握|No difference here that we are confident/;
  const wordingNote = (step) => (step.cross && !NO_NOTE.test(step.cross) ? step.cross : "");

  // "What are these four moments?": the page's own words for the three cut-offs, then the sailing.
  function renderLightsHelp(node) {
    node.replaceChildren();
    const t = ui();
    const learn = LEARN_TEXT[state.lang];
    const labels = PAGE_TEXT[state.lang].countdown;
    const summary = el("summary", null, t.lightsHelp);
    const body = el("div", "lights-help-body");
    body.appendChild(el("p", null, t.lightsHelpNote));
    const list = el("ul");
    learn.cutGroups[0].items.forEach(([name, meaning, snag], i) => {
      const li = el("li");
      li.append(el("b", null, `${labels[i]}（${name}）`), document.createTextNode(`：${meaning} ${snag}`));
      list.appendChild(li);
    });
    const sail = ALL_STEPS[indexOfOriginal(10)][state.lang];
    const last = el("li");
    last.append(el("b", null, `${labels[3]}`), document.createTextNode(`：${sail.p}`));
    list.appendChild(last);
    body.appendChild(list);
    node.append(summary, body);
  }

  function renderLights(node, states) {
    node.replaceChildren();
    PAGE_TEXT[state.lang].countdown.forEach((label, i) => {
      const li = el("li");
      const lamp = el("span", `lamp ${states[i] === "off" ? "" : states[i]}`);
      lamp.setAttribute("aria-hidden", "true");
      li.append(lamp, el("span", null, label));
      const word = states[i] === "off" ? "" : states[i] === "green" ? " ✓" : states[i] === "amber" ? " !" : " ✕";
      li.setAttribute("aria-label", `${label}${word}`);
      li.lastChild.textContent = label + word;
      node.appendChild(li);
    });
  }

  function spent() {
    return DECISIONS.reduce((sum, decision, i) => (state.picks[i] && !decision.after ? sum + optionCost(decision, decision.options.find((o) => o.id === state.picks[i]), state.scenario) : sum), 0);
  }

  function renderBuffer() {
    const left = START_BUFFER - spent();
    const node = $("buffer");
    node.replaceChildren();
    for (let i = 0; i < START_BUFFER; i += 1) node.appendChild(el("span", `cell${i < left ? "" : " gone"}`));
    node.appendChild(el("small", null, ui().buffer(left)));
    node.setAttribute("aria-label", `${ui().buffer(left)}. ${ui().bufferNote}`);
  }

  function renderRoute(node, withState) {
    node.replaceChildren();
    node.setAttribute("aria-label", ui().routeLabel);
    SHORT[state.lang].forEach((label, i) => {
      const li = el("li");
      if (withState) {
        if (i < state.index) li.classList.add("done");
        if (i === state.index) li.classList.add("now");
        if (i === state.index) li.setAttribute("aria-current", "step");
      }
      if (decisionAtStation(i) >= 0) li.classList.add("decision");
      if (isExtra(i)) li.classList.add("extra");
      const words = el("span", "words");
      words.append(el("span", null, label), el("small", "gloss", GLOSS[state.lang][i]));
      if (isExtra(i)) words.append(el("small", "extra-note", EXTRA_TAG[state.lang]));
      if (withState) {
        li.append(el("span", "num", String(i + 1)), words);
      } else {
        // on the entry page the list is a second way in: it opens the same preview as the dot on the map
        const open = el("button", "route-btn");
        open.type = "button";
        open.dataset.station = String(i);
        open.setAttribute("aria-label", ui().stopLabel(i + 1, label));
        open.append(el("span", "num", String(i + 1)), words);
        open.addEventListener("click", () => { if (state.view === "entry") previewStation(i, "list"); });
        li.appendChild(open);
      }
      node.appendChild(li);
    });
  }

  function renderScenarios() {
    const node = $("scn");
    node.replaceChildren();
    SCENARIO_ORDER.forEach((id) => {
      const button = el("button");
      button.type = "button";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(state.scenario === id));
      button.dataset.scenario = id;
      button.append(el("strong", null, SCENARIOS[id][state.lang].name), el("span", null, SCENARIOS[id][state.lang].line));
      button.addEventListener("click", () => {
        state.scenario = id;
        renderScenarios();
      });
      node.appendChild(button);
    });
    $("scn-desc").textContent = SCENARIOS[state.scenario][state.lang].line;
  }

  const isPhone = () => window.matchMedia(MOBILE_QUERY).matches;

  function fitStage() {
    const stage = $("map-stage");
    const inner = $("map-inner");
    if (state.view !== "play") { stage.style.height = ""; inner.removeAttribute("style"); return; }
    const phone = isPhone();
    const W = stage.clientWidth;
    const H = phone ? 190 : Math.round(Math.min(380, Math.max(240, W * 0.3)));
    const zoom = phone ? 1.7 : 1.6;
    const ratio = phone ? 1422 / 800 : 900 / 1600;
    const iw = W * zoom;
    const ih = iw * ratio;
    const [x, y] = (phone ? POS.mobile : POS.desktop)[state.index];
    const left = Math.min(0, Math.max(W - iw, W / 2 - (iw * x) / 100));
    const top = Math.min(0, Math.max(H - ih, H / 2 - (ih * y) / 100));
    stage.style.height = `${H}px`;
    inner.style.cssText = `position:absolute;width:${iw}px;left:${left}px;top:${top}px;`;
  }

  function renderHotspots() {
    const playing = state.view === "play";
    document.querySelectorAll("#hotspots .hot").forEach((button) => {
      const i = Number(button.dataset.station);
      button.classList.toggle("done", playing && i < state.index);
      button.classList.toggle("now", (playing && i === state.index) || (!playing && state.preview === i));
      button.tabIndex = playing ? -1 : 0;
      if ((playing && i === state.index) || (!playing && state.preview === i)) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    document.querySelectorAll("#route-entry .route-btn").forEach((button) => {
      const on = !playing && state.preview === Number(button.dataset.station);
      button.parentElement.classList.toggle("now", on);
      if (on) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    fitStage();
  }

  function buildHotspots() {
    const node = $("hotspots");
    node.replaceChildren();
    (isPhone() ? POS.mobile : POS.desktop).forEach(([x, y], i) => {
      const button = el("button", "hot");
      button.type = "button";
      button.dataset.station = String(i);
      button.style.left = `${x}%`;
      button.style.top = `${y}%`;
      button.textContent = String(i + 1);
      button.setAttribute("aria-label", ui().stopLabel(i + 1, SHORT[state.lang][i]));
      if (decisionAtStation(i) >= 0) button.classList.add("decision");
      button.addEventListener("click", () => { if (state.view === "entry") previewStation(i); });
      node.appendChild(button);
    });
    renderHotspots();
  }

  function renderPreview() {
    const i = state.preview;
    if (i == null) { $("preview").hidden = true; return; }
    const speaker = STATION_SPEAKER[i];
    avatar($("preview-avatar"), speaker);
    $("preview-name").textContent = CAST[speaker][state.lang].name;
    $("preview-role").textContent = CAST[speaker][state.lang].role;
    $("preview-say").textContent = STATION_LINE[state.lang][i];
    $("preview-title").textContent = `${i + 1}. ${ALL_STEPS[i][state.lang].t}`;
    $("preview-p").textContent = ALL_STEPS[i][state.lang].p;
    $("preview-extra").hidden = !isExtra(i);
    $("preview-extra").textContent = EXTRA_TAG[state.lang];
    const note = wordingNote(ALL_STEPS[i][state.lang]);
    $("preview-cross").hidden = !note;
    $("preview-cross").textContent = note ? `${ui().wording}：${note}` : "";
    $("preview-close").textContent = ui().previewClose;
    $("preview").hidden = false;
  }

  let previewFrom = "dot";
  function previewStation(i, from = "dot") {
    previewFrom = from;
    state.preview = i;
    renderPreview();
    renderHotspots();
    $("preview").scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
  }

  function closePreview() {
    const was = state.preview;
    state.preview = null;
    renderPreview();
    renderHotspots();
    const back = document.querySelector(previewFrom === "list" ? `#route-entry .route-btn[data-station="${was}"]` : `#hotspots .hot[data-station="${was}"]`);
    if (back) back.focus();
  }

  let primerSet = false;
  function applyStatic() {
    const t = ui();
    document.documentElement.lang = t.htmlLang;
    document.title = t.docTitle;
    $("skip").textContent = t.skip;
    $("eyebrow").textContent = t.eyebrow;
    $("lang-group").setAttribute("aria-label", t.langGroup);
    document.querySelectorAll("#lang-group button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
    $("boundary").textContent = t.boundary;
    $("title").textContent = t.title;
    $("intro").textContent = t.intro;
    $("lede").textContent = t.lede;
    $("hint").textContent = t.hint;
    $("primer-title").textContent = t.primerTitle;
    $("primer-body").textContent = t.primerBody;
    document.querySelectorAll(".lights-legend").forEach((node) => { node.textContent = t.lightsLegend; });
    document.querySelectorAll(".lights-help").forEach(renderLightsHelp);
    if (!primerSet) { primerSet = true; $("primer").open = false; }
    $("takeaway-title").textContent = t.takeawayTitle;
    $("takeaway-list").replaceChildren(...t.takeaway.map((line) => el("li", null, line)));
    const learnMore = LEARN_TEXT[state.lang];
    const fold = (id, title, lede, items, tag) => {
      const node = $(id);
      const open = node.open;
      const list = el(tag, null);
      items.forEach((item) => {
        const li = el("li", null, Array.isArray(item) ? item[0] : item);
        if (Array.isArray(item)) li.append(el("span", null, item[1]));
        list.append(li);
      });
      const body = el("div", "more-body");
      if (lede) body.append(el("p", null, lede));
      body.append(list);
      node.replaceChildren(el("summary", null, title), body);
      node.open = open;
    };
    fold("more-danger", learnMore.dangerH, "", learnMore.danger, "ul");
    fold("more-asks", learnMore.asksH, learnMore.asksLede, learnMore.asks, "ol");
    fold("more-daily", DAILY[state.lang].title, "", DAILY[state.lang].items, "ol");
    $("takeaway-link").textContent = t.takeawayLink;
    $("takeaway-link").href = `../one-container-12-steps/${state.lang === "en" ? "?lang=en" : ""}`;
    $("takeaway-case").textContent = t.takeawayCase;
    $("takeaway-case").href = `/cases/first-container/${state.lang === "en" ? "?lang=en" : ""}`;
    $("loop-title").textContent = t.loopTitle;
    $("loop-lead").textContent = t.loopLead;
    $("loop-lamp").textContent = t.loopLamp;
    $("loop-lamp").href = `/prototype/take-the-lantern-apart/?lang=${state.lang}`;
    $("loop-corner").textContent = t.loopCorner;
    $("loop-corner").href = `/prototype/secrets-on-the-corner/?lang=${state.lang}`;
    $("entry-title").textContent = t.entryTitle;
    $("start").textContent = t.start;
    $("see-steps").textContent = t.seeSteps;
    $("route-hint").textContent = t.routeHint;
    for (const id of ["see-cast", "cast-link"]) {
      $(id).textContent = t.castLink;
      $(id).href = `cast/${state.lang === "en" ? "?lang=en" : ""}`;
    }
    $("see-steps").href = `../one-container-12-steps/${state.lang === "en" ? "?lang=en" : ""}`;
    $("lights").setAttribute("aria-label", t.lightsLabel);
    $("result-lights").setAttribute("aria-label", t.lightsLabel);
    $("result-title").textContent = t.resultTitle;
    $("download").textContent = t.download;
    $("copy").textContent = t.copy;
    $("again").textContent = t.again;
    $("cast-title").textContent = t.castTitle;
    $("home").textContent = t.home;
    $("home").href = `/${state.lang === "en" ? "?lang=en" : ""}#showcase`;
    $("caveat").textContent = t.caveat;
    $("map-img").alt = t.mapAlt;
    renderScenarios();
    renderRoute($("route-entry"), false);
    buildHotspots();
    renderPreview();
    renderCast();
  }

  function renderCast() {
    const node = $("cast");
    node.replaceChildren();
    CAST_ORDER.forEach((id) => {
      const li = el("li");
      const badge = el("div", "avatar");
      badge.setAttribute("aria-hidden", "true");
      avatar(badge, id);
      const body = el("div");
      body.append(el("b", null, `${CAST[id][state.lang].name} · ${CAST[id][state.lang].role}`), el("small", null, CAST[id][state.lang].line));
      li.append(badge, body);
      node.appendChild(li);
    });
  }

  function show(view) {
    state.view = view;
    $("entry").hidden = view !== "entry";
    $("play").hidden = view !== "play";
    $("result").hidden = view !== "result";
    const stage = $("map-stage");
    const slot = $(view === "play" ? "slot-play" : "slot-entry");
    stage.hidden = view === "result";
    if (stage.parentElement !== slot) slot.appendChild(stage);
    stage.classList.toggle("playing", view === "play");
    if (view !== "entry") state.preview = null;
    renderPreview();
    renderHotspots();
    syncUrl();
  }

  function renderPlay(focus) {
    const t = ui();
    const i = state.index;
    const step = ALL_STEPS[i][state.lang];
    const speaker = STATION_SPEAKER[i];
    const dIndex = decisionAtStation(i);
    const decision = dIndex >= 0 ? DECISIONS[dIndex] : null;
    $("progress").textContent = t.progress(i + 1);
    renderBuffer();
    renderLights($("lights"), lightStates());
    renderHotspots();
    avatar($("avatar"), speaker);
    $("speaker-name").textContent = CAST[speaker][state.lang].name;
    $("speaker-role").textContent = CAST[speaker][state.lang].role;
    $("say").textContent = STATION_LINE[state.lang][i];
    $("station-title").textContent = step.t;
    $("station-p").textContent = step.p;
    $("extra-tag").hidden = !isExtra(i);
    $("extra-tag").textContent = EXTRA_TAG[state.lang];

    const first = $("first-note");
    first.hidden = !(i === 0 && !decision);
    first.textContent = t.firstNote;
    const note = $("scn-note");
    const afterSail = decision && decision.after;
    note.hidden = !(afterSail || (decision && decision.options.some((o) => o.extra && o.extra[state.scenario] != null)));
    if (!note.hidden) note.textContent = afterSail ? t.afterSail : t.scnNote(SCENARIOS[state.scenario][state.lang].name, SCENARIOS[state.scenario][state.lang].line);

    const brief = $("brief");
    brief.replaceChildren();
    const row = (label, text) => { const d = el("div"); d.append(el("b", null, label), document.createTextNode(text)); return d; };
    brief.appendChild(row(t.who, step.who));
    if (!decision) { brief.appendChild(row(t.prep, step.prep)); brief.appendChild(handoffBlock(i, true)); }
    if (step.lesson) brief.appendChild(row(LESSON_LABEL[state.lang], step.lesson));
    if (wordingNote(step)) brief.appendChild(row(t.wording, wordingNote(step)));

    const prompt = $("prompt");
    const choices = $("choices");
    const feedback = $("feedback");
    prompt.hidden = !decision;
    choices.hidden = !decision;
    choices.replaceChildren();
    feedback.hidden = true;
    feedback.replaceChildren();
    $("back").hidden = i === 0;
    $("back").textContent = t.back;
    const picked = decision ? state.picks[dIndex] : "ok";
    $("next").textContent = i === LAST_STOP ? t.nextLast : t.next;
    $("next").disabled = !picked;

    if (decision) {
      prompt.textContent = `${t.decisionTag}：${decision[state.lang].prompt}`;
      choices.setAttribute("aria-label", decision[state.lang].prompt);
      optionsInOrder(dIndex).forEach((option, position) => {
        const button = el("button", `choice${picked === option.id ? " picked" : ""}`);
        button.type = "button";
        button.dataset.option = option.id;
        button.append(el("span", "letter", "ABC"[position]), el("span", null, option[state.lang]));
        if (picked) button.disabled = true;
        button.addEventListener("click", () => choose(dIndex, option.id));
        choices.appendChild(button);
      });
      if (picked) showFeedback(dIndex, picked);
    }
    if (focus) $("station-title").focus({ preventScroll: false });
  }

  // The costly option must not always sit in the same slot, or players learn "never the last one".
  // The order is shuffled once per play and kept while they go back and forth or switch language.
  // Option ids (the share-code letters) never change, so old links resolve exactly as before.
  function optionsInOrder(dIndex) {
    const options = DECISIONS[dIndex].options;
    if (!state.order[dIndex]) {
      const ids = options.map((o) => o.id);
      for (let i = ids.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      state.order[dIndex] = ids;
    }
    return state.order[dIndex].map((id) => options.find((o) => o.id === id));
  }

  function showFeedback(dIndex, optionId) {
    const t = ui();
    const decision = DECISIONS[dIndex];
    const option = decision.options.find((o) => o.id === optionId);
    const cost = optionCost(decision, option, state.scenario);
    const step = stepOf(decision)[state.lang];
    const feedback = $("feedback");
    feedback.replaceChildren();
    feedback.hidden = false;
    feedback.className = `feedback${cost === 1 ? " costly" : cost >= 2 ? " costly2" : ""}`;
    const head = el("p");
    head.append(el("b", null, cost === 0 ? t.freeText : t.costText(cost)));
    if (option.extra && option.extra[state.scenario] != null) head.append(document.createTextNode(` ${t.worseText(SCENARIOS[state.scenario][state.lang].name)}`));
    feedback.appendChild(head);
    const reply = el("p");
    const replier = CAST[STYLE_CHAR[option.tag]][state.lang].name;
    reply.append(el("b", null, `${replier}：`), document.createTextNode(`「${REACT[option.tag][state.lang][cost === 0 ? "free" : "costly"]}」`));
    feedback.appendChild(reply);
    const point = el("p");
    point.append(el("b", null, `${t.keyPoint}：`), document.createTextNode(step.prep));
    feedback.appendChild(point);
    if (cost > 0) {
      const risk = el("p");
      risk.append(el("b", null, `${t.ifStuck}：`), document.createTextNode(step.risk));
      feedback.appendChild(risk);
    }
    feedback.appendChild(handoffBlock(decision.step - 1, cost === 0));
    const change = el("button", "text-btn", t.change);
    change.type = "button";
    change.id = "change";
    change.addEventListener("click", () => {
      state.picks[dIndex] = null;
      renderPlay(false);
      const first = document.querySelector("#choices .choice");
      if (first) first.focus();
    });
    feedback.appendChild(change);
  }

  function choose(dIndex, optionId) {
    state.picks[dIndex] = optionId;
    renderPlay(false);
    $("next").focus();
  }

  function go(delta) {
    if (delta > 0) {
      if (state.index === LAST_STOP) { finish(); return; }
      state.index += 1;
    } else if (state.index > 0) {
      state.index -= 1;
    }
    renderPlay(true);
  }

  function renderResult() {
    const t = ui();
    const res = resolve(state.scenario, state.picks.join(""));
    const charId = res.character;
    $("card-kicker").textContent = t.kicker;
    avatar($("card-avatar"), charId);
    const figure = $("card-figure");
    figure.hidden = !ART.portrait[charId];
    figure.onerror = () => { figure.hidden = true; };
    if (ART.portrait[charId]) figure.src = ART.portrait[charId];
    $("card-name").textContent = CAST[charId][state.lang].name;
    $("card-role").textContent = `${CAST[charId][state.lang].role} · ${SCENARIOS[state.scenario][state.lang].name}`;
    $("style-line").textContent = `${t.styleLabel(STYLES[res.style][state.lang].name)}：${STYLES[res.style][state.lang].line}`;
    const tierNode = $("tier");
    tierNode.className = `tier ${res.tier}`;
    tierNode.textContent = t.tier[res.tier].name;
    $("tier-line").textContent = t.tier[res.tier].line;
    const labels = PAGE_TEXT[state.lang].countdown;
    $("worst").textContent = res.worstLight ? t.worst(labels[LIGHTS.indexOf(res.worstLight)]) : t.worstNone;
    $("buffer-line").textContent = t.bufferUsed(res.voyageCost);
    $("handover").textContent = t.handover[res.handover];
    const miss = mostLikelyMiss(res);
    const missName = `${miss.stop + 1}. ${SHORT[state.lang][miss.stop]}`;
    $("miss-head").textContent = miss.kind === "spent" ? t.missSpent(missName) : t.missClean(missName);
    $("miss-tip-label").textContent = t.missTip;
    $("miss-tip").textContent = TIPS[miss.stop][state.lang];
    const picks = $("picks");
    picks.replaceChildren();
    DECISIONS.forEach((decision, i) => {
      const option = decision.options.find((o) => o.id === state.picks[i]);
      const cost = res.costs[i];
      const li = el("li");
      const left = el("div");
      const small = el("small", null, `${i + 1}. ${SHORT[state.lang][decision.step - 1]}`);
      left.append(small, document.createTextNode(option[state.lang]));
      li.append(left, el("span", `cost${cost > 0 ? " on" : ""}`, t.costMark(cost)));
      picks.appendChild(li);
    });
    $("card-boundary").textContent = t.cardBoundary;
    renderCast();
    return res;
  }

  function finish() {
    show("result");
    const res = renderResult();
    const targets = [$("tier"), $("tier-line")];
    clearTimeout(revealTimer);
    const finalStates = res.lights;
    if (reduceMotion()) {
      renderLights($("result-lights"), finalStates);
      targets.forEach((n) => { n.style.visibility = "visible"; });
    } else {
      targets.forEach((n) => { n.style.visibility = "hidden"; });
      const shown = ["off", "off", "off", "off"];
      renderLights($("result-lights"), shown);
      let step = 0;
      const tick = () => {
        shown[step] = finalStates[step];
        renderLights($("result-lights"), shown);
        step += 1;
        if (step < 4) revealTimer = setTimeout(tick, 450);
        else revealTimer = setTimeout(() => targets.forEach((n) => { n.style.visibility = "visible"; }), 450);
      };
      revealTimer = setTimeout(tick, 350);
    }
    $("result").scrollIntoView({ block: "start", behavior: reduceMotion() ? "auto" : "smooth" });
    $("result-title").focus({ preventScroll: true });
    $("status").textContent = "";
  }

  function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let line = "";
    const tokens = /\s/.test(text) ? text.split(/(\s+)/) : Array.from(text);
    for (const token of tokens) {
      const test = line + token;
      if (ctx.measureText(test).width <= maxWidth || !line) line = test;
      else { lines.push(line.replace(/\s+$/, "")); line = token.replace(/^\s+/, ""); }
    }
    if (line) lines.push(line);
    return lines;
  }

  async function downloadCard() {
    const t = ui();
    const res = resolve(state.scenario, state.picks.join(""));
    if (!res) return;
    const portrait = await loadImage(ART.portrait[res.character]);
    const FONT = '"PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", "WenQuanYi Micro Hei", ui-sans-serif, system-ui, sans-serif';
    const W = 1080;
    const PAD = 84;
    const INNER = W - PAD * 2;
    const scratch = document.createElement("canvas").getContext("2d");
    const ops = [];
    let y = 100;
    const text = (str, size, weight, color, gap, maxW = INNER) => {
      scratch.font = `${weight} ${size}px ${FONT}`;
      wrapText(scratch, str, maxW).forEach((line) => {
        const at = y + size;
        ops.push((c) => { c.font = `${weight} ${size}px ${FONT}`; c.fillStyle = color; c.textAlign = "left"; c.fillText(line, PAD, at); });
        y += Math.round(size * 1.35);
      });
      y += gap;
    };
    const tierColor = { clear: "#2F7D4F", tight: "#B9761C", missed: "#B2452F" }[res.tier];
    text(t.kicker, 34, 700, "#B9761C", 18);
    const charId = res.character;
    const R = 78;
    const circleY = y + R;
    const initial = initialOf(charId, state.lang);
    ops.push((c) => {
      c.save();
      c.beginPath(); c.arc(PAD + R, circleY, R, 0, Math.PI * 2); c.closePath(); c.clip();
      c.fillStyle = portrait ? "#DCEBEE" : AVATAR_COLOR[charId]; c.fillRect(PAD, circleY - R, R * 2, R * 2);
      if (portrait) {
        const side = portrait.naturalWidth;
        c.drawImage(portrait, 0, portrait.naturalHeight * 0.02, side, side, PAD, circleY - R, R * 2, R * 2);
      } else {
        c.fillStyle = "#ffffff"; c.font = `700 72px ${FONT}`; c.textAlign = "center"; c.fillText(initial, PAD + R, circleY + 24);
      }
      c.restore();
      c.strokeStyle = AVATAR_COLOR[charId]; c.lineWidth = 6; c.beginPath(); c.arc(PAD + R, circleY, R, 0, Math.PI * 2); c.stroke();
    });
    const nameX = PAD + R * 2 + 36;
    scratch.font = `700 54px ${FONT}`;
    const nameLine = CAST[charId][state.lang].name;
    ops.push((c) => { c.textAlign = "left"; c.font = `700 54px ${FONT}`; c.fillStyle = "#12323A"; c.fillText(nameLine, nameX, circleY - 4); });
    ops.push((c) => { c.textAlign = "left"; c.font = `500 34px ${FONT}`; c.fillStyle = "#54686C"; c.fillText(`${CAST[charId][state.lang].role} · ${SCENARIOS[state.scenario][state.lang].name}`, nameX, circleY + 44); });
    y += R * 2 + 24;
    text(`${t.styleLabel(STYLES[res.style][state.lang].name)}`, 36, 700, "#12323A", 4);
    text(STYLES[res.style][state.lang].line, 34, 500, "#54686C", 24);
    text(t.tier[res.tier].name, 76, 700, tierColor, 4);
    text(t.tier[res.tier].line, 38, 500, "#12323A", 24);
    // four lights
    const labels = PAGE_TEXT[state.lang].countdown;
    const colors = { green: "#2F7D4F", amber: "#B9761C", red: "#B2452F" };
    const colW = INNER / 4;
    const lightsY = y + 18;
    res.lights.forEach((state2, i) => {
      const cx = PAD + colW * i + 18;
      ops.push((c) => { c.fillStyle = colors[state2]; c.beginPath(); c.arc(cx, lightsY + 14, 14, 0, Math.PI * 2); c.fill(); });
    });
    scratch.font = `500 26px ${FONT}`;
    let maxLines = 1;
    labels.forEach((label, i) => {
      const lines = wrapText(scratch, label, colW - 52);
      maxLines = Math.max(maxLines, lines.length);
      lines.forEach((line, k) => ops.push((c) => { c.textAlign = "left"; c.font = `500 26px ${FONT}`; c.fillStyle = "#12323A"; c.fillText(line, PAD + colW * i + 42, lightsY + 22 + k * 32); }));
    });
    y += 18 + 28 + maxLines * 32 + 26;
    text(res.worstLight ? t.worst(labels[LIGHTS.indexOf(res.worstLight)]) : t.worstNone, 34, 700, "#12323A", 6);
    text(t.handover[res.handover], 32, 500, "#12323A", 18);
    DECISIONS.forEach((decision, i) => {
      const option = decision.options.find((o) => o.id === state.picks[i]);
      text(`${i + 1}. ${SHORT[state.lang][decision.step - 1]} · ${t.costMark(res.costs[i])}`, 28, 700, res.costs[i] > 0 ? "#B2452F" : "#2F7D4F", 0);
      text(option[state.lang], 30, 500, "#12323A", 12);
    });
    y += 14;
    const footY = y;
    scratch.font = `700 28px ${FONT}`;
    const footLines = wrapText(scratch, t.cardBoundary, INNER);
    const H = footY + 40 + footLines.length * 40 + 70;
    const canvas = document.createElement("canvas");
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.fillStyle = "#F3F7F6"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(40, 40, W - 80, H - 80);
    ctx.strokeStyle = "#0E4A52"; ctx.lineWidth = 4; ctx.strokeRect(40, 40, W - 80, H - 80);
    ops.forEach((op) => op(ctx));
    ctx.strokeStyle = "#CBDADD"; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(PAD, footY); ctx.lineTo(W - PAD, footY); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = "left"; ctx.font = `700 28px ${FONT}`; ctx.fillStyle = "#0E4A52";
    footLines.forEach((line, i) => ctx.fillText(line, PAD, footY + 48 + i * 40));
    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `trade-street-${state.scenario}-${state.picks.join("")}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      $("status").textContent = t.downloaded;
    } catch {
      $("status").textContent = t.downloadFail;
    }
  }

  async function copyLink() {
    const t = ui();
    try {
      await navigator.clipboard.writeText(location.href);
      $("status").textContent = t.copied;
    } catch {
      $("status").textContent = t.copyFail;
    }
  }

  function reset() {
    clearTimeout(revealTimer);
    state.index = 0;
    state.picks = Array(DECISIONS.length).fill(null);
    state.order = Array(DECISIONS.length).fill(null);
    show("entry");
    renderScenarios();
    $("title").focus({ preventScroll: false });
  }

  // events
  document.querySelectorAll("#lang-group button").forEach((button) => button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    applyStatic();
    if (state.view === "play") renderPlay(false);
    if (state.view === "result") renderResult();
    if (state.view === "result") { const res = resolve(state.scenario, state.picks.join("")); renderLights($("result-lights"), res.lights); }
    syncUrl();
  }));
  $("start").addEventListener("click", () => {
    state.index = 0;
    state.picks = Array(DECISIONS.length).fill(null);
    state.order = Array(DECISIONS.length).fill(null);
    show("play");
    renderPlay(true);
  });
  $("next").addEventListener("click", () => go(1));
  $("back").addEventListener("click", () => go(-1));
  $("download").addEventListener("click", downloadCard);
  $("copy").addEventListener("click", copyLink);
  $("again").addEventListener("click", reset);
  $("preview-close").addEventListener("click", closePreview);
  window.matchMedia(MOBILE_QUERY).addEventListener("change", buildHotspots);
  window.addEventListener("resize", fitStage);

  // the map is the plate itself (clouds, far ship and the crane container taken out); the layers go back over it once every picture has loaded.
  // If the plate or any layer cannot load, the approved whole map takes its place, so there is never a half-drawn map and nothing is fetched twice.
  (function startLayers() {
    const stage = $("map-stage");
    const box = $("layer-fx");
    const mapImg = $("map-img");
    if (!stage || !box || !mapImg) return;
    const picture = mapImg.parentElement;
    let built = null;
    let fell = false;
    const settle = () => stage.classList.add("map-settled");
    function useApprovedMap() {
      if (fell) return;
      fell = true;
      stage.classList.remove("layers-ready");
      box.replaceChildren();
      picture.querySelectorAll("source").forEach((source) => { source.srcset = ART.map.mobile; });
      mapImg.src = ART.map.desktop;
      settle();
    }
    mapImg.addEventListener("error", useApprovedMap);
    function build() {
      if (fell) return;
      const set = isPhone() ? ART.layers.mobile : ART.layers.desktop;
      if (built === set) return;
      built = set;
      stage.classList.remove("layers-ready");
      box.replaceChildren();
      const [cw, ch] = set.canvas;
      const pct = (v, total) => `${(v / total * 100).toFixed(4)}%`;
      const pictures = set.sprites.map((sp) => {
        const img = new Image();
        img.className = `sprite ${sp.id}`; img.alt = ""; img.decoding = "async";
        img.style.left = pct(sp.x, cw); img.style.top = pct(sp.y, ch); img.style.width = pct(sp.w, cw); img.style.height = pct(sp.h, ch);
        if (sp.pivot) img.style.transformOrigin = `${(sp.pivot[0] / sp.w * 100).toFixed(2)}% ${(sp.pivot[1] / sp.h * 100).toFixed(2)}%`;
        img.dataset.layer = sp.id;
        return img;
      });
      const plateLoaded = mapImg.complete && mapImg.naturalWidth > 0;
      let waiting = pictures.length + (plateLoaded ? 0 : 1);
      const one = () => { waiting -= 1; if (!fell && waiting === 0 && built === set) { box.replaceChildren(...pictures); stage.classList.add("layers-ready"); settle(); } };
      if (!plateLoaded) mapImg.addEventListener("load", one, { once: true });
      pictures.forEach((img, i) => { img.onload = one; img.onerror = useApprovedMap; img.src = set.sprites[i].file; });
    }
    if (mapImg.complete && mapImg.naturalWidth === 0 && mapImg.currentSrc) useApprovedMap();
    build();
    setTimeout(() => { if (!stage.classList.contains("map-settled")) useApprovedMap(); }, 6000);
    window.matchMedia(MOBILE_QUERY).addEventListener("change", build);
  }());

  // the sea glints are masked to the water; if the mask picture cannot load they stay off, so they never spill over the land
  (function startSeaEffect() {
    const stage = $("map-stage");
    if (!stage || typeof CSS === "undefined" || !(CSS.supports("mask-image", "url(x.webp)") || CSS.supports("-webkit-mask-image", "url(x.webp)"))) return;
    const probe = new Image();
    probe.onload = () => stage.classList.add("fx-ready");
    probe.src = isPhone() ? ART.mask.mobile : ART.mask.desktop;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { stage.classList.toggle("idle", !entries[entries.length - 1].isIntersecting); }).observe(stage);
    }
  }());

  applyStatic();
  if (route.result) {
    state.scenario = route.result.scenario;
    state.picks = route.result.code.split("");
    state.index = LAST_STOP;
    show("result");
    const res = renderResult();
    renderLights($("result-lights"), res.lights);
  } else {
    show("entry");
  }
}

if (typeof document !== "undefined") boot();
