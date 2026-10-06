// Carry the visitor's language into the bilingual commercial journey.
// Unrelated experiments, downloads, and same-page anchors stay untouched.
const BILINGUAL_DEMO = /^https:\/\/apchen1978\.github\.io\/(commercial-decision-desk|overseas-lead-discovery-demo|trade-profit-navigator-demo)\//;
const BILINGUAL_JOURNEY = /^\/prototype\/(ai-native-overseas-customer-roadmap|ai-native-commercial-conversion|decision-adversary|garage-rfq-workflow-001|three-days-of-quiet|one-container-12-steps|same-factory-different-buyer|worth-reading)\/$/;

export function withDemoLang(url, lang) {
  if (typeof url !== "string" || !["zh", "en"].includes(lang)) return url;
  const target = new URL(url, "https://paulstradecraft.com");
  if (target.origin === "https://paulstradecraft.com" && BILINGUAL_JOURNEY.test(target.pathname)) {
    target.searchParams.set("lang", lang);
    return url.startsWith("/") ? `${target.pathname}${target.search}${target.hash}` : target.href;
  }
  if (lang !== "en" || !BILINGUAL_DEMO.test(url)) return url;
  const hashAt = url.indexOf("#");
  const base = hashAt === -1 ? url : url.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : url.slice(hashAt);
  if (/[?&]lang=/.test(base)) return url;
  return `${base}${base.includes("?") ? "&" : "?"}lang=en${hash}`;
}
