import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import {
  allRoutes, CAST, CAST_ORDER, DECISIONS, isCode, LIGHTS, optionCost, readRoute, REACT, resolve, SCENARIO_ORDER, SCENARIOS, shareSearch,
  START_BUFFER, STATION_SPEAKER, STYLE_CHAR, STYLE_ORDER, STYLES,
} from "../prototype/trade-street/game.js";
import { LEARN_TEXT, PAGE_TEXT, STEP_TEXT } from "../prototype/trade-street/steps-text.js";
import { HANDOFF, HANDOFF_LABEL } from "../prototype/trade-street/handoff.js";
import { ALL_STEPS, EXTRA_INDEX, EXTRA_STEPS } from "../prototype/trade-street/extra-steps.js";
import { DAILY, EXTRA_TAG, LESSON_LABEL, TIPS, TIP_LABEL } from "../prototype/trade-street/tips.js";
import { AVATAR_COLOR, SHORT, STATION_LINE, UI } from "../prototype/trade-street/app.js";
import { ART, GLOSS, MOBILE_QUERY, POS } from "../prototype/trade-street/layout.js";
import { ALT, BIO, SIZE, UI as CAST_UI, stopsOf, styleOf } from "../prototype/trade-street/cast/cast.js";

const BS = String.fromCharCode(92);
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

// The published 12-steps page is the source of truth for the step text.
function sourceCopy() {
  const src = read("../prototype/one-container-12-steps/index.html");
  const at = src.indexOf("var COPY = ");
  let start = src.indexOf("{", at);
  let depth = 0;
  let end = start;
  let quote = null;
  let escaped = false;
  for (; end < src.length; end += 1) {
    const c = src[end];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === BS) escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{") depth += 1;
    else if (c === "}") { depth -= 1; if (depth === 0) { end += 1; break; } }
  }
  return new Function(`return ${src.slice(start, end)}`)();
}

const routes = allRoutes();

test("step text is verbatim from the 12-steps page, in both languages", () => {
  const copy = sourceCopy();
  assert.equal(STEP_TEXT.length, 12);
  for (const lang of ["zh", "en"]) {
    assert.equal(copy[lang].steps.length, 12);
    STEP_TEXT.forEach((step, index) => {
      for (const field of ["t", "p", "who", "prep", "risk", "cross"]) {
        assert.equal(step[lang][field], copy[lang].steps[index][field], `${lang} step ${index + 1} ${field}`);
      }
    });
    for (const field of ["badge", "boundary", "caveat", "countdown", "countdownNote"]) {
      assert.deepEqual(PAGE_TEXT[lang][field], copy[lang][field], `${lang} page ${field}`);
    }
  }
});

test("the decisions sit on real steps, in order, and the post-sail one comes after the ship sails (stop 11 of 14)", () => {
  assert.equal(DECISIONS.length, 6);
  const steps = DECISIONS.map((decision) => decision.step);
  assert.deepEqual(steps, [...steps].sort((a, b) => a - b));
  assert.equal(new Set(steps).size, 6);
  for (const decision of DECISIONS) {
    assert.ok(decision.step >= 1 && decision.step <= 14);
    assert.equal(decision.options.length, 3);
    assert.equal(new Set(decision.options.map((option) => option.tag)).size, 3);
    assert.deepEqual(decision.options.map((option) => option.id), ["A", "B", "C"]);
    assert.equal(decision.options.filter((option) => option.cost > 0).length, 1, `${decision.id} has exactly one costly (shadow) option`);
    assert.ok(decision.options.some((option) => option.cost === 0));
    if (decision.after) assert.ok(decision.step > 11); else assert.ok(decision.step <= 11);
    if (decision.light != null) assert.ok(decision.light >= 0 && decision.light < LIGHTS.length);
  }
  assert.equal(DECISIONS.filter((decision) => decision.after).length, 1);
  assert.equal(DECISIONS.filter((decision) => decision.light == null).length, 1);
  assert.equal(STATION_SPEAKER.length, 14);
  assert.equal(SHORT.zh.length, 14);
  assert.equal(SHORT.en.length, 14);
  assert.equal(STATION_LINE.zh.length, 14);
  assert.equal(STATION_LINE.en.length, 14);
});

test("every style appears three times: twice done well, once as its shadow side", () => {
  for (const style of STYLE_ORDER) {
    const options = DECISIONS.flatMap((decision) => decision.options.filter((option) => option.tag === style));
    assert.equal(options.length, 3, style);
    assert.equal(options.filter((option) => option.cost === 0).length, 2, `${style} free`);
    assert.equal(options.filter((option) => option.cost > 0).length, 1, `${style} costly`);
    assert.ok(STYLE_CHAR[style] && CAST[STYLE_CHAR[style]], style);
    assert.ok(REACT[style].zh.free && REACT[style].zh.costly && REACT[style].en.free && REACT[style].en.costly, `${style} replies`);
  }
});

