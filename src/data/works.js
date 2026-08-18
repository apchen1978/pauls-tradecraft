// 作品資料：全部來自 WORKLOG.md 與工作區實際產出。
// 公開連結規則（evidence-first）：
//   - 只有從 GitHub/線上實測確認的公開 URL 才填入 link。
//   - 未驗證者維持 null，UI 顯示「PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED」。
//   - 禁止猜測 URL、禁止把 private repo 當作公開證據。
export const works = [
  {
    id: "casebrief",
    image: "/images/case-brief.png",
    imageAlt: "銷售 Pilot 案例簡報",
    span: "col-span-1",
    verified: true,
    link: "https://apchen1978.github.io/curtain-sales-pilot-demo/",
    linkLabel: "Live demo",
    zh: {
      title: "銷售 Pilot 案例簡報",
      desc: "單頁 A4 案例簡報，把 Pilot 成果濃縮成可對客戶交付的一頁證據。",
      tag: "案例簡報 · PDF",
    },
    en: {
      title: "Sales Pilot Case Brief",
      desc: "A one-page A4 case brief distilling the pilot into a client-ready page of evidence.",
      tag: "Case brief · PDF",
    },
  },
  {
    id: "tracker",
    image: "/images/tracker-dashboard.png",
    imageAlt: "窗簾軟裝 Pilot 追蹤器儀表板",
    span: "col-span-2",
    verified: true,
    link: null,
    zh: {
      title: "窗簾軟裝 Pilot 追蹤器",
      desc: "從商機、報價到跟進的單一追蹤器。3 期模擬 + 23/23 零依賴驗證通過，產出含 inspect 證據檔。",
      tag: "商務工具 · Excel",
    },
    en: {
      title: "Curtain Soft-Furnishing Pilot Tracker",
      desc: "One tracker from lead to quote to follow-up. Three simulation rounds, 23/23 dependency-free checks pass, with inspect evidence files.",
      tag: "Business tool · Excel",
    },
  },
  {
    id: "simulations",
    image: "/images/tracker-timeline.png",
    imageAlt: "Pilot 模擬時間軸",
    span: "col-span-1",
    verified: true,
    link: null,
    zh: {
      title: "Pilot 模擬套件",
      desc: "三輪模擬：基礎、資料模型、報價版本，每輪附 inspect 證據。",
      tag: "模擬 · 驗證",
    },
    en: {
      title: "Pilot Simulation Suite",
      desc: "Three rounds: baseline, data model, quote versioning. Each round ships with inspect evidence.",
      tag: "Simulation · Verification",
    },
  },
  {
    id: "deck",
    icon: "presentation",
    span: "col-span-1",
    verified: true,
    link: null,
    zh: {
      title: "DSH 快速指南簡報",
      desc: "spec JSON → PPTX → PDF 簡報管線，三版迭代，McKinsey/a16z 編輯系統。",
      tag: "簡報管線",
    },
    en: {
      title: "DSH Guide Deck",
      desc: "A spec-to-PPTX-to-PDF deck pipeline across three iterations with an editorial design system.",
      tag: "Deck pipeline",
    },
  },
  {
    id: "game",
    icon: "game",
    span: "col-span-1",
    verified: true,
    link: null,
    zh: {
      title: "Signal-rift 小麥遊戲",
      desc: "打字練習遊戲：七大功能 + Adaptive Learning Shadow Mode，7 commits 已推送。",
      tag: "遊戲 · 學習",
    },
    en: {
      title: "Signal-rift Typing Game",
      desc: "Typing practice game: seven features plus an Adaptive Learning Shadow Mode, seven commits pushed.",
      tag: "Game · Learning",
    },
  },
  {
    id: "expense",
    icon: "receipt",
    span: "col-span-3",
    verified: true,
    link: null,
    zh: {
      title: "Expense Tracker 收支實驗",
      desc: "3 檔 vanilla 實驗專案，16/16 驗證通過，private repo。",
      tag: "實驗 · 財務",
    },
    en: {
      title: "Expense Tracker Experiments",
      desc: "Three vanilla experiment projects, 16/16 checks pass, private repository.",
      tag: "Experiments · Finance",
    },
  },
];
