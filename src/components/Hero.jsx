import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  const { t } = useLang();
  return (
    <section id="top" className="relative overflow-hidden bg-pine text-bone">
      {/* 大廠式柔和光暈 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-10%] h-[480px] w-[480px] rounded-full bg-moss/30 blur-[120px]" />
        <div className="absolute bottom-[-30%] left-[-5%] h-[380px] w-[380px] rounded-full bg-amber/15 blur-[120px]" />
        {/* 細網格紋理 */}
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-20 md:px-6 md:pt-24 md:pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {t.brand} · {t.brandNote}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-5 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-bone md:text-5xl lg:text-6xl"
          >
            {t.hero.headlineA}
            <br />
            <span className="font-semibold text-bone">{t.hero.headlineB}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-[52ch] text-base leading-relaxed text-bone/75 md:text-lg">
            {t.hero.sub}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#works"
              className="rounded-pill bg-gold px-7 py-3 text-sm font-bold text-pine transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#about"
              className="rounded-pill border border-bone/35 px-7 py-3 text-sm font-semibold text-bone transition-colors hover:border-bone/70"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </motion.div>

        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.15 } }}
          className="overflow-hidden rounded-card border border-bone/15 bg-pine/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
        >
          <img
            src="/images/cover-tracker.png"
            alt={t.hero.imgCaption}
            className="aspect-[16/10] w-full object-cover object-top"
            loading="eager"
          />
          <figcaption className="border-t border-bone/15 px-5 py-3.5 text-sm text-bone/60">
            {t.hero.imgCaption}
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
