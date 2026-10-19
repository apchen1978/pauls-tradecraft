import { calculateModel } from "./model.js";

const COPY = {
  zh: {
    lang: "zh-Hant", title: "要開幾個 agent？", eyebrow: "AI LAB · INTERACTIVE STUDY", dek: "幫一家做手工茶具外銷的虛構小公司決定：這份調查，要開幾個 agent？", boundary: "示意模型，非實測數據；成本用相對單位。",
    steps: ["你想開幾個 agent？", "加上這四道設限", "你的團隊設定"],
    stepNotes: ["同一件事，人數增加會帶來分工，也會增加協調。", "比較設限前後；總管 agent 也有自己的成本與盲點。", "這是一張示意設定卡，沒有標準答案；帶走你想設的界線。"],
    scenarioLabel: "虛構任務", scenario: "兩週內，比較三個海外市場的經銷商，交一份建議。", sliderLabel: "想安排幾個 agent？", sliderHelp: "滑動或用鍵盤方向鍵調整。數量只是示意模型輸入。",
    meter: { cost: "成本", quality: "品質", risk: "風險", relative: "相對單位", score: "示意分", levels: { low: "低", medium: "中", high: "高" } },
    noLimit: "我沒有設上限", noLimitHelp: "若沒有預算上限，示意系統會自行增加 agent。", auto: (n) => `系統自己決定開了 ${n} 個 agent。多出的人手也會帶來協調成本。`,
    reversibleTitle: "這件事做出去，收得回來嗎？", reversible: "收得回來：改程式、改草稿、改內部清單，可以退回上一版。", irreversible: "發出去就收不回：寄給客戶、出貨、付款或報價。", irreversibleNote: "做錯的代價，不是回滾就能補回來。",
    feedback: { tooFew: "人手還少，能同時拆開的工作有限。", rising: "增加人手能分開工作；先把角色說清楚，減少重複。", repeat: "人數再增加，若沒有分工，工作容易重複或互相矛盾。", uncontrolled: "沒有上限時，系統會自行增加人手；成本和協調也跟著增加。" },
    next: "繼續加設限", back: "上一步", finish: "看設定卡", restart: "再試一次",
    guardrails: {
      roles: { title: "固定分工", help: "搜尋員／查證員／整理員／檢查者。", on: "角色固定，讓工作分開，減少重複與衝突。", off: "未固定分工時，各 agent 可能重複做同一件事。" },
      budget: { title: "預算上限", help: "用完就停下來回報。", on: "成本到達示意上限後就停下來回報。", off: "未設預算上限時，成本可能繼續往上。" },
      cap: { title: "來回上限", help: "agent 之間最多來回兩輪。", on: "最多來回兩輪，少一些反覆協調。", off: "沒有來回上限時，agent 可能不斷互相追問。" },
      signoff: { title: "關鍵步驟由負責人簽核", help: "對外發送、改正式資料、付款前都要確認。", on: "不可逆或核心操作會停下來等負責人確認。", off: "沒有簽核時，做出去的事可能無法收回。" },
      coordinator: { title: "加一個總管 agent", help: "多看一次子 agent 的結果，也多一份成本與錯誤可能。", note: "總管能減少部分互相矛盾，但它自己也要花成本、也會錯；不能取代負責人簽核。" },
    },
    before: "設限前", after: "設限後", effectsTitle: "每道設限改變什麼",
    summaries: { tooFew: "人手偏少", justRight: "分工與人手暫時平衡", tooMany: "人手或風險偏高" },
    resultScenario: "虛構任務設定", resultMark: "TEAM SETTINGS", selectedTitle: "這次打開的界線", none: "還沒有打開界線", settings: { roles: "固定分工", budget: "預算上限", cap: "來回上限", signoff: "負責人簽核", coordinator: "總管 agent", noLimit: "沒有 agent 數量上限", reversible: "工作可退回上一版", irreversible: "工作可能無法收回" },
    takeaways: ["先固定角色，再增加人手。", "沒有設上限，成本是被決定的，不是被你決定的。", "不可逆的決定，留給負責人。"], coordinatorTakeaway: "總管 agent 是多一層檢查，不是免設限。", irreversibleTakeaway: "改程式可以回滾；寄出去的信、出貨、付款不行。",
    resultBoundary: "這是固定的示意模型，不是實測結果或真實價格。", chapter14: "回 AI Lab 第 14 章：什麼時候輪到 agent？", chapter17: "回 AI Lab 第 17 章：工具有人用嗎？", foot: "示範／虛構情境，不連接任何 AI 服務。", home: "回 AI Lab", guide: "回到一頁指南",
    costUnit: "相對單位", qualityUnit: "示意分", riskBar: "示意程度",
  },
  en: {
    lang: "en", title: "How Many Agents?", eyebrow: "AI LAB · INTERACTIVE STUDY", dek: "Help a fictional small handcrafted tea-ware exporter decide how many agents this research needs.", boundary: "Illustrative model, not measured data; costs use relative units.",
    steps: ["How many agents would you use?", "Add four guardrails", "Your team settings"],
    stepNotes: ["More people can split the work, but they also need coordination.", "Compare the settings before and after. A coordinator agent has costs and blind spots too.", "This is an illustrative settings card, not a right answer. Keep the boundaries you want."],
    scenarioLabel: "Fictional task", scenario: "Compare distributors in three overseas markets and deliver a recommendation within two weeks.", sliderLabel: "How many agents would you assign?", sliderHelp: "Drag the slider or use the arrow keys. The count is an illustrative model input.",
    meter: { cost: "Cost", quality: "Quality", risk: "Risk", relative: "relative units", score: "illustrative score", levels: { low: "Low", medium: "Medium", high: "High" } },
    noLimit: "I set no limit", noLimitHelp: "Without a budget cap, the illustrative system may add agents on its own.", auto: (n) => `The system decided to open ${n} agents. Extra people also add coordination cost.`,
    reversibleTitle: "Can this work be undone?", reversible: "Code, drafts and internal lists can be rolled back.", irreversible: "Hard to take back: a customer email, shipment, payment or quote once sent.", irreversibleNote: "A rollback cannot make every mistake disappear.",
    feedback: { tooFew: "With a small team, only so much work can happen in parallel.", rising: "More people can split tasks; define the roles first to avoid duplication.", repeat: "With more people and no clear roles, tasks may repeat or conflict.", uncontrolled: "Without a limit, the system adds people; coordination and cost rise too." },
    next: "Set the guardrails", back: "Back", finish: "See the settings card", restart: "Try again",
    guardrails: {
      roles: { title: "Fixed roles", help: "Search / verify / organize / review.", on: "Fixed roles separate the work and reduce duplication and conflict.", off: "Without fixed roles, agents may repeat the same work." },
      budget: { title: "Budget cap", help: "Stop and report when it is used up.", on: "Stop and report when the illustrative cost limit is reached.", off: "Without a budget cap, cost may keep rising." },
      cap: { title: "Round limit", help: "At most two rounds between agents.", on: "At most two rounds means less back-and-forth coordination.", off: "Without a round limit, agents may keep asking each other questions." },
      signoff: { title: "Decision-maker sign-off for key steps", help: "Review before external sending, changing live records or payment.", on: "Pause for the decision-maker before an irreversible or core action.", off: "Without sign-off, an action may be hard to take back." },
      coordinator: { title: "Add a coordinator agent", help: "One more review of sub-agent work, with added cost and another chance of error.", note: "A coordinator can reduce some conflicts, but also costs and can be wrong. It cannot replace decision-maker sign-off." },
    },
    before: "Before guardrails", after: "After guardrails", effectsTitle: "What each guardrail changes",
    summaries: { tooFew: "A small team", justRight: "Team size and roles look balanced for now", tooMany: "Team size or risk is running high" },
    resultScenario: "Fictional task settings", resultMark: "TEAM SETTINGS", selectedTitle: "Boundaries you turned on", none: "No boundaries turned on yet", settings: { roles: "Fixed roles", budget: "Budget cap", cap: "Round limit", signoff: "Decision-maker sign-off", coordinator: "Coordinator agent", noLimit: "No agent-count limit", reversible: "Work can return to an earlier version", irreversible: "Work may be hard to take back" },
    takeaways: ["Set roles before adding people.", "Without a cap, the cost is decided for you.", "Leave irreversible decisions to the decision-maker."], coordinatorTakeaway: "A coordinator agent adds a check; it does not remove the need for limits.", irreversibleTakeaway: "Code can be rolled back; sent emails, shipments and payments cannot.",
    resultBoundary: "This is a fixed illustrative model, not a measurement or real price.", chapter14: "Back to AI Lab chapter 14: When does an agent take its turn?", chapter17: "Back to AI Lab chapter 17: Is anyone using the tool?", foot: "Illustration / fictional scenario · No AI service connected.", home: "Back to AI Lab", guide: "Back to the one-page guide",
    costUnit: "relative units", qualityUnit: "illustrative score", riskBar: "illustrative level",
  },
};

