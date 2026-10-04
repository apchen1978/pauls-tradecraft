import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";
import { withDemoLang } from "../demoLinks.js";

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
  const headlineClass = lang === "en"
    ? "mt-3 text-[1.55rem] leading-[1.12] sm:text-[1.85rem] md:mt-5 md:text-[2.1rem] md:leading-[1.08] lg:text-[2.3rem] xl:text-[2.6rem] xl:leading-[1.07]"
    : "mt-4 text-[clamp(1.8rem,6.6vw,2.05rem)] leading-[1.18] md:mt-5 md:text-5xl md:leading-[1.14] lg:text-[2.6rem] xl:text-[3.2rem]";
  const subClass = lang === "en"
    ? "mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.48] md:mt-5 md:text-lg md:leading-relaxed"
    : "mt-4 max-w-[48ch] text-base leading-[1.65] md:mt-5 md:text-lg md:leading-relaxed";

  return (
    <section id="top" className="relative isolate overflow-hidden bg-pine text-ondark border-b border-bone/15">
      <div aria-hidden className="absolute inset-0">
        <img
          src="/images/paul-art.webp"
          alt=""
          className="absolute inset-x-0 top-0 h-[14rem] w-full object-cover object-[55%_18%] opacity-90 md:inset-0 md:h-full md:object-[68%_28%] md:opacity-30 lg:object-[72%_24%] lg:opacity-55"
          fetchPriority="high"
        />
        {/* Phone: the portrait is a clear band at the top that fades into the pine surface the text sits on. */}
        <div className="absolute inset-x-0 top-0 h-[14rem] bg-[linear-gradient(180deg,rgba(20,44,41,0.2)_0%,rgba(20,44,41,0)_30%,rgba(20,44,41,1)_82%)] md:hidden" />
        <div className="absolute inset-0 hidden bg-pine/80 md:block lg:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(20,44,41,1)_0%,rgba(20,44,41,0.92)_40%,rgba(20,44,41,0.45)_75%,rgba(20,44,41,0.7)_100%)] md:block" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(20,44,41,0.2)_0%,rgba(20,44,41,0)_50%,rgba(20,44,41,0.9)_100%)] md:block" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-bone/15" />
        <div className="absolute -right-16 top-[12%] h-[22rem] w-[22rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-[8%] left-[8%] h-40 w-40 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-68px)] max-w-7xl items-end gap-6 px-4 pb-6 pt-[12.5rem] md:min-h-[calc(100svh-76px)] md:gap-10 md:px-6 md:pb-12 md:pt-16 lg:min-h-[calc(100svh-76px-10.5rem)] lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10 lg:px-6 lg:pb-12 lg:pt-12">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="relative z-10 max-w-2xl self-center">
          <motion.p variants={fadeUp} className="inline-flex items-center gap-3 text-sm font-medium tracking-[0.06em] text-gold md:text-[0.9375rem]">
            <span aria-hidden className="size-1.5 rounded-full bg-gold" />
            {t.hero.kicker}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className={`max-w-2xl font-medium tracking-[-0.04em] text-bone ${headlineClass}`}
          >
            {t.hero.headline}
          </motion.h1>
          <motion.p variants={fadeUp} className={`text-ondark ${subClass}`}>
            {t.hero.sub}
          </motion.p>
          <motion.p variants={fadeUp} className="mt-3 max-w-[52ch] text-[0.8125rem] leading-[1.55] text-ondark-meta md:text-sm">
            {t.hero.background}
          </motion.p>
          <motion.div
            variants={fadeUp}
            aria-label={lang === "zh" ? "專業背景" : "Professional background"}
            className="mt-4 grid max-w-2xl divide-y divide-bone/15 border-y border-bone/15 md:bg-pine/90 lg:bg-transparent sm:mt-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          >
            {t.hero.credentials.map((credential, index) => (
              <div
                key={credential.label}
                className={`flex items-baseline justify-between gap-4 py-2.5 sm:block sm:px-4 sm:py-4 ${index === 0 ? "sm:pl-0" : ""}`}
              >
                <span className="text-lg font-semibold tracking-[-0.02em] text-gold sm:text-xl">{credential.value}</span>
                <span className="text-right text-xs font-medium leading-snug text-ondark-meta sm:mt-1.5 sm:block sm:text-left">
                  {credential.label}
                </span>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              href="#three-questions"
              className="rounded-field bg-gold px-5 py-3 text-center text-sm font-semibold text-pine transition-[transform,filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bone active:scale-[0.98] sm:px-7 sm:py-3.5"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#contact"
              className="rounded-field border border-bone/40 px-5 py-3 text-center text-sm font-semibold text-bone transition-[transform,border-color,color] hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold active:scale-[0.98] sm:px-7 sm:py-3.5"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </motion.div>

        <motion.figure
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut", delay: 0.12 } }}
          className="surface-light group relative z-10 ml-auto w-full max-w-[34rem] overflow-hidden rounded-card border border-line bg-white shadow-[0_1px_2px_rgb(25_58_53/0.04),0_24px_60px_-32px_rgb(25_58_53/0.18)]"
        >
          <div className="flex items-center gap-2 border-b border-line bg-bone px-4 py-3 text-xs font-medium text-moss md:px-5">
            <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber" />{t.hero.snapshotChromeLabel}</span>
          </div>
          <div className="relative overflow-hidden bg-paper p-2.5 md:p-3">
            <img
              src={snapshotSrc}
              alt={t.hero.snapshotAlt}
              className="aspect-[16/10] w-full rounded-field border border-line object-cover object-top"
              loading="eager"
            />
          </div>
          <figcaption className="flex flex-col items-start gap-2 border-t border-line px-4 py-3 text-xs leading-snug text-moss md:px-5 md:py-3.5 md:text-sm">
            <span className="font-semibold text-ink">{t.hero.snapshotCaption}</span>
            <a href={withDemoLang(cdd.link, lang)} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber underline decoration-amber/30 underline-offset-4 transition-colors hover:text-forest hover:decoration-forest/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-amber">
              {t.hero.snapshotCta} →
            </a>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
