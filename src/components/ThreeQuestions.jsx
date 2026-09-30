import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { withDemoLang } from "../demoLinks.js";

// The flagship works, framed as the questions an exporter asks
// before committing. Each card: the question in the client's words, what they
// take away, and a two-minute try. Demos use fictional data; the card says so once.
const LINKS = {
  lead: "https://apchen1978.github.io/overseas-lead-discovery-demo/",
  decision: "https://apchen1978.github.io/commercial-decision-desk/#mode-sample",
  margin: "https://apchen1978.github.io/trade-profit-navigator-demo/?case=gulf-001",
};

const copy = {
  zh: {
    eyebrow: "能做什麼",
    title: "貿易經驗，加上 AI 原生的做法。",
    intro: "承諾之前，先把海外生意的判斷走一遍。每一項能力都有一個可以馬上試的示範，用的是合成資料，兩分鐘就能看懂它怎麼幫上忙。",
    takeaway: "你會帶走",
    demoNote: "示範案例（合成資料）",
    note: "示範用的都是合成資料，不含任何真實客戶。AI 只協助整理與試算，要不要做、能不能答應，仍由你決定。",
    cards: [
      {
        key: "lead",
        stage: "開發前",
        question: "還沒談條件之前，該先接觸誰？",
        pain: "名單很長，每一家都要花時間查，最後不知道先追誰。",
        takeaway: "先開發、先查證、暫緩、排除四層名單，並寫明每一家的理由，還有報價前要先確認的市場項目。也可以帶入你自己的名單，帶走一份名單簡報。",
        cta: "試兩分鐘：看 12 個示例怎麼分層",
      },
      {
        key: "decision",
        stage: "報價後",
        question: "這筆訂單，現在能不能接？",
        pain: "訂單看起來不錯，但付款、交付與責任條件還沒講定。",
        takeaway: "卡住承諾的條件、還要補的文件，以及付款保障（信用狀、信保）和匯率風險。",
        cta: "試兩分鐘：看這筆訂單卡在哪裡",
      },
      {
        key: "margin",
        stage: "承諾前",
        question: "毛利真的撐得住嗎？",
        pain: "帳面毛利不等於實賺：運費、關稅、收款時程都會吃掉它。",
        takeaway: "扣掉運費、資金成本與關稅後還剩多少，以及哪個假設最先把它打穿。",
        cta: "試兩分鐘：看同一筆訂單實際剩多少",
      },
    ],
  },
  en: {
    eyebrow: "What I do",
    title: "Trade experience, plus an AI-native way of working.",
    intro: "Walk the judgment calls of an overseas deal before you commit. Each capability has a demo you can try right now, using synthetic data, and takes about two minutes to show how it helps.",
    takeaway: "What you take away",
    demoNote: "Demo case (synthetic data)",
    note: "Every demo uses synthetic data and no real client. AI only helps organize and calculate; whether to pursue and what to commit to stays with you.",
    cards: [
      {
        key: "lead",
        stage: "Before pursuing",
        question: "Before any terms are discussed, who should we reach first?",
        pain: "The list is long, every company takes time to research, and you still do not know who to chase first.",
        takeaway: "A four-tier list (engage first, verify first, hold, exclude) with the reason for each, plus the market checks to clear before quoting. You can also bring your own list and take away a brief.",
        cta: "Try two minutes: see how 12 examples are tiered",
      },
      {
        key: "decision",
        stage: "After the quote",
        question: "Can you take this order now?",
        pain: "The order looks good, but payment, delivery and liability terms are not settled.",
        takeaway: "The conditions holding back the commitment, the documents still needed, and the payment-security (L/C, credit insurance) and currency risk.",
        cta: "Try two minutes: see where an order is stuck",
      },
      {
        key: "margin",
        stage: "Before committing",
        question: "Does the margin really hold?",
        pain: "Paper margin is not what you keep: freight, duty and payment timing all eat into it.",
        takeaway: "What is left after freight, funding cost and duty, and which assumption breaks it first.",
        cta: "Try two minutes: see what the same order really leaves",
      },
    ],
  },
};

export default function ThreeQuestions() {
  const { lang } = useLang();
  const c = copy[lang];
  return (
    <section id="three-questions" aria-labelledby="three-questions-heading" className="scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-36">
        <p className="eyebrow">{c.eyebrow}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <h2 id="three-questions-heading" className="max-w-[20ch] text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] md:text-[3.25rem]">{c.title}</h2>
          <p className="max-w-[44ch] self-end text-base leading-relaxed text-ink/70 md:text-lg">{c.intro}</p>
        </div>

        <ol className="mt-10 grid border-t border-ink md:mt-24 md:grid-cols-3">
          {c.cards.map((card, index) => (
            <li key={card.key} className="flex border-b border-line py-8 md:border-b-0 md:py-10 md:border-l md:border-line md:px-8 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
              <article className="flex w-full flex-col">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-6xl font-medium leading-none tracking-[-0.04em] text-amber md:text-7xl" aria-hidden="true">{index + 1}</span>
                  <span className="text-sm font-medium text-moss">{card.stage}</span>
                </div>
                <h3 className="mt-7 text-[1.5rem] md:mt-10 font-medium leading-[1.25] tracking-[-0.02em] text-ink md:text-[1.75rem]">{card.question}</h3>
                <p className="mt-4 text-base leading-relaxed text-ink/70">{card.pain}</p>
                <div className="mt-8 border-t border-line pt-5">
                  <p className="text-sm font-medium text-moss">{c.takeaway}</p>
                  <p className="mt-2 text-base leading-relaxed text-forest">{card.takeaway}</p>
                </div>
                <div className="mt-auto pt-9">
                  <a
                    href={withDemoLang(LINKS[card.key], lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-start justify-between gap-4 border-b border-ink pb-3 text-base font-medium text-ink transition-colors hover:border-amber hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
                  >
                    <span>{card.cta}</span>
                    <ArrowUpRight size={18} weight="bold" aria-hidden="true" className="mt-1 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                  <p className="mt-3 text-sm text-ink/70">{c.demoNote}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-[70ch] text-sm leading-relaxed text-ink/70">{c.note}</p>
      </div>
    </section>
  );
}
