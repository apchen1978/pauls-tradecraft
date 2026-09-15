import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function ConnectedCase() {
  const { lang, t } = useLang();
  const content = t.connectedCase;
  const [activeIndex, setActiveIndex] = useState(0);
  const scenario = content.scenarios[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [lang]);

  return (
    <section id="connected-case" aria-labelledby="connected-case-heading" className="scroll-mt-24 border-b border-line bg-ink text-bone">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div className="max-w-xl lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-gold">{content.eyebrow}</p>
            <h2 id="connected-case-heading" className="mt-3 max-w-[12ch] text-3xl font-bold tracking-tight text-bone md:text-4xl">
              {content.headline}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-bone/72 md:text-lg">{content.intro}</p>

            <div className="mt-8 border-l-2 border-gold/70 pl-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold">{content.framingLabel}</p>
              <p
                className="mt-3 max-w-[34ch] text-xl leading-snug text-bone/90 md:text-2xl"
                style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif TC", "PMingLiU", serif' }}
              >
                {content.framing}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-bone/50">{content.scenarioLabel}</p>
            <div className="mt-3 grid grid-cols-1 overflow-hidden rounded-field border border-bone/20 sm:grid-cols-3" role="group" aria-label={content.scenarioLabel}>
              {content.scenarios.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveIndex(index)}
                    className={`border-b border-bone/15 px-4 py-3 text-left text-sm font-bold transition-colors last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                      isActive ? "bg-gold text-pine" : "bg-bone/[0.035] text-bone/72 hover:bg-bone/[0.08] hover:text-bone"
                    }`}
                  >
                    <span className="mr-2 text-[10px] tracking-[0.14em] opacity-65">0{index + 1}</span>
                    {item.tab}
                  </button>
                );
              })}
            </div>

            <article key={scenario.id} className="mt-4 overflow-hidden rounded-card border border-bone/20 bg-bone/[0.045]">
              <div className="border-b border-bone/15 px-6 py-7 md:px-8 md:py-9">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{scenario.eyebrow}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-bone/45">{content.labels.request}</p>
                <blockquote
                  className="mt-3 max-w-[28ch] text-2xl leading-tight text-bone md:text-3xl"
                  style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif TC", "PMingLiU", serif' }}
                >
                  {scenario.request}
                </blockquote>
              </div>

              <div className="grid md:grid-cols-[0.88fr_1.12fr]">
                <div className="border-b border-bone/15 px-6 py-7 md:border-b-0 md:border-r md:px-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{content.labels.questions}</p>
                  <ol className="mt-4 space-y-4">
                    {scenario.questions.map((question, index) => (
                      <li key={question} className="flex gap-3 text-sm leading-relaxed text-bone/75">
                        <span className="mt-0.5 text-[10px] font-bold tracking-wide text-gold">0{index + 1}</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-gold/[0.07] px-6 py-7 md:px-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{content.labels.reframed}</p>
                  <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-bone md:text-2xl">{scenario.reframed}</h3>
                  <p className="mt-5 border-l-2 border-gold/70 pl-3 text-sm leading-relaxed text-bone/68">{scenario.insight}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-bone/15 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bone/45">{content.labels.next}</p>
                <a
                  href={scenario.href}
                  target={scenario.href.startsWith("http") ? "_blank" : undefined}
                  rel={scenario.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 text-sm font-bold text-gold transition-colors hover:text-bone"
                >
                  {scenario.cta}
                  <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
                </a>
              </div>
            </article>
          </div>
        </div>

        <div className="mt-8 flex gap-3 border-t border-bone/15 pt-5 text-xs leading-relaxed text-bone/55">
          <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
          <p>{content.boundary}</p>
        </div>
      </div>
    </section>
  );
}
