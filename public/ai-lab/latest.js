// AI Lab "latest observations": a few new AI capabilities each week, what they do, what we took from them.
// Source of truth for the notes: digital-garage/observations/AI能力觀察筆記.md. Only verified or clearly labelled reports;
// links only, no copied images or code. Add new entries at the top; keep about six on the page.
// tag: "inUse" = we already use it or its method; "watching" = observing, not adopted.

export const LATEST = [
  {
    date: "2026-10-13",
    tag: "watching",
    zh: {
      title: "一個人用 AI 協作，做出可在瀏覽器裡走進去的 3D 世界",
      what: "創作者 Sac 把《小王子》做成網頁 3D 遊戲：參考圖、3D 模型、程式、審查分給不同的 AI 工具。官方頁寫明目前只支援電腦。",
      took: "我們學到：先做參考圖再做素材、一個 agent 一件事、多角度盲審。已寫進我們的美術流程；先當標竿觀察，不急著做。",
    },
    en: {
      title: "One person, AI collaboration, a 3D world you can walk into in a browser",
      what: "Creator Sac turned The Little Prince into a web 3D game, with reference art, 3D models, code and review split across AI tools. The official page says desktop only for now.",
      took: "What we took: reference art before assets, one agent per job, blind multi-angle review. Now part of our art workflow; a benchmark to watch, not a rush to build.",
    },
    source: "https://littleprince.dev/",
  },
  {
    date: "2026-10",
    tag: "inUse",
    zh: {
      title: "Karpathy 的四層漏斗：多數人還沒真的用過 AI",
      what: "他估計：幾乎沒碰過的人最多，偶爾聊聊的其次，交給它做專業工作的只是少數。這是他的個人估計，沒有調查資料。",
      took: "我們拿來當本頁第 00 章的開場：先問你在哪一層。",
    },
    en: {
      title: "Karpathy's four-tier funnel: most people haven't really used AI yet",
      what: "His estimate: most people have barely touched it, fewer chat now and then, only a small group hand it real professional work. A personal estimate, no survey behind it.",
      took: "We use it to open chapter 00 of this page: which tier are you in?",
    },
    source: "https://the-decoder.com/anthropics-andrej-karpathy-says-the-external-world-has-seen-the-preview-of-what-ai-can-actually-do/",
  },
  {
    date: "2026-10-07",
    tag: "watching",
    zh: {
      title: "能在筆電上跑 AI agent 的新一代電腦",
      what: "NVIDIA 與微軟推出 RTX Spark 筆電平台，最高 128GB 統一記憶體，主打在本機跑 AI。微軟 Surface Laptop Ultra 是其中一款。",
      took: "我們的判斷：現在拖慢工作的是記憶體不夠，不是缺顯卡；先換記憶體夠的商務筆電，重的 3D 工作需要時再租雲端算力。",
    },
    en: {
      title: "A new class of laptops built to run AI agents locally",
      what: "NVIDIA and Microsoft launched the RTX Spark laptop platform, up to 128GB of unified memory, aimed at running AI on the device. Microsoft's Surface Laptop Ultra is one of them.",
      took: "Our call: what slows our work today is memory, not a missing GPU. A business laptop with enough memory first; rent cloud compute for heavy 3D when it's needed.",
    },
    source: "https://nvidianews.nvidia.com/news/nvidia-microsoft-windows-pcs-agents-rtx-spark",
  },
  {
    date: "2026-09-29",
    tag: "watching",
    zh: {
      title: "有自己雲端電腦、會一直工作的 AI agent",
      what: "OpenAI 推出 dots：每個 agent 有自己的雲端電腦和瀏覽器，對話結束後還能繼續做事，重要操作可以設定要人確認。目前只開放給部分付費方案。",
      took: "我們的觀察：agent 越能自己做事，「哪些事要停下來問人」就越重要（本頁第 09 章）。",
    },
    en: {
      title: "Always-on AI agents with their own cloud computer",
      what: "OpenAI launched dots: each agent has its own cloud computer and browser, keeps working after the chat ends, and critical actions can require a person's confirmation. Limited to some paid plans for now.",
      took: "Our take: the more an agent can do on its own, the more \"what must stop and ask a person\" matters (chapter 09).",
    },
    source: "https://thenextweb.com/news/openai-dots-always-on-ai-agents-cloud-computers-devday",
  },
];

export const LATEST_TEXT = {
  zh: { kicker: "LATEST · 每週更新", title: "最新觀察", lead: "每週記下幾則新的 AI 能力：它做到了什麼、我們學到什麼、要不要用。只寫查得到的，附來源。", tags: { inUse: "我們在用", watching: "觀察中" }, source: "來源", took: "我們怎麼看" },
  en: { kicker: "LATEST · weekly", title: "Latest observations", lead: "Each week, a few new AI capabilities: what they do, what we took from them, and whether we use them. Only what can be checked, with sources.", tags: { inUse: "We use this", watching: "Watching" }, source: "Source", took: "Our take" },
};
