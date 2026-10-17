// Existing AI Lab text is read, never modified. Adaptations belong only to this work.
import { TEXT, LINKS } from "../../ai-lab/content.js";
export { TEXT as LAB_TEXT, LINKS };
export const TIER_IDS = ["none", "chat", "work", "lab"];
export const ROLE_IDS = ["data", "planning", "sales", "owner"];
export const COPY = {
  zh: {
    skip: "跳至內容", title: ["交辦之後，", "誰來檢查？"],
    eyebrow: "把事情交出去，把判斷留在手上", lead: "多數人用 AI 還停在聊天；只有少數人把真正的工作交給 AI 代理人（AI agent）。往下看看差別。",
    demo: "示範／成效未驗證。示範畫面，不是真實模型的輸出。", "your-turn": "第一幕｜你在漏斗的哪一層？", pick: "哪一層最像你？點一下，不是測驗。", begin: "看看你的工作怎麼交辦 ↗",
    funnelTitle: "同一個世界，不同的使用經驗", diagram: "示意，非比例圖；不代表能力評分。",
    counts: ["約 60 億人", "約 10–20 億人", "約 2,000 萬人", "約 5,000 人"],
    sourceSummary: "Andrej Karpathy 2026 年 10 月在 X 上的個人估計，據媒體報導；沒有調查資料。", report: "報導", original: "原文（X）",
    replies: { none: "很多人和你一樣。先試一次：把一件事交辦出去，再親手檢查。", work: "你已經在交辦了。這次看看，你會在哪一步停下來核對。" },
    rolesEyebrow: "第二幕｜找到你的位置", rolesTitle: "你每天重複的工作，哪一件可以先交出去？", rolesLead: "選最像你的職位，看看 AI 代理人先做什麼、你在哪裡把關。這些都是虛構示範。",
    roleSelected: "你選的是", agentTag: "代理人", toolTag: "工具", humanTag: "人", roleFields: ["以前", "交給 AI 代理人", "你只要做", "停下來問人", "看得見的差別 · 示範"],
    roles: {
      data: { name: "資料員／會計／出納", teaser: "重複登錄與對帳", fields: ["逐筆登錄試算表，把多張表合起來、比對並製作報表。", "用試算表工具整理欄位、比對資料，先標出不一致的列。", "看例外、查原始憑證，再決定是否簽核。", "改帳或付款前，須由有權的人核准。", "示範：以前逐筆對 200 列；代理人先標出 3 列對不上，人集中核對這 3 列。這不是實測省時數字。"] },
      planning: { name: "企劃", teaser: "公開資料整理", fields: ["逐頁搜尋公開網站與論壇，剪貼線索並整理摘要。", "用搜尋工具整理公開頁面，草擬一份逐條附來源的摘要。", "回到原始頁面，判斷說法是否可信、是否適用。", "對外引用或提出主張前，由人核對來源。", "示範：摘要把每條說法連回來源；人能直接剔除沒有依據的句子。"] },
      sales: { name: "業務", teaser: "海外候選買家", fields: ["一家一家查公司，手動記下誰可能需要產品。", "從公開資料或 B2B 名單資料庫工具整理有來源的候選買家名單。", "判斷先談誰、要先釐清什麼、如何接觸。", "寄出第一封訊息前，由人檢查對象與說法。", "示範：候選名單旁列出入選原因和待問問題；人先挑值得談的對象。"] },
      owner: { name: "負責人", teaser: "把各部門結果放在一頁", fields: ["每天分別讀各部門回報，自己找出相互衝突與仍待確認的事。", "用文件與資料工具把回報彙整成一頁，標出來源與缺口。", "決定先處理什麼，以及哪些條件可以承諾。", "報價、交期與對外寄出，須由公司授權的人點頭。", "示範：一頁同時列出可確認的資訊與待決事項；人不必把『尚未確認』誤當成承諾。"] },
    },
    buyerWork: "看看「海外客戶開發」怎麼挑買家 ↗", roleContinue: "親手檢查一次 ↗", roleContinueOwner: "直接去檢查 ↗", roleBridge: "接下來用同一封虛構詢價，練習在承諾前攔下一句錯話。",
    glossarySummary: "幾個詞，用白話說清楚", glossary: [
      ["AI 代理人", "會拆步驟、使用工具並整理結果；遇到權限邊界要停下來問人。"],
      ["工具使用", "讓代理人讀取允許的資料或操作工具；可用什麼由人設定。"],
      ["人在迴路中", "價格、交期等關鍵決定由有權的人確認。"],
      ["權限邊界", "先說清楚哪些事可做、哪些事動手前要問人。"],
      ["AI 原生工作流", "先把工作拆成代理人做的步驟與人把關的檢查點，再選工具。"],
    ],
    task: "第三幕｜親手檢查一次", taskTitle: "「客戶寄來一封詢價信，幫我回。」", chat: "聊天版", delegate: "換成一個可檢查的交辦 →", fixed: "以下是預先寫好的虛構示範，不會呼叫 AI 或寄出訊息。",
    workflow: "把過程攤開來", showAll: "直接看全部", stepNames: ["讀信", "查規格與舊報價", "找缺口", "整理", "核對", "承諾與寄出"], stepActors: ["代理人", "代理人＋工具", "代理人", "代理人", "人", "人"],
    reviewTitle: "先別放行。哪一句超過了資料？", reviewHint: "對照來源資料，點一句需要你攔下來的話。",
    sourceLabel: "虛構來源資料", sourceTitle: "我們手上只有這些", sourceFoot: "沒有記錄的，不能自動變成確認過的。",
    facts: ["常規款：可提供資料。", "顏色與包裝：待買家確認。", "交期：待工廠確認。"],
    outputLabel: "預寫的整理結果", outputTitle: "請你逐句核對", claims: ["常規款：可提供資料。", "顏色與包裝：待買家確認。", "交期：已確認，可安排。"],
    feedback: ["這句與來源一致。再看看，有沒有哪一句把未知寫成了確定？", "這句與來源一致，仍保留待確認。再找找另一句。", "找到了。來源只寫「待工廠確認」，整理卻變成「已確認」。這一步還不能放行。"],
    correct: "改回待確認", corrected: "交期：待工廠確認。", correctedFeedback: "已改回待確認。接著仍需要人核對價格與交期。",
    completeLabel: "你站上了檢查點", completeTitle: "交辦完成了，承諾還沒有。", completeBody: "AI 代理人可以把重複的工作先做完；人定目標、守住承諾的那條線，並在檢查點把關。", hold: "停在這裡：價格與交期，待人確認。沒有寄出。", noLevel: "這是一段練習，不代表你被評為另一個使用層級。", madeWith: "這件作品的策劃、插畫、程式與測試，是一個人帶著幾個 AI 代理人分工完成的。",
    lab: "回 AI Lab，看完整做法 ↗", portfolio: "回首頁看商務作品", restart: "重新練習", footer: "虛構互動示範。每一句都可核對，不代表真實模型表現。", home: "回作品集",
  },
  en: {
    skip: "Skip to content", title: ["You delegated it.", "Who checks it?"],
    eyebrow: "Hand over the task. Keep hold of the judgment.", lead: "Most people still use AI to chat. Far fewer hand real work to an AI agent. See what changes when they do.",
    demo: "Demo / outcomes not validated. An illustration, not output from a real model.", "your-turn": "Act one | Where are you in the funnel?", pick: "Which sounds like you? Pick one. This isn't a test.", begin: "See what you could hand over ↗",
    funnelTitle: "One world, different experiences", diagram: "Illustrative, not to scale. Not an ability rating.",
    counts: ["About 6 billion", "About 1–2 billion", "About 20 million", "About 5,000"],
    sourceSummary: "Andrej Karpathy's personal estimates on X, October 2026, as reported by the media. No survey data.", report: "Report", original: "Original (X)",
    replies: { none: "Plenty of people are here. Try handing over a task, then checking it yourself.", work: "You already delegate. This time, notice where you stop to check." },
    rolesEyebrow: "Act two | Find your place", rolesTitle: "Which repetitive task could you hand over first?", rolesLead: "Pick the role closest to yours. See what an AI agent could prepare and where you would check it. These are fictional examples.",
    roleSelected: "You chose", agentTag: "Agent", toolTag: "Tool", humanTag: "Person", roleFields: ["Before", "Hand to the AI agent", "Your part", "Stop and ask a person", "The visible difference · demo"],
    roles: {
      data: { name: "Data / accounting / treasury", teaser: "Entries, reconciliations and reports", fields: ["Enter records in a spreadsheet, combine tables, reconcile rows and prepare reports.", "Use spreadsheet tools to align columns, compare entries and flag mismatches.", "Review exceptions against source records, then decide whether to approve.", "Changes to accounts or payments need approval from an authorised person.", "Demo: instead of checking 200 rows one by one, the agent flags 3 mismatches for a person to investigate. This is not a measured time saving."] },
      planning: { name: "Planning", teaser: "Research from public sources", fields: ["Search public sites and forums page by page, collecting notes for a summary.", "Use search tools to prepare a summary that links each claim to its source.", "Open the original pages and decide what is credible and relevant.", "A person checks the sources before anything is cited externally.", "Demo: each claim points back to a source, so a person can remove unsupported lines."] },
      sales: { name: "Sales", teaser: "Potential overseas buyers", fields: ["Look up companies one at a time and note who might need the product.", "Use public sources or a B2B buyer-list database tool to prepare a sourced list of potential buyers.", "Decide whom to approach first, what to clarify and how to begin.", "A person checks the recipient and wording before any first message is sent.", "Demo: each name comes with a reason for inclusion and questions still to ask; a person chooses whom to pursue."] },
      owner: { name: "Decision-maker", teaser: "Bring department updates together", fields: ["Read department reports separately and find conflicting or unresolved points.", "Use documents and data tools to bring updates onto one page, with sources and gaps visible.", "Decide what to tackle first and which terms can be committed to.", "A company-authorised person approves quotes, lead times and any external message.", "Demo: one page distinguishes confirmed information from pending decisions; a person does not mistake a gap for a promise."] },
    },
    buyerWork: "See how Overseas Lead Discovery picks buyers ↗", roleContinue: "Check one yourself ↗", roleContinueOwner: "Go straight to the check ↗", roleBridge: "Next, use the same fictional enquiry to stop one unsupported line before a commitment is made.",
    glossarySummary: "A few terms in plain language", glossary: [
      ["AI agent", "Breaks a task into steps, uses tools and prepares a result; stops at a permission boundary."],
      ["Tool use", "Lets an agent read approved information or operate a permitted tool. A person sets the limits."],
      ["Human in the loop", "An authorised person confirms key decisions such as price and lead time."],
      ["Permission boundary", "The agreed line between actions an agent may take and those that need approval first."],
      ["AI-native workflow", "Start by separating agent steps from human checkpoints, then choose the tools."],
    ],
    task: "Act three | Check one yourself", taskTitle: '“A customer sent an enquiry. Reply to it.”', chat: "The chat version", delegate: "Make it a task you can check →", fixed: "A fictional, prewritten example. No AI is called and no message is sent.",
    workflow: "Lay the process out", showAll: "Show it all", stepNames: ["Read enquiry", "Check specs and old quotes", "Find gaps", "Organise", "Review", "Commit and send"], stepActors: ["Agent", "Agent + tool", "Agent", "Agent", "Person", "Person"],
    reviewTitle: "Before you let it through: which line goes beyond the evidence?", reviewHint: "Compare the source with the result. Select the line you need to stop.",
    sourceLabel: "Fictional source material", sourceTitle: "This is all we have", sourceFoot: "An absent record cannot become a confirmation.",
    facts: ["Standard range: information available.", "Colour and packing: awaiting buyer confirmation.", "Lead time: awaiting factory confirmation."],
    outputLabel: "Prewritten result", outputTitle: "Check each line", claims: ["Standard range: information available.", "Colour and packing: awaiting buyer confirmation.", "Lead time: confirmed, ready to arrange."],
    feedback: ["This matches the source. Can you find a line that turns an unknown into a certainty?", "This matches the source and keeps confirmation pending. Look at another line.", 'You found it. The source says “awaiting factory confirmation”, but the result says “confirmed”. This cannot go through yet.'],
    correct: "Keep it unconfirmed", corrected: "Lead time: awaiting factory confirmation.", correctedFeedback: "Confirmation is pending again. A person still needs to check the price and lead time.",
    completeLabel: "You took the review point", completeTitle: "The task is done. The commitment isn't.", completeBody: "An AI agent can prepare repetitive work. A person sets the goal, owns the commitment and checks at the handover point.", hold: "Stop here: price and lead time await human confirmation. Nothing has been sent.", noLevel: "This is a practice exercise, not a promotion to another user tier.", madeWith: "This work's planning, illustration, code and tests were made by one person working with several AI agents.",
    lab: "Back to AI Lab for the full approach ↗", portfolio: "Back to the business work", restart: "Try again", footer: "A fictional interactive example. Checkable lines, not evidence of real model performance.", home: "Back to the portfolio",
  },
};