test("all 2,187 routes resolve; the same choices always give the same result", () => {
  assert.equal(routes.length, 3 * 729);
  for (const route of routes) {
    assert.deepEqual(resolve(route.scenario, route.code), route);
    assert.ok(STYLE_ORDER.includes(route.style));
    assert.ok(["clear", "tight", "missed"].includes(route.tier));
    assert.ok(["smooth", "fix"].includes(route.handover));
  }
});

test("all six styles and all three voyage results can be reached in every scenario, and no style is rare", () => {
  for (const scenario of SCENARIO_ORDER) {
    const list = routes.filter((route) => route.scenario === scenario);
    for (const style of STYLE_ORDER) assert.ok(list.some((route) => route.style === style), `${scenario} ${style}`);
    for (const tier of ["clear", "tight", "missed"]) assert.ok(list.some((route) => route.tier === tier), `${scenario} ${tier}`);
  }
  for (const style of STYLE_ORDER) {
    const share = routes.filter((route) => route.style === style).length / routes.length;
    assert.ok(share > 0.14 && share < 0.19, `${style} share ${share.toFixed(3)}`);
  }
  for (const tier of ["clear", "tight", "missed"]) {
    const share = routes.filter((route) => route.tier === tier).length / routes.length;
    assert.ok(share > 0.2 && share < 0.5, `${tier} share ${share.toFixed(3)}`);
  }
});

test("a decision taken after the ship sails never changes whether it makes the ship", () => {
  const after = DECISIONS.findIndex((decision) => decision.after);
  assert.equal(after, 5);
  for (const route of routes) {
    for (const letter of ["A", "B", "C"]) {
      const other = resolve(route.scenario, route.code.slice(0, after) + letter + route.code.slice(after + 1));
      assert.equal(other.tier, route.tier);
      assert.equal(other.remaining, route.remaining);
      assert.deepEqual(other.lights, route.lights);
    }
  }
});

test("scenarios only make the options they describe cost more", () => {
  const extras = DECISIONS.flatMap((decision) => decision.options.filter((option) => option.extra).map((option) => ({ decision: decision.id, extra: option.extra, cost: option.cost })));
  for (const item of extras) for (const [scenario, value] of Object.entries(item.extra)) {
    assert.ok(SCENARIOS[scenario], scenario);
    assert.ok(value > item.cost, `${item.decision} ${scenario}`);
  }
  for (const scenario of SCENARIO_ORDER) assert.ok(extras.some((item) => item.extra[scenario] != null), `${scenario} has a worse choice`);
  assert.equal(START_BUFFER, 2);
});

test("the buffer is felt: leaving a buffer by entering the port early spends a cell around a holiday, and careful checking is never punished", () => {
  assert.equal(resolve("holiday", "AAAAAA").voyageCost, 1, "holiday AAAAAA spends a cell");
  assert.equal(resolve("holiday", "AAAAAA").costs[3], 1, "at the port-entry decision");
  assert.equal(resolve("holiday", "BBBBBB").voyageCost, 0);
  // careful checking (the "check" choice at the factory) costs nothing in any scenario
  const factory = DECISIONS.find((decision) => decision.id === "d3").options.find((option) => option.id === "A");
  for (const scenario of SCENARIO_ORDER) assert.equal(optionCost(DECISIONS.find((decision) => decision.id === "d3"), factory, scenario), 0, `d3-A is free in ${scenario}`);
  assert.equal(resolve("peak", "AAAAAA").voyageCost, 0);
  assert.equal(resolve("rush", "AAAAAA").voyageCost, 0);
});

test("hand-over: all fourteen runners, every line traceable to the stop texts, no numbers or units, both languages", () => {
  assert.equal(HANDOFF.length, 14);
  HANDOFF.forEach((item, index) => {
    assert.equal(item.n, index + 1);
    const here = Object.values(ALL_STEPS[index].zh).join("\n");
    const next = ALL_STEPS[index + 1] ? Object.values(ALL_STEPS[index + 1].zh).join("\n") : "";
    assert.ok(item.anchors.length >= 2, `step ${item.n} has anchors`);
    for (const phrase of item.anchors) assert.ok(here.includes(phrase) || next.includes(phrase), `step ${item.n}: "${phrase}" is in the stop text`);
    for (const lang of ["zh", "en"]) {
      assert.ok(item[lang].gives.length > 3 && item[lang].to.length > 1, `step ${item.n} ${lang}`);
      assert.equal(/\d+\s*(天|日|小時|days?|hours?|USD|\$|%|％|元|萬)/i.test(`${item[lang].gives} ${item[lang].to}`), false, `step ${item.n} ${lang} has no days or money`);
    }
  });
  for (const lang of ["zh", "en"]) for (const key of ["head", "gives", "to", "miss"]) assert.ok(HANDOFF_LABEL[lang][key], `${lang} ${key}`);
});

