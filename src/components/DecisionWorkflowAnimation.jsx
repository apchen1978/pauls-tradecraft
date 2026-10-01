import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
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
    piles: ["未證實", "暫不追", "暫緩"],
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
    piles: ["Unverified", "Not now", "On hold"],
    human: "Human call",
    close: "AI can accelerate preparation. People still own commercial commitments.",
    replay: "↻ Replay",
  },
};

// 圖面座標（viewBox 1000 × 190）：主軸 y=80，四個關卡的 x 位置
const AXIS = 80;
const X = { evidence: 250, qualification: 440, gate: 630, action: 820, end: 960 };
const SOURCE_BANDS = [28, 80, 132];

// 12 個訊號：起點散在三個來源帶；fate = 在哪一關停下
// 0 證據站不住 · 1 資格不值得追 · 2 人判斷暫緩 · 3 放行成為行動
const SIGNALS = [
  [96, 22, 0], [118, 34, 1], [140, 24, 0], [160, 32, 3],
  [100, 76, 0], [122, 86, 2], [144, 74, 1], [164, 84, 0],
  [94, 128, 0], [116, 138, 1], [138, 126, 2], [158, 136, 0],
].map(([x, y, fate], index) => ({ x, y, fate, index }));

// 被留下的訊號落在兩關之間、主軸下方的小堆
const PILE_ORIGIN = [300, 494, 684];
const PILE_LABEL_X = [312, 506, 690];
const pileSlot = (fate, order) => ({
  x: PILE_ORIGIN[fate] + (order % 3) * 12,
  y: 138 + Math.floor(order / 3) * 12,
});

// 手機版每一關旁的小點：走到這一關還剩幾個訊號
const TALLY = [12, 6, 3, 1, 1];

