import { ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";
import { withDemoLang } from "../demoLinks.js";

// The three flagship works, framed as the three questions an exporter asks
// before committing. Each card: the question in the client's words, what they
// take away, and a two-minute try. Demos use fictional data; the card says so once.
const LINKS = {
  lead: "https://apchen1978.github.io/overseas-lead-discovery-demo/",
  decision: "https://apchen1978.github.io/commercial-decision-desk/#mode-sample",
  margin: "https://apchen1978.github.io/trade-profit-navigator-demo/?case=gulf-001",
};

const copy = {
  zh: {
    eyebrow: "三個問題",
    title: "做海外生意，我幫你先答三個問題",
    intro: "每個問題都有一個可以馬上試的示範。用的是虛構資料，兩分鐘就能看懂它怎麼幫上忙。",
    takeaway: "你會帶走",
    demoNote: "示範案例（虛構資料）",
    note: "示範用的都是虛構資料，不含任何真實客戶。AI 只協助整理與試算，要不要做、能不能答應，仍由你決定。",
    cards: [
      {
        key: "lead",
        stage: "開發前",
        question: "哪些公司真的值得業務花時間？",
        pain: "名單很長，每一家都要花時間查，最後不知道先追誰。",
        takeaway: "先開發、先查證、暫緩、排除四層名單，並寫明每一家的理由，還有報價前要先確認的市場項目。",
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
    eyebrow: "Three questions",
    title: "Before you commit to an overseas deal, I help you answer three questions",
    intro: "Each question has a demo you can try right now. They use fictional data and take about two minutes to show how they help.",
    takeaway: "What you take away",
    demoNote: "Demo case (fictional data)",
    note: "Every demo uses fictional data and no real client. AI only helps organise and calculate; whether to pursue and what to commit to stays with you.",
    cards: [
      {
        key: "lead",
        stage: "Before pursuing",
        question: "Which companies are really worth your sales team's time?",
        pain: "The list is long, every company takes time to research, and you still do not know who to chase first.",
        takeaway: "A four-tier list (engage first, verify first, hold, exclude) with the reason for each, plus the market checks to clear before quoting.",
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
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <p className="eyebrow">{c.eyebrow}</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-12">
          <h2 id="three-questions-heading" className="max-w-[22ch] text-3xl font-semibold leading-[1.2] tracking-[-0.02em] md:text-[2.625rem]">{c.title}</h2>
          <p className="max-w-[48ch] self-end text-base leading-relaxed text-ink/70">{c.intro}</p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {c.cards.map((card, index) => (
            <motion.li
              key={card.key}
              className="flex"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.07 }}
            >
              <article className="flex w-full flex-col rounded-card border border-line surface-paper p-6 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-amber/40 hover:shadow-[0_24px_50px_-30px_rgba(154,90,24,0.55)] md:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-4xl font-medium leading-none tracking-[-0.03em] text-amber" aria-hidden="true">{index + 1}</span>
                  <span className="text-xs font-medium text-moss">{card.stage}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-snug tracking-[-0.01em] text-ink md:text-2xl">{card.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{card.pain}</p>
                <div className="mt-6 border-l-2 border-amber/60 pl-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-moss">{c.takeaway}</p>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-forest">{card.takeaway}</p>
                </div>
                <div className="mt-auto pt-7">
                  <a
                    href={withDemoLang(LINKS[card.key], lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[3.5rem] w-full items-center justify-between gap-3 rounded-field bg-forest px-4 py-3 text-sm font-semibold text-bone transition-colors hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                  >
                    <span>{card.cta}</span>
                    <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0" />
                  </a>
                  <p className="mt-2 text-xs text-ink/70">{c.demoNote}</p>
                </div>
              </article>
            </motion.li>
          ))}
        </ol>
        <p className="mt-8 max-w-[70ch] text-sm leading-relaxed text-ink/70">{c.note}</p>
      </div>
    </section>
  );
}
