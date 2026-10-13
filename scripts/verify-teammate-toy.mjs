import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { distribution, FACTIONS, factionLabel, identityLine, isRare, readPartner, readRoute, resolveChoices, SCENARIOS, shareSearch, TYPES, UI, wrapLines } from "../prototype/teammate-type/app.js";
import { dialogueFor, extractCode, pairStats, ROLE_ORDER } from "../prototype/teammate-type/duo.js";

test("old ABCD codes keep the six-type balance", () => {
  const counts = distribution("ABCD");
  assert.deepEqual(counts, {
    umbrella: 10,
    cocoa: 11,
    spark: 11,
    mapkeeper: 10,
    finisher: 11,
    soundtrack: 11,
    strategist: 0,
    messenger: 0,
    galaxy: 0,
    andromeda: 0,
    designer: 0,
    alliance: 0,
    missionary: 0,
    apostle: 0,
    craftsman: 0,
    recorder: 0,
  });
  const abcd = {
    AAA: "umbrella", AAB: "umbrella", AAC: "umbrella", AAD: "umbrella",
    ABA: "finisher", ABB: "spark", ABC: "finisher", ABD: "finisher",
    ACA: "cocoa", ACB: "umbrella", ACC: "soundtrack", ACD: "soundtrack",
    ADA: "umbrella", ADB: "mapkeeper", ADC: "finisher", ADD: "umbrella",
    BAA: "cocoa", BAB: "spark", BAC: "cocoa", BAD: "umbrella",
    BBA: "cocoa", BBB: "cocoa", BBC: "finisher", BBD: "soundtrack",
    BCA: "cocoa", BCB: "soundtrack", BCC: "finisher", BCD: "soundtrack",
    BDA: "cocoa", BDB: "spark", BDC: "cocoa", BDD: "mapkeeper",
    CAA: "cocoa", CAB: "spark", CAC: "umbrella", CAD: "soundtrack",
    CBA: "spark", CBB: "spark", CBC: "finisher", CBD: "spark",
    CCA: "soundtrack", CCB: "spark", CCC: "spark", CCD: "soundtrack",
    CDA: "cocoa", CDB: "spark", CDC: "mapkeeper", CDD: "soundtrack",
    DAA: "mapkeeper", DAB: "umbrella", DAC: "finisher", DAD: "mapkeeper",
    DBA: "finisher", DBB: "spark", DBC: "finisher", DBD: "finisher",
    DCA: "cocoa", DCB: "mapkeeper", DCC: "soundtrack", DCD: "soundtrack",
    DDA: "mapkeeper", DDB: "mapkeeper", DDC: "mapkeeper", DDD: "mapkeeper",
  };
  for (const [code, type] of Object.entries(abcd)) assert.equal(resolveChoices(code).type, type, code);
});

test("every role is reachable, including the four new ones", () => {
  const counts = distribution("ABCDEF");
  assert.equal(resolveChoices("EAE").type, "strategist");
  assert.equal(resolveChoices("AEA").type, "messenger");
  assert.equal(resolveChoices("AFE").type, "missionary");
  assert.equal(resolveChoices("AEF").type, "messenger");
  assert.equal(resolveChoices("ACF").type, "apostle");
  assert.equal(resolveChoices("FAE").type, "galaxy");
  assert.equal(resolveChoices("FBD").type, "andromeda");
  assert.equal(resolveChoices("AFC").type, "designer");
  assert.notEqual(resolveChoices("FAB").type, "galaxy");
  assert.notEqual(resolveChoices("FAB").type, "andromeda");
  assert.equal(counts.galaxy, 3);
  assert.equal(counts.andromeda, 3);
  assert.equal(counts.designer, 6);
  assert.equal(counts.alliance, 21);
  assert.equal(counts.missionary, 16);
  assert.equal(counts.apostle, 16);
  assert.equal(resolveChoices("EEA").type, "alliance");
  assert.equal(resolveChoices("BBA").type, "cocoa");
  assert.deepEqual(counts, {
    umbrella: 19,
    cocoa: 20,
    finisher: 19,
    spark: 20,
    mapkeeper: 18,
    soundtrack: 19,
    strategist: 18,
    messenger: 18,
    alliance: 21,
    missionary: 16,
    apostle: 16,
    galaxy: 3,
    andromeda: 3,
    designer: 6,
    craftsman: 0,
    recorder: 0,
  });
});

