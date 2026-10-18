const COPY = {
  zh: {
    no: "16", title: "把判斷寫下來，agent 才接得住",
    lead: "人的經驗要先寫成具體做法，agent 才能照著做；寫得含糊，它就只能猜。",
    demo: "示範／虛構情境", prompt: "一句含糊的經驗", seed: "報價要小心。",
    desk: "把經驗組成一條規則", deskLead: "每格選一項，看看 agent 會怎麼照著做。",
    fields: ["什麼時候", "做什麼", "什麼情況要停下問人", "誰更新、何時回頭看"],
    options: [
      [{ kind: "concrete", label: "客戶詢價時，先核對需求欄位是否齊全。" }, { kind: "risk", label: "每封詢價都當成已確認訂單。" }, { kind: "vague", label: "詢價來了就處理。" }],
      [{ kind: "risk", label: "直接寄出報價。" }, { kind: "vague", label: "照平常方式處理。" }, { kind: "concrete", label: "查核規格與可用資料，整理成報價草稿。" }],
      [{ kind: "vague", label: "有問題就小心一點。" }, { kind: "concrete", label: "價格、交期或規格缺資料時，停下來請負責人確認。" }, { kind: "risk", label: "資料不全時，用常見做法補齊並繼續。" }],
      [{ kind: "risk", label: "讓 agent 自己調整規則，不必回報。" }, { kind: "concrete", label: "由負責人維護；出錯或流程變動時回頭檢視。" }, { kind: "vague", label: "之後再看。" }],
    ],
    kindNames: { vague: "含糊", concrete: "具體可用", risk: "看似具體但有風險" },
    preview: "組好的規則", outcomeTitle: "agent 照這條規則會怎麼做", selectionPrefix: "你選的：",
    status: { vague: "還不夠清楚", concrete: "具體可用", risk: "做得到，但有風險" },
    vagueResult: "條件還不清楚，agent 只能猜。它應先停下來，指出缺少的資訊。",
    concreteResult: "條件、動作和停下詢問的時機都寫清楚了；agent 可以整理草稿，遇到缺項就交由負責人確認。",
    riskyResults: [
      "把詢價當成已確認訂單，可能跳過需求確認。",
      "直接寄出未經負責人確認的報價，可能把未核實內容當成承諾。",
      "資料缺漏仍自行補齊，可能把猜測寫進報價。",
      "讓 agent 自行改規則且不回報，錯誤做法可能繼續沿用。",
    ],
    reveal: "看看一條可用的規則", exampleTitle: "示範規則",
    example: "客戶詢價時，先核對需求欄位並查可用規格；價格、交期或規格缺資料時，停下來請負責人確認。由負責人維護；出錯或流程變動時回頭檢視。",
    errorTitle: "出錯的案例也要寫進去",
    error: "每次出錯後，把漏掉的情況補成一條例外；下次遇到相同缺口，agent 就知道要停下來問。",
    layersTitle: "三種不同的工作層",
    layers: [
      ["手邊的工具", "Tools", "拿來直接做事的東西。"],
      ["做事說明書", "Skill", "告訴 agent 有哪些做法、什麼時候用。"],
      ["外部插座", "MCP", "用標準方式接上外部系統。"],
    ],
    layerNote: "三者不是誰取代誰，而是不同職責層；這是常見的分法，不是嚴格定義。",
    ch6: "回看第 06 章：工具與 MCP", skill: "查看 Skill 小卡",
    bridge: "工具包好了，裡面的判斷還在人的腦中；這一章來把它寫下來。",
    rail: "寫下判斷",
  },
  en: {
    no: "16", title: "Write the judgment down so an agent can use it",
    lead: "People's experience needs to become a concrete way of working before an agent can follow it. If it is vague, the agent can only guess.",
    demo: "Illustration / fictional scenario", prompt: "A vague piece of experience", seed: "Be careful with quotes.",
    desk: "Build a rule from experience", deskLead: "Choose one option in each field and see how the agent would follow it.",
    fields: ["When", "What to do", "When to stop and ask", "Who updates it, and when to review"],
    options: [
      [{ kind: "concrete", label: "When a customer enquires, first check that the request fields are complete." }, { kind: "risk", label: "Treat every enquiry as a confirmed order." }, { kind: "vague", label: "Handle enquiries when they arrive." }],
      [{ kind: "risk", label: "Send the quote directly." }, { kind: "vague", label: "Handle it as usual." }, { kind: "concrete", label: "Check the available specifications and information, then prepare a quote draft." }],
      [{ kind: "vague", label: "Be careful if something is unclear." }, { kind: "concrete", label: "If price, lead time or specifications are missing, stop and ask the decision-maker." }, { kind: "risk", label: "Fill gaps with common practice and keep going." }],
      [{ kind: "risk", label: "Let the agent change the rule without reporting back." }, { kind: "concrete", label: "The decision-maker maintains it and reviews it after an error or process change." }, { kind: "vague", label: "Review it later." }],
    ],
    kindNames: { vague: "Vague", concrete: "Concrete and usable", risk: "Specific-looking but risky" },
    preview: "Your assembled rule", outcomeTitle: "What the agent would do", selectionPrefix: "Your choices:",
    status: { vague: "Still unclear", concrete: "Concrete and usable", risk: "Possible, but risky" },
    vagueResult: "The conditions are unclear, so the agent can only guess. It should pause and point out what is missing.",
    concreteResult: "The conditions, action and pause point are clear. The agent can prepare a draft and leave missing details for the decision-maker to confirm.",
    riskyResults: [
      "Treating an enquiry as a confirmed order may skip checking what was requested.",
      "Sending a quote before the decision-maker reviews it may turn unverified details into a promise.",
      "Filling gaps on its own may put guesses into a quote.",
      "If the agent changes rules without reporting back, a faulty approach may keep being reused.",
    ],
    reveal: "See a usable rule", exampleTitle: "Example rule",
    example: "When a customer enquires, check the request fields and available specifications. If price, lead time or specifications are missing, stop and ask the decision-maker. The decision-maker maintains the rule and reviews it after an error or process change.",
    errorTitle: "Write down the cases that went wrong, too",
    error: "After an error, add the missed situation as an exception. The next time the same gap appears, the agent knows to stop and ask.",
    layersTitle: "Three different responsibility layers",
    layers: [
      ["Tools at hand", "Tools", "Things used to take direct action."],
      ["A guide to doing the work", "Skill", "Tells the agent what methods exist and when to use them."],
      ["A socket to external systems", "MCP", "Connects to external systems in a standard way."],
    ],
    layerNote: "They do not replace one another; they have different responsibilities. This is a common distinction, not a strict definition.",
    ch6: "Revisit chapter 06: tools and MCP", skill: "See the Skill card",
    bridge: "The toolkit is ready, but its judgment still lives in people's heads. This chapter puts that judgment into words.",
    rail: "Write the judgment",
  },
};

