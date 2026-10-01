import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

// Digital Garage, on the page: every experiment, in the same ruled-column grammar as
// the rest of the homepage. Desktop shows all of them in a three-column grid. On a phone
// the first three show and the rest sit under one toggle, so the section stays short.
function Card({ item, g }) {
  return (
    <article className="flex w-full flex-col">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium text-moss">{item.tag}</p>
        {item.featured ? <p className="text-sm font-medium text-amber">{g.featuredMark}</p> : null}
      </div>
      <h3 className="mt-5 text-[1.375rem] font-medium leading-[1.25] tracking-[-0.02em] text-ink md:text-[1.5rem]">{item.title}</h3>
      <p className="mt-4 border-l-2 border-amber/70 pl-3 text-base font-medium leading-snug text-forest">{item.spark}</p>
      <p className="mt-4 hidden text-base leading-relaxed text-moss md:block">{item.note}</p>
      <div className="mt-auto pt-7">
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-start justify-between gap-4 border-b border-ink pb-3 text-base font-medium text-ink transition-colors hover:border-amber hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
        >
          <span>{item.cta}</span>
          <ArrowUpRight size={18} weight="bold" aria-hidden="true" className="mt-1 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <p className="mt-3 text-sm text-moss">{item.boundary}</p>
      </div>
    </article>
  );
}

export default function Garage() {
  const { t } = useLang();
  const g = t.garage;
  const items = g.items;
  const firstThree = items.slice(0, 3);
  const rest = items.slice(3);
  const lastRowStart = Math.floor((items.length - 1) / 3) * 3;

  return (
    <section id="garage" aria-labelledby="garage-heading" className="scroll-mt-24 border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-36">
        <p className="eyebrow">{g.eyebrow}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <h2 id="garage-heading" className="max-w-[24ch] text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] md:text-[3.25rem]">{g.headline}</h2>
          <p className="max-w-[44ch] self-end text-base leading-relaxed text-moss md:text-lg">{g.intro}</p>
        </div>

        {/* Desktop: every experiment, three columns */}
        <ol className="mt-10 hidden border-y border-ink md:mt-20 md:grid md:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={item.href}
              className={`flex py-10 md:px-8 ${index < lastRowStart ? "border-b border-line" : ""} ${index % 3 === 0 ? "md:pl-0" : "md:border-l md:border-line"} ${index % 3 === 2 ? "md:pr-0" : ""}`}
            >
              <Card item={item} g={g} />
            </li>
          ))}
        </ol>

        {/* Phone: the first three, the rest under one toggle */}
        <div className="mt-10 md:hidden">
          <ol className="border-t border-ink">
            {firstThree.map((item) => (
              <li key={item.href} className="flex border-b border-line py-8">
                <Card item={item} g={g} />
              </li>
            ))}
          </ol>
          {rest.length ? (
            <details className="group/more border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-base font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber">
                <span>{g.moreLabel}</span>
                <span aria-hidden="true" className="text-xl leading-none text-amber transition-transform duration-200 group-open/more:rotate-45">+</span>
              </summary>
              <ol className="border-t border-line">
                {rest.map((item) => (
                  <li key={item.href} className="flex border-b border-line py-8 last:border-b-0">
                    <Card item={item} g={g} />
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  );
}
