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
  positioningEn: "Commercial judgment · AI-native execution · Evidence-aware work systems",
  positioningZh: "商業判斷 · AI-native 執行 · 證據導向的工作系統",
  capabilities: {
    ZH: ["海外商業開發", "Owner 特案推進", "商業經濟／會計視角"],
    EN: ["Global Business Development", "Owner Special Projects", "Business Economics / Accounting-aware Judgment"],
  },
  proofWorks: {
    ZH: ["Commercial Decision Desk", "Global Business Development / AI-Native Market Entry", "Trade Profit Navigator", "企業支出決策啟發"],
    EN: ["Commercial Decision Desk", "Global Business Development / AI-Native Market Entry", "Trade Profit Navigator", "Business Spending Insight"],
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
  check(orderedContains(data.services || [], expected.capabilities[locale]), `${locale} human capability hierarchy is stale`);
  check(orderedContains(data.works || [], expected.proofWorks[locale]), `${locale} selected proof ordering is stale`);
  check(Boolean(data.leverage), `${locale} missing AI-as-leverage explanation`);
  check((data.works || []).some((item) => item.includes("Commercial Decision Desk")), `${locale} missing Commercial Decision Desk`);
  check(!data.worksSecondary?.length, `${locale} one-pager should not regress into a secondary work inventory`);
}

check(en.positioning === expected.positioningEn, "EN missing current capability positioning");
check(zh.positioning === expected.positioningZh, "ZH missing current capability positioning");
check(en.works?.length === zh.works?.length, "ZH/EN selected proof hierarchy diverged");

check(fs.existsSync(brief), "Capability Brief PDF is missing");
if (fs.existsSync(brief)) {
  const pdf = fs.readFileSync(brief).toString("latin1");
  const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) || []).length;
  check(pages === 7, `Capability Brief page count changed (expected 7, got ${pages})`);
}
for (const phrase of ["Global Business Development", "Owner Special Projects", "Commercial Decision Desk", "Business Spending Insight"]) {
  check(briefSource.includes(phrase), `Capability Brief source missing '${phrase}'`);
}
check(briefSource.indexOf("Global Business Development") < briefSource.indexOf("Commercial Decision Desk"),
  "Capability Brief does not place global business development before supporting proof");

if (failures.length) {
  console.error("DOCUMENT CLOSING GATE: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("DOCUMENT CLOSING GATE: PASS");
