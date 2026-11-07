// Trade Street, appendix A: the trade-terms card (Incoterms® 2020, five rules, EXW -> DDP).
// A rule summary for teaching. It states no days, money or percentages, and names no real company, port or person.
// Everything the card shows (who carries which leg, where the risk passes, the live summary read out to screen readers)
// comes from the one TERMS table below, so the picture and the words cannot disagree.
import { SHORT } from "../layout.js";

// The journey is cut into six legs. "s" = the seller carries it, "b" = the buyer carries it.
export const LEGS = ["prep", "load", "export", "main", "import", "last"];
export const TERM_ORDER = ["exw", "fca", "fob", "cif", "ddp"];

// risk = where the risk passes, counted in legs from the left (0..6). FCA sits at the hand-over to the carrier;
// FOB and CIF sit a little later, when the goods are on board. The gap between them is the container gap on the page.
export const TERMS = {
  exw: {
    code: "EXW", legs: "sbbbbb", risk: 1, insurance: false, sea: false,
    zh: {
      name: "工廠交貨",
      mode: "所有運輸方式",
      riskAt: "賣方工廠，貨還沒裝車時",
      one: "賣方把貨備好放在工廠就好；裝車、出口報關和全程運輸，都是買方的事。",
      best: "買方有自己的貨代，或要從幾個工廠集貨併櫃。",
      watch: "買方得自己辦出口報關。若希望由賣方辦出口報關，ICC 的說明建議改用 FCA。",
    },
    en: {
      name: "Ex Works",
      mode: "Any mode of transport",
      riskAt: "at the seller's premises, before loading",
      one: "The seller only has the goods ready at the factory. Loading, export clearance and all the transport belong to the buyer.",
      best: "The buyer has its own forwarder, or is collecting from several factories into one container.",
      watch: "The buyer has to clear the goods for export. If the seller should do that, ICC's guidance points to FCA instead.",
    },
  },
  fca: {
    code: "FCA", legs: "sssbbb", risk: 3, insurance: false, sea: false,
    zh: {
      name: "貨交承運人",
      mode: "所有運輸方式",
      riskAt: "貨交給買方指定的承運人時",
      one: "賣方辦出口報關，並在約定地點把貨交給買方指定的承運人；之後的主運費與風險歸買方。",
      best: "貨櫃、空運或複合運輸，而且買方指定貨代。",
      watch: "約定地點在賣方工廠時，賣方負責把貨裝上承運人的車；在貨櫃場等其他地點，賣方不負責卸貨。2020 版新增一個選項：買方可指示承運人在裝船後簽發「已裝船」提單給賣方，方便信用狀交易，但承運人不一定照辦。",
    },
    en: {
      name: "Free Carrier",
      mode: "Any mode of transport",
      riskAt: "when the goods are handed to the buyer's carrier",
      one: "The seller clears the goods for export and hands them to the buyer's carrier at the agreed place; the main freight and the risk are the buyer's from there.",
      best: "Container, air or multimodal transport, with a forwarder named by the buyer.",
      watch: "If the agreed place is the seller's premises, the seller loads the goods onto the carrier's vehicle; at a container yard or elsewhere, the seller does not unload. The 2020 edition adds an option: the buyer can instruct its carrier to issue an on-board bill of lading to the seller after loading, which helps letter-of-credit deals. The carrier may not agree, so it is not a guaranteed fix.",
    },
  },
  fob: {
    code: "FOB", legs: "sssbbb", risk: 3.5, insurance: false, sea: true,
    zh: {
      name: "船上交貨",
      mode: "僅限海運與內河",
      riskAt: "貨在出口港裝上船時",
      one: "賣方辦出口報關，並把貨裝上買方指定的船；裝船之後的海運、保險與進口手續，都歸買方。",
      best: "整船散裝海運，買方想自己掌握海運費與船期。",
      watch: "貨櫃常在開船前就先交給貨櫃場，這段期間的責任歸屬模糊。ICC 與業界都建議：貨櫃運輸改用 FCA。",
    },
    en: {
      name: "Free on Board",
      mode: "Sea and inland waterway only",
      riskAt: "when the goods are on board at the port of export",
      one: "The seller clears the goods for export and loads them on the vessel the buyer names; sea freight, insurance and import formalities are the buyer's from there.",
      best: "Bulk sea freight, where the buyer wants to control the freight and the sailing.",
      watch: "Containers are often handed to the terminal well before sailing, which leaves a grey area of responsibility. ICC and industry guidance both say: for containers, use FCA.",
    },
  },
  cif: {
    code: "CIF", legs: "ssssbb", risk: 3.5, insurance: true, sea: true,
    zh: {
      name: "成本、保險費加運費",
      mode: "僅限海運與內河",
      riskAt: "貨在出口港裝上船時",
      one: "賣方付到目的港的運費，並替買方買最低險別的運輸保險；但貨一裝上船，風險就轉給買方。",
      best: "買方想省事，由賣方包辦海運與保險（海運）。",
      watch: "費用與風險分家：路上出事，買方憑保單向保險公司索賠。最低險別是 ICC (C)，保障範圍較窄。貨櫃請改用 CIP（最低險別是 (A)）。",
    },
    en: {
      name: "Cost, Insurance and Freight",
      mode: "Sea and inland waterway only",
      riskAt: "when the goods are on board at the port of export",
      one: "The seller pays the freight to the destination port and buys minimum transport insurance for the buyer; but once the goods are on board, the risk is the buyer's.",
      best: "The buyer wants it simple, with the seller arranging sea freight and insurance (sea only).",
      watch: "Cost and risk come apart: if something happens on the way, the buyer claims from the insurer under the policy. The minimum cover is ICC (C), which is fairly narrow. For containers, use CIP (minimum cover (A)).",
    },
  },
  ddp: {
    code: "DDP", legs: "ssssss", risk: 6, insurance: false, sea: false,
    zh: {
      name: "完稅後交貨",
      mode: "所有運輸方式",
      riskAt: "貨送到指定地點、可以卸貨時",
      one: "賣方一路包到買方指定的地點，含目的國的進口清關與稅費；買方只需要收貨。",
      best: "買方完全不想碰運輸與清關。",
      watch: "賣方報價最高，也必須有能力在目的國辦理清關與稅務，否則可能面對滯港費與罰款。賣方送到的是「可以卸貨的狀態」，卸貨由買方負責。",
    },
    en: {
      name: "Delivered Duty Paid",
      mode: "Any mode of transport",
      riskAt: "when the goods arrive at the named place, ready for unloading",
      one: "The seller carries everything to the place the buyer names, including import clearance and duties and taxes in the destination country; the buyer only receives.",
      best: "The buyer wants nothing to do with transport or customs.",
      watch: "It is the highest quote from the seller, who also needs the ability to clear customs and handle tax in the destination country, or faces demurrage and penalties. The goods arrive ready for unloading; unloading is the buyer's job.",
    },
  },
};

