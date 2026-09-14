import { useLang } from "../i18n.jsx";

export default function HumanAiEditorial() {
  const { t } = useLang();
  const content = t.humanAiEditorial;

  return (
    <section aria-labelledby="human-ai-editorial-heading" className="overflow-hidden border-b border-bone/10 bg-pine text-bone">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{content.eyebrow}</p>
          <h2
            id="human-ai-editorial-heading"
            className="mt-7 whitespace-pre-line text-[clamp(2.45rem,5.1vw,5rem)] font-medium leading-[1.02] tracking-[-0.035em] text-bone"
            style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif TC", "PMingLiU", serif' }}
          >
            {content.statement}
          </h2>
        </div>

        <div className="flex max-w-xl flex-col justify-end border-t border-gold/45 pt-6 lg:mb-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-base leading-relaxed text-bone/78 md:text-lg">{content.explanation}</p>
          <p className="mt-8 text-sm font-semibold leading-relaxed text-gold">{content.closing}</p>
        </div>
      </div>
    </section>
  );
}
