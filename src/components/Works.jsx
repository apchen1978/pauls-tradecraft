import { motion } from "motion/react";
import {
  CheckCircle,
  ArrowUpRight,
  PresentationChart,
  GameController,
  Receipt,
  Briefcase,
  CaretDown,
} from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";

const iconMap = {
  presentation: PresentationChart,
  game: GameController,
  receipt: Receipt,
  briefcase: Briefcase,
};

function CaseStudy({ c }) {
  const { lang, t } = useLang();
  const f = (field) => (field ? field[lang] : "");
  const labels = t.works.caseStudy;
  return (
    <details className="group mt-4 border-t border-line px-6 pt-4 pb-6">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-forest [&::-webkit-details-marker]:hidden">
        <span className="rounded-pill bg-forest/10 px-2.5 py-0.5 text-xs font-bold text-forest">{f(c.stage)}</span>
        <span className="flex-1">{labels.label}</span>
        <CaretDown size={14} weight="bold" className="transition-transform group-open:rotate-180" />
      </summary>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-ink/80">{labels.problem}</dt>
          <dd className="mt-0.5 leading-relaxed text-ink/65">{f(c.problem)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink/80">{labels.approach}</dt>
          <dd className="mt-0.5 leading-relaxed text-ink/65">{f(c.approach)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink/80">{labels.tools}</dt>
          <dd className="mt-0.5 leading-relaxed text-ink/65">{f(c.tools)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink/80">{labels.result}</dt>
          <dd className="mt-0.5 leading-relaxed text-ink/65">{f(c.result)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink/80">{labels.evidence}</dt>
          <dd className="mt-0.5 break-words leading-relaxed text-ink/65">{f(c.evidence)}</dd>
        </div>
      </dl>
    </details>
  );
}

export default function Works() {
  const { lang, t } = useLang();
  return (
    <section id="works" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 md:px-6 md:py-28">
      <div className="max-w-2xl">
        <p className="eyebrow">{t.works.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.works.headline}</h2>
        <p className="mt-4 text-base leading-relaxed text-ink/65">{t.works.sub}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {works.map((w, i) => {
          const copy = lang === "zh" ? w.zh : w.en;
          const linkLabel = typeof w.linkLabel === "string" ? w.linkLabel : w.linkLabel?.[lang];
          const Icon = w.icon ? iconMap[w.icon] : null;
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: (i % 3) * 0.06 }}
              className={`group flex flex-col overflow-hidden rounded-card border border-line bg-bone transition-colors hover:border-forest/40 ${w.span}`}
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
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber">
                    <span>{copy.tag}</span>
                    {w.verified && (
                      <span className="inline-flex items-center gap-1 text-forest">
                        <CheckCircle size={13} weight="fill" />
                        {t.works.statusVerified}
                      </span>
                    )}
                  </div>
                  <h3 className={`mt-2.5 flex items-center gap-2 font-bold tracking-tight ${w.id === "trade-deal-desk" ? "text-xl md:text-[21px]" : "text-lg"}`}>
                    {copy.title}
                    {w.link && (
                      <ArrowUpRight
                        size={18}
                        weight="bold"
                        className="text-forest transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    )}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{copy.desc}</p>
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
                </div>
              </Wrapper>
              {w.case && <CaseStudy c={w.case} />}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
