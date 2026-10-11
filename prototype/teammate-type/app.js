// 你是哪一種隊友？ / What kind of teammate are you?
// Self-contained Garage toy. No network calls, no storage. The share link's `c`
// param is the three choice letters; `lang` only picks the language.
//
// Choice → type (draft text kept; Paul approved the lines):
//   Scenario 1 專案死線前一晚 / The night before the deadline
//     A umbrella 擋雨的人    B cocoa 晚安熱可可
//     C spark 腦內煙火師     D mapkeeper 地圖收藏家
//   Scenario 2 社團成果展佈置 / Setting up the club showcase
//     A umbrella             B finisher 最後一擊
//     C soundtrack BGM 擔當  D mapkeeper
//   Scenario 3 線上組隊打王倒數 / Countdown to the boss fight
//     A cocoa                B spark
//     C finisher             D soundtrack
//
// Resolve (deterministic):
//   1. A type chosen at least twice wins.
//   2. Three different types: the winning scenario is (i + j + k) mod 3,
//      where A=0, B=1, C=2, D=3 are the choice indexes.
//      This replaces the draft's "always scenario 1" tie-break, which scored
//      14 / 14 / 14 / 14 / 4 / 4. Across all 64 combinations this rule scores
//      umbrella 10, cocoa 11, spark 11, mapkeeper 10, finisher 11, soundtrack 11.
//
// Worked examples:
//   AAA majority → umbrella
//   BBC majority → finisher
//   CCD majority → soundtrack
//   ABA tie (0+1+0) mod 3 = 1 → finisher
//   BBD tie (1+1+3) mod 3 = 2 → soundtrack
//   DAA tie (3+0+0) mod 3 = 0 → mapkeeper
//   ACB tie (0+2+1) mod 3 = 0 → umbrella
//   BBB tie (1+1+1) mod 3 = 0 → cocoa

export const ASSET = "/mg-mini-demo/assets/";

export const POSES = {
  think: {
    motion: "float",
    ms: 280,
    frames: ["waiting/00.webp", "waiting/01.webp", "waiting/02.webp", "waiting/03.webp", "waiting/04.webp", "waiting/05.webp"],
  },
  heart: {
    motion: "float",
    ms: 260,
    frames: ["heart/00.webp", "heart/01.webp", "heart/02.webp", "heart/03.webp"],
  },
  jump: {
    motion: "squash",
    ms: 140,
    frames: ["jumping/00.webp", "jumping/01.webp", "jumping/02.webp", "jumping/03.webp", "jumping/04.webp"],
  },
  dance: {
    motion: "bob",
    ms: 110,
    frames: [
      "running-left/00.webp",
      "running-right/01.webp",
      "running-left/02.webp",
      "running-right/03.webp",
      "running-left/04.webp",
      "running-right/05.webp",
    ],
  },
};