// Guests who talk beside the work (Paul 2026-10-18): Trade Street people keep their own jobs and drop in with a tip;
// Bro Fred is the sales voice; the ROOMVERSE robot plays the AI agent. Lines are CC drafts for Paul to tune.
const AVATAR = "./assets/cast/";
export const GUESTS = {
  zh: {
    roles: {
      data: { img: `${AVATAR}broker-avatar.webp`, name: "單單", from: "貿易街的報關", tip: "對帳最怕的不是錯，是沒看見錯。讓代理人先把那三列找出來，我把最後一眼留給它們。" },
      planning: { img: `${AVATAR}guide-avatar.webp`, name: "玉仔", from: "貿易街的導覽員", tip: "論壇裡的話都很熱鬧。代理人幫每一句附上出處，熱鬧就變成了線索。" },
      sales: { img: `${AVATAR}sales-avatar.webp`, name: "福哥", from: "業務", tip: "名單可以交給代理人找，第一句話我想自己說。客人聽得出來，誰真的懂他的貨。" },
      owner: { img: `${AVATAR}factory-avatar.webp`, name: "老廠", from: "貿易街的工廠", tip: "十份回報收成一頁，很省事。但這一頁上哪一句能答應客人，還是我點頭才算。" },
    },
    robot: { img: `${AVATAR}robot-avatar.webp`, name: "小機器人", from: "AI 代理人 · 來自 ROOMVERSE",
      before: "我整理好了。不過有一句，我可能說得太滿了——你幫我看看？",
      after: "謝謝你攔下來。「已確認」這三個字，不該由我自己寫。" },
  },
  en: {
    roles: {
      data: { img: `${AVATAR}broker-avatar.webp`, name: "The Broker", from: "Customs broker on Trade Street", tip: "The worst thing in a reconciliation isn't a mistake. It's the mistake you never see. Let the agent find those three rows; I'll save my last look for them." },
      planning: { img: `${AVATAR}guide-avatar.webp`, name: "Yuzai", from: "Your guide on Trade Street", tip: "Forums are noisy. Once the agent puts a source on every line, the noise turns into leads." },
      sales: { img: `${AVATAR}sales-avatar.webp`, name: "Bro Fred", from: "Sales", tip: "The agent can find the list. The first sentence I want to say myself. Buyers can tell who really knows their goods." },
      owner: { img: `${AVATAR}factory-avatar.webp`, name: "The Factory Head", from: "Factory on Trade Street", tip: "Ten reports on one page saves time. But which line on it I can promise a customer only counts once I nod." },
    },
    robot: { img: `${AVATAR}robot-avatar.webp`, name: "Little Robot", from: "AI agent · from ROOMVERSE",
      before: "I've sorted it all. But one line may say more than I know. Could you check it for me?",
      after: "Thanks for stopping it. “Confirmed” isn't a word I should write by myself." },
  },
};
