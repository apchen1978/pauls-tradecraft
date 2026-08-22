// 作品資料：全部來自 WORKLOG.md 與工作區實際產出。
// 公開連結規則（evidence-first）：
//   - 只有從 GitHub/線上實測確認的公開 URL 才填入 link。
//   - 未驗證者維持 null，UI 顯示「PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED」。
//   - 禁止猜測 URL、禁止把 private repo 當作公開證據。
// Case Study schema（P1.5）：
//   - case.stage 只能是：Prototype / Simulation / Shadow Pilot / Technical Validation / Creative Build（依證據選）
//   - 禁止虛構 ROI / conversion / customer result / usage metrics / commercial outcome。
// 封面（cover）：真實截圖裁切 16:9，或品牌設計封面（Forest family）。
export const works = [
  {
    id: "mori-soft-furnishing-website",
    featuredRank: 4,
    cover: "/images/cover-mori-soft-furnishing.webp",
    imageAlt: { zh: "MORI 軟裝品牌網站首頁", en: "MORI soft-furnishing brand website homepage" },
    span: "col-span-3 md:col-span-2",
    icon: "briefcase",
    verified: true,
    link: "https://apchen1978.github.io/mori-soft-furnishing-demo/",
    linkLabel: { zh: "觀看品牌網站", en: "View brand site" },
    hidePendingLink: false,
    zh: {
      title: "MORI 軟裝品牌網站與工作流程",
      desc: "以真實室內素材建立窗簾與軟裝品牌網站，並整理諮詢、LINE 預留、表單狀態與交付檢查，支援行銷與銷售推進。",
      tag: "品牌網站 · 銷售輔助 · 軟裝工作流程",
      caseSummary: "軟裝網站的價值不在於「有沒有做」，而在於能否把品牌信任、諮詢入口、案例佐證與後續跟進，串成一條可推進的客戶路徑。",
    },
    en: {
      title: "MORI Soft-Furnishing Brand Website & Workflow",
      desc: "A curtain and soft-furnishing brand site built around interior imagery, with reusable consultation, LINE placeholder, form-state, and delivery checks that support marketing and sales progress.",
      tag: "Brand website · Sales enablement · Soft-furnishing workflow",
      caseSummary: "The value of a soft-furnishing website is not that it exists; it is whether it connects brand trust, consultation, proof of work, and follow-up into a customer path that can move forward.",
    },
    case: {
      stage: { zh: "創意建置", en: "Creative Build" },
      problem: {
        zh: "核心問題不是缺少一個網站，而是缺少把「審美偏好」轉譯成「可以開始對話的商業訊號」的結構。當品牌品味、服務說明、案例證明與聯絡入口彼此斷裂，訪客無法快速判斷是否適合自己，也沒有清楚的下一步；行銷投入便容易停在注意力，而不是進入可管理的諮詢、報價與跟進節奏。對第一版而言，真正要解的是客戶路徑，而不是頁面數量。",
        en: "The core issue is not the absence of a website, but the lack of a structure that translates aesthetic preference into a commercial signal worth acting on. When brand expression, service explanation, proof of work, and contact entry points are disconnected, visitors cannot quickly judge fit or see a clear next step; marketing attention can then stop short of manageable consultation, quoting, and follow-up. For a first version, the customer path matters more than the number of pages.",
      },
      approach: {
        zh: "策略上先做兩個取捨。第一，不以功能堆疊為目標，而是先打通最短可行客戶路徑：以室內情境建立第一信任，以服務與案例協助訪客定位需求，再以諮詢與 LINE 預留接到下一步。第二，不在缺少真實資料時虛構聯絡方式或收件服務；把未配置項目明確保留，避免把展示效果誤寫成已可運作的銷售系統。最後，將素材、前端表單狀態、GitHub 交付與上線檢查模組化，讓網站日後可接續報價與跟進工具。",
        en: "The strategy made two deliberate choices. First, it avoided feature accumulation and opened the shortest viable customer path: interior scenes establish initial trust, services and work help visitors locate their need, and consultation plus a LINE placeholder connect the next step. Second, it does not invent contact destinations or receiving services when real data is missing; unconfigured items remain explicit so a showcase is not misrepresented as a live sales system. Assets, front-end form states, GitHub delivery, and launch checks were then modularized so the site can later connect to quoting and follow-up tools.",
      },
      tools: {
        zh: "客戶路徑與內容架構 · 品牌視覺方向 · 響應式 HTML／CSS／JavaScript · 前端表單狀態 · 安全 LINE 預留 · GitHub 私有交付 · 手機版檢視",
        en: "Customer-path and content architecture · Brand visual direction · Responsive HTML/CSS/JavaScript · Front-end form states · Safe LINE placeholder · Private GitHub delivery · Mobile review",
      },
      result: {
        zh: "交付可本機檢視的 MORI 第一版品牌網站與可重複使用的軟裝網站建置 Skill。成品不只是首頁視覺，而是一個可移交的銷售輔助起點：客戶可在補齊 LINE、Email、表單收件與正式網域後，沿用既有結構推進諮詢與後續工具。已刻意把成果界定為「可部署、可延伸的基礎設施」；它不是對即時詢問、轉換或訂單成果的承諾。",
        en: "Delivered a locally viewable first MORI brand site and a reusable soft-furnishing site-building skill. The output is more than homepage visuals: it is a handoff-ready sales-enablement starting point. Once LINE, email, form receiving, and a formal domain are supplied, the same structure can support consultation and subsequent tools. The result is deliberately defined as deployable, extensible infrastructure—not a claim of immediate inquiries, conversion, or orders.",
      },
      evidence: {
        zh: "已驗證的是交付物與程式基本品質：私有 GitHub repo `apchen1978/great-soft-furnishing-website` commit `cb68c69`、`git diff --check`、`node --check script.js`，以及公開展示 https://apchen1978.github.io/mori-soft-furnishing-demo/（HTTP 200，線上實測）。尚未證明：實際 LINE、表單收件服務、自有網域、真實流量、詢問量、轉換率或訂單成果。此案例證明建置與交付能力，而非市場成效。",
        en: "What is verified is the delivered artifact and basic code quality: private GitHub repo `apchen1978/great-soft-furnishing-website` at commit `cb68c69`, plus `git diff --check`, `node --check script.js`, and the public showcase https://apchen1978.github.io/mori-soft-furnishing-demo/ (HTTP 200, verified live). What remains unproven is explicit: live LINE, form-receiving service, custom domain, real traffic, inquiry volume, conversion rate, or order outcome. This case evidences build and delivery capability—not market performance.",
      },
    },
  },
  {
    id: "trade-deal-desk",
    featuredRank: 1,
    related: {
      id: "payment-concentration",
      label: { zh: "下一步：這個決策會如何影響 7 天付款高峰？", en: "Next: how does this decision move your 7-day payment peak?" },
      note: {
        zh: "portfolio 層演示接合：以同一 Deal C 概念，串接決策 → 付款承諾影響。兩者皆為合成模擬。",
        en: "Portfolio-level demo bridge: same Deal C concept, linking decision to payment-commitment impact. Both are synthetic simulations.",
      },
    },
    cover: "/images/cover-trade-deal-desk.png",
    imageAlt: { zh: "AI Trade Deal Desk RFQ 決策工作區畫面", en: "AI Trade Deal Desk RFQ decision workspace" },
    span: "col-span-3 md:col-span-2",
    icon: "briefcase",
    verified: true,
    link: "https://apchen1978.github.io/ai-trade-deal-desk-demo/",
    linkLabel: { zh: "線上體驗", en: "Live Demo" },
    zh: {
      title: "AI Trade Deal Desk",
      desc: "把國際貿易 RFQ 判斷轉成 evidence-backed、human-in-the-loop 的商業決策工作流，並延伸到可追溯的執行前安全檢查。",
      tag: "貿易決策 · AI",
    },
    en: {
      title: "AI Trade Deal Desk",
      desc: "Turning trade RFQ judgment into an evidence-backed, human-in-the-loop commercial decision workflow, extended with traceable pre-execution safety checks.",
      tag: "Trade decision · AI",
    },
    case: {
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: "13/13 + 5/5 PASS",
      problem: {
        zh: "外貿 RFQ 常包含缺漏資訊、供應商條件衝突與不能只靠最低價格判斷的商業風險。",
        en: "Trade RFQs often arrive with incomplete information, conflicting supplier terms, and commercial risks that cannot be resolved by price alone.",
      },
      approach: {
        zh: "把實務貿易判斷拆成 deterministic decision rules、UNKNOWN handling、供應商比較、evidence checks 與 human approval boundary；再以 fixture-only gateway 檢驗授權、版本與執行回執如何保持一致。",
        en: "I translated practical trade judgment into deterministic decision rules, UNKNOWN handling, supplier comparison, evidence checks, and explicit human approval boundaries, then used a fixture-only gateway to test how authorization, version scope, and execution receipts remain aligned.",
      },
      tools: {
        zh: "React · Fixture-driven simulation · Deterministic decision engine · Local fixture gateway · Evidence-first workflow · Cross-agent validation",
        en: "React · Fixture-driven simulation · Deterministic decision engine · Local fixture gateway · Evidence-first workflow · Cross-agent validation",
      },
      result: {
        zh: "完成一套可操作的模擬 Trade Deal Desk，13 個商業案例全部通過預期決策驗證，並完成 Human-in-the-Loop decision snapshot；另完成只限本地模擬的 execution-safety fixture，驗證未授權動作不會跨出系統邊界。",
        en: "A working Trade Deal Desk simulation with 13 validated commercial decision cases and an auditable local human decision snapshot, plus a local-only execution-safety fixture that verifies unauthorized actions do not cross the system boundary.",
      },
      evidence: {
        zh: "13/13 fixture cases PASS · 5/5 negative tests PASS · Human override validated · Immutable local decision snapshot validated · Execution-safety fixture 9/9 PASS（授權、重放、payload／版本調包、回執完整性；無外部 Adapter）· Independent cross-agent audit PASS",
        en: "13/13 fixture cases PASS · 5/5 negative tests PASS · Human override validated · Immutable local decision snapshot validated · Execution-safety fixture 9/9 PASS (authorization, replay, payload/version swaps, receipt integrity; no external adapter) · Independent cross-agent audit PASS",
      },
    },
  },
  {
    id: "tracker",
    featuredRank: 3,
    cover: "/images/cover-tracker.png",
    imageAlt: { zh: "窗簾軟裝 Pilot 追蹤器儀表板", en: "Curtain soft-furnishing pilot tracker dashboard" },
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
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: "23/23 PASS",
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
        zh: "23/23 零依賴驗證通過；3 期模擬（基礎/資料模型/報價版本）完成，附 inspect 證據檔。",
        en: "23/23 dependency-free checks pass; three simulation rounds complete with inspect evidence files.",
      },
      evidence: {
        zh: "工作區 outputs/ 含 3 組 xlsx + inspect.ndjson；RUNME.md + verify 23/23。",
        en: "Workspace outputs/ contains 3 xlsx + inspect.ndjson pairs; RUNME.md + verify 23/23.",
      },
    },
  },
  {
    id: "casebrief",
    cover: "/images/cover-casebrief.png",
    imageAlt: { zh: "銷售 Pilot 案例簡報", en: "Sales Pilot case brief" },
    span: "col-span-1",
    verified: true,
    link: "https://apchen1978.github.io/curtain-sales-pilot-demo/",
    linkLabel: { zh: "線上體驗", en: "Live Demo" },
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
      stage: { zh: "影子試點", en: "Shadow Pilot" },
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
        zh: "已交付單頁案例簡報；公開 repo + GitHub Pages live demo 上線。",
        en: "One-page brief delivered; public repo and GitHub Pages live demo are live.",
      },
      evidence: {
        zh: "公開 demo：https://apchen1978.github.io/curtain-sales-pilot-demo/",
        en: "Public demo: https://apchen1978.github.io/curtain-sales-pilot-demo/",
      },
    },
  },
  {
    id: "simulations",
    cover: "/images/cover-simulations.webp",
    imageAlt: { zh: "Pilot 模擬時間軸", en: "Pilot simulation timeline" },
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
      stage: { zh: "模擬", en: "Simulation" },
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
        zh: "三輪模擬完成，每輪附 .inspect.ndjson 證據；23/23 驗證通過。",
        en: "Three rounds complete, each with .inspect.ndjson evidence; 23/23 checks pass.",
      },
      evidence: {
        zh: "工作區 outputs/ 的 pilot-001/002/003 xlsx + inspect.ndjson。",
        en: "Workspace outputs/ pilot-001/002/003 xlsx + inspect.ndjson.",
      },
    },
  },
  {
    id: "game",
    cover: "/images/cover-game.webp",
    imageAlt: { zh: "Lil Matt's Gaming World 遊戲", en: "Lil Matt's Gaming World game" },
    span: "col-span-1",
    verified: true,
    link: "https://apchen1978.github.io/signal-rift-typing-demo/",
    linkLabel: { zh: "立即玩", en: "Play Now" },
    zh: {
      title: "Lil Matt's Gaming World",
      desc: "Lil Matt's Gaming World 旗下兩個獨立遊戲：Jumpverse 平台冒險（Vector Wake 第一關）＋ WordForge 遊戲化英語學習（Typing Challenge 為首個模式）。",
      tag: "遊戲 · 英語學習",
    },
    en: {
      title: "Lil Matt's Gaming World",
      desc: "Two independent games under Lil Matt's Gaming World: Jumpverse platform adventure (Vector Wake = Level 1) + WordForge gamified English learning (Typing Challenge = current first mode).",
      tag: "Game · English Learning",
    },
    case: {
      stage: { zh: "影子試點", en: "Shadow Pilot" },
      problem: {
        zh: "英文打字練習往往枯燥、缺乏回饋，學習者很難持續；中文輸入法環境還常讓練習畫面誤判成「全部打錯」。",
        en: "English typing practice tends to be dry and feedback-light, so learners struggle to stay engaged; in Chinese IME environments, the screen can even misjudge every key as wrong.",
      },
      approach: {
        zh: "把打字練習包裝成真正好玩的遊戲：每打完一段立刻看到 WPM 與準確率、關卡循序漸進、用聲音與知識卡維持節奏。內建 32 篇分級挑戰與 92 筆美式英語字彙（定義/中文/例句），讓「練打字」同時「學英語」。",
        en: "Turned typing practice into a genuinely fun game: instant WPM and accuracy feedback after every passage, progressive challenge levels, and audio plus knowledge cards to keep the rhythm. It ships with 32 graded challenges and 92 authentic American English vocabulary notes (definition/translation/example), so practicing typing also means learning real English.",
      },
      tools: {
        zh: "Vite + TypeScript + Canvas 2D · WebAudio · speechSynthesis（零後端、零依賴）",
        en: "Vite + TypeScript + Canvas 2D · WebAudio · speechSynthesis (no backend, zero runtime deps)",
      },
      result: {
        zh: "經過多輪迭代測試與改進（IME 輸入修正、音效調整、版面優化），打字體驗穩定流暢；Shadow Mode 用可解釋的方式推薦練習方向。",
        en: "Iterative testing and improvement (IME input fixes, audio tuning, layout refinements) made the typing experience stable and smooth; the Shadow Mode offers explainable practice recommendations.",
      },
      evidence: {
        zh: "公開入口（Gaming World hub）：https://apchen1978.github.io/signal-rift-typing-demo/ ；Jumpverse：/jumpverse.html ；WordForge：/wordforge.html",
        en: "Public hub: https://apchen1978.github.io/signal-rift-typing-demo/ ; Jumpverse: /jumpverse.html ; WordForge: /wordforge.html",
      },
    },
  },
  {
    id: "wastetime",
    cover: "/images/cover-wastetime.webp",
    imageAlt: { zh: "浪費時間 idle clicker 遊戲畫面", en: "Waste Time idle clicker game screen" },
    span: "col-span-2",
    icon: "game",
    verified: true,
    link: "https://apchen1978.github.io/wastetime/",
    linkLabel: { zh: "立即玩", en: "Play Now" },
    zh: {
      title: "浪費時間 (Waste Time)",
      desc: "點擊/放置小遊戲：Q 彈打擊感、CPS 聯動時鐘、WebAudio 晶片音、摸魚狂熱事件與關卡系統（8 套主題）。",
      tag: "遊戲 · 網頁",
    },
    en: {
      title: "Waste Time (Time Waster)",
      desc: "An idle clicker with squash-and-stretch feedback, CPS-linked clock hands, WebAudio chiptune SFX, slack-bubble frenzy events, and a level system with 8 visual themes.",
      tag: "Game · Web",
    },
    case: {
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: "E2E PASS",
      problem: {
        zh: "原本以 Gemini + Project IDX 製作的同名小遊戲因雲端工作區遺失而無法找回，需要一個更好玩的版本。",
        en: "The original game of the same name, built with Gemini + Project IDX, was lost when the cloud workspace disappeared; it needed a better playable version.",
      },
      approach: {
        zh: "以零依賴單檔 HTML 重建點擊/放置玩法，並加入遊戲爽度工程：Q 彈擠壓、霓虹漣漪、CPS 聯動指針、WebAudio 原生音效、摸魚狂熱事件，以及時間門檻升級與 8 套關卡主題。",
        en: "Rebuilt the idle-clicker in a zero-dependency single HTML file with game juice: squash-and-stretch clicks, neon ripples, CPS-linked clock hands, native WebAudio sound, slack-bubble frenzy events, and a level system with 8 visual themes.",
      },
      tools: {
        zh: "原生 HTML/CSS/JS · WebAudio · 無頭 Chrome 自動化測試",
        en: "Vanilla HTML/CSS/JS · WebAudio · headless Chrome automation tests",
      },
      result: {
        zh: "重建完成並可遊玩；點擊、升級、狂熱與關卡系統經無頭 Chrome 端到端測試全數通過。",
        en: "Rebuilt and playable; click, upgrade, frenzy, and level systems pass end-to-end headless Chrome tests.",
      },
      evidence: {
        zh: "點擊、升級、狂熱與關卡系統經無頭 Chrome 端到端測試全數通過；公開 demo：https://apchen1978.github.io/wastetime/（HTTP 200，線上實測）。",
        en: "Click, upgrade, frenzy, and level systems pass end-to-end headless Chrome tests; public demo: https://apchen1978.github.io/wastetime/ (HTTP 200, verified live).",
      },
    },
  },
  {
    id: "lyrics",
    cover: "/images/cover-lyrics.webp",
    imageAlt: { zh: "AI Lyrics Generator 桌面應用", en: "AI Lyrics Generator desktop app" },
    span: "col-span-1",
    verified: true,
    link: null,
    zh: {
      title: "AI Lyrics Generator",
      desc: "Python + PySide6 桌面 App：本機 AI 歌詞生成、100 分評分、批評與自動重寫，支援 Ollama 本地模型與離線模式。",
      tag: "桌面 App · AI",
    },
    en: {
      title: "AI Lyrics Generator",
      desc: "Python + PySide6 desktop app: local AI lyric generation, 100-point scoring, critique and auto-rewrite, with Ollama local models and offline mode.",
      tag: "Desktop app · AI",
    },
    case: {
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: "V3 · exe built",
      problem: {
        zh: "歌詞創作缺乏本機、可離線的 AI 輔助流程：生成、評分、批評、重寫各自分散。",
        en: "Lyric writing lacked a local, offline-capable AI workflow: generation, scoring, critique, and rewrite were disconnected.",
      },
      approach: {
        zh: "Python + PySide6 桌面 App：生成 → 批評 → 自動重寫 → 輸出；100 分品質評分（Hook/可唱性/押韻等六軸）；版本歷史與 A/B 比較；Ollama 本地模型或離線草稿模式。",
        en: "Python + PySide6 desktop app: generate → critique → auto-rewrite → output; 100-point quality score across six axes; version history and A/B compare; Ollama local models or offline draft mode.",
      },
      tools: {
        zh: "Python · PySide6 · Ollama（qwen2.5 / llama3.2）· TXT/DOCX 匯出",
        en: "Python · PySide6 · Ollama (qwen2.5 / llama3.2) · TXT/DOCX export",
      },
      result: {
        zh: "V3 功能集完成，本機 exe 產物已建置（40.9MB）。",
        en: "V3 feature set complete; local EXE build produced (40.9MB).",
      },
      evidence: {
        zh: "V3 功能集與本機 exe 已建置（40.9MB，本機驗證可啟動）；來源：本地 OneDrive 專案資料夾 + private repo（apchen1978/ai-lyrics-generator）。公開 demo 尚未發布。",
        en: "V3 feature set and local EXE build verified (40.9MB, launches locally); source: local OneDrive project folder + private repo (apchen1978/ai-lyrics-generator). No public demo published yet.",
      },
    },
  },
  {
    id: "deck",
    cover: "/images/cover-deck.webp",
    imageAlt: { zh: "DSH 快速指南簡報", en: "DSH quick guide deck" },
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
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: "3 versions",
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
        zh: "三版簡報產出完成（含 PDF 渲染）。",
        en: "Three deck versions produced, with PDF rendering.",
      },
      evidence: {
        zh: "三版簡報（含 PDF 渲染）由 spec JSON 管線產出、可重跑；產物位於 ppt-toolkit/（spec-dsh-guide.json、make-pptx.mjs、demo 簡報與 PDF）。",
        en: "Three deck versions (with PDF rendering) are produced by the spec JSON pipeline and rerunnable; artifacts live in ppt-toolkit/ (spec-dsh-guide.json, make-pptx.mjs, demo deck, and PDF).",
      },
    },
  },
  {
    id: "expense",
    cover: "/images/cover-expense.webp",
    imageAlt: { zh: "Expense Tracker 收支實驗", en: "Expense Tracker experiments" },
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
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: "16/16 PASS",
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
        zh: "16/16 驗證通過。",
        en: "16/16 checks pass.",
      },
      evidence: {
        zh: "WORKLOG 記錄；repo 為 PRIVATE。",
        en: "Recorded in WORKLOG; repo is PRIVATE.",
      },
    },
  },
  {
    id: "payment-concentration",
    featuredRank: 2,
    related: {
      id: "trade-deal-desk",
      label: { zh: "回到源頭：這個 Deal C 是怎麼被評估與核准的？", en: "Back to the source: how was this Deal C assessed and approved?" },
      note: {
        zh: "portfolio 層演示接合：Deal C 的決策來自 Trade Deal Desk 的合成案例，付款影響為模擬計算。",
        en: "Portfolio-level demo bridge: Deal C's decision comes from a Trade Deal Desk synthetic case; the payment impact is a simulated calculation.",
      },
    },
    cover: "/images/cover-payment-concentration.png",
    imageAlt: { zh: "Payment Concentration 原型：滾動 7 日付款承諾高峰畫面", en: "Payment Concentration prototype: rolling 7-day payment-commitment peak" },
    span: "col-span-2",
    icon: "receipt",
    verified: true,
    link: "https://apchen1978.github.io/payment-concentration-demo/",
    linkLabel: { zh: "試試付款原型", en: "Try the Payment Prototype" },
    zh: {
      title: "Payment Concentration",
      desc: "把「這個月哪 7 天的付款承諾最集中」變成可編輯、可對帳的確定性計算，逐幣別分開算，不用猜。",
      tag: "付款承諾 · 工具原型",
    },
    en: {
      title: "Payment Concentration",
      desc: "Turning “which 7 days this month carry the most payment commitment” into an editable, auditable, deterministic calculation — computed per currency, not guessed.",
      tag: "Payment commitments · Tool prototype",
    },
    case: {
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: "51/51 PASS",
      problem: {
        zh: "談判新合約（Deal C）時，真正要回答的不是「整月付多少」，而是「把它加進來後，最集中的連續 7 個日曆日會多出多少付款承諾」。用試算表算很容易算錯窗、混幣別、而且無法快速對帳。",
        en: "When negotiating a new deal (Deal C), the real question is not “what does the month total” but “how much extra payment commitment lands in the most concentrated 7-calendar-day window once it is added.” Spreadsheet answers are easy to get wrong — wrong window, mixed currencies, hard to audit quickly.",
      },
      approach: {
        zh: "做一個刻意樸素、可與 Excel 公平對照的原型：一張可編輯的付款事件表（正好 Deal A / B / C），用確定性的滾動 7 日曆日演算法逐幣別算出三個數字——加入 Deal C 前的高峰、Deal C 在高峰中的增量、加入後的高峰——並列出貢獻事件與永久揭露。",
        en: "Built a deliberately plain, Excel-fair prototype: one editable payment-event table (exactly Deal A / B / C) and a deterministic rolling 7-calendar-day calculation per currency producing three numbers — the peak before Deal C, Deal C's incremental commitment inside the peak, and the peak after — plus contributing events and a permanent disclosure.",
      },
      tools: {
        zh: "原生 HTML/CSS/JS · 零依賴 · 確定性計算引擎 · Node 驗證套件 · 無頭 Chrome 驗證",
        en: "Vanilla HTML/CSS/JS · zero dependencies · deterministic calculation engine · Node validation suite · headless Chrome verification",
      },
      result: {
        zh: "預設六事件 fixture 精確重現契約結果：加入 Deal C 前 USD 83,000 → Deal C 高峰增量 USD 52,000 → 加入後 USD 135,000（高峰窗 Oct 12–18，貢獻者 A 45,000 / B 38,000 / C 52,000）；改日期或金額即時重算，幣別互不污染。",
        en: "The six-event fixture reproduces the contract result exactly: USD 83,000 before Deal C → USD 52,000 Deal C incremental in peak → USD 135,000 after (peak window Oct 12–18; contributors A 45,000 / B 38,000 / C 52,000). Editing dates or amounts recalculates instantly, and currencies never mix.",
      },
      evidence: {
        zh: "已發布為靜態合成 Try surface（公開 demo）。六事件 canonical fixture 精確匹配 · 51/51 驗證通過 · 幣別分離驗證 · 無持久化／無外部服務 · 390px 手機驗證通過。此為 prototype evidence：尚未證明優於 Excel、商業採用或支付意願。",
        en: "Published as a static synthetic Try surface (public demo). Six-event canonical fixture matches exactly · 51/51 checks pass · per-currency separation verified · no persistence / no external services · 390px mobile verification passes. Prototype evidence only: Excel superiority, commercial adoption, and willingness-to-pay are not proven.",
      },
    },
  },
  {
    id: "mg-desktop-pet",
    cover: "/images/cover-mg-desktop-pet.png",
    imageAlt: { zh: "MG Desktop Pet 正面待機角色動畫影格", en: "MG Desktop Pet front-facing idle animation frame" },
    imageFit: "contain",
    span: "col-span-1",
    icon: "game",
    verified: true,
    link: "https://apchen1978.github.io/mg-desktop-pet-demo/",
    linkLabel: { zh: "試用 Web Mini Demo", en: "Try Web Mini Demo" },
    zh: {
      title: "MG Desktop Pet",
      desc: "把桌面寵物的想法做成可運行的小型桌面應用，結合角色動畫、桌面互動與多種寵物狀態。",
      tag: "創意實作 · 桌面 App",
    },
    en: {
      title: "MG Desktop Pet",
      desc: "Turning a desktop-pet idea into a working desktop application with character animation, desktop interaction, and multiple pet states.",
      tag: "Creative Build · Cute Desktop Pet · Desktop App",
    },
    case: {
      stage: { zh: "創意實作", en: "Creative Build" },
      problem: {
        zh: "將桌面寵物的概念落實為可執行的小型桌面應用。",
        en: "Turn a desktop-pet idea into a runnable small desktop application.",
      },
      approach: {
        zh: "以 Python + PySide6 實作透明、無邊框、置頂視窗，並以 QTimer 驅動既有 PNG 角色動畫影格與多種狀態。",
        en: "Implemented a transparent, frameless, always-on-top window in Python + PySide6, using QTimer to drive existing PNG character frames across multiple states.",
      },
      tools: {
        zh: "Python · PySide6 · QTimer · PNG 動畫影格",
        en: "Python · PySide6 · QTimer · PNG animation frames",
      },
      result: {
        zh: "Python 應用已成功啟動；來源實作包含拖曳、右鍵選單與鍵盤控制。",
        en: "The Python application launches successfully; the source implementation includes drag, right-click menu, and keyboard controls.",
      },
      evidence: {
        zh: "已確認應用程式可啟動並核對主要功能實作；另提供 Web Mini Demo / Portfolio Adaptation，已驗證 390px、拖曳、Wave、Jump、Sleep 與 Reset。公開 demo：https://apchen1978.github.io/mg-desktop-pet-demo/（HTTP 200，線上實測通過）。這不是完整 desktop app，原始桌面互動仍不宣稱已在 web 重現。",
        en: "The desktop application launch and core implementation are verified; a Web Mini Demo / Portfolio Adaptation is also provided with 390px, drag, Wave, Jump, Sleep, and Reset checks. Public demo: https://apchen1978.github.io/mg-desktop-pet-demo/ (HTTP 200, verified live). It is not the complete desktop application, and desktop-only behavior is not claimed as reproduced on the web.",
      },
    },
  },
  {
    id: "overseas-lead-discovery",
    featuredRank: 5,
    cover: "/images/cover-lead-discovery.png",
    imageAlt: { zh: "Overseas Lead Discovery 資格篩選 demo 畫面", en: "Overseas Lead Discovery qualification demo" },
    span: "col-span-2",
    icon: "briefcase",
    verified: true,
    link: "https://apchen1978.github.io/overseas-lead-discovery-demo/",
    linkLabel: { zh: "試用潛在客戶篩選 Demo", en: "Try Qualification Demo" },
    demoNote: { zh: "Demo 以美國市場英文公開資料情境呈現。", en: "Demo uses an English-language U.S. market scenario." },
    zh: {
      title: "AI 輔助海外客戶開發",
      desc: "從公開網路名單，篩出真正值得業務投入時間的潛在客戶。",
      tag: "客戶開發 · AI 資格篩選",
      caseSummary: "AI 不只是替業務找更多名單，而是把公開線索轉成可檢視、可質疑、可決定的潛在客戶短名單。",
    },
    en: {
      title: "AI-Assisted Overseas Lead Discovery",
      desc: "From public-web discovery to evidence-qualified prospects.",
      tag: "Lead discovery · AI qualification",
      caseSummary: "AI doesn't just find more leads. It turns public signals into a shortlist people can inspect, challenge, and act on.",
    },
    case: {
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: "44 → 20 shortlist",
      problem: {
        zh: "AI 可以找到幾百家公司的名字，但「找到公司」不等於「找到值得業務花時間開發的買家」。",
        en: "AI can find hundreds of companies — but finding companies is not the same as identifying buyers worth a sales team's time.",
      },
      approach: {
        zh: "公開網路發現 → Buyer Fit → Category Fit → Import Openness → Asia Sourcing Evidence → Evidence Quality → WHY／WHY NOT → 領域學習迭代。",
        en: "Public-web discovery → Buyer Fit → Category Fit → Import Openness → Asia Sourcing Evidence → Evidence Quality → WHY / WHY NOT → domain-learning iteration.",
      },
      tools: {
        zh: "公開網路多來源發現 · 證據分級（PRIMARY / SUPPORTING / VERIFICATION_REQUIRED）· 矛盾證據檢查 · 領域專家校準",
        en: "Multi-source public-web discovery · evidence-source tiering · contradiction checking · domain-expert calibration",
      },
      result: {
        zh: "44 家候選經證據式資格篩選 → 20 家入選短名單；M3 rubric-v2 迭代後，弱-adjacent 假陽性在短名單中減少；8 家脫敏代表性 records 以互動 demo 公開。",
        en: "44 candidates evaluated through evidence qualification → 20 evidence-qualified shortlist; after M3 rubric-v2 iteration, weak-adjacent false positives were reduced in the shortlist; 8 anonymized representative records published as an interactive demo.",
      },
      evidence: {
        zh: "44 家候選評估 · 20 家證據合格短名單 · M2 凍結基準 · M3 rubric-v2 迭代 · 8 家脫敏 demo records。揭露：REAL OWNER PRECISION@20: PENDING · 脫敏代表性 records · 公開網路證據流程 · 含模擬/領域學習元素 · 未進行 outreach · 商業採用與支付意願未證明 · 沒有證據支持的資訊，不會被標示為已確認事實。",
        en: "44 unique candidates evaluated · 20 evidence-qualified shortlist · M2 frozen baseline · M3 rubric-v2 iteration · 8 anonymized representative records in the interactive demo. Disclosure: REAL OWNER PRECISION@20: PENDING · representative/anonymized records · public-web evidence workflow · simulated/domain-learning elements included · no outreach performed · commercial adoption and willingness-to-pay not proven · No unsupported claim is presented as confirmed.",
      },
    },
  },
];
