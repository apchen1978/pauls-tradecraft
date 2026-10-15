const ASSET_BASE = "./assets/";
const sceneFiles = {
  rain: "room-rug-v2.webp",
  sun: "room-sunny-v1.webp",
  night: "room-evening-v2.webp",
  tech: "room-light-tech-v1.webp",
  breeze: "room-breezy-v1.webp",
  autumn: "room-autumn-v1.webp",
  winter: "room-winter-v1.webp",
  techNight: "room-tech-night-v1.webp",
  homeAssistant: "room-home-assistant-persian.webp",
  homeAssistantModern: "room-home-assistant-modern.webp",
};

const sceneGroups = {
  day: ["rain", "sun", "breeze", "autumn"],
  evening: ["night", "winter"],
  tech: ["tech", "techNight", "homeAssistant", "homeAssistantModern"],
};

const copy = {
  zh: {
    title: "ROOM MODE REMOTE｜軟裝遙控器",
    eyebrow: "一間房，幾種想待的方式",
    intro: "按一下，看看同一間房能變成哪種日子。先選氣氛，再看地毯、窗簾和光怎麼一起讓房間有了表情。",
    label: "留給自己的紙條",
    startingNote: "今天回來時，你希望這個角落怎麼接住你？",
    footer: "這是軟裝搭配的插畫示意。實際顏色、質感與照度，仍需以材質和現場光線確認。",
    sceneHint: "先選一個時刻。每張場景都是完整插畫，沙發、地毯與光會一起變化。",
    mobilePick: "選房間模式",
    mobilePickPrompt: "選一種想待的房間",
    playAreaLabel: "房間場景探索",
    progressLabel: "探索進度",
    switchLanguageLabel: "切換為英文",
    groups: { day: "白日與季節", evening: "夜燈時刻", tech: "輕科技" },
    progress: ["切換時刻", "看見細節", "帶走房間"],
    steps: [
      { kicker: "SET THE MOOD", title: "今天想切到哪一種房間？", description: "選一個想多待一會兒的時刻。每次切換，沙發、地毯和光會一起變。" },
      { kicker: "LOOK CLOSER", title: "是哪個細節留下了你？", description: "選一處仔細看。它如何改變房間的感覺？" },
      { kicker: "YOUR ROOM NOTE", title: "這是你留下的房間。", description: "把此刻和你注意到的細節帶走，留成一張房間明信片。" },
    ],
    scenes: {
      rain: { name: "雨後慢下來", description: "一點雨聲，柔軟的織物。", caption: "雨後的窗邊，地毯把腳步接住。", note: "雨還沒停。先坐一會兒，聽它慢慢變小。" },
      sun: { name: "讓陽光進來", description: "窗簾把日光變得柔和。", caption: "光越過窗簾，落在沙發和編織地毯上。", note: "把窗簾拉開一點，今天的光剛剛好。" },
      night: { name: "夜裡只留小燈", description: "把亮處留給想待的地方。", caption: "桌燈和閱讀燈，照亮各自附近的一小角。", note: "不必讓整間房都亮著。留一盞燈，等故事翻頁。" },
      tech: { name: "多一位小夥伴", description: "有一點科技，還是很像家。", caption: "小機器人坐在桌邊，地毯和布料仍是主角。", note: "它坐在書旁邊，像是在等你決定今晚讀哪一頁。" },
      breeze: { name: "微風午後", description: "鼠尾草綠沙發與淡藍織紋。", caption: "布料與地毯換了色，房間也跟著輕了一點。", note: "風把窗簾吹得很輕，今天適合慢慢醒著。" },
      autumn: { name: "暖秋週末", description: "陶土色沙發，留一壺茶。", caption: "陶土色織面和厚實羊毛地毯，讓房間更適合久坐。", note: "把茶放在桌上，好像有人隨時可以來坐坐。" },
      winter: { name: "冬日傍晚", description: "深綠沙發與柔軟羊毛。", caption: "窗外冷，椅邊暖；厚地毯與閱讀燈各守住一角。", note: "窗外天色早暗，書剛翻到最想繼續的一頁。" },
      techNight: { name: "小夥伴的夜班", description: "兩盞燈，一位安靜陪伴。", caption: "機器人在桌邊，室內暖光只留在兩盞燈附近。", note: "它沒有催你睡，只安靜陪著你把這一頁讀完。" },
      homeAssistant: { name: "波斯織毯之夜", description: "家務夥伴收起毯子，燈留在身旁。", caption: "家務機器人站在窗邊收起毯子，波斯風格織毯與兩盞燈讓夜晚有了溫度。", note: "書還攤在桌上，毯子已經摺好。今晚可以慢一點。" },
      homeAssistantModern: { name: "柔調羊毛之夜", description: "同一間房，換一種輕柔的觸感。", caption: "淺色羊毛地毯、亞麻燈罩與家務夥伴，讓這個夜晚輕了一點。", note: "毯子摺好了，腳下的羊毛讓回家的步伐也慢下來。" },
    },
    details: {
      rug: { name: "腳下的地毯", description: "先讓空間有溫度。", text: "地毯的織紋和柔軟邊緣，讓沙發與桌子像聚在同一個角落，也讓人想赤腳走過去。" },
      curtain: { name: "窗邊的布料", description: "讓光有了脾氣。", text: "布料的厚薄、折痕與垂墜，會決定窗光是清亮地進來，還是被溫柔地放慢。" },
      light: { name: "最後一點光", description: "讓夜有可停留的地方。", text: "晴天的光從窗邊鋪開；入夜後，燈光留在座位旁。兩種光讓同一間房有了不同的節奏。" },
    },
    back: "回上一段",
    next: "往下看",
    download: "下載房間明信片",
    restart: "再換個時刻",
    resultLead: "你選了",
    resultDetail: "最讓你停下來的是",
    resultLimit: "搭配示意；實際色彩與質感仍需看材質和現場光線。",
    imageUnavailable: "圖像尚未載入，請稍後再試。",
  },
  en: {
    title: "ROOM MODE REMOTE",
    eyebrow: "One room. More than one way to stay.",
    intro: "Press a button and see how the same room can feel different. Pick a mood, then look closer at what the rug, curtains, and light bring to it.",
    label: "A note to yourself",
    startingNote: "When you come home today, how should this corner welcome you?",
    footer: "These are illustrated furnishing studies. Actual color, texture, and illumination depend on materials and on-site light.",
    sceneHint: "Choose a moment first. Each scene is a complete illustration, so sofa, rug, and light change together.",
    mobilePick: "Choose a room mode",
    mobilePickPrompt: "Pick a room to stay in",
    playAreaLabel: "Room scene explorer",
    progressLabel: "Exploration progress",
    switchLanguageLabel: "Switch to Chinese",
    groups: { day: "Day & seasons", evening: "Lamplit hours", tech: "Light tech" },
    progress: ["Set the mood", "Look closer", "Take it home"],
    steps: [
      { kicker: "SET THE MOOD", title: "Which room mode fits today?", description: "Choose a moment you would like to stay in. The sofa, rug and light change together." },
      { kicker: "LOOK CLOSER", title: "Which detail makes you stay?", description: "Pick one part of the room and see what it changes." },
      { kicker: "YOUR ROOM NOTE", title: "This is the room you kept.", description: "Take the moment and the detail you noticed with you as a small postcard." },
    ],
    scenes: {
      rain: { name: "Slow after the rain", description: "A little rain and soft textiles.", caption: "By the rainy window, the woven rug catches your steps.", note: "The rain has not stopped yet. Sit for a while and listen to it soften." },
      sun: { name: "Let the sun in", description: "Linen makes daylight gentle.", caption: "Light passes the curtains and reaches the sofa and woven rug.", note: "Pull the curtain back a little. Today's light feels just right." },
      night: { name: "Leave the small lamps on", description: "Keep the light where you want to stay.", caption: "The table and reading lamps light small places nearby.", note: "The whole room need not glow. Leave one lamp on for the next page." },
      tech: { name: "One little companion", description: "A touch of tech, still a home.", caption: "A tiny robot sits by the books; textiles still lead the room.", note: "It waits beside your book, as if asking what you will read tonight." },
      breeze: { name: "Breezy afternoon", description: "Sage linen and a soft blue weave.", caption: "New textiles make the same room feel a little lighter.", note: "The breeze lifts the curtain. Today is good for staying awake slowly." },
      autumn: { name: "Autumn weekend", description: "Clay fabric and a pot of tea.", caption: "Clay-colored upholstery and thick wool invite a longer stay.", note: "Leave the tea on the table. Someone might drop by." },
      winter: { name: "Winter dusk", description: "Forest-green sofa and soft wool.", caption: "Cold outside, warm by the chair; rug and reading lamp each hold a corner.", note: "The sky darkens early. The book has reached its best page." },
      techNight: { name: "The little night shift", description: "Two lamps and one quiet companion.", caption: "The robot sits by the table; warm light stays close to the lamps.", note: "It does not tell you to sleep. It just stays while you finish the page." },
      homeAssistant: { name: "A Persian-inspired evening", description: "A helping hand folds the throw; the lamps stay on.", caption: "A household robot folds a throw by the window, while a Persian-inspired rug and two lamps warm the room.", note: "The book is still on the table, and the throw is folded. Tonight can slow down." },
      homeAssistantModern: { name: "A softer wool evening", description: "The same room takes on a lighter touch.", caption: "A pale wool rug, linen lampshade and household companion soften the evening.", note: "The throw is folded. Wool underfoot makes coming home feel slower, too." },
    },
    details: {
      rug: { name: "The rug underfoot", description: "Let the room feel warmer.", text: "The rug's weave and soft edge gather the sofa and table into one corner and make you want to walk across barefoot." },
      curtain: { name: "Fabric by the window", description: "Give daylight a character.", text: "Weight, folds, and drape decide whether daylight enters crisply or slows down softly." },
      light: { name: "A little light", description: "Give the evening a place to land.", text: "Daylight spreads from the window; after dark, lamplight stays near the seat. The same room moves at a different pace." },
    },
    back: "Go back",
    next: "Keep going",
    download: "Download room postcard",
    restart: "Try another moment",
    resultLead: "You chose",
    resultDetail: "The detail that held your attention",
    resultLimit: "Illustrated pairing only; confirm colors and textures with real materials and on-site light.",
    imageUnavailable: "The illustration is still loading. Please try again.",
  },
};

