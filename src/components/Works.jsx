import { useLayoutEffect, useRef } from "react";
import { loadGsap } from "../gsapLoader.js";
import {
  ArrowUpRight,
  PresentationChart,
  GameController,
  Receipt,
  Briefcase,
  CaretDown,
  Info,
} from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { firstContainerStory, works } from "../data/works.js";
import { withDemoLang } from "../demoLinks.js";
import GlobalBusinessDevelopment from "./GlobalBusinessDevelopment.jsx";
import TradeDecisionWorkflow from "./TradeDecisionWorkflow.jsx";
import ProfitCalculator from "./ProfitCalculator.jsx";
import { workflowEntry } from "../data/tradeDecisionWorkflow.js";
import { calculatorEntry } from "../data/profitCalculator.js";
import { FoldToggle, firstSentence, foldClass, useFold } from "./FoldedIntro.jsx";
import CoverImage from "./CoverImage.jsx";

const iconMap = {
  presentation: PresentationChart,
  game: GameController,
  receipt: Receipt,
  briefcase: Briefcase,
};

const SECTION_ORDER = ["commercial", "operations", "labs"];
// Flagship works: full-width horizontal cards (cover left, content right) so the
// three main works read as equals. Everything else keeps the grid. `balance`
// moves the flow and takeaway blocks under the cover on wide screens; only for a
// card whose body is much longer than its cover, so the columns stay even.
const WIDE_CARDS = {
  "overseas-lead-discovery": { balance: true },
  "global-business-development": { balance: true },
  "trade-profit-navigator": { balance: false },
};

// Public narrative top-3 (C): the Commercial Decision Desk is featured separately; the flagship wall is GBD + Trade Profit Navigator.
// The market-entry research stays on this wall as GBD's evidence case so
// #ai-native-market-entry resolves. It is not a fourth flagship and not field-validated.
const PUBLIC_COMMERCIAL_WALL_IDS = new Set([
  "overseas-lead-discovery",
  "global-business-development",
  "trade-profit-navigator",
  "ai-native-market-entry",
]);

function stageLabel(work, lang) {
  const stage = work.case?.stage;
  if (!stage) return "";
  return typeof stage === "string" ? stage : stage[lang] || "";
}

function LiveChip({ t, tone = "light" }) {
  const className = tone === "dark"
    ? "inline-flex items-center gap-1 rounded-pill border border-bone/30 px-2 py-0.5 text-xs font-semibold normal-case  text-ondark"
    : "inline-flex items-center gap-1 rounded-pill border border-forest/20 px-2 py-0.5 text-xs font-semibold normal-case  text-forest";
  return (
    <span className={className} title={t.works.liveExplain} aria-label={`${t.works.statusLive}. ${t.works.liveExplain}`}>
      {t.works.statusLive}
      <Info size={12} weight="bold" aria-hidden="true" />
    </span>
  );
}

