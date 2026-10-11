import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { distribution, readRoute, resolveChoices, SCENARIOS, shareSearch, TYPES, UI } from "../prototype/teammate-type/app.js";

test("every combination lands on one of six types, 10 or 11 times", () => {
  const counts = distribution();
  assert.deepEqual(counts, {
    umbrella: 10,
    cocoa: 11,
    spark: 11,
    mapkeeper: 10,
    finisher: 11,
    soundtrack: 11,
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
  for (const a of "ABCD") {
    for (const b of "ABCD") {
      for (const c of "ABCD") {
        const code = a + b + c;
        assert.deepEqual(resolveChoices(code), resolveChoices(code));
        assert.ok(TYPES[resolveChoices(code).type]);
      }
    }
  }
});

test("each type is offered in exactly two scenarios", () => {
  const seen = {};
  for (const scenario of SCENARIOS) {
    assert.equal(scenario.choices.length, 4);
    for (const choice of scenario.choices) seen[choice.type] = (seen[choice.type] || 0) + 1;
  }
  assert.deepEqual(seen, {
    umbrella: 2,
    cocoa: 2,
    spark: 2,
    mapkeeper: 2,
    finisher: 2,
    soundtrack: 2,
  });
});

test("share links carry the three choices, and a bad code does not resolve", () => {
  assert.equal(shareSearch("ABA", "en"), "c=ABA&lang=en");
  assert.equal(shareSearch("CCD", "zh"), "c=CCD&lang=zh");
  assert.deepEqual(readRoute("?c=aba&lang=en"), { lang: "en", code: "ABA" });
  assert.deepEqual(readRoute("?c=nope"), { lang: "zh", code: null });
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
});
