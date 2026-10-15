import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

// AI Lab entry, right after the Showcase. Dark, quiet, a little technical; the lab itself is a static page at /ai-lab/.
// SITE_RULES exception (Paul 2026-10-15): this block and the lab page may use AI wording.
export default function AiLabEntry() {
  const { lang, t } = useLang();
  const a = t.aiLab;
  return (
    <section id="ai-lab" aria-labelledby="ai-lab-heading" className="scroll-mt-24 border-b border-bone/10 bg-pine text-bone">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-6 md:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <p className="font-mono text-xs tracking-[0.12em] text-gold md:text-sm">{a.kicker}</p>
          <h2 id="ai-lab-heading" className="mt-5 max-w-[16ch] text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.03em] text-bone md:text-[3.2rem]">{a.title}</h2>
          <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-ondark md:text-lg">{a.lead}</p>
          <a
            href={`/ai-lab/?lang=${lang}`}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-pine transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <span>{a.cta}</span>
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
        <ol className="grid gap-3">
          {a.chapters.map((title, i) => (
            <li key={title} className="flex items-baseline gap-4 rounded-card border border-bone/15 bg-bone/[0.04] px-5 py-4">
              <span className="font-mono text-xs text-[#9EE0C1]">{String([0, 2, 3, 4][i]).padStart(2, "0")}</span>
              <span className="text-base leading-snug text-bone">{title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
