// One line of Paul's judgment, shown after a tool has produced its numbers or status.
export default function JudgmentNote({ label, text, id }) {
  if (!text) return null;
  return (
    <div data-judgment={id} className="mt-3 border-l-2 border-amber/70 bg-amber/[0.06] px-3 py-3">
      <p className="text-xs font-semibold text-amber">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-forest">{text}</p>
    </div>
  );
}
