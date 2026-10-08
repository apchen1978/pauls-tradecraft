import { motion } from "motion/react";
import { FilePdf } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function Contact() {
  const { lang, t } = useLang();
  // 依語言切換 One-Pager：中文模式 → ZH PDF，EN 模式 → EN PDF
  const onePagerUrl =
    lang === "en"
      ? "/files/Paul-Tradecraft-OnePager-EN.pdf"
      : "/files/Paul-Tradecraft-OnePager-ZH.pdf";
  const emailHref =
    lang === "en"
      ? "mailto:paulchen1978@gmail.com?subject=About%20my%20product&body=Hi%20Paul%2C%0A%0AI%27d%20like%20to%20discuss%20a%20commercial%20pilot.%0A%0AContext%3A%20"
      : "mailto:paulchen1978@gmail.com?subject=%E8%81%8A%E8%81%8A%E6%88%91%E7%9A%84%E7%94%A2%E5%93%81&body=Paul%20%E4%BD%A0%E5%A5%BD%EF%BC%8C%0A%0A%E6%88%91%E6%83%B3%E8%A8%8E%E8%AB%96%E4%B8%80%E5%80%8B%E5%95%86%E6%A5%AD%20Pilot%E3%80%82%0A%0A%E5%95%8F%E9%A1%8C%E8%83%8C%E6%99%AF%EF%BC%9A";
  return (
    <section id="contact" className="scroll-mt-24 bg-pine text-bone">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center md:px-6 md:py-36">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-16px" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] text-bone md:text-[3.25rem]"
        >
          {t.contact.headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-16px" }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.06 }}
          className="mx-auto mt-5 max-w-[48ch] text-base leading-relaxed text-ondark-meta"
        >
          {t.contact.sub}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-16px" }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
          className="mt-10 flex flex-col items-center gap-3.5"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={emailHref}
              aria-label={`${t.contact.cta} · paulchen1978@gmail.com`}
              className="rounded-field bg-gold px-7 py-3.5 text-sm font-semibold text-pine transition-colors hover:brightness-110 active:scale-[0.98]"
            >
              {t.contact.cta}
            </a>
            <a
              href="https://line.me/ti/p/zSJdkOeQgS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-field border border-bone/25 px-6 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-bone/60 active:scale-[0.98]"
            >
              <span
                aria-hidden="true"
                className="flex h-5 items-center justify-center rounded-[5px] px-1.5 text-[0.6875rem] font-semibold tracking-tight text-white"
                style={{ backgroundColor: "#06c755" }}
              >
                LINE
              </span>
              {t.contact.line}
            </a>
          </div>
          <a
            href={onePagerUrl}
            download
            className="inline-flex items-center gap-2 text-sm font-medium text-ondark underline decoration-bone/30 underline-offset-4 transition-colors hover:text-gold"
          >
            <FilePdf size={16} weight="bold" />
            {t.contact.onePager}
          </a>
          <a
            href="/files/PaulTradecraft-Capability-Brief.pdf"
            download
            className="inline-flex items-center gap-2 text-sm font-medium text-ondark underline decoration-bone/30 underline-offset-4 transition-colors hover:text-gold"
          >
            <FilePdf size={16} weight="bold" />
            {t.contact.capabilityBrief}
          </a>
          <p className="mt-2 text-xs text-ondark-meta">{t.contact.note}</p>
        </motion.div>
      </div>
    </section>
  );
}
