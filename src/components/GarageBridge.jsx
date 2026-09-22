import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function GarageBridge() {
  const { t } = useLang();
  const g = t.garage;
  const featured = g.items.filter((item) => item.featured).slice(0, 2);

  return (
    <section id="garage-bridge" aria-labelledby="garage-bridge-heading" className="border-b border-line bg-bone">
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-10 md:px-6 md:py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
        <div>
          <p className="eyebrow">{g.bridgeEyebrow}</p>
          <h2 id="garage-bridge-heading" className="mt-3 max-w-[22ch] text-xl font-bold tracking-tight text-ink md:text-2xl">
            {g.bridgeHeadline}
          </h2>
          <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ink/65 md:text-base">{g.bridgeLine}</p>
          <a
            href="#garage"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 transition-colors hover:text-amber"
          >
            {g.seeAll}
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-card border border-line surface-paper p-5 transition-colors hover:border-amber/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{item.tag}</p>
              <h3 className="mt-2 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-forest">{item.title}</h3>
              <p className="mt-2 text-sm font-medium leading-snug text-forest">{item.spark}</p>
              <p className="mt-3 text-xs leading-snug text-moss">{item.boundary}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
