import { start, ROOM_TITLE } from "./kitchen.js?v=105";
const COPY = {
  zh: {
    title: ROOM_TITLE,
    lead: "灣區中世紀現代風的開放廚房與餐區。拖曳畫面，從室內看看木樑、玻璃門與小院。",
    note: "這是一間受灣區 Eichler 住宅語彙啟發的想像房間，不是實際住宅或施工圖。",
    otherRooms: "← 其他房間", otherRoomsLabel: "前往其他 ROOMVERSE 房間", robotLabel: "廚房小機器人：點我看要去哪個房間", robotLine: "我是廚房的小幫手。想去哪個房間？", doorLabel: "房間的門：點一下打開", doorLine: "這扇門通到其他房間。想去哪一間？", robotToLiving: "← 客廳 Room 01", robotToBedroom: "臥室 Room 02 →", languageLabel: "切換語言", roomLabel: "Room 03 3D 房間", settingsLabel: "Room 03 設定",
    full: "全螢幕", exit: "退出", lang: "EN", loading: "房間準備中…", failed: "這台裝置無法開啟 3D 場景。",
    center: "站在房間中間", orbit: "回到環繞視角", plaque: "看入口牆", nook: "走近小角落", swapsLabel: "換搭配",
    swaps: {
      "cable-car": ["右側牆的畫", { "cable-car": "舊金山電車", "fog-bridge": "霧中金門大橋", "marin-hills": "馬林海岬", "poster-sun": "山丘與太陽" }],
      "redwood-path": ["入口走廊的畫", { "redwood-path": "紅杉步道", "ferry-building": "渡輪大廈", "oak-street": "橡樹街", "poster-arch": "拱門海報", "poster-leaf": "葉片海報" }],
      wallpaper: ["右側牆壁紙", { "grasscloth-oat": "草織（燕麥）", "grasscloth-sage": "草織（鼠尾草綠）", "grasscloth-charcoal": "草織（炭灰）", none: "無（奶油牆）" }],
      "lamp-wall": ["窗邊燈上方的畫", { "fog-bridge": "霧中金門大橋", "ferry-building": "渡輪大廈", "moon-hills": "丘陵與月", "hills-sun": "丘陵與日", "botanical-window": "窗台花瓶" }],
      yard: ["窗外景色", { auto: "跟著感覺", "fog-morning": "濃霧早晨", "spring-bloom": "春天花開", "overcast-rain": "陰天微雨" }],
    }, canvasLabel: "房間視角。中心模式可用方向鍵環顧。",
    moods: {
      daylight: ["日光", "灣區白天的柔和日光，偏白、偏亮，吊燈只微微亮著。"],
      golden: ["黃金時刻", "午後低角度暖光從左側玻璃門斜入，吊燈維持柔和。"],
      movie: ["追劇夜", "中央吊燈關掉，螢幕放冷色城市，落地燈與桌燈留著暖光。"],
      night: ["夜晚", "院子轉為藍調，圓球燈、櫥下燈與側廚房暖光照亮餐區。"],
      dinner: ["晚餐", "吊燈轉暖，檯面雙吊燈與桌燈點著，低角度的暖陽還留一點。"],
      sunday: ["週日早晨", "光線偏冷、偏亮，吊燈關著，落地燈與桌燈只微微亮。"],
      thanksgiving: ["感恩節", "院子換成秋色，螢幕放遊行，燈光是琥珀色。"],
    },
  },
  en: {
    title: ROOM_TITLE,
    lead: "An open kitchen and dining room inspired by Bay Area mid-century modern homes. Drag to look around the timber beams, glass doors and small garden.",
    note: "An imagined room inspired by Bay Area Eichler architecture; it is not a real residence or construction plan.",
    otherRooms: "← Other rooms", otherRoomsLabel: "Go to another ROOMVERSE room", robotLabel: "Kitchen robot: tap to choose another room", robotLine: "I look after the kitchen. Where would you like to go?", doorLabel: "Room door: tap to open", doorLine: "This door leads to the other rooms. Where to?", robotToLiving: "← Living room, Room 01", robotToBedroom: "Bedroom, Room 02 →", languageLabel: "Switch language", roomLabel: "Room 03 3D room", settingsLabel: "Room 03 settings",
    full: "Full screen", exit: "Exit", lang: "中", loading: "Preparing the room…", failed: "3D could not open on this device.",
    center: "Stand in the room", orbit: "Return to orbit", plaque: "Entry wall", nook: "Closer to the nook", swapsLabel: "Swap the look",
    swaps: {
      "cable-car": ["Painting, right wall", { "cable-car": "Cable car", "fog-bridge": "Golden Gate in fog", "marin-hills": "Marin headlands", "poster-sun": "Hills and sun" }],
      "redwood-path": ["Painting, entry hall", { "redwood-path": "Redwood path", "ferry-building": "Ferry Building", "oak-street": "Oak street", "poster-arch": "Arch poster", "poster-leaf": "Leaf poster" }],
      wallpaper: ["Right-wall wallpaper", { "grasscloth-oat": "Grasscloth, oat", "grasscloth-sage": "Grasscloth, sage", "grasscloth-charcoal": "Grasscloth, charcoal", none: "None (cream wall)" }],
      "lamp-wall": ["Painting above the lamp", { "fog-bridge": "Golden Gate in fog", "ferry-building": "Ferry Building", "moon-hills": "Hills and moon", "hills-sun": "Hills and sun", "botanical-window": "Window-sill vase" }],
      yard: ["View outside", { auto: "Follow the mood", "fog-morning": "Foggy morning", "spring-bloom": "Spring bloom", "overcast-rain": "Overcast and damp" }],
    }, canvasLabel: "Room view. Use arrow keys to look around in center mode.",
    moods: {
      daylight: ["Daylight", "Soft Bay Area daylight, whiter and brighter, with the pendant only just on."],
      golden: ["Golden hour", "Low, warm afternoon light enters through the glass doors; the pendant stays soft."],
      movie: ["Movie night", "The pendant is off, the screen shows a cool city, and the floor and table lamps stay warm."],
      night: ["Night", "The garden turns blue while the globe pendant, counter light and side kitchen warm the dining room."],
      dinner: ["Dinner", "The pendant warms up, the counter lamps and table lamp are on, and a low warm sun remains."],
      sunday: ["Sunday morning", "The light is cooler and brighter, the pendant is off, and the floor and table lamps stay dim."],
      thanksgiving: ["Thanksgiving", "The garden turns to autumn, the screen shows a parade, and the light is amber."],
    },
  },
};
const $ = (id) => document.getElementById(id);
let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
let room = null;
let mood = "daylight";
let immersive = false;
let centerMode = false;

