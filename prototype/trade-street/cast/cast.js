// The people on Trade Street: one card each. Everything that is also in the game (names, roles, lines, styles,
// where they speak, colours, pictures) comes from the same files the game uses, so the two never disagree.
import { CAST, CAST_ORDER, REACT, STATION_SPEAKER, STYLES, STYLE_CHAR } from "../game.js";
import { AVATAR_COLOR, ART, SHORT } from "../layout.js";

// Picture sizes (width x height of the WebP files) so the page does not jump while pictures load.
export const SIZE = {
  guide: [630, 1000], forwarder: [396, 1050], shipper: [447, 1050], factory: [473, 1000],
  trucker: [481, 1050], broker: [507, 1050], dispatcher: [644, 1050], buyer: [421, 1050],
};

// What you see in each picture, written out for people who cannot see it.
export const ALT = {
  guide: { zh: "玉仔：紅髮的年輕女性，穿綠襯衫、背肩包、手抱貼滿標籤的手帳，伸手指路。", en: "Yuzai: a young woman with red hair in a green shirt, with a satchel and a notebook full of tabs, pointing the way." },
  forwarder: { zh: "阿代：戴細框眼鏡的年輕人，穿藏青外套，低頭看手機、手抱三份文件夾。", en: "The Forwarder: a young person with thin glasses in a navy jacket, looking at a phone and carrying three folders." },
  shipper: { zh: "艙長：深棕低髮髻的女性，穿石板灰搭淺藍拼接的制服外套，拿著板夾。", en: "The Shipper: a woman with a low brown bun in a slate uniform jacket with light-blue panels, holding a clipboard." },
  factory: { zh: "老廠：灰髮的年長男性，穿赭橘圍裙、肩上搭毛巾，手掌向下平伸。", en: "The Factory Head: an older man with grey hair in an ochre apron with a towel on his shoulder, one hand held flat." },
  trucker: { zh: "老拖：戴鴨舌帽的男性，穿橄欖色背心，手拿保溫瓶與鑰匙，低頭看手錶。", en: "The Trucker: a man in a cap and an olive vest holding a flask and keys, glancing at his watch." },
  broker: { zh: "單單：短髮的女性，穿芥黃襯衫與橄欖圍裙，一手拿印章、一手拿文件。", en: "The Broker: a woman with short hair in a mustard shirt and an olive apron, holding a stamp and a sheet of paper." },
  dispatcher: { zh: "塔台：捲髮的男性，穿螢光反光背心、戴耳機，一手持對講機指向前方。", en: "The Dispatcher: a man with curly hair in a hi-vis vest and a headset, pointing ahead with a radio." },
  buyer: { zh: "遠方的買家：不露臉的剪影，在磨砂玻璃般的訊息視窗後面，旁邊有時鐘和對話框。", en: "The Buyer: a faceless silhouette behind a frosted message window, with a clock and a speech bubble." },
};

