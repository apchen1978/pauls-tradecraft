import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { openGarageThenScroll } from "../sectionLinks.js";

export default function Nav() {
  const { lang, t, toggle } = useLang();
  const [open, setOpen] = useState(false);

  // Close the mobile menu with the Escape key (P0-A accessibility).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    // Paul 2026-11-20: the two things that carry the site come first and are framed (a gold-edged pill for the Immersive Collection, a quieter bone-edged one for the Business Works), then
    // the AI Lab, the Garage, and how I work, the notes and about. "What I do" is gone from the bar: the work itself shows it (its section is still on the page).
    { href: "#showcase", label: t.nav.showcase, tier: "featured" },
    { href: "#works", label: t.nav.works, tier: "major" },
    { href: "#ai-lab", label: t.nav.aiLab, tier: "lab" }, // Paul 2026-11-20: the AI Lab is as important as the other two, so it is framed too, in its own colour (a soft sage-mint, kin to the paper green)
    { href: "#garage", label: t.nav.garage },
    { href: "#capabilities", label: t.nav.services },
    { href: "#trade-notes", label: t.nav.notes },
    { href: "#about", label: t.nav.about },
  ];

  const TIER_DESKTOP = {
    featured: "rounded-full border border-gold bg-gold/10 px-2.5 py-1.5 text-bone decoration-transparent hover:bg-gold/20 hover:text-bone focus-visible:bg-gold/20 xl:px-3.5",
    major: "rounded-full border border-bone/35 px-2.5 py-1.5 text-bone/95 decoration-transparent hover:border-bone/70 hover:text-bone focus-visible:border-bone/70 xl:px-3.5",
    lab: "rounded-full border border-[#8fbfa8]/80 bg-[#8fbfa8]/10 px-2.5 py-1.5 text-bone decoration-transparent hover:bg-[#8fbfa8]/20 hover:text-bone focus-visible:bg-[#8fbfa8]/20 xl:px-3.5",
  };
  const TIER_MENU = {
    featured: "border border-gold bg-gold/10 text-bone hover:bg-gold/20",
    major: "border border-bone/35 text-bone hover:border-bone/70",
    lab: "border border-[#8fbfa8]/80 bg-[#8fbfa8]/10 text-bone hover:bg-[#8fbfa8]/20",
  };
  const followSectionLink = (href) => {
    if (href === "#garage") openGarageThenScroll();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-bone/15 bg-pine/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 md:h-[76px] md:px-6">
        <a href="#top" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="text-lg font-semibold tracking-[-0.02em] text-bone">{t.brand}</span>
          <span className="hidden border-l border-bone/25 pl-2 text-xs font-medium text-ondark-meta sm:inline lg:hidden xl:inline">{t.brandNote}</span>
        </a>

        <div className="hidden items-center gap-2.5 text-[13px] font-medium text-ondark lg:flex xl:gap-8 xl:text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => followSectionLink(l.href)} className={`whitespace-nowrap transition-colors ${l.tier ? TIER_DESKTOP[l.tier] : "border border-transparent py-1.5 underline decoration-transparent decoration-2 underline-offset-8 hover:text-bone hover:decoration-gold focus-visible:text-bone focus-visible:decoration-gold"}`}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-field border border-bone/30 px-3 py-1.5 text-sm font-semibold text-ondark transition-colors hover:border-gold hover:text-gold"
            aria-label={lang === "zh" ? "切換語言" : "Switch language"}
          >
            {t.langLabel}
          </button>
          <a
            href="#contact"
            className="hidden rounded-field bg-gold px-4 py-2 text-sm font-semibold text-pine transition-[filter] hover:brightness-110 focus-visible:outline-offset-4 sm:inline-block"
            onClick={() => setOpen(false)}
          >
            {t.nav.contact}
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-field border border-bone/30 p-2 text-ondark transition-colors hover:border-gold hover:text-gold lg:hidden"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-bone/15 bg-pine px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => followSectionLink(l.href)}
                className={`rounded-field px-3 py-2.5 text-sm font-medium transition-colors ${l.tier ? TIER_MENU[l.tier] : "text-ondark hover:bg-bone/10 hover:text-bone"}`}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-field bg-gold px-3 py-2.5 text-center text-sm font-semibold text-pine focus-visible:outline-offset-4"
            >
              {t.nav.contact}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
