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

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-24 pb-28 md:px-6 md:pt-32 md:pb-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {t.brand} · {t.brandNote}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-6 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-bone md:text-5xl lg:text-6xl"
          >
            {t.hero.headlineA}
            <br />
            <span className="font-semibold text-bone">{t.hero.headlineB}</span>{" "}
            <span className="hero-gradient font-semibold">{t.hero.headlineHighlight}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-[52ch] text-base leading-relaxed text-bone/75 md:text-lg">
            {t.hero.sub}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#works"
              className="rounded-pill bg-gold px-8 py-3.5 text-sm font-bold text-pine transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#contact"
              className="rounded-pill border border-bone/35 px-8 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-bone/70"
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

      {/* 極簡底條：featured proof 收成一條 hairline（商業 hook 保留、視覺減重） */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.35 } }}
        className="relative mx-auto max-w-7xl px-4 pb-14 md:px-6 md:pb-16"
      >
        <div className="flex flex-col gap-2 border-t border-bone/12 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-relaxed text-bone/60">
            <span className="font-semibold text-gold">{t.hero.featuredHook1}</span>{" "}
            <span className="text-gold">{t.hero.featuredIncrement}</span>{" "}
            <span className="text-bone/80">{t.hero.featuredArrow}</span>{" "}
            <span className="font-semibold text-bone">{t.hero.featuredAfter}</span>
            <span className="text-bone/40"> · {t.hero.featuredCaption}</span>
          </p>
          <a
            href="https://apchen1978.github.io/payment-concentration-demo/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-semibold text-gold transition-colors hover:text-bone"
          >
            {t.hero.featuredCta} →
          </a>
        </div>
      </motion.div>
    </section>
  );
}
