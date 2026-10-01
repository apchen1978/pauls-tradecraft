// diagnose.js — the pre-export presence check, as plain rules.
//
// Seven things a buyer meets before they ever talk to you. Each one has a bar that,
// if missed, stops a buyer from going further ("blocks"), and some have a second bar
// that earns extra trust ("bonus"). The check puts every item in one of three places:
//   fixFirst : a blocking bar is missed
//   later    : the blocking bar is met (or there is none) but the bonus is missing
//   enough   : everything that applies is met
// It never scores, ranks a company or predicts a result.

// effort: a rule of thumb for how quickly a small team can fix a missed blocking bar
// (1 = days, 5 = the longest). It only decides which fix to suggest first.
export const ITEMS = [
  { key: "photos", blocks: true, effort: 3 },
  { key: "video", blocks: false, effort: 4 },
  { key: "website", blocks: true, effort: 5 },
  { key: "story", blocks: false, effort: 2 },
  { key: "catalog", blocks: true, effort: 2 },
  { key: "specs", blocks: true, effort: 4 },
  { key: "response", blocks: true, effort: 1 },
];

export const GROUPS = ["fixFirst", "later", "enough"];

// answers: { [key]: { blocker: boolean, bonus: boolean } } — true means "we have it".
export function diagnose(answers) {
  const result = { fixFirst: [], later: [], enough: [], firstMove: null };
  for (const item of ITEMS) {
    const a = answers[item.key] ?? {};
    const blockerMet = item.blocks ? a.blocker === true : true;
    const bonusMet = a.bonus === true;
    if (!blockerMet) result.fixFirst.push(item.key);
    else if (!bonusMet) result.later.push(item.key);
    else result.enough.push(item.key);
  }
  const blockers = ITEMS.filter((item) => result.fixFirst.includes(item.key));
  if (blockers.length) result.firstMove = blockers.reduce((best, item) => (item.effort < best.effort ? item : best)).key;
  return result;
}