export default function DecisionWorkflowAnimation({ className = "" }) {
  const { lang } = useLang();
  const content = copy[lang];
  const figureRef = useRef(null);
  const timelineRef = useRef(null);
  const inViewRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(false);
  const [complete, setComplete] = useState(false);
  const [activeStage, setActiveStage] = useState(null);

  // 桌機：GSAP 時間軸演出「12 個訊號逐關篩選，最後由人放行 1 個」
  useLayoutEffect(() => {
    const figure = figureRef.current;
    if (!figure) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 1051px)", reduceMotion: "(prefers-reduced-motion: reduce)" },
        ({ conditions }) => {
          if (!conditions.desktop) return undefined;

          const styles = getComputedStyle(figure);
          const research = styles.getPropertyValue("--flow-research").trim() || "#536d87";
          const amber = styles.getPropertyValue("--flow-amber").trim() || "#8A6A2B";
          const dropped = styles.getPropertyValue("--flow-dropped").trim() || "#9ea99b";
          const paper = styles.getPropertyValue("--color-paper").trim() || "#e9ede4";
          const forest = styles.getPropertyValue("--color-forest").trim() || "#193A35";

          const dots = gsap.utils.toArray(".decision-flow__signal");
          const byFate = (...fates) => dots.filter((dot) => fates.includes(Number(dot.dataset.fate)));
          const stageNames = gsap.utils.toArray(".decision-flow__stage-name");
          const pileOrder = [0, 0, 0];

          const tl = gsap.timeline({ paused: true, onComplete: () => setComplete(true) });

          // 起始狀態
          tl.set(dots, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%", fill: research })
            .set(".decision-flow__source-tag, .decision-flow__fan, .decision-flow__pile-label, .decision-flow__human-label, .decision-flow__close", { autoAlpha: 0 })
            .set(".decision-flow__line, .decision-flow__arrow", { strokeDashoffset: 1 })
            .set(".decision-flow__gate", { scaleY: 0, transformOrigin: "50% 50%" })
            .set(".decision-flow__node", { fill: paper })
            .set(".decision-flow__gate-ring", { autoAlpha: 0, scale: 1, transformOrigin: "50% 50%" })
            .set(stageNames, { opacity: 0.4, color: forest });
          dots.forEach((dot) => {
            const signal = SIGNALS[Number(dot.dataset.index)];
            tl.set(dot, { x: signal.x, y: signal.y });
          });

          const dropTo = (fate, at) => {
            byFate(fate).forEach((dot, i) => {
              const slot = pileSlot(fate, pileOrder[fate]++);
              tl.to(dot, { x: slot.x, y: slot.y, fill: dropped, scale: 0.85, duration: 0.5, ease: "power2.out" }, `${at}+=${i * 0.05}`);
            });
            tl.to(`.decision-flow__pile-label[data-pile="${fate}"]`, { autoAlpha: 1, duration: 0.3 }, `${at}+=0.3`);
          };

          // 1. 訊號從三個來源出現
          tl.addLabel("signals", 0.05)
            .to(".decision-flow__source-tag", { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, "signals")
            .to(dots, { autoAlpha: 1, scale: 1, duration: 0.32, ease: "back.out(2)", stagger: { each: 0.035, from: "random" } }, "signals")
            .to(".decision-flow__fan", { autoAlpha: 1, duration: 0.4 }, "signals+=0.2")
            .to(stageNames[0], { opacity: 1, duration: 0.25 }, "signals");

          // 2. 匯入證據關
          tl.addLabel("gather", "signals+=0.75")
            .to(dots, { x: X.evidence, y: AXIS, duration: 0.62, ease: "power2.in", stagger: 0.045 }, "gather")
            .to(".decision-flow__node--evidence", { fill: research, duration: 0.2 }, "gather+=0.55")
            .to(stageNames[1], { opacity: 1, duration: 0.25 }, "gather+=0.55");

          // 3. 查證：站不住的落下，其餘往資格關
          tl.addLabel("verify", "gather+=1.3");
          dropTo(0, "verify");
          tl.to(".decision-flow__line--evidence-qualification", { strokeDashoffset: 0, duration: 0.55, ease: "none" }, "verify+=0.1")
            .to(byFate(1, 2, 3), { x: X.qualification, y: AXIS, duration: 0.55, ease: "power1.inOut", stagger: 0.07 }, "verify+=0.1")
            .to(".decision-flow__node--qualification", { fill: research, duration: 0.2 }, "verify+=0.6")
            .to(stageNames[2], { opacity: 1, duration: 0.25 }, "verify+=0.6");

          // 4. 資格判斷：不值得追的落下，剩下的在閘門前排隊
          tl.addLabel("qualify", "verify+=1.15");
          dropTo(1, "qualify");
          tl.to(".decision-flow__line--qualification-decision", { strokeDashoffset: 0, duration: 0.5, ease: "none" }, "qualify+=0.1")
            .to(".decision-flow__gate", { scaleY: 1, duration: 0.35, ease: "back.out(2.2)" }, "qualify+=0.2")
            .to(".decision-flow__human-label", { autoAlpha: 1, duration: 0.3 }, "qualify+=0.35")
            .to(stageNames[3], { opacity: 1, color: amber, duration: 0.3 }, "qualify+=0.4");
          [...byFate(3), ...byFate(2)].forEach((dot, i) => {
            tl.to(dot, { x: X.gate - 16 - i * 13, y: AXIS, duration: 0.55, ease: "power2.out" }, `qualify+=${0.1 + i * 0.08}`);
          });

          // 5. 停頓，由人判斷：放行一個，其餘暫緩
          tl.addLabel("decide", "qualify+=1.45")
            .set(".decision-flow__gate-ring", { autoAlpha: 0.6 }, "decide")
            .to(".decision-flow__gate-ring", { scale: 3, autoAlpha: 0, duration: 0.7, ease: "power2.out" }, "decide")
            .to(byFate(3), { fill: amber, scale: 1.45, duration: 0.25 }, "decide")
            .to(byFate(3), { x: X.action, duration: 0.75, ease: "power2.inOut" }, "decide+=0.2")
            .to(".decision-flow__line--decision-action", { strokeDashoffset: 0, duration: 0.75, ease: "power2.inOut" }, "decide+=0.2");
          dropTo(2, "decide+=0.15");

          // 6. 市場行動
          tl.addLabel("act", "decide+=0.95")
            .to(".decision-flow__node--action", { fill: amber, duration: 0.2 }, "act")
            .to(byFate(3), { autoAlpha: 0, duration: 0.2 }, "act")
            .to(stageNames[4], { opacity: 1, duration: 0.25 }, "act")
            .to(stageNames[3], { color: forest, duration: 0.6 }, "act")
            .to(".decision-flow__line--action-arrow", { strokeDashoffset: 0, duration: 0.35, ease: "power1.out" }, "act")
            .to(".decision-flow__arrow", { strokeDashoffset: 0, duration: 0.2 }, "act+=0.3")
            .to(".decision-flow__close", { autoAlpha: 1, duration: 0.35 }, "act+=0.2");

          timelineRef.current = tl;
          if (conditions.reduceMotion) tl.progress(1);
          else if (inViewRef.current) tl.play();

          return () => {
            tl.kill();
            timelineRef.current = null;
          };
        },
      );
    }, figure);

    return () => ctx.revert();
  }, [lang]);

  // 進入畫面才播放；離開畫面暫停
  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const show = (visible) => {
      inViewRef.current = visible;
      setInView(visible);
      if (visible) {
        setStarted(true);
        if (reduceMotion.matches) setComplete(true);
        else timelineRef.current?.play();
      } else {
        timelineRef.current?.pause();
      }
    };

    if (reduceMotion.matches) setComplete(true);
    if (!window.IntersectionObserver) {
      show(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => show(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  const handleReplay = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setComplete(true);
      return;
    }
    setComplete(false);
    setStarted(false);
    const tl = timelineRef.current;
    if (tl) {
      tl.pause(0);
      if (inViewRef.current) tl.play();
    }
    requestAnimationFrame(() => setStarted(true));
  };

  // 手機版以 CSS 演出；最後一關亮起即完成
  const handleAnimationEnd = (event) => {
    if (event.animationName === "decision-flow-mobile-stage" && event.target.dataset.stage === "4") {
      setComplete(true);
    }
  };

  const fanLines = SIGNALS.map(({ x, y }) => `M ${x} ${y} L ${X.evidence} ${AXIS}`).join(" ");

  return (
    <figure
      ref={figureRef}
      className={`decision-flow${className ? ` ${className}` : ""}`}
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
        <svg viewBox="0 0 1000 190" preserveAspectRatio="xMidYMid meet" focusable="false">
          <path className="decision-flow__fan" d={fanLines} />

          {content.sources.map((source, index) => (
            <text className="decision-flow__source-tag" x="0" y={SOURCE_BANDS[index] + 4} key={source}>{source}</text>
          ))}

          {[
            { from: X.evidence, to: X.qualification, name: "evidence-qualification" },
            { from: X.qualification, to: X.gate, name: "qualification-decision" },
            { from: X.gate, to: X.action, name: "decision-action" },
            { from: X.action, to: X.end, name: "action-arrow" },
          ].map(({ from, to, name }) => {
            const d = `M ${from} ${AXIS} L ${to} ${AXIS}`;
            return (
              <g key={name}>
                <path d={d} className="decision-flow__underlay" pathLength="1" />
                <path d={d} className={`decision-flow__line decision-flow__line--${name}`} pathLength="1" />
              </g>
            );
          })}
          <path className="decision-flow__arrow" d={`M ${X.end - 10} ${AXIS - 8} L ${X.end} ${AXIS} L ${X.end - 10} ${AXIS + 8}`} pathLength="1" />

          <circle className="decision-flow__node decision-flow__node--evidence" cx={X.evidence} cy={AXIS} r="8" />
          <circle className="decision-flow__node decision-flow__node--qualification" cx={X.qualification} cy={AXIS} r="8" />
          <circle className="decision-flow__node decision-flow__node--action" cx={X.action} cy={AXIS} r="8" />

          <circle className="decision-flow__gate-ring" cx={X.gate} cy={AXIS} r="12" />
          <line className="decision-flow__gate" x1={X.gate} y1={AXIS - 24} x2={X.gate} y2={AXIS + 24} />
          <text className="decision-flow__human-label" x={X.gate} y={AXIS - 36} textAnchor="middle">{content.human}</text>

          {content.piles.map((pile, index) => (
            <text className="decision-flow__pile-label" data-pile={index} x={PILE_LABEL_X[index]} y="178" textAnchor="middle" key={pile}>{pile}</text>
          ))}

          {SIGNALS.map(({ fate, index }) => (
            <circle className="decision-flow__signal" data-fate={fate} data-index={index} cx="0" cy="0" r="4.5" key={index} />
          ))}
        </svg>
      </div>

      <ol className="decision-flow__stages">
        {content.stages.map((stage, index) => (
          <li
            className="decision-flow__stage"
            data-stage={index}
            key={stage.name}
            onMouseEnter={() => setActiveStage(index)}
            onMouseLeave={() => setActiveStage(null)}
            onAnimationEnd={handleAnimationEnd}
          >
            <span className="decision-flow__stage-name">{stage.name}</span>
            <span className="decision-flow__stage-detail">{stage.detail}</span>
            <span className="decision-flow__tally" aria-hidden="true">
              {Array.from({ length: TALLY[0] }, (_, dot) => (
                <i key={dot} data-kept={dot < TALLY[index]} />
              ))}
            </span>
            <span className="decision-flow__stage-hint">{stage.hint}</span>
          </li>
        ))}
      </ol>
      <p className="decision-flow__close">{content.close}</p>
    </figure>
  );
}