test("extra stops: fourteen in all, the two added ones sit after loading and after the bill of lading, labelled as common practice, both languages", () => {
  assert.equal(STEP_TEXT.length, 12); // the 12-steps text is untouched
  assert.equal(ALL_STEPS.length, 14);
  assert.deepEqual(EXTRA_INDEX, [5, 12]);
  assert.match(ALL_STEPS[4].zh.t, /裝櫃/);
  assert.match(ALL_STEPS[5].zh.t, /補料.*VGM/);
  assert.match(ALL_STEPS[6].zh.t, /進港/);
  assert.match(ALL_STEPS[11].zh.t, /提單/);
  assert.match(ALL_STEPS[12].zh.t, /收款後才放單/);
  assert.match(ALL_STEPS[13].zh.t, /寄單/);
  ALL_STEPS.forEach((step, index) => assert.equal(step.n, index + 1));
  for (const extra of Object.values(EXTRA_STEPS)) for (const lang of ["zh", "en"]) for (const field of ["t", "p", "who", "prep", "risk", "lesson"]) assert.ok(extra[lang][field].length > (field === "t" || field === "who" ? 3 : 8), `${lang} ${field}`);
  assert.match(EXTRA_STEPS.vgm.zh.p, /截港前/);
  assert.match(EXTRA_STEPS.vgm.zh.lesson, /截港前/);
  assert.match(EXTRA_STEPS.vgm.en.p, /before the port cut-off/);
  assert.match(EXTRA_TAG.zh, /業界常見/);
  assert.match(TIP_LABEL.zh, /業界常見/);
  assert.match(DAILY.zh.title, /業界常見/);
  assert.equal(DAILY.zh.items.length, 5);
  assert.equal(DAILY.en.items.length, 5);
  for (const index of Object.keys(TIPS)) assert.ok(TIPS[index].zh.length > 6 && TIPS[index].en.length > 12 && ALL_STEPS[index], `tip ${index}`);
  assert.equal(/Paul/.test(JSON.stringify([EXTRA_STEPS, TIPS, DAILY, EXTRA_TAG])), false);
});

test("the last stop is worked out from the number of stops, never written as a number", () => {
  const app = read("../prototype/trade-street/app.js");
  assert.match(app, /LAST_STOP = ALL_STEPS\.length - 1/);
  assert.equal(/(index|i) === 11/.test(app), false);
});

test("addresses: valid ones round-trip, bad ones are ignored", () => {
  assert.deepEqual(readRoute("?s=peak&c=ABCABC"), { lang: "zh", scenario: "peak", result: { scenario: "peak", code: "ABCABC" } });
  assert.equal(readRoute("?s=peak&c=ABCABC&lang=en").lang, "en");
  assert.equal(readRoute("?s=nope&c=ABCABC").result, null);
  assert.equal(readRoute("?s=peak&c=ABCAB").result, null);
  assert.equal(readRoute("?s=peak&c=ABCABD").result, null);
  assert.equal(readRoute("?s=peak&c=abcabc").result, null);
  assert.equal(readRoute("").result, null);
  assert.equal(readRoute(undefined).lang, "zh");
  assert.equal(shareSearch("rush", "CCCCCC", "en"), "?lang=en&s=rush&c=CCCCCC");
  assert.equal(shareSearch("rush", "CCCCCC", "zh"), "?s=rush&c=CCCCCC");
  assert.equal(shareSearch(null, null, "zh"), "");
  assert.equal(shareSearch("x", "bad", "en"), "?lang=en");
  assert.equal(isCode("ABCABC"), true);
  assert.equal(resolve("peak", "ABC"), null);
  assert.equal(resolve("nope", "ABCABC"), null);
});

function everyString(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") { try { out.push(value(1, "x", "y")); } catch { /* not a text function */ } }
  else if (value && typeof value === "object") for (const item of Object.values(value)) everyString(item, out);
  return out;
}

test("public copy: boundary shown, no claims, no numbers with units, no real company names", () => {
  const blob = everyString([CAST, STYLES, REACT, SCENARIOS, DECISIONS, UI, STATION_LINE, SHORT, GLOSS, STEP_TEXT, PAGE_TEXT, HANDOFF, HANDOFF_LABEL, EXTRA_STEPS, TIPS, DAILY, EXTRA_TAG, LESSON_LABEL, TIP_LABEL]).join("\n") + read("../prototype/trade-street/index.html");
  assert.match(UI.zh.boundary, /教學示意/);
  assert.match(UI.zh.boundary, /不含具體天數、費用或比例/);
  assert.match(UI.en.boundary, /Teaching sketch/);
  assert.match(UI.en.boundary, /no specific days, costs or percentages/);
  assert.match(UI.zh.cardBoundary, /教學示意/);
  assert.equal(/魔法|法師|咒|巫|\bmage\b|\bmagic\b/i.test(blob), false);
  assert.equal(/十字架|聖經|光環|\bhalo\b|\bprayer\b|教堂|\bchurch\b/i.test(blob), false);
  assert.equal(/人工智慧|\bAI\b|老闆|老板|\bROI\b|轉換率|成交率|中間層|A2A|\bCDD\b|\bowner\b|mailto:|@gmail/i.test(blob), false);
  assert.equal(/Maersk|\bMSC\b|COSCO|Evergreen|長榮|陽明|Hapag|ONE Line|FedEx|DHL|\bUPS\b|DB Schenker/i.test(blob), false);
  // Our own game text never states days, money or percentages (the 12-steps source text is checked on its own page).
  const ours = everyString([CAST, STYLES, REACT, SCENARIOS, DECISIONS, STATION_LINE, EXTRA_STEPS, TIPS, DAILY, EXTRA_TAG, LESSON_LABEL, TIP_LABEL]).join("\n");
  assert.equal(/\d+\s*(天|日|小時|days?|hours?|USD|\$|%|％|元|萬)/i.test(ours), false);
});