export const TYPES = {
  umbrella: {
    pose: "think",
    prop: "umbrella",
    zh: {
      name: "擋雨的人",
      role: "坦克",
      funny: "大家在崩潰的時候，你已經默默把雷都踩完了。",
      gentle: "有你在前面，大家才敢往前走。",
      literary: "「我不說累，只是把雨收進傘裡。」",
      strength: "扛得住壓力，讓人安心。",
      alt: "MG 站在前面，旁邊有一把傘",
    },
    en: {
      name: "The Umbrella",
      role: "Tank",
      funny: "Everyone else is panicking; you've already quietly stepped on every landmine.",
      gentle: "With you up front, everyone dares to move forward.",
      literary: "\"I don't say I'm tired. I just fold the rain into my umbrella.\"",
      strength: "Takes the pressure so others feel safe.",
      alt: "MG standing up front, with an umbrella",
    },
  },
  cocoa: {
    pose: "heart",
    prop: "drink",
    zh: {
      name: "晚安熱可可",
      role: "守護者",
      funny: "隊上唯一記得大家還沒吃飯的人。",
      gentle: "因為有你，大家才撐得到最後。",
      literary: "「把每個人的疲倦，泡成一杯溫的。」",
      strength: "看得見別人的狀態，懂得照顧。",
      alt: "MG 頭上有愛心，捧著一杯熱飲",
    },
    en: {
      name: "The Cocoa",
      role: "Guardian",
      funny: "The only one on the team who remembers nobody has eaten yet.",
      gentle: "Because of you, the team makes it to the end.",
      literary: "\"I brew everyone's tiredness into something warm.\"",
      strength: "Notices how people are doing, and looks after them.",
      alt: "MG with a heart overhead, holding a warm drink",
    },
  },
  finisher: {
    pose: "jump",
    prop: null,
    zh: {
      name: "最後一擊",
      role: "刺客／輸出",
      funny: "前面看起來都在滑手機，最後一刻一刀收工。",
      gentle: "關鍵時刻交給你，大家很放心。",
      literary: "「我不急，我在等那個剛剛好的時刻。」",
      strength: "爆發力強，會收尾。",
      alt: "MG 跳起來",
    },
    en: {
      name: "The Finisher",
      role: "Assassin / damage",
      funny: "Looks like you're scrolling the whole time, then you finish it in one clean strike.",
      gentle: "When it counts, everyone is happy to hand it to you.",
      literary: "\"I'm not in a hurry. I'm waiting for the moment that's just right.\"",
      strength: "Strong in the clutch, and actually finishes things.",
      alt: "MG jumping",
    },
  },
  spark: {
    pose: "think",
    prop: "spark",
    zh: {
      name: "腦內煙火師",
      role: "法師",
      funny: "你的點子一半是天才，另一半天才到大家聽不懂。",
      gentle: "你讓大家看見另一條路。",
      literary: "「別人看到牆，我看到一扇還沒畫上的窗。」",
      strength: "換個角度想，點子多。",
      alt: "MG 托著下巴想事情，旁邊有小煙火",
    },
    en: {
      name: "The Spark",
      role: "Mage",
      funny: "Half your ideas are genius; the other half are so genius nobody understands them.",
      gentle: "You show everyone there's another way.",
      literary: "\"Others see a wall. I see a window nobody has drawn yet.\"",
      strength: "Sees things from a new angle, full of ideas.",
      alt: "MG thinking, with a little firework",
    },
  },
  mapkeeper: {
    pose: "think",
    prop: "map",
    zh: {
      name: "地圖收藏家",
      role: "斥候",
      funny: "還沒開工，你已經知道插座在哪、誰會遲到。",
      gentle: "有你先看路，大家少繞很多冤枉路。",
      literary: "「我喜歡在出發前，先把風景讀一遍。」",
      strength: "觀察仔細，先把事情理清楚。",
      alt: "MG 看著一張攤開的小地圖",
    },
    en: {
      name: "The Mapkeeper",
      role: "Scout",
      funny: "Before anything starts, you already know where the sockets are and who'll be late.",
      gentle: "Because you scout ahead, nobody has to take the long way round.",
      literary: "\"I like to read the scenery once before I set off.\"",
      strength: "Observant; sorts things out before they get messy.",
      alt: "MG looking over a small unfolded map",
    },
  },
  soundtrack: {
    pose: "dance",
    prop: "headphones",
    zh: {
      name: "BGM 擔當",
      role: "吟遊詩人",
      funny: "進度不一定有，但氣氛一定有。",
      gentle: "你讓辛苦的事變得好過一點。",
      literary: "「每一段努力，都值得一首配樂。」",
      strength: "帶氣氛，讓大家凝聚在一起。",
      alt: "MG 戴著耳機跳舞",
    },
    en: {
      name: "The Soundtrack",
      role: "Bard",
      funny: "Progress? Maybe. Vibes? Always.",
      gentle: "You make the hard parts a little easier.",
      literary: "\"Every bit of effort deserves its own soundtrack.\"",
      strength: "Lifts the mood and pulls people together.",
      alt: "MG dancing with headphones",
    },
  },
};

