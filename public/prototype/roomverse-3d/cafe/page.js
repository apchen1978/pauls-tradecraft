import { initTravelDoor } from "../travel-door.js?v=auto";

const ROOM_TITLE = "Room 04｜Shanghai, Slowly";

// Room 04 | Shanghai, Slowly. The page: title, the room, five mood buttons, the barista robot (tap it) and a paper note (tap it).
// Texts marked PROVISIONAL are CC's first drafts; Paul has not chosen the note, the menu or the robot's lines yet.
const COPY = {
  zh: {
    title: ROOM_TITLE, subtitle: "上海·慢板",
    lead: "上海街角的紅磚咖啡廳，午後的光斜斜落在磚牆和橡木吧台上，窗邊的位子留給你。拖曳轉頭，點點黑板、機器人、唱片機和冰滴塔，再換個時段，看光怎麼變。",
    note: "這是想像的房間，不是實際店面。封面和窗外的新天地街景，是 Paul 與 AI 一起畫的概念畫。",
    otherRooms: "← 其他房間", otherRoomsLabel: "前往其他 ROOMVERSE 房間", lang: "EN", languageLabel: "切換為英文",
    portfolioHome: "⌂ 作品集首頁", portfolioHomeLabel: "回到作品集首頁",
    fullScreen: "全螢幕", exitFullScreen: "退出", portal: "傳送門", viewsLabel: "選擇視角",
    enter: "走進咖啡廳", loading: "房間準備中…", failed: "這台裝置無法開啟 3D 場景。", canvas: "Room 04 上海咖啡廳的 3D 房間", moodsLabel: "選擇時段與天氣",
    robotLabel: "咖啡師機器人：點我說話", noteLabel: "吧台上的小便條：點開讀", recordLabel: "唱機：點一下播放，再點一下停止", recordLines: ["♪ 慢板，三十三轉。🎷 開著聲音聽聽看。", "♪ 午後弄堂，四十五轉。🎶 再點一次，下次換下一首。", "♪ 夜色外灘，七十八轉。🌃 霓虹和老爵士。"], recordHint: "點一下唱盤，聽聽音樂 🎷", dripLabel: "冰滴塔：點一下開始，再點一下停止", dripLine: "冰滴，一滴一滴慢慢來。", robotLine: "早安，歡迎光臨。要來一杯嗎？", robotChoose: "看看其他房間",
    randomLook: "隨機搭一間咖啡廳", resetLook: "回到預設搭配", swapsTitle: "換搭配", randomDone: "已幫你搭了一間新的咖啡廳。",
    groups: {
      brick: ["磚牆", { red: "老紅磚", umber: "赭褐磚", grey: "灰磚", dusty: "灰粉磚", white: "白磚（刷白老磚）", dark: "深色老磚" }],
      counter: ["吧台木色", { honey: "蜂蜜橡木", walnut: "胡桃木", pale: "淺橡木", grey: "灰洗橡木" }],
      back: ["後吧台與護牆板", { olive: "橄欖綠", navy: "海軍藍", terracotta: "赭紅", charcoal: "炭灰", sage: "鼠尾草綠" }],
      wall: ["牆面漆色", { warm: "暖白", blush: "霧粉", mist: "霧綠", butter: "奶油黃", grey: "淺灰" }],
      wallpaper: ["壁紙", { none: "不貼，用漆色", stripe: "細條紋（Room 01）", botanical: "淡色植紋（Room 01）", grasscloth: "暖燕麥草織（Room 01）", sagewash: "鼠尾草石灰洗（Room 01）", planeleaf: "梧桐葉（本店專屬）", windowshadow: "窗格光影（本店專屬）" }],
      wainscot: ["護牆板（牆下半）", { same: "跟後吧台同色", olive: "橄欖綠", navy: "海軍藍", terracotta: "赭紅", charcoal: "炭灰", sage: "鼠尾草綠", cream: "奶油白", walnut: "胡桃木色", oat: "燕麥米" }],
      floor: ["地板", { greybrown: "灰褐木", warmoak: "暖橡木", walnut: "深胡桃", pale: "淺木", terrazzo: "水磨石", herringbone: "人字拼木", slate: "深色石板" }],
      clock: ["牆上時鐘（走真實時間）", { tech: "科技感鐘", classic: "古典黃銅鐘", wood: "圓木框鐘" }],
      lamp: ["吊燈（窗邊與吧台）", { bamboo: "窗邊竹編雲朵，吧台紙環", rings: "窗邊紙環，吧台竹編雲朵" }],
      scarf: ["機器人圍巾", { olive: "橄欖綠", terracotta: "赭紅", mustard: "芥黃", navy: "海軍藍", rose: "玫瑰粉" }],
      chair: ["窗邊椅子", { bentwood: "曲木", black: "黑色（預設）", natural: "原木", forest: "墨綠", terracotta: "赭紅", navy: "海軍藍" }],
      stool: ["吧台高腳椅", { bentwood: "曲木藤面", leather: "橡木皮革", metal: "黑金屬", none: "不放" }],
      ceiling: ["天花板", { white: "白色木板（預設）", warmwood: "暖木色", sage: "鼠尾草綠", clay: "陶土粉", slate: "深藍灰" }],
      lounge: ["Lounge 布色", { terracotta: "赭紅＋芥末黃", olive: "橄欖綠＋奶油", navy: "藏青＋燕麥", plum: "梅紫＋煙粉", sage: "鼠尾草綠＋亞麻", cocoa: "可可棕＋麥色" }],
      rug: ["地毯（依時段會換）", { weave: "黃麻編織（圓形・黃金時刻）", jute: "黃麻粗編", wool: "深色羊毛回字紋", abstract: "抽象色塊", stripe: "藍灰細條紋", ivory: "象牙細織（Room 01・早晨）", medallion: "赭紅藏青花紋（Room 01・打烊後）", slate: "藍灰橫條（Room 02・追劇夜）", arches: "圓拱色塊（Room 02・午後）", oat: "燕麥流蘇（Room 02・下雨天）" }],
      menu: ["黑板菜單", { board: "素面黑板", chalk: "粉筆插畫", minimal: "極簡邊框", script: "手寫感版面" }],
      gallery: ["掛畫組", { a: "梧桐街與石庫門", b: "鐵花陽台與夜航渡輪" }],
    },
    views: { counter: "吧台", window: "窗邊座位", lounge: "Lounge", entry: "初體驗", middle: "站到房間中間" },
    center: "站到房間中間", orbit: "回到環繞視角", centerHint: "拖曳或用方向鍵，轉一整圈看看。",
    noteTitle: "便條", noteLine: "窗邊的位子留給你，慢慢來。", close: "關閉",
    moods: {
      morning: ["早晨開店", "偏白的早晨光從臨街的窗進來，窗格影子落在吧台和地板上。"],
      noon: ["午後", "太陽升高，光變得平而亮，咖啡機上的杯子不再有長影子。"],
      golden: ["黃金時刻", "低角度的暖光斜斜打在吧台上，軌道燈也亮得更暖。"],
      rain: ["下雨天", "窗外下著雨，店裡的燈就顯得特別暖。"],
      closing: ["打烊後", "窗外轉成藍調，只剩軌道燈和吧台上的一盞暖燈。"],
      series: ["追劇夜", "右牆的大螢幕亮起，燈調暗，窗外是夜晚的街；一個人的白領夜，或約幾個朋友。"],
    },
    tabletLabel: "Lounge 桌上的平板：點一下看看", tabletDay: ["平板上是今天的天氣：上海，22°C，晴，適合散步。", "螢幕上開著一份食譜：桂花拿鐵的三個步驟。", "有人在讀電子書，停在第 128 頁。📖"], tabletNight: ["平板亮了一下：「今晚的歌單已更新：慢板爵士 12 首。」🎷", "通知：「末班地鐵 23:30，記得留時間。」🚇", "訊息：「明天見，窗邊的位子幫你留著。」☕", "追劇提醒：《上海慢板》第 2 集已上線。📺"],
    baristaLabel: "咖啡機旁的機器人：點我說話", baristaLines: ["嗶嗶，正在打奶泡，等我一下 ☕", "今天的豆子是雲南的，帶一點果香。", "拉花練了三千次，這杯是愛心。❤️", "蒸氣好燙，請別靠太近喔。", "另一隻負責招呼，我負責手藝。🤖", "你聽，奶泡的聲音像下雨。"],
    catLabel: "橘貓：點一下牠", catLines: ["喵～ 😺", "呼嚕呼嚕… 😽", "（翻個身，繼續睡）😴", "別吵，我在曬太陽 😼", "喵？是要開罐罐了嗎 🐟", "這個墊子是我的。😸"],
    menuLabel: "菜單：點一下，聽聽現在的推薦",
    menuPick: { morning: "早晨先來一杯 Flat White，慢慢醒。", noon: "午後來杯 Iced Tea，配一塊 Daily Cake。", golden: "這個光，我推薦 Osmanthus Latte。", rain: "下雨天，一杯熱的 Hot Chocolate。", closing: "打烊前最後一杯：Osmanthus Tea。", series: "追劇夜：Mocha，配一塊 Daily Cake。" },
    robotMood: { morning: "早安，剛開店。", noon: "午後的客人比較慢。", golden: "這個光，咖啡會更好喝。", rain: "下雨天，多點一杯熱的吧。", closing: "打烊了，但你可以再坐一會。", series: "今晚追哪一部？我去煮杯熱的。" },
  },
  en: {
    title: ROOM_TITLE, subtitle: "A cafe in Shanghai",
    lead: "A red-brick cafe on a Shanghai corner. The afternoon light slants across the brick and the oak counter, and the window seat is saved for you. Drag to look around, tap the menu boards, the robots, the record player and the cold-drip tower, then change the time of day and watch the light change.",
    note: "An imagined room, not a real shop. The cover and the Xintiandi street outside the window are concept paintings made by Paul together with AI.",
    otherRooms: "← Other rooms", otherRoomsLabel: "Go to the other ROOMVERSE rooms", lang: "中文", languageLabel: "Switch to Chinese",
    portfolioHome: "⌂ Portfolio home", portfolioHomeLabel: "Back to portfolio home",
    fullScreen: "Full screen", exitFullScreen: "Exit", portal: "Travel", viewsLabel: "Choose a view",
    enter: "Step into the cafe", loading: "Preparing the room…", failed: "This device cannot open the 3D scene.", canvas: "3D room of the Room 04 Shanghai cafe", moodsLabel: "Choose a time and weather",
    robotLabel: "Barista robot: tap to talk", noteLabel: "The little note on the counter: tap to read", recordLabel: "Record player: tap to play, tap again to stop", recordLines: ["♪ Slow tempo, thirty-three and a third. 🎷 Turn the sound on.", "♪ Lane in the afternoon, forty-five. 🎶 Tap again for the next one.", "♪ Night on the Bund, seventy-eight. 🌃 Neon and old jazz."], recordHint: "Tap the record to hear some music 🎷", dripLabel: "Cold drip tower: tap to start, tap again to stop", dripLine: "Cold drip, one drop at a time.", robotLine: "Good morning, welcome. Can I get you something?", robotChoose: "See the other rooms",
    randomLook: "Build me a random cafe", resetLook: "Back to the default look", swapsTitle: "Swap the look", randomDone: "A new cafe, just for you.",
    groups: {
      brick: ["Brick wall", { red: "Old red brick", umber: "Umber brick", grey: "Grey brick", dusty: "Dusty pink brick", white: "Whitewashed brick", dark: "Dark old brick" }],
      counter: ["Counter wood", { honey: "Honey oak", walnut: "Walnut", pale: "Pale oak", grey: "Grey-washed oak" }],
      back: ["Back bar and wainscot", { olive: "Olive", navy: "Navy", terracotta: "Terracotta", charcoal: "Charcoal", sage: "Sage" }],
      wall: ["Wall paint", { warm: "Warm white", blush: "Blush", mist: "Mist green", butter: "Butter", grey: "Pale grey" }],
      wallpaper: ["Wallpaper", { none: "None, use paint", stripe: "Fine stripe (Room 01)", botanical: "Soft botanical (Room 01)", grasscloth: "Oatmeal grasscloth (Room 01)", sagewash: "Sage limewash (Room 01)", planeleaf: "Plane leaf (this cafe)", windowshadow: "Window shadow (this cafe)" }],
      wainscot: ["Wainscot (lower wall)", { same: "Same as back bar", olive: "Olive", navy: "Navy", terracotta: "Terracotta", charcoal: "Charcoal", sage: "Sage", cream: "Cream", walnut: "Walnut brown", oat: "Oat" }],
      floor: ["Floor", { greybrown: "Grey-brown", warmoak: "Warm oak", walnut: "Dark walnut", pale: "Pale wood", terrazzo: "Terrazzo", herringbone: "Herringbone", slate: "Dark slate" }],
      clock: ["Wall clock (shows the real time)", { tech: "Futuristic clock", classic: "Classical brass clock", wood: "Round oak clock" }],
      lamp: ["Pendant lamps (window and counter)", { bamboo: "Bamboo cloud at the window, paper rings at the counter", rings: "Paper rings at the window, bamboo cloud at the counter" }],
      scarf: ["Robot scarf", { olive: "Olive", terracotta: "Terracotta", mustard: "Mustard", navy: "Navy", rose: "Rose" }],
      chair: ["Window chairs", { bentwood: "Bentwood", black: "Black (default)", natural: "Natural", forest: "Forest green", terracotta: "Terracotta", navy: "Navy" }],
      stool: ["Bar stools", { bentwood: "Bentwood and cane", leather: "Oak and leather", metal: "Black metal", none: "None" }],
      ceiling: ["Ceiling", { white: "White planks (default)", warmwood: "Warm wood", sage: "Sage", clay: "Clay pink", slate: "Slate blue" }],
      lounge: ["Lounge upholstery", { terracotta: "Terracotta and mustard", olive: "Olive and cream", navy: "Navy and oatmeal", plum: "Plum and dusty rose", sage: "Sage and linen", cocoa: "Cocoa and wheat" }],
      rug: ["Rugs (they change with the mood)", { weave: "Jute weave (round, golden hour)", jute: "Coarse jute", wool: "Dark wool, lattice", abstract: "Abstract blocks", stripe: "Blue-grey stripe", ivory: "Ivory weave (Room 01, morning)", medallion: "Rust and navy medallion (Room 01, after closing)", slate: "Slate stripe (Room 02, series night)", arches: "Arches (Room 02, afternoon)", oat: "Oat with fringe (Room 02, rainy day)" }],
      menu: ["Chalk menus", { board: "Plain board", chalk: "Chalk drawings", minimal: "Minimal frame", script: "Handwritten layout" }],
      gallery: ["Prints", { a: "Plane trees and doorways", b: "Balcony and night ferry" }],
    },
    views: { counter: "The counter", window: "Window seat", lounge: "Lounge", entry: "First step in", middle: "Stand in the middle" },
    center: "Stand in the middle", orbit: "Back to orbit view", centerHint: "Drag, or use the arrow keys, to turn all the way round.",
    noteTitle: "Note", noteLine: "The window seat is yours. Take your time.", close: "Close",
    moods: {
      morning: ["Morning", "Pale early light comes through the street window and draws the panes across the counter and the floor."],
      noon: ["Midday", "The sun is high and the light turns flat and bright; the cups on the machine lose their long shadows."],
      golden: ["Golden hour", "Low warm light rakes across the counter, and the track lights glow warmer too."],
      rain: ["Rainy day", "Rain outside makes the lights inside look especially warm."],
      closing: ["After closing", "The street turns blue; only the track lights and one warm lamp over the counter stay on."],
      series: ["Series night", "The big screen on the right wall lights up, the lamps dim and the street outside is night: a white-collar evening alone, or with a few friends."],
    },
    tabletLabel: "The tablet on the lounge table: tap to look", tabletDay: ["Today's weather on the tablet: Shanghai, 22°C, sunny, a good day for a walk.", "A recipe is open: osmanthus latte in three steps.", "Someone is reading an e-book, stopped at page 128. 📖"], tabletNight: ["The tablet lights up: \"Tonight's playlist is ready: 12 slow jazz tracks.\" 🎷", "Notification: \"Last metro 23:30, leave time.\" 🚇", "Message: \"See you tomorrow. The window seat is yours.\" ☕", "Reminder: Shanghai, Slowly, episode 2 is out. 📺"],
    baristaLabel: "The robot at the machine: tap to talk", baristaLines: ["Beep, steaming the milk, one moment ☕", "Today's beans are from Yunnan, a little fruity.", "Three thousand practice pours: this one is a heart. ❤️", "The steam is hot, please stand back a little.", "The other one greets you, I do the craft. 🤖", "Listen: the milk sounds like rain."],
    catLabel: "The ginger cat: tap it", catLines: ["Meow~ 😺", "Purr, purr... 😽", "(rolls over, back to sleep) 😴", "Shh, I am sunbathing. 😼", "Meow? Is it tin time? 🐟", "This cushion is mine. 😸"],
    menuLabel: "Menu: tap to hear the pick for right now",
    menuPick: { morning: "Morning: a Flat White, to wake up slowly.", noon: "Afternoon: an Iced Tea with a slice of the Daily Cake.", golden: "In this light, I recommend the Osmanthus Latte.", rain: "A rainy day: a hot Hot Chocolate.", closing: "Last call: an Osmanthus Tea.", series: "Series night: a Mocha with the Daily Cake." },
    robotMood: { morning: "Good morning, just opened.", noon: "The afternoon crowd is slow.", golden: "Coffee tastes better in this light.", rain: "Rainy day: another hot one?", closing: "We're closed, but stay a while.", series: "What are we watching tonight? I'll make something hot." },
  },
};
const $ = (id) => document.getElementById(id);
const viewButtons = $("views");
function updateViewScrollHint() {
  const canScroll = viewButtons.scrollWidth > viewButtons.clientWidth + 1;
  viewButtons.classList.toggle("has-more", canScroll && viewButtons.scrollLeft <= 8);
}
viewButtons.addEventListener("scroll", updateViewScrollHint, { passive: true });
window.addEventListener("resize", updateViewScrollHint);
const params = new URLSearchParams(location.search);
let lang = params.get("lang") === "en" ? "en" : "zh";
let currentView = "middle"; // every view is a place to stand and turn all the way round; the room opens in the middle, facing the corner with the cat
const LOOK_KEYS = ["brick", "counter", "back", "wall", "wallpaper", "wainscot", "floor", "rug", "lamp", "clock", "stool", "menu", "gallery", "scarf", "chair", "ceiling", "lounge"];
let look = {};
function syncLookUrl() {
  const url = new URL(location.href);
  for (const group of LOOK_KEYS) { if (look[group] && look[group] !== room?.lookDefaults?.[group]) url.searchParams.set(group, look[group]); else url.searchParams.delete(group); }
  history.replaceState(history.state, "", url);
}
function renderSwaps() {
  const copy = COPY[lang], root = $("swapGroups");
  $("swapsTitle").textContent = copy.swapsTitle; $("randomLook").textContent = copy.randomLook; $("resetLook").textContent = copy.resetLook;
  root.replaceChildren(...LOOK_KEYS.map((group) => {
    const [title, options] = copy.groups[group], wrap = document.createElement("div"), h = document.createElement("h3"), row = document.createElement("div");
    wrap.className = "swap-group"; h.textContent = title; row.className = "swap-options"; row.setAttribute("role", "group"); row.setAttribute("aria-label", title);
    for (const [key, label] of Object.entries(options)) {
      const button = document.createElement("button"); button.type = "button"; button.textContent = label; button.dataset.group = group; button.dataset.key = key; button.setAttribute("aria-pressed", String(look[group] === key));
      button.addEventListener("click", () => { room?.setLook(group, key, true); look = room.look(); renderSwaps(); syncLookUrl(); });
      row.append(button);
    }
    wrap.append(h, row); return wrap;
  }));
}
function lookIsDefault() { return LOOK_KEYS.every((g) => look[g] === room?.lookDefaults?.[g]); }
let catLine = -1, baristaLine = -1, tabletLine = -1, recordTrackShown = 0, recordHintDone = false, recordHintTimer = 0;
let room = null, mood = "golden", bubbleOwner = "robot", bubbleTimer = 0, recordTimer = 0, dripTimer = 0, moodLineKey = "golden";