const state = {
  lang: new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh",
  step: 0,
  scene: null,
  detail: null,
  group: "day",
};

const els = Object.fromEntries([
  "language-toggle", "play-area", "eyebrow", "page-title", "intro-copy", "note-label", "story-note",
  "room-canvas", "scene-caption", "scene-hint", "mobile-picker", "mobile-picker-label", "mobile-scene-select", "step-track", "step-kicker",
  "step-title", "step-copy", "scene-tabs", "choice-list", "result-area", "back-button",
  "next-button", "footer-note",
].map((id) => [id, document.getElementById(id)]));

const context = els["room-canvas"].getContext("2d");
const images = {};
const mobileSceneMedia = window.matchMedia("(max-width: 800px)");

function loadDisplayImages() {
  Object.entries(sceneFiles).forEach(([key, file]) => {
    const filename = mobileSceneMedia.matches ? file.replace(/\.webp$/, "-mobile.webp") : file;
    if (images[key]?.filename === filename) return;
    const img = new Image();
    img.filename = filename;
    img.onload = () => {
      if (images[key] === img && (state.scene || "rain") === key) drawScene();
    };
    img.src = ASSET_BASE + filename;
    images[key] = img;
  });
  drawScene();
}

mobileSceneMedia.addEventListener("change", loadDisplayImages);
loadDisplayImages();

