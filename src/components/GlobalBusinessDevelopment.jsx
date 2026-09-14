import { useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function GlobalBusinessDevelopment({ data, tone = "light" }) {
  const { lang } = useLang();
  const copy = data[lang];
  const [objective, setObjective] = useState("capacity");
  const active = copy.objectives[objective];
  const dark = tone === "dark";
  const panel = dark ? "border-bone/20 bg-bone/[0.06]" : "border-line bg-paper";
  const muted = dark ? "text-bone/65" : "text-ink/65";
  const heading = dark ? "text-bone" : "text-forest";

  return (
    <div className="mt-5 space-y-5">
      <div className={`border-l-2 border-amber/80 pl-4 ${muted}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{copy.kicker}</p>
        <h4 className={`mt-1 text-xl font-bold tracking-tight ${heading}`}>{copy.headline}</h4>
        <p className="mt-2 text-sm leading-relaxed">{copy.intro}</p>
        <p
          className={`mt-5 max-w-[34ch] text-xl font-medium leading-snug tracking-[-0.02em] ${heading}`}
          style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif TC", "PMingLiU", serif' }}
        >
          {copy.editorialLine}
        </p>
      </div>

      <section className={`overflow-hidden rounded-field border ${panel}`} aria-labelledby="gbd-objective-title">
        <div className="border-b border-line px-4 py-3 md:px-5">
          <p id="gbd-objective-title" className={`text-sm font-semibold ${heading}`}>{copy.objectiveTitle}</p>
          <p className={`mt-1 text-xs leading-relaxed ${muted}`}>{copy.objectiveIntro}</p>
        </div>
        <div className="grid grid-cols-1 border-b border-line sm:grid-cols-2" role="group" aria-label={copy.objectiveTitle}>
          {Object.entries(copy.objectives).map(([key, item]) => {
            const activeButton = objective === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={activeButton}
                onClick={() => setObjective(key)}
                className={`border-b border-line px-4 py-3 text-left text-sm font-semibold transition-colors last:border-b-0 sm:border-b-0 sm:last:border-l ${
                  activeButton
                    ? "bg-forest text-bone"
                    : dark
                      ? "text-bone/80 hover:bg-bone/[0.08]"
                      : "text-forest hover:bg-forest/[0.06]"
                }`}
              >
                <span className="block text-[10px] font-bold tracking-[0.14em] opacity-70">{item.label}</span>
                <span className="mt-1 block">{item.name}</span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-4 px-4 py-4 md:grid-cols-[1.15fr_.85fr] md:px-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{copy.priorityLabel}</p>
            <p className={`mt-1 text-lg font-bold ${heading}`}>{active.primary}</p>
            <p className={`mt-1 text-sm leading-relaxed ${muted}`}>{active.reason}</p>
          </div>
          <div className={`border-l-2 border-amber/80 pl-3 text-sm ${muted}`}>
            <p className={`font-semibold ${heading}`}>{copy.nextQuestion}</p>
            <p className="mt-1 leading-relaxed">{active.action}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`rounded-field border p-4 ${panel}`} aria-labelledby="gbd-unknown-title">
          <div className="flex items-center gap-2 text-amber">
            <WarningCircle size={18} weight="fill" aria-hidden="true" />
            <p id="gbd-unknown-title" className="text-[10px] font-bold uppercase tracking-[0.14em]">{copy.unknownLabel}</p>
          </div>
          <h4 className={`mt-2 text-base font-bold ${heading}`}>{copy.unknownTitle}</h4>
          <p className={`mt-1 text-sm leading-relaxed ${muted}`}>{copy.unknownBody}</p>
          <p className="mt-3 text-xs font-bold tracking-wide text-rust">{copy.unknownAction}</p>
        </section>
        <section className={`rounded-field border p-4 ${panel}`} aria-labelledby="gbd-gate-title">
          <div className="flex items-center gap-2 text-forest">
            <CheckCircle size={18} weight="fill" aria-hidden="true" />
            <p id="gbd-gate-title" className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{copy.gateLabel}</p>
          </div>
          <h4 className={`mt-2 text-base font-bold ${heading}`}>{copy.gateTitle}</h4>
          <p className={`mt-1 text-sm leading-relaxed ${muted}`}>{copy.gateBody}</p>
          <p className="mt-3 text-xs font-bold tracking-wide text-forest">{copy.gateAction}</p>
        </section>
      </div>

      <section className={`rounded-field border p-4 ${panel}`} aria-labelledby="gbd-method-title">
        <p id="gbd-method-title" className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{copy.methodLabel}</p>
        <ol className={`mt-3 grid gap-2 text-sm sm:grid-cols-2 ${muted}`}>
          {copy.method.map((item, index) => (
            <li key={item} className="flex gap-2"><span className="font-bold text-forest">0{index + 1}</span><span>{item}</span></li>
          ))}
        </ol>
        <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          {copy.loops.map((loop) => (
            <div key={loop.title}>
              <p className={`text-xs font-bold ${heading}`}>{loop.title}</p>
              <p className={`mt-1 text-xs leading-relaxed ${muted}`}>{loop.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-field border p-4 ${panel}`} aria-labelledby="gbd-boundary-title">
        <p id="gbd-boundary-title" className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{copy.boundaryLabel}</p>
        <div className={`mt-3 grid gap-3 text-xs leading-relaxed sm:grid-cols-2 ${muted}`}>
          {copy.boundaries.map((item) => <p key={item}><span className={`font-bold ${heading}`}>{item}</span></p>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-xs font-semibold text-forest">
          <span>{copy.handoff}</span>
          <ArrowRight size={14} aria-hidden="true" />
          <a href="#commercial-decision-desk" className="inline-flex items-center gap-1 hover:text-amber">
            {copy.handoffLink}<ArrowUpRight size={13} weight="bold" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
