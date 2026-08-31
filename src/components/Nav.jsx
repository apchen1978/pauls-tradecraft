import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function Nav() {
  const { lang, t, toggle } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#works", label: t.nav.works },
    { href: "#deal-readiness", label: t.nav.services },
    { href: "#verification", label: t.nav.verification },
    { href: "#method", label: t.nav.method },
    { href: "#how", label: t.nav.process },
    { href: "#about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-bone/90 shadow-[0_10px_30px_-28px_rgba(20,51,41,0.8)] backdrop-blur-md">
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 md:h-[76px] md:px-6">
        <a href="#top" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="text-lg font-bold tracking-[-0.045em] text-forest">{t.brand}</span>
          <span className="hidden border-l border-line pl-2 text-xs font-medium uppercase tracking-[0.12em] text-ink/65 sm:inline">{t.brandNote}</span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-ink/65 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-forest">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-field border border-line px-3 py-1.5 text-sm font-semibold text-ink/70 transition-colors hover:border-forest hover:text-forest"
            aria-label={lang === "zh" ? "切換語言" : "Switch language"}
          >
            {t.langLabel}
          </button>
          <a
            href="#contact"
            className="hidden rounded-field bg-forest px-4 py-2 text-sm font-semibold text-bone transition-colors hover:bg-moss sm:inline-block"
            onClick={() => setOpen(false)}
          >
            {t.nav.contact}
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-field border border-line p-2 text-ink/75 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-bone px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-field px-3 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:bg-paper"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-pill bg-forest px-3 py-2.5 text-center text-sm font-semibold text-bone"
            >
              {t.nav.contact}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
