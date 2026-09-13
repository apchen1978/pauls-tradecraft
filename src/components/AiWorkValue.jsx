import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { aiWorkValue } from "../data/ai-work-value.js";

export default function AiWorkValue() {
  const { lang } = useLang();
  const content = aiWorkValue[lang];

  return (
    <section id="ai-work-value" aria-labelledby="ai-work-value-heading" className="scroll-mt-24 border-b border-line bg-paper/50">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
        <div className="max-w-xl">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 id="ai-work-value-heading" className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {content.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink/70 md:text-lg">{content.intro}</p>

          <div className="mt-9 border-l-2 border-amber/60 pl-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber">{content.outcomeLabel}</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-forest md:text-base">{content.outcome}</p>
          </div>

          <a href="#outcomes" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline decoration-forest/30 underline-offset-4 transition-colors hover:text-amber">
            {content.cta}
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
        </div>

        <ol className="border-y border-forest/20">
          {content.stages.map((stage, index) => (
            <li key={stage.title} className="grid gap-5 border-b border-forest/15 py-6 last:border-b-0 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-7 md:py-7">
              <span className="text-sm font-bold tabular-nums text-amber">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-ink md:text-xl">{stage.title}</h3>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{content.aiLabel}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{stage.ai}</p>
              </div>
              <div className="border-l border-forest/15 pl-4 md:pl-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest/75">{content.humanLabel}</p>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-forest">{stage.human}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="border-t border-forest/20 py-8 md:py-10">
          <p className="text-sm font-semibold text-forest">{content.prompt}</p>
          <div className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-3">
            {content.entryPoints.map((entryPoint) => (
              <a
                key={entryPoint.label}
                href={entryPoint.href}
                target="_blank"
                rel="noreferrer"
                className="group border-l border-amber/60 pl-4 transition-colors hover:border-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
              >
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest transition-colors group-hover:text-amber">
                  {entryPoint.label}
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-ink/65">{entryPoint.detail}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-8 text-xs leading-relaxed text-moss md:px-6 md:pb-10">
        {content.boundary}
      </div>
    </section>
  );
}
