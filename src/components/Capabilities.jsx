import { motion } from "motion/react";
import { FlowArrow, Rocket, GlobeHemisphereWest, Network, ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

const icons = [FlowArrow, Rocket, GlobeHemisphereWest, Network];
const workflowLinks = {
  source: "https://apchen1978.github.io/overseas-lead-discovery-demo/",
  cdd: "https://apchen1978.github.io/commercial-decision-desk/",
  payment: "https://apchen1978.github.io/payment-concentration-demo/",
};

export default function Capabilities() {
  const { lang, t } = useLang();
  const engagement = t.capabilities.engagement;
  return (
    <section id="capabilities" className="scroll-mt-24 border-y border-line surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.capabilities.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.capabilities.headline}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/70">{t.capabilities.tagline}</p>
        </div>

        <div className="mt-12 rounded-card border border-gold/25 bg-pine px-6 py-8 text-bone shadow-[0_24px_64px_-38px_rgba(20,51,41,0.78)] md:px-8 md:py-10">
          <p className="text-[11px] font-bold tracking-[0.2em] text-gold">{engagement.eyebrow}</p>
          <h3 className="mt-3 max-w-3xl text-2xl font-bold leading-tight tracking-tight md:text-3xl">{engagement.title}</h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-bone/75">{engagement.summary}</p>

          <div className="mt-8 grid gap-6 border-y border-bone/20 py-1 md:grid-cols-3 md:divide-x md:divide-bone/20">
            {engagement.offers.map((offer, index) => (
              <article key={offer.title} className="py-6 md:px-6 md:first:pl-0 md:last:pr-0">
                <p className="text-xs font-bold tracking-[0.16em] text-gold">{String(index + 1).padStart(2, "0")}</p>
                <h4 className="mt-2 text-lg font-bold tracking-tight text-bone">{offer.title}</h4>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-bone/90">{offer.question}</p>
                <dl className="mt-5 grid gap-4 text-sm leading-relaxed">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{engagement.bringLabel}</dt>
                    <dd className="mt-1 text-bone/70">{offer.bring}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{engagement.workLabel}</dt>
                    <dd className="mt-1 text-bone/70">{offer.work}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{engagement.takeawayLabel}</dt>
                    <dd className="mt-1 font-semibold text-bone/95">{offer.takeaway}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-bone/65">{offer.proof}</p>
              </article>
            ))}
          </div>

          <a
            href="#deal-readiness"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-pill bg-gold px-7 py-3 text-sm font-bold text-pine transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {engagement.cta}
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
          </a>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-bone/60">{engagement.boundary}</p>
        </div>

        <div className="mt-16 border-t border-line pt-8 md:mt-20 md:pt-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber">{t.capabilities.delivery.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{t.capabilities.delivery.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/65 md:text-base">{t.capabilities.delivery.intro}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-forest">
            <a href={workflowLinks.source} target="_blank" rel="noopener noreferrer" className="underline decoration-forest/25 underline-offset-4 transition-colors hover:text-amber">{t.capabilities.delivery.sourceCta} ↗</a>
            <a href={workflowLinks.cdd} target="_blank" rel="noopener noreferrer" className="underline decoration-forest/25 underline-offset-4 transition-colors hover:text-amber">{t.capabilities.delivery.cddCta} ↗</a>
            <a href={workflowLinks.payment} target="_blank" rel="noopener noreferrer" className="underline decoration-forest/25 underline-offset-4 transition-colors hover:text-amber">{t.capabilities.delivery.paymentCta} ↗</a>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
            <div className="border-l-2 border-forest/20 pl-5">
              <h4 className="text-sm font-bold text-forest">{t.capabilities.delivery.discoveryLabel}</h4>
              <div className="mt-5 grid gap-6">
                {t.capabilities.delivery.steps.slice(0, 2).map((step) => (
                  <article key={step.title} className="border-t border-forest/15 pt-4">
                    <h5 className="text-base font-bold tracking-tight">{step.title}</h5>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{step.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="border-l-2 border-amber/45 pl-5">
              <h4 className="text-sm font-bold text-forest">{t.capabilities.delivery.decisionLabel}</h4>
              <div className="mt-5 grid gap-6 md:grid-cols-3 md:gap-5">
                {t.capabilities.delivery.steps.slice(2).map((step) => (
                  <article key={step.title} className="border-t border-forest/15 pt-4">
                    <h5 className="text-base font-bold tracking-tight">{step.title}</h5>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{step.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-7 max-w-3xl text-xs leading-relaxed text-moss">{t.capabilities.delivery.boundary}</p>
        </div>

        <div className="mt-16 border-t border-line pt-8 md:mt-20 md:pt-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber">{t.capabilities.demandLab.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{t.capabilities.demandLab.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/65 md:text-base">{t.capabilities.demandLab.intro}</p>
          </div>
          <div className="mt-8 grid gap-0 border-y border-line md:grid-cols-3 md:divide-x md:divide-line">
            {t.capabilities.demandLab.cases.map((item) => (
              <article key={item.label} className="border-b border-line py-5 last:border-b-0 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber">{item.label}</p>
                <h4 className="mt-2 text-base font-bold tracking-tight">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs font-medium tracking-wide text-moss">{t.capabilities.demandLab.note}</p>
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
