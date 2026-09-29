import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

// One deal, walked through the three questions. The figures are the ones the live
// demos produce for their default fictional case (verified 2026-09-29); steps 2
// and 3 share the same case, step 1 uses separate representative examples.
const LINKS = {
  lead: { zh: "https://apchen1978.github.io/overseas-lead-discovery-demo/", en: "https://apchen1978.github.io/overseas-lead-discovery-demo/?lang=en" },
  decision: "https://apchen1978.github.io/commercial-decision-desk/#mode-sample",
  margin: "https://apchen1978.github.io/trade-profit-navigator-demo/?case=gulf-001",
};

const copy = {
  zh: {
    eyebrow: "一筆生意走一遍",
    title: "同一筆生意，依序過三個問題",
    intro: "第二、三步用的是同一筆虛構案例：1.2 萬米窗簾與窗飾，每米 40 美元。",
    open: "開啟示範",
    steps: [
      {
        key: "lead",
        when: "還沒有訂單",
        result: "12 個示例裡，現在值得先開發的只有 4 家。",
        detail: "其中 3 家是高進入門檻的大型買方；門檻最低的 2 家反而還沒資格：一家證據只有第三方來源，一家的品類只部分契合。",
      },
      {
        key: "decision",
        when: "有一筆訂單了",
        result: "現在還不能接。",
        detail: "付款條件互相矛盾、訂單量未確認、付款保障未定。要補 5 項確認，判斷才會前進，其中只有解決付款矛盾能單獨讓判斷往前。",
      },
      {
        key: "margin",
        when: "接下來",
        result: "扣掉成本後，還剩 110,480 美元。",
        detail: "帳面預期淨貢獻是 12 萬美元；計入付款時程的資金成本後，只比你的最低要求 96,000 美元高 14,480。最弱的一環是售價：讓價 3.0% 就到底線（在預設假設下）。",
      },
    ],
    closing: "三個問題各自獨立，也可以只用其中一個。帶一筆你正在談的商機來，我們用同樣的方式走一遍。",
    cta: "帶一筆商機來聊",
  },
  en: {
    eyebrow: "One deal, walked through",
    title: "One deal, through the three questions in order",
    intro: "Steps two and three use the same fictional case: 12,000 metres of curtains and valances at USD 40 a metre.",
    open: "Open the demo",
    steps: [
      {
        key: "lead",
        when: "No order yet",
        result: "Of 12 examples, only 4 deserve sales time now.",
        detail: "Three of those four are large, high-barrier buyers. The two easiest doors are not yet qualified: one has only third-party evidence, the other only a partial category fit.",
      },
      {
        key: "decision",
        when: "An order arrives",
        result: "You cannot take it yet.",
        detail: "Payment terms contradict each other, the order volume is unconfirmed and payment security is undecided. Five confirmations are needed before the recommendation moves; only resolving the payment contradiction moves it on its own.",
      },
      {
        key: "margin",
        when: "Next",
        result: "After costs, USD 110,480 is left.",
        detail: "Paper net contribution is USD 120,000; after the funding cost of the payment timeline it clears your USD 96,000 minimum by only USD 14,480. The weakest link is price: a 3.0% concession takes it to the floor (under the default assumptions).",
      },
    ],
    closing: "The three questions work on their own, and you can use just one. Bring a deal you are negotiating and we will walk it through the same way.",
    cta: "Bring a deal to discuss",
  },
};

export default function OneDeal() {
  const { lang } = useLang();
  const c = copy[lang];
  const href = (key) => (key === "lead" ? LINKS.lead[lang] : LINKS[key]);
  return (
    <section id="one-deal" aria-labelledby="one-deal-heading" className="scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-6 md:pb-28">
        <div className="rounded-card border border-line bg-paper/60 px-5 py-9 md:px-10 md:py-12">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 id="one-deal-heading" className="mt-4 max-w-[26ch] text-2xl font-semibold leading-[1.25] tracking-[-0.02em] md:text-4xl">{c.title}</h2>
          <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-ink/70">{c.intro}</p>

          <ol className="mt-10 grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch md:gap-4">
            {c.steps.flatMap((step, index) => {
              const card = (
                <li key={step.key} className="flex flex-col rounded-card border border-line bg-card p-5 md:p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-moss">
                    <span className="mr-2 text-amber">{index + 1}</span>{step.when}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold leading-snug text-ink md:text-xl">{step.result}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{step.detail}</p>
                  <a
                    href={href(step.key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 transition-colors hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                  >
                    {c.open}
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  </a>
                </li>
              );
              return index < c.steps.length - 1
                ? [card, <li key={`${step.key}-arrow`} aria-hidden="true" className="hidden items-center text-amber md:flex"><ArrowRight size={22} weight="bold" /></li>]
                : [card];
            })}
          </ol>

          <div className="mt-10 flex flex-col gap-5 border-t border-line pt-7 md:flex-row md:items-center md:justify-between md:gap-10">
            <p className="max-w-[62ch] text-base leading-relaxed text-ink/70">{c.closing}</p>
            <a
              href="#contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-field bg-gold px-6 py-3.5 text-sm font-semibold text-pine transition-colors hover:bg-[#f2c878] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber md:self-auto"
            >
              {c.cta}
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
