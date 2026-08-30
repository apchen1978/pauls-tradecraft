import { useLang } from "../i18n.jsx";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-line surface-muted">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm md:flex-row md:px-6">
        <p className="font-medium text-ink/80">{t.footer.line}</p>
        <p className="text-ink/65">
          © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-6 md:px-6">
        <p className="border-t border-line pt-4 text-center text-xs text-ink/65">{t.footer.builtWith}</p>
      </div>
    </footer>
  );
}