test("sixteen roles are reachable and the queens stay a small share", () => {
  const counts = distribution();
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  assert.equal(total, 512);
  assert.equal(Object.keys(TYPES).length, 16);
  for (const id of Object.keys(TYPES)) assert.ok(counts[id] >= 1, `${id} ${counts[id]}`);
  const share = (counts.galaxy + counts.andromeda) / total;
  assert.ok(share >= 0.03 && share <= 0.05, String(share));
  assert.equal(counts.galaxy, 9);
  assert.equal(counts.andromeda, 9);
  assert.equal(resolveChoices("GGG").type, "craftsman");
  assert.equal(resolveChoices("HHH").type, "recorder");
  assert.equal(resolveChoices("FAE").type, "galaxy");
  assert.equal(resolveChoices("FBD").type, "andromeda");
  const members = Object.values(FACTIONS).flatMap((faction) => faction.members);
  assert.equal(new Set(members).size, 16);
  assert.deepEqual(Object.fromEntries(Object.values(FACTIONS).map((faction) => [faction.zh, faction.members.length])), {
    銀河隊: 4,
    仙女隊: 4,
    星圖隊: 4,
    燈下隊: 4,
  });
  assert.equal(TYPES.recorder.faction, "galaxy");
  assert.equal(TYPES.umbrella.faction, "galaxy");
  assert.equal(TYPES.alliance.faction, "galaxy");
  assert.equal(TYPES.apostle.faction, "lantern");
  assert.equal(TYPES.craftsman.faction, "lantern");
  assert.equal(TYPES.cocoa.faction, "lantern");
  assert.equal(FACTIONS.galaxy.leader, "galaxy");
  assert.equal(FACTIONS.andromeda.leader, "andromeda");
  assert.equal(factionLabel("galaxy", "zh"), "🌌 銀河隊 · 隊長");
  assert.equal(factionLabel("recorder", "zh"), "🌌 銀河隊");
  assert.equal(factionLabel("craftsman", "en"), "🏮 Lantern Team");
  assert.equal(TYPES.recorder.zh.person, "靚仔");
  assert.equal(TYPES.recorder.zh.name, "拍下來了");
  assert.equal(TYPES.craftsman.zh.person, "戴安娜");
  assert.equal(TYPES.craftsman.zh.name, "修好了");
  assert.equal(TYPES.craftsman.zh.role, "工匠");
  for (const id of Object.keys(TYPES)) {
    assert.ok(TYPES[id].zh.about.startsWith("關於"));
    assert.ok(TYPES[id].en.about.startsWith("About "));
  }
});

test("majority and the sum-mod-3 tie-break stay fixed", () => {
  assert.equal(resolveChoices("AAA").type, "umbrella");
  assert.equal(resolveChoices("AAA").tie, false);
  assert.equal(resolveChoices("BBC").type, "finisher");
  assert.equal(resolveChoices("CCD").type, "soundtrack");
  assert.deepEqual(resolveChoices("ABA"), { code: "ABA", type: "finisher", tie: true });
  assert.deepEqual(resolveChoices("BBD"), { code: "BBD", type: "soundtrack", tie: true });
  assert.deepEqual(resolveChoices("DAA"), { code: "DAA", type: "mapkeeper", tie: true });
  assert.deepEqual(resolveChoices("ACB"), { code: "ACB", type: "umbrella", tie: true });
  assert.deepEqual(resolveChoices("BBB"), { code: "BBB", type: "cocoa", tie: true });
  assert.equal(resolveChoices("abc"), null);
  assert.equal(resolveChoices("AB"), null);
  assert.equal(resolveChoices("ABCD"), null);
});

test("the same choices always resolve the same way", () => {
  for (const a of "ABCDEFGH") {
    for (const b of "ABCDEFGH") {
      for (const c of "ABCDEFGH") {
        const code = a + b + c;
        assert.deepEqual(resolveChoices(code), resolveChoices(code));
        assert.ok(TYPES[resolveChoices(code).type]);
      }
    }
  }
});

