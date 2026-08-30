import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cddSnapshot = {
  zh: "/images/cdd-executive-snapshot-zh-v02.png",
  en: "/images/cdd-executive-snapshot-en-v02.png",
};

export default function Hero() {
  const { lang, t } = useLang();
  const cdd = works.find((work) => work.id === "commercial-decision-desk");
  const cddCopy = cdd[lang];
  return (
    <section id="top" className="relative isolate overflow-hidden bg-pine text-bone">
      <div aria-hidden className="absolute inset-0">
        <img
          src="/images/paul-art.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[68%_28%] opacity-55 lg:object-[72%_24%] lg:opacity-70"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,51,41,0.98)_0%,rgba(20,51,41,0.9)_34%,rgba(20,51,41,0.35)_68%,rgba(20,51,41,0.7)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,51,41,0.18)_0%,rgba(20,51,41,0.08)_48%,rgba(20,51,41,0.8)_100%)]" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[52%] hidden w-px bg-bone/10 lg:block" />
        <div className="absolute inset-x-0 top-0 h-px bg-bone/10" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-68px)] max-w-7xl items-end gap-12 px-4 pb-12 pt-20 md:min-h-[calc(100dvh-76px)] md:px-6 md:pb-16 md:pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:pb-20">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="relative z-10 max-w-2xl self-center">
          <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {t.brand} · {t.brandNote}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-6 max-w-2xl text-[clamp(2.35rem,7vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-bone md:text-6xl xl:text-[4.7rem]"
          >
            {t.hero.headlineA}
            <br />
            <span className="font-semibold text-bone">{t.hero.headlineB}</span>
            <span className="inline-block font-semibold text-gold">{t.hero.headlineHighlight}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-[48ch] text-base leading-relaxed text-bone/75 md:text-lg">
            {t.hero.sub}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#deal-readiness"
              className="rounded-field bg-gold px-7 py-3.5 text-sm font-bold text-pine transition-colors hover:bg-[#f2be61] active:scale-[0.98]"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#works"
              className="rounded-field border border-bone/40 bg-pine/20 px-7 py-3.5 text-sm font-semibold text-bone backdrop-blur-sm transition-colors hover:border-bone/80 active:scale-[0.98]"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </motion.div>

        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.15 } }}
          className="relative z-10 ml-auto w-full max-w-[34rem] overflow-hidden rounded-card border border-bone/25 bg-bone shadow-[0_34px_90px_-26px_rgba(0,0,0,0.66)] lg:mb-4"
        >
          <div className="flex items-center justify-between border-b border-ink/10 bg-[#edf0e7] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/65 md:px-5 md:py-3 md:text-[11px]">
            <span>Commercial Decision Desk</span>
            <span className="inline-flex items-center gap-2 text-forest"><span className="h-1.5 w-1.5 rounded-full bg-gold" />{t.works.statusVerified}</span>
          </div>
          <div className="relative bg-[#e9ece4] p-2.5 md:p-3">
            <img
              src={cddSnapshot[lang]}
              alt={cdd.imageAlt[lang]}
              className="aspect-[4/3] w-full object-contain object-top"
              loading="eager"
            />
          </div>
          <figcaption className="flex items-center justify-between gap-4 border-t border-ink/10 px-4 py-3 text-xs text-ink/65 md:px-5 md:py-3.5 md:text-sm">
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