const state = ["vague", "vague", "vague", "vague"];
let hasInteracted = false;
const lang = () => document.documentElement.lang.startsWith("en") ? "en" : "zh";
const node = (tag, className, text) => {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text) item.textContent = text;
  return item;
};

function buildSection() {
  const section = node("section", "chapter deeper rulebench");
  section.id = "c16";
  section.setAttribute("aria-labelledby", "rulebench-title");
  const no = node("p", "no", "16"); no.id = "rulebench-no";
  const title = node("h2"); title.id = "rulebench-title";
  const lead = node("p", "sub"); lead.id = "rulebench-lead";
  const demo = node("p", "demo"); demo.id = "rulebench-demo";
  const desk = node("section", "rulebench-desk"); desk.setAttribute("aria-labelledby", "rulebench-desk-title");
  const deskTitle = node("h3"); deskTitle.id = "rulebench-desk-title";
  const deskLead = node("p", "sub"); deskLead.id = "rulebench-desk-lead";
  const seed = node("div", "rulebench-seed");
  const seedLabel = node("span", "rulebench-label"); seedLabel.id = "rulebench-seed-label";
  const seedText = node("strong"); seedText.id = "rulebench-seed";
  seed.append(seedLabel, seedText);
  const form = node("div", "rulebench-form"); form.id = "rulebench-form";
  const preview = node("section", "rulebench-preview"); preview.setAttribute("aria-labelledby", "rulebench-preview-title");
  const previewTitle = node("h4"); previewTitle.id = "rulebench-preview-title";
  const previewText = node("p", "rulebench-rule"); previewText.id = "rulebench-rule";
  const outcome = node("div", "rulebench-outcome"); outcome.id = "rulebench-outcome";
  outcome.setAttribute("role", "status"); outcome.setAttribute("aria-live", "polite"); outcome.setAttribute("aria-atomic", "true");
  const outcomeTitle = node("h4"); outcomeTitle.id = "rulebench-outcome-title";
  const outcomeSelection = node("p", "rulebench-selection"); outcomeSelection.id = "rulebench-selection";
  const outcomeStatus = node("p", "rulebench-status"); outcomeStatus.id = "rulebench-status";
  const outcomeText = node("p", "rulebench-outcome-text"); outcomeText.id = "rulebench-outcome-text";
  outcome.append(outcomeTitle, outcomeSelection, outcomeStatus, outcomeText);
  preview.append(previewTitle, previewText, outcome);
  desk.append(deskTitle, deskLead, seed, form, preview);

  const reveal = node("details", "rulebench-reveal");
  reveal.id = "rulebench-reveal";
  const summary = node("summary"); summary.id = "rulebench-reveal-summary";
  const exampleTitle = node("h3"); exampleTitle.id = "rulebench-example-title";
  const example = node("p"); example.id = "rulebench-example";
  const errorTitle = node("h3"); errorTitle.id = "rulebench-error-title";
  const error = node("p"); error.id = "rulebench-error";
  const layersTitle = node("h3"); layersTitle.id = "rulebench-layers-title";
  const layers = node("div", "rulebench-layers"); layers.id = "rulebench-layers";
  const note = node("p", "rulebench-layer-note"); note.id = "rulebench-layer-note";
  const links = node("p", "rulebench-links"); links.id = "rulebench-links";
  reveal.append(summary, exampleTitle, example, errorTitle, error, layersTitle, layers, note, links);
  section.append(no, title, lead, demo, desk, reveal);
  return section;
}

