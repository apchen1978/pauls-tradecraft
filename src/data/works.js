// 作品資料：全部來自 WORKLOG.md 與工作區實際產出。
// 公開連結規則（evidence-first）：
//   - 只有從 GitHub/線上實測確認的公開 URL 才填入 link。
//   - 未驗證者維持 null，UI 顯示「PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED」。
//   - 禁止猜測 URL、禁止把 private repo 當作公開證據。
// Case Study schema（P1.5）：
//   - case.stage 只能是：Prototype / Simulation / Shadow Pilot / Technical Validation（依證據選）
//   - 禁止虛構 ROI / conversion / customer result / usage metrics / commercial outcome。
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
    case: {
      stage: "Shadow Pilot",
      problem: {
        zh: "窗簾軟裝銷售的 Pilot 成果缺乏單頁可交付的證據形式，難以對客戶快速說明。",
        en: "Pilot results lacked a one-page, client-ready evidence format for quick explanation.",
      },
      approach: {
        zh: "把 Pilot 的流程、追蹤與結果濃縮成單頁 A4 案例簡報，搭配公開 demo 畫面。",
        en: "Distilled the pilot flow, tracking, and results into a one-page A4 brief with a public demo.",
      },
      tools: {
        zh: "AI 協作（Codex/DSH）· Excel · GitHub Pages",
        en: "AI collaboration (Codex/DSH) · Excel · GitHub Pages",
      },
      result: {
        zh: "已交付單頁案例簡報；公開 repo + GitHub Pages live demo 上線。無商業成果數據（UNKNOWN）。",
        en: "One-page brief delivered; public repo and GitHub Pages live demo are live. No commercial outcome data (UNKNOWN).",
      },
      evidence: {
        zh: "公開 demo：https://apchen1978.github.io/curtain-sales-pilot-demo/",
        en: "Public demo: https://apchen1978.github.io/curtain-sales-pilot-demo/",
      },
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
    case: {
      stage: "Technical Validation",
      problem: {
        zh: "窗簾軟裝銷售的商機、報價、跟進流程分散在多處，無法單一追蹤。",
        en: "Lead, quote, and follow-up flows were scattered, with no single tracking view.",
      },
      approach: {
        zh: "建單一 Excel 追蹤器，覆蓋從商機到跟進的完整流程；以 3 期模擬驗證資料模型。",
        en: "Built a single Excel tracker covering lead-to-follow-up, validated through three simulation rounds.",
      },
      tools: {
        zh: "AI 協作（Codex/DSH）· Excel · 零依賴驗證腳本",
        en: "AI collaboration (Codex/DSH) · Excel · dependency-free verification scripts",
      },
      result: {
        zh: "23/23 零依賴驗證通過；3 期模擬（基礎/資料模型/報價版本）完成，附 inspect 證據檔。未上線生產（UNKNOWN）。",
        en: "23/23 dependency-free checks pass; three simulation rounds complete with inspect evidence files. Not in production (UNKNOWN).",
      },
      evidence: {
        zh: "工作區 outputs/ 含 3 組 xlsx + inspect.ndjson；RUNME.md + verify 23/23。無公開 URL。",
        en: "Workspace outputs/ contains 3 xlsx + inspect.ndjson pairs; RUNME.md + verify 23/23. No public URL.",
      },
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
    case: {
      stage: "Simulation",
      problem: {
        zh: "追蹤器的資料模型與報價版本機制未經真實資料驗證。",
        en: "The tracker's data model and quote-versioning mechanism were unvalidated against real data.",
      },
      approach: {
        zh: "三輪循序模擬：001 基礎流程 → 002 資料模型修正 → 003 報價版本化。",
        en: "Three sequential rounds: 001 baseline flow, 002 data model fixes, 003 quote versioning.",
      },
      tools: {
        zh: "AI 協作（Codex/DSH）· 模擬資料（SIMULATION 層級）· inspect 工具",
        en: "AI collaboration (Codex/DSH) · simulated data (SIMULATION tier) · inspect tooling",
      },
      result: {
        zh: "三輪模擬完成，每輪附 .inspect.ndjson 證據；23/23 驗證通過。屬模擬，非真實業務結果（UNKNOWN）。",
        en: "Three rounds complete, each with .inspect.ndjson evidence; 23/23 checks pass. Simulation only, not real business results (UNKNOWN).",
      },
      evidence: {
        zh: "工作區 outputs/ 的 pilot-001/002/003 xlsx + inspect.ndjson。無公開 URL。",
        en: "Workspace outputs/ pilot-001/002/003 xlsx + inspect.ndjson. No public URL.",
      },
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
    case: {
      stage: "Technical Validation",
      problem: {
        zh: "簡報製作耗時且版本難控，缺乏可重跑的產出管線。",
        en: "Deck production was slow and hard to version, with no rerunnable output pipeline.",
      },
      approach: {
        zh: "以 spec JSON 定義內容，經由 PPTX 管線產出並轉 PDF；三版迭代改善編輯系統。",
        en: "Defined content in spec JSON, generated PPTX via pipeline, rendered PDF; three iterations of the editorial system.",
      },
      tools: {
        zh: "ppt-toolkit（pptxgenjs）· spec JSON 管線 · AI 協作",
        en: "ppt-toolkit (pptxgenjs) · spec JSON pipeline · AI collaboration",
      },
      result: {
        zh: "三版簡報產出完成（含 PDF 渲染）。屬工具驗證，無觀眾/業務數據（UNKNOWN）。",
        en: "Three deck versions produced, with PDF rendering. Tool validation; no audience/business data (UNKNOWN).",
      },
      evidence: {
        zh: "ppt-toolkit/ 內含 spec-dsh-guide.json、make-pptx.mjs、demo 簡報與 PDF。無公開 URL。",
        en: "ppt-toolkit/ contains spec-dsh-guide.json, make-pptx.mjs, demo deck, and PDF. No public URL.",
      },
    },
  },
  {
    id: "game",
    icon: "game",
    span: "col-span-1",
    verified: true,
    link: "https://apchen1978.github.io/signal-rift-typing-demo/",
    linkLabel: "Play the demo",
    zh: {
      title: "小麥遊戲世界 · 打字挑戰",
      desc: "SIGNAL//RIFT 內建英文打字挑戰：七大功能 + Adaptive Learning Shadow Mode，可即時遊玩。",
      tag: "遊戲 · 學習",
    },
    en: {
      title: "Lil Matt's Typing Challenge",
      desc: "English typing challenge inside SIGNAL//RIFT: seven features plus an Adaptive Learning Shadow Mode, playable live.",
      tag: "Game · Learning",
    },
    case: {
      stage: "Shadow Pilot",
      problem: {
        zh: "打字練習缺乏即時回饋與個人化學習機制，且中文輸入法環境導致輸入錯誤。",
        en: "Typing practice lacked real-time feedback and personalization, and the Chinese IME environment caused input errors.",
      },
      approach: {
        zh: "落地七大功能：音效、Live 指標、TTS 發音、IME 全紅 bug 根治、小知識卡、流暢度修復、Adaptive Learning Shadow Mode。",
        en: "Shipped seven features: sound, live metrics, TTS, IME red-text fix, fun facts, smoothness, and an Adaptive Learning Shadow Mode.",
      },
      tools: {
        zh: "Vite + TypeScript + Canvas 2D · WebAudio · speechSynthesis（零後端、零依賴）",
        en: "Vite + TypeScript + Canvas 2D · WebAudio · speechSynthesis (no backend, zero runtime deps)",
      },
      result: {
        zh: "Shadow Mode 確定性驗證通過（seeded data → 穩定弱點排名）；headless Chrome 四路輸入測試通過。屬技術驗證/Shadow Pilot，無真實使用者數據（UNKNOWN）。",
        en: "Shadow Mode determinism verified on seeded data; four input paths tested in headless Chrome. Technical validation / shadow pilot; no real usage data (UNKNOWN).",
      },
      evidence: {
        zh: "公開 demo：https://apchen1978.github.io/signal-rift-typing-demo/",
        en: "Public demo: https://apchen1978.github.io/signal-rift-typing-demo/",
      },
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
    case: {
      stage: "Technical Validation",
      problem: {
        zh: "個人收支追蹤的資料模型與 UI 形式未定，先以多個 vanilla 方案比較。",
        en: "Personal expense data model and UI form were undecided; compared multiple vanilla approaches.",
      },
      approach: {
        zh: "建立 3 檔 vanilla 實驗專案，各自驗證資料處理與呈現。",
        en: "Built three vanilla experiment projects, each validating data handling and presentation.",
      },
      tools: {
        zh: "vanilla HTML/JS · AI 協作 · 驗證腳本",
        en: "Vanilla HTML/JS · AI collaboration · verification scripts",
      },
      result: {
        zh: "16/16 驗證通過。private repo，未公開；無使用者數據（UNKNOWN）。",
        en: "16/16 checks pass. Private repo, not public; no user data (UNKNOWN).",
      },
      evidence: {
        zh: "WORKLOG 記錄；repo 為 PRIVATE，無公開 URL。",
        en: "Recorded in WORKLOG; repo is PRIVATE, no public URL.",
      },
    },
  },
];
