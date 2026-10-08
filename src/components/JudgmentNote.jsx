import NoBreakNumbers from "./NoBreakNumbers.jsx";

// One line of Paul's judgment, shown after a tool has produced its numbers or status.
export default function JudgmentNote({ label, badge, text, id }) {
  if (!text) return null;
  return (
    <div data-judgment={id} className="mt-3 border-l-2 border-amber/70 bg-amber/[0.06] px-3 py-3">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-amber">
        {label}
        {badge ? <span className="rounded-pill border border-amber/40 px-2 py-0.5 text-xs font-medium text-moss">{badge}</span> : null}
      </p>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-forest"><NoBreakNumbers text={text} /></p>
    </div>
  );
}
