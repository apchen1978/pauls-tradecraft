import React, { createContext, useContext, useState } from "react";

const dict = {
  zh: {
    brand: "Paul's Tradecraft",
    brandNote: "作品集總覽",
    nav: { works: "作品", services: "能做什麼", about: "關於我", contact: "聯絡我" },
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
      linkPending: "公開連結待補",
      statusVerified: "已驗證",
    },
    capabilities: {
      eyebrow: "What I Can Do",
      headline: "能做什麼",
      items: [
        {
          title: "貿易流程工具化",
          desc: "報價、追蹤、跟進流程，產出可直接使用的 Excel 與工具，附驗證腳本。",
        },
        {
          title: "簡報與案例產出",
          desc: "從 spec 到 PPTX 到 PDF 的簡報管線；單頁案例簡報、策略簡報皆可交付。",
        },
        {
          title: "模擬與證據鏈",
          desc: "每件作品可重跑模擬、逐項驗證，成果有據可查。",
        },
        {
          title: "中英雙語溝通",
          desc: "國際貿易實務經驗，TOEIC 955，與客戶、供應商溝通零落差。",
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
        { value: "多年", label: "國際貿易總監" },
        { value: "23/23", label: "Pilot 驗證通過" },
      ],
    },
    contact: {
      headline: "一起做點有用的東西",
      sub: "不管是貿易流程、簡報還是工具，談談你手上卡住的事。",
      cta: "聯絡我",
      note: "公開聯絡方式整理中",
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
      linkPending: "Public link pending",
      statusVerified: "Verified",
    },
    capabilities: {
      eyebrow: "What I Can Do",
      headline: "Capabilities",
      items: [
        {
          title: "Trade workflow tooling",
          desc: "Quotes, tracking, and follow-up flows turned into working Excel tools with verification scripts.",
        },
        {
          title: "Decks & case briefs",
          desc: "A spec-to-PPTX-to-PDF deck pipeline; one-page case briefs and strategy decks, ready to ship.",
        },
        {
          title: "Simulation & evidence",
          desc: "Every work can be rerun and checked item by item. Results are traceable, not decorative.",
        },
        {
          title: "Bilingual communication",
          desc: "International trade experience, TOEIC 955, zero-friction communication with clients and suppliers.",
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
        { value: "Years", label: "Trade director" },
        { value: "23/23", label: "Pilot checks passed" },
      ],
    },
    contact: {
      headline: "Let's build something useful",
      sub: "Trade flows, decks, or tools: tell me what is stuck on your desk.",
      cta: "Contact",
      note: "Public contact details in progress",
    },
    footer: {
      line: "Turning trade practice into visible tools.",
      rights: "All rights reserved.",
    },
    langLabel: "繁中",
  },
};

const LangContext = createContext({ lang: "zh", t: dict.zh, toggle: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState("zh");
  const t = dict[lang];
  const toggle = () => setLang((l) => (l === "zh" ? "en" : "zh"));
  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