// One line each for "how do I choose", in the order a newcomer meets the situations.
export const CHOOSE = [
  { term: "fca", zh: { when: "貨櫃或空運，買方有指定貨代", note: "風險劃分最貼近貨櫃的實際流程" }, en: { when: "Container or air freight, and the buyer has its own forwarder", note: "The risk split that fits how containers actually move" } },
  { term: "fob", zh: { when: "整船散裝海運，買方想自己掌握海運費與船期", note: "傳統的大宗海運切法" }, en: { when: "Bulk sea freight, and the buyer wants to control freight and sailing", note: "The classic split for bulk sea freight" } },
  { term: "cif", zh: { when: "買方想省事，由賣方包辦海運與保險（海運）", note: "貨櫃請改用 CIP" }, en: { when: "The buyer wants it simple, with the seller arranging sea freight and insurance (sea)", note: "For containers, use CIP" } },
  { term: "exw", zh: { when: "賣方只想在工廠交貨，不辦出口報關", note: "先確認買方辦得了出口報關" }, en: { when: "The seller only wants to hand over at the factory, with no export clearance", note: "First confirm the buyer can clear export" } },
  { term: "ddp", zh: { when: "買方完全不想碰運輸與清關", note: "賣方須有目的國的清關能力" }, en: { when: "The buyer wants nothing to do with transport or customs", note: "The seller needs destination-country clearance ability" } },
];

