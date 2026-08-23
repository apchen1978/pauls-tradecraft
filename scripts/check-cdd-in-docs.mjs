// check-cdd-in-docs.mjs — verify Commercial Decision Desk appears in regenerated docs
import { spawnSync } from "node:child_process";

function textOf(pdfPath) {
  const r = spawnSync("python", ["-c",
    "import sys;from pypdf import PdfReader;print(' '.join((p.extract_text() or '') for p in PdfReader(sys.argv[1]).pages))",
    pdfPath], { encoding: "utf8", maxBuffer: 2e7 });
  return r.stdout;
}

const base = "C:/Users/grays/Documents/DeepSeek-Test/portfolio-overview/public/files/";
const zh = textOf(base + "Paul-Tradecraft-OnePager-ZH.pdf");
const en = textOf(base + "Paul-Tradecraft-OnePager-EN.pdf");
const brief = textOf(base + "PaulTradecraft-Capability-Brief.pdf");

console.log("OnePager-ZH 含 'Commercial Decision Desk':", zh.includes("Commercial Decision Desk"));
console.log("OnePager-EN 含 'Commercial Decision Desk':", en.includes("Commercial Decision Desk"));
console.log("OnePager-EN 含 'evidence-first':", /evidence-first/i.test(en));
console.log("CapabilityBrief 含 'Commercial Decision Desk':", brief.includes("Commercial Decision Desk"));
console.log("CapabilityBrief 含 '證據優先':", brief.includes("證據優先"));
