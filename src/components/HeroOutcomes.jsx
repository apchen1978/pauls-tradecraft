import { useLang } from "../i18n.jsx";

export default function HeroOutcomes() {
  const { t } = useLang();

  return (
    <section id="hero-outcomes" aria-labelledby="hero-outcomes-heading" className="border-b border-line bg-paper/50">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <p id="hero-outcomes-heading" className="eyebrow">{t.hero.youGet}</p>
        <div className="mt-5 grid gap-6 md:grid-cols-3 md:divide-x md:divide-forest/15">
          {t.hero.outcomes.map((outcome, index) => (
            <div key={outcome.title} className={index === 0 ? "md:pr-6" : index === t.hero.outcomes.length - 1 ? "md:pl-6" : "md:px-6"}>
              <p className="text-[10px] font-bold tracking-[0.14em] text-amber">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-sm font-semibold text-forest md:text-base">{outcome.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{outcome.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