function otherRoomsUrl() {
  const from = new URLSearchParams(location.search).get("from");
  const url = new URL(from === "room02" ? "../bedroom/" : "../", location.href);
  url.searchParams.set("lang", lang === "en" ? "en" : "zh");
  return url.href;
}

const artChoice = { "cable-car": "cable-car", "redwood-path": "redwood-path", "lamp-wall": "fog-bridge", yard: "auto", wallpaper: "grasscloth-oat" };
function renderSwaps() {
  const copy = COPY[lang];
  $("swapsTitle").textContent = copy.swapsLabel;
  $("swapGroups").replaceChildren(...Object.entries(copy.swaps).map(([frame, [label, options]]) => {
    const group = document.createElement("div");
    group.className = "swap-group";
    group.dataset.frame = frame;
    const title = document.createElement("h3");
    title.textContent = label;
    const row = document.createElement("div");
    row.className = "swap-options";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", label);
    for (const [key, text] of Object.entries(options)) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.frame = frame;
      button.dataset.art = key;
      button.textContent = text;
      button.setAttribute("aria-pressed", String(artChoice[frame] === key));
      button.addEventListener("click", () => {
        artChoice[frame] = key;
        if (frame === "yard") room?.setYardView(key); else if (frame === "wallpaper") room?.setWallpaper(key); else room?.setArtwork(frame, key);
        for (const other of row.children) other.setAttribute("aria-pressed", String(other.dataset.art === key));
      });
      row.append(button);
    }
    group.append(title, row);
    return group;
  }));
}

function renderMoods() {
  const copy = COPY[lang];
  const group = $("moods");
  const focusedMood = document.activeElement?.dataset?.mood;
  const previousScrollLeft = group.scrollLeft;
  group.setAttribute("aria-label", lang === "zh" ? "選擇感覺" : "Choose a mood");
  group.replaceChildren(...Object.entries(copy.moods).map(([key, [label]]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.mood = key;
    button.textContent = label;
    button.setAttribute("aria-pressed", String(key === mood));
    button.addEventListener("click", () => {
      mood = key;
      renderMoods();
      $("why").textContent = COPY[lang].moods[mood][1];
      void room?.setMood(mood);
    });
    return button;
  }));
  $("why").textContent = copy.moods[mood][1];
  group.scrollLeft = previousScrollLeft;
  const selectedButton = group.querySelector('[data-mood="' + mood + '"]');
  let moodToReveal = selectedButton;
  if (focusedMood) {
    const focusedButton = group.querySelector('[data-mood="' + focusedMood + '"]');
    focusedButton?.focus({ preventScroll: true });
    moodToReveal = focusedButton || selectedButton;
  }
  if (moodToReveal) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (moodToReveal.isConnected && group.scrollWidth > group.clientWidth) {
        const groupRect = group.getBoundingClientRect();
        const buttonRect = moodToReveal.getBoundingClientRect();
        const originalSnap = group.style.scrollSnapType;
        group.style.scrollSnapType = "none";
        // Bring the button to the row's left edge (a snap point), not to an end: with seven moods a middle button can be a full screen from either end.
        if (buttonRect.left < groupRect.left || buttonRect.right > groupRect.right) group.scrollLeft += buttonRect.left - groupRect.left;
        requestAnimationFrame(() => { group.style.scrollSnapType = originalSnap; });
      }
    }));
  }
}

