import { useLang } from "../i18n.jsx";

// Live Proof wall — 每一件作品如何驗證（L2）
// 資料與 works.js 的 verified 標記對齊；一行摘要為刻意精簡版。
const proofRows = [
  { key: "cdd", tests: "50/50 + 42/42 + 19/19 + 21/21 + 28/28", method: "deterministic, rerunnable" },
  { key: "lead", tests: "44 → 20 shortlist", method: "anonymized, source-tiered" },
  { key: "trade", tests: "13/13 + 5/5", method: "deterministic, rerunnable" },
  { key: "payment", tests: "51/51", method: "canonical fixture, per-currency" },
  { key: "mori", tests: "handoff checklist", method: "locally verifiable" },
  { key: "tracker", tests: "pilot workflow", method: "locally verifiable" },
];

export default function Verification() {
  const { t } = useLang();
  const v = t.verification;
  return (
    <section id="verification" className="scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber">{v.eyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">{v.headline}</h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70">{v.intro}</p>

        <div className="mt-10 overflow-hidden rounded-card border border-line bg-paper/50">
          {proofRows.map((row, i) => (
            <div
              key={row.key}
              className={`grid gap-1 px-6 py-4 md:grid-cols-[1.1fr_0.9fr_1fr] md:items-baseline md:gap-6 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <span className="text-sm font-bold text-forest">{t.verification.works[row.key]}</span>
              <span className="font-mono text-sm text-ink/80">{row.tests}</span>
              <span className="text-xs leading-relaxed text-ink/75">{t.verification.method[row.key]}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-ink/70">{v.boundary}</p>
      </div>
    </section>
  );
}
