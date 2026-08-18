import { motion } from "motion/react";
import { useLang } from "../i18n.jsx";

export default function Contact() {
  const { t } = useLang();
  return (
    <section id="contact" className="scroll-mt-24 border-t border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6 md:py-28">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-xl text-3xl font-bold tracking-tight md:text-4xl"
        >
          {t.contact.headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
          className="mx-auto mt-4 max-w-[48ch] text-base leading-relaxed text-ink/65"
        >
          {t.contact.sub}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          {/* 公開信箱：paulchen1978@gmail.com */}
          <a
            href="mailto:paulchen1978@gmail.com"
            className="rounded-pill bg-forest px-7 py-3 text-sm font-bold text-bone transition-all hover:bg-moss active:scale-[0.98]"
          >
            {t.contact.cta}
          </a>
          <p className="text-xs text-ink/65">{t.contact.note}</p>
        </motion.div>
      </div>
    </section>
  );
}
