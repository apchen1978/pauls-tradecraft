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

// One-pager facts approved 2026-10-08. The 23/23 pilot figure stays out:
// it was removed from the site on 2026-10-05 because it had no run record.
const expected = {
  positioningEn: "Path · People · Commitment · Numbers",
  positioningZh: "選路 · 選人 · 能不能承諾 · 算不算得過",
  kicker: {
    ZH: "Paul + AI 人機協作作品集 · 國際業務",
    EN: "Human–AI collaborative work · International sales",
  },
  disclaimer: {
    ZH: "示範案例使用虛構資料，成效未驗證。",
    EN: "Demo cases use fictional data; outcomes not verified.",
  },
  worksLead: {
    ZH: "四站故事線：選路、選人、能不能承諾、算不算得過。下面四件作品由這條線串起。",
    EN: "Four stations: the path, the people, whether to commit, and whether the numbers hold. The four works below follow this line.",
  },
  capabilities: {
    ZH: ["海外商業開發", "承諾前的決策", "商業經濟／會計視角"],
    EN: ["Global business development", "Decisions before commitment", "Business economics / accounting-aware judgment"],
  },
  proofWorks: {
    ZH: ["帶一項產品，走到第一櫃", "海外客戶開發", "Paul 接手", "商務決策工作台", "貿易利潤導航", "海外市場開發研究", "從詢盤到報價：六道關卡"],
    EN: ["From one product to the first container", "Overseas Lead Discovery", "Paul takes over", "Commercial Decision Desk", "Trade Profit Navigator", "Market Entry Research", "From Inquiry to Quote: Six Decision Gates"],
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
const orderedInText = (text, phrases) => {
  let cursor = 0;
  for (const phrase of phrases) {
    const next = text.indexOf(phrase, cursor);
    if (next === -1) return false;
    cursor = next + phrase.length;
  }
  return true;
};

// Canonical website priority: Commercial Decision Desk is the first commercial work.
check(/id:\s*"commercial-decision-desk"[\s\S]{0,250}?featuredRank:\s*1/.test(worksSource),
  "canonical Commercial Decision Desk is not the first featured commercial work");

for (const [locale, data] of [["ZH", zh], ["EN", en]]) {
  const proofSurface = [data.worksTitle, data.worksLead, ...(data.works || [])].filter(Boolean);
  const narrative = [
    data.title, data.positioning, data.subtitle, data.worksLead, data.leverage, data.process, data.disclaimer,
    ...(data.services || []), ...(data.works || []),
    ...(data.deliverables || []).flatMap((item) => [item.title, item.body]),
  ].join("\n");
  check(data.stats?.length === 3, `${locale} should show three stat cells`);
  check(!JSON.stringify(data.stats || []).includes("23/23"), `${locale} still includes the removed 23/23 figure`);
  check(data.stats?.[0]?.value === "955", `${locale} missing TOEIC 955`);
  check(data.stats?.[2]?.value === (locale === "ZH" ? "總監" : "Director"), `${locale} third stat value is not the director title`);
  check(data.stats?.[2]?.label === (locale === "ZH" ? "國際業務總監" : "International Trade Director"), `${locale} third stat label is not the director title`);
  check(!/前職|Former role/i.test(JSON.stringify(data)), `${locale} still says former role`);
  check(data.kicker === expected.kicker[locale], `${locale} kicker drifted from the site Hero line`);
  check(data.disclaimer === expected.disclaimer[locale], `${locale} disclaimer is not the single approved line`);
  check(data.worksLead === expected.worksLead[locale], `${locale} works intro is not the approved line`);
  check(!/各自獨立|stay separate/i.test(data.worksLead || ""), `${locale} works intro still says the works stay separate`);
  check(data.email === "paulchen1978@gmail.com", `${locale} email changed`);
  check(data.lineLabel === "LINE" && data.lineUrl === "https://line.me/ti/p/zSJdkOeQgS", `${locale} LINE contact is missing or shows an ID`);
  check(orderedContains(data.services || [], expected.capabilities[locale]), `${locale} human capability hierarchy is stale`);
  check(orderedInText(proofSurface.join("\n"), expected.proofWorks[locale]), `${locale} selected proof ordering is stale`);
  check(Boolean(data.leverage), `${locale} missing how-I-work explanation`);
  check(!data.worksSecondary?.length, `${locale} one-pager should not regress into a secondary work inventory`);
  check(!/中間層|A2A|\bCDD\b|ROI|轉換率|成交率|老闆|老板|\bboss\b|\bowner\b/i.test(narrative), `${locale} public copy breaks a standing rule`);
  check(!/人工智慧|\bAI\b/.test(narrative), `${locale} mentions AI outside the kicker`);
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
for (const phrase of ["Global Business Development", "Special Projects", "Commercial Decision Desk", "Business Spending Insight"]) {
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
