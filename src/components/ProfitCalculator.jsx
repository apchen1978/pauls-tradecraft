import { useState } from "react";
import { ArrowUpRight, Warning } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import JudgmentNote from "./JudgmentNote.jsx";
import {
  FIELD_ORDER,
  FIELD_RANGES,
  barLabel,
  calculateProfit,
  calculatorCopy,
  createInputs,
  formatPercent,
  formatUsd,
  formatResultText,
  judgmentText,
  profitJudgment,
  liveSummary,
} from "../data/profitCalculator.js";

const PART_CLASS = {
  cost: "bg-forest",
  freight: "bg-amber",
  profit: "bg-forest/35",
};

function show(value, unknown) {
  return formatUsd(value) ?? unknown;
}

function Field({ id, field, range, value, onChange }) {
  const numeric = typeof value === "number" ? value : Number(value);
  const sliderValue = Number.isFinite(numeric)
    ? Math.min(range.max, Math.max(range.min, numeric))
    : range.min;
  return (
    <div className="min-w-0" data-field={id}>
      <label htmlFor={`profit-${id}`} className="block break-words text-sm font-semibold text-ink">{field.label}</label>
      <div className="mt-1 flex min-w-0 items-center gap-2">
        <input
          id={`profit-${id}`}
          type="number"
          inputMode="decimal"
          min={range.min}
          step={range.step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full min-w-0 rounded-field border border-line bg-card px-3 text-sm tabular-nums text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        />
        <span className="shrink-0 text-xs text-moss">{field.unit}</span>
      </div>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={sliderValue}
        aria-label={field.slider}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-8 w-full min-w-0 cursor-pointer accent-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
      />
    </div>
  );
}

function Row({ label, value, attr, unknown }) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-3 border-t border-line py-1.5">
      <dt className="text-sm text-moss">{label}</dt>
      <dd className="shrink-0 text-sm font-semibold tabular-nums text-ink" {...{ [attr]: value ?? "" }}>{show(value, unknown)}</dd>
    </div>
  );
}

