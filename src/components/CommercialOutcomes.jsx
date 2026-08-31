import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function CommercialOutcomes() {
  const { t } = useLang();
  const content = t.outcomes;

  return (
    <section id="outcomes" className="scroll-mt-24 border-y border-line surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
        <div className="max-w-3xl">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{content.headline}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">{content.intro}</p>
        </div>

        <div className="mt-12 border-y border-forest/20">
          {content.items.map((item, index) => (
            <a
              key={item.question}
              href={item.href}
              className="group grid gap-6 border-b border-forest/15 py-7 last:border-b-0 md:grid-cols-[0.18fr_0.34fr_0.2fr_0.28fr] md:items-start md:gap-8 md:py-8"
            >
              <span className="text-xs font-bold tracking-[0.16em] text-amber">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest/65">{item.label}</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-ink group-hover:text-forest md:text-2xl">{item.question}</h3>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber">{content.systemLabel}</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-forest">{item.system}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber">{content.outputLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.output}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 transition-colors group-hover:text-amber">
                  {item.linkLabel}
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-7 max-w-3xl text-xs leading-relaxed text-moss">{content.boundary}</p>
      </div>
    </section>
  );
}
