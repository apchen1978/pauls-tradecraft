import { useLang } from "../i18n.jsx";

export default function Nav() {
  const { t, toggle } = useLang();
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bone/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-[72px] md:px-6">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight">{t.brand}</span>
          <span className="hidden text-sm text-ink/65 sm:inline">{t.brandNote}</span>
        </a>

        <div className="hidden items-center gap-7 text-sm font-medium text-ink/75 lg:flex">
          <a href="#works" className="transition-colors hover:text-forest">{t.nav.works}</a>
          <a href="#capabilities" className="transition-colors hover:text-forest">{t.nav.services}</a>
          <a href="#about" className="transition-colors hover:text-forest">{t.nav.about}</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-pill border border-line px-3 py-1.5 text-sm font-semibold text-ink/70 transition-colors hover:border-forest hover:text-forest"
            aria-label="Switch language"
          >
            {t.langLabel}
          </button>
          <a
            href="#contact"
            className="rounded-pill bg-forest px-4 py-2 text-sm font-semibold text-bone transition-all hover:bg-moss active:scale-[0.98]"
          >
            {t.nav.contact}
          </a>
        </div>
      </nav>
    </header>
  );
}
