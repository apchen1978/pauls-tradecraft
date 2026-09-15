import { useLayoutEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import {
  CheckCircle,
  ArrowUpRight,
  PresentationChart,
  GameController,
  Receipt,
  Briefcase,
  CaretDown,
  Info,
} from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { works } from "../data/works.js";
import GlobalBusinessDevelopment from "./GlobalBusinessDevelopment.jsx";

const iconMap = {
  presentation: PresentationChart,
  game: GameController,
  receipt: Receipt,
  briefcase: Briefcase,
};

const SECTION_ORDER = ["commercial", "operations", "labs"];

function ProductFlow({ work, tone = "light" }) {
  const { lang } = useLang();
  const flow = work.showcase?.[lang];
  if (!flow) return null;

  const dark = tone === "dark";
  return (
    <div className={`mt-6 border-y py-4 ${dark ? "border-bone/15" : "border-forest/15"}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${dark ? "text-gold" : "text-amber"}`}>{flow.label}</p>
      <div className={`mt-3 grid gap-3 sm:grid-cols-3 ${dark ? "sm:divide-x sm:divide-bone/15" : "sm:divide-x sm:divide-forest/15"}`}>
        {flow.stages.map((stage, index) => (
          <div key={stage.label} className={index === 0 ? "sm:pr-3" : index === flow.stages.length - 1 ? "sm:pl-3" : "sm:px-3"}>
            <p className={`text-[10px] font-bold tracking-[0.14em] ${dark ? "text-bone/55" : "text-moss"}`}>{stage.label}</p>
            <p className={`mt-1 text-xs leading-relaxed ${dark ? "text-bone/82" : "text-ink/75"}`}>{stage.value}</p>
          </div>
        ))}
      </div>
    </div>
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
          <p className="text-xl font-bold leading-tight tracking-tight text-forest md:text-2xl">{copy.hero}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70 md:text-base">{copy.heroSupport}</p>
        </div>
        <div className="border-l-2 border-amber/70 pl-4 md:pl-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{copy.caseArcLabel}</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-forest">{copy.caseArc}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink/60">{copy.context}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-0 border-y border-forest/15 md:grid-cols-[1fr_1.15fr_1fr]">
        {copy.signature.map((item, index) => (
          <div key={item.label} className={`py-4 ${index === 0 ? "border-b md:border-r md:border-b-0 md:pr-5" : index === 1 ? "border-b bg-forest/[0.045] md:border-x md:border-b-0 md:px-5" : "md:pl-5"} border-forest/15`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{index === 0 ? copy.beforeLabel : index === 1 ? copy.zeroLabel : copy.afterLabel}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-forest">{item.value}</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-ink/75">{item.label}</p>
            {index === 1 && <p className="mt-2 text-xs leading-relaxed text-ink/65">{copy.zeroNote}</p>}
            {index === 2 && <p className="mt-2 text-xs leading-relaxed text-ink/65">{copy.afterNote}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{copy.gatesTitle}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {copy.gates.map((gate, index) => (
            <div key={gate.title} className="border-t border-forest/20 pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold tracking-[0.16em] text-moss">0{index + 1}</span>
                <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${gate.status === "UNKNOWN" || gate.status === "待確認" ? "text-rust" : "text-forest"}`}>{gate.status}</span>
              </div>
              <p className="mt-2 text-sm font-bold text-forest">{gate.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/65">{gate.body}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 inline-flex border-l-2 border-amber pl-3 text-xs font-semibold uppercase tracking-[0.12em] text-forest">{copy.correction}</p>
    </section>
  );
}

function MarketEntryDetails({ data, tone = "light" }) {
  const { lang } = useLang();
  const copy = data?.[lang];
  if (!copy) return null;
  const dark = tone === "dark";
  const border = dark ? "border-bone/15" : "border-line";
  const heading = dark ? "text-bone/90" : "text-ink/80";
  const body = dark ? "text-bone/70" : "text-ink/65";

  return (
    <>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.questionTitle}</dt>
        <dd className={`mt-0.5 leading-relaxed ${body}`}>{copy.question}</dd>
      </div>
      <div className={`border-l-2 border-amber/70 bg-amber/[0.06] px-4 py-3 ${dark ? "bg-gold/[0.08]" : ""}`}>
        <dt className={`text-[10px] font-bold uppercase tracking-[0.14em] ${dark ? "text-gold" : "text-amber"}`}>{copy.lessonTitle}</dt>
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
        <dt className={`text-[10px] font-bold uppercase tracking-[0.14em] ${dark ? "text-gold" : "text-amber"}`}>{copy.boundaryTitle}</dt>
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

function SpendingInsightSignal({ data }) {
  const { lang } = useLang();
  const copy = data?.[lang];
  if (!copy) return null;

  return (
    <section className="mt-5 border-y border-forest/15 py-5" aria-label={copy.signalLabel}>
      <div className="grid gap-5 md:grid-cols-[1.08fr_.92fr] md:gap-8">
        <div>
          <p className="text-xl font-bold leading-tight tracking-tight text-forest md:text-2xl">{copy.hero}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70 md:text-base">{copy.heroSupport}</p>
        </div>
        <div className="border-l-2 border-amber/70 pl-4 md:pl-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">{copy.caseLabel}</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-forest">{copy.case}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink/60">{copy.caseBoundary}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-0 border-y border-forest/15 md:grid-cols-3">
        {copy.lenses.map((lens, index) => (
          <div key={lens.title} className={`py-4 ${index === 0 ? "border-b md:border-r md:border-b-0 md:pr-5" : index === 1 ? "border-b bg-forest/[0.045] md:border-x md:border-b-0 md:px-5" : "md:pl-5"} border-forest/15`}>
            <p className="text-[10px] font-bold tracking-[0.16em] text-moss">0{index + 1}</p>
            <p className="mt-2 text-sm font-bold text-forest">{lens.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink/65">{lens.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-l-2 border-amber bg-amber/[0.06] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{copy.questionLabel}</p>
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
  const heading = dark ? "text-bone/90" : "text-ink/80";
  const body = dark ? "text-bone/70" : "text-ink/65";

  return (
    <>
      <div>
        <dt className={`font-semibold ${heading}`}>{copy.questionTitle}</dt>
        <dd className={`mt-0.5 leading-relaxed ${body}`}>{copy.question}</dd>
      </div>
      <div className={`border-l-2 border-amber/70 bg-amber/[0.06] px-4 py-3 ${dark ? "bg-gold/[0.08]" : ""}`}>
        <dt className={`text-[10px] font-bold uppercase tracking-[0.14em] ${dark ? "text-gold" : "text-amber"}`}>{copy.lessonTitle}</dt>
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
        <dt className={`text-[10px] font-bold uppercase tracking-[0.14em] ${dark ? "text-gold" : "text-amber"}`}>{copy.boundaryTitle}</dt>
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

function CaseStudy({ c, related, link, linkLabel, tone = "light" }) {
  const { lang, t } = useLang();
  const f = (field) => (field ? field[lang] : "");
  const stageTag = typeof c.stageTag === "string" ? c.stageTag : c.stageTag?.[lang];
  const labels = t.works.caseStudy;
  const isDark = tone === "dark";
  const styles = isDark
    ? {
        details: "border-bone/15",
        summary: "border-bone/25 bg-bone/[0.06] text-bone hover:bg-bone/[0.1]",
        stage: "bg-gold/15 text-gold",
        border: "border-bone/15",
        heading: "text-bone/90",
        body: "text-bone/70",
        caption: "text-bone/55",
        link: "text-gold hover:text-bone",
      }
    : {
        details: "border-line",
        summary: "border-forest/25 bg-forest/[0.06] text-forest hover:bg-forest/10",
        stage: "bg-forest/10 text-forest",
        border: "border-line",
        heading: "text-ink/80",
        body: "text-ink/65",
        caption: "text-ink/65",
        link: "text-forest hover:text-amber",
      };
  return (
    <details className={`group mt-4 border-t px-6 pt-4 pb-6 ${styles.details}`}>
      <summary className={`flex cursor-pointer list-none items-center gap-2 rounded-pill border px-4 py-2.5 text-sm font-bold transition-colors [&::-webkit-details-marker]:hidden ${styles.summary}`}>
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-bold ${styles.stage}`}>
          {f(c.stage)}
           {stageTag ? ` · ${stageTag}` : ""}
        </span>
        <span className="flex-1">{labels.label}</span>
        <CaretDown size={14} weight="bold" className="transition-transform group-open:rotate-180" />
      </summary>
       <dl className="mt-3 space-y-3 text-sm">
        {c.gallery && (
          <div>
            <figure>
              <img
                src={c.gallery.src}
                alt={f(c.gallery.alt)}
                loading="lazy"
                className={`w-full rounded-field border ${styles.border}`}
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
            <a href={link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${styles.link}`}>
              <ArrowUpRight size={14} weight="bold" />
              {typeof linkLabel === "string" ? linkLabel : linkLabel?.[lang]}
            </a>
          </div>
        )}
      </dl>
    </details>
  );
}

function FeaturedSystem({ work }) {
  const { lang, t } = useLang();
  const featuredRef = useRef(null);
  const copy = work[lang];
  const linkLabel = typeof work.linkLabel === "string" ? work.linkLabel : work.linkLabel?.[lang];
  // Astra P0-2：主入口先看完成範例；已理解用途的人可用第二入口評估自己的商機。
  const secondaryLabel = work.secondaryLinkLabel
    ? (typeof work.secondaryLinkLabel === "string" ? work.secondaryLinkLabel : work.secondaryLinkLabel?.[lang])
    : null;

  useLayoutEffect(() => {
    const root = featuredRef.current;
    if (!root) return undefined;

    // 錨點直達（#works / #commercial-decision-desk …）時立即顯示內容，
    // 避免「跳轉後先看到大片空白、之後才淡入」的體驗（Astra ⑤）。
    const hashTargets = new Set(
      [...document.querySelectorAll("main [id]")].map((el) => `#${el.id}`),
    );
    const jumpedTo = (hash) =>
      !!hash && hash !== "#top" && (hashTargets.has(hash) || hash === "#works");

    const ctx = gsap.context(() => {
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
                autoAlpha: 0,
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

    return () => ctx.revert();
  }, []);

  return (
    <article ref={featuredRef} id={work.id} className="scroll-mt-28 overflow-hidden rounded-card border border-forest/25 bg-ink text-bone shadow-[0_28px_72px_-42px_rgba(20,51,41,0.72)]">
      <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
        <div className="flex flex-col px-6 py-8 md:px-10 md:py-11 lg:px-9 lg:py-9">
          <div data-featured-copy className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            <span>{copy.tag}</span>
            {work.verified && (
              <span className="inline-flex items-center gap-1 text-bone/70" title={t.works.verifiedExplain}>
                <CheckCircle size={14} weight="fill" className="text-gold" />
                {t.works.statusVerified}
              </span>
            )}
          </div>
          <h3 data-featured-copy className="mt-5 max-w-md text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-bone md:text-4xl">{copy.title}</h3>
          <p data-featured-copy className="mt-5 max-w-[43ch] text-base leading-relaxed text-bone/72">{copy.desc}</p>
          {copy.caseSummary && (
            <p data-featured-copy className="mt-7 border-l border-gold pl-4 text-sm leading-relaxed text-bone/85">{copy.caseSummary}</p>
          )}
          <ProductFlow work={work} tone="dark" />
          <a data-featured-copy href={work.link} target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex w-fit items-center gap-2 rounded-field bg-gold px-5 py-3 text-sm font-bold text-pine transition-colors hover:bg-[#f2be61]">
            {linkLabel}
            <ArrowUpRight size={16} weight="bold" />
          </a>
          {work.secondaryLink && secondaryLabel && (
            <a data-featured-copy href={work.secondaryLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-fit items-center gap-2 rounded-field border border-bone/25 px-4 py-2 text-sm font-semibold text-bone/85 transition-colors hover:border-gold/60 hover:text-gold">
              {secondaryLabel}
            </a>
          )}
          {work.id === "commercial-decision-desk" && (
            <a data-featured-copy href="#outcomes" className="mt-4 w-fit text-sm font-semibold text-bone/75 underline decoration-bone/30 underline-offset-4 transition-colors hover:text-gold">
              {t.hero.cddInvite}
            </a>
          )}
          {work.demoNote && <p className="mt-4 text-xs leading-relaxed text-bone/50">{work.demoNote[lang]}</p>}
        </div>
        <a data-featured-visual href={work.link} target="_blank" rel="noopener noreferrer" aria-label={copy.title} className="group relative block border-t border-bone/10 bg-[#dfe4d9] p-3 lg:border-l lg:border-t-0 lg:p-3">
          <div className="overflow-hidden rounded-field border border-ink/10 bg-bone shadow-[0_18px_36px_-24px_rgba(0,0,0,0.62)]">
            <div className="flex items-center justify-between border-b border-ink/10 bg-[#edf0e7] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/65">
              <span>Featured Work</span>
              <span className="text-forest">{t.works.statusVerified}</span>
            </div>
            <img src={work.cover} alt={work.imageAlt[lang]} loading="eager" className="aspect-[16/9] h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.015]" />
          </div>
          <span className="absolute bottom-7 right-7 rounded-field bg-ink/90 px-3 py-2 text-xs font-semibold text-bone opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{linkLabel} →</span>
        </a>
      </div>
      {work.case && <CaseStudy c={work.case} related={work.related} link={work.link} linkLabel={work.linkLabel} tone="dark" />}
    </article>
  );
}

// ② 旗艦提前：CDD 旗艦展示是獨立頂層區塊（id="#works" 保留給導覽「作品」），
// 以 works 主標題開場「成果先」；其餘卡片目錄（見 Works）只保留分組標題、不重複大標題。
export function WorksFlagship() {
  const { t } = useLang();
  const featuredSystem = works.find((work) => work.id === "commercial-decision-desk");
  return (
    <section id="works" aria-labelledby="works-flagship-heading" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 md:px-6 md:py-24">
      <div className="border-b border-line pb-10">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.works.eyebrow}</p>
          <h2 id="works-flagship-heading" className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t.works.headline}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink/65">{t.works.sub}</p>
        </div>
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
      .filter((w) => w.section === id && w.id !== featuredSystem.id)
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

  const renderCard = (w, i) => {
    const copy = lang === "zh" ? w.zh : w.en;
    const linkLabel = typeof w.linkLabel === "string" ? w.linkLabel : w.linkLabel?.[lang];
    const secondaryLabel = typeof w.secondaryLinkLabel === "string" ? w.secondaryLinkLabel : w.secondaryLinkLabel?.[lang];
    const Icon = w.icon ? iconMap[w.icon] : null;
    const isPrimary = w.primary === true;
    const spanClass = ["payment-concentration", "global-business-development", "ai-native-market-entry", "business-spending-insight", "trade-deal-desk", "tracker", "mori-soft-furnishing-website", "game", "wastetime", "mg-desktop-pet"].includes(w.id)
      ? "md:col-span-2"
      : "col-span-1";
    const Wrapper = w.link ? "a" : "div";
    const wrapperProps = w.link
      ? {
          href: w.link,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": copy.title,
        }
      : {};
    return (
      <motion.article
        key={w.id}
        id={w.id}
        onClick={
          w.link
            ? undefined
            : (e) => {
                if (e.target.closest("summary")) return;
                const det = e.currentTarget.querySelector("details");
                if (det) det.open = !det.open;
              }
        }
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-24px" }}
        transition={{ duration: 0.35, ease: "easeOut", delay: (i % 3) * 0.04 }}
         className={`group flex scroll-mt-28 flex-col overflow-hidden rounded-card border surface-paper transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-forest/35 hover:shadow-[0_24px_48px_-32px_rgba(20,51,41,0.62)] ${isPrimary ? "border-forest/35 bg-forest/[0.025]" : "border-line"} ${spanClass} ${w.link ? "" : "cursor-pointer"}`}
      >
        <Wrapper {...wrapperProps} className="flex flex-1 flex-col">
          {w.cover ? (
            <div className="overflow-hidden bg-ink/[0.04]">
              <img
                src={w.cover}
                alt={w.imageAlt[lang]}
                loading="lazy"
                className={`aspect-[16/9] w-full ${w.imageFit === "contain" ? "object-contain p-6" : "object-cover object-top"} transition-transform duration-500 group-hover:scale-[1.02]`}
              />
            </div>
          ) : !w.marketEntry && (
            <div className="flex aspect-[16/9] items-center justify-center bg-paper">
              {Icon && <Icon size={44} weight="light" className="text-moss" />}
            </div>
          )}
          <div className="flex flex-1 flex-col border-t border-ink/5 p-7 md:p-8 lg:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber">
              <span>{copy.tag}</span>
              {isPrimary && <span className="rounded-pill border border-amber/35 bg-amber/[0.08] px-2 py-0.5 text-[10px] tracking-[0.12em] text-amber">{t.works.primaryEntry}</span>}
              {w.verified && (
                <span
                  className="inline-flex items-center gap-1 text-forest"
                  title={t.works.verifiedExplain}
                  aria-label={`${t.works.statusVerified}：${t.works.verifiedExplain}`}
                >
                  <CheckCircle size={13} weight="fill" />
                  {t.works.statusVerified}
                  <Info size={12} weight="bold" aria-hidden="true" />
                </span>
              )}
            </div>
            <h3 className="mt-2.5 flex items-center gap-2 text-xl font-bold tracking-tight md:text-2xl">
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
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{t.works.decisionQuestionLabel}</p>
                <p className="mt-1 text-[15px] font-semibold leading-snug text-forest md:text-base">{w.decisionQuestion[lang]}</p>
              </div>
            )}
            <p className="mt-2 text-[15px] leading-relaxed text-ink/65 md:text-base">{copy.desc}</p>
            {w.marketEntry && <MarketEntrySignal data={w.marketEntry} />}
            {w.spendingInsight && <SpendingInsightSignal data={w.spendingInsight} />}
            {copy.caseSummary && (
              <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink/75">
                <span className="font-semibold text-forest">{t.works.caseStudy.takeaway}</span>
                {copy.caseSummary}
              </p>
            )}
            <ProductFlow work={w} />
            {w.deliverable && (
              <div className="mt-4 border-l-2 border-amber/70 bg-amber/[0.06] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber">{t.works.deliverableLabel}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">{w.deliverable[lang]}</p>
              </div>
            )}
            {w.id === "global-business-development" ? (
              <button
                type="button"
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-field bg-forest px-4 py-2.5 text-sm font-bold text-bone transition-colors hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                onClick={(e) => {
                  e.stopPropagation();
                  const details = e.currentTarget.closest("article")?.querySelector("details");
                  if (details) details.open = !details.open;
                }}
              >
                {t.works.viewJudgment}
                <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
              </button>
            ) : <p className="mt-auto pt-4 text-xs font-medium text-ink/65">
              {w.link ? (
                <span className="inline-flex items-center gap-2 text-forest">
                  {w.linkType === "demo" && <span className="rounded-pill border border-forest/20 bg-forest/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-forest">{t.works.demoLabel}</span>}
                  <ArrowUpRight size={13} weight="bold" />
                  {linkLabel}
                </span>
              ) : !w.hidePendingLink ? (
                t.works.linkPending
              ) : null}
            </p>}
            {w.demoNote && (
              <p className="mt-1.5 text-[11px] leading-snug text-ink/65">{w.demoNote[lang]}</p>
            )}
          </div>
        </Wrapper>
   {w.secondaryLink && secondaryLabel && (
     <a href={w.secondaryLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 border-t border-line px-6 py-3 text-xs font-semibold text-forest transition-colors hover:text-amber">
       {secondaryLabel}
       <ArrowUpRight size={13} weight="bold" />
     </a>
   )}
   {w.case && <CaseStudy c={w.case} related={w.related} link={w.link} linkLabel={w.linkLabel} />}
      </motion.article>
    );
  };

  return (
    <section id="works-catalog" aria-label={t.works.sub} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 md:px-6 md:py-28">
      {sections.map((sec, si) => (
        <div key={sec.id} id={`works-${sec.id}`} className="scroll-mt-24">
          <div className={`${si === 0 ? "mt-0 lg:mt-0" : "mt-14 lg:mt-12"} border-t border-line pt-7`}>
            <h3 className={`font-bold tracking-tight ${si === 0 ? "text-xl text-forest md:text-2xl" : "text-lg text-ink/75"}`}>{sec.label}</h3>
            {sec.note && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">{sec.note}</p>}
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-y-8">
            {sec.works.map((w, i) => renderCard(w, i))}
          </div>
        </div>
      ))}
    </section>
  );
}
