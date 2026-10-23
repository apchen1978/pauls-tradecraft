// ROOMVERSE studio page: text, language, and loading the 3D room only when the visitor asks for it.
const COPY = {
  zh: {
    title: "Room 02 都市青年Style",
    lead: "ROOMVERSE 像 universe 一樣，不會只有一個房間。第一間是客廳，這是第二間：一個人住的套房，睡覺、工作、打電動、窩沙發，各有各的角落。選一個感覺，拖一下或按按鈕轉頭看。",
    enter: "走進第二個房間", size: "五種感覺：專注工作日、週末宅在家、深夜遊戲、週日賴床、追劇夜", loading: "房間準備中…", failed: "這台裝置打不開 3D。",
    note: "這是 ROOMVERSE 的第二個房間：一間在紐約租的套房，一件一件搬進來。下方可以換主牆、地毯、窗飾、寢具和海報，也可以按「隨機搭一間」。窗外景色和海報是插畫示意（人機協作完成），不是真實地點。不是真實商品，實際顏色與質感仍要看樣品和現場光線。",
    home: "← Room 01", lang: "EN", portal: "推開那扇門 → Room 01", portalHint: "回到客廳", robotLine: "跟我來，我帶你回客廳", doorHint: "門後面是客廳，點我帶你過去", shuffle: "隨機搭一間", moodsLabel: "選一個感覺", swapsLabel: "換什麼", viewsLabel: "看哪裡", views: { work: "書桌與窗邊", tv: "電視牆", bed: "床邊", center: "站到房間中間" },
    swaps: {
      posters: ["電視上方海報", { A: "運動", B: "幾何", C: "太空" }],
      wall: ["主牆", { paper: "葉紋壁紙", oat: "燕麥白", latte: "奶茶", warmGrey: "暖灰", sage: "鼠尾草綠", terracotta: "赤陶", slate: "炭灰藍" }],
      rug: ["沙發地毯", { modern: "現代幾何", stripe: "灰藍條紋", oat: "燕麥編織", oak: "橡木色黑邊" }],
      window: ["窗飾", { roller: "燕麥捲簾", bamboo: "竹木百葉", linen: "亞麻窗簾＋捲簾" }],
      bedding: ["寢具", { stone: "石灰＋炭灰", mist: "霧藍＋米白", clay: "燕麥＋赤陶" }],
      led: ["燈條顏色", { auto: "跟著感覺", violet: "紫", cyan: "冰藍", amber: "琥珀", pink: "粉紅", white: "冷白" }],
      desktop: ["桌面擺設", { minimal: "簡約", gamer: "玩家", coffee: "咖啡", creative: "創作" }],
      screen: ["螢幕畫面", { city: "夜城", grid: "霓虹地平線", work: "工作視窗", calm: "柔和桌布" }],
      sofa: ["沙發套", { slate: "灰藍", sand: "沙色", moss: "苔綠", charcoal: "炭灰", terracotta: "陶土" }],
      shelf: ["書架擺設", { mixed: "混搭", airy: "留白", library: "書滿" }],
      tv: ["電視畫面", { auto: "跟著感覺", off: "關著", film: "電影", game: "遊戲主畫面" }],
    },
    moods: {
      focus: ["專注工作日", "白天的窗光灑在桌上，燈條只留一點點，適合把事情做完。"],
      weekend: ["週末宅在家", "窗光變柔，床邊小燈亮起，電視開著，整個房間慢下來。"],
      night: ["深夜遊戲", "房間暗下來，螢幕和身後的燈條成為主角，窗外的城市還亮著。"],
      sunday: ["週日賴床", "清晨的暖光從半拉的捲簾下照進來，不急著起床。"],
      series: ["追劇夜", "週五晚上，關掉主燈，只留琥珀燈帶和一盞暖燈，電視亮著，沙發就是整個世界。"],
    },
  },
  en: {
    title: "Room 02 · Urban Youth Style",
    lead: "ROOMVERSE works like a universe: it will never be just one room. The first is a living room; this is the second, a studio for one where sleeping, working, gaming and sofa time each get a corner. Pick a mood; drag or use the buttons to look around.",
    enter: "Step into the second room", size: "Five moods: focus day, weekend in, late-night game, Sunday lie-in, series night", loading: "Setting up the room…", failed: "3D can't open on this device.",
    note: "This is ROOMVERSE's second room: a rented studio in New York, furnished one piece at a time. Below the room you can swap the feature wall, rug, window, bedding and posters, or press “Surprise me”. The view outside and the posters are illustrations made through human–AI collaboration, not real places. Not real products; check real colours and textures with samples and on-site light.",
    home: "← Room 01", lang: "中", portal: "Push the door → Room 01", portalHint: "Back to the living room", robotLine: "Follow me, back to the living room.", doorHint: "The living room is behind this door. Tap me to go.", shuffle: "Surprise me", moodsLabel: "Pick a mood", swapsLabel: "Swap", viewsLabel: "Look at", views: { work: "Desk and window", tv: "TV wall", bed: "Bed side", center: "Stand in the middle" },
    swaps: {
      posters: ["Posters over the TV", { A: "Sport", B: "Geometric", C: "Space" }],
      wall: ["Feature wall", { paper: "Leaf wallpaper", oat: "Oat white", latte: "Latte", warmGrey: "Warm grey", sage: "Sage", terracotta: "Terracotta", slate: "Slate blue" }],
      rug: ["Sofa rug", { modern: "Modern geometric", stripe: "Blue-grey stripe", oat: "Oat weave", oak: "Oak with black border" }],
      window: ["Window", { roller: "Oat roller blind", bamboo: "Bamboo blind", linen: "Linen curtains + roller" }],
      bedding: ["Bedding", { stone: "Stone + charcoal", mist: "Mist blue + cream", clay: "Oat + terracotta" }],
      led: ["LED strip", { auto: "Follow the mood", violet: "Violet", cyan: "Ice blue", amber: "Amber", pink: "Pink", white: "Cool white" }],
      desktop: ["Desk set", { minimal: "Minimal", gamer: "Gamer", coffee: "Coffee", creative: "Creative" }],
      screen: ["Screen", { city: "Night city", grid: "Neon horizon", work: "Work view", calm: "Calm wallpaper" }],
      sofa: ["Sofa cover", { slate: "Slate", sand: "Sand", moss: "Moss", charcoal: "Charcoal", terracotta: "Terracotta" }],
      shelf: ["Bookshelf", { mixed: "Mixed", airy: "Airy", library: "Full library" }],
      tv: ["TV screen", { auto: "Follow the mood", off: "Off", film: "A film", game: "Console home" }],
    },
    moods: {
      focus: ["Focus day", "Daylight on the desk and just a hint of the strip light: a day for getting things done."],
      weekend: ["Weekend in", "Softer daylight, the bedside lamp on, the TV playing: the whole room slows down."],
      night: ["Late-night game", "The room goes dark; the screen and the strip behind it take over while the city stays lit outside."],
      sunday: ["Sunday lie-in", "Early warm light slips under the half-drawn blind; no hurry to get up."],
      series: ["Series night", "Friday night: ceiling light off, just the amber strip and one warm lamp, the TV playing; the sofa is the whole world."],
    },
  },
};
const $ = (id) => document.getElementById(id);
const arrivedFromRoom01 = new URLSearchParams(location.search).get("from") === "room01"; // came through the door in Room 01
let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
let room = null, mood = "focus", look = "center";
const returningFromRoom02 = new URLSearchParams(location.search).get("from") === "room02";
function viewButtons() {
  const c = COPY[lang], row = $("viewRow");
  row.setAttribute("aria-label", c.viewsLabel);
  row.replaceChildren(...Object.entries(c.views).map(([k, name]) => {
    const b = document.createElement("button"); b.type = "button"; b.dataset.look = k; b.textContent = name;
    b.setAttribute("aria-pressed", String(k === look));
    b.onclick = async () => { look = k; viewButtons(); await room?.lookTo(k); };
    return b;
  }));
}
const picked = { posters: "C", wall: "paper", rug: "modern", window: "linen", bedding: "stone", led: "auto", desktop: "minimal", screen: "city", sofa: "slate", shelf: "mixed", tv: "auto" };
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
  const s = document.createElement("button"); s.type = "button"; s.dataset.shuffle = "1"; s.className = "shuffle"; s.textContent = c.shuffle; s.onclick = shuffle; row.append(s);
  $("why").textContent = c.moods[mood][1];
}
// Room 01's "random room" button: a random wall, rug, curtain, bedding, sofa cover, strip colour, screen and poster set, and a random mood
async function shuffle() {
  const pick = (o) => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; }, c = COPY[lang];
  for (const kind of ["wall", "rug", "window", "bedding", "sofa", "led", "screen", "posters"]) { const k = pick(c.swaps[kind][1]); picked[kind] = k; await room?.setChoice(kind, k); }
  mood = pick(c.moods); moodButtons(); swapButtons(); await room?.setMood(mood);
}
function text() {
  const c = COPY[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  $("title").textContent = c.title; $("lead").textContent = c.lead; $("enter").textContent = c.enter; $("size").textContent = c.size;
  $("note").textContent = c.note; $("portalBtn").textContent = c.portal; $("portalHint").textContent = c.portalHint; $("home").textContent = c.home; $("home").href = `../?lang=${lang}`; $("lang").textContent = c.lang;
  room?.setLang(lang);
  moodButtons();
  swapButtons();
  viewButtons();
}
$("portalBtn").onclick = () => { void room?.leaveToRoom01(); };
$("robotHitTarget").onclick = () => room?.tapRobot();
$("lang").onclick = () => { lang = lang === "zh" ? "en" : "zh"; const u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(null, "", u); text(); };
$("enter").onclick = async () => {
  $("poster").hidden = true; $("status").hidden = false; $("status").textContent = COPY[lang].loading;
  try {
    const { start } = await import("./bedroom.js?v=64");
    room = await start({ stage: $("stage"), bubble: $("robotBubble"), hitTarget: $("robotHitTarget"), lang, copy: () => COPY[lang] });
    $("status").hidden = true; $("moods").hidden = false; $("views").hidden = false; $("swaps").hidden = false; $("swaps").open = matchMedia("(min-width: 769px)").matches; // the swap options start tucked away on phones
    window.__bedroom = room; // test hook
    $("portalRow").hidden = false;
    if (arrivedFromRoom01) { document.documentElement.classList.add("ready"); await room.arrive(); } // the dark cover lifts as the walk-in begins
  } catch (e) {
    console.error(e);
    document.documentElement.classList.add("ready");
    $("poster").hidden = false; $("status").textContent = COPY[lang].failed;
  }
};
text();
if (arrivedFromRoom01 || returningFromRoom02) $("enter").click(); // portal arrivals continue straight into the room
