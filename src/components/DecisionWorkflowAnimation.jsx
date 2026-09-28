import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n.jsx";
import "./decision-workflow-animation.css";

const copy = {
  zh: {
    title: "市場訊號，如何變成下一步？",
    intro: "把零散資訊聚在一起，查證哪些站得住腳；值得推進的，再交由人做商業決定。",
    note: "概念示意，非即時資料或自動決策。",
    stages: [
      { name: "市場訊號", detail: "公開線索與買家動向", hint: "先聽見市場在說什麼" },
      { name: "證據", detail: "來源、限制與未知", hint: "這條線索站得住嗎？" },
      { name: "資格判斷", detail: "哪些值得繼續", hint: "值得繼續追嗎？" },
      { name: "決策", detail: "人決定承諾邊界", hint: "承諾邊界由人決定" },
      { name: "市場行動", detail: "採取可驗證的下一步", hint: "帶著判斷，走下一步" },
    ],
    sources: ["買家動向", "公開線索", "產業新聞"],
    evidence: "證據",
    human: "由人判斷",
    close: "AI 可以加快整理；商業承諾仍由人作出。",
    replay: "↻ 重播",
  },
  en: {
    title: "How do market signals become a next move?",
    intro: "Bring scattered information together, verify what holds up, then leave the commercial decision with people.",
    note: "Concept illustration, not live data or an automated decision.",
    stages: [
      { name: "Market Signals", detail: "Public clues and buyer movement", hint: "Hear the market first" },
      { name: "Evidence", detail: "Sources, limits, and unknowns", hint: "Does this clue hold up?" },
      { name: "Qualification", detail: "What merits attention", hint: "Worth pursuing?" },
      { name: "Decision", detail: "People set commitment boundaries", hint: "People set the commitment line" },
      { name: "Market Action", detail: "A verifiable next move", hint: "Act with judgment" },
    ],
    sources: ["Buyer move", "Public clue", "Trade news"],
    evidence: "Evidence",
    human: "Human call",
    close: "AI can accelerate preparation. People still own commercial commitments.",
    replay: "↻ Replay",
  },
};

const signalPaths = [
  "M 46 30 C 110 30, 127 72, 220 72",
  "M 46 72 L 220 72",
  "M 46 114 C 110 114, 127 72, 220 72",
];