function renderMoods() {
  const copy = COPY[lang], group = $("moods");
  group.setAttribute("aria-label", copy.moodsLabel);
  const scroll = group.scrollLeft;
  group.replaceChildren(...Object.entries(copy.moods).map(([key, [label]]) => {
    const button = document.createElement("button");
    button.type = "button"; button.dataset.mood = key; button.textContent = label; button.setAttribute("aria-pressed", String(key === mood));
    button.addEventListener("click", () => {
      if (mood === key) return;
      mood = key; room?.setMood(key); look = room.look(); renderSwaps(); // the mood may bring its own rug, so the swatches follow
      for (const option of group.children) option.setAttribute("aria-pressed", String(option === button));
      $("why").textContent = copy.moods[key][1];
      sayMood(key);
    });
    return button;
  }));
  group.scrollLeft = scroll;
  $("why").textContent = copy.moods[mood][1];
}
function renderCopy() {
  const copy = COPY[lang];
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  document.title = `${ROOM_TITLE} · ROOMVERSE 3D`;
  $("enter").textContent = copy.enter;
  $("immersiveEnter").textContent = copy.fullScreen;
  $("immersiveExit").textContent = copy.exitFullScreen;
  $("immersiveDoor").textContent = copy.portal;
  $("views").setAttribute("aria-label", copy.viewsLabel);
  $("title").textContent = copy.title; $("subtitle").textContent = copy.subtitle; $("lead").textContent = copy.lead; $("note").textContent = copy.note;
  $("lang").textContent = copy.lang; $("lang").setAttribute("aria-label", copy.languageLabel);
  const others = $("otherRooms"); others.textContent = copy.otherRooms; others.setAttribute("aria-label", copy.otherRoomsLabel); others.href = `/prototype/roomverse-3d/?lang=${lang}`;
  const home = $("portfolioHome"); home.textContent = copy.portfolioHome; home.setAttribute("aria-label", copy.portfolioHomeLabel); home.href = `/?lang=${lang}`;
  $("stage").querySelector("canvas")?.setAttribute("aria-label", copy.canvas);
  for (const b of document.querySelectorAll("[data-view]")) { b.textContent = copy.views[b.dataset.view]; b.setAttribute("aria-pressed", String(b.dataset.view === currentView)); }
  $("robotHit").setAttribute("aria-label", copy.robotLabel); $("menuHit").setAttribute("aria-label", copy.menuLabel); $("catHit").setAttribute("aria-label", copy.catLabel); $("baristaHit").setAttribute("aria-label", copy.baristaLabel); $("tabletHit").setAttribute("aria-label", copy.tabletLabel); $("noteHit").setAttribute("aria-label", copy.noteLabel); $("recordHit").setAttribute("aria-label", copy.recordLabel); $("dripHit").setAttribute("aria-label", copy.dripLabel);
  renderBubble(); renderMoods(); renderSwaps();
  $("resetLook").hidden = !room || lookIsDefault();
  updateViewScrollHint();
}

