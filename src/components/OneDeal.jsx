import { useState } from "react";
import { ArrowRight, ArrowUpRight, CaretDown } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { withDemoLang } from "../demoLinks.js";
import { FoldToggle, foldClass, useFold } from "./FoldedIntro.jsx";

// One deal, walked through the questions in order. The figures are the ones the live
// demos produce for baseline 2026-10-05.1; steps 2
// and 3 share the same case, step 1 uses separate representative examples.
const LINKS = {
  lead: "https://apchen1978.github.io/overseas-lead-discovery-demo/",
  decision: "https://apchen1978.github.io/commercial-decision-desk/#mode-sample",
  margin: "https://apchen1978.github.io/trade-profit-navigator-demo/?case=gulf-001",
};

const copy = {
  zh: {
    eyebrow: "一筆生意走一遍",
    title: "同一筆生意，從開發走到承諾",
    intro: "第二、三步用的是同一筆示範案例：一筆 14.4 萬美元的訂單。",
    note: "示範中的「米」指一米成品寬度，為成品供貨，不含現場安裝；商品成本為示意假設，不代表任何供應商報價。",
    open: "開啟示範",
    more: "看細節",
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
        result: "扣掉成本後，還剩 33,144 美元。",
        detail: "帳面預期淨貢獻是 3.6 萬美元；計入付款時程的資金成本後，只比你的最低要求 28,800 美元高 4,344。最弱的一環是售價：讓價約 3% 即到最低要求（在預設假設下）。",
      },
    ],
    closing: "每一步各自獨立，也可以只用其中一步。帶一筆你正在談的商機來，我們用同樣的方式走一遍。",
    cta: "帶一筆商機來聊",
  },
  en: {
    eyebrow: "One deal, walked through",
    title: "One deal, from first contact to commitment",
    intro: "Steps two and three use the same demo case: a USD 144,000 order.",
    note: "In the demos, 'metre' means one metre of finished width, supplied as finished goods and excluding on-site installation; the goods cost is an illustrative assumption, not a supplier quote.",
    open: "Open the demo",
    more: "Details",
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
        result: "After costs, USD 33,144 is left.",
        detail: "Paper net contribution is USD 36,000; after the funding cost of the payment timeline it clears your USD 28,800 minimum by only USD 4,344. The weakest link is price: a concession of about 3% reaches the minimum requirement (under the default assumptions).",
      },
    ],
    closing: "Each step works on its own, and you can use just one. Bring a deal you are negotiating and we will walk it through the same way.",
    cta: "Bring a deal to discuss",
  },
};

// On phones each step shows its number, moment and result; the detail and demo link
// open on tap. From md up the step is always fully open.
function DealStep({ step, index, c, href }) {
  const [open, setOpen] = useState(false);
  const panelId = `one-deal-${step.key}-detail`;
  return (
    <li className="flex border-b border-line py-6 md:border-b-0 md:py-10 md:border-l md:border-line md:px-8 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
      <div className="flex w-full flex-col">
        <p className="text-sm font-medium text-moss">
          <span className="mr-2 font-serif text-lg text-amber">{index + 1}</span>{step.when}
        </p>
        <h3 className="mt-3 text-[1.375rem] font-medium leading-[1.25] tracking-[-0.02em] text-ink md:mt-6 md:text-[1.75rem]">{step.result}</h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="mt-3 flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-forest md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
        >
          <span>{c.more}</span>
          <CaretDown size={16} weight="bold" aria-hidden="true" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div id={panelId} className={`${open ? "flex" : "hidden"} flex-col md:mt-0 md:flex md:flex-1`}>
          <p className="mt-3 text-base leading-relaxed text-moss md:mt-4">{step.detail}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-auto inline-flex w-fit items-center gap-2 border-b border-ink pb-2 pt-6 text-base font-medium text-ink transition-colors hover:border-amber hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber md:pt-8"
          >
            {c.open}
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </li>
  );
}

export default function OneDeal() {
  const { lang } = useLang();
  const c = copy[lang];
  const href = (key) => withDemoLang(LINKS[key], lang);
  const { open, toggle } = useFold();
  return (
    <section id="one-deal" aria-labelledby="one-deal-heading" className="scroll-mt-24 border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-36">
        <p className="eyebrow">{c.eyebrow}</p>
        <h2 id="one-deal-heading" className="mt-6 max-w-[22ch] text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] md:text-[3.25rem]">{c.title}</h2>
        <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-moss md:text-lg">{c.intro}</p>
        <FoldToggle open={open} onToggle={toggle} controls="one-deal-note" />
        <p id="one-deal-note" className={`mt-3 max-w-[62ch] text-xs leading-relaxed text-moss md:text-sm ${foldClass(open)}`}>{c.note}</p>

        <ol className="mt-8 grid border-t border-ink md:mt-20 md:grid-cols-3">
          {c.steps.map((step, index) => (
            <DealStep key={step.key} step={step} index={index} c={c} href={href(step.key)} />
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 md:mt-20 md:flex-row md:items-center md:justify-between md:gap-10">
          <p className="max-w-[62ch] text-base leading-relaxed text-moss md:text-lg">{c.closing}</p>
          <a
            href="#contact"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-field bg-gold px-6 py-3.5 text-sm font-semibold text-pine transition-colors hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber md:self-auto"
          >
            {c.cta}
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