export default function ProfitCalculator({ href }) {
  const { lang } = useLang();
  const copy = calculatorCopy[lang] ?? calculatorCopy.zh;
  const [inputs, setInputs] = useState(createInputs);
  const [copyState, setCopyState] = useState("idle");
  const result = calculateProfit(inputs);
  const judgmentKey = profitJudgment(result);
  const summary = liveSummary(result, lang);
  const floorText = result.status === "invalid"
    ? copy.invalidNote
    : result.belowFloor
      ? copy.floorWarning
      : result.grossMargin === null
        ? copy.marginUnknown
        : copy.floorHold;

  const update = (key, raw) => {
    setCopyState("idle");
    setInputs((current) => ({ ...current, [key]: raw }));
  };

  const reset = () => {
    setCopyState("idle");
    setInputs(createInputs());
  };

  const copyResult = async () => {
    const text = formatResultText(inputs, result, lang);
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
    }
    setCopyState(ok ? "copied" : "failed");
  };

  return (
    <section
      id="profit-calculator"
      tabIndex={-1}
      aria-labelledby="profit-calculator-title"
      onClick={(event) => event.stopPropagation()}
      className="mt-4 min-w-0 max-w-full scroll-mt-28 break-words border-t border-line pt-4 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
    >
      <p className="text-xs font-semibold text-forest">{copy.demoLabel}</p>
      <h4 id="profit-calculator-title" className="mt-1 text-lg font-semibold text-forest">{copy.title}</h4>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-moss">{copy.intro}</p>
      <p className="mt-1 max-w-3xl text-xs leading-relaxed text-moss">{copy.scope}</p>

      <div className="mt-4 rounded-card border border-line bg-card px-3 py-3" aria-live="polite" data-profit-live={summary}>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <p className="min-w-0">
            <span className="block text-xs font-semibold text-moss">{copy.profitLabel}</span>
            <strong className="mt-0.5 block break-words text-xl tabular-nums text-forest" data-gross-profit={result.grossProfit ?? ""}>{show(result.grossProfit, copy.unknown)}</strong>
          </p>
          <p className="min-w-0">
            <span className="block text-xs font-semibold text-moss">{copy.marginLabel}</span>
            <strong className="mt-0.5 block text-xl tabular-nums text-forest" data-margin={result.grossMargin ?? ""}>{formatPercent(result.grossMargin) ?? copy.unknown}</strong>
          </p>
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-ink" data-margin-warning={result.belowFloor ? "true" : "false"}>
          {result.belowFloor && <Warning size={18} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />}
          <span>{floorText}</span>
        </p>
      </div>
      <JudgmentNote label={copy.judgmentLabel} id={judgmentKey} text={judgmentKey ? judgmentText(judgmentKey, lang, result) : null} />

      <div className="mt-4 grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2">
        {FIELD_ORDER.map((key) => (
          <Field
            key={key}
            id={key}
            field={copy.fields[key]}
            range={FIELD_RANGES[key]}
            value={inputs[key]}
            onChange={(raw) => update(key, raw)}
          />
        ))}
      </div>

      <div className="mt-4 min-w-0">
        <div
          className="flex h-3 w-full overflow-hidden rounded-pill bg-line"
          role="img"
          aria-label={barLabel(result, lang)}
          data-bar-basis={result.bar.basis}
        >
          {result.bar.parts.filter((part) => part.share > 0).map((part) => (
            <div
              key={part.key}
              className={`h-full min-w-0 motion-safe:transition-[width] motion-safe:duration-150 ${PART_CLASS[part.key]}`}
              style={{ width: `${part.share * 100}%` }}
            />
          ))}
        </div>
        <ul className="mt-2 grid gap-1">
          {result.bar.parts.map((part) => (
            <li key={part.key} className="flex min-w-0 items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-ink">
                <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-sm ${PART_CLASS[part.key]}`} />
                {copy.barParts[part.key]}
              </span>
              <span className="shrink-0 tabular-nums text-ink">{show(part.amount, copy.unknown)}</span>
            </li>
          ))}
        </ul>
        {result.bar.basis === "cost" && <p className="mt-1 text-xs leading-relaxed text-moss">{copy.costBasisNote}</p>}
        {result.bar.basis === "empty" && <p className="mt-1 text-xs leading-relaxed text-moss">{copy.emptyBar}</p>}
        {result.status === "zero-quantity" && <p className="mt-1 text-xs leading-relaxed text-moss">{copy.zeroQuantityNote}</p>}
        {result.status === "zero-revenue" && <p className="mt-1 text-xs leading-relaxed text-moss">{copy.zeroRevenueNote}</p>}
        {result.status === "loss" && <p className="mt-1 text-xs leading-relaxed text-moss">{copy.lossNote}</p>}
      </div>

      <dl className="mt-3 min-w-0">
        <Row label={copy.revenueLabel} value={result.revenue} attr="data-revenue" unknown={copy.unknown} />
        <Row label={copy.goodsLabel} value={result.goodsCost} attr="data-goods-cost" unknown={copy.unknown} />
        <Row label={copy.freightLabel} value={result.status === "invalid" ? null : result.freight} attr="data-freight" unknown={copy.unknown} />
        <Row label={copy.totalCostLabel} value={result.totalCost} attr="data-total-cost" unknown={copy.unknown} />
        <Row label={copy.breakEvenLabel} value={result.breakEvenPrice} attr="data-break-even" unknown={copy.unknown} />
        <Row label={copy.depositCashLabel} value={result.depositCash} attr="data-deposit-cash" unknown={copy.unknown} />
        <Row label={copy.balanceLabel} value={result.balanceBeforeShipment} attr="data-balance" unknown={copy.unknown} />
        <Row label={copy.cashLabel} value={result.cashBeforeShipment} attr="data-cash" unknown={copy.unknown} />
      </dl>
      <p className="mt-2 text-xs leading-relaxed text-moss">{copy.depositNote}</p>

      <div className="mt-4 flex min-w-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="max-w-full whitespace-normal rounded-field border border-line px-3 py-2 text-left text-sm font-semibold text-ink hover:border-forest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          {copy.reset}
        </button>
        <button
          type="button"
          onClick={copyResult}
          className="max-w-full whitespace-normal rounded-field border border-line px-3 py-2 text-left text-sm font-semibold text-ink hover:border-forest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          {copyState === "copied" ? copy.copied : copy.copy}
        </button>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 whitespace-normal rounded-field bg-forest px-3 py-2 text-left text-sm font-semibold text-bone hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            {copy.fullTool}
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
        )}
      </div>
      {copyState === "failed" && <p className="mt-2 text-sm text-ink">{copy.copyFailed}</p>}
    </section>
  );
}