function drawScene() {
  const canvas = els["room-canvas"];
  const image = images[state.scene || "rain"];
  context.fillStyle = "#e7ddcd";
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (image?.complete && image.naturalWidth) {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  }
}

function optionButton(key, item, chosen, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-option";
  button.setAttribute("aria-pressed", String(chosen === key));
  const name = document.createElement("span");
  name.className = "choice-name";
  name.textContent = item.name;
  const description = document.createElement("span");
  description.className = "choice-description";
  description.textContent = item.description;
  button.append(name, description);
  button.addEventListener("click", onClick);
  return button;
}

function addParagraph(parent, text, className) {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  parent.append(p);
}

function render() {
  const t = copy[state.lang];
  document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
  document.title = t.title;
  els["language-toggle"].textContent = state.lang === "zh" ? "EN" : "中";
  els["language-toggle"].setAttribute("aria-label", t.switchLanguageLabel);
  els["play-area"].setAttribute("aria-label", t.playAreaLabel);
  els["step-track"].setAttribute("aria-label", t.progressLabel);
  els["eyebrow"].textContent = t.eyebrow;
  els["page-title"].textContent = t.title;
  els["intro-copy"].textContent = t.intro;
  els["note-label"].textContent = t.label;
  els["story-note"].textContent = state.scene ? t.scenes[state.scene].note : t.startingNote;
  els["scene-caption"].textContent = state.scene ? t.scenes[state.scene].caption : t.scenes.rain.caption;
  els["scene-hint"].textContent = t.sceneHint;
  els["mobile-picker"].hidden = state.step !== 0;
  els["mobile-picker-label"].textContent = t.mobilePick;
  const mobileOptions = [new Option(t.mobilePickPrompt, "")];
  Object.values(sceneGroups).flat().forEach((key) => mobileOptions.push(new Option(t.scenes[key].name, key)));
  els["mobile-scene-select"].replaceChildren(...mobileOptions);
  els["mobile-scene-select"].value = state.scene || "";
  els["footer-note"].textContent = t.footer;
  els["room-canvas"].setAttribute("aria-label", state.scene ? t.scenes[state.scene].caption : t.scenes.rain.caption);
  els["step-track"].replaceChildren(...t.progress.map((label, i) => {
    const mark = document.createElement("span");
    mark.className = i <= state.step ? "active" : "";
    mark.title = label;
    return mark;
  }));
  const step = t.steps[state.step];
  els["step-kicker"].textContent = step.kicker;
  els["step-title"].textContent = step.title;
  els["step-copy"].textContent = step.description;
  els["choice-list"].replaceChildren();
  els["scene-tabs"].replaceChildren();
  els["scene-tabs"].hidden = state.step !== 0;
  els["result-area"].replaceChildren();
  els["result-area"].hidden = state.step !== 2;
  if (state.step === 0) {
    Object.keys(sceneGroups).forEach((key) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.textContent = t.groups[key];
      tab.setAttribute("aria-pressed", String(state.group === key));
      tab.addEventListener("click", () => {
        state.group = key;
        render();
      });
      els["scene-tabs"].append(tab);
    });
    sceneGroups[state.group].forEach((key) => {
      const item = t.scenes[key];
      els["choice-list"].append(optionButton(key, item, state.scene, () => {
        state.scene = key;
        render();
      }));
    });
  } else if (state.step === 1) {
    Object.entries(t.details).forEach(([key, item]) => {
      els["choice-list"].append(optionButton(key, item, state.detail, () => {
        state.detail = key;
        render();
      }));
    });
    if (state.detail) {
      els["result-area"].hidden = false;
      addParagraph(els["result-area"], t.details[state.detail].text);
    }
  } else {
    addParagraph(els["result-area"], t.scenes[state.scene].name, "result-title");
    addParagraph(els["result-area"], t.resultLead + (state.lang === "zh" ? "「" : " ") + t.scenes[state.scene].name + (state.lang === "zh" ? "」。" : "."));
    addParagraph(els["result-area"], t.resultDetail + (state.lang === "zh" ? "「" : ": ") + t.details[state.detail].name + (state.lang === "zh" ? "」。" : "."));
    addParagraph(els["result-area"], t.resultLimit);
  }
  els["back-button"].hidden = state.step === 0;
  els["back-button"].textContent = t.back;
  els["next-button"].textContent = state.step === 2 ? t.download : t.next;
  els["next-button"].disabled = (state.step === 0 && !state.scene) || (state.step === 1 && !state.detail);
  drawScene();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const units = text.includes(" ") ? text.split(" ") : [...text];
  let line = "";
  let row = y;
  units.forEach((unit) => {
    const next = line ? line + (text.includes(" ") ? " " : "") + unit : unit;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, row);
      row += lineHeight;
      line = unit;
    } else {
      line = next;
    }
  });
  if (line) ctx.fillText(line, x, row);
  return row;
}