// A line about each person and what they carry (working copy, Paul edits the voice).
export const BIO = {
  guide: {
    zh: { blurb: "第一個遇到你、也帶你走完一趟的人。遇到行話，會停下來翻成白話。", props: "貼滿標籤的手帳、肩包、空白名牌、手腕上的錶" },
    en: { blurb: "The first person you meet, and the one who walks the street with you. When jargon turns up, they stop and put it in plain words.", props: "a notebook full of tabs, a satchel, a blank name badge, a wristwatch" },
  },
  forwarder: {
    zh: { blurb: "整條街的接力棒大多經過這雙手。手上永遠有三張單，但只回你問到的。", props: "三份文件夾、手機、藏青外套、細框眼鏡、掛繩" },
    en: { blurb: "Most of the baton passes through these hands. Always three papers to hand, but only answers what you ask.", props: "three folders, a phone, a navy jacket, thin glasses, a lanyard" },
  },
  shipper: {
    zh: { blurb: "位子有限，所以說話簡短。能多留一點緩衝，就多留一點。", props: "板夾、石板灰的制服外套（沒有任何標誌）、黑色皮革安全鞋" },
    en: { blurb: "Space is limited, so the words are short. Whenever there is room for a little more buffer, keep it.", props: "a clipboard, a slate uniform jacket with no logo, black leather safety shoes" },
  },
  factory: {
    zh: { blurb: "「差不多好了」是口頭禪，通常還差一點。相信人，也承擔後果。", props: "赭橘圍裙、肩上的毛巾、工作手套、棕色工作靴" },
    en: { blurb: "“Nearly done” is the catchphrase, and there is usually a little left. Trusts people, and carries the consequences.", props: "an ochre apron, a towel on the shoulder, work gloves, brown work boots" },
  },
  trucker: {
    zh: { blurb: "時間抓得很準，也最怕卡在路上。整個世界就是一個倒數計時。", props: "鴨舌帽、保溫瓶、鑰匙串、手錶、深灰健行鞋" },
    en: { blurb: "Keeps time precisely, and dreads being stuck on the road. The whole world is one countdown.", props: "a cap, a flask, a bunch of keys, a watch, dark grey hiking shoes" },
  },
  broker: {
    zh: { blurb: "少一個字就退件，所以什麼都再看一次。蓋章前的最後一眼，從不省。", props: "印章與印泥、一疊表單、圍裙口袋裡的文件、深棕皮鞋" },
    en: { blurb: "One missing word and it comes back, so everything gets one more look. The last look before the stamp is never skipped.", props: "a stamp and ink pad, a sheet of forms, papers in the apron pocket, dark brown leather shoes" },
  },
  dispatcher: {
    zh: { blurb: "一櫃一櫃排，不看人情。規矩就是規矩。", props: "反光背心、耳機麥克風、對講機、方格調度板、鋼頭安全靴" },
    en: { blurb: "One container at a time, no favours. The rules are the rules.", props: "a hi-vis vest, a headset, a radio, a gridded dispatch board, steel-toe boots" },
  },
  buyer: {
    zh: { blurb: "只出現在訊息裡的人。時差永遠對不上；單到他手上，貨才提得走。", props: "一個永遠對不上的時鐘、一個還沒寫字的對話框" },
    en: { blurb: "Only ever seen in messages. The time zones never line up, and the goods can only be collected once the documents arrive.", props: "a clock that never matches, an empty speech bubble" },
  },
};

export const UI = {
  zh: {
    htmlLang: "zh-Hant", docTitle: "貿易街的人 — Paul's Tradecraft", langGroup: "語言", skip: "跳至內容",
    eyebrow: "Digital Garage · 教學玩具",
    boundary: "人物與名字都是虛構的（名字是暫名），不代表任何真實的人、公司或機關。教學示意，不含具體天數、費用或比例。",
    title: "貿易街的人",
    intro: "一櫃貨出海，靠整條街的人接力。",
    lede: "認識街上的八個人：貨代、船公司、工廠、拖車、報關行、碼頭調度、買家，還有帶你走一趟的導覽員。",
    play: "走一趟貿易街", home: "回到 Garage", rosterLabel: "八個人",
    role: "身分", props: "隨身", style: "做事風格", saying: "口頭禪", stops: "出沒的站",
    npcStyle: "不在結果裡，但每一趟都會遇到。", guideStops: "全程帶路",
    ctaTitle: "認識了，就走一趟。", ctaText: "沿著港口走十二站，做六個決定，看這櫃貨趕不趕得上船。最後得到一張航程卡：你的做事風格，像街上的哪一位。",
    caveat: "這是一般流程的教學示意：順序與細節會依港口、船公司和貨物調整，兩岸做法與用語也可能不同；時間、費用與文件要求，一律以貨代或船公司通知為準。",
    stop: (n, name) => `${n} ${name}`, nameRole: (c) => `${c.name} · ${c.role}`,
  },
  en: {
    htmlLang: "en", docTitle: "The People of Trade Street — Paul's Tradecraft", langGroup: "Language", skip: "Skip to content",
    eyebrow: "Digital Garage · Teaching toy",
    boundary: "The people and their names are made up (the names are working names) and stand for no real person, company or agency. A teaching sketch with no specific days, costs or percentages.",
    title: "The People of Trade Street",
    intro: "One container ships, and the whole street passes the baton.",
    lede: "Meet the eight people on the street: a forwarder, a shipping line, a factory, a trucker, a customs broker, a terminal dispatcher, a buyer, and the guide who walks it with you.",
    play: "Walk Trade Street", home: "Back to Garage", rosterLabel: "The eight people",
    role: "Role", props: "Carries", style: "Style", saying: "Catchphrase", stops: "Where to find them",
    npcStyle: "Not one of the results, but you meet them on every run.", guideStops: "With you all the way",
    ctaTitle: "Now you know them. Walk the street.", ctaText: "Walk twelve stops along the harbour, make six decisions, and see whether the container makes the ship. You get a voyage card: which person on the street your style looks like.",
    caveat: "A teaching sketch of the general flow: the order and details change with the port, the carrier and the goods, and wording can differ across the strait; always go by your forwarder's or the carrier's notice.",
    stop: (n, name) => `${n} ${name}`, nameRole: (c) => `${c.name} · ${c.role}`,
  },
};