test("English uses roles, not invented personal names (the guide alone has a name)", () => {
  for (const id of CAST_ORDER) {
    if (id === "guide") assert.equal(CAST[id].en.name, "Yuzai");
    else assert.match(CAST[id].en.name, /^The /, id);
  }
  for (const id of CAST_ORDER) assert.ok(CAST[id].zh.name.length >= 2);
  assert.equal(new Set(CAST_ORDER.map((id) => CAST[id].zh.name)).size, 8);
});

test("the page is one folder, loads one module, has every id the script uses, and inlines no script or email", () => {
  const html = read("../prototype/trade-street/index.html");
  const app = read("../prototype/trade-street/app.js");
  assert.equal(/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), false);
  assert.equal(/@[A-Za-z0-9-]+\.(com|net|org)|mailto:/i.test(html + app), false);
  assert.match(html, /<script type="module" src="app\.js"><\/script>/);
  const used = new Set([...app.matchAll(/\$\("([a-z0-9-]+)"\)/g)].map((match) => match[1]));
  for (const id of used) assert.ok(html.includes(`id="${id}"`), `index.html has id ${id}`);
  assert.equal(/fetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|navigator\.sendBeacon/.test(app), false);
});

// ---- art -------------------------------------------------------------------------------------------------------
const bytes = (path) => readFileSync(new URL(`../prototype/trade-street/${path}`, import.meta.url));
function webpSize(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  const kind = buffer.toString("ascii", 12, 16);
  if (kind === "VP8X") return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3), alpha: (buffer[20] & 0x10) !== 0 };
  if (kind === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff, alpha: false };
  throw new Error(`unexpected webp chunk ${kind}`);
}

test("art: both maps and all eight portraits exist, are WebP, and stay inside the size limits", () => {
  const maps = { desktop: [1600, 900], mobile: [800, 1422] };
  for (const [kind, [width, height]] of Object.entries(maps)) {
    const file = ART.map[kind];
    assert.ok(existsSync(new URL(`../prototype/trade-street/${file}`, import.meta.url)), file);
    const size = webpSize(bytes(file));
    assert.equal(size.width, width, `${file} width`);
    assert.equal(size.height, height, `${file} height`);
    assert.ok(statSync(new URL(`../prototype/trade-street/${file}`, import.meta.url)).size <= 250 * 1024, `${file} is at most 250 KB`);
  }
  assert.deepEqual(Object.keys(ART.portrait).sort(), [...CAST_ORDER].sort());
  for (const id of CAST_ORDER) {
    const file = ART.portrait[id];
    assert.ok(/^assets\/[a-z-]+\.webp$/.test(file), file);
    assert.ok(existsSync(new URL(`../prototype/trade-street/${file}`, import.meta.url)), file);
    const size = webpSize(bytes(file));
    assert.equal(size.alpha, true, `${file} has a transparent background`);
    assert.ok(size.height >= 900 && size.height <= 1100, `${file} height ${size.height}`);
    assert.ok(statSync(new URL(`../prototype/trade-street/${file}`, import.meta.url)).size <= 60 * 1024, `${file} is at most 60 KB`);
  }
});

test("art: fourteen stops on each map, inside the picture, and far enough apart to tap", () => {
  const sizes = { desktop: [1600, 900, 34], mobile: [800, 1422, 62] };
  for (const [kind, [width, height, gap]] of Object.entries(sizes)) {
    const points = POS[kind];
    assert.equal(points.length, 14, kind);
    for (const [x, y] of points) assert.ok(x > 2 && x < 98 && y > 2 && y < 98, `${kind} ${x},${y}`);
    for (let i = 0; i < points.length; i += 1) for (let j = i + 1; j < points.length; j += 1) {
      const dx = ((points[i][0] - points[j][0]) / 100) * width;
      const dy = ((points[i][1] - points[j][1]) / 100) * height;
      assert.ok(Math.hypot(dx, dy) >= gap, `${kind} stops ${i + 1} and ${j + 1} are ${Math.hypot(dx, dy).toFixed(0)} apart, need ${gap}`);
    }
  }
  assert.match(MOBILE_QUERY, /max-width: 639px/);
});