test("each scenario has eight choices and every role is offered", () => {
  const seen = {};
  for (const scenario of SCENARIOS) {
    assert.deepEqual(scenario.choices.map((choice) => choice.id), ["A", "B", "C", "D", "E", "F", "G", "H"]);
    for (const choice of scenario.choices) seen[choice.type] = (seen[choice.type] || 0) + 1;
  }
  assert.deepEqual(seen, {
    umbrella: 2,
    cocoa: 2,
    spark: 2,
    mapkeeper: 2,
    finisher: 2,
    soundtrack: 2,
    strategist: 2,
    messenger: 2,
    queen: 1,
    designer: 1,
    craftsman: 3,
    recorder: 3,
  });
  assert.equal(seen.alliance || 0, 0);
  assert.equal(seen.missionary || 0, 0);
  assert.equal(seen.apostle || 0, 0);
});

test("share links carry the three choices, and a bad code does not resolve", () => {
  assert.equal(shareSearch("ABA", "en"), "c=ABA&lang=en");
  assert.equal(shareSearch("CCD", "zh"), "c=CCD&lang=zh");
  assert.equal(shareSearch("FAE", "zh", "EEA"), "c=FAE&with=EEA&lang=zh");
  assert.equal(readPartner("?c=FAE&with=eea"), "EEA");
  assert.equal(readPartner("?c=FAE&with=nope"), null);
  assert.equal(extractCode("https://paulstradecraft.com/prototype/teammate-type/?c=bba&lang=zh"), "BBA");
  assert.equal(extractCode("EEA"), "EEA");
  assert.equal(extractCode("nope"), null);
  assert.deepEqual(readRoute("?c=aba&lang=en"), { lang: "en", code: "ABA" });
  assert.deepEqual(readRoute("?c=eae&lang=zh"), { lang: "zh", code: "EAE" });
  assert.deepEqual(readRoute("?c=nope"), { lang: "zh", code: null });
  assert.equal(resolveChoices("EFG").type, "alliance");
  assert.equal(resolveChoices("XYZ"), null);
  assert.deepEqual(readRoute(""), { lang: "zh", code: null });
});

test("card lines do not orphan 關於 or 了。 and the work has its new name", () => {
  const ctx = { measureText(text) { return { width: Array.from(String(text)).length * 20 }; } };
  const about = "關於玉仔：喊一聲，後面那一排就到了。";
  const narrow = wrapLines(ctx, about, 40);
  const wide = wrapLines(ctx, about, 16 * 20);
  assert.equal(narrow.some((line) => line === "關於"), false);
  assert.equal(wide.some((line) => /^[了。]+$/.test(line)), false);
  assert.equal(narrow.join(""), about);
  assert.equal(wide.join(""), about);
  assert.equal(UI.zh.title, "十二月的燈");
  assert.equal(UI.zh.subtitle, "你是哪一種隊友？");
  assert.equal(UI.en.title, "December Lights");
  assert.equal(UI.en.subtitle, "What kind of teammate are you?");
  assert.equal(UI.zh.h1, UI.zh.title);
  assert.equal(UI.zh.boundary, "示意玩具，不是心理測驗。");
  const html = readFileSync(new URL("../prototype/teammate-type/index.html", import.meta.url), "utf8");
  assert.match(html, /nightglow-map-mobile\.webp 800w/);
  assert.match(html, /nightglow-map\.webp 1600w/);
  assert.match(html, /nightglow-map-mobile@2x\.webp 1440w/);
  assert.match(html, /nightglow-map@2x\.webp 2560w/);
  assert.equal(/ 2x,| 3x|\.webp 2x/.test(html), false);
});

