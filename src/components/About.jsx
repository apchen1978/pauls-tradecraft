import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";

export default function About() {
  const { t } = useLang();
  return (
    <section id="about" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 md:px-6 md:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.about.headline}</h2>
          <p className="mt-6 text-lg font-semibold text-ink/80">{t.about.intro}</p>
          <div className="mt-3 max-w-[52ch] space-y-4 text-base leading-relaxed text-ink/65">
            {t.about.narrative.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-12 border-t border-amber/45 pt-6 md:mt-16 md:pt-7">
            <p className="max-w-[28ch] text-xl font-semibold leading-[1.25] tracking-[0.04em] text-forest md:text-2xl">
              {t.about.signature.lead.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-ink/60 md:text-base">
              {t.about.signature.support.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            {t.about.signature.secondary && (
              <p className="mt-6 max-w-[48ch] text-[11px] font-medium uppercase leading-[1.35] tracking-[0.16em] text-forest/75 md:text-xs">
                {t.about.signature.secondary.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.figure
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden rounded-card border border-line bg-paper shadow-[0_24px_60px_-24px_rgba(31,77,58,0.35)]"
          >
            <img
              src="/images/paul-art.jpg"
              alt="Paul"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </motion.figure>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
            {t.about.stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
                className="flex flex-col items-center justify-center gap-1.5 bg-bone px-6 py-8 text-center"
              >
                <span className="text-3xl font-bold tracking-tight text-forest md:text-4xl">{s.value}</span>
                <span className="text-sm text-ink/65">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