function GbdActions() {
  const { lang, t } = useLang();
  const gbd = works.find((work) => work.id === "global-business-development");
  const evidence = works.find((work) => work.id === "ai-native-market-entry");
  const signal = evidence?.marketEntry?.[lang];
  const artifact = evidence?.workingEvidence?.[lang];
  const evidenceLabel = typeof gbd?.related?.label === "string" ? gbd.related.label : gbd?.related?.label?.[lang];

  return (
    <div className="mt-auto space-y-3 pt-4">
      <button
        type="button"
        className="inline-flex w-fit items-center gap-2 rounded-field bg-forest px-4 py-2.5 text-sm font-semibold text-bone transition-colors hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        onClick={(e) => {
          e.stopPropagation();
          const details = e.currentTarget.closest("article")?.querySelector(":scope > details");
          if (details) details.open = !details.open;
        }}
      >
        {t.works.expandJudgment}
        <CaretDown size={15} weight="bold" aria-hidden="true" />
      </button>
      {gbd?.standaloneDemo && (
        <div>
          <a
            href={gbd.standaloneDemo.href[lang]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-amber"
          >
            <span className="rounded-pill border border-forest/20 bg-forest/[0.06] px-2 py-0.5 text-xs font-medium  text-forest">{t.works.demoLabel}</span>
            {gbd.standaloneDemo.label[lang]}
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
          <p className="mt-1 text-xs leading-relaxed text-moss">{gbd.standaloneDemo.note[lang]}</p>
        </div>
      )}
      {signal && (
        <a
          href={`#${evidence.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block rounded-field border border-forest/20 px-4 py-3 transition-colors hover:border-amber/60"
        >
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
            {evidenceLabel}
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-moss">{signal.caseArc}</span>
        </a>
      )}
      {artifact?.href && (
        <div>
          <a
            href={withDemoLang(artifact.href, lang)}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-amber"
          >
            {artifact.cta}
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
          <p className="mt-1 text-xs leading-relaxed text-moss">{artifact.boundary}</p>
        </div>
      )}
    </div>
  );
}

function MaturityChip({ label, tone = "light" }) {
  if (!label) return null;
  const className = tone === "dark"
    ? "inline-flex items-center rounded-pill border border-gold/40 px-2 py-0.5 text-xs font-semibold normal-case tracking-normal text-gold"
    : "inline-flex items-center rounded-pill border border-amber/40 bg-amber/[0.08] px-2 py-0.5 text-xs font-semibold normal-case tracking-normal text-amber";
  return <span className={className}>{label}</span>;
}

function ProductFlow({ work, tone = "light" }) {
  const { lang } = useLang();
  const flow = work.showcase?.[lang];
  if (!flow) return null;

  const dark = tone === "dark";
  return (
    <details className={`group mt-6 border-y py-3 ${dark ? "border-bone/15" : "border-forest/15"}`}>
      <summary className={`flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium [&::-webkit-details-marker]:hidden ${dark ? "text-gold" : "text-amber"}`}>
        {flow.label}
        <CaretDown size={12} weight="bold" aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className={`mt-3 grid gap-3 sm:grid-cols-3 ${dark ? "sm:divide-x sm:divide-bone/15" : "sm:divide-x sm:divide-forest/15"}`}>
        {flow.stages.map((stage, index) => (
          <div key={stage.label} className={index === 0 ? "sm:pr-3" : index === flow.stages.length - 1 ? "sm:pl-3" : "sm:px-3"}>
            <p className={`text-xs font-semibold  ${dark ? "text-ondark-meta" : "text-moss"}`}>{stage.label}</p>
            <p className={`mt-1 text-xs leading-relaxed ${dark ? "text-ondark" : "text-ink"}`}>{stage.value}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

function MarketEntrySignal({ data }) {
  const { lang } = useLang();
  const copy = data?.[lang];
  if (!copy) return null;

  return (
    <section className="mt-5 border-y border-forest/15 py-5" aria-label={copy.signalLabel}>
      <div className="grid gap-5 md:grid-cols-[1.1fr_.9fr] md:gap-8">
        <div>
          <p className="text-xl font-semibold leading-tight tracking-tight text-forest md:text-2xl">{copy.hero}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-moss md:text-base">{copy.heroSupport}</p>
        </div>
        <div className="border-l-2 border-amber/70 pl-4 md:pl-5">
          <p className="text-xs font-medium  text-moss">{copy.caseArcLabel}</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-forest">{copy.caseArc}</p>
          <p className="mt-2 text-xs leading-relaxed text-moss">{copy.context}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-0 border-y border-forest/15 md:grid-cols-[1fr_1.15fr_1fr]">
        {copy.signature.map((item, index) => (
          <div key={item.label} className={`py-4 ${index === 0 ? "border-b md:border-r md:border-b-0 md:pr-5" : index === 1 ? "border-b bg-forest/[0.045] md:border-x md:border-b-0 md:px-5" : "md:pl-5"} border-forest/15`}>
            <p className="text-xs font-medium  text-moss">{index === 0 ? copy.beforeLabel : index === 1 ? copy.zeroLabel : copy.afterLabel}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-forest">{item.value}</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-ink">{item.label}</p>
            {index === 1 && <p className="mt-2 text-xs leading-relaxed text-moss">{copy.zeroNote}</p>}
            {index === 2 && <p className="mt-2 text-xs leading-relaxed text-moss">{copy.afterNote}</p>}
          </div>
        ))}
      </div>

      <details className="group mt-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium text-moss [&::-webkit-details-marker]:hidden">
          {copy.gatesTitle}
          <CaretDown size={12} weight="bold" aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {copy.gates.map((gate, index) => (
            <div key={gate.title} className="border-t border-forest/20 pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold  text-moss">0{index + 1}</span>
                <span className={`text-xs font-medium  ${gate.status === "UNKNOWN" || gate.status === "待確認" ? "text-rust" : "text-forest"}`}>{gate.status}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-forest">{gate.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-moss">{gate.body}</p>
            </div>
          ))}
        </div>
      </details>

      <p className="mt-6 inline-flex border-l-2 border-amber pl-3 text-xs font-medium  text-forest">{copy.correction}</p>
    </section>
  );
}

function MarketEntryDetails({ data, tone = "light" }) {
  const { lang } = useLang();
  const copy = data?.[lang];
  if (!copy) return null;
  const dark = tone === "dark";
  const border = dark ? "border-bone/15" : "border-line";
  const heading = dark ? "text-ondark" : "text-ink";
  const body = dark ? "text-ondark-meta" : "text-moss";

  return (
    <>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.questionTitle}</dt>
        <dd className={`mt-0.5 leading-relaxed ${body}`}>{copy.question}</dd>
      </div>
      <div className={`border-l-2 border-amber/70 bg-amber/[0.06] px-4 py-3 ${dark ? "bg-gold/[0.08]" : ""}`}>
        <dt className={`text-xs font-medium  ${dark ? "text-gold" : "text-amber"}`}>{copy.lessonTitle}</dt>
        <dd className={`mt-1 font-semibold leading-relaxed ${heading}`}>{copy.lesson}</dd>
      </div>
      <div className={`border-t pt-3 ${border}`}>
        <dt className={`font-semibold ${heading}`}>{copy.failureTitle}</dt>
        <dd className={`mt-0.5 leading-relaxed ${body}`}>{copy.failure}</dd>
      </div>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.methodTitle}</dt>
        <dd className="mt-2">
          <ol className={`grid gap-1.5 text-sm sm:grid-cols-5 ${body}`}>
            {copy.method.map((item, index) => (
              <li key={item} className="flex gap-2 leading-relaxed sm:block">
                <span className="font-semibold text-amber">{String(index + 1).padStart(2, "0")}</span>
                <span className="sm:mt-1 sm:block">{item}</span>
              </li>
            ))}
          </ol>
        </dd>
      </div>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.structureTitle}</dt>
        <dd className={`mt-1 leading-relaxed ${body}`}>{copy.structure}</dd>
      </div>
      <div className={`border-t pt-3 ${border}`}>
        <dt className={`font-semibold ${heading}`}>{copy.opportunityTitle}</dt>
        <dd className="mt-2">
          <dl className={`grid gap-2 rounded-field border px-4 py-3 ${border} ${dark ? "bg-bone/[0.04]" : "bg-paper/60"}`}>
            {copy.opportunity.map(([label, value]) => (
              <div key={label} className="grid gap-0.5 sm:grid-cols-[8rem_1fr] sm:gap-3">
                <dt className={`text-xs font-semibold ${dark ? "text-gold" : "text-amber"}`}>{label}</dt>
                <dd className={`leading-relaxed ${body}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </dd>
      </div>
      <div className={`border-t pt-3 ${border}`}>
        <dt className={`font-semibold ${heading}`}>{copy.handoffTitle}</dt>
        <dd className="mt-2">
          <ol className={`grid gap-1.5 text-sm sm:grid-cols-4 ${body}`}>
            {copy.handoff.map((item, index) => (
              <li key={item} className="flex gap-2 leading-relaxed sm:block">
                <span className="font-semibold text-amber">{String(index + 1).padStart(2, "0")}</span>
                <span className="sm:mt-1 sm:block">{item}</span>
              </li>
            ))}
          </ol>
          <p className={`mt-2 border-l-2 border-amber/70 pl-3 text-xs leading-relaxed ${body}`}>{copy.handoffBoundary}</p>
        </dd>
      </div>
      <div className={`border-l-2 border-amber/70 bg-amber/[0.06] px-4 py-3 ${dark ? "bg-gold/[0.08]" : ""}`}>
        <dt className={`text-xs font-medium  ${dark ? "text-gold" : "text-amber"}`}>{copy.boundaryTitle}</dt>
        <dd className={`mt-1 leading-relaxed ${body}`}>{copy.boundary}</dd>
        <ul className={`mt-2 grid gap-1 text-xs sm:grid-cols-2 ${body}`}>
          {copy.notTested.map((item) => <li key={item}>— {item}</li>)}
        </ul>
      </div>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.closingTitle}</dt>
        <dd className={`mt-0.5 font-medium leading-relaxed ${body}`}>{copy.closing}</dd>
      </div>
      <div className={`border-t pt-4 ${border}`}>
        <dt className={`font-semibold ${heading}`}>{copy.ctaTitle}</dt>
        <dd className={`mt-0.5 leading-relaxed ${body}`}>{copy.ctaBody}</dd>
        <a href="#contact" className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${dark ? "text-gold hover:text-bone" : "text-forest hover:text-amber"}`}>
          <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          {copy.ctaLabel}
        </a>
      </div>
    </>
  );
}

function WorkingEvidence({ data, tone = "light" }) {
  const { lang } = useLang();
  const copy = data?.[lang];
  if (!copy) return null;
  const dark = tone === "dark";
  return (
    <div className={`mt-5 border-t pt-4 ${dark ? "border-bone/15" : "border-line"}`}>
      <p className={`text-xs font-medium  ${dark ? "text-gold" : "text-amber"}`}>{copy.label}</p>
      <h4 className={`mt-1 text-lg font-semibold ${dark ? "text-ondark" : "text-ink"}`}>{copy.title}</h4>
      <p className={`mt-1 max-w-2xl text-sm leading-relaxed ${dark ? "text-ondark-meta" : "text-moss"}`}>{copy.body}</p>
      <p className={`mt-2 text-xs leading-relaxed ${dark ? "text-ondark-meta" : "text-moss"}`}>{copy.boundary}</p>
      <a href={withDemoLang(copy.href, lang)} className={`mt-3 inline-flex items-center gap-2 rounded-field bg-forest px-4 py-2.5 text-sm font-semibold text-bone transition-colors hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber`}>
        {copy.cta}<ArrowUpRight size={15} weight="bold" aria-hidden="true" />
      </a>
    </div>
  );
}

function SpendingInsightSignal({ data }) {
  const { lang } = useLang();
  const copy = data?.[lang];
  if (!copy) return null;

  return (
    <section className="mt-5 border-y border-forest/15 py-5" aria-label={copy.signalLabel}>
      <div className="grid gap-5 md:grid-cols-[1.08fr_.92fr] md:gap-8">
        <div>
          <p className="text-xl font-semibold leading-tight tracking-tight text-forest md:text-2xl">{copy.hero}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-moss md:text-base">{copy.heroSupport}</p>
        </div>
        <div className="border-l-2 border-amber/70 pl-4 md:pl-5">
          <p className="text-xs font-medium  text-moss">{copy.caseLabel}</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-forest">{copy.case}</p>
          <p className="mt-2 text-xs leading-relaxed text-moss">{copy.caseBoundary}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-0 border-y border-forest/15 md:grid-cols-3">
        {copy.lenses.map((lens, index) => (
          <div key={lens.title} className={`py-4 ${index === 0 ? "border-b md:border-r md:border-b-0 md:pr-5" : index === 1 ? "border-b bg-forest/[0.045] md:border-x md:border-b-0 md:px-5" : "md:pl-5"} border-forest/15`}>
            <p className="text-xs font-semibold  text-moss">0{index + 1}</p>
            <p className="mt-2 text-sm font-semibold text-forest">{lens.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-moss">{lens.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-l-2 border-amber bg-amber/[0.06] px-4 py-3">
        <p className="text-xs font-medium  text-moss">{copy.questionLabel}</p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-forest">{copy.question}</p>
      </div>
    </section>
  );
}

function SpendingInsightDetails({ data, tone = "light" }) {
  const { lang } = useLang();
  const copy = data?.[lang];
  if (!copy) return null;
  const dark = tone === "dark";
  const border = dark ? "border-bone/15" : "border-line";
  const heading = dark ? "text-ondark" : "text-ink";
  const body = dark ? "text-ondark-meta" : "text-moss";

  return (
    <>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.questionTitle}</dt>
        <dd className={`mt-0.5 leading-relaxed ${body}`}>{copy.question}</dd>
      </div>
      <div className={`border-l-2 border-amber/70 bg-amber/[0.06] px-4 py-3 ${dark ? "bg-gold/[0.08]" : ""}`}>
        <dt className={`text-xs font-medium  ${dark ? "text-gold" : "text-amber"}`}>{copy.lessonTitle}</dt>
        <dd className={`mt-1 font-semibold leading-relaxed ${heading}`}>{copy.lesson}</dd>
      </div>
      <div className={`border-t pt-3 ${border}`}>
        <dt className={`font-semibold ${heading}`}>{copy.exampleTitle}</dt>
        <dd className={`mt-2 leading-relaxed ${body}`}>{copy.example}</dd>
        <p className={`mt-2 text-xs leading-relaxed ${body}`}>{copy.exampleBoundary}</p>
      </div>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.ownerFlowTitle}</dt>
        <dd className="mt-2">
          <ol className={`grid gap-2 text-sm sm:grid-cols-4 ${body}`}>
            {copy.ownerFlow.map((item, index) => (
              <li key={item} className="flex gap-2 leading-relaxed sm:block">
                <span className="font-semibold text-amber">{String(index + 1).padStart(2, "0")}</span>
                <span className="sm:mt-1 sm:block">{item}</span>
              </li>
            ))}
          </ol>
        </dd>
      </div>
      <div className={`border-t pt-3 ${border}`}>
        <dt className={`font-semibold ${heading}`}>{copy.handoffTitle}</dt>
        <dd className="mt-2">
          <dl className={`grid gap-2 rounded-field border px-4 py-3 ${border} ${dark ? "bg-bone/[0.04]" : "bg-paper/60"}`}>
            {copy.handoff.map(([label, value]) => (
              <div key={label} className="grid gap-0.5 sm:grid-cols-[9rem_1fr] sm:gap-3">
                <dt className={`text-xs font-semibold ${dark ? "text-gold" : "text-amber"}`}>{label}</dt>
                <dd className={`leading-relaxed ${body}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </dd>
      </div>
      <div className={`border-l-2 border-amber/70 bg-amber/[0.06] px-4 py-3 ${dark ? "bg-gold/[0.08]" : ""}`}>
        <dt className={`text-xs font-medium  ${dark ? "text-gold" : "text-amber"}`}>{copy.boundaryTitle}</dt>
        <dd className={`mt-1 leading-relaxed ${body}`}>{copy.boundary}</dd>
        <ul className={`mt-2 grid gap-1 text-xs sm:grid-cols-2 ${body}`}>
          {copy.notTested.map((item) => <li key={item}>— {item}</li>)}
        </ul>
      </div>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.closingTitle}</dt>
        <dd className={`mt-0.5 font-medium leading-relaxed ${body}`}>{copy.closing}</dd>
      </div>
    </>
  );
}

