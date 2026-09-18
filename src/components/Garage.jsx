import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function Garage() {
  const { t } = useLang();
  const g = t.garage;

  return (
    <section id="garage" aria-labelledby="garage-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 md:px-6 md:py-32">
      <div className="max-w-2xl">
        <p className="eyebrow">{g.eyebrow}</p>
        <h2 id="garage-heading" className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{g.headline}</h2>
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink/65">{g.intro}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {g.items.map((item) => (
          <article key={item.title} className="flex flex-col rounded-card border border-line surface-paper p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{g.syntheticTag}</p>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-ink">{item.title}</h3>
            <p className="mt-4 border-l-2 border-amber/70 pl-3 text-[15px] font-semibold leading-snug text-forest">{item.spark}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/65">{item.note}</p>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-field bg-forest px-4 py-2.5 text-sm font-bold text-bone transition-colors hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              {g.playLabel}
              <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
            </a>
            <p className="mt-3 text-xs leading-snug text-moss">{g.boundary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
