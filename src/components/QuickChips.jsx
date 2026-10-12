import { useLang } from "../i18n.jsx";
import { openGarageThenScroll } from "../sectionLinks.js";

// Phone-only shortcut row (below md). The ☰ menu stays; this just surfaces the main anchors.
export default function QuickChips() {
  const { lang, t } = useLang();
  const chips = [
    { href: "#works", label: t.nav.works },
    { href: "#garage", label: t.nav.garage },
    { href: "#three-questions", label: t.nav.questions },
    { href: "#capabilities", label: t.nav.services },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <nav aria-label={lang === "zh" ? "快速前往" : "Quick links"} className="-mx-4 mt-5 md:hidden">
      <ul className="flex snap-x gap-2 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => (
          <li key={c.href} className="shrink-0 snap-start">
            <a
              href={c.href}
              onClick={c.href === "#garage" ? () => openGarageThenScroll() : undefined}
              className="block whitespace-nowrap rounded-full border border-bone/30 px-3.5 py-2 text-sm font-medium text-ondark transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
