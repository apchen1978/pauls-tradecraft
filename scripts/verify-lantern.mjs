import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PARTS, OPTIONS, DEFAULTS, ALWAYS_PENDING, PENDING_TEXT, UI, EFFECT, PART_LABEL, specStatus } from "../public/prototype/take-the-lantern-apart/data.js";
import { STORY, LINES, PROMPTS, REACT, PART_QUESTION, NAMES } from "../public/prototype/take-the-lantern-apart/story.js";

const dir = new URL("../public/prototype/take-the-lantern-apart/", import.meta.url);
const html = readFileSync(new URL("index.html", dir), "utf8");
const values = (v) => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(values) : []);
// Player-facing strings only (values, not keys); filenames are excluded.
const allCopy = [...values({ UI, PENDING_TEXT, EFFECT, PART_LABEL, STORY, LINES, PROMPTS, REACT, PART_QUESTION, NAMES }), ...Object.values(OPTIONS).flat().flatMap((o) => [o.zh, o.en])].join("\n");

test("no banned words in copy or markup", () => {
  for (const w of ["魔法", "法師", "咒", "巫", "童話"]) {
    assert.ok(!allCopy.includes(w), `copy contains ${w}`);
    assert.ok(!html.includes(w), `html contains ${w}`);
  }
  assert.ok(!/\b(magic|wizard|spell|witch|fairy ?tale)\b/i.test(allCopy));
});

test("player-facing copy has no numbers or currency", () => {
  assert.ok(!/[0-9０-９]/.test(allCopy), "digits in copy");
  assert.ok(!/[$€£¥₩₹＄]|NT\$|USD|TWD|元|塊錢|天內|days?\b/i.test(allCopy), "currency or days in copy");
  assert.ok(!/[一二三四五六七八九十百千萬]\s*(元|天|日|週|個月)/.test(allCopy), "spelled-out amounts in copy");
});

test("relative effects only use the three illustrative words", () => {
  for (const o of Object.values(OPTIONS).flat()) {
    assert.ok(["up", "down", "same"].includes(o.price));
    assert.ok(["up", "down", "same"].includes(o.time));
  }
  assert.ok(UI.zh.effectTitle.includes("示意"));
  assert.ok(UI.en.effectTitle.includes("Illustrative"));
});

test("toy label is present in both languages", () => {
  assert.ok(UI.zh.label.includes("示意玩具"));
  assert.ok(html.includes("示意玩具"));
  assert.ok(UI.en.label.startsWith("A toy"));
});

function* everyCombo(i = 0, picks = {}) {
  if (i === PARTS.length) { yield { ...picks }; return; }
  for (const o of OPTIONS[PARTS[i]]) yield* everyCombo(i + 1, { ...picks, [PARTS[i]]: o.id });
}

test("plug and certification stay pending for every combination", () => {
  let n = 0;
  for (const picks of everyCombo()) {
    const { agreed, pending } = specStatus(picks);
    for (const key of ALWAYS_PENDING) assert.ok(pending.includes(key), `${key} not pending for ${JSON.stringify(picks)}`);
    assert.ok(pending.includes("plug") && pending.includes("cert"));
    assert.deepEqual(agreed.map((a) => a.part), PARTS);
    n++;
  }
  assert.equal(n, 243);
});

test("every pending key has zh and en text, kid is 千禧 / Chiensi", () => {
  for (const o of Object.values(OPTIONS).flat()) assert.ok(PENDING_TEXT[o.adds], o.adds);
  for (const v of Object.values(PENDING_TEXT)) { assert.equal(v.zh.length, 2); assert.equal(v.en.length, 2); }
  assert.ok(UI.zh.client.includes("千禧"));
  assert.ok(UI.en.client.includes("Chiensi"));
  assert.ok(Object.keys(DEFAULTS).every((k) => PARTS.includes(k)));
});

test("art assets are WebP and 60 KB or less", async () => {
  const { readdirSync, statSync } = await import("node:fs");
  const assets = new URL("assets/", dir);
  const files = readdirSync(assets);
  assert.ok(files.length >= 41);
  for (const f of files) {
    assert.ok(f.endsWith(".webp"), f);
    assert.ok(statSync(new URL(f, assets)).size <= 60 * 1024, `${f} is over 60 KB`);
  }
});

test("story: zh and en keys match, every option has a fixed reaction, both helpers speak", () => {
  assert.deepEqual(Object.keys(STORY.zh).sort(), Object.keys(STORY.en).sort());
  for (const part of PARTS) for (const o of OPTIONS[part]) {
    const r = REACT[part][o.id];
    assert.ok(r && r.zh && r.en, `reaction for ${part}/${o.id}`);
  }
  const speakers = new Set([...Object.values(LINES), ...Object.values(PROMPTS).filter(Boolean), ...Object.values(REACT).flatMap((m) => Object.values(m))].map((l) => l.who));
  for (const who of ["diana", "yiyi", "chiensi"]) assert.ok(speakers.has(who), who);
  assert.equal(NAMES.yiyi.en, "Yiyi");
});

test("story: no promises that the lamp is done, safe or ready to ship", () => {
  const story = [...values({ STORY, LINES, PROMPTS, REACT })].join("\n");
  for (const w of ["規格全部講好了", "這盞燈已完成", "現在可以出貨", "安全無虞", "已認證"]) assert.ok(!story.includes(w), w);
  assert.ok(!/\b(ready to ship|certified|guaranteed|all agreed)\b/i.test(story));
  assert.ok(PENDING_TEXT.moq.zh[1].includes("還要確認"));
});
