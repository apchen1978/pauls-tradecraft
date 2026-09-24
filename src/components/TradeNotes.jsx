import { Lightbulb } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { tradeNotes } from "../data/tradeNotes.js";

export default function TradeNotes() {
  const { lang } = useLang();
  const content = tradeNotes[lang === "zh" ? "zh" : "en"];

  return (
    <section id="trade-notes" aria-labelledby="trade-notes-title" className="border-y border-line bg-paper/55">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
          <div>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 id="trade-notes-title" className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-forest md:text-4xl">
              {content.title}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/70 md:text-base">{content.intro}</p>
          </div>

          <div className="divide-y divide-forest/15 border-y border-forest/20">
            {content.items.map((item, index) => (
              <details key={item.tag} className="group py-4 md:py-5">
                <summary className="flex cursor-pointer list-none items-start gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber [&::-webkit-details-marker]:hidden">
                  <span className="mt-0.5 font-mono text-xs text-amber">0{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-moss">{item.tag}</span>
                    <span className="mt-1.5 block text-base font-semibold leading-snug text-forest md:text-lg">{item.title}</span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 text-xl leading-none text-amber transition-transform motion-reduce:transition-none group-open:rotate-45">+</span>
                </summary>
                <div className="ml-8 mt-4 max-w-2xl border-l border-amber/45 pl-4 md:ml-10 md:pl-5">
                  <p className="text-sm leading-relaxed text-ink/75">{item.body}</p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-forest">{item.question}</p>
                  <details className="group/practical mt-4 border-y border-forest/15">
                    <summary className="flex cursor-pointer list-none items-center gap-3 py-3 text-sm font-semibold text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber [&::-webkit-details-marker]:hidden">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-amber/35 bg-amber/10 text-amber" aria-hidden="true">
                        <Lightbulb size={16} weight="regular" />
                      </span>
                      <span className="min-w-0 flex-1">{item.answer.label}</span>
                      <span aria-hidden="true" className="shrink-0 text-lg leading-none text-moss transition-transform motion-reduce:transition-none group-open/practical:rotate-45">+</span>
                    </summary>
                    <div className="mb-4 border-l-2 border-amber/45 py-1 pl-4 md:pl-5">
                      <p className="eyebrow text-[9px]">{item.answer.eyebrow}</p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-forest">{item.answer.title}</h3>
                      <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink/75">
                        {item.answer.steps.map((step, stepIndex) => (
                          <li key={step} className="flex gap-2.5">
                            <span className="mt-px shrink-0 font-mono text-[11px] text-amber">0{stepIndex + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-3 text-xs leading-relaxed text-ink/60">{item.answer.caution}</p>
                    </div>
                  </details>
                  <a href={item.href} target={item.internal ? undefined : "_blank"} rel={item.internal ? undefined : "noreferrer"} className="mt-3 inline-flex text-xs font-semibold text-moss underline decoration-moss/40 underline-offset-4 hover:text-forest">
                    {item.source} ↗
                  </a>
                </div>
              </details>
            ))}
          </div>
        </div>
        <p className="mt-8 max-w-4xl text-xs leading-relaxed text-ink/55">{content.note}</p>
      </div>
    </section>
  );
}
