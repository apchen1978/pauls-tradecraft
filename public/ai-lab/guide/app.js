const language = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
const copy = document.querySelector(`[data-language="${language}"]`);
document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
document.querySelectorAll("[data-language]").forEach((article) => { article.hidden = article !== copy; });
document.querySelectorAll("[data-language-link]").forEach((link) => {
  link.setAttribute("aria-current", String(link.dataset.languageLink === language ? "page" : "false"));
});
document.querySelectorAll("[data-destination]").forEach((link) => {
  if (link.dataset.destination === "chapter") link.href = `/ai-lab/?lang=${language}#c13`;
  if (link.dataset.destination === "agents") link.href = `/prototype/how-many-agents/?lang=${language}`;
});
document.querySelector("#brand-link").href = `/ai-lab/?lang=${language}#c12`;
document.querySelector("#skip-link").textContent = language === "zh" ? "跳至內容" : "Skip to content";
document.title = language === "zh" ? "負責人的 AI 入門：一頁指南 · AI Lab" : "An owner's first page on AI · AI Lab";
