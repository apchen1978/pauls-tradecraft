// Trade Street: the rules of the game, with no page code, so scripts/verify-trade-street.mjs can check them.
// Everything here is a teaching sketch. "Buffer cells" are a game token, not days or money.

export const START_BUFFER = 2;
export const STYLE_ORDER = ["check", "buffer", "ask", "clock", "rules", "trust"];
export const SCENARIO_ORDER = ["peak", "holiday", "rush"];

// Who each style looks like on the street. The cast in the game is eight; six of them are results.
export const STYLE_CHAR = {
  check: "broker",
  buffer: "shipper",
  ask: "forwarder",
  clock: "trucker",
  rules: "dispatcher",
  trust: "factory",
};

export const CAST_ORDER = ["guide", "forwarder", "shipper", "factory", "trucker", "broker", "dispatcher", "buyer"];

// Working names (Paul decides). English uses roles, not invented personal names.
export const CAST = {
  guide: {
    zh: { name: "玉仔", role: "導覽員", line: "遇到行話我就停下來，翻成白話給你。" },
    en: { name: "Yuzai", role: "Your sales contact", line: "When jargon turns up, I stop and put it in plain words." },
  },
  forwarder: {
    zh: { name: "阿代", role: "貨代", line: "你問到的，我才回。所以問清楚，也請我寫下來。" },
    en: { name: "The Forwarder", role: "Forwarder", line: "I answer what you ask. So ask clearly, and ask me to write it down." },
  },
  shipper: {
    zh: { name: "艙長", role: "船公司", line: "位子有限。能多留一點，就多留一點。" },
    en: { name: "The Shipper", role: "Shipping line", line: "Space is limited. Keep a little extra whenever you can." },
  },
  factory: {
    zh: { name: "老廠", role: "工廠", line: "「差不多好了」。我相信人，也承擔後果。" },
    en: { name: "The Factory Head", role: "Factory", line: "“Nearly done.” I trust people, and I carry the consequences." },
  },
  trucker: {
    zh: { name: "老拖", role: "拖車", line: "我的世界就是倒數計時。" },
    en: { name: "The Trucker", role: "Trucking", line: "My whole world is a countdown." },
  },
  broker: {
    zh: { name: "單單", role: "報關行", line: "少一個字就退件，所以什麼都再看一次。" },
    en: { name: "The Broker", role: "Customs broker", line: "One missing word and it comes back, so I look at everything once more." },
  },
  dispatcher: {
    zh: { name: "塔台", role: "碼頭調度", line: "一櫃一櫃排，規矩就是規矩。" },
    en: { name: "The Dispatcher", role: "Terminal dispatcher", line: "One container at a time. The rules are the rules." },
  },
  buyer: {
    zh: { name: "遠方的買家", role: "買家", line: "（訊息）時差永遠對不上。" },
    en: { name: "The Buyer", role: "Buyer, far away", line: "(message) The time zones never line up." },
  },
};

export const STYLES = {
  check: { zh: { name: "核對", line: "少一個字就退件，所以你什麼都再看一次。" }, en: { name: "Double-checker", line: "One missing word and it comes back, so you look at everything once more." } },
  buffer: { zh: { name: "留緩衝", line: "位子有限，你永遠多留一點。" }, en: { name: "Buffer-keeper", line: "Space is limited, so you always keep a little extra." } },
  ask: { zh: { name: "追問", line: "話要寫下來才算數。" }, en: { name: "Get-it-in-writing", line: "Words only count once they are written down." } },
  clock: { zh: { name: "盯時間", line: "你的世界是倒數計時。" }, en: { name: "Clock-watcher", line: "Your world is a countdown." } },
  rules: { zh: { name: "照規矩", line: "一櫃一櫃排，規矩就是規矩。" }, en: { name: "By-the-book", line: "One container at a time. The rules are the rules." } },
  trust: { zh: { name: "放手", line: "「差不多好了」，你相信人，也承擔後果。" }, en: { name: "Let-it-ride", line: "“Nearly done.” You trust people, and carry the consequences." } },
};