export function stopsOf(id) {
  const out = [];
  STATION_SPEAKER.forEach((speaker, index) => { if (speaker === id) out.push(index); });
  return out;
}

export function styleOf(id) {
  return CAST_ORDER.includes(id) ? Object.keys(STYLE_CHAR).find((style) => STYLE_CHAR[style] === id) || null : null;
}

function boot() {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const state = { lang: params.get("lang") === "en" ? "en" : "zh" };
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  function render() {
    const t = UI[state.lang];
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
    const playHref = `../${state.lang === "en" ? "?lang=en" : ""}`;
    for (const id of ["play-top", "play-bottom"]) { $(id).textContent = t.play; $(id).href = playHref; }
    $("home").textContent = t.home;
    $("home").href = `/${state.lang === "en" ? "?lang=en" : ""}#garage`;
    $("cta-title").textContent = t.ctaTitle;
    $("cta-text").textContent = t.ctaText;
    $("caveat").textContent = t.caveat;
    $("roster-nav").setAttribute("aria-label", t.rosterLabel);

    const roster = $("roster");
    roster.replaceChildren();
    const grid = $("grid");
    grid.replaceChildren();
    CAST_ORDER.forEach((id) => {
      const person = CAST[id][state.lang];
      const chip = el("li");
      const link = el("a", null, person.name);
      link.href = `#${id}`;
      chip.appendChild(link);
      roster.appendChild(chip);

      const card = el("li");
      const article = el("article", "person");
      article.id = id;
      article.style.setProperty("--accent", AVATAR_COLOR[id]);
      article.setAttribute("aria-labelledby", `${id}-name`);
      const figure = el("div", "figure");
      const img = document.createElement("img");
      img.src = `../${ART.portrait[id]}`;
      img.alt = ALT[id][state.lang];
      img.width = SIZE[id][0];
      img.height = SIZE[id][1];
      img.decoding = "async";
      if (CAST_ORDER.indexOf(id) > 1) img.loading = "lazy";
      figure.appendChild(img);

      const info = el("div", "info");
      info.appendChild(el("p", "role", person.role));
      const h2 = el("h2");
      h2.id = `${id}-name`;
      const anchor = el("a", null, person.name);
      anchor.href = `#${id}`;
      h2.appendChild(anchor);
      info.appendChild(h2);
      info.appendChild(el("p", "blurb", BIO[id][state.lang].blurb));

      const dl = el("dl");
      const row = (label, text, cls) => { dl.appendChild(el("dt", null, label)); dl.appendChild(el("dd", cls || null, text)); };
      row(t.props, BIO[id][state.lang].props);
      const style = styleOf(id);
      if (style) {
        row(t.style, `${STYLES[style][state.lang].name}：${STYLES[style][state.lang].line}`);
        row(t.saying, `「${REACT[style][state.lang].free}」`, "say");
      } else {
        row(t.style, t.npcStyle);
        row(t.saying, `「${person.line}」`, "say");
      }
      const stops = stopsOf(id);
      // the guide speaks at one stop but walks the whole street with you
      row(t.stops, id === "guide" || !stops.length ? t.guideStops : stops.map((i) => t.stop(i + 1, SHORT[state.lang][i])).join(" · "));
      info.appendChild(dl);

      article.append(figure, info);
      card.appendChild(article);
      grid.appendChild(card);
    });
  }

  document.querySelectorAll("#lang-group button").forEach((button) => button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    const next = new URL(location.href);
    if (state.lang === "en") next.searchParams.set("lang", "en"); else next.searchParams.delete("lang");
    history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
    render();
  }));

  render();
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView({ block: "start" });
  }
}

if (typeof document !== "undefined") boot();