test("public copy keeps the boundary and skips claims, trademarks, and contact details", () => {
  const blob = JSON.stringify({ UI, TYPES, SCENARIOS });
  assert.equal(UI.zh.boundary, "示意玩具，不是心理測驗。");
  assert.equal(UI.en.boundary, "A toy, not a personality test.");
  assert.equal(UI.zh.intro, "歡迎來到照夜鎮。每個人都有自己的本事。一起完成一件小事，就讓夜晚亮一點。");
  assert.equal(UI.en.intro, "Welcome to Nightglow. Everyone brings something to the team. Each small thing you accomplish together makes the night a little brighter.");
  const html = readFileSync(new URL("../prototype/teammate-type/index.html", import.meta.url), "utf8");
  assert.equal(/遠燈鎮/.test(blob + html), false);
  assert.equal(TYPES.alliance.zh.person, "玉仔");
  assert.equal(TYPES.alliance.zh.mark, "照夜玉獅子");
  assert.equal(TYPES.alliance.en.person, "Yuzai");
  assert.equal(TYPES.alliance.en.mark, "Night-Shining Jade Lion");
  assert.equal(TYPES.galaxy.zh.person, undefined);
  let horseScan = blob;
  for (const bit of [TYPES.alliance.zh.person, TYPES.alliance.zh.mark, TYPES.alliance.en.person, TYPES.alliance.en.mark, "關於玉仔", "About Yuzai"]) {
    horseScan = horseScan.split(bit).join("");
  }
  assert.equal(/玉仔|照夜玉獅子|Yuzai|Night-Shining Jade Lion/.test(horseScan), false);
  assert.equal((html.match(/玉仔/g) || []).length, 1);
  assert.match(html, /星圖隊：莉婭、墨衡、塞安、苔苔/);
  assert.equal(html.includes("栗子"), false);
  assert.equal(/照夜玉獅子/.test(html), false);
  assert.equal(TYPES.cocoa.zh.role, "守護者");
  assert.equal(TYPES.cocoa.en.role, "Guardian");
  assert.equal(blob.includes("補師") || /\bHealer\b/.test(blob), false);
  assert.equal(/人工智慧|\bAI\b|老闆|老板|ROI|轉換率|成交率|中間層|A2A|\bCDD\b|前職|Former role|\bowner\b|英雄聯盟|魔獸|Overwatch|Warcraft|League of Legends|mailto:|@gmail/i.test(blob), false);
  assert.equal(/魔法|法師|咒|巫|\bmage\b|\bmagic\b/i.test(blob), false);
  assert.equal(TYPES.spark.zh.role, "點子");
  assert.equal(TYPES.spark.en.role, "Ideas");
  assert.equal(TYPES.missionary.zh.role, "傳教士");
  assert.equal(TYPES.missionary.en.role, "Missionary");
  assert.equal(TYPES.apostle.zh.role, "使徒");
  assert.equal(TYPES.apostle.en.role, "Apostle");
  assert.equal(TYPES.galaxy.zh.name, "銀河之女");
  assert.equal(TYPES.galaxy.en.name, "Daughter of the Galaxy");
  assert.equal(TYPES.andromeda.zh.name, "仙女座女王");
  assert.equal(TYPES.andromeda.en.name, "Queen of Andromeda");
  assert.equal(TYPES.andromeda.zh.person, "Holly");
  assert.equal(TYPES.andromeda.egg, "M-31");
  assert.deepEqual(Object.fromEntries(Object.keys(TYPES).map((id) => [id, identityLine(TYPES[id].zh)])), {
    umbrella: "阿白 · 坦克 · 擋雨的人",
    cocoa: "MG · 守護者 · 晚安熱可可",
    finisher: "塞安 · 刺客 · 最後一擊",
    spark: "阿閃 · 點子 · 腦內煙火師",
    mapkeeper: "莉婭 · 斥候 · 地圖收藏家",
    soundtrack: "樂樂 · 吟遊詩人 · BGM 擔當",
    strategist: "墨衡 · 軍師 · 先看全局",
    messenger: "阿修 · 傳令兵 · 話送到了",
    galaxy: "銀河之女 · 女王",
    andromeda: "Holly · 女王 · 仙女座女王",
    designer: "苔苔 · 設計師 · 順眼就對了",
    alliance: "玉仔 · 聯盟 · 援軍到了",
    missionary: "言歌 · 傳教士 · 這件事值得說",
    apostle: "保羅 · 使徒 · 我接著走",
    craftsman: "戴安娜 · 工匠 · 修好了",
    recorder: "靚仔 · 記錄者 · 拍下來了",
  });
  assert.equal(identityLine(TYPES.galaxy.en), "Daughter of the Galaxy · Queen");
  assert.equal(identityLine(TYPES.andromeda.en), "Holly · Queen · Queen of Andromeda");
  assert.equal(identityLine(TYPES.alliance.en), "Yuzai · Alliance · Reinforcements Are Here");
  assert.equal(identityLine(TYPES.recorder.en), "Lenz · Keeper of Moments · Got the Shot");
  assert.equal(identityLine(TYPES.umbrella.en), "Abai · Tank · The Umbrella");
  assert.equal(identityLine(TYPES.finisher.en), "Zion · Assassin · The Finisher");
  assert.equal(identityLine(TYPES.mapkeeper.en), "Leia · Scout · The Mapkeeper");
  assert.equal(TYPES.mapkeeper.zh.role, "斥候");
  assert.equal(TYPES.mapkeeper.en.role, "Scout");
  assert.equal(TYPES.mapkeeper.zh.name, "地圖收藏家");
  assert.equal(TYPES.mapkeeper.en.name, "The Mapkeeper");
  assert.equal(resolveChoices("DAA").type, "mapkeeper");
  assert.equal(TYPES.strategist.zh.about, "關於隊友莉婭：出發前，口袋裡永遠有一張空白地圖。");
  assert.equal(TYPES.strategist.en.about, "About teammate Leia: before setting off, there's always a blank map in that pocket.");
  assert.equal(blob.includes("栗子") || blob.includes("Chestnut"), false);
  assert.equal(TYPES.finisher.zh.role, "刺客");
  assert.equal(TYPES.finisher.en.role, "Assassin");
  assert.equal(/輸出|\bDPS\b|Assassin \/ damage/.test(blob), false);
  assert.equal(isRare("galaxy") && isRare("andromeda") && !isRare("designer"), true);
  assert.equal(TYPES.galaxy.prop, "crown");
  assert.equal(TYPES.andromeda.prop, "crown");
  assert.equal(Object.values(TYPES).filter((type) => type.prop === "crown").length, 2);
  for (const lang of ["zh", "en"]) {
    for (const type of Object.values(TYPES)) {
      for (const key of ["name", "role", "funny", "gentle", "literary", "strength", "alt"]) {
        assert.ok(type[lang][key]);
      }
    }
  }
});

