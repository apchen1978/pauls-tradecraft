import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import { withDemoLang } from "../src/demoLinks.js";

let checks = 0;
for (const page of ["ai-native-overseas-customer-roadmap", "ai-native-commercial-conversion", "decision-adversary", "garage-rfq-workflow-001", "three-days-of-quiet", "same-factory-different-buyer"]) {
  for (const lang of ["zh", "en"]) {
    const path = `/prototype/${page}/`;
    assert.equal(withDemoLang(path, lang), `${path}?lang=${lang}`);
    assert.equal(withDemoLang(`${path}?source=gbd&lang=${lang === "en" ? "zh" : "en"}#detail`, lang), `${path}?source=gbd&lang=${lang}#detail`);
    assert.equal(withDemoLang(`https://paulstradecraft.com${path}`, lang), `https://paulstradecraft.com${path}?lang=${lang}`);
    checks += 3;
  }
}
for (const url of ["#contact", "/files/guide.pdf", "/prototype/the-witness-tag/", "https://example.com/prototype/decision-adversary/", "mailto:paul@example.com"]) {
  assert.equal(withDemoLang(url, "en"), url);
  checks++;
}
assert.equal(withDemoLang("https://apchen1978.github.io/commercial-decision-desk/#mode-gap", "en"), "https://apchen1978.github.io/commercial-decision-desk/?lang=en#mode-gap");
checks++;
for (const page of ["ai-native-overseas-customer-roadmap", "ai-native-commercial-conversion", "decision-adversary", "garage-rfq-workflow-001", "same-factory-different-buyer"]) {
  const html = readFileSync(new URL(`../prototype/${page}/index.html`, import.meta.url), "utf8");
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    new Script(match[1], { filename: `${page}/index.html` });
    checks++;
  }
}
console.log(`PASS: ${checks} language-link and inline-script checks. Browser QA verifies rendering, toggles and navigation.`);