// After each choice, the person who matches the style answers in their own voice. A reply, not a verdict.
export const REACT = {
  check: {
    zh: { free: "這樣再看一次，我才安心。", costly: "看得仔細，但時間也跟著走了。" },
    en: { free: "Looking once more is how I sleep at night.", costly: "Thorough, but the clock kept running." },
  },
  buffer: {
    zh: { free: "多留一點，總是對的。", costly: "有緩衝是好事，別把它當成可以不動手。" },
    en: { free: "A little extra is never wasted.", costly: "A buffer helps. It is not a reason to do nothing." },
  },
  ask: {
    zh: { free: "寫下來，大家才不會各說各話。", costly: "話要寫下來才算數，但也要有人先開口。" },
    en: { free: "Write it down, and nobody remembers it differently.", costly: "Words count once they are written down. Somebody still has to speak first." },
  },
  clock: {
    zh: { free: "往回推時間，我最愛這種人。", costly: "趕時間我懂，但這次被時間反咬一口。" },
    en: { free: "Counting backwards from the deadline. My kind of person.", costly: "I get the hurry. This time the clock bit back." },
  },
  rules: {
    zh: { free: "照流程走，大家都好排。", costly: "照規矩沒錯，但這次的情況不一樣。" },
    en: { free: "Follow the process and everyone can be scheduled.", costly: "By the book is fine. This time the case was different." },
  },
  trust: {
    zh: { free: "交給對的人，還要約好回報。", costly: "我相信人，但這次沒人回報。" },
    en: { free: "Hand it to the right person, and agree when they report back.", costly: "I trust people. This time nobody reported back." },
  },
};

export const SCENARIOS = {
  peak: {
    zh: { name: "旺季", line: "艙位吃緊：旺季或熱門航線更容易沒位子。" },
    en: { name: "Peak season", line: "Space is tight: peak seasons and popular routes run out of space more easily." },
  },
  holiday: {
    zh: { name: "連假前後", line: "很多單位的作業時間會改變。" },
    en: { name: "Around a holiday", line: "Many offices change their working hours." },
  },
  rush: {
    zh: { name: "工廠趕工", line: "工廠裝櫃拖延，前面的緩衝一層一層被吃掉。" },
    en: { name: "Factory rush", line: "Loading runs late, and the buffer from earlier steps gets eaten layer by layer." },
  },
};

