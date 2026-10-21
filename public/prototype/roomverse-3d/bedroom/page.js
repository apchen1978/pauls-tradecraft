// ROOMVERSE studio page: text, language, and loading the 3D room only when the visitor asks for it.
const COPY = {
  zh: {
    title: "ROOMVERSE 的第二個房間：一個人住的套房",
    lead: "ROOMVERSE 像 universe 一樣，不會只有一個房間。第一間是客廳，這是第二間：一個人住的套房，睡覺、工作、窩著放鬆都在同一個空間。目前是第 1 階段，先看空房間的光，家具之後一件一件放進來。拖一下轉動房間。",
    enter: "走進第二個房間", size: "施工中的第 1 階段：空房間與白天的光", loading: "房間準備中…", failed: "這台裝置打不開 3D。",
    note: "施工中。這是 ROOMVERSE 的第二個房間，由程式一件一件建起來；目前只有牆、地板、窗、門和白天的光。窗外景色是程式畫的示意，不是真實地點。不是真實商品，實際顏色與質感仍要看樣品和現場光線。",
    home: "← ROOMVERSE", lang: "EN",
  },
  en: {
    title: "ROOMVERSE, room two: a studio for one",
    lead: "ROOMVERSE works like a universe: it will never be just one room. The first room is a living room; this is the second, a studio for one where sleeping, working and unwinding share one space. We are at stage 1: the light in the empty room first, with the furniture coming in one piece at a time. Drag to turn the room.",
    enter: "Step into the second room", size: "Work in progress, stage 1: the empty room and daylight", loading: "Setting up the room…", failed: "3D can't open on this device.",
    note: "Work in progress. This is ROOMVERSE's second room, built in code piece by piece; for now it has walls, floor, window, door and daylight. The view outside is a drawn sketch, not a real place. Not real products; check real colours and textures with samples and on-site light.",
    home: "← ROOMVERSE", lang: "中",
  },
};
const $ = (id) => document.getElementById(id);
let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
let room = null;
function text() {
  const c = COPY[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  $("title").textContent = c.title; $("lead").textContent = c.lead; $("enter").textContent = c.enter; $("size").textContent = c.size;
  $("note").textContent = c.note; $("home").textContent = c.home; $("home").href = `../?lang=${lang}`; $("lang").textContent = c.lang;
  room?.setLang(lang);
}
$("lang").onclick = () => { lang = lang === "zh" ? "en" : "zh"; const u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(null, "", u); text(); };
$("enter").onclick = async () => {
  $("poster").hidden = true; $("status").hidden = false; $("status").textContent = COPY[lang].loading;
  try {
    const { start } = await import("./bedroom.js?v=1");
    room = await start({ stage: $("stage"), lang });
    $("status").hidden = true;
    window.__bedroom = room; // test hook
  } catch (e) {
    console.error(e);
    $("poster").hidden = false; $("status").textContent = COPY[lang].failed;
  }
};
text();
