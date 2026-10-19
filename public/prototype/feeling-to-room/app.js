const copy = {
  zh: {
    lang: "zh-Hant", back: "回到作品集", eyebrow: "ROOMVERSE · 人機共創示範", title: "先有fu，再有家", metaDescription: "先認識一個人今天的處境，再替她挑一個回家的方向。",
    dek: "先認識一個人今天怎麼了，再問她進門那一刻要什麼。房間，是這個答案的結果。",
    boundary: "示範／虛構情境 · AI 初稿為預置內容，不是即時生成。", progressLabel: "探索進度",
    footer: "固定內容的示範；不會連接 AI 服務。", roomverse: "走進 ROOMVERSE 3D",
    step: n => `第 ${n}／3 步`, step1: "替她選一個方向", step1Note: "先看她今天的處境，再想想她進門後需要什麼。",
    continueMood: "看三個方向", step2: "她會先挑哪一個？",
    step2Note: "三個都是預置 AI 初稿；先看哪個方向更照顧眼前的需要。",
    draftBadge: "AI 初稿（預置示範）",
    reasonLegend: "我為什麼先選它？", reasons: ["她進門就能放下", "家人走動順", "平常好整理", "能和現有家具搭"],
    reasonHint: "這個理由不會改變固定示範結果；它幫你把自己的取捨說清楚。",
    reveal: "看人怎麼深化", backMood: "回去換一個人", step3: "把方向收斂成能生活的細節",
    step3Note: "保留初稿想照顧的需要，再把取捨逐項說清楚。", firstFeeling: "她進門的第一個感覺：",
    refinementLabel: "人深化後", chosenReason: "你先看重：", before: "初稿方向：", why: "為什麼這樣調：",
    edits: {
      "rain-1": [["留下素色靠墊，先收起相近的繁複花紋。","讓視線有休息的位置，雨天的柔和感仍在。"],["把毯子留在沙發一角，不再同時鋪滿座面。","坐下和起身都比較俐落，也保留柔軟觸感。"],["讓地毯回到低對比的織紋。","把溫暖留在材質，不讓圖案蓋過房間。"]],
      "rain-2": [["縮小茶几的視覺份量，替沙發前留出空間。","讓兩人走動和放腳都有餘裕。"],["把主要物件集中在沙發附近。","房間焦點明確，窗邊仍看得見。"],["保留一盞暖燈，減少桌面的零碎擺設。","把注意力帶回休息，而不是物件清單。"]],
      "rain-3": [["讓天花主燈退下，只留下座燈的暖光。","光源方向更一致，也更接近雨夜的安靜。"],["選一款較安定的地毯花紋。","避免地面和窗外雨景互相競爭。"],["把金屬表面改成較柔和的霧面。","減少反光，讓眼睛先落在沙發和燈光。"]],
      "chic-1": [["把粉色收在窗簾和一顆靠墊。","留住清晨的柔和，也讓房間有呼吸。"],["以奶油白和淺木色平衡大面積色彩。","不讓同一色調從牆面一路壓到家具。"],["把金屬留給一個小燈具。","點到為止，讓材質層次更清楚。"]],
      "chic-2": [["桌面只留一件金屬小物。","把視覺焦點從陳列拉回休息區。"],["讓花器和書本錯開，不排成一整列。","留出實際使用的桌面空間。"],["用霧面布料接住窗邊的亮光。","金屬仍有亮點，整體不會太硬。"]],
      "chic-3": [["讓地毯圖案安靜一點，保留清楚的輪廓。","地板有質感，視線不會被圖案帶走。"],["把弧形落地燈換成較輕的燈罩比例。","減少窗邊與燈具的輪廓重疊。"],["保留一處陶土色作為暖色落點。","和霧粉、奶油白一起形成有層次的配色。"]],
      "family-1": [["把常用玩具放進固定收納籃。","孩子玩完知道可以收回哪裡。"],["留一面花色作記憶點，其餘換成安靜布面。","眼睛有休息的地方，熱鬧感還在。"],["把常玩的物品放在孩子拿得到的低層。","大人不用每次都重新整理。"]],
      "family-2": [["把大茶几換成圓角或軟邊款。","孩子跑動時，少一個需要繞開的硬角。"],["先替桌角加上防撞軟墊。","常用的碰撞位置先變得柔和。"],["桌面只留常用物品。","聚會和走動時比較不容易被擋住。"]],
      "family-3": [["選擇容易清理的布面。","日常有小意外，整理不必從頭開始。"],["把淺色留在靠墊等小面積。","保留明亮感，也減少大面積清潔負擔。"],["給孩子留一小塊柔軟活動區。","玩和休息都能有自己的位置。"]],
      "tech-1": [["留一個主螢幕，其餘收進側櫃。","桌面不用同時容納每一台設備。"],["把常用小物分進抽屜和收納盒。","手邊留下真正需要的空間。"],["加一盞暖色桌燈。","夜裡工作時，桌面不只剩螢幕的光。"]],
      "tech-2": [["降低藍色燈帶亮度，只留在螢幕後方。","冷光不必佔滿整個房間。"],["加一盞暖色落地燈。","讓視線離開螢幕時有柔和的光。"],["把桌面照明留在工作區。","需要專注時看得清楚，其他地方仍安靜。"]],
      "tech-3": [["用線槽沿桌腳收起延長線。","走動的路上少一些外露線材。"],["把充電集中到一個收納點。","不用在房間裡找不同的插頭。"],["把多餘線長固定在桌後。","地面看起來乾淨，也比較好打掃。"]],
    },
    footNote: "這是固定的設計示範；同一個需要，也可能有別的解法。",
    linkRoom: "走進對應的 ROOMVERSE 3D 房間", restart: "重新開始",
  },
  en: {
    lang: "en", back: "Back to the portfolio", eyebrow: "ROOMVERSE · Human–AI co-design demo", title: "Feeling First", metaDescription: "Meet someone’s situation before choosing a direction for the feeling of coming home.",
    dek: "Meet someone in their day. Then ask what they need when they come home. The room is one possible answer.",
    boundary: "Demo / fictional scenario · AI drafts are prepared examples, not live generations.", progressLabel: "Your path",
    footer: "A fixed-content demo. It does not connect to an AI service.", roomverse: "Enter ROOMVERSE 3D",
    step: n => `Step ${n} of 3`, step1: "Who is coming home today?", step1Note: "See where they are today. Then imagine what might help when they get home.",
    continueMood: "Pick a direction for them", step2: "Pick a direction for them",
    step2Note: "These are three prepared AI drafts. Which one takes better care of the need in front of you?",
    draftBadge: "AI draft · prepared example",
    reasonLegend: "Why would you choose it first?", reasons: ["They can settle in", "Family can move around", "Easy to care for", "Works with what they own"],
    reasonHint: "Your reason does not change the fixed example. It helps make your own trade-off clear.",
    reveal: "See how a person refines it", backMood: "Choose another story", step3: "Turn the direction into livable details",
    step3Note: "Keep the need behind the draft, then make each choice explicit.", firstFeeling: "Their first feeling on entering:",
    refinementLabel: "Human refinement", chosenReason: "Your first priority:", before: "Draft direction:", why: "Why this changed:",
    edits: {
      "rain-1": [["Keep solid cushions and set aside the competing patterns.","Give the eye a place to rest while keeping the soft rainy-day mood."],["Drape the throw at one end of the sofa instead of covering the seat.","Make sitting down easier and keep the touch of softness."],["Choose a low-contrast rug texture.","Let the warmth come from the material, not a busy pattern."]],
      "rain-2": [["Reduce the coffee table’s visual weight and open space in front of the sofa.","Leave room to walk and put your feet up."],["Keep the main pieces close to the sofa.","Give the room a clear focus while keeping the window in view."],["Keep one warm lamp and clear some small objects from the table.","Bring attention back to resting, not to a list of things."]],
      "rain-3": [["Let the ceiling light recede and keep the warm table lamp.","Make the light feel consistent and calm for a rainy evening."],["Choose a quieter rug pattern.","Keep the floor from competing with the rainy view."],["Use softer matte finishes instead of reflective metal.","Reduce glare so the sofa and warm light come first."]],
      "chic-1": [["Keep rose in the curtains and one cushion.","Retain the gentle morning mood and leave the room some breathing space."],["Balance large colour areas with cream and pale wood.","Stop one colour from carrying from wall to furniture."],["Keep brass to one small lamp detail.","Use it as an accent so the material layers stay clear."]],
      "chic-2": [["Keep one brass object on the table.","Move the focus from display back to the seating area."],["Offset the vase and books instead of lining them up.","Leave useful space on the table."],["Use matte fabric to soften the window light.","Keep a little metal shine without making the room feel hard."]],
      "chic-3": [["Quiet the rug pattern and keep its outline clear.","Give the floor texture without pulling the eye away."],["Choose a lighter lamp silhouette beside the window.","Keep the lamp and window frames from competing."],["Keep one terracotta accent as a warm point.","Let it add depth alongside dusty rose and cream."]],
      "family-1": [["Give everyday toys a basket of their own.","Children can see where things go when play is done."],["Keep one patterned accent and quiet the rest.","Leave the eye a place to rest without losing the lively feel."],["Put favorite toys on a low, reachable shelf.","Adults do not have to reset the room every time."]],
      "family-2": [["Choose a rounded or soft-edge coffee table.","Give children fewer hard corners to navigate around."],["Add soft corner guards for now.","Make the most likely bump points gentler."],["Keep only everyday items on the tabletop.","Leave more room for gathering and moving around."]],
      "family-3": [["Choose fabric that is easier to clean.","Small everyday spills do not have to become a major reset."],["Use pale color in smaller accents.","Keep the room bright without putting every surface at risk."],["Leave a small soft area for children.","Make room for both play and a quiet pause."]],
      "tech-1": [["Keep one main screen and move others to a side cabinet.","The desk does not need to hold every device at once."],["Give small accessories a drawer or tray.","Keep the useful work surface open."],["Add a warm desk lamp.","At night, the screen does not have to be the only light."]],
      "tech-2": [["Lower the blue light and keep it behind the screen.","Cool light does not need to fill the whole room."],["Add a warm floor lamp.","Give the eyes softer light when they look away from the screen."],["Keep task lighting over the desk.","Make the work area clear while the rest stays calm."]],
      "tech-3": [["Route the extension cord along the desk leg.","Keep loose cables out of the walking path."],["Gather charging in one place.","Avoid searching around the room for a plug."],["Secure extra cable length behind the desk.","Keep the floor clear and easier to clean."]],
    },
    footNote: "This is a fixed design example; the same need can have other good answers.",
    linkRoom: "Enter the matching ROOMVERSE 3D room", restart: "Start again",
  },
};

