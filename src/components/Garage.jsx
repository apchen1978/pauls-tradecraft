import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

// Digital Garage, on the page: a sticker wall. Every experiment is a hard-edged card,
// tilted a few degrees, with a highlighter-marked spark. Desktop shows the nine experiments
// in a three-column grid; a wide card (item.wide) sits on the next row, spanning all three
// columns. On a phone the first three show, then that wide card, then the rest under one
// toggle — the wide card is not repeated inside the toggle. Palette stays inside the site
// tokens (bone / white / soft, ink borders). The highlighter band and the headline mark use
// the coral "pop" accent; the "featured" and "latest" badges stay gold.
const TILT = ["-rotate-[1.2deg]", "rotate-[0.8deg]", "-rotate-[0.5deg]"];
const FILL = ["bg-white", "bg-paper", "bg-white"];
const SHADOW = "shadow-[5px_5px_0_var(--color-ink)] hover:shadow-[8px_10px_0_var(--color-ink)]";

function Card({ item, g, index }) {
  return (
    <article
      className={`flex w-full flex-col rounded-[1.25rem] border-[2.5px] border-ink p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:rotate-0 md:p-6 ${TILT[index % 3]} ${FILL[index % 3]} ${SHADOW}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="rounded-full border-2 border-ink bg-bone px-2.5 py-1 text-xs font-bold text-ink">{item.tag}</p>
        {item.featured || item.latest ? (
          <div className="flex flex-wrap gap-2">
            {item.featured ? (
              <p className="rounded-full border-2 border-ink bg-gold px-2.5 py-1 text-xs font-bold text-pine">{g.featuredMark}</p>
            ) : null}
            {item.latest ? (
              <p className="rounded-full border-2 border-ink bg-gold px-2.5 py-1 text-xs font-bold text-pine">{g.latestMark}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <h3 className="mt-5 text-[1.375rem] font-bold leading-[1.2] tracking-[-0.02em] text-ink md:text-[1.5rem]">{item.title}</h3>
      <p className="mt-4 text-base font-semibold leading-[1.55] text-ink">
        <span className="box-decoration-clone bg-[linear-gradient(transparent_58%,var(--color-pop)_58%,var(--color-pop)_92%,transparent_92%)]">{item.spark}</span>
      </p>
      <p className="mt-4 hidden text-base leading-relaxed text-moss md:block">{item.note}</p>
      <div className="mt-auto pt-6">
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-bone transition-[filter] hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <span>{item.cta}</span>
          <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <p className="mt-4 border-t-2 border-dashed border-ink/25 pt-3 text-xs leading-relaxed text-moss">{item.boundary}</p>
      </div>
    </article>
  );
}

function WideCard({ item, g }) {
  return (
    <article className="flex w-full flex-col rounded-[1.25rem] border-[2.5px] border-ink bg-white p-5 shadow-[5px_5px_0_var(--color-ink)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[8px_10px_0_var(--color-ink)] md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p className="rounded-full border-2 border-ink bg-bone px-2.5 py-1 text-xs font-bold text-ink">{item.tag}</p>
            {item.latest ? (
              <p className="rounded-full border-2 border-ink bg-gold px-2.5 py-1 text-xs font-bold text-pine">{g.latestMark}</p>
            ) : null}
          </div>
          <h3 className="mt-5 text-[1.375rem] font-bold leading-[1.2] tracking-[-0.02em] text-ink md:text-[1.75rem]">{item.title}</h3>
          <p className="mt-4 text-base font-semibold leading-[1.55] text-ink">
            <span className="box-decoration-clone bg-[linear-gradient(transparent_58%,var(--color-pop)_58%,var(--color-pop)_92%,transparent_92%)]">{item.spark}</span>
          </p>
          <p className="mt-4 text-base leading-relaxed text-moss">{item.note}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 self-start md:items-end md:self-end">
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-bone transition-[filter] hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            <span>{item.cta}</span>
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          {item.caseHref ? (
            <a
              href={item.caseHref}
              className="text-sm font-semibold text-moss underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {item.caseLabel}
            </a>
          ) : null}
        </div>
      </div>
      <p className="mt-6 border-t-2 border-dashed border-ink/25 pt-3 text-xs leading-relaxed text-moss">{item.boundary}</p>
    </article>
  );
}

function Headline({ text, mark }) {
  const at = mark ? text.indexOf(mark) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="whitespace-nowrap rounded-[0.18em] bg-pop px-[0.12em] text-pine">{mark}</mark>
      {text.slice(at + mark.length)}
    </>
  );
}

export default function Garage() {
  const { t } = useLang();
  const g = t.garage;
  const items = g.items;
  const regular = items.filter((item) => !item.wide);
  const wideItem = items.find((item) => item.wide);
  const firstThree = regular.slice(0, 3);
  const rest = regular.slice(3);

  return (
    <section id="garage" aria-labelledby="garage-heading" className="scroll-mt-24 overflow-x-clip border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-32">
        <p className="inline-block -rotate-2 rounded-2xl bg-ink px-4 py-1.5 text-xs font-bold tracking-[0.06em] text-bone md:text-sm">{g.eyebrow}</p>
        <h2 id="garage-heading" className="mt-6 max-w-[12ch] text-[2.25rem] font-bold leading-[1.1] tracking-[-0.03em] md:text-[4rem]">
          <Headline text={g.headline} mark={g.headlineMark} />
        </h2>
        <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-moss md:text-lg">{g.intro}</p>

        {/* Desktop: the nine experiments stay a 3×3; the wide card spans the row below */}
        <ol className="mt-14 hidden gap-7 md:grid md:grid-cols-3">
          {regular.map((item, index) => (
            <li key={item.href} className="flex">
              <Card item={item} g={g} index={index} />
            </li>
          ))}
          {wideItem ? (
            <li key={wideItem.href} className="col-span-3 flex">
              <WideCard item={wideItem} g={g} />
            </li>
          ) : null}
        </ol>

        {/* Phone: the first three, then the wide card, then the rest under one toggle */}
        <div className="mt-10 md:hidden">
          <ol className="grid gap-6">
            {firstThree.map((item, index) => (
              <li key={item.href} className="flex">
                <Card item={item} g={g} index={index} />
              </li>
            ))}
            {wideItem ? (
              <li key={wideItem.href} className="flex">
                <WideCard item={wideItem} g={g} />
              </li>
            ) : null}
          </ol>
          {rest.length ? (
            <details className="group/more mt-6">
              <summary className="inline-flex cursor-pointer list-none items-center gap-3 rounded-full border-[2.5px] border-ink bg-white px-5 py-3 text-sm font-bold text-ink shadow-[4px_4px_0_var(--color-ink)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[6px_7px_0_var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                <span>{g.moreLabel}</span>
                <span aria-hidden="true" className="text-lg leading-none transition-transform duration-200 group-open/more:rotate-45">+</span>
              </summary>
              <ol className="mt-6 grid gap-6">
                {rest.map((item, index) => (
                  <li key={item.href} className="flex">
                    <Card item={item} g={g} index={index + 3} />
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
