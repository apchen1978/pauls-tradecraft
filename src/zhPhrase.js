import { useEffect } from "react";
import { useLang } from "./i18n.jsx";

// Traditional Chinese line breaking that respects words.
//
// Browsers break Chinese between any two characters, so a wrap can split a word
// ("這|裡", "決策邊|界") or strand "2" from "家". CSS `word-break: auto-phrase`
// only ships a Japanese model, so this does the segmenting itself with the
// built-in Intl.Segmenter and rewrites the rendered text nodes:
//   - a zero-width space between Chinese words (the only allowed break points,
//     once data-zh-phrase turns on `word-break: keep-all`);
//   - a non-breaking space between a figure and its unit, and inside "Paul Chen";
//   - the katakana middle dot used as a list separator becomes "·".
// Source copy, data files and the PDF generators are never touched; only the
// DOM text the visitor sees is.

const HAN = /[㐀-鿿]/;
const NBSP = " ";
const ZWSP = "​";
const FIGURE_UNIT = /(\d) (?=[家個項筆天年萬件份步人次張條])/g;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"]);

function createSegmenter() {
  try {
    return typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("zh-Hant", { granularity: "word" }) : null;
  } catch {
    return null;
  }
}

export function phrase(text, segmenter) {
  const glued = text
    .replace(/・/g, "·")
    .replace(FIGURE_UNIT, `$1${NBSP}`)
    .replace(/Paul Chen/g, `Paul${NBSP}Chen`);
  if (!segmenter) return glued;
  let out = "";
  let prev = null;
  for (const part of segmenter.segment(glued)) {
    const { segment } = part;
    if (
      prev &&
      prev.isWordLike &&
      part.isWordLike &&
      (HAN.test(prev.segment) || HAN.test(segment)) &&
      !/\d$/.test(prev.segment) &&
      !/^\d/.test(segment)
    ) {
      out += ZWSP;
    }
    out += segment;
    prev = part;
  }
  return out;
}

function useZhPhrase(lang) {
  useEffect(() => {
    if (lang !== "zh") return undefined;
    const segmenter = createSegmenter();
    const root = document.documentElement;
    if (segmenter) root.setAttribute("data-zh-phrase", "");
    // node -> the value this module last wrote, so our own edit is not redone
    const written = new WeakMap();

    const handle = (node) => {
      const value = node.nodeValue;
      if (written.get(node) === value || !HAN.test(value)) return;
      const parent = node.parentElement;
      if (!parent || SKIP_TAGS.has(parent.tagName) || parent.closest("[data-no-phrase]")) return;
      const next = phrase(value, segmenter);
      written.set(node, next);
      if (next !== value) node.nodeValue = next;
    };
    const visit = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        handle(node);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); text; text = walker.nextNode()) handle(text);
    };

    visit(document.body);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData") handle(record.target);
        else record.addedNodes.forEach(visit);
      }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => {
      observer.disconnect();
      root.removeAttribute("data-zh-phrase");
    };
  }, [lang]);
}

export default function ZhPhrase() {
  const { lang } = useLang();
  useZhPhrase(lang);
  return null;
}
