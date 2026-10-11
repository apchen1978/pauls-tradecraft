import { useEffect, useId, useRef, useState } from "react";
import { useLang } from "../i18n.jsx";

export default function SemanticaCaseStudy() {
  const { lang, t } = useLang();
  const copy = t.semanticaCaseStudy;
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);
  const panelId = useId();

  useEffect(() => {
    if (window.location.hash === "#architecture-case") {
      requestAnimationFrame(() => document.getElementById("architecture-case")?.scrollIntoView());
    }
  }, []);

  const onTabKeyDown = (event) => {
    let next = active;
    if (event.key === "ArrowRight") next = (active + 1) % copy.tabs.length;
    else if (event.key === "ArrowLeft") next = (active + copy.tabs.length - 1) % copy.tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = copy.tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="architecture-case" aria-labelledby="architecture-decision-title" className="scroll-mt-20 border-y border-line bg-paper/55 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-3xl">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="architecture-decision-title" className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">{copy.title}</h2>
          <p className="mt-3 text-base font-medium text-forest md:text-lg">{copy.subtitle}</p>
          <p className="mt-7 border-l-2 border-amber pl-4 text-xl leading-relaxed text-ink md:text-2xl">“{copy.thesis}”</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/75">{copy.intro}</p>
        </header>

        <div className="mt-12 grid gap-0 divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {[[copy.decision, copy.decisionBody], [copy.unknowns, copy.unknownsBody], [copy.reconsider, copy.reconsiderBody]].map(([heading, body]) => (
            <article key={heading} className="py-5 md:px-6 md:py-6 first:md:pl-0 last:md:pr-0">
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-moss">{heading}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{body}</p>
            </article>
          ))}
        </div>

        <details className="mt-8 rounded-card border border-line bg-card p-5 md:p-7">
          <summary className="cursor-pointer rounded-sm text-base font-semibold text-forest underline decoration-forest/30 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber">{copy.expand}</summary>

          <div className="mt-6 grid gap-0 divide-y divide-line border-y border-line md:grid-cols-2 md:divide-x md:divide-y-0">
            {[[copy.challenge, copy.challengeBody], [copy.hypothesis, copy.hypothesisBody], [copy.experiment, copy.experimentBody], [copy.evidence, copy.evidenceBody], [copy.businessImplication, copy.businessImplicationBody]].map(([heading, body]) => (
              <article key={heading} className="py-5 md:px-6 md:py-6 first:md:pl-0 even:md:pr-0">
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-moss">{heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{body}</p>
              </article>
            ))}
          </div>

        <section aria-labelledby="architecture-lab-title" className="mt-16 rounded-card border border-forest/15 bg-card p-5 shadow-[0_24px_55px_-42px_rgba(20,51,41,.45)] md:mt-20 md:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{lang === "zh" ? "比較摘要" : "COMPARISON BRIEF"}</p>
              <h3 id="architecture-lab-title" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{copy.labTitle}</h3>
            </div>
            <span className="rounded-pill border border-forest/20 px-3 py-1 text-xs font-medium text-forest">{lang === "zh" ? "16 個示範案例" : "16 demo cases"}</span>
          </div>

          <div role="tablist" aria-label={copy.labTitle} onKeyDown={onTabKeyDown} className="mt-7 flex flex-wrap gap-2 border-b border-line pb-3">
            {copy.tabs.map((label, index) => (
              <button key={label} ref={(node) => { tabRefs.current[index] = node; }} type="button" role="tab" id={`${panelId}-tab-${index}`} aria-selected={active === index} aria-controls={`${panelId}-panel`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} className={`rounded-field px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${active === index ? "bg-forest text-bone" : "text-ink/70 hover:bg-forest/[0.06] hover:text-forest"}`}>
                {label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`${panelId}-panel`} aria-labelledby={`${panelId}-tab-${active}`} tabIndex={0} className="min-h-[30rem] py-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber md:min-h-[24rem]">
            {active === 0 && (
              <div>
                <p className="sr-only">{copy.tabs[0]}: {copy.ledger} 144 / 144; {copy.semantica} 144 / 144.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[copy.ledger, copy.semantica].map((label, index) => (
                    <div key={label} className="rounded-field border border-line bg-bone p-5 md:p-6">
                      <p className="text-sm font-medium text-ink/70">{label}</p>
                      <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-forest md:text-4xl">144 <span className="text-ink/35">/</span> 144</p>
                      <p className="mt-2 text-xs text-ink/65">{lang === "zh" ? "答案欄位檢查通過" : "answer-field checks passed"}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/75">{copy.checksNote}</p>
              </div>
            )}
            {active === 1 && (
              <div className="grid gap-6 md:grid-cols-[.8fr_1.2fr] md:items-start">
                <div className="rounded-field bg-pine p-6 text-bone">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gold">{copy.outcomeLabel}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{copy.outcome}</p>
                  <p className="mt-5 border-t border-bone/15 pt-4 text-sm leading-relaxed text-bone/80">{copy.reconsiderBody}</p>
                </div>
                <ul className="grid gap-3">
                  {copy.rationale.map((item, index) => <li key={item} className="flex gap-3 rounded-field border border-line p-4 text-sm leading-relaxed text-ink/80"><span aria-hidden="true" className="font-mono text-amber">0{index + 1}</span><span>{item}</span></li>)}
                </ul>
              </div>
            )}
          </div>
        </section>

        <details className="mt-8 rounded-card border border-line bg-bone p-5 md:p-7">
          <summary className="cursor-pointer rounded-sm text-base font-semibold text-forest underline decoration-forest/30 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber">{copy.technicalTitle}</summary>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/70">{copy.technicalIntro}</p>
          <dl className="mt-5 divide-y divide-line border-y border-line">
            {copy.technicalItems.map(([label, value]) => <div key={label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-5"><dt className="text-sm font-semibold text-forest">{label}</dt><dd className="text-sm leading-relaxed text-ink/75">{value}</dd></div>)}
          </dl>
        </details>
        </details>
        <p className="mt-7 text-center text-xs font-medium uppercase tracking-[0.08em] text-moss">{copy.closing}</p>
      </div>
    </section>
  );
}