test("art: the page and the deploy copy the files the game needs", () => {
  const html = read("../prototype/trade-street/index.html");
  // the page's own picture is the plate (nothing is downloaded twice); the approved whole maps are only the fallback and stay in ART.map
  assert.match(html, /srcset="assets\/layers\/mobile-plate\.webp"/);
  assert.match(html, /src="assets\/layers\/desktop-plate\.webp"/);
  assert.doesNotMatch(html, /trade-street-map/);
  assert.ok(existsSync(new URL(`../prototype/trade-street/${ART.map.desktop}`, import.meta.url)));
  assert.ok(existsSync(new URL(`../prototype/trade-street/${ART.map.mobile}`, import.meta.url)));
  const deploy = read("../.github/workflows/deploy.yml");
  for (const file of ["index.html", "app.js", "game.js", "steps-text.js", "layout.js", "handoff.js", "extra-steps.js", "tips.js"]) assert.ok(deploy.includes(`prototype/trade-street/${file}`), `deploy copies ${file}`);
  assert.ok(deploy.includes("cp -r prototype/trade-street/assets dist/prototype/trade-street/"), "deploy copies the assets folder");
});

// ---- readable colours ------------------------------------------------------------------------------------------
const luminance = (hex) => {
  const parts = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255).map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
};
const contrastWithWhite = (hex) => 1.05 / (luminance(hex) + 0.05);