function CaseStudy({ c, related, link, linkLabel, workingEvidence, casePage, tone = "light", workId }) {
  const { lang, t } = useLang();
  const f = (field) => (field ? field[lang] : "");
  const stageTag = typeof c.stageTag === "string" ? c.stageTag : c.stageTag?.[lang];
  const labels = t.works.caseStudy;
  const isDark = tone === "dark";
  const styles = isDark
    ? {
        details: "border-bone/15",
        summary: "border-bone/25 bg-bone/[0.06] text-bone hover:bg-bone/[0.1]",
        stage: "bg-gold/15 text-ondark",
        border: "border-bone/15",
        heading: "text-ondark",
        body: "text-ondark-meta",
        caption: "text-ondark-meta",
        link: "text-gold hover:text-bone",
      }
    : {
        details: "border-line",
        summary: "border-forest/25 bg-forest/[0.06] text-forest hover:bg-forest/10",
        stage: "bg-forest/10 text-forest",
        border: "border-line",
        heading: "text-ink",
        body: "text-moss",
        caption: "text-moss",
        link: "text-forest hover:text-amber",
      };
  return (
    <details className={`group mt-4 border-t px-6 pt-4 pb-6 ${styles.details}`}>
      <summary className={`flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1.5 rounded-pill border px-4 py-2.5 text-sm font-semibold transition-colors [&::-webkit-details-marker]:hidden ${styles.summary}`}>
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${styles.stage}`}>
          {f(c.stage)}
           {stageTag ? ` · ${stageTag}` : ""}
        </span>
        <span className="flex-1 whitespace-nowrap">{labels.label}</span>
        <CaretDown size={14} weight="bold" className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      {workId === "trade-profit-navigator" && <ProfitCalculator href={link} />}
       <dl className="mt-3 space-y-3 text-sm">
        {c.gallery && (
          <div>
            <figure>
              <CoverImage
                src={c.gallery.src}
                alt={f(c.gallery.alt)}
                className={`h-auto w-full rounded-field border ${styles.border}`}
              />
              {c.gallery.caption && (
                <figcaption className={`mt-1.5 text-xs ${styles.caption}`}>{f(c.gallery.caption)}</figcaption>
              )}
            </figure>
          </div>
        )}
         {c.globalBusinessDevelopment ? <GlobalBusinessDevelopment data={c.globalBusinessDevelopment} tone={tone} /> : c.marketEntry ? <MarketEntryDetails data={c.marketEntry} tone={tone} /> : c.spendingInsight ? <SpendingInsightDetails data={c.spendingInsight} tone={tone} /> : <>
          <div>
            <dt className={`font-semibold ${styles.heading}`}>{labels.problem}</dt>
            <dd className={`mt-0.5 leading-relaxed ${styles.body}`}>{f(c.problem)}</dd>
          </div>
          <div>
            <dt className={`font-semibold ${styles.heading}`}>{labels.approach}</dt>
            <dd className={`mt-0.5 leading-relaxed ${styles.body}`}>{f(c.approach)}</dd>
          </div>
        </>}
         {c.highlights && (
           <div>
             <dt className={`font-semibold ${styles.heading}`}>{labels.capabilities ?? "Capabilities"}</dt>
             <dd className="mt-1">
               <ul className={`grid gap-1.5 sm:grid-cols-2 ${styles.body}`}>
                 {c.highlights[lang].map((item) => <li key={item} className="flex gap-2 leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />{item}</li>)}
               </ul>
             </dd>
           </div>
         )}
         {!c.compact && !c.marketEntry && (
           <div>
              <dt className={`font-semibold ${styles.heading}`}>{labels.tools}</dt>
              <dd className={`mt-0.5 leading-relaxed ${styles.body}`}>{f(c.tools)}</dd>
           </div>
         )}
         {!c.compact && !c.marketEntry && <div>
            <dt className={`font-semibold ${styles.heading}`}>{labels.result}</dt>
            <dd className={`mt-0.5 leading-relaxed ${styles.body}`}>{f(c.result)}</dd>
        </div>}
        {workingEvidence && !c.marketEntry && <WorkingEvidence data={workingEvidence} tone={tone} />}
        {!c.marketEntry && <div>
          <dt className={`font-semibold ${styles.heading}`}>{labels.evidence}</dt>
          <dd className={`mt-0.5 break-words leading-relaxed ${styles.body}`}>{f(c.evidence)}</dd>
        </div>}
        {related && (
          <div className={`border-t pt-3 ${styles.border}`}>
            <a
              href={`#${related.id}`}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${styles.link}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight size={14} weight="bold" />
              {typeof related.label === "string" ? related.label : related.label?.[lang]}
            </a>
            {related.note && <p className={`mt-1 text-xs leading-relaxed ${styles.caption}`}>{typeof related.note === "string" ? related.note : related.note?.[lang]}</p>}
         </div>
        )}
        {c.compact && link && (
          <div className={`border-t pt-3 ${styles.border}`}>
            <a href={withDemoLang(link, lang)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${styles.link}`}>
              <ArrowUpRight size={14} weight="bold" />
              {typeof linkLabel === "string" ? linkLabel : linkLabel?.[lang]}
            </a>
          </div>
        )}
        {casePage?.href && (
          <div className={`border-t pt-3 ${styles.border}`}>
            <a href={casePage.href} className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${styles.link}`} onClick={(e) => e.stopPropagation()}>
              <ArrowUpRight size={14} weight="bold" />
              {typeof casePage.label === "string" ? casePage.label : casePage.label?.[lang]}
            </a>
          </div>
        )}
      </dl>
      {c.marketEntry && (
        <>
          <TradeDecisionWorkflow />
          {workingEvidence && <WorkingEvidence data={workingEvidence} tone={tone} />}
        </>
      )}
    </details>
  );
}