const section = buildSection();

function renderRail() {
  const rail = document.getElementById("rail");
  if (!rail || rail.querySelector('[data-target="c16"]')) return;
  const x = COPY[lang()];
  const link = node("a", "rail-dot");
  link.href = "#c16"; link.dataset.target = "c16";
  link.append(node("span", "mono", "16"), node("span", "rail-label", x.rail));
  const previous = rail.querySelector('[data-target="c15"]') || rail.querySelector('[data-target="c14"]');
  if (previous) previous.after(link); else rail.append(link);
}

function render() {
  const x = COPY[lang()];
  if (!section.isConnected) {
    const latest = document.getElementById("latest");
    if (latest) latest.before(section);
    else document.getElementById("main")?.append(section);
  }
  const set = (id, text) => { const target = document.getElementById(id); if (target) target.textContent = text; };
  set("rulebench-no", x.no); set("rulebench-title", x.title); set("rulebench-lead", x.lead); set("rulebench-demo", x.demo);
  set("rulebench-desk-title", x.desk); set("rulebench-desk-lead", x.deskLead); set("rulebench-seed-label", x.prompt); set("rulebench-seed", x.seed);
  set("rulebench-preview-title", x.preview); set("rulebench-outcome-title", x.outcomeTitle);
  set("rulebench-reveal-summary", x.reveal); set("rulebench-example-title", x.exampleTitle); set("rulebench-example", x.example);
  set("rulebench-error-title", x.errorTitle); set("rulebench-error", x.error); set("rulebench-layers-title", x.layersTitle); set("rulebench-layer-note", x.layerNote);

  const form = document.getElementById("rulebench-form");
  form.replaceChildren(...x.fields.map((field, fieldIndex) => {
    const group = node("fieldset", "rulebench-field");
    const legend = node("legend", null, field);
    group.append(legend);
    const options = node("div", "rulebench-options");
    x.options[fieldIndex].forEach((choice, choiceIndex) => {
      const label = node("label", "rulebench-option");
      const input = document.createElement("input");
      input.type = "radio"; input.name = `rulebench-${fieldIndex}`; input.value = String(choiceIndex); input.checked = state[fieldIndex] === choice.kind;
      input.addEventListener("change", () => { state[fieldIndex] = choice.kind; hasInteracted = true; updateOutcome(); });
      label.append(input, node("span", "rulebench-choice", choice.label));
      options.append(label);
    });
    group.append(options);
    return group;
  }));
  const layers = document.getElementById("rulebench-layers");
  layers.replaceChildren(...x.layers.map(([title, code, desc]) => {
    const card = node("article", "rulebench-layer");
    card.append(node("h4", null, title), node("p", "rulebench-layer-code", code), node("p", null, desc));
    return card;
  }));
  const links = document.getElementById("rulebench-links");
  links.replaceChildren();
  const chapterLink = node("a", null, x.ch6); chapterLink.href = "#c6";
  const skillLink = node("a", null, x.skill); skillLink.href = "#skill";
  links.append(chapterLink, document.createTextNode(" · "), skillLink);
  renderBridge();
  renderRail();
  updateOutcome();
}

function updateOutcome() {
  const x = COPY[lang()];
  const choices = x.options.map((group, index) => group.find((choice) => choice.kind === state[index]));
  document.getElementById("rulebench-rule").textContent = choices.map((choice) => choice.label).join(" ");
  const riskIndex = choices.findIndex((choice) => choice.kind === "risk");
  const mode = riskIndex >= 0 ? "risk" : choices.some((choice) => choice.kind === "vague") ? "vague" : "concrete";
  const status = document.getElementById("rulebench-status");
  status.textContent = x.status[mode];
  document.getElementById("rulebench-outcome").dataset.state = mode;
  const selectionSummary = document.getElementById("rulebench-selection");
  selectionSummary.textContent = hasInteracted
    ? x.selectionPrefix + (lang() === "en" ? " " : "") + choices.map((choice, index) => (lang() === "en" ? "Field " + (index + 1) : "第 " + (index + 1) + " 格") + " " + x.kindNames[choice.kind]).join(lang() === "en" ? "; " : "；")
    : "";
  document.getElementById("rulebench-outcome-text").textContent = mode === "risk" ? x.riskyResults[riskIndex] : mode === "vague" ? x.vagueResult : x.concreteResult;
}

function renderBridge() {
  const c15 = document.getElementById("c15");
  if (!c15) return;
  let bridge = document.getElementById("c15-to-c16");
  if (!bridge) { bridge = node("p", "sub chapter-bridge"); bridge.id = "c15-to-c16"; c15.append(bridge); }
  bridge.textContent = COPY[lang()].bridge;
}

render();
const rail = document.getElementById("rail");
if (rail) new MutationObserver(renderRail).observe(rail, { childList: true });
new MutationObserver(() => { render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
