import { start, ROOM_TITLE } from "./kitchen.js?v=17";
const COPY = {
  zh: {
    title: ROOM_TITLE,
    lead: "灣區中世紀現代風的開放廚房與餐區。拖曳畫面，從室內看看木樑、玻璃門與小院。",
    note: "這是一間受灣區 Eichler 住宅語彙啟發的想像房間，不是實際住宅或施工圖。",
    full: "全螢幕", exit: "退出", lang: "EN", loading: "房間準備中…", failed: "這台裝置無法開啟 3D 場景。",
    moods: {
      golden: ["金色時光", "午後低角度暖光從左側玻璃門斜入，吊燈維持柔和。"],
      night: ["夜晚", "院子轉為藍調，圓球燈、櫥下燈與側廚房暖光照亮餐區。"],
    },
  },
  en: {
    title: ROOM_TITLE,
    lead: "An open kitchen and dining room inspired by Bay Area mid-century modern homes. Drag to look around the timber beams, glass doors and small garden.",
    note: "An imagined room inspired by Bay Area Eichler architecture; it is not a real residence or construction plan.",
    full: "Full screen", exit: "Exit", lang: "中", loading: "Preparing the room…", failed: "3D could not open on this device.",
    moods: {
      golden: ["Golden hour", "Low, warm afternoon light enters through the glass doors; the pendant stays soft."],
      night: ["Night", "The garden turns blue while the globe pendant, counter light and side kitchen warm the dining room."],
    },
  },
};
const $ = (id) => document.getElementById(id);
let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
let room = null;
let mood = "golden";
let immersive = false;

function renderMoods() {
  const copy = COPY[lang];
  const group = $("moods");
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
}

function renderCopy() {
  const copy = COPY[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.title = ROOM_TITLE;
  $("title").textContent = copy.title;
  $("lead").textContent = copy.lead;
  $("note").textContent = copy.note;
  $("lang").textContent = copy.lang;
  $("immersiveEnter").textContent = copy.full;
  $("immersiveExit").textContent = copy.exit;
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
    $("immersiveEnter").focus({ preventScroll: true });
  }
  room.resize();
  requestAnimationFrame(() => room.resize());
}

$("immersiveEnter").addEventListener("click", () => setImmersive(true));
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
start({ stage: $("stage"), onReady: (instance) => {
  room = instance;
  window.__room03 = instance;
  $("status").hidden = true;
  $("immersiveEnter").hidden = false;
  void room.setMood(mood);
} }).catch((error) => {
  console.error(error);
  $("status").textContent = COPY[lang].failed;
});