function renderPostcard(image, t, sceneKey, detailKey) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1830;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f6f2e9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 40, 40, 1120, 1400);
  ctx.fillStyle = "#465a48";
  ctx.fillRect(40, 1470, 1120, 3);
  ctx.fillStyle = "#30352f";
  ctx.font = "700 27px sans-serif";
  ctx.fillText("ROOM MODE REMOTE", 45, 1534);
  ctx.font = "46px sans-serif";
  wrapText(ctx, t.scenes[sceneKey].name, 45, 1600, 1110, 54);
  ctx.fillStyle = "#596558";
  ctx.font = "28px sans-serif";
  wrapText(ctx, t.details[detailKey].name + " — " + t.details[detailKey].description, 45, 1660, 1110, 35);
  ctx.font = "22px sans-serif";
  wrapText(ctx, t.resultLimit, 45, 1754, 1110, 26);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "room-mode-remote-" + sceneKey + ".png";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

function downloadPostcard() {
  const t = copy[state.lang];
  const sceneKey = state.scene;
  const detailKey = state.detail;
  const image = new Image();
  image.onload = () => renderPostcard(image, t, sceneKey, detailKey);
  image.onerror = () => window.alert(t.imageUnavailable);
  image.src = ASSET_BASE + sceneFiles[sceneKey];
}

els["language-toggle"].addEventListener("click", () => {
  state.lang = state.lang === "zh" ? "en" : "zh";
  const url = new URL(location.href);
  url.searchParams.set("lang", state.lang);
  history.replaceState(null, "", url);
  render();
});
els["mobile-scene-select"].addEventListener("change", (event) => {
  const key = event.target.value;
  if (!key) return;
  state.scene = key;
  state.group = Object.keys(sceneGroups).find((group) => sceneGroups[group].includes(key));
  render();
});
els["back-button"].addEventListener("click", () => {
  state.step = Math.max(0, state.step - 1);
  render();
});
els["next-button"].addEventListener("click", () => {
  if (state.step < 2) {
    state.step += 1;
    render();
    document.querySelector(".choice-card").scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    downloadPostcard();
  }
});
render();
