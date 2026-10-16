import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { withDemoLang } from "../demoLinks.js";

// Interactive works sit directly after the three questions, before the
// one-deal section. The Garage stays further down. Extra cards join this
// grid instead of stretching one work into a banner.
// Five works use a three-plus-two layout to keep the two lamp works together.
// With six or more, the regular three-column grid keeps every card equally legible.
const wideAt = (index, count) => {
  if (count !== 5 || index < 3) return { li: "xl:col-span-2", row: "" };
  if (index === 4) return { li: "sm:col-span-2 xl:col-span-3", row: "sm:flex-row" };
  return { li: "xl:col-span-3", row: "xl:flex-row" };
};
const wideImage = { "sm:flex-row": "sm:w-2/5 sm:shrink-0 sm:self-start", "xl:flex-row": "xl:w-2/5 xl:shrink-0 xl:self-start", "": "" };
export default function Showcase() {
  const { lang, t } = useLang();
  const s = t.showcase;
  const items = s.items.map((item) => ({ ...item, href: withDemoLang(item.href, lang) }));

  return (
    <section id="showcase" aria-labelledby="showcase-heading" className="scroll-mt-24 border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-28">
        <p className="text-xs font-semibold tracking-[0.08em] text-moss md:text-sm">{s.eyebrow}</p>
        <h2 id="showcase-heading" className="mt-4 max-w-[10em] text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-ink md:text-[3.5rem]">
          {s.headline}
        </h2>
        <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-moss md:text-lg">{s.intro}</p>
        <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-moss md:text-base">
          {s.startLabel}{" "}
          <a
            href={withDemoLang(s.startHref, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm font-semibold text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {s.startCta}
          </a>
        </p>
        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-14 lg:gap-8 xl:grid-cols-6">
          {items.map((item, index) => {
            const wide = wideAt(index, items.length);
            return (
            <li key={item.href} className={`flex ${wide.li}`}>
              <article className={`flex w-full flex-col overflow-hidden rounded-[1.25rem] border-[2.5px] border-ink bg-bone ${wide.row}`}>
                <div className={`overflow-hidden bg-paper ${wideImage[wide.row]}`} style={{ aspectRatio: item.imageRatio }}>
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    width={item.imageWidth}
                    height={item.imageHeight}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: item.objectPosition }}
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="text-xs font-semibold text-moss">{item.tag}</p>
                  <h3 className="mt-3 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink md:text-[1.5rem]">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ink">{item.hook}</p>
                  <p className="mt-3 text-base leading-relaxed text-ink">{item.teaches}</p>
                  <div className="mt-auto pt-6">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bone transition-[filter] hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      <span>{item.cta}</span>
                      <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                    <p className="mt-4 border-t-2 border-dashed border-ink/25 pt-3 text-xs leading-relaxed text-moss">{item.boundary}</p>
                  </div>
                </div>
              </article>
            </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
