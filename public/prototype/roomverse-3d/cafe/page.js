import { start, ROOM_TITLE } from "./cafe.js?v=2";

// Blockout page: title, one line, the room. Moods, the travel door, the robot's lines and the menu come once the blockout is agreed.
const COPY = {
  zh: {
    title: ROOM_TITLE, subtitle: "上海慢板",
    lead: "上海一間紅磚小咖啡廳，早晨剛開店。拖曳畫面看看吧台、菜單牆和臨街的窗。",
    note: "這是粗模：尺寸、機位和早晨的光是真的，咖啡機、糕點櫃和機器人先用簡單形狀代替。",
    portfolioHome: "⌂ 作品集首頁", portfolioHomeLabel: "回到作品集首頁", otherRooms: "← 其他房間", lang: "EN", loading: "房間準備中…", failed: "這台裝置無法開啟 3D 場景。", canvas: "Room 04 咖啡廳的 3D 粗模",
  },
  en: {
    title: ROOM_TITLE, subtitle: "A cafe in Shanghai",
    lead: "A small red-brick cafe in Shanghai, just opened for the morning. Drag to look at the counter, the menu wall and the street window.",
    note: "This is a blockout: the sizes, the camera and the morning light are real; the espresso machine, the pastry case and the robot are plain stand-ins for now.",
    portfolioHome: "⌂ Portfolio home", portfolioHomeLabel: "Back to portfolio home", otherRooms: "← Other rooms", lang: "中文", loading: "Preparing the room…", failed: "This device cannot open the 3D scene.", canvas: "3D blockout of the Room 04 cafe",
  },
};
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
let lang = params.get("lang") === "en" ? "en" : "zh";

function renderCopy() {
  const copy = COPY[lang];
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  document.title = `${ROOM_TITLE} · ROOMVERSE 3D`;
  $("title").textContent = copy.title; $("subtitle").textContent = copy.subtitle; $("lead").textContent = copy.lead; $("note").textContent = copy.note;
  $("lang").textContent = copy.lang; $("portfolioHome").textContent = copy.portfolioHome; $("portfolioHome").href = `/?lang=${lang}`; $("portfolioHome").setAttribute("aria-label", copy.portfolioHomeLabel); $("otherRooms").textContent = copy.otherRooms; $("otherRooms").href = `/prototype/roomverse-3d/?lang=${lang}`;
  $("stage").querySelector("canvas")?.setAttribute("aria-label", copy.canvas);
}
$("lang").addEventListener("click", () => {
  lang = lang === "en" ? "zh" : "en";
  const url = new URL(location.href); url.searchParams.set("lang", lang); history.replaceState(null, "", url);
  renderCopy();
});
renderCopy();
$("status").textContent = COPY[lang].loading;

try {
  const instance = await start({ stage: $("stage") });
  const canvas = $("stage").querySelector("canvas");
  canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", COPY[lang].canvas);
  $("status").hidden = true;
  window.__room04 = instance; // test hook
} catch (error) {
  console.error(error);
  $("status").textContent = COPY[lang].failed;
}
