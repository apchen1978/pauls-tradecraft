import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

// Digital Garage, visible on the homepage: the featured experiments in the same
// ruled-column grammar as the rest of the page, and a link into the full Garage,
// which lives in the collapsed "Go deeper" library (the hash handler opens it).
export default function GarageBridge() {
  const { t } = useLang();
  const g = t.garage;
  const featured = g.items.filter((item) => item.featured).slice(0, 3);

  return (
    <section id="garage-bridge" aria-labelledby="garage-bridge-heading" className="scroll-mt-24 border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-36">
        <p className="eyebrow">{g.bridgeEyebrow}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <h2 id="garage-bridge-heading" className="max-w-[24ch] text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] md:text-[3.25rem]">{g.bridgeHeadline}</h2>
          <p className="max-w-[44ch] self-end text-base leading-relaxed text-ink/70 md:text-lg">{g.bridgeLine}</p>
        </div>

        <ol className="mt-10 grid border-t border-ink md:mt-20 md:grid-cols-3">
          {featured.map((item) => (
            <li key={item.href} className="flex border-b border-line py-8 md:border-b-0 md:border-l md:border-line md:px-8 md:py-10 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
              <article className="flex w-full flex-col">
                <p className="text-sm font-medium text-moss">{item.tag}</p>
                <h3 className="mt-5 text-[1.5rem] font-medium leading-[1.25] tracking-[-0.02em] text-ink md:text-[1.75rem]">{item.title}</h3>
                <p className="mt-5 border-l-2 border-amber/70 pl-3 text-base font-medium leading-snug text-forest">{item.spark}</p>
                <p className="mt-4 hidden text-base leading-relaxed text-ink/70 md:block">{item.note}</p>
                <div className="mt-auto pt-8">
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-start justify-between gap-4 border-b border-ink pb-3 text-base font-medium text-ink transition-colors hover:border-amber hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
                  >
                    <span>{item.cta}</span>
                    <ArrowUpRight size={18} weight="bold" aria-hidden="true" className="mt-1 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                  <p className="mt-3 text-sm text-ink/70">{item.boundary}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <a
          href="#garage"
          className="group mt-12 inline-flex items-start gap-3 border-b border-ink pb-3 text-base font-medium text-ink transition-colors hover:border-amber hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
        >
          <span>{g.seeAll}</span>
          <ArrowUpRight size={18} weight="bold" aria-hidden="true" className="mt-1 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
