import { useState } from "react";
import { useLang } from "../i18n.jsx";
import { methods } from "../data/methods.js";

// Methodology section — 方法論文章（working-principles content）。
// 純內容呈現；每篇「原文依據 → 摘要 → 全文」，可展開。
export default function Methods() {
  const { lang, t } = useLang();
  const [openId, setOpenId] = useState(null);

  return (
    <section id="method" className="scroll-mt-24 border-b border-line surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber">{t.methods.eyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">{t.methods.headline}</h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70">{t.methods.intro}</p>

        <div className="mt-10 grid gap-4">
          {methods.map((m, i) => {
            const open = openId === m.id;
            return (
              <div key={m.id} className="overflow-hidden rounded-card border border-line bg-bone">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : m.id)}
                  className="flex w-full items-baseline justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-paper/50"
                  aria-expanded={open}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-xs font-bold tabular-nums text-amber">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block text-base font-bold tracking-tight text-ink">{m.title[lang]}</span>
                      <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-ink/75">{m.summary[lang]}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-forest">{open ? t.methods.collapse : t.methods.read}</span>
                </button>
                {open && (
                  <div className="border-t border-line px-6 py-6 md:px-8">
                    {m.body[lang].map((p, idx) => (
                      <p key={idx} className={`text-[15px] leading-relaxed text-ink/75 ${idx > 0 ? "mt-4" : ""}`}>{p}</p>
                    ))}
                    <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink/70">{t.methods.disclosure}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
