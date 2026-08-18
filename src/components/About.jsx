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
          <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-ink/65">{t.about.body}</p>
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
