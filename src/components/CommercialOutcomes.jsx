import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

// One short thread: the sentence that ties the works together, and a link to each
// stage. The per-stage detail already lives in the work cards, so it is not repeated.
export default function CommercialOutcomes() {
  const { t } = useLang();
  const content = t.outcomes;
  return (
    <section id="outcomes" aria-labelledby="outcomes-heading" className="scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 id="outcomes-heading" className="mt-3 text-2xl font-semibold leading-[1.2] tracking-[-0.02em] md:text-[2.25rem]">{content.headline}</h2>
          <p className="mt-4 max-w-2xl border-l-2 border-amber/60 pl-4 text-base leading-relaxed text-moss">{content.pathStatement}</p>
        </div>
        <ol className="mt-6 flex flex-wrap gap-2">
          {content.items.map((item, index) => (
            <li key={item.label}>
              <a
                href={item.href}
                {...(/^https?:/.test(item.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex items-center gap-1.5 rounded-pill border border-forest/25 bg-forest/[0.05] px-3.5 py-2 text-sm font-semibold text-forest transition-colors hover:border-amber/60 hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                <span className="text-xs tabular-nums text-moss">{String(index + 1).padStart(2, "0")}</span>
                {item.label}
                {/^https?:/.test(item.href) ? <ArrowUpRight size={13} weight="bold" aria-hidden="true" /> : null}
              </a>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-moss">{content.boundary}</p>
      </div>
    </section>
  );
}