function FeaturedSystem({ work }) {
  const { lang, t } = useLang();
  const featuredRef = useRef(null);
  const fold = useFold();
  const copy = work[lang];
  const cover = typeof work.cover === "string" ? work.cover : work.cover?.[lang];
  const linkLabel = typeof work.linkLabel === "string" ? work.linkLabel : work.linkLabel?.[lang];
  // 主入口先看完成範例；已理解用途的人可用第二入口評估自己的商機。
  const secondaryLabel = work.secondaryLinkLabel
    ? (typeof work.secondaryLinkLabel === "string" ? work.secondaryLinkLabel : work.secondaryLinkLabel?.[lang])
    : null;

  useLayoutEffect(() => {
    const root = featuredRef.current;
    if (!root) return undefined;

    // 錨點直達（#works / #commercial-decision-desk …）時立即顯示內容，
    // 避免「跳轉後先看到大片空白、之後才淡入」的體驗。
    const hashTargets = new Set(
      [...document.querySelectorAll("main [id]")].map((el) => `#${el.id}`),
    );
    const jumpedTo = (hash) =>
      !!hash && hash !== "#top" && (hashTargets.has(hash) || hash === "#works");

    // gsap arrives after the page has loaded; until then the card is simply visible.
    let ctx = null;
    let cancelled = false;
    loadGsap().then((gsap) => {
    if (cancelled) return;
    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
        const timeline = gsap.timeline({ paused: true });

        if (conditions.reduceMotion) {
          timeline.set("[data-featured-copy], [data-featured-visual]", { autoAlpha: 1 });
        } else {
          // 短距離淡入：距離 14→10、時長 0.48→0.35，內容預設仍在原位上方一點點
          timeline
            .from("[data-featured-copy]", {
              y: 10,
              autoAlpha: 0,
              duration: 0.35,
              ease: "power2.out",
              stagger: 0.06,
              immediateRender: false,
            })
            .from(
              "[data-featured-visual]",
              {
                y: 8,
                duration: 0.38,
                ease: "power2.out",
                immediateRender: false,
              },
              "<0.1",
            );
        }

        const revealNow = () => {
          if (conditions.reduceMotion) {
            timeline.set("[data-featured-copy], [data-featured-visual]", { autoAlpha: 1 });
          } else {
            timeline.progress(1);
          }
        };
        // 錨點跳轉抵達時直接完成動畫（不重播）
        const onHash = () => {
          if (jumpedTo(window.location.hash)) revealNow();
        };
        window.addEventListener("hashchange", onHash);

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            // 若這次抵達是錨點直達（含載入時 URL 帶 hash），直接揭示、不重播淡入
            if (jumpedTo(window.location.hash)) {
              revealNow();
            } else {
              timeline.play();
            }
            observer.disconnect();
          },
          { threshold: 0.05, rootMargin: "0px 0px -4%" },
        );

        observer.observe(root);
        return () => {
          window.removeEventListener("hashchange", onHash);
          observer.disconnect();
          timeline.kill();
        };
      });
    }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <article ref={featuredRef} id={work.id} className="scroll-mt-28 overflow-hidden rounded-card border border-forest/25 bg-pine text-bone">
      <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
        <div className="flex flex-col px-6 py-8 md:px-10 md:py-11 lg:px-9 lg:py-9">
          <div data-featured-copy className="flex flex-wrap items-center gap-2 text-xs font-medium  text-gold">
            <span>{copy.tag}</span>
            {work.verified && work.link && <LiveChip t={t} tone="dark" />}
            <MaturityChip label={stageLabel(work, lang)} tone="dark" />
          </div>
          <h3 data-featured-copy className="mt-5 max-w-md text-3xl font-medium leading-[1.08] tracking-[-0.03em] text-bone md:text-4xl">{copy.title}</h3>
          <p data-featured-copy className="mt-5 max-w-[43ch] text-base leading-relaxed text-ondark-meta">{copy.desc}</p>
          <FoldToggle open={fold.open} onToggle={fold.toggle} controls="featured-more" className="mt-5 text-gold" />
          <div id="featured-more" className={foldClass(fold.open)}>
          {copy.caseSummary && (
            <p data-featured-copy className="mt-7 border-l border-gold pl-4 text-sm leading-relaxed text-ondark">{copy.caseSummary}</p>
          )}
          <ProductFlow work={work} tone="dark" />
          </div>
          <a data-featured-copy href={withDemoLang(work.link, lang)} target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex w-fit items-center gap-2 rounded-field bg-gold px-5 py-3 text-sm font-semibold text-pine transition-colors hover:brightness-110">
            {linkLabel}
            <ArrowUpRight size={16} weight="bold" />
          </a>
          {work.secondaryLink && secondaryLabel && (
            <a data-featured-copy href={withDemoLang(work.secondaryLink, lang)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-fit items-center gap-2 rounded-field border border-bone/25 px-4 py-2 text-sm font-semibold text-ondark transition-colors hover:border-gold/60 hover:text-gold">
              {secondaryLabel}
            </a>
          )}
          {work.id === "commercial-decision-desk" && (
            <a data-featured-copy href="#outcomes" className="mt-4 w-fit text-sm font-semibold text-ondark underline decoration-bone/30 underline-offset-4 transition-colors hover:text-gold">
              {t.hero.cddInvite}
            </a>
          )}
          {work.demoNote && <p className="mt-4 text-xs leading-relaxed text-ondark-meta">{work.demoNote[lang]}</p>}
        </div>
        <a data-featured-visual href={withDemoLang(work.link, lang)} target="_blank" rel="noopener noreferrer" aria-label={copy.title} className="focus-visible:outline-offset-[-4px] focus-visible:shadow-[inset_0_0_0_8px_var(--color-pine)] group relative flex items-center border-t border-bone/10 bg-[radial-gradient(120%_90%_at_70%_20%,#24503f_0%,#143329_70%)] p-5 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
          <div className="w-full overflow-hidden rounded-field border border-bone/15 bg-bone">
            <div className="flex items-center gap-1.5 border-b border-ink/10 bg-paper px-4 py-2.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-ink/15" />
              <span className="size-2 rounded-full bg-ink/15" />
              <span className="size-2 rounded-full bg-ink/15" />
            </div>
            <CoverImage src={cover} alt={work.imageAlt[lang]} className={`aspect-[16/9] w-full ${work.imageFit === "contain" ? "bg-paper object-contain" : "object-cover object-top"} transition-transform duration-700 group-hover:scale-[1.015]`} />
          </div>
          <span className="absolute bottom-7 right-7 rounded-field bg-ink/90 px-3 py-2 text-xs font-semibold text-bone opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{linkLabel} →</span>
        </a>
      </div>
      {work.case && <CaseStudy workId={work.id} c={work.case} related={work.related} link={withDemoLang(work.link, lang)} linkLabel={work.linkLabel} workingEvidence={work.workingEvidence} casePage={work.casePage} tone="dark" />}
    </article>
  );
}