export const SCENARIOS = [
  {
    id: "deadline",
    zh: {
      setting: "職場",
      title: "專案死線前一晚",
      prompt: "你們的簡報明天早上要交，現在是深夜，大家都還在線上。你會……",
    },
    en: {
      setting: "At work",
      title: "The night before the deadline",
      prompt: "The presentation is due tomorrow morning. It is late, and everyone is still online. You…",
    },
    choices: [
      { id: "A", type: "umbrella", zh: "把最難、沒人想碰的那一段直接扛下來。", en: "Take the hardest part nobody wants." },
      { id: "B", type: "cocoa", zh: "幫大家叫宵夜，順便提醒誰該去睡一下。", en: "Order late-night food and tell someone to get some sleep." },
      { id: "C", type: "spark", zh: "「等等，我們整個換個做法會不會比較快？」", en: "\"Wait, what if we just did this a totally different way?\"" },
      { id: "D", type: "mapkeeper", zh: "先把每個人的進度整理成一張表，看還缺什麼。", en: "Put everyone's progress into one list to see what's missing." },
    ],
  },
  {
    id: "showcase",
    zh: {
      setting: "社團",
      title: "社團成果展佈置",
      prompt: "明天就要開展，場地還是一片空。你會……",
    },
    en: {
      setting: "A club",
      title: "Setting up the club showcase",
      prompt: "The showcase opens tomorrow, and the room is still empty. You…",
    },
    choices: [
      { id: "A", type: "umbrella", zh: "搬最重的展板，爬最高的梯子。", en: "Carry the heaviest boards and climb the tallest ladder." },
      { id: "B", type: "finisher", zh: "一個人把最麻煩的燈光和線路快速搞定。", en: "Sort out the trickiest lights and cables, fast, on your own." },
      { id: "C", type: "soundtrack", zh: "先放音樂，邊佈置邊帶氣氛。", en: "Put on music first and keep the mood up while setting up." },
      { id: "D", type: "mapkeeper", zh: "先繞場一圈，找出插座、動線和可能出包的地方。", en: "Walk the room first: sockets, foot traffic, what could go wrong." },
    ],
  },
  {
    id: "party",
    zh: {
      setting: "遊戲組隊",
      title: "線上組隊打王倒數",
      prompt: "王要出來了，隊伍在語音裡等。你會……",
    },
    en: {
      setting: "In a party",
      title: "Countdown to the boss fight",
      prompt: "The boss is about to show up, and the party is waiting on voice. You…",
    },
    choices: [
      { id: "A", type: "cocoa", zh: "確認每個人的補給夠不夠。", en: "Check everyone has enough supplies." },
      { id: "B", type: "spark", zh: "提出一個很怪但可能有用的打法。", en: "Pitch a weird plan that just might work." },
      { id: "C", type: "finisher", zh: "「最後一擊交給我。」", en: "\"Leave the last hit to me.\"" },
      { id: "D", type: "soundtrack", zh: "在語音裡喊口號、講幹話，讓大家不要緊張。", en: "Shout a battle cry and crack jokes so nobody's nervous." },
    ],
  },
];

export const UI = {
  zh: {
    htmlLang: "zh-Hant",
    title: "你是哪一種隊友？",
    description: "三個小情境，看你怎麼做，就知道你是哪一種隊友。示意玩具，不是心理測驗。同樣的選擇，永遠得到同一張卡。",
    skip: "跳至內容",
    eyebrow: "Digital Garage · 輕科技玩具",
    langGroup: "語言",
    h1: "你是哪一種隊友？",
    lede: "不是問卷，是三個小情境。看你怎麼做，就知道你是哪一種隊友。",
    hint: "每個情境選一次。同樣的選擇，永遠得到同一張卡。",
    boundary: "示意玩具，不是心理測驗。",
    progress: (n) => `情境 ${n} / 3`,
    choicesLabel: "選一個做法",
    backStep: "上一個情境",
    kicker: "你的隊友卡",
    roleLabel: "組隊角色",
    funny: "搞笑",
    gentle: "溫和",
    literary: "文青",
    strength: "長處",
    picks: (code) => `你的選擇 ${code}`,
    same: "朋友照著選，會得到同一張卡。",
    stored: "不儲存任何資料。分享連結只帶三個選擇。",
    again: "再玩一次",
    copy: "複製分享連結",
    copied: "連結已複製",
    copyFallback: "可以從下面的欄位複製",
    share: "分享",
    download: "下載角色卡",
    downloadFail: "這次沒畫成圖片，連結一樣能分享。",
    back: "回到 Digital Garage",
  },
  en: {
    htmlLang: "en",
    title: "What kind of teammate are you?",
    description: "Three short scenes. How you act is the kind of teammate you are. A toy, not a personality test. The same choices always make the same card.",
    skip: "Skip to content",
    eyebrow: "Digital Garage · Light-tech toys",
    langGroup: "Language",
    h1: "What kind of teammate are you?",
    lede: "Not a questionnaire. Three short scenes. How you act is the kind of teammate you are.",
    hint: "One choice per scene. The same choices always make the same card.",
    boundary: "A toy, not a personality test.",
    progress: (n) => `Scene ${n} of 3`,
    choicesLabel: "Pick one",
    backStep: "Previous scene",
    kicker: "Your teammate card",
    roleLabel: "Party role",
    funny: "Funny",
    gentle: "Gentle",
    literary: "Literary",
    strength: "Strength",
    picks: (code) => `Your choices ${code}`,
    same: "A friend who picks the same way gets the same card.",
    stored: "Nothing is stored. The share link carries only the three choices.",
    again: "Play again",
    copy: "Copy share link",
    copied: "Link copied",
    copyFallback: "Copy it from the field below",
    share: "Share",
    download: "Download card",
    downloadFail: "The picture didn't save this time. The link still shares the card.",
    back: "Back to the Digital Garage",
  },
};

