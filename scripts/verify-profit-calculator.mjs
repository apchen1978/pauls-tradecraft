import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_INPUTS,
  FIELD_ORDER,
  MARGIN_FLOOR,
  calculateProfit,
  calculatorCopy,
  collectPublicText,
  createInputs,
  formatPercent,
  formatResultText,
  formatUsd,
  judgmentText,
  liveSummary,
  profitJudgment,
  resetInputs,
} from "../src/data/profitCalculator.js";

const defaults = () => calculateProfit(DEFAULT_INPUTS);

test("defaults match the fictional first-container case and sit just above the floor", () => {
  assert.equal(DEFAULT_INPUTS.sellingPrice, 12.5);
  assert.equal(DEFAULT_INPUTS.purchaseCost, 7.5);
  assert.equal(DEFAULT_INPUTS.quantity, 4000);
  assert.equal(DEFAULT_INPUTS.freight, 2000);
  assert.equal(DEFAULT_INPUTS.depositPct, 30);
  assert.equal((10 + 15) / 2, DEFAULT_INPUTS.sellingPrice);
  assert.equal((3000 + 5000) / 2, DEFAULT_INPUTS.quantity);

  const result = defaults();
  assert.equal(result.status, "ok");
  assert.equal(result.revenue, 50000);
  assert.equal(result.goodsCost, 30000);
  assert.equal(result.freight, 2000);
  assert.equal(result.totalCost, 32000);
  assert.equal(result.grossProfit, 18000);
  assert.equal(result.grossMargin, 0.36);
  assert.equal(result.breakEvenPrice, 8);
  assert.ok(result.grossMargin > MARGIN_FLOOR);
  assert.ok(result.grossMargin - MARGIN_FLOOR < 0.02);
  assert.equal(result.belowFloor, false);
  assert.equal(result.depositCash, 15000);
  assert.equal(result.balanceBeforeShipment, 35000);
  assert.equal(result.cashBeforeShipment, 17000);
  assert.equal(result.bar.basis, "revenue");
  assert.equal(result.bar.parts[0].share, 0.6);
  assert.equal(result.bar.parts[1].share, 0.04);
  assert.equal(result.bar.parts[2].share, 0.36);
  const shareSum = result.bar.parts.reduce((sum, part) => sum + part.share, 0);
  assert.ok(Math.abs(shareSum - 1) < 1e-12);
});

test("margin math, break-even, and the 35% floor use the unrounded ratio", () => {
  const exact = calculateProfit({ sellingPrice: 10, purchaseCost: 6, quantity: 100, freight: 50, depositPct: 30 });
  assert.equal(exact.revenue, 1000);
  assert.equal(exact.totalCost, 650);
  assert.equal(exact.grossProfit, 350);
  assert.equal(exact.grossMargin, 0.35);
  assert.equal(exact.breakEvenPrice, 6.5);
  assert.equal(exact.belowFloor, false);

  const justUnder = calculateProfit({ ...exact, freight: 51, sellingPrice: 10, purchaseCost: 6, quantity: 100, depositPct: 30 });
  assert.equal(justUnder.grossProfit, 349);
  assert.ok(justUnder.grossMargin < MARGIN_FLOOR);
  assert.equal(justUnder.belowFloor, true);

  const onFloor = calculateProfit({ ...DEFAULT_INPUTS, freight: 2500 });
  assert.equal(onFloor.grossMargin, 0.35);
  assert.equal(onFloor.belowFloor, false);
  const underFloor = calculateProfit({ ...DEFAULT_INPUTS, freight: 2600 });
  assert.equal(underFloor.grossMargin, 0.348);
  assert.equal(underFloor.belowFloor, true);
  assert.equal(underFloor.breakEvenPrice, 32600 / 4000);

  const oneSliderStep = calculateProfit({ ...DEFAULT_INPUTS, sellingPrice: 12 });
  assert.equal(oneSliderStep.revenue, 48000);
  assert.equal(oneSliderStep.grossProfit, 16000);
  assert.equal(oneSliderStep.grossMargin, 16000 / 48000);
  assert.equal(oneSliderStep.belowFloor, true);
  assert.match(liveSummary(oneSliderStep, "zh"), /低於本示範設定的 35%/);
  assert.match(liveSummary(oneSliderStep, "en"), /Below the 35% set for this demo/);
  assert.match(liveSummary(defaults(), "zh"), /毛利仍在本示範設定的 35% 之上/);
  assert.equal(liveSummary(defaults(), "zh").includes("低於本示範設定的 35%"), false);
});