// ② 旗艦提前：商務決策工作台旗艦展示是獨立頂層區塊（id="#works" 保留給導覽「作品」），
// 以 works 主標題開場「成果先」；其餘卡片目錄（見 Works）只保留分組標題、不重複大標題。
export function WorksFlagship() {
  const { lang, t } = useLang();
  const { open, toggle } = useFold();
  const [subFirst, subRest] = firstSentence(t.works.sub);
  const featuredSystem = works.find((work) => work.id === "commercial-decision-desk");
  const adjacentWorks = ["global-business-development", "trade-profit-navigator"]
    .map((id) => works.find((work) => work.id === id))
    .filter(Boolean);
  return (
    <section id="works" aria-labelledby="works-flagship-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-36">
      <div className="border-b border-line pb-10">
        <div className="max-w-3xl">
          <p className="eyebrow">{t.works.eyebrow}</p>
          <h2 id="works-flagship-heading" className="mt-6 max-w-[22ch] text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] md:text-[3.25rem]">{t.works.headline}</h2>
          <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-moss md:text-lg">{subFirst}{subRest && <span className={foldClass(open, "inline")}> {subRest}</span>}</p>
          <a href={`${firstContainerStory.href}?lang=${lang}`} className="mt-5 inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
            {firstContainerStory.label[lang]}
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-moss">{firstContainerStory.note[lang]}</p>
        </div>
        <FoldToggle open={open} onToggle={toggle} controls="works-also-explore-nav" />
        <nav id="works-also-explore-nav" aria-labelledby="works-also-explore" className={`mt-7 flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 ${open ? "flex" : "hidden md:flex"}`}>
          <span id="works-also-explore" className="text-xs font-semibold text-moss">{t.works.alsoExplore}</span>
          {adjacentWorks.map((work) => (
            <a key={work.id} href={`#${work.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
              {work[lang].title}<ArrowUpRight size={14} weight="bold" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      <div className="mt-12">
        <FeaturedSystem work={featuredSystem} />
      </div>
    </section>
  );
}

export default function Works() {
  const { lang, t } = useLang();
  const featuredSystem = works.find((work) => work.id === "commercial-decision-desk");
  const sections = SECTION_ORDER.map((id) => ({
    id,
    label: t.works.sections[id],
    note: t.works.sections.notes[id],
    works: [...works]
      .filter((w) => w.section === id && w.id !== featuredSystem.id && (id !== "commercial" || PUBLIC_COMMERCIAL_WALL_IDS.has(w.id)))
      .sort((a, b) => {
        // MORI is the client-facing website showcase for this section. Keep it
        // first without rewriting the evidence/order data owned in works.js.
        if (id === "operations") {
          if (a.id === "mori-soft-furnishing-website") return -1;
          if (b.id === "mori-soft-furnishing-website") return 1;
        }
        return (a.featuredRank ?? Number.MAX_SAFE_INTEGER) - (b.featuredRank ?? Number.MAX_SAFE_INTEGER);
      }),
  }));

  const renderCard = (w) => {
    const copy = lang === "zh" ? w.zh : w.en;
    const cover = typeof w.cover === "string" ? w.cover : w.cover?.[lang];
    const linkLabel = typeof w.linkLabel === "string" ? w.linkLabel : w.linkLabel?.[lang];
    const secondaryLabel = typeof w.secondaryLinkLabel === "string" ? w.secondaryLinkLabel : w.secondaryLinkLabel?.[lang];
    const Icon = w.icon ? iconMap[w.icon] : null;
    const isPrimary = w.primary === true;
    const wide = w.id in WIDE_CARDS;
    const balance = wide && WIDE_CARDS[w.id].balance;
    const spanClass = wide ? "md:col-span-3" : ["payment-concentration", "global-business-development", "ai-native-market-entry", "business-spending-insight", "trade-deal-desk", "tracker", "mori-soft-furnishing-website", "game", "mg-desktop-pet"].includes(w.id)
      ? "md:col-span-2"
      : "col-span-1";
    // On wide cards these two blocks sit under the cover (left column) so the two
    // columns stay balanced; on narrow screens they stay in the body, in reading order.
    const flowBlock = <ProductFlow work={w} />;
    const deliverableBlock = w.deliverable ? (
      <div className="mt-4 border-l-2 border-amber/70 bg-amber/[0.06] px-4 py-3">
        <p className="text-xs font-medium  text-moss">{t.works.deliverableLabel}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink">{w.deliverable[lang]}</p>
      </div>
    ) : null;
    const Wrapper = w.link ? "a" : "div";
    const wrapperProps = w.link
      ? {
          href: withDemoLang(w.link, lang),
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": copy.title,
        }
      : {};
    return (
      <article
        key={w.id}
        id={w.id}
        onClick={
          w.link
            ? undefined
            : (e) => {
                if (e.target.closest("summary, a, button")) return;
                const det = e.currentTarget.querySelector(":scope > details");
                if (det) det.open = !det.open;
              }
        }
         className={`group flex scroll-mt-28 flex-col overflow-hidden rounded-card border surface-paper transition-colors duration-300 hover:border-forest/50 ${isPrimary ? "border-forest/35 bg-forest/[0.025]" : "border-line"} ${spanClass} ${w.link ? "" : "cursor-pointer"}`}
      >
        <Wrapper {...wrapperProps} className={`flex flex-1 flex-col ${wide ? "md:grid md:grid-cols-[1.05fr_0.95fr]" : ""}`}>
          {cover ? (
            <div className={`overflow-hidden bg-ink/[0.04] ${wide ? "md:flex md:flex-col md:justify-center md:bg-paper md:p-8 lg:p-10" : ""}`}>
              <CoverImage
                src={cover}
                alt={w.imageAlt[lang]}
                className={`aspect-[3/1] w-full md:aspect-[16/9] ${w.imageFit === "contain" ? "object-contain p-6" : "object-cover object-top"} ${wide ? "md:rounded-field md:shadow-[0_24px_60px_-34px_rgba(25,58,53,0.55)]" : ""}`}
              />
              {balance && (
                <div className="hidden md:block">
                  {flowBlock}
                  {deliverableBlock}
                </div>
              )}
            </div>
          ) : !w.marketEntry && (
            <div className="flex aspect-[3/1] items-center justify-center bg-paper md:aspect-[16/9]">
              {Icon && <Icon size={44} weight="light" className="text-moss" />}
            </div>
          )}
          <div className={`flex flex-1 flex-col border-t border-ink/5 p-5 md:p-8 lg:p-7 ${wide ? "md:justify-center md:border-l md:border-t-0 md:p-10 lg:p-12" : ""}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium  text-moss">
              <span>{copy.tag}</span>
              {isPrimary && <span className="rounded-pill border border-amber/35 bg-amber/[0.08] px-2 py-0.5 text-xs  text-amber">{t.works.primaryEntry}</span>}
              {w.id === "ai-native-market-entry" && <span className="rounded-pill border border-forest/25 bg-forest/[0.06] px-2 py-0.5 text-xs font-semibold normal-case tracking-normal text-forest">{t.works.supportingEvidence}</span>}
              {w.verified && w.link && <LiveChip t={t} />}
              <MaturityChip label={stageLabel(w, lang)} />
            </div>
            <h3 className={`mt-2.5 flex items-center gap-2 text-xl font-medium tracking-[-0.02em] md:text-2xl ${wide ? "lg:text-3xl" : ""}`}>
              {copy.title}
              {w.link && (
                <ArrowUpRight
                  size={18}
                  weight="bold"
                  className="text-forest transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              )}
            </h3>
            {w.decisionQuestion && (
              <div className="mt-4 border-l-2 border-amber/75 pl-3">
                <p className="text-xs font-medium  text-moss">{t.works.decisionQuestionLabel}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-forest md:text-base">{w.decisionQuestion[lang]}</p>
              </div>
            )}
            <p className="mt-2 text-sm leading-relaxed text-moss md:text-base">{copy.desc}</p>
            {w.marketEntry && <MarketEntrySignal data={w.marketEntry} />}
            {w.id === "ai-native-market-entry" && (
              <div className="mt-4">
                <button
                  id="open-trade-decision-workflow"
                  type="button"
                  className="inline-flex items-center gap-2 rounded-field border border-forest/25 bg-forest/[0.06] px-4 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-amber/60 hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                  onClick={(event) => {
                    event.stopPropagation();
                    const article = event.currentTarget.closest("article");
                    const details = article?.querySelector(":scope > details");
                    if (details) details.open = true;
                    const panel = article?.querySelector("#trade-decision-workflow");
                    requestAnimationFrame(() => panel?.focus());
                  }}
                >
                  {workflowEntry[lang].cta}
                </button>
                <p className="mt-1.5 text-xs leading-relaxed text-moss">{workflowEntry[lang].note}</p>
              </div>
            )}
            {w.spendingInsight && <SpendingInsightSignal data={w.spendingInsight} />}
            {copy.caseSummary && (
              <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink">
                <span className="font-semibold text-forest">{t.works.caseStudy.takeaway}</span>
                {copy.caseSummary}
              </p>
            )}
            {balance ? (
              <div className="md:hidden">
                {flowBlock}
                {deliverableBlock}
              </div>
            ) : (
              <>
                {flowBlock}
                {deliverableBlock}
              </>
            )}
            {w.id === "global-business-development" ? (
              <GbdActions />
            ) : <p className="mt-auto pt-4 text-xs font-medium text-moss">
              {w.link ? (
                <span className="inline-flex items-center gap-2 text-forest">
                  {w.linkType === "demo" && <span className="rounded-pill border border-forest/20 bg-forest/[0.06] px-2 py-0.5 text-xs font-medium  text-forest">{t.works.demoLabel}</span>}
                  <ArrowUpRight size={13} weight="bold" />
                  {linkLabel}
                </span>
              ) : !w.hidePendingLink ? (
                t.works.linkPending
              ) : null}
            </p>}
            {w.demoNote && (
              <p className="mt-1.5 text-xs leading-snug text-moss">{w.demoNote[lang]}</p>
            )}
          </div>
        </Wrapper>
        {w.id === "trade-profit-navigator" && (
          <div className="border-t border-line px-6 py-4">
            <button
              id="open-profit-calculator"
              type="button"
              aria-controls="profit-calculator"
              className="inline-flex max-w-full items-center gap-2 whitespace-normal rounded-field border border-forest/25 bg-forest/[0.06] px-4 py-2.5 text-left text-sm font-semibold text-forest transition-colors hover:border-amber/60 hover:text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              onClick={(event) => {
                event.stopPropagation();
                const article = event.currentTarget.closest("article");
                const details = article?.querySelector(":scope > details");
                if (details) details.open = true;
                const panel = article?.querySelector("#profit-calculator");
                requestAnimationFrame(() => panel?.focus());
              }}
            >
              {calculatorEntry[lang].cta}
            </button>
            <p className="mt-1.5 max-w-full text-xs leading-relaxed text-moss">{calculatorEntry[lang].note}</p>
          </div>
        )}
   {w.secondaryLink && secondaryLabel && (
     <a href={withDemoLang(w.secondaryLink, lang)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 border-t border-line px-6 py-3 text-xs font-semibold text-forest transition-colors hover:text-amber">
       {secondaryLabel}
       <ArrowUpRight size={13} weight="bold" />
     </a>
   )}
   {w.case && <CaseStudy workId={w.id} c={w.case} related={w.related} link={withDemoLang(w.link, lang)} linkLabel={w.linkLabel} workingEvidence={w.workingEvidence} casePage={w.casePage} />}
      </article>
    );
  };

  const renderSection = (sec, si) => (
    <div key={sec.id} id={`works-${sec.id}`} className="scroll-mt-24">
      <div className={`${si === 0 ? "" : "mt-12"} border-t border-line pt-7`}>
        <h3 className={`font-medium tracking-[-0.02em] ${si === 0 ? "text-xl text-forest md:text-2xl" : "text-lg text-ink"}`}>{sec.label}</h3>
        {sec.note && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-moss">{sec.note}</p>}
        {sec.id === "commercial" && (
          <>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-moss">
              <a href={`${firstContainerStory.href}?lang=${lang}`} className="font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:text-amber">{firstContainerStory.label[lang]}</a>
              {" "}{firstContainerStory.note[lang]}
            </p>
          </>
        )}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-y-8">
        {sec.works.map((w) => renderCard(w))}
      </div>
    </div>
  );

  return (
    <section id="works-catalog" aria-label={t.works.sub} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 md:px-6 md:py-28">
      {sections.slice(0, 1).map((sec, si) => renderSection(sec, si))}
      {sections.length > 1 && (
        <details className="group/more mt-16 border-t border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-lg font-medium tracking-[-0.02em] text-ink md:text-xl">
                {lang === "zh" ? "更多作品" : "More work"}
                <span className="ml-3 text-sm font-medium tabular-nums text-amber">{sections.slice(1).reduce((n, sec) => n + sec.works.length, 0)}</span>
              </span>
              <span className="mt-1 block text-sm text-moss">{sections.slice(1).map((sec) => sec.label).join(" · ")}</span>
            </span>
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-forest transition-transform duration-300 group-open/more:rotate-180">
              <CaretDown size={14} weight="bold" />
            </span>
          </summary>
          {sections.slice(1).map((sec, si) => renderSection(sec, si + 1))}
        </details>
      )}
    </section>
  );
}
