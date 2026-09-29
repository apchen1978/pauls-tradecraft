// The commercial-decision-desk and overseas-lead-discovery demos honour a
// `?lang=` parameter. On the English homepage their links carry it, so a visitor
// who chose English lands on the demo in English. The margin tool is English only
// and the homepage itself has no language parameter, so nothing else changes.
const BILINGUAL_DEMO = /^https:\/\/apchen1978\.github\.io\/(commercial-decision-desk|overseas-lead-discovery-demo)\//;

export function withDemoLang(url, lang) {
  if (lang !== "en" || typeof url !== "string" || !BILINGUAL_DEMO.test(url)) return url;
  const hashAt = url.indexOf("#");
  const base = hashAt === -1 ? url : url.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : url.slice(hashAt);
  if (/[?&]lang=/.test(base)) return url;
  return `${base}${base.includes("?") ? "&" : "?"}lang=en${hash}`;
}
