import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function HeroOutcomes() {
  const { t } = useLang();

  return (
    <section id="hero-outcomes" aria-labelledby="hero-outcomes-heading" className="border-b border-line bg-paper/50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <p id="hero-outcomes-heading" className="eyebrow">{t.hero.youGet}</p>
        <div className="mt-3 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{t.hero.outcomesHeadline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/65 md:text-base">{t.hero.outcomesIntro}</p>
        </div>
        <div className="mt-8 grid border-y border-forest/20 md:grid-cols-3 md:divide-x md:divide-forest/15">
          {t.hero.outcomes.map((outcome, index) => (
            <a
              key={outcome.title}
              href={outcome.href}
              className={`group block py-6 transition-colors hover:bg-bone/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber md:py-7 ${index === 0 ? "md:pr-6" : index === t.hero.outcomes.length - 1 ? "md:pl-6" : "md:px-6"}`}
            >
              <p className="text-[10px] font-bold tracking-[0.14em] text-amber">{String(index + 1).padStart(2, "0")} · {outcome.label}</p>
              <h3 className="mt-2 text-lg font-bold tracking-tight text-forest transition-colors group-hover:text-amber md:text-xl">{outcome.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{outcome.body}</p>
              <div className="mt-5 border-t border-forest/10 pt-4">
                <p className="text-[10px] font-bold tracking-[0.14em] text-moss">{t.hero.outcomesTakeaway}</p>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink/75">{outcome.takeaway}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 transition-colors group-hover:text-amber">
                  {outcome.linkLabel}
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
