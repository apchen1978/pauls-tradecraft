// Rules for the pre-export presence check (public/prototype/export-readiness-check).
// Run: node scripts/verify-export-check.mjs
import assert from "node:assert/strict";
import { ITEMS, GROUPS, diagnose } from "../public/prototype/export-readiness-check/diagnose.js";
import { COPY } from "../public/prototype/export-readiness-check/diagnose-copy.js";

let checks = 0;
const check = (ok, message) => { assert.ok(ok, message); checks += 1; };
const all = (blocker, bonus) => Object.fromEntries(ITEMS.map((i) => [i.key, { blocker, bonus }]));

// 1. Logic.
check(ITEMS.length === 7, "seven items");
check(ITEMS.filter((i) => !i.blocks).map((i) => i.key).sort().join() === "story,video", "only the video and the story never block");
const none = diagnose(all(false, false));
check(none.fixFirst.length === 5 && none.later.length === 2 && none.enough.length === 0, "nothing ticked: five items block, the two that never block wait");
const minimum = diagnose(all(true, false));
check(minimum.fixFirst.length === 0 && minimum.later.length === 7 && minimum.firstMove === null, "the minimum met everywhere: nothing blocks, everything else can wait, no first move");
const full = diagnose(all(true, true));
check(full.enough.length === 7 && full.fixFirst.length === 0 && full.later.length === 0, "everything ticked: all enough");
const bonusOnly = diagnose(all(false, true));
check(bonusOnly.fixFirst.length === 5 && bonusOnly.enough.length === 2, "a bonus never cancels a missed blocking bar");
check(diagnose({}).fixFirst.length === 5, "no answers behave like nothing ticked");
const seen = [...none.fixFirst, ...none.later, ...none.enough].sort();
check(JSON.stringify(seen) === JSON.stringify(ITEMS.map((i) => i.key).sort()), "every item lands in exactly one group");
check(none.firstMove === "response", "the quickest blocking fix is suggested first (response speed)");
const noResponse = diagnose({ ...all(false, false), response: { blocker: true, bonus: false }, catalog: { blocker: true, bonus: false } });
check(noResponse.firstMove === "photos", "with response and catalogue met, photos is the quickest remaining fix");
check(GROUPS.join() === "fixFirst,later,enough", "three groups, in this order");

// 2. Copy: same shape in both languages, nothing missing.
const shape = (v) => (v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v);
check(JSON.stringify(shape(COPY.zh)) === JSON.stringify(shape(COPY.en)), "zh and en have the same keys");
for (const lang of ["zh", "en"]) {
  for (const item of ITEMS) {
    const t = COPY[lang].items[item.key];
    check(t && t.name && t.bonus && t.why, `${lang}: ${item.key} has name, bonus and why`);
    check(item.blocks ? !!t.blocker : t.blocker === undefined, `${lang}: ${item.key} has a minimum bar only if it can block`);
  }
  for (const g of GROUPS) check(COPY[lang].groups[g].title && COPY[lang].groups[g].note, `${lang}: group ${g}`);
}

// 3. Rules for what the page may say.
const text = (lang) => JSON.stringify(COPY[lang]);
const FORBIDDEN = [
  /moat|護城河/i,
  /壁紙|壁材|地板|窗簾|窗飾|布料|塑木|防腐木|涼亭|flooring|wallpaper|wallcovering|curtain|drapery|fabric|decking/i,
  /A2A|CDD|中間層|middle layer|ERP|Apollo|Instantly/i,
  /[$＄]|USD|NT\$|%|百分之/,
  /保證|guarantee|ROI|成交率|conversion rate|回覆率|reply rate/i,
];
for (const lang of ["zh", "en"]) for (const re of FORBIDDEN) check(!re.test(text(lang)), `${lang}: does not contain ${re}`);
for (const lang of ["zh", "en"]) check(/不是評分|not a score/.test(COPY[lang].disclosure) && /不上傳|neither stored nor uploaded/.test(COPY[lang].disclosure), `${lang}: the disclosure says it is not a score and nothing is uploaded`);

console.log(`Pre-export presence check tests: ${checks}/${checks} PASS`);