const LETTERS = "ABCD";

export function resolveChoices(code) {
  if (typeof code !== "string" || !/^[ABCD]{3}$/.test(code)) return null;
  const indexes = [...code].map((letter) => LETTERS.indexOf(letter));
  const types = indexes.map((choiceIndex, scenarioIndex) => SCENARIOS[scenarioIndex].choices[choiceIndex].type);
  const counts = {};
  for (const type of types) counts[type] = (counts[type] || 0) + 1;
  const majority = Object.entries(counts).find(([, n]) => n >= 2);
  if (majority) return { code, type: majority[0], tie: false };
  const scenarioIndex = (indexes[0] + indexes[1] + indexes[2]) % 3;
  return { code, type: types[scenarioIndex], tie: true };
}

export function distribution() {
  const counts = {};
  for (const id of Object.keys(TYPES)) counts[id] = 0;
  for (const a of LETTERS) {
    for (const b of LETTERS) {
      for (const c of LETTERS) counts[resolveChoices(a + b + c).type] += 1;
    }
  }
  return counts;
}

export function readRoute(search) {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const lang = params.get("lang") === "en" ? "en" : "zh";
  const raw = (params.get("c") || "").toUpperCase();
  const code = /^[ABCD]{3}$/.test(raw) ? raw : null;
  return { lang, code };
}

export function shareSearch(code, lang) {
  const params = new URLSearchParams();
  params.set("c", code);
  params.set("lang", lang === "en" ? "en" : "zh");
  return params.toString();
}

const PROPS = {
  umbrella: `<path d="M10 34c0-14 9.8-24 22-24s22 10 22 24" fill="#F08A6E" stroke="#193A35" stroke-width="2.5"/><path d="M10 34h44M32 10v24" fill="none" stroke="#193A35" stroke-width="2.5"/><path d="M32 34c8 0 10 8 10 8" fill="none" stroke="#193A35" stroke-width="2.5" stroke-linecap="round"/><path d="M32 42v12" stroke="#193A35" stroke-width="2.5" stroke-linecap="round"/>`,
  drink: `<rect x="22" y="18" width="20" height="28" rx="4" fill="#F6F3ED" stroke="#193A35" stroke-width="2.5"/><path d="M26 30h12" stroke="#F08A6E" stroke-width="3" stroke-linecap="round"/><path d="M30 14c2-4 6-4 4-8M38 16c2-3 5-3 4-7" fill="none" stroke="#62716A" stroke-width="2" stroke-linecap="round"/>`,
  spark: `<g stroke="#F08A6E" stroke-width="2.5" stroke-linecap="round" fill="none"><path d="M32 6v14M32 44v14M6 32h14M44 32h14M13 13l9 9M42 42l9 9M51 13l-9 9M22 42l-9 9"/></g><circle cx="32" cy="32" r="5" fill="#F08A6E" stroke="#193A35" stroke-width="2"/>`,
  map: `<rect x="8" y="14" width="48" height="36" rx="3" fill="#F6F3ED" stroke="#193A35" stroke-width="2.5"/><path d="M32 14v36M14 28c6 5 8-5 14 0M36 34c5 5 8-3 12 1" fill="none" stroke="#193A35" stroke-width="2"/><circle cx="22" cy="40" r="3" fill="#F08A6E"/>`,
  headphones: `<path d="M14 34c0-12 8-20 18-20s18 8 18 20" fill="none" stroke="#193A35" stroke-width="2.5" stroke-linecap="round"/><rect x="8" y="30" width="10" height="16" rx="3" fill="#193A35"/><rect x="46" y="30" width="10" height="16" rx="3" fill="#193A35"/>`,
};

