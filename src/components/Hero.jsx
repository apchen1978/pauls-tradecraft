import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  const { t } = useLang();
  return (
    <section id="top" className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-16 md:px-6 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        <motion.h1
          variants={fadeUp}
          className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl"
        >
          {t.hero.headlineA}
          <br />
          <span className="font-semibold text-forest">{t.hero.headlineB}</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-[52ch] text-base leading-relaxed text-ink/65 md:text-lg">
          {t.hero.sub}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#works"
            className="rounded-pill bg-forest px-6 py-3 text-sm font-semibold text-bone transition-all hover:bg-moss active:scale-[0.98]"
          >
            {t.hero.ctaPrimary}
          </a>
          <a
            href="#about"
            className="rounded-pill border border-forest/30 px-6 py-3 text-sm font-semibold text-forest transition-colors hover:border-forest"
          >
            {t.hero.ctaSecondary}
          </a>
        </motion.div>
      </motion.div>

      <motion.figure
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.15 } }}
        className="overflow-hidden rounded-card border border-line bg-paper shadow-[0_24px_60px_-24px_rgba(31,77,58,0.35)]"
      >
        <img
          src="/images/tracker-dashboard.png"
          alt={t.hero.imgCaption}
          className="aspect-[16/10] w-full object-cover object-top"
          loading="eager"
        />
        <figcaption className="border-t border-line px-5 py-3.5 text-sm text-ink/60">{t.hero.imgCaption}</figcaption>
      </motion.figure>
    </section>
  );
}
