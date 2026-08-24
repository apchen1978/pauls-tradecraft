// Pilot evidence page — data rendered from curtain-pilot-tracker-evidence (main).
// All values are copied from the repo's .inspect.ndjson files, README, and simulation-004 docs.

const BASE = "https://github.com/apchen1978/curtain-pilot-tracker-evidence";
const RAW = "https://raw.githubusercontent.com/apchen1978/curtain-pilot-tracker-evidence/main";

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

/* ---------- 01 Tracker sheets ---------- */
const sheets = [
  {
    name: "00_使用說明",
    sub: "Guide & Make field contract",
    rows: "34 列 × 8 欄",
    points: [
      "目的：先接住網站名單，再建立跟進、報價與成交的共同資料底座",
      "上線順序：匯入 Google Sheets → Make Webhook → 寫入 Leads → 24h 通知 → 五情境驗收",
      "Make 欄位契約（lead_id / created_at / source_platform / customer_type …）",
      "未連接 Google、Make、LINE 或 Email；上線前刪除 DEMO 資料",
    ],
  },
  {
    name: "Leads",
    sub: "22 欄（A–V）網站名單母表",
    rows: "2 筆 DEMO",
    points: [
      "DEMO-20260814-001 · 王小美（自宅需求／預約丈量）· new_lead · 意向高",
      "DEMO-20260814-002 · 林設計師（設計師合作／傳照片初估）· contacted · 意向中",
      "缺 LINE／照片不報錯；未知值標「暫時無法」",
    ],
  },
  {
    name: "Follow-ups",
    sub: "每次跟進保留一筆",
    rows: "1 筆 DEMO",
    points: [
      "林設計師 · 電話：確認需要全室初估 → 下週補照片與尺寸",
    ],
  },
  {
    name: "Quotes",
    sub: "報價／成交／安裝追蹤",
    rows: "1 筆 DEMO",
    points: [
      "王小美 · 遮光布簾 · NT$48,000 · 未確認",
      "欄位含 won_amount / 安裝日期 / 毛利率估計",
    ],
  },
  {
    name: "Dashboard",
    sub: "每週 KPI 漏斗（10 個公式）",
    rows: "COUNTIF 驅動",
    points: [
      "全部名單 2 · 新名單 1 · 已聯繫 1 · 已約丈量 0 · 已報價 0 · 已成交 0 · 未排程跟進 0",
      "意向分布：高 1 · 中 1 · 低 0",
      "公式：=COUNTIF('Leads'!$N$4:$N$203, \"quoted\") 等",
    ],
  },
];

/* ---------- 02 Simulation rounds ---------- */
const rounds = [
  {
    no: "001",
    title: "基礎流程",
    en: "Baseline flow",
    lead: "SIM-PILOT-001 · 王先生 · 新成屋全室 · 14 天決策窗口",
    score: "86/100",
    outcome: "已成交 NT$104,800",
    margin: "毛利率估計 0.38",
    sheets: "7 個工作表",
    steps: [
      "建立 Lead（虛擬 LINE）→ AI Qualification",
      "Lead Score 86：預算 25 + 決策期 20 + 需求完整 20 + 可丈量 15 + 可聯繫 6",
      "第一次 Follow-up → 客戶提供平面圖與照片",
      "虛擬丈量：客廳 2 窗 360×240、主臥 1 窗 220×240、次臥 1 窗 180×240（正式案仍需現場複測）",
      "初步報價 NT$104,800 → 第二次 Follow-up → 成交",
      "預定安裝 2026-09-05",
    ],
  },
  {
    no: "002",
    title: "資料模型修正",
    en: "Data model fixes",
    lead: "SIM-PILOT-002 · 價格探索型詢問 · 「全室窗簾大概多少錢？」",
    score: "15 → 30",
    outcome: "nurture 培育（未報價）",
    margin: "P4/Low → P3",
    sheets: "9 個工作表",
    steps: [
      "僅來源可聯繫 10 + 全室需求 5 = 初始 15/100（P4）",
      "可培育，不可報價，不可安排丈量",
      "72h 未回覆 → 轉 nurture，不判定 lost",
      "Data Model Issues - Backlog：P0 分數未結構化／P0 Follow-up 事件欄位缺／P1 nurture 定義／P1 decision_due_date／P1 丈量 verified 旗標／P1 報價版本 → 交由 #003 驗證",
    ],
  },
  {
    no: "003",
    title: "報價版本化",
    en: "Quote versioning",
    lead: "SIM-PILOT-003 · 陳小姐 · 新成屋兩空間",
    score: "78 → 70",
    outcome: "V2 NT$104,800 待確認",
    margin: "折扣需人工核准",
    sheets: "11 個工作表",
    steps: [
      "V1 NT$128,800（客廳雙層簾＋主臥遮光布簾）",
      "價格異議：「希望控制在 NT$105,000 內」",
      "人工決策：先調整產品範圍，不自行提供折扣",
      "V2 NT$104,800（客廳改手拉雙層簾）· 較 V1 −NT$24,000",
      "Quote Version Log：版本差額可追溯；再降價需人工核准",
    ],
  },
  {
    no: "004",
    title: "低資訊虛擬 Lead 稽核",
    en: "Low-info lead audit",
    lead: "SIM-PILOT-004 · 陳小姐 · 新莊 · 預算 NT$60,000–80,000 · 30 天內完成",
    score: "UNKNOWN",
    outcome: "不報價（守護 unknown）",
    margin: "Priority 高（INFERRED）",
    sheets: "5 個可稽核產物",
    steps: [
      "SCORE = UNKNOWN：專案無結構化評分模型，不給分不捏造",
      "Quote decision = NOT ISSUED：無尺寸／照片／格局、無定價基準、需版本化＋人工核准、客戶預算≠報價依據",
      "2 筆 Follow-up 草稿：PLANNED — NOT SENT（未發送任何訊息）",
      "4 條 Backlog 提案：P1 定價基準、P1 decision_due_date、P2 inquiry_type 列舉、P2 未知值表示法",
      "Based on Read-Only Audit（2026-08-18）· 零外部副作用",
    ],
  },
];

