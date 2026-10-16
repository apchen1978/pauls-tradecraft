// ROOMVERSE 3D page: text, language, and loading the 3D room only when the visitor asks for it.
const COPY = {
  zh: {
    title: "同一間房，三種想回家的感覺",
    lead: "先選感覺，再換牆和地毯。光會跟著變，房間的表情也是。拖曳可以轉一點角度看看。",
    enter: "走進 3D 房間", size: "約 0.8 MB，建議用電腦或平板", loading: "房間準備中…", failed: "這台裝置打不開 3D，先看看上面的房間圖。",
    note: "插畫示意。房間裡的家具（沙發、茶几、邊桌、桌燈、落地燈、植物）以 AI 人機協作完成：先畫成插畫，再轉成 3D 形狀，顏色取自原插畫；牆、地毯、光由程式繪製。不是真實商品，實際顏色與質感仍要看樣品和現場光線。",
    home: "← 作品集", lang: "EN",
  },
  en: {
    title: "One room, three ways to come home",
    lead: "Pick a feeling, then change the wall and the rug. The light changes with it, and so does the room's mood. Drag to turn it a little.",
    enter: "Step into the 3D room", size: "About 0.8 MB; best on a computer or tablet", loading: "Setting up the room…", failed: "3D can't open on this device; the picture above shows the room.",
    note: "Illustrated study. The furniture (sofa, coffee table, side table, table lamp, floor lamp, plant) was made through human–AI collaboration: drawn first, turned into 3D shapes, and coloured from the drawings; walls, rugs and light are drawn by code. Not real products; check real colours and textures with samples and on-site light.",
    home: "← Portfolio", lang: "中",
  },
};
const $ = (id) => document.getElementById(id);
let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
let room = null;
function text() {
  const c = COPY[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  $("title").textContent = c.title; $("lead").textContent = c.lead; $("enter").textContent = c.enter; $("size").textContent = c.size;
  $("note").textContent = c.note; $("home").textContent = c.home; $("home").href = `/?lang=${lang}`; $("lang").textContent = c.lang;
  room?.setLang(lang);
}
$("lang").onclick = () => { lang = lang === "zh" ? "en" : "zh"; const u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(null, "", u); text(); };
$("enter").onclick = async () => {
  $("poster").hidden = true; $("status").hidden = false; $("status").textContent = COPY[lang].loading;
  try {
    const { start } = await import("./app.js");
    room = await start({ stage: $("stage"), panel: $("panel"), lang });
    $("status").hidden = true; $("panel").hidden = false;
    window.__room = room; // test hook
  } catch (e) {
    console.error(e);
    $("poster").hidden = false; $("status").textContent = COPY[lang].failed;
  }
};
text();