// Room tap targets and one shared bubble float over the 3D view and follow their anchors on screen.
function placeTarget(button, rect) {
  if (!rect) { button.hidden = true; return; }
  const width = Math.max(44, rect.right - rect.left), height = Math.max(44, rect.bottom - rect.top), stageRect = $("stage").getBoundingClientRect();
  button.hidden = false;
  Object.assign(button.style, { left: `${rect.left - stageRect.left + (rect.right - rect.left) / 2 - width / 2}px`, top: `${rect.top - stageRect.top + (rect.bottom - rect.top) / 2 - height / 2}px`, width: `${width}px`, height: `${height}px` });
}

// The record-player hint (Paul, 2026-11-16: visitors should know there is music): once per visit, when the record player has been on screen for about a second and it is not late night
// (after closing and series night are excluded), a small bubble says to tap it. It lets taps through and goes away by itself; tapping the record ends the hint for good.
function recordOnScreen() {
  if (!room || recordHintDone || params.get("hint") === "0" || mood === "closing" || mood === "series") return false;
  const rect = room.recordScreen(), stage = $("stage").getBoundingClientRect(); if (!rect) return false;
  const cx = (rect.left + rect.right) / 2, cy = (rect.top + rect.bottom) / 2;
  return rect.right - rect.left > 16 && cx > stage.left + stage.width * 0.12 && cx < stage.right - stage.width * 0.12 && cy > stage.top + stage.height * 0.18 && cy < stage.bottom - stage.height * 0.22;
}
function watchRecordHint() {
  if (!recordOnScreen() || !$("bubble").hidden) { clearTimeout(recordHintTimer); recordHintTimer = 0; return; }
  if (recordHintTimer) return;
  recordHintTimer = setTimeout(() => { recordHintTimer = 0; if (recordOnScreen() && $("bubble").hidden) { recordHintDone = true; openBubble("recordHint", 7000); } }, 1300);
}
function placeUi() {
  if (!room) return;
  const robotRect = room.robotScreen(), catRect = room.catScreen ? room.catScreen() : null, baristaRect = room.baristaScreen ? room.baristaScreen() : null, tabletRect = room.tabletScreen ? room.tabletScreen() : null, menuBox = room.menuScreen(), noteRect = room.noteScreen(), recordRect = room.recordScreen(), dripRect = room.dripScreen();
  const menuRect = menuBox && { left: (menuBox.left + menuBox.right) / 2, right: (menuBox.left + menuBox.right) / 2, top: (menuBox.top + menuBox.bottom) / 2, bottom: (menuBox.top + menuBox.bottom) / 2 };
  // the small keyboard / screen-reader button sits between the two boards; the boards themselves take taps on the canvas
  placeTarget($("catHit"), catRect); placeTarget($("baristaHit"), baristaRect); placeTarget($("tabletHit"), tabletRect); placeTarget($("menuHit"), menuRect); placeTarget($("robotHit"), robotRect); placeTarget($("noteHit"), noteRect); placeTarget($("recordHit"), recordRect); placeTarget($("dripHit"), dripRect);
  const bubble = $("bubble"), anchor = bubbleOwner === "recordHint" ? recordRect : bubbleOwner === "tablet" ? tabletRect : bubbleOwner === "barista" ? baristaRect : bubbleOwner === "cat" ? catRect : bubbleOwner === "menu" ? menuRect : bubbleOwner === "note" ? noteRect : bubbleOwner === "record" ? recordRect : bubbleOwner === "drip" ? dripRect : robotRect;
  watchRecordHint();
  bubble.style.pointerEvents = bubbleOwner === "recordHint" ? "none" : "";
  const closeButton = bubble.querySelector("[data-close]"); if (closeButton) closeButton.hidden = bubbleOwner === "recordHint"; // the hint lets taps through and goes away by itself
  if (bubble.hidden) return;
  if (!anchor) { bubble.hidden = true; return; }
  const stageRect = $("stage").getBoundingClientRect(), half = bubble.offsetWidth / 2 + 8;
  const x = Math.min(stageRect.width - half, Math.max(half, (anchor.left + anchor.right) / 2 - stageRect.left));
  const controlsTop = immersive ? $("immersiveControls").getBoundingClientRect().top - stageRect.top : stageRect.height;
  const headerBottom = immersive ? $("immersiveExit").getBoundingClientRect().bottom - stageRect.top : 0;
  const y = Math.min(controlsTop - 8, Math.max(headerBottom + bubble.offsetHeight + 8, anchor.top - stageRect.top - 12));
  Object.assign(bubble.style, { left: x + "px", top: y + "px" });
}
function renderBubble() {
  const copy = COPY[lang], bubble = $("bubble");
  bubble.querySelector("[data-line]").textContent = bubbleOwner === "note" ? copy.noteLine : bubbleOwner === "record" ? copy.recordLines[recordTrackShown] : bubbleOwner === "recordHint" ? copy.recordHint : bubbleOwner === "drip" ? copy.dripLine : bubbleOwner === "tablet" ? (mood === "closing" || mood === "series" ? copy.tabletNight[tabletLine % copy.tabletNight.length] : copy.tabletDay[tabletLine % copy.tabletDay.length]) : bubbleOwner === "barista" ? copy.baristaLines[baristaLine % copy.baristaLines.length] : bubbleOwner === "cat" ? copy.catLines[catLine % copy.catLines.length] : bubbleOwner === "menu" ? copy.menuPick[mood] : bubbleOwner === "mood" ? copy.robotMood[moodLineKey] : copy.robotLine;
  const cover = bubble.querySelector("[data-cover]"); // the record's cover (Codex card 69, C1 to C3) shows while a record plays
  cover.hidden = bubbleOwner !== "record"; if (!cover.hidden) { cover.src = new URL(`./art/room04-record-cover-${recordTrackShown}-v1.webp`, import.meta.url).href; cover.alt = copy.recordLines[recordTrackShown].replace(/^♪ /, "").split("。")[0]; }
  const title = bubble.querySelector("[data-title]"); title.textContent = copy.noteTitle; title.hidden = bubbleOwner !== "note";
  const link = bubble.querySelector("[data-travel]"); link.textContent = copy.robotChoose; link.href = `/prototype/roomverse-3d/?lang=${lang}`; link.hidden = bubbleOwner !== "robot";
  bubble.querySelector("[data-close]").setAttribute("aria-label", copy.close);
}
function closeBubble() { $("bubble").hidden = true; clearTimeout(bubbleTimer); }
function openBubble(owner, ms) {
  bubbleOwner = owner; renderBubble(); $("bubble").hidden = false; placeUi();
  if (owner === "robot") room?.robotHop();
  clearTimeout(bubbleTimer); bubbleTimer = setTimeout(closeBubble, ms);
}
function sayMood(key) { moodLineKey = key; if (!$("bubble").hidden && bubbleOwner === "note") return; openBubble("mood", 3200); }

