// Compact margin taste for the Trade Profit Navigator card.
//
// Field rules follow the full navigator (navigator.js parseInput): a blank,
// non-numeric, or negative value stays unknown and is never coerced to zero.
// An explicit zero is a real entry.
//
// Economics here are the short version a visitor can try on the page:
// revenue, purchase cost, pre-export costs, gross profit, gross margin, and
// break-even price. The case is FOB Shanghai, so ocean freight is the buyer's
// cost and is not an input. The stored field key is still `freight`; every
// public label says pre-export costs (inland haulage, export customs, port
// charges). Funding cost, duty, and the lever scenarios stay in the full tool.
//
// Defaults are the fictional US pure-paper wallpaper first container.
// Selling price USD 12.50 is the midpoint of FOB Shanghai USD 10–15 per roll.
// Quantity 4,000 is the midpoint of the 3,000–5,000 roll 20-foot estimate.
// Purchase USD 7.50 per roll and pre-export costs USD 2,000 per order are
// fictional assumptions chosen so gross margin is 36%, just above the 35%
// quote-margin floor. One step down on the selling-price slider (12.50 → 12)
// crosses that floor. Deposit 30% matches the case payment line and does not
// enter the margin.

export const MARGIN_FLOOR = 0.35;

export const DEFAULT_INPUTS = Object.freeze({
  sellingPrice: 12.5,
  purchaseCost: 7.5,
  quantity: 4000,
  freight: 2000,
  depositPct: 30,
});

export const FIELD_ORDER = Object.freeze([
  "sellingPrice",
  "purchaseCost",
  "quantity",
  "freight",
  "depositPct",
]);

export const FIELD_RANGES = Object.freeze({
  sellingPrice: { min: 0, max: 30, step: 0.5 },
  purchaseCost: { min: 0, max: 30, step: 0.5 },
  quantity: { min: 0, max: 6000, step: 50 },
  freight: { min: 0, max: 20000, step: 100 },
  depositPct: { min: 0, max: 100, step: 1 },
});

const ECONOMICS_FIELDS = ["sellingPrice", "purchaseCost", "quantity", "freight"];

export function createInputs() {
  return { ...DEFAULT_INPUTS };
}

export function resetInputs() {
  return createInputs();
}

function asNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const text = value.trim();
    if (text === "") return null;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function knownNonNegative(value) {
  const parsed = asNumber(value);
  if (parsed === null || parsed < 0) return null;
  return parsed;
}

function emptyResult(partial) {
  return {
    status: "invalid",
    ...partial,
    revenue: null,
    goodsCost: null,
    totalCost: null,
    grossProfit: null,
    grossMargin: null,
    breakEvenPrice: null,
    belowFloor: false,
    depositCash: null,
    balanceBeforeShipment: null,
    cashBeforeShipment: null,
    bar: { basis: "empty", parts: emptyParts() },
  };
}

function emptyParts() {
  return [
    { key: "cost", amount: 0, share: 0 },
    { key: "freight", amount: 0, share: 0 },
    { key: "profit", amount: 0, share: 0 },
  ];
}

function buildBar({ revenue, goodsCost, freight, grossProfit, totalCost }) {
  if (revenue > 0 && grossProfit >= 0) {
    return {
      basis: "revenue",
      parts: [
        { key: "cost", amount: goodsCost, share: goodsCost / revenue },
        { key: "freight", amount: freight, share: freight / revenue },
        { key: "profit", amount: grossProfit, share: grossProfit / revenue },
      ],
    };
  }
  if (totalCost > 0) {
    return {
      basis: "cost",
      parts: [
        { key: "cost", amount: goodsCost, share: goodsCost / totalCost },
        { key: "freight", amount: freight, share: freight / totalCost },
        { key: "profit", amount: Math.min(0, grossProfit), share: 0 },
      ],
    };
  }
  return { basis: "empty", parts: emptyParts() };
}