const moods = {
  rain: {
    portrait: "person-rain.webp", story: { zh: "加班到十點，外面下著雨。", en: "Working late; rain is falling outside." },
    portraitAlt: { zh: "一位加班回家的人站在雨夜玄關，手邊放著雨傘。", en: "A person arriving home after work, seen from behind beside an umbrella on a rainy night." },
    roomImage: "/prototype/room-mode-remote/assets/room-rug-v2.webp", roomAlt: { zh: "雨夜客廳裡的沙發與暖燈。", en: "A sofa and warm lamp in a living room on a rainy night." }, moodParam: "rain",
    feeling: { zh: "肩膀終於放下來。", en: "At last, their shoulders can drop." },
    draftNames: { zh: ["柔軟鋪陳", "留白相聚", "明亮焦點"], en: ["Soft layers", "Room to gather", "Bright focal point"] },
    draftSubs: { zh: ["花紋太多，她回家還得整理視線", "茶几太大，放下包仍得繞路", "冷暖光一起搶眼，讓人很難鬆下來"], en: ["Too many patterns for a tired evening", "A large table leaves little room to settle", "Warm and cool light compete for attention"] },
  },
  chic: {
    portrait: "person-chic.webp", story: { zh: "明早要簡報，想先把自己整理好。", en: "A presentation tomorrow; she wants to feel ready." },
    portraitAlt: { zh: "一位準備明日簡報的人背對畫面，手拿資料夾站在晨光裡。", en: "A person with a folder, seen from behind in morning light before a presentation." },
    roomImage: "/prototype/room-mode-remote/assets/room-chic-city-v1.webp", roomAlt: { zh: "晨光照進城市客廳，霧粉窗簾、奶油白沙發與淺色地毯。", en: "Morning light in a city living room with dusty-rose curtains, a cream sofa and pale rug." }, moodParam: "chic",
    feeling: { zh: "今天，可以開始了。", en: "Now, the day can begin." },
    draftNames: { zh: ["柔和粉色", "金屬細節", "明亮焦點"], en: ["Soft rose", "Brass details", "Bright focal point"] },
    draftSubs: { zh: ["粉色一路延伸，她想整理自己卻先被房間淹沒", "金屬小物擠滿桌面，準備資料不方便", "地毯與燈具都很搶眼，讓人難安定"] , en: ["Rose carries everywhere before she can settle", "Crowded brass objects leave little desk space", "The rug and lamp compete for attention"] },
  },
  family: {
    portrait: "person-family.webp", story: { zh: "週末，兩個孩子和長輩都要來。", en: "The family is coming over this weekend." },
    portraitAlt: { zh: "大人和兩個孩子都以背影出現在玄關，門邊有長輩的手杖。", en: "An adult and two children seen from behind at an entryway, with a cane nearby." },
    roomImage: "/prototype/room-mode-remote/assets/room-sunny-v1.webp", roomAlt: { zh: "白天自然光照著木質家具、綠色靠墊與陶土色細節。", en: "Daylight on wood furniture, green cushions and terracotta accents." }, moodParam: "family",
    feeling: { zh: "大家都在，也都自在。", en: "Everyone is here, and everyone has room." },
    draftNames: { zh: ["熱鬧玩具角", "茶几擋住路", "柔軟大地毯"], en: ["A lively toy corner", "Coffee table in the way", "A soft, pale rug"] },
    draftSubs: { zh: ["玩具和花色很多，聚會後不容易收整", "桌角偏硬，孩子跑動時要留心", "淺色大地毯好看，吃喝時不容易照料"], en: ["Toys and patterns will be hard to put away", "Hard table corners meet a child’s running path", "A pale rug looks lovely but is hard to keep clean"] },
  },
  tech: {
    portrait: "person-tech.webp", story: { zh: "在家寫到半夜，只想要安靜。", en: "Working from home past midnight, they need quiet." },
    portraitAlt: { zh: "一位深夜在家工作的人背對畫面，放下背包站在一盞暖燈旁。", en: "A person setting down a backpack beside a warm lamp, seen from behind at night." },
    roomImage: "/prototype/room-mode-remote/assets/room-tech-night-v1.webp", roomAlt: { zh: "夜間客廳以暖燈照亮沙發，窗外是深藍夜色。", en: "A warm lamp lights a sofa while deep blue night shows beyond the window." }, moodParam: "tech",
    feeling: { zh: "世界安靜了，只剩下專注。", en: "The room settles; focus can stay." },
    draftNames: { zh: ["螢幕牆", "冷藍氛圍", "線材外露"], en: ["A wall of screens", "Cold blue glow", "Cables left out"] },
    draftSubs: { zh: ["機器太多，桌面很擠", "整間偏冷，看久眼睛累", "線材外露，絆腳又雜亂"], en: ["Too many devices crowd the desk", "Blue light fills the room and tires the eyes", "Loose cables clutter the floor and path"] },
  },
};
const state = { lang: new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh", step: 1, mood: null, draft: null, reason: null };
const root = document.querySelector("#step-content");
const progressText = document.querySelector("#progress-text");
const progressFill = document.querySelector("#progress-fill");

function enc(text) { return String(text).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
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
  const cards=Object.entries(moods).map(([id,mood])=>`<button class="mood-card" type="button" data-mood="${id}" aria-pressed="${state.mood===id}"><img src="./assets/${mood.portrait}" alt="${mood.portraitAlt[state.lang]}" width="800" height="1000" decoding="async"><span class="mood-copy"><span>${mood.story[state.lang]}</span></span></button>`).join("");
  root.innerHTML=`<section class="step-panel" aria-labelledby="step-heading">${stepHeader(t,1,[t.step1,t.step1Note])}<div class="mood-grid">${cards}</div><div class="actions"><button class="primary" type="button" data-action="continue-mood" ${state.mood ? "" : "disabled"}>${t.continueMood}</button></div></section>`;
}
function renderDrafts() {
  const t=copy[state.lang], mood=moods[state.mood], subs=mood.draftSubs[state.lang], names=mood.draftNames[state.lang];
  const drafts=[1,2,3].map((id,i)=>`<label class="draft-choice"><input type="radio" name="draft" value="${id}" ${state.draft===id?"checked":""}><img src="./assets/${state.mood}-${id}.webp" alt="${state.lang === "zh" ? `AI 初稿 ${String.fromCharCode(65+i)}：${names[i]}，${subs[i]}` : `AI draft ${String.fromCharCode(65+i)}: ${names[i]}, ${subs[i]}`}" width="800" height="1000" loading="lazy" decoding="async"><span class="draft-body"><span class="draft-label">${t.draftBadge}</span><strong>${String.fromCharCode(65+i)} · ${names[i]}</strong><small>${subs[i]}</small></span></label>`).join("");
  const reasons=t.reasons.map((label,i)=>`<label class="reason-choice"><input type="radio" name="reason" value="${i}" ${state.reason===i?"checked":""}><span>${label}</span></label>`).join("");
  root.innerHTML=`<section class="step-panel" aria-labelledby="step-heading">${stepHeader(t,2,[t.step2,t.step2Note])}<div class="draft-grid">${drafts}</div><fieldset class="reason-fieldset"><legend>${t.reasonLegend}</legend><div class="reason-grid">${reasons}</div></fieldset><p class="hint-line">${t.reasonHint}</p><div class="actions"><button class="primary" type="button" data-action="reveal" ${state.draft && state.reason !== null ? "" : "disabled"}>${t.reveal}</button><button class="secondary" type="button" data-action="back">${t.backMood}</button></div></section>`;
}
function renderResult() {
  const t=copy[state.lang], id=draftId(), mood=moods[state.mood], edits=t.edits[id], names=mood.draftNames[state.lang], sub=mood.draftSubs[state.lang][state.draft-1];
  const reason=t.reasons[state.reason];
  const items=edits.map(([title,why])=>`<li><strong>${title}</strong><span>${why}</span></li>`).join("");
  const roomLink=`/prototype/roomverse-3d/?lang=${state.lang}&mood=${mood.moodParam}`;
  root.innerHTML=`<section class="step-panel" aria-labelledby="step-heading"><div class="step-heading"><div><p class="step-kicker">${t.step(3)} · ${t.refinementLabel}</p><h2 id="step-heading" class="step-title" tabindex="-1">${t.step3}</h2><p class="step-note">${t.step3Note}</p></div></div><div class="result-layout"><div class="postcard"><img class="result-image" src="${mood.roomImage}" alt="${mood.roomAlt[state.lang]}" width="800" height="1000" decoding="async"><p class="result-caption"><strong>${t.firstFeeling}</strong> ${enc(mood.feeling[state.lang])}</p></div><div><p class="selected-reason">${t.chosenReason} ${enc(reason)}</p><p class="result-summary"><strong>${t.before}</strong> ${String.fromCharCode(64+state.draft)} · ${enc(names[state.draft-1])} — ${enc(sub)}</p><ul class="refinement-list">${items}</ul><p class="hint-line">${t.footNote}</p><div class="actions"><a class="primary" href="${roomLink}" data-action="roomverse">${t.linkRoom}</a><button class="secondary" type="button" data-action="restart">${t.restart}</button></div></div></div></section>`;
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
