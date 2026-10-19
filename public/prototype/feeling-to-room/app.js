const copy = {
  zh: {
    lang: "zh-Hant", back: "回到作品集", eyebrow: "ROOMVERSE · 人機共創示範", title: "先有fu，再有家", metaDescription: "先選一種房間心情，再看 AI 初稿如何由人取捨與深化。",
    dek: "先挑一種房間心情，看 AI 怎麼快速給方向，再看人如何把細節想周全。",
    boundary: "示範／虛構情境 · AI 初稿為預置內容，不是即時生成。", progressLabel: "探索進度",
    footer: "一個固定內容的創作示範，不會連接 AI 服務。", roomverse: "走進 ROOMVERSE 3D",
    step: n => `第 ${n}／3 步`, step1: "先選一種心情", step1Note: "從熟悉的 ROOMVERSE 氣氛開始。兩張卡都是既有方向。",
    rainy: "下雨天想窩在家裡", rainySub: "窗外雨聲，屋裡留一盞暖燈。", chic: "粉領新貴風", chicSub: "清晨日光，霧粉和俐落線條。",
    tapMood: "選一張卡，開始看同一種心情的不同初稿。", continueMood: "看 AI 初稿方向", step2: "三個方向，你會先挑哪一個？",
    step2Note: "它們都是預置的 AI 初稿示範：方向很快，細節仍值得人來挑。",
    draftBadge: "AI 初稿（預置示範）", draftNames: ["柔軟鋪陳", "留白相聚", "明亮焦點"],
    draftSubsRain: ["花紋與織物都很多", "茶几偏大，動線變窄", "冷暖光和地毯互相搶眼"],
    draftSubsChic: ["粉色從牆面延伸到家具", "金屬小物有些擁擠", "地毯和燈具都想當主角"],
    reasonLegend: "我為什麼先選它？", reasons: ["氣氛最貼近我想要的", "走動的路看起來順", "日常比較好整理", "能和現有家具搭配"],
    reasonHint: "這個理由不會改變固定示範結果；它幫你把自己的取捨說清楚。",
    reveal: "看人怎麼深化", backMood: "回去換一種心情", step3: "人把方向收斂成能生活的細節",
    step3Note: "保留初稿想要的氣氛，再把取捨逐項說清楚。",
    refinementLabel: "人深化後", chosenReason: "你先看重：", before: "初稿方向：", why: "為什麼這樣調：",
    edits: {
      "rain-1": [["留下素色靠墊，先收起相近的繁複花紋。","讓視線有休息的位置，雨天的柔和感仍在。"],["把毯子留在沙發一角，不再同時鋪滿座面。","坐下和起身都比較俐落，也保留柔軟觸感。"],["讓地毯回到低對比的織紋。","把溫暖留在材質，不讓圖案蓋過房間。"]],
      "rain-2": [["縮小茶几的視覺份量，替沙發前留出空間。","讓兩人走動和放腳都有餘裕。"],["把主要物件集中在沙發附近。","房間焦點明確，窗邊仍看得見。"],["保留一盞暖燈，減少桌面的零碎擺設。","把注意力帶回休息，而不是物件清單。"]],
      "rain-3": [["讓天花主燈退下，只留下座燈的暖光。","光源方向更一致，也更接近雨夜的安靜。"],["選一款較安定的地毯花紋。","避免地面和窗外雨景互相競爭。"],["把金屬表面改成較柔和的霧面。","減少反光，讓眼睛先落在沙發和燈光。"]],
      "chic-1": [["把粉色收在窗簾和一顆靠墊。","留住清晨的柔和，也讓房間有呼吸。"],["以奶油白和淺木色平衡大面積色彩。","不讓同一色調從牆面一路壓到家具。"],["把金屬留給一個小燈具。","點到為止，讓材質層次更清楚。"]],
      "chic-2": [["桌面只留一件金屬小物。","把視覺焦點從陳列拉回休息區。"],["讓花器和書本錯開，不排成一整列。","留出實際使用的桌面空間。"],["用霧面布料接住窗邊的亮光。","金屬仍有亮點，整體不會太硬。"]],
      "chic-3": [["讓地毯圖案安靜一點，保留清楚的輪廓。","地板有質感，視線不會被圖案帶走。"],["把弧形落地燈換成較輕的燈罩比例。","減少窗邊與燈具的輪廓重疊。"],["保留一處陶土色作為暖色落點。","和霧粉、奶油白一起形成有層次的配色。"]],
    },
    footNote: "這是固定的設計示範，不代表每個房間都只有一種做法。",
    linkRoom: "走進這種心情的 ROOMVERSE 3D 房間", restart: "再選一種心情",
  },
  en: {
    lang: "en", back: "Back to the portfolio", eyebrow: "ROOMVERSE · Human–AI co-design demo", title: "Feeling First", metaDescription: "Choose a room mood, then see how a person selects and refines a prepared AI draft.",
    dek: "Choose a room mood, see how AI offers directions quickly, then see how a person thinks through the details.",
    boundary: "Demo / fictional scenario · AI drafts are prepared examples, not live generations.", progressLabel: "Your path",
    footer: "A fixed-content design demo. It does not connect to an AI service.", roomverse: "Enter ROOMVERSE 3D",
    step: n => `Step ${n} of 3`, step1: "Start with a room mood", step1Note: "Begin with a familiar ROOMVERSE atmosphere. Both are existing directions.",
    rainy: "Rainy day, staying in", rainySub: "Rain outside; a warm lamp inside.", chic: "Chic city professional", chicSub: "Morning light, dusty rose and clean lines.",
    tapMood: "Choose a card to explore three drafts for the same mood.", continueMood: "Explore AI draft directions", step2: "Which of these three directions would you choose first?",
    step2Note: "Each is a prepared AI draft example: direction comes quickly; a person still needs to refine the details.",
    draftBadge: "AI draft · prepared example", draftNames: ["Soft layers", "Room to gather", "Bright focal point"],
    draftSubsRain: ["Many patterns and textiles", "A large table narrows the path", "Cool and warm light compete with the rug"],
    draftSubsChic: ["Rose carries from wall to furniture", "Brass accents feel crowded", "The rug and lamp both ask for attention"],
    reasonLegend: "Why would you choose it first?", reasons: ["The mood feels right", "The route feels open", "Easy to care for", "Works with what I own"],
    reasonHint: "Your reason does not change the fixed example. It helps make your own trade-off clear.",
    reveal: "See how a person refines it", backMood: "Choose another mood", step3: "A person turns the direction into livable details",
    step3Note: "Keep the draft’s intended mood, then make each design choice explicit.",
    refinementLabel: "Human refinement", chosenReason: "Your first priority:", before: "Draft direction:", why: "Why this changed:",
    edits: {
      "rain-1": [["Keep solid cushions and set aside the competing patterns.","Give the eye a place to rest while keeping the soft rainy-day mood."],["Drape the throw at one end of the sofa instead of covering the seat.","Make sitting down easier and keep the touch of softness."],["Choose a low-contrast rug texture.","Let the warmth come from the material, not a busy pattern."]],
      "rain-2": [["Reduce the coffee table’s visual weight and open space in front of the sofa.","Leave room to walk and put your feet up."],["Keep the main pieces close to the sofa.","Give the room a clear focus while keeping the window in view."],["Keep one warm lamp and clear some small objects from the table.","Bring attention back to resting, not to a list of things."]],
      "rain-3": [["Let the ceiling light recede and keep the warm table lamp.","Make the light feel consistent and calm for a rainy evening."],["Choose a quieter rug pattern.","Keep the floor from competing with the rainy view."],["Use softer matte finishes instead of reflective metal.","Reduce glare so the sofa and warm light come first."]],
      "chic-1": [["Keep rose in the curtains and one cushion.","Retain the gentle morning mood and leave the room some breathing space."],["Balance large colour areas with cream and pale wood.","Stop one colour from carrying from wall to furniture."],["Keep brass to one small lamp detail.","Use it as an accent so the material layers stay clear."]],
      "chic-2": [["Keep one brass object on the table.","Move the focus from display back to the seating area."],["Offset the vase and books instead of lining them up.","Leave useful space on the table."],["Use matte fabric to soften the window light.","Keep a little metal shine without making the room feel hard."]],
      "chic-3": [["Quiet the rug pattern and keep its outline clear.","Give the floor texture without pulling the eye away."],["Choose a lighter lamp silhouette beside the window.","Keep the lamp and window frames from competing."],["Keep one terracotta accent as a warm point.","Let it add depth alongside dusty rose and cream."]],
    },
    footNote: "This is a fixed design example; a room can have more than one good answer.",
    linkRoom: "Enter the ROOMVERSE 3D room for this mood", restart: "Choose another mood",
  },
};

