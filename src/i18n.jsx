import React, { createContext, useContext, useEffect, useState } from "react";

const dict = {
  zh: {
    brand: "Paul's Tradecraft",
    brandNote: "作品集總覽",
    nav: { works: "作品", services: "服務", about: "關於我", contact: "聯絡我" },
    hero: {
      headlineA: "把貿易實務，",
      headlineB: "做成看得見的工具",
      sub: "國際貿易總監 × AI 協作：報價、追蹤、簡報，件件可驗證、可交付。",
      ctaPrimary: "看作品",
      ctaSecondary: "認識我",
      imgCaption: "窗簾軟裝 Pilot 追蹤器 · 實際畫面",
    },
    works: {
      eyebrow: "Selected Works",
      headline: "精選作品",
      sub: "每一件都有證據鏈：可重跑驗證、可檢視產出，不是 PPT 上的口號。",
      linkPending: "PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED",
      statusVerified: "已驗證",
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
          title: "AI-Native Prototyping",
          desc: "把一個想法快速變成可操作的產品：從需求拆解、prototype 到可部署的 Web App 與 internal tool，用 AI coding agents 加速迭代，不停留在簡報或概念。",
          tags: "Prototype · Web App · Internal Tool · Vibe Coding",
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
    contact: {
      headline: "一起做點有用的東西",
      sub: "不管是貿易流程、簡報還是工具，談談你手上卡住的事。",
      cta: "聯絡我",
      note: "paulchen1978@gmail.com",
    },
    footer: {
      line: "把貿易實務，做成看得見的工具。",
      rights: "All rights reserved.",
    },
    langLabel: "EN",
  },
  en: {
    brand: "Paul's Tradecraft",
    brandNote: "Portfolio",
    nav: { works: "Work", services: "Services", about: "About", contact: "Contact" },
    hero: {
      headlineA: "Turning trade practice",
      headlineB: "into visible tools",
      sub: "Trade director × AI collaboration: quotes, tracking, decks. Every piece is verifiable and shippable.",
      ctaPrimary: "See the work",
      ctaSecondary: "About me",
      imgCaption: "Curtain soft-furnishing pilot tracker · live view",
    },
    works: {
      eyebrow: "Selected Works",
      headline: "Selected work",
      sub: "Every piece ships with an evidence chain: rerunnable checks, inspectable outputs, no empty claims.",
      linkPending: "PUBLIC EVIDENCE: UNKNOWN / NOT YET PUBLISHED",
      statusVerified: "Verified",
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
          title: "AI-Native Prototyping",
          desc: "Turn an idea into a working product fast: from requirements breakdown and prototype to deployable web apps and internal tools, accelerated by AI coding agents instead of staying at the deck or concept stage.",
          tags: "Prototype · Web App · Internal Tool · Vibe Coding",
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
    contact: {
      headline: "Let's build something useful",
      sub: "Trade flows, decks, or tools: tell me what is stuck on your desk.",
      cta: "Contact",
      note: "paulchen1978@gmail.com",
    },
    footer: {
      line: "Turning trade practice into visible tools.",
      rights: "All rights reserved.",
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

export function LangProvider({ children }) {
  const [lang, setLang] = useState("zh");
  const t = dict[lang];
  const toggle = () => setLang((l) => (l === "zh" ? "en" : "zh"));

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.title = titles[lang];
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