$("lang").addEventListener("click", () => {
  lang = lang === "en" ? "zh" : "en";
  const url = new URL(location.href); url.searchParams.set("lang", lang); history.replaceState(history.state, "", url);
  renderCopy();
  placeUi();
});
for (const b of document.querySelectorAll("[data-view]")) b.addEventListener("click", () => {
  if (!room) return;
  currentView = b.dataset.view; room.setView(currentView); closeBubble(); renderCopy();
  $("why").textContent = COPY[lang].centerHint; $("stage").querySelector("canvas")?.focus({ preventScroll: true });
});
$("randomLook").addEventListener("click", () => { if (!room) return; room.randomLook(); look = room.look(); renderSwaps(); syncLookUrl(); $("resetLook").hidden = false; $("why").textContent = COPY[lang].randomDone; });
$("resetLook").addEventListener("click", () => { room.resetLook(); look = room.look(); renderSwaps(); syncLookUrl(); $("resetLook").hidden = true; renderMoods(); });
$("robotHit").addEventListener("click", () => { room?.pokeRobot?.(); openBubble("robot", 7000); });
$("menuHit").addEventListener("click", () => { room?.pokeRobot?.(); openBubble("menu", 7000); }); // tap the menu boards: the robot picks a drink for the mood
$("catHit").addEventListener("click", () => { catLine += 1; openBubble("cat", 5000); }); // the cat answers a tap, a different line each time
$("baristaHit").addEventListener("click", () => { baristaLine += 1; room?.pokeRobot?.(); openBubble("barista", 6000); }); // the robot at the machine answers too, a different line each time
$("tabletHit").addEventListener("click", () => { tabletLine += 1; room?.pokeTablet?.(); openBubble("tablet", 6500); }); // the lounge tablet: day lines, and notifications at night
$("recordHit").addEventListener("click", () => {
  if (!room) return;
  if (room.recordPlaying()) {
    room.stopRecordPlayback(); clearTimeout(recordTimer); recordTimer = 0; closeBubble();
    return;
  }
  room.playRecord(); recordHintDone = true; clearTimeout(recordHintTimer); recordTrackShown = room.soundState().track || 0; openBubble("record", 30000);
  clearTimeout(recordTimer); recordTimer = setTimeout(() => { room?.stopRecordPlayback(); closeBubble(); recordTimer = 0; }, 30000);
});
$("dripHit").addEventListener("click", () => {
  if (!room) return;
  if (room.dripPlaying()) {
    room.stopDrip(); clearTimeout(dripTimer); dripTimer = 0; closeBubble();
    return;
  }
  room.playDrip(); openBubble("drip", 20000);
  clearTimeout(dripTimer); dripTimer = setTimeout(() => { room?.stopDrip(); closeBubble(); dripTimer = 0; }, 20000);
});
$("noteHit").addEventListener("click", () => openBubble("note", 9000));
$("bubble").querySelector("[data-close]").addEventListener("click", closeBubble);
$("bubble").addEventListener("pointerenter", () => clearTimeout(bubbleTimer));
const shell = $("stage").parentElement;
const headerActions = $("portfolioHome").parentElement;
let immersive = false, exiting = false, destinationUrl = null;
const travelDoor = initTravelDoor({
  currentRoom: "room04",
  getLang: () => lang,
  beforeOpen: (trigger) => { if (trigger?.matches("[data-travel]")) clearTimeout(bubbleTimer); },
  onChoose: (_destination, href) => {
    if (immersive) {
      destinationUrl = href;
      exitImmersive();
    } else location.assign(href);
  },
});

