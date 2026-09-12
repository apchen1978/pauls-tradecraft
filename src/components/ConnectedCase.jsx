import { ArrowRight, ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function ConnectedCase() {
  const { t } = useLang();
  const content = t.connectedCase;

  return (
    <section id="connected-case" aria-labelledby="connected-case-heading" className="scroll-mt-24 border-b border-line bg-ink text-bone">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="eyebrow text-gold">{content.eyebrow}</p>
            <h2 id="connected-case-heading" className="mt-3 text-3xl font-bold tracking-tight text-bone md:text-4xl">{content.headline}</h2>
            <p className="mt-5 text-base leading-relaxed text-bone/72 md:text-lg">{content.intro}</p>

            <div className="mt-8 border-l-2 border-gold/70 pl-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold">{content.takeawayLabel}</p>
              <p className="mt-2 text-sm leading-relaxed text-bone/80">{content.takeaway}</p>
            </div>

            <a
              href={content.assessHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 rounded-field bg-gold px-5 py-3 text-sm font-bold text-pine transition-colors hover:bg-[#f2be61]"
            >
              {content.assessCta}
              <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
            </a>
          </div>

          <ol className="grid gap-0 overflow-hidden rounded-card border border-bone/20 bg-bone/[0.035] md:grid-cols-12 md:divide-x md:divide-bone/15">
            {content.steps.map((step, index) => (
              <li
                key={step.title}
                className={`relative flex min-w-0 flex-col border-b border-bone/15 px-6 py-7 last:border-b-0 md:border-b-0 md:px-7 md:py-8 ${index === 0 ? "md:col-span-3" : index === 1 ? "bg-bone/[0.045] md:col-span-5" : "md:col-span-4"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`grid size-7 place-items-center rounded-full border text-[11px] font-bold tracking-wide ${index === 1 ? "border-gold bg-gold text-pine" : "border-bone/35 text-bone/70"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < content.steps.length - 1 && <ArrowRight size={16} className="hidden text-gold/70 md:block" aria-hidden="true" />}
                </div>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{step.eyebrow}</p>
                <h3 className={`mt-3 font-bold tracking-tight text-bone ${index === 1 ? "text-2xl leading-tight md:text-3xl" : "text-xl leading-snug"}`}>{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-bone/70">{step.question}</p>
                <div className="mt-6 border-t border-bone/15 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bone/45">{content.outputLabel}</p>
                  <p className="mt-2 text-sm leading-relaxed text-bone/82">{step.output}</p>
                </div>
                {step.handoff && (
                  <div className="mt-5 border-l-2 border-gold/70 bg-gold/[0.06] py-3 pl-3 pr-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">CDD → PROFIT TEST</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-bone/78">{step.handoff}</p>
                  </div>
                )}
                <a
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-colors hover:text-bone"
                >
                  {step.cta}
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </a>
                {step.secondary && (
                  <a
                    href={step.secondary.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-bone/68 underline decoration-bone/25 underline-offset-4 transition-colors hover:text-gold"
                  >
                    {step.secondary.cta}
                    <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex gap-3 border-t border-bone/15 pt-5 text-xs leading-relaxed text-bone/55">
          <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
          <p>{content.boundary}</p>
        </div>
      </div>
    </section>
  );
}