// Six decisions on six of the twelve steps. `cost` is buffer cells used; `extra` is the cost in a scenario that makes
// this choice worse. Tags: check, buffer, ask, clock, rules, trust. Every style appears three times: twice done well,
// once as its shadow side (the shadow is the option with a cost). `after: true` marks a decision taken after the ship
// has sailed (step 11): it cannot change whether the container makes the ship, only how the documents get to the buyer.
export const DECISIONS = [
  {
    id: "d1", step: 2, light: 3,
    zh: { prompt: "貨代問：這櫃貨要訂哪一班？" },
    en: { prompt: "The forwarder asks: which sailing should this container go on?" },
    options: [
      { id: "A", tag: "clock", cost: 0, zh: "先問清楚最晚哪天要到買家手上，再往回推每一步", en: "Find out the latest day it must reach the buyer, then count backwards." },
      { id: "B", tag: "buffer", cost: 0, zh: "多留一些緩衝，順便問貨代下一個選擇是什麼", en: "Keep some buffer, and ask the forwarder what the next option is." },
      { id: "C", tag: "trust", cost: 1, extra: { peak: 2 }, zh: "口頭跟貨代說一聲，等通知就好", en: "Tell the forwarder out loud, then wait for word." },
    ],
  },
  {
    id: "d2", step: 3, light: 0,
    zh: { prompt: "船公司回了訂艙確認（SO）。" },
    en: { prompt: "The carrier has sent the booking confirmation (SO)." },
    options: [
      { id: "A", tag: "ask", cost: 0, zh: "請貨代把各項截止時間寫成文字", en: "Ask the forwarder to write every cut-off time down." },
      { id: "B", tag: "check", cost: 0, zh: "逐項核對船名航次、目的港、櫃型和截止時間", en: "Check vessel and voyage, destination port, container type and every cut-off time." },
      { id: "C", tag: "rules", cost: 1, zh: "照上次的做法排時間，不再看這次的確認單", en: "Plan the times the way you did last time, without rereading this confirmation." },
    ],
  },
  {
    id: "d3", step: 5, light: 0,
    zh: { prompt: "廠長說：差不多好了。" },
    en: { prompt: "The factory head says: nearly done." },
    options: [
      { id: "A", tag: "check", cost: 0, zh: "到場核對實貨與文件一致，拍照、記下封條號碼", en: "Be there, check the goods match the documents, take photos and note the seal number." },
      { id: "B", tag: "trust", cost: 0, zh: "請廠長裝完回報實貨照片與封條號碼，由你核對", en: "Ask the factory head to report back with photos and the seal number, and you check them." },
      { id: "C", tag: "clock", cost: 1, extra: { rush: 2 }, zh: "趕時間，先封櫃，文件晚點再對", en: "Short on time: seal now, check the papers later." },
    ],
  },
  {
    id: "d4", step: 6, light: 2,
    zh: { prompt: "拖車問：什麼時候進港？" },
    en: { prompt: "The trucker asks: when do we go into the port?" },
    options: [
      { id: "A", tag: "buffer", cost: 0, zh: "留緩衝，提早進港", en: "Keep a buffer and go in early." },
      { id: "B", tag: "rules", cost: 0, zh: "照貨代通知的進港截止時間辦，並記下來", en: "Go by the port-entry cut-off in the forwarder's notice, and write it down." },
      { id: "C", tag: "check", cost: 1, extra: { rush: 2 }, zh: "出發前把所有文件再逐頁核一遍，結果壓線進港", en: "Go through every paper once more before leaving, and arrive at the last minute." },
    ],
  },
  {
    id: "d5", step: 7, light: 1,
    zh: { prompt: "報關行請你備資料。" },
    en: { prompt: "The customs broker asks for your papers." },
    options: [
      { id: "A", tag: "ask", cost: 0, zh: "請報關行列出要備的資料清單，備齊就交", en: "Ask the broker for the list of papers needed, and hand them over once complete." },
      { id: "B", tag: "clock", cost: 0, zh: "照倒推的時間表，在報關截止前備齊並交出", en: "Follow the backwards schedule, and hand everything in before the customs cut-off." },
      { id: "C", tag: "buffer", cost: 1, extra: { holiday: 2 }, zh: "還有時間，資料慢慢備", en: "There is time yet, so prepare the papers slowly." },
    ],
  },
  {
    id: "d6", step: 11, light: null, after: true,
    zh: { prompt: "提單來了。（船已經開了。）" },
    en: { prompt: "The bill of lading has arrived. (The ship has already sailed.)" },
    options: [
      { id: "A", tag: "trust", cost: 0, zh: "請貨代出單，確認誰簽、什麼時候可以拿到，拿到後你再核對", en: "Ask the forwarder who signs and when you will get it, then check it when it arrives." },
      { id: "B", tag: "rules", cost: 0, zh: "照船公司的做法出單，並確認提單種類（正本或電放）", en: "Do it the carrier's way, and confirm the type of bill (original or telex release)." },
      { id: "C", tag: "ask", cost: 1, zh: "什麼都等買家先講，自己不主動問提單", en: "Wait for the buyer to speak first, and never ask about the bill yourself." },
    ],
  },
];

// The four moments the page counts down to. Each decision feeds exactly one light.
export const LIGHTS = ["docs", "customs", "port", "sail"];

