import { ArrowDown } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { scrollToElement } from "../calmScroll.js";

const copy = {
  zh: {
    kicker: "兩分鐘試玩",
    headline: "先動手，看一張單怎麼判斷。",
    firstLook: "Paul 會先看",
    note: "示範用虛構資料，成效未驗證。",
    items: [
      {
        key: "profit",
        time: "約 30 秒",
        title: "算一張單的毛利",
        look: "毛利還撐不撐得住，以及出貨前要先墊多少錢。",
        cta: "試算毛利",
        trigger: "open-profit-calculator",
        panel: "profit-calculator",
      },
      {
        key: "gates",
        time: "約 2 分鐘",
        title: "從詢盤走到報價",
        look: "付款有沒有保障；證據不夠，就先暫緩。",
        cta: "走一遍六道關卡",
        trigger: "open-trade-decision-workflow",
        panel: "trade-decision-workflow",
      },
    ],
  },
  en: {
    kicker: "Two-minute try",
    headline: "Hands on first: see how one order gets judged.",
    firstLook: "What Paul looks at first",
    note: "Demo with fictional data. Results not verified.",
    items: [
      {
        key: "profit",
        time: "about 30 sec",
        title: "Work out one order's margin",
        look: "Whether the margin still holds, and how much cash goes out before shipment.",
        cta: "Try the margin",
        trigger: "open-profit-calculator",
        panel: "profit-calculator",
      },
      {
        key: "gates",
        time: "about 2 min",
        title: "From inquiry to quote",
        look: "Whether payment is protected; with thin evidence, hold first.",
        cta: "Walk the six gates",
        trigger: "open-trade-decision-workflow",
        panel: "trade-decision-workflow",
      },
    ],
  },
};

// The entry only points at the tools that already live inside their work
// cards: it presses the card's own button (which opens the case details and
// focuses the panel), then aligns the page to the panel. Nothing is duplicated.
function openTool(item) {
  const trigger = document.getElementById(item.trigger);
  if (!trigger) return;
  trigger.click();
  requestAnimationFrame(() => {
    const panel = document.getElementById(item.panel);
    if (!panel) return;
    scrollToElement(panel);
    panel.focus({ preventScroll: true });
  });
}

export default function TryIt() {
  const { lang } = useLang();
  const c = copy[lang];
  return (
    <section id="try-it" aria-labelledby="try-it-title" className="scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-12">
        <p className="text-xs font-semibold text-amber">{c.kicker}</p>
        <h2 id="try-it-title" className="mt-1.5 text-base font-medium tracking-[-0.02em] text-forest md:mt-2 md:text-2xl">{c.headline}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:gap-5">
          {c.items.map((item) => (
            <div key={item.key} className="flex flex-col rounded-card border border-line surface-paper p-3.5 md:p-5">
              <p className="text-xs font-medium text-moss">{item.time}</p>
              <h3 className="mt-1 text-sm font-medium leading-snug md:text-lg tracking-[-0.02em] text-ink">{item.title}</h3>
              <div className="mb-3 mt-2.5 border-l-2 border-amber/70 pl-2.5 md:mb-0 md:mt-3 md:pl-3">
                <p className="text-xs font-medium text-moss">{c.firstLook}</p>
                <p className="mt-0.5 text-xs font-semibold leading-snug text-forest md:mt-1 md:text-sm">{item.look}</p>
              </div>
              <button
                type="button"
                onClick={() => openTool(item)}
                className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-field bg-forest px-3 py-2 text-xs font-semibold md:mt-4 md:w-auto md:gap-2 md:self-start md:px-5 md:py-2.5 md:text-sm text-bone transition-colors hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                {item.cta}
                <ArrowDown size={14} weight="bold" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-moss md:mt-3">{c.note}</p>
      </div>
    </section>
  );
}
