import { useReducer, useRef } from "react";
import { CheckCircle, Circle, PauseCircle, Prohibit, RadioButton } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import JudgmentNote from "./JudgmentNote.jsx";
import {
  STAGE_IDS,
  STATUS,
  describeRefusal,
  flowReducer,
  navReducer,
  passRefusal,
  passedCount,
  stageById,
  stageJudgment,
  stages,
  workflowCopy,
  createFlowState,
  createNavState,
} from "../data/tradeDecisionWorkflow.js";

const STATUS_ICON = {
  PENDING: Circle,
  ACTIVE: RadioButton,
  PASSED: CheckCircle,
  HOLD: PauseCircle,
  BLOCKED: Prohibit,
};

function StatusMark({ status, label }) {
  const Icon = STATUS_ICON[status] || Circle;
  return (
    <span className="inline-flex items-start gap-1 text-xs leading-snug text-ink">
      <Icon size={14} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0 text-forest" />
      <span className="font-semibold">{label}</span>
    </span>
  );
}

export default function TradeDecisionWorkflow() {
  const { lang } = useLang();
  const copy = workflowCopy[lang];
  const [nav, dispatchNav] = useReducer(navReducer, null, createNavState);
  const [flow, dispatchFlow] = useReducer(flowReducer, null, createFlowState);
  const tabRefs = useRef({});

  const selected = stageById(nav.selectedId);
  const selectedCopy = selected[lang];
  const status = flow.stages[selected.id];
  const passed = passedCount(flow.stages);
  const total = STAGE_IDS.length;
  const block = passRefusal(flow, selected.id);
  const judgmentKey = stageJudgment(flow, selected.id);
  const blockText = describeRefusal(block, lang);
  const atStart = nav.selectedId === STAGE_IDS[0];
  const atEnd = nav.selectedId === STAGE_IDS[STAGE_IDS.length - 1];
  const storyHref = `/cases/first-container/?lang=${lang === "en" ? "en" : "zh"}`;

  const moveTab = (event) => {
    const index = STAGE_IDS.indexOf(nav.selectedId);
    let nextIndex = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = Math.min(index + 1, STAGE_IDS.length - 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = Math.max(index - 1, 0);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = STAGE_IDS.length - 1;
    else return;
    event.preventDefault();
    const id = STAGE_IDS[nextIndex];
    dispatchNav({ type: "SELECT", id });
    tabRefs.current[id]?.focus();
  };

  const reset = () => {
    dispatchFlow({ type: "RESET" });
    dispatchNav({ type: "RESET" });
    tabRefs.current.lead?.focus();
  };

  return (
    <section
      id="trade-decision-workflow"
      tabIndex={-1}
      aria-labelledby="trade-decision-title"
      onClick={(event) => event.stopPropagation()}
      className="mt-5 min-w-0 max-w-full scroll-mt-28 break-words border-t border-line pt-5 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
    >
      <p className="text-xs font-semibold text-forest">{copy.demoLabel}</p>
      <p className="mt-1 text-xs leading-relaxed text-moss">{copy.disclosure}</p>
      <h4 id="trade-decision-title" className="mt-3 text-xl font-semibold text-forest">{copy.title}</h4>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-moss">{copy.intro}</p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-moss">{copy.complement}</p>

      <div className="mt-4 border-l-2 border-amber/70 bg-amber/[0.06] px-3 py-3">
        <p className="text-xs font-semibold text-amber">{copy.scenarioTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink">{copy.scenarioBody}</p>
        <a href={storyHref} className="mt-2 inline-flex text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:text-amber">
          {copy.storyLink}
        </a>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink" aria-live="polite">
          <span className="text-moss">{copy.progressLabel}</span>
          {" "}
          <span data-progress={passed}>{copy.progress(passed, total)}</span>
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={passed}
          aria-valuetext={copy.progress(passed, total)}
          aria-label={copy.progressLabel}
          className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-paper"
        >
          <div
            className="h-full bg-forest motion-safe:transition-[width] motion-safe:duration-200"
            style={{ width: `${(passed / total) * 100}%` }}
          />
        </div>
      </div>

      <div
        role="tablist"
        aria-label={copy.stagesLabel}
        onKeyDown={moveTab}
        className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6"
      >
        {stages.map((stage) => {
          const isSelected = stage.id === nav.selectedId;
          const stageStatus = flow.stages[stage.id];
          const name = `${stage[lang].title}, ${copy.status[stageStatus]}`;
          return (
            <button
              key={stage.id}
              ref={(node) => { tabRefs.current[stage.id] = node; }}
              id={`trade-stage-${stage.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="trade-decision-panel"
              tabIndex={isSelected ? 0 : -1}
              data-stage={stage.id}
              data-status={stageStatus}
              data-selected={isSelected ? "true" : "false"}
              aria-label={isSelected ? `${name}, ${copy.viewing}` : name}
              onClick={() => dispatchNav({ type: "SELECT", id: stage.id })}
              className={`flex min-h-11 min-w-0 flex-col items-start gap-1 break-words rounded-field border px-2 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${isSelected ? "border-forest bg-forest/[0.06]" : "border-line bg-card hover:border-forest/40"}`}
            >
              <span className="flex w-full items-center justify-between gap-1 text-xs text-moss">
                <span>{String(stage.order).padStart(2, "0")}</span>
                {isSelected && <span className="font-semibold text-forest">{copy.viewing}</span>}
              </span>
              <span className="w-full break-words text-sm font-semibold leading-snug text-forest">{stage[lang].title}</span>
              <StatusMark status={stageStatus} label={copy.status[stageStatus]} />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-moss">{copy.selectHint}</p>

      <div
        role="tabpanel"
        id="trade-decision-panel"
        aria-labelledby={`trade-stage-${selected.id}`}
        className="mt-4 min-w-0 rounded-card border border-line bg-card px-3 py-4 md:px-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-moss">{String(selected.order).padStart(2, "0")}</p>
            <h5 className="mt-1 text-lg font-semibold text-forest">{selectedCopy.title}</h5>
            <p className="mt-1 text-sm leading-relaxed text-ink">{selectedCopy.description}</p>
          </div>
          <StatusMark status={status} label={copy.status[status]} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="min-w-0 rounded-field border border-line bg-paper/50 px-3 py-3">
            <h5 className="text-xs font-semibold text-amber">{copy.columnsTool}</h5>
            <p className="mt-1 text-sm leading-relaxed text-ink">{selectedCopy.tool}</p>
          </div>
          <div className="min-w-0 rounded-field border border-line bg-paper/50 px-3 py-3">
            <h5 className="text-xs font-semibold text-amber">{copy.columnsPerson}</h5>
            <p className="mt-1 text-sm leading-relaxed text-ink">{selectedCopy.person}</p>
          </div>
        </div>

        <dl className="mt-3 grid gap-3">
          <div className="min-w-0 rounded-field border border-line px-3 py-3">
            <dt className="text-xs font-semibold text-amber">{copy.evidenceLabel}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink">{selectedCopy.evidence}</dd>
          </div>
          <div className="min-w-0 rounded-field border border-line px-3 py-3">
            <dt className="text-xs font-semibold text-amber">{copy.outputLabel}</dt>
            <dd className="mt-1 text-sm font-semibold leading-relaxed text-forest">{selectedCopy.output}</dd>
          </div>
          <div className="min-w-0 border-l-2 border-amber/70 bg-amber/[0.06] px-3 py-3">
            <dt className="text-xs font-semibold text-amber">{copy.gateLabel}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink">{selectedCopy.gate}</dd>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-moss">{copy.passLabel}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink">{selectedCopy.pass}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-moss">{copy.blockedLabel}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink">{selectedCopy.blocked}</dd>
            </div>
          </div>
        </dl>

        {selected.matrix && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-moss">{copy.matrixLabel}</p>
            <ul className="mt-2 grid gap-2">
              {selected.matrix[lang].map((row) => (
                <li key={row.label} className="grid min-w-0 gap-0.5 border-t border-line pt-2 sm:grid-cols-[7rem_1fr_auto] sm:gap-3">
                  <span className="text-xs font-semibold text-forest">{row.label}</span>
                  <span className="text-sm text-ink">{row.value}</span>
                  <span className="text-xs text-moss">{row.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selected.id === "risk-check" && (
          <div className="mt-3 rounded-field border border-line px-3 py-3" data-evidence={flow.paymentSecurityEvidence}>
            <p className="text-xs font-semibold text-amber">{copy.registerLabel}</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {flow.paymentSecurityEvidence === "simulated" ? copy.evidenceSimulated : copy.evidenceMissing}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-moss">{copy.resolveNote}</p>
            <button
              type="button"
              className="mt-3 inline-flex max-w-full whitespace-normal rounded-field border border-forest/30 px-3 py-2 text-left text-sm font-semibold text-forest hover:border-amber hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-default disabled:border-line disabled:text-moss"
              onClick={() => dispatchFlow({ type: "RESOLVE_PAYMENT_EVIDENCE" })}
              disabled={flow.paymentSecurityEvidence === "simulated"}
            >
              {flow.paymentSecurityEvidence === "simulated" ? copy.resolveDone : copy.resolveAction}
            </button>
          </div>
        )}

        <JudgmentNote label={copy.judgmentLabel} id={judgmentKey} text={judgmentKey ? copy.judgments[judgmentKey] : null} />

        {selected.id === "quote" && flow.stages.quote === STATUS.PASSED && (
          <p className="mt-3 border-l-2 border-forest/40 pl-3 text-sm font-semibold text-forest">{copy.quoteReady}</p>
        )}

        {flow.approvalRecord === "SIMULATED_APPROVAL" && flow.stages.approval === STATUS.PASSED && (
          <p className="mt-3 border-l-2 border-forest/40 pl-3 text-sm font-semibold text-forest" data-approval-record="SIMULATED_APPROVAL">
            {copy.approvalBanner}
          </p>
        )}

        {blockText && (
          <p id="trade-decision-block-reason" className="mt-3 text-sm leading-relaxed text-ink">{blockText}</p>
        )}
        {block && (
          <p className="mt-1 text-xs leading-relaxed text-moss">{copy.lockedInspect}</p>
        )}

        <div className="mt-4 flex min-w-0 flex-wrap gap-2">
          <button
            type="button"
            className="max-w-full whitespace-normal rounded-field bg-forest px-3 py-2 text-left text-sm font-semibold text-bone hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            aria-describedby={block ? "trade-decision-block-reason" : undefined}
            onClick={() => dispatchFlow({ type: "PASS", id: selected.id })}
          >
            {selected.id === "approval" ? copy.approvalAction : copy.passAction}
          </button>
          <button
            type="button"
            className="max-w-full whitespace-normal rounded-field border border-amber/50 px-3 py-2 text-left text-sm font-semibold text-amber hover:bg-amber/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            aria-pressed={status === STATUS.HOLD}
            onClick={() => dispatchFlow({ type: "HOLD", id: selected.id })}
          >
            {copy.holdAction}
          </button>
          <button
            type="button"
            className="max-w-full whitespace-normal rounded-field border border-line px-3 py-2 text-left text-sm font-semibold text-forest hover:border-forest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:text-moss"
            onClick={() => dispatchNav({ type: "PREV" })}
            disabled={atStart}
          >
            {copy.prevAction}
          </button>
          <button
            type="button"
            className="max-w-full whitespace-normal rounded-field border border-line px-3 py-2 text-left text-sm font-semibold text-forest hover:border-forest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:text-moss"
            onClick={() => dispatchNav({ type: "NEXT" })}
            disabled={atEnd}
          >
            {copy.nextAction}
          </button>
          <button
            type="button"
            className="max-w-full whitespace-normal rounded-field border border-line px-3 py-2 text-left text-sm font-semibold text-ink hover:border-forest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            onClick={reset}
          >
            {copy.resetAction}
          </button>
        </div>
      </div>
    </section>
  );
}
