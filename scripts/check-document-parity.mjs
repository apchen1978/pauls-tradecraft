// Deterministic closing gate for public positioning documents.
// It deliberately checks pinned canonical facts, not semantic quality or editorial judgment.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, "content", name), "utf8"));
const zh = readJson("onepager-zh.json");
const en = readJson("onepager-en.json");
const worksSource = fs.readFileSync(path.join(ROOT, "src", "data", "works.js"), "utf8");
const briefSource = fs.readFileSync(path.join(ROOT, "scripts", "build_capability_brief.py"), "utf8");
const brief = process.argv[2] || path.join(ROOT, "public", "files", "PaulTradecraft-Capability-Brief.pdf");

const expected = {
  positioning: "AI-native Commercial Workflow Design × Decision Tools × Agent Orchestration",
  processEn: "Human Defines the Boundary → AI Delegation → Cross-Validation → Human Review → Deployment → Independent Review",
  processZh: "人類定界 → AI 分工 → 交叉驗證 → 人類審核 → 部署 → 獨立複查",
  primaryWorks: {
    ZH: ["Commercial Decision Desk", "AI Trade Deal Desk", "窗簾", "MORI"],
    EN: ["Commercial Decision Desk", "AI Trade Deal Desk", "Curtain", "MORI"],
  },
  secondaryWorks: {
    ZH: ["銷售 Pilot", "Lil Matt", "AI Lyrics", "MG Desktop Pet"],
    EN: ["Sales Pilot", "Lil Matt", "AI Lyrics", "MG Desktop Pet"],
  },
};

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const orderedContains = (items, phrases) => {
  let cursor = -1;
  for (const phrase of phrases) {
    const next = items.findIndex((item, index) => index > cursor && item.includes(phrase));
    if (next === -1) return false;
    cursor = next;
  }
  return true;
};

// Canonical website priority: Commercial Decision Desk is the first commercial work.
check(/id:\s*"commercial-decision-desk"[\s\S]{0,250}?featuredRank:\s*1/.test(worksSource),
  "canonical Commercial Decision Desk is not the first featured commercial work");

for (const [locale, data] of [["ZH", zh], ["EN", en]]) {
  check(data.stats?.some((item) => item.value === "23/23"), `${locale} missing 23/23 validation evidence`);
  check(orderedContains(data.works || [], expected.primaryWorks[locale]), `${locale} primary work ordering is stale`);
  check(orderedContains(data.worksSecondary || [], expected.secondaryWorks[locale]), `${locale} secondary work split/order is stale`);
  check((data.works || []).some((item) => item.includes("Commercial Decision Desk")), `${locale} missing Commercial Decision Desk`);
}

check(en.positioning === expected.positioning, "EN missing current capability positioning");
check(en.process === expected.processEn, "EN HOW I WORK is stale");
check(zh.process === expected.processZh, "ZH HOW I WORK is stale");
check(en.works?.length === zh.works?.length && en.worksSecondary?.length === zh.worksSecondary?.length,
  "ZH/EN public work hierarchy diverged");

check(fs.existsSync(brief), "Capability Brief PDF is missing");
if (fs.existsSync(brief)) {
  const pdf = fs.readFileSync(brief).toString("latin1");
  const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) || []).length;
  check(pages === 7, `Capability Brief page count changed (expected 7, got ${pages})`);
}
for (const phrase of ["Commercial Decision Desk", "AI Trade Deal Desk", "23/23", "MORI Soft-Furnishing Brand Website & Workflow"]) {
  check(briefSource.includes(phrase), `Capability Brief source missing '${phrase}'`);
}
check(briefSource.indexOf("Commercial Decision Desk") < briefSource.indexOf("AI Trade Deal Desk"),
  "Capability Brief commercial anchor ordering is stale");

if (failures.length) {
  console.error("DOCUMENT CLOSING GATE: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("DOCUMENT CLOSING GATE: PASS");