// Who speaks at each of the twelve steps (station index 1..12).
export const STATION_SPEAKER = ["buyer", "forwarder", "shipper", "trucker", "factory", "dispatcher", "broker", "guide", "dispatcher", "shipper", "forwarder", "buyer"];

export function optionCost(decision, option, scenario) {
  return option.extra && option.extra[scenario] != null ? option.extra[scenario] : option.cost;
}

export function isCode(code) {
  return typeof code === "string" && /^[ABC]{6}$/.test(code);
}

export function resolve(scenario, code) {
  if (!SCENARIOS[scenario] || !isCode(code)) return null;
  const costs = [];
  const tags = {};
  for (const tag of STYLE_ORDER) tags[tag] = 0;
  DECISIONS.forEach((decision, index) => {
    const option = decision.options.find((item) => item.id === code[index]);
    costs.push(optionCost(decision, option, scenario));
    tags[option.tag] += 1;
  });
  // Whether the container makes the ship depends only on decisions taken before it sails.
  const voyageCost = DECISIONS.reduce((sum, decision, index) => (decision.after ? sum : sum + costs[index]), 0);
  const remaining = START_BUFFER - voyageCost;
  const lightCost = [0, 0, 0, 0];
  DECISIONS.forEach((decision, index) => { if (decision.light != null) lightCost[decision.light] += costs[index]; });
  const lights = lightCost.map((value) => (value === 0 ? "green" : value === 1 ? "amber" : "red"));
  const tier = remaining >= 1 ? "clear" : remaining === 0 ? "tight" : "missed";
  const afterIndex = DECISIONS.findIndex((decision) => decision.after);
  const handover = costs[afterIndex] === 0 ? "smooth" : "fix";
  // The style is the one chosen most often. On a tie, a fixed rule picks among the tied styles (in STYLE_ORDER):
  // the sum of the six option positions (A=0, B=1, C=2) plus the scenario position, modulo how many are tied.
  // Same choices, same result, and the six styles come out about equally often.
  const most = Math.max(...Object.values(tags));
  const tied = STYLE_ORDER.filter((tag) => tags[tag] === most);
  const positions = code.split("").reduce((sum, letter) => sum + "ABC".indexOf(letter), 0) + SCENARIO_ORDER.indexOf(scenario);
  const style = tied[positions % tied.length];
  // the tightest light: the one that cost the most (first in order on a tie); none when nothing cost anything
  let worst = -1;
  lightCost.forEach((value, index) => { if (value > 0 && (worst < 0 || value > lightCost[worst])) worst = index; });
  return { scenario, code, costs, voyageCost, remaining, lightCost, lights, tier, handover, tags, style, character: STYLE_CHAR[style], worstLight: worst < 0 ? null : LIGHTS[worst] };
}

export function readRoute(search) {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const lang = params.get("lang") === "en" ? "en" : "zh";
  const scenario = params.get("s");
  const code = params.get("c");
  const result = SCENARIOS[scenario] && isCode(code) ? { scenario, code } : null;
  return { lang, scenario: SCENARIOS[scenario] ? scenario : null, result };
}

export function shareSearch(scenario, code, lang) {
  const params = new URLSearchParams();
  if (lang === "en") params.set("lang", "en");
  if (SCENARIOS[scenario]) params.set("s", scenario);
  if (isCode(code)) params.set("c", code);
  const text = params.toString();
  return text ? `?${text}` : "";
}

// Every route, for the verify script.
export function allRoutes() {
  const letters = ["A", "B", "C"];
  const codes = [];
  for (const a of letters) for (const b of letters) for (const c of letters) for (const d of letters) for (const e of letters) for (const f of letters) codes.push(a + b + c + d + e + f);
  const out = [];
  for (const scenario of SCENARIO_ORDER) for (const code of codes) out.push(resolve(scenario, code));
  return out;
}