export function calculateProfit(input = {}) {
  const sellingPrice = knownNonNegative(input.sellingPrice);
  const purchaseCost = knownNonNegative(input.purchaseCost);
  const quantity = knownNonNegative(input.quantity);
  const freight = knownNonNegative(input.freight);
  const depositRaw = asNumber(input.depositPct);
  const depositPct = depositRaw !== null && depositRaw >= 0 && depositRaw <= 100 ? depositRaw : null;
  const known = { sellingPrice, purchaseCost, quantity, freight, depositPct };

  if (ECONOMICS_FIELDS.some((field) => known[field] === null)) return emptyResult(known);

  const revenue = sellingPrice * quantity;
  const goodsCost = purchaseCost * quantity;
  const totalCost = goodsCost + freight;
  const grossProfit = revenue - totalCost;
  const grossMargin = revenue > 0 ? grossProfit / revenue : null;
  const breakEvenPrice = quantity > 0 ? totalCost / quantity : null;
  const belowFloor = grossMargin !== null && grossMargin < MARGIN_FLOOR;

  let depositCash = null;
  let balanceBeforeShipment = null;
  let cashBeforeShipment = null;
  if (depositPct !== null) {
    depositCash = revenue * (depositPct / 100);
    balanceBeforeShipment = revenue - depositCash;
    cashBeforeShipment = Math.max(0, totalCost - depositCash);
  }

  let status = "ok";
  if (quantity === 0) status = "zero-quantity";
  else if (revenue === 0) status = "zero-revenue";
  else if (grossProfit < 0) status = "loss";

  return {
    status,
    ...known,
    revenue,
    goodsCost,
    totalCost,
    grossProfit,
    grossMargin,
    breakEvenPrice,
    belowFloor,
    depositCash,
    balanceBeforeShipment,
    cashBeforeShipment,
    bar: buildBar({ revenue, goodsCost, freight, grossProfit, totalCost }),
  };
}

// Which one-line judgment sits under the result. Null means there is nothing
// honest to say yet (no quantity or no revenue), so no card is shown.
export function profitJudgment(result) {
  if (result.status === "invalid" || result.depositPct === null) return "c5";
  if (result.status === "zero-quantity" || result.status === "zero-revenue") return null;
  if (result.belowFloor) return "c2";
  if (result.cashBeforeShipment === 0) return "c4";
  if (result.depositPct < DEFAULT_INPUTS.depositPct) return "c3";
  return "c1";
}

export function judgmentText(key, lang, result) {
  const template = calculatorCopy[lang]?.judgments?.[key];
  if (!template) return null;
  const cash = Number.isFinite(result?.cashBeforeShipment)
    ? Math.round(result.cashBeforeShipment).toLocaleString("en-US")
    : "";
  return template.replace("{cash}", cash);
}

export function formatUsd(value) {
  if (!Number.isFinite(value)) return null;
  const negative = value < 0;
  const absolute = Math.abs(value);
  const digits = Math.abs(absolute - Math.round(absolute)) < 1e-6 ? 0 : 2;
  const body = absolute.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  });
  return `${negative ? "−" : ""}USD ${body}`;
}

export function formatPercent(ratio) {
  if (!Number.isFinite(ratio)) return null;
  const percent = Math.round(ratio * 10000) / 100;
  return `${percent.toFixed(2)}%`;
}