// Positions in the fourteen stops of the game (0-based): the container comes to the port, is cleared and inspected, then boards.
export const GAP_STOPS = [6, 7, 8, 9];

// Small line icons, one per leg. Decorative, so they are hidden from screen readers.
const ICON = {
  prep: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  load: '<path d="M2 6h11v9H2zM13 9h4l4 3v3h-8z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  export: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13l2 2 4-4"/>',
  main: '<path d="M3 16l2 4h14l2-4z"/><path d="M6 16v-5h12v5M12 11V4h4"/>',
  import: '<path d="M3 10l9-6 9 6M5 10v9M9.5 10v9M14.5 10v9M19 10v9M3 21h18"/>',
  last: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
};

export const UI = {
  zh: {
    htmlLang: "zh-Hant", docTitle: "附錄：貿易條件速查卡 — Paul's Tradecraft", langGroup: "語言", skip: "跳至內容",
    eyebrow: "作品館 · 教學玩具 · 附錄",
    boundary: "教學示意 · 規則整理，不是法律或個案建議；不含具體天數、費用或比例，細節以國際商會（ICC）Incoterms® 2020 官方文本為準。",
    kicker: "附錄 A", title: "貿易條件速查卡",
    intro: "報價單上那三個字母，決定這一櫃貨誰扛哪一段。",
    lede: "選一個條件，看整段旅程怎麼分：深色是賣方扛、淺色是買方扛，紅點是風險換手的地方。",
    play: "走一趟貿易街",
    cardTag: "INCOTERMS® 2020 · 責任光譜", cardTitle: "選一個條件，看誰扛哪一段",
    specLeft: "賣方扛得少", specRight: "賣方扛得多",
    legend: { s: "賣方負責", b: "買方負責", r: "風險轉移點" },
    who: { s: "賣方", b: "買方" },
    legs: ["備貨與包裝", "裝上運輸工具", "出口報關", "國際主運輸", "進口清關與稅費", "送到指定地點"],
    riskShort: "風險轉移", riskChip: "風險轉移點", modeChip: "適用", insChip: "強制投保",
    insSeller: "賣方（最低險別 ICC (C)）", insNone: "條款沒有要求",
    factBest: "最適合", factWatch: "要小心",
    liveFor: (code, name, sellers, buyers, riskAt) => `${code} ${name}。賣方負責：${sellers}。買方負責：${buyers}。風險在${riskAt}轉移。`,
    sellerNone: "沒有", buyerNone: "沒有",
    howTitle: "怎麼選：一句話版本", howLede: "點一個情境，上面的卡片就會切到對應的條件。",
    streetTitle: "在貿易街裡看這條線",
    streetP1: "貿易街的第 1 站「詢價」，就要先講清楚「報價條件（運費誰付）」。那一句話，其實就是在選貿易條件。",
    streetP2: "在貿易街的順序裡，貨櫃先進港，再報關、查驗，之後才裝上船。FCA（約定在貨櫃場交貨）在「進港」就把風險交給買方；FOB 要到「裝船」才交，中間的「報關」「查驗」，賣方都還在扛風險。這段落差，就是貨櫃運輸建議用 FCA 的原因。",
    stop: (n, name) => `第 ${n} 站 ${name}`, flagFca: "FCA 風險在這裡", flagFob: "FOB 風險在這裡", gapSpan: "FOB：這一段風險還在賣方身上",
    ribbonTitle: "貨櫃運輸，記得換條件",
    ribbonP: "FOB 與 CIF 只適用海運與內河；貨櫃先交給港口，再裝上船，風險就會出現空窗。ICC 與業界的建議：用 FCA 取代 FOB，用 CIP 取代 CIF。",
    sourcesTitle: "資料來源",
    sources: [
      { text: "ICC Academy：Incoterms® 2020: FCA or FOB?", href: "https://icc.academy/incoterms-2020-fca-or-fob" },
      { text: "條款原文與細節，請以國際商會（ICC）出版的 Incoterms® 2020 為準。" },
    ],
    ctaTitle: "再走一趟貿易街", ctaText: "在街上做決定的時候，回頭看看這張卡：每一站，其實都有一個人在替某一方扛責任。",
    castLink: "認識街上的人", home: "回到作品館",
    caveat: "這一頁是規則整理與教學示意，不是法律或個案建議。Incoterms® 是國際商會的商標；這些條件要寫進合約才有效，並且要註明交貨地點。",
  },
  en: {
    htmlLang: "en", docTitle: "Appendix: the trade-terms card — Paul's Tradecraft", langGroup: "Language", skip: "Skip to content",
    eyebrow: "Showcase · Teaching toy · Appendix",
    boundary: "Teaching sketch · a summary of the rules, not legal or case advice; no specific days, costs or percentages; for exact wording go to the official ICC Incoterms® 2020 text.",
    kicker: "Appendix A", title: "The trade-terms card",
    intro: "Three letters on a quote decide who carries which part of the journey.",
    lede: "Pick a term and watch the journey split: dark is the seller's, light is the buyer's, and the red dot is where the risk changes hands.",
    play: "Walk Trade Street",
    cardTag: "INCOTERMS® 2020 · THE RESPONSIBILITY SPECTRUM", cardTitle: "Pick a term, see who carries what",
    specLeft: "Seller carries less", specRight: "Seller carries more",
    legend: { s: "Seller carries", b: "Buyer carries", r: "Risk passes" },
    who: { s: "Seller", b: "Buyer" },
    legs: ["Prepare the goods", "Load", "Export clearance", "Main carriage", "Import clearance and duties", "Final delivery"],
    riskShort: "Risk passes", riskChip: "Risk passes", modeChip: "For", insChip: "Insurance required",
    insSeller: "the seller (minimum cover ICC (C))", insNone: "not required by the term",
    factBest: "BEST FOR", factWatch: "WATCH OUT",
    liveFor: (code, name, sellers, buyers, riskAt) => `${code} ${name}. The seller carries: ${sellers}. The buyer carries: ${buyers}. The risk passes ${riskAt}.`,
    sellerNone: "nothing", buyerNone: "nothing",
    howTitle: "How to choose: the short version", howLede: "Tap a situation and the card above switches to the matching term.",
    streetTitle: "See the line on Trade Street",
    streetP1: "At stop 1, the quote, you already have to say the quote terms: who pays the freight. That one sentence is choosing a trade term.",
    streetP2: "In Trade Street's order, the container comes to the port, is cleared and inspected, and only then boards. FCA (agreed at the container yard) hands the risk to the buyer at \"To port\"; FOB waits until \"On board\", so during \"Customs\" and \"Inspection\" the seller still carries the risk. That gap is why guidance says to use FCA for containers.",
    stop: (n, name) => `Stop ${n} ${name}`, flagFca: "FCA: risk passes here", flagFob: "FOB: risk passes here", gapSpan: "FOB: the risk is still the seller's across this stretch",
    ribbonTitle: "For containers, change the term",
    ribbonP: "FOB and CIF are for sea and inland waterway only; with a container handed to the port first and loaded later, the risk has a gap. ICC and industry guidance: use FCA instead of FOB, and CIP instead of CIF.",
    sourcesTitle: "SOURCES",
    sources: [
      { text: "ICC Academy: Incoterms® 2020: FCA or FOB?", href: "https://icc.academy/incoterms-2020-fca-or-fob" },
      { text: "For exact wording, refer to the official Incoterms® 2020 text published by the International Chamber of Commerce (ICC)." },
    ],
    ctaTitle: "Walk the street again", ctaText: "When you make a decision on the street, glance back at this card: at every stop, someone is carrying the responsibility for one side.",
    castLink: "Meet the people on the street", home: "Back to Showcase",
    caveat: "This page is a rule summary and a teaching sketch, not legal or case advice. Incoterms® is a trademark of the International Chamber of Commerce; the terms only apply when written into the contract, with a named place of delivery.",
  },
};

