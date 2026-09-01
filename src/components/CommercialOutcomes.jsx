import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function CommercialOutcomes() {
  const { t } = useLang();
  const content = t.outcomes;
  const reduceMotion = useReducedMotion();

  return (
    <section id="outcomes" aria-labelledby="outcomes-heading" className="scroll-mt-24 border-y border-line surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
        <div className="max-w-3xl">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 id="outcomes-heading" className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{content.headline}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">{content.intro}</p>
        </div>

        <div className="outcomes-rail relative mx-auto mt-16 max-w-6xl border-y border-forest/20 md:mt-20">
          <div aria-hidden="true" className="absolute bottom-5 left-[19px] top-5 w-px bg-gradient-to-b from-forest/35 via-forest/25 to-amber/70 md:left-[27px]" />
          {content.items.map((item, index) => (
            <motion.a
              key={item.question}
              href={item.href}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={reduceMotion ? undefined : { once: true, margin: "-48px" }}
              transition={reduceMotion ? undefined : { duration: 0.45, ease: "easeOut", delay: index * 0.06 }}
              className={`outcomes-stage group relative grid grid-cols-[40px_minmax(0,1fr)] gap-0 border-b border-forest/15 py-6 last:border-b-0 md:grid-cols-[56px_minmax(0,1fr)] md:py-7 ${index === content.items.length - 1 ? "outcomes-stage-final" : ""}`}
            >
              <span aria-hidden="true" className={`relative z-10 mt-1 grid size-6 place-items-center rounded-full border bg-bone text-[11px] font-medium tracking-wide ${index === content.items.length - 1 ? "border-amber bg-amber text-white" : "border-forest/50 text-forest"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 pr-1 md:pr-4">
                <div className="border-b border-forest/15 pb-5">
                  <p className={`text-xs font-bold uppercase tracking-[0.16em] ${index === content.items.length - 1 ? "text-amber" : "text-forest/70"}`}>{item.label}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-forest md:text-2xl">{item.question}</h3>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
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
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <p className="mt-7 max-w-3xl text-xs leading-relaxed text-moss">{content.boundary}</p>
      </div>
    </section>
  );
}
