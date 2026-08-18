import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

export default function Nav() {
  const { t, toggle } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#works", label: t.nav.works },
    { href: "#capabilities", label: t.nav.services },
    { href: "#how", label: t.nav.process },
    { href: "#about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bone/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-[72px] md:px-6">
        <a href="#top" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="text-lg font-bold tracking-tight">{t.brand}</span>
          <span className="hidden text-sm text-ink/65 sm:inline">{t.brandNote}</span>
        </a>

        <div className="hidden items-center gap-7 text-sm font-medium text-ink/75 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-emerald">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-pill border border-line px-3 py-1.5 text-sm font-semibold text-ink/70 transition-colors hover:border-emerald hover:text-emerald"
            aria-label="Switch language"
          >
            {t.langLabel}
          </button>
          <a
            href="#contact"
            className="hidden rounded-pill bg-forest px-4 py-2 text-sm font-semibold text-bone transition-all hover:bg-moss active:scale-[0.98] sm:inline-block"
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
