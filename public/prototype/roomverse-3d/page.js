// ROOMVERSE 3D page: text, language, and loading the 3D room only when the visitor asks for it.
import { initTravelDoor } from "./travel-door.js?v=2";
const TRAVEL_COPY = { zh: { button: "去別的房間 · Travel", bubble: "看看其他房間" }, en: { button: "Travel to another room", bubble: "Explore other rooms" } };
const COPY = {
  zh: {
    title: "換一道光，房間就換了心情",
    lead: "先選感覺，再換牆、地毯、窗簾和掛畫。光會跟著變，房間的表情也是。拖一下轉動房間，或點「看電視牆」。",
    enter: "走進 3D 房間", size: "約 1.3 MB，建議用電腦或平板", loading: "房間準備中…", failed: "這台裝置打不開 3D，先看看上面的房間圖。",
    note: "插畫示意。以 AI 人機協作完成：家具（沙發、茶几、邊桌、桌燈、落地燈、植物和小機器人）先畫成插畫，再轉成 3D 形狀，顏色取自原插畫；小矮椅和筆電的形狀則由程式生成（小矮椅依插畫的側面輪廓）；窗外景色、掛畫、地毯和壁紙也是插畫；房間、光與互動由程式完成。不是真實商品，實際顏色與質感仍要看樣品和現場光線。",
    home: "← 作品集", portal: "推開那扇門 → Room 02 · Brooklyn Studio", portalHint: "客廳右手邊的門也可以直接點。", lang: "EN", open: "點我變風格 ▸", close: "收起 ◂", fullScreen: "全螢幕", exitFullScreen: "退出",
  },
  en: {
    title: "One room, many ways to come home",
    lead: "Pick a feeling, then change the wall, the rug, the curtains and the print. The light changes with it, and so does the room's mood. Drag to turn the room, or tap ‘Turn to the TV wall’.",
    enter: "Step into the 3D room", size: "About 1.3 MB; best on a computer or tablet", loading: "Setting up the room…", failed: "3D can't open on this device; the picture above shows the room.",
    note: "Illustrated study, made through human–AI collaboration: the furniture (sofa, coffee table, side table, table lamp, floor lamp, plant and a small robot) was drawn first, turned into 3D shapes and coloured from the drawings; the small low chair and the laptop are shaped in code (the chair from the side outline of its drawing); the views outside, wall prints, rugs and wallpapers are illustrations too; the room, light and interaction are built in code. Not real products; check real colours and textures with samples and on-site light.",
    home: "← Portfolio", portal: "Push the door → Room 02 · Brooklyn Studio", portalHint: "You can also tap the door on the right-hand wall.", lang: "中", open: "Tap to restyle ▸", close: "Hide ◂", fullScreen: "Full screen", exitFullScreen: "Exit",
  },
};
const $ = (id) => document.getElementById(id);
let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
const arrivedFromRoom02 = new URLSearchParams(location.search).get("from") === "room02";
// Keep these sentences verbatim with the five story cards in feeling-to-room/app.js.
const PEOPLE_STORIES = {
  rain: { zh: "加班到十點，外面下著雨。", en: "Working late; rain is falling outside." },
  chic: { zh: "明早要簡報，想先把自己整理好。", en: "A presentation tomorrow; she wants to feel ready." },
  family: { zh: "週末，兩個孩子和長輩都要來。", en: "The family is coming over this weekend." },
  tech: { zh: "在家寫到半夜，只想要安靜。", en: "Working from home past midnight, they need quiet." },
  tv: { zh: "週五晚上，只想窩著追劇。", en: "Friday night, and she wants nothing but the sofa and a good series." },
};
const entryParams = new URLSearchParams(location.search);
const storyOrigin = entryParams.get("from") === "fu" ? PEOPLE_STORIES[entryParams.get("who")] : null;
let storyHintDismissed = false;
let room = null;
let immersive = false, immersiveHistoryExit = false;
let travelDoor = null;
function renderOriginHint() {
  const hint = $("originHint");
  if (!storyOrigin || storyHintDismissed) { hint.hidden = true; return; }
  const story = storyOrigin[lang];
  $("originStory").textContent = lang === "zh"
    ? `這個房間來自「先有fu，再有家」：${story}`
    : `This room comes from “Feeling First”: ${story}`;
  const back = $("originBack"); back.textContent = lang === "zh" ? "回到她的故事" : "Back to her story";
  back.href = `/prototype/feeling-to-room/?lang=${lang}`;
  const close = $("originClose"); close.textContent = "×"; close.setAttribute("aria-label", lang === "zh" ? "關閉故事提示" : "Close story note");
  hint.hidden = false;
}
function text() {
  const c = COPY[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  $("title").textContent = c.title; $("lead").textContent = c.lead; $("enter").textContent = c.enter; $("size").textContent = c.size;
  $("note").textContent = c.note; $("home").textContent = c.home; $("home").href = `/?lang=${lang}`; $("lang").textContent = c.lang;
  $("portalBtn").textContent = c.portal; $("portalHint").textContent = c.portalHint;
  $("travelDoorBtn").textContent = TRAVEL_COPY[lang].button;
  document.querySelectorAll("[data-travel-door-action]").forEach((button) => { button.textContent = TRAVEL_COPY[lang].bubble; });
  $("immersiveEnter").textContent = c.fullScreen; $("immersiveExit").textContent = c.exitFullScreen; $("immersiveDoor").textContent = c.portal;
  renderOriginHint();
  room?.setLang(lang);
  travelDoor?.refresh();
  setPanelOpen(document.querySelector(".room").classList.contains("panel-open"));
}
// On wide screens the options start tucked away so the whole room can be seen; the button brings them back.
function setPanelOpen(open) {
  document.querySelector(".room").classList.toggle("panel-open", open);
  const t = $("panelToggle"); t.setAttribute("aria-expanded", String(open)); t.textContent = open ? COPY[lang].close : COPY[lang].open;
}
$("panelToggle").onclick = () => setPanelOpen(!document.querySelector(".room").classList.contains("panel-open"));
$("portalBtn").onclick = () => { void room?.openPortal(); };
$("immersiveDoor").onclick = () => { void room?.openPortal(); };
travelDoor = initTravelDoor({
  currentRoom: "room01",
  getLang: () => lang,
  onChoose: (destination, href) => { void room?.openPortal({ transitionColor: destination.transitionColor, destinationUrl: href }); },
  beforeOpen: (trigger) => { if (trigger?.matches?.("[data-travel-door-action]")) room?.pauseGuideBubble(); },
  afterClose: (trigger) => { if (trigger?.matches?.("[data-travel-door-action]")) room?.resumeGuideBubble(); },
});
function setImmersive(on, pushHistory = true) {
  if (!room || immersive === on) return;
  immersive = on;
  document.querySelector(".room").classList.toggle("is-immersive", on);
  document.documentElement.classList.toggle("room-immersive", on);
  if (on) {
    if (pushHistory) history.pushState({ ...(history.state && typeof history.state === "object" ? history.state : {}), room01Immersive: true }, "", location.href);
    $("immersiveExit").focus({ preventScroll: true });
  } else ($("immersiveEnter").getClientRects().length ? $("immersiveEnter") : $("portalBtn")).focus({ preventScroll: true });
  room.resize();
  requestAnimationFrame(() => {
    room.resize();
    if (on) {
      const row = $("immersiveControls").querySelector(".immersive-row:nth-child(2)");
      const selected = row?.querySelector('button[aria-pressed="true"]');
      if (selected) {
        const a = selected.getBoundingClientRect(), r = row.getBoundingClientRect();
        row.scrollLeft += a.left - r.left - (r.width - a.width) / 2;
      }
    }
  });
}
$("immersiveEnter").onclick = () => setImmersive(true);
$("immersiveExit").onclick = () => { immersiveHistoryExit = true; setImmersive(false); history.back(); };
addEventListener("popstate", (event) => {
  if (!immersive && !immersiveHistoryExit && !event.state?.room01Immersive) return;
  const leaving = immersive || immersiveHistoryExit;
  immersiveHistoryExit = false;
  setImmersive(Boolean(event.state?.room01Immersive), false);
  if (leaving && !event.state?.room01Immersive) room?.syncUrl();
});
addEventListener("pageshow", (event) => {
  if (event.persisted && immersive) {
    setImmersive(false, false);
    history.replaceState(null, "", location.href);
  }
});
$("originClose").onclick = () => { storyHintDismissed = true; $("originHint").hidden = true; };
document.addEventListener("keydown", (e) => { if (e.key !== "Escape") return; if (immersive) { e.preventDefault(); $("immersiveExit").click(); } else if (document.querySelector(".room").classList.contains("panel-open") && !$("panelToggle").hidden) { setPanelOpen(false); $("panelToggle").focus(); } });
$("lang").onclick = () => { lang = lang === "zh" ? "en" : "zh"; const u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(history.state, "", u); text(); };
$("enter").onclick = async () => {
  $("poster").hidden = true; $("status").hidden = false; $("status").textContent = COPY[lang].loading;
  try {
    const { start } = await import("./app.js?v=55");
    room = await start({ stage: $("stage"), panel: $("panel"), lang, arriveFromRoom02: arrivedFromRoom02 });
    $("status").hidden = true; $("panel").hidden = false; $("panelToggle").hidden = false; $("portalRow").hidden = false;
    $("roomToolbar").hidden = !matchMedia("(max-width: 768px)").matches;
    $("immersiveEnter").hidden = false;
    setPanelOpen(false);
    window.__room = room; // test hook
    if (arrivedFromRoom02) room.beginReturnArrival();
    // The wall is outside the starting view; defer its optional maps until the room is interactive.
    setTimeout(() => room?.scheduleTvWallTextures(), 1800);
  } catch (e) {
    console.error(e);
    $("poster").hidden = false; $("status").textContent = COPY[lang].failed;
  }
};
text();
if (arrivedFromRoom02) $("enter").click(); // the return trip opens straight into the living room arrival walk
