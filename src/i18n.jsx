import React, { createContext, useContext, useEffect, useState } from "react";

const dict = {
  zh: {
    brand: "Paul's Tradecraft",
    brandNote: "作品集總覽",
    nav: { works: "作品", services: "商業合作", verification: "驗證", method: "方法", process: "流程", about: "關於我", contact: "討論商業 Pilot", skipToContent: "跳至主要內容" },
    hero: {
      headlineA: "把商業問題，整理成",
      headlineB: "團隊能推進的",
      headlineHighlight: "決策系統",
      sub: "從客戶開發、品牌網站、交易評估到付款與跟進控制，將實務判斷轉成可使用、可驗證的工作流程。",
      ctaPrimary: "了解交易審視服務",
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
      sections: {
        commercial: "精選商業系統",
        operations: "營運與交付流程",
        labs: "實驗與探索",
        notes: {
          commercial: "把商業問題整理成可使用、可驗證的工作系統。",
          operations: "支援交付、跟進與日常營運的工作流程。",
          labs: "保留技術廣度、好奇心與快速實作能力。",
        },
      },
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
    dealReadiness: {
      kicker: "Deal Readiness Review",
      headline: "帶一筆正在談的海外商機，換回承諾前的清楚判斷。",
      intro: "把分散在買方、RFQ、報價、付款與交期裡的資訊，整理成老闆和業務團隊能一起檢視的交易決策包。",
      whenTitle: "適合什麼時候使用",
      when: "準備報價、打樣、出差，或正在談付款條件，但還不確定是否值得再投入更多業務、採購或資金資源時。",
      bringTitle: "帶什麼進來",
      bring: "買方連結、RFQ、報價或成本概算、付款與交期條件即可。資料不完整沒關係，缺口會被保留為 UNKNOWN。",
      boundaryTitle: "這不是什麼",
      boundary: "它不取代完整財務、法務、合規或信用盡職調查，也不替 owner 做最終承諾。",
      cta: "討論商業 Pilot",
      demoCta: "先查看 CDD Demo",
      packLabel: "你會留下的交付包",
      packTitle: "一份能帶進下一次會議的 Deal Readiness Pack",
      packIntro: "不是一份漂亮的摘要，而是讓下一輪商業行動、證據與承諾界線都能被討論的工作底稿。",
      snapshotAlt: "Commercial Decision Desk 的交易決策摘要畫面",
      snapshotCaption: "現有 CDD Executive Snapshot 範例。缺少的資料會維持 UNKNOWN，不會被補成事實。",
      outputs: [
        { title: "目前交易位置", body: "把目前建議、控制因素與尚未能承諾的事項放在同一個決策畫面。" },
        { title: "需要確認的交易結構", body: "釐清付款、交付責任、淨貢獻、決策權與其他會影響承諾的證據缺口。" },
        { title: "下一輪的行動與人的決定", body: "整理下一次會議該問什麼、取得什麼證據、何時重跑評估，以及最後仍需由誰拍板。" },
      ],
      packBoundary: "交付內容依當前可確認的證據而定。系統建議、UNKNOWN 與人的最終決定會被清楚分開。",
    },
    verification: {
      eyebrow: "HOW IT'S VERIFIED",
      headline: "每一件作品如何驗證",
      intro: "不是「我說的」——是可重跑的檢查、誠實的未知與可對照的數字。以下為目前作品的驗證方式摘要。",
      works: {
        cdd: "Commercial Decision Desk",
        lead: "AI 海外客戶開發",
        trade: "AI Trade Deal Desk",
        payment: "Payment Concentration",
        mori: "MORI 軟裝品牌網站",
        tracker: "窗簾軟裝 Pilot 追蹤器",
      },
      method: {
        cdd: "確定性規則引擎，可重跑驗證；UNKNOWN 保留",
        lead: "匿名代表性資料；來源分層，無捏造事實",
        trade: "確定性規則，可重跑驗證",
        payment: "canonical fixture 精確匹配；逐幣別不混算",
        mori: "本機可檢視的交付基礎；後續工具待客戶補齊",
        tracker: "Pilot 工作流程驗證",
      },
      boundary: "驗證證明的是工具行為與紀律，不是商業成效；不包含客戶成果、ROI 或採用率宣稱。",
    },
    methods: {
      eyebrow: "METHODOLOGY",
      headline: "方法論：怎麼判斷、怎麼談、怎麼承諾",
      intro: "這些文章不是我「相信」的——是工具裡寫下的紀律，從商業流程與工具設計整理出來。每篇都可以追溯到可運作的工作方式。",
      read: "讀全文",
      collapse: "收合",
      disclosure: "方法論分享；不涉及法律意見，亦不宣稱任何客戶成效。",
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
        eyebrow: "商業交付路徑",
        title: "從客戶搜尋，到承諾前的商業判斷。",
        intro: "不是把幾個工具疊在一起，而是讓每一筆商機經過可追溯的發現、確認、判斷、控制與交付。",
        discoveryLabel: "先確認值得投入的對象",
        decisionLabel: "再把承諾前的判斷做清楚",
        steps: [
          { title: "發現候選客戶", body: "從公開資料取得可追溯線索。線索仍是提案，不會被當成已確認的客戶事實。" },
          { title: "確認可用證據", body: "由 owner 逐項確認哪些訊號可進入商機；其餘保留 UNKNOWN 或待驗證。" },
          { title: "評估目前位置", body: "CDD 整理交易結構、控制因素、目前建議與下一個應取得的證據。" },
          { title: "檢視付款與淨貢獻", body: "把付款條件、承諾暴露、收入、成本與風險準備金拆開，在承諾前確認。" },
          { title: "留下決策資產", body: "以 Deal Brief 與 Decision Ledger 分開保存系統建議、人的決定與重新評估條件。" },
        ],
        sourceCta: "查看客戶開發流程",
        cddCta: "開啟商務決策工作台",
        paymentCta: "查看付款承諾原型",
        boundary: "目前為人工確認與檔案交接流程，不是 CRM、即時客戶資料系統或自動決策服務。",
      },
      demandLab: {
        eyebrow: "情境準備度",
        title: "在自動化之前，先測試下一個商業問題。",
        intro: "我們先模擬客戶可能帶來的新需求，挑戰其中的假設，並在證據轉成決策的地方保留人工審查。",
        cases: [
          { label: "付款條件", title: "90 天帳期，還是先付訂金？", body: "先看承諾暴露、證據缺口與下一個談判問題。" },
          { label: "貿易責任", title: "報價沒有寫明交付地點。", body: "先釐清責任，再比較價格或做出承諾。" },
          { label: "資料整理", title: "一封混亂的 RFQ 需要被整理。", body: "提出待確認欄位與未知，不把未驗證訊號直接變成決策。" },
        ],
        note: "合成情境設計 · AI 提出結構 · 人的判斷仍是最高權限",
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
    nav: { works: "Work", services: "Commercial Work", verification: "Verification", method: "Method", process: "Process", about: "About", contact: "Discuss a Commercial Pilot", skipToContent: "Skip to content" },
    hero: {
      headlineA: "Turn commercial problems",
      headlineB: "into systems teams ",
      headlineHighlight: "can act on",
      sub: "From lead qualification and brand websites to deal review and payment control, I turn commercial judgment into usable, verifiable workflows.",
      ctaPrimary: "See Deal Readiness Review",
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
      sections: {
        commercial: "Featured Commercial Work",
        operations: "Operations & Delivery Workflows",
        labs: "Experiments & Builds",
        notes: {
          commercial: "Commercial problems turned into usable, verifiable systems.",
          operations: "Supporting workflows for delivery, follow-up, and daily operations.",
          labs: "Evidence of technical range, curiosity, and execution speed.",
        },
      },
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
    dealReadiness: {
      kicker: "DEAL READINESS REVIEW",
      headline: "Bring one live overseas deal. Leave with a clear basis before commitment.",
      intro: "Turn the information scattered across the buyer, RFQ, quote, payment terms, and timeline into a deal package the owner and commercial team can review together.",
      whenTitle: "When it helps",
      when: "Before quoting, sampling, travel, or agreeing payment terms, when the team is still unsure whether this deal deserves more sales, sourcing, or cash commitment.",
      bringTitle: "Bring what you have",
      bring: "A buyer link, RFQ, quote or cost estimate, and known payment or delivery terms. Incomplete information is acceptable. Gaps remain UNKNOWN.",
      boundaryTitle: "What it does not replace",
      boundary: "It is not full financial, legal, compliance, or credit due diligence. It does not make the owner's final commitment.",
      cta: "Discuss a Commercial Pilot",
      demoCta: "View the CDD Demo",
      packLabel: "THE DELIVERY",
      packTitle: "A Deal Readiness Pack for the next commercial meeting",
      packIntro: "Not a polished summary. A working decision brief that makes the next action, evidence, and commitment boundary discussable.",
      snapshotAlt: "Commercial Decision Desk executive deal snapshot",
      snapshotCaption: "Existing CDD Executive Snapshot example. Missing information remains UNKNOWN. It is never filled in as fact.",
      outputs: [
        { title: "Current deal position", body: "Put the current recommendation, controlling factors, and items that cannot yet be committed on one decision surface." },
        { title: "Deal structure to verify", body: "Clarify payment, delivery responsibility, net contribution, decision authority, and evidence gaps that affect commitment." },
        { title: "Next action and human call", body: "Prepare the next meeting questions, evidence to obtain, rerun conditions, and the person who still makes the final call." },
      ],
      packBoundary: "The delivery reflects evidence that is currently confirmable. System recommendations, UNKNOWNs, and the final human decision remain distinct.",
    },
    verification: {
      eyebrow: "HOW IT'S VERIFIED",
      headline: "How each piece is verified",
      intro: "Not \"trust me\" — rerunnable checks, honest unknowns, and numbers you can compare. A summary of how the current work is validated.",
      works: {
        cdd: "Commercial Decision Desk",
        lead: "AI-Assisted Overseas Lead Discovery",
        trade: "AI Trade Deal Desk",
        payment: "Payment Concentration",
        mori: "MORI Soft-Furnishing Website",
        tracker: "Curtain Soft-Furnishing Pilot Tracker",
      },
      method: {
        cdd: "Deterministic rules engine, rerunnable; UNKNOWN preserved",
        lead: "Anonymized representative data; tiered sources; no fabricated facts",
        trade: "Deterministic rules, rerunnable",
        payment: "Canonical fixture matches exactly; per-currency, never mixed",
        mori: "Locally verifiable delivery basis; follow-up tools pending client setup",
        tracker: "Pilot workflow validation",
      },
      boundary: "Verification proves tool behavior and discipline, not commercial outcomes. No client results, ROI, or adoption claims are included.",
    },
    methods: {
      eyebrow: "METHODOLOGY",
      headline: "How I judge, negotiate, and commit",
      intro: "These articles are not what I \"believe\" — they are disciplines written into working tools, shaped from commercial workflows and tool design. Each one traces back to a functioning way of working.",
      read: "Read full article",
      collapse: "Collapse",
      disclosure: "Methodology sharing; not legal advice, and no client outcomes are claimed.",
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
        eyebrow: "COMMERCIAL DELIVERY LOOP",
        title: "From customer discovery to a decision before commitment.",
        intro: "This is not a stack of tools. Each opportunity moves through traceable discovery, confirmation, judgment, control, and delivery.",
        discoveryLabel: "Establish who deserves attention",
        decisionLabel: "Make the pre-commitment judgment explicit",
        steps: [
          { title: "Discover candidate buyers", body: "Use traceable public signals. A signal remains a proposal, not a confirmed customer fact." },
          { title: "Confirm usable evidence", body: "The owner confirms which signals can enter an opportunity. Everything else remains UNKNOWN or pending verification." },
          { title: "Assess the current position", body: "CDD structures the deal, control items, current position, and the next evidence to obtain." },
          { title: "Review payment and net contribution", body: "Separate payment terms, commitment exposure, revenue, cost, and contingency before a commitment is made." },
          { title: "Leave a decision asset", body: "Deal Brief and Decision Ledger keep the system recommendation, human decision, and rerun conditions distinct." },
        ],
        sourceCta: "See lead qualification",
        cddCta: "Open the decision workbench",
        paymentCta: "View payment commitment prototype",
        boundary: "The current workflow uses owner confirmation and file-based handoff. It is not a CRM, live customer-data system, or automated decision service.",
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
