import { motion } from "motion/react";
import { CheckCircle, PresentationChart, GameController, Receipt } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";

const iconMap = {
  presentation: PresentationChart,
  game: GameController,
  receipt: Receipt,
};

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
          const Icon = w.icon ? iconMap[w.icon] : null;
          return (
            <motion.article
              key={w.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: (i % 3) * 0.06 }}
              className={`group overflow-hidden rounded-card border border-line bg-bone transition-colors hover:border-forest/40 ${w.span}`}
            >
              {w.image ? (
                <div className="overflow-hidden">
                  <img
                    src={w.image}
                    alt={w.imageAlt}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-paper">
                  {Icon && <Icon size={44} weight="light" className="text-moss" />}
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber">
                  <span>{copy.tag}</span>
                  {w.verified && (
                    <span className="inline-flex items-center gap-1 text-forest">
                      <CheckCircle size={13} weight="fill" />
                      {t.works.statusVerified}
                    </span>
                  )}
                </div>
                <h3 className="mt-2.5 text-lg font-bold tracking-tight">{copy.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{copy.desc}</p>
                {!w.link && <p className="mt-3 text-xs font-medium text-ink/65">{t.works.linkPending}</p>}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
