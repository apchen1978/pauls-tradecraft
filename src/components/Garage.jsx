import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function Garage() {
  const { t } = useLang();
  const g = t.garage;

  return (
    <section id="garage" aria-labelledby="garage-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 md:px-6 md:py-32">
      <div className="max-w-2xl">
        <p className="eyebrow">{g.eyebrow}</p>
        <h2 id="garage-heading" className="mt-3 text-3xl font-semibold leading-[1.2] tracking-[-0.02em] md:text-[2.625rem]">{g.headline}</h2>
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink/70">{g.intro}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {g.items.map((item) => (
          <article key={item.title} className="flex flex-col rounded-card border border-line surface-paper p-7">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-xs font-medium text-moss">{item.tag}</p>
              {item.featured ? (
                <p className="text-xs font-semibold text-moss">{g.featuredMark}</p>
              ) : null}
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
            <p className="mt-4 border-l-2 border-amber/70 pl-3 text-sm font-semibold leading-snug text-forest">{item.spark}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">{item.note}</p>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-fit items-center gap-1.5 pt-6 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 transition-colors hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              {item.cta}
              <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
            </a>
            <p className="mt-3 text-xs leading-snug text-moss">{item.boundary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
