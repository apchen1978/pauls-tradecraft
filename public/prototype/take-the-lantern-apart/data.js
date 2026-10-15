// A Lamp, As Promised (path: take-the-lantern-apart): content and rules. No numbers, no prices, no days.
// Relative effects use: up (貴一點/慢一點), down (便宜一點/快一點), same (差不多).

export const PARTS = ["shade", "colour", "base", "size", "pack"];

export const OPTIONS = {
  shade: [
    { id: "paper", zh: "和紙", en: "Paper", price: "same", time: "same", adds: "heat" },
    { id: "glass", zh: "霧面玻璃", en: "Frosted glass", price: "up", time: "up", adds: "fragile" },
    { id: "metal", zh: "沖孔金屬", en: "Perforated metal", price: "up", time: "same", adds: "edges" },
  ],
  colour: [
    { id: "ivory", zh: "象牙", en: "Ivory", price: "same", time: "same", adds: "colourMatch", tint: "#F1E6CC" },
    { id: "night", zh: "夜藍", en: "Night blue", price: "up", time: "up", adds: "colourMatch", tint: "#3B5A7A" },
    { id: "persimmon", zh: "柿橘", en: "Persimmon", price: "up", time: "up", adds: "colourMatch", tint: "#E0874A" },
  ],
  base: [
    { id: "wood", zh: "木頭", en: "Wood", price: "same", time: "same", adds: "grain" },
    { id: "ceramic", zh: "陶瓷", en: "Ceramic", price: "same", time: "up", adds: "glaze" },
    { id: "brass", zh: "黃銅色金屬", en: "Brass-tone metal", price: "up", time: "same", adds: "finish" },
  ],
  size: [
    { id: "s", zh: "小", en: "Small", price: "down", time: "same", adds: "tolerance" },
    { id: "m", zh: "中", en: "Medium", price: "same", time: "same", adds: "tolerance" },
    { id: "l", zh: "大", en: "Large", price: "up", time: "up", adds: "tolerance" },
  ],
  pack: [
    { id: "kraft", zh: "牛皮紙盒", en: "Kraft box", price: "same", time: "same", adds: "outer" },
    { id: "gift", zh: "禮盒", en: "Gift box", price: "up", time: "up", adds: "artwork" },
    { id: "bulk", zh: "多入簡易箱", en: "Bulk carton", price: "down", time: "same", adds: "perCarton" },
  ],
};

export const DEFAULTS = { shade: "paper", colour: "ivory", base: "wood", size: "m", pack: "kraft" };

// Items that are ALWAYS pending, whatever the player picks.
export const ALWAYS_PENDING = ["plug", "cert", "moq", "accept", "use"];

export const PENDING_TEXT = {
  plug: { zh: ["插頭與電壓", "要看燈賣到哪裡，問清楚當地規格。"], en: ["Plug and voltage", "It depends where the lamp is sold. Ask for the local spec."] },
  cert: { zh: ["安全或市場認證", "選什麼材質都不會自動過關，要問清楚市場需要哪些。"], en: ["Safety or market certification", "No material choice settles this. Ask what the market requires."] },
  moq: { zh: ["數量與最低製作量", "實際需要多少、是否有最低製作量，還要確認。"], en: ["Quantity and minimum run", "The quantity needed and any minimum production quantity still need confirming."] },
  accept: { zh: ["驗收標準", "色差、刮痕到什麼程度算可以？用樣品還是照片比對？"], en: ["Acceptance criteria", "How much colour shift or scratching is fine? Compare with a sample or a photo?"] },
  use: { zh: ["給誰用、用在哪", "小孩房？店裡？戶外？"], en: ["Who uses it, and where", "A child's room? A shop? Outdoors?"] },
  heat: { zh: ["燈罩耐熱", "和紙靠近燈泡，要不要測耐熱？"], en: ["Shade heat check", "Paper sits near the bulb. Should heat be tested?"] },
  fragile: { zh: ["易碎包裝", "玻璃容易碎，包裝要怎麼加強？"], en: ["Fragile packing", "Glass breaks. How should the packing protect it?"] },
  edges: { zh: ["邊緣處理", "沖孔的邊會不會割手？"], en: ["Edge finish", "Could the punched edges be sharp?"] },
  colourMatch: { zh: ["顏色怎麼比對", "用色卡還是樣品？可以差多少？"], en: ["Colour matching", "Match to a swatch or a sample? How close is close enough?"] },
  grain: { zh: ["木紋差異", "每塊木紋都不一樣，能接受嗎？"], en: ["Wood grain", "Every piece of wood looks different. Is that fine?"] },
  glaze: { zh: ["釉色批次", "每一窯的釉色會有點不同。"], en: ["Glaze batches", "Each firing comes out a little different."] },
  finish: { zh: ["表面處理", "表面會不會褪色？"], en: ["Surface finish", "Will the finish fade over time?"] },
  tolerance: { zh: ["尺寸誤差", "大小可以差多少？"], en: ["Size tolerance", "How far off can the size be?"] },
  outer: { zh: ["外箱怎麼裝", "小盒子再怎麼裝進外箱？"], en: ["Outer carton", "How do the boxes go into the shipping carton?"] },
  artwork: { zh: ["禮盒印刷稿", "盒子上的圖，誰來出？"], en: ["Gift box artwork", "Who supplies the print design?"] },
  look: { zh: ["外觀怎麼比對", "顏色、紋理、表面和邊緣，用樣品還是照片比？可以差多少？"], en: ["How the look is checked", "Colour, grain, surface and edges: compare with a sample or a photo? How close is close enough?"] },
  packing: { zh: ["運送保護", "盒裡怎麼固定、外箱怎麼裝，才不會在路上碰壞？"], en: ["Protection on the way", "How is the lamp held in its box and packed in the carton so nothing breaks?"] },
  perCarton: { zh: ["一箱裝幾個", "簡易箱裡要裝幾盞？"], en: ["Lamps per carton", "How many lamps go in each carton?"] },
};

