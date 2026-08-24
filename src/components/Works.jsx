import { motion } from "motion/react";
import {
  CheckCircle,
  ArrowUpRight,
  PresentationChart,
  GameController,
  Receipt,
  Briefcase,
  CaretDown,
  Info,
} from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";

const iconMap = {
  presentation: PresentationChart,
  game: GameController,
  receipt: Receipt,
  briefcase: Briefcase,
};

const SECTION_ORDER = ["commercial", "operations", "labs"];

function CaseStudy({ c, related, link, linkLabel }) {
  const { lang, t } = useLang();
  const f = (field) => (field ? field[lang] : "");
  const stageTag = typeof c.stageTag === "string" ? c.stageTag : c.stageTag?.[lang];
  const labels = t.works.caseStudy;
  return (
    <details className="group mt-4 border-t border-line px-6 pt-4 pb-6">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-pill border border-forest/25 bg-forest/[0.06] px-4 py-2.5 text-sm font-bold text-forest transition-colors hover:bg-forest/10 [&::-webkit-details-marker]:hidden">
        <span className="rounded-pill bg-forest/10 px-2.5 py-0.5 text-xs font-bold text-forest">
          {f(c.stage)}
           {stageTag ? ` · ${stageTag}` : ""}
        </span>
        <span className="flex-1">{labels.label}</span>
        <CaretDown size={14} weight="bold" className="transition-transform group-open:rotate-180" />
      </summary>
       <dl className="mt-3 space-y-3 text-sm">
        {c.gallery && (
          <div>
            <figure>
              <img
                src={c.gallery.src}
                alt={f(c.gallery.alt)}
                loading="lazy"
                className="w-full rounded-field border border-line"
              />
              {c.gallery.caption && (
                <figcaption className="mt-1.5 text-xs text-ink/55">{f(c.gallery.caption)}</figcaption>
              )}
            </figure>
          </div>
        )}
        <div>
          <dt className="font-semibold text-ink/80">{labels.problem}</dt>
          <dd className="mt-0.5 leading-relaxed text-ink/65">{f(c.problem)}</dd>
        </div>
         <div>
           <dt className="font-semibold text-ink/80">{labels.approach}</dt>
           <dd className="mt-0.5 leading-relaxed text-ink/65">{f(c.approach)}</dd>
         </div>
         {c.highlights && (
           <div>
             <dt className="font-semibold text-ink/80">{labels.capabilities ?? "Capabilities"}</dt>
             <dd className="mt-1">
               <ul className="grid gap-1.5 text-ink/65 sm:grid-cols-2">
                 {c.highlights[lang].map((item) => <li key={item} className="flex gap-2 leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />{item}</li>)}
               </ul>
             </dd>
           </div>
         )}
         {!c.compact && (
           <div>
             <dt className="font-semibold text-ink/80">{labels.tools}</dt>
             <dd className="mt-0.5 leading-relaxed text-ink/65">{f(c.tools)}</dd>
           </div>
         )}
         {!c.compact && <div>
           <dt className="font-semibold text-ink/80">{labels.result}</dt>
           <dd className="mt-0.5 leading-relaxed text-ink/65">{f(c.result)}</dd>
         </div>}
        <div>
          <dt className="font-semibold text-ink/80">{labels.evidence}</dt>
          <dd className="mt-0.5 break-words leading-relaxed text-ink/65">{f(c.evidence)}</dd>
        </div>
        {related && (
          <div className="border-t border-line pt-3">
            <a
              href={`#${related.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-amber"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight size={14} weight="bold" />
              {typeof related.label === "string" ? related.label : related.label?.[lang]}
            </a>
            {related.note && <p className="mt-1 text-xs leading-relaxed text-ink/55">{typeof related.note === "string" ? related.note : related.note?.[lang]}</p>}
         </div>
        )}
        {c.compact && link && (
          <div className="border-t border-line pt-3">
            <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-forest transition-colors hover:text-amber">
              <ArrowUpRight size={14} weight="bold" />
              {typeof linkLabel === "string" ? linkLabel : linkLabel?.[lang]}
            </a>
          </div>
        )}
      </dl>
    </details>
  );
}

export default function Works() {
  const { lang, t } = useLang();
  const sections = SECTION_ORDER.map((id) => ({
    id,
    label: t.works.sections[id],
    note: id === "labs" ? t.works.labsNote : "",
    works: [...works]
      .filter((w) => w.section === id)
      .sort((a, b) => (a.featuredRank ?? Number.MAX_SAFE_INTEGER) - (b.featuredRank ?? Number.MAX_SAFE_INTEGER)),
  }));

  const renderCard = (w, i) => {
    const copy = lang === "zh" ? w.zh : w.en;
    const linkLabel = typeof w.linkLabel === "string" ? w.linkLabel : w.linkLabel?.[lang];
    const Icon = w.icon ? iconMap[w.icon] : null;
    const Wrapper = w.link ? "a" : "div";
    const desktopSpan = w.span
      .split(" ")
      .filter((token) => token.startsWith("md:") || !token.startsWith("col-span-"))
      .join(" ");
    const isLarge = (w.span || "").includes("col-span-2") || (w.span || "").includes("col-span-3");
    const wrapperProps = w.link
      ? {
          href: w.link,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": copy.title,
        }
      : {};
    return (
      <motion.article
        key={w.id}
        id={w.id}
        onClick={
          w.link
            ? undefined
            : (e) => {
                if (e.target.closest("summary")) return;
                const det = e.currentTarget.querySelector("details");
                if (det) det.open = !det.open;
              }
        }
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: (i % 3) * 0.06 }}
         className={`group flex scroll-mt-28 flex-col overflow-hidden rounded-card border border-line bg-bone transition-colors hover:border-forest/40 col-span-1 ${desktopSpan} ${w.link ? "" : "cursor-pointer"}`}
      >
        <Wrapper {...wrapperProps} className="flex flex-1 flex-col">
          {w.cover ? (
            <div className="overflow-hidden">
              <img
                src={w.cover}
                alt={w.imageAlt[lang]}
                loading="lazy"
                className={`aspect-[16/9] w-full ${w.imageFit === "contain" ? "object-contain p-6" : "object-cover object-top"} transition-transform duration-500 group-hover:scale-[1.02]`}
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-paper">
              {Icon && <Icon size={44} weight="light" className="text-moss" />}
            </div>
          )}
          <div className={`flex flex-1 flex-col ${isLarge ? "p-7 md:p-8" : "p-6"}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber">
              <span>{copy.tag}</span>
              {w.verified && (
                <span
                  className="inline-flex items-center gap-1 text-forest"
                  title={t.works.verifiedExplain}
                  aria-label={`${t.works.statusVerified}：${t.works.verifiedExplain}`}
                >
                  <CheckCircle size={13} weight="fill" />
                  {t.works.statusVerified}
                  <Info size={12} weight="bold" aria-hidden="true" />
                </span>
              )}
            </div>
            <h3 className={`mt-2.5 flex items-center gap-2 font-bold tracking-tight ${w.id === "trade-deal-desk" ? "text-xl md:text-[21px]" : isLarge ? "text-xl md:text-2xl" : "text-lg"}`}>
              {copy.title}
              {w.link && (
                <ArrowUpRight
                  size={18}
                  weight="bold"
                  className="text-forest transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              )}
            </h3>
            <p className={`mt-2 leading-relaxed text-ink/65 ${isLarge ? "text-[15px] md:text-base" : "text-sm"}`}>{copy.desc}</p>
            {copy.caseSummary && (
              <p className="mt-4 border-l-2 border-amber/70 pl-3 text-sm leading-relaxed text-ink/75">
                <span className="font-semibold text-forest">{t.works.caseStudy.takeaway}：</span>
                {copy.caseSummary}
              </p>
            )}
            <p className="mt-auto pt-4 text-xs font-medium text-ink/65">
              {w.link ? (
                <span className="inline-flex items-center gap-1 text-forest">
                  <ArrowUpRight size={13} weight="bold" />
                  {linkLabel}
                </span>
              ) : !w.hidePendingLink ? (
                t.works.linkPending
              ) : null}
            </p>
            {w.demoNote && (
              <p className="mt-1.5 text-[11px] leading-snug text-ink/50">{w.demoNote[lang]}</p>
            )}
          </div>
        </Wrapper>
   {w.case && <CaseStudy c={w.case} related={w.related} link={w.link} linkLabel={w.linkLabel} />}
      </motion.article>
    );
  };

  return (
    <section id="works" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 md:px-6 md:py-32">
      <div className="max-w-2xl">
        <p className="eyebrow">{t.works.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.works.headline}</h2>
        <p className="mt-4 text-base leading-relaxed text-ink/65">{t.works.sub}</p>
      </div>

      {sections.map((sec, si) => (
        <div key={sec.id} id={`works-${sec.id}`} className="scroll-mt-24">
          <div className={`${si === 0 ? "mt-14" : "mt-12"} border-t border-line pt-6`}>
            <h3 className={`font-bold tracking-tight ${si === 0 ? "text-2xl text-forest md:text-[26px]" : "text-lg text-ink/75"}`}>{sec.label}</h3>
            {sec.note && <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{sec.note}</p>}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-3">
            {sec.works.map((w, i) => renderCard(w, i))}
          </div>
        </div>
      ))}
    </section>
  );
}