const FONT = "\"PingFang TC\", \"Microsoft JhengHei\", \"Noto Sans CJK TC\", \"WenQuanYi Micro Hei\", \"Droid Sans Fallback\", sans-serif";

function $(id) {
  return document.getElementById(id);
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function propNode(kind) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("prop", `prop-${kind}`);
  svg.innerHTML = PROPS[kind];
  return svg;
}

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  const words = String(text).split(/\s+/).filter(Boolean);
  let line = "";
  const pushChunk = (chunk) => {
    if (!line) {
      line = chunk;
      return;
    }
    const next = `${line} ${chunk}`;
    if (ctx.measureText(next).width <= maxWidth) line = next;
    else {
      lines.push(line);
      line = chunk;
    }
  };
  for (const word of words.length ? words : [""]) {
    if (ctx.measureText(word).width <= maxWidth) {
      pushChunk(word);
      continue;
    }
    if (line) {
      lines.push(line);
      line = "";
    }
    let chunk = "";
    for (const ch of Array.from(word)) {
      const next = chunk + ch;
      if (chunk && ctx.measureText(next).width > maxWidth) {
        lines.push(chunk);
        chunk = ch;
      } else chunk = next;
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function boot() {
  const route = readRoute(location.search);
  const state = {
    lang: route.lang,
    step: 0,
    picks: route.code ? [...route.code] : [],
    code: route.code,
  };
  let poseTimer = null;

  function stopPose() {
    if (poseTimer) clearInterval(poseTimer);
    poseTimer = null;
  }

  function playPose(type) {
    stopPose();
    const pose = POSES[type.pose];
    const img = $("mg");
    const stage = $("stage");
    img.alt = type[state.lang].alt;
    img.src = ASSET + pose.frames[0];
    stage.classList.remove("motion-float", "motion-bob", "motion-squash");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) stage.classList.add(`motion-${pose.motion}`);
    if (!reduce && pose.frames.length > 1) {
      let frame = 0;
      poseTimer = setInterval(() => {
        frame = (frame + 1) % pose.frames.length;
        img.src = ASSET + pose.frames[frame];
      }, pose.ms);
    }
    const prop = $("prop");
    prop.textContent = "";
    if (type.prop) prop.appendChild(propNode(type.prop));
  }

  function persist() {
    const next = new URL(location.href);
    next.search = "";
    next.hash = "";
    if (state.code) next.searchParams.set("c", state.code);
    next.searchParams.set("lang", state.lang);
    history.replaceState(null, "", next);
  }

  function shareUrl() {
    const next = new URL(location.href);
    next.search = shareSearch(state.code, state.lang);
    next.hash = "";
    return next.toString();
  }

  function render(focus) {
    const ui = UI[state.lang];
    const other = state.lang === "zh" ? "en" : "zh";
    document.documentElement.lang = ui.htmlLang;
    document.title = `${ui.title} — Paul's Tradecraft`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", ui.description);
    $("skip").textContent = ui.skip;
    $("eyebrow").textContent = ui.eyebrow;
    $("lang-group").setAttribute("aria-label", ui.langGroup);
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setLang === state.lang));
    });
    $("boundary").textContent = ui.boundary;
    $("title").textContent = ui.h1;
    $("lede").textContent = ui.lede;
    $("hint").textContent = ui.hint;
    $("foot-boundary").textContent = ui.boundary;
    $("stored").textContent = ui.stored;
    const back = $("back");
    back.textContent = ui.back;
    back.href = `/?lang=${state.lang}#garage`;

    const quiz = $("quiz");
    const result = $("result");
    if (!state.code) {
      stopPose();
      quiz.hidden = false;
      result.hidden = true;
      const scenario = SCENARIOS[state.step];
      const copy = scenario[state.lang];
      $("progress").textContent = ui.progress(state.step + 1);
      $("setting").textContent = copy.setting;
      $("scenario-title").textContent = copy.title;
      $("prompt").textContent = copy.prompt;
      $("choices").setAttribute("aria-label", ui.choicesLabel);
      const choices = $("choices");
      choices.textContent = "";
      scenario.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice";
        button.appendChild(el("span", "letter", choice.id));
        button.appendChild(el("span", "choice-text", choice[state.lang]));
        button.addEventListener("click", () => choose(choice.id));
        choices.appendChild(button);
      });
      const backStep = $("back-step");
      backStep.hidden = state.step === 0;
      backStep.textContent = ui.backStep;
      if (focus === "scenario") $("scenario-title").focus();
      return;
    }

    const resolved = resolveChoices(state.code);
    const type = TYPES[resolved.type];
    const text = type[state.lang];
    quiz.hidden = true;
    result.hidden = false;
    $("card-kicker").textContent = ui.kicker;
    $("card-name").textContent = text.name;
    $("other-name").textContent = type[other].name;
    $("role").textContent = `${ui.roleLabel} · ${text.role}`;
    const lines = $("lines");
    lines.textContent = "";
    [
      ["funny", ui.funny, text.funny],
      ["gentle", ui.gentle, text.gentle],
      ["literary", ui.literary, text.literary],
      ["strength", ui.strength, text.strength],
    ].forEach(([key, label, body]) => {
      const block = el("div", `line line-${key}`);
      block.appendChild(el("p", "line-label", label));
      const bodyEl = el("p", "line-body");
      if (key === "funny") bodyEl.appendChild(el("span", "mark", body));
      else bodyEl.textContent = body;
      block.appendChild(bodyEl);
      lines.appendChild(block);
    });
    $("picks-label").textContent = ui.picks(state.code);
    $("same").textContent = ui.same;
    $("card-boundary").textContent = ui.boundary;
    $("again").textContent = ui.again;
    $("copy-link").textContent = ui.copy;
    $("share-btn").textContent = ui.share;
    $("download").textContent = ui.download;
    $("share-label").textContent = ui.copy;
    $("share-url").value = shareUrl();
    $("status").textContent = "";
    playPose(type);
    if (focus === "card") $("card-name").focus();
  }

  function choose(id) {
    if (state.code) return;
    const picks = state.picks.slice(0, state.step);
    picks[state.step] = id;
    state.picks = picks;
    if (state.step < 2) {
      state.step += 1;
      render("scenario");
      return;
    }
    state.code = picks.join("");
    persist();
    render("card");
  }

  async function copyLink() {
    const ui = UI[state.lang];
    const field = $("share-url");
    try {
      await navigator.clipboard.writeText(field.value);
      $("status").textContent = ui.copied;
    } catch {
      field.focus();
      field.select();
      $("status").textContent = ui.copyFallback;
    }
  }

  async function shareNative() {
    const ui = UI[state.lang];
    const field = $("share-url");
    if (!navigator.share) return;
    try {
      await navigator.share({ title: ui.title, text: ui.boundary, url: field.value });
    } catch {
      /* dismissed share sheet */
    }
  }

  function downloadCard() {
    const ui = UI[state.lang];
    const resolved = resolveChoices(state.code);
    if (!resolved) return;
    const type = TYPES[resolved.type];
    const text = type[state.lang];
    const other = state.lang === "zh" ? "en" : "zh";
    const width = 720;
    const pad = 48;
    const inner = width - pad * 2;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `700 42px ${FONT}`;
    const nameLines = wrapLines(ctx, text.name, inner);
    ctx.font = `600 28px ${FONT}`;
    const funnyLines = wrapLines(ctx, text.funny, inner - 8);
    ctx.font = `500 26px ${FONT}`;
    const blocks = [
      wrapLines(ctx, text.gentle, inner),
      wrapLines(ctx, text.literary, inner),
      wrapLines(ctx, text.strength, inner),
    ];
    const lineH = (size) => Math.round(size * 1.45);
    let height = 36 + 28 + 24 + 210 + 16;
    height += nameLines.length * lineH(42) + 8 + lineH(22) + 8 + lineH(20) + 20;
    height += 22 + funnyLines.length * lineH(28) + 18;
    blocks.forEach((lines) => {
      height += 20 + lines.length * lineH(26) + 8;
    });
    height += 28 + lineH(22) + 36 + 24;
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = "#F6F3ED";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#193A35";
    ctx.lineWidth = 3;
    roundRect(ctx, 16, 16, width - 32, height - 32, 28);
    ctx.stroke();

    let y = 48;
    ctx.fillStyle = "#62716A";
    ctx.font = `700 16px ${FONT}`;
    ctx.fillText(ui.kicker, pad, y);
    y += 24;
    const img = $("mg");
    if (img.complete && img.naturalWidth > 0) {
      const dw = 168;
      const dh = (img.naturalHeight / img.naturalWidth) * dw;
      ctx.drawImage(img, (width - dw) / 2, y, dw, dh);
    }
    y += 210;
    ctx.fillStyle = "#193A35";
    ctx.font = `700 42px ${FONT}`;
    nameLines.forEach((line) => {
      ctx.fillText(line, pad, y);
      y += lineH(42);
    });
    y += 8;
    ctx.fillStyle = "#62716A";
    ctx.font = `600 22px ${FONT}`;
    ctx.fillText(type[other].name, pad, y);
    y += lineH(22);
    ctx.font = `700 18px ${FONT}`;
    ctx.fillText(`${ui.roleLabel} · ${text.role}`, pad, y);
    y += lineH(20) + 12;
    ctx.fillStyle = "#8A6A2B";
    ctx.font = `700 14px ${FONT}`;
    ctx.fillText(ui.funny, pad, y);
    y += 22;
    ctx.font = `600 28px ${FONT}`;
    funnyLines.forEach((line, index) => {
      const w = ctx.measureText(line).width;
      ctx.fillStyle = "#F08A6E";
      ctx.fillRect(pad - 4, y - 24, Math.min(w + 8, inner), 30);
      ctx.fillStyle = "#193A35";
      ctx.fillText(line, pad, y);
      y += lineH(28);
      if (index === funnyLines.length - 1) y += 8;
    });
    [
      [ui.gentle, blocks[0]],
      [ui.literary, blocks[1]],
      [ui.strength, blocks[2]],
    ].forEach(([label, lines]) => {
      ctx.fillStyle = "#8A6A2B";
      ctx.font = `700 14px ${FONT}`;
      ctx.fillText(label, pad, y);
      y += 22;
      ctx.fillStyle = "#193A35";
      ctx.font = `500 26px ${FONT}`;
      lines.forEach((line) => {
        ctx.fillText(line, pad, y);
        y += lineH(26);
      });
      y += 8;
    });
    y += 12;
    ctx.strokeStyle = "rgba(25,58,53,0.35)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 28;
    ctx.fillStyle = "#62716A";
    ctx.font = `700 16px ${FONT}`;
    ctx.fillText(ui.boundary, pad, y);

    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `teammate-${state.code}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      $("status").textContent = ui.downloadFail;
    }
  }

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.setLang === state.lang) return;
      state.lang = button.dataset.setLang;
      persist();
      render();
    });
  });
  $("back-step").addEventListener("click", () => {
    if (state.code || state.step === 0) return;
    state.step -= 1;
    render("scenario");
  });
  $("again").addEventListener("click", () => {
    state.code = null;
    state.picks = [];
    state.step = 0;
    persist();
    render("scenario");
  });
  $("copy-link").addEventListener("click", copyLink);
  $("share-btn").addEventListener("click", shareNative);
  $("download").addEventListener("click", downloadCard);
  if (!navigator.share) $("share-btn").hidden = true;

  for (const pose of Object.values(POSES)) {
    pose.frames.forEach((frame) => {
      const img = new Image();
      img.src = ASSET + frame;
    });
  }

  if (!state.code && new URLSearchParams(location.search).has("c")) persist();
  render(state.code ? "card" : null);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

if (typeof document !== "undefined") boot();
