// 作品資料：全部來自 WORKLOG.md 與工作區實際產出。
// 公開連結規則（evidence-first）：
//   - 只有從 GitHub/線上實測確認的公開 URL 才填入 link。
//   - 未驗證者維持 null，UI 顯示「PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED」。
//   - 禁止猜測 URL、禁止把 private repo 當作公開證據。
// Case Study schema（P1.5）：
//   - case.stage 只能是：Prototype / Simulation / Shadow Pilot / Technical Validation（依證據選）
//   - 禁止虛構 ROI / conversion / customer result / usage metrics / commercial outcome。
// 封面（cover）：真實截圖裁切 16:9，或品牌設計封面（Forest family）。
export const works = [
  {
    id: "trade-deal-desk",
    cover: "/images/cover-trade-deal-desk.png",
    imageAlt: { zh: "AI Trade Deal Desk RFQ 決策工作區畫面", en: "AI Trade Deal Desk RFQ decision workspace" },
    span: "col-span-3 md:col-span-2",
    icon: "briefcase",
    verified: true,
    link: "https://apchen1978.github.io/ai-trade-deal-desk-demo/",
    linkLabel: { zh: "查看公開 Demo", en: "Live demo" },
    zh: {
      title: "AI Trade Deal Desk",
      desc: "把國際貿易 RFQ 判斷轉成 evidence-backed、human-in-the-loop 的商業決策工作流。",
      tag: "貿易決策 · AI",
    },
    en: {
      title: "AI Trade Deal Desk",
      desc: "Turning trade RFQ judgment into an evidence-backed, human-in-the-loop commercial decision workflow.",
      tag: "Trade decision · AI",
    },
    case: {
      stage: { zh: "技術驗證", en: "Technical Validation" },
      problem: {
        zh: "外貿 RFQ 常包含缺漏資訊、供應商條件衝突與不能只靠最低價格判斷的商業風險。",
        en: "Trade RFQs often arrive with incomplete information, conflicting supplier terms, and commercial risks that cannot be resolved by price alone.",
      },
      approach: {
        zh: "把實務貿易判斷拆成 deterministic decision rules、UNKNOWN handling、供應商比較、evidence checks 與 human approval boundary。",
        en: "I translated practical trade judgment into deterministic decision rules, UNKNOWN handling, supplier comparison, evidence checks, and explicit human approval boundaries.",
      },
      tools: {
        zh: "React · Fixture-driven simulation · Deterministic decision engine · Evidence-first workflow · Cross-agent validation",
        en: "React · Fixture-driven simulation · Deterministic decision engine · Evidence-first workflow · Cross-agent validation",
      },
      result: {
        zh: "完成一套可操作的模擬 Trade Deal Desk，12 個商業案例全部通過預期決策驗證，並完成 Human-in-the-Loop decision snapshot。",
        en: "A working Trade Deal Desk simulation with 12 validated commercial decision cases and an auditable local human decision snapshot.",
      },
      evidence: {
        zh: "12/12 fixture cases PASS · 3/3 negative tests PASS · Human override validated · Immutable local decision snapshot validated · Independent cross-agent audit PASS",
        en: "12/12 fixture cases PASS · 3/3 negative tests PASS · Human override validated · Immutable local decision snapshot validated · Independent cross-agent audit PASS",
      },
    },
  },
  {
    id: "tracker",
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
    cover: "/images/cover-simulations.png",
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
    linkLabel: "Play the game",
    zh: {
      title: "Lil Matt's Gaming World",
      desc: "雙模式原創遊戲：「Read the Signal」精準節奏平台遊戲 + 內建英語學習打字挑戰（32 篇文章、92 筆道地美式英語字彙）。",
      tag: "遊戲 · 英語學習",
    },
    en: {
      title: "Lil Matt's Gaming World",
      desc: "A dual-mode original game: the Read the Signal precision rhythm platformer, plus a built-in English learning typing challenge with 32 passages and 92 authentic American English vocabulary notes.",
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
        zh: "公開 demo：https://apchen1978.github.io/signal-rift-typing-demo/",
        en: "Public demo: https://apchen1978.github.io/signal-rift-typing-demo/",
      },
    },
  },
  {
    id: "wastetime",
    cover: "/images/cover-wastetime.png",
    imageAlt: { zh: "浪費時間 idle clicker 遊戲畫面", en: "Waste Time idle clicker game screen" },
    span: "col-span-2",
    icon: "game",
    verified: true,
    link: "https://apchen1978.github.io/wastetime/",
    linkLabel: "Play the game",
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
        zh: "公開 demo：https://apchen1978.github.io/wastetime/",
        en: "Public demo: https://apchen1978.github.io/wastetime/",
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
        zh: "本地 OneDrive 專案資料夾 + private repo（apchen1978/ai-lyrics-generator）。",
        en: "Local OneDrive project folder + private repo (apchen1978/ai-lyrics-generator).",
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
        zh: "ppt-toolkit/ 內含 spec-dsh-guide.json、make-pptx.mjs、demo 簡報與 PDF。",
        en: "ppt-toolkit/ contains spec-dsh-guide.json, make-pptx.mjs, demo deck, and PDF.",
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
];
