import { Plus } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import CommercialFrontDoor from "./CommercialFrontDoor.jsx";
import HeroOutcomes from "./HeroOutcomes.jsx";
import AiWorkValue from "./AiWorkValue.jsx";
import ConnectedCase from "./ConnectedCase.jsx";
import TradeNotes from "./TradeNotes.jsx";
import Verification from "./Verification.jsx";
import Methods from "./Methods.jsx";
import HowIWork from "./HowIWork.jsx";

// Deep-dive library: secondary sections stay on the page (and indexable), but
// collapsed, so the homepage reads as one short editorial path. In-page links
// into a closed panel are opened by the hash handler in App.jsx.
const copy = {
  zh: {
    eyebrow: "延伸閱讀",
    title: "想更深入，再往下展開。",
    intro: "方法、國貿筆記與驗證方式都收在這裡；需要時再打開。",
    panels: {
      start: ["海外客戶開發的起點", "路線圖、互動案例與導讀 PDF：從找公司、找對人，到看懂詢價。"],
      situations: ["你現在最像哪一種情況", "名單很多、訂單看起來不錯、錢已花出去：對應到哪個作品。"],
      ai: ["前置工作怎麼分", "把細節先整理好，把商業判斷留給團隊。"],
      problem: ["問題定義", "客戶說的需求，和真正要做的決定，往往不是同一件事。"],
      notes: ["國貿現場筆記", "報價、出貨與訂艙前，先把下一個問題問對。"],
      verification: ["驗證方式", "每一件作品用什麼可重跑的檢查來證明。"],
      method: ["方法論", "怎麼判斷、怎麼談、怎麼承諾。"],
      how: ["工作流程", "判斷在人，執行有節奏：一次合作怎麼進行。"],
    },
  },
  en: {
    eyebrow: "Go deeper",
    title: "Open what you need, when you need it.",
    intro: "Method, trade notes and verification live here, one panel at a time.",
    panels: {
      start: ["Where overseas customer development starts", "Roadmap, interactive case and guide PDF: from finding companies and contacts to reading an inquiry."],
      situations: ["Which situation are you in", "A long list, an order that looks good, money already spent: which work applies."],
      ai: ["How the groundwork is split", "Get the detail organized; keep the commercial judgment with the team."],
      problem: ["Problem definition", "The request a client brings is rarely the decision that needs making."],
      notes: ["Trade notes", "Ask the right next question before quoting, shipping or booking."],
      verification: ["How it's verified", "The rerunnable checks behind each work."],
      method: ["Methodology", "How to judge, negotiate and commit."],
      how: ["How I work", "Judgment first, execution with discipline: how an engagement runs."],
    },
  },
};

const panels = [
  { key: "start", anchor: "overseas-customer-development", Component: CommercialFrontDoor },
  { key: "situations", anchor: "hero-outcomes", Component: HeroOutcomes },
  { key: "ai", anchor: "ai-work-value", Component: AiWorkValue },
  { key: "problem", anchor: "connected-case", Component: ConnectedCase },
  { key: "notes", anchor: "trade-notes", Component: TradeNotes },
  { key: "verification", anchor: "verification", Component: Verification },
  { key: "method", anchor: "method", Component: Methods },
  { key: "how", anchor: "how", Component: HowIWork },
];

export default function Library() {
  const { lang } = useLang();
  const c = copy[lang];

  return (
    <section id="library" aria-labelledby="library-heading" className="scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 pt-24 md:px-6 md:pt-32">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-12">
          <div>
            <p className="eyebrow">{c.eyebrow}</p>
            <h2 id="library-heading" className="mt-6 text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] md:text-[3.25rem]">{c.title}</h2>
          </div>
          <p className="max-w-[48ch] self-end text-base leading-relaxed text-moss">{c.intro}</p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl px-4 pb-24 md:px-6 md:pb-32">
        <div className="border-t border-line">
          {panels.map(({ key, anchor, Component }, index) => {
            const [title, line] = c.panels[key];
            return (
              <details key={key} className="group/panel border-b border-line" data-library-panel={anchor}>
                <summary className="grid cursor-pointer list-none grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-6 transition-colors hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber md:grid-cols-[3rem_minmax(0,16rem)_minmax(0,1fr)_auto] md:gap-x-8 md:py-7 [&::-webkit-details-marker]:hidden">
                  <span className="text-xs font-medium tabular-nums text-amber">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-lg font-semibold tracking-[-0.01em] text-ink md:text-xl">{title}</span>
                  <span className="col-start-2 row-start-2 mt-1 text-sm leading-relaxed text-moss md:col-start-3 md:row-start-1 md:mt-0">{line}</span>
                  <span aria-hidden="true" className="col-start-3 row-start-1 flex size-8 items-center justify-center self-center rounded-full border border-line text-forest transition-transform duration-300 group-open/panel:rotate-45 md:col-start-4">
                    <Plus size={14} weight="bold" />
                  </span>
                </summary>
                <div className="-mx-4 border-t border-line md:-mx-6">
                  <Component />
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
