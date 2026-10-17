import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const files = ["../prototype/code-words/index.html", "../prototype/code-words/app.js"];
const sources = files.map((f) => [f, readFileSync(new URL(f, import.meta.url), "utf8")]);
const i18n = readFileSync(new URL("../src/i18n.jsx", import.meta.url), "utf8");
const cards = [...i18n.matchAll(/href: "\/prototype\/code-words\/"[\s\S]{0,80}?\},/g)];

test("code-words page keeps the public-words rules", () => {
  for (const [file, text] of sources) {
    for (const banned of ["中間層", "A2A", "CDD", "老闆"]) assert.ok(!text.includes(banned), `${file} has ${banned}`);
  }
});

test("code-words page never calls a model, a network or storage", () => {
  const app = sources[1][1];
  for (const api of ["fetch(", "XMLHttpRequest", "localStorage", "sessionStorage", "indexedDB", "document.cookie", "sendBeacon"]) {
    assert.ok(!app.includes(api), `app.js uses ${api}`);
  }
});

test("the boundary label stays on the page, the card and the Garage entry", () => {
  const [html, app] = [sources[0][1], sources[1][1]];
  assert.ok(app.includes("示意玩具，不是心理測驗"));
  assert.ok(app.includes("A toy, not a personality test"));
  assert.ok(html.includes("示意玩具，不是心理測驗"));
  assert.equal(cards.length, 2, "Garage lists the toy in both languages");
});
