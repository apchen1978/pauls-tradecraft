// 作品資料：全部來自 WORKLOG.md 與工作區實際產出。
// 公開連結規則（evidence-first）：
//   - 只有從 GitHub/線上實測確認的公開 URL 才填入 link。
//   - 未驗證者維持 null；公開呈現使用中性的 evidence status copy。
//   - 禁止猜測 URL、禁止把 private repo 當作公開證據。
// Case Study schema（P1.5）：
//   - case.stage 只能是：Prototype / Simulation / Shadow Pilot / Technical Validation / Creative Build（依證據選）
//   - 禁止虛構 ROI / conversion / customer result / usage metrics / commercial outcome。
// 封面（cover）：真實截圖裁切 16:9，或品牌設計封面（Forest family）。
export const works = [
  {
    id: "mori-soft-furnishing-website",
    section: "commercial",
    featuredRank: 5,
    cover: "/images/cover-mori-soft-furnishing.webp",
    imageAlt: { zh: "MORI 軟裝品牌網站首頁", en: "MORI soft-furnishing brand website homepage" },
    span: "col-span-1",
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
    featuredRank: 3,
    section: "commercial",
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
    span: "col-span-1",
    icon: "briefcase",
    verified: true,
    link: "https://apchen1978.github.io/ai-trade-deal-desk-demo/",
    linkLabel: { zh: "線上體驗", en: "Live Demo" },
    zh: {
      title: "貿易交易工作台",
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
    section: "operations",
    featuredRank: 1,
    cover: "/images/cover-tracker.png",
    imageAlt: { zh: "窗簾軟裝 Pilot 追蹤器儀表板", en: "Curtain soft-furnishing pilot tracker dashboard" },
    link: "/pilot-evidence/#tracker",
    linkLabel: { zh: "檢視驗證產物", en: "View Evidence" },
    span: "md:col-span-2",
    verified: true,
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
        zh: "可視化證據頁 + GitHub repo（outputs/ 4 組 xlsx + inspect.ndjson；verify 23/23）。",
        en: "Visual evidence page + GitHub repo (outputs/ 4 xlsx + inspect.ndjson pairs; verify 23/23).",
      },
    },
  },
  {
    id: "casebrief",
    section: "operations",
    featuredRank: 2,
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
    section: "labs",
    featuredRank: 5,
    cover: "/images/cover-simulations.webp",
    imageAlt: { zh: "Pilot 模擬時間軸", en: "Pilot simulation timeline" },
    link: "/pilot-evidence/#rounds",
    linkLabel: { zh: "檢視模擬證據", en: "View Simulations" },
    span: "col-span-1",    verified: true,
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
        zh: "四期模擬（001–004）＋可視化證據頁；每期附 .inspect.ndjson。",
        en: "Four simulation rounds (001–004) + visual evidence page; each with .inspect.ndjson.",
      },
    },
  },
  {
    id: "game",
    section: "labs",
    featuredRank: 3,
    cover: "/images/cover-game-v3.png",
    imageAlt: { zh: "Lil Matt's Gaming World 遊戲", en: "Lil Matt's Gaming World game" },
    span: "md:col-span-2",
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
        zh: "經過多輪迭代測試與改進（IME 輸入修正、音效調整、版面優化），打字體驗穩定流暢；Shadow Mode 用可解釋的方式推薦練習方向。Lil Matt 真人遊玩測試偏好分離為兩款獨立遊戲；既有玩法與進度相容性已保留。",
        en: "Iterative testing and improvement (IME input fixes, audio tuning, layout refinements) made the typing experience stable and smooth; the Shadow Mode offers explainable practice recommendations. Lil Matt's real-player playtest preferred splitting into two independent games; existing gameplay and progress compatibility are preserved.",
      },
      evidence: {
        zh: "公開入口（Gaming World hub）：https://apchen1978.github.io/signal-rift-typing-demo/ ；Jumpverse：/jumpverse.html ；WordForge：/wordforge.html",
        en: "Public hub: https://apchen1978.github.io/signal-rift-typing-demo/ ; Jumpverse: /jumpverse.html ; WordForge: /wordforge.html",
      },
    },
  },
  {
    id: "wastetime",
    section: "labs",
    featuredRank: 4,
    cover: "/images/cover-wastetime.webp",
    imageAlt: { zh: "浪費時間 idle clicker 遊戲畫面", en: "Waste Time idle clicker game screen" },
    span: "col-span-1",
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
    featuredRank: 2,
    section: "labs",
    cover: "/images/cover-lyrics-v3.png",
     imageAlt: { zh: "AI Lyrics Generator Desktop V3 與 Live Web Demo", en: "AI Lyrics Generator Desktop V3 and live web demo" },
    span: "col-span-1",
    verified: true,
     link: "https://deploy-lake-zeta.vercel.app",
     linkLabel: { zh: "試玩 Live AI Demo", en: "Try Live AI Demo" },
    zh: {
      title: "AI Lyrics Generator",
       desc: "從 Python + PySide6 Desktop V3 演進成可公開試玩的 AI Web Demo，保留同一套生成、批評、評分與迭代工作流。",
       tag: "Desktop + Web · AI",
    },
    en: {
      title: "AI Lyrics Generator",
       desc: "Evolved from a Python + PySide6 Desktop V3 app into a public AI Web Demo while preserving the same generation, critique, scoring, and iteration workflow.",
       tag: "Desktop + Web · AI",
    },
    case: {
      stage: { zh: "技術驗證", en: "Technical Validation" },
       stageTag: { zh: "Live Production Demo · DeepSeek", en: "Live Production Demo · DeepSeek" },
       compact: true,
       problem: {
         zh: "歌詞創作工具往往只停留在單次生成，缺少可實際操作的品質控制與迭代流程。",
         en: "Lyric tools often stop at one-shot generation, without a practical quality-control and iteration workflow.",
       },
       approach: {
         zh: "Desktop V3 canonical core → Python serverless adapter → DeepSeek API → Vercel deployment；Web 只負責 presentation 與安全 API boundary。",
         en: "Desktop V3 canonical core → Python serverless adapter → DeepSeek API → Vercel deployment; the Web layer owns presentation and the secure API boundary.",
       },
       highlights: {
         zh: ["Generate → Critic → 100 分 Quality Score → Auto Rewrite", "Rewrite Directions 與 Chorus Hooks", "Version History 與 A/B Comparison", "Desktop canonical core 延伸至公開 Web", "DeepSeek-powered 真實生成，API key 僅存在 server-side", "390px / 1280px、rate-limit rejection 與 client bundle 已驗證"],
         en: ["Generate → Critic → 100-point Quality Score → Auto Rewrite", "Rewrite Directions and Chorus Hooks", "Version History and A/B Comparison", "Desktop canonical core extended to a public Web Demo", "DeepSeek-powered live generation with the API key server-side only", "390px / 1280px, rate-limit rejection, and client-bundle checks verified"],
       },
       tools: {
         zh: "Python · PySide6 · DeepSeek API · Vercel Serverless · Ollama · HTML/CSS/JavaScript",
         en: "Python · PySide6 · DeepSeek API · Vercel Serverless · Ollama · HTML/CSS/JavaScript",
       },
       result: {
         zh: "Desktop V3 可獨立執行，Windows EXE 已建置（40.9MB）；公開 Live Web Demo 已部署，Desktop 與 Web 共用同一套 Python V3 核心。",
         en: "Desktop V3 runs independently with a built Windows EXE (40.9MB); the public Live Web Demo is deployed, with Desktop and Web sharing the same Python V3 core.",
       },
       evidence: {
         zh: "Production Web Demo 已完成端到端實測：Idea → Generate → Critic → Score → Rewrite → Hooks → Version History → A/B Comparison。已驗證真實 DeepSeek AI generation、390px / 1280px 響應式版面、0 material console errors、client bundle 無 API key、provider / model 不由訪客控制，以及 rate-limit rejection path。來源：private repo apchen1978/ai-lyrics-generator。",
         en: "Production Web Demo verified end to end: Idea → Generate → Critic → Score → Rewrite → Hooks → Version History → A/B Comparison. Verified: real DeepSeek AI generation, responsive 390px / 1280px layouts, 0 material console errors, no API key in the client bundle, visitor cannot control provider or model, and the rate-limit rejection path. Source: private repo apchen1978/ai-lyrics-generator.",
       },
    },
  },
  {
    id: "deck",
    featuredRank: 3,
    section: "operations",
    cover: "/images/cover-deck-v2.png",
    imageAlt: { zh: "DSH 快速指南簡報", en: "DSH quick guide deck" },
    link: "/deck-viewer/",
    linkLabel: { zh: "翻閱簡報", en: "Flip Through Deck" },
    span: "md:col-span-2 md:col-start-2",
    verified: true,
    zh: {
      title: "執行能力簡報",
      desc: "9 頁 McKinsey 風格執行能力簡報，可直接翻閱 — 由可重跑的 spec JSON → PPTX → PDF 管線產出。",
      tag: "簡報管線",
    },
    en: {
      title: "Executive Capability Deck",
      desc: "A 9-page McKinsey-style executive capability deck you can flip through — produced by a rerunnable spec-to-PPTX-to-PDF pipeline.",
      tag: "Deck pipeline",
    },
    case: {
      stage: { zh: "技術驗證", en: "Technical Validation" },
      stageTag: { zh: "已驗證產物 · 可重現工作流", en: "Verified Artifact · Reproducible Workflow" },
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
        zh: "9 頁執行能力簡報可線上翻閱（/deck-viewer/，含 PDF 下載）；簡報由 spec JSON 管線（ppt-toolkit：spec JSON、make-pptx.mjs）產出、可重跑。管線 repo：https://github.com/apchen1978/spec-to-deck-pipeline。",
        en: "The 9-page executive capability deck is viewable online (/deck-viewer/, with PDF download); it is produced by a rerunnable spec JSON pipeline (ppt-toolkit: spec JSON, make-pptx.mjs). Pipeline repo: https://github.com/apchen1978/spec-to-deck-pipeline.",
      },
    },
  },
  {
    id: "expense",
    section: "labs",
    featuredRank: 6,
    cover: "/images/cover-expense-v2.png",
    imageAlt: { zh: "Expense Tracker 收支實驗", en: "Expense Tracker experiments" },
    link: "https://apchen1978.github.io/expense-tracker-demo/",
    linkLabel: { zh: "試用 Expense Demo", en: "Try Expense Demo" },
    span: "md:col-span-2",
    verified: true,
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
    featuredRank: 4,
    section: "commercial",
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
    span: "md:col-span-2",
    icon: "receipt",
    verified: true,
    link: "https://apchen1978.github.io/payment-concentration-demo/",
    linkLabel: { zh: "試試付款原型", en: "Try the Payment Prototype" },
    zh: {
      title: "付款集中度分析",
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
    section: "labs",
    featuredRank: 1,
    cover: "/images/cover-mg-desktop-pet.webp",
    imageAlt: { zh: "MG Desktop Pet 在桌面舞台上的待機角色", en: "MG Desktop Pet idle on its desktop stage" },
    span: "md:col-span-2",
    icon: "game",
    verified: true,
    link: "https://apchen1978.github.io/mg-desktop-pet-demo/",
    linkLabel: { zh: "試用 Web Mini Demo", en: "Try Web Mini Demo" },
    zh: {
      title: "MG Desktop Pet",
      desc: "把桌面寵物的想法做成可運行的小型桌面應用，結合角色動畫、桌面互動與 16 種寵物狀態（含 v2 表情動作包）。",
      tag: "創意實作 · 桌面 App",
    },
    en: {
      title: "MG Desktop Pet",
      desc: "Turning a desktop-pet idea into a working desktop application with character animation, desktop interaction, and 16 pet states including a v2 expression pack.",
      tag: "Creative Build · Cute Desktop Pet · Desktop App",
    },
    case: {
      stage: { zh: "創意實作", en: "Creative Build" },
      gallery: {
        src: "/images/mg-poses.webp",
        alt: { zh: "MG 的 16 種表情與姿態總覽", en: "MG's 16-pose expression and motion overview" },
        caption: { zh: "16 種姿態 · 64 個動畫影格：待機、可愛、揮手、跳躍、奔跑、左/右跑、等待、吃飯、睡覺、跳舞、開心、思考、興奮、愛心、害羞", en: "16 poses · 64 animation frames: idle, cute, wave, jump, run, run L/R, wait, eat, sleep, dance, happy, think, excited, heart, blush" },
      },
      problem: {
        zh: "將桌面寵物的概念落實為可執行的小型桌面應用。",
        en: "Turn a desktop-pet idea into a runnable small desktop application.",
      },
      approach: {
        zh: "以 Python + PySide6 實作透明、無邊框、置頂視窗，並以 QTimer 驅動既有 PNG 角色動畫影格；v2 表情動作包以程序化動態（彈跳／漂浮／擠壓）與疊加影格（愛心、臉紅）安全擴充姿態，不改畫風。",
        en: "Implemented a transparent, frameless, always-on-top window in Python + PySide6, using QTimer to drive existing character frames. The v2 expression pack extends poses safely with procedural motion (bob/float/squash) and generated overlay frames (hearts, blush) — no style changes.",
      },
      tools: {
        zh: "Python · PySide6 · QTimer · WebP 優化動畫影格",
        en: "Python · PySide6 · QTimer · WebP-optimized animation frames",
      },
      result: {
        zh: "Python 應用已成功啟動；來源實作包含拖曳、右鍵選單與鍵盤控制（共 16 種狀態）。",
        en: "The Python application launches successfully; the source implementation includes drag, right-click menu, keyboard controls, and 16 states.",
      },
      evidence: {
        zh: "已確認應用程式可啟動並核對主要功能實作；v2 表情動作包（Dance / Happy / Think / Excited / Heart / Blush）以既有美術安全擴充，64 影格全數 WebP 化（約 0.6 MB）。Web Mini Demo v3 已驗證 390px、拖曳、16 種狀態按鈕、鍵盤快捷鍵與全部影格載入。公開 demo：https://apchen1978.github.io/mg-desktop-pet-demo/（HTTP 200，線上實測通過）。這不是完整 desktop app，原始桌面互動仍不宣稱已在 web 重現。",
        en: "The desktop application launch and core implementation are verified; the v2 expression pack (Dance / Happy / Think / Excited / Heart / Blush) extends poses safely from existing art, with all 64 frames WebP-optimized (~0.6 MB). Web Mini Demo v3 is verified at 390px, drag, 16 state buttons, keyboard shortcuts, and full frame loading. Public demo: https://apchen1978.github.io/mg-desktop-pet-demo/ (HTTP 200, verified live). It is not the complete desktop application, and desktop-only behavior is not claimed as reproduced on the web.",
      },
    },
  },
  {
    id: "overseas-lead-discovery",
    featuredRank: 2,
    section: "commercial",
    cover: "/images/cover-lead-discovery.png",
    imageAlt: { zh: "Overseas Lead Discovery 資格篩選 demo 畫面", en: "Overseas Lead Discovery qualification demo" },
    span: "md:col-span-2",
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
  {
    id: "trade-profit-navigator",
    section: "commercial",
    featuredRank: 5,
    cover: "/images/cover-trade-profit-navigator.png",
    icon: "receipt",
    verified: true,
    hidePendingLink: false,
    demoNote: {
      zh: "獨立 local prototype；公開 Demo 待 Owner 3 分鐘試用後決定。",
      en: "Independent local prototype; public demo release follows the Owner 3-minute test.",
    },
    imageAlt: { zh: "Trade Profit Navigator 商業價值槓桿原型", en: "Trade Profit Navigator value-capture prototype" },
    zh: {
      title: "貿易利潤導航",
      desc: "把一筆貿易拆成價值鏈、成本、現金暴露、風險與證據，找出下一個值得測試的利潤槓桿。",
      tag: "價值捕捉 · Economics · Trade",
      caseSummary: "不是問誰賺走最多，而是問下一步在哪裡可以多捕捉價值，以及為此要承擔、證明或改變什麼。",
    },
    en: {
      title: "Trade Profit Navigator",
      desc: "Break a trade case into value chain, economics, cash exposure, risk, and evidence to find the next profit lever worth testing.",
      tag: "Value capture · Economics · Trade",
      caseSummary: "Not who captures the most value, but where the next credible lever is and what must be risked, proven, or changed to capture it.",
    },
    case: {
      stage: { zh: "技術原型", en: "Technical Prototype" },
      stageTag: "8/8 + 6/6 PASS",
      problem: {
        zh: "貿易團隊常看見單價或毛利，卻看不見為了取得這個 upside 要增加多少現金暴露、庫存與執行風險。",
        en: "Trade teams may see price or margin, but not the cash exposure, inventory, and execution risk required to capture the upside.",
      },
      approach: {
        zh: "建立一個獨立、證據優先的互動原型，把已知 economics 與 UNKNOWN 拆開，並比較成本、MOQ、供應方案等三個具體槓桿。",
        en: "Built an isolated, evidence-aware interactive prototype that separates known economics from UNKNOWN and compares three concrete levers across cost, MOQ, and supply-solution moves.",
      },
      tools: {
        zh: "Vanilla HTML/CSS/JavaScript · Deterministic calculations · Synthetic USD case · Adversarial harness",
        en: "Vanilla HTML/CSS/JavaScript · Deterministic calculations · Synthetic USD case · Adversarial harness",
      },
      result: {
        zh: "完成可操作的 Trade Profit Navigator v0.1：可調整數量、採購價、銷售價與 MOQ，並將每個槓桿連到 economics、cash、risk、evidence、UNKNOWN 與 Owner decision。",
        en: "A working Trade Profit Navigator v0.1: editable quantity, purchase price, selling price, and MOQ, with every lever connected to economics, cash, risk, evidence, UNKNOWN, and the owner decision.",
      },
      evidence: {
        zh: "Local prototype tests 8/8；adversarial baseline 6/6；390px／1440px 無溢位；案例為 synthetic USD dataset。尚未證明 commercial adoption、ROI 或 market willingness-to-pay。",
        en: "Local prototype tests 8/8; adversarial baseline 6/6; no overflow at 390px/1440px; case uses a synthetic USD dataset. Commercial adoption, ROI, and market willingness-to-pay remain unproven.",
      },
    },
  },
  {
    id: "commercial-decision-desk",
    featuredRank: 1,
    section: "commercial",
    cover: "/images/cover-commercial-decision-desk.png",
    imageAlt: { zh: "Commercial Decision Desk 決策支援介面", en: "Commercial Decision Desk decision-support interface" },
    span: "md:col-span-2",
    icon: "briefcase",
    verified: true,
    link: "https://apchen1978.github.io/commercial-decision-desk/",
    linkLabel: { zh: "試用決策 Demo", en: "Try Decision Demo" },
    zh: {
      title: "商務決策工作台",
      desc: "在承諾一筆交易前，先把付款、交付責任、決策權與未知資訊放到同一張桌上，再整理成可追溯的交易結構、控制因素與下一步。",
      tag: "商業決策 · 決策支援",
      caseSummary: "不是替人拍板，而是讓承諾前真正需要確認的事實浮現：付款、交易責任、矛盾、UNKNOWN 與下一步。工作台只建議，人做最終決定。",
    },
    en: {
      title: "Commercial Decision Desk",
      desc: "Before committing to a deal, put payment, delivery responsibility, decision authority, and unknowns on the same table, then turn them into a traceable deal structure, control factors, and next actions.",
      tag: "Commercial decision · Decision support",
      caseSummary: "It does not decide for people. It makes the facts that matter before commitment visible: payment, trade responsibility, contradictions, UNKNOWNs, and the next step. The desk recommends; the human decides.",
    },
    case: {
      stage: { zh: "合成決策設計", en: "Synthetic Decision-Design" },
      stageTag: "Decision support · Human-in-the-loop",
      problem: {
        zh: "商機判斷分散在證據、交易條件、付款風險與人為經驗中，難以一次看全，也難以追溯「為什麼這樣決定」。",
        en: "Commercial judgment is scattered across evidence, trade terms, payment risk, and experience — hard to see at once and hard to trace why a decision was made.",
      },
      approach: {
        zh: "把商機從外部證據一路收斂到人類決策：DISCOVER → QUALIFY → ASSESS → EXPOSURE → DECIDE。確定性規則產生決策支援狀態（PURSUE_NOW / PURSUE_CONDITIONALLY / HOLD_FOR_EVIDENCE / ESCALATE / DO_NOT_PURSUE），矛盾與 UNKNOWN 全程浮現；Commercial Momentum 僅作已知商業訊號的 owner-governed context，不能覆蓋目前決策位置。Executive Deal Snapshot 只用既有證據總覽關鍵決策資訊。",
        en: "Traces an opportunity from external evidence to a human decision: DISCOVER → QUALIFY → ASSESS → EXPOSURE → DECIDE. Deterministic rules produce decision-support states (PURSUE_NOW / PURSUE_CONDITIONALLY / HOLD_FOR_EVIDENCE / ESCALATE / DO_NOT_PURSUE), while contradictions and UNKNOWNs stay visible. Commercial Momentum is owner-governed context for known commercial signals only; it cannot override the current decision position. The Executive Deal Snapshot summarizes key decision information from existing evidence only.",
      },
      tools: {
        zh: "純 HTML/CSS/JS · 確定性決策規則 · 合成 fixture · 零後端／零持久化",
        en: "Plain HTML/CSS/JS · deterministic decision rules · synthetic fixture · zero backend / zero persistence",
      },
      result: {
        zh: "以合成商業情境驗證跨階段 decision contract：證據資格化 → 商業可行性 → 付款暴露 → 矛盾與 UNKNOWN → Human Decision。8 條硬規則引擎化，50/50 自動檢查通過；Executive Deal Snapshot 將商機、買方、市場、產品、數量、訂單收入、Incoterm、預期淨貢獻、目前建議與控制因素放在一屏，缺值維持 UNKNOWN、淨貢獻未算即顯示「未計算」，不造假。",
        en: "Synthetic decision-design proof connecting evidence qualification, commercial feasibility, payment exposure, contradictions, UNKNOWNs, and mandatory human approval. Eight hard rules are enforced in the engine; 50/50 automated checks pass. An Executive Deal Snapshot puts the deal, buyer, market, product, quantity, deal value, Incoterm, expected net contribution, current recommendation, and control factors on one screen; missing values stay UNKNOWN and uncomputed net contribution shows \"not calculated\". Nothing is invented.",
      },
      evidence: {
        zh: "公開 demo：https://apchen1978.github.io/commercial-decision-desk/ 。Executive Deal Snapshot 已上線並通過瀏覽器實測（ZH/EN、1440px／390px、無水平溢位、無 console 錯誤，Sample 與 Blank 流程、匯出、鍵盤操作正常）；引擎 50/50 測試、Scenario 19 PASS／2 BASELINE_FIX_CONFIRMED／0 FAIL。揭露：SYNTHETIC decision-design proof · 人類決策必要 · 無自主商業動作 · 商業採用／ROI 未證明。",
        en: "Public demo: https://apchen1978.github.io/commercial-decision-desk/ . The Executive Deal Snapshot is live and browser-verified (ZH/EN, 1440px/390px, no horizontal overflow, no console errors; Sample and Blank flows, exports, keyboard operation OK); engine 50/50 tests, scenarios 19 PASS / 2 BASELINE_FIX_CONFIRMED / 0 FAIL. Disclosure: SYNTHETIC decision-design proof · human decision required · no autonomous commercial action · commercial adoption / ROI not proven.",
      },
    },
  },
];