function renderCopy() {
  const copy = COPY[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.title = ROOM_TITLE;
  $("title").textContent = copy.title;
  $("lead").textContent = copy.lead;
  $("note").textContent = copy.note;
  $("lang").textContent = copy.lang;
  $("lang").setAttribute("aria-label", copy.languageLabel);
  document.querySelector(".room").setAttribute("aria-label", copy.roomLabel);
  document.querySelector(".toolbar").setAttribute("aria-label", copy.settingsLabel);
  $("immersiveEnter").textContent = copy.full;
  $("immersiveExit").textContent = copy.exit;
  $("centerView").textContent = centerMode ? copy.orbit : copy.center;
  $("centerView").setAttribute("aria-pressed", String(centerMode));
  $("plaqueView").textContent = copy.plaque;
  $("nookView").textContent = copy.nook;
  renderSwaps();
  document.querySelector('#stage canvas')?.setAttribute('aria-label', copy.canvasLabel);
  for (const id of ["headerOtherRooms", "immersiveOtherRooms"]) {
    const link = $(id);
    link.textContent = copy.otherRooms;
    link.setAttribute("aria-label", copy.otherRoomsLabel);
    link.href = otherRoomsUrl();
  }
  renderMoods();
  room?.setLang(lang);
}

function setImmersive(on, pushHistory = true) {
  if (!room || immersive === on) return;
  immersive = on;
  const shell = document.querySelector(".room");
  shell.classList.toggle("is-immersive", on);
  document.documentElement.classList.toggle("room-immersive", on);
  if (on) {
    $("immersiveControls").append($("moods"));
    if (pushHistory) history.pushState({ room03Immersive: true }, "", location.href);
    $("immersiveExit").focus({ preventScroll: true });
  } else {
    document.querySelector(".toolbar").append($("moods"));
    if (pushHistory) history.back();
    const returnTarget = $("immersiveEnter").getClientRects().length ? $("immersiveEnter") : $("lang");
    returnTarget.focus({ preventScroll: true });
  }
  room.resize();
  requestAnimationFrame(() => room.resize());
}

$("immersiveOtherRooms").addEventListener("click", (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const destination = otherRoomsUrl();
  setImmersive(false, false);
  location.replace(destination);
});
document.addEventListener("keydown", (event) => {
  if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && event.target?.dataset?.mood) {
    const buttons = [...$("moods").querySelectorAll("button")];
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : buttons.length - 1;
    buttons[(index + step) % buttons.length].focus();
    return;
  }
  if (event.key !== "Tab" || !immersive) return;
  const controls = [...document.querySelectorAll('.room button, .room a[href], .room canvas[tabindex="0"]')]
    .filter((element) => element.getClientRects().length && !element.disabled);
  const first = controls[0], last = controls.at(-1);
  if (!first || !last) return;
  if (!document.activeElement.closest(".room")) { event.preventDefault(); (event.shiftKey ? last : first).focus(); return; }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
$("immersiveEnter").addEventListener("click", () => setImmersive(true));
$("centerView").addEventListener("click", () => { if (!centerMode) room?.setNookView?.(false); centerMode = !centerMode; room?.setCenterView(centerMode); renderCopy(); });
// Turn the orbit to the entry wall (180 degrees), where the house plaque hangs; leaves the standing view first if it is on.
$("plaqueView").addEventListener("click", () => { room?.setNookView?.(false); if (centerMode) { centerMode = false; room?.setCenterView(false); } room?.setView(Math.PI); renderCopy(); });
// Step closer to the small entry nook (cork board, totes, key shelf); leaves the standing view first, like the entry-wall button.
$("nookView").addEventListener("click", () => { if (centerMode) { centerMode = false; room?.setCenterView(false); } room?.setNookView(true); renderCopy(); });
$("immersiveExit").addEventListener("click", () => setImmersive(false));
addEventListener("popstate", (event) => setImmersive(Boolean(event.state?.room03Immersive), false));
addEventListener("keydown", (event) => {
  if (immersive && event.key === "Escape") {
    event.preventDefault();
    setImmersive(false);
  }
});
$("lang").addEventListener("click", () => {
  lang = lang === "zh" ? "en" : "zh";
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(history.state, "", url);
  renderCopy();
});

renderCopy();
$("status").textContent = COPY[lang].loading;
// The robot's and the door's tap targets and one shared bubble float over the 3D view and follow them on screen.
const robotHit = document.createElement("button");
robotHit.type = "button"; robotHit.id = "robotHit"; robotHit.className = "robot-hit"; robotHit.hidden = true;
const doorHit = document.createElement("button");
doorHit.type = "button"; doorHit.id = "doorHit"; doorHit.className = "robot-hit door-hit"; doorHit.hidden = true;
const robotBubble = document.createElement("div");
robotBubble.id = "robotBubble"; robotBubble.className = "robot-bubble"; robotBubble.hidden = true; robotBubble.setAttribute("role", "dialog");
robotBubble.innerHTML = '<p data-robot-line></p><div class="robot-links"><a data-robot-living></a><a data-robot-bedroom></a></div>';
$("stage").parentElement.append(robotHit, doorHit, robotBubble);
let robotBubbleTimer = 0;
let bubbleOwner = "robot";
function roomUrl(path) { const url = new URL(path, location.href); url.searchParams.set("lang", lang === "en" ? "en" : "zh"); return url.href; }
function renderRobotCopy() {
  const copy = COPY[lang];
  robotHit.setAttribute("aria-label", copy.robotLabel);
  doorHit.setAttribute("aria-label", copy.doorLabel);
  robotBubble.querySelector("[data-robot-line]").textContent = bubbleOwner === "door" ? copy.doorLine : copy.robotLine;
  const living = robotBubble.querySelector("[data-robot-living]"), bedroom = robotBubble.querySelector("[data-robot-bedroom]");
  living.textContent = copy.robotToLiving; living.href = roomUrl("../");
  bedroom.textContent = copy.robotToBedroom; bedroom.href = roomUrl("../bedroom/");
}
function placeTarget(button, rect) {
  if (!rect) { button.hidden = true; return; }
  const width = Math.max(44, rect.right - rect.left), height = Math.max(44, rect.bottom - rect.top);
  button.hidden = false;
  Object.assign(button.style, { left: `${rect.left + (rect.right - rect.left) / 2 - width / 2}px`, top: `${rect.top + (rect.bottom - rect.top) / 2 - height / 2}px`, width: `${width}px`, height: `${height}px` });
}
function placeRobotUi() {
  const robotRect = room?.robotScreen?.(), doorRect = room?.doorScreen?.();
  placeTarget(robotHit, robotRect);
  placeTarget(doorHit, doorRect);
  const anchor = bubbleOwner === "door" ? doorRect : robotRect;
  if (!anchor) { robotBubble.hidden = true; return; }
  if (!robotBubble.hidden) Object.assign(robotBubble.style, { left: `${(anchor.left + anchor.right) / 2}px`, top: `${Math.max(8, anchor.top - 10)}px` });
}
function closeBubble() {
  robotBubble.hidden = true;
  if (room?.doorIsOpen?.()) room.doorClose();
}
function openBubble(owner) {
  bubbleOwner = owner;
  if (owner === "door") room?.doorOpen?.();
  else { room?.robotHop?.(); if (room?.doorIsOpen?.()) room.doorClose(); }
  renderRobotCopy();
  robotBubble.hidden = false;
  placeRobotUi();
  clearTimeout(robotBubbleTimer);
  robotBubbleTimer = setTimeout(closeBubble, 6000);
}
robotHit.addEventListener("click", () => openBubble("robot"));
doorHit.addEventListener("click", () => openBubble("door"));
robotBubble.addEventListener("pointerenter", () => clearTimeout(robotBubbleTimer));
robotBubble.addEventListener("focusin", () => clearTimeout(robotBubbleTimer));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !robotBubble.hidden) { clearTimeout(robotBubbleTimer); closeBubble(); } });

start({ stage: $("stage"), onReady: (instance) => {
  room = instance;
  window.__room03 = instance;
  renderRobotCopy();
  instance.onRender?.(placeRobotUi);
  $("status").hidden = true;
  $("immersiveEnter").hidden = false;
  $("centerView").hidden = false;
  $("plaqueView").hidden = false;
  $("nookView").hidden = false;
  $("swaps").hidden = false;
  renderCopy();
  void room.setMood(mood);
} }).catch((error) => {
  console.error(error);
  $("status").textContent = COPY[lang].failed;
});
