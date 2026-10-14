// Small reusable pattern: each unconfirmed item carries one short "what could go wrong if nobody asks" line.
// Shape: RISK[key][lang] = string; riskLine(key, lang) adds the prefix. No numbers, no verdicts.
// (Other works, e.g. 街角的秘密, could borrow this shape for their own pending items.)

export const RISK_PREFIX = { zh: "這裡還有風險：", en: "Risk if unasked: " };

export const RISK = {
  plug: { zh: "插頭插不進當地插座，整批燈用不了。", en: "the plug may not fit local sockets, so the lamps can't be used." },
  cert: { zh: "到了市場才發現缺認證，可能無法上架。", en: "a missing certification may only surface at the market, and the lamp can't be sold." },
  moq: { zh: "做的量和需要的量對不上，多了壓著、少了不夠用。", en: "the made quantity and the needed quantity may not match: too many sit unused, too few fall short." },
  accept: { zh: "收貨時雙方對「可以」的看法不同，容易起爭執。", en: "on delivery, both sides may disagree on what counts as acceptable." },
  use: { zh: "用錯了地方，亮度或安全都可能不合適。", en: "used in the wrong place, the brightness or safety may not suit it." },
  heat: { zh: "紙罩離燈泡太近，用久了可能變色或受熱。", en: "a paper shade too close to the bulb may discolour or overheat over time." },
  fragile: { zh: "玻璃在路上碎了，收到的是一盒碎片。", en: "the glass may break on the way, and a box of pieces arrives." },
  edges: { zh: "孔邊沒處理好，摸到可能刮手。", en: "unfinished hole edges may scratch a hand." },
  colourMatch: { zh: "收到的顏色和想像的不一樣，卻說不出差在哪。", en: "the colour may arrive different from what you pictured, with nothing to compare it to." },
  grain: { zh: "每盞木紋不同，收到時以為做錯了。", en: "each lamp's grain differs, and it may look like a mistake on arrival." },
  glaze: { zh: "不同批次的釉色放在一起，看起來不像同一組。", en: "glazes from different batches may not look like one set." },
  finish: { zh: "表面用一陣子就褪色，和當初看到的不同。", en: "the finish may fade after a while and no longer match what you saw." },
  tolerance: { zh: "大小差一點，就放不進原本留好的位置。", en: "a slightly different size may not fit the space you kept for it." },
  outer: { zh: "小盒在外箱裡晃動，路上互相碰撞。", en: "boxes may shift inside the carton and knock each other on the way." },
  artwork: { zh: "沒人提供印刷稿，禮盒卡在最後一步。", en: "if nobody supplies the artwork, the gift box stalls at the last step." },
  perCarton: { zh: "每箱裝法沒講好，分送時對不上要去的地方。", en: "if carton packing isn't agreed, the lamps may not split well between places." },
};

export const riskLine = (key, lang) => `${RISK_PREFIX[lang]}${RISK[key][lang]}`;