test("deposit changes cash before shipment and does not change the margin", () => {
  const base = defaults();
  const fullDeposit = calculateProfit({ ...DEFAULT_INPUTS, depositPct: 100 });
  assert.equal(fullDeposit.grossMargin, base.grossMargin);
  assert.equal(fullDeposit.depositCash, 50000);
  assert.equal(fullDeposit.balanceBeforeShipment, 0);
  assert.equal(fullDeposit.cashBeforeShipment, 0);
  const noDeposit = calculateProfit({ ...DEFAULT_INPUTS, depositPct: 0 });
  assert.equal(noDeposit.grossMargin, base.grossMargin);
  assert.equal(noDeposit.cashBeforeShipment, 32000);
  const missingDeposit = calculateProfit({ ...DEFAULT_INPUTS, depositPct: "" });
  assert.equal(missingDeposit.grossMargin, base.grossMargin);
  assert.equal(missingDeposit.depositCash, null);
  assert.equal(missingDeposit.cashBeforeShipment, null);
  assert.equal(calculateProfit({ ...DEFAULT_INPUTS, depositPct: 101 }).depositCash, null);
  assert.equal(calculateProfit({ ...DEFAULT_INPUTS, depositPct: -1 }).status, "ok");
  assert.equal(calculateProfit({ ...DEFAULT_INPUTS, depositPct: -1 }).cashBeforeShipment, null);
});

test("zero and negative inputs stay defined and do not pretend to be a margin", () => {
  const zeroQty = calculateProfit({ ...DEFAULT_INPUTS, quantity: 0 });
  assert.equal(zeroQty.status, "zero-quantity");
  assert.equal(zeroQty.revenue, 0);
  assert.equal(zeroQty.goodsCost, 0);
  assert.equal(zeroQty.totalCost, 2000);
  assert.equal(zeroQty.grossProfit, -2000);
  assert.equal(zeroQty.grossMargin, null);
  assert.equal(zeroQty.breakEvenPrice, null);
  assert.equal(zeroQty.belowFloor, false);
  assert.equal(zeroQty.bar.basis, "cost");
  assert.match(liveSummary(zeroQty, "en"), /cannot be calculated/);

  const zeroPrice = calculateProfit({ ...DEFAULT_INPUTS, sellingPrice: 0 });
  assert.equal(zeroPrice.status, "zero-revenue");
  assert.equal(zeroPrice.revenue, 0);
  assert.equal(zeroPrice.grossMargin, null);
  assert.equal(zeroPrice.breakEvenPrice, 8);
  assert.equal(zeroPrice.grossProfit, -32000);
  assert.equal(zeroPrice.belowFloor, false);

  const allZero = calculateProfit({ sellingPrice: 0, purchaseCost: 0, quantity: 0, freight: 0, depositPct: 0 });
  assert.equal(allZero.status, "zero-quantity");
  assert.equal(allZero.bar.basis, "empty");
  assert.equal(allZero.grossProfit, 0);
  assert.equal(allZero.belowFloor, false);

  for (const field of ["sellingPrice", "purchaseCost", "quantity", "freight"]) {
    const negative = calculateProfit({ ...DEFAULT_INPUTS, [field]: -1 });
    assert.equal(negative.status, "invalid", field);
    assert.equal(negative.revenue, null);
    assert.equal(negative.grossProfit, null);
    assert.equal(negative.grossMargin, null);
    assert.equal(negative.breakEvenPrice, null);
    assert.equal(negative.belowFloor, false);
    assert.equal(negative.bar.basis, "empty");
  }

  const blank = calculateProfit({ ...DEFAULT_INPUTS, purchaseCost: "" });
  assert.equal(blank.status, "invalid");
  assert.equal(blank.revenue, null);
  const unreadable = calculateProfit({ ...DEFAULT_INPUTS, sellingPrice: "-", freight: "abc" });
  assert.equal(unreadable.status, "invalid");
  assert.equal(unreadable.grossMargin, null);
  const spaced = calculateProfit({ ...DEFAULT_INPUTS, sellingPrice: " 12.5 " });
  assert.equal(spaced.grossMargin, 0.36);

  const loss = calculateProfit({ ...DEFAULT_INPUTS, sellingPrice: 5 });
  assert.equal(loss.status, "loss");
  assert.equal(loss.revenue, 20000);
  assert.equal(loss.grossProfit, -12000);
  assert.ok(loss.grossMargin < 0);
  assert.equal(loss.belowFloor, true);
  assert.equal(loss.breakEvenPrice, 8);
  assert.equal(loss.bar.basis, "cost");
  assert.equal(loss.bar.parts.find((part) => part.key === "profit").share, 0);
  assert.equal(formatUsd(loss.grossProfit), "−USD 12,000");
  assert.equal(formatPercent(loss.grossMargin), "-60.00%");
});

