import React, { createContext, useContext, useEffect, useState } from "react";

const dict = {
  zh: {
    brand: "Paul's Tradecraft",
    brandNote: "作品集總覽",
    nav: { works: "作品", services: "服務", process: "流程", about: "關於我", contact: "聯絡我" },
    hero: {
      headlineA: "把貿易實務，",
      headlineB: "做成看得見的工具",
      sub: "國際貿易總監 × AI 協作：以品牌網站、銷售工具與可驗證流程，讓行銷、諮詢、報價與跟進更清楚。",
      ctaPrimary: "看作品",
      ctaSecondary: "認識我",
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
    },
    works: {
      eyebrow: "Selected Works",
      headline: "精選作品",
      sub: "每一件都有證據鏈：可重跑驗證、可檢視產出，不是 PPT 上的口號。",
      linkPending: "PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED",
      statusVerified: "已驗證",
      caseStudy: {
        label: "案例研究",
        takeaway: "核心判斷",
        problem: "挑戰",
        approach: "我的做法",
        tools: "技術與 AI",
        result: "成果",
        evidence: "驗證",
      },
    },
    capabilities: {
      eyebrow: "Services",
      headline: "我能幫你解決什麼",
      tagline: "把商業問題，轉化成 AI 可以參與、人工可以掌控、真正能運作的流程與產品。",
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
      ],
    },
    about: {
      eyebrow: "About Me",
      headline: "專業，偶爾風趣",
      intro: "政大會計系畢業，多年國際貿易總監經驗。",
      body: "我用 AI 協作把貿易實務變成可交付的工具。風格是：專業，偶爾風趣；數字有據，說法不誇。",
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
      headline: "一起做點有用的東西",
      sub: "不管是貿易流程、簡報還是工具，談談你手上卡住的事。",
      cta: "聯絡我",
      callCta: "預約聊聊",
      callSubject: "想約時間聊聊合作",
      note: "paulchen1978@gmail.com",
      onePager: "下載一頁簡介 (PDF)",
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
    nav: { works: "Work", services: "Services", process: "Process", about: "About", contact: "Contact" },
    hero: {
      headlineA: "Turning trade practice",
      headlineB: "into visible tools",
      sub: "Trade director × AI collaboration: brand sites, sales tools, and verifiable workflows that clarify marketing, consultation, quoting, and follow-up.",
      ctaPrimary: "See the work",
      ctaSecondary: "About me",
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
    },
    works: {
      eyebrow: "Selected Works",
      headline: "Selected work",
      sub: "Every piece ships with an evidence chain: rerunnable checks, inspectable outputs, no empty claims.",
      linkPending: "PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED",
      statusVerified: "Verified",
      caseStudy: {
        label: "Case Study",
        takeaway: "Key takeaway",
        problem: "Challenge",
        approach: "Approach",
        tools: "Technology & AI",
        result: "Outcome",
        evidence: "Evidence",
      },
    },
    capabilities: {
      eyebrow: "Services",
      headline: "What I can help with",
      tagline: "I turn business problems into AI-assisted workflows, prototypes, and working systems.",
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
      ],
    },
    about: {
      eyebrow: "About Me",
      headline: "Professional, occasionally witty",
      intro: "Accounting degree from NCCU; years as an international trade director.",
      body: "I use AI collaboration to turn trade practice into shippable tools. Style: professional, occasionally witty; numbers with receipts, claims without fluff.",
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
      headline: "Let's build something useful",
      sub: "Trade flows, decks, or tools: tell me what is stuck on your desk.",
      cta: "Contact",
      callCta: "Book a chat",
      callSubject: "Scheduling a conversation",
      note: "paulchen1978@gmail.com",
      onePager: "Download one-pager (PDF)",
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