/* ---------- 03 Verification checks ---------- */
const checks = [
  { ok: true, label: "追蹤器結構", detail: "00_使用說明／Leads／Follow-ups／Quotes／Dashboard 全表檢查" },
  { ok: true, label: "Lead → Follow-up 管線", detail: "SIM-PILOT-001/002 跨表交叉引用（含 formula 檢查）" },
  { ok: true, label: "資料模型修正", detail: "Pilot #002：nurture 狀態、72h 規則、Backlog 對應欄位" },
  { ok: true, label: "報價版本化", detail: "Pilot #003：Quote Version Log 7 表 match + V1/V2 差額" },
  { ok: true, label: "公式錯誤掃描", detail: "全部工作簿：#REF! / #DIV/0! / #VALUE! / #NAME? / #N/A = 0" },
];

/* ---------- 04 Evidence files ---------- */
const files = [
  { name: "curtain-soft-furnishing-pilot-tracker.xlsx", sub: "追蹤器主檔（5 sheets）", href: `${BASE}/blob/main/outputs/curtain-soft-furnishing-pilot-tracker.xlsx` },
  { name: "…pilot-001-simulation.xlsx", sub: "基礎流程模擬（7 sheets）＋ .inspect.ndjson", href: `${BASE}/tree/main/outputs` },
  { name: "…pilot-002-simulation.xlsx", sub: "資料模型修正（9 sheets）＋ .inspect.ndjson", href: `${BASE}/tree/main/outputs` },
  { name: "…pilot-003-quote-version-simulation.xlsx", sub: "報價版本化（11 sheets）＋ .inspect.ndjson", href: `${BASE}/tree/main/outputs` },
  { name: "simulation-004/", sub: "lead-004-simulation.md · data.json · leads.csv · followups-plan.csv · simulate_pilot_004.mjs", href: `${BASE}/tree/main/simulation-004` },
  { name: "work/", sub: "8 個零依賴 Node 腳本：build / simulate / inspect / verify", href: `${BASE}/tree/main/work` },
];

/* ---------- Render ---------- */
function renderSheets() {
  const host = document.getElementById("sheets");
  sheets.forEach((s) => {
    const card = el("article", "sheet");
    card.appendChild(el("h3", null, s.name));
    card.appendChild(el("p", "meta", `${s.sub} · ${s.rows}`));
    const ul = el("ul");
    s.points.forEach((p) => ul.appendChild(el("li", null, p)));
    card.appendChild(ul);
    host.appendChild(card);
  });
}

function renderRounds() {
  const host = document.getElementById("rounds");
  rounds.forEach((r) => {
    const card = el("article", "round");
    card.appendChild(el("div", "rhead", `Pilot #${r.no}`));
    card.appendChild(el("h3", null, r.title));
    card.appendChild(el("p", "en", r.en));
    card.appendChild(el("p", "lead", r.lead));
    const chips = el("div", "chips");
    chips.appendChild(el("span", "chip score", `Score ${r.score}`));
    chips.appendChild(el("span", "chip out", r.outcome));
    chips.appendChild(el("span", "chip", r.margin));
    chips.appendChild(el("span", "chip", r.sheets));
    card.appendChild(chips);
    const ul = el("ul");
    r.steps.forEach((s) => ul.appendChild(el("li", null, s)));
    card.appendChild(ul);
    host.appendChild(card);
  });
}

function renderChecks() {
  const host = document.getElementById("checks");
  checks.forEach((c) => {
    const row = el("div", "check");
    row.appendChild(el("span", c.ok ? "mark ok" : "mark", c.ok ? "✓" : "✗"));
    const body = el("div", "cbody");
    body.appendChild(el("b", null, c.label));
    body.appendChild(el("span", null, c.detail));
    row.appendChild(body);
    host.appendChild(row);
  });
}

function renderFiles() {
  const host = document.getElementById("files");
  files.forEach((f) => {
    const a = el("a", "file", null);
    a.href = f.href;
    a.target = "_blank";
    a.rel = "noopener";
    const nm = el("span", "fname", f.name);
    const sb = el("span", "fsub", f.sub);
    a.append(nm, sb);
    host.appendChild(a);
  });
}

renderSheets();
renderRounds();
renderChecks();
renderFiles();