test("the page is one folder and does not inline a script or an email", () => {
  const html = readFileSync(new URL("../prototype/teammate-type/index.html", import.meta.url), "utf8");
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /示意玩具，不是心理測驗。/);
  const entryHtml = html.slice(html.indexOf('id="entry"'), html.indexOf('id="quiz"'));
  assert.equal((entryHtml.match(/示意玩具，不是心理測驗。/g) || []).length, 1);
  assert.equal(UI.zh.duoBad, "這組字母還找不到對應的角色，檢查一下朋友的三個字母。");
  assert.equal(UI.en.duoBad, "These letters haven't found a role yet. Check the three letters your friend sent.");
  assert.equal(html.includes("這組字母對不上任何卡"), false);
  assert.doesNotMatch(html, /mailto:|@gmail|localStorage|fetch\(/);
  assert.equal([...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].every((match) => match[1].trim() === ""), true);
  assert.match(html, /id="duo"/);
  assert.doesNotMatch(html, /id="duo-left"[^>]*\ssrc=/);
});

test("cocoa's picture is a tall idle with an MG collar, not the old square sprite", () => {
  assert.equal(TYPES.cocoa.zh.alt, "橘色虎斑小貓，白嘴白胸白爪，項圈牌子寫著 MG，身旁有一杯熱可可");
  assert.equal(TYPES.cocoa.en.alt, "An orange tabby kitten with a white muzzle, chest and paws, a collar tag reading MG, and a cup of hot cocoa");
  const html = readFileSync(new URL("../prototype/teammate-type/index.html", import.meta.url), "utf8");
  assert.match(html, /id="mg"[^>]*width="591" height="988"/);
  assert.match(html, /#mg \{[^}]*object-fit: contain/);
  for (const name of ["00", "01", "02", "03"]) {
    const buf = readFileSync(new URL(`../public/mg-mini-demo/assets/heart/${name}.webp`, import.meta.url));
    assert.ok(buf.length < 80000, `${name} stays small`);
    assert.equal(buf.toString("ascii", 12, 16), "VP8X");
    const width = 1 + buf.readUIntLE(24, 3);
    const height = 1 + buf.readUIntLE(27, 3);
    assert.equal(width, 591);
    assert.equal(height, 988);
    assert.ok(height > width * 1.4);
  }
});

test("two-person scenes cover every pair without changing a score", () => {
  const ids = Object.keys(TYPES);
  assert.deepEqual(new Set(ROLE_ORDER), new Set(ids));
  const stats = pairStats(ids);
  assert.deepEqual(stats, { written: 16, fallback: 104, total: 120 });
  const written = new Set();
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const scene = dialogueFor(ids[i], ids[j]);
      assert.deepEqual(scene.lines, dialogueFor(ids[j], ids[i]).lines);
      assert.ok(scene.lines.length >= 3 && scene.lines.length <= 4);
      for (const line of scene.lines) {
        assert.ok(line.zh && line.en);
        assert.ok(line.speaker === ids[i] || line.speaker === ids[j]);
      }
      if (scene.kind === "written") written.add(scene.key);
      else assert.equal(scene.kind, "fallback");
    }
  }
  const alliancePairs = ids.filter((id) => !["alliance", "craftsman", "recorder"].includes(id)).map((id) => ["alliance", id].sort().join("|"));
  for (const key of alliancePairs) assert.ok(written.has(key), key);
  assert.equal(dialogueFor("alliance", "craftsman").kind, "fallback");
  assert.equal(dialogueFor("alliance", "recorder").kind, "fallback");
  assert.equal(dialogueFor("craftsman", "recorder").kind, "fallback");
  assert.ok(written.has(["galaxy", "andromeda"].sort().join("|")));
  assert.ok(written.has(["cocoa", "galaxy"].sort().join("|")));
  assert.ok(written.has(["cocoa", "andromeda"].sort().join("|")));
  assert.equal(written.size, 16);
  assert.equal(dialogueFor("umbrella", "finisher").kind, "fallback");
  assert.equal(dialogueFor("galaxy", "andromeda").kind, "written");
  const blob = JSON.stringify({ UI, lines: ids.flatMap((id, i) => ids.slice(i + 1).map((other) => dialogueFor(id, other).lines)) });
  assert.equal(/人工智慧|\bAI\b|老闆|老板|ROI|中間層|A2A|\bCDD\b|前職|Former role|英雄聯盟|魔獸|Overwatch|Warcraft|mailto:|@gmail/i.test(blob), false);
  assert.equal(/魔法|法師|咒|巫|\bmage\b|\bmagic\b|十字架|聖經|光環|\bhalo\b|\bprayer\b|玉仔/i.test(blob), false);
  assert.equal(resolveChoices("FAE").type, "galaxy");
  assert.equal(resolveChoices("EEA").type, "alliance");
  const duoSrc = readFileSync(new URL("../prototype/teammate-type/duo.js", import.meta.url), "utf8");
  assert.doesNotMatch(duoSrc, /fetch\(|localStorage|XMLHttpRequest/);
});

