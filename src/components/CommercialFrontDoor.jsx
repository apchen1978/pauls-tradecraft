import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { withDemoLang } from "../demoLinks.js";

const routes = {
  roadmap: "/prototype/ai-native-overseas-customer-roadmap/",
  guide: "/files/Paul-Tradecraft-Learning-Guide-001-Overseas-Customer-Development-ZH.pdf",
  walkthrough: "/prototype/ai-native-commercial-conversion/",
  discovery: "https://apchen1978.github.io/overseas-lead-discovery-demo/",
  rfq: "/prototype/garage-rfq-workflow-001/",
  decision: "/cases/commercial-decision-desk/",
};

const copy = {
  zh: {
    eyebrow: "海外客戶開發 · 從這裡開始",
    title: "找海外客戶，先看哪些公司可能會買。",
    intro: "先看哪些公司可能需要你的產品，再決定要不要花時間聯絡。從找公司、找對口的人，到準備聯絡和處理詢價，這裡會帶你走一遍。",
    teach: "01 · 先看懂",
    teachTitle: "海外客戶開發路線圖",
    teachBody: "七個問題，從選市場、找公司，到判斷能不能接單。先看全程，再按需要展開細節。",
    teachLink: "看路線圖",
    guideLink: "想慢慢讀？下載《海外客戶開發：從一項產品開始》（16 頁繁中 PDF）",
    show: "02 · 再走一遍",
    showTitle: "跟著一家公司，看怎麼找到對口的人",
    showBody: "用一個合成案例，看看怎麼查公司、找可能負責採購的人、準備聯絡，再判斷買家回覆。",
    showLink: "體驗互動案例",
    proof: "03 · 看現有作品",
    proofTitle: "再看看實際作品怎麼做。",
    proofBody: "海外客戶研究展示如何查找和篩選公司；RFQ 與商務決策工作台展示買家詢問之後，哪些事仍要由人判斷。這些作品沒有串成一套自動化系統。",
    proofLinks: ["海外客戶研究", "RFQ 工作流", "商務決策工作台"],
    productStartTitle: "從你的產品開始",
    productStartBody: "如果你有一項想試著賣到海外的產品，可以先梳理產品條件與供應限制；已有想嘗試的市場就一併帶上，還沒有也可以從產品開始。",
    productStartLink: "看看合作可以從哪裡開始",
    boundary: "AI 可以協助查資料和準備內容；客戶是否有需求、能否報價與承諾，仍要查證並由人決定。",
  },
  en: {
    eyebrow: "Overseas customer development · start here",
    title: "An overseas customer is more than a name on a list.",
    intro: "Understand who might buy and why they merit attention before allocating sales time. This route connects account research, buying roles, outreach preparation, and inquiry review.",
    teach: "01 · Understand the route",
    teachTitle: "Overseas Customer Development Roadmap",
    teachBody: "Seven questions take you from a market and buyer hypothesis to a trade decision. Scan the route first; open the detail when you need it.",
    teachLink: "Explore the roadmap",
    guideLink: "Read the 16-page Learning Guide (Traditional Chinese PDF)",
    show: "02 · Follow a case",
    showTitle: "From a candidate account to an opportunity for review",
    showBody: "A clearly synthetic case shows how the likely role, contact path, sendable material, and buyer reply connect.",
    showLink: "Try the walkthrough",
    proof: "03 · See existing work",
    proofTitle: "The route is supported by working examples.",
    proofBody: "Overseas Lead Discovery shows the evidence behind qualification. RFQ and the Commercial Decision Desk show where human judgment takes over. These works are not presented as one integrated automation system.",
    proofLinks: ["Overseas Lead Discovery", "RFQ Workflow", "Commercial Decision Desk"],
    productStartTitle: "Start with your product",
    productStartBody: "If you have a product you want to sell overseas, start by clarifying its offer and supply constraints. Bring a target market if you have one; if not, begin with the product.",
    productStartLink: "See where a collaboration can begin",
    boundary: "AI can assist research and preparation. Demand, quotes, and commitments still require verification and human authority.",
  },
};

export default function CommercialFrontDoor() {
  const { lang } = useLang();
  const c = copy[lang];
  const steps = [
    { label: c.teach, title: c.teachTitle, body: c.teachBody, href: routes.roadmap, link: c.teachLink },
    { label: c.show, title: c.showTitle, body: c.showBody, href: routes.walkthrough, link: c.showLink },
  ];

  return (
    <section id="overseas-customer-development" aria-labelledby="commercial-entry-heading" className="scroll-mt-20 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <p className="eyebrow">{c.eyebrow}</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12">
          <h2 id="commercial-entry-heading" className="max-w-[18ch] text-[clamp(1.9rem,4vw,3.5rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink">{c.title}</h2>
          <p className="max-w-[56ch] self-end text-base leading-relaxed text-moss">{c.intro}</p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <a key={step.href} href={withDemoLang(step.href, lang)} className="group flex min-h-56 flex-col rounded-card border border-line surface-paper p-6 transition-colors hover:border-forest/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber md:p-8">
              <p className="text-xs font-semibold text-amber">{step.label}</p>
              <h3 className="mt-6 max-w-[26ch] text-xl font-semibold leading-snug tracking-tight text-forest md:text-2xl">{step.title}</h3>
              <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-moss">{step.body}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 group-hover:text-amber">{step.link}<ArrowUpRight size={16} weight="bold" aria-hidden="true" /></span>
            </a>
          ))}
        </div>
        <a href={routes.guide} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
          {c.guideLink}<ArrowUpRight size={13} weight="bold" aria-hidden="true" />
        </a>
        <div className="mt-6 border-t border-line pt-6 md:flex md:items-start md:justify-between md:gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-amber">{c.proof}</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">{c.proofTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-moss">{c.proofBody}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 md:mt-1 md:max-w-sm">
            {[routes.discovery, routes.rfq, routes.decision].map((href, index) => (
              <a key={href} href={withDemoLang(href, lang)} className="inline-flex items-center gap-1 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">{c.proofLinks[index]}<ArrowUpRight size={14} weight="bold" aria-hidden="true" /></a>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-forest">{c.productStartTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-moss">{c.productStartBody}</p>
          </div>
          <a href="#capabilities" className="inline-flex shrink-0 self-start items-center gap-1 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber md:self-auto">
            {c.productStartLink}<ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-6 max-w-[78ch] text-xs leading-relaxed text-moss">{c.boundary}</p>
      </div>
    </section>
  );
}