// Display grouping for the unconfirmed list. Related raw items merge into one line; the rest keep their own.
export const MERGE = { look: ["colourMatch", "grain", "glaze", "finish", "edges"], packing: ["fragile", "outer", "perCarton"] };
export const MUST_ASK = ["plug", "cert", "use", "accept", "heat", "packing"];
export const ASK_LATER = ["moq", "look", "tolerance", "artwork"];
export function groupPending(pending) {
  const shown = [];
  for (const key of pending) {
    const merged = Object.keys(MERGE).find((m) => MERGE[m].includes(key)) || key;
    if (!shown.includes(merged)) shown.push(merged);
  }
  return { must: MUST_ASK.filter((k) => shown.includes(k)), later: ASK_LATER.filter((k) => shown.includes(k)) };
}

export const PART_LABEL = {
  shade: { zh: "燈罩材質", en: "Shade material" },
  colour: { zh: "燈罩顏色", en: "Shade colour" },
  base: { zh: "底座", en: "Base" },
  size: { zh: "尺寸", en: "Size" },
  pack: { zh: "包裝", en: "Packaging" },
};

export const EFFECT = {
  price: { up: { zh: "貴一點", en: "costs a bit more" }, down: { zh: "便宜一點", en: "costs a bit less" }, same: { zh: "價格差不多", en: "about the same cost" } },
  time: { up: { zh: "慢一點", en: "takes a bit longer" }, down: { zh: "快一點", en: "a bit quicker" }, same: { zh: "時間差不多", en: "about the same time" } },
};

export function optionOf(part, id) {
  return OPTIONS[part].find((o) => o.id === id);
}

// Agreed: the visible choices. Pending: always-pending plus what the choices add.
export function specStatus(picks) {
  const agreed = PARTS.map((p) => ({ part: p, option: optionOf(p, picks[p]) }));
  const pending = [...ALWAYS_PENDING];
  for (const p of PARTS) {
    const add = optionOf(p, picks[p]).adds;
    if (add && !pending.includes(add)) pending.push(add);
  }
  return { agreed, pending };
}

