import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function StartHere() {
  const { t } = useLang();
  const content = t.startHere;

  return (
    <section id="start-here" className="scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{content.headline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70 md:text-base">{content.intro}</p>
        </div>

        <div className="mt-9 grid border-y border-line md:grid-cols-3 md:divide-x md:divide-line">
          {content.items.map((item, index) => (
            <a
              key={item.title}
              href={item.href}
              className="group border-b border-line px-0 py-6 last:border-b-0 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0"
            >
              <p className="text-xs font-bold tabular-nums tracking-[0.16em] text-amber">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight text-forest group-hover:text-amber">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{item.outcome}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 transition-colors group-hover:text-amber">
                {item.cta}
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
