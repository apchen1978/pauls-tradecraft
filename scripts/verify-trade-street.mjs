import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import {
  allRoutes, CAST, CAST_ORDER, DECISIONS, isCode, LIGHTS, readRoute, REACT, resolve, SCENARIO_ORDER, SCENARIOS, shareSearch,
  START_BUFFER, STATION_SPEAKER, STYLE_CHAR, STYLE_ORDER, STYLES,
} from "../prototype/trade-street/game.js";
import { PAGE_TEXT, STEP_TEXT } from "../prototype/trade-street/steps-text.js";
import { AVATAR_COLOR, SHORT, STATION_LINE, UI } from "../prototype/trade-street/app.js";
import { ART, MOBILE_QUERY, POS } from "../prototype/trade-street/layout.js";

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

test("the decisions sit on real steps, in order, and the post-sail one comes after the ship sails (step 10)", () => {
  assert.equal(DECISIONS.length, 6);
  const steps = DECISIONS.map((decision) => decision.step);
  assert.deepEqual(steps, [...steps].sort((a, b) => a - b));
  assert.equal(new Set(steps).size, 6);
  for (const decision of DECISIONS) {
    assert.ok(decision.step >= 1 && decision.step <= 12);
    assert.equal(decision.options.length, 3);
    assert.equal(new Set(decision.options.map((option) => option.tag)).size, 3);
    assert.deepEqual(decision.options.map((option) => option.id), ["A", "B", "C"]);
    assert.equal(decision.options.filter((option) => option.cost > 0).length, 1, `${decision.id} has exactly one costly (shadow) option`);
    assert.ok(decision.options.some((option) => option.cost === 0));
    if (decision.after) assert.ok(decision.step > 10); else assert.ok(decision.step <= 10);
    if (decision.light != null) assert.ok(decision.light >= 0 && decision.light < LIGHTS.length);
  }
  assert.equal(DECISIONS.filter((decision) => decision.after).length, 1);
  assert.equal(DECISIONS.filter((decision) => decision.light == null).length, 1);
  assert.equal(STATION_SPEAKER.length, 12);
  assert.equal(SHORT.zh.length, 12);
  assert.equal(SHORT.en.length, 12);
  assert.equal(STATION_LINE.zh.length, 12);
  assert.equal(STATION_LINE.en.length, 12);
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
  const blob = everyString([CAST, STYLES, REACT, SCENARIOS, DECISIONS, UI, STATION_LINE, SHORT, STEP_TEXT, PAGE_TEXT]).join("\n") + read("../prototype/trade-street/index.html");
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
  const ours = everyString([CAST, STYLES, REACT, SCENARIOS, DECISIONS, STATION_LINE]).join("\n");
  assert.equal(/\d+\s*(天|日|小時|days?|hours?|USD|\$|%|％|元|萬)/i.test(ours), false);
});

test("English uses roles, not invented personal names", () => {
  for (const id of CAST_ORDER) assert.match(CAST[id].en.name, /^The /, id);
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

test("art: twelve stops on each map, inside the picture, and far enough apart to tap", () => {
  const sizes = { desktop: [1600, 900, 34], mobile: [800, 1422, 62] };
  for (const [kind, [width, height, gap]] of Object.entries(sizes)) {
    const points = POS[kind];
    assert.equal(points.length, 12, kind);
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
  assert.match(html, /srcset="assets\/trade-street-map-mobile\.webp"/);
  assert.match(html, /src="assets\/trade-street-map\.webp"/);
  const deploy = read("../.github/workflows/deploy.yml");
  for (const file of ["index.html", "app.js", "game.js", "steps-text.js", "layout.js"]) assert.ok(deploy.includes(`prototype/trade-street/${file}`), `deploy copies ${file}`);
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
