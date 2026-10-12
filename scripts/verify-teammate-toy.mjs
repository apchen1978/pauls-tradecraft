import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { distribution, readPartner, readRoute, resolveChoices, SCENARIOS, shareSearch, TYPES, UI } from "../prototype/teammate-type/app.js";
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
  const counts = distribution();
  for (const id of Object.keys(TYPES)) assert.ok(counts[id] >= 1, `${id} ${counts[id]}`);
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
  });
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
  for (const a of "ABCDEF") {
    for (const b of "ABCDEF") {
      for (const c of "ABCDEF") {
        const code = a + b + c;
        assert.deepEqual(resolveChoices(code), resolveChoices(code));
        assert.ok(TYPES[resolveChoices(code).type]);
      }
    }
  }
});

test("each scenario has six choices and every role is offered", () => {
  const seen = {};
  for (const scenario of SCENARIOS) {
    assert.deepEqual(scenario.choices.map((choice) => choice.id), ["A", "B", "C", "D", "E", "F"]);
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
  assert.equal(resolveChoices("EFG"), null);
  assert.deepEqual(readRoute(""), { lang: "zh", code: null });
});

test("public copy keeps the boundary and skips claims, trademarks, and contact details", () => {
  const blob = JSON.stringify({ UI, TYPES, SCENARIOS });
  assert.equal(UI.zh.boundary, "示意玩具，不是心理測驗。");
  assert.equal(UI.en.boundary, "A toy, not a personality test.");
  assert.equal(TYPES.cocoa.zh.role, "守護者");
  assert.equal(TYPES.cocoa.en.role, "Guardian");
  assert.equal(blob.includes("補師") || /\bHealer\b/.test(blob), false);
  assert.equal(/人工智慧|\bAI\b|老闆|老板|ROI|轉換率|成交率|中間層|A2A|\bCDD\b|前職|Former role|\bowner\b|英雄聯盟|魔獸|Overwatch|Warcraft|League of Legends|mailto:|@gmail/i.test(blob), false);
  assert.equal(/魔法|法師|\bmage\b|\bmagic\b/i.test(blob), false);
  assert.equal(TYPES.spark.zh.role, "點子");
  assert.equal(TYPES.spark.en.role, "Ideas");
  assert.equal(TYPES.missionary.zh.role, "傳教士");
  assert.equal(TYPES.missionary.en.role, "Missionary");
  assert.equal(TYPES.apostle.zh.role, "使徒");
  assert.equal(TYPES.apostle.en.role, "Apostle");
  assert.equal(TYPES.galaxy.zh.name, "銀河之女");
  assert.equal(TYPES.galaxy.en.name, "Daughter of the Galaxy");
  assert.equal(TYPES.andromeda.zh.name, "M-31仙女座");
  assert.equal(TYPES.andromeda.en.name, "M-31 Andromeda");
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
  assert.doesNotMatch(html, /mailto:|@gmail|localStorage|fetch\(/);
  assert.equal([...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].every((match) => match[1].trim() === ""), true);
  assert.match(html, /id="duo"/);
  assert.doesNotMatch(html, /id="duo-left"[^>]*\ssrc=/);
});

test("two-person scenes cover every pair without changing a score", () => {
  const ids = Object.keys(TYPES);
  assert.deepEqual(new Set(ROLE_ORDER), new Set(ids));
  const stats = pairStats(ids);
  assert.deepEqual(stats, { written: 16, fallback: 75, total: 91 });
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
  const alliancePairs = ids.filter((id) => id !== "alliance").map((id) => ["alliance", id].sort().join("|"));
  for (const key of alliancePairs) assert.ok(written.has(key), key);
  assert.ok(written.has(["galaxy", "andromeda"].sort().join("|")));
  assert.ok(written.has(["cocoa", "galaxy"].sort().join("|")));
  assert.ok(written.has(["cocoa", "andromeda"].sort().join("|")));
  assert.equal(written.size, 16);
  assert.equal(dialogueFor("umbrella", "finisher").kind, "fallback");
  assert.equal(dialogueFor("galaxy", "andromeda").kind, "written");
  const blob = JSON.stringify({ UI, lines: ids.flatMap((id, i) => ids.slice(i + 1).map((other) => dialogueFor(id, other).lines)) });
  assert.equal(/人工智慧|\bAI\b|老闆|老板|ROI|中間層|A2A|\bCDD\b|前職|Former role|英雄聯盟|魔獸|Overwatch|Warcraft|mailto:|@gmail/i.test(blob), false);
  assert.equal(/魔法|法師|\bmage\b|\bmagic\b|十字架|聖經|光環|\bhalo\b|\bprayer\b/i.test(blob), false);
  assert.equal(resolveChoices("FAE").type, "galaxy");
  assert.equal(resolveChoices("EEA").type, "alliance");
  const duoSrc = readFileSync(new URL("../prototype/teammate-type/duo.js", import.meta.url), "utf8");
  assert.doesNotMatch(duoSrc, /fetch\(|localStorage|XMLHttpRequest/);
});