test("reset restores the defaults and clears a floor warning", () => {
  const dirty = createInputs();
  dirty.sellingPrice = 9;
  dirty.quantity = 0;
  dirty.freight = -5;
  assert.equal(DEFAULT_INPUTS.sellingPrice, 12.5);
  const restored = resetInputs();
  assert.deepEqual(restored, DEFAULT_INPUTS);
  assert.notEqual(restored, DEFAULT_INPUTS);
  restored.quantity = 1;
  assert.equal(resetInputs().quantity, 4000);
  const warned = calculateProfit({ ...DEFAULT_INPUTS, sellingPrice: 12 });
  assert.equal(warned.belowFloor, true);
  const after = calculateProfit(resetInputs());
  assert.deepEqual(after, defaults());
  assert.equal(after.belowFloor, false);
});

test("both languages carry the case facts and the same shape", () => {
  assert.deepEqual(Object.keys(calculatorCopy.zh).sort(), Object.keys(calculatorCopy.en).sort());
  for (const lang of ["zh", "en"]) {
    for (const key of FIELD_ORDER) {
      for (const part of ["label", "unit", "slider"]) {
        assert.equal(typeof calculatorCopy[lang].fields[key][part], "string");
        assert.ok(calculatorCopy[lang].fields[key][part].length > 0);
      }
    }
  }
  const text = collectPublicText();
  assert.match(text, /1,000 直米/);
  assert.equal(text.includes("延米"), false);
  assert.equal(text.includes("質米"), false);
  assert.match(text, /FOB 上海/);
  assert.match(text, /USD 10–15/);
  assert.match(text, /3,000–5,000/);
  assert.match(text, /30%/);
  assert.match(text, /35%/);
  assert.match(text, /示範／虛構數字/);
  assert.match(text, /Demo with fictional numbers/);
  assert.equal(calculatorCopy.zh.intro, "虛構的美式純紙牆紙第一櫃：FOB 上海每卷 USD 10–15，MOQ 1,000 直米（約 122 卷），20 呎櫃估算 3,000–5,000 卷，訂金 30%，餘款出貨前付清。");
  assert.equal(calculatorCopy.en.intro, "Fictional first container of American-style pure-paper wallpaper: FOB Shanghai USD 10–15 per roll, MOQ 1,000 linear meters (直米, about 122 rolls), a 20-foot container estimated at 3,000–5,000 rolls, 30% deposit, balance before shipment.");
  assert.equal(text.includes("售價取這個區間的中間"), false);
  assert.equal(text.includes("middle of that band"), false);
  assert.equal(calculatorCopy.zh.fields.freight.label, "出口前費用（內陸運輸、報關、港雜）");
  assert.equal(calculatorCopy.zh.freightLabel, "出口前費用");
  assert.equal(calculatorCopy.zh.barParts.freight, "出口前費用");
  assert.equal(calculatorCopy.en.fields.freight.label, "Pre-export costs (inland haulage, customs, port charges)");
  assert.equal(calculatorCopy.en.freightLabel, "Pre-export costs");
  assert.equal(calculatorCopy.en.barParts.freight, "Pre-export costs");
  assert.equal(text.includes("運費"), false);
  assert.equal(/\bFreight\b/.test(text), false);
  assert.equal(/ocean freight/i.test(text), false);
  assert.equal(calculatorCopy.zh.floorWarning, "低於本示範設定的 35%");
  assert.equal(calculatorCopy.en.floorWarning, "Below the 35% set for this demo");
  const pasted = formatResultText(DEFAULT_INPUTS, defaults(), "zh");
  assert.match(pasted, /出口前費用（內陸運輸、報關、港雜）/);
  assert.match(pasted, /USD 18,000/);
  assert.match(pasted, /36\.00%/);
  assert.equal(pasted.includes("運費"), false);
  assert.equal(pasted.includes("http"), false);
  const pastedEn = formatResultText(DEFAULT_INPUTS, defaults(), "en");
  assert.match(pastedEn, /Pre-export costs \(inland haulage, customs, port charges\)/);
  assert.equal(/\bFreight\b/.test(pastedEn), false);
  assert.equal(formatResultText({ ...DEFAULT_INPUTS, sellingPrice: -2 }, calculateProfit({ ...DEFAULT_INPUTS, sellingPrice: -2 }), "en").includes("Unknown"), true);
  const banned = [
    /\bAI\b/,
    /人工智能|人工智慧/,
    /中間層/,
    /\bA2A\b/,
    /\bCDD\b/,
    /\bROI\b/i,
    /老闆|\bboss\b|\bowner\b/i,
    /延米|質米/,
    /github\.com/i,
  ];
  for (const pattern of banned) assert.equal(pattern.test(text), false, String(pattern));
});

