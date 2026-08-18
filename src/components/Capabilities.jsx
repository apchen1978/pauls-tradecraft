import { motion } from "motion/react";
import { Briefcase, PresentationChart, Flask, Translate } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

const icons = [Briefcase, PresentationChart, Flask, Translate];

export default function Capabilities() {
  const { t } = useLang();
  return (
    <section id="capabilities" className="scroll-mt-24 border-y border-line bg-paper/60">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.capabilities.headline}</h2>
        </div>
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
                  <div>
                    <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{item.desc}</p>
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
