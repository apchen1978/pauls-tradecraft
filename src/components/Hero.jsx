import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Hero() {
  const { lang, t } = useLang();
  const cdd = works.find((work) => work.id === "commercial-decision-desk");
  // 畫面分工（Astra ①）：Hero 展示「最後得到什麼」——合成案例的
  // Executive Deal Snapshot 輸出特寫；Featured Work 卡保留工作區畫面「怎麼完成」。
  const snapshotSrc = lang === "zh"
    ? "/images/cover-commercial-decision-desk.svg"
    : "/images/cover-commercial-decision-desk-en.svg";
  return (
    <section id="top" className="relative isolate overflow-hidden bg-pine text-bone shadow-[0_28px_80px_-56px_rgba(20,51,41,0.9)]">
      <div aria-hidden className="absolute inset-0">
        <img
          src="/images/paul-art.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[68%_28%] opacity-55 lg:object-[72%_24%] lg:opacity-70"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,51,41,0.98)_0%,rgba(20,51,41,0.88)_34%,rgba(20,51,41,0.3)_68%,rgba(20,51,41,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,51,41,0.18)_0%,rgba(20,51,41,0.08)_48%,rgba(20,51,41,0.8)_100%)]" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-bone/10" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-68px)] max-w-7xl items-end gap-12 px-4 pb-12 pt-20 md:min-h-[calc(100dvh-76px)] md:px-6 md:pb-16 md:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:pb-20">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="relative z-10 max-w-2xl self-center">
          <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {t.brand} · {t.brandNote}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className={`mt-6 max-w-2xl text-[clamp(2.35rem,7vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-bone md:text-6xl lg:text-[3rem] ${lang === "zh" ? "xl:text-[4rem]" : "xl:text-[3rem]"}`}
          >
            <span className="lg:hidden">
              {t.hero.headlineA}
              <br />
              <span className="font-semibold text-bone">{t.hero.headlineB}</span>{lang === "en" ? " " : ""}
              <span className="inline-block font-semibold text-gold">{t.hero.headlineHighlight}</span>
            </span>
            <span className="hidden lg:block">
              {t.hero.headlineDesktopA}
              <br />
              <span className="font-semibold text-bone">{t.hero.headlineDesktopB}</span>{lang === "en" ? " " : ""}
              <span className="inline-block font-semibold text-gold lg:mt-1">{t.hero.headlineHighlight}</span>
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-[48ch] text-base leading-relaxed text-bone/75 md:text-lg">
            {t.hero.sub}
          </motion.p>
          <motion.div
            variants={fadeUp}
            aria-label={lang === "zh" ? "專業基底" : "Professional foundation"}
            className="mt-7 grid max-w-2xl divide-y divide-bone/15 border-y border-bone/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          >
            {t.hero.credentials.map((credential, index) => (
              <div
                key={credential.label}
                className={`flex items-baseline justify-between gap-5 py-3.5 sm:block sm:px-4 sm:py-4 ${index === 0 ? "sm:pl-0" : ""}`}
              >
                <span className="text-lg font-semibold tracking-[-0.02em] text-gold sm:text-xl">{credential.value}</span>
                <span className="text-right text-[10px] font-semibold uppercase leading-snug tracking-[0.13em] text-bone/65 sm:mt-1.5 sm:block sm:text-left">
                  {credential.label}
                </span>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/cases/commercial-decision-desk/"
              className="rounded-field bg-gold px-7 py-3.5 text-sm font-bold text-pine transition-colors hover:bg-[#f2be61] active:scale-[0.98]"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#contact"
              className="rounded-field border border-bone/55 bg-bone/[0.06] px-7 py-3.5 text-sm font-semibold tracking-[0.025em] text-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition-colors hover:border-gold/75 hover:bg-bone/[0.1] hover:text-gold active:scale-[0.98]"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </motion.div>

        <motion.figure
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut", delay: 0.12 } }}
          className="group relative z-10 ml-auto w-full max-w-[34rem] overflow-hidden rounded-card border border-bone/25 bg-pine/45 shadow-[0_34px_90px_-26px_rgba(0,0,0,0.66)] backdrop-blur-sm lg:mb-4"
        >
          <div className="flex items-center justify-between gap-3 border-b border-bone/15 bg-ink/20 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/65 md:px-5 md:py-3 md:text-[11px]">
            <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold" />{t.hero.snapshotChromeLabel}</span>
            <span className="flex flex-wrap items-center justify-end gap-2 text-right">
              {cdd?.verified && cdd?.link && (
                <span className="normal-case tracking-[0.08em] text-bone/80" title={t.works.liveExplain}>{t.works.statusLive}</span>
              )}
              <span className="font-bold normal-case tracking-normal text-bone/90">
                {typeof cdd?.case?.stage === "string" ? cdd.case.stage : cdd?.case?.stage?.[lang]}
              </span>
            </span>
          </div>
          <div className="relative overflow-hidden bg-ink/20 p-2.5 md:p-3">
            <img
              src={snapshotSrc}
              alt={t.hero.snapshotAlt}
              className="aspect-[4/3] w-full rounded-field border border-bone/10 object-cover object-top"
              loading="eager"
            />
          </div>
          <figcaption className="flex items-center justify-between gap-4 border-t border-bone/15 px-4 py-3 text-xs text-bone/65 md:px-5 md:py-3.5 md:text-sm">
            <span className="font-semibold text-bone/90">{t.hero.snapshotCaption}</span>
            <a href={cdd.link} target="_blank" rel="noopener noreferrer" className="shrink-0 font-semibold text-gold transition-colors hover:text-bone">
              {t.hero.snapshotCta} →
            </a>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