test("calculator modules do not call the network", () => {
  const sources = [
    "src/data/profitCalculator.js",
    "src/components/ProfitCalculator.jsx",
  ].map((path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
  const joined = sources.join("\n");
  assert.equal(/\bfetch\s*\(/.test(joined), false);
  assert.equal(/XMLHttpRequest|WebSocket|sendBeacon/.test(joined), false);
});

test("the one-line judgment follows the numbers, never asserts a floor, and keeps blanks unknown", () => {
  const pick = (overrides) => profitJudgment(calculateProfit({ ...DEFAULT_INPUTS, ...overrides }));
  assert.equal(pick({}), "c1");
  assert.equal(pick({ sellingPrice: 12 }), "c2");
  assert.equal(pick({ depositPct: 20 }), "c3");
  assert.equal(pick({ depositPct: 100 }), "c4");
  assert.equal(pick({ purchaseCost: "" }), "c5");
  assert.equal(pick({ depositPct: "" }), "c5");
  assert.equal(pick({ quantity: 0 }), null);

  const zh = judgmentText("c1", "zh", defaults());
  assert.equal(zh, "毛利還撐得住，但出貨前要先墊 17,000。我會先談訂金，再談價格。");
  assert.match(judgmentText("c1", "en", defaults()), /USD 17,000/);

  for (const lang of ["zh", "en"]) {
    assert.deepEqual(Object.keys(calculatorCopy[lang].judgments), ["c1", "c2", "c3", "c4", "c5"]);
    for (const line of Object.values(calculatorCopy[lang].judgments)) {
      assert.equal(/底線|floor|ROI|AI|老闆/i.test(line), false, line);
    }
  }
  assert.equal(calculatorCopy.zh.judgmentLabel, "Paul 會先看");
  assert.equal(calculatorCopy.zh.judgmentBadge, "Paul 的經驗判斷");
  assert.equal(calculatorCopy.en.judgmentBadge, "Paul's experience-based judgment");
});