function placePortfolioHome(on) {
  if (on) {
    $("immersiveExits").prepend($("portfolioHome"));
    $("immersiveExits").append($("lang"));
  } else {
    headerActions.prepend($("portfolioHome"));
    headerActions.append($("lang"));
  }
}

function setImmersive(on) {
  if (!room || immersive === on) return;
  immersive = on;
  placePortfolioHome(on);
  shell.classList.toggle("is-immersive", on);
  document.documentElement.classList.toggle("room-immersive", on);
  for (const section of shell.parentElement.children) if (section !== shell) section.inert = on;
  headerActions.closest("header").inert = on;
  if (on) {
    $("immersiveControls").append($("views"), $("moods"));
    $("views").prepend($("randomLook")); // the gold "build me a random cafe" tag leads the view row, so it stays on screen in full screen
    $("immersiveExit").focus({ preventScroll: true });
  } else {
    $("swapActions").prepend($("randomLook"));
    shell.append($("views"));
    $("roomControls").append($("moods"));
    $("immersiveEnter").focus({ preventScroll: true });
  }
  room.resize();
  requestAnimationFrame(() => { room.resize(); placeUi(); });
}

function exitImmersive() {
  if (!immersive || exiting) return;
  exiting = true;
  history.back();
}

$("immersiveEnter").addEventListener("click", () => {
  if (!room || immersive) return;
  history.pushState({ ...history.state, room04Immersive: true }, "", location.href);
  setImmersive(true);
});
$("immersiveExit").addEventListener("click", exitImmersive);
addEventListener("popstate", (event) => {
  exiting = false;
  const on = Boolean(event.state?.room04Immersive);
  if (immersive === on) return;
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(event.state, "", url);
  if (travelDoor.element.open) travelDoor.element.close();
  setImmersive(on);
  if (destinationUrl) {
    const href = destinationUrl;
    destinationUrl = null;
    location.assign(href);
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || travelDoor.element.open) return;
  if (immersive) { event.preventDefault(); exitImmersive(); }
  else if (!$("bubble").hidden) closeBubble();
});
document.addEventListener("keydown", (event) => {
  if ((event.key !== "ArrowRight" && event.key !== "ArrowLeft") || !event.target?.dataset?.mood) return;
  const buttons = [...$("moods").querySelectorAll("button")], i = buttons.indexOf(event.target), next = buttons[(i + (event.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length];
  next.focus(); event.preventDefault();
});

renderCopy();
let entering = false;
async function enterRoom() {
 if (entering || room) return;
 entering = true; $("poster").hidden = true; document.documentElement.classList.remove("arriving"); $("status").hidden = false; $("status").textContent = COPY[lang].loading;
 performance.mark("room04-enter");
 try {
  const { start } = await import("./cafe.js?v=auto");
  room = await start({ stage: $("stage"), onMenuTap: () => { room?.pokeRobot?.(); openBubble("menu", 7000); } });
  const canvas = $("stage").querySelector("canvas");
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", COPY[lang].canvas);
  room.onRender(placeUi);
  if (params.get("perf") === "1") perfPanel(room);
  $("immersiveEnter").hidden = false;
  $("status").hidden = true; $("roomControls").hidden = false; $("moodNote").hidden = false; $("swapActions").hidden = false;
  for (const b of document.querySelectorAll("[data-view]")) b.hidden = false;
  for (const group of LOOK_KEYS) { const key = params.get(group); if (key) room.setLook(group, key, group === "rug"); }
  look = room.look(); $("randomLook").disabled = false; $("swaps").hidden = false; renderCopy(); syncLookUrl();
  placeUi();
  window.__room04 = room; // test hook
} catch (error) {
  console.error(error);
  $("status").textContent = COPY[lang].failed; $("poster").hidden = false; entering = false;
 }
}
$("enter").addEventListener("click", enterRoom);
if (["room01", "room02", "room03"].includes(params.get("from"))) enterRoom();

// ?perf=1 shows a small panel with real frame times, so a phone can report numbers: the average and the slowest 5% of the last 120 frames
// (frames are drawn on demand, so only frames close together while turning count), the counts of the last frame, and the time from "enter" to the first render.
function perfPanel(room) {
  const box = document.createElement("pre");
  Object.assign(box.style, { position: "fixed", left: "6px", bottom: "6px", zIndex: "99", margin: "0", padding: "6px 8px", background: "#000c", color: "#9f9", font: "11px/1.35 ui-monospace,monospace", borderRadius: "6px", pointerEvents: "none", whiteSpace: "pre" });
  document.body.append(box);
  const gaps = []; let last = 0;
  room.onRender(() => { const now = performance.now(); if (last && now - last < 250) { gaps.push(now - last); if (gaps.length > 120) gaps.shift(); } last = now; });
  const mark = (name) => performance.getEntriesByName(name)[0]?.startTime;
  setInterval(() => {
    const sorted = [...gaps].sort((a, b) => a - b), avg = gaps.reduce((s, v) => s + v, 0) / (gaps.length || 1), p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0, st = room.stats();
    const first = mark("room04-first-render") - mark("room04-enter");
    box.textContent = "frame avg " + avg.toFixed(1) + " ms  slowest5% " + p95.toFixed(1) + " ms  (" + gaps.length + " frames)\ncalls " + st.calls + "  tris " + st.triangles + "  geo " + st.geometries + "  tex " + st.textures + "  prog " + st.programs + "\nenter to first render " + (Number.isFinite(first) ? first.toFixed(0) + " ms" : "-") + "  dpr " + devicePixelRatio;
  }, 500);
}