export const UI = {
  zh: {
    label: "示意玩具，不是報價工具。",
    title: "一盞燈的約定",
    tagline: "拆開一盞燈，把你想要的說清楚。",
    sub: "照夜鎮的夜裡，戴安娜的工作台上有一盞燈。",
    start: "點亮它",
    s1kid: "「我想要一盞跟這張一樣的燈！」",
    s1diana: "「照片很好看。我們先看清楚，它是怎麼做的。」",
    s1go: "仔細看看",
    s2title: "看：轉一轉、點一點",
    s2hint: "燈身上藏了東西。",
    turnLeft: "往左轉", turnRight: "往右轉", zoom: "放大", zoomOut: "縮小",
    spotShade: "看燈罩內側", spotBase: "看底座底部",
    shadeNote: "做燈的人，常把小秘密留在看不到的地方。",
    baseNote: "「這張貼紙是空的。電壓、插頭寫什麼，要看燈去哪裡。」",
    mg: "MG 撥了一下零件……",
    s2go: "拆開來",
    s3title: "拆與組：換換看",
    effectTitle: "示意：跟原本比",
    effectFoot: "真正的價格和交期，要問做燈的人。",
    kidReact: "「哇，這個好像我的照片！」",
    s3go: "組好了",
    s4title: "講好了嗎？",
    s4ask: "「這盞燈是給誰用的？插頭規格確認了嗎？」",
    agreed: "已講好 ✓", pending: "還要確認 …", mustAsk: "一定要先問", askLater: "之後再問",
    s4close: "「看得見的講好了，看不見的也要講好。」",
    s4go: "做一張規格卡",
    s5title: "規格卡",
    client: "委託人：千禧",
    download: "下載規格卡", again: "再拆一次", home: "回首頁",
    nextLabel: "下一站 · 對照架上的那一盞",
    nextBody: "規格講好了。大貨做好之後，要拿什麼來比？",
    nextLink: "走進工廠 ↗",
    journey: "旅程：街角的秘密 → 一盞燈的約定 → 對照架上的那一盞 → 貿易街 → 十二月的燈",
    disclosure: "示意玩具，不是報價工具；不含真實價格、交期或認證判斷。",
    cardTitle: "規格卡 · 一盞燈的約定",
    fileName: "一盞燈的約定-規格卡.png",
    altKid: "千禧舉著相機", altPhoto: "千禧拍的燈，有點模糊的拍立得照片", altDiana: "戴安娜拿著螺絲起子微笑", altDianaAsk: "戴安娜舉起燈發問",
    altShadeInside: "燈罩內側特寫，有淡淡的星點", altBaseBottom: "底座底部特寫，貼著一張空白銘牌", altMg: "MG 伸出貓掌撥零件",
  },
  en: {
    label: "A toy, not a quoting tool.",
    title: "A Lamp, As Promised",
    tagline: "Take a lamp apart, and say clearly what you want.",
    sub: "A lamp waits on Diana's workbench, one night in Zhaoye Town.",
    start: "Light it up",
    s1kid: "\"I want a lamp just like this photo!\"",
    s1diana: "\"Lovely photo. Let's see how it's made first.\"",
    s1go: "Take a closer look",
    s2title: "Look: turn it, tap it",
    s2hint: "Something is hidden on it.",
    turnLeft: "Turn left", turnRight: "Turn right", zoom: "Zoom in", zoomOut: "Zoom out",
    spotShade: "Look inside the shade", spotBase: "Look under the base",
    shadeNote: "Makers often hide a small secret where no one looks.",
    baseNote: "\"This label is blank. What it says depends on where the lamp goes.\"",
    mg: "MG gives the parts a nudge…",
    s2go: "Take it apart",
    s3title: "Take apart, put together",
    effectTitle: "Illustrative, compared with before",
    effectFoot: "Ask the maker for real cost and timing.",
    kidReact: "\"Ooh, that one looks like my photo!\"",
    s3go: "Put it together",
    s4title: "Is it all agreed?",
    s4ask: "\"Who is this lamp for? Have we confirmed the plug?\"",
    agreed: "Agreed ✓", pending: "Still to confirm …", mustAsk: "Ask first", askLater: "Ask later",
    s4close: "\"We agreed what we can see. Now agree what we can't.\"",
    s4go: "Make a spec card",
    s5title: "Spec card",
    client: "For: Chiensi",
    download: "Download spec card", again: "Take it apart again", home: "Home",
    nextLabel: "Next stop · Match the Lamp on the Shelf",
    nextBody: "Spec agreed. Once the bulk is made, what do you check it against?",
    nextLink: "Step into the factory ↗",
    journey: "Journey: Secrets on the Corner → A Lamp, As Promised → Match the Lamp on the Shelf → Trade Street → December Lights",
    disclosure: "A toy, not a quoting tool. No real prices, lead times or certification calls.",
    cardTitle: "Spec Card · A Lamp, As Promised",
    fileName: "a-lamp-as-promised-spec-card.png",
    altKid: "Chiensi holding a camera", altPhoto: "Chiensi's slightly blurry instant photo of a lamp", altDiana: "Diana smiling with a screwdriver", altDianaAsk: "Diana holding up the lamp with a question",
    altShadeInside: "Inside the shade, with faint star dots", altBaseBottom: "Under the base, a blank label", altMg: "MG nudging the parts with a paw",
  },
};