export default function DecisionWorkflowAnimation() {
  const { lang } = useLang();
  const content = copy[lang];
  const figureRef = useRef(null);
  const svgRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(false);
  const [complete, setComplete] = useState(false);
  const [activeStage, setActiveStage] = useState(null);

  useEffect(() => {
    const figure = figureRef.current;
    const svg = svgRef.current;
    if (!figure || !svg) return undefined;

    svg.pauseAnimations();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer;
    const applyMotionPreference = () => {
      if (reduceMotion.matches) {
        svg.pauseAnimations();
        setStarted(true);
        setInView(true);
        setComplete(true);
      } else {
        setStarted(false);
        setComplete(false);
        svg.setCurrentTime(0);
        observer?.unobserve(figure);
        observer?.observe(figure);
      }
    };
    reduceMotion.addEventListener("change", applyMotionPreference);
    if (reduceMotion.matches) {
      setStarted(true);
      setInView(true);
      setComplete(true);
    }

    if (!window.IntersectionObserver) {
      setStarted(true);
      setInView(true);
      if (reduceMotion.matches) setComplete(true);
      else {
        svg.setCurrentTime(0);
        svg.unpauseAnimations();
      }
      return () => reduceMotion.removeEventListener("change", applyMotionPreference);
    }

    observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) {
        setStarted(true);
        if (reduceMotion.matches) {
          setComplete(true);
          svg.pauseAnimations();
        } else {
          svg.unpauseAnimations();
        }
      } else {
        svg.pauseAnimations();
      }
    }, { threshold: 0.35 });
    observer.observe(figure);
    return () => {
      observer.disconnect();
      reduceMotion.removeEventListener("change", applyMotionPreference);
      svg.pauseAnimations();
    };
  }, []);

  const handleReplay = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setComplete(true);
      return;
    }
    setComplete(false);
    setStarted(false);
    if (svgRef.current) {
      svgRef.current.pauseAnimations();
      svgRef.current.setCurrentTime(0);
    }
    requestAnimationFrame(() => {
      setStarted(true);
      if (inView) svgRef.current?.unpauseAnimations();
    });
  };

  const handleAnimationEnd = (event) => {
    if (event.animationName === "decision-flow-arrow-return") setComplete(true);
    if (event.animationName === "decision-flow-mobile-stage" && event.target.dataset.stage === "4") {
      setComplete(true);
    }
  };

  return (
    <figure
      ref={figureRef}
      className="decision-flow"
      data-started={started}
      data-playing={inView}
      data-complete={complete}
      data-active-stage={activeStage ?? "none"}
      aria-labelledby="decision-flow-title"
      onAnimationEnd={handleAnimationEnd}
    >
      <figcaption className="decision-flow__heading">
        <div>
          <h3 id="decision-flow-title" className="decision-flow__title">{content.title}</h3>
          <p className="decision-flow__intro">{content.intro}</p>
        </div>
        <div className="decision-flow__note-row">
          <p className="decision-flow__note">{content.note}</p>
          <button type="button" className="decision-flow__replay" onClick={handleReplay}>
            {content.replay}
          </button>
        </div>
      </figcaption>

      <div className="decision-flow__diagram" aria-hidden="true">
        <svg ref={svgRef} viewBox="0 0 1000 145" preserveAspectRatio="xMidYMid meet" focusable="false">
          {[
            ...signalPaths.map((d, index) => ({ d, className: `decision-flow__line decision-flow__line--signal decision-flow__line--signal-${index + 1}` })),
            { d: "M 220 72 L 405 72", className: "decision-flow__line decision-flow__line--evidence-qualification" },
            { d: "M 405 72 L 590 72", className: "decision-flow__line decision-flow__line--qualification-decision" },
            { d: "M 590 72 L 775 72", className: "decision-flow__line decision-flow__line--decision-action" },
            { d: "M 775 72 L 954 72", className: "decision-flow__line decision-flow__line--action-arrow" },
          ].map(({ d, className }) => (
            <g key={d}>
              <path d={d} className="decision-flow__underlay" pathLength="1" />
              <path d={d} className={className} pathLength="1" />
            </g>
          ))}

          <g className="decision-flow__sources">
            <circle cx="46" cy="30" r="5" />
            <circle cx="46" cy="72" r="5" />
            <circle cx="46" cy="114" r="5" />
          </g>

          {content.sources.map((source, index) => {
            const start = ["46 30", "46 72", "46 114"][index];
            const motionPath = ["M 0 0 C 64 0, 81 42, 174 42", "M 0 0 L 174 0", "M 0 0 C 64 0, 81 -42, 174 -42"][index];
            return (
              <g className={`decision-flow__source-card decision-flow__source-card--${index + 1}`} transform={`translate(${start})`} key={source}>
                <rect x="-40" y="-11" width="80" height="22" rx="6" />
                <text x="0" y="3" textAnchor="middle">{source}</text>
                <animateMotion path={motionPath} dur="0.68s" begin={`${0.1 + index * 0.1}s`} fill="freeze" />
              </g>
            );
          })}

          <g className="decision-flow__evidence-card" transform="translate(220 72)">
            <rect x="-36" y="-35" width="72" height="21" rx="6" />
            <text x="0" y="-21" textAnchor="middle">{content.evidence}</text>
          </g>

          <g className="decision-flow__qualification-checks" transform="translate(405 72)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M -23 -29 l 3 3 6 -7" />
            <path d="M -2 -29 l 3 3 6 -7" />
            <path d="M 19 -29 l 3 3 6 -7" />
            <path className="decision-flow__check-strike" d="M 16 -31 L 31 -31" />
          </g>

          <circle className="decision-flow__node decision-flow__node--evidence" cx="220" cy="72" r="8" />
          <circle className="decision-flow__node decision-flow__node--qualification" cx="405" cy="72" r="8" />
          <circle className="decision-flow__decision-ring" cx="590" cy="72" r="8" />
          <circle className="decision-flow__node decision-flow__node--decision" cx="590" cy="72" r="8" />
          <circle className="decision-flow__node decision-flow__node--action" cx="775" cy="72" r="8" />

          <text className="decision-flow__human-label" x="590" y="26" textAnchor="middle">{content.human}</text>
          <path className="decision-flow__arrow" d="M 944 64 L 954 72 L 944 80" pathLength="1" />
        </svg>
      </div>

      <ol className="decision-flow__stages">
        {content.stages.map((stage, index) => (
          <li
            className="decision-flow__stage"
            data-stage={index}
            key={stage.name}
            tabIndex={0}
            aria-describedby={`decision-flow-hint-${index}`}
            onMouseEnter={() => setActiveStage(index)}
            onMouseLeave={() => setActiveStage(null)}
            onFocus={() => setActiveStage(index)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setActiveStage(null);
            }}
            onAnimationEnd={handleAnimationEnd}
          >
            <span className="decision-flow__stage-name">{stage.name}</span>
            <span className="decision-flow__stage-detail">{stage.detail}</span>
            <span className="decision-flow__stage-hint" id={`decision-flow-hint-${index}`} role="tooltip">{stage.hint}</span>
          </li>
        ))}
      </ol>
      <p className="decision-flow__close">{content.close}</p>
    </figure>
  );
}
