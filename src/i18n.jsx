import React, { createContext, useContext, useEffect, useState } from "react";

const dict = {
  zh: {
    brand: "Paul's Tradecraft",
    brandNote: "作品集總覽",
    nav: { works: "作品", services: "商業合作", process: "流程", about: "關於我", contact: "討論商業 Pilot", skipToContent: "跳至主要內容" },
    hero: {
      headlineA: "把商業問題，整理成",
      headlineB: "團隊能推進的",
      headlineHighlight: "決策系統",
      sub: "從海外客戶開發、交易評估到付款與跟進控制，將實務判斷轉成可使用、可驗證的工作流程。",
      ctaPrimary: "討論商業 Pilot",
      ctaSecondary: "查看商業系統",
      imgCaption: "窗簾軟裝 Pilot 追蹤器 · 實際畫面",
      featuredKicker: "Featured business proof",
      featuredHook1: "每張訂單單看都沒問題。",
      featuredHook2: "當付款撞在一起時，會發生什麼？",
      featuredBefore: "USD 83k",
      featuredArrow: "→",
      featuredIncrement: "+ USD 52k 新提案",
      featuredAfter: "USD 135k",
      featuredCaption: "7 天供應商付款承諾",
      featuredDisclosure: "合成範例 · 僅為供應商付款承諾 — 非公司現金餘額或資金缺口。",
      featuredCta: "試試付款原型",
      cddInvite: "有一筆正在評估的商機？帶進來一起看。",
    },
    works: {
      eyebrow: "Selected Works",
      headline: "精選作品",
      sub: "每一件都有證據鏈：可重跑驗證、可檢視產出，不是 PPT 上的口號。",
      sections: { commercial: "精選商業系統", operations: "AI 工作流與營運", labs: "實驗室與實驗" },
      labsNote: "快速把想法變成可運行的軟體並測試。",
      linkPending: "已驗證產物 · 無公開 demo",
      statusVerified: "已驗證",
      verifiedExplain: "「已驗證」＝通過預先定義的功能、回歸、建置與使用性檢查，附可重跑證據鏈 — AI 協作時代的驗證式交付：人決策、AI 產出、證據可複驗。不代表商業採用或市場驗證。",
      caseStudy: {
        label: "案例研究",
        takeaway: "核心判斷",
        problem: "挑戰",
        approach: "我的做法",
        capabilities: "能力展示",
        tools: "技術與 AI",
        result: "成果",
        evidence: "驗證",
      },
    },
    capabilities: {
      eyebrow: "COMMERCIAL ENGAGEMENTS",
      headline: "從一個重要決策開始",
      tagline: "先把商業問題、證據與下一步整理清楚，再決定需要什麼工具與自動化。",
      engagement: {
        eyebrow: "COMMERCIAL SYSTEMS",
        title: "把一個商業瓶頸，變成團隊能推進的工作底稿。",
        summary: "你可以帶一筆海外商機、一段付款壓力，或一個卡住的流程進來。我會先釐清事實、責任與決策邊界，再建立可使用、可驗證的下一步。",
        cta: "討論商業 Pilot",
        offers: [
          {
            title: "Overseas Growth Pilot",
            question: "哪些海外客戶值得投入？",
            output: "證據化的潛在客戶短名單、UNKNOWN 與下一輪研究問題。",
            proof: "Overseas Lead Discovery",
          },
          {
            title: "Deal Readiness Review",
            question: "這筆商機現在能不能推進？",
            output: "CDD 評估、控制因素、Decision Path、Deal Brief 與人類決定邊界。",
            proof: "Commercial Decision Desk",
          },
          {
            title: "Commercial Control Sprint",
            question: "報價與付款承諾會如何影響執行？",
            output: "付款情境、報價版本與跟進控制點，讓承諾和風險可被檢視。",
            proof: "Payment Concentration · Pilot Tracker",
          },
        ],
      },
      supportingHeadline: "支援能力",
      delivery: {
        eyebrow: "從訊號到決策",
        title: "一條可以交給團隊使用的商業工作流程。",
        steps: [
          { number: "01", title: "先確認商機", body: "在投入業務時間前，分開證據、假設與未知。" },
          { number: "02", title: "立起交易結構", body: "把經濟、貿易責任與關鍵缺口放在同一張圖上。" },
          { number: "03", title: "交付決策底稿", body: "留下下一步、證據鏈與人的最終判斷。" },
        ],
        sourceCta: "查看客戶開發流程",
        cddCta: "開啟商務決策工作台",
      },
      demandLab: {
        eyebrow: "SCENARIO READINESS",
        title: "Before automating, test the next commercial question.",
        intro: "We simulate emerging client needs, challenge the assumptions, and keep human review at the point where evidence becomes a decision.",
        cases: [
          { label: "PAYMENT", title: "90-day terms versus a deposit", body: "Expose the commitment, evidence gap, and next negotiation question." },
          { label: "TRADE", title: "A quote without a named delivery place", body: "Clarify responsibility before comparing price or making a promise." },
          { label: "INTAKE", title: "A messy RFQ that needs structure", body: "Propose fields and unknowns for review. Never turn an unverified signal into a decision." },
        ],
        note: "Synthetic scenario design · AI proposes structure · human judgment remains authoritative",
      },
      items: [
        {
          title: "AI Workflow Design",
          desc: "把重複的商業流程，重新設計成 Human + AI 協作流程：從詢問、研究、資料整理、跟進到交付，找出 AI 適合介入的位置，同時保留人工審核與決策權。",
          tags: "Workflow Audit · Human-in-the-loop · Automation · SOP",
        },
        {
          title: "軟裝品牌網站與銷售工具",
          desc: "不是為了多一個網站而做網站。協助窗簾與軟裝品牌把品味、服務、案例與諮詢入口做成清楚的銷售路徑，並建立 LINE、表單、報價、跟進與交付檢查等輔助工具，讓行銷與接單更能推進。",
          tags: "Brand Website · Sales Enablement · LINE · Quote · Follow-up",
        },
        {
          title: "Trade & Business Systems",
          desc: "把實際商業經驗轉成 AI 可執行與輔助的系統：lead qualification、supplier research、quotation preparation、follow-up、evidence tracking。",
          tags: "Lead · Qualify · Research · Quote · Follow-up",
        },
        {
          title: "AI Agent Orchestration",
          desc: "不是只使用一個 AI，而是設計 AI 之間如何協作：以不同 agents 建立 project context、handoff、audit、validation 與可追溯的工作流程。",
          tags: "Agents · Context · Handoff · Audit · Validation",
        },
        {
          title: "台灣市場 × 大陸供應鏈策略",
          desc: "把台灣客戶需求、產品定位與交付標準，串接到大陸端的供應商、打樣、成本、品管與交期協作；協助建立雙供應、風險清單與可落地的採購判斷，讓市場承諾與供應能力一致。",
          tags: "Market Strategy · Supplier Sourcing · QC · Delivery · Dual Sourcing",
        },
        {
          title: "經營策略與決策顧問",
          desc: "結合會計訓練、老闆特助與多年商業諮詢經驗，協助經營者釐清問題、拆解選項與排定行動優先序。策略簡報、客戶案例、單頁提案與執行藍圖都是決策推進的工具；核心是讓事實、假設、風險與下一步清楚可用。",
          tags: "Executive Advisory · Business Strategy · Financial Lens · Decision Support · Execution Roadmap",
        },
      ],
    },
    about: {
      eyebrow: "About Me",
      headline: "專業，偶爾風趣",
      intro: "政大會計系畢業，多年國際貿易總監經驗。",
      narrative: [
        "二十多年，我一直在商業現場。",
        "從製造、財務會計、國際貿易到供應鏈，我長期面對成本、報價、客戶、供應商、付款與風險，也習慣在資訊不完整時做判斷。",
        "AI 不是離開過去，而是讓這些經驗有了新的實現方式。",
        "我把累積的商業判斷，轉化為可執行、可驗證、可追溯的系統。",
      ],
      signature: {
        lead: ["立界 · 賦能 · 證行"],
        support: ["不妄斷，不盲動。", "每一策，皆可追。"],
        secondary: ["HUMAN JUDGMENT.", "AI-POWERED EXECUTION."],
      },
      stats: [
        { value: "955", label: "TOEIC (2019)" },
        { value: "15年", label: "國際貿易總監" },
        { value: "23/23", label: "Pilot 驗證通過" },
      ],
    },
    how: {
      eyebrow: "How I Work",
      headline: "人類主導，AI 加速",
      sub: "這不是黑箱自動化。每一步都由人做決定，AI 負責把工作變快、變可驗證、變可追溯。",
      steps: [
        {
          title: "人類決策",
          desc: "定義商業問題、判斷優先順序、設定邊界。AI 不做決定，人做決定。",
          evidence: "Owner 決策 · 範圍界定",
        },
        {
          title: "AI 協作",
          desc: "Codex、DeepSeek Harness、ChatGPT 分工：研究、實作、驗證各自負責。",
          evidence: "多 agent 分工 · 可追溯",
        },
        {
          title: "人類審核",
          desc: "逐項檢查產出、確認證據、拒絕腦補。不通過就退回重做。",
          evidence: "Review · 驗證 23/23",
        },
        {
          title: "部署上線",
          desc: "通過審核後才部署。GitHub Actions 自動 build 與發布，可回退。",
          evidence: "GitHub Actions · 自動部署",
        },
        {
          title: "冷審計",
          desc: "由另一個 agent 獨立複查成果，就像第三方查帳。發現落差就記錄並修正。",
          evidence: "HANDOFF 對齊 · 證據優先",
        },
      ],
      note: "這個網站本身就是證據：Codex 建立 → DSH 接手 → 人工 review → 部署 → 已完成獨立審計 · PASS。",
    },
    contact: {
      headline: "把你手上卡住的商業問題帶進來",
      sub: "從一筆商機、一段付款壓力或一個流程瓶頸開始，先釐清事實、決策邊界與下一步。",
      cta: "討論商業 Pilot",
      note: "商務合作與專案洽詢",
      line: "LINE 聯絡我",
      onePager: "下載一頁簡介 (PDF)",
      capabilityBrief: "下載能力簡報 (PDF)",
    },
    footer: {
      line: "把貿易實務，做成看得見的工具。",
      rights: "All rights reserved.",
      builtWith: "此站由 Codex → DSH 協作建立並部署，全程可追溯。",
    },
    langLabel: "EN",
  },
  en: {
    brand: "Paul's Tradecraft",
    brandNote: "Portfolio",
    nav: { works: "Work", services: "Commercial Work", process: "Process", about: "About", contact: "Discuss a Commercial Pilot", skipToContent: "Skip to content" },
    hero: {
      headlineA: "Turn commercial problems",
      headlineB: "into systems teams ",
      headlineHighlight: "can act on",
      sub: "From overseas lead qualification to deal review and payment control, I turn commercial judgment into usable, verifiable workflows.",
      ctaPrimary: "Discuss a Commercial Pilot",
      ctaSecondary: "View Commercial Systems",
      imgCaption: "Curtain soft-furnishing pilot tracker · live view",
      featuredKicker: "Featured business proof",
      featuredHook1: "Each order looks manageable.",
      featuredHook2: "What happens when the payments collide?",
      featuredBefore: "USD 83k",
      featuredArrow: "→",
      featuredIncrement: "+ USD 52k proposed deal",
      featuredAfter: "USD 135k",
      featuredCaption: "7-day supplier-payment commitments",
      featuredDisclosure: "Synthetic example · supplier-payment commitments only — not company cash balance or shortfall.",
      featuredCta: "Try the Payment Prototype",
      cddInvite: "Have a live opportunity to review? Bring it in.",
    },
    works: {
      eyebrow: "Selected Works",
      headline: "Selected work",
      sub: "Every piece ships with an evidence chain: rerunnable checks, inspectable outputs, no empty claims.",
      sections: { commercial: "Featured Commercial Systems", operations: "AI Workflow & Operations", labs: "Labs & Experiments" },
      labsNote: "Rapidly turning ideas into working software and testing them.",
      linkPending: "Verified artifact · no public demo",
      statusVerified: "Verified",
      verifiedExplain: "\u201CVerified\u201D = passed defined functional, regression, build, and usability checks, with a rerunnable evidence chain \u2014 a verification-first delivery model for the AI-collaboration era: humans decide, AI builds, evidence re-verifiable. It does not imply commercial adoption or market validation.",
      caseStudy: {
        label: "Case Study",
        takeaway: "Key takeaway",
        problem: "Challenge",
        approach: "Approach",
        capabilities: "Capabilities",
        tools: "Technology & AI",
        result: "Outcome",
        evidence: "Evidence",
      },
    },
    capabilities: {
      eyebrow: "COMMERCIAL ENGAGEMENTS",
      headline: "Start with one decision that matters",
      tagline: "Clarify the commercial problem, evidence, and next move before deciding what to automate or build.",
      engagement: {
        eyebrow: "COMMERCIAL SYSTEMS",
        title: "Turn one commercial bottleneck into a working decision brief.",
        summary: "Bring a live opportunity, payment pressure, or stuck workflow. We clarify the facts, ownership, and decision boundary, then shape a usable and verifiable next step.",
        cta: "Discuss a Commercial Pilot",
        offers: [
          {
            title: "Overseas Growth Pilot",
            question: "Which overseas prospects deserve attention?",
            output: "An evidence-qualified shortlist, explicit unknowns, and the next research questions.",
            proof: "Overseas Lead Discovery",
          },
          {
            title: "Deal Readiness Review",
            question: "Can this opportunity move forward now?",
            output: "CDD assessment, control factors, Decision Path, Deal Brief, and the human decision boundary.",
            proof: "Commercial Decision Desk",
          },
          {
            title: "Commercial Control Sprint",
            question: "How will quotes and payment commitments affect execution?",
            output: "Payment scenarios, quote versions, and follow-up controls that make commitments reviewable.",
            proof: "Payment Concentration · Pilot Tracker",
          },
        ],
      },
      supportingHeadline: "Supporting capabilities",
      delivery: {
        eyebrow: "FROM SIGNAL TO DECISION",
        title: "A commercial workflow you can put in front of a team.",
        steps: [
          { number: "01", title: "Qualify the lead", body: "Separate evidence from assumptions before sales time is committed." },
          { number: "02", title: "Structure the deal", body: "Make economics, trade responsibility, and unknowns visible." },
          { number: "03", title: "Brief the decision", body: "Leave the owner with a next action, evidence trail, and human call." },
        ],
        sourceCta: "See lead qualification",
        cddCta: "Open the decision workbench",
      },
      demandLab: {
        eyebrow: "SCENARIO READINESS",
        title: "在自動化之前，先測試下一個商業問題。",
        intro: "我們先模擬客戶可能帶來的新需求，挑戰其中的假設，並在人證據轉成決策的地方保留人工審查。",
        cases: [
          { label: "付款", title: "90 天帳期，還是先付訂金？", body: "先看承諾暴露、證據缺口與下一個談判問題。" },
          { label: "貿易", title: "報價沒有寫明交付地點。", body: "先釐清責任，再比較價格或做出承諾。" },
          { label: "資料整理", title: "一封混亂的 RFQ 需要被整理。", body: "提出待確認欄位與未知，不把未驗證訊號直接變成決策。" },
        ],
        note: "合成情境設計 · AI 提出結構 · 人的判斷仍是最高權限",
      },
      items: [
        {
          title: "AI Workflow Design",
          desc: "Redesign repetitive business processes into Human + AI collaboration: from inquiry, research, data organization, follow-up to delivery, finding where AI fits while keeping human review and decision authority.",
          tags: "Workflow Audit · Human-in-the-loop · Automation · SOP",
        },
        {
          title: "Soft-Furnishing Brand Sites & Sales Tools",
          desc: "A website is not useful just because it exists. Help curtain and soft-furnishing brands turn their visual language, services, work, and consultation path into a clear sales journey, with supporting LINE, form, quote, follow-up, delivery, and launch-check tools.",
          tags: "Brand Website · Sales Enablement · LINE · Quote · Follow-up",
        },
        {
          title: "Trade & Business Systems",
          desc: "Turn real business experience into systems AI can execute and assist: lead qualification, supplier research, quotation preparation, follow-up, evidence tracking.",
          tags: "Lead · Qualify · Research · Quote · Follow-up",
        },
        {
          title: "AI Agent Orchestration",
          desc: "Design how multiple AIs collaborate, not just use one: project context, handoff, audit, validation, and traceable workflows across different agents.",
          tags: "Agents · Context · Handoff · Audit · Validation",
        },
        {
          title: "Taiwan Market × Mainland Supply-Chain Strategy",
          desc: "Connect Taiwan customer demand, product positioning, and delivery standards with mainland supplier sourcing, sampling, cost, quality control, and lead-time coordination. Build dual-sourcing and risk-management decisions that keep market promises aligned with supply capability.",
          tags: "Market Strategy · Supplier Sourcing · QC · Delivery · Dual Sourcing",
        },
        {
          title: "Executive Strategy & Decision Advisory",
          desc: "Combine accounting training with executive-assistant and business-consulting experience to help leaders clarify problems, weigh options, and set action priorities. Strategy decks, client case briefs, one-pagers, and execution blueprints are decision tools; the core work is making facts, assumptions, risks, and next actions clear and usable.",
          tags: "Executive Advisory · Business Strategy · Financial Lens · Decision Support · Execution Roadmap",
        },
      ],
    },
    about: {
      eyebrow: "About Me",
      headline: "Professional, occasionally witty",
      intro: "Accounting degree from NCCU; years as an international trade director.",
      narrative: [
        "For more than two decades, I’ve worked on the commercial front line.",
        "Across manufacturing, finance, international trade, and supply chains, I’ve dealt with costs, quotations, customers, suppliers, payments, risk, and decisions made with incomplete information.",
        "AI is not a departure from that experience. It is a new way to put it to work.",
        "I turn commercial judgment into executable, verifiable, and traceable systems.",
      ],
      signature: {
        lead: ["Judgment defines the boundary.", "AI amplifies capability.", "Evidence determines action."],
        support: ["Less automation for its own sake.", "Less guessing. Better decisions."],
      },
      stats: [
        { value: "955", label: "TOEIC (2019)" },
        { value: "15 years", label: "Trade director" },
        { value: "23/23", label: "Pilot checks passed" },
      ],
    },
    how: {
      eyebrow: "How I Work",
      headline: "Human-led, AI-accelerated",
      sub: "This is not black-box automation. Humans make every decision; AI makes the work faster, verifiable, and traceable.",
      steps: [
        {
          title: "Human decides",
          desc: "Define the business problem, prioritize, set boundaries. AI never decides; people decide.",
          evidence: "Owner decisions · Scope",
        },
        {
          title: "AI collaborates",
          desc: "Codex, DeepSeek Harness, and ChatGPT split the work: research, implementation, verification.",
          evidence: "Multi-agent · Traceable",
        },
        {
          title: "Human reviews",
          desc: "Check every output, confirm evidence, reject fabrication. Fail means back to work.",
          evidence: "Review · 23/23 verified",
        },
        {
          title: "Deploy",
          desc: "Ship only after review passes. GitHub Actions builds and publishes automatically, fully reversible.",
          evidence: "GitHub Actions · Auto-deploy",
        },
        {
          title: "Cold audit",
          desc: "An independent agent re-checks the result like a third-party audit. Discrepancies are recorded and fixed.",
          evidence: "Handoff alignment · Evidence-first",
        },
      ],
      note: "This site is its own evidence: Codex built it, DSH took over, a human reviewed, it deployed, and Independent Audit · PASS.",
    },
    contact: {
      headline: "Bring one commercial bottleneck",
      sub: "Start with a live opportunity, payment pressure, or workflow that needs a clearer next decision.",
      cta: "Discuss a Commercial Pilot",
      note: "Business inquiries & collaboration",
      line: "Contact on LINE",
      onePager: "Download one-pager (PDF)",
      capabilityBrief: "Download capability brief (PDF)",
    },
    footer: {
      line: "Turning trade practice into visible tools.",
      rights: "All rights reserved.",
      builtWith: "This site was built and deployed through Codex → DSH collaboration, fully traceable.",
    },
    langLabel: "繁中",
  },
};

const LangContext = createContext({ lang: "zh", t: dict.zh, toggle: () => {} });

// 語言切換時同步 <html lang> 與 <title>（SEO / a11y）
const titles = {
  zh: "Paul's Tradecraft · 作品集總覽",
  en: "Paul's Tradecraft · Portfolio",
};
const ogDescriptions = {
  zh: "國際貿易總監的作品集：用 AI 協作把貿易實務工具化。窗簾 Pilot 追蹤器、簡報管線、遊戲化學習。",
  en: "A trade director's portfolio: turning trade practice into practical tools with AI collaboration.",
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState("zh");
  const t = dict[lang];
  const toggle = () => setLang((l) => (l === "zh" ? "en" : "zh"));

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.title = titles[lang];
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", titles[lang]);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", ogDescriptions[lang]);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// 供自動化腳本（onepager 產生器）讀取資料
export { dict };
