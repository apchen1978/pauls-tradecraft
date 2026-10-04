import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

// Phone-only folding for section intros: the heading and the first sentence stay,
// the rest opens on tap. From md up everything is always shown, so wrap folded
// parts with foldClass(open) and nothing else changes on desktop.
const LABELS = {
  zh: { more: "展開說明", less: "收合說明" },
  en: { more: "Read more", less: "Show less" },
};

// Literal class strings so Tailwind can see them.
export const foldClass = (open, shown = "block") => {
  if (shown === "inline") return open ? "inline" : "hidden md:inline";
  return open ? "block" : "hidden md:block";
};

export function firstSentence(text) {
  const match = text.match(/^.*?(?:。|[.!?](?=\s))/);
  if (!match || match[0].length >= text.length) return [text, ""];
  return [match[0], text.slice(match[0].length).trimStart()];
}

export function useFold() {
  const [open, setOpen] = useState(false);
  return { open, toggle: () => setOpen((v) => !v) };
}

export function FoldToggle({ open, onToggle, controls, className = "mt-4" }) {
  const { lang } = useLang();
  const label = LABELS[lang] ?? LABELS.en;
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={`${className} inline-flex items-center gap-2 text-sm font-semibold text-forest md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber`}
    >
      <span>{open ? label.less : label.more}</span>
      <CaretDown size={16} weight="bold" aria-hidden="true" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}