const moods = {
  rain: { image: "/prototype/room-mode-remote/assets/room-rug-v2.webp", alt: { zh: "雨天客廳裡，米白沙發與暖色檯燈映著窗外雨景", en: "A rainy-day living room with a cream sofa, warm table lamp and rain beyond the window" }, roomImage: "/prototype/room-mode-remote/assets/room-rug-v2.webp", moodParam: "rain" },
  chic: { image: "/prototype/room-mode-remote/assets/room-chic-city-v1.webp", alt: { zh: "晨光照進城市客廳，霧粉窗簾、奶油白沙發與淺色地毯", en: "Morning light in a city living room with dusty-rose curtains, a cream sofa and a pale rug" }, roomImage: "/prototype/room-mode-remote/assets/room-chic-city-v1.webp", moodParam: "chic" },
};
const roomverse3d = { rain: "rain", chic: "chic" };
const state = { lang: new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh", step: 1, mood: null, draft: null, reason: null };
const root = document.querySelector("#step-content");
const progressText = document.querySelector("#progress-text");
const progressFill = document.querySelector("#progress-fill");

function enc(text) { return String(text).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function reasonId(index) { return `r${index}`; }
function draftId() { return `${state.mood}-${state.draft}`; }
function setDocumentLanguage() {
  document.documentElement.lang = copy[state.lang].lang;
  document.title = state.lang === "zh" ? "先有fu，再有家 · Feeling First" : "Feeling First · 先有fu，再有家";
  document.querySelector(".fu-note").hidden = state.lang !== "zh";
  document.querySelector('meta[name="description"]').content = copy[state.lang].metaDescription;
  document.querySelectorAll("[data-copy]").forEach(el => { const key = el.dataset.copy; el.textContent = copy[state.lang][key]; });
  document.querySelectorAll("[data-lang]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.lang === state.lang)));
  const home = document.querySelector(".home-link"); home.href = `/?lang=${state.lang}#showcase`;
  const footer = document.querySelector(".site-foot a"); footer.href = `/prototype/roomverse-3d/?lang=${state.lang}`;
  const url = new URL(location.href); url.searchParams.set("lang",state.lang); history.replaceState(null,"",url);
}
function stepHeader(t, n, note) { return `<div class="step-heading"><div><p class="step-kicker">${t.step(n)}</p><h2 id="step-heading" class="step-title" tabindex="-1">${note[0]}</h2><p class="step-note">${note[1]}</p></div></div>`; }
function renderMood() {
  const t=copy[state.lang];
  root.innerHTML=`<section class="step-panel" aria-labelledby="step-heading">${stepHeader(t,1,[t.step1,t.step1Note])}<div class="mood-grid">
    <button class="mood-card" type="button" data-mood="rain" aria-pressed="${state.mood === "rain"}"><img src="${moods.rain.image}" alt="${moods.rain.alt[state.lang]}" width="960" height="1200"><span class="mood-copy"><strong>${t.rainy}</strong><span>${t.rainySub}</span></span></button>
    <button class="mood-card" type="button" data-mood="chic" aria-pressed="${state.mood === "chic"}"><img src="${moods.chic.image}" alt="${moods.chic.alt[state.lang]}" width="840" height="1050"><span class="mood-copy"><strong>${t.chic}</strong><span>${t.chicSub}</span></span></button>
  </div><p class="hint-line">${t.tapMood}</p><div class="actions"><button class="primary" type="button" data-action="continue-mood" ${state.mood ? "" : "disabled"}>${t.continueMood}</button></div></section>`;
}
function renderDrafts() {
  const t=copy[state.lang], suffix=state.mood === "rain" ? "Rain" : "Chic", subs=t[`draftSubs${suffix}`];
  const drafts=[1,2,3].map((id,i)=>`<label class="draft-choice"><input type="radio" name="draft" value="${id}" ${state.draft===id?"checked":""}><img src="./assets/${state.mood}-${id}.webp" alt="${state.lang === "zh" ? `${t[state.mood === "rain" ? "rainy" : "chic"]}的 AI 初稿方向 ${String.fromCharCode(65+i)}，${subs[i]}` : `AI draft ${String.fromCharCode(65+i)} for ${t[state.mood === "rain" ? "rainy" : "chic"]}: ${subs[i]}`}" width="800" height="1000" loading="lazy" decoding="async"><span class="draft-body"><span class="draft-label">${t.draftBadge}</span><strong>${String.fromCharCode(65+i)} · ${t.draftNames[i]}</strong><small>${subs[i]}</small></span></label>`).join("");
  const reasons=t.reasons.map((label,i)=>`<label class="reason-choice"><input type="radio" name="reason" value="${i}" ${state.reason===i?"checked":""}><span>${label}</span></label>`).join("");
  root.innerHTML=`<section class="step-panel" aria-labelledby="step-heading">${stepHeader(t,2,[t.step2,t.step2Note])}<div class="draft-grid">${drafts}</div><fieldset class="reason-fieldset"><legend>${t.reasonLegend}</legend><div class="reason-grid">${reasons}</div></fieldset><p class="hint-line">${t.reasonHint}</p><div class="actions"><button class="primary" type="button" data-action="reveal" ${state.draft && state.reason !== null ? "" : "disabled"}>${t.reveal}</button><button class="secondary" type="button" data-action="back">${t.backMood}</button></div></section>`;
}
function renderResult() {
  const t=copy[state.lang], id=draftId(), edits=t.edits[id], moodLabel=t[state.mood === "rain" ? "rainy" : "chic"], names=t.draftNames, sub=t[`draftSubs${state.mood === "rain" ? "Rain" : "Chic"}`][state.draft-1];
  const reason=t.reasons[state.reason];
  const items=edits.map(([title,why])=>`<li><strong>${title}</strong><span>${why}</span></li>`).join("");
  const roomLink=`/prototype/roomverse-3d/?lang=${state.lang}&mood=${roomverse3d[state.mood]}`;
  root.innerHTML=`<section class="step-panel" aria-labelledby="step-heading"><div class="step-heading"><div><p class="step-kicker">${t.step(3)} · ${t.refinementLabel}</p><h2 id="step-heading" class="step-title" tabindex="-1">${t.step3}</h2><p class="step-note">${t.step3Note}</p></div></div><div class="result-layout"><div><img class="result-image" src="${moods[state.mood].roomImage}" alt="${moods[state.mood].alt[state.lang]}" width="960" height="1200" decoding="async"><p class="result-caption">${enc(moodLabel)} · ${enc(t.refinementLabel)}</p></div><div><p class="selected-reason">${t.chosenReason} ${enc(reason)}</p><p class="result-summary"><strong>${t.before}</strong> ${String.fromCharCode(64+state.draft)} · ${enc(names[state.draft-1])} — ${enc(sub)}</p><ul class="refinement-list">${items}</ul><p class="hint-line">${t.footNote}</p><div class="actions"><a class="primary" href="${roomLink}" data-action="roomverse">${t.linkRoom}</a><button class="secondary" type="button" data-action="restart">${t.restart}</button></div></div></div></section>`;
}
function render() {
  const t=copy[state.lang];
  setDocumentLanguage();
  progressText.textContent=t.step(state.step);
  progressFill.style.width=`${state.step*100/3}%`;
  if(state.step===1) renderMood(); else if(state.step===2) renderDrafts(); else renderResult();
}
document.addEventListener("click",event=>{
  const langButton=event.target.closest("[data-lang]");
  if(langButton){state.lang=langButton.dataset.lang; render(); return;}
  const moodButton=event.target.closest("[data-mood]");
  if(moodButton){state.mood=moodButton.dataset.mood; state.draft=null; state.reason=null; document.querySelectorAll("[data-mood]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mood===state.mood))); const next=document.querySelector('[data-action="continue-mood"]'); if(next) next.disabled=false; return;}
  const action=event.target.closest("[data-action]")?.dataset.action;
  if(action==="continue-mood" && state.mood){state.step=2;render();document.querySelector("#step-heading")?.focus();window.scrollTo(0,0);}
  if(action==="reveal" && state.draft && state.reason!==null){state.step=3;render();document.querySelector("#step-heading")?.focus();window.scrollTo(0,0);}
  if(action==="back"){state.step=1;state.draft=null;state.reason=null;render();document.querySelector("#step-heading")?.focus();}
  if(action==="restart"){state.step=1;state.mood=null;state.draft=null;state.reason=null;render();document.querySelector("#step-heading")?.focus();window.scrollTo(0,0);}
});
document.addEventListener("change",event=>{
  if(event.target.matches('input[name="draft"]')) state.draft=Number(event.target.value);
  if(event.target.matches('input[name="reason"]')) state.reason=Number(event.target.value);
  if(event.target.matches('input[name="draft"],input[name="reason"]')) { const reveal=document.querySelector('[data-action="reveal"]'); if(reveal) reveal.disabled=!(state.draft && state.reason!==null); }
});
render();
