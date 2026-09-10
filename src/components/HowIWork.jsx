import { motion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function HowIWork() {
  const { t } = useLang();
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 md:px-6 md:py-32">
      <div className="max-w-2xl">
        <p className="eyebrow">{t.how.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.how.headline}</h2>
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink/65">{t.how.sub}</p>
      </div>

      <details className="group mt-10">
        <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 rounded-card border border-line surface-paper px-5 py-4 text-sm font-bold text-forest transition-colors hover:border-forest/35 md:px-6 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">{t.how.stepsExpand}</span>
          <span className="hidden group-open:inline">{t.how.stepsCollapse}</span>
          <CaretDown size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>

      <ol className="mt-9 grid grid-cols-1 gap-y-8 md:grid-cols-5 md:gap-x-6">
        {t.how.steps.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-16px" }}
            transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.05 }}
            className="relative border-t-2 border-forest/15 pt-5"
          >
            <span className="text-xs font-bold tabular-nums text-amber">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-1.5 text-base font-bold tracking-tight">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.desc}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-moss">{s.evidence}</p>
          </motion.li>
        ))}
      </ol>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-16px" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mt-12 rounded-card border border-forest/20 surface-paper px-6 py-5 text-sm leading-relaxed text-ink/70"
      >
        {t.how.note}
      </motion.p>
      </details>
    </section>
  );
}