const $ = (id) => document.getElementById(id);
const state = { lang: new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh", step: 1, agents: 1, noLimit: false, irreversible: false, roles: false, budget: false, cap: false, signoff: false, coordinator: false };
const t = () => COPY[state.lang];

function display(model) {
  const x = t();
  return `<div class="meters" aria-live="polite" aria-atomic="true">
    <div class="meter" data-kind="cost"><p class="meter-label">${x.meter.cost}</p><div class="meter-value-row"><strong class="meter-value">${model.cost.toFixed(1)}</strong><span class="meter-unit">${x.costUnit}</span></div><div class="meter-track" aria-hidden="true"><span class="meter-fill" style="width:${Math.min(100, model.cost / 40 * 100)}%"></span></div></div>
    <div class="meter" data-kind="quality"><p class="meter-label">${x.meter.quality}</p><div class="meter-value-row"><strong class="meter-value">${model.quality}</strong><span class="meter-unit">${x.qualityUnit}</span></div><div class="meter-track" aria-hidden="true"><span class="meter-fill" style="width:${model.quality}%"></span></div></div>
    <div class="meter" data-kind="risk" data-level="${model.riskLevel}"><p class="meter-label">${x.meter.risk} · ${x.meter.levels[model.riskLevel]}</p><div class="meter-value-row"><strong class="meter-value">${x.meter.levels[model.riskLevel]}</strong><span class="meter-unit">${x.riskBar}</span></div><div class="meter-track" aria-hidden="true"><span class="meter-fill" style="width:${Math.min(100, model.riskScore / 60 * 100)}%"></span></div></div>
  </div>`;
}

function currentModel(overrides = {}) {
  return calculateModel({ agents: state.agents, noLimit: state.noLimit, irreversible: state.irreversible, roles: state.roles, budget: state.budget, cap: state.cap, signoff: state.signoff, coordinator: state.coordinator, ...overrides });
}

function feedback(model) {
  const x = t().feedback;
  if (model.automatic) return x.uncontrolled;
  if (model.effectiveAgents <= 2) return x.tooFew;
  if (model.effectiveAgents >= 8 && !state.roles) return x.repeat;
  return x.rising;
}

function renderStepOne() {
  const x = t();
  const model = currentModel();
  $("agent-value").value = String(state.agents);
  $("agent-value").textContent = String(state.agents);
  $("step-one-meters").innerHTML = display(model);
  $("plain-feedback").textContent = feedback(model);
  $("automatic-note").hidden = !model.automatic;
  $("automatic-note").textContent = model.automatic ? x.auto(model.effectiveAgents) : "";
  $("reversibility-note").hidden = !state.irreversible;
  $("reversibility-note").textContent = x.irreversibleNote;
  $("no-limit").checked = state.noLimit;
  document.querySelectorAll('input[name="reversibility"]').forEach((input) => { input.checked = (input.value === "irreversible") === state.irreversible; });
}

function renderStepTwo() {
  const x = t();
  const before = currentModel({ roles: false, budget: false, cap: false, signoff: false, coordinator: false });
  const after = currentModel();
  $("before-meters").innerHTML = display(before);
  $("after-meters").innerHTML = display(after);
  $("guardrail-effects").replaceChildren(...["roles", "budget", "cap", "signoff"].map((key) => {
    const item = document.createElement("li");
    item.textContent = x.guardrails[key][state[key] ? "on" : "off"];
    return item;
  }));
  $("coordinator-note").textContent = x.guardrails.coordinator.note;
}

function renderResult() {
  const x = t();
  const model = currentModel();
  $("result-card").dataset.summary = model.summary;
  $("result-mark").textContent = x.resultMark;
  $("result-scenario").textContent = x.resultScenario;
  $("result-summary").textContent = x.summaries[model.summary];
  $("result-meters").innerHTML = display(model);
  const selected = [];
  for (const key of ["roles", "budget", "cap", "signoff", "coordinator"]) if (state[key]) selected.push(x.settings[key]);
  if (state.noLimit) selected.push(x.settings.noLimit);
  selected.push(state.irreversible ? x.settings.irreversible : x.settings.reversible);
  $("settings-list").replaceChildren(...(selected.length ? selected : [x.none]).map((text) => {
    const li = document.createElement("li"); li.textContent = text; return li;
  }));
  const lines = [...x.takeaways];
  if (state.coordinator) lines.push(x.coordinatorTakeaway);
  if (state.irreversible) lines.push(x.irreversibleTakeaway);
  $("takeaways").replaceChildren(...lines.map((text) => {
    const p = document.createElement("p"); p.className = "takeaway"; p.textContent = text; return p;
  }));
}

function render() {
  const x = t();
  document.documentElement.lang = x.lang;
  document.title = `${x.title} · AI Lab`;
  $("skip-link").textContent = state.lang === "zh" ? "跳至內容" : "Skip to content";
  $("home-link").textContent = `← ${x.home}`;
  $("home-link").href = `/ai-lab/?lang=${state.lang}#c14`;
  document.querySelectorAll("[data-lang]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang)));
  $("eyebrow").textContent = x.eyebrow;
  $("page-title").textContent = x.title;
  $("dek").textContent = x.dek;
  $("boundary").textContent = x.boundary;
  $("progress-text").textContent = `${state.lang === "zh" ? "第" : "Step"} ${state.step}${state.lang === "zh" ? "／3 步" : " of 3"}`;
  $("progress").setAttribute("aria-valuenow", String(state.step));
  $("progress-fill").style.width = `${state.step / 3 * 100}%`;
  [1, 2, 3].forEach((number) => { $(`step-${["one", "two", "three"][number - 1]}`).hidden = number !== state.step; });
  ["step-kicker", "step-two-kicker", "step-three-kicker"].forEach((id, index) => { $(id).textContent = `${state.lang === "zh" ? "第" : "STEP"} ${index + 1}${state.lang === "zh" ? "／3 步" : " / 3"}`; });
  $("step-heading").textContent = x.steps[0]; $("step-note").textContent = x.stepNotes[0];
  $("step-two-heading").textContent = x.steps[1]; $("step-two-note").textContent = x.stepNotes[1];
  $("step-three-heading").textContent = x.steps[2];
  $("scenario-label").textContent = x.scenarioLabel; $("scenario-task").textContent = x.scenario;
  $("slider-label").textContent = x.sliderLabel; $("slider-help").textContent = x.sliderHelp;
  $("agent-count").setAttribute("aria-label", `${x.sliderLabel} ${state.agents}`);
  $("no-limit-label").textContent = x.noLimit; $("no-limit-help").textContent = x.noLimitHelp;
  $("reversibility-legend").textContent = x.reversibleTitle;
  $("reversible-label").textContent = x.reversible; $("irreversible-label").textContent = x.irreversible;
  $("before-title").textContent = x.before; $("after-title").textContent = x.after;
  $("settings-title").textContent = x.selectedTitle;
  $("coordinator-label").textContent = x.guardrails.coordinator.title; $("coordinator-help").textContent = x.guardrails.coordinator.help;
  for (const key of ["roles", "budget", "cap", "signoff"]) {
    $(`${key}`).checked = state[key];
    $(`${key}-label`).textContent = x.guardrails[key].title;
    $(`${key}-help`).textContent = x.guardrails[key].help;
  }
  $("coordinator").checked = state.coordinator;
  $("coordinator-note").textContent = x.guardrails.coordinator.note;
  $("next-one").textContent = x.next; $("back-two").textContent = x.back; $("next-two").textContent = x.finish; $("back-three").textContent = x.back; $("restart").textContent = x.restart;
  $("guardrail-effects").setAttribute("aria-label", x.effectsTitle);
  $("result-boundary").textContent = x.resultBoundary;
  $("chapter-14-link").textContent = x.chapter14; $("chapter-14-link").href = `/ai-lab/?lang=${state.lang}#c14`;
  $("chapter-17-link").textContent = x.chapter17; $("chapter-17-link").href = `/ai-lab/?lang=${state.lang}#c17`;
  $("guide-link").textContent = x.guide; $("guide-link").href = `/ai-lab/guide/?lang=${state.lang}`;
  $("foot-boundary").textContent = x.foot; $("foot-home").textContent = x.home; $("foot-home").href = `/ai-lab/?lang=${state.lang}#c14`;
  renderStepOne(); renderStepTwo(); renderResult();
}

function changeStep(step) {
  state.step = step;
  render();
  const target = $(`step-${["one", "two", "three"][step - 1]}`);
  target.querySelector("h2")?.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

$("agent-count").addEventListener("input", (event) => { state.agents = Number(event.currentTarget.value); renderStepOne(); });
$("no-limit").addEventListener("change", (event) => { state.noLimit = event.currentTarget.checked; renderStepOne(); renderStepTwo(); renderResult(); });
document.querySelectorAll('input[name="reversibility"]').forEach((input) => input.addEventListener("change", (event) => { state.irreversible = event.currentTarget.value === "irreversible"; renderStepOne(); renderStepTwo(); renderResult(); }));
for (const key of ["roles", "budget", "cap", "signoff", "coordinator"]) $(key).addEventListener("change", (event) => { state[key] = event.currentTarget.checked; renderStepTwo(); renderStepOne(); renderResult(); });
$("next-one").addEventListener("click", () => changeStep(2));
$("back-two").addEventListener("click", () => changeStep(1));
$("next-two").addEventListener("click", () => changeStep(3));
$("back-three").addEventListener("click", () => changeStep(2));
$("restart").addEventListener("click", () => {
  Object.assign(state, { step: 1, agents: 1, noLimit: false, irreversible: false, roles: false, budget: false, cap: false, signoff: false, coordinator: false });
  render(); $("page-title").focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});
document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => {
  state.lang = button.dataset.lang;
  const url = new URL(location.href); url.searchParams.set("lang", state.lang); history.replaceState(null, "", url);
  render();
}));
render();
