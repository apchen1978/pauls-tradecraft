// Existing AI Lab text is read, never modified. Adaptations belong only to this work.
import { TEXT, LINKS } from "../../ai-lab/content.js";
export { TEXT as LAB_TEXT, LINKS };
export const TIER_IDS = ["none", "chat", "work", "lab"];
export const COPY = {
  zh: {
    skip: "跳至內容", title: ["交辦之後，", "誰來檢查？"],
    eyebrow: "把事情交出去，把判斷留在手上", lead: "先選自己的使用經驗，再用一封詢價，試著從聊天走到交辦與檢查。",
    demo: "示範／成效未驗證。示範畫面，不是真實模型的輸出。", "your-turn": "你的起點", pick: "哪一層最像你？點一下，不是測驗。", begin: "試著交辦一件事 ↗",
    funnelTitle: "同一個世界，不同的使用經驗", diagram: "示意，非比例圖；不代表能力評分。",
    counts: ["約 60 億人", "約 10–20 億人", "約 2,000 萬人", "約 5,000 人"],
    sourceSummary: "Andrej Karpathy 2026 年 10 月在 X 上的個人估計，據媒體報導；沒有調查資料。", report: "報導", original: "原文（X）",
    replies: { none: "很多人和你一樣。先試一次：把一件事交辦出去，再親手檢查。", work: "你已經在交辦了。這次看看，你會在哪一步停下來核對。" },
    task: "同一件事，換一種交法", taskTitle: "「客戶寄來一封詢價信，幫我回。」", chat: "聊天版", delegate: "換成一個可檢查的交辦 →", fixed: "以下是預先寫好的虛構示範，不會呼叫 AI 或寄出訊息。",
    workflow: "把過程攤開來", showAll: "直接看全部", stepNames: ["讀信", "查資料", "找缺口", "整理", "交給你核對", "停下來"],
    reviewTitle: "先別放行。哪一句超過了資料？", reviewHint: "對照來源資料，點一句需要你攔下來的話。",
    sourceLabel: "虛構來源資料", sourceTitle: "我們手上只有這些", sourceFoot: "沒有記錄的，不能自動變成確認過的。",
    facts: ["常規款：可提供資料。", "顏色與包裝：待買家確認。", "交期：待工廠確認。"],
    outputLabel: "預寫的整理結果", outputTitle: "請你逐句核對", claims: ["常規款：可提供資料。", "顏色與包裝：待買家確認。", "交期：已確認，可安排。"],
    feedback: ["這句與來源一致。再看看，有沒有哪一句把未知寫成了確定？", "這句與來源一致，仍保留待確認。再找找另一句。", "找到了。來源只寫「待工廠確認」，整理卻變成「已確認」。這一步還不能放行。"],
    correct: "改回待確認", corrected: "交期：待工廠確認。", correctedFeedback: "已改回待確認。接著仍需要人核對價格與交期。",
    completeLabel: "你站上了檢查點", completeTitle: "交辦完成了，承諾還沒有。", completeBody: "你剛剛完成了一次交辦與檢查。AI 可以先整理，對外承諾仍要人確認。", hold: "停在這裡：價格與交期，待人確認。沒有寄出。", noLevel: "這是一段練習，不代表你被評為另一個使用層級。",
    lab: "回 AI Lab，看完整做法 ↗", restart: "重新練習", footer: "虛構互動示範。每一句都可核對，不代表真實模型表現。", home: "回作品集",
  },
  en: {
    skip: "Skip to content", title: ["You delegated it.", "Who checks it?"],
    eyebrow: "Hand over the task. Keep hold of the judgment.", lead: "Choose the experience that sounds like yours. Then use one enquiry to try delegating and checking.",
    demo: "Demo / outcomes not validated. An illustration, not output from a real model.", "your-turn": "Your starting point", pick: "Which sounds like you? Pick one. This isn't a test.", begin: "Try handing over a task ↗",
    funnelTitle: "One world, different experiences", diagram: "Illustrative, not to scale. Not an ability rating.",
    counts: ["About 6 billion", "About 1–2 billion", "About 20 million", "About 5,000"],
    sourceSummary: "Andrej Karpathy's personal estimates on X, October 2026, as reported by the media. No survey data.", report: "Report", original: "Original (X)",
    replies: { none: "Plenty of people are here. Try handing over a task, then checking it yourself.", work: "You already delegate. This time, notice where you stop to check." },
    task: "The same task, a different handover", taskTitle: '“A customer sent an enquiry. Reply to it.”', chat: "The chat version", delegate: "Make it a task you can check →", fixed: "A fictional, prewritten example. No AI is called and no message is sent.",
    workflow: "Lay the process out", showAll: "Show it all", stepNames: ["Read", "Look up", "Find gaps", "Organise", "Your review", "Stop"],
    reviewTitle: "Before you let it through: which line goes beyond the evidence?", reviewHint: "Compare the source with the result. Select the line you need to stop.",
    sourceLabel: "Fictional source material", sourceTitle: "This is all we have", sourceFoot: "An absent record cannot become a confirmation.",
    facts: ["Standard range: information available.", "Colour and packing: awaiting buyer confirmation.", "Lead time: awaiting factory confirmation."],
    outputLabel: "Prewritten result", outputTitle: "Check each line", claims: ["Standard range: information available.", "Colour and packing: awaiting buyer confirmation.", "Lead time: confirmed, ready to arrange."],
    feedback: ["This matches the source. Can you find a line that turns an unknown into a certainty?", "This matches the source and keeps confirmation pending. Look at another line.", 'You found it. The source says “awaiting factory confirmation”, but the result says “confirmed”. This cannot go through yet.'],
    correct: "Keep it unconfirmed", corrected: "Lead time: awaiting factory confirmation.", correctedFeedback: "Confirmation is pending again. A person still needs to check the price and lead time.",
    completeLabel: "You took the review point", completeTitle: "The task is done. The commitment isn't.", completeBody: "You have worked through delegation and review. AI can organise the information; a person still needs to confirm any commitment.", hold: "Stop here: price and lead time await human confirmation. Nothing has been sent.", noLevel: "This is a practice exercise, not a promotion to another user tier.",
    lab: "Back to AI Lab for the full approach ↗", restart: "Try again", footer: "A fictional interactive example. Checkable lines, not evidence of real model performance.", home: "Back to the portfolio",
  },
};