export function formatCount(value) {
  if (!Number.isFinite(value)) return null;
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export const calculatorEntry = {
  zh: {
    cta: "在這頁試算毛利",
    note: "示範／虛構數字。移動滑桿，就能看到有沒有低於本示範設定的 35%。",
  },
  en: {
    cta: "Try the margin on this page",
    note: "Demo with fictional numbers. Move a slider to see whether it falls below the 35% set for this demo.",
  },
};

const fields = {
  zh: {
    sellingPrice: { label: "每卷售價", unit: "USD／卷", slider: "每卷售價滑桿" },
    purchaseCost: { label: "每卷採購成本", unit: "USD／卷", slider: "每卷採購成本滑桿" },
    quantity: { label: "數量", unit: "卷", slider: "數量滑桿" },
    freight: { label: "出口前費用（內陸運輸、報關、港雜）", unit: "USD", slider: "出口前費用（內陸運輸、報關、港雜）滑桿" },
    depositPct: { label: "訂金", unit: "%", slider: "訂金比例滑桿" },
  },
  en: {
    sellingPrice: { label: "Selling price per roll", unit: "USD / roll", slider: "Selling price per roll slider" },
    purchaseCost: { label: "Purchase cost per roll", unit: "USD / roll", slider: "Purchase cost per roll slider" },
    quantity: { label: "Quantity", unit: "rolls", slider: "Quantity slider" },
    freight: { label: "Pre-export costs (inland haulage, customs, port charges)", unit: "USD", slider: "Pre-export costs (inland haulage, customs, port charges) slider" },
    depositPct: { label: "Deposit", unit: "%", slider: "Deposit slider" },
  },
};

export const calculatorCopy = {
  zh: {
    demoLabel: "示範／虛構數字",
    judgmentLabel: "Paul 會先看",
    judgmentBadge: "Paul 的經驗判斷",
    judgments: {
      c1: "毛利還撐得住，但出貨前要先墊 {cash}。我會先談訂金，再談價格。",
      c2: "價格一往下，毛利就薄。我會先確認買方是不是真的只能出這個價，再回頭看成本。",
      c3: "訂金收得少，錢就先從我這邊出去。我會先問買方訂金能不能提高。",
      c4: "訂金已經蓋過出貨前的支出，現金壓力小。接下來我看的是尾款有沒有保障。",
      c5: "這格還空著，我不會當成 0 去算。先把數字問清楚，再看毛利。",
    },
    title: "先試算這張單的毛利",
    intro: "虛構的美式純紙牆紙第一櫃：FOB 上海每卷 USD 10–15，MOQ 1,000 直米（約 122 卷），20 呎櫃估算 3,000–5,000 卷，訂金 30%，餘款出貨前付清。",
    scope: "空白或負數保持未知，不會當成零。",
    fields: fields.zh,
    profitLabel: "毛利",
    marginLabel: "毛利率",
    revenueLabel: "銷售收入",
    goodsLabel: "採購成本",
    freightLabel: "出口前費用",
    totalCostLabel: "總成本",
    breakEvenLabel: "每卷損益兩平價",
    depositCashLabel: "訂金金額",
    balanceLabel: "出貨前應付餘款",
    cashLabel: "出貨前仍需墊付的現金",
    depositNote: "訂金按售價計算。出貨前仍需墊付＝採購與出口前費用減去訂金，不低於零。餘款在出貨前付清。",
    floorWarning: "低於本示範設定的 35%",
    floorHold: "毛利仍在本示範設定的 35% 之上",
    marginUnknown: "毛利率無法計算",
    unknown: "未知",
    invalidNote: "空白、負數或無法辨識的數字保持未知，不會當成零。",
    zeroQuantityNote: "數量為零，每卷損益兩平價無法計算。",
    zeroRevenueNote: "收入為零，毛利率無法計算。",
    lossNote: "毛利為負。長條只分成採購與出口前費用。",
    emptyBar: "沒有金額可分成採購、出口前費用與毛利。",
    costBasisNote: "毛利不是正數，長條改以成本來分。",
    reset: "重設",
    copy: "複製試算結果",
    copied: "已複製",
    copyFailed: "這次沒有複製成功",
    fullTool: "打開完整的貿易利潤導航",
    barParts: { cost: "採購", freight: "出口前費用", profit: "毛利" },
  },
  en: {
    demoLabel: "Demo with fictional numbers",
    judgmentLabel: "What Paul looks at first",
    judgmentBadge: "Paul's experience-based judgment",
    judgments: {
      c1: "The margin still holds, but I have to put up USD {cash} before shipment. I'd talk deposit first, then price.",
      c2: "One step down on price and the margin gets thin. I'd first confirm the buyer really can't pay more, then look back at cost.",
      c3: "With a small deposit, the money leaves my side first. I'd first ask whether the buyer can raise the deposit.",
      c4: "The deposit already covers what goes out before shipment, so cash pressure is low. Next I'd check whether the balance is protected.",
      c5: "This field is still empty, and I won't treat it as 0. I'd get the number first, then look at the margin.",
    },
    title: "Try this order's margin",
    intro: "Fictional first container of American-style pure-paper wallpaper: FOB Shanghai USD 10–15 per roll, MOQ 1,000 linear meters (直米, about 122 rolls), a 20-foot container estimated at 3,000–5,000 rolls, 30% deposit, balance before shipment.",
    scope: "A blank or negative entry stays unknown and is never treated as zero.",
    fields: fields.en,
    profitLabel: "Gross profit",
    marginLabel: "Gross margin",
    revenueLabel: "Revenue",
    goodsLabel: "Purchase cost",
    freightLabel: "Pre-export costs",
    totalCostLabel: "Total cost",
    breakEvenLabel: "Break-even price per roll",
    depositCashLabel: "Deposit amount",
    balanceLabel: "Balance due before shipment",
    cashLabel: "Cash to fund before shipment",
    depositNote: "The deposit is a share of the selling value. Cash to fund before shipment = purchase and pre-export costs minus the deposit, and not below zero. The balance is due before shipment.",
    floorWarning: "Below the 35% set for this demo",
    floorHold: "Margin is still above the 35% set for this demo",
    marginUnknown: "Gross margin cannot be calculated",
    unknown: "Unknown",
    invalidNote: "A blank, negative, or unreadable number stays unknown and is never treated as zero.",
    zeroQuantityNote: "Quantity is zero, so the break-even price per roll cannot be calculated.",
    zeroRevenueNote: "Revenue is zero, so gross margin cannot be calculated.",
    lossNote: "Gross profit is negative. The bar shows purchase and pre-export costs only.",
    emptyBar: "There is no amount to split into purchase, pre-export costs, and profit.",
    costBasisNote: "Profit is not positive, so the bar is split by cost.",
    reset: "Reset",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Copy did not complete",
    fullTool: "Open the full Trade Profit Navigator",
    barParts: { cost: "Purchase", freight: "Pre-export costs", profit: "Profit" },
  },
};

function moneyOrUnknown(value, unknown) {
  return formatUsd(value) ?? unknown;
}

export function liveSummary(result, lang) {
  const copy = calculatorCopy[lang];
  if (!copy) return "";
  if (result.status === "invalid") return copy.invalidNote;
  const profit = moneyOrUnknown(result.grossProfit, copy.unknown);
  const margin = formatPercent(result.grossMargin) ?? copy.unknown;
  let floor = copy.floorHold;
  if (result.belowFloor) floor = copy.floorWarning;
  else if (result.grossMargin === null) floor = copy.marginUnknown;
  return lang === "zh"
    ? `毛利 ${profit}，毛利率 ${margin}。${floor}`
    : `Gross profit ${profit}, gross margin ${margin}. ${floor}`;
}

export function barLabel(result, lang) {
  const copy = calculatorCopy[lang];
  if (!copy || result.bar?.basis === "empty" || result.status === "invalid") return copy?.emptyBar ?? "";
  const parts = result.bar.parts
    .map((part) => `${copy.barParts[part.key]} ${moneyOrUnknown(part.amount, copy.unknown)}`)
    .join(lang === "zh" ? "、" : ", ");
  return lang === "zh" ? `成本結構：${parts}` : `Cost split: ${parts}`;
}

export function formatResultText(input, result, lang) {
  const copy = calculatorCopy[lang];
  const lines = [copy.demoLabel];
  for (const key of FIELD_ORDER) {
    const field = copy.fields[key];
    const raw = input[key];
    const parsed = asNumber(raw);
    let shown = copy.unknown;
    if (parsed !== null && parsed >= 0 && (key !== "depositPct" || parsed <= 100)) {
      shown = key === "quantity"
        ? `${formatCount(parsed)} ${field.unit}`
        : key === "depositPct"
          ? `${formatCount(parsed)}${field.unit}`
          : formatUsd(parsed);
    }
    lines.push(`${field.label}: ${shown}`);
  }
  lines.push("");
  const rows = [
    [copy.revenueLabel, result.revenue],
    [copy.totalCostLabel, result.totalCost],
    [copy.profitLabel, result.grossProfit],
  ];
  for (const [label, value] of rows) lines.push(`${label}: ${moneyOrUnknown(value, copy.unknown)}`);
  lines.push(`${copy.marginLabel}: ${formatPercent(result.grossMargin) ?? copy.unknown}`);
  lines.push(`${copy.breakEvenLabel}: ${moneyOrUnknown(result.breakEvenPrice, copy.unknown)}`);
  lines.push(`${copy.cashLabel}: ${moneyOrUnknown(result.cashBeforeShipment, copy.unknown)}`);
  lines.push("");
  lines.push(liveSummary(result, lang));
  lines.push(copy.scope);
  return lines.join("\n");
}

export function collectPublicText() {
  const chunks = [];
  const walk = (value) => {
    if (typeof value === "string") chunks.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(calculatorCopy);
  walk(calculatorEntry);
  return chunks.join("\n");
}
