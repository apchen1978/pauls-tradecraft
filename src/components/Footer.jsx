import { useLang } from "../i18n.jsx";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-line bg-paper/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm md:flex-row md:px-6">
        <p className="font-medium text-ink/80">{t.footer.line}</p>
        <p className="text-ink/65">
          © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
