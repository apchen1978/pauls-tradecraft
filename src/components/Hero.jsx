import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";
import { withDemoLang } from "../demoLinks.js";

// Phones: keep each comma-separated clause on one line, so a line breaks after the comma instead of
// splitting a phrase ("值得／遇到對的買家") or stranding two words ("with you."). md and up are unchanged.
function Clauses({ text }) {
  const chunks = [...String(text ?? "").matchAll(/([^，,]+[，,]?)(\s*)/g)];
  if (chunks.length < 2) return text;
  return chunks.map(([, clause, gap], i) => (
    <Fragment key={i}>
      <span className="max-md:inline-block">{clause}</span>
      {gap}
    </Fragment>
  ));
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Paul 2026-10-17: the dark hero with stats and long text felt heavy on phones. The hero is now light (bone),
// keeps one claim and shows the three most important commercial works; the interactive
// works follow right below it (see BelowFold). Paul 2026-10-30: the two buttons duplicated the work cards and the
// nav's contact link on phones, so like the credentials line they show from md up only.
const HERO_WORKS = ["commercial-decision-desk", "overseas-lead-discovery", "trade-profit-navigator"];

export default function Hero() {
  const { lang, t } = useLang();
  const h = t.hero;
  const picks = HERO_WORKS.map((id) => works.find((work) => work.id === id)).filter(Boolean);
  const headlineClass = lang === "en"
    ? "text-[1.7rem] leading-[1.12] sm:text-[1.95rem] md:text-[2.3rem] md:leading-[1.08] xl:text-[2.75rem] xl:leading-[1.07]"
    : "text-[clamp(1.9rem,7vw,2.15rem)] leading-[1.18] md:text-5xl md:leading-[1.14] lg:text-[2.75rem] xl:text-[3.3rem]";

  // Phones omit the portrait so the interactive work begins sooner. Desktop keeps
  // the existing portrait; the 1×1 data fallback prevents a mobile image request.
  return (
    <section id="top" className="relative isolate overflow-hidden bg-bone text-ink border-b border-line">
      <div aria-hidden className="absolute inset-0">
        <picture className="hidden md:block">
          <source media="(min-width: 769px)" srcSet="/images/paul-art.webp" type="image/webp" />
          <img
            src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            alt=""
            width={1}
            height={1}
            className="absolute inset-x-0 top-0 h-[14rem] w-full object-cover object-[55%_18%] opacity-90 md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[50%] md:object-[62%_22%] md:opacity-100 md:[mask-image:linear-gradient(to_right,transparent_0%,black_35%,black_100%)] md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_35%,black_100%)]"
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
        {/* the bottom of the photo fades into the page so the three work cards sit on a light surface */}
        <div className="absolute inset-x-0 bottom-0 hidden h-[45%] bg-[linear-gradient(180deg,rgb(246_243_237/0)_0%,var(--color-bone)_70%)] md:block" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[30%] h-[20rem] w-[20rem] rounded-full bg-[#9EE0C1]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-4 px-4 pb-2 pt-4 md:gap-10 md:px-6 md:pb-14 md:pt-16 lg:gap-12 lg:pb-14 lg:pt-20">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="relative z-10 min-w-0 max-w-2xl md:max-w-[52%]">
          <motion.p variants={fadeUp} className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.06em] text-amber md:text-[0.9375rem]">
            <span aria-hidden className="hero-gem size-2 rounded-full bg-[#9EE0C1]" />
            {h.kicker}
          </motion.p>
          <motion.h1 variants={fadeUp} className={`mt-2 max-w-2xl font-semibold tracking-[-0.04em] text-ink md:mt-5 ${headlineClass}`}>
            <Clauses text={h.headline} />
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 max-w-[44ch] text-base leading-[1.6] text-ink md:mt-5 md:text-lg">
            <Clauses text={h.sub} />
          </motion.p>
          <motion.p variants={fadeUp} className="mt-2 text-[0.8125rem] leading-snug text-moss md:hidden">{h.credentialsLine}</motion.p>
          <motion.ul variants={fadeUp} className="mt-4 hidden flex-wrap gap-x-5 gap-y-1 text-sm leading-[1.55] text-moss md:flex">
            {h.credentials.map((c) => (
              <li key={c.value} className="whitespace-nowrap">
                <span className="font-semibold text-ink">{c.value}</span> {c.label}
              </li>
            ))}
          </motion.ul>
          <motion.div variants={fadeUp} className="mt-8 hidden flex-wrap items-center gap-4 md:flex">
            <a
              href="#showcase"
              className="rounded-field bg-ink px-7 py-3.5 text-center text-sm font-semibold text-bone transition-[transform,filter] hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink active:scale-[0.98]"
            >
              {h.ctaPrimary}
            </a>
            <a
              href="#contact"
              className="rounded-field border border-ink/30 bg-white/60 px-7 py-3.5 text-center text-sm font-semibold text-ink transition-[transform,border-color] hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink active:scale-[0.98]"
            >
              {h.ctaSecondary}
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } }}
          className="relative z-10 w-full"
          data-testid="hero-works"
        >
          <p id="hero-works-label" className="text-xs font-semibold tracking-[0.12em] text-moss">{h.worksLabel}</p>
          <ol aria-labelledby="hero-works-label" className="mt-1 grid gap-1.5 md:mt-3 md:gap-3 lg:grid-cols-3 lg:gap-4">
            {picks.map((work) => {
              const copy = work[lang] || work.zh;
              const href = work.casePage?.href || withDemoLang(work.link, lang);
              const external = !work.casePage?.href;
              return (
                <li key={work.id}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex h-full items-start gap-2 rounded-card border border-line bg-white/85 px-2 py-1.5 shadow-[0_1px_2px_rgb(25_58_53/0.04),0_16px_40px_-28px_rgb(25_58_53/0.25)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink md:gap-4 md:px-5 md:py-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold leading-snug text-amber md:text-lg">{copy.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-moss md:mt-1 md:leading-relaxed"><Clauses text={work.decisionQuestion?.[lang]} /></span>
                    </span>
                    <ArrowUpRight size={18} weight="bold" aria-hidden="true" className="mt-1 shrink-0 text-ink transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-moss">{h.worksNote}</p>
        </motion.div>
      </div>
    </section>
  );
}
