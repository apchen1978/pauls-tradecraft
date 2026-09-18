import { useState } from "react";
import { ArrowRight, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function GlobalBusinessDevelopment({ data, tone = "light" }) {
  const { lang } = useLang();
  const copy = data[lang];
  const [objective, setObjective] = useState("capacity");
  const active = copy.objectives[objective];
  const dark = tone === "dark";
  const panel = dark ? "border-bone/20 bg-bone/[0.06]" : "border-line bg-paper";
  const muted = dark ? "text-bone/70" : "text-ink/65";
  const heading = dark ? "text-bone" : "text-forest";

  return (
    <div className="mt-5 space-y-6">
      <section className="overflow-hidden rounded-field border border-forest bg-forest text-bone" aria-labelledby="gbd-headline">
        <div className="grid gap-6 px-5 py-6 sm:px-6 md:grid-cols-[1.25fr_.75fr] md:gap-10 md:px-8 md:py-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber">{copy.kicker}</p>
            <h4 id="gbd-headline" className="mt-3 max-w-[18ch] text-3xl font-medium leading-[1.08] tracking-[-0.035em] text-bone sm:text-4xl" style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif TC", "PMingLiU", serif' }}>
              {copy.headline}
            </h4>
            <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-bone/72">{copy.intro}</p>
          </div>
          <div className="border-t border-bone/20 pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{copy.editorialLabel}</p>
            <p className="mt-3 max-w-[23ch] text-xl font-medium leading-snug tracking-[-0.025em] text-bone" style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif TC", "PMingLiU", serif' }}>
              {copy.editorialLine}
            </p>
            <p className="mt-5 text-xs leading-relaxed text-bone/55">{copy.syntheticNote}</p>
          </div>
        </div>
      </section>

      <section className={`overflow-hidden rounded-field border ${panel}`} aria-labelledby="gbd-objective-title">
        <div className="grid gap-4 border-b border-line px-4 py-4 md:grid-cols-[.9fr_1.1fr] md:px-6 md:py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{copy.objectiveEyebrow}</p>
            <h4 id="gbd-objective-title" className={`mt-1 text-xl font-bold tracking-tight ${heading}`}>{copy.objectiveTitle}</h4>
          </div>
          <div>
            <p className={`text-sm leading-relaxed ${muted}`}>{copy.objectiveIntro}</p>
            <p id="gbd-objective-instruction" className={`mt-3 border-l-2 border-amber pl-3 text-xs font-semibold leading-relaxed ${heading}`}>
              {copy.objectivePrompt}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 border-b border-line sm:grid-cols-2" role="group" aria-label={copy.objectiveTitle} aria-describedby="gbd-objective-instruction">
          {Object.entries(copy.objectives).map(([key, item]) => {
            const activeButton = objective === key;
            return (
              <button key={key} type="button" aria-pressed={activeButton} onClick={(event) => { event.stopPropagation(); setObjective(key); }} className={`relative min-h-24 border-b border-line px-4 py-4 text-left transition-colors last:border-b-0 sm:border-b-0 sm:last:border-l md:px-6 ${activeButton ? "bg-forest text-bone" : dark ? "text-bone/80 hover:bg-bone/[0.08] focus-visible:bg-bone/[0.08]" : "text-forest hover:bg-forest/[0.06] focus-visible:bg-forest/[0.06]"}`}>
                <span className="text-[10px] font-bold tracking-[0.18em] text-amber">{item.label}</span>
                <span className="mt-2 block text-base font-bold">{item.name}</span>
                <span className={`mt-1 block text-xs leading-relaxed ${activeButton ? "text-bone/70" : muted}`}>{item.objective}</span>
                {activeButton && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-amber md:left-6 md:right-6" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <div className="grid gap-0 md:grid-cols-[.82fr_1.18fr]">
          <div className={`border-b border-line p-5 md:border-r md:border-b-0 md:p-6 ${dark ? "bg-bone/[0.04]" : "bg-forest/[0.035]"}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{copy.decisionFrameLabel}</p>
            <p className={`mt-3 text-lg font-bold leading-snug ${heading}`}>{copy.decisionFrameTitle}</p>
            <div className={`mt-5 space-y-4 border-l-2 border-amber/80 pl-4 text-sm leading-relaxed ${muted}`}>
              <div><p className={`text-xs font-bold ${heading}`}>{copy.frameSupplierLabel}</p><p className="mt-1">{copy.frameSupplierBody}</p></div>
              <div><p className={`text-xs font-bold ${heading}`}>{copy.frameEvidenceLabel}</p><p className="mt-1">{copy.frameEvidenceBody}</p></div>
            </div>
          </div>
          <div className="p-5 md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{copy.priorityLabel}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${heading}`}>{active.primary}</p>
            <p className={`mt-3 max-w-[62ch] text-sm leading-relaxed ${muted}`}>{active.reason}</p>
            <dl className="mt-6 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <div><dt className={`text-[10px] font-bold uppercase tracking-[0.14em] ${dark ? "text-bone/60" : "text-ink/50"}`}>{copy.nextQuestion}</dt><dd className={`mt-2 text-sm font-semibold leading-relaxed ${heading}`}>{active.action}</dd></div>
              <div><dt className={`text-[10px] font-bold uppercase tracking-[0.14em] ${dark ? "text-bone/60" : "text-ink/50"}`}>{copy.notYetLabel}</dt><dd className={`mt-2 text-sm font-semibold leading-relaxed ${heading}`}>{active.notYet}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-field border border-line md:grid-cols-[1.08fr_.92fr]" aria-label={copy.changeLabel}>
        <div className="border-b border-line bg-paper p-5 md:border-r md:border-b-0 md:p-6">
          <div className="flex items-center gap-2 text-amber"><WarningCircle size={18} weight="fill" aria-hidden="true" /><p className="text-[10px] font-bold uppercase tracking-[0.16em]">{copy.unknownLabel}</p></div>
          <h4 className="mt-3 text-xl font-bold tracking-tight text-forest">{copy.unknownTitle}</h4>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink/65">{copy.unknownBody}</p>
          <p className="mt-4 border-l-2 border-amber pl-3 text-xs font-bold leading-relaxed tracking-wide text-rust">{copy.unknownAction}</p>
        </div>
        <div className="bg-forest p-5 text-bone md:p-6">
          <div className="flex items-center gap-2 text-amber"><CheckCircle size={18} weight="fill" aria-hidden="true" /><p className="text-[10px] font-bold uppercase tracking-[0.16em]">{copy.gateLabel}</p></div>
          <h4 className="mt-3 text-xl font-bold tracking-tight">{copy.gateTitle}</h4>
          <p className="mt-2 text-sm leading-relaxed text-bone/70">{copy.gateBody}</p>
          <p className="mt-4 border-l-2 border-amber pl-3 text-xs font-bold leading-relaxed tracking-wide text-bone">{copy.gateAction}</p>
        </div>
      </section>

      <section className="border-t border-line pt-5" aria-labelledby="gbd-method-title">
        <div className="grid gap-5 md:grid-cols-[.78fr_1.22fr]">
          <div><p id="gbd-method-title" className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{copy.methodLabel}</p><p className={`mt-2 text-sm leading-relaxed ${muted}`}>{copy.methodIntro}</p></div>
          <ol className={`grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 ${muted}`}>{copy.method.map((item, index) => <li key={item} className="flex gap-3 border-t border-line pt-3"><span className="font-bold text-amber">0{index + 1}</span><span>{item}</span></li>)}</ol>
        </div>
        <div className="mt-6 grid gap-0 border-y border-line sm:grid-cols-2">{copy.loops.map((loop, index) => <div key={loop.title} className={`py-4 ${index === 0 ? "border-b border-line sm:border-r sm:border-b-0 sm:pr-5" : "sm:pl-5"}`}><p className={`text-xs font-bold ${heading}`}>{loop.title}</p><p className={`mt-1 text-xs leading-relaxed ${muted}`}>{loop.body}</p></div>)}</div>
      </section>

      <section className={`rounded-field border p-5 ${panel}`} aria-labelledby="gbd-boundary-title">
        <p id="gbd-boundary-title" className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{copy.decisionBriefLabel}</p>
        <div className="mt-3 grid gap-5 md:grid-cols-[1.1fr_.9fr] md:items-end">
          <div><h4 className={`text-xl font-bold tracking-tight ${heading}`}>{copy.decisionBriefTitle}</h4><p className={`mt-2 text-sm leading-relaxed ${muted}`}>{copy.decisionBriefBody}</p></div>
          <div className={`border-l-2 border-amber pl-4 text-sm leading-relaxed ${muted}`}><p className={`font-semibold ${heading}`}>{copy.handoff}</p><a href="#commercial-decision-desk" className="mt-2 inline-flex items-center gap-1 font-semibold text-forest hover:text-amber focus-visible:text-amber">{copy.handoffLink}<ArrowRight size={14} weight="bold" aria-hidden="true" /></a></div>
        </div>
        <div className={`mt-5 grid gap-x-5 gap-y-2 border-t border-line pt-4 text-[10px] font-bold tracking-[0.12em] ${muted} sm:grid-cols-2`}>{copy.boundaries.map((item) => <p key={item}>{item}</p>)}</div>
      </section>
    </div>
  );
}