// The sentence read out when the choice changes (also the alt-style summary of the picture).
export function summaryOf(id, lang) {
  const term = TERMS[id];
  const t = UI[lang];
  const names = (who) => LEGS.filter((_, i) => term.legs[i] === who).map((leg) => t.legs[LEGS.indexOf(leg)]);
  const join = (list, none) => (list.length ? list.join(lang === "zh" ? "、" : ", ") : none);
  return t.liveFor(term.code, term[lang].name, join(names("s"), t.sellerNone), join(names("b"), t.buyerNone), term[lang].riskAt);
}

// ---- page -----------------------------------------------------------------------------------------------------
if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const svg = (leg) => {
    const wrap = el("span");
    wrap.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[leg]}</svg>`;
    return wrap.firstChild;
  };

  const params = new URLSearchParams(location.search);
  const fromHash = () => {
    const id = location.hash.slice(1).toLowerCase();
    return TERM_ORDER.includes(id) ? id : null;
  };
  const state = { lang: params.get("lang") === "en" ? "en" : "zh", term: fromHash() || "fca" };

  function buildStatic() {
    const t = UI[state.lang];
    document.documentElement.lang = t.htmlLang;
    document.title = t.docTitle;
    $("skip").textContent = t.skip;
    $("lang-group").setAttribute("aria-label", t.langGroup);
    document.querySelectorAll("#lang-group button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
    const q = state.lang === "en" ? "?lang=en" : "";
    $("eyebrow").textContent = t.eyebrow;
    $("boundary").textContent = t.boundary;
    $("kicker").textContent = t.kicker;
    $("title").textContent = t.title;
    $("intro").textContent = t.intro;
    $("lede").textContent = t.lede;
    for (const id of ["play-top", "play-bottom"]) { $(id).textContent = t.play; $(id).href = `../${q}`; }
    $("cast-link").textContent = t.castLink;
    $("cast-link").href = `../cast/${q}`;
    $("home").textContent = t.home;
    $("home").href = `/${q}#showcase`;
    $("card-tag").textContent = t.cardTag;
    $("card-title").textContent = t.cardTitle;
    $("spec-left").textContent = t.specLeft;
    $("spec-right").textContent = t.specRight;

    // the five terms
    const pick = $("pick");
    pick.replaceChildren();
    TERM_ORDER.forEach((id) => {
      const button = el("button");
      button.type = "button";
      button.setAttribute("role", "radio");
      button.dataset.term = id;
      button.append(el("b", "", TERMS[id].code), el("span", "", TERMS[id][state.lang].name));
      button.addEventListener("click", () => choose(id, { focus: false }));
      button.addEventListener("keydown", (event) => {
        const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (!(event.key in keys)) return;
        event.preventDefault();
        const next = TERM_ORDER[(TERM_ORDER.indexOf(state.term) + keys[event.key] + TERM_ORDER.length) % TERM_ORDER.length];
        choose(next, { focus: true });
      });
      pick.appendChild(button);
    });

    // legend
    const legend = $("legend");
    legend.replaceChildren();
    for (const [key, cls] of [["s", "s"], ["b", "b"], ["r", "r"]]) {
      const li = el("li");
      li.append(el("span", `sw ${cls}`), el("span", "", t.legend[key]));
      legend.appendChild(li);
    }

    // the six legs and the red pin
    const strip = $("strip");
    strip.replaceChildren();
    LEGS.forEach((leg, i) => {
      const li = el("li", "leg");
      li.dataset.leg = leg;
      li.append(svg(leg), el("span", "lab", t.legs[i]), el("span", "who"));
      strip.appendChild(li);
    });
    const risk = el("li", "risk");
    risk.id = "risk";
    risk.setAttribute("aria-hidden", "true");
    risk.appendChild(el("span", "risk-label", t.riskShort));
    strip.appendChild(risk);

    // choose-by-situation list
    $("how-title").textContent = t.howTitle;
    $("how-lede").textContent = t.howLede;
    const how = $("how");
    how.replaceChildren();
    CHOOSE.forEach((row) => {
      const li = el("li");
      const button = el("button");
      button.type = "button";
      button.append(el("span", "when", row[state.lang].when), el("span", "go", TERMS[row.term].code), el("span", "note", row[state.lang].note));
      button.addEventListener("click", () => {
        choose(row.term, { focus: true });
        $("card").scrollIntoView({ block: "start" });
      });
      li.appendChild(button);
      how.appendChild(li);
    });

    // the line on the street
    $("street-title").textContent = t.streetTitle;
    $("street-p1").textContent = t.streetP1;
    $("street-p2").textContent = t.streetP2;
    const gap = $("gap");
    gap.replaceChildren();
    gap.append(el("span", "flag f1", t.flagFca), el("span", "flag f2", t.flagFob));
    const ol = el("ol");
    GAP_STOPS.forEach((index) => {
      const li = el("li");
      li.append(el("small", "", state.lang === "zh" ? `第 ${index + 1} 站` : `Stop ${index + 1}`), el("b", "", SHORT[state.lang][index]));
      ol.appendChild(li);
    });
    gap.append(ol, el("span", "span", t.gapSpan));

    $("ribbon-title").textContent = t.ribbonTitle;
    $("ribbon-p").textContent = t.ribbonP;
    $("sources-title").textContent = t.sourcesTitle;
    const sources = $("sources");
    sources.replaceChildren();
    t.sources.forEach((source) => {
      const li = el("li");
      if (source.href) {
        const a = el("a", "", source.text);
        a.href = source.href;
        a.rel = "noopener";
        li.appendChild(a);
      } else li.textContent = source.text;
      sources.appendChild(li);
    });
    $("cta-title").textContent = t.ctaTitle;
    $("cta-text").textContent = t.ctaText;
    $("caveat").textContent = t.caveat;
  }

  function paintSelection() {
    const t = UI[state.lang];
    const term = TERMS[state.term];
    const copy = term[state.lang];
    document.querySelectorAll("#pick button").forEach((button) => {
      const on = button.dataset.term === state.term;
      button.setAttribute("aria-checked", String(on));
      button.tabIndex = on ? 0 : -1;
    });
    $("term-code").textContent = term.code;
    $("term-name").textContent = copy.name;
    $("term-en").textContent = state.lang === "zh" ? TERMS[state.term].en.name : "";
    $("one-line").textContent = copy.one;

    document.querySelectorAll("#strip .leg").forEach((li, i) => {
      const who = term.legs[i];
      li.classList.toggle("s", who === "s");
      li.classList.toggle("b", who === "b");
      li.querySelector(".who").textContent = t.who[who];
    });
    const risk = document.querySelector("#strip .risk");
    risk.style.setProperty("--x", String(term.risk));
    risk.classList.toggle("edge-r", term.risk >= 5.5);

    const chips = $("chips");
    chips.replaceChildren();
    const chip = (label, value, extra) => {
      const li = el("li", `chip${extra ? ` ${extra}` : ""}`);
      li.append(el("small", "", label), el("span", "", value));
      chips.appendChild(li);
    };
    chip(t.modeChip, copy.mode);
    chip(t.insChip, term.insurance ? t.insSeller : t.insNone);
    chip(t.riskChip, copy.riskAt, "risk-chip");

    const facts = $("facts");
    facts.replaceChildren();
    for (const [label, text, cls] of [[t.factBest, copy.best, ""], [t.factWatch, copy.watch, "watch wide"]]) {
      const box = el("div", `fact ${cls}`.trim());
      box.append(el("h3", "", label), el("p", "", text));
      facts.appendChild(box);
    }
    $("live").textContent = summaryOf(state.term, state.lang);
  }

  function choose(id, { focus }) {
    state.term = id;
    paintSelection();
    const next = new URL(location.href);
    next.hash = id;
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    if (focus) document.querySelector(`#pick button[data-term="${id}"]`).focus();
  }

  document.querySelectorAll("#lang-group button").forEach((button) => button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    const next = new URL(location.href);
    if (state.lang === "en") next.searchParams.set("lang", "en"); else next.searchParams.delete("lang");
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    buildStatic();
    paintSelection();
  }));
  window.addEventListener("hashchange", () => {
    const id = fromHash();
    if (id) { state.term = id; paintSelection(); }
  });

  buildStatic();
  paintSelection();
}
