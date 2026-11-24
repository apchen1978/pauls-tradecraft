import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

const topicColors = ["#9EE0C1", "#8ECFF0", "#F08A6E", "#D7C4F2", "#E5C879"];

// AI Lab entry, right after the Showcase. The open-horizon painting gives this
// creative pillar the same visual weight as the ROOMVERSE showcase above it.
// SITE_RULES exception (Paul 2026-10-15): this block and the lab page may use AI wording.
export default function AiLabEntry() {
  const { lang, t } = useLang();
  const a = t.aiLab;
  return (
    <section id="ai-lab" aria-labelledby="ai-lab-heading" className="ai-lab-highlight scroll-mt-24 border-b border-bone/10 text-bone">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-8 rounded-card border border-bone/20 bg-pine/55 p-5 shadow-[0_24px_64px_-40px_rgba(5,20,26,.8)] md:gap-10 md:p-9 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 lg:p-12">
          <div className="min-w-0">
            <p className="font-mono text-xs tracking-[0.12em] text-gold md:text-sm">{a.kicker}</p>
            <h2 id="ai-lab-heading" className="mt-5 max-w-[13ch] text-[2.55rem] font-semibold leading-[1.08] tracking-[-0.035em] text-bone md:text-[3.7rem]">{a.title}</h2>
            <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-ondark md:text-lg">{a.lead}</p>
            <a
              href={`/ai-lab/?lang=${lang}`}
              className="group mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-pine transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <span>{a.cta}</span>
              <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <nav aria-label={a.creativeWorkLabel} className="mt-5 flex flex-wrap gap-2">
              <a href={`/gallery/?lang=${lang}`} className="rounded-full border border-[#9EE0C1]/45 bg-[#9EE0C1]/10 px-3 py-1.5 text-sm font-medium text-[#C7F2DD] transition-colors hover:bg-[#9EE0C1]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9EE0C1]">{a.galleryLink}</a>
              <a href={`/music-lounge/?lang=${lang}`} className="rounded-full border border-[#F2B795]/45 bg-[#F2B795]/10 px-3 py-1.5 text-sm font-medium text-[#FFD0B3] transition-colors hover:bg-[#F2B795]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B795]">{a.musicLink}</a>
            </nav>
          </div>

          <figure className="ai-lab-art relative min-w-0 overflow-hidden rounded-field border border-bone/25 bg-[#253c4b]">
            <picture>
              <source media="(max-width: 640px)" srcSet="/gallery/assets/ai-lab-open-horizon-mobile.webp?v=1" />
              <img src="/gallery/assets/ai-lab-open-horizon.webp?v=1" width="1024" height="576" alt={a.artAlt} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover sm:aspect-[16/9]" />
            </picture>
            <div aria-hidden="true" className="ai-lab-art-wash absolute inset-0" />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-t from-[#142C29]/95 via-[#142C29]/78 to-transparent px-4 pb-4 pt-12 text-sm font-medium text-bone md:px-6 md:pb-5">
              <span>{a.artCaption}</span>
              <span className="rounded-full border border-bone/25 bg-pine/75 px-3 py-1 text-xs text-ondark">{a.artCredit}</span>
            </figcaption>
          </figure>
        </div>

        <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5" aria-label={a.topicsLabel}>
          {a.chapters.map((title, i) => (
            <li key={title} className="flex min-h-16 items-center gap-3 rounded-field border border-bone/15 bg-bone/[0.055] px-4 py-3 text-sm leading-snug text-ondark">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: topicColors[i % topicColors.length] }} />
              {title}
            </li>
          ))}
        </ol>
        <p className="mt-3 max-w-5xl text-sm leading-relaxed text-ondark-meta">{a.deeper}</p>
      </div>
    </section>
  );
}
