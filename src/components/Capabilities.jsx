import { motion } from "motion/react";
import { FlowArrow, Rocket, GlobeHemisphereWest, Network, ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

const icons = [FlowArrow, Rocket, GlobeHemisphereWest, Network];

export default function Capabilities() {
  const { lang, t } = useLang();
  const engagement = t.capabilities.engagement;
  return (
    <section id="capabilities" className="scroll-mt-24 border-y border-line bg-paper/60">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.capabilities.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.capabilities.headline}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/70">{t.capabilities.tagline}</p>
        </div>

        <div className="mt-12 rounded-card border border-gold/25 bg-pine px-6 py-8 text-bone shadow-[0_20px_60px_-36px_rgba(11,27,51,0.8)] md:px-8 md:py-10">
          <p className="text-[11px] font-bold tracking-[0.2em] text-gold">{engagement.eyebrow}</p>
          <h3 className="mt-3 max-w-3xl text-2xl font-bold leading-tight tracking-tight md:text-3xl">{engagement.title}</h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-bone/75">{engagement.summary}</p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            {engagement.offers.map((offer, index) => (
              <article key={offer.title} className={`border-t border-bone/20 pt-4 ${index === 0 ? "lg:row-span-2" : ""}`}>
                <p className="text-xs font-bold tracking-[0.16em] text-gold">{String(index + 1).padStart(2, "0")}</p>
                <h4 className="mt-2 text-lg font-bold tracking-tight text-bone">{offer.title}</h4>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-bone/90">{offer.question}</p>
                <p className="mt-2 text-sm leading-relaxed text-bone/70">{offer.output}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-bone/50">{offer.proof}</p>
              </article>
            ))}
          </div>

          <a
            href="#contact"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-pill bg-gold px-7 py-3 text-sm font-bold text-pine transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {engagement.cta}
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
          </a>
        </div>

        <h3 className="mt-16 text-xl font-bold tracking-tight md:text-2xl">{t.capabilities.supportingHeadline}</h3>
        <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
          {t.capabilities.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: (i % 2) * 0.07 }}
                className="border-t-2 border-forest/15 pt-5"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-forest/10 text-forest">
                    <Icon size={20} weight="duotone" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xs font-bold tabular-nums text-amber">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
                    </div>
                    <p className="mt-1 text-xs font-medium tracking-wide text-moss">{item.tags}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
