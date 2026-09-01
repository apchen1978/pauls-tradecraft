import { motion } from "motion/react";
import { ArrowUpRight, FileText, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

const snapshotByLang = {
  zh: "/images/cdd-executive-snapshot-zh-v02.png",
  en: "/images/cdd-executive-snapshot-en-v02.png",
};

const icons = [MagnifyingGlass, ShieldCheck, FileText];

export default function DealReadiness() {
  const { lang, t } = useLang();
  const service = t.dealReadiness;

  return (
    <section id="deal-readiness" className="scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 md:px-6 md:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-amber">{service.kicker}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{service.headline}</h2>
          <p className="mt-5 text-base leading-relaxed text-ink/70 md:text-lg">{service.intro}</p>

          <div className="mt-8 border-y border-line py-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber">{service.pathTitle}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {service.path.map((step, index) => (
                <div key={step.title} className="border-t border-forest/15 pt-3">
                  <p className="text-xs font-bold tabular-nums text-amber">0{index + 1}</p>
                  <h3 className="mt-2 text-sm font-bold text-forest">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/65">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-9 border-l-2 border-amber/60 pl-5">
            <h3 className="text-base font-bold text-forest">{service.whenTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{service.when}</p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-base font-bold text-forest">{service.bringTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{service.bring}</p>
            </div>
            <div>
              <h3 className="text-base font-bold text-forest">{service.boundaryTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{service.boundary}</p>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#outcomes"
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-forest px-7 py-3 text-sm font-bold text-bone transition-all hover:bg-moss active:scale-[0.98]"
            >
              {service.cta}
              <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
            </a>
            <a
              href="https://apchen1978.github.io/commercial-decision-desk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-forest underline decoration-forest/35 underline-offset-4 transition-colors hover:text-amber"
            >
              {service.demoCta} ↗
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-card border border-line bg-paper/65 p-4 md:p-6"
        >
          <div className="border-b border-line pb-5">
            <p className="text-xs font-bold tracking-[0.14em] text-amber">{service.packLabel}</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">{service.packTitle}</h3>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ink/65">{service.packIntro}</p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-[0.86fr_1.14fr] md:items-start">
            <figure className="overflow-hidden rounded-field border border-line bg-bone">
              <img
                src={snapshotByLang[lang]}
                alt={service.snapshotAlt}
                className="aspect-[4/3] w-full object-contain object-top"
                loading="lazy"
              />
              <figcaption className="border-t border-line px-3 py-2.5 text-xs leading-relaxed text-ink/75">
                {service.snapshotCaption}
              </figcaption>
            </figure>

            <div className="grid gap-4">
              {service.outputs.map((output, index) => {
                const Icon = icons[index];
                return (
                  <article key={output.title} className="flex gap-3 border-l-2 border-forest/20 pl-4">
                    <Icon size={19} weight="duotone" className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
                    <div>
                      <h4 className="text-sm font-bold tracking-tight">{output.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-ink/65">{output.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-moss">{service.packBoundary}</p>
        </motion.div>
      </div>
    </section>
  );
}