test("colours: white lettering on every avatar colour and on the current-stop fill is readable (4.5 or more)", () => {
  for (const id of CAST_ORDER) assert.ok(contrastWithWhite(AVATAR_COLOR[id]) >= 4.5, `${id} ${AVATAR_COLOR[id]} ${contrastWithWhite(AVATAR_COLOR[id]).toFixed(2)}`);
  const html = read("../prototype/trade-street/index.html");
  const fill = html.match(/--amber-fill:\s*(#[0-9A-Fa-f]{6})/)[1];
  assert.ok(contrastWithWhite(fill) >= 4.5, `amber fill ${fill}`);
  assert.match(html, /\.route li\.now \.num \{ background: var\(--amber-fill\)/);
  assert.match(html, /\.hot\.now \{ background: var\(--amber-fill\)/);
  // small amber text uses a darker amber than the decorative one
  const kicker = html.match(/\.card-kicker \{[^}]*color:\s*(#[0-9A-Fa-f]{6})/)[1];
  assert.ok(contrastWithWhite(kicker) >= 4.5, `kicker ${kicker}`);
});

// ---- the cast page --------------------------------------------------------------------------------------------
test("cast page: every person has a bio, a description of the picture, and the right picture size", () => {
  for (const id of CAST_ORDER) {
    for (const lang of ["zh", "en"]) {
      assert.ok(BIO[id][lang].blurb.length > 10 && BIO[id][lang].props.length > 5, `${id} ${lang} bio`);
      assert.ok(ALT[id][lang].length > 25, `${id} ${lang} alt`);
    }
    const size = webpSize(bytes(ART.portrait[id]));
    assert.deepEqual(SIZE[id], [size.width, size.height], `${id} picture size`);
  }
  assert.deepEqual(Object.keys(BIO).sort(), [...CAST_ORDER].sort());
  assert.deepEqual(Object.keys(ALT).sort(), [...CAST_ORDER].sort());
  assert.deepEqual(Object.keys(SIZE).sort(), [...CAST_ORDER].sort());
});

test("cast page: style, stops and catchphrase come from the game, so the two cannot disagree", () => {
  for (const id of CAST_ORDER) {
    const style = styleOf(id);
    if (STYLE_CHAR[style] === id) assert.ok(REACT[style].zh.free && STYLES[style].zh.name);
  }
  assert.deepEqual(CAST_ORDER.filter((id) => styleOf(id)).sort(), Object.values(STYLE_CHAR).sort());
  assert.deepEqual(stopsOf("forwarder"), [1, 11, 12]);
  assert.deepEqual(stopsOf("buyer"), [0, 13]);
  const covered = new Set(CAST_ORDER.flatMap((id) => stopsOf(id)));
  for (let i = 0; i < 14; i += 1) assert.ok(covered.has(i), `stop ${i + 1} has someone on the cast page`);
});

test("cast page: public copy keeps the boundary and skips banned words, numbers with units and real names", () => {
  const html = read("../prototype/trade-street/cast/index.html");
  const blob = everyString([BIO, ALT, CAST_UI]).join("\n") + html;
  assert.match(CAST_UI.zh.boundary, /人物與名字都是虛構/);
  assert.match(CAST_UI.zh.boundary, /不含具體天數、費用或比例/);
  assert.match(CAST_UI.en.boundary, /made up/);
  assert.equal(/魔法|法師|咒|巫|\bmage\b|\bmagic\b/i.test(blob), false);
  assert.equal(/十字架|聖經|光環|\bhalo\b|\bprayer\b|教堂|\bchurch\b/i.test(blob), false);
  assert.equal(/人工智慧|\bAI\b|老闆|老板|\bROI\b|轉換率|成交率|中間層|A2A|\bCDD\b|\bowner\b|mailto:|@gmail/i.test(blob), false);
  assert.equal(/Maersk|\bMSC\b|COSCO|Evergreen|長榮|陽明|Hapag|ONE Line|FedEx|DHL|\bUPS\b|DB Schenker/i.test(blob), false);
  assert.equal(/\d+\s*(天|日|小時|days?|hours?|USD|\$|%|％|元|萬)/i.test(everyString([BIO, ALT, CAST_UI]).join("\n")), false);
});

test("cast page: one folder, one module, every id the script uses, no inline script, no network calls, deploy copies it", () => {
  const html = read("../prototype/trade-street/cast/index.html");
  const code = read("../prototype/trade-street/cast/cast.js");
  assert.equal(/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), false);
  assert.match(html, /<script type="module" src="cast\.js"><\/script>/);
  assert.equal(/@[A-Za-z0-9-]+\.(com|net|org)|mailto:/i.test(html + code), false);
  const used = new Set([...code.matchAll(/\$\("([a-z0-9-]+)"\)/g)].map((match) => match[1]));
  for (const id of used) assert.ok(html.includes(`id="${id}"`), `cast/index.html has id ${id}`);
  assert.equal(/fetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|navigator\.sendBeacon/.test(code), false);
  // alt text for the pictures is real text; the game links to the page and the page links back
  assert.ok(/`cast\/\$\{/.test(read("../prototype/trade-street/app.js")));
  assert.ok(read("../prototype/trade-street/index.html").includes('id="see-cast"'));
  const deploy = read("../.github/workflows/deploy.yml");
  assert.ok(deploy.includes("cp -r prototype/trade-street/cast dist/prototype/trade-street/"), "deploy copies the cast folder");
});

// ---- the water glints ------------------------------------------------------------------------------------------
test("motion: the water masks exist, are small transparent pictures, and the page points at the same files", () => {
  const sizes = { desktop: [800, 450], mobile: [400, 711] };
  const html = read("../prototype/trade-street/index.html");
  for (const [kind, [width, height]] of Object.entries(sizes)) {
    const file = ART.mask[kind];
    assert.ok(existsSync(new URL(`../prototype/trade-street/${file}`, import.meta.url)), file);
    const size = webpSize(bytes(file));
    assert.deepEqual([size.width, size.height], [width, height], `${file} size`);
    assert.equal(size.alpha, true, `${file} is transparent`);
    assert.ok(statSync(new URL(`../prototype/trade-street/${file}`, import.meta.url)).size <= 30 * 1024, `${file} is at most 30 KB`);
    assert.ok(html.includes(`url(${file})`), `the page uses ${file}`);
  }
});

test("motion: the glints are decoration only, off until the mask loads, off for reduced motion, paused off screen", () => {
  const html = read("../prototype/trade-street/index.html");
  const app = read("../prototype/trade-street/app.js");
  assert.match(html, /class="sea-fx" id="sea-fx" aria-hidden="true"/);
  assert.match(html, /\.sea-fx \{ display: none;[^}]*pointer-events: none;/);
  assert.match(html, /\.map-stage\.fx-ready \.sea-fx \{ display: block; \}/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\) \{ \.map-stage\.fx-ready \.sea-fx \{ display: none; \} \}/);
  assert.match(html, /\.map-stage\.idle \.sea-fx i \{ animation-play-state: paused; \}/);
  assert.ok(app.includes("fx-ready") && app.includes("IntersectionObserver") && app.includes("ART.mask"));
  // only transform and opacity are animated (cheap on a phone)
  const frames = [...html.matchAll(/@keyframes fx-[a-z-]+ \{([^]*?)\}\s*(?=@|\.|$)/g)].map((m) => m[0]).join("");
  assert.equal(/left:|top:|width:|height:|background-position/.test(frames), false);
});

test("motion: the sky effects are decoration only, gated like the glints, and cost nothing when not wanted", () => {
  const html = read("../prototype/trade-street/index.html");
  assert.match(html, /class="sky-fx" id="sky-fx" aria-hidden="true"/);
  assert.match(html, /\.sky-fx \{ display: none; position: absolute; inset: 0; overflow: hidden; pointer-events: none; \}/);
  assert.match(html, /\.map-stage\.fx-ready \.sky-fx \{ display: block; \}/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\) \{ \.map-stage\.fx-ready \.sky-fx \{ display: none; \} \}/);
  assert.match(html, /\.map-stage\.idle \.sky-fx i, \.map-stage\.idle \.sky-fx \.gull, \.map-stage\.idle \.sky-fx \.wing \{ animation-play-state: paused; \}/);
  // three gulls, three puffs of smoke, two cloud shadows and a sun, nothing else
  assert.equal((html.match(/class="gull gull-[abc]"/g) || []).length, 3);
  assert.equal((html.match(/class="smoke smoke-[abc]"/g) || []).length, 3);
  assert.equal((html.match(/class="shade shade-[ab]"/g) || []).length, 2);
  assert.equal((html.match(/<i class="sun">/g) || []).length, 1);
  // every keyframe that belongs to these effects only moves, scales or fades (cheap on a phone)
  for (const name of ["fx-sun", "fx-shade", "fx-smoke", "fx-gull", "fx-flap"]) {
    const frame = html.match(new RegExp(`@keyframes ${name} \\{[^\n]*`));
    assert.ok(frame, `${name} exists`);
    assert.equal(/left:|top:|width:|height:|background/.test(frame[0]), false, `${name} only uses transform and opacity`);
  }
});

test("motion: the layered map files exist, stay small and inside the canvas, and the keyframes only move, turn and fade", () => {
  for (const [name, set, canvas] of [["desktop", ART.layers.desktop, [1600, 900]], ["mobile", ART.layers.mobile, [800, 1422]]]) {
    assert.deepEqual(set.canvas, canvas, `${name} canvas`);
    const plate = new URL(`../prototype/trade-street/${set.plate}`, import.meta.url);
    assert.ok(existsSync(plate), `${name} plate`);
    assert.ok(statSync(plate).size <= 250000, `${name} plate is at most 250 KB`);
    assert.deepEqual(set.sprites.map((sp) => sp.id), ["cloud-a", "cloud-b", "cloud-c", "far-ship", "crane-container", "truck-a", "truck-b"], `${name} layers`);
    let total = 0;
    for (const sp of set.sprites) {
      const file = new URL(`../prototype/trade-street/${sp.file}`, import.meta.url);
      assert.ok(existsSync(file), sp.file);
      assert.ok(statSync(file).size <= 40000, `${sp.file} is at most 40 KB`);
      total += statSync(file).size;
      assert.ok(sp.x >= 0 && sp.y >= 0 && sp.x + sp.w <= canvas[0] && sp.y + sp.h <= canvas[1], `${sp.id} sits inside the ${name} canvas`);
      if (sp.pivot) assert.ok(sp.pivot[0] >= 0 && sp.pivot[0] <= sp.w && sp.pivot[1] >= 0 && sp.pivot[1] <= sp.h, `${sp.id} pivot inside its picture`);
    }
    assert.ok(total <= 300000, `${name} layers together are at most 300 KB`);
  }
  const html = read("../prototype/trade-street/index.html");
  assert.match(html, /class="layer-fx" id="layer-fx" aria-hidden="true"/);
  assert.match(html, /\.layer-fx \{ display: none; position: absolute; inset: 0; overflow: hidden; pointer-events: none; \}/);
  assert.match(html, /\.map-stage\.layers-ready \.layer-fx \{ display: block; \}/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\) \{ \.layer-fx \.sprite \{ animation: none; \} \}/);
  assert.match(html, /\.map-stage\.idle \.layer-fx \.sprite \{ animation-play-state: paused; \}/);
  for (const name of ["lx-cloud", "lx-ship", "lx-sway", "lx-creep-a", "lx-creep-b"]) {
    const frame = html.match(new RegExp(`@keyframes ${name} \{[^\n]*`));
    assert.ok(frame, `${name} exists`);
    assert.equal(/left:|top:|width:|height:|background/.test(frame[0]), false, `${name} only uses transform and opacity`);
  }
  // the layers are drawn by the script with no inline script; the map stays hidden until the plate and layers are settled
  assert.match(html, /\.map-stage:not\(\.map-settled\) #map-img \{ opacity: 0; \}/);
  assert.equal(/<script(?![^>]*src=)[^>]*>/.test(html), false);
});

test("weight: the small head pictures exist for every person, are tiny, and the page uses them for the circles", () => {
  for (const id of CAST_ORDER) {
    const src = ART.avatar[id];
    assert.match(src, /^assets\/avatars\/[a-z-]+\.webp$/, id);
    const file = new URL(`../prototype/trade-street/${src}`, import.meta.url);
    assert.ok(existsSync(file), src);
    assert.ok(statSync(file).size <= 12000, `${src} is at most 12 KB`);
    const size = webpSize(readFileSync(file));
    assert.deepEqual([size.width, size.height], [160, 160], `${src} is 160x160`);
  }
  const app = read("../prototype/trade-street/app.js");
  assert.match(app, /const src = ART\.avatar\[charId\];/);
});

test("plain words: every stop has one short plain line in both languages, and the page no longer calls itself a Garage piece", () => {
  for (const lang of ["zh", "en"]) {
    assert.equal(GLOSS[lang].length, 14, `${lang} has fourteen plain lines`);
    GLOSS[lang].forEach((line, i) => {
      assert.ok(line.length >= 4 && line.length <= (lang === "zh" ? 18 : 44), `${lang} line ${i + 1} is short: ${line}`);
      assert.notEqual(line, SHORT[lang][i], `${lang} line ${i + 1} says more than the name`);
    });
  }
  for (const file of ["../prototype/trade-street/index.html", "../prototype/trade-street/app.js", "../prototype/trade-street/cast/index.html", "../prototype/trade-street/cast/cast.js"]) {
    const text = read(file);
    assert.equal(/Digital Garage|回到 Garage|Back to Garage|#garage/.test(text), false, `${file} points at the Showcase now`);
  }
});

test("intro and wrap-up: the relay primer and the three takeaways exist in both languages, plain, with no numbers or units", () => {
  for (const lang of ["zh", "en"]) {
    const t = UI[lang];
    assert.ok(t.primerTitle.length > 10 && t.primerBody.length > 60, `${lang} primer`);
    assert.equal(t.takeaway.length, 3, `${lang} takeaways`);
    assert.ok(t.takeawayTitle && t.takeawayLink, `${lang} takeaway labels`);
    for (const line of [t.primerTitle, t.primerBody, t.takeawayTitle, ...t.takeaway]) assert.equal(/\d/.test(line), false, `${lang} has no digits: ${line}`);
  }
  const html = read("../prototype/trade-street/index.html");
  for (const id of ["primer", "primer-title", "primer-body", "takeaway", "takeaway-title", "takeaway-list", "takeaway-link"]) assert.ok(html.includes(`id="${id}"`), id);
});

test("newcomer hints: legend, stop-1 note and buffer line exist in both languages and use the same words as the rules", () => {
  for (const lang of ["zh", "en"]) {
    const t = UI[lang];
    assert.ok(t.lightsLegend.includes("✓") && t.lightsLegend.includes("!") && t.lightsLegend.includes("✕"), `${lang} legend names all three marks`);
    assert.ok(t.firstNote.length > 20, `${lang} first note`);
    assert.match(t.bufferUsed(0), lang === "zh" ? /沒用到緩衝格/ : /no buffer cells/);
    assert.match(t.bufferUsed(2), lang === "zh" ? /用掉 2 格緩衝/ : /2 buffer cells/);
    assert.match(t.bufferUsed(1), lang === "zh" ? /用掉 1 格緩衝/ : /1 buffer cell\./);
  }
  assert.equal(UI.zh.handover.fix.includes("補正"), false, "no 補正 left");
});

test("connected: case -> 12 steps -> Trade Street -> case, and every target exists", () => {
  const caseHtml = read("../public/cases/first-container/index.html");
  const steps = read("../prototype/one-container-12-steps/index.html");
  const app = read("../prototype/trade-street/app.js");
  for (const lang of ["zh", "en"]) {
    assert.ok(caseHtml.includes(`href="/prototype/one-container-12-steps/?lang=${lang}"`), `case links to the 12 steps (${lang})`);
    assert.ok(caseHtml.includes(`href="/prototype/trade-street/?lang=${lang}"`), `case links to Trade Street (${lang})`);
  }
  assert.ok(steps.includes(`href="/prototype/trade-street/?lang=' + lang + '"`) || steps.includes("/prototype/trade-street/?lang="), "12 steps links to Trade Street");
  assert.match(steps, /play: "走一趟貿易街（互動版）"/);
  assert.match(steps, /play: "Walk Trade Street \(interactive\)"/);
  assert.match(app, /\/cases\/first-container\//);
  assert.ok(existsSync(new URL("../public/cases/first-container/index.html", import.meta.url)));
  assert.ok(existsSync(new URL("../prototype/one-container-12-steps/index.html", import.meta.url)));
});

test("learn more: the cut-off terms, risky moments and five questions are verbatim from the 12-steps page, and the four moments line up with them", () => {
  const copy = sourceCopy();
  for (const lang of ["zh", "en"]) {
    for (const field of ["cutH", "cutLede", "cutGroups", "dangerH", "danger", "asksH", "asksLede", "asks"]) {
      assert.deepEqual(LEARN_TEXT[lang][field], copy[lang][field], `${lang} ${field}`);
    }
    assert.equal(LEARN_TEXT[lang].cutGroups[0].items.length, 3, `${lang} three cut-offs`);
    assert.equal(LEARN_TEXT[lang].asks.length, 5, `${lang} five questions`);
    // the first three of the four moments are the three cut-offs, in the same order; the fourth is the sailing
    assert.equal(PAGE_TEXT[lang].countdown.length, 4, `${lang} four moments`);
    assert.ok(STEP_TEXT[9][lang].p.length > 10, `${lang} the sailing has its own line`);
  }
  assert.match(LEARN_TEXT.zh.cutGroups[0].items.map((item) => item[0]).join(","), /截單.*截關.*截港/);
  const app = read("../prototype/trade-street/app.js");
  assert.match(app, /wordingNote/);
  assert.match(app, /renderLightsHelp/);
});