test("each card's teammate line names someone from the same faction", () => {
  for (const [factionId, faction] of Object.entries(FACTIONS)) {
    for (const id of faction.members) {
      const named = TYPES[id].zh.about.replace(/^關於隊友/, "").split("：")[0].trim();
      const mates = faction.members.filter((m) => m !== id).map((m) => TYPES[m].zh.person || TYPES[m].zh.name);
      assert.ok(mates.includes(named), `${id} (${factionId}) names ${named}`);
    }
  }
});

test("every role has a bilingual 照夜鎮 profile: place, item, motto", () => {
  for (const id of Object.keys(TYPES)) {
    for (const lang of ["zh", "en"]) {
      for (const key of ["place", "item", "motto"]) {
        const value = TYPES[id][lang][key];
        assert.ok(typeof value === "string" && value.trim().length > 0, `${id}.${lang}.${key}`);
        assert.equal(/魔法|法師|咒|巫/.test(value), false, `${id}.${lang}.${key} uses a banned word`);
      }
    }
  }
  for (const id of ["soundtrack", "missionary"]) {
    for (const key of ["place", "item", "motto"]) {
      assert.equal(/[他她]/.test(TYPES[id].zh[key]), false, `${id}.zh.${key} uses 他/她`);
      assert.equal(/\b(he|she|his|her|him)\b/i.test(TYPES[id].en[key]), false, `${id}.en.${key} uses a pronoun`);
    }
  }
});

test("no role text uses 魔法/法師/咒/巫", () => {
  const blob = JSON.stringify(TYPES);
  assert.equal(/魔法|法師|咒|巫/.test(blob), false);
});

test("result codes and scoring are unchanged by the profile", () => {
  assert.deepEqual(Object.keys(TYPES).sort(), [...ROLE_ORDER].sort());
  const SAMPLE = { umbrella: "AAA", cocoa: "BBA", finisher: "BBC", spark: "CCC", mapkeeper: "DAA", soundtrack: "CCD", strategist: "EAE", messenger: "AEA", alliance: "EEA", missionary: "AFE", apostle: "ACF", designer: "AFC", galaxy: "FAE", andromeda: "FBD", craftsman: "GGG", recorder: "HHH" };
  for (const [id, code] of Object.entries(SAMPLE)) assert.equal(resolveChoices(code).type, id, code);
});
