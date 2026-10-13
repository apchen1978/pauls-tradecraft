import { useLang } from "../i18n.jsx";
import { openGarageThenScroll } from "../sectionLinks.js";
import { withDemoLang } from "../demoLinks.js";

// Phone-only shortcut rows (below md). The ☰ menu stays; this just surfaces the main anchors.
// Row 1: the Showcase works, linked straight to each piece (same targets as the Showcase cards).
// Row 2: section anchors, led by Showcase like the desktop nav.
const chipClass =
  "flex min-h-[44px] items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const shortTitle = (title) => title.split(" · ")[0];

export default function QuickChips() {
  const { lang, t } = useLang();
  const works = (t.showcase?.items || []).map((item) => ({
    href: withDemoLang(item.href, lang),
    label: shortTitle(item.title),
  }));
  const chips = [
    { href: "#showcase", label: t.nav.showcase },
    { href: "#works", label: t.nav.works },
    { href: "#garage", label: t.nav.garage },
    { href: "#three-questions", label: t.nav.questions },
    { href: "#capabilities", label: t.nav.services },
    { href: "#contact", label: t.nav.contact },
  ];
  const rowClass =
    "flex snap-x gap-2 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  return (
    <nav aria-label={lang === "zh" ? "快速前往" : "Quick links"} className="-mx-4 mt-5 md:hidden" data-testid="quick-chips">
      {works.length > 0 && (
        <ul aria-label={t.nav.showcase} className={rowClass} data-testid="quick-works">
          {works.map((w) => (
            <li key={w.href} className="shrink-0 snap-start">
              <a href={w.href} className={`${chipClass} border-gold/60 bg-gold/15 text-bone hover:border-gold hover:text-gold`}>
                {w.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <ul className={`${rowClass} mt-2`}>
        {chips.map((c) => (
          <li key={c.href} className="shrink-0 snap-start">
            <a
              href={c.href}
              onClick={c.href === "#garage" ? () => openGarageThenScroll() : undefined}
              className={`${chipClass} border-bone/30 text-ondark hover:border-gold hover:text-gold`}
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
