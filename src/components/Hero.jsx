import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  const { lang, t } = useLang();
  const cdd = works.find((work) => work.id === "commercial-decision-desk");
  const cddCopy = cdd[lang];
  return (
    <section id="top" className="relative overflow-hidden bg-pine text-bone">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[52%] hidden w-px bg-bone/10 lg:block" />
        <div className="absolute inset-x-0 top-0 h-px bg-bone/10" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-24 md:px-6 md:pb-32 md:pt-32 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {t.brand} · {t.brandNote}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-6 max-w-2xl text-[2.2rem] font-bold leading-[1.08] tracking-[-0.045em] text-bone md:text-6xl lg:text-[3.2rem] xl:text-[3.5rem]"
          >
            {t.hero.headlineA}
            <br />
            <span className="font-semibold text-bone">{t.hero.headlineB}</span>
            <span className="inline-block whitespace-nowrap font-semibold text-gold">{t.hero.headlineHighlight}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-[48ch] text-base leading-relaxed text-bone/70 md:text-lg">
            {t.hero.sub}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#works"
              className="rounded-field bg-gold px-7 py-3.5 text-sm font-bold text-pine transition-colors hover:bg-[#f2be61]"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#contact"
              className="rounded-field border border-bone/30 px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-bone/70"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </motion.div>

        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.15 } }}
          className="relative overflow-hidden rounded-[1.35rem] border border-bone/15 bg-bone shadow-[0_34px_90px_-26px_rgba(0,0,0,0.66)]"
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/65">
            <span>{cddCopy.tag}</span>
            <span className="text-forest">{t.works.statusVerified}</span>
          </div>
          <img
            src={cdd.cover}
            alt={cdd.imageAlt[lang]}
            className="aspect-[16/10] w-full object-cover object-top"
            loading="eager"
          />
          <figcaption className="flex items-center justify-between gap-4 border-t border-ink/10 px-5 py-3.5 text-sm text-ink/65">
            <span className="font-semibold text-ink">{cddCopy.title}</span>
            <a href={cdd.link} target="_blank" rel="noopener noreferrer" className="shrink-0 font-semibold text-forest transition-colors hover:text-amber">
              {typeof cdd.linkLabel === "string" ? cdd.linkLabel : cdd.linkLabel[lang]} →
            </a>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
