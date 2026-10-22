// ROOMVERSE studio page: text, language, and loading the 3D room only when the visitor asks for it.
const COPY = {
  zh: {
    title: "Room 02 都市青年Style",
    lead: "ROOMVERSE 像 universe 一樣，不會只有一個房間。第一間是客廳，這是第二間：一個人住的套房，睡覺、工作、窩著放鬆都在同一個空間。睡覺、工作、打電動、窩在沙發都有自己的角落。先選一個感覺，看同一個房間在不同時刻的樣子；拖一下可以轉頭看看。",
    enter: "走進第二個房間", size: "四種感覺：專注工作日、週末宅在家、深夜遊戲、週日賴床", loading: "房間準備中…", failed: "這台裝置打不開 3D。",
    note: "施工中。這是 ROOMVERSE 的第二個房間，由程式一件一件建起來；下方可以換主牆顏色、地毯、窗飾、寢具和海報。窗外景色和海報是插畫示意（人機協作完成），不是真實地點。不是真實商品，實際顏色與質感仍要看樣品和現場光線。",
    home: "← Room 01", lang: "EN", moodsLabel: "選一個感覺", swapsLabel: "換什麼",
    swaps: {
      posters: ["電視上方海報", { A: "運動", B: "幾何", C: "太空" }],
      wall: ["主牆顏色", { oat: "燕麥白", latte: "奶茶", warmGrey: "暖灰", sage: "鼠尾草綠", terracotta: "赤陶", slate: "炭灰藍" }],
      rug: ["沙發地毯", { stripe: "灰藍條紋", oat: "燕麥編織", oak: "橡木色黑邊" }],
      window: ["窗飾", { roller: "燕麥捲簾", bamboo: "竹木百葉", linen: "亞麻窗簾＋捲簾" }],
      bedding: ["寢具", { stone: "石灰＋炭灰", mist: "霧藍＋米白", clay: "燕麥＋赤陶" }],
    },
    moods: {
      focus: ["專注工作日", "白天的窗光灑在桌上，燈條只留一點點，適合把事情做完。"],
      weekend: ["週末宅在家", "窗光變柔，床邊小燈亮起，電視開著，整個房間慢下來。"],
      night: ["深夜遊戲", "房間暗下來，螢幕和身後的燈條成為主角，窗外的城市還亮著。"],
      sunday: ["週日賴床", "清晨的暖光從半拉的捲簾下照進來，不急著起床。"],
    },
  },
  en: {
    title: "Room 02 · Urban Youth Style",
    lead: "ROOMVERSE works like a universe: it will never be just one room. The first room is a living room; this is the second, a studio for one where sleeping, working and unwinding share one space. Sleeping, working, gaming and sinking into the sofa each have their own corner. Pick a mood to see the same room at a different moment; drag to look around.",
    enter: "Step into the second room", size: "Four moods: focus day, weekend in, late-night game, Sunday lie-in", loading: "Setting up the room…", failed: "3D can't open on this device.",
    note: "Work in progress. This is ROOMVERSE's second room, built in code piece by piece; below the room you can swap the feature wall colour, rug, window, bedding and posters. The view outside and the posters are illustrations made through human–AI collaboration, not real places. Not real products; check real colours and textures with samples and on-site light.",
    home: "← Room 01", lang: "中", moodsLabel: "Pick a mood", swapsLabel: "Swap",
    swaps: {
      posters: ["Posters over the TV", { A: "Sport", B: "Geometric", C: "Space" }],
      wall: ["Feature wall", { oat: "Oat white", latte: "Latte", warmGrey: "Warm grey", sage: "Sage", terracotta: "Terracotta", slate: "Slate blue" }],
      rug: ["Sofa rug", { stripe: "Blue-grey stripe", oat: "Oat weave", oak: "Oak with black border" }],
      window: ["Window", { roller: "Oat roller blind", bamboo: "Bamboo blind", linen: "Linen curtains + roller" }],
      bedding: ["Bedding", { stone: "Stone + charcoal", mist: "Mist blue + cream", clay: "Oat + terracotta" }],
    },
    moods: {
      focus: ["Focus day", "Daylight on the desk and just a hint of the strip light: a day for getting things done."],
      weekend: ["Weekend in", "Softer daylight, the bedside lamp on, the TV playing: the whole room slows down."],
      night: ["Late-night game", "The room goes dark; the screen and the strip behind it take over while the city stays lit outside."],
      sunday: ["Sunday lie-in", "Early warm light slips under the half-drawn blind; no hurry to get up."],
    },
  },
};
const $ = (id) => document.getElementById(id);
const arrivedFromRoom01 = new URLSearchParams(location.search).get("from") === "room01"; // came through the door in Room 01
let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
let room = null, mood = "focus";
const picked = { posters: "C", wall: "oat", rug: "stripe", window: "roller", bedding: "stone" };
function swapButtons() {
  const c = COPY[lang], box = $("swapGroups");
  $("swapsTitle").textContent = c.swapsLabel;
  box.replaceChildren(...Object.entries(c.swaps).map(([kind, [label, opts]]) => {
    const g = document.createElement("div"); g.className = "group"; g.setAttribute("role", "group"); g.setAttribute("aria-label", label);
    const h = document.createElement("span"); h.className = "glabel"; h.textContent = label;
    const row = document.createElement("div"); row.className = "row";
    row.append(...Object.entries(opts).map(([k, name]) => {
      const b = document.createElement("button"); b.type = "button"; b.dataset.kind = kind; b.dataset.choice = k; b.textContent = name;
      b.setAttribute("aria-pressed", String(picked[kind] === k));
      b.onclick = async () => { picked[kind] = k; swapButtons(); await room?.setChoice(kind, k); };
      return b;
    }));
    g.append(h, row); return g;
  }));
}
function moodButtons() {
  const c = COPY[lang], row = $("moodRow");
  $("moodsLabel").textContent = c.moodsLabel; row.setAttribute("aria-label", c.moodsLabel);
  row.replaceChildren(...Object.keys(c.moods).map((k) => {
    const b = document.createElement("button"); b.type = "button"; b.dataset.mood = k; b.textContent = c.moods[k][0];
    b.setAttribute("aria-pressed", String(k === mood));
    b.onclick = async () => { mood = k; moodButtons(); await room?.setMood(k); };
    return b;
  }));
  $("why").textContent = c.moods[mood][1];
}
function text() {
  const c = COPY[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  $("title").textContent = c.title; $("lead").textContent = c.lead; $("enter").textContent = c.enter; $("size").textContent = c.size;
  $("note").textContent = c.note; $("home").textContent = c.home; $("home").href = `../?lang=${lang}`; $("lang").textContent = c.lang;
  room?.setLang(lang);
  moodButtons();
  swapButtons();
}
$("lang").onclick = () => { lang = lang === "zh" ? "en" : "zh"; const u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(null, "", u); text(); };
$("enter").onclick = async () => {
  $("poster").hidden = true; $("status").hidden = false; $("status").textContent = COPY[lang].loading;
  try {
    const { start } = await import("./bedroom.js?v=17");
    room = await start({ stage: $("stage"), lang });
    $("status").hidden = true; $("moods").hidden = false; $("swaps").hidden = false;
    window.__bedroom = room; // test hook
    if (arrivedFromRoom01) { document.documentElement.classList.add("ready"); await room.arrive(); } // the dark cover lifts as the walk-in begins
  } catch (e) {
    console.error(e);
    document.documentElement.classList.add("ready");
    $("poster").hidden = false; $("status").textContent = COPY[lang].failed;
  }
};
text();
if (arrivedFromRoom01) $("enter").click(); // they already chose to come in
