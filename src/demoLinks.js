// The commercial-decision-desk, overseas-lead-discovery and trade-profit-navigator
// demos honour a `?lang=` parameter and open in Chinese by default. On the English
// homepage their links carry it, so a visitor who chose English lands on the demo in
// English. Other links are left alone.
const BILINGUAL_DEMO = /^https:\/\/apchen1978\.github\.io\/(commercial-decision-desk|overseas-lead-discovery-demo|trade-profit-navigator-demo)\//;

export function withDemoLang(url, lang) {
  if (lang !== "en" || typeof url !== "string" || !BILINGUAL_DEMO.test(url)) return url;
  const hashAt = url.indexOf("#");
  const base = hashAt === -1 ? url : url.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : url.slice(hashAt);
  if (/[?&]lang=/.test(base)) return url;
  return `${base}${base.includes("?") ? "&" : "?"}lang=en${hash}`;
}
