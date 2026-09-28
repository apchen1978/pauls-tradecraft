import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n.jsx";
import "./decision-workflow-animation.css";

const copy = {
  zh: {
    title: "市場訊號，如何變成下一步？",
    intro: "把零散資訊聚在一起，查證哪些站得住腳；值得推進的，再交由人做商業決定。",
    note: "概念示意，非即時資料或自動決策。",
    stages: [
      { name: "市場訊號", detail: "公開線索與買家動向" },
      { name: "證據", detail: "來源、限制與未知" },
      { name: "資格判斷", detail: "哪些值得繼續" },
      { name: "決策", detail: "人決定承諾邊界" },
      { name: "市場行動", detail: "採取可驗證的下一步" },
    ],
    close: "AI 可以加快整理；商業承諾仍由人作出。",
  },
  en: {
    title: "How do market signals become a next move?",
    intro: "Bring scattered information together, verify what holds up, then leave the commercial decision with people.",
    note: "Concept illustration, not live data or an automated decision.",
    stages: [
      { name: "Market Signals", detail: "Public clues and buyer movement" },
      { name: "Evidence", detail: "Sources, limits, and unknowns" },
      { name: "Qualification", detail: "What merits attention" },
      { name: "Decision", detail: "People set commitment boundaries" },
      { name: "Market Action", detail: "A verifiable next move" },
    ],
    close: "AI can accelerate preparation. People still own commercial commitments.",
  },
};

const paths = [
  { d: "M 46 30 C 110 30, 127 72, 220 72", className: "decision-flow__line decision-flow__line--signal decision-flow__line--signal-one" },
  { d: "M 46 72 L 220 72", className: "decision-flow__line decision-flow__line--signal decision-flow__line--signal-two" },
  { d: "M 46 114 C 110 114, 127 72, 220 72", className: "decision-flow__line decision-flow__line--signal decision-flow__line--signal-three" },
  { d: "M 220 72 L 405 72", className: "decision-flow__line decision-flow__line--step-one" },
  { d: "M 405 72 L 590 72", className: "decision-flow__line decision-flow__line--step-two" },
  { d: "M 590 72 L 775 72", className: "decision-flow__line decision-flow__line--step-three" },
  { d: "M 775 72 L 954 72", className: "decision-flow__line decision-flow__line--step-four" },
];

export default function DecisionWorkflowAnimation() {
  const { lang } = useLang();
  const content = copy[lang];
  const figureRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = figureRef.current;
    if (!element || !window.IntersectionObserver) {
      setStarted(true);
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={figureRef}
      className="decision-flow"
      data-started={started}
      data-playing={inView}
      aria-labelledby="decision-flow-title"
    >
      <figcaption className="decision-flow__heading">
        <div>
          <h3 id="decision-flow-title" className="decision-flow__title">{content.title}</h3>
          <p className="decision-flow__intro">{content.intro}</p>
        </div>
        <p className="decision-flow__note">{content.note}</p>
      </figcaption>

      <div className="decision-flow__diagram" aria-hidden="true">
        <svg viewBox="0 0 1000 145" preserveAspectRatio="xMidYMid meet" focusable="false">
          {paths.map(({ d, className }) => (
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
          <circle className="decision-flow__node decision-flow__node--evidence" cx="220" cy="72" r="8" />
          <circle className="decision-flow__node decision-flow__node--qualification" cx="405" cy="72" r="8" />
          <circle className="decision-flow__node decision-flow__node--decision" cx="590" cy="72" r="8" />
          <circle className="decision-flow__node decision-flow__node--action" cx="775" cy="72" r="8" />
          <path className="decision-flow__arrow" d="M 944 64 L 954 72 L 944 80" />
        </svg>
      </div>

      <ol className="decision-flow__stages">
        {content.stages.map((stage) => (
          <li className="decision-flow__stage" key={stage.name}>
            <span className="decision-flow__stage-name">{stage.name}</span>
            <span className="decision-flow__stage-detail">{stage.detail}</span>
          </li>
        ))}
      </ol>
      <p className="decision-flow__close">{content.close}</p>
    </figure>
  );
}
