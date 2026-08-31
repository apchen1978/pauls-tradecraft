import { useLayoutEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
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

function CaseStudy({ c, related, link, linkLabel, tone = "light" }) {
  const { lang, t } = useLang();
  const f = (field) => (field ? field[lang] : "");
  const stageTag = typeof c.stageTag === "string" ? c.stageTag : c.stageTag?.[lang];
  const labels = t.works.caseStudy;
  const isDark = tone === "dark";
  const styles = isDark
    ? {
        details: "border-bone/15",
        summary: "border-bone/25 bg-bone/[0.06] text-bone hover:bg-bone/[0.1]",
        stage: "bg-gold/15 text-gold",
        border: "border-bone/15",
        heading: "text-bone/90",
        body: "text-bone/70",
        caption: "text-bone/55",
        link: "text-gold hover:text-bone",
      }
    : {
        details: "border-line",
        summary: "border-forest/25 bg-forest/[0.06] text-forest hover:bg-forest/10",
        stage: "bg-forest/10 text-forest",
        border: "border-line",
        heading: "text-ink/80",
        body: "text-ink/65",
        caption: "text-ink/65",
        link: "text-forest hover:text-amber",
      };
  return (
    <details className={`group mt-4 border-t px-6 pt-4 pb-6 ${styles.details}`}>
      <summary className={`flex cursor-pointer list-none items-center gap-2 rounded-pill border px-4 py-2.5 text-sm font-bold transition-colors [&::-webkit-details-marker]:hidden ${styles.summary}`}>
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-bold ${styles.stage}`}>
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
                className={`w-full rounded-field border ${styles.border}`}
              />
              {c.gallery.caption && (
                <figcaption className={`mt-1.5 text-xs ${styles.caption}`}>{f(c.gallery.caption)}</figcaption>
              )}
            </figure>
          </div>
        )}
        <div>
          <dt className={`font-semibold ${styles.heading}`}>{labels.problem}</dt>
          <dd className={`mt-0.5 leading-relaxed ${styles.body}`}>{f(c.problem)}</dd>
        </div>
         <div>
           <dt className={`font-semibold ${styles.heading}`}>{labels.approach}</dt>
           <dd className={`mt-0.5 leading-relaxed ${styles.body}`}>{f(c.approach)}</dd>
         </div>
         {c.highlights && (
           <div>
             <dt className={`font-semibold ${styles.heading}`}>{labels.capabilities ?? "Capabilities"}</dt>
             <dd className="mt-1">
               <ul className={`grid gap-1.5 sm:grid-cols-2 ${styles.body}`}>
                 {c.highlights[lang].map((item) => <li key={item} className="flex gap-2 leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />{item}</li>)}
               </ul>
             </dd>
           </div>
         )}
         {!c.compact && (
           <div>
              <dt className={`font-semibold ${styles.heading}`}>{labels.tools}</dt>
              <dd className={`mt-0.5 leading-relaxed ${styles.body}`}>{f(c.tools)}</dd>
           </div>
         )}
         {!c.compact && <div>
            <dt className={`font-semibold ${styles.heading}`}>{labels.result}</dt>
            <dd className={`mt-0.5 leading-relaxed ${styles.body}`}>{f(c.result)}</dd>
         </div>}
        <div>
          <dt className={`font-semibold ${styles.heading}`}>{labels.evidence}</dt>
          <dd className={`mt-0.5 break-words leading-relaxed ${styles.body}`}>{f(c.evidence)}</dd>
        </div>
        {related && (
          <div className={`border-t pt-3 ${styles.border}`}>
            <a
              href={`#${related.id}`}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${styles.link}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight size={14} weight="bold" />
              {typeof related.label === "string" ? related.label : related.label?.[lang]}
            </a>
            {related.note && <p className={`mt-1 text-xs leading-relaxed ${styles.caption}`}>{typeof related.note === "string" ? related.note : related.note?.[lang]}</p>}
         </div>
        )}
        {c.compact && link && (
          <div className={`border-t pt-3 ${styles.border}`}>
            <a href={link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${styles.link}`}>
              <ArrowUpRight size={14} weight="bold" />
              {typeof linkLabel === "string" ? linkLabel : linkLabel?.[lang]}
            </a>
          </div>
        )}
      </dl>
    </details>
  );
}

function FeaturedSystem({ work }) {
  const { lang, t } = useLang();
  const featuredRef = useRef(null);
  const copy = work[lang];
  const linkLabel = typeof work.linkLabel === "string" ? work.linkLabel : work.linkLabel?.[lang];

  useLayoutEffect(() => {
    const root = featuredRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
        const timeline = gsap.timeline({ paused: true });

        if (conditions.reduceMotion) {
          timeline.set("[data-featured-copy], [data-featured-visual]", { autoAlpha: 1 });
        } else {
          timeline
            .from("[data-featured-copy]", {
              y: 14,
              autoAlpha: 0,
              duration: 0.48,
              ease: "power2.out",
              stagger: 0.07,
              immediateRender: false,
            })
            .from(
              "[data-featured-visual]",
              {
                y: 10,
                autoAlpha: 0,
                duration: 0.52,
                ease: "power2.out",
                immediateRender: false,
              },
              "<0.12",
            );
        }

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              timeline.play();
              observer.disconnect();
            }
          },
          { threshold: 0.2, rootMargin: "0px 0px -8%" },
        );

        observer.observe(root);
        return () => {
          observer.disconnect();
          timeline.kill();
        };
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <article ref={featuredRef} id={work.id} className="scroll-mt-28 overflow-hidden rounded-card border border-forest/25 bg-ink text-bone shadow-[0_28px_72px_-42px_rgba(20,51,41,0.72)]">
      <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
        <div className="flex flex-col px-6 py-8 md:px-10 md:py-11 lg:px-9 lg:py-9">
          <div data-featured-copy className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            <span>{copy.tag}</span>
            {work.verified && (
              <span className="inline-flex items-center gap-1 text-bone/70" title={t.works.verifiedExplain}>
                <CheckCircle size={14} weight="fill" className="text-gold" />
                {t.works.statusVerified}
              </span>
            )}
          </div>
          <h3 data-featured-copy className="mt-5 max-w-md text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-bone md:text-4xl">{copy.title}</h3>
          <p data-featured-copy className="mt-5 max-w-[43ch] text-base leading-relaxed text-bone/72">{copy.desc}</p>
          {copy.caseSummary && (
            <p data-featured-copy className="mt-7 border-l border-gold pl-4 text-sm leading-relaxed text-bone/85">{copy.caseSummary}</p>
          )}
          <a data-featured-copy href={work.link} target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex w-fit items-center gap-2 rounded-field bg-gold px-5 py-3 text-sm font-bold text-pine transition-colors hover:bg-[#f2be61]">
            {linkLabel}
            <ArrowUpRight size={16} weight="bold" />
          </a>
          {work.id === "commercial-decision-desk" && (
            <a data-featured-copy href="#contact" className="mt-4 w-fit text-sm font-semibold text-bone/75 underline decoration-bone/30 underline-offset-4 transition-colors hover:text-gold">
              {t.hero.cddInvite}
            </a>
          )}
          {work.demoNote && <p className="mt-4 text-xs leading-relaxed text-bone/50">{work.demoNote[lang]}</p>}
        </div>
        <a data-featured-visual href={work.link} target="_blank" rel="noopener noreferrer" aria-label={copy.title} className="group relative block border-t border-bone/10 bg-[#dfe4d9] p-3 lg:border-l lg:border-t-0 lg:p-3">
          <div className="overflow-hidden rounded-field border border-ink/10 bg-bone shadow-[0_18px_36px_-24px_rgba(0,0,0,0.62)]">
            <div className="flex items-center justify-between border-b border-ink/10 bg-[#edf0e7] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/65">
              <span>Featured Work</span>
              <span className="text-forest">{t.works.statusVerified}</span>
            </div>
            <img src={work.cover} alt={work.imageAlt[lang]} loading="eager" className="aspect-[16/9] h-full w-full object-cover object-top" />
          </div>
          <span className="absolute bottom-7 right-7 rounded-field bg-ink/90 px-3 py-2 text-xs font-semibold text-bone opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{linkLabel} →</span>
        </a>
      </div>
      {work.case && <CaseStudy c={work.case} related={work.related} link={work.link} linkLabel={work.linkLabel} tone="dark" />}
    </article>
  );
}

export default function Works() {
  const { lang, t } = useLang();
  const featuredSystem = works.find((work) => work.id === "commercial-decision-desk");
  const sections = SECTION_ORDER.map((id) => ({
    id,
    label: t.works.sections[id],
    note: t.works.sections.notes[id],
    works: [...works]
      .filter((w) => w.section === id && w.id !== featuredSystem.id)
      .sort((a, b) => (a.featuredRank ?? Number.MAX_SAFE_INTEGER) - (b.featuredRank ?? Number.MAX_SAFE_INTEGER)),
  }));

  const renderCard = (w, i) => {
    const copy = lang === "zh" ? w.zh : w.en;
    const linkLabel = typeof w.linkLabel === "string" ? w.linkLabel : w.linkLabel?.[lang];
    const Icon = w.icon ? iconMap[w.icon] : null;
    const spanClass = w.span?.replace(/^col-span-\d+/, "col-span-1") ?? "col-span-1";
    const Wrapper = w.link ? "a" : "div";
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
         className={`group flex scroll-mt-28 flex-col overflow-hidden rounded-card border border-line surface-paper transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-forest/35 hover:shadow-[0_24px_48px_-32px_rgba(20,51,41,0.62)] ${spanClass} ${w.link ? "" : "cursor-pointer"}`}
      >
        <Wrapper {...wrapperProps} className="flex flex-1 flex-col">
          {w.cover ? (
            <div className="overflow-hidden bg-ink/[0.04]">
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
          <div className="flex flex-1 flex-col border-t border-ink/5 p-7 md:p-8 lg:p-7">
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
            <h3 className="mt-2.5 flex items-center gap-2 text-xl font-bold tracking-tight md:text-2xl">
              {copy.title}
              {w.link && (
                <ArrowUpRight
                  size={18}
                  weight="bold"
                  className="text-forest transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              )}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/65 md:text-base">{copy.desc}</p>
            {copy.caseSummary && (
              <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink/75">
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
              <p className="mt-1.5 text-[11px] leading-snug text-ink/65">{w.demoNote[lang]}</p>
            )}
          </div>
        </Wrapper>
   {w.case && <CaseStudy c={w.case} related={w.related} link={w.link} linkLabel={w.linkLabel} />}
      </motion.article>
    );
  };

  return (
    <section id="works" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-28 md:px-6 md:py-36 lg:py-28">
      <div className="border-b border-line pb-12">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.works.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.works.headline}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/65">{t.works.sub}</p>
        </div>
      </div>

      <div className="mt-14 lg:mt-12">
        <p className="eyebrow mb-5">{t.works.sections.commercial}</p>
        <FeaturedSystem work={featuredSystem} />
      </div>

      {sections.map((sec, si) => (
        <div key={sec.id} id={`works-${sec.id}`} className="scroll-mt-24">
          <div className={`${si === 0 ? "mt-16 lg:mt-12" : "mt-14 lg:mt-12"} border-t border-line pt-7`}>
            <h3 className={`font-bold tracking-tight ${si === 0 ? "text-xl text-forest md:text-2xl" : "text-lg text-ink/75"}`}>{sec.label}</h3>
            {sec.note && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">{sec.note}</p>}
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-6">
            {sec.works.map((w, i) => renderCard(w, i))}
          </div>
        </div>
      ))}
    </section>
  );
}
